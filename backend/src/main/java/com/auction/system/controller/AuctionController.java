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
}
