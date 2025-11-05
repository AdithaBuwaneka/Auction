package com.auction.system.scheduler;

import com.auction.system.entity.Auction;
import com.auction.system.entity.Bid;
import com.auction.system.entity.Notification;
import com.auction.system.repository.AuctionRepository;
import com.auction.system.repository.BidRepository;
import com.auction.system.service.NotificationService;
import com.auction.system.service.WalletService;
import com.auction.system.websocket.WebSocketEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Auction Scheduler
 * Automatically closes expired auctions and processes winner payments
 * Runs every 30 seconds
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduler {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;
    private final WebSocketEventService webSocketEventService;

    /**
     * Close expired auctions and process payments
     * Runs every 30 seconds
     */
    @Scheduled(fixedDelay = 30000) // Run every 30 seconds
    @Transactional
    public void closeExpiredAuctions() {
        try {
            LocalDateTime now = LocalDateTime.now();

            // Find all active auctions that have expired
            List<Auction> expiredAuctions = auctionRepository.findAll().stream()
                    .filter(auction -> auction.getStatus() == Auction.AuctionStatus.ACTIVE ||
                                     auction.getStatus() == Auction.AuctionStatus.ENDING_SOON)
                    .filter(Auction::isExpired)
                    .toList();

            if (expiredAuctions.isEmpty()) {
                return;
            }

            log.info("Found {} expired auctions to close", expiredAuctions.size());

            for (Auction auction : expiredAuctions) {
                try {
                    closeAuction(auction);
                } catch (Exception e) {
                    log.error("Error closing auction {}: {}", auction.getAuctionId(), e.getMessage(), e);
                }
            }
        } catch (Exception e) {
            log.error("Error in auction scheduler", e);
        }
    }

    /**
     * Close a single auction and process payment
     */
    private void closeAuction(Auction auction) {
        log.info("Closing auction: {} - {}", auction.getAuctionId(), auction.getItemName());

        // Find the winning bid
        List<Bid> bids = bidRepository.findByAuctionOrderByBidAmountDesc(auction);
        Bid winningBid = bids.stream()
                .filter(bid -> bid.getStatus() == Bid.BidStatus.WINNING)
                .findFirst()
                .orElse(null);

        if (winningBid == null) {
            // No bids - auction ended without sale
            auction.setStatus(Auction.AuctionStatus.ENDED);
            auctionRepository.save(auction);

            log.info("Auction {} ended with no bids", auction.getAuctionId());

            // Notify seller
            notificationService.createNotification(
                    auction.getSeller(),
                    Notification.NotificationType.AUCTION_ENDED,
                    "Your auction '" + auction.getItemName() + "' ended with no bids"
            );

            // Broadcast via WebSocket
            webSocketEventService.broadcastAuctionEnded(auction.getAuctionId(), Map.of(
                    "auctionId", auction.getAuctionId(),
                    "itemName", auction.getItemName(),
                    "hasWinner", false
            ));

            return;
        }

        // Process winner payment
        try {
            // Deduct frozen amount from winner
            walletService.deductFrozenAmount(
                    winningBid.getBidder().getUserId(),
                    winningBid.getBidAmount(),
                    "Payment for winning auction: " + auction.getItemName(),
                    auction.getAuctionId(),
                    winningBid.getBidId()
            );

            // Add money to seller (minus platform fee if applicable)
            walletService.deposit(
                    auction.getSeller().getUserId(),
                    winningBid.getBidAmount(),
                    "Payment received from auction: " + auction.getItemName()
            );

            // Update auction status
            auction.setStatus(Auction.AuctionStatus.ENDED);
            auctionRepository.save(auction);

            // Update bid status
            winningBid.setStatus(Bid.BidStatus.WON);
            bidRepository.save(winningBid);

            log.info("Auction {} closed successfully. Winner: {}, Amount: ${}",
                    auction.getAuctionId(),
                    winningBid.getBidder().getUsername(),
                    winningBid.getBidAmount());

            // Notify winner
            notificationService.createNotification(
                    winningBid.getBidder(),
                    Notification.NotificationType.AUCTION_WON,
                    "Congratulations! You won the auction for '" + auction.getItemName() +
                            "' with a bid of $" + winningBid.getBidAmount()
            );

            // Notify seller
            notificationService.createNotification(
                    auction.getSeller(),
                    Notification.NotificationType.AUCTION_ENDED,
                    "Your auction '" + auction.getItemName() + "' sold to " +
                            winningBid.getBidder().getUsername() + " for $" + winningBid.getBidAmount()
            );

            // Notify all losing bidders
            for (Bid losingBid : bids) {
                if (!losingBid.getBidId().equals(winningBid.getBidId()) &&
                        losingBid.getStatus() == Bid.BidStatus.OUTBID) {
                    losingBid.setStatus(Bid.BidStatus.LOST);
                    bidRepository.save(losingBid);

                    notificationService.createNotification(
                            losingBid.getBidder(),
                            Notification.NotificationType.AUCTION_LOST,
                            "The auction for '" + auction.getItemName() + "' has ended. " +
                                    "Winner: " + winningBid.getBidder().getUsername() +
                                    " with $" + winningBid.getBidAmount()
                    );
                }
            }

            // Broadcast auction ended via WebSocket
            webSocketEventService.broadcastAuctionEnded(auction.getAuctionId(), Map.of(
                    "auctionId", auction.getAuctionId(),
                    "itemName", auction.getItemName(),
                    "hasWinner", true,
                    "winnerName", winningBid.getBidder().getUsername(),
                    "winnerId", winningBid.getBidder().getUserId(),
                    "finalPrice", winningBid.getBidAmount()
            ));

        } catch (Exception e) {
            log.error("Error processing payment for auction {}: {}",
                    auction.getAuctionId(), e.getMessage(), e);

            // Mark auction as failed
            auction.setStatus(Auction.AuctionStatus.ENDED);
            auctionRepository.save(auction);

            // Notify admin about payment failure
            log.error("Payment processing failed for auction {}. Manual intervention required.",
                    auction.getAuctionId());
        }
    }
}
