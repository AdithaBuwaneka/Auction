# Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Issue: "Module not found" errors

**Symptoms:**
```
Error: Cannot find module '@stomp/stompjs'
Error: Cannot find module 'sockjs-client'
```

**Solution:**
```bash
# Install missing dependencies
npm install @stomp/stompjs sockjs-client
npm install --save-dev @types/sockjs-client

# If issues persist, clear cache
rm -rf node_modules package-lock.json
npm install
```

---

### 🔴 Issue: Backend connection refused

**Symptoms:**
- "Network Error" in console
- "Cannot connect to backend" messages
- All API calls failing

**Solution:**

1. **Check backend is running:**
```bash
# Backend should be running on port 8080
curl http://localhost:8080/api/health
```

2. **Verify CORS settings in backend:**
```java
// SecurityConfig.java should allow http://localhost:3000
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedOrigin("http://localhost:3000");
    // ...
}
```

3. **Check .env.local file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

### 🔴 Issue: Login fails with 401 Unauthorized

**Symptoms:**
- "Invalid credentials" error
- Cannot login with correct username/password

**Solution:**

1. **Verify user exists in database:**
```sql
SELECT * FROM users WHERE username = 'your_username';
```

2. **Check password is hashed correctly:**
```bash
# Backend should use BCrypt
# Run create_admin.sql to create test admin user
```

3. **Clear browser cache and localStorage:**
```javascript
// In browser console
localStorage.clear();
location.reload();
```

---

### 🔴 Issue: Auction images not displaying

**Symptoms:**
- Broken image placeholders
- 404 errors for images

**Solution:**

1. **Use placeholder images:**
```javascript
// Images use placeholder service by default
imageUrl: `https://via.placeholder.com/600x400?text=${itemName}`
```

2. **Configure image hosting:**
- Use Cloudinary, AWS S3, or similar
- Update imageUrl in auction creation

3. **CORS for external images:**
```javascript
// next.config.ts
module.exports = {
  images: {
    domains: ['via.placeholder.com', 'your-cdn.com'],
  },
}
```

---

### 🔴 Issue: Bids not updating in real-time

**Symptoms:**
- Have to refresh page to see new bids
- Countdown timer not updating

**Expected Behavior:**
- The app uses **polling** (auto-refresh every 5-10 seconds)
- This is intentional and works correctly

**To Enable True Real-Time (WebSocket):**
```javascript
// Already implemented in lib/websocket.ts
// Import and use in auction detail page

import { websocketService } from '@/lib/websocket';

useEffect(() => {
  websocketService.connect();
  websocketService.subscribeToAuctionUpdates(auctionId, (data) => {
    // Handle updates
  });

  return () => websocketService.disconnect();
}, []);
```

---

### 🔴 Issue: Wallet balance not updating

**Symptoms:**
- Balance shows $0.00
- Deposit/withdraw not reflected

**Solution:**

1. **Check backend wallet endpoints:**
```bash
# Test wallet balance endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/wallet/balance/1
```

2. **Verify user has balance:**
```sql
SELECT balance, frozen_balance FROM users WHERE user_id = 1;
```

3. **Refresh user data:**
```javascript
// Logout and login again to refresh
```

---

### 🔴 Issue: TypeScript compilation errors

**Symptoms:**
```
Type error: Property 'updateUser' does not exist on type 'AuthContextType'
```

**Solution:**

1. **Restart TypeScript server:**
   - In VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

2. **Clear Next.js cache:**
```bash
rm -rf .next
npm run dev
```

3. **Check tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true
  }
}
```

---

### 🔴 Issue: Tailwind styles not applying

**Symptoms:**
- Plain HTML with no styling
- Colors not working

**Solution:**

1. **Check globals.css has Tailwind directives:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

2. **Verify tailwind.config.ts:**
```typescript
content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
],
```

3. **Restart dev server:**
```bash
# Kill and restart
npm run dev
```

---

### 🔴 Issue: Modal not closing with ESC key

**Symptoms:**
- ESC key doesn't close modals
- Have to click outside or X button

**Solution:**
- This is a known behavior in the Modal component
- ESC key handler is implemented but may not work in all browsers
- Use the X button or click backdrop

---

### 🔴 Issue: Countdown timer not showing

**Symptoms:**
- "Invalid date" or "NaN" in countdown
- Timer shows 00:00:00

**Solution:**

1. **Check date format from backend:**
```java
// Backend should return ISO 8601 format
"2024-12-31T23:59:59"
```

2. **Verify auction has valid deadline:**
```javascript
// Should have either currentDeadline or mandatoryEndTime
auction.currentDeadline || auction.mandatoryEndTime
```

---

### 🔴 Issue: "Hydration failed" error in browser

**Symptoms:**
```
Error: Hydration failed because the initial UI does not match
```

**Solution:**

1. **Check for client-only code in server components:**
```javascript
// Use 'use client' directive at top of file
'use client';
```

2. **Avoid using localStorage in initial render:**
```javascript
useEffect(() => {
  // Access localStorage only in useEffect
  const data = localStorage.getItem('key');
}, []);
```

3. **Clear browser cache:**
```bash
# Hard refresh
Cmd/Ctrl + Shift + R
```

---

### 🔴 Issue: Admin panel not accessible

**Symptoms:**
- Redirected to /dashboard when accessing /admin
- "Unauthorized" errors

**Solution:**

1. **Check user role:**
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role); // Should be 'ADMIN'
```

2. **Create admin user:**
```sql
-- Run this in your database
-- See backend/src/main/resources/create_admin.sql
INSERT INTO users (username, email, password_hash, role, balance)
VALUES ('admin', 'admin@auction.com',
  '$2a$10$...', 'ADMIN', 10000.00);
```

3. **Login with admin account:**
- Username: admin
- Password: (from create_admin.sql)

---

### 🔴 Issue: Build fails with type errors

**Symptoms:**
```
npm run build
Type error: Cannot find name 'SockJS'
```

**Solution:**

1. **Install type definitions:**
```bash
npm install --save-dev @types/sockjs-client
```

2. **Skip type checking for build (temporary):**
```json
// next.config.ts
typescript: {
  ignoreBuildErrors: true,
}
```

3. **Fix type errors properly:**
- Review TypeScript errors
- Add proper type definitions
- Use `any` type as last resort

---

### 🔴 Issue: Page not found (404)

**Symptoms:**
- Clicking navigation links shows 404
- Direct URL access fails

**Solution:**

1. **Verify page files exist:**
```
src/app/auctions/page.tsx        ✓
src/app/auctions/[id]/page.tsx   ✓
src/app/wallet/page.tsx          ✓
```

2. **Check file naming:**
- Must be `page.tsx` not `Page.tsx`
- Folder name `[id]` for dynamic routes

3. **Clear .next folder:**
```bash
rm -rf .next
npm run dev
```

---

### 🔴 Issue: Notifications not appearing

**Symptoms:**
- Bell icon shows 0 notifications
- Notifications page is empty

**Expected Behavior:**
- Notifications come from backend
- Backend must send notifications when events occur (bid placed, outbid, etc.)

**Solution:**

1. **Check backend notification service:**
```java
// NotificationService should create notifications
notificationService.createNotification(userId, type, title, message);
```

2. **Test notification endpoint:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/notifications/user/1
```

---

### 🔴 Issue: Search not working

**Symptoms:**
- Search returns no results
- Search box doesn't filter

**Solution:**

1. **Check backend search endpoint:**
```bash
curl "http://localhost:8080/api/auctions/search?keyword=laptop"
```

2. **Verify auctions have searchable content:**
- ItemName should have text
- Description should have text

3. **Check search implementation:**
```javascript
// Uses backend API, not client-side filter
auctionAPI.searchAuctions(keyword)
```

---

## Performance Issues

### Issue: Page loads slowly

**Solutions:**

1. **Reduce auto-refresh frequency:**
   - Edit page files
   - Change `setInterval(fetch, 10000)` to longer interval

2. **Disable auto-refresh temporarily:**
   - Comment out `setInterval` calls
   - Refresh manually

3. **Optimize images:**
   - Use smaller image sizes
   - Enable Next.js image optimization

### Issue: High memory usage

**Solutions:**

1. **Clear intervals on unmount:**
```javascript
useEffect(() => {
  const interval = setInterval(fetch, 5000);
  return () => clearInterval(interval); // Important!
}, []);
```

2. **Limit data fetching:**
   - Only fetch what's needed
   - Use pagination

3. **Close unused tabs**

---

## Getting Help

If none of these solutions work:

1. **Check browser console** for error messages
2. **Check backend logs** for API errors
3. **Verify database** has correct data
4. **Try incognito mode** to rule out cache issues
5. **Check network tab** in DevTools for failed requests

### Useful Commands

```bash
# Check if backend is running
curl http://localhost:8080/api/health

# Check authentication
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/users/me

# View backend logs
cd backend
tail -f logs/application.log

# Clear everything and start fresh
rm -rf node_modules .next
npm install
npm run dev
```

---

**Last Updated:** 2025-11-10
