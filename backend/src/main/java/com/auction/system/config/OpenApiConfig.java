package com.auction.system.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger Configuration
 * Configures API documentation with JWT authentication support
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI auctionSystemOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Real-Time Auction System API")
                        .description("""
                                # Real-Time Auction System Backend API

                                A comprehensive auction platform demonstrating advanced network programming concepts:

                                ## Network Programming Features
                                - **TCP Socket Communication** (Port 8081) - Multi-threaded bid processing
                                - **Multithreading & Concurrency** - Thread pool with pessimistic locking
                                - **UDP Multicast Broadcasting** (230.0.0.1:4446) - Real-time price updates
                                - **Non-blocking I/O (NIO)** (Port 8082) - Selector-based concurrent handling
                                - **SSL/TLS Security** (Port 8443) - Encrypted payment processing

                                ## Authentication
                                Most endpoints are public. Admin endpoints require JWT token with ADMIN role.

                                1. Register: POST /api/auth/register
                                2. Login: POST /api/auth/login (get JWT token)
                                3. Use token: Click "Authorize" button and enter: Bearer <your-token>

                                ## Total Endpoints: 62
                                - Authentication: 2 endpoints
                                - User Management: 7 endpoints
                                - Auction Management: 11 endpoints
                                - Bidding: 5 endpoints
                                - Wallet: 4 endpoints
                                - Transactions: 4 endpoints
                                - Notifications: 3 endpoints
                                - File Upload: 2 endpoints
                                - Admin: 5 endpoints
                                - Monitoring: 13 endpoints
                                - WebSocket: 3 endpoints
                                - Health: 2 endpoints
                                - Migration: 1 endpoint
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Auction System Team")
                                .email("support@auction.com")
                                .url("https://github.com/your-repo/auction-system"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Development Server"),
                        new Server()
                                .url("https://api.auction.com")
                                .description("Production Server (when deployed)")
                ))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT token obtained from /api/auth/login")));
    }
}
