package com.auction.system.repository;

import com.auction.system.entity.Auction;
import com.auction.system.entity.Transaction;
import com.auction.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Transaction Repository
 * Provides database access methods for Transaction entity
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Find all transactions for a buyer
     */
    List<Transaction> findByBuyerOrderByTransactionTimeDesc(User buyer);

    /**
     * Find all transactions for a seller
     */
    List<Transaction> findBySellerOrderByTransactionTimeDesc(User seller);

    /**
     * Find transaction for a specific auction
     */
    Optional<Transaction> findByAuction(Auction auction);

    /**
     * Find transactions by status
     */
    List<Transaction> findByStatus(Transaction.TransactionStatus status);

    /**
     * Find pending transactions that need processing
     */
    @Query("SELECT t FROM Transaction t WHERE t.status IN ('PENDING', 'PROCESSING')")
    List<Transaction> findPendingTransactions();

    /**
     * Count completed transactions for a user
     */
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.buyer = :user AND t.status = 'COMPLETED'")
    long countCompletedPurchases(@Param("user") User user);

    /**
     * Count completed sales for a seller
     */
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.seller = :user AND t.status = 'COMPLETED'")
    long countCompletedSales(@Param("user") User user);
}
