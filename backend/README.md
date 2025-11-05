# Real-Time Auction System - Backend

**IN3111 - Network Programming Assignment 2**
University of Moratuwa

## Overview

This is the backend for the Real-Time Auction System, demonstrating advanced network programming concepts:

- **Member 1:** TCP Socket Communication (Port 8081)
- **Member 2:** Multithreading & Concurrency (Thread Pool)
- **Member 3:** UDP Multicast Broadcasting (230.0.0.1:4446)
- **Member 4:** Non-blocking I/O with NIO (Port 8082)
- **Member 5:** SSL/TLS Security (Port 8443)

## Technology Stack

- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Database:** PostgreSQL (Neon Cloud)
- **Build Tool:** Maven
- **ORM:** Hibernate/JPA

## Project Structure

```
backend/
├── src/main/java/com/auction/system/
│   │
│   ├── AuctionSystemApplication.java    # Main Spring Boot application entry point
│   │
│   ├── entity/                          # Database entities (JPA)
│   │   ├── User.java                    # User entity
│   │   ├── UserRole.java                # User role enum (USER, ADMIN)
│   │   ├── Auction.java                 # Auction entity
│   │   ├── Bid.java                     # Bid entity
│   │   ├── Transaction.java             # Transaction entity
│   │   ├── Notification.java            # Notification entity
│   │   └── WalletTransaction.java       # Wallet transaction entity
│   │
│   ├── repository/                      # Spring Data JPA repositories
│   │   ├── UserRepository.java
│   │   ├── AuctionRepository.java
│   │   ├── BidRepository.java
│   │   ├── TransactionRepository.java
│   │   ├── NotificationRepository.java
│   │   └── WalletTransactionRepository.java
│   │
│   ├── service/                         # Business logic layer
│   │   ├── UserService.java
│   │   ├── AuctionService.java
│   │   ├── BidService.java              # ⭐ MEMBER 2: Thread-safe bid processing (synchronized)
│   │   ├── TransactionService.java
│   │   ├── NotificationService.java
│   │   ├── WalletService.java
│   │   └── AdminService.java
│   │
│   ├── controller/                      # REST API controllers
│   │   ├── AuthController.java          # Authentication endpoints
│   │   ├── UserController.java          # User management endpoints
│   │   ├── AuctionController.java       # Auction management endpoints
│   │   ├── BidController.java           # Bidding endpoints
│   │   ├── TransactionController.java   # Payment & transaction endpoints
│   │   ├── NotificationController.java  # Notification endpoints
│   │   ├── WalletController.java        # Wallet management endpoints
│   │   ├── FileUploadController.java    # Image upload endpoints
│   │   ├── HealthController.java        # Health check endpoints
│   │   ├── MigrationController.java     # Database migration endpoints
│   │   └── admin/                       # Admin-only controllers
│   │       ├── AdminController.java                         # General admin operations
│   │       ├── ThreadPoolMonitorController.java             # ⭐ MEMBER 2: Thread pool monitoring
│   │       ├── TcpMonitorController.java                    # ⭐ MEMBER 1: TCP server monitoring
│   │       ├── NioMonitorController.java                    # ⭐ MEMBER 4: NIO server monitoring
│   │       ├── SslMonitorController.java                    # ⭐ MEMBER 5: SSL server monitoring
│   │       └── MulticastMonitorController.java              # ⭐ MEMBER 3: Multicast monitoring
│   │
│   ├── dto/                             # Data Transfer Objects
│   │   ├── BidRequest.java
│   │   ├── BidResponse.java
│   │   ├── AuctionCreateRequest.java
│   │   ├── AuthResponse.java
│   │   ├── LoginRequest.java
│   │   └── RegisterRequest.java
│   │
│   ├── security/                        # Spring Security configuration
│   │   ├── SecurityConfig.java          # Security & CORS configuration
│   │   ├── JwtAuthenticationFilter.java # JWT authentication filter
│   │   └── JwtUtil.java                 # JWT token utilities
│   │
│   ├── config/                          # Application configuration
│   │   ├── CorsConfig.java              # CORS configuration
│   │   ├── DatabaseConfig.java          # Database configuration
│   │   ├── DataSourceConfig.java        # DataSource configuration
│   │   ├── FileUploadConfig.java        # File upload configuration
│   │   └── OpenApiConfig.java           # Swagger/OpenAPI documentation configuration
│   │
│   ├── scheduler/                       # ⭐ MEMBER 2: Scheduled tasks (Multithreading)
│   │   └── AuctionScheduler.java        # Auction deadline management (@Scheduled)
│   │
│   ├── websocket/                       # WebSocket real-time communication
│   │   ├── WebSocketConfig.java         # WebSocket configuration
│   │   └── WebSocketEventService.java   # Real-time event broadcasting service
│   │
│   ├── util/                            # Utility classes
│   │   └── DatabaseMigration.java       # Database migration utilities
│   │
│   └── network/                         # Network Programming Implementations
│       │
│       ├── tcp/                         # ⭐ MEMBER 1: TCP Socket Communication
│       │   ├── TCPBidServer.java        # TCP server for bid processing (Port 8081)
│       │   └── TCPBidClient.java        # TCP client for testing
│       │
│       ├── nio/                         # ⭐ MEMBER 4: Non-blocking I/O (NIO)
│       │   ├── NIOBidServer.java        # NIO server with Selector (Port 8082)
│       │   └── NIOBidClient.java        # NIO client for testing
│       │
│       ├── multicast/                   # ⭐ MEMBER 3: UDP Multicast Broadcasting
│       │   ├── MulticastBroadcaster.java # Broadcasts auction updates (230.0.0.1:4446)
│       │   └── MulticastReceiver.java   # Receives multicast messages
│       │
│       └── ssl/                         # ⭐ MEMBER 5: SSL/TLS Secure Communication
│           ├── SSLPaymentServer.java    # Secure payment server (Port 8443)
│           └── SSLPaymentClient.java    # SSL client for secure payments
│
├── src/main/resources/
│   ├── application.properties           # Application configuration
│   └── keystore.p12                     # ⭐ MEMBER 5: SSL certificate/keystore
│
└── pom.xml                              # Maven dependencies
```

### Member Responsibilities & Implementation Status

#### ⭐ Member 1: TCP Socket Communication
**Location:** `src/main/java/com/auction/system/network/tcp/`
- ✅ `TCPBidServer.java` - Multi-threaded TCP server on port 8081
- ✅ `TCPBidClient.java` - TCP client for bid submission
- **Features:** Socket-based bid processing, connection handling, request/response protocol

#### ⭐ Member 2: Multithreading & Concurrency
**Locations:**
- `src/main/java/com/auction/system/scheduler/AuctionScheduler.java`
- `src/main/java/com/auction/system/controller/admin/ThreadPoolMonitorController.java`
- `src/main/java/com/auction/system/service/BidService.java` (pessimistic locking)
- ✅ Thread pool configuration (50 core threads, 100 max) - configured in application.properties
- ✅ Scheduled auction deadline checks (@Scheduled, runs every 30 seconds)
- ✅ Concurrent bid processing with `synchronized` method in BidService
- ✅ Thread pool monitoring endpoints via ThreadPoolMonitorController
- ✅ Multi-threaded ExecutorService used in TCPBidServer (Member 1 integration)

#### ⭐ Member 3: UDP Multicast Broadcasting
**Location:** `src/main/java/com/auction/system/network/multicast/`
- ✅ `MulticastBroadcaster.java` - Broadcasts price updates to 230.0.0.1:4446
- ✅ `MulticastReceiver.java` - Receives multicast messages
- **Features:** Real-time auction updates to all subscribers, group communication

#### ⭐ Member 4: Non-blocking I/O (NIO)
**Location:** `src/main/java/com/auction/system/network/nio/`
- ✅ `NIOBidServer.java` - Selector-based NIO server on port 8082
- ✅ `NIOBidClient.java` - Non-blocking NIO client
- **Features:** Single-threaded handling of 100+ concurrent connections, channel-based I/O

#### ⭐ Member 5: SSL/TLS Security
**Location:** `src/main/java/com/auction/system/network/ssl/`
- ✅ `SSLPaymentServer.java` - Secure payment processing on port 8443
- ✅ `SSLPaymentClient.java` - SSL client for secure transactions
- **Features:** Certificate-based authentication, encrypted communication, secure payment processing

## Setup Instructions

### 1. Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL database (Neon Cloud account)

### 2. Database Setup

1. Create a PostgreSQL database on [Neon](https://neon.tech)
2. Update `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://your-neon-host.neon.tech:5432/your-database-name?sslmode=require
spring.datasource.username=your-username
spring.datasource.password=your-password
```

### 3. Build the Project

```bash
cd backend
mvn clean install
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

The application will start on:
- **REST API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **API Docs (JSON):** http://localhost:8080/v3/api-docs
- **TCP Server:** Port 8081 (Member 1)
- **NIO Server:** Port 8082 (Member 4)
- **SSL Server:** Port 8443 (Member 5)
- **Multicast:** 230.0.0.1:4446 (Member 3)

## API Documentation

### 📚 Interactive API Documentation (Swagger)

This project includes **Swagger UI** for interactive API documentation and testing:

- **Swagger UI (Interactive):** http://localhost:8080/swagger-ui.html
  - Browse all 62 endpoints
  - Test APIs directly from browser
  - View request/response schemas
  - No authentication needed for public endpoints

- **OpenAPI JSON Spec:** http://localhost:8080/v3/api-docs
  - Machine-readable API specification
  - Import into Postman, Insomnia, or other API tools

### Quick Start with Swagger:
1. Start the backend: `mvn spring-boot:run`
2. Open browser: http://localhost:8080/swagger-ui.html
3. Expand any endpoint category to see available operations
4. Click "Try it out" to test endpoints directly
5. For protected endpoints, click "Authorize" and enter JWT token

---

## API Endpoints

### Authentication

All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Get token by logging in via `/api/auth/login`.

---

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user and get JWT token | No |

**Example - Register:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Example - Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### 2. User Management Endpoints (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/register` | Register new user (alternative) | No |
| POST | `/api/users/login` | Login user (alternative) | No |
| GET | `/api/users/{id}` | Get user by ID | No |
| GET | `/api/users` | Get all users | No |
| GET | `/api/users/active` | Get all active users | No |
| PUT | `/api/users/{id}` | Update user details | Yes |
| DELETE | `/api/users/{id}` | Delete/deactivate user | Yes |

---

### 3. Auction Management Endpoints (`/api/auctions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auctions` | Create new auction | No |
| GET | `/api/auctions` | Get all auctions | No |
| GET | `/api/auctions/active` | Get all active auctions | No |
| GET | `/api/auctions/{id}` | Get auction by ID | No |
| GET | `/api/auctions/seller/{sellerId}` | Get auctions by seller | No |
| GET | `/api/auctions/user/{userId}/participated` | Get auctions user participated in | No |
| GET | `/api/auctions/search` | Search auctions by keyword | No |
| GET | `/api/auctions/{id}/highest-bid` | Get highest bid for auction | No |
| PUT | `/api/auctions/{id}` | Update auction details | Yes |
| DELETE | `/api/auctions/{id}` | Cancel auction | Yes |
| POST | `/api/auctions/{id}/close` | Manually close auction | Yes |

**Example - Create Auction:**
```bash
curl -X POST http://localhost:8080/api/auctions \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Vintage Watch",
    "description": "Rare vintage watch from 1960s",
    "imageUrl": "/uploads/auction-images/watch.jpg",
    "startingPrice": 1000.00,
    "sellerId": 1,
    "startTime": "2025-11-05T10:00:00",
    "mandatoryEndTime": "2025-11-06T10:00:00",
    "bidGapDurationSeconds": 300
  }'
```

---

### 4. Bidding Endpoints (`/api/bids`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bids` | Place a bid on auction | No |
| GET | `/api/bids/auction/{auctionId}` | Get all bids for auction | No |
| GET | `/api/bids/user/{userId}` | Get all bids by user | No |
| GET | `/api/bids/{bidId}` | Get bid by ID | No |
| GET | `/api/bids/auction/{auctionId}/highest` | Get highest bid for auction | No |

**Example - Place Bid:**
```bash
curl -X POST http://localhost:8080/api/bids \
  -H "Content-Type: application/json" \
  -d '{
    "auctionId": 1,
    "bidderId": 2,
    "bidAmount": 1500.00
  }'
```

---

### 5. Wallet Management Endpoints (`/api/wallet`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/wallet/deposit` | Deposit funds to wallet | No |
| POST | `/api/wallet/withdraw` | Withdraw funds from wallet | No |
| GET | `/api/wallet/balance/{userId}` | Get user wallet balance | No |
| GET | `/api/wallet/transactions/{userId}` | Get user wallet transactions | No |

**Example - Deposit:**
```bash
curl -X POST http://localhost:8080/api/wallet/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "amount": 5000.00
  }'
```

---

### 6. Transaction Endpoints (`/api/transactions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/transactions/payment` | Process payment for won auction | No |
| GET | `/api/transactions/user/{userId}` | Get user's transactions | No |
| GET | `/api/transactions/{transactionId}` | Get transaction by ID | No |
| GET | `/api/transactions/auction/{auctionId}` | Get transaction for auction | No |

**Example - Process Payment:**
```bash
curl -X POST http://localhost:8080/api/transactions/payment \
  -H "Content-Type: application/json" \
  -d '{
    "auctionId": 1,
    "buyerId": 2,
    "sellerId": 1,
    "amount": 1500.00,
    "paymentMethod": "WALLET"
  }'
```

---

### 7. Notification Endpoints (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications/user/{userId}` | Get user's notifications | No |
| GET | `/api/notifications/user/{userId}/unread` | Get unread notifications | No |
| PUT | `/api/notifications/{notificationId}/read` | Mark notification as read | No |

---

### 8. File Upload Endpoints (`/api/upload`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload/auction-image` | Upload auction image | No |
| DELETE | `/api/upload/auction-image/{filename}` | Delete auction image | No |

**Example - Upload Image:**
```bash
curl -X POST http://localhost:8080/api/upload/auction-image \
  -F "file=@/path/to/image.jpg"
```

---

### 9. Admin Endpoints (`/api/admin`)

All admin endpoints require ADMIN role.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/stats` | Get system statistics | Yes (ADMIN) |
| GET | `/api/admin/users` | Get all users (admin view) | Yes (ADMIN) |
| POST | `/api/admin/auctions/{id}/close` | Admin close auction | Yes (ADMIN) |
| GET | `/api/admin/tcp/connections` | Get TCP server connections | Yes (ADMIN) |
| GET | `/api/admin/nio/connections` | Get NIO server connections | Yes (ADMIN) |

---

### 10. Monitoring Endpoints (`/api/monitor`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/monitor/health` | System health check | No |
| GET | `/api/monitor/thread-pool` | Thread pool statistics | No |
| GET | `/api/monitor/tcp/status` | TCP server status | No |
| GET | `/api/monitor/nio/status` | NIO server status | No |
| GET | `/api/monitor/ssl/status` | SSL server status | No |
| GET | `/api/monitor/multicast/status` | Multicast service status | No |
| GET | `/api/monitor/websocket/status` | WebSocket server status | No |
| GET | `/api/monitor/database` | Database connection status | No |
| GET | `/api/monitor/auctions/stats` | Auction statistics | No |
| GET | `/api/monitor/active-auctions` | Count of active auctions | No |
| GET | `/api/monitor/bids/stats` | Bidding statistics | No |
| GET | `/api/monitor/transactions/stats` | Transaction statistics | No |
| GET | `/api/monitor/system/metrics` | System resource metrics | No |

---

### 11. WebSocket Endpoints (`/ws`)

| Endpoint | Description |
|----------|-------------|
| `/ws/auctions` | Real-time auction updates |
| `/ws/bids` | Real-time bid notifications |
| `/ws/notifications` | Real-time user notifications |

**Example - WebSocket Connection:**
```javascript
const socket = new WebSocket('ws://localhost:8080/ws/auctions');
socket.onmessage = (event) => {
  console.log('Auction update:', JSON.parse(event.data));
};
```

---

### 12. Health Check Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/` | Root endpoint | No |
| GET | `/api/health` | Health check | No |

---

## Complete Endpoint Checklist (62 Total)

### Authentication (2)
- [x] POST `/api/auth/register`
- [x] POST `/api/auth/login`

### User Management (7)
- [x] POST `/api/users/register`
- [x] POST `/api/users/login`
- [x] GET `/api/users/{id}`
- [x] GET `/api/users`
- [x] GET `/api/users/active`
- [x] PUT `/api/users/{id}`
- [x] DELETE `/api/users/{id}`

### Auction Management (11)
- [x] POST `/api/auctions`
- [x] GET `/api/auctions`
- [x] GET `/api/auctions/active`
- [x] GET `/api/auctions/{id}`
- [x] GET `/api/auctions/seller/{sellerId}`
- [x] GET `/api/auctions/user/{userId}/participated`
- [x] GET `/api/auctions/search`
- [x] GET `/api/auctions/{id}/highest-bid`
- [x] PUT `/api/auctions/{id}`
- [x] DELETE `/api/auctions/{id}`
- [x] POST `/api/auctions/{id}/close`

### Bidding (5)
- [x] POST `/api/bids`
- [x] GET `/api/bids/auction/{auctionId}`
- [x] GET `/api/bids/user/{userId}`
- [x] GET `/api/bids/{bidId}`
- [x] GET `/api/bids/auction/{auctionId}/highest`

### Wallet (4)
- [x] POST `/api/wallet/deposit`
- [x] POST `/api/wallet/withdraw`
- [x] GET `/api/wallet/balance/{userId}`
- [x] GET `/api/wallet/transactions/{userId}`

### Transactions (4)
- [x] POST `/api/transactions/payment`
- [x] GET `/api/transactions/user/{userId}`
- [x] GET `/api/transactions/{transactionId}`
- [x] GET `/api/transactions/auction/{auctionId}`

### Notifications (3)
- [x] GET `/api/notifications/user/{userId}`
- [x] GET `/api/notifications/user/{userId}/unread`
- [x] PUT `/api/notifications/{notificationId}/read`

### File Upload (2)
- [x] POST `/api/upload/auction-image`
- [x] DELETE `/api/upload/auction-image/{filename}`

### Admin (5)
- [x] GET `/api/admin/stats`
- [x] GET `/api/admin/users`
- [x] POST `/api/admin/auctions/{id}/close`
- [x] GET `/api/admin/tcp/connections`
- [x] GET `/api/admin/nio/connections`

### Monitoring (13)
- [x] GET `/api/monitor/health`
- [x] GET `/api/monitor/thread-pool`
- [x] GET `/api/monitor/tcp/status`
- [x] GET `/api/monitor/nio/status`
- [x] GET `/api/monitor/ssl/status`
- [x] GET `/api/monitor/multicast/status`
- [x] GET `/api/monitor/websocket/status`
- [x] GET `/api/monitor/database`
- [x] GET `/api/monitor/auctions/stats`
- [x] GET `/api/monitor/active-auctions`
- [x] GET `/api/monitor/bids/stats`
- [x] GET `/api/monitor/transactions/stats`
- [x] GET `/api/monitor/system/metrics`

### WebSocket (3)
- [x] WS `/ws/auctions`
- [x] WS `/ws/bids`
- [x] WS `/ws/notifications`

### Health (2)
- [x] GET `/api/`
- [x] GET `/api/health`

### Migration (1)
- [x] GET `/api/migrate/run`

---

## Testing Summary

All 62 endpoints have been tested and verified working:
- **Authentication**: 2/2 working
- **User Management**: 7/7 working
- **Auction Management**: 11/11 working
- **Bidding**: 5/5 working
- **Wallet**: 4/4 working
- **Transactions**: 4/4 working
- **Notifications**: 3/3 working
- **File Upload**: 2/2 working
- **Admin**: 5/5 working (requires ADMIN role)
- **Monitoring**: 13/13 working
- **WebSocket**: 3/3 working
- **Health**: 2/2 working
- **Migration**: 1/1 working

## Database Schema

### Users Table
- user_id (PK)
- username
- email
- password_hash
- balance
- created_at
- is_active

### Auctions Table
- auction_id (PK)
- seller_id (FK → users)
- item_name
- description
- image_url
- starting_price
- current_price
- start_time
- mandatory_end_time
- bid_gap_duration
- current_deadline
- status (PENDING, ACTIVE, ENDING_SOON, ENDED, CANCELLED)
- winner_id (FK → users)
- created_at

### Bids Table
- bid_id (PK)
- auction_id (FK → auctions)
- bidder_id (FK → users)
- bid_amount
- bid_time
- status (ACCEPTED, REJECTED, OUTBID, WINNING)

### Transactions Table
- transaction_id (PK)
- buyer_id (FK → users)
- seller_id (FK → users)
- auction_id (FK → auctions)
- amount
- payment_method
- status (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED)
- transaction_time

## Network Programming Components

See detailed implementation in the **Project Structure** section above. Quick reference:

### Member 1: TCP Socket Server (Port 8081)
- ✅ Implemented in `network/tcp/TCPBidServer.java`
- Multi-threaded TCP server handling bid requests
- Socket-based communication with request/response protocol
- Integrated with BidService for real-time bid processing

### Member 2: Multithreading & Concurrency
- ✅ Implemented across multiple components:
  - `scheduler/AuctionScheduler.java` - Scheduled tasks (@Scheduled, runs every 30 seconds)
  - `controller/admin/ThreadPoolMonitorController.java` - Thread pool monitoring endpoints
  - `service/BidService.java` - Thread-safe with `synchronized` method
  - `network/tcp/TCPBidServer.java` - Multi-threaded TCP server with ExecutorService (Member 1 integration)
- Thread pool configured in application.properties (50 core threads, 100 max)
- Thread-safe bid processing with `synchronized` keyword
- Real-time thread statistics via admin monitoring endpoints

### Member 3: UDP Multicast Broadcasting (230.0.0.1:4446)
- ✅ Implemented in `network/multicast/`
- `MulticastBroadcaster.java` - Broadcasts price updates
- `MulticastReceiver.java` - Receives multicast messages
- Real-time auction updates to all subscribers using group communication

### Member 4: NIO - Non-blocking I/O (Port 8082)
- ✅ Implemented in `network/nio/NIOBidServer.java`
- Selector-based server with channel I/O
- Single-threaded handling of 100+ concurrent connections
- Non-blocking bid processing

### Member 5: SSL/TLS Security (Port 8443)
- ✅ Implemented in `network/ssl/SSLPaymentServer.java`
- Secure payment processing with TLS encryption
- Certificate-based authentication (keystore.p12)
- Encrypted transaction communication

## Next Steps

1. **Configure Database:** Update application.properties with your PostgreSQL credentials
2. **Test REST API:** Use Postman or curl to test endpoints
3. **Implement Network Components:** Each member implements their assigned network programming feature
4. **Generate SSL Certificate:** Run keytool to generate keystore.jks for SSL/TLS
5. **Frontend Integration:** Connect with Next.js frontend

## Testing

```bash
# Run tests
mvn test

# Run with profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Notes

- The application uses `spring.jpa.hibernate.ddl-auto=update` which automatically creates/updates tables
- Password hashing is simplified for demo - implement BCrypt in production
- CORS is configured for http://localhost:3000 (Next.js default)
- Scheduled tasks run for auction deadline management

## Contributors

- **Member 1:** TCP Sockets Implementation
- **Member 2:** Multithreading & Concurrency
- **Member 3:** Multicast Broadcasting
- **Member 4:** NIO Implementation
- **Member 5:** SSL/TLS Security
