# 🚀 QUICK REFERENCE GUIDE
## Real-Time Auction System - Network Programming Assignment

---

## 📌 QUICK START

### Start Backend
```bash
cd backend
mvn spring-boot:run
```
✅ REST API: http://localhost:8080
✅ Swagger: http://localhost:8080/swagger-ui.html
✅ TCP: Port 8081 | NIO: Port 8082 | SSL: Port 8443
✅ Multicast: 230.0.0.1:4446

### Start Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
```
✅ User UI: http://localhost:3000
✅ Login → Dashboard → Auctions

---

## 👥 MEMBER QUICK GUIDE

### Member 1: TCP Sockets (Port 8081)
**Files:** `backend/src/main/java/com/auction/system/network/tcp/`

**Demo:**
```bash
# Run test client
cd backend/src/main/java/com/auction/system/network/tcp
javac TCPBidClient.java
java TCPBidClient
```

**Wireshark:** `tcp.port == 8081`

**API:** `GET /api/admin/tcp/status`

---

### Member 2: Multithreading
**Files:**
- `service/BidService.java` (line 49 - synchronized)
- `scheduler/AuctionScheduler.java` (@Scheduled)

**Demo:**
1. Open 10 browser tabs
2. All place bids on same auction simultaneously
3. Console shows different thread IDs
4. Only highest bid wins (thread-safe!)

**API:** `GET /api/admin/threads/pool`

---

### Member 3: UDP Multicast (230.0.0.1:4446)
**Files:** `backend/src/main/java/com/auction/system/network/multicast/`

**Demo:**
```bash
# Terminal 1 & 2: Run receivers
cd backend/src/main/java/com/auction/system/network/multicast
javac MulticastReceiver.java
java MulticastReceiver

# From UI: Place bid
# Both terminals receive broadcast!
```

**Wireshark:** `ip.dst == 230.0.0.1 || udp.port == 4446`

**API:** `GET /api/admin/multicast/stats`

---

### Member 4: NIO (Port 8082)
**Files:** `backend/src/main/java/com/auction/system/network/nio/`

**Demo:**
```bash
# Run test client
cd backend/src/main/java/com/auction/system/network/nio
javac NIOBidClient.java
java NIOBidClient
```

**Key Point:** 1 thread handles 100+ connections!

**API:** `GET /api/admin/nio/stats`

---

### Member 5: SSL/TLS (Port 8443)
**Files:**
- `backend/src/main/java/com/auction/system/network/ssl/`
- `backend/src/main/resources/keystore.p12`

**Demo:**
```bash
# View certificate
keytool -list -v -keystore backend/src/main/resources/keystore.p12 -storepass changeit

# Run test client
cd backend/src/main/java/com/auction/system/network/ssl
javac SSLPaymentClient.java
java SSLPaymentClient
```

**Wireshark:** `tcp.port == 8443 || ssl`

**API:** `GET /api/admin/ssl/status`

---

## 📊 COMMON ENDPOINTS

### Authentication
```bash
# Register
POST /api/auth/register
Body: {"username": "john", "email": "john@test.com", "password": "pass123"}

# Login
POST /api/auth/login
Body: {"username": "john", "password": "pass123"}
Response: {"token": "eyJhbGc...", "user": {...}}
```

### Auctions
```bash
# Get active auctions
GET /api/auctions/active

# Create auction
POST /api/auctions
Body: {
  "itemName": "Vintage Watch",
  "description": "...",
  "startingPrice": 1000,
  "sellerId": 1,
  "startTime": "2025-11-05T10:00:00",
  "mandatoryEndTime": "2025-11-05T20:00:00",
  "bidGapDurationSeconds": 300
}
```

### Bids
```bash
# Place bid
POST /api/bids
Body: {"auctionId": 1, "bidderId": 2, "bidAmount": 5000}

# Get auction bids
GET /api/bids/auction/1
```

### Wallet
```bash
# Deposit
POST /api/wallet/deposit
Body: {"userId": 2, "amount": 5000}

# Get balance
GET /api/wallet/balance/2
```

### Admin Monitoring
```bash
# Dashboard stats
GET /api/admin/stats

# TCP status
GET /api/admin/tcp/status

# Thread pool
GET /api/admin/threads/pool

# Multicast
GET /api/admin/multicast/stats

# NIO
GET /api/admin/nio/stats

# SSL
GET /api/admin/ssl/stats
```

---

## 🔍 TESTING CHECKLIST

### ✅ Member 1 (TCP)
- [ ] Backend console shows "TCP BID SERVER STARTED"
- [ ] Test client connects successfully
- [ ] Wireshark shows TCP handshake
- [ ] Admin UI shows connection count

### ✅ Member 2 (Multithreading)
- [ ] 10 simultaneous bids processed
- [ ] Console shows different thread IDs
- [ ] No data corruption (highest bid wins)
- [ ] Thread pool stats visible

### ✅ Member 3 (Multicast)
- [ ] Multiple browsers update instantly
- [ ] Multicast receiver shows broadcasts
- [ ] Wireshark shows UDP to 230.0.0.1
- [ ] Admin UI shows message count

### ✅ Member 4 (NIO)
- [ ] Backend console shows "NIO BID SERVER STARTED"
- [ ] 100+ connections with 1 thread
- [ ] Low response time (<20ms)
- [ ] Admin UI shows performance metrics

### ✅ Member 5 (SSL)
- [ ] Backend console shows "SSL/TLS PAYMENT SERVER STARTED"
- [ ] Certificate viewable via keytool
- [ ] Wireshark shows encrypted data
- [ ] Admin UI shows cipher suite

---

## 🎬 PRESENTATION DEMO FLOW (5 minutes)

**Setup (30 sec):**
- Backend running
- Frontend open in 5 browser windows
- Wireshark capturing
- Admin dashboard visible

**Demo (3 min):**
1. **Show auction page** - All 5 windows viewing
2. **Place bid** - Window 1 bids $5000
3. **Observe:** All 5 windows update instantly ✨
4. **Concurrent bids** - Windows 2-5 bid simultaneously
5. **Show backend console** - Different thread IDs
6. **Show Wireshark** - TCP, UDP multicast, SSL packets

**Monitoring (1.5 min):**
- Admin dashboard → Network Monitoring
- TCP: 5 connections
- Thread Pool: 15 active threads
- Multicast: 127 messages
- NIO: 120 channels, 1 thread
- SSL: 8 secure connections

---

## 🐛 TROUBLESHOOTING

### Backend won't start
```bash
# Check Java version
java -version  # Need 17+

# Clean build
cd backend
mvn clean install
mvn spring-boot:run
```

### Port already in use
```bash
# Windows - Kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8080 | xargs kill -9
```

### Frontend can't connect
```bash
# Check backend is running
curl http://localhost:8080/api/health

# Clear cache
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Database connection failed
- Check `backend/src/main/resources/application.properties`
- Database URL should be Neon Cloud PostgreSQL
- If needed, create your own at https://neon.tech

---

## 📱 USER FLOW

1. **Register** → http://localhost:3000/register
2. **Login** → Get JWT token
3. **Dashboard** → See stats, wallet balance
4. **Browse Auctions** → View active auctions
5. **Auction Details** → See real-time countdown
6. **Place Bid** → Enter amount, submit
7. **Real-time Update** → Price updates instantly
8. **Win Auction** → Get notification
9. **Payment** → Process via SSL
10. **Transaction** → View in history

---

## 🔐 ADMIN ACCESS

**Login as Admin:**
- Use admin credentials (check database or create admin user)
- Access: http://localhost:3000/admin

**Admin Features:**
- View all users, auctions, transactions
- Monitor network servers (TCP, NIO, SSL, Multicast)
- View thread pool statistics
- System health indicators

---

## 📚 DOCUMENTATION

- **Full Analysis:** `COMPLETE_SYSTEM_ANALYSIS.md` (1000+ lines)
- **Backend README:** `backend/README.md`
- **Member Guide:** `backend/MEMBER_GUIDE.md`
- **Quick Start:** `backend/QUICK_START.md`
- **This Guide:** `QUICK_REFERENCE.md`

---

## 🎯 KEY POINTS

✅ **5 Network Concepts** integrated in one system
✅ **Fully functional** - Not just demos
✅ **Real-time** - WebSocket + Multicast
✅ **Thread-safe** - Synchronized + locks
✅ **Scalable** - NIO handles 100+ users
✅ **Secure** - SSL/TLS encryption
✅ **Demonstrable** - Live system + Wireshark

---

## 💡 HELPFUL COMMANDS

```bash
# View all running Java processes
jps -l

# Monitor network connections
netstat -an | grep 8080

# Check if ports are listening
# Windows
netstat -an | findstr "8080 8081 8082 8443"
# Mac/Linux
lsof -i :8080,8081,8082,8443

# View backend logs
cd backend
mvn spring-boot:run > logs.txt 2>&1

# Test TCP connection
telnet localhost 8081

# Test HTTP endpoint
curl http://localhost:8080/api/health
```

---

**READY TO DEMONSTRATE! 🚀**

Good luck with your presentation! Each member has clear responsibilities and demonstrable implementations.
