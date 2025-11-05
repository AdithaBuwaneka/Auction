package com.auction.system.network.ssl;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.net.ssl.*;
import java.io.*;
import java.math.BigDecimal;
import java.security.cert.X509Certificate;

/**
 * SSL Payment Client for Testing (Member 5)
 *
 * Interactive command-line client to test secure SSL/TLS payment processing
 */
public class SSLPaymentClient {

    private static final String SERVER_HOST = "localhost";
    private static final int SERVER_PORT = 8443;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static void main(String[] args) {
        System.out.println("╔═══════════════════════════════════════════════════════════╗");
        System.out.println("║     SSL/TLS PAYMENT CLIENT (Member 5 Testing)            ║");
        System.out.println("╚═══════════════════════════════════════════════════════════╝");
        System.out.println();

        BufferedReader consoleReader = new BufferedReader(new InputStreamReader(System.in));

        try {
            // Create SSL context that trusts all certificates (for testing ONLY)
            SSLContext sslContext = createTrustAllSSLContext();
            SSLSocketFactory socketFactory = sslContext.getSocketFactory();

            while (true) {
                System.out.println("\n" + "=".repeat(60));
                System.out.println("Enter payment details (or 'exit' to quit):");
                System.out.println("=".repeat(60));

                System.out.print("User ID: ");
                String userIdStr = consoleReader.readLine().trim();

                if (userIdStr.equalsIgnoreCase("exit")) {
                    System.out.println("\n👋 Goodbye!");
                    break;
                }

                System.out.print("Auction ID: ");
                String auctionIdStr = consoleReader.readLine().trim();

                System.out.print("Amount ($): ");
                String amountStr = consoleReader.readLine().trim();

                System.out.print("Card Number (16 digits): ");
                String cardNumber = consoleReader.readLine().trim();

                System.out.print("Cardholder Name: ");
                String cardholderName = consoleReader.readLine().trim();

                System.out.print("Expiry Date (MM/YY): ");
                String expiryDate = consoleReader.readLine().trim();

                System.out.print("CVV (3 digits): ");
                String cvv = consoleReader.readLine().trim();

                // Create payment request
                PaymentRequest request = new PaymentRequest();
                request.setUserId(Long.parseLong(userIdStr));
                request.setAuctionId(Long.parseLong(auctionIdStr));
                request.setAmount(new BigDecimal(amountStr));
                request.setCardNumber(cardNumber);
                request.setCardholderName(cardholderName);
                request.setExpiryDate(expiryDate);
                request.setCvv(cvv);

                // Send secure payment request
                System.out.println("\n🔐 Establishing secure SSL/TLS connection...");
                sendSecurePayment(socketFactory, request);
            }

        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send payment over secure SSL connection
     */
    private static void sendSecurePayment(SSLSocketFactory socketFactory, PaymentRequest request) {
        try (SSLSocket socket = (SSLSocket) socketFactory.createSocket(SERVER_HOST, SERVER_PORT)) {

            // Display connection info
            System.out.println("✅ Connected to " + SERVER_HOST + ":" + SERVER_PORT);
            System.out.println("🔒 Cipher Suite: " + socket.getSession().getCipherSuite());
            System.out.println("🔒 Protocol: " + socket.getSession().getProtocol());

            // Get streams
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            // Send encrypted payment request
            String requestJson = objectMapper.writeValueAsString(request);
            System.out.println("\n📤 Sending ENCRYPTED payment data...");
            System.out.println("   (Data is encrypted by SSL/TLS)");
            out.println(requestJson);

            // Receive encrypted response
            System.out.println("\n📥 Receiving ENCRYPTED response...");
            String responseJson = in.readLine();

            if (responseJson != null && !responseJson.isEmpty()) {
                PaymentResponse response = objectMapper.readValue(responseJson, PaymentResponse.class);

                System.out.println("\n┌─────────────────────────────────────────────────────────┐");
                System.out.println("│ 💳 PAYMENT RESULT                                       │");
                System.out.println("├─────────────────────────────────────────────────────────┤");

                if (response.isSuccess()) {
                    System.out.println("│ Status: ✅ SUCCESS                                      │");
                    System.out.println("│ Transaction ID: " + String.format("%-36s", response.getTransactionId()) + "│");
                } else {
                    System.out.println("│ Status: ❌ FAILED                                       │");
                }

                System.out.println("│ Message: " + String.format("%-43s", response.getMessage()) + "│");
                System.out.println("└─────────────────────────────────────────────────────────┘");
            } else {
                System.out.println("⚠️ No response from server");
            }

        } catch (Exception e) {
            System.err.println("❌ SSL Connection Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Create SSL context that trusts all certificates
     * WARNING: FOR TESTING ONLY! In production, properly validate certificates!
     */
    private static SSLContext createTrustAllSSLContext() throws Exception {
        TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() {
                    return null;
                }

                public void checkClientTrusted(X509Certificate[] certs, String authType) {
                }

                public void checkServerTrusted(X509Certificate[] certs, String authType) {
                }
            }
        };

        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

        System.out.println("⚠️  WARNING: Trusting all SSL certificates (TEST MODE ONLY)");
        System.out.println("⚠️  In production, validate server certificates properly!\n");

        return sslContext;
    }

    /**
     * Payment Request DTO (matches server)
     */
    static class PaymentRequest {
        private Long userId;
        private Long auctionId;
        private BigDecimal amount;
        private String cardNumber;
        private String cardholderName;
        private String expiryDate;
        private String cvv;

        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public Long getAuctionId() { return auctionId; }
        public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getCardNumber() { return cardNumber; }
        public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

        public String getCardholderName() { return cardholderName; }
        public void setCardholderName(String cardholderName) { this.cardholderName = cardholderName; }

        public String getExpiryDate() { return expiryDate; }
        public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

        public String getCvv() { return cvv; }
        public void setCvv(String cvv) { this.cvv = cvv; }
    }

    /**
     * Payment Response DTO (matches server)
     */
    static class PaymentResponse {
        private boolean success;
        private String message;
        private String transactionId;

        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    }
}
