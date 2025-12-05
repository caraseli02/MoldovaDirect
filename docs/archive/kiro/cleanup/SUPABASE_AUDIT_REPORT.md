# Supabase Usage Audit Report

**Date:** October 25, 2025  
**Scope:** Deep review of Nuxt Supabase module integration and best practices alignment

## Executive Summary

A comprehensive audit of Supabase usage across the project revealed **31 server API routes** that are not following Nuxt Supabase module best practices. Additionally, documentation and test files contain inconsistent environment variable naming.

### Severity Levels
- 🔴 **Critical**: Breaks functionality after runtime config cleanup
- 🟡 **Medium**: Works but doesn't follow best practices
- 🟢 **Low**: Documentation/consistency issues

---

## Critical Issues Found

### 🔴 Issue #1: Manual Supabase Client Creation in Server Routes

**Problem:** 31 server API routes manually create Supabase clients using `createClient()` from `@supabase/supabase-js` instead of using the Nuxt Supabase module's provided helpers.

**Impact:** 
- These routes try to access `useRuntimeConfig().public.supabaseUrl` which was removed during config cleanup
- **All affected routes are currently broken**
- Not leveraging module's built-in features (automatic credential management, type safety)

**Affected Files (31 total):**

#### Checkout APIs (8 files)
- `server/api/checkout/create-order.post.ts`
- `server/api/checkout/send-confirmation.post.ts`
- `server/api/checkout/update-inventory.post.ts`
- `server/api/checkout/payment-methods.get.ts`
- `server/api/checkout/save-payment-method.post.ts`

#### Order APIs (11 files)
- `server/api/orders/index.get.ts`
- `server/api/orders/[id].get.ts`
- `server/api/orders/create.post.ts`
- `server/api/orders/[id]/tracking.get.ts`
- `server/api/orders/[id]/tracking.post.ts`
- `server/api/orders/[id]/tracking.put.ts`
- `server/api/orders/[id]/sync-tracking.post.ts`
- `server/api/orders/[id]/support.post.ts`
- `server/api/orders/[id]/reorder.post.ts`
- `server/api/orders/[id]/return.post.ts`
- `server/api/orders/[id]/complete.post.ts`

#### Admin APIs (5 files)
- `server/api/admin/orders/index.get.ts`
- `server/api/admin/orders/[id]/status.patch.ts`
- `server/api/admin/users/index.get.ts`
- `server/api/admin/users/[id].get.ts`
- `server/api/admin/users/[id]/activity.get.ts`
- `server/api/admin/users/[id]/actions.post.ts`

#### Other APIs (7 files)
- `server/api/payment-methods/index.get.ts`
- `server/api/payment-methods/create.post.ts`
- `server/api/payment-methods/[id].delete.ts`
- `server/api/cart/validate.post.ts`
- `server/api/cart/clear.post.ts`
- `server/api/shipping/methods.post.ts`
- `server/api/analytics/cart-events.post.ts`
- `server/api/tools/send-test-email.post.ts`

**Current Pattern (WRONG):**
```typescript
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const supabase = createClient(
    useRuntimeConfig().public.supabaseUrl,  // ❌ Doesn't exist anymore
    useRuntimeConfig().supabaseServiceKey   // ❌ Doesn't exist anymore
  )
  // ...
})
```

**Correct Pattern:**
```typescript
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  // Module automatically reads SUPABASE_URL and SUPABASE_SERVICE_KEY
  // ...
})
```

---

### 🟡 Issue #2: Inconsistent Environment Variable Naming

**Problem:** Documentation and test files reference `SUPABASE_ANON_KEY` instead of the official `SUPABASE_KEY` that the Nuxt Supabase module expects.

**Impact:**
- Confusion for developers setting up the project
- Test setup may fail if using wrong variable name
- Documentation doesn't match official Nuxt Supabase docs

**Affected Files:**

#### Documentation (5 files)
- `.kiro/docs/DATABASE_SETUP.md` - Uses `SUPABASE_ANON_KEY`
- `.kiro/docs/DEPLOYMENT_GUIDE.md` - Uses `SUPABASE_ANON_KEY`
- `.kiro/PROJECT_STATUS.md` - Uses `SUPABASE_ANON_KEY`
- `README.md` - Uses `SUPABASE_ANON_KEY`
- `docs/SUPABASE_SETUP.md` - Uses `SUPABASE_ANON_KEY`

#### Test Files (1 file)
- `tests/setup/seed.ts` - Uses `SUPABASE_ANON_KEY`

**Official Nuxt Supabase Module Expects:**
```bash
SUPABASE_URL=https://example.supabase.co
SUPABASE_KEY=your_anon_key_here          # ✅ Correct
SUPABASE_SERVICE_KEY=your_service_key    # ✅ Correct
```

**Currently Documented (WRONG):**
```bash
SUPABASE_URL=https://example.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here     # ❌ Wrong variable name
```

---

### 🟢 Issue #3: Redundant Custom Utility

**Problem:** `server/utils/supabaseAdminClient.ts` provides a custom admin client resolver that's now redundant with the module's `serverSupabaseServiceRole`.

**Impact:**
- Maintenance overhead
- Confusion about which method to use
- The utility tries to access `config.public.supabaseUrl` which no longer exists

**File:** `server/utils/supabaseAdminClient.ts`

**Recommendation:** Deprecate this utility in favor of `serverSupabaseServiceRole(event)` from the Nuxt Supabase module.

---

## What's Working Correctly ✅

### Client-Side Usage
All client-side code correctly uses `useSupabaseClient()`:
- ✅ All auth pages (`pages/auth/*.vue`)
- ✅ Account pages (`pages/account/*.vue`)
- ✅ Auth store (`stores/auth.ts`)
- ✅ Composables (`composables/useShippingAddress.ts`)

### Some Server Routes
These routes correctly use `serverSupabaseClient(event)`:
- ✅ `server/api/categories/[slug].get.ts`
- ✅ `server/api/categories/index.get.ts`
- ✅ `server/api/search/index.get.ts`
- ✅ `server/api/admin/setup-db.post.ts`
- ✅ `server/api/admin/analytics/*.ts` (4 files)

### Middleware
All middleware correctly uses `useSupabaseUser()`:
- ✅ `middleware/auth.ts`
- ✅ `middleware/admin.ts`
- ✅ `middleware/guest.ts`
- ✅ `middleware/verified.ts`

---

## Recommended Actions

### Priority 1: Fix Broken Server Routes (Critical)
Update all 31 server routes to use `serverSupabaseServiceRole(event)` instead of manual `createClient()`.

**Estimated Impact:** 2-3 hours
**Risk:** High - These routes are currently broken

### Priority 2: Update Documentation (Medium)
Replace all instances of `SUPABASE_ANON_KEY` with `SUPABASE_KEY` in documentation files.

**Estimated Impact:** 30 minutes
**Risk:** Low - Documentation only

### Priority 3: Update Test Setup (Medium)
Update `tests/setup/seed.ts` to use `SUPABASE_KEY` instead of `SUPABASE_ANON_KEY`.

**Estimated Impact:** 5 minutes
**Risk:** Low - Tests may already work due to fallback logic

### Priority 4: Deprecate Custom Utility (Low)
Add deprecation notice to `server/utils/supabaseAdminClient.ts` and plan migration.

**Estimated Impact:** 15 minutes
**Risk:** Low - Not widely used

---

## Implementation Plan

### Phase 1: Emergency Fix (Do Now)
1. Restore runtime config temporarily OR
2. Fix all 31 server routes immediately

### Phase 2: Standardization (This Week)
1. Update all documentation
2. Update test setup
3. Add deprecation notice to custom utility

### Phase 3: Verification (Next Week)
1. Run full test suite
2. Manual testing of checkout flow
3. Manual testing of admin features
4. Update steering rules with best practices

---

## Best Practices Going Forward

### Server-Side Supabase Usage

**For operations with user context (respects RLS):**
```typescript
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  // Uses user's JWT, respects Row Level Security
})
```

**For admin operations (bypasses RLS):**
```typescript
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  // Uses service role key, bypasses RLS
})
```

### Client-Side Supabase Usage

```typescript
const supabase = useSupabaseClient()
const user = useSupabaseUser()
```

### Environment Variables

```bash
# Required by @nuxtjs/supabase module
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

### Never Do This

❌ Don't manually create clients in server routes:
```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key) // WRONG
```

❌ Don't manually configure Supabase in runtime config:
```typescript
// nuxt.config.ts
runtimeConfig: {
  public: {
    supabaseUrl: process.env.SUPABASE_URL  // WRONG - module handles this
  }
}
```

---

## References

- [Nuxt Supabase Module Docs](https://supabase.nuxtjs.org/)
- [serverSupabaseClient](https://supabase.nuxtjs.org/services/serversupabaseclient)
- [serverSupabaseServiceRole](https://supabase.nuxtjs.org/services/serversupabaseservicerole)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## Appendix: Quick Fix Script

For bulk updating server routes, use this pattern:

**Find:**
```typescript
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const supabase = createClient(
    useRuntimeConfig().public.supabaseUrl,
    useRuntimeConfig().supabaseServiceKey
  )
```

**Replace with:**
```typescript
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
```
