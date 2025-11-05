# Complete Testing Instructions for All Network Components

## 🎯 Overview

All 5 network programming components are now implemented:

| Member | Component | Port | Protocol | Status |
|--------|-----------|------|----------|--------|
| 1 | TCP Bidding Server | 8081 | TCP | ✅ Complete |
| 2 | Multithreading | N/A | Thread Pool | ✅ Complete |
| 3 | UDP Multicast | 4446 | UDP Multicast | ✅ Complete |
| 4 | NIO Server | 8082 | NIO | ✅ Complete |
| 5 | SSL/TLS Payment | 8443 | SSL/TLS | ✅ Complete |

---

## 🚀 Quick Start Testing Guide

### Step 1: Start Backend Server

```bash
cd backend
mvn spring-boot:run
```

**Wait for all servers to start. You should see:**
```
╔═══════════════════════════════════════════════════════════╗
║  TCP BID SERVER STARTED (Member 1)                       ║
║  Port: 8081                                               ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  NIO BID SERVER STARTED (Member 4)                       ║
║  Port: 8082                                              ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  SSL/TLS PAYMENT SERVER STARTED (Member 5)               ║
║  Port: 8443                                              ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📋 Testing Each Component

### Member 1: TCP Bidding Server (Port 8081)

**PowerShell Test:**
```powershell
.\test-tcp-bidding.ps1
```

**Manual Test:**
```bash
cd backend\src\main\java
javac com/auction/system/network/tcp/TCPBidClient.java
java com.auction.system.network.tcp.TCPBidClient
```

**What to observe:**
- TCP 3-way handshake in Wireshark
- Reliable bid transmission
- Connection-oriented communication

**Wireshark Filter:** `tcp.port == 8081`

---

### Member 2: Multithreading

**Test:** Run multiple TCP or NIO clients simultaneously

**What to observe:**
- Multiple threads handling different clients
- Thread pool management
- No race conditions in bid processing
- Server logs showing different thread IDs

**Server Logs:**
```
Thread-1: Processing bid from client A
Thread-2: Processing bid from client B
Thread-3: Processing bid from client C
```

---

### Member 3: UDP Multicast Broadcasting (230.0.0.1:4446)

**Step 1: Start Multicast Receiver(s)**

Open **multiple terminals** and run:
```bash
cd backend\src\main\java
javac com/auction/system/network/multicast/MulticastReceiver.java
java com.auction.system.network.multicast.MulticastReceiver
```

**Step 2: Place a Bid**
```powershell
.\test-tcp-bidding.ps1
# OR
.\test-nio-bidding.ps1
```

**What to observe:**
- ALL receiver windows get the same update simultaneously
- UDP packets sent to multicast group 230.0.0.1
- One-to-many communication
- No connection setup (connectionless)

**Wireshark Filter:** `udp.port == 4446 || ip.dst == 230.0.0.1`

---

### Member 4: NIO Non-blocking I/O (Port 8082)

**PowerShell Test:**
```powershell
.\test-nio-bidding.ps1
```

**Manual Test:**
```bash
cd backend\src\main\java
javac com/auction/system/network/nio/NIOBidClient.java
java com.auction.system.network.nio.NIOBidClient
```

**What to observe:**
- Single thread handling multiple connections
- Non-blocking I/O operations
- Selector-based event multiplexing
- High performance with low memory

**Server Logs:**
```
NIO-Thread: Accepted 10 connections, all handled by single thread!
```

**Wireshark Filter:** `tcp.port == 8082`

---

### Member 5: SSL/TLS Secure Payment (Port 8443)

**Info Script:**
```powershell
.\test-ssl-payment.ps1
```

**Run SSL Client:**
```bash
cd backend
mvn exec:java -Dexec.mainClass="com.auction.system.network.ssl.SSLPaymentClient"
```

**Test Data:**
```
User ID: 2
Auction ID: 1
Amount ($): 750.00
Card Number: 1234567890123456
Cardholder Name: Jane Buyer
Expiry Date: 12/25
CVV: 123
```

**What to observe:**
- SSL/TLS handshake packets
- Certificate exchange
- Encrypted application data (NOT readable in Wireshark)
- Cipher suite information (e.g., TLS_AES_256_GCM_SHA384)

**Wireshark Filter:** `tcp.port == 8443 || ssl || tls`

---

## 🔍 Comprehensive Wireshark Demo

### Setup Wireshark to Capture All Traffic

**Master Filter:**
```
tcp.port == 8081 || tcp.port == 8082 || tcp.port == 8443 || udp.port == 4446 || ip.dst == 230.0.0.1
```

### What to Show in Presentation:

1. **TCP (Port 8081):**
   - SYN, SYN-ACK, ACK handshake
   - Data transmission with PSH flag
   - FIN, FIN-ACK termination
   - **Plaintext visible**

2. **UDP Multicast (230.0.0.1:4446):**
   - No handshake (connectionless)
   - Destination IP: 230.0.0.1 (Class D)
   - Same packet received by multiple clients
   - **JSON data visible**

3. **NIO (Port 8082):**
   - Similar to TCP but single thread handles all
   - Multiple concurrent connections
   - **Efficient resource usage**

4. **SSL/TLS (Port 8443):**
   - Client Hello, Server Hello packets
   - Certificate exchange (view certificate details)
   - Key exchange
   - **Application data ENCRYPTED** ✅
   - **Compare:** Show plaintext TCP vs encrypted SSL side-by-side

---

## 📊 Complete Test Scenario

### Full Auction Flow Test:

1. **Start Backend** (`mvn spring-boot:run`)
2. **Start 3 Multicast Receivers** (in separate terminals)
3. **Place Bid via TCP** (port 8081)
   - ✅ Bid accepted
   - ✅ Saved to database
   - ✅ ALL 3 receivers get multicast update
4. **Place Bid via NIO** (port 8082)
   - ✅ Handled by single thread
   - ✅ Multicast broadcast sent
5. **Process Payment via SSL** (port 8443)
   - ✅ Encrypted communication
   - ✅ Payment validated
   - ✅ Transaction saved

**Wireshark:** Capture all of the above and show:
- TCP reliability
- UDP multicast efficiency
- NIO scalability
- SSL encryption

---

## 📁 Implementation Files Summary

### Member 1 (TCP):
- `TCPBidServer.java` - TCP server implementation
- `TCPBidClient.java` - Test client
- `test-tcp-bidding.ps1` - Test script
- `TCP_IMPLEMENTATION_GUIDE.md` - Documentation

### Member 2 (Multithreading):
- Integrated in all servers via `ExecutorService`
- Thread pool configuration in `application.properties`
- Concurrent bid processing in `BidService.java`

### Member 3 (Multicast):
- `MulticastBroadcaster.java` - Multicast sender
- `MulticastReceiver.java` - Test receiver
- `MULTICAST_IMPLEMENTATION_GUIDE.md` - Documentation

### Member 4 (NIO):
- `NIOBidServer.java` - NIO server implementation
- `NIOBidClient.java` - Test client
- `test-nio-bidding.ps1` - Test script
- `NIO_IMPLEMENTATION_GUIDE.md` - Documentation

### Member 5 (SSL/TLS):
- `SSLPaymentServer.java` - SSL server implementation
- `SSLPaymentClient.java` - Test client
- `test-ssl-payment.ps1` - Test script
- `keystore.p12` - SSL certificate
- `SSL_IMPLEMENTATION_GUIDE.md` - Documentation

---

## 🎓 Presentation Tips

### For Each Member's 3-Minute Demo:

**Member 1 (TCP):**
1. (30s) Explain TCP: reliable, connection-oriented
2. (45s) Show code: ServerSocket, accept(), streams
3. (60s) Live demo: Send bid, show in Wireshark
4. (45s) Wireshark: Point out handshake, data, termination

**Member 2 (Multithreading):**
1. (30s) Explain: Thread pool for concurrent clients
2. (45s) Show code: ExecutorService, synchronized blocks
3. (60s) Live demo: 10 clients simultaneously
4. (45s) Show logs: Different threads, no race conditions

**Member 3 (Multicast):**
1. (30s) Explain: One-to-many UDP broadcasting
2. (45s) Show code: MulticastSocket, DatagramPacket
3. (60s) Live demo: 3 receivers, all get same update
4. (45s) Wireshark: UDP to 230.0.0.1, no handshake

**Member 4 (NIO):**
1. (30s) Explain: Single thread, multiple connections
2. (45s) Show code: Selector, SelectionKey, event loop
3. (60s) Live demo: 10+ connections, single thread
4. (45s) Compare: Memory usage vs blocking I/O

**Member 5 (SSL/TLS):**
1. (30s) Explain: Encryption for security
2. (30s) Show: Certificate, keystore
3. (60s) Live demo: Send payment, encrypted communication
4. (60s) Wireshark: Handshake, encrypted data, compare with TCP plaintext

---

## ✅ Pre-Presentation Checklist

- [ ] Backend server starts successfully
- [ ] All 5 servers (REST, TCP, NIO, Multicast, SSL) running
- [ ] Database connection working
- [ ] Sample data loaded
- [ ] All test clients compiled
- [ ] Wireshark installed and configured
- [ ] Test all components at least once
- [ ] Prepare Wireshark captures in advance (backup)
- [ ] Network cables/WiFi stable
- [ ] Backup plan if live demo fails

---

## 🚨 Troubleshooting

### Backend Won't Start:
- Check database connection in `application.properties`
- Ensure ports 8080, 8081, 8082, 8443 are free
- Run `mvn clean install` first

### Client Can't Connect:
- Verify server is running
- Check firewall settings
- Try `localhost` and `127.0.0.1`

### Multicast Not Working:
- Check network allows multicast
- Verify IP 230.0.0.1 is valid
- Try running on localhost first

### SSL Certificate Error:
- Ensure `keystore.p12` exists in `resources/`
- Password is `changeit`
- Client trusts all certificates (test mode)

---

## 🎉 All Components Complete!

### What You've Built:
✅ **TCP Server** - Reliable bidding (Member 1)
✅ **Thread Pool** - Concurrent users (Member 2)
✅ **UDP Multicast** - Real-time broadcasts (Member 3)
✅ **NIO Server** - High-performance I/O (Member 4)
✅ **SSL/TLS** - Secure payments (Member 5)

### Network Concepts Demonstrated:
- ✅ TCP vs UDP
- ✅ Blocking vs Non-blocking I/O
- ✅ Unicast vs Multicast
- ✅ Encryption and Security
- ✅ Concurrency and Synchronization
- ✅ Client-Server Architecture
- ✅ Protocol Design
- ✅ Socket Programming

---

## 📚 Individual Guides

For detailed information on each component, refer to:
1. `TCP_IMPLEMENTATION_GUIDE.md`
2. `MULTICAST_IMPLEMENTATION_GUIDE.md`
3. `NIO_IMPLEMENTATION_GUIDE.md`
4. `SSL_IMPLEMENTATION_GUIDE.md`

---

**Good luck with your presentation! 🚀**

You've implemented a complete real-time auction system demonstrating all major network programming concepts from IN3111. This is production-quality work!
