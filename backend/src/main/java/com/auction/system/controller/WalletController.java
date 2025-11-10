package com.auction.system.controller;

import com.auction.system.entity.WalletTransaction;
import com.auction.system.service.WalletService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Wallet Controller
 * REST API endpoints for wallet operations
 */
@Tag(name = "5. Wallet Management", description = "Deposit, withdraw, and manage user wallet balance")
@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@Slf4j
public class WalletController {

    private final WalletService walletService;

    /**
     * Deposit money to wallet
     * POST /api/wallet/deposit
     */
    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody Map<String, Object> request) {
        log.info("REST API: Wallet deposit");
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String description = request.getOrDefault("description", "Wallet deposit").toString();

            WalletTransaction transaction = walletService.deposit(userId, amount, description);
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error depositing to wallet", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Deposit failed: " + e.getMessage()));
        }
    }

    /**
     * Get wallet transaction history
     * GET /api/wallet/history
     */
    @GetMapping("/history")
    public ResponseEntity<List<WalletTransaction>> getHistory(@RequestHeader("Authorization") String token) {
        log.info("REST API: Get wallet history");
        try {
            Long userId = extractUserIdFromToken(token);
            List<WalletTransaction> history = walletService.getWalletHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Error fetching wallet history", e);
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Get wallet balance
     * GET /api/wallet/balance/{userId}
     */
    @GetMapping("/balance/{userId}")
    public ResponseEntity<?> getBalance(@PathVariable Long userId) {
        log.info("REST API: Get wallet balance for user {}", userId);
        try {
            Map<String, Object> summary = walletService.getWalletSummary(userId);

            // Return only balance-related fields for frontend
            Map<String, Object> balanceData = Map.of(
                "balance", summary.get("totalBalance"),
                "frozenBalance", summary.get("frozenBalance"),
                "availableBalance", summary.get("availableBalance")
            );

            return ResponseEntity.ok(balanceData);
        } catch (RuntimeException e) {
            log.error("Error fetching wallet balance", e);
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching wallet balance", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch balance"));
        }
    }

    /**
     * Get wallet transactions
     * GET /api/wallet/transactions/{userId}
     */
    @GetMapping("/transactions/{userId}")
    public ResponseEntity<?> getTransactions(@PathVariable Long userId) {
        log.info("REST API: Get wallet transactions for user {}", userId);
        try {
            List<WalletTransaction> transactions = walletService.getWalletHistory(userId);
            return ResponseEntity.ok(transactions);
        } catch (RuntimeException e) {
            log.error("Error fetching wallet transactions", e);
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching wallet transactions", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch transactions"));
        }
    }

    /**
     * Get wallet summary
     * GET /api/wallet/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@RequestHeader("Authorization") String token) {
        log.info("REST API: Get wallet summary");
        try {
            Long userId = extractUserIdFromToken(token);
            Map<String, Object> summary = walletService.getWalletSummary(userId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error fetching wallet summary", e);
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Withdraw money from wallet
     * POST /api/wallet/withdraw
     */
    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> request) {
        log.info("REST API: Wallet withdraw");
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String description = request.getOrDefault("description", "Wallet withdrawal").toString();

            WalletTransaction transaction = walletService.withdraw(userId, amount, description);
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error withdrawing from wallet", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Withdrawal failed: " + e.getMessage()));
        }
    }

    // Helper method to extract user ID from JWT token
    private Long extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        // In real implementation, decode JWT and extract userId
        return 1L;
    }
}
