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
    private final com.auction.system.repository.TransactionRepository transactionRepository;

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
     * Freeze amount when user places bid
     */
    @Transactional
    public WalletTransaction freezeAmount(Long userId, BigDecimal amount, String description,
                                          Long auctionId, Long bidId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Freeze amount must be positive");
        }

        if (user.getAvailableBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient available balance");
        }

        BigDecimal balanceBefore = user.getBalance();
        BigDecimal frozenBefore = user.getFrozenBalance();
        BigDecimal availableBefore = user.getAvailableBalance();

        user.setFrozenBalance(user.getFrozenBalance().add(amount));

        BigDecimal balanceAfter = user.getBalance();
        BigDecimal frozenAfter = user.getFrozenBalance();
        BigDecimal availableAfter = user.getAvailableBalance();

        userRepository.save(user);

        WalletTransaction transaction = WalletTransaction.builder()
                .user(user)
                .transactionType(WalletTransaction.TransactionType.FREEZE)
                .amount(amount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .frozenBefore(frozenBefore)
                .frozenAfter(frozenAfter)
                .availableBefore(availableBefore)
                .availableAfter(availableAfter)
                .description(description != null ? description : "Amount frozen for bid")
                .build();

        walletTransactionRepository.save(transaction);
        log.info("Freeze: User {} froze ${}, Frozen: {} -> {}, Available: {} -> {}",
                userId, amount, frozenBefore, frozenAfter, availableBefore, availableAfter);

        return transaction;
    }

    /**
     * Unfreeze amount when user is outbid or bid is retracted
     */
    @Transactional
    public WalletTransaction unfreezeAmount(Long userId, BigDecimal amount, String description,
                                            Long auctionId, Long bidId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Unfreeze amount must be positive");
        }

        if (user.getFrozenBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient frozen balance");
        }

        BigDecimal balanceBefore = user.getBalance();
        BigDecimal frozenBefore = user.getFrozenBalance();
        BigDecimal availableBefore = user.getAvailableBalance();

        user.setFrozenBalance(user.getFrozenBalance().subtract(amount));

        BigDecimal balanceAfter = user.getBalance();
        BigDecimal frozenAfter = user.getFrozenBalance();
        BigDecimal availableAfter = user.getAvailableBalance();

        userRepository.save(user);

        WalletTransaction transaction = WalletTransaction.builder()
                .user(user)
                .transactionType(WalletTransaction.TransactionType.UNFREEZE)
                .amount(amount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .frozenBefore(frozenBefore)
                .frozenAfter(frozenAfter)
                .availableBefore(availableBefore)
                .availableAfter(availableAfter)
                .description(description != null ? description : "Amount unfrozen")
                .build();

        walletTransactionRepository.save(transaction);
        log.info("Unfreeze: User {} unfroze ${}, Frozen: {} -> {}, Available: {} -> {}",
                userId, amount, frozenBefore, frozenAfter, availableBefore, availableAfter);

        return transaction;
    }

    /**
     * Deduct frozen amount when auction ends (winner pays)
     */
    @Transactional
    public WalletTransaction deductFrozenAmount(Long userId, BigDecimal amount, String description,
                                                Long auctionId, Long bidId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deduct amount must be positive");
        }

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
                .description(description != null ? description : "Payment for auction")
                .build();

        walletTransactionRepository.save(transaction);
        log.info("Deduct: User {} paid ${}, Balance: {} -> {}, Frozen: {} -> {}",
                userId, amount, balanceBefore, balanceAfter, frozenBefore, frozenAfter);

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

    /**
     * Process auction completion payment with 20% admin fee and 80% to seller
     * Creates 3 transactions:
     * 1. BUYER_PAYMENT - Deduct full amount from buyer
     * 2. SYSTEM_FEE - Add 20% to admin
     * 3. SELLER_PAYMENT - Add 80% to seller
     */
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public java.util.Map<String, WalletTransaction> processAuctionPayment(
            Long buyerId, Long sellerId, BigDecimal finalPrice, Auction auction) {

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        // Find admin user (userId = 4 based on your data)
        User admin = userRepository.findById(4L)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        // Calculate split: 20% admin, 80% seller
        BigDecimal adminFee = finalPrice.multiply(new BigDecimal("0.20"));
        BigDecimal sellerPayment = finalPrice.multiply(new BigDecimal("0.80"));

        // 1. Deduct full amount from buyer (from frozen balance)
        if (buyer.getFrozenBalance().compareTo(finalPrice) < 0) {
            throw new IllegalArgumentException("Buyer has insufficient frozen balance");
        }

        BigDecimal buyerBalanceBefore = buyer.getBalance();
        BigDecimal buyerFrozenBefore = buyer.getFrozenBalance();
        BigDecimal buyerAvailableBefore = buyer.getAvailableBalance();

        buyer.setBalance(buyer.getBalance().subtract(finalPrice));
        buyer.setFrozenBalance(buyer.getFrozenBalance().subtract(finalPrice));

        BigDecimal buyerBalanceAfter = buyer.getBalance();
        BigDecimal buyerFrozenAfter = buyer.getFrozenBalance();
        BigDecimal buyerAvailableAfter = buyer.getAvailableBalance();

        userRepository.save(buyer);

        WalletTransaction buyerTransaction = WalletTransaction.builder()
                .user(buyer)
                .transactionType(WalletTransaction.TransactionType.BUYER_PAYMENT)
                .amount(finalPrice)
                .balanceBefore(buyerBalanceBefore)
                .balanceAfter(buyerBalanceAfter)
                .frozenBefore(buyerFrozenBefore)
                .frozenAfter(buyerFrozenAfter)
                .availableBefore(buyerAvailableBefore)
                .availableAfter(buyerAvailableAfter)
                .description("Payment for winning auction #" + auction.getAuctionId() + ": " + auction.getItemName())
                .build();

        walletTransactionRepository.save(buyerTransaction);
        log.info("Buyer {} paid ${} for auction {}", buyerId, finalPrice, auction.getAuctionId());

        // 2. Add 20% admin fee
        BigDecimal adminBalanceBefore = admin.getBalance();
        BigDecimal adminFrozenBefore = admin.getFrozenBalance();
        BigDecimal adminAvailableBefore = admin.getAvailableBalance();

        admin.setBalance(admin.getBalance().add(adminFee));

        BigDecimal adminBalanceAfter = admin.getBalance();
        BigDecimal adminFrozenAfter = admin.getFrozenBalance();
        BigDecimal adminAvailableAfter = admin.getAvailableBalance();

        userRepository.save(admin);

        WalletTransaction adminTransaction = WalletTransaction.builder()
                .user(admin)
                .transactionType(WalletTransaction.TransactionType.SYSTEM_FEE)
                .amount(adminFee)
                .balanceBefore(adminBalanceBefore)
                .balanceAfter(adminBalanceAfter)
                .frozenBefore(adminFrozenBefore)
                .frozenAfter(adminFrozenAfter)
                .availableBefore(adminAvailableBefore)
                .availableAfter(adminAvailableAfter)
                .description("System fee (20%) from auction #" + auction.getAuctionId() + ": " + auction.getItemName())
                .build();

        walletTransactionRepository.save(adminTransaction);
        log.info("Admin receives ${} (20% fee) from auction {}", adminFee, auction.getAuctionId());

        // 3. Add 80% to seller
        BigDecimal sellerBalanceBefore = seller.getBalance();
        BigDecimal sellerFrozenBefore = seller.getFrozenBalance();
        BigDecimal sellerAvailableBefore = seller.getAvailableBalance();

        seller.setBalance(seller.getBalance().add(sellerPayment));

        BigDecimal sellerBalanceAfter = seller.getBalance();
        BigDecimal sellerFrozenAfter = seller.getFrozenBalance();
        BigDecimal sellerAvailableAfter = seller.getAvailableBalance();

        userRepository.save(seller);

        WalletTransaction sellerTransaction = WalletTransaction.builder()
                .user(seller)
                .transactionType(WalletTransaction.TransactionType.SELLER_PAYMENT)
                .amount(sellerPayment)
                .balanceBefore(sellerBalanceBefore)
                .balanceAfter(sellerBalanceAfter)
                .frozenBefore(sellerFrozenBefore)
                .frozenAfter(sellerFrozenAfter)
                .availableBefore(sellerAvailableBefore)
                .availableAfter(sellerAvailableAfter)
                .description("Payment received (80%) for auction #" + auction.getAuctionId() + ": " + auction.getItemName())
                .build();

        walletTransactionRepository.save(sellerTransaction);
        log.info("Seller {} receives ${} (80%) from auction {}", sellerId, sellerPayment, auction.getAuctionId());

        // 4. Create main Transaction record (buyer -> seller)
        Transaction mainTransaction = Transaction.builder()
                .buyer(buyer)
                .seller(seller)
                .auction(auction)
                .amount(finalPrice)
                .paymentMethod("WALLET")
                .status(Transaction.TransactionStatus.COMPLETED)
                .build();

        transactionRepository.save(mainTransaction);
        log.info("Transaction record created for auction {} - Buyer: {}, Seller: {}, Amount: ${}",
                auction.getAuctionId(), buyerId, sellerId, finalPrice);

        return java.util.Map.of(
                "buyerTransaction", buyerTransaction,
                "adminTransaction", adminTransaction,
                "sellerTransaction", sellerTransaction
        );
    }

    /**
     * Get all wallet transactions (Admin only)
     */
    public List<WalletTransaction> getAllWalletTransactions() {
        return walletTransactionRepository.findAllByOrderByCreatedAtDesc();
    }
}
