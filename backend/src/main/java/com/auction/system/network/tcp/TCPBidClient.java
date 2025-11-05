package com.auction.system.network.tcp;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.net.Socket;
import java.util.Scanner;

/**
 * TCP Bid Client for Testing (Member 1)
 *
 * Simple command-line client to test TCP bidding
 * Connects to TCP server on port 8081 and sends bid requests
 */
public class TCPBidClient {

    private static final String SERVER_HOST = "localhost";
    private static final int SERVER_PORT = 8081;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static void main(String[] args) {
        System.out.println("╔═══════════════════════════════════════════════════════════╗");
        System.out.println("║          TCP BID CLIENT (Member 1 Testing)               ║");
        System.out.println("╚═══════════════════════════════════════════════════════════╝");
        System.out.println();

        Scanner scanner = new Scanner(System.in);

        while (true) {
            try {
                System.out.println("Enter bid details (or 'quit' to exit):");
                System.out.print("  Auction ID: ");
                String auctionInput = scanner.nextLine().trim();

                if (auctionInput.equalsIgnoreCase("quit")) {
                    System.out.println("Goodbye!");
                    break;
                }

                System.out.print("  Bidder ID: ");
                String bidderInput = scanner.nextLine().trim();

                System.out.print("  Bid Amount: ");
                String amountInput = scanner.nextLine().trim();

                // Create bid request
                BidRequestDTO request = new BidRequestDTO();
                request.setAuctionId(Long.parseLong(auctionInput));
                request.setBidderId(Long.parseLong(bidderInput));
                request.setBidAmount(new BigDecimal(amountInput));

                // Send bid via TCP
                String response = sendBid(request);

                System.out.println("\n📨 Server Response:");
                System.out.println(response);
                System.out.println();

            } catch (NumberFormatException e) {
                System.err.println("❌ Invalid number format. Please enter valid numbers.");
            } catch (Exception e) {
                System.err.println("❌ Error: " + e.getMessage());
            }
        }

        scanner.close();
    }

    /**
     * Send bid to TCP server
     */
    private static String sendBid(BidRequestDTO request) throws Exception {
        System.out.println("\n🔌 Connecting to TCP server at " + SERVER_HOST + ":" + SERVER_PORT + "...");

        try (Socket socket = new Socket(SERVER_HOST, SERVER_PORT);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {

            System.out.println("✅ Connected!");

            // Convert request to JSON
            String requestJson = objectMapper.writeValueAsString(request);
            System.out.println("📤 Sending: " + requestJson);

            // Send request
            out.println(requestJson);

            // Read response
            String response = in.readLine();
            System.out.println("📥 Received: " + response);

            return response;
        }
    }

    /**
     * DTO for bid request
     */
    @Data
    static class BidRequestDTO {
        private Long auctionId;
        private Long bidderId;
        private BigDecimal bidAmount;
    }
}
