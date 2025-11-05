# TCP Bidding Server Implementation (Member 1)

## ✅ What We Built

### 1. TCP Bid Server (`TCPBidServer.java`)
**Location:** `backend/src/main/java/com/auction/system/network/tcp/TCPBidServer.java`

**Features:**
- ✅ Runs on port **8081**
- ✅ Accepts TCP socket connections
- ✅ JSON-based request/response protocol
- ✅ Integrates with existing BidService
- ✅ Thread pool for concurrent clients (Member 2 integration)
- ✅ 30-second connection timeout
- ✅ Detailed logging for debugging
- ✅ Auto-starts when Spring Boot application starts

**Protocol:**
```
Client → Server:  {"auctionId":1,"bidderId":2,"bidAmount":700.00}
Server → Client:  {"success":true,"message":"Bid placed successfully",...}
```

### 2. TCP Test Client (`TCPBidClient.java`)
**Location:** `backend/src/main/java/com/auction/system/network/tcp/TCPBidClient.java`

**Features:**
- Command-line interface
- Interactive bidding
- Connects to TCP server on port 8081
- Sends bids and receives responses

### 3. PowerShell Test Script (`test-tcp-bidding.ps1`)
**Location:** `test-tcp-bidding.ps1`

**Features:**
- Automated testing
- Multiple test scenarios
- Easy to run

---

## 🚀 How to Test

### Method 1: Restart Backend (Recommended)

1. **Stop current backend** (Ctrl+C in the terminal running mvn spring-boot:run)

2. **Start backend** (TCP server starts automatically):
```bash
cd backend
mvn spring-boot:run
```

3. **Look for this in console:**
```
╔═══════════════════════════════════════════════════════════╗
║  TCP BID SERVER STARTED (Member 1)                       ║
║  Port: 8081                                               ║
║  Timeout: 30000 ms                                        ║
║  Ready to accept bidding connections via TCP!            ║
╚═══════════════════════════════════════════════════════════╝
```

### Method 2: Run PowerShell Test Script

Open **new PowerShell terminal**:
```powershell
cd C:\Users\adith\Downloads\Auction
.\test-tcp-bidding.ps1
```

### Method 3: Use Java TCP Client

Compile and run:
```bash
cd backend/src/main/java
javac com/auction/system/network/tcp/TCPBidClient.java
java com.auction.system.network.tcp.TCPBidClient
```

Then enter:
```
Auction ID: 1
Bidder ID: 2
Bid Amount: 750
```

### Method 4: Manual Test with Telnet

```bash
telnet localhost 8081
```

Then type:
```json
{"auctionId":1,"bidderId":2,"bidAmount":750.00}
```

---

## 📋 Test Scenarios

| Test | Input | Expected Output |
|------|-------|----------------|
| Valid Bid | `{"auctionId":1,"bidderId":2,"bidAmount":750}` | `{"success":true,...}` |
| Too Low | `{"auctionId":1,"bidderId":2,"bidAmount":100}` | `{"success":false,"message":"Bid amount must be higher..."}` |
| Invalid Auction | `{"auctionId":999,"bidderId":2,"bidAmount":500}` | `{"success":false,"message":"Auction not found"}` |
| Invalid JSON | `{bad json}` | `{"success":false,"message":"Invalid JSON format"}` |
| Timeout | (connect but don't send) | Connection closed after 30s |

---

## 🔍 Wireshark Demonstration

### Capture TCP Traffic

1. **Open Wireshark**
2. **Select your network interface** (usually Ethernet or Wi-Fi)
3. **Apply filter:**
   ```
   tcp.port == 8081
   ```
4. **Run a test bid** using any method above
5. **Observe:**
   - ✅ TCP 3-way handshake (SYN, SYN-ACK, ACK)
   - ✅ PSH packet with bid request
   - ✅ PSH packet with server response
   - ✅ TCP connection termination (FIN, ACK)

### What to Show in Presentation:
- Highlight source/destination ports
- Show JSON data in PSH packets
- Explain TCP reliability vs UDP

---

## 🧪 Console Output Examples

### Successful Bid:
```
🔌 New TCP connection from: 127.0.0.1:50234
💰 Processing bid from 127.0.0.1:50234: Auction=1, Amount=750.00
✅ Bid ACCEPTED from 127.0.0.1:50234: BidID=5, NewPrice=750.00
🔌 Connection closed: 127.0.0.1:50234
```

### Rejected Bid:
```
🔌 New TCP connection from: 127.0.0.1:50235
💰 Processing bid from 127.0.0.1:50235: Auction=1, Amount=100.00
❌ Bid REJECTED from 127.0.0.1:50235: Bid amount must be higher than current price
🔌 Connection closed: 127.0.0.1:50235
```

---

## 🔗 Integration with Other Components

### Member 2 (Multithreading):
✅ TCP server uses **ExecutorService with 50 threads**
✅ Each client connection runs in separate thread
✅ Thread-safe bid processing via BidService

### Member 3 (Multicast):
🔄 When TCP bid is accepted, trigger multicast broadcast (to be implemented)

### Database:
✅ All TCP bids are saved to PostgreSQL
✅ Uses existing BidService with pessimistic locking

---

## 📊 Architecture

```
Client (Telnet/Script)
    |
    | TCP Socket (Port 8081)
    ↓
TCPBidServer
    |
    | JSON Request
    ↓
BidService (Thread-safe)
    |
    | Validation + Save
    ↓
PostgreSQL Database
    |
    | Success/Failure
    ↓
TCPBidServer
    |
    | JSON Response
    ↓
Client
```

---

## 🎯 Network Concepts Demonstrated

1. **ServerSocket** - Listening on port 8081
2. **Socket** - Client connections
3. **InputStream/OutputStream** - Data transfer
4. **Buffered I/O** - Efficient reading/writing
5. **Timeout Handling** - 30-second timeout
6. **Thread Pool** - Concurrent client handling
7. **JSON Protocol** - Structured data exchange
8. **Connection Lifecycle** - Accept → Process → Close

---

## ✅ Member 1 Tasks Completed

- ✅ Create ServerSocket on port 8081
- ✅ Accept incoming client connections
- ✅ Handle connection timeouts (30 seconds)
- ✅ Log all connection attempts
- ✅ Verify auction is active
- ✅ Check bid amount > current price
- ✅ Validate bidder
- ✅ Check if bid is within deadline
- ✅ Define message format (JSON)
- ✅ Implement error codes
- ✅ Send acknowledgments
- ✅ Handle malformed requests
- ✅ Save accepted bids to PostgreSQL
- ✅ Update auction current_price
- ✅ Update auction current_deadline
- ✅ Record bid timestamp

---

## 🚀 Next Steps

1. **Test TCP Server** - Restart backend and run tests
2. **Wireshark Demo** - Capture and analyze packets
3. **Member 3: Multicast** - Broadcast price updates
4. **Member 4: NIO** - Non-blocking I/O server
5. **Member 5: SSL/TLS** - Secure connections

---

## 🎓 Presentation Points (3 minutes)

### Structure:
1. **(30 sec)** Explain TCP: "Reliable, ordered, connection-oriented"
2. **(45 sec)** Show code: ServerSocket, accept(), InputStream/OutputStream
3. **(60 sec)** Live demo: Send bid via TCP, show server processing
4. **(45 sec)** Wireshark: TCP handshake, data packets, termination

### Key Point:
> "TCP ensures bids are delivered reliably and in order, critical for financial transactions in an auction system where losing a bid could mean losing money!"

---

## 📁 Files Created

1. `TCPBidServer.java` - Main TCP server
2. `TCPBidClient.java` - Test client (Java)
3. `test-tcp-bidding.ps1` - Test script (PowerShell)
4. `TCP_IMPLEMENTATION_GUIDE.md` - This guide

---

## 🎉 Member 1: TCP Implementation COMPLETE!

Ready to test? Restart your backend and watch the magic happen! 🔌
