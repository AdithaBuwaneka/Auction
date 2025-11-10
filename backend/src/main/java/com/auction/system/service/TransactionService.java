package com.auction.system.service;

import com.auction.system.entity.Auction;
import com.auction.system.entity.Transaction;
import com.auction.system.entity.User;
import com.auction.system.repository.AuctionRepository;
import com.auction.system.repository.TransactionRepository;
import com.auction.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Transaction Service
 * Handles payment processing and transaction management
 * Member 5 (SSL/TLS) will secure this service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    /**
     * Process payment for won auction
     */
    @Transactional
    public Transaction processPayment(Long auctionId, Long buyerId, String cardNumber, String cvv) {
        log.info("Processing payment - Auction: {}, Buyer: {}", auctionId, buyerId);

        // Validate auction
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.getStatus() != Auction.AuctionStatus.ENDED) {
            throw new IllegalStateException("Auction is not ended");
        }

        if (auction.getWinner() == null) {
            throw new IllegalStateException("No winner for this auction");
        }

        if (!auction.getWinner().getUserId().equals(buyerId)) {
            throw new IllegalStateException("You are not the winner of this auction");
        }

        // Validate buyer
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        // Validate payment details (dummy validation)
        if (cardNumber == null || cardNumber.length() != 16) {
            throw new IllegalStateException("Invalid card number");
        }

        if (cvv == null || cvv.length() != 3) {
            throw new IllegalStateException("Invalid CVV");
        }

        // Check if transaction already exists
        Transaction existing = transactionRepository.findByAuction(auction);
        if (existing != null) {
            throw new IllegalStateException("Payment already processed for this auction");
        }

        // Simulate payment processing delay (2 seconds)
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setBuyer(buyer);
        transaction.setSeller(auction.getSeller());
        transaction.setAuction(auction);
        transaction.setAmount(auction.getCurrentPrice());
        transaction.setPaymentMethod("CARD_****_" + cardNumber.substring(12));
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);

        transaction = transactionRepository.save(transaction);
        log.info("Payment processed successfully - Transaction ID: {}", transaction.getTransactionId());

        return transaction;
    }

    /**
     * Get user's transaction history
     */
    public List<Transaction> getUserTransactions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return transactionRepository.findByBuyerOrSeller(user, user);
    }

    /**
     * Get transaction for specific auction
     */
    public Transaction getAuctionTransaction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        return transactionRepository.findByAuction(auction);
    }

    /**
     * Get all transactions (Admin)
     */
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    /**
     * Get transaction by ID (Admin)
     */
    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
    }
}
