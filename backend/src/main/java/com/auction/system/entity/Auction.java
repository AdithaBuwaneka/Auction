package com.auction.system.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Auction Entity - Represents auction items
 *
 * Auction Timing Logic:
 * - START_TIME: When auction begins
 * - MANDATORY_END_TIME: Auction MUST end by this time
 * - BID_GAP_DURATION: Time window after each bid
 * - CURRENT_DEADLINE: Dynamically updated (last_bid_time + bid_gap, capped at mandatory_end)
 */
@Entity
@Table(name = "auctions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "auction_id")
    private Long auctionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnoreProperties({"password", "wallet", "auctions", "bids", "notifications", "wonAuctions"})
    private User seller;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "starting_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal startingPrice;

    @Column(name = "current_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "mandatory_end_time", nullable = false)
    private LocalDateTime mandatoryEndTime;

    @Column(name = "bid_gap_duration", nullable = false)
    private Duration bidGapDuration;

    @Column(name = "current_deadline")
    private LocalDateTime currentDeadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AuctionStatus status = AuctionStatus.PENDING;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "winner_id")
    @JsonIgnoreProperties({"password", "wallet", "auctions", "bids", "notifications", "wonAuctions"})
    private User winner;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @JsonIgnore
    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Bid> bids;

    @JsonIgnore
    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions;

    /**
     * Auction Status Enum
     */
    public enum AuctionStatus {
        PENDING,        // Created but not started yet
        ACTIVE,         // Currently running
        ENDING_SOON,    // Less than 5 minutes remaining
        ENDED,          // Finished (time expired or no bids in bid gap)
        CANCELLED       // Cancelled by seller
    }

    /**
     * Calculate and update the current deadline based on the last bid time
     * @param lastBidTime Time when the last bid was placed
     */
    public void updateDeadline(LocalDateTime lastBidTime) {
        LocalDateTime calculatedDeadline = lastBidTime.plus(bidGapDuration);

        // Cap at mandatory end time
        if (calculatedDeadline.isAfter(mandatoryEndTime)) {
            this.currentDeadline = mandatoryEndTime;
        } else {
            this.currentDeadline = calculatedDeadline;
        }
    }

    /**
     * Check if auction has expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(currentDeadline != null ? currentDeadline : mandatoryEndTime);
    }

    /**
     * Check if auction is ending soon (within 5 minutes)
     */
    public boolean isEndingSoon() {
        if (currentDeadline == null) return false;
        return Duration.between(LocalDateTime.now(), currentDeadline).toMinutes() < 5;
    }
}
