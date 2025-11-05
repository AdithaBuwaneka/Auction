package com.auction.system.network.nio;

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

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.Set;

/**
 * NIO (Non-blocking I/O) Bid Server (Member 4)
 *
 * Implements high-performance non-blocking I/O server using Java NIO
 * Can handle 100+ concurrent connections with a SINGLE thread
 *
 * Network Concepts Demonstrated:
 * - Selector for multiplexing I/O operations
 * - ServerSocketChannel (non-blocking)
 * - SocketChannel (non-blocking)
 * - ByteBuffer for data management
 * - SelectionKey for event-driven I/O
 * - Single-threaded event loop handling multiple clients
 * - Scalable architecture for high-concurrency
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class NIOBidServer {

    private final BidService bidService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${nio.server.port:8082}")
    private int port;

    private Selector selector;
    private ServerSocketChannel serverChannel;
    private volatile boolean running = false;

    /**
     * Start NIO server when application is ready
     */
    @EventListener(ApplicationReadyEvent.class)
    public void startServer() {
        new Thread(() -> {
            try {
                // Create selector for multiplexing
                selector = Selector.open();

                // Create non-blocking server channel
                serverChannel = ServerSocketChannel.open();
                serverChannel.configureBlocking(false);
                serverChannel.bind(new InetSocketAddress(port));

                // Register channel with selector for ACCEPT events
                serverChannel.register(selector, SelectionKey.OP_ACCEPT);

                running = true;

                log.info("╔═══════════════════════════════════════════════════════════╗");
                log.info("║  NIO BID SERVER STARTED (Member 4)                       ║");
                log.info("║  Port: {}                                              ║", port);
                log.info("║  Mode: NON-BLOCKING I/O                                  ║");
                log.info("║  Can handle 100+ connections with SINGLE thread!        ║");
                log.info("╚═══════════════════════════════════════════════════════════╝");

                // Event loop - single thread handles all connections!
                while (running) {
                    // Wait for events (blocks until something happens)
                    selector.select();

                    // Get selected keys (events that occurred)
                    Set<SelectionKey> selectedKeys = selector.selectedKeys();
                    Iterator<SelectionKey> iterator = selectedKeys.iterator();

                    while (iterator.hasNext()) {
                        SelectionKey key = iterator.next();
                        iterator.remove();

                        if (!key.isValid()) {
                            continue;
                        }

                        // Handle different event types
                        if (key.isAcceptable()) {
                            handleAccept(key);
                        } else if (key.isReadable()) {
                            handleRead(key);
                        }
                    }
                }

            } catch (IOException e) {
                log.error("NIO Server error", e);
            }
        }, "NIO-Bid-Server").start();
    }

    /**
     * Handle new client connection (ACCEPT event)
     */
    private void handleAccept(SelectionKey key) throws IOException {
        ServerSocketChannel serverChannel = (ServerSocketChannel) key.channel();
        SocketChannel clientChannel = serverChannel.accept();

        if (clientChannel != null) {
            clientChannel.configureBlocking(false);

            // Register client channel for READ events
            clientChannel.register(selector, SelectionKey.OP_READ);

            log.info("🔌 NIO: New connection from {}",
                    clientChannel.getRemoteAddress());
        }
    }

    /**
     * Handle data from client (READ event)
     */
    private void handleRead(SelectionKey key) {
        SocketChannel clientChannel = (SocketChannel) key.channel();
        ByteBuffer buffer = ByteBuffer.allocate(1024);

        try {
            int bytesRead = clientChannel.read(buffer);

            if (bytesRead == -1) {
                // Client closed connection
                log.debug("🔌 NIO: Client disconnected: {}", clientChannel.getRemoteAddress());
                clientChannel.close();
                key.cancel();
                return;
            }

            // Flip buffer for reading
            buffer.flip();

            // Convert bytes to string
            String requestJson = StandardCharsets.UTF_8.decode(buffer).toString().trim();

            if (requestJson.isEmpty()) {
                return;
            }

            log.debug("📨 NIO: Received from {}: {}",
                    clientChannel.getRemoteAddress(), requestJson);

            // Process bid request
            BidResponse response = processBid(requestJson);

            // Send response
            sendResponse(clientChannel, response);

            // Close connection after response
            clientChannel.close();
            key.cancel();

        } catch (IOException e) {
            log.error("Error reading from NIO client", e);
            try {
                clientChannel.close();
                key.cancel();
            } catch (IOException ex) {
                log.error("Error closing channel", ex);
            }
        }
    }

    /**
     * Process bid request
     */
    private BidResponse processBid(String requestJson) {
        try {
            BidRequest bidRequest = objectMapper.readValue(requestJson, BidRequest.class);

            log.info("💰 NIO: Processing bid - Auction={}, Amount={}",
                    bidRequest.getAuctionId(), bidRequest.getBidAmount());

            // Call BidService in a way that Spring can manage the transaction
            // Note: This is a workaround for NIO running outside Spring's transaction context
            BidResponse response;
            try {
                response = bidService.placeBid(bidRequest);
            } catch (Exception e) {
                log.error("Transaction error in NIO bid processing", e);
                // For demo purposes, just log the error and return a simulated response
                response = BidResponse.failure("NIO server received bid but transaction failed: " + e.getMessage());
                // In production, you'd use a proper message queue or async processing
            }

            if (response.isSuccess()) {
                log.info("✅ NIO: Bid ACCEPTED - BidID={}", response.getBidId());
            } else {
                log.warn("❌ NIO: Bid REJECTED - {}", response.getMessage());
            }

            return response;

        } catch (Exception e) {
            log.error("Error processing NIO bid", e);
            return BidResponse.failure("Invalid request: " + e.getMessage());
        }
    }

    /**
     * Send response to client
     */
    private void sendResponse(SocketChannel clientChannel, BidResponse response) {
        try {
            String responseJson = objectMapper.writeValueAsString(response);
            responseJson += "\n"; // Add newline for easier client parsing

            ByteBuffer buffer = ByteBuffer.wrap(responseJson.getBytes(StandardCharsets.UTF_8));

            while (buffer.hasRemaining()) {
                clientChannel.write(buffer);
            }

            log.debug("📤 NIO: Response sent to {}", clientChannel.getRemoteAddress());

        } catch (Exception e) {
            log.error("Error sending NIO response", e);
        }
    }

    /**
     * Shutdown NIO server
     */
    public void shutdown() {
        running = false;

        try {
            if (selector != null && selector.isOpen()) {
                selector.close();
            }
            if (serverChannel != null && serverChannel.isOpen()) {
                serverChannel.close();
            }
            log.info("NIO Bid Server stopped");
        } catch (IOException e) {
            log.error("Error shutting down NIO server", e);
        }
    }
}
