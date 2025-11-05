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

        // Only allow update if auction hasn't started or has no bids
        if (existingAuction.getStatus() == Auction.AuctionStatus.ACTIVE) {
            throw new IllegalStateException("Cannot update active auction with bids");
        }

        // Update allowed fields
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
            existingAuction.setCurrentPrice(updatedAuction.getStartingPrice());
        }

        return auctionRepository.save(existingAuction);
    }

    /**
     * Delete auction
     */
    @Transactional
    public void deleteAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Only allow delete if no bids placed
        if (auction.getStatus() == Auction.AuctionStatus.ACTIVE ||
            auction.getStatus() == Auction.AuctionStatus.ENDING_SOON) {
            throw new IllegalStateException("Cannot delete auction with active status");
        }

        auctionRepository.delete(auction);
    }

    /**
     * Close auction manually
     */
    @Transactional
    public Auction closeAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

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
}
