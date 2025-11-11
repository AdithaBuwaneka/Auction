package com.auction.system.controller.admin;

import com.auction.system.entity.User;
import com.auction.system.entity.WalletTransaction;
import com.auction.system.service.AdminService;
import com.auction.system.service.WalletService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin Controller
 * Admin-only endpoints for user management and statistics
 */
@Tag(name = "9. Admin", description = "Admin-only endpoints (requires ADMIN role)")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final WalletService walletService;

    /**
     * Get all users
     * GET /api/admin/users
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("Admin: Get all users");
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Ban a user
     * PUT /api/admin/users/{id}/ban
     */
    @PutMapping("/users/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> banUser(@PathVariable Long id) {
        log.info("Admin: Ban user - {}", id);
        try {
            User user = adminService.banUser(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get dashboard statistics
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        log.info("Admin: Get dashboard statistics");
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all wallet transactions (Admin only)
     * GET /api/admin/wallet/transactions
     */
    @GetMapping("/wallet/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WalletTransaction>> getAllWalletTransactions() {
        log.info("Admin: Get all wallet transactions");
        List<WalletTransaction> transactions = walletService.getAllWalletTransactions();
        return ResponseEntity.ok(transactions);
    }
}
