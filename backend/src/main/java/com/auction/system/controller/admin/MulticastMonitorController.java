package com.auction.system.controller.admin;

import com.auction.system.network.multicast.MulticastBroadcaster;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Multicast Monitor Controller
 * Admin endpoints for monitoring multicast broadcasts
 * Member 3's Feature
 */
@RestController
@RequestMapping("/api/admin/multicast")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class MulticastMonitorController {

    private final MulticastBroadcaster multicastBroadcaster;

    /**
     * Get multicast broadcasts log
     * GET /api/admin/multicast/broadcasts
     */
    @GetMapping("/broadcasts")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getBroadcasts() {
        log.info("Admin: Get multicast broadcasts");

        Map<String, Object> response = new HashMap<>();
        response.put("recentBroadcasts", multicastBroadcaster.getRecentBroadcasts());
        response.put("count", multicastBroadcaster.getRecentBroadcasts().size());

        return response;
    }

    /**
     * Get multicast statistics
     * GET /api/admin/multicast/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getMulticastStats() {
        log.info("Admin: Get multicast stats");

        Map<String, Object> stats = new HashMap<>();
        stats.put("multicastGroup", multicastBroadcaster.getMulticastGroup());
        stats.put("initialized", multicastBroadcaster.isInitialized());
        stats.put("totalBroadcasts", multicastBroadcaster.getTotalBroadcasts());
        stats.put("priceUpdates", multicastBroadcaster.getPriceUpdates());
        stats.put("statusUpdates", multicastBroadcaster.getStatusUpdates());
        stats.put("uptime", multicastBroadcaster.getUptimeMillis());

        // Calculate breakdown
        Map<String, Long> breakdown = new HashMap<>();
        breakdown.put("PRICE_UPDATE", multicastBroadcaster.getPriceUpdates());
        breakdown.put("STATUS_UPDATE", multicastBroadcaster.getStatusUpdates());
        stats.put("messageTypes", breakdown);

        return stats;
    }
}
