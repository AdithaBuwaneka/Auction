package com.auction.system.service;

import com.auction.system.entity.*;
import com.auction.system.repository.UserRepository;
import com.auction.system.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Wallet Service
 * Handles all wallet operations: deposit, freeze, unfreeze, deduct
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final UserRepository userRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    /**
     * Deposit money to user wallet
     */
    @Transactional
    public WalletTransaction deposit(Long userId, BigDecimal amount, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }

        BigDecimal balanceBefore = user.getBalance();
        BigDecimal frozenBefore = user.getFrozenBalance();
        BigDecimal availableBefore = user.getAvailableBalance();

        user.setBalance(user.getBalance().add(amount));

        BigDecimal balanceAfter = user.getBalance();
        BigDecimal frozenAfter = user.getFrozenBalance();
        BigDecimal availableAfter = user.getAvailableBalance();

        userRepository.save(user);

        WalletTransaction transaction = WalletTransaction.builder()
                .user(user)
                .transactionType(WalletTransaction.TransactionType.DEPOSIT)
                .amount(amount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .frozenBefore(frozenBefore)
                .frozenAfter(frozenAfter)
                .availableBefore(availableBefore)
                .availableAfter(availableAfter)
                .description(description != null ? description : "Deposit to wallet")
                .build();

        walletTransactionRepository.save(transaction);
        log.info("Deposit: User {} deposited ${}, New balance: ${}, Available: ${}",
                userId, amount, balanceAfter, availableAfter);

        return transaction;
    }

    /**
     * Freeze money when user places a bid
     */
    @Transactional
    public WalletTransaction freezeForBid(Long userId, BigDecimal bidAmount, Auction auction, Bid bid) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (bidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Bid amount must be positive");
        }

        if (user.getAvailableBalance().compareTo(bidAmount) < 0) {
            throw new IllegalArgumentException(
                    String.format("Insufficient available balance. Available: $%s, Required: $%s",
                            user.getAvailableBalance(), bidAmount));
        }

        BigDecimal balanceBefore = user.getBalance();
        BigDecimal frozenBefore = user.getFrozenBalance();
        BigDecimal availableBefore = user.getAvailableBalance();

        user.setFrozenBalance(user.getFrozenBalance().add(bidAmount));

        BigDecimal balanceAfter = user.getBalance();
        BigDecimal frozenAfter = user.getFrozenBalance();
        BigDecimal availableAfter = user.getAvailableBalance();

        userRepository.save(user);

        WalletTransaction transaction = WalletTransaction.builder()
                .user(user)
                .transactionType(WalletTransaction.TransactionType.FREEZE)
                .amount(bidAmount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .frozenBefore(frozenBefore)
                .frozenAfter(frozenAfter)
                .availableBefore(availableBefore)
                .availableAfter(availableAfter)
                .description("Frozen for bid on: " + auction.getItemName())
                .relatedAuction(auction)
                .relatedBid(bid)
                .build();

        walletTransactionRepository.save(transaction);
        log.info("Freeze: User {} frozen ${} for bid, Frozen: ${}, Available: ${}",
                userId, bidAmount, frozenAfter, availableAfter);

        return transaction;
    }

    /**
     * Unfreeze money when user is outbid
     */
    @Transactional
    public WalletTransaction unfreezeOutbid(Long userId, BigDecimal bidAmount, Auction auction, Bid bid) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getFrozenBalance().compareTo(bidAmount) < 0) {
            throw new IllegalArgumentException("Insufficient frozen balance to unfreeze");
        }

        BigDecimal balanceBefore = user.getBalance();
        BigDecimal frozenBefore = user.getFrozenBalance();
        BigDecimal availableBefore = user.getAvailableBalance();

        user.setFrozenBalance(user.getFrozenBalance().subtract(bidAmount));

        BigDecimal balanceAfter = user.getBalance();
        BigDecimal frozenAfter = user.getFrozenBalance();
        BigDecimal availableAfter = user.getAvailableBalance();

        userRepository.save(user);

        WalletTransaction transaction = WalletTransaction.builder()
                .user(user)
                .transactionType(WalletTransaction.TransactionType.UNFREEZE)
                .amount(bidAmount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .frozenBefore(frozenBefore)
                .frozenAfter(frozenAfter)
                .availableBefore(availableBefore)
                .availableAfter(availableAfter)
                .description("Unfrozen - outbid on: " + auction.getItemName())
                .relatedAuction(auction)
                .relatedBid(bid)
                .build();

        walletTransactionRepository.save(transaction);
        log.info("Unfreeze: User {} unfrozen ${}, Frozen: ${}, Available: ${}",
                userId, bidAmount, frozenAfter, availableAfter);

        return transaction;
    }

    /**
     * Deduct money when user wins auction
     */
    @Transactional
    public WalletTransaction deductForWin(Long userId, BigDecimal amount, Auction auction) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getFrozenBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient frozen balance");
        }

        BigDecimal balanceBefore = user.getBalance();
        BigDecimal frozenBefore = user.getFrozenBalance();
        BigDecimal availableBefore = user.getAvailableBalance();

        // Deduct from both total balance and frozen balance
        user.setBalance(user.getBalance().subtract(amount));
        user.setFrozenBalance(user.getFrozenBalance().subtract(amount));

        BigDecimal balanceAfter = user.getBalance();
        BigDecimal frozenAfter = user.getFrozenBalance();
        BigDecimal availableAfter = user.getAvailableBalance();

        userRepository.save(user);

        WalletTransaction transaction = WalletTransaction.builder()
                .user(user)
                .transactionType(WalletTransaction.TransactionType.DEDUCT)
                .amount(amount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .frozenBefore(frozenBefore)
                .frozenAfter(frozenAfter)
                .availableBefore(availableBefore)
                .availableAfter(availableAfter)
                .description("Payment for winning: " + auction.getItemName())
                .relatedAuction(auction)
                .build();

        walletTransactionRepository.save(transaction);
        log.info("Deduct: User {} paid ${} for auction win, Balance: ${}, Available: ${}",
                userId, amount, balanceAfter, availableAfter);

        return transaction;
    }

    /**
     * Get wallet transaction history
     */
    public List<WalletTransaction> getWalletHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return walletTransactionRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Withdraw money from wallet
     */
    @Transactional
    public WalletTransaction withdraw(Long userId, BigDecimal amount, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }

        if (user.getAvailableBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException(
                    String.format("Insufficient available balance. Available: $%s, Requested: $%s",
                            user.getAvailableBalance(), amount));
        }

        BigDecimal balanceBefore = user.getBalance();
        BigDecimal frozenBefore = user.getFrozenBalance();
        BigDecimal availableBefore = user.getAvailableBalance();

        user.setBalance(user.getBalance().subtract(amount));

        BigDecimal balanceAfter = user.getBalance();
        BigDecimal frozenAfter = user.getFrozenBalance();
        BigDecimal availableAfter = user.getAvailableBalance();

        userRepository.save(user);

        WalletTransaction transaction = WalletTransaction.builder()
                .user(user)
                .transactionType(WalletTransaction.TransactionType.WITHDRAW)
                .amount(amount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .frozenBefore(frozenBefore)
                .frozenAfter(frozenAfter)
                .availableBefore(availableBefore)
                .availableAfter(availableAfter)
                .description(description != null ? description : "Withdrawal from wallet")
                .build();

        walletTransactionRepository.save(transaction);
        log.info("Withdraw: User {} withdrew ${}, New balance: ${}, Available: ${}",
                userId, amount, balanceAfter, availableAfter);

        return transaction;
    }

    /**
     * Get wallet summary
     */
    public java.util.Map<String, Object> getWalletSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long totalDeposits = walletTransactionRepository
                .countByUserAndTransactionType(user, WalletTransaction.TransactionType.DEPOSIT);
        long totalFreezes = walletTransactionRepository
                .countByUserAndTransactionType(user, WalletTransaction.TransactionType.FREEZE);
        long totalDeductions = walletTransactionRepository
                .countByUserAndTransactionType(user, WalletTransaction.TransactionType.DEDUCT);

        return java.util.Map.of(
                "userId", userId,
                "totalBalance", user.getBalance(),
                "frozenBalance", user.getFrozenBalance(),
                "availableBalance", user.getAvailableBalance(),
                "totalDeposits", totalDeposits,
                "totalFreezes", totalFreezes,
                "totalDeductions", totalDeductions
        );
    }
}
