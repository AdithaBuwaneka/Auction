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
│   ├── entity/           # Database entities (User, Auction, Bid, Transaction)
│   ├── repository/       # JPA repositories
│   ├── service/          # Business logic layer
│   ├── controller/       # REST API controllers
│   ├── dto/              # Data Transfer Objects
│   ├── config/           # Configuration classes
│   └── network/          # Network programming implementations (TCP, NIO, SSL, Multicast)
├── src/main/resources/
│   ├── application.properties
│   └── keystore.jks      # SSL certificate (generate this)
└── pom.xml
```

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
- **TCP Server:** Port 8081 (to be implemented by Member 1)
- **NIO Server:** Port 8082 (to be implemented by Member 4)
- **SSL Server:** Port 8443 (to be implemented by Member 5)
- **Multicast:** 230.0.0.1:4446 (to be implemented by Member 3)

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

### Member 1: TCP Socket Server
- Implement TCP server on port 8081
- Handle bid requests via TCP sockets
- Integrate with BidService

### Member 2: Multithreading
- ExecutorService with 50 threads configured
- Thread-safe bid processing with pessimistic locking
- Concurrent user handling

### Member 3: UDP Multicast
- Broadcast price updates to 230.0.0.1:4446
- Real-time notifications to all auction subscribers

### Member 4: NIO (Non-blocking I/O)
- Implement Selector-based server on port 8082
- Handle 100+ concurrent connections with single thread

### Member 5: SSL/TLS
- Secure communication on port 8443
- Certificate-based authentication
- Encrypted payment processing

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
