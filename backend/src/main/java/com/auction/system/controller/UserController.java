package com.auction.system.controller;

import com.auction.system.entity.User;
import com.auction.system.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * User Controller
 * REST API endpoints for user operations
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "2. User Management", description = "User profile and account management")
public class UserController {

    private final UserService userService;

    /**
     * Register a new user
     * POST /api/users/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        log.info("REST API: Register user request - {}", user.getUsername());
        try {
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
        } catch (Exception e) {
            log.error("Error registering user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * Login user (simplified authentication)
     * POST /api/users/login
     */
    @PostMapping("/login")
    public ResponseEntity<User> loginUser(@RequestBody LoginRequest loginRequest) {
        log.info("REST API: Login request - {}", loginRequest.getUsername());
        return userService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        log.info("REST API: Get user by ID - {}", id);
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get user by username
     * GET /api/users/username/{username}
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        log.info("REST API: Get user by username - {}", username);
        return userService.getUserByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all active users
     * GET /api/users/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<User>> getAllActiveUsers() {
        log.info("REST API: Get all active users");
        List<User> users = userService.getAllActiveUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Update user profile
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userUpdate) {
        log.info("REST API: Update user - {}", id);
        try {
            User updated = userService.updateUser(id, userUpdate);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get logged-in user's auctions
     * GET /api/users/me/auctions
     */
    @GetMapping("/me/auctions")
    public ResponseEntity<?> getMyAuctions(@RequestHeader("Authorization") String token) {
        log.info("REST API: Get my auctions");
        try {
            Long userId = extractUserIdFromToken(token);
            List<?> auctions = userService.getUserAuctions(userId);
            return ResponseEntity.ok(auctions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Unauthorized"));
        }
    }

    /**
     * Get logged-in user's bids
     * GET /api/users/me/bids
     */
    @GetMapping("/me/bids")
    public ResponseEntity<?> getMyBids(@RequestHeader("Authorization") String token) {
        log.info("REST API: Get my bids");
        try {
            Long userId = extractUserIdFromToken(token);
            List<?> bids = userService.getUserBids(userId);
            return ResponseEntity.ok(bids);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Unauthorized"));
        }
    }

    /**
     * Top-up user balance
     * POST /api/users/me/balance
     */
    @PostMapping("/me/balance")
    public ResponseEntity<?> addBalance(@RequestHeader("Authorization") String token,
                                       @RequestBody java.util.Map<String, Object> request) {
        log.info("REST API: Add balance");
        try {
            Long userId = extractUserIdFromToken(token);
            java.math.BigDecimal amount = new java.math.BigDecimal(request.get("amount").toString());
            User updated = userService.addBalance(userId, amount);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getMessage()));
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

    /**
     * Login Request DTO
     */
    @lombok.Data
    public static class LoginRequest {
        private String username;
        private String password;
    }
}
