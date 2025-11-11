package com.auction.system.service;

import com.auction.system.entity.Auction;
import com.auction.system.entity.User;
import com.auction.system.repository.AuctionRepository;
import com.auction.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Auction Service
 * Handles auction creation, retrieval, and management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final com.auction.system.repository.BidRepository bidRepository;
    private final WalletService walletService;

    /**
     * Create a new auction
     */
    @Transactional
    public Auction createAuction(Auction auction) {
        log.info("Creating new auction: {}", auction.getItemName());

        // Set initial values
        auction.setCurrentPrice(auction.getStartingPrice());
        auction.setStatus(Auction.AuctionStatus.PENDING);

        // If start time is in the past or now, make it active
        if (auction.getStartTime().isBefore(LocalDateTime.now()) ||
                auction.getStartTime().isEqual(LocalDateTime.now())) {
            auction.setStatus(Auction.AuctionStatus.ACTIVE);
            auction.setStartTime(LocalDateTime.now());
        }

        return auctionRepository.save(auction);
    }

    /**
     * Get auction by ID
     */
    public Optional<Auction> getAuctionById(Long auctionId) {
        return auctionRepository.findById(auctionId);
    }

    /**
     * Get all auctions (regardless of status)
     */
    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }

    /**
     * Get all active auctions
     */
    public List<Auction> getActiveAuctions() {
        return auctionRepository.findAllActiveAuctions();
    }

    /**
     * Get all auctions by seller
     */
    public List<Auction> getAuctionsBySeller(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return auctionRepository.findBySeller(seller);
    }

    /**
     * Search auctions by keyword
     */
    public List<Auction> searchAuctions(String keyword) {
        return auctionRepository.searchActiveAuctionsByName(keyword);
    }

    /**
     * Scheduled task to check and close expired auctions
     * Runs every 30 seconds
     */
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void checkAndCloseExpiredAuctions() {
        LocalDateTime now = LocalDateTime.now();
        List<Auction> expiredAuctions = auctionRepository.findExpiredAuctions(now);

        for (Auction auction : expiredAuctions) {
            log.info("Closing expired auction: {} - {}", auction.getAuctionId(), auction.getItemName());

            // Find and set the winner (highest bidder)
            Optional<com.auction.system.entity.Bid> highestBid = bidRepository.findHighestBidForAuction(auction);
            if (highestBid.isPresent()) {
                auction.setWinner(highestBid.get().getBidder());
                log.info("Winner set for auction {}: User {}", auction.getAuctionId(), highestBid.get().getBidder().getUserId());
            } else {
                log.info("No bids found for auction {}, no winner set", auction.getAuctionId());
            }

            auction.setStatus(Auction.AuctionStatus.ENDED);
            auctionRepository.save(auction);
        }

        if (!expiredAuctions.isEmpty()) {
            log.info("Closed {} expired auctions", expiredAuctions.size());
        }
    }

    /**
     * Scheduled task to activate pending auctions
     * Runs every minute
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void activatePendingAuctions() {
        LocalDateTime now = LocalDateTime.now();
        List<Auction> pendingAuctions = auctionRepository.findByStatus(Auction.AuctionStatus.PENDING);

        for (Auction auction : pendingAuctions) {
            if (auction.getStartTime().isBefore(now) || auction.getStartTime().isEqual(now)) {
                log.info("Activating auction: {} - {}", auction.getAuctionId(), auction.getItemName());
                auction.setStatus(Auction.AuctionStatus.ACTIVE);
                auctionRepository.save(auction);
            }
        }
    }

    /**
     * Scheduled task to update ENDING_SOON status
     * Runs every 30 seconds
     */
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void updateEndingSoonStatus() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fiveMinutesLater = now.plusMinutes(5);

        List<Auction> endingSoonAuctions = auctionRepository.findAuctionsEndingSoon(now, fiveMinutesLater);

        for (Auction auction : endingSoonAuctions) {
            if (auction.getStatus() == Auction.AuctionStatus.ACTIVE) {
                auction.setStatus(Auction.AuctionStatus.ENDING_SOON);
                auctionRepository.save(auction);
            }
        }
    }

    /**
     * Update auction
     */
    @Transactional
    public Auction updateAuction(Long auctionId, Auction updatedAuction) {
        Auction existingAuction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Update all basic fields
        if (updatedAuction.getItemName() != null) {
            existingAuction.setItemName(updatedAuction.getItemName());
        }
        if (updatedAuction.getDescription() != null) {
            existingAuction.setDescription(updatedAuction.getDescription());
        }
        if (updatedAuction.getImageUrl() != null) {
            existingAuction.setImageUrl(updatedAuction.getImageUrl());
        }
        if (updatedAuction.getStartingPrice() != null) {
            existingAuction.setStartingPrice(updatedAuction.getStartingPrice());
            // Only update current price if no bids have been placed
            long bidCount = bidRepository.countByAuction(existingAuction);
            if (bidCount == 0) {
                existingAuction.setCurrentPrice(updatedAuction.getStartingPrice());
            }
        }

        // Update time-related fields (allow for all statuses except ENDED)
        if (existingAuction.getStatus() != Auction.AuctionStatus.ENDED) {
            // Temporarily store updated times for validation
            LocalDateTime newStartTime = updatedAuction.getStartTime() != null ?
                updatedAuction.getStartTime() : existingAuction.getStartTime();
            LocalDateTime newEndTime = updatedAuction.getMandatoryEndTime() != null ?
                updatedAuction.getMandatoryEndTime() : existingAuction.getMandatoryEndTime();

            // Validate time relationships
            if (newEndTime != null && newStartTime != null) {
                if (newEndTime.isBefore(newStartTime) || newEndTime.isEqual(newStartTime)) {
                    throw new IllegalStateException("End time must be after start time");
                }

                // Check if end time is in the future
                if (newEndTime.isBefore(LocalDateTime.now())) {
                    throw new IllegalStateException("End time must be in the future");
                }

                // Ensure minimum duration (at least 1 minute)
                if (java.time.Duration.between(newStartTime, newEndTime).toMinutes() < 1) {
                    throw new IllegalStateException("Auction duration must be at least 1 minute");
                }
            }

            // Apply updates after validation
            if (updatedAuction.getStartTime() != null) {
                existingAuction.setStartTime(updatedAuction.getStartTime());
            }
            if (updatedAuction.getMandatoryEndTime() != null) {
                existingAuction.setMandatoryEndTime(updatedAuction.getMandatoryEndTime());

                // Update current deadline intelligently
                long bidCount = bidRepository.countByAuction(existingAuction);
                if (bidCount == 0) {
                    // No bids yet - set deadline to mandatory end time
                    existingAuction.setCurrentDeadline(updatedAuction.getMandatoryEndTime());
                } else {
                    // Has bids - only update if new end time is earlier than current deadline
                    if (existingAuction.getCurrentDeadline() == null ||
                        updatedAuction.getMandatoryEndTime().isBefore(existingAuction.getCurrentDeadline())) {
                        existingAuction.setCurrentDeadline(updatedAuction.getMandatoryEndTime());
                    }
                }
            }
            if (updatedAuction.getBidGapDuration() != null) {
                // Validate bid gap duration (minimum 30 seconds, maximum 10 minutes)
                long seconds = updatedAuction.getBidGapDuration().getSeconds();
                if (seconds < 30) {
                    throw new IllegalStateException("Bid gap duration must be at least 30 seconds");
                }
                if (seconds > 86400) {
                    throw new IllegalStateException("Bid gap duration must not exceed 24 hours");
                }
                existingAuction.setBidGapDuration(updatedAuction.getBidGapDuration());
            }
        }

        return auctionRepository.save(existingAuction);
    }

    /**
     * Delete auction
     * Allows deletion of any auction by the owner
     */
    @Transactional
    public void deleteAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Allow deletion of any auction - owner can delete at any time
        auctionRepository.delete(auction);
    }

    /**
     * Close auction manually
     */
    @Transactional
    public Auction closeAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Find and set the winner (highest bidder)
        Optional<com.auction.system.entity.Bid> highestBid = bidRepository.findHighestBidForAuction(auction);
        if (highestBid.isPresent()) {
            auction.setWinner(highestBid.get().getBidder());
            log.info("Winner set for auction {}: User {}", auction.getAuctionId(), highestBid.get().getBidder().getUserId());

            // Process payment: 20% admin fee, 80% to seller
            java.util.Map<String, com.auction.system.entity.WalletTransaction> transactions =
                walletService.processAuctionPayment(
                    highestBid.get().getBidder().getUserId(),
                    auction.getSeller().getUserId(),
                    auction.getCurrentPrice(),
                    auction
                );
            log.info("Auction {} payment processed successfully. Buyer: {}, Seller: {}, Amount: ${}",
                auctionId,
                highestBid.get().getBidder().getUserId(),
                auction.getSeller().getUserId(),
                auction.getCurrentPrice());
        } else {
            log.info("No bids found for auction {}, no winner set", auction.getAuctionId());
        }

        auction.setStatus(Auction.AuctionStatus.ENDED);
        return auctionRepository.save(auction);
    }

    /**
     * Get ended auctions
     */
    public List<Auction> getEndedAuctions() {
        return auctionRepository.findByStatus(Auction.AuctionStatus.ENDED);
    }

    /**
     * Get current deadline for auction
     */
    public LocalDateTime getCurrentDeadline(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.getCurrentDeadline() != null) {
            return auction.getCurrentDeadline();
        }
        return auction.getMandatoryEndTime();
    }

    /**
     * Extend auction deadline (Admin function)
     */
    @Transactional
    public Auction extendDeadline(Long auctionId, int hours) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        LocalDateTime currentDeadline = auction.getCurrentDeadline() != null
                ? auction.getCurrentDeadline()
                : auction.getMandatoryEndTime();

        LocalDateTime newDeadline = currentDeadline.plusHours(hours);
        auction.setCurrentDeadline(newDeadline);
        auction.setMandatoryEndTime(newDeadline);

        return auctionRepository.save(auction);
    }
}
