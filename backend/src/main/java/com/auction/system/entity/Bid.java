package com.auction.system.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bid Entity - Represents bids placed on auctions
 */
@Entity
@Table(name = "bids", indexes = {
        @Index(name = "idx_auction_id", columnList = "auction_id"),
        @Index(name = "idx_bidder_id", columnList = "bidder_id"),
        @Index(name = "idx_bid_time", columnList = "bid_time")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bid_id")
    private Long bidId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bidder_id", nullable = false)
    private User bidder;

    @Column(name = "bid_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal bidAmount;

    @CreationTimestamp
    @Column(name = "bid_time", nullable = false, updatable = false)
    private LocalDateTime bidTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BidStatus status = BidStatus.ACCEPTED;

    /**
     * Bid Status Enum
     */
    public enum BidStatus {
        ACCEPTED,       // Bid accepted and recorded
        REJECTED,       // Bid rejected (amount too low, auction ended, etc.)
        OUTBID,         // Bid was valid but has been outbid by another user
        WINNING         // Currently the highest bid
    }
}
