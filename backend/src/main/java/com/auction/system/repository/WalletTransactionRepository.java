package com.auction.system.repository;

import com.auction.system.entity.User;
import com.auction.system.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Wallet Transaction Repository
 */
@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    /**
     * Find all wallet transactions for a user
     */
    List<WalletTransaction> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find wallet transactions by type
     */
    List<WalletTransaction> findByUserAndTransactionTypeOrderByCreatedAtDesc(
            User user, WalletTransaction.TransactionType type);

    /**
     * Count transactions by type
     */
    long countByUserAndTransactionType(User user, WalletTransaction.TransactionType type);
}
