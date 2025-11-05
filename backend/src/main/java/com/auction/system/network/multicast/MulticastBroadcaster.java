package com.auction.system.network.multicast;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.DatagramPacket;
import java.net.InetAddress;
import java.net.MulticastSocket;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * UDP Multicast Broadcaster (Member 3)
 *
 * Broadcasts auction price updates to all subscribed clients
 * using UDP multicast on group 230.0.0.1:4446
 *
 * Network Concepts Demonstrated:
 * - UDP Multicast for one-to-many communication
 * - DatagramSocket and DatagramPacket
 * - Multicast group membership
 * - Connectionless broadcasting
 * - Efficient real-time updates to multiple clients
 */
@Component
@Slf4j
public class MulticastBroadcaster {

    @Value("${multicast.group.address:230.0.0.1}")
    private String groupAddress;

    @Value("${multicast.port:4446}")
    private int port;

    private MulticastSocket socket;
    private InetAddress group;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Monitoring fields
    private final AtomicLong totalBroadcasts = new AtomicLong(0);
    private final AtomicLong priceUpdates = new AtomicLong(0);
    private final AtomicLong statusUpdates = new AtomicLong(0);
    private final List<BroadcastLog> recentBroadcasts = Collections.synchronizedList(new ArrayList<>());
    private long initTime;

    /**
     * Initialize multicast socket
     */
    public void initialize() {
        try {
            socket = new MulticastSocket();
            group = InetAddress.getByName(groupAddress);
            initTime = System.currentTimeMillis();

            log.info("╔═══════════════════════════════════════════════════════════╗");
            log.info("║  UDP MULTICAST BROADCASTER INITIALIZED (Member 3)        ║");
            log.info("║  Group: {}:{}                                   ║", groupAddress, port);
            log.info("║  Ready to broadcast auction updates!                     ║");
            log.info("╚═══════════════════════════════════════════════════════════╝");
        } catch (IOException e) {
            log.error("Failed to initialize multicast broadcaster", e);
        }
    }

    /**
     * Broadcast auction price update to all subscribers
     */
    public void broadcastPriceUpdate(Long auctionId, String itemName, BigDecimal newPrice,
                                     Long bidderId, String bidderName) {
        if (socket == null) {
            initialize();
        }

        try {
            // Create update message
            PriceUpdateMessage message = new PriceUpdateMessage();
            message.setAuctionId(auctionId);
            message.setItemName(itemName);
            message.setNewPrice(newPrice);
            message.setBidderId(bidderId);
            message.setBidderName(bidderName);
            message.setTimestamp(LocalDateTime.now().toString());
            message.setMessageType("PRICE_UPDATE");

            // Convert to JSON
            String json = objectMapper.writeValueAsString(message);
            byte[] data = json.getBytes();

            // Create and send datagram packet
            DatagramPacket packet = new DatagramPacket(data, data.length, group, port);
            socket.send(packet);

            // Track broadcast
            totalBroadcasts.incrementAndGet();
            priceUpdates.incrementAndGet();
            logBroadcast("PRICE_UPDATE", auctionId, itemName, newPrice.toString());

            log.info("📡 MULTICAST SENT: Auction {} - {} = ${} (by {})",
                    auctionId, itemName, newPrice, bidderName);

        } catch (Exception e) {
            log.error("Error broadcasting price update", e);
        }
    }

    /**
     * Broadcast auction status change
     */
    public void broadcastStatusUpdate(Long auctionId, String itemName, String status, String message) {
        if (socket == null) {
            initialize();
        }

        try {
            StatusUpdateMessage updateMessage = new StatusUpdateMessage();
            updateMessage.setAuctionId(auctionId);
            updateMessage.setItemName(itemName);
            updateMessage.setStatus(status);
            updateMessage.setMessage(message);
            updateMessage.setTimestamp(LocalDateTime.now().toString());
            updateMessage.setMessageType("STATUS_UPDATE");

            String json = objectMapper.writeValueAsString(updateMessage);
            byte[] data = json.getBytes();

            DatagramPacket packet = new DatagramPacket(data, data.length, group, port);
            socket.send(packet);

            // Track broadcast
            totalBroadcasts.incrementAndGet();
            statusUpdates.incrementAndGet();
            logBroadcast("STATUS_UPDATE", auctionId, itemName, status);

            log.info("📡 MULTICAST SENT: Auction {} - Status: {}", auctionId, status);

        } catch (Exception e) {
            log.error("Error broadcasting status update", e);
        }
    }

    /**
     * Shutdown multicast broadcaster
     */
    public void shutdown() {
        if (socket != null && !socket.isClosed()) {
            socket.close();
            log.info("UDP Multicast Broadcaster stopped");
        }
    }

    /**
     * Price Update Message DTO
     */
    @Data
    public static class PriceUpdateMessage {
        private String messageType;
        private Long auctionId;
        private String itemName;
        private BigDecimal newPrice;
        private Long bidderId;
        private String bidderName;
        private String timestamp;
    }

    /**
     * Status Update Message DTO
     */
    @Data
    public static class StatusUpdateMessage {
        private String messageType;
        private Long auctionId;
        private String itemName;
        private String status;
        private String message;
        private String timestamp;
    }

    // ========== Monitoring Methods ==========

    public long getTotalBroadcasts() {
        return totalBroadcasts.get();
    }

    public long getPriceUpdates() {
        return priceUpdates.get();
    }

    public long getStatusUpdates() {
        return statusUpdates.get();
    }

    public String getMulticastGroup() {
        return groupAddress + ":" + port;
    }

    public boolean isInitialized() {
        return socket != null && !socket.isClosed();
    }

    public long getUptimeMillis() {
        return initTime > 0 ? System.currentTimeMillis() - initTime : 0;
    }

    public List<Map<String, Object>> getRecentBroadcasts() {
        List<Map<String, Object>> broadcasts = new ArrayList<>();
        synchronized (recentBroadcasts) {
            recentBroadcasts.forEach(log -> {
                Map<String, Object> broadcast = new HashMap<>();
                broadcast.put("type", log.getType());
                broadcast.put("auctionId", log.getAuctionId());
                broadcast.put("itemName", log.getItemName());
                broadcast.put("details", log.getDetails());
                broadcast.put("timestamp", log.getTimestamp().toString());
                broadcasts.add(broadcast);
            });
        }
        return broadcasts;
    }

    private void logBroadcast(String type, Long auctionId, String itemName, String details) {
        synchronized (recentBroadcasts) {
            recentBroadcasts.add(new BroadcastLog(type, auctionId, itemName, details, LocalDateTime.now()));
            // Keep only last 100
            if (recentBroadcasts.size() > 100) {
                recentBroadcasts.remove(0);
            }
        }
    }

    @Data
    @lombok.AllArgsConstructor
    private static class BroadcastLog {
        private String type;
        private Long auctionId;
        private String itemName;
        private String details;
        private LocalDateTime timestamp;
    }
}
