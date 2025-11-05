package com.auction.system.controller;

import com.auction.system.dto.BidRequest;
import com.auction.system.dto.BidResponse;
import com.auction.system.entity.Bid;
import com.auction.system.service.BidService;
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
}
