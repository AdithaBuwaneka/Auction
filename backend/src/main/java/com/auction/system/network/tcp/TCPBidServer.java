package com.auction.system.network.tcp;

import com.auction.system.dto.BidRequest;
import com.auction.system.dto.BidResponse;
import com.auction.system.service.BidService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * TCP Socket Server for Bidding (Member 1)
 *
 * Implements TCP socket-based bidding system on port 8081
 * - Accepts client connections
 * - Receives bid requests in JSON format
 * - Validates and processes bids
 * - Sends responses back to clients
 *
 * Network Concepts Demonstrated:
 * - ServerSocket for listening
 * - Socket for client connections
 * - InputStream/OutputStream for data transfer
 * - Connection timeout handling
 * - Thread pool for concurrent clients (Member 2 integration)
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class TCPBidServer {

    private final BidService bidService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${tcp.server.port:8081}")
    private int port;

    @Value("${tcp.server.timeout:30000}")
    private int timeout;

    private ServerSocket serverSocket;
    private ExecutorService executorService;
    private volatile boolean running = false;

    // Monitoring fields
    private final AtomicInteger activeConnections = new AtomicInteger(0);
    private final AtomicLong totalConnections = new AtomicLong(0);
    private final AtomicLong bidsProcessed = new AtomicLong(0);
    private final AtomicLong totalResponseTime = new AtomicLong(0);
    private final Map<String, ConnectionInfo> activeConnectionMap = new ConcurrentHashMap<>();
    private final List<ActivityLog> recentActivity = Collections.synchronizedList(new ArrayList<>());
    private long serverStartTime;

    /**
     * Start TCP server when application is ready
     */
    @EventListener(ApplicationReadyEvent.class)
    public void startServer() {
        executorService = Executors.newFixedThreadPool(50); // Member 2: Thread pool

        new Thread(() -> {
            try {
                serverSocket = new ServerSocket(port);
                running = true;
                serverStartTime = System.currentTimeMillis();

                log.info("╔═══════════════════════════════════════════════════════════╗");
                log.info("║  TCP BID SERVER STARTED (Member 1)                       ║");
                log.info("║  Port: {}                                              ║", port);
                log.info("║  Timeout: {} ms                                        ║", timeout);
                log.info("║  Ready to accept bidding connections via TCP!           ║");
                log.info("╚═══════════════════════════════════════════════════════════╝");

                while (running) {
                    try {
                        Socket clientSocket = serverSocket.accept();
                        String clientId = clientSocket.getInetAddress().getHostAddress() + ":" + clientSocket.getPort();

                        log.info("🔌 New TCP connection from: {}", clientId);

                        // Track connection
                        totalConnections.incrementAndGet();
                        activeConnections.incrementAndGet();
                        activeConnectionMap.put(clientId, new ConnectionInfo(clientId, LocalDateTime.now()));
                        logActivity("CONNECTION", clientId, "New connection established");

                        // Handle each client in separate thread (Member 2: Multithreading)
                        executorService.submit(() -> handleClient(clientSocket));

                    } catch (IOException e) {
                        if (running) {
                            log.error("Error accepting client connection", e);
                        }
                    }
                }
            } catch (IOException e) {
                log.error("Failed to start TCP server on port {}", port, e);
            }
        }, "TCP-Bid-Server").start();
    }

    /**
     * Handle individual client connection
     * Each client runs in its own thread from the pool
     */
    private void handleClient(Socket clientSocket) {
        String clientAddress = clientSocket.getInetAddress().getHostAddress() + ":" + clientSocket.getPort();
        long startTime = System.currentTimeMillis();

        try {
            // Set socket timeout
            clientSocket.setSoTimeout(timeout);

            // Get input and output streams
            BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);

            log.debug("📖 Reading bid request from {}", clientAddress);

            // Read request from client
            StringBuilder requestBuilder = new StringBuilder();
            String line;

            while ((line = in.readLine()) != null) {
                requestBuilder.append(line);
                if (line.trim().endsWith("}")) { // End of JSON
                    break;
                }
            }

            String requestJson = requestBuilder.toString();

            if (requestJson.isEmpty()) {
                log.warn("⚠️ Empty request from {}", clientAddress);
                sendResponse(out, BidResponse.failure("Empty request"));
                return;
            }

            log.debug("📨 Received: {}", requestJson);

            // Parse bid request
            BidRequest bidRequest;
            try {
                bidRequest = objectMapper.readValue(requestJson, BidRequest.class);
            } catch (Exception e) {
                log.warn("⚠️ Invalid JSON from {}: {}", clientAddress, e.getMessage());
                sendResponse(out, BidResponse.failure("Invalid JSON format: " + e.getMessage()));
                return;
            }

            // Process bid using BidService
            log.info("💰 Processing bid from {}: Auction={}, Amount={}",
                    clientAddress, bidRequest.getAuctionId(), bidRequest.getBidAmount());

            BidResponse response = bidService.placeBid(bidRequest);

            // Track bid processing
            bidsProcessed.incrementAndGet();
            long responseTime = System.currentTimeMillis() - startTime;
            totalResponseTime.addAndGet(responseTime);

            // Send response
            sendResponse(out, response);

            if (response.isSuccess()) {
                log.info("✅ Bid ACCEPTED from {}: BidID={}, NewPrice={}",
                        clientAddress, response.getBidId(), response.getBidAmount());
                logActivity("BID_ACCEPTED", clientAddress,
                    "Bid accepted: Auction=" + bidRequest.getAuctionId() + ", Amount=" + bidRequest.getBidAmount());
            } else {
                log.warn("❌ Bid REJECTED from {}: {}", clientAddress, response.getMessage());
                logActivity("BID_REJECTED", clientAddress, response.getMessage());
            }

        } catch (SocketTimeoutException e) {
            log.warn("⏱️ Connection timeout from {}", clientAddress);
        } catch (IOException e) {
            log.error("❌ Error handling client {}: {}", clientAddress, e.getMessage());
        } finally {
            try {
                clientSocket.close();
                activeConnections.decrementAndGet();
                activeConnectionMap.remove(clientAddress);
                logActivity("DISCONNECT", clientAddress, "Connection closed");
                log.debug("🔌 Connection closed: {}", clientAddress);
            } catch (IOException e) {
                log.error("Error closing socket", e);
            }
        }
    }

    /**
     * Send response to client
     */
    private void sendResponse(PrintWriter out, BidResponse response) {
        try {
            String responseJson = objectMapper.writeValueAsString(response);
            out.println(responseJson);
            log.debug("📤 Sent response: {}", responseJson);
        } catch (Exception e) {
            log.error("Error sending response", e);
            out.println("{\"success\":false,\"message\":\"Server error\"}");
        }
    }

    /**
     * Shutdown server gracefully
     */
    public void shutdown() {
        running = false;

        if (executorService != null) {
            executorService.shutdown();
        }

        if (serverSocket != null && !serverSocket.isClosed()) {
            try {
                serverSocket.close();
                log.info("TCP Bid Server stopped");
            } catch (IOException e) {
                log.error("Error closing server socket", e);
            }
        }
    }

    // ========== Monitoring Methods ==========

    public boolean isRunning() {
        return running;
    }

    public int getActiveConnectionCount() {
        return activeConnections.get();
    }

    public long getTotalConnectionCount() {
        return totalConnections.get();
    }

    public long getBidsProcessed() {
        return bidsProcessed.get();
    }

    public long getUptimeMillis() {
        return running ? System.currentTimeMillis() - serverStartTime : 0;
    }

    public long getAverageResponseTime() {
        long processed = bidsProcessed.get();
        return processed > 0 ? totalResponseTime.get() / processed : 0;
    }

    public List<Map<String, Object>> getConnectionDetails() {
        List<Map<String, Object>> connections = new ArrayList<>();
        activeConnectionMap.values().forEach(conn -> {
            Map<String, Object> detail = new HashMap<>();
            detail.put("clientId", conn.getClientId());
            detail.put("connectedAt", conn.getConnectedAt().toString());
            detail.put("duration", java.time.Duration.between(conn.getConnectedAt(), LocalDateTime.now()).getSeconds() + "s");
            connections.add(detail);
        });
        return connections;
    }

    public List<Map<String, Object>> getRecentActivity() {
        List<Map<String, Object>> activities = new ArrayList<>();
        synchronized (recentActivity) {
            int start = Math.max(0, recentActivity.size() - 50); // Last 50 activities
            for (int i = start; i < recentActivity.size(); i++) {
                ActivityLog log = recentActivity.get(i);
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", log.getType());
                activity.put("clientId", log.getClientId());
                activity.put("message", log.getMessage());
                activity.put("timestamp", log.getTimestamp().toString());
                activities.add(activity);
            }
        }
        return activities;
    }

    private void logActivity(String type, String clientId, String message) {
        synchronized (recentActivity) {
            recentActivity.add(new ActivityLog(type, clientId, message, LocalDateTime.now()));
            // Keep only last 100 activities
            if (recentActivity.size() > 100) {
                recentActivity.remove(0);
            }
        }
    }

    // ========== Helper Classes ==========

    @lombok.Data
    @lombok.AllArgsConstructor
    private static class ConnectionInfo {
        private String clientId;
        private LocalDateTime connectedAt;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    private static class ActivityLog {
        private String type;
        private String clientId;
        private String message;
        private LocalDateTime timestamp;
    }
}
