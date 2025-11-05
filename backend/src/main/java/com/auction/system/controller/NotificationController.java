package com.auction.system.controller;

import com.auction.system.entity.Notification;
import com.auction.system.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Notification Controller
 * REST API endpoints for user notifications
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get user notifications
     * GET /api/notifications
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestHeader("Authorization") String token) {
        log.info("REST API: Get notifications");
        try {
            Long userId = extractUserIdFromToken(token);
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error getting notifications", e);
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Mark notification as read
     * PUT /api/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        log.info("REST API: Mark notification as read - {}", id);
        try {
            Notification updated = notificationService.markAsRead(id);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Notification not found"));
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
