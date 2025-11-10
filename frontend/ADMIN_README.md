# Auction System - Frontend

A modern, real-time auction platform with comprehensive admin panel built with Next.js, React, and TypeScript.

## Features

### For All Users

- 🔐 **Unified Authentication**: Single login system for both users and admins
- 💰 **Wallet System**: Built-in balance management
- 🏛️ **Real-time Auctions**: Browse and bid on active auctions
- 📊 **Dashboard**: Personalized user dashboard

### For Admin Users

- 📈 **Dashboard**: Comprehensive overview with real-time statistics
- 🏆 **Auction Management**: Approve, cancel, and monitor all auctions
- 💳 **Transaction Management**: Monitor and manage all financial transactions
- 📊 **Analytics**: Detailed charts and insights
- 🔧 **System Monitoring**: Real-time monitoring of:
  - TCP Server connections
  - Thread Pool status
  - Multicast service
  - NIO performance
  - SSL/TLS connections
  - Database health
- 📝 **System Logs**: View and filter system activity logs
- ⚙️ **Settings**: Configure platform parameters

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:8080`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

3. Run development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   │   ├── page.tsx       # Dashboard
│   │   ├── auctions/      # Auction management
│   │   ├── transactions/  # Transaction management
│   │   ├── analytics/     # Analytics & reports
│   │   ├── monitoring/    # System monitoring
│   │   ├── logs/          # System logs
│   │   └── settings/      # Settings
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login/Register page
│   └── page.tsx           # Home page (redirects)
├── components/            # Reusable components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── StatsCard.tsx
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
└── lib/                   # Utilities
    ├── api.ts             # API client
    └── types.ts           # TypeScript types
```

## User Roles

### Regular User (USER)

- View and bid on auctions
- Manage wallet
- View bid history
- Access user dashboard

### Admin (ADMIN)

- All user permissions
- Full platform management
- Auction approval/cancellation
- Transaction monitoring
- System monitoring
- Analytics access
- Settings configuration

## Creating an Admin User

Admin users need to be created directly in the database:

1. Register a normal user through the UI
2. Update the user's role in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'your_username';
```

## API Integration

The frontend connects to the backend API endpoints:

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/register`

### Admin Endpoints (require ADMIN role)

- `GET /api/admin/users`
- `GET /api/admin/stats`
- `GET /api/admin/auctions`
- `GET /api/admin/transactions`
- `GET /api/admin/monitor/*`

### User Endpoints

- `GET /api/auctions`
- `POST /api/bids`
- `GET /api/wallet`
- `GET /api/users/me`

## Environment Variables

| Variable              | Description     | Default                     |
| --------------------- | --------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api` |

## Building for Production

```bash
npm run build
npm start
```

## Features in Detail

### Admin Dashboard

- Real-time statistics cards
- System health monitoring
- Activity charts
- Recent activity feed

### Auction Management

- View all auctions (active, pending, ended)
- Approve pending auctions
- Cancel active auctions
- View auction details and bids

### Transaction Management

- View all transactions
- Filter by status
- Export transaction reports
- Monitor revenue

### Analytics

- Revenue trends
- User growth charts
- Category distribution
- Key performance metrics

### System Monitoring

- TCP server status
- Thread pool metrics
- SSL/TLS connections
- Multicast service
- NIO performance
- Database health

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues and questions, please contact the development team.
