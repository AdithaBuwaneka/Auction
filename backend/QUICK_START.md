# 🚀 Quick Start Guide - Real-Time Auction System Backend

**For Team Members: How to Run the Backend on Your Machine**

---

## ⚡ Quick Setup (5 Minutes)

### Option 1: Use Existing Database (Fastest - Recommended)

The backend is already configured with a working cloud database. You can run it immediately!

```bash
# 1. Navigate to backend folder
cd backend

# 2. Run the application (downloads dependencies + starts server)
mvn spring-boot:run
```

**That's it!** The backend will start with all features working.

---

## 📋 Prerequisites

- **Java 17 or higher** - [Download here](https://www.oracle.com/java/technologies/downloads/#java17)
- **Maven 3.6+** - Usually comes with IntelliJ/Eclipse, or [download here](https://maven.apache.org/download.cgi)
- **IDE (Optional)** - IntelliJ IDEA, Eclipse, or VS Code

### Check if you have Java & Maven:

```bash
java -version    # Should show Java 17+
mvn -version     # Should show Maven 3.6+
```

If not installed, download and install them first.

---

## 🏃 Running the Backend

### Method 1: Using Maven (Recommended)

```bash
# In the backend/ folder
mvn spring-boot:run
```

### Method 2: Using IDE

1. Open the `backend` folder in IntelliJ IDEA or Eclipse
2. Wait for Maven to download dependencies (first time only)
3. Right-click `AuctionSystemApplication.java`
4. Click "Run" or "Debug"

### Method 3: Build JAR and Run

```bash
# Build the JAR file
mvn clean package

# Run the JAR
java -jar target/auction-system-1.0.0.jar
```

---

## ✅ Verify Backend is Running

You should see this in the console:

```
║════════════════════════════════════════════════════════════════║
║                 AUCTION SYSTEM BACKEND STARTED                 ║
║════════════════════════════════════════════════════════════════║
║  REST API:     http://localhost:8080                          ║
║  Swagger UI:   http://localhost:8080/swagger-ui.html          ║
║  TCP Server:   Port 8081 (Member 1)                           ║
║  NIO Server:   Port 8082 (Member 4)                           ║
║  SSL Server:   Port 8443 (Member 5)                           ║
║  Multicast:    230.0.0.1:4446 (Member 3)                      ║
║════════════════════════════════════════════════════════════════║
```

### Test in Browser:

1. **Swagger UI:** http://localhost:8080/swagger-ui.html
2. **Health Check:** http://localhost:8080/api/health
3. **Root Endpoint:** http://localhost:8080/api/

All should work!

---

## 🔍 Testing Member-Specific Features

### 👤 Member 1: TCP Socket Server (Port 8081)

**Check Status:**
```bash
curl http://localhost:8080/api/admin/tcp/status
```

**Test with TCP Client:**
1. Locate `TCPBidClient.java` in `network/tcp/`
2. Run it as a Java application
3. It will connect to port 8081 and place a test bid

**Monitor Connections:**
- Swagger: http://localhost:8080/swagger-ui.html → "11. Network Monitoring - TCP"
- Endpoint: GET `/api/admin/tcp/connections`

---

### 👤 Member 2: Multithreading & Thread Pool

**Check Thread Pool Status:**
```bash
curl http://localhost:8080/api/admin/threads/pool
```

**View Thread Statistics:**
- Swagger: http://localhost:8080/swagger-ui.html → "10. Thread Pool Monitoring"
- Endpoint: GET `/api/admin/threads/pool`

**Test Concurrent Operations:**
1. Open 10 browser tabs
2. Go to Swagger UI in each
3. Place bids simultaneously on same auction
4. Check console logs for thread IDs

---

### 👤 Member 3: UDP Multicast Broadcasting (230.0.0.1:4446)

**Check Multicast Status:**
```bash
curl http://localhost:8080/api/admin/multicast/status
```

**Test with Multicast Receiver:**
1. Locate `MulticastReceiver.java` in `network/multicast/`
2. Run it as a Java application
3. Place a bid via Swagger UI or REST API
4. Receiver should display the broadcast message

**Monitor Broadcasts:**
- Swagger: http://localhost:8080/swagger-ui.html → "11. Network Monitoring - Multicast"
- Endpoint: GET `/api/admin/multicast/status`

---

### 👤 Member 4: NIO Server (Port 8082)

**Check NIO Status:**
```bash
curl http://localhost:8080/api/admin/nio/status
```

**Test with NIO Client:**
1. Locate `NIOBidClient.java` in `network/nio/`
2. Run it as a Java application
3. It will connect via non-blocking I/O to port 8082

**Monitor NIO Performance:**
- Swagger: http://localhost:8080/swagger-ui.html → "11. Network Monitoring - NIO"
- Endpoint: GET `/api/admin/nio/connections`

---

### 👤 Member 5: SSL/TLS Server (Port 8443)

**Check SSL Status:**
```bash
curl http://localhost:8080/api/admin/ssl/status
```

**Test with SSL Client:**
1. Locate `SSLPaymentClient.java` in `network/ssl/`
2. Run it as a Java application
3. It will establish secure connection to port 8443

**SSL Certificate:**
- Located at: `src/main/resources/keystore.p12`
- Password: `changeit` (configured in application.properties)

**Monitor SSL Connections:**
- Swagger: http://localhost:8080/swagger-ui.html → "11. Network Monitoring - SSL"
- Endpoint: GET `/api/admin/ssl/connections`

---

## 🎯 Complete Testing Flow

### 1. Create Users
```bash
# Register User 1 (Seller)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "seller1", "email": "seller@test.com", "password": "pass123"}'

# Register User 2 (Bidder)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "bidder1", "email": "bidder@test.com", "password": "pass123"}'
```

### 2. Create Auction
```bash
curl -X POST http://localhost:8080/api/auctions \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Vintage Watch",
    "description": "Rare vintage watch",
    "startingPrice": 1000.00,
    "sellerId": 1,
    "startTime": "2025-11-05T10:00:00",
    "mandatoryEndTime": "2025-11-05T20:00:00",
    "bidGapDurationSeconds": 300
  }'
```

### 3. Place Bids
```bash
curl -X POST http://localhost:8080/api/bids \
  -H "Content-Type: application/json" \
  -d '{"auctionId": 1, "bidderId": 2, "bidAmount": 1500.00}'
```

### 4. View All Active Auctions
```bash
curl http://localhost:8080/api/auctions/active
```

---

## 🐛 Troubleshooting

### Problem: Port 8080 already in use

**Solution 1:** Stop other application using port 8080
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8080 | xargs kill -9
```

**Solution 2:** Change port in `application.properties`
```properties
server.port=8081
```

---

### Problem: Maven dependencies not downloading

**Solution:**
```bash
# Clear Maven cache and rebuild
mvn clean install -U

# Or delete .m2 folder and rebuild
rm -rf ~/.m2/repository  # Mac/Linux
rmdir /s %USERPROFILE%\.m2\repository  # Windows
mvn clean install
```

---

### Problem: Database connection failed

**Solution:** The backend uses a shared cloud database (Neon). If it's down:

1. Check `application.properties` - database URL should be:
```properties
spring.datasource.url=jdbc:postgresql://ep-noisy-dew-a1ocd7k2-pooler.ap-southeast-1.aws.neon.tech:5432/auctiondb?sslmode=require
```

2. If still fails, create your own free database at [Neon.tech](https://neon.tech)
3. Update the connection details in `application.properties`

---

### Problem: Java version error

**Error:** `Unsupported class file major version 61`

**Solution:** You need Java 17+
```bash
# Download Java 17 from Oracle or use SDKMAN
sdk install java 17.0.9-oracle
sdk use java 17.0.9-oracle
```

---

## 📚 Additional Resources

- **Full README:** See `README.md` for complete documentation
- **Swagger UI:** http://localhost:8080/swagger-ui.html (when running)
- **API Endpoints:** 62 total endpoints documented in Swagger
- **Database Schema:** See README.md for entity relationships

---

## 🆘 Getting Help

1. **Check Console Logs:** Most errors are shown with clear messages
2. **Check Swagger UI:** Test endpoints interactively
3. **Check README.md:** Complete documentation with all 62 endpoints
4. **Check application.properties:** Verify all configuration is correct

---

## 📦 What Gets Auto-Started

When you run `mvn spring-boot:run`, these components start automatically:

✅ Spring Boot REST API (Port 8080)
✅ TCP Bid Server (Port 8081) - Member 1
✅ NIO Bid Server (Port 8082) - Member 4
✅ SSL Payment Server (Port 8443) - Member 5
✅ Multicast Broadcaster (230.0.0.1:4446) - Member 3
✅ Thread Pool with 50 threads - Member 2
✅ Auction Scheduler (@Scheduled every 30 seconds)
✅ WebSocket Server (/ws/auctions, /ws/bids)
✅ Swagger Documentation

**Everything works out of the box!** 🎉

---

## ⏱️ Estimated Time

- **First Run:** 5-10 minutes (Maven downloads dependencies)
- **Subsequent Runs:** 30 seconds

---

## 💡 Pro Tips

1. **Use Swagger UI** instead of curl - much easier to test
2. **Check logs** in console to see all network servers starting
3. **Use IntelliJ IDEA** for best Java development experience
4. **Keep backend running** while testing frontend
5. **Use admin token** for admin endpoints (get it from login response)

---

**Ready to go! Start the backend and explore the 62 endpoints in Swagger UI!** 🚀
