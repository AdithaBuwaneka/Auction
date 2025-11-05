package com.auction.system.controller;

import com.auction.system.entity.Transaction;
import com.auction.system.service.TransactionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Transaction Controller
 * REST API endpoints for payment/transaction operations
 */
@Tag(name = "6. Transactions", description = "Payment processing and transaction history (secure via SSL:8443)")
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Process payment for auction (SSL/TLS secure)
     * POST /api/transactions/payment
     * Required fields: auctionId, buyerId, cardNumber, cvv
     */
    @PostMapping("/payment")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> paymentRequest) {
        log.info("REST API: Process payment");
        try {
            // Validate required fields
            if (!paymentRequest.containsKey("auctionId")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required field: auctionId"));
            }
            if (!paymentRequest.containsKey("buyerId")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required field: buyerId"));
            }
            if (!paymentRequest.containsKey("cardNumber")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required field: cardNumber"));
            }
            if (!paymentRequest.containsKey("cvv")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required field: cvv"));
            }

            Long auctionId = Long.valueOf(paymentRequest.get("auctionId").toString());
            Long buyerId = Long.valueOf(paymentRequest.get("buyerId").toString());
            String cardNumber = paymentRequest.get("cardNumber").toString();
            String cvv = paymentRequest.get("cvv").toString();

            Transaction transaction = transactionService.processPayment(auctionId, buyerId, cardNumber, cvv);
            return ResponseEntity.ok(transaction);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error processing payment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment processing failed: " + e.getMessage()));
        }
    }

    /**
     * Get user's transaction history
     * GET /api/transactions/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable Long userId) {
        log.info("REST API: Get user transactions - {}", userId);
        try {
            List<Transaction> transactions = transactionService.getUserTransactions(userId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error fetching user transactions", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get transaction for specific auction
     * GET /api/transactions/auction/{auctionId}
     */
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<?> getAuctionTransaction(@PathVariable Long auctionId) {
        log.info("REST API: Get auction transaction - {}", auctionId);
        try {
            Transaction transaction = transactionService.getAuctionTransaction(auctionId);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Transaction not found"));
        }
    }
}
