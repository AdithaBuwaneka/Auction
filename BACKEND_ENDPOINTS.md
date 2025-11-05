# 📋 Backend API Endpoints Summary

## Total Controllers: 6
## Total Endpoints: 24

---

## 1️⃣ AuthController - `/api/auth` (3 endpoints)

### Public Endpoints (No authentication required):

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Register new user | `RegisterRequest` | JWT token + user info |
| POST | `/api/auth/login` | Login user | `LoginRequest` | JWT token + user info |
| GET | `/api/auth/me` | Get current user | - (JWT in header) | User details |

**Example:**
```bash
# Register
POST /api/auth/register
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}

# Login
POST /api/auth/login
{
  "username": "john",
  "password": "password123"
}
```

---

## 2️⃣ AuctionController - `/api/auctions` (5 endpoints)

| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| POST | `/api/auctions` | Create auction | ✅ Yes | Created auction |
| GET | `/api/auctions/active` | Get active auctions | ❌ No | List of auctions |
| GET | `/api/auctions/{id}` | Get auction by ID | ❌ No | Auction details |
| GET | `/api/auctions/seller/{sellerId}` | Get seller's auctions | ✅ Yes | List of auctions |
| GET | `/api/auctions/search?keyword=` | Search auctions | ❌ No | List of auctions |

**Example:**
```bash
# Get all active auctions
GET /api/auctions/active

# Search for laptops
GET /api/auctions/search?keyword=laptop

# Get specific auction
GET /api/auctions/1
```

---

## 3️⃣ BidController - `/api/bids` (3 endpoints)

| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| POST | `/api/bids` | Place a bid | ✅ Yes | Bid response |
| GET | `/api/bids/auction/{auctionId}` | Get auction bids | ✅ Yes | List of bids |
| GET | `/api/bids/user/{userId}` | Get user's bids | ✅ Yes | List of bids |

**Example:**
```bash
# Place bid
POST /api/bids
{
  "auctionId": 1,
  "bidderId": 5,
  "bidAmount": 150.00
}
```

---

## 4️⃣ UserController - `/api/users` (5 endpoints)

| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| POST | `/api/users/register` | Register (old) | ❌ No | User object |
| POST | `/api/users/login` | Login (old) | ❌ No | User object |
| GET | `/api/users/{id}` | Get user by ID | ✅ Yes | User details |
| GET | `/api/users/username/{username}` | Get by username | ✅ Yes | User details |
| GET | `/api/users/active` | Get active users | ❌ No (Public) | List of users |

**Note:** Old login/register endpoints exist but use AuthController instead.

---

## 5️⃣ HealthController - `/api` (2 endpoints)

| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| GET | `/api/health` | Health check | ❌ No | System status |
| GET | `/api/` | API info | ❌ No | API details |

**Example:**
```bash
GET /api/health
# Response:
{
  "status": "UP",
  "service": "Real-Time Auction System",
  "timestamp": "2025-11-05T15:35:00",
  "version": "1.0.0"
}
```

---

## 6️⃣ MigrationController - `/api/migrate` (2 endpoints)

| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| POST | `/api/migrate/add-role-column` | Add role column | ❌ No | Success/Error |
| POST | `/api/migrate/make-admin` | Promote to admin | ❌ No | Success/Error |

**Note:** Temporary endpoints for database migrations.

---

## 📊 Endpoint Summary by Category

### Public (No Auth) - 10 endpoints:
- ✅ `/api/auth/register`
- ✅ `/api/auth/login`
- ✅ `/api/health`
- ✅ `/api/`
- ✅ `/api/auctions/active`
- ✅ `/api/auctions/{id}`
- ✅ `/api/auctions/search`
- ✅ `/api/users/active`
- ✅ `/api/migrate/*` (2 endpoints)

### Protected (JWT Required) - 11 endpoints:
- 🔒 `/api/auth/me`
- 🔒 `/api/auctions` (POST)
- 🔒 `/api/auctions/seller/{sellerId}`
- 🔒 `/api/bids` (POST)
- 🔒 `/api/bids/auction/{auctionId}`
- 🔒 `/api/bids/user/{userId}`
- 🔒 `/api/users/{id}`
- 🔒 `/api/users/username/{username}`
- 🔒 `/api/users/register` (old)
- 🔒 `/api/users/login` (old)

### Admin Only - 0 endpoints currently
(Will add monitoring endpoints for dashboard)

---

## ⚠️ Missing Admin Endpoints for Dashboard

According to HTML plan, we need to add monitoring endpoints for:

### Member 1: TCP Monitor
- `/api/admin/tcp/connections` - Active TCP connections
- `/api/admin/tcp/stats` - Connection statistics

### Member 2: Thread Pool Monitor
- `/api/admin/threads/pool` - Thread pool status
- `/api/admin/threads/active` - Active threads

### Member 3: Multicast Monitor
- `/api/admin/multicast/broadcasts` - Broadcast log
- `/api/admin/multicast/stats` - Subscriber stats

### Member 4: NIO Monitor
- `/api/admin/nio/channels` - Active NIO channels
- `/api/admin/nio/performance` - Performance stats

### Member 5: SSL Monitor
- `/api/admin/ssl/transactions` - Secure transactions
- `/api/admin/ssl/certificate` - Certificate info

**Total Admin Endpoints Needed: ~12**

---

## 🎯 Current Status

| Category | Count | Status |
|----------|-------|--------|
| Implemented Endpoints | 24 | ✅ Complete |
| Authentication Endpoints | 3 | ✅ Complete |
| User/Auction/Bid Endpoints | 13 | ✅ Complete |
| Health/System Endpoints | 4 | ✅ Complete |
| **Admin Monitoring Endpoints** | **0** | **❌ Need to add** |

---

## 🚀 Next Steps

1. **Add Admin Monitoring Endpoints** (12 endpoints)
2. **Build Next.js Frontend** to consume these endpoints
3. **Create Admin Dashboard** with network monitoring panels

**Ready to add admin monitoring endpoints?** 🎯
