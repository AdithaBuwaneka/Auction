package com.auction.system.service;

import com.auction.system.entity.User;
import com.auction.system.repository.AuctionRepository;
import com.auction.system.repository.BidRepository;
import com.auction.system.repository.TransactionRepository;
import com.auction.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Service
 * Handles admin operations like user management and statistics
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Ban a user
     */
    @Transactional
    public User banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(false);
        userRepository.save(user);
        log.info("User banned - ID: {}", userId);

        return user;
    }

    /**
     * Get dashboard statistics
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // User statistics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findByIsActive(true).size();

        // Auction statistics
        long totalAuctions = auctionRepository.count();
        long activeAuctions = auctionRepository.findAllActiveAuctions().size();

        // Bid statistics
        long totalBids = bidRepository.count();

        // Transaction statistics (optional - may not have all transactions)
        long totalTransactions = 0;
        try {
            totalTransactions = transactionRepository.count();
        } catch (Exception e) {
            log.warn("Could not fetch transaction count", e);
        }

        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("totalAuctions", totalAuctions);
        stats.put("activeAuctions", activeAuctions);
        stats.put("totalBids", totalBids);
        stats.put("totalTransactions", totalTransactions);
        stats.put("timestamp", java.time.LocalDateTime.now().toString());

        return stats;
    }
}
