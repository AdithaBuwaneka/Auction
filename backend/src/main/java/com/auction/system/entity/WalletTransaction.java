package com.auction.system.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Wallet Transaction Entity
 * Tracks all balance changes (deposits, freezes, unfreezes, deductions)
 */
@Entity
@Table(name = "wallet_transactions", indexes = {
        @Index(name = "idx_wallet_user_id", columnList = "user_id"),
        @Index(name = "idx_wallet_type", columnList = "transaction_type"),
        @Index(name = "idx_wallet_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wallet_transaction_id")
    private Long walletTransactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 30)
    private TransactionType transactionType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "balance_before", nullable = false, precision = 10, scale = 2)
    private BigDecimal balanceBefore;

    @Column(name = "balance_after", nullable = false, precision = 10, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "frozen_before", nullable = false, precision = 10, scale = 2)
    private BigDecimal frozenBefore;

    @Column(name = "frozen_after", nullable = false, precision = 10, scale = 2)
    private BigDecimal frozenAfter;

    @Column(name = "available_before", nullable = false, precision = 10, scale = 2)
    private BigDecimal availableBefore;

    @Column(name = "available_after", nullable = false, precision = 10, scale = 2)
    private BigDecimal availableAfter;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_auction_id")
    @JsonIgnore
    private Auction relatedAuction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_bid_id")
    @JsonIgnore
    private Bid relatedBid;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Wallet Transaction Types
     */
    public enum TransactionType {
        DEPOSIT,           // User adds money to wallet
        FREEZE,            // Money frozen when placing bid
        UNFREEZE,          // Money unfrozen when outbid
        DEDUCT,            // Money deducted when winning auction
        REFUND,            // Money refunded (admin action)
        WITHDRAW,          // User withdraws money
        ADMIN_ADJUSTMENT   // Admin manual adjustment
    }
}
