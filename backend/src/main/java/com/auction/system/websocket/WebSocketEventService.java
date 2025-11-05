package com.auction.system.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * WebSocket Event Service
 * Broadcasts real-time events to connected clients
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast new bid event to all clients watching an auction
     */
    public void broadcastNewBid(Long auctionId, Map<String, Object> bidData) {
        String destination = "/topic/auction/" + auctionId;
        log.info("Broadcasting new bid to {}: {}", destination, bidData);
        messagingTemplate.convertAndSend(destination, Map.of(
                "type", "NEW_BID",
                "data", bidData
        ));
    }

    /**
     * Broadcast auction update (price, deadline, status change)
     */
    public void broadcastAuctionUpdate(Long auctionId, Map<String, Object> auctionData) {
        String destination = "/topic/auction/" + auctionId;
        log.info("Broadcasting auction update to {}", destination);
        messagingTemplate.convertAndSend(destination, Map.of(
                "type", "AUCTION_UPDATE",
                "data", auctionData
        ));
    }

    /**
     * Broadcast auction ended event
     */
    public void broadcastAuctionEnded(Long auctionId, Map<String, Object> resultData) {
        String destination = "/topic/auction/" + auctionId;
        log.info("Broadcasting auction ended to {}", destination);
        messagingTemplate.convertAndSend(destination, Map.of(
                "type", "AUCTION_ENDED",
                "data", resultData
        ));
    }

    /**
     * Send personal notification to specific user
     */
    public void sendUserNotification(Long userId, Map<String, Object> notification) {
        String destination = "/topic/user/" + userId;
        log.info("Sending notification to user {}", userId);
        messagingTemplate.convertAndSend(destination, Map.of(
                "type", "NOTIFICATION",
                "data", notification
        ));
    }

    /**
     * Broadcast system-wide announcement
     */
    public void broadcastSystemAnnouncement(String message) {
        log.info("Broadcasting system announcement: {}", message);
        messagingTemplate.convertAndSend("/topic/system", Map.of(
                "type", "ANNOUNCEMENT",
                "message", message
        ));
    }
}
