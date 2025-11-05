package com.auction.system.controller;

import com.auction.system.dto.BidRequest;
import com.auction.system.dto.BidResponse;
import com.auction.system.entity.Bid;
import com.auction.system.service.BidService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Bid Controller
 * REST API endpoints for bidding operations
 *
 * Note: This is the REST API layer. The actual TCP socket-based
 * bidding will be handled by Member 1's TCP server implementation.
 */
@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "4. Bidding", description = "Place and view bids on auctions (also available via TCP:8081, NIO:8082)")
public class BidController {

    private final BidService bidService;

    /**
     * Place a bid on an auction
     * POST /api/bids
     *
     * This endpoint can be used by the frontend.
     * Member 1 will create a separate TCP socket server for bidding.
     */
    @PostMapping
    public ResponseEntity<BidResponse> placeBid(@Valid @RequestBody BidRequest bidRequest) {
        log.info("REST API: Place bid request - Auction: {}, Bidder: {}, Amount: {}",
                bidRequest.getAuctionId(), bidRequest.getBidderId(), bidRequest.getBidAmount());

        BidResponse response = bidService.placeBid(bidRequest);

        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get all bids for a specific auction
     * GET /api/bids/auction/{auctionId}
     */
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<Bid>> getBidsForAuction(@PathVariable Long auctionId) {
        log.info("REST API: Get bids for auction - {}", auctionId);
        try {
            List<Bid> bids = bidService.getBidsForAuction(auctionId);
            return ResponseEntity.ok(bids);
        } catch (Exception e) {
            log.error("Error fetching bids for auction", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all bids by a specific user
     * GET /api/bids/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Bid>> getBidsByUser(@PathVariable Long userId) {
        log.info("REST API: Get bids by user - {}", userId);
        try {
            List<Bid> bids = bidService.getBidsByUser(userId);
            return ResponseEntity.ok(bids);
        } catch (Exception e) {
            log.error("Error fetching user bids", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get my bids (requires authentication)
     * GET /api/bids/my-bids
     */
    @GetMapping("/my-bids")
    public ResponseEntity<List<Bid>> getMyBids(@RequestHeader("Authorization") String token) {
        log.info("REST API: Get my bids");
        try {
            Long userId = extractUserIdFromToken(token);
            List<Bid> bids = bidService.getBidsByUser(userId);
            return ResponseEntity.ok(bids);
        } catch (Exception e) {
            log.error("Error fetching my bids", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Retract a bid (within 1 minute window)
     * DELETE /api/bids/{bidId}
     */
    @DeleteMapping("/{bidId}")
    public ResponseEntity<?> retractBid(@PathVariable Long bidId) {
        log.info("REST API: Retract bid - {}", bidId);
        try {
            bidService.retractBid(bidId);
            return ResponseEntity.ok(java.util.Map.of("message", "Bid retracted successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error retracting bid", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("error", "Bid not found"));
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
