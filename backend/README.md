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

### User Endpoints

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/active` - Get all active users

### Auction Endpoints

- `POST /api/auctions` - Create new auction
- `GET /api/auctions/active` - Get all active auctions
- `GET /api/auctions/{id}` - Get auction by ID
- `GET /api/auctions/seller/{sellerId}` - Get auctions by seller
- `GET /api/auctions/search?keyword=xyz` - Search auctions

### Bid Endpoints

- `POST /api/bids` - Place a bid
- `GET /api/bids/auction/{auctionId}` - Get bids for auction
- `GET /api/bids/user/{userId}` - Get bids by user

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
