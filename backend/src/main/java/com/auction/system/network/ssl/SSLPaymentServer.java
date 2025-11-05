package com.auction.system.network.ssl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import javax.net.ssl.*;
import java.io.*;
import java.math.BigDecimal;
import java.security.KeyStore;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * SSL/TLS Secure Payment Server (Member 5)
 *
 * Implements secure encrypted communication using SSL/TLS
 * Handles secure payment processing for auction winners
 *
 * Network Concepts Demonstrated:
 * - SSL/TLS encryption
 * - SSLServerSocket for secure connections
 * - Certificate-based authentication
 * - KeyStore and TrustStore management
 * - Encrypted data transmission
 * - Secure payment processing
 */
@Component
@Slf4j
public class SSLPaymentServer {

    @Value("${ssl.server.port:8443}")
    private int port;

    @Value("${ssl.keystore.password:changeit}")
    private String keystorePassword;

    private SSLServerSocket serverSocket;
    private ExecutorService executorService;
    private volatile boolean running = false;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Start SSL server when application is ready
     */
    @EventListener(ApplicationReadyEvent.class)
    public void startServer() {
        executorService = Executors.newFixedThreadPool(20);

        new Thread(() -> {
            try {
                // Load keystore
                KeyStore keyStore = KeyStore.getInstance("PKCS12");
                InputStream keystoreStream = new ClassPathResource("keystore.p12").getInputStream();
                keyStore.load(keystoreStream, keystorePassword.toCharArray());

                // Initialize KeyManagerFactory
                KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(
                        KeyManagerFactory.getDefaultAlgorithm());
                keyManagerFactory.init(keyStore, keystorePassword.toCharArray());

                // Initialize SSLContext
                SSLContext sslContext = SSLContext.getInstance("TLS");
                sslContext.init(keyManagerFactory.getKeyManagers(), null, null);

                // Create SSL server socket
                SSLServerSocketFactory factory = sslContext.getServerSocketFactory();
                serverSocket = (SSLServerSocket) factory.createServerSocket(port);

                // Configure cipher suites (optional - for stronger security)
                String[] supportedCiphers = serverSocket.getSupportedCipherSuites();
                serverSocket.setEnabledCipherSuites(supportedCiphers);

                running = true;

                log.info("╔═══════════════════════════════════════════════════════════╗");
                log.info("║  SSL/TLS PAYMENT SERVER STARTED (Member 5)               ║");
                log.info("║  Port: {}                                             ║", port);
                log.info("║  Encryption: TLS                                         ║");
                log.info("║  Certificate: CN=localhost                               ║");
                log.info("║  Secure payment processing enabled!                      ║");
                log.info("╚═══════════════════════════════════════════════════════════╝");

                while (running) {
                    try {
                        SSLSocket clientSocket = (SSLSocket) serverSocket.accept();
                        log.info("🔐 SSL: Secure connection from {}:{}",
                                clientSocket.getInetAddress().getHostAddress(),
                                clientSocket.getPort());

                        // Handle client in separate thread
                        executorService.submit(() -> handleClient(clientSocket));

                    } catch (IOException e) {
                        if (running) {
                            log.error("Error accepting SSL client", e);
                        }
                    }
                }

            } catch (Exception e) {
                log.error("Failed to start SSL server", e);
            }
        }, "SSL-Payment-Server").start();
    }

    /**
     * Handle SSL client connection
     */
    private void handleClient(SSLSocket clientSocket) {
        String clientAddress = clientSocket.getInetAddress().getHostAddress() + ":" + clientSocket.getPort();

        try {
            // Set timeout
            clientSocket.setSoTimeout(30000);

            // Get cipher suite being used
            String cipherSuite = clientSocket.getSession().getCipherSuite();
            log.info("🔐 SSL: Using cipher suite: {}", cipherSuite);

            // Get input/output streams (encrypted automatically!)
            BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);

            // Read payment request
            StringBuilder requestBuilder = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                requestBuilder.append(line);
                if (line.trim().endsWith("}")) {
                    break;
                }
            }

            String requestJson = requestBuilder.toString();

            if (requestJson.isEmpty()) {
                log.warn("⚠️ SSL: Empty request from {}", clientAddress);
                sendResponse(out, new PaymentResponse(false, "Empty request", null));
                return;
            }

            log.debug("🔐 SSL: Encrypted data received from {}", clientAddress);

            // Parse payment request
            PaymentRequest paymentRequest;
            try {
                paymentRequest = objectMapper.readValue(requestJson, PaymentRequest.class);
            } catch (Exception e) {
                log.warn("⚠️ SSL: Invalid JSON from {}", clientAddress);
                sendResponse(out, new PaymentResponse(false, "Invalid JSON", null));
                return;
            }

            // Process secure payment
            log.info("💳 SSL: Processing payment - User={}, Amount=${}",
                    paymentRequest.getUserId(), paymentRequest.getAmount());

            PaymentResponse response = processPayment(paymentRequest);

            // Send encrypted response
            sendResponse(out, response);

            if (response.isSuccess()) {
                log.info("✅ SSL: Payment SUCCESSFUL - TransactionID={}",
                        response.getTransactionId());
            } else {
                log.warn("❌ SSL: Payment FAILED - {}", response.getMessage());
            }

        } catch (Exception e) {
            log.error("Error handling SSL client {}", clientAddress, e);
        } finally {
            try {
                clientSocket.close();
                log.debug("🔐 SSL: Secure connection closed: {}", clientAddress);
            } catch (IOException e) {
                log.error("Error closing SSL socket", e);
            }
        }
    }

    /**
     * Process secure payment (simplified for demo)
     */
    private PaymentResponse processPayment(PaymentRequest request) {
        try {
            // Validate payment request
            if (request.getUserId() == null || request.getAmount() == null) {
                return new PaymentResponse(false, "Missing required fields", null);
            }

            if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                return new PaymentResponse(false, "Invalid amount", null);
            }

            // Simulate payment processing
            // In real application, integrate with payment gateway
            String transactionId = "TXN-" + System.currentTimeMillis();

            // Simulate card validation
            if (request.getCardNumber() != null && request.getCardNumber().length() < 13) {
                return new PaymentResponse(false, "Invalid card number", null);
            }

            log.info("💳 Processing secure payment: ${} for user {}",
                    request.getAmount(), request.getUserId());

            // Payment successful
            return new PaymentResponse(true, "Payment processed successfully", transactionId);

        } catch (Exception e) {
            log.error("Payment processing error", e);
            return new PaymentResponse(false, "Payment processing failed: " + e.getMessage(), null);
        }
    }

    /**
     * Send encrypted response
     */
    private void sendResponse(PrintWriter out, PaymentResponse response) {
        try {
            String responseJson = objectMapper.writeValueAsString(response);
            out.println(responseJson);
            log.debug("🔐 SSL: Encrypted response sent");
        } catch (Exception e) {
            log.error("Error sending SSL response", e);
            out.println("{\"success\":false,\"message\":\"Server error\"}");
        }
    }

    /**
     * Shutdown SSL server
     */
    public void shutdown() {
        running = false;

        if (executorService != null) {
            executorService.shutdown();
        }

        if (serverSocket != null && !serverSocket.isClosed()) {
            try {
                serverSocket.close();
                log.info("SSL Payment Server stopped");
            } catch (IOException e) {
                log.error("Error closing SSL server socket", e);
            }
        }
    }

    /**
     * Payment Request DTO
     */
    @Data
    public static class PaymentRequest {
        private Long userId;
        private Long auctionId;
        private BigDecimal amount;
        private String cardNumber;
        private String cardholderName;
        private String expiryDate;
        private String cvv;
    }

    /**
     * Payment Response DTO
     */
    @Data
    public static class PaymentResponse {
        private boolean success;
        private String message;
        private String transactionId;

        public PaymentResponse(boolean success, String message, String transactionId) {
            this.success = success;
            this.message = message;
            this.transactionId = transactionId;
        }
    }
}
