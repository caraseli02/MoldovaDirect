# Admin Authentication Diagnosis

## Problem
Admin users are logged in successfully (can access `/admin` pages), but API endpoints return 401 "Authentication required" errors when called from the client-side Pinia store.

## Root Cause Analysis

### What Works
1. ✅ User authentication via Supabase (login successful)
2. ✅ Auth cookies are stored in browser (`sb-khvzbjemydddnryreytu-auth-token`)
3. ✅ Admin middleware properly validates sessions and redirects non-admin users
4. ✅ Admin page loads and shows user info ("Usuario Admin", "Administrador")

### What Doesn't Work
1. ❌ Cookies are NOT sent from browser to server in API requests from Pinia store
2. ❌ Admin dashboard data shows all zeros (no stats fetched)
3. ❌ Both `/api/admin/dashboard/stats` and `/api/admin/dashboard/activity` return 401

### Technical Details

**Cookie Verification:**
- Cookie EXISTS in browser (confirmed via DevTools):
  ```
  sb-khvzbjemydddnryreytu-auth-token=base64-eyJhY2Nlc3...
  ```
- Cookie is NOT received by server (server logs show `Cookie present: false`)

**Server Logs:**
```
[requireAdminRole] Cookie present: false
[requireAdminRole] Cookie value length: 0
[requireAdminRole] User error: Auth session missing!
[requireAdminRole] Current user: null
[requireAdminRole] Authentication failed - throwing 401
```

## Why Cookies Aren't Being Sent

In Nuxt 3 with `@nuxtjs/supabase`, cookies work differently in SSR vs client-side:

1. **During SSR (Server-Side Rendering):**
   - Cookies are automatically included in requests
   - `serverSupabaseClient()` can read cookies from the H3 event
   - Authentication works perfectly

2. **Client-Side Fetch from Pinia Store:**
   - Cookies are NOT automatically included in `$fetch()` or `fetch()` requests
   - Even with `credentials: 'include'`, Nuxt's request handling doesn't forward cookies
   - This is why admin middleware works (SSR) but API calls from store fail (client-side)

## Attempted Solutions

### Solution 1: Added `credentials: 'include'` ❌
- Added to both Pinia store `$fetch()` calls
- **Result:** Cookies still not sent

### Solution 2: Switched to native `fetch()` ❌
- Replaced `$fetch()` with native browser `fetch()`
- **Result:** Cookies still not sent

### Solution 3: Authorization Header with Bearer Token ⚠️ (In Progress)
- Modified Pinia store to get session from `useSupabaseClient()`
- Added `Authorization: Bearer {token}` header to requests
- Updated `server/utils/adminAuth.ts` to accept Bearer tokens
- **Issue:** `useSupabaseClient()` is a Nuxt composable that can't be called inside Pinia store actions

## Correct Solution

The admin dashboard data fetching should happen during SSR using Nuxt composables (`useFetch` or `useAsyncData`), NOT from client-side Pinia store actions.

### Implementation Plan

1. **Move data fetching to page/component level:**
   ```typescript
   // In pages/admin/index.vue or component
   const { data: stats } = await useFetch('/api/admin/dashboard/stats')
   const { data: activity } = await useFetch('/api/admin/dashboard/activity')
   ```

2. **Use Pinia store only for state management:**
   - Store receives data from components
   - Store manages UI state (loading, error, etc.)
   - Store does NOT make API calls

3. **Benefits:**
   - Cookies automatically included during SSR
   - Data fetched before page renders
   - No client-side authentication issues
   - Better SEO and performance

## Files Modified

### server/utils/adminAuth.ts
- Added support for Bearer token authorization
- Checks `Authorization` header first, falls back to cookies
- **Status:** Ready for Bearer token auth

### server/utils/adminCache.ts
- Changed `getAdminCacheKey()` from async to sync
- Removed user ID from cache keys (not needed with auth check in handler)
- **Status:** Working correctly

### stores/adminDashboard.ts
- Added native `fetch()` with Authorization header
- Attempts to use `useSupabaseClient()` to get token
- **Status:** Won't work - composables can't be used in Pinia actions

## Next Steps

1. Refactor admin dashboard to use `useFetch` / `useAsyncData` in component
2. Remove API calls from Pinia store
3. Pass fetched data to store for state management only
4. Test that authentication works with SSR approach

## Environment
- Nuxt: 4.1.3
- Nitro: 2.12.9
- Vue: 3.5.24
- @nuxtjs/supabase: Latest
- Node: Current LTS

## References
- server/api/admin/dashboard/stats.get.ts:46 (where auth check happens)
- server/utils/adminAuth.ts:43 (requireAdminRole function)
- stores/adminDashboard.ts:175 (fetchStats action)
- components/admin/Dashboard/Overview.vue:674 (where store is called)
