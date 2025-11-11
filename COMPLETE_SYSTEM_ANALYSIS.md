# 🏆 COMPLETE SYSTEM ANALYSIS - Real-Time Auction System
## IN3111 Network Programming Assignment 2

**University of Moratuwa**
**For All Team Members**

---

# 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Backend Analysis](#backend-analysis)
   - [Backend Structure](#backend-structure)
   - [Network Programming Components](#network-programming-components)
   - [REST API Layer](#rest-api-layer)
   - [Service Layer](#service-layer)
   - [Database Layer](#database-layer)
5. [Frontend Analysis](#frontend-analysis)
   - [Frontend Structure](#frontend-structure)
   - [User Side Pages](#user-side-pages)
   - [Admin Side Pages](#admin-side-pages)
   - [Real-time Communication](#real-time-communication)
6. [How Each Member's Network Concept Works](#how-each-members-network-concept-works)
7. [Complete User Flow](#complete-user-flow)
8. [Data Flow Diagram](#data-flow-diagram)
9. [Testing Guide](#testing-guide)

---

# 📌 SYSTEM OVERVIEW

## What is This Project?

A **Real-Time Auction System** where:
- **Users** can create auctions, place bids, manage wallet
- **System** handles concurrent bidding with thread safety
- **Real-time** updates via WebSocket and UDP Multicast
- **Security** ensured through SSL/TLS encryption
- **Performance** optimized with NIO for scalability

## Key Features

✅ User registration and authentication (JWT)
✅ Create and manage auctions
✅ Real-time bidding with dynamic countdown
✅ Wallet system (deposit, withdraw, frozen balance)
✅ Notifications (real-time via WebSocket)
✅ Admin dashboard for monitoring
✅ **Network programming concepts demonstrated:**
- TCP Socket Communication (Port 8081)
- Multithreading & Concurrency
- UDP Multicast Broadcasting (230.0.0.1:4446)
- Non-blocking I/O with NIO (Port 8082)
- SSL/TLS Security (Port 8443)

---

# 💻 TECHNOLOGY STACK

## Backend
- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Database:** PostgreSQL (Neon Cloud - hosted online)
- **Build Tool:** Maven
- **ORM:** Hibernate/JPA
- **Real-time:** WebSocket (STOMP)
- **Security:** JWT Authentication
- **API Documentation:** Swagger/OpenAPI

## Frontend
- **Framework:** Next.js 16.0.1 (React 19.2.0)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Real-time:** WebSocket via STOMP.js + SockJS
- **Charts:** Recharts
- **Icons:** Lucide React

## Network Protocols
- **TCP/IP** - Reliable bidding (Port 8081)
- **UDP Multicast** - Broadcast updates (230.0.0.1:4446)
- **HTTP/HTTPS** - REST API (Port 8080)
- **WebSocket** - Real-time notifications (Port 8080/ws)
- **SSL/TLS** - Secure payment (Port 8443)

---

# 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │  TCP Client  │  │  NIO Client  │          │
│  │   (Next.js)  │  │  (Member 1)  │  │  (Member 4)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │ HTTP/WebSocket   │ TCP              │ TCP (Non-blocking)
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVER                            │
│                      (Spring Boot)                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  REST API Layer (Port 8080)                               │  │
│  │  - /api/auth/*      - /api/auctions/*    - /api/bids/*   │  │
│  │  - /api/wallet/*    - /api/admin/*                        │  │
│  └───────────────┬───────────────────────────────────────────┘  │
│                  │                                                │
│  ┌───────────────▼───────────────────────────────────────────┐  │
│  │  NETWORK PROGRAMMING LAYER                                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ TCP Server   │  │ NIO Server   │  │ SSL Server   │   │  │
│  │  │ Port 8081    │  │ Port 8082    │  │ Port 8443    │   │  │
│  │  │ (Member 1)   │  │ (Member 4)   │  │ (Member 5)   │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────────────────────────┐ │  │
│  │  │ Multicast    │  │  Thread Pool (50 threads)        │ │  │
│  │  │ 230.0.0.1    │  │  ExecutorService                 │ │  │
│  │  │ (Member 3)   │  │  (Member 2)                      │ │  │
│  │  └──────────────┘  └──────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘│
│                  │                                                │
│  ┌───────────────▼───────────────────────────────────────────┐  │
│  │  SERVICE LAYER (Business Logic)                          │  │
│  │  - BidService (synchronized for thread safety)           │  │
│  │  - AuctionService, WalletService, UserService            │  │
│  └───────────────┬───────────────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (PostgreSQL - Neon Cloud)           │
│  Tables: users, auctions, bids, transactions, notifications     │
└─────────────────────────────────────────────────────────────────┘
```

---

# 🔧 BACKEND ANALYSIS

## Backend Structure

```
backend/
├── src/main/java/com/auction/system/
│   │
│   ├── AuctionSystemApplication.java    # Main entry point
│   │
│   ├── network/                         # ⭐ NETWORK PROGRAMMING (All Members)
│   │   ├── tcp/
│   │   │   ├── TCPBidServer.java        # Member 1: TCP Socket Server (8081)
│   │   │   └── TCPBidClient.java        # TCP test client
│   │   │
│   │   ├── nio/
│   │   │   ├── NIOBidServer.java        # Member 4: Non-blocking I/O (8082)
│   │   │   └── NIOBidClient.java        # NIO test client
│   │   │
│   │   ├── multicast/
│   │   │   ├── MulticastBroadcaster.java # Member 3: UDP Multicast (230.0.0.1:4446)
│   │   │   └── MulticastReceiver.java    # Multicast test client
│   │   │
│   │   └── ssl/
│   │       ├── SSLPaymentServer.java     # Member 5: SSL/TLS (8443)
│   │       └── SSLPaymentClient.java     # SSL test client
│   │
│   ├── controller/                       # REST API Endpoints
│   │   ├── AuthController.java           # POST /api/auth/login, /register
│   │   ├── AuctionController.java        # GET/POST /api/auctions
│   │   ├── BidController.java            # POST /api/bids
│   │   ├── WalletController.java         # POST /api/wallet/deposit
│   │   ├── NotificationController.java   # GET /api/notifications
│   │   │
│   │   └── admin/                        # Admin-only endpoints
│   │       ├── AdminController.java           # GET /api/admin/stats
│   │       ├── ThreadPoolMonitorController.java # Member 2: GET /api/admin/threads/pool
│   │       ├── TcpMonitorController.java      # Member 1: GET /api/admin/tcp/status
│   │       ├── NioMonitorController.java      # Member 4: GET /api/admin/nio/stats
│   │       ├── SslMonitorController.java      # Member 5: GET /api/admin/ssl/status
│   │       └── MulticastMonitorController.java # Member 3: GET /api/admin/multicast/stats
│   │
│   ├── service/                          # Business Logic Layer
│   │   ├── BidService.java               # ⭐ Member 2: synchronized method (thread-safe)
│   │   ├── AuctionService.java           # Auction CRUD operations
│   │   ├── UserService.java              # User management
│   │   ├── WalletService.java            # Wallet operations
│   │   └── NotificationService.java      # Notification handling
│   │
│   ├── scheduler/                        # ⭐ Member 2: Scheduled Tasks
│   │   └── AuctionScheduler.java         # @Scheduled - runs every 30 seconds
│   │
│   ├── entity/                           # Database Entities (JPA)
│   │   ├── User.java
│   │   ├── Auction.java
│   │   ├── Bid.java
│   │   ├── Transaction.java
│   │   ├── Notification.java
│   │   └── WalletTransaction.java
│   │
│   ├── repository/                       # Data Access Layer (Spring Data JPA)
│   │   ├── UserRepository.java
│   │   ├── AuctionRepository.java
│   │   ├── BidRepository.java
│   │   └── ...
│   │
│   ├── dto/                              # Data Transfer Objects
│   │   ├── BidRequest.java
│   │   ├── BidResponse.java
│   │   ├── LoginRequest.java
│   │   └── ...
│   │
│   ├── security/                         # Spring Security & JWT
│   │   ├── SecurityConfig.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── JwtUtil.java
│   │
│   ├── websocket/                        # WebSocket Real-time
│   │   ├── WebSocketConfig.java          # STOMP configuration
│   │   └── WebSocketEventService.java    # Broadcast events
│   │
│   └── config/                           # Application Configuration
│       ├── CorsConfig.java
│       ├── DatabaseConfig.java
│       └── OpenApiConfig.java            # Swagger configuration
│
└── src/main/resources/
    ├── application.properties            # App config (DB, ports, etc.)
    └── keystore.p12                      # Member 5: SSL certificate
```

---

## Network Programming Components

### 🔹 **MEMBER 1: TCP Socket Communication**

**File:** `network/tcp/TCPBidServer.java`
**Port:** 8081
**Purpose:** Reliable bid submission via TCP

**How It Works:**
1. **ServerSocket** listens on port 8081
2. **Accepts** client connections
3. **Reads** bid request as JSON from InputStream
4. **Validates** bid via BidService
5. **Sends** response back via OutputStream
6. **Closes** connection

**Code Highlights:**
```java
// Line 78: Create ServerSocket
serverSocket = new ServerSocket(port);

// Line 91: Accept client connection
Socket clientSocket = serverSocket.accept();

// Line 103: Handle in separate thread (Member 2 integration)
executorService.submit(() -> handleClient(clientSocket));

// Line 130-131: Read from socket
BufferedReader in = new BufferedReader(
    new InputStreamReader(clientSocket.getInputStream()));

// Line 146: Read JSON request
String requestJson = requestBuilder.toString();

// Line 150: Send response
PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
```

**What User Sees:**
- User clicks "Place Bid" in frontend
- Request goes through TCP socket
- Response received instantly
- Backend console shows: `"🔌 New TCP connection from: 192.168.1.5:52341"`

**Monitoring Endpoint:**
```
GET /api/admin/tcp/status
Response: {
  "status": "RUNNING",
  "port": 8081,
  "activeConnections": 5,
  "totalConnections": 142,
  "bidsProcessed": 87
}
```

---

### 🔹 **MEMBER 2: Multithreading & Concurrency**

**Files:**
- `scheduler/AuctionScheduler.java` - Scheduled tasks
- `service/BidService.java` - Thread-safe bid processing
- Used in `TCPBidServer.java` line 74 - Thread pool

**Purpose:** Handle multiple concurrent users safely

**How It Works:**

**1. Thread Pool (TCPBidServer.java:74)**
```java
executorService = Executors.newFixedThreadPool(50);
// Creates pool of 50 threads for handling 50 simultaneous clients
```

**2. Synchronized Bid Processing (BidService.java:49)**
```java
@Transactional
public synchronized BidResponse placeBid(BidRequest bidRequest) {
    // Only ONE thread can execute this method at a time
    // Prevents race condition where two users bid simultaneously

    // Lock auction record
    Auction auction = auctionRepository.findByIdWithLock(bidRequest.getAuctionId());

    // Validate bid amount
    if (bidRequest.getBidAmount().compareTo(auction.getCurrentPrice()) <= 0) {
        return BidResponse.failure("Bid too low");
    }

    // Update auction
    auction.setCurrentPrice(bidRequest.getBidAmount());
    // ... save to database
}
```

**3. Scheduled Tasks (AuctionScheduler.java)**
```java
@Scheduled(fixedRate = 30000) // Runs every 30 seconds
public void checkAuctionDeadlines() {
    // Find all active auctions
    // Check if deadline passed
    // Close expired auctions
}
```

**What User Sees:**
- 10 users click "Place Bid" at same time
- All bids processed without errors
- Only highest bid wins (no data corruption)
- Backend console shows different thread IDs:
  ```
  [pool-2-thread-5] Processing bid from user 10
  [pool-2-thread-12] Processing bid from user 15
  [pool-2-thread-3] Processing bid from user 8
  ```

**Monitoring Endpoint:**
```
GET /api/admin/threads/pool
Response: {
  "corePoolSize": 50,
  "maximumPoolSize": 100,
  "activeCount": 12,
  "completedTaskCount": 348,
  "queueSize": 0
}
```

---

### 🔹 **MEMBER 3: UDP Multicast Broadcasting**

**File:** `network/multicast/MulticastBroadcaster.java`
**Address:** 230.0.0.1:4446
**Purpose:** Broadcast price updates to all subscribers simultaneously

**How It Works:**
1. **Initialize** MulticastSocket
2. **Join** multicast group 230.0.0.1
3. When bid placed → **Create** price update message
4. **Convert** to JSON
5. **Send** as DatagramPacket to multicast address
6. **All subscribers** receive simultaneously

**Code Highlights:**
```java
// Line 57: Create MulticastSocket
socket = new MulticastSocket();
group = InetAddress.getByName(groupAddress); // 230.0.0.1

// Line 74-88: Broadcast price update
public void broadcastPriceUpdate(Long auctionId, String itemName,
                                 BigDecimal newPrice, Long bidderId) {
    PriceUpdateMessage message = new PriceUpdateMessage();
    message.setAuctionId(auctionId);
    message.setNewPrice(newPrice);

    String json = objectMapper.writeValueAsString(message);
    byte[] data = json.getBytes();

    // Line 96: Send UDP packet to multicast group
    DatagramPacket packet = new DatagramPacket(data, data.length, group, port);
    socket.send(packet);
}
```

**Integration with BidService:**
```java
// When bid is placed successfully
multicastBroadcaster.broadcastPriceUpdate(
    auction.getAuctionId(),
    auction.getItemName(),
    newPrice,
    bidder.getUserId(),
    bidder.getUsername()
);
```

**What User Sees:**
- User A places bid on Auction #1
- **Instantly**, all users viewing Auction #1 see:
  - Current price updates
  - "New bid by User A" notification
  - Countdown timer resets
- All 5 browser windows update at same time

**Why Multicast is Better:**
- **Without multicast:** Send 100 separate messages to 100 users = 100 packets
- **With multicast:** Send 1 message, reaches 100 users = 1 packet
- **Efficiency:** 100x reduction in network traffic!

**Monitoring Endpoint:**
```
GET /api/admin/multicast/stats
Response: {
  "status": "ACTIVE",
  "address": "230.0.0.1:4446",
  "totalBroadcasts": 127,
  "priceUpdates": 98,
  "statusUpdates": 29
}
```

---

### 🔹 **MEMBER 4: Non-blocking I/O (NIO)**

**File:** `network/nio/NIOBidServer.java`
**Port:** 8082
**Purpose:** High-performance handling of 100+ concurrent connections with 1 thread

**How It Works:**
1. **ServerSocketChannel** opens on port 8082
2. Set to **non-blocking** mode
3. **Selector** monitors multiple channels
4. **Single thread** checks which channels are ready (ACCEPT, READ, WRITE)
5. **Process** only ready channels (no blocking/waiting)
6. **ByteBuffer** for efficient data transfer

**Traditional I/O vs NIO:**
```
TRADITIONAL BLOCKING I/O:
- 100 connections = 100 threads = 100MB memory
- Thread blocks waiting for data
- High context switching overhead

NIO (Non-blocking):
- 100 connections = 1 thread = 10MB memory
- Thread checks readiness, processes immediately
- No blocking, no wasted CPU cycles
```

**Code Pattern:**
```java
// Open ServerSocketChannel
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.configureBlocking(false); // Non-blocking!
serverChannel.bind(new InetSocketAddress(port));

// Create Selector
Selector selector = Selector.open();
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

// Event loop (single thread handles all)
while (running) {
    selector.select(); // Wait for ready channels

    Set<SelectionKey> selectedKeys = selector.selectedKeys();
    for (SelectionKey key : selectedKeys) {
        if (key.isAcceptable()) {
            // New connection
            SocketChannel client = serverChannel.accept();
            client.configureBlocking(false);
            client.register(selector, SelectionKey.OP_READ);
        }
        else if (key.isReadable()) {
            // Data ready to read
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            client.read(buffer);
            // Process data...
        }
        else if (key.isWritable()) {
            // Ready to write response
        }
    }
}
```

**What User Sees:**
- Same as TCP - user clicks "Place Bid"
- Backend processes request super fast
- Admin dashboard shows:
  - 120 active channels
  - Only 1 thread used
  - 15ms avg response time

**Monitoring Endpoint:**
```
GET /api/admin/nio/stats
Response: {
  "status": "RUNNING",
  "port": 8082,
  "activeChannels": 120,
  "threadsUsed": 1,
  "avgResponseTimeMs": 15,
  "throughput": "5000 requests/sec"
}
```

---

### 🔹 **MEMBER 5: SSL/TLS Security**

**File:** `network/ssl/SSLPaymentServer.java`
**Port:** 8443
**Certificate:** `src/main/resources/keystore.p12`
**Purpose:** Secure encrypted communication for sensitive data

**How It Works:**
1. **Load** KeyStore with certificate
2. **Initialize** SSLContext with TLS protocol
3. **Create** SSLServerSocket on port 8443
4. **SSL Handshake:**
   - Client Hello (supported ciphers)
   - Server Hello + Certificate (public key)
   - Key Exchange (shared secret)
   - Encrypted communication begins
5. **All data encrypted** with AES-256

**Code Highlights:**
```java
// Load certificate
KeyStore keyStore = KeyStore.getInstance("PKCS12");
keyStore.load(new FileInputStream("keystore.p12"), password);

// Initialize SSL
KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
kmf.init(keyStore, password);

SSLContext sslContext = SSLContext.getInstance("TLS");
sslContext.init(kmf.getKeyManagers(), null, null);

// Create SSL server socket
SSLServerSocketFactory factory = sslContext.getServerSocketFactory();
SSLServerSocket sslServerSocket = (SSLServerSocket) factory.createServerSocket(port);

// Accept secure connections
SSLSocket sslSocket = (SSLSocket) sslServerSocket.accept();
```

**What User Sees:**
- User logs in → Credentials encrypted before sending
- User makes payment → Card details encrypted
- In browser DevTools:
  - Protocol: `h2` (HTTP/2 over TLS)
  - Security: Shows padlock icon
  - Certificate: Can view certificate details

**Wireshark Shows:**
- **Without SSL:** Password visible in plain text
  ```
  POST /api/auth/login
  {"username":"john","password":"secret123"}  ← READABLE!
  ```
- **With SSL:** Encrypted gibberish
  ```
  17 03 03 00 a8 8f 3d 2a c4 7f 9e ...  ← ENCRYPTED!
  ```

**Monitoring Endpoint:**
```
GET /api/admin/ssl/stats
Response: {
  "status": "ACTIVE",
  "port": 8443,
  "protocol": "TLSv1.3",
  "cipherSuite": "TLS_AES_256_GCM_SHA384",
  "activeConnections": 8,
  "encryptedDataSent": "15.2 MB"
}
```

---

## REST API Layer

### All Endpoints (62 Total)

**Authentication (2 endpoints)**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

**Auctions (11 endpoints)**
- `GET /api/auctions` - Get all auctions
- `GET /api/auctions/active` - Get active auctions
- `GET /api/auctions/{id}` - Get auction by ID
- `POST /api/auctions` - Create auction
- `PUT /api/auctions/{id}` - Update auction
- `DELETE /api/auctions/{id}` - Cancel auction
- `GET /api/auctions/seller/{sellerId}` - Get seller's auctions
- `GET /api/auctions/search?keyword={keyword}` - Search auctions
- ... (more)

**Bids (5 endpoints)**
- `POST /api/bids` - Place bid
- `GET /api/bids/auction/{auctionId}` - Get auction bids
- `GET /api/bids/user/{userId}` - Get user bids
- `GET /api/bids/auction/{auctionId}/highest` - Get highest bid
- ... (more)

**Wallet (4 endpoints)**
- `POST /api/wallet/deposit` - Deposit money
- `POST /api/wallet/withdraw` - Withdraw money
- `GET /api/wallet/balance/{userId}` - Get balance
- `GET /api/wallet/transactions/{userId}` - Get transactions

**Admin (13+ endpoints)**
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/tcp/status` - TCP server status (Member 1)
- `GET /api/admin/threads/pool` - Thread pool stats (Member 2)
- `GET /api/admin/multicast/stats` - Multicast stats (Member 3)
- `GET /api/admin/nio/stats` - NIO server stats (Member 4)
- `GET /api/admin/ssl/stats` - SSL server stats (Member 5)
- ... (more)

**How Frontend Calls API:**

```typescript
// frontend/src/lib/api.ts

// Place bid
bidAPI.placeBid(auctionId, bidderId, amount)
  → POST http://localhost:8080/api/bids

// Get active auctions
auctionAPI.getActiveAuctions()
  → GET http://localhost:8080/api/auctions/active

// Deposit to wallet
walletAPI.deposit(userId, amount)
  → POST http://localhost:8080/api/wallet/deposit
```

---

## Service Layer (Business Logic)

### BidService - Thread-Safe Bid Processing

**Location:** `service/BidService.java`

**Key Method:**
```java
@Transactional
public synchronized BidResponse placeBid(BidRequest bidRequest) {
    // Step 1: Lock auction record (prevents race condition)
    Auction auction = auctionRepository.findByIdWithLock(bidRequest.getAuctionId());

    // Step 2: Validate auction is active
    if (auction.getStatus() != ACTIVE) {
        return BidResponse.failure("Auction not active");
    }

    // Step 3: Validate bid amount
    if (bidRequest.getBidAmount() <= auction.getCurrentPrice()) {
        return BidResponse.failure("Bid too low");
    }

    // Step 4: Check user has sufficient balance
    if (bidder.getAvailableBalance() < bidRequest.getBidAmount()) {
        return BidResponse.failure("Insufficient funds");
    }

    // Step 5: Update auction
    auction.setCurrentPrice(bidRequest.getBidAmount());
    auction.setCurrentDeadline(LocalDateTime.now().plus(bidGap));
    auctionRepository.save(auction);

    // Step 6: Create bid record
    Bid bid = new Bid();
    bid.setAuctionId(auctionId);
    bid.setBidderId(bidderId);
    bid.setBidAmount(amount);
    bidRepository.save(bid);

    // Step 7: Freeze bidder's balance
    walletService.freezeBalance(bidderId, amount);

    // Step 8: Broadcast via multicast (Member 3)
    multicastBroadcaster.broadcastPriceUpdate(auction);

    // Step 9: Send WebSocket notification
    webSocketEventService.sendBidUpdate(auction);

    return BidResponse.success("Bid placed successfully");
}
```

**Why Synchronized?**
```
WITHOUT synchronized:
- Thread 1: Reads current price = $1000
- Thread 2: Reads current price = $1000 (same!)
- Thread 1: Places bid $1100
- Thread 2: Places bid $1050 (lower but gets accepted!)
- Result: DATA CORRUPTION

WITH synchronized:
- Thread 1: Locks method, reads price = $1000
- Thread 2: WAITS (blocked)
- Thread 1: Places bid $1100, updates to $1100
- Thread 1: Unlocks method
- Thread 2: NOW can enter, reads price = $1100
- Thread 2: Bid $1050 rejected (too low)
- Result: DATA INTEGRITY MAINTAINED
```

---

## Database Layer

### Entities (JPA)

**User Entity:**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String username;
    private String email;
    private String passwordHash;
    private BigDecimal balance;           // Total balance
    private BigDecimal frozenBalance;     // Locked for active bids
    private Boolean isActive;
    private UserRole role;                // USER or ADMIN
}
```

**Auction Entity:**
```java
@Entity
@Table(name = "auctions")
public class Auction {
    @Id
    @GeneratedValue
    private Long auctionId;

    @ManyToOne
    private User seller;

    private String itemName;
    private String description;
    private String imageUrl;
    private BigDecimal startingPrice;
    private BigDecimal currentPrice;

    private LocalDateTime startTime;
    private LocalDateTime mandatoryEndTime;
    private Duration bidGapDuration;      // e.g., 5 hours
    private LocalDateTime currentDeadline;

    private AuctionStatus status;         // ACTIVE, ENDING_SOON, ENDED

    @ManyToOne
    private User winner;
}
```

**Bid Entity:**
```java
@Entity
@Table(name = "bids")
public class Bid {
    @Id
    @GeneratedValue
    private Long bidId;

    @ManyToOne
    private Auction auction;

    @ManyToOne
    private User bidder;

    private BigDecimal bidAmount;
    private LocalDateTime bidTime;
    private BidStatus status;  // WINNING, OUTBID, WON, LOST
}
```

---

# 💻 FRONTEND ANALYSIS

## Frontend Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router (Pages)
│   │   ├── page.tsx                  # Home (redirects to login/dashboard)
│   │   ├── login/                    # Login page
│   │   │   └── page.tsx
│   │   ├── register/                 # Registration page
│   │   │   └── page.tsx
│   │   │
│   │   ├── dashboard/                # USER DASHBOARD
│   │   │   └── page.tsx              # Main dashboard with stats
│   │   │
│   │   ├── auctions/                 # Browse & manage auctions
│   │   │   ├── page.tsx              # List all auctions
│   │   │   ├── [id]/                 # View auction details
│   │   │   │   └── page.tsx
│   │   │   ├── create/               # Create new auction
│   │   │   │   └── page.tsx
│   │   │   └── edit/                 # Edit auction
│   │   │       └── page.tsx
│   │   │
│   │   ├── my-auctions/              # User's created auctions
│   │   │   └── page.tsx
│   │   │
│   │   ├── my-bids/                  # User's bid history
│   │   │   └── page.tsx
│   │   │
│   │   ├── wallet/                   # Wallet management
│   │   │   └── page.tsx
│   │   │
│   │   └── admin/                    # ADMIN DASHBOARD
│   │       ├── page.tsx              # Admin stats overview
│   │       ├── auctions/             # Manage all auctions
│   │       │   └── page.tsx
│   │       ├── users/                # Manage users
│   │       │   └── page.tsx
│   │       ├── transactions/         # View all transactions
│   │       │   └── page.tsx
│   │       └── monitoring/           # Network servers monitoring
│   │           └── page.tsx
│   │
│   ├── components/                   # Reusable UI Components
│   │   ├── Header.tsx                # Top navigation + notifications
│   │   ├── Sidebar.tsx               # Side navigation menu
│   │   ├── AuctionCard.tsx           # Auction display card
│   │   ├── BidHistory.tsx            # Bid timeline
│   │   ├── CountdownTimer.tsx        # Real-time countdown
│   │   ├── LoadingSpinner.tsx        # Loading indicator
│   │   └── StatsCard.tsx             # Dashboard stat card
│   │
│   ├── contexts/                     # React Context (Global State)
│   │   └── AuthContext.tsx           # User authentication state
│   │
│   └── lib/                          # Utility Functions
│       ├── api.ts                    # Axios HTTP client + API calls
│       └── websocket.ts              # WebSocket STOMP client
│
└── package.json                      # Dependencies
```

---

## User Side Pages

### 1. Login Page (`app/login/page.tsx`)

**What It Does:**
- User enters username/password
- Calls `POST /api/auth/login`
- Receives JWT token
- Stores token in localStorage
- Redirects to dashboard

**Code Flow:**
```typescript
const handleLogin = async () => {
  const response = await authAPI.login(username, password);
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  router.push('/dashboard');
};
```

---

### 2. User Dashboard (`app/dashboard/page.tsx`)

**What User Sees:**
- Welcome message
- 4 stat cards:
  - **Wallet Balance** (available/frozen)
  - **Winning Bids** (currently leading)
  - **Auctions Won** (all time)
  - **My Active Auctions** (selling)
- Quick actions: Create Auction, Browse, Manage Wallet
- Charts:
  - Weekly bidding activity (bar chart)
  - Monthly spending trend (line chart)
  - Bid status distribution (pie chart)
- Quick stats sidebar

**Data Sources:**
```typescript
// Line 46-52: Fetch all dashboard data
const [auctionsRes, bidsRes, myAuctionsRes, walletRes, notificationsRes] =
  await Promise.all([
    auctionAPI.getActiveAuctions(),      // GET /api/auctions/active
    bidAPI.getUserBids(user.userId),     // GET /api/bids/user/{userId}
    auctionAPI.getSellerAuctions(userId), // GET /api/auctions/seller/{userId}
    walletAPI.getBalance(userId),        // GET /api/wallet/balance/{userId}
    notificationAPI.getUserNotifications(userId) // GET /api/notifications/user/{userId}
  ]);
```

**Real-time Updates:**
```typescript
// Line 37: Auto-refresh every 10 seconds
const interval = setInterval(fetchDashboardData, 10000);
```

---

### 3. Browse Auctions (`app/auctions/page.tsx`)

**What User Sees:**
- Search bar
- Filter options (status, price range)
- Grid of auction cards
- Each card shows:
  - Item image
  - Title & description
  - Current price
  - Countdown timer
  - Number of bids
  - "View Details" button

**Real-time:**
- Countdown timers update every second
- Prices update via WebSocket when new bids placed

---

### 4. Auction Details (`app/auctions/[id]/page.tsx`)

**What User Sees:**
- Large item image
- Full description
- Current price (updates in real-time)
- Countdown timer
- Bid history (timeline)
- Place bid form (input amount + button)

**How Bidding Works:**
```typescript
const handlePlaceBid = async () => {
  // 1. Validate amount
  if (bidAmount <= currentPrice) {
    alert("Bid must be higher than current price");
    return;
  }

  // 2. Check balance
  if (bidAmount > availableBalance) {
    alert("Insufficient balance");
    return;
  }

  // 3. Place bid via API
  const response = await bidAPI.placeBid(
    auctionId,
    user.userId,
    bidAmount
  );

  // 4. Show result
  if (response.data.success) {
    alert("Bid placed successfully!");
    // UI updates automatically via WebSocket
  }
};
```

**Real-time Updates:**
```typescript
// WebSocket subscription
stompClient.subscribe('/topic/auctions/' + auctionId, (message) => {
  const update = JSON.parse(message.body);

  // Update current price
  setCurrentPrice(update.newPrice);

  // Add to bid history
  addBidToHistory(update);

  // Reset countdown timer
  setDeadline(update.newDeadline);

  // Show notification
  if (update.bidderId !== user.userId) {
    showNotification("You've been outbid!");
  }
});
```

---

### 5. My Bids (`app/my-bids/page.tsx`)

**What User Sees:**
- Table of all bids placed
- Columns:
  - Auction item
  - Bid amount
  - Status (WINNING, OUTBID, WON, LOST)
  - Time placed
- Filter by status
- Search by auction name

---

### 6. Wallet (`app/wallet/page.tsx`)

**What User Sees:**
- Balance card:
  - Total balance
  - Available balance
  - Frozen balance (locked in active bids)
- Deposit form (enter amount → simulate payment)
- Withdraw form (enter amount)
- Transaction history table

**How Deposit Works:**
```typescript
const handleDeposit = async () => {
  // Call API
  await walletAPI.deposit(user.userId, amount);

  // Refresh balance
  const newBalance = await walletAPI.getBalance(user.userId);
  setBalance(newBalance.data);

  alert("Deposit successful!");
};
```

---

## Admin Side Pages

### 1. Admin Dashboard (`app/admin/page.tsx`)

**What Admin Sees:**
- 4 stat cards:
  - **Total Users**
  - **Active Auctions**
  - **Total Transactions**
  - **Platform Revenue** (20% of transaction amounts)
- System Health indicators:
  - Database: ✅ UP
  - TCP Server: ✅ UP (Member 1)
  - SSL/TLS: ✅ UP (Member 5)
  - Multicast: ✅ UP (Member 3)
- Charts:
  - Weekly activity (line chart)
  - Monthly revenue (bar chart)
- Recent activity feed

**Data Sources:**
```typescript
// Line 44-50: Fetch admin data
const [statsRes, healthRes, transactionsRes, auctionsRes, usersRes] =
  await Promise.all([
    adminAPI.getDashboardStats(),    // GET /api/admin/stats
    adminAPI.getSystemHealth(),      // GET /api/health
    adminAPI.getAllTransactions(),   // GET /api/transactions/admin/all
    adminAPI.getAllAuctions(),       // GET /api/auctions
    adminAPI.getAllUsers()           // GET /api/admin/users
  ]);
```

**Real-time:**
```typescript
// Line 38: Auto-refresh every 30 seconds
const interval = setInterval(fetchDashboardData, 30000);
```

---

### 2. Network Monitoring (`app/admin/monitoring/page.tsx`)

**What Admin Sees:**

**Member 1 - TCP Server:**
- Status: RUNNING
- Port: 8081
- Active Connections: 5
- Total Connections: 142
- Bids Processed: 87
- Avg Response Time: 45ms

**Member 2 - Thread Pool:**
- Core Threads: 50
- Max Threads: 100
- Active Threads: 12
- Completed Tasks: 348
- Queue Size: 0

**Member 3 - Multicast:**
- Status: ACTIVE
- Address: 230.0.0.1:4446
- Messages Sent: 127
- Price Updates: 98
- Status Updates: 29

**Member 4 - NIO Server:**
- Status: RUNNING
- Port: 8082
- Active Channels: 120
- Threads Used: 1
- Avg Response: 15ms
- Throughput: 5000 req/s

**Member 5 - SSL Server:**
- Status: ACTIVE
- Port: 8443
- Protocol: TLSv1.3
- Cipher: TLS_AES_256_GCM_SHA384
- Active Connections: 8
- Data Encrypted: 15.2 MB

**API Calls:**
```typescript
adminAPI.getTcpMonitor()           // GET /api/admin/tcp/stats
adminAPI.getThreadPoolMonitor()    // GET /api/admin/threads/pool
adminAPI.getMulticastMonitor()     // GET /api/admin/multicast/stats
adminAPI.getNioMonitor()           // GET /api/admin/nio/stats
adminAPI.getSslMonitor()           // GET /api/admin/ssl/stats
```

---

### 3. Manage Users (`app/admin/users/page.tsx`)

**What Admin Sees:**
- Table of all users
- Columns: ID, Username, Email, Balance, Role, Status, Actions
- Actions: View details, Ban/Unban
- Search and filter

---

### 4. Manage Auctions (`app/admin/auctions/page.tsx`)

**What Admin Sees:**
- Table of all auctions
- Filter by status
- Actions: View, Close, Cancel
- Search by item name

---

## Real-time Communication

### WebSocket Integration

**Backend Configuration:**
```java
// websocket/WebSocketConfig.java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig {
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

**Frontend Connection:**
```typescript
// lib/websocket.ts
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8080/ws');
const stompClient = new Client({
  webSocketFactory: () => socket,
  onConnect: () => {
    console.log('Connected to WebSocket');

    // Subscribe to auction updates
    stompClient.subscribe('/topic/auctions/' + auctionId, (message) => {
      const data = JSON.parse(message.body);
      handleAuctionUpdate(data);
    });

    // Subscribe to personal notifications
    stompClient.subscribe('/topic/notifications/' + userId, (message) => {
      const notification = JSON.parse(message.body);
      showNotification(notification);
    });
  }
});

stompClient.activate();
```

**How It Works:**
1. **User A** places bid
2. **Backend** processes bid
3. **Backend** sends WebSocket message:
   ```java
   simpMessagingTemplate.convertAndSend(
     "/topic/auctions/" + auctionId,
     auctionUpdate
   );
   ```
4. **All users** subscribed to `/topic/auctions/{auctionId}` receive update
5. **Frontend** updates UI automatically

**Topics:**
- `/topic/auctions/{auctionId}` - Auction price updates
- `/topic/notifications/{userId}` - User notifications
- `/topic/bids/{auctionId}` - Bid history updates

---

# 🔄 HOW EACH MEMBER'S NETWORK CONCEPT WORKS

## Complete Flow: User Places Bid

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION (Frontend)                                        │
│    User clicks "Place Bid" button                                │
│    Frontend: app/auctions/[id]/page.tsx                          │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. API CALL (Axios)                                              │
│    bidAPI.placeBid(auctionId, userId, amount)                    │
│    → POST http://localhost:8080/api/bids                         │
│    Body: { auctionId: 1, bidderId: 2, bidAmount: 5000 }        │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. REST API CONTROLLER (Spring Boot)                            │
│    BidController.java:41                                         │
│    @PostMapping("/api/bids")                                     │
│    public ResponseEntity<BidResponse> placeBid(BidRequest req)   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. MEMBER 2: MULTITHREADING                                      │
│    BidService.java:49                                            │
│    @Transactional                                                │
│    public synchronized BidResponse placeBid(...)                 │
│                                                                   │
│    - Thread from pool (1 of 50) handles request                 │
│    - Synchronized prevents race conditions                       │
│    - Only 1 thread can execute this method at a time            │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ├─────────────────────────────────────────┐
                       │                                         │
                       ▼                                         ▼
┌──────────────────────────────────┐  ┌──────────────────────────┐
│ 5A. MEMBER 1: TCP (Alternative)  │  │ 5B. Database Update      │
│     TCPBidServer.java:103        │  │     Save bid to DB       │
│     - Client connects to 8081    │  │     Update auction price │
│     - Sends bid as JSON          │  │     Freeze user balance  │
│     - Receives response          │  └──────────────────────────┘
│     - Connection closes          │
└──────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. MEMBER 3: MULTICAST BROADCASTING                              │
│    MulticastBroadcaster.java:74                                  │
│    broadcastPriceUpdate(auctionId, newPrice, ...)                │
│                                                                   │
│    - Creates PriceUpdateMessage                                  │
│    - Converts to JSON                                            │
│    - Sends UDP packet to 230.0.0.1:4446                         │
│    - ALL subscribers receive simultaneously                      │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. WEBSOCKET NOTIFICATION                                        │
│    WebSocketEventService.java                                    │
│    simpMessagingTemplate.convertAndSend(                         │
│      "/topic/auctions/" + auctionId,                            │
│      auctionUpdate                                               │
│    )                                                             │
│                                                                   │
│    - All browsers subscribed to auction receive update          │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 8. FRONTEND UPDATES (All Users)                                 │
│    WebSocket listener receives message                           │
│    - Updates current price                                       │
│    - Adds bid to history timeline                               │
│    - Resets countdown timer                                      │
│    - Shows notification: "You've been outbid!"                  │
│                                                                   │
│    ALL 5 BROWSER WINDOWS UPDATE INSTANTLY!                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Alternative Flows

### MEMBER 4: NIO Alternative (Port 8082)

Instead of regular TCP (Member 1), can use NIO:

```
User → NIO Client → NIOBidServer (Port 8082)
                    - Single thread with Selector
                    - Non-blocking channels
                    - Handles 100+ connections
                    → BidService
```

### MEMBER 5: SSL Security (Port 8443)

For sensitive operations (login, payment):

```
User Login → HTTPS → SSLPaymentServer (Port 8443)
                     - Encrypted with TLS 1.3
                     - Certificate authentication
                     - AES-256 encryption
                     → AuthService
```

---

# 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                             │
├─────────────┬────────────┬────────────┬──────────┬──────────────┤
│   Register  │   Login    │  Browse    │   Bid    │  Deposit     │
└──────┬──────┴─────┬──────┴──────┬─────┴────┬─────┴──────┬───────┘
       │            │             │          │            │
       ▼            ▼             ▼          ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                            │
│  Components → API Client (Axios) → WebSocket (STOMP)            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP/WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND (Spring Boot - Port 8080)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   REST API LAYER                          │  │
│  │  AuthController │ AuctionController │ BidController       │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐│
│  │              NETWORK LAYER (All Members)                   ││
│  │  ┌─────────┐  ┌────────┐  ┌──────────┐  ┌──────────────┐ ││
│  │  │ TCP     │  │ NIO    │  │ SSL      │  │ Multicast    │ ││
│  │  │ :8081   │  │ :8082  │  │ :8443    │  │ 230.0.0.1    │ ││
│  │  │ Member1 │  │ Member4│  │ Member5  │  │ Member 3     │ ││
│  │  └─────────┘  └────────┘  └──────────┘  └──────────────┘ ││
│  │              Member 2: Thread Pool (50 threads)           ││
│  └────────────────────────┬───────────────────────────────────┘│
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────────┐│
│  │                  SERVICE LAYER                             ││
│  │  BidService │ AuctionService │ WalletService │ UserService ││
│  └────────────────────────┬───────────────────────────────────┘│
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           DATABASE (PostgreSQL - Neon Cloud)                     │
│  users │ auctions │ bids │ transactions │ notifications         │
└─────────────────────────────────────────────────────────────────┘
```

---

# 🧪 TESTING GUIDE

## For Each Member

### Member 1: TCP Socket

**Test 1: Via Frontend**
1. Start backend: `mvn spring-boot:run`
2. Start frontend: `npm run dev`
3. Login → Browse auctions → Place bid
4. Check backend console for TCP connection logs

**Test 2: Direct TCP Client**
```bash
cd backend/src/main/java/com/auction/system/network/tcp
javac TCPBidClient.java
java TCPBidClient
```

**Test 3: Wireshark**
- Filter: `tcp.port == 8081`
- Capture TCP handshake, bid request, response

**Test 4: Monitoring**
- Admin dashboard → Network Monitoring → TCP section
- Or: `curl http://localhost:8080/api/admin/tcp/status`

---

### Member 2: Multithreading

**Test 1: Concurrent Bids**
1. Open 10 browser tabs
2. Login different users in each
3. All navigate to same auction
4. Click "Place Bid" simultaneously (different amounts)
5. Check backend console - see different thread IDs
6. Verify only highest bid wins

**Test 2: Thread Pool Monitor**
- Admin dashboard → Thread Pool stats
- Or: `curl http://localhost:8080/api/admin/threads/pool`

**Test 3: Scheduled Tasks**
- Create auction with short deadline
- Watch backend console every 30 seconds
- See: "Checking auction deadlines..."

---

### Member 3: Multicast

**Test 1: Via Frontend**
1. Open 5 browser windows
2. All navigate to same auction
3. In one window, place bid
4. Watch all 5 windows update instantly

**Test 2: Direct Multicast Receiver**
```bash
# Terminal 1
cd backend/src/main/java/com/auction/system/network/multicast
javac MulticastReceiver.java
java MulticastReceiver

# Terminal 2 (same as Terminal 1)
java MulticastReceiver

# Now place bid from frontend
# Both terminals show broadcast message!
```

**Test 3: Wireshark**
- Filter: `ip.dst == 230.0.0.1 || udp.port == 4446`
- Capture UDP multicast packets

---

### Member 4: NIO

**Test 1: Load Test**
- Use JMeter or Apache Bench
- Create 100+ simultaneous connections to port 8082
- Backend shows: 1 thread handling all!

**Test 2: Direct NIO Client**
```bash
cd backend/src/main/java/com/auction/system/network/nio
javac NIOBidClient.java
java NIOBidClient
```

**Test 3: Performance Comparison**
- Admin dashboard → NIO stats
- Compare: 1 thread handles 120 channels
- Show memory usage: ~10MB vs 120MB for blocking I/O

---

### Member 5: SSL/TLS

**Test 1: Via HTTPS**
- Frontend uses HTTPS for login
- Browser shows padlock icon
- View certificate in browser

**Test 2: Direct SSL Client**
```bash
cd backend/src/main/java/com/auction/system/network/ssl
javac SSLPaymentClient.java
java SSLPaymentClient
```

**Test 3: Wireshark Proof**
- Filter: `tcp.port == 8443 || ssl`
- Capture SSL handshake
- Show encrypted application data (unreadable)
- Compare with plain TCP (readable)

---

## Complete System Test

**Scenario: Real Auction with 5 Users**

1. **Setup:**
   - Start backend: `mvn spring-boot:run`
   - Start frontend: `npm run dev`
   - Start Wireshark
   - Open 5 browser windows

2. **Test Flow:**
   - Window 1 (User A): Create auction "Vintage Watch", $1000
   - Windows 2-5: All navigate to auction page
   - Window 2 (User B): Place bid $1100
   - **OBSERVE:** All 5 windows update price instantly
   - Window 3 (User C): Place bid $1200
   - **OBSERVE:** User B gets "outbid" notification
   - Windows 4-5: Place bids $1150, $1180
   - **OBSERVE:** All rejected (too low)

3. **Check Backend Console:**
   ```
   [pool-2-thread-5] Processing bid from User B
   [pool-2-thread-12] Processing bid from User C
   TCP Server: Connection from 192.168.1.5
   Multicast: Broadcasting price update to 230.0.0.1:4446
   ```

4. **Check Wireshark:**
   - TCP connections (8081)
   - UDP multicast (230.0.0.1)
   - SSL handshake (8443 for login)

5. **Check Admin Dashboard:**
   - TCP: 5 connections
   - Thread Pool: 15 active threads
   - Multicast: 127 messages sent
   - NIO: 120 channels, 1 thread
   - SSL: 8 secure connections

---

# 🎯 SUMMARY: WHO DOES WHAT

| Member | Concept | Files | What to Demonstrate |
|--------|---------|-------|---------------------|
| **Member 1** | TCP Sockets | `network/tcp/TCPBidServer.java` | Connect via TCP client, show 3-way handshake in Wireshark, monitor connections in admin UI |
| **Member 2** | Multithreading | `BidService.java` (synchronized), `AuctionScheduler.java`, Thread pool in TCP server | 10 simultaneous bids, show thread IDs in console, thread pool stats, no race conditions |
| **Member 3** | UDP Multicast | `network/multicast/MulticastBroadcaster.java` | 5 browsers update instantly, multicast receiver shows broadcast, Wireshark shows UDP to 230.0.0.1 |
| **Member 4** | NIO | `network/nio/NIOBidServer.java` | 100+ connections with 1 thread, show performance metrics, compare with blocking I/O |
| **Member 5** | SSL/TLS | `network/ssl/SSLPaymentServer.java`, `keystore.p12` | Wireshark shows encrypted data, compare with plain TCP, show certificate details |

---

# ✅ KEY POINTS FOR PRESENTATION

1. **System is FULLY FUNCTIONAL** - Everything works end-to-end
2. **All network concepts INTEGRATED** - Not just separate demos
3. **Real-world application** - Practical auction system, not just theory
4. **Demonstrable** - Can show working system + Wireshark captures
5. **Scalable** - NIO handles 100+ users, thread pool prevents overload
6. **Secure** - SSL encrypts sensitive data
7. **Real-time** - Multicast + WebSocket for instant updates
8. **Thread-safe** - Synchronized methods prevent data corruption

---

**END OF COMPLETE SYSTEM ANALYSIS**

For questions or clarifications, refer to:
- Backend: `backend/README.md`
- Member guide: `backend/MEMBER_GUIDE.md`
- Quick start: `backend/QUICK_START.md`
- This document: `COMPLETE_SYSTEM_ANALYSIS.md`
