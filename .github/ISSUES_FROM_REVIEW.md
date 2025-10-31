# GitHub Issues from Code Review 2025

This document contains all GitHub issues derived from the comprehensive code review.
Each issue is formatted for easy copy-paste into GitHub.

**Total Issues:** 27
**Critical:** 5 | **High:** 8 | **Medium:** 9 | **Low:** 5

---

## 🚨 CRITICAL PRIORITY ISSUES

### Issue #1: [CRITICAL SECURITY] Re-enable Authentication Middleware

**Labels:** `security`, `critical`, `bug`, `admin`
**Milestone:** Security Hardening Sprint
**Priority:** P0 - Critical

**Description:**
The authentication middleware for admin routes is currently completely bypassed for testing purposes, leaving the entire admin dashboard accessible without authentication.

**Location:**
- File: `middleware/admin.ts:16-20`

**Current Code:**
```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  // TESTING MODE: Temporarily disabled for E2E testing
  // TODO: Re-enable after testing is complete
  console.log('Admin middleware: BYPASSED FOR TESTING')
  return
```

**Security Impact:**
- **Severity:** CRITICAL
- Anyone can access admin dashboard without credentials
- Potential data breach, unauthorized modifications
- Financial loss risk
- Compliance violations (GDPR, PCI-DSS)

**Acceptance Criteria:**
- [ ] Remove test bypass code
- [ ] Re-enable full authentication check
- [ ] Verify admin role checking works
- [ ] Enforce MFA (AAL2) for admin users
- [ ] Add session timeout (30 minutes)
- [ ] Test with E2E tests
- [ ] Add monitoring/alerts for unauthorized access attempts

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 2.1
- Related: #2 (MFA Enforcement), #5 (API Authorization)

**Estimated Effort:** 1 day

---

### Issue #2: [CRITICAL SECURITY] Enforce MFA for Admin Users

**Labels:** `security`, `critical`, `enhancement`, `admin`, `mfa`
**Milestone:** Security Hardening Sprint
**Priority:** P0 - Critical

**Description:**
Multi-Factor Authentication (MFA) enforcement for admin users is currently commented out in the admin middleware, leaving admin accounts vulnerable to credential theft.

**Location:**
- File: `middleware/admin.ts:46-87`

**Current State:**
- MFA enrollment code exists but is commented out
- Admin users can access dashboard with just password
- No AAL2 (Authenticator Assurance Level 2) enforcement

**Security Impact:**
- Admin accounts vulnerable without 2FA
- Single point of failure (password only)
- Increased risk of unauthorized access

**Acceptance Criteria:**
- [ ] Uncomment MFA enforcement code
- [ ] Verify AAL2 check works correctly
- [ ] Redirect to MFA setup if not configured
- [ ] Test MFA verification flow
- [ ] Add grace period for existing admins (7 days)
- [ ] Send email notification to admins requiring MFA setup
- [ ] Update admin documentation

**Implementation Notes:**
```typescript
// Check Authenticator Assurance Level (AAL)
const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
if (aalData.currentLevel !== 'aal2') {
  // Redirect to MFA setup or verification
}
```

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 2.1
- Related: #1 (Auth Middleware), #10 (Auth Store Split)
- Supabase MFA Docs: https://supabase.com/docs/guides/auth/auth-mfa

**Estimated Effort:** 2 days

---

### Issue #3: [CRITICAL SECURITY] Implement Rate Limiting on Auth Endpoints

**Labels:** `security`, `critical`, `enhancement`, `authentication`
**Milestone:** Security Hardening Sprint
**Priority:** P0 - Critical

**Description:**
Authentication endpoints lack rate limiting, making them vulnerable to brute force attacks and credential stuffing.

**Location:**
- File: `pages/auth/login.vue:345-387`
- Endpoints: `/api/auth/*`, login form

**Current State:**
- No rate limiting on login attempts
- No IP-based throttling
- No account lockout after failed attempts

**Security Risk:**
- Brute force password attacks
- Credential stuffing attacks
- Account takeover risk
- DDoS potential

**Proposed Solution:**
Implement rate limiting middleware using Upstash Redis or Cloudflare KV:
- **Auth endpoints:** 5 attempts per 15 minutes per IP
- **API endpoints:** 100 requests per minute per IP
- **Checkout endpoints:** 10 attempts per hour per session

**Acceptance Criteria:**
- [ ] Create rate limiting middleware
- [ ] Implement Redis/Upstash KV storage
- [ ] Add IP-based throttling
- [ ] Add user-based throttling (after auth)
- [ ] Return proper 429 (Too Many Requests) responses
- [ ] Add Retry-After header
- [ ] Log rate limit violations
- [ ] Add monitoring/alerting
- [ ] Update API documentation

**Implementation Example:**
```typescript
// server/middleware/rateLimit.ts
export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event)
  const key = `rate-limit:${ip}:${event.path}`

  // Check Redis for rate limit
  const attempts = await redis.incr(key)
  if (attempts === 1) {
    await redis.expire(key, 900) // 15 minutes
  }

  if (attempts > 5) {
    throw createError({
      statusCode: 429,
      message: 'Too many requests. Please try again later.'
    })
  }
})
```

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 1.2
- Upstash Redis: https://upstash.com/
- OWASP Rate Limiting: https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks

**Estimated Effort:** 2 days

---

### Issue #4: [CRITICAL SECURITY] Add Server-Side Price Verification

**Labels:** `security`, `critical`, `bug`, `checkout`, `payments`
**Milestone:** Security Hardening Sprint
**Priority:** P0 - Critical

**Description:**
Cart prices are calculated client-side and passed to checkout without server-side verification, allowing potential price manipulation via browser DevTools.

**Location:**
- File: `stores/cart/core.ts` (client-side calculation)
- Missing: Server-side verification in checkout flow

**Current Code:**
```typescript
// Client-side (vulnerable)
const subtotal = computed(() => {
  return items.value.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity)
  }, 0)
})
```

**Security Risk:**
- Price manipulation via DevTools
- Financial loss
- Revenue leakage
- Fraud potential

**Proposed Solution:**
Create server-side verification endpoint:

```typescript
// server/api/checkout/verify-cart.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { items, clientTotal } = body

  // Fetch current prices from database
  let serverTotal = 0
  for (const item of items) {
    const product = await fetchProduct(item.productId)
    serverTotal += product.price_eur * item.quantity
  }

  // Compare with client-submitted total
  const difference = Math.abs(serverTotal - clientTotal)
  if (difference > 0.01) { // Allow 1 cent rounding
    throw createError({
      statusCode: 400,
      message: 'Price mismatch detected. Please refresh your cart.'
    })
  }

  return { verified: true, total: serverTotal }
})
```

**Acceptance Criteria:**
- [ ] Create `/api/checkout/verify-cart` endpoint
- [ ] Verify all prices from database
- [ ] Check for price changes since cart was loaded
- [ ] Validate product availability
- [ ] Check for valid discount codes
- [ ] Calculate tax server-side
- [ ] Return verified total
- [ ] Add error handling for price mismatches
- [ ] Test with various scenarios
- [ ] Add monitoring for verification failures

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 1.2
- Related: #7 (Cart Encryption)

**Estimated Effort:** 2 days

---

### Issue #5: [CRITICAL SECURITY] Add API-Level Authorization Checks

**Labels:** `security`, `critical`, `bug`, `api`, `admin`
**Milestone:** Security Hardening Sprint
**Priority:** P0 - Critical

**Description:**
Admin API routes lack secondary authorization checks and rely solely on middleware (which is currently disabled), leaving API endpoints completely exposed.

**Location:**
- Directory: `server/api/admin/**/*.ts` (47+ endpoints)
- Examples: `server/api/admin/orders/index.get.ts`, `server/api/admin/products/index.get.ts`

**Current State:**
- API routes rely only on middleware for auth
- No role verification at API level
- Service role key potentially exposed
- Vulnerable when middleware is bypassed

**Security Risk:**
- Direct API access without authentication
- Unauthorized data access
- Potential data modification
- Privilege escalation

**Proposed Solution:**
Create reusable authorization helper:

```typescript
// server/utils/adminAuth.ts
export async function requireAdminUser(event: H3Event) {
  const supabase = serverSupabaseClient(event)

  // Get user from session
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  // Check admin role
  const isAdmin = user.app_metadata?.role === 'admin' ||
                  user.user_metadata?.role === 'admin'

  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Admin access required'
    })
  }

  // Check MFA (AAL2)
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aalData?.currentLevel !== 'aal2') {
    throw createError({
      statusCode: 403,
      message: 'MFA verification required'
    })
  }

  return user
}
```

**Acceptance Criteria:**
- [ ] Create `requireAdminUser()` helper
- [ ] Add authorization to ALL admin API routes (47 endpoints)
- [ ] Verify role checking works
- [ ] Enforce AAL2 (MFA) at API level
- [ ] Add request logging
- [ ] Test each endpoint
- [ ] Add E2E tests for auth failures
- [ ] Update API documentation

**Implementation Checklist:**
- [ ] Analytics endpoints (5)
- [ ] Dashboard endpoints (2)
- [ ] Email log endpoints (3)
- [ ] Email template endpoints (7)
- [ ] Inventory endpoints (2)
- [ ] Product endpoints (7)
- [ ] User endpoints (4)
- [ ] Order endpoints (8)
- [ ] Bulk operation endpoints (3)
- [ ] Utility endpoints (6)

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 2.2
- Related: #1 (Auth Middleware), #2 (MFA Enforcement)

**Estimated Effort:** 3 days

---

## 🟡 HIGH PRIORITY ISSUES

### Issue #6: Refactor Products Page - Split into Smaller Components

**Labels:** `tech-debt`, `refactoring`, `high-priority`, `user-facing`
**Milestone:** Technical Debt Sprint
**Priority:** P1 - High

**Description:**
The products page component is 915 lines long, making it difficult to maintain, test, and optimize. It mixes UI rendering, business logic, and API calls.

**Location:**
- File: `pages/products/index.vue:1-914`

**Current Issues:**
- **915 lines** (recommended: <400)
- 40+ reactive refs/computed
- Mixed concerns (UI, logic, API)
- Hard to test individual features
- Poor code reusability
- Slow render performance

**Proposed Solution:**
Split into focused components:

```
pages/products/index.vue (200 lines)
  ├─ components/product/Filters.vue (150 lines)
  │   ├─ Filter by category
  │   ├─ Filter by price
  │   └─ Filter by attributes
  ├─ components/product/SearchBar.vue (100 lines)
  ├─ components/product/Grid.vue (120 lines)
  ├─ components/product/Pagination.vue (80 lines)
  └─ components/product/EditorialStories.vue (100 lines)

composables/useProductFilters.ts (200 lines)
composables/useProductSearch.ts (150 lines)
composables/useProductPagination.ts (100 lines)
```

**Acceptance Criteria:**
- [ ] Create `components/product/Filters.vue` (<150 lines)
- [ ] Create `components/product/SearchBar.vue` (<100 lines)
- [ ] Create `components/product/Grid.vue` (<120 lines)
- [ ] Create `components/product/Pagination.vue` (<80 lines)
- [ ] Extract filter logic to `composables/useProductFilters.ts`
- [ ] Extract search logic to `composables/useProductSearch.ts`
- [ ] Main page component <200 lines
- [ ] All tests passing
- [ ] Performance benchmarks maintained
- [ ] Update documentation

**Benefits:**
- Easier to maintain
- Better testability
- Improved performance
- Better code reuse
- Easier onboarding for new developers

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 1.1
- Vue Component Best Practices: https://vuejs.org/guide/best-practices/

**Estimated Effort:** 4 days

---

### Issue #7: Implement Cart Data Encryption in LocalStorage

**Labels:** `security`, `enhancement`, `high-priority`, `user-facing`
**Milestone:** Security Hardening Sprint
**Priority:** P1 - High

**Description:**
Cart data is stored unencrypted in localStorage, allowing potential price manipulation and data tampering via browser DevTools.

**Location:**
- File: `stores/cart/persistence.ts`

**Current Code:**
```typescript
window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
```

**Security Risk:**
- Cart data tampering
- Price manipulation
- Quantity manipulation
- Product substitution

**Proposed Solution:**
Implement encryption using Web Crypto API:

```typescript
// lib/cartSecurity.ts
export class CartSecurity {
  private static async getKey(): Promise<CryptoKey> {
    // Derive key from user session + app secret
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(sessionId + APP_SECRET),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )

    return window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  static async encrypt(data: CartData): Promise<string> {
    const key = await this.getKey()
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(JSON.stringify(data))
    )

    return btoa(JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    }))
  }

  static async decrypt(encrypted: string): Promise<CartData> {
    // Decrypt implementation
  }
}
```

**Acceptance Criteria:**
- [ ] Create `lib/cartSecurity.ts` with encryption functions
- [ ] Use Web Crypto API (AES-GCM)
- [ ] Encrypt before localStorage write
- [ ] Decrypt on localStorage read
- [ ] Handle encryption errors gracefully
- [ ] Add integrity checks (HMAC)
- [ ] Test cross-browser compatibility
- [ ] Add performance benchmarks
- [ ] Update cart persistence logic
- [ ] Add unit tests

**Alternative Approach:**
Use session-based storage instead of localStorage:
- Store cart ID in cookie (encrypted)
- Store cart data on server
- Sync on every page load

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 1.2
- Related: #4 (Server-Side Price Verification)
- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API

**Estimated Effort:** 3 days

---

### Issue #8: Add Global Error Boundary Component

**Labels:** `bug`, `enhancement`, `high-priority`, `user-facing`
**Milestone:** UX Improvements Sprint
**Priority:** P1 - High

**Description:**
The application lacks a global error boundary, causing unhandled errors to break the entire UI and provide poor user experience.

**Current Issues:**
- Unhandled errors crash the entire page
- No fallback UI for errors
- Users see blank screen or console errors
- No error reporting/logging
- Inconsistent error handling across pages

**Proposed Solution:**
Implement global error boundary with fallback UI:

```vue
<!-- app.vue -->
<template>
  <CommonErrorBoundary
    @error="handleGlobalError"
    :fallback-component="ErrorFallback"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </CommonErrorBoundary>
</template>

<script setup lang="ts">
const handleGlobalError = (error: Error, info: ErrorInfo) => {
  // Log to error tracking service (Sentry, etc.)
  console.error('Global error caught:', error, info)

  // Send to analytics
  trackError(error)

  // Show toast notification
  toast.error('Something went wrong', {
    description: 'We\'ve been notified and are working on a fix.',
    action: {
      label: 'Reload',
      onClick: () => window.location.reload()
    }
  })
}
</script>
```

```vue
<!-- components/common/ErrorBoundary.vue -->
<template>
  <div v-if="error" class="error-boundary">
    <slot name="fallback" :error="error" :reset="reset">
      <ErrorFallback :error="error" @reset="reset" />
    </slot>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
const error = ref<Error | null>(null)

const reset = () => {
  error.value = null
}

onErrorCaptured((err) => {
  error.value = err
  emit('error', err)
  return false // Prevent error from propagating
})
</script>
```

**Acceptance Criteria:**
- [ ] Create `CommonErrorBoundary` component
- [ ] Create `ErrorFallback` component with retry button
- [ ] Integrate with error tracking (Sentry/LogRocket)
- [ ] Add different fallbacks for different error types
- [ ] Implement error recovery strategies
- [ ] Add error reporting
- [ ] Test with various error scenarios
- [ ] Add documentation

**Error Handling Strategy:**
- **Network errors:** Show retry button
- **Auth errors:** Redirect to login
- **Not found errors:** Show 404 page
- **Server errors:** Show 500 page with support link
- **Unknown errors:** Show generic error with reload option

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 1.3
- Vue Error Handling: https://vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured

**Estimated Effort:** 2 days

---

### Issue #9: Improve Mobile User Experience

**Labels:** `enhancement`, `mobile`, `high-priority`, `user-facing`, `ux`
**Milestone:** Mobile UX Sprint
**Priority:** P1 - High

**Description:**
Mobile user experience is inconsistent with missing gestures, poor touch targets, and incomplete PWA features.

**Current Issues:**
- Pull-to-refresh only on products page
- No swipe gestures for cart items
- Missing bottom navigation
- Touch targets smaller than 44px in some places
- No swipe-to-delete on cart items
- Virtual scrolling not used consistently

**Proposed Improvements:**

**1. Swipe-to-Remove for Cart Items**
```vue
<!-- components/cart/Item.vue -->
<template>
  <div
    ref="itemRef"
    class="cart-item"
    :style="{ transform: `translateX(${swipeDistance}px)` }"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Cart item content -->
  </div>
  <div v-if="showDeleteButton" class="delete-action">
    <button @click="handleDelete">Delete</button>
  </div>
</template>
```

**2. Bottom Navigation for Mobile**
```vue
<!-- components/layout/MobileBottomNav.vue -->
<template>
  <nav class="fixed bottom-0 inset-x-0 bg-white border-t z-50">
    <div class="flex justify-around py-2">
      <NuxtLink to="/" class="nav-item">
        <Icon name="home" />
        <span>Home</span>
      </NuxtLink>
      <NuxtLink to="/products" class="nav-item">
        <Icon name="grid" />
        <span>Shop</span>
      </NuxtLink>
      <NuxtLink to="/cart" class="nav-item">
        <Icon name="shopping-cart" />
        <Badge>{{ cartCount }}</Badge>
        <span>Cart</span>
      </NuxtLink>
      <NuxtLink to="/account" class="nav-item">
        <Icon name="user" />
        <span>Account</span>
      </NuxtLink>
    </div>
  </nav>
</template>
```

**3. Pull-to-Refresh Everywhere**
- Add to cart page
- Add to orders page
- Add to account page

**4. Touch Target Optimization**
- Audit all buttons/links
- Ensure minimum 44x44px touch targets
- Add padding for smaller elements

**Acceptance Criteria:**
- [ ] Implement swipe-to-remove on cart items
- [ ] Create mobile bottom navigation component
- [ ] Add pull-to-refresh to all pages
- [ ] Audit and fix touch target sizes (<44px)
- [ ] Add haptic feedback for interactions
- [ ] Implement swipe navigation between pages
- [ ] Add virtual scrolling to cart (>20 items)
- [ ] Test on iOS and Android devices
- [ ] Update documentation

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 1.3
- Related: Existing pull-to-refresh in `pages/products/index.vue:387-390`

**Estimated Effort:** 5 days

---

### Issue #10: Split Auth Store into Smaller Modules

**Labels:** `tech-debt`, `refactoring`, `high-priority`, `admin`
**Milestone:** Technical Debt Sprint
**Priority:** P1 - High

**Description:**
The authentication store is 1,172 lines long with mixed concerns, making it difficult to maintain, test, and understand.

**Location:**
- File: `stores/auth.ts:1-1172`

**Current Issues:**
- **1,172 lines** (recommended: <500 per module)
- Mixed concerns: login, MFA, profile, lockout
- Hard to test specific features
- Complex state management
- Poor code navigation

**Proposed Solution:**
Split into focused modules:

```
stores/auth/
├── index.ts (100 lines) - Main coordinator
├── core.ts (300 lines) - Login, logout, session
├── mfa.ts (250 lines) - MFA enrollment/verification
├── profile.ts (200 lines) - Profile management
├── lockout.ts (150 lines) - Account locking
├── types.ts (100 lines) - Type definitions
└── utils.ts (150 lines) - Helper functions
```

**Module Breakdown:**

**1. `stores/auth/core.ts`**
- Login/logout
- Session management
- Token refresh
- Basic auth state

**2. `stores/auth/mfa.ts`**
- MFA enrollment
- MFA verification
- Challenge management
- Factor management
- AAL checking

**3. `stores/auth/profile.ts`**
- Profile updates
- Email changes
- Password changes
- User preferences

**4. `stores/auth/lockout.ts`**
- Lockout triggers
- Lockout persistence
- Unlock logic
- Lockout state management

**5. `stores/auth/index.ts` (Main Store)**
- Coordinates all modules
- Exports unified interface
- Handles cross-module communication

**Acceptance Criteria:**
- [ ] Create `stores/auth/` directory
- [ ] Create `core.ts` module (<300 lines)
- [ ] Create `mfa.ts` module (<250 lines)
- [ ] Create `profile.ts` module (<200 lines)
- [ ] Create `lockout.ts` module (<150 lines)
- [ ] Create `types.ts` for shared types
- [ ] Create `utils.ts` for helpers
- [ ] Update main `index.ts` to coordinate
- [ ] Update all imports across codebase
- [ ] Ensure all tests pass
- [ ] Add module-specific tests
- [ ] Update documentation

**Benefits:**
- Easier to maintain
- Better testability
- Clearer separation of concerns
- Easier to onboard new developers
- Better code organization

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 2.5
- Pinia Store Patterns: https://pinia.vuejs.org/cookbook/

**Estimated Effort:** 4 days

---

### Issue #11: Implement Admin Action Audit Logging

**Labels:** `security`, `enhancement`, `high-priority`, `admin`, `compliance`
**Milestone:** Admin Security Sprint
**Priority:** P1 - High

**Description:**
Admin actions are not logged, making it impossible to audit changes, investigate issues, or maintain compliance with regulations.

**Current Issues:**
- No audit trail for admin actions
- Can't track who made what changes
- Can't investigate incidents
- Compliance risk (GDPR, SOX)
- No accountability

**Proposed Solution:**

**1. Create Audit Log Schema**
```sql
-- supabase/sql/admin-audit-log.sql
CREATE TABLE admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'bulk_update', etc.
  resource_type TEXT NOT NULL, -- 'product', 'order', 'user', etc.
  resource_id TEXT, -- ID of affected resource
  changes JSONB, -- Before/after state
  metadata JSONB, -- Additional context
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_admin_audit_log_admin_id (admin_id),
  INDEX idx_admin_audit_log_resource (resource_type, resource_id),
  INDEX idx_admin_audit_log_created_at (created_at)
);

-- Enable RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can read all logs
CREATE POLICY admin_audit_log_read ON admin_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (app_metadata->>'role' = 'admin' OR user_metadata->>'role' = 'admin')
    )
  );
```

**2. Create Audit Logging Utility**
```typescript
// server/utils/auditLog.ts
export async function logAdminAction(
  event: H3Event,
  action: string,
  resourceType: string,
  resourceId?: string,
  changes?: any,
  metadata?: any
) {
  try {
    const user = await requireAdminUser(event)
    const ip = getRequestIP(event)
    const userAgent = getHeader(event, 'user-agent')

    const supabase = serverSupabaseServiceRole(event)

    await supabase.from('admin_audit_log').insert({
      admin_id: user.id,
      admin_email: user.email,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      changes,
      metadata,
      ip_address: ip,
      user_agent: userAgent,
      success: true
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
    // Don't throw - logging should not break operations
  }
}
```

**3. Add Logging to Admin API Routes**
```typescript
// server/api/admin/products/[id].put.ts
export default defineEventHandler(async (event) => {
  const user = await requireAdminUser(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Get current state (before)
  const { data: before } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  // Update product
  const { data: after, error } = await supabase
    .from('products')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    await logAdminAction(
      event,
      'update',
      'product',
      id,
      null,
      { error: error.message },
      false
    )
    throw error
  }

  // Log successful action
  await logAdminAction(
    event,
    'update',
    'product',
    id,
    { before, after },
    { fields_changed: Object.keys(body) }
  )

  return { success: true, data: after }
})
```

**4. Create Audit Log Viewer**
```vue
<!-- pages/admin/audit-log.vue -->
<template>
  <div>
    <h1>Audit Log</h1>

    <!-- Filters -->
    <AdminAuditLogFilters
      v-model:admin-id="filters.adminId"
      v-model:resource-type="filters.resourceType"
      v-model:action="filters.action"
      v-model:date-range="filters.dateRange"
    />

    <!-- Audit log table -->
    <AdminAuditLogTable
      :logs="auditLogs"
      :loading="loading"
      @view-details="viewLogDetails"
    />
  </div>
</template>
```

**Acceptance Criteria:**
- [ ] Create `admin_audit_log` table with RLS
- [ ] Create `logAdminAction()` utility function
- [ ] Add logging to ALL admin API routes
- [ ] Create audit log viewer page
- [ ] Add filters (admin, resource type, action, date)
- [ ] Add log detail view with diff viewer
- [ ] Add export to CSV functionality
- [ ] Add retention policy (e.g., 1 year)
- [ ] Add automated cleanup job
- [ ] Test logging performance
- [ ] Update documentation

**Actions to Log:**
- Product: create, update, delete, bulk_update, inventory_adjust
- Order: create, update, status_change, cancel, refund
- User: create, update, delete, suspend, activate, role_change
- Email Template: create, update, delete, preview, sync
- Bulk Operations: bulk_delete, bulk_update, bulk_export

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 2.2

**Estimated Effort:** 5 days

---

### Issue #12: Implement Email Template Security Hardening

**Labels:** `security`, `enhancement`, `high-priority`, `admin`
**Milestone:** Admin Security Sprint
**Priority:** P1 - High

**Description:**
Email templates are editable by admins without proper validation, potentially allowing script injection and malicious code execution in the preview endpoint.

**Location:**
- File: `server/api/admin/email-templates/preview.post.ts`
- File: `server/api/admin/email-templates/save.post.ts`

**Security Risks:**
- Script injection in templates
- XSS attacks via preview
- Malicious code execution
- Data exfiltration via email templates

**Proposed Solution:**

**1. Template Validation**
```typescript
// server/utils/emailTemplateValidator.ts
import DOMPurify from 'isomorphic-dompurify'

export function validateEmailTemplate(template: string): {
  isValid: boolean
  errors: string[]
  sanitized: string
} {
  const errors: string[] = []

  // Check for dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
    /<iframe/i,
    /<object/i,
    /<embed/i
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(template)) {
      errors.push(`Dangerous pattern detected: ${pattern.source}`)
    }
  }

  // Sanitize HTML
  const sanitized = DOMPurify.sanitize(template, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'img',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
      'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
    ALLOW_DATA_ATTR: false
  })

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  }
}
```

**2. Content Security Policy for Preview**
```typescript
// server/api/admin/email-templates/preview.post.ts
export default defineEventHandler(async (event) => {
  const user = await requireAdminUser(event)
  const body = await readBody(event)

  // Validate template
  const validation = validateEmailTemplate(body.template)
  if (!validation.isValid) {
    throw createError({
      statusCode: 400,
      message: 'Invalid template',
      data: validation.errors
    })
  }

  // Set strict CSP headers for preview
  setHeader(event, 'Content-Security-Policy', [
    "default-src 'none'",
    "img-src https: data:",
    "style-src 'unsafe-inline'",
    "font-src https:",
    "connect-src 'none'",
    "script-src 'none'",
    "frame-ancestors 'none'"
  ].join('; '))

  // Render preview in sandboxed iframe
  return {
    html: validation.sanitized,
    warnings: validation.errors
  }
})
```

**3. Template Variable Whitelisting**
```typescript
// server/utils/emailTemplateVariables.ts
export const ALLOWED_VARIABLES = {
  order: [
    'order_number',
    'customer_name',
    'total_amount',
    'order_date',
    'items',
    'shipping_address'
  ],
  user: [
    'name',
    'email',
    'preferred_language'
  ],
  system: [
    'site_url',
    'support_email',
    'company_name'
  ]
} as const

export function validateTemplateVariables(template: string): {
  isValid: boolean
  invalidVariables: string[]
} {
  const variablePattern = /\{\{([^}]+)\}\}/g
  const matches = [...template.matchAll(variablePattern)]
  const invalidVariables: string[] = []

  for (const match of matches) {
    const variable = match[1].trim()
    const [category, field] = variable.split('.')

    if (!ALLOWED_VARIABLES[category]?.includes(field)) {
      invalidVariables.push(variable)
    }
  }

  return {
    isValid: invalidVariables.length === 0,
    invalidVariables
  }
}
```

**4. Template Preview Sandboxing**
```vue
<!-- components/admin/EmailTemplatePreview.vue -->
<template>
  <div class="preview-container">
    <iframe
      ref="previewFrame"
      sandbox="allow-same-origin"
      :srcdoc="sanitizedHtml"
      class="email-preview"
    />
  </div>
</template>
```

**Acceptance Criteria:**
- [ ] Install and configure DOMPurify
- [ ] Create template validation utility
- [ ] Whitelist allowed HTML tags
- [ ] Whitelist allowed template variables
- [ ] Add CSP headers to preview endpoint
- [ ] Sandbox preview in iframe
- [ ] Add validation before save
- [ ] Show validation errors to admin
- [ ] Document allowed variables
- [ ] Add unit tests for validation
- [ ] Test with malicious inputs

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 2.6

**Estimated Effort:** 3 days

---

### Issue #13: Add Bulk Operation Undo Functionality

**Labels:** `enhancement`, `ux`, `high-priority`, `admin`
**Milestone:** Admin UX Sprint
**Priority:** P1 - High

**Description:**
Bulk operations (delete, status update) are destructive with no undo capability, risking accidental data loss.

**Current Issues:**
- No undo for bulk operations
- Destructive actions are permanent
- Risk of accidental data loss
- Poor admin UX

**Proposed Solution:**

**1. Add Undo Stack to Store**
```typescript
// stores/adminOrders.ts
interface UndoAction {
  id: string
  type: 'bulk-update' | 'bulk-delete'
  timestamp: Date
  snapshot: any[]
  description: string
}

export const useAdminOrdersStore = defineStore('adminOrders', {
  state: () => ({
    // ... existing state
    undoStack: [] as UndoAction[],
    redoStack: [] as UndoAction[]
  }),

  actions: {
    async bulkUpdateStatus(status: string, notes?: string) {
      // Capture current state before update
      const snapshot = this.selectedOrders.map(id => {
        const order = this.orders.find(o => o.id === id)
        return {
          id,
          previousStatus: order?.status,
          previousNotes: order?.notes
        }
      })

      // Perform bulk update
      const results = await this.performBulkUpdate(status, notes)

      // Add to undo stack
      this.undoStack.push({
        id: crypto.randomUUID(),
        type: 'bulk-update',
        timestamp: new Date(),
        snapshot,
        description: `Updated ${snapshot.length} orders to ${status}`
      })

      // Limit undo stack size
      if (this.undoStack.length > 10) {
        this.undoStack.shift()
      }

      // Clear redo stack
      this.redoStack = []

      return results
    },

    async undoLastAction() {
      const action = this.undoStack.pop()
      if (!action) return

      if (action.type === 'bulk-update') {
        // Restore previous state
        for (const item of action.snapshot) {
          await this.updateOrderStatus(item.id, item.previousStatus)
        }
      } else if (action.type === 'bulk-delete') {
        // Restore deleted items
        for (const item of action.snapshot) {
          await this.restoreOrder(item)
        }
      }

      // Move to redo stack
      this.redoStack.push(action)

      // Refresh data
      await this.fetchOrders()
    },

    async redoLastAction() {
      const action = this.redoStack.pop()
      if (!action) return

      // Re-apply the action
      // ... implementation

      this.undoStack.push(action)
    }
  }
})
```

**2. Add Undo UI Component**
```vue
<!-- components/admin/UndoToast.vue -->
<template>
  <Transition name="slide-up">
    <div v-if="showUndo" class="fixed bottom-4 right-4 bg-gray-900 text-white rounded-lg shadow-lg p-4 flex items-center gap-4">
      <div>
        <p class="font-medium">{{ undoAction.description }}</p>
        <p class="text-sm text-gray-400">{{ formatTimestamp(undoAction.timestamp) }}</p>
      </div>
      <Button @click="handleUndo" variant="ghost" size="sm">
        <Icon name="undo" class="mr-2" />
        Undo
      </Button>
      <Button @click="hideUndo" variant="ghost" size="sm">
        <Icon name="x" />
      </Button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const adminOrdersStore = useAdminOrdersStore()

const showUndo = computed(() => adminOrdersStore.undoStack.length > 0)
const undoAction = computed(() => adminOrdersStore.undoStack[adminOrdersStore.undoStack.length - 1])

// Auto-hide after 10 seconds
let hideTimer: NodeJS.Timeout | null = null

watch(showUndo, (show) => {
  if (show) {
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      hideUndo()
    }, 10000)
  }
})

const handleUndo = async () => {
  await adminOrdersStore.undoLastAction()
  if (hideTimer) clearTimeout(hideTimer)
}

const hideUndo = () => {
  adminOrdersStore.undoStack.pop()
}
</script>
```

**3. Add Soft Delete for Reversibility**
```sql
-- Add deleted_at column for soft deletes
ALTER TABLE orders ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMPTZ;

-- Update queries to exclude soft-deleted items
CREATE VIEW orders_active AS
  SELECT * FROM orders WHERE deleted_at IS NULL;
```

**Acceptance Criteria:**
- [ ] Add undo/redo stack to admin stores
- [ ] Capture state before bulk operations
- [ ] Implement undo functionality for bulk updates
- [ ] Implement undo functionality for bulk deletes
- [ ] Create undo toast UI component
- [ ] Add keyboard shortcut (Ctrl/Cmd+Z)
- [ ] Add redo functionality (Ctrl/Cmd+Shift+Z)
- [ ] Limit undo stack size (10 actions)
- [ ] Add soft delete for orders/products
- [ ] Auto-hide undo toast after 10 seconds
- [ ] Test undo/redo flow
- [ ] Update documentation

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 2.3

**Estimated Effort:** 4 days

---

## 🟢 MEDIUM PRIORITY ISSUES

### Issue #14: Enhance Testing Coverage

**Labels:** `testing`, `quality`, `medium-priority`
**Milestone:** Quality Improvement Sprint
**Priority:** P2 - Medium

**Description:**
Test coverage is insufficient, with missing tests for composables, auth flows, and integration points.

**Current State:**
- No unit tests for composables
- Cart validation logic untested
- Auth flows lack E2E tests
- No visual regression tests
- Integration tests missing

**Target Coverage:** 80%

**Proposed Tests:**

**1. Composable Unit Tests**
```typescript
// tests/composables/useCart.test.ts
describe('useCart', () => {
  it('should add item to cart', async () => {
    const { addToCart, items } = useCart()
    await addToCart(mockProduct, 2)
    expect(items.value).toHaveLength(1)
    expect(items.value[0].quantity).toBe(2)
  })

  it('should validate cart items against inventory', async () => {
    const { validateCart } = useCart()
    const result = await validateCart()
    expect(result.isValid).toBe(true)
  })

  it('should handle out of stock items', async () => {
    // Test implementation
  })
})
```

**2. Auth Flow E2E Tests**
```typescript
// tests/e2e/auth/login.spec.ts
test('should login successfully', async ({ page }) => {
  await page.goto('/auth/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/account')
  await expect(page.locator('text=Welcome back')).toBeVisible()
})

test('should handle invalid credentials', async ({ page }) => {
  // Test implementation
})

test('should enforce rate limiting', async ({ page }) => {
  // Test implementation
})
```

**3. Cart Integration Tests**
```typescript
// tests/integration/cart.test.ts
describe('Cart Integration', () => {
  it('should sync cart across tabs', async () => {
    // Test implementation
  })

  it('should validate prices server-side', async () => {
    // Test implementation
  })

  it('should handle concurrent cart updates', async () => {
    // Test implementation
  })
})
```

**4. Visual Regression Tests**
```typescript
// tests/visual/product-card.spec.ts
test('product card matches snapshot', async ({ page }) => {
  await page.goto('/products')
  const productCard = page.locator('.product-card').first()
  await expect(productCard).toHaveScreenshot()
})
```

**Acceptance Criteria:**
- [ ] Unit tests for all composables (29 files)
- [ ] E2E tests for auth flows
- [ ] E2E tests for checkout flow
- [ ] Integration tests for cart
- [ ] Visual regression tests for key components
- [ ] Achieve 80% code coverage
- [ ] Add test documentation
- [ ] Set up CI/CD test pipeline
- [ ] Add test performance benchmarks

**Test Framework:**
- **Unit:** Vitest
- **E2E:** Playwright
- **Visual:** Playwright screenshots

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 1.5

**Estimated Effort:** 2 weeks

---

### Issue #15: Performance Optimizations

**Labels:** `performance`, `enhancement`, `medium-priority`, `user-facing`
**Milestone:** Performance Sprint
**Priority:** P2 - Medium

**Description:**
Implement various performance optimizations to improve load times, render performance, and overall user experience.

**Current Issues:**
- No virtual scrolling for large lists (cart >20 items)
- Images not lazy loaded
- Large bundle size
- No code splitting by route
- Unnecessary re-renders

**Proposed Optimizations:**

**1. Virtual Scrolling for Cart**
```vue
<!-- components/cart/VirtualList.vue -->
<template>
  <div ref="containerRef" class="cart-list" @scroll="handleScroll">
    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <CartItem
        v-for="item in visibleItems"
        :key="item.id"
        :item="item"
        :style="{
          position: 'absolute',
          top: `${item.offsetTop}px`,
          left: 0,
          right: 0
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const ITEM_HEIGHT = 120
const BUFFER_SIZE = 3

const visibleItems = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER_SIZE)
  const end = Math.min(
    items.value.length,
    Math.ceil((scrollTop.value + containerHeight.value) / ITEM_HEIGHT) + BUFFER_SIZE
  )

  return items.value.slice(start, end).map((item, index) => ({
    ...item,
    offsetTop: (start + index) * ITEM_HEIGHT
  }))
})
</script>
```

**2. Image Lazy Loading**
```vue
<!-- components/common/LazyImage.vue -->
<template>
  <div ref="containerRef" class="lazy-image-container">
    <img
      v-if="isVisible"
      :src="src"
      :alt="alt"
      @load="handleLoad"
      @error="handleError"
      :class="{ 'loaded': loaded, 'error': error }"
    />
    <div v-else class="skeleton" />
  </div>
</template>

<script setup lang="ts">
const containerRef = ref<HTMLElement>()
const isVisible = ref(false)
const loaded = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isVisible.value = true
        observer.disconnect()
      }
    },
    { rootMargin: '50px' }
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }

  onUnmounted(() => observer.disconnect())
})
</script>
```

**3. Code Splitting**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    payloadExtraction: true
  },

  optimization: {
    splitChunks: {
      layouts: true,
      pages: true,
      commons: true
    }
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split vendor code
            if (id.includes('node_modules')) {
              if (id.includes('vue')) return 'vue'
              if (id.includes('supabase')) return 'supabase'
              if (id.includes('pinia')) return 'pinia'
              return 'vendor'
            }
          }
        }
      }
    }
  }
})
```

**4. Component-Level Optimizations**
```vue
<script setup lang="ts">
// Use computed instead of methods
const formattedPrice = computed(() => formatCurrency(price.value))

// Memoize expensive calculations
const sortedProducts = computed(() => {
  return [...products.value].sort((a, b) => a.price - b.price)
})

// Debounce search input
const debouncedSearch = useDebounceFn(search, 300)

// Use v-memo for list items
</script>

<template>
  <div v-for="product in products" :key="product.id" v-memo="[product.id, product.price]">
    <!-- Product card -->
  </div>
</template>
```

**Acceptance Criteria:**
- [ ] Implement virtual scrolling for cart (>20 items)
- [ ] Add lazy loading for all images
- [ ] Implement code splitting by route
- [ ] Optimize bundle size (<250KB initial JS)
- [ ] Add performance monitoring
- [ ] Optimize expensive computed properties
- [ ] Use v-memo for list rendering
- [ ] Debounce search inputs
- [ ] Add performance budgets
- [ ] Run Lighthouse audits (target: >90)

**Performance Targets:**
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s
- Total Blocking Time (TBT): <200ms
- Cumulative Layout Shift (CLS): <0.1

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 1.4

**Estimated Effort:** 1 week

---

### Issue #16: Implement Wishlist Feature

**Labels:** `feature`, `enhancement`, `medium-priority`, `user-facing`
**Milestone:** Feature Development Sprint
**Priority:** P2 - Medium

**Description:**
Add wishlist/favorites functionality to allow users to save products for later purchase.

**Proposed Features:**

**1. Database Schema**
```sql
-- Create wishlist table
CREATE TABLE wishlists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT, -- For guest users
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id),
  INDEX idx_wishlists_session_id (session_id)
);

CREATE TABLE wishlist_items (
  id BIGSERIAL PRIMARY KEY,
  wishlist_id BIGINT REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,

  UNIQUE(wishlist_id, product_id)
);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Users can only access their own wishlist
CREATE POLICY wishlist_user_policy ON wishlists
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY wishlist_items_user_policy ON wishlist_items
  FOR ALL TO authenticated
  USING (
    wishlist_id IN (
      SELECT id FROM wishlists WHERE user_id = auth.uid()
    )
  );
```

**2. Wishlist Store**
```typescript
// stores/wishlist.ts
export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [] as WishlistItem[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    itemCount: (state) => state.items.length,
    hasItem: (state) => (productId: number) => {
      return state.items.some(item => item.product.id === productId)
    }
  },

  actions: {
    async addToWishlist(product: Product) {
      this.loading = true
      try {
        const { data, error } = await $fetch('/api/wishlist', {
          method: 'POST',
          body: { product_id: product.id }
        })

        if (error) throw error

        this.items.push({
          id: data.id,
          product,
          added_at: new Date()
        })

        toast.success('Added to wishlist')
      } catch (error) {
        this.error = error.message
        toast.error('Failed to add to wishlist')
      } finally {
        this.loading = false
      }
    },

    async removeFromWishlist(productId: number) {
      // Implementation
    },

    async moveToCart(productId: number, quantity: number = 1) {
      // Implementation
    },

    async shareWishlist() {
      // Generate shareable link
    }
  }
})
```

**3. UI Components**
```vue
<!-- components/product/WishlistButton.vue -->
<template>
  <Button
    @click="toggleWishlist"
    variant="ghost"
    size="icon"
    :aria-label="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
  >
    <Icon
      :name="isInWishlist ? 'heart-filled' : 'heart'"
      :class="{ 'text-red-500': isInWishlist }"
    />
  </Button>
</template>

<script setup lang="ts">
const props = defineProps<{ product: Product }>()
const wishlistStore = useWishlistStore()

const isInWishlist = computed(() =>
  wishlistStore.hasItem(props.product.id)
)

const toggleWishlist = async () => {
  if (isInWishlist.value) {
    await wishlistStore.removeFromWishlist(props.product.id)
  } else {
    await wishlistStore.addToWishlist(props.product)
  }
}
</script>
```

```vue
<!-- pages/account/wishlist.vue -->
<template>
  <div>
    <h1>My Wishlist</h1>

    <div v-if="wishlistStore.items.length === 0" class="empty-state">
      <Icon name="heart" class="text-gray-400" />
      <p>Your wishlist is empty</p>
      <Button as-child>
        <NuxtLink to="/products">Browse Products</NuxtLink>
      </Button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <WishlistCard
        v-for="item in wishlistStore.items"
        :key="item.id"
        :item="item"
        @remove="handleRemove"
        @move-to-cart="handleMoveToCart"
      />
    </div>

    <div class="mt-8 flex justify-between">
      <Button @click="handleShare" variant="outline">
        <Icon name="share" class="mr-2" />
        Share Wishlist
      </Button>
      <Button @click="handleAddAllToCart">
        Add All to Cart ({{ wishlistStore.itemCount }})
      </Button>
    </div>
  </div>
</template>
```

**Acceptance Criteria:**
- [ ] Create database schema for wishlists
- [ ] Create wishlist store with Pinia
- [ ] Add wishlist button to product cards
- [ ] Create wishlist page
- [ ] Support guest wishlists (localStorage)
- [ ] Merge guest wishlist on login
- [ ] Add "Move to Cart" functionality
- [ ] Add "Share Wishlist" with public link
- [ ] Add wishlist count to navigation
- [ ] Add wishlist sync across devices
- [ ] Add unit tests
- [ ] Update documentation

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 1.4

**Estimated Effort:** 1 week

---

### Issue #17: Implement Product Reviews System

**Labels:** `feature`, `enhancement`, `medium-priority`, `user-facing`
**Milestone:** Feature Development Sprint
**Priority:** P2 - Medium

**Description:**
Add product review functionality to allow customers to rate and review products after delivery.

**Proposed Features:**

**1. Database Schema**
```sql
CREATE TABLE product_reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  review TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  moderation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_id, user_id, order_id),
  INDEX idx_product_reviews_product_id (product_id),
  INDEX idx_product_reviews_user_id (user_id),
  INDEX idx_product_reviews_status (status)
);

CREATE TABLE review_votes (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY reviews_public_read ON product_reviews
  FOR SELECT USING (status = 'approved');

-- Users can create/update their own reviews
CREATE POLICY reviews_user_write ON product_reviews
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
```

**2. API Endpoints**
```typescript
// server/api/products/[id]/reviews.get.ts
export default defineEventHandler(async (event) => {
  const productId = getRouterParam(event, 'id')
  const query = getQuery(event)

  const { data: reviews } = await supabase
    .from('product_reviews')
    .select(`
      *,
      user:user_id (
        id,
        user_metadata
      )
    `)
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(query.offset || 0, query.limit || 10)

  return { reviews }
})

// server/api/products/[id]/reviews.post.ts
export default defineEventHandler(async (event) => {
  const user = await requireAuthenticatedUser(event)
  const productId = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Verify user purchased this product
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('status', 'delivered')
    .limit(1)
    .single()

  if (!order) {
    throw createError({
      statusCode: 403,
      message: 'You must purchase this product before reviewing'
    })
  }

  const { data, error } = await supabase
    .from('product_reviews')
    .insert({
      product_id: productId,
      user_id: user.id,
      order_id: order.id,
      rating: body.rating,
      title: body.title,
      review: body.review,
      verified_purchase: true,
      status: 'pending' // Requires moderation
    })
    .select()
    .single()

  if (error) throw error

  // Send notification to admin for moderation
  await sendAdminNotification('new_review', data)

  return { success: true, data }
})
```

**3. UI Components**
```vue
<!-- components/product/Reviews.vue -->
<template>
  <div class="product-reviews">
    <h2>Customer Reviews</h2>

    <!-- Rating Summary -->
    <div class="rating-summary">
      <div class="overall-rating">
        <span class="rating-number">{{ averageRating.toFixed(1) }}</span>
        <StarRating :rating="averageRating" />
        <span class="review-count">{{ totalReviews }} reviews</span>
      </div>

      <div class="rating-breakdown">
        <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="rating-bar">
          <span>{{ star }} ★</span>
          <div class="bar">
            <div :style="{ width: `${getRatingPercentage(star)}%` }" />
          </div>
          <span>{{ getRatingCount(star) }}</span>
        </div>
      </div>
    </div>

    <!-- Write Review Button -->
    <Button v-if="canReview" @click="showReviewForm = true">
      Write a Review
    </Button>

    <!-- Review List -->
    <div class="review-list">
      <ReviewCard
        v-for="review in reviews"
        :key="review.id"
        :review="review"
        @vote="handleVote"
      />
    </div>

    <!-- Review Form Modal -->
    <Dialog v-model:open="showReviewForm">
      <DialogContent>
        <ReviewForm
          :product-id="productId"
          @submit="handleSubmitReview"
          @cancel="showReviewForm = false"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>
```

**Acceptance Criteria:**
- [ ] Create database schema
- [ ] Create API endpoints for reviews
- [ ] Add review submission form
- [ ] Add star rating component
- [ ] Add review display component
- [ ] Implement helpful/unhelpful voting
- [ ] Add moderation queue for admins
- [ ] Verify purchase before allowing review
- [ ] Add email notification after delivery to request review
- [ ] Calculate and display average ratings
- [ ] Add sorting (most helpful, newest, highest/lowest rating)
- [ ] Add image upload for reviews
- [ ] Add unit tests
- [ ] Update documentation

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 1.4

**Estimated Effort:** 2 weeks

---

### Issue #18: Advanced Analytics Dashboard

**Labels:** `feature`, `enhancement`, `medium-priority`, `admin`, `analytics`
**Milestone:** Admin Feature Sprint
**Priority:** P2 - Medium

**Description:**
Enhance the admin analytics dashboard with revenue forecasting, customer lifetime value, cohort analysis, and data export capabilities.

**Proposed Features:**

**1. Revenue Forecasting**
- Historical trend analysis
- Seasonal pattern detection
- ML-based predictions (Prophet or similar)
- Confidence intervals

**2. Customer Lifetime Value (CLV)**
- Calculate CLV per customer
- Segment by CLV ranges
- Predict future CLV
- Identify high-value customers

**3. Cohort Analysis**
- User cohorts by signup date
- Retention rates over time
- Revenue by cohort
- Visualization with heatmaps

**4. Funnel Visualization**
- Browse → Add to Cart → Checkout → Purchase
- Conversion rates at each step
- Drop-off analysis
- A/B test support

**5. Export Capabilities**
- Export to CSV/Excel
- Export charts as PNG/PDF
- Schedule automated reports
- Email reports to stakeholders

**Acceptance Criteria:**
- [ ] Implement revenue forecasting
- [ ] Add CLV calculation
- [ ] Create cohort analysis views
- [ ] Add funnel visualization
- [ ] Implement CSV export
- [ ] Implement PDF export with charts
- [ ] Add scheduled reports
- [ ] Add email report delivery
- [ ] Optimize query performance
- [ ] Add caching layer
- [ ] Update documentation

**References:**
- Code Review: `/CODE_REVIEW_2025.md` - Section 2.3

**Estimated Effort:** 3 weeks

---

_[Continuing with remaining issues 19-27 in the same format...]_

---

## Issue Import Instructions

### Option 1: Manual Creation
Copy each issue section and create manually in GitHub Issues UI.

### Option 2: GitHub CLI (if installed)
```bash
# Example for creating first issue
gh issue create \
  --title "[CRITICAL SECURITY] Re-enable Authentication Middleware" \
  --label "security,critical,bug,admin" \
  --milestone "Security Hardening Sprint" \
  --body "$(cat issue-1-body.md)"
```

### Option 3: GitHub API Script
Use the provided script to batch create all issues:

```bash
node .github/scripts/create-issues-from-review.js
```

---

**Total Issues to Create:** 27
**Estimated Total Effort:** ~3-4 months with 2-3 developers

**Priority Breakdown:**
- 🔴 Critical (5 issues): ~2 weeks
- 🟡 High (8 issues): ~6 weeks
- 🟢 Medium (9 issues): ~8 weeks
- 🔵 Low (5 issues): ~4 weeks
