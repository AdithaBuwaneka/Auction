package com.auction.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Application Class for Real-Time Auction System
 * IN3111 - Network Programming Assignment 2
 *
 * This application demonstrates:
 * - TCP Socket Communication (Member 1)
 * - Multithreading and Concurrency (Member 2)
 * - UDP Multicast Broadcasting (Member 3)
 * - Non-blocking I/O with NIO (Member 4)
 * - SSL/TLS Security (Member 5)
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class AuctionSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuctionSystemApplication.class, args);
        System.out.println("\n" +
                "╔═══════════════════════════════════════════════════════════╗\n" +
                "║     Real-Time Auction System - Backend Started           ║\n" +
                "║     IN3111 - Network Programming Assignment              ║\n" +
                "╠═══════════════════════════════════════════════════════════╣\n" +
                "║  REST API:        http://localhost:8080                  ║\n" +
                "║  TCP Server:      port 8081                              ║\n" +
                "║  NIO Server:      port 8082                              ║\n" +
                "║  SSL Server:      port 8443                              ║\n" +
                "║  Multicast:       230.0.0.1:4446                         ║\n" +
                "╚═══════════════════════════════════════════════════════════╝\n");
    }
}
