# Supabase Best Practices Audit - October 25, 2025

## Summary

Completed a comprehensive audit of the project to ensure all files follow Nuxt Supabase module best practices. Fixed 8 files that were not following the recommended patterns.

## Issues Found and Fixed

### 1. Server API Routes Using `useSupabaseClient()` ❌

**Problem:** Five email template admin endpoints were using `useSupabaseClient()` which is a client-side composable, not suitable for server-side operations.

**Files Fixed:**
- `server/api/admin/email-templates/rollback.post.ts`
- `server/api/admin/email-templates/history.get.ts`
- `server/api/admin/email-templates/sync-preview.post.ts`
- `server/api/admin/email-templates/save.post.ts`
- `server/api/admin/email-templates/synchronize.post.ts`

**Solution:** Replaced with `serverSupabaseServiceRole(event)` for admin operations that bypass RLS.

```typescript
// BEFORE (WRONG)
const supabase = useSupabaseClient()

// AFTER (CORRECT)
import { serverSupabaseServiceRole } from '#supabase/server'
const supabase = serverSupabaseServiceRole(event)
```

### 2. Server Utility Using `useSupabaseClient()` ❌

**Problem:** `server/utils/emailRetryService.ts` was using `useSupabaseClient()` in the `getRetryStatistics()` function.

**Files Fixed:**
- `server/utils/emailRetryService.ts`
- `server/api/admin/email-retries/stats.get.ts`

**Solution:** Updated to accept an optional Supabase client parameter and use `resolveSupabaseClient()` pattern like other email utilities.

```typescript
// BEFORE
export async function getRetryStatistics(dateFrom?: string, dateTo?: string) {
  const supabase = useSupabaseClient()
  // ...
}

// AFTER
export async function getRetryStatistics(
  dateFrom?: string,
  dateTo?: string,
  supabaseClient?: any
) {
  const { resolveSupabaseClient } = await import('./supabaseAdminClient')
  const supabase = resolveSupabaseClient(supabaseClient)
  // ...
}
```

### 3. Runtime Config for Background Jobs ✅

**Problem:** `server/utils/supabaseAdminClient.ts` was trying to read from removed runtime config, and the fallback was using `process.env` directly (not recommended in Nuxt).

**Files Fixed:**
- `nuxt.config.ts` - Added Supabase credentials to runtime config
- `server/utils/supabaseAdminClient.ts` - Updated to use `useRuntimeConfig()`

**Solution:** Added Supabase credentials back to runtime config for utilities that run outside request context (email jobs, scheduled tasks).

```typescript
// nuxt.config.ts
runtimeConfig: {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  // Added for fallback service client
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  public: {
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
}
```

### 4. Manual `createClient` in API Route ❌

**Problem:** `server/api/checkout/save-payment-method.post.ts` was importing `serverSupabaseServiceRole` but still using manual `createClient()`.

**Files Fixed:**
- `server/api/checkout/save-payment-method.post.ts`

**Solution:** Replaced manual client creation with `serverSupabaseServiceRole(event)`.

## Verification

### ✅ All Server API Routes
```bash
# No server API files use useSupabaseClient()
grep -r "useSupabaseClient()" server/api/
# Result: No matches ✅
```

### ✅ All Server Utilities
```bash
# No server utilities use useSupabaseClient()
grep -r "useSupabaseClient()" server/utils/
# Result: No matches ✅
```

### ✅ Manual createClient Usage
```bash
# Only supabaseAdminClient.ts uses createClient (as intended)
grep -r "createClient(" server/ --exclude="*.test.ts"
# Result: Only in server/utils/supabaseAdminClient.ts ✅
```

## Best Practices Summary

### Server-Side (API Routes & Utilities)

**For Admin Operations (Bypass RLS):**
```typescript
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  // Admin operations...
})
```

**For User-Context Operations (Respect RLS):**
```typescript
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  // User operations...
})
```

**For Background Jobs (No Request Context):**
```typescript
import { resolveSupabaseClient } from './supabaseAdminClient'

export async function backgroundTask(supabaseClient?: any) {
  const supabase = resolveSupabaseClient(supabaseClient)
  // Background operations...
}
```

### Client-Side (Components & Composables)

```typescript
const supabase = useSupabaseClient()
const user = useSupabaseUser()
```

## Environment Variables

The Nuxt Supabase module automatically reads:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Public anon key (not `SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_KEY` - Service role key (server-only)

In production, set these via your hosting platform:
- Vercel: `NUXT_SUPABASE_URL`, `NUXT_SUPABASE_SERVICE_KEY`
- Or use the standard names if your platform supports them

## Files Modified

1. `server/api/admin/email-templates/rollback.post.ts`
2. `server/api/admin/email-templates/history.get.ts`
3. `server/api/admin/email-templates/sync-preview.post.ts`
4. `server/api/admin/email-templates/save.post.ts`
5. `server/api/admin/email-templates/synchronize.post.ts`
6. `server/utils/emailRetryService.ts`
7. `server/api/admin/email-retries/stats.get.ts`
8. `server/api/checkout/save-payment-method.post.ts`
9. `nuxt.config.ts`
10. `server/utils/supabaseAdminClient.ts`

## Status

✅ **All files now follow Nuxt Supabase module best practices**

- No server files use `useSupabaseClient()`
- All API routes use proper server helpers
- Runtime config properly configured for background jobs
- Follows Nuxt's recommended patterns for environment variables

## References

- [Nuxt Supabase Module Docs](https://supabase.nuxtjs.org/)
- [Runtime Config Best Practices](https://nuxt.com/docs/guide/going-further/runtime-config)
- Project steering: `.kiro/steering/supabase-best-practices.md`
