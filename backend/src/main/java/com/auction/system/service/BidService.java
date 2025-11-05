package com.auction.system.service;

import com.auction.system.dto.BidRequest;
import com.auction.system.dto.BidResponse;
import com.auction.system.entity.Auction;
import com.auction.system.entity.Bid;
import com.auction.system.entity.Notification;
import com.auction.system.entity.User;
import com.auction.system.network.multicast.MulticastBroadcaster;
import com.auction.system.repository.AuctionRepository;
import com.auction.system.repository.BidRepository;
import com.auction.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Bid Service
 * Handles bid validation, placement, and retrieval
 *
 * IMPORTANT: This service uses pessimistic locking to prevent race conditions
 * when multiple users bid on the same auction simultaneously (Member 2: Multithreading)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BidService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final MulticastBroadcaster multicastBroadcaster;
    private final WalletService walletService;
    private final NotificationService notificationService;
    private final com.auction.system.websocket.WebSocketEventService webSocketEventService;

    /**
     * Place a bid on an auction
     * This method is thread-safe and uses pessimistic locking
     *
     * @param bidRequest Bid request details
     * @return BidResponse indicating success or failure
     */
    @Transactional
    public synchronized BidResponse placeBid(BidRequest bidRequest) {
        log.info("Processing bid request - Auction: {}, Bidder: {}, Amount: {}",
                bidRequest.getAuctionId(), bidRequest.getBidderId(), bidRequest.getBidAmount());

        // Step 1: Validate and fetch auction with lock (prevents race conditions)
        Auction auction = auctionRepository.findByIdWithLock(bidRequest.getAuctionId())
                .orElse(null);

        if (auction == null) {
            log.warn("Bid rejected - Auction not found: {}", bidRequest.getAuctionId());
            return BidResponse.failure("Auction not found");
        }

        // Step 2: Validate auction status
        if (auction.getStatus() != Auction.AuctionStatus.ACTIVE) {
            log.warn("Bid rejected - Auction not active: {}", auction.getAuctionId());
            return BidResponse.failure("Auction is not active");
        }

        // Step 3: Check if auction has expired
        if (auction.isExpired()) {
            log.warn("Bid rejected - Auction expired: {}", auction.getAuctionId());
            auction.setStatus(Auction.AuctionStatus.ENDED);
            auctionRepository.save(auction);
            return BidResponse.failure("Auction has ended");
        }

        // Step 4: Validate bidder exists
        User bidder = userRepository.findById(bidRequest.getBidderId()).orElse(null);
        if (bidder == null) {
            log.warn("Bid rejected - Bidder not found: {}", bidRequest.getBidderId());
            return BidResponse.failure("Bidder not found");
        }

        // Step 5: Validate bidder is not the seller
        if (auction.getSeller().getUserId().equals(bidder.getUserId())) {
            log.warn("Bid rejected - Seller cannot bid on own auction");
            return BidResponse.failure("You cannot bid on your own auction");
        }

        // Step 6: Validate bid amount
        if (bidRequest.getBidAmount().compareTo(auction.getCurrentPrice()) <= 0) {
            log.warn("Bid rejected - Amount too low. Current: {}, Bid: {}",
                    auction.getCurrentPrice(), bidRequest.getBidAmount());
            return BidResponse.failure("Bid amount must be higher than current price: " +
                    auction.getCurrentPrice());
        }

        // Step 6.5: Check if user has sufficient available balance
        if (bidder.getAvailableBalance().compareTo(bidRequest.getBidAmount()) < 0) {
            log.warn("Bid rejected - Insufficient funds. Available: {}, Required: {}",
                    bidder.getAvailableBalance(), bidRequest.getBidAmount());
            return BidResponse.failure("Insufficient available balance. You have $" +
                    bidder.getAvailableBalance() + " but need $" + bidRequest.getBidAmount());
        }

        // Step 6.6: Freeze the bid amount
        try {
            walletService.freezeAmount(bidder.getUserId(), bidRequest.getBidAmount(),
                    "Bid on " + auction.getItemName(), auction.getAuctionId(), null);
            log.info("Frozen ${} from user {}", bidRequest.getBidAmount(), bidder.getUserId());
        } catch (Exception e) {
            log.error("Failed to freeze bid amount", e);
            return BidResponse.failure("Failed to freeze bid amount: " + e.getMessage());
        }

        // Step 7: Create and save the bid
        Bid bid = Bid.builder()
                .auction(auction)
                .bidder(bidder)
                .bidAmount(bidRequest.getBidAmount())
                .status(Bid.BidStatus.WINNING)
                .build();

        bid = bidRepository.save(bid);
        log.info("Bid saved - ID: {}", bid.getBidId());

        // Step 8: Update previous winning bids to OUTBID and unfreeze their money
        List<Bid> previousBids = bidRepository.findByAuctionOrderByBidAmountDesc(auction);
        for (Bid previousBid : previousBids) {
            if (!previousBid.getBidId().equals(bid.getBidId()) &&
                    previousBid.getStatus() == Bid.BidStatus.WINNING) {
                previousBid.setStatus(Bid.BidStatus.OUTBID);
                bidRepository.save(previousBid);

                // Unfreeze the previous bidder's money
                try {
                    walletService.unfreezeAmount(
                            previousBid.getBidder().getUserId(),
                            previousBid.getBidAmount(),
                            "Outbid on " + auction.getItemName(),
                            auction.getAuctionId(),
                            previousBid.getBidId()
                    );
                    log.info("Unfrozen ${} for user {} (outbid)",
                            previousBid.getBidAmount(), previousBid.getBidder().getUserId());

                    // Send notification to outbid user
                    notificationService.createNotification(
                            previousBid.getBidder(),
                            Notification.NotificationType.OUTBID,
                            "You were outbid on '" + auction.getItemName() +
                                    "'. New price: $" + bid.getBidAmount()
                    );
                } catch (Exception e) {
                    log.error("Failed to unfreeze amount for outbid user", e);
                }
            }
        }

        // Step 9: Update auction current price and deadline
        auction.setCurrentPrice(bidRequest.getBidAmount());
        auction.updateDeadline(LocalDateTime.now());

        // Check if auction is ending soon
        if (auction.isEndingSoon()) {
            auction.setStatus(Auction.AuctionStatus.ENDING_SOON);
        }

        auctionRepository.save(auction);
        log.info("Auction updated - New price: {}, New deadline: {}",
                auction.getCurrentPrice(), auction.getCurrentDeadline());

        // Member 3: Broadcast price update via UDP Multicast
        multicastBroadcaster.broadcastPriceUpdate(
                auction.getAuctionId(),
                auction.getItemName(),
                auction.getCurrentPrice(),
                bidder.getUserId(),
                bidder.getUsername()
        );

        // Send notification to bidder
        try {
            notificationService.createNotification(
                    bidder,
                    Notification.NotificationType.BID_PLACED,
                    "Your bid of $" + bid.getBidAmount() + " on '" +
                            auction.getItemName() + "' was placed successfully"
            );
        } catch (Exception e) {
            log.error("Failed to create bid notification", e);
        }

        // Broadcast real-time update via WebSocket
        try {
            webSocketEventService.broadcastNewBid(auction.getAuctionId(), java.util.Map.of(
                    "bidId", bid.getBidId(),
                    "auctionId", auction.getAuctionId(),
                    "itemName", auction.getItemName(),
                    "bidAmount", bid.getBidAmount(),
                    "bidderName", bidder.getUsername(),
                    "bidderId", bidder.getUserId(),
                    "bidTime", bid.getBidTime(),
                    "newDeadline", auction.getCurrentDeadline(),
                    "currentPrice", auction.getCurrentPrice()
            ));

            webSocketEventService.broadcastAuctionUpdate(auction.getAuctionId(), java.util.Map.of(
                    "currentPrice", auction.getCurrentPrice(),
                    "currentDeadline", auction.getCurrentDeadline(),
                    "status", auction.getStatus().toString()
            ));
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket update", e);
        }

        return BidResponse.success(
                bid.getBidId(),
                auction.getAuctionId(),
                bid.getBidAmount(),
                bid.getBidTime(),
                auction.getCurrentDeadline()
        );
    }

    /**
     * Get all bids for an auction
     */
    public List<Bid> getBidsForAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        return bidRepository.findByAuctionOrderByBidTimeDesc(auction);
    }

    /**
     * Get all bids placed by a user
     */
    public List<Bid> getBidsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bidRepository.findByBidderOrderByBidTimeDesc(user);
    }

    /**
     * Retract a bid (within 1 minute window)
     */
    @Transactional
    public void retractBid(Long bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        // Check if bid is within 1 minute window
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime bidTime = bid.getBidTime();
        long minutesElapsed = java.time.Duration.between(bidTime, now).toMinutes();

        if (minutesElapsed > 1) {
            throw new IllegalStateException("Cannot retract bid after 1 minute");
        }

        // Unfreeze the bid amount
        try {
            walletService.unfreezeAmount(
                    bid.getBidder().getUserId(),
                    bid.getBidAmount(),
                    "Bid retracted on " + bid.getAuction().getItemName(),
                    bid.getAuction().getAuctionId(),
                    bid.getBidId()
            );
            log.info("Unfrozen ${} for user {} (bid retracted)",
                    bid.getBidAmount(), bid.getBidder().getUserId());
        } catch (Exception e) {
            log.error("Failed to unfreeze retracted bid amount", e);
            throw new RuntimeException("Failed to unfreeze bid amount: " + e.getMessage());
        }

        // Check if this is the winning bid
        if (bid.getStatus() == Bid.BidStatus.WINNING) {
            // Find previous bid and make it winning
            List<Bid> previousBids = bidRepository.findByAuctionOrderByBidAmountDesc(bid.getAuction());
            Bid previousWinningBid = null;
            for (Bid prevBid : previousBids) {
                if (!prevBid.getBidId().equals(bidId) && prevBid.getStatus() == Bid.BidStatus.OUTBID) {
                    previousWinningBid = prevBid;
                    break;
                }
            }

            // Update auction price to previous bid
            Auction auction = bid.getAuction();
            if (previousWinningBid != null) {
                previousWinningBid.setStatus(Bid.BidStatus.WINNING);
                bidRepository.save(previousWinningBid);
                auction.setCurrentPrice(previousWinningBid.getBidAmount());

                // Re-freeze the previous bidder's money
                try {
                    walletService.freezeAmount(
                            previousWinningBid.getBidder().getUserId(),
                            previousWinningBid.getBidAmount(),
                            "Bid on " + auction.getItemName() + " (now winning after retraction)",
                            auction.getAuctionId(),
                            previousWinningBid.getBidId()
                    );
                } catch (Exception e) {
                    log.error("Failed to re-freeze previous bidder's amount", e);
                }
            } else {
                auction.setCurrentPrice(auction.getStartingPrice());
            }
            auctionRepository.save(auction);
        }

        // Delete the bid
        bidRepository.delete(bid);
        log.info("Bid retracted - ID: {}", bidId);
    }
}
