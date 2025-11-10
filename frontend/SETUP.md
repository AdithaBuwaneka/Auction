# Frontend Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend server running on `http://localhost:8080`

## Installation Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install all required dependencies including:
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS
- Axios (API client)
- date-fns (date formatting)
- Lucide React (icons)
- Recharts (charts)
- @stomp/stompjs (WebSocket)
- sockjs-client (WebSocket fallback)

### 2. Environment Configuration

Create a `.env.local` file in the frontend directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# WebSocket Configuration (optional)
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm run start
```

## Common Issues & Fixes

### Issue 1: Dependencies Not Found

**Problem:** Missing dependencies errors

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue 2: Backend Connection Error

**Problem:** Cannot connect to backend API

**Solution:**
1. Ensure backend is running on port 8080
2. Check CORS configuration in backend
3. Verify `.env.local` has correct API URL

### Issue 3: WebSocket Connection Failed

**Problem:** Real-time updates not working

**Solution:**
- The app uses polling as fallback (updates every 5-10 seconds)
- WebSocket is optional - the app works fine without it
- To enable WebSocket, ensure backend WebSocket endpoints are running

### Issue 4: TypeScript Errors

**Problem:** Type errors during development

**Solution:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# If issues persist, delete .next folder
rm -rf .next
npm run dev
```

### Issue 5: Tailwind CSS Not Working

**Problem:** Styles not appearing

**Solution:**
1. Check `tailwind.config.ts` is present
2. Verify `globals.css` has Tailwind directives
3. Restart dev server

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auctions/           # Auction pages
│   │   │   ├── [id]/           # Auction detail
│   │   │   ├── create/         # Create auction
│   │   │   └── page.tsx        # Browse auctions
│   │   ├── admin/              # Admin panel (8 pages)
│   │   ├── dashboard/          # User dashboard
│   │   ├── wallet/             # Wallet management
│   │   ├── my-auctions/        # Seller dashboard
│   │   ├── my-bids/            # Bid history
│   │   ├── notifications/      # Notifications
│   │   ├── profile/            # User profile
│   │   └── login/              # Auth page
│   ├── components/             # Reusable components
│   │   ├── AuctionCard.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── StatsCard.tsx
│   ├── contexts/               # React Context
│   │   └── AuthContext.tsx
│   └── lib/                    # Utilities
│       ├── api.ts              # API client
│       ├── types.ts            # TypeScript types
│       └── websocket.ts        # WebSocket service
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features Overview

### User Features
✅ Browse and search auctions
✅ View auction details with live countdown
✅ Place bids with validation
✅ Manage wallet (deposit/withdraw)
✅ Create auctions with image upload
✅ Track bids and auctions
✅ View notifications
✅ Manage profile

### Admin Features
✅ Dashboard with real-time stats
✅ User management
✅ Auction management
✅ Transaction monitoring
✅ System monitoring
✅ Analytics
✅ Logs viewer

## Testing the Application

### 1. Register a New User
- Go to `http://localhost:3000/login`
- Click "Register" tab
- Enter username, email, password
- You'll receive $10,000 starting balance

### 2. Browse Auctions
- Navigate to "Browse Auctions"
- Use search and filters
- Click on any auction to view details

### 3. Place a Bid
- Open an auction detail page
- Enter bid amount (must be higher than current price)
- Submit bid
- Funds will be frozen automatically

### 4. Create an Auction
- Click "Create Auction" button
- Fill in auction details
- Upload image or provide URL
- Set start/end times
- Submit

### 5. Manage Wallet
- Go to "Wallet" page
- Deposit funds (simulated)
- Withdraw available balance
- View transaction history

## Performance Tips

### 1. Reduce Auto-Refresh Frequency
If the app feels slow, you can adjust refresh intervals in the code:

**Current intervals:**
- Dashboard: 10 seconds
- Auction Detail: 5 seconds
- My Bids: 5 seconds
- Browse Auctions: 10 seconds

### 2. Enable WebSocket (Optional)
For true real-time updates without polling:

1. Ensure backend WebSocket is running
2. WebSocket service is already created at `lib/websocket.ts`
3. Import and use in pages that need real-time updates

### 3. Image Optimization
- Use next/image component for better performance
- Optimize images before upload
- Consider using CDN for image hosting

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Support

The application is fully responsive and works on:
- iOS Safari
- Chrome Mobile
- Samsung Internet
- Firefox Mobile

## Security Notes

1. **JWT Tokens:** Stored in localStorage (consider httpOnly cookies for production)
2. **API Calls:** All authenticated requests include Bearer token
3. **CORS:** Backend must allow `http://localhost:3000` origin
4. **Input Validation:** All forms have client-side validation

## Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_WS_URL=https://your-backend-api.com/ws
```

## Support

If you encounter any issues:

1. Check this SETUP.md for common problems
2. Review console errors in browser DevTools
3. Check backend logs
4. Verify all environment variables are set correctly

## Next Steps

After setup:
1. Test all features manually
2. Configure environment for production
3. Set up proper image hosting
4. Configure email notifications (backend)
5. Set up monitoring and analytics
6. Deploy to production

---

**Last Updated:** 2025-11-10
**Version:** 1.0.0
