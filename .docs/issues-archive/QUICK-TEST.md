# Quick Admin Authentication Test

## Manual Testing Steps

### 1. Start the Development Server

```bash
npm run dev
```

Wait for the server to start (usually http://localhost:3000)

### 2. Login as Admin

1. Open browser: `http://localhost:3000/auth/login`
2. Enter credentials:
   - Email: `admin@moldovadirect.com`
   - Password: `Admin123!@#`
3. Click "Sign In"

**Expected:** Redirect to `/admin` dashboard

### 3. Verify Dashboard Loads

Check the following:

#### A. No Console Errors
Open browser DevTools (F12) → Console tab

**Expected:**
- ✅ No red errors
- ✅ See: `[AdminAuth] ✓ Admin access granted` in console (if dev server logs are visible)
- ✅ No 401 or 403 errors

#### B. Dashboard Shows Real Data
Look at the dashboard cards:

**Expected:**
- ✅ Revenue Today: Shows amount (not €0.00)
- ✅ Orders Today: Shows number (not 0)
- ✅ Total Users: Shows count (should be > 0)
- ✅ Total Products: Shows count (should be > 0)

#### C. Network Tab Shows Success
Open DevTools → Network tab, filter by "admin"

**Expected:**
- ✅ `/api/admin/dashboard/stats` → Status 200
- ✅ `/api/admin/dashboard/activity` → Status 200
- ✅ Both requests have `Authorization: Bearer ...` header

### 4. Check Server Logs

In the terminal where `npm run dev` is running:

**Expected output:**
```
[AdminAuth] ✓ Admin access granted - GET /api/admin/dashboard/stats - User: admin@moldovadirect.com - Auth: bearer
[AdminAuth] ✓ Admin access granted - GET /api/admin/dashboard/activity - User: admin@moldovadirect.com - Auth: bearer
```

**NOT expected:**
```
❌ [AdminAuth] 401 Unauthorized
❌ [AdminAuth] Bearer token validation failed
❌ [AdminAuth] 403 Forbidden
```

### 5. Test Auto-Refresh

1. Wait 5 minutes (or click "Refresh All" button)
2. Watch network tab

**Expected:**
- ✅ New requests sent every 5 minutes
- ✅ All requests succeed (Status 200)
- ✅ Dashboard updates with new data

---

## Troubleshooting

### Issue: 401 Unauthorized Error

**Symptom:** API requests return 401, dashboard shows "Failed to load data"

**Solutions:**
1. Check if user has admin role:
   - Go to Supabase Dashboard → Table Editor → profiles
   - Find user with email `admin@moldovadirect.com`
   - Ensure `role` column = `admin`

2. Run SQL fix script:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'admin@moldovadirect.com';
   ```

3. Log out and log back in

### Issue: 403 Forbidden Error

**Symptom:** API requests return 403

**Solution:**
User doesn't have admin role in database. See "401 Solutions" above.

### Issue: No Authorization Header

**Symptom:** Network tab shows requests without `Authorization: Bearer ...` header

**Solution:**
1. Clear browser cache and cookies
2. Log out and log back in
3. Check browser console for JavaScript errors
4. Verify `utils/adminFetch.ts` file exists

### Issue: Token Expired

**Symptom:** Dashboard loads initially, then fails after some time

**Solution:**
This is expected after 1 hour (Supabase default). The app should:
1. Automatically refresh the session
2. Retry the request
3. Redirect to login if refresh fails

If this isn't happening, check `utils/adminFetch.ts` has the retry logic.

---

## Quick Verification Checklist

Use this checklist to verify everything is working:

- [ ] Dev server running on http://localhost:3000
- [ ] Can login with admin credentials
- [ ] Redirected to /admin dashboard after login
- [ ] Dashboard cards show real data (not zeros)
- [ ] No 401/403 errors in browser console
- [ ] Server logs show "Admin access granted"
- [ ] Network requests have Authorization header
- [ ] Auto-refresh works after 5 minutes
- [ ] Can navigate to other admin pages (Users, Orders, Products)

If all items checked: **✅ Admin authentication is working correctly!**

---

## Advanced Testing

### Test Session Expiration

1. Login to admin dashboard
2. Open browser DevTools → Application → Local Storage
3. Find Supabase auth token (key starts with `sb-`)
4. Delete the token
5. Try to refresh the dashboard

**Expected:**
- Dashboard shows "Session expired" error
- Automatically redirects to login after 2 seconds

### Test Different User Roles

1. Create a test user with role = 'user' (not admin)
2. Try to login and access /admin

**Expected:**
- Middleware blocks access
- Shows "Admin access required" error
- Redirects to login or shows 403 error

### Test Token in Network Request

1. Open DevTools → Network tab
2. Refresh dashboard
3. Click on `/api/admin/dashboard/stats` request
4. Go to "Headers" tab
5. Find "Authorization" header

**Expected:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Expected vs Actual Results

### ✅ SUCCESS - Everything Working

| Check | Expected | Status |
|-------|----------|--------|
| Login | Redirects to /admin | ✅ PASS |
| Dashboard | Shows real data | ✅ PASS |
| API Requests | Status 200 | ✅ PASS |
| Auth Headers | Bearer token present | ✅ PASS |
| Server Logs | "Admin access granted" | ✅ PASS |
| Auto-refresh | Works every 5 min | ✅ PASS |

### ❌ FAILURE - Issues Found

| Check | Expected | Actual | Fix |
|-------|----------|--------|-----|
| Login | Redirect to /admin | 400 error | Wrong password |
| Dashboard | Real data | All zeros | 401 error - no auth |
| API Requests | Status 200 | Status 401 | No Bearer token |
| Auth Headers | Bearer token | Missing | Fix not applied |
| Server Logs | Access granted | Unauthorized | Check role |

---

## Final Validation

After completing all tests, you should see:

```
✅ Login successful
✅ Dashboard loaded
✅ Stats displayed correctly
✅ Activity feed showing events
✅ No authentication errors
✅ Auto-refresh working
✅ Other admin pages accessible
```

**If you see all green checkmarks:** The authentication fix is successful!

**If you see any red X marks:** Review the troubleshooting section above or check the detailed guide in `/ADMIN-AUTH-FIX-GUIDE.md`
