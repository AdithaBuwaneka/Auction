package com.auction.system.controller;

import com.auction.system.entity.Auction;
import com.auction.system.service.AuctionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Auction Controller
 * REST API endpoints for auction operations
 */
@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
@Slf4j
public class AuctionController {

    private final AuctionService auctionService;

    /**
     * Create a new auction
     * POST /api/auctions
     */
    @PostMapping
    public ResponseEntity<Auction> createAuction(@RequestBody Auction auction) {
        log.info("REST API: Create auction request - {}", auction.getItemName());
        try {
            Auction createdAuction = auctionService.createAuction(auction);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAuction);
        } catch (Exception e) {
            log.error("Error creating auction", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get all active auctions
     * GET /api/auctions/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<Auction>> getActiveAuctions() {
        log.info("REST API: Get active auctions");
        List<Auction> auctions = auctionService.getActiveAuctions();
        return ResponseEntity.ok(auctions);
    }

    /**
     * Get auction by ID
     * GET /api/auctions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Auction> getAuctionById(@PathVariable Long id) {
        log.info("REST API: Get auction by ID - {}", id);
        return auctionService.getAuctionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get auctions by seller
     * GET /api/auctions/seller/{sellerId}
     */
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Auction>> getAuctionsBySeller(@PathVariable Long sellerId) {
        log.info("REST API: Get auctions by seller - {}", sellerId);
        try {
            List<Auction> auctions = auctionService.getAuctionsBySeller(sellerId);
            return ResponseEntity.ok(auctions);
        } catch (Exception e) {
            log.error("Error fetching seller auctions", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Search auctions by keyword
     * GET /api/auctions/search?keyword=laptop
     */
    @GetMapping("/search")
    public ResponseEntity<List<Auction>> searchAuctions(@RequestParam String keyword) {
        log.info("REST API: Search auctions - keyword: {}", keyword);
        List<Auction> auctions = auctionService.searchAuctions(keyword);
        return ResponseEntity.ok(auctions);
    }

    /**
     * Update auction
     * PUT /api/auctions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAuction(@PathVariable Long id, @RequestBody Auction auction) {
        log.info("REST API: Update auction - {}", id);
        try {
            Auction updated = auctionService.updateAuction(id, auction);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating auction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to update auction"));
        }
    }

    /**
     * Delete auction
     * DELETE /api/auctions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAuction(@PathVariable Long id) {
        log.info("REST API: Delete auction - {}", id);
        try {
            auctionService.deleteAuction(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Auction deleted successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting auction", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("error", "Auction not found"));
        }
    }

    /**
     * Close auction manually
     * POST /api/auctions/{id}/close
     */
    @PostMapping("/{id}/close")
    public ResponseEntity<?> closeAuction(@PathVariable Long id) {
        log.info("REST API: Close auction - {}", id);
        try {
            Auction closed = auctionService.closeAuction(id);
            return ResponseEntity.ok(closed);
        } catch (Exception e) {
            log.error("Error closing auction", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get ended auctions
     * GET /api/auctions/ended
     */
    @GetMapping("/ended")
    public ResponseEntity<List<Auction>> getEndedAuctions() {
        log.info("REST API: Get ended auctions");
        List<Auction> auctions = auctionService.getEndedAuctions();
        return ResponseEntity.ok(auctions);
    }

    /**
     * Get my created auctions (requires authentication)
     * GET /api/auctions/my-auctions
     */
    @GetMapping("/my-auctions")
    public ResponseEntity<List<Auction>> getMyAuctions(@RequestHeader("Authorization") String token) {
        log.info("REST API: Get my auctions");
        try {
            // Extract user ID from JWT token
            Long userId = extractUserIdFromToken(token);
            List<Auction> auctions = auctionService.getAuctionsBySeller(userId);
            return ResponseEntity.ok(auctions);
        } catch (Exception e) {
            log.error("Error fetching my auctions", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Get current deadline for auction
     * GET /api/auctions/{id}/deadline
     */
    @GetMapping("/{id}/deadline")
    public ResponseEntity<?> getAuctionDeadline(@PathVariable Long id) {
        log.info("REST API: Get auction deadline - {}", id);
        try {
            java.time.LocalDateTime deadline = auctionService.getCurrentDeadline(id);
            return ResponseEntity.ok(java.util.Map.of(
                    "auctionId", id,
                    "currentDeadline", deadline.toString(),
                    "timestamp", java.time.LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("error", "Auction not found"));
        }
    }

    // Helper method to extract user ID from JWT token
    private Long extractUserIdFromToken(String token) {
        // Remove "Bearer " prefix
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        // In real implementation, decode JWT and extract userId
        // For now, returning a placeholder
        return 1L;
    }
}
