package com.auction.system.controller.admin;

import com.auction.system.network.tcp.TCPBidServer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * TCP Monitor Controller
 * Admin endpoints for monitoring TCP connections
 * Member 1's Feature
 */
@RestController
@RequestMapping("/api/admin/tcp")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TcpMonitorController {

    private final TCPBidServer tcpBidServer;

    /**
     * Get active TCP connections
     * GET /api/admin/tcp/connections
     */
    @GetMapping("/connections")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getActiveConnections() {
        log.info("Admin: Get TCP connections");

        Map<String, Object> response = new HashMap<>();
        response.put("activeConnections", tcpBidServer.getActiveConnectionCount());
        response.put("totalConnections", tcpBidServer.getTotalConnectionCount());
        response.put("connections", tcpBidServer.getConnectionDetails());
        response.put("timestamp", System.currentTimeMillis());

        return response;
    }

    /**
     * Get TCP statistics
     * GET /api/admin/tcp/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getTcpStats() {
        log.info("Admin: Get TCP stats");

        Map<String, Object> stats = new HashMap<>();
        stats.put("serverPort", 8081);
        stats.put("serverStatus", tcpBidServer.isRunning() ? "RUNNING" : "STOPPED");
        stats.put("activeConnections", tcpBidServer.getActiveConnectionCount());
        stats.put("totalConnectionsServed", tcpBidServer.getTotalConnectionCount());
        stats.put("bidsProcessed", tcpBidServer.getBidsProcessed());
        stats.put("uptime", tcpBidServer.getUptimeMillis());
        stats.put("averageResponseTime", tcpBidServer.getAverageResponseTime());

        return stats;
    }

    /**
     * Get recent TCP activity log
     * GET /api/admin/tcp/activity
     */
    @GetMapping("/activity")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getActivityLog() {
        log.info("Admin: Get TCP activity log");

        Map<String, Object> response = new HashMap<>();
        response.put("recentActivity", tcpBidServer.getRecentActivity());
        response.put("count", tcpBidServer.getRecentActivity().size());

        return response;
    }
}
