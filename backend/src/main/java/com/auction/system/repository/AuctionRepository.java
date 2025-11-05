package com.auction.system.repository;

import com.auction.system.entity.Auction;
import com.auction.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Auction Repository
 * Provides database access methods for Auction entity
 */
@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {

    /**
     * Find all active auctions
     */
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' ORDER BY a.currentDeadline ASC")
    List<Auction> findAllActiveAuctions();

    /**
     * Find auctions by status
     */
    List<Auction> findByStatus(Auction.AuctionStatus status);

    /**
     * Find auctions by seller
     */
    List<Auction> findBySeller(User seller);

    /**
     * Find auctions ending soon (within specified minutes)
     */
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' AND a.currentDeadline BETWEEN :now AND :thresholdTime")
    List<Auction> findAuctionsEndingSoon(@Param("now") LocalDateTime now, @Param("thresholdTime") LocalDateTime thresholdTime);

    /**
     * Find expired auctions that need to be closed
     */
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' AND a.currentDeadline < :now")
    List<Auction> findExpiredAuctions(@Param("now") LocalDateTime now);

    /**
     * Find auction with pessimistic lock (for concurrent bid handling)
     * This prevents race conditions when multiple users bid simultaneously
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.auctionId = :auctionId")
    Optional<Auction> findByIdWithLock(@Param("auctionId") Long auctionId);

    /**
     * Search auctions by item name
     */
    @Query("SELECT a FROM Auction a WHERE LOWER(a.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')) AND a.status = 'ACTIVE'")
    List<Auction> searchActiveAuctionsByName(@Param("keyword") String keyword);
}
