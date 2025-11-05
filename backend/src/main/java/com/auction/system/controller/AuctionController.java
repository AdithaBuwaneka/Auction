package com.auction.system.controller;

import com.auction.system.dto.AuctionCreateRequest;
import com.auction.system.entity.Auction;
import com.auction.system.entity.User;
import com.auction.system.repository.UserRepository;
import com.auction.system.service.AuctionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Auction Controller
 * REST API endpoints for auction operations
 */
@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "3. Auction Management", description = "Create, view, update, and manage auctions")
public class AuctionController {

    private final AuctionService auctionService;
    private final UserRepository userRepository;

    /**
     * Create a new auction
     * POST /api/auctions
     */
    @PostMapping
    public ResponseEntity<?> createAuction(@RequestBody AuctionCreateRequest request) {
        log.info("REST API: Create auction request - {}", request.getItemName());
        try {
            // Validate request
            if (request.getItemName() == null || request.getItemName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Item name is required"));
            }
            if (request.getStartingPrice() == null || request.getStartingPrice().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Starting price must be greater than 0"));
            }
            if (request.getSellerId() == null) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Seller ID is required"));
            }

            // Get seller
            User seller = userRepository.findById(request.getSellerId())
                    .orElseThrow(() -> new RuntimeException("Seller not found with ID: " + request.getSellerId()));

            // Parse dates
            LocalDateTime startTime = request.getStartTime() != null
                    ? LocalDateTime.parse(request.getStartTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                    : LocalDateTime.now();

            LocalDateTime mandatoryEndTime = LocalDateTime.parse(
                    request.getMandatoryEndTime(),
                    DateTimeFormatter.ISO_LOCAL_DATE_TIME
            );

            // Validate dates
            if (mandatoryEndTime.isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Mandatory end time must be in the future"));
            }
            if (mandatoryEndTime.isBefore(startTime)) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Mandatory end time must be after start time"));
            }

            // Build auction
            Auction auction = Auction.builder()
                    .itemName(request.getItemName())
                    .description(request.getDescription())
                    .imageUrl(request.getImageUrl())
                    .startingPrice(request.getStartingPrice())
                    .seller(seller)
                    .startTime(startTime)
                    .mandatoryEndTime(mandatoryEndTime)
                    .bidGapDuration(Duration.ofSeconds(request.getBidGapDurationSeconds() != null ? request.getBidGapDurationSeconds() : 120))
                    .build();

            Auction createdAuction = auctionService.createAuction(auction);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAuction);
        } catch (Exception e) {
            log.error("Error creating auction", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getMessage()));
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

    /**
     * Extend auction deadline (Admin only)
     * POST /api/auctions/{id}/extend
     */
    @PostMapping("/{id}/extend")
    public ResponseEntity<?> extendDeadline(@PathVariable Long id,
                                           @RequestBody java.util.Map<String, Object> request) {
        log.info("REST API: Extend auction deadline - {}", id);
        try {
            int hours = Integer.parseInt(request.get("hours").toString());
            Auction extended = auctionService.extendDeadline(id, hours);
            return ResponseEntity.ok(extended);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getMessage()));
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
