package com.auction.system.repository;

import com.auction.system.entity.Auction;
import com.auction.system.entity.Bid;
import com.auction.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Bid Repository
 * Provides database access methods for Bid entity
 */
@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    /**
     * Find all bids for a specific auction, ordered by bid amount (highest first)
     */
    List<Bid> findByAuctionOrderByBidAmountDesc(Auction auction);

    /**
     * Find all bids for a specific auction, ordered by time (most recent first)
     */
    List<Bid> findByAuctionOrderByBidTimeDesc(Auction auction);

    /**
     * Find all bids placed by a specific user
     */
    List<Bid> findByBidderOrderByBidTimeDesc(User bidder);

    /**
     * Find the highest bid for an auction
     */
    @Query("SELECT b FROM Bid b WHERE b.auction = :auction AND b.status = 'WINNING' ORDER BY b.bidAmount DESC")
    Optional<Bid> findHighestBidForAuction(@Param("auction") Auction auction);

    /**
     * Find the last bid placed on an auction (by time)
     */
    @Query("SELECT b FROM Bid b WHERE b.auction = :auction ORDER BY b.bidTime DESC LIMIT 1")
    Optional<Bid> findLastBidForAuction(@Param("auction") Auction auction);

    /**
     * Count total bids for an auction
     */
    long countByAuction(Auction auction);

    /**
     * Count total bids by a user
     */
    long countByBidder(User bidder);

    /**
     * Find user's bids on a specific auction
     */
    List<Bid> findByAuctionAndBidder(Auction auction, User bidder);
}
