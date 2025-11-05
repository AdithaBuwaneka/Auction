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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

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

                log.info("╔═══════════════════════════════════════════════════════════╗");
                log.info("║  TCP BID SERVER STARTED (Member 1)                       ║");
                log.info("║  Port: {}                                              ║", port);
                log.info("║  Timeout: {} ms                                        ║", timeout);
                log.info("║  Ready to accept bidding connections via TCP!           ║");
                log.info("╚═══════════════════════════════════════════════════════════╝");

                while (running) {
                    try {
                        Socket clientSocket = serverSocket.accept();
                        log.info("🔌 New TCP connection from: {}:{}",
                                clientSocket.getInetAddress().getHostAddress(),
                                clientSocket.getPort());

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

            // Send response
            sendResponse(out, response);

            if (response.isSuccess()) {
                log.info("✅ Bid ACCEPTED from {}: BidID={}, NewPrice={}",
                        clientAddress, response.getBidId(), response.getBidAmount());
            } else {
                log.warn("❌ Bid REJECTED from {}: {}", clientAddress, response.getMessage());
            }

        } catch (SocketTimeoutException e) {
            log.warn("⏱️ Connection timeout from {}", clientAddress);
        } catch (IOException e) {
            log.error("❌ Error handling client {}: {}", clientAddress, e.getMessage());
        } finally {
            try {
                clientSocket.close();
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
}
