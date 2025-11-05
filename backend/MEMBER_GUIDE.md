# 👥 Member Guide - Testing Your Network Feature

This guide helps each member test their specific network programming implementation.

---

## 🎯 For Each Member

### 👤 Member 1: TCP Socket Communication

**Your Implementation:** `network/tcp/TCPBidServer.java` (Port 8081)

#### How to Test:

1. **Start Backend:**
   ```bash
   mvn spring-boot:run
   ```

2. **Verify TCP Server Started:**
   Look for this in console:
   ```
   ║  TCP BID SERVER STARTED (Member 1)                       ║
   ║  Listening on port: 8081                                 ║
   ```

3. **Test with Client:**
   ```bash
   # Run the TCP test client
   cd src/main/java/com/auction/system/network/tcp
   java TCPBidClient.java
   ```

4. **Monitor Connections:**
   - Open: http://localhost:8080/swagger-ui.html
   - Find: "11. Network Monitoring - TCP (Member 1)"
   - Click: `GET /api/admin/tcp/connections`
   - Click "Try it out" → "Execute"

5. **Wireshark Demo:**
   ```
   Filter: tcp.port == 8081
   ```
   Show: TCP handshake (SYN, SYN-ACK, ACK), bid request, response

#### Your Endpoints:
- `GET /api/admin/tcp/status` - Server status
- `GET /api/admin/tcp/connections` - Active connections
- `GET /api/admin/tcp/stats` - Statistics

---

### 👤 Member 2: Multithreading & Concurrency

**Your Implementation:**
- `scheduler/AuctionScheduler.java` (@Scheduled)
- `service/BidService.java` (synchronized)
- `controller/admin/ThreadPoolMonitorController.java`

#### How to Test:

1. **Start Backend:**
   ```bash
   mvn spring-boot:run
   ```

2. **Verify Thread Pool:**
   Look for this in console:
   ```
   Thread pool configured: 50 core threads, 100 max threads
   ```

3. **Check Thread Statistics:**
   - Open: http://localhost:8080/swagger-ui.html
   - Find: "10. Thread Pool Monitoring (Member 2)"
   - Click: `GET /api/admin/threads/pool`
   - Click "Try it out" → "Execute"

4. **Test Concurrent Bids:**
   - Open 10 browser tabs
   - In each tab, open Swagger UI
   - Navigate to "4. Bidding"
   - Place bids simultaneously on same auction
   - Check console logs - you'll see different thread IDs handling requests

5. **Test Race Condition Prevention:**
   - Place 10 simultaneous bids on same auction
   - Only highest bid should win
   - No data corruption should occur

#### Your Endpoints:
- `GET /api/admin/threads/pool` - Thread pool status
- `GET /api/admin/threads/active` - Active threads
- `GET /api/admin/threads/stats` - Thread statistics

#### Console Output to Show:
```
[pool-2-thread-5] Processing bid from user 10
[pool-2-thread-12] Processing bid from user 15
[pool-2-thread-3] Processing bid from user 8
```

---

### 👤 Member 3: UDP Multicast Broadcasting

**Your Implementation:** `network/multicast/MulticastBroadcaster.java` (230.0.0.1:4446)

#### How to Test:

1. **Start Backend:**
   ```bash
   mvn spring-boot:run
   ```

2. **Verify Multicast Started:**
   Look for this in console:
   ```
   ║  UDP MULTICAST BROADCASTER INITIALIZED (Member 3)        ║
   ║  Multicast Group: 230.0.0.1:4446                         ║
   ```

3. **Start Multicast Receiver:**
   ```bash
   # Run in separate terminal
   cd src/main/java/com/auction/system/network/multicast
   java MulticastReceiver.java
   ```

4. **Trigger Broadcast:**
   - Open Swagger UI: http://localhost:8080/swagger-ui.html
   - Navigate to "4. Bidding"
   - Place a bid using `POST /api/bids`
   - **Watch the receiver console** - it will show the multicast message!

5. **Monitor Broadcasts:**
   - Swagger UI → "11. Network Monitoring - Multicast (Member 3)"
   - `GET /api/admin/multicast/status`

6. **Wireshark Demo:**
   ```
   Filter: udp.port == 4446 || ip.dst == 230.0.0.1
   ```
   Show: UDP packets to multicast address, no TCP handshake

#### Your Endpoints:
- `GET /api/admin/multicast/status` - Broadcaster status
- `GET /api/admin/multicast/stats` - Broadcast statistics

---

### 👤 Member 4: Non-blocking I/O (NIO)

**Your Implementation:** `network/nio/NIOBidServer.java` (Port 8082)

#### How to Test:

1. **Start Backend:**
   ```bash
   mvn spring-boot:run
   ```

2. **Verify NIO Server Started:**
   Look for this in console:
   ```
   ║  NIO BID SERVER STARTED (Member 4)                       ║
   ║  Listening on port: 8082                                 ║
   ║  Using Selector for non-blocking I/O                     ║
   ```

3. **Test with NIO Client:**
   ```bash
   # Run NIO test client
   cd src/main/java/com/auction/system/network/nio
   java NIOBidClient.java
   ```

4. **Monitor NIO Performance:**
   - Open: http://localhost:8080/swagger-ui.html
   - Find: "11. Network Monitoring - NIO (Member 4)"
   - Click: `GET /api/admin/nio/connections`
   - Shows: Channels handled by **single thread**

5. **Load Test (Show Scalability):**
   - Use JMeter or create 100+ client connections
   - Show: 1 thread handles all connections
   - Compare memory usage vs traditional blocking I/O

#### Your Endpoints:
- `GET /api/admin/nio/status` - NIO server status
- `GET /api/admin/nio/connections` - Active channels
- `GET /api/admin/nio/stats` - Performance metrics

#### Key Point to Demonstrate:
"Traditional I/O needs 100 threads for 100 clients. My NIO uses just 1 thread!"

---

### 👤 Member 5: SSL/TLS Security

**Your Implementation:** `network/ssl/SSLPaymentServer.java` (Port 8443)

#### How to Test:

1. **Start Backend:**
   ```bash
   mvn spring-boot:run
   ```

2. **Verify SSL Server Started:**
   Look for this in console:
   ```
   ║  SSL/TLS PAYMENT SERVER STARTED (Member 5)               ║
   ║  Listening on port: 8443                                 ║
   ║  Using keystore: keystore.p12                            ║
   ```

3. **Check Certificate:**
   ```bash
   # View certificate details
   keytool -list -v -keystore src/main/resources/keystore.p12 -storepass changeit
   ```

4. **Test with SSL Client:**
   ```bash
   # Run SSL test client
   cd src/main/java/com/auction/system/network/ssl
   java SSLPaymentClient.java
   ```

5. **Monitor SSL Connections:**
   - Open: http://localhost:8080/swagger-ui.html
   - Find: "11. Network Monitoring - SSL (Member 5)"
   - Click: `GET /api/admin/ssl/connections`

6. **Wireshark Demo:**
   ```
   Filter: tcp.port == 8443 || ssl
   ```
   Show:
   - SSL handshake (ClientHello, ServerHello, Certificate)
   - Encrypted application data (NOT readable)
   - Compare with plain TCP (readable)

#### Your Endpoints:
- `GET /api/admin/ssl/status` - SSL server status
- `GET /api/admin/ssl/connections` - Secure connections
- `GET /api/admin/ssl/stats` - SSL statistics

#### Key Files:
- Certificate: `src/main/resources/keystore.p12`
- Password: `changeit` (in application.properties)

---

## 🎬 Presentation Tips for All Members

### What to Show (3 minutes each):

1. **Concept Explanation (30 sec)**
   - Explain your network concept in simple terms
   - Why it's useful for auction system

2. **Code Walkthrough (45 sec)**
   - Show key code sections
   - Highlight important methods/classes

3. **Live Demo (60 sec)**
   - Run your test client
   - Show it working in real-time
   - Display monitoring endpoints

4. **Wireshark Analysis (45 sec)**
   - Show network packets
   - Explain what's happening at network layer
   - Compare with other protocols if relevant

---

## 🔧 Troubleshooting for All Members

### Port Already in Use?

```bash
# Windows - Kill process on port
netstat -ano | findstr :<PORT>
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:<PORT> | xargs kill -9
```

### Backend Not Starting?

1. Check Java version: `java -version` (need 17+)
2. Check Maven: `mvn -version`
3. Clean build: `mvn clean install`
4. Check logs in console

### Test Client Not Connecting?

1. Verify backend is running
2. Check port numbers match
3. Check firewall settings
4. Look for errors in console

---

## 📊 Success Checklist

Before presentation, verify:

- [ ] Backend starts without errors
- [ ] Your server component shows "STARTED" in console
- [ ] Test client connects successfully
- [ ] Monitoring endpoint returns data
- [ ] Wireshark captures your traffic
- [ ] You can explain the network concept clearly

---

## 🎯 What Makes a Good Demo

1. ✅ **Show it works** - Live demo, not screenshots
2. ✅ **Show console output** - Logs prove it's running
3. ✅ **Show monitoring** - Use Swagger endpoints
4. ✅ **Show network packets** - Wireshark capture
5. ✅ **Explain clearly** - Why this concept matters

---

## 📞 Need Help?

1. Check backend is running: `curl http://localhost:8080/api/health`
2. Check Swagger UI: http://localhost:8080/swagger-ui.html
3. Check console logs for errors
4. Review QUICK_START.md for setup help

---

**Good luck with your presentations! 🎉**

Each member's implementation is production-ready and fully functional!
