package com.auction.system.controller;

import com.auction.system.entity.Notification;
import com.auction.system.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "7. Notifications", description = "Real-time notifications (also via WebSocket and Multicast:4446)")
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
     * Get user notifications by user ID
     * GET /api/notifications/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        log.info("REST API: Get notifications for user - {}", userId);
        try {
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error getting user notifications", e);
            return ResponseEntity.status(404).build();
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

    /**
     * Delete a notification
     * DELETE /api/notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        log.info("REST API: Delete notification - {}", id);
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting notification", e);
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Notification not found"));
        }
    }

    /**
     * Clear all notifications for a user
     * DELETE /api/notifications/user/{userId}/clear
     */
    @DeleteMapping("/user/{userId}/clear")
    public ResponseEntity<?> clearAllNotifications(@PathVariable Long userId) {
        log.info("REST API: Clear all notifications for user - {}", userId);
        try {
            notificationService.clearAllNotifications(userId);
            return ResponseEntity.ok(Map.of("message", "All notifications cleared successfully"));
        } catch (Exception e) {
            log.error("Error clearing notifications", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to clear notifications"));
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
