# 🚀 Quick Start Guide - Auction System Admin Panel

## Prerequisites Checklist

- ✅ Node.js 18+ installed
- ✅ Backend server running on `http://localhost:8080`
- ✅ PostgreSQL database configured

## 1. First Time Setup (3 minutes)

### Step 1: Install Dependencies

```bash
cd "d:\network programming app\Auction\frontend"
npm install
```

### Step 2: Configure Environment

The `.env.local` file is already created with:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will open at: **http://localhost:3000**

## 2. Create Your First Admin Account

### Option A: Register Through UI

1. Go to http://localhost:3000/login
2. Click "Register" tab
3. Fill in:
   - Username: `admin`
   - Email: `admin@auction.com`
   - Password: `admin123`
4. Click "Create Account"

### Option B: Update Existing User to Admin

After registering, run this SQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'admin';
```

### Step 4: Login

1. Go to http://localhost:3000/login
2. Enter credentials
3. You'll be redirected to `/admin` dashboard

## 3. Navigation Guide

### Admin Panel Routes:

- **Dashboard**: `/admin` - Overview & stats
- **Users**: `/admin/users` - Manage users
- **Auctions**: `/admin/auctions` - Manage auctions
- **Transactions**: `/admin/transactions` - View transactions
- **Analytics**: `/admin/analytics` - Charts & reports
- **Monitoring**: `/admin/monitoring` - System health
- **Logs**: `/admin/logs` - System logs
- **Settings**: `/admin/settings` - Configuration

### Regular User Routes:

- **Dashboard**: `/dashboard` - User homepage
- **Login**: `/login` - Authentication

## 4. Testing the Admin Features

### Test User Management:

1. Register a test user
2. Go to `/admin/users`
3. Try:
   - Search for the user
   - Ban the user (red X button)
   - Activate again (green check button)

### Test Auction Management:

1. Create an auction (through API or user interface)
2. Go to `/admin/auctions`
3. View all auctions
4. Filter by status
5. Approve/Cancel as needed

### Test Monitoring:

1. Go to `/admin/monitoring`
2. View real-time system stats
3. Watch for auto-refresh (every 5 seconds)

## 5. Common Tasks

### Change API URL:

Edit `.env.local`:

```
NEXT_PUBLIC_API_URL=http://your-backend-url/api
```

Restart dev server.

### Build for Production:

```bash
npm run build
npm start
```

### Reset Everything:

```bash
rm -rf node_modules .next
npm install
npm run dev
```

## 6. Troubleshooting

### "Cannot connect to backend"

- Check backend is running: http://localhost:8080/api/health
- Verify `.env.local` has correct API URL
- Check CORS is enabled in backend

### "401 Unauthorized"

- Token expired - logout and login again
- Check user role in database
- Verify JWT secret matches backend

### "Page not found"

- Clear `.next` folder
- Restart dev server
- Check you're using correct URL

## 7. File Locations

**Key files to know:**

- API config: `src/lib/api.ts`
- Types: `src/lib/types.ts`
- Auth: `src/contexts/AuthContext.tsx`
- Components: `src/components/`
- Admin pages: `src/app/admin/`

## 8. Default Test Data

### Test Admin User:

- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`

### Test Regular User:

- Username: `testuser`
- Password: `test123`
- Role: `USER`
- Starting Balance: $10,000

## 9. Feature Checklist

After setup, verify these work:

- [ ] Login/Register
- [ ] Admin dashboard shows stats
- [ ] Can view users list
- [ ] Can search users
- [ ] Can ban/activate users
- [ ] Can view auctions
- [ ] Can filter auctions
- [ ] Can view transactions
- [ ] Analytics charts display
- [ ] Monitoring shows system status
- [ ] Settings can be changed
- [ ] Logs are visible
- [ ] Sidebar navigation works
- [ ] Mobile menu works

## 10. Next Steps

1. **Create test data** in backend
2. **Customize** colors/branding in `tailwind.config.js`
3. **Add real data** from backend APIs
4. **Configure** WebSocket for real-time updates
5. **Deploy** to production

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run linter

# Testing
npm test             # Run tests (if configured)

# Maintenance
npm install          # Install dependencies
npm update           # Update packages
```

## 📞 Support

- Check `ADMIN_README.md` for detailed documentation
- Check `IMPLEMENTATION_SUMMARY.md` for complete feature list
- Review code comments in source files

## 🎉 You're All Set!

Your admin panel is ready to use. Login as admin and explore all the features!

**Default URL**: http://localhost:3000
**Admin Panel**: http://localhost:3000/admin
**Backend API**: http://localhost:8080/api

Happy administering! 🚀
