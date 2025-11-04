# Security Audit Report - MoldovaDirect E-Commerce Platform
**Date**: November 4, 2025
**Auditor**: Claude Code Security Agent
**Scope**: Full-stack security review of authentication, authorization, API endpoints, payment processing, and data protection

---

## Executive Summary

**Overall Security Score: 4.5/10** ⚠️ **SIGNIFICANT SECURITY ISSUES FOUND**

The MoldovaDirect e-commerce application has **CRITICAL security vulnerabilities** that must be addressed immediately before production deployment. The most severe issue is the disabled admin middleware, allowing unauthorized access to administrative functions.

### Risk Level Distribution
- **CRITICAL**: 3 issues (Immediate action required)
- **HIGH**: 7 issues (Fix within 1 week)
- **MEDIUM**: 5 issues (Fix within 1 month)
- **LOW**: 4 issues (Improvements)

### Key Concerns
1. ❌ **Admin authorization is effectively disabled** (CRITICAL)
2. ❌ **No rate limiting on authentication endpoints** (CRITICAL)
3. ❌ **Missing authentication on multiple API endpoints** (CRITICAL)
4. ⚠️ **Potential SQL injection in search functionality**
5. ⚠️ **Weak session management**
6. ⚠️ **CSRF protection not enforced on all endpoints**

---

## 🔴 CRITICAL Vulnerabilities (Fix Immediately)

### 1. Admin Authorization Bypass - CRITICAL ⚠️⚠️⚠️
**Severity**: 10/10 - Complete Authorization Failure
**File**: `/middleware/admin.ts`
**Line**: 39-42

#### Issue
```typescript
// TODO: Add admin role check here
// Example: if (!user.value.app_metadata?.role === 'admin') { ... }

console.log('Admin middleware: Access granted (placeholder implementation)')
```

The admin middleware **does not enforce role-based access control**. Any authenticated user can access admin dashboard, modify products, view all orders, and perform administrative actions.

#### Impact
- ❌ Complete compromise of administrative functions
- ❌ Unauthorized users can:
  - View all customer orders and personal data (GDPR violation)
  - Modify product prices and inventory
  - Access admin analytics and business metrics
  - Delete or modify user accounts
  - Execute seed/cleanup operations

#### Evidence
The middleware checks authentication but the role verification is commented out:
```typescript
if (error || !profile) {
  throw createError({
    statusCode: 401,
    statusMessage: 'Authentication required'
  })
}

// TODO: Add admin role check here - THIS IS NEVER EXECUTED
```

#### Remediation Steps
1. **Immediate Fix** - Update `middleware/admin.ts`:

```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Check if user is authenticated
  if (!user.value) {
    return navigateTo('/auth/login')
  }

  // Check if user has admin role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.value.id)
    .single()

  if (error || !profile) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // ✅ FIX: Enforce admin role check
  if (profile.role !== 'admin' && profile.role !== 'manager') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin privileges required'
    })
  }

  // ✅ FIX: Add MFA verification for admin users
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Session expired'
    })
  }

  // Verify MFA level (AAL2 = Multi-Factor Authentication)
  if (session.user.aal !== 'aal2') {
    return navigateTo('/auth/mfa-setup?redirect=' + to.fullPath)
  }

  console.log('Admin middleware: Access granted for admin user:', user.value.id)
})
```

2. **Server-side verification** - Add to all admin API endpoints:
```typescript
// File: server/utils/adminAuth.ts (line 42-76)
// This function ALREADY EXISTS and is correct - USE IT EVERYWHERE!

export async function requireAdminRole(event: H3Event): Promise<string> {
  const currentUser = await serverSupabaseUser(event)

  if (!currentUser) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  const supabase = serverSupabaseServiceRole(event)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (error || !profile) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unable to verify admin privileges'
    })
  }

  if (profile.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  return currentUser.id
}
```

3. **Database RLS Policies** - Add to Supabase:
```sql
-- Ensure profiles table has RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Only admins can update user roles
CREATE POLICY "Only admins can update roles"
ON profiles FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));
```

#### Testing
```bash
# Test as non-admin user
curl -H "Authorization: Bearer ${USER_TOKEN}" \
  https://moldovadirect.com/admin/dashboard
# Expected: 403 Forbidden

# Test as admin user
curl -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  https://moldovadirect.com/admin/dashboard
# Expected: 200 OK
```

---

### 2. Missing Rate Limiting on Authentication - CRITICAL
**Severity**: 9/10 - Brute Force Vulnerability
**Files**:
- `/server/api/auth/*` (all authentication endpoints)
- Authentication endpoints in Supabase Auth

#### Issue
No rate limiting is implemented on:
- Login endpoint
- Password reset endpoint
- Email verification
- Registration endpoint

#### Impact
- ❌ Brute force password attacks
- ❌ Account enumeration (discover valid emails)
- ❌ Denial of Service through excessive requests
- ❌ Credential stuffing attacks

#### Current State
```typescript
// composables/useAuth.ts - NO RATE LIMITING
const login = async (credentials: LoginCredentials) => {
  return authStore.login(credentials)  // Direct call, no rate limit
}
```

#### Remediation Steps

1. **Install rate limiting library**:
```bash
pnpm add @upstash/ratelimit @upstash/redis
```

2. **Create rate limit utility** - `/server/utils/rateLimit.ts`:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Use Redis for distributed rate limiting
const redis = Redis.fromEnv()

// Different limits for different operations
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
  analytics: true,
  prefix: 'auth',
})

export const passwordResetLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 attempts per hour
  analytics: true,
  prefix: 'password-reset',
})

export async function checkAuthRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await authRateLimiter.limit(identifier)

  if (!success) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many authentication attempts',
      data: {
        limit,
        reset: new Date(reset),
        remaining
      }
    })
  }

  return { remaining, reset }
}
```

3. **Apply to auth store** - Update `stores/auth.ts`:
```typescript
async login(credentials: LoginCredentials) {
  this.isLoading = true
  this.error = null

  try {
    // ✅ FIX: Add rate limiting
    const identifier = credentials.email
    await checkAuthRateLimit(identifier)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      // Log failed attempt
      logFailedLogin(identifier)
      throw error
    }

    // Success - reset failed attempts
    resetFailedAttempts(identifier)

    this.user = data.user
    return { success: true }
  } catch (error) {
    this.error = error.message
    return { success: false, error }
  } finally {
    this.isLoading = false
  }
}
```

4. **Add server-side rate limiting middleware** - `/server/middleware/rateLimit.ts`:
```typescript
export default defineEventHandler(async (event) => {
  const path = event.node.req.url

  // Apply rate limiting to auth endpoints
  if (path?.includes('/api/auth/')) {
    const ip = getClientIP(event)
    const { success } = await authRateLimiter.limit(ip)

    if (!success) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again later.'
      })
    }
  }
})
```

#### Environment Variables
Add to `.env`:
```bash
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

---

### 3. Unauthenticated API Endpoints - CRITICAL
**Severity**: 8/10 - Unauthorized Data Access
**Files**: Multiple API endpoints missing authentication

#### Issue
Several sensitive API endpoints do not verify authentication:

1. **Order Creation** - `/server/api/orders/create.post.ts`
   - Allows order creation without proper user verification
   - Guest email can be spoofed

2. **Cart Operations** - `/server/api/cart/*.ts`
   - Some cart operations don't verify user ownership
   - Session IDs can be guessed/enumerated

3. **Search Endpoint** - `/server/api/search/index.get.ts`
   - No authentication required (acceptable for public search)
   - BUT: Returns full product data including internal fields

#### Impact
- ❌ Users can access/modify other users' carts
- ❌ Order creation without payment
- ❌ Exposure of internal product data
- ❌ Session hijacking vulnerability

#### Evidence - Order Creation
```typescript
// server/api/orders/create.post.ts (lines 62-72)
const authHeader = getHeader(event, 'authorization')
let user = null

if (authHeader) {
  // ⚠️ ISSUE: Optional authentication
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (!authError && authUser) {
    user = authUser
  }
}
```

#### Remediation Steps

1. **Add authentication middleware** - `/server/middleware/auth.ts`:
```typescript
export default defineEventHandler(async (event) => {
  const path = event.node.req.url

  // Endpoints that require authentication
  const protectedPaths = [
    '/api/orders/',
    '/api/cart/',
    '/api/checkout/',
    '/api/admin/'
  ]

  // Skip auth for public endpoints
  const publicPaths = [
    '/api/products',
    '/api/categories',
    '/api/search'
  ]

  if (publicPaths.some(p => path?.includes(p))) {
    return
  }

  if (protectedPaths.some(p => path?.includes(p))) {
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Attach user to event context
    event.context.user = user
  }
})
```

2. **Verify cart ownership** - Update cart operations:
```typescript
// server/api/cart/secure.post.ts
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  // ✅ FIX: Verify cart belongs to user
  const { data: cart, error } = await supabase
    .from('carts')
    .select('user_id, session_id')
    .eq('id', body.cartId)
    .single()

  if (error || !cart) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Cart not found'
    })
  }

  // Verify ownership
  if (user && cart.user_id !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized access to cart'
    })
  }

  // For guest carts, verify session
  if (!user && cart.session_id !== body.sessionId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid session'
    })
  }

  // Continue with cart operation...
})
```

3. **Sanitize search results** - `/server/api/search/index.get.ts`:
```typescript
// Remove internal fields from search results
const transformedProducts = limitedResults.map(product => ({
  id: product.id,
  sku: product.sku,
  slug: product.sku,
  name: product.name_translations,
  shortDescription: product.description_translations,
  price: product.price_eur,
  comparePrice: product.compare_at_price_eur,
  stockStatus: product.stock_quantity > 5 ? 'in_stock' :
               product.stock_quantity > 0 ? 'low_stock' : 'out_of_stock',
  // ✅ FIX: Don't expose exact stock quantities
  // stockQuantity: product.stock_quantity, // REMOVE THIS
  images: sanitizeImages(product.images),
  category: sanitizeCategory(product.categories),
  // ✅ FIX: Don't expose internal attributes
  // attributes: product.attributes, // REMOVE THIS
}))
```

---

## 🟠 HIGH Priority Issues (Fix Within 1 Week)

### 4. Weak Session Management
**Severity**: 7/10
**Files**: `composables/useAuth.ts`, authentication flow

#### Issue
- Sessions don't have absolute expiry (only sliding window)
- No session invalidation on password change
- Cross-tab synchronization could leak session data

#### Remediation
```typescript
// Add absolute session expiry
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

async function validateSession() {
  const session = await supabase.auth.getSession()

  if (session) {
    const createdAt = new Date(session.user.created_at).getTime()
    const now = Date.now()

    if (now - createdAt > SESSION_MAX_AGE) {
      await supabase.auth.signOut()
      throw new Error('Session expired')
    }
  }
}
```

---

### 5. CSRF Protection Not Enforced Consistently
**Severity**: 7/10
**Files**: `/server/middleware/cartSecurity.ts`, various API endpoints

#### Issue
CSRF tokens are generated but not enforced on all state-changing operations:
- Order creation doesn't verify CSRF
- Payment endpoints don't verify CSRF
- Admin operations don't verify CSRF

#### Current Implementation
```typescript
// server/middleware/cartSecurity.ts (lines 102-124)
// Validate CSRF token if required
if (options.requireCSRF && operation !== "getCSRFToken") {
  if (!sessionId || !csrfToken) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      data: {
        error: "Missing session ID or CSRF token",
        code: "MISSING_SECURITY_TOKENS",
      },
    })
  }

  if (!validateCSRFToken(sessionId, csrfToken)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      data: {
        error: "Invalid or expired CSRF token",
        code: "CSRF_TOKEN_INVALID",
      },
    })
  }
}
```

⚠️ **PROBLEM**: This middleware is ONLY applied to `/api/cart` endpoints.

#### Remediation

1. **Create global CSRF middleware** - `/server/middleware/csrf.global.ts`:
```typescript
import { generateCSRFToken, validateCSRFToken } from '~/server/utils/csrf'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const path = event.node.req.url

  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return
  }

  // Skip CSRF for public endpoints
  if (path?.includes('/api/auth/') || path?.includes('/api/webhooks/')) {
    return
  }

  // Verify CSRF token for all state-changing operations
  const body = await readBody(event).catch(() => ({}))
  const csrfToken = body.csrfToken || getHeader(event, 'x-csrf-token')
  const sessionId = getCookie(event, 'session-id')

  if (!csrfToken || !sessionId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'CSRF token required'
    })
  }

  if (!validateCSRFToken(sessionId, csrfToken)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid CSRF token'
    })
  }
})
```

2. **Add CSRF to checkout** - `/components/checkout/PaymentStep.vue`:
```typescript
const createOrder = async () => {
  const csrfToken = await getCSRFToken()

  const response = await $fetch('/api/orders/create', {
    method: 'POST',
    body: {
      ...orderData,
      csrfToken // ✅ FIX: Include CSRF token
    }
  })
}
```

---

### 6. Payment Processing Security
**Severity**: 7/10
**Files**: `/server/api/checkout/create-payment-intent.post.ts`, `/server/api/checkout/confirm-payment.post.ts`

#### Issues Found

1. **No webhook signature verification** (if using Stripe webhooks)
2. **Payment intent amount not verified against order total**
3. **No idempotency keys** (could lead to duplicate charges)
4. **Session ID metadata not verified**

#### Current Implementation
```typescript
// server/api/checkout/create-payment-intent.post.ts
const paymentIntent = await stripeInstance.paymentIntents.create({
  amount,
  currency: currency.toLowerCase(),
  metadata: {
    sessionId,
    source: 'moldovan-products-checkout'
  },
  automatic_payment_methods: {
    enabled: true
  }
})
```

⚠️ **ISSUES**:
- No verification that `amount` matches cart total
- No verification that user owns the session
- No idempotency key for retry safety

#### Remediation

1. **Add payment verification** - Update `/server/api/checkout/create-payment-intent.post.ts`:
```typescript
export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    const body = await readBody(event)
    const { amount, currency = 'eur', sessionId, cartId } = body

    // ✅ FIX: Verify user authentication
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // ✅ FIX: Verify cart ownership and calculate total
    const supabase = serverSupabaseServiceRole(event)
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select(`
        id,
        user_id,
        cart_items (
          quantity,
          products (price_eur)
        )
      `)
      .eq('id', cartId)
      .single()

    if (cartError || !cart) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Cart not found'
      })
    }

    // Verify ownership
    if (cart.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Unauthorized access to cart'
      })
    }

    // ✅ FIX: Calculate and verify amount server-side
    const calculatedAmount = cart.cart_items.reduce((sum, item) => {
      return sum + (item.quantity * item.products.price_eur * 100) // Convert to cents
    }, 0)

    // Allow 1% tolerance for rounding
    if (Math.abs(amount - calculatedAmount) > calculatedAmount * 0.01) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment amount does not match cart total'
      })
    }

    // ✅ FIX: Generate idempotency key
    const idempotencyKey = crypto
      .createHash('sha256')
      .update(`${user.id}-${cartId}-${amount}-${Date.now()}`)
      .digest('hex')

    // Create payment intent with verification
    const stripeInstance = getStripe()
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: calculatedAmount, // Use server-calculated amount
      currency: currency.toLowerCase(),
      metadata: {
        sessionId,
        userId: user.id,
        cartId: String(cartId),
        source: 'moldovan-products-checkout',
        timestamp: new Date().toISOString()
      },
      automatic_payment_methods: {
        enabled: true
      }
    }, {
      idempotencyKey // ✅ FIX: Prevent duplicate charges
    })

    // ✅ FIX: Log payment intent creation for audit
    console.log('[PAYMENT_AUDIT]', {
      userId: user.id,
      paymentIntentId: paymentIntent.id,
      amount: calculatedAmount,
      currency,
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }
    }
  } catch (error) {
    console.error('Failed to create payment intent:', error)
    // ... error handling
  }
})
```

2. **Add Stripe webhook verification** - Create `/server/api/webhooks/stripe.post.ts`:
```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export default defineEventHandler(async (event) => {
  const sig = getHeader(event, 'stripe-signature')
  const rawBody = await readRawBody(event)

  if (!sig || !rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing signature or body'
    })
  }

  try {
    // ✅ FIX: Verify webhook signature
    const stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    // Handle the event
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(stripeEvent.data.object)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(stripeEvent.data.object)
        break
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`)
    }

    return { received: true }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    throw createError({
      statusCode: 400,
      statusMessage: 'Webhook signature verification failed'
    })
  }
})

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { userId, cartId } = paymentIntent.metadata

  // Update order status
  // Send confirmation email
  // Clear cart
  // Log transaction
}
```

3. **Environment Variables** - Add to `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

### 7. SQL Injection Risk in Search
**Severity**: 6/10
**File**: `/server/api/search/index.get.ts`

#### Issue
While the search endpoint filters in JavaScript (good!), the category filter uses user input directly in the query:

```typescript
// Line 58-60
if (category) {
  queryBuilder = queryBuilder.eq('categories.slug', category)
}
```

This is **mostly safe** because Supabase uses parameterized queries, but best practices require additional validation.

#### Remediation
```typescript
// ✅ FIX: Validate category slug format
if (category) {
  // Only allow alphanumeric and hyphens
  const validSlugPattern = /^[a-z0-9-]+$/
  if (!validSlugPattern.test(category)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid category format'
    })
  }

  queryBuilder = queryBuilder.eq('categories.slug', category)
}
```

---

### 8. Information Disclosure in Error Messages
**Severity**: 6/10
**Files**: Multiple API endpoints

#### Issue
Error messages expose internal system details:

```typescript
// server/api/orders/create.post.ts (line 87)
throw createError({
  statusCode: 500,
  statusMessage: 'Failed to validate cart',
  data: cartValidation[0]?.errors  // ⚠️ Exposes internal errors
})
```

#### Remediation
```typescript
// ✅ FIX: Generic error messages for production
const isDevelopment = process.env.NODE_ENV === 'development'

throw createError({
  statusCode: 500,
  statusMessage: 'Failed to validate cart',
  data: isDevelopment ? cartValidation[0]?.errors : undefined
})
```

---

### 9. No Input Sanitization for XSS
**Severity**: 6/10
**Files**: User input fields, product descriptions, customer notes

#### Issue
User input is not sanitized before storage or display. The `cartSecurity.ts` utility has a sanitization function but it's not used consistently.

#### Evidence
```typescript
// server/utils/cartSecurity.ts has sanitization
export function sanitizeCartData(data: any): any {
  if (typeof data === 'string') {
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // ...
  }
}
```

But it's **NOT USED** in:
- Order creation (`customerNotes` field)
- Product creation (admin panel)
- User profile updates

#### Remediation

1. **Install sanitization library**:
```bash
pnpm add dompurify isomorphic-dompurify
```

2. **Create sanitization utility** - `/server/utils/sanitize.ts`:
```typescript
import createDOMPurify from 'isomorphic-dompurify'

const DOMPurify = createDOMPurify()

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  })
}

export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T]
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(v =>
        typeof v === 'string' ? sanitizeText(v) : v
      ) as T[keyof T]
    } else if (value && typeof value === 'object') {
      sanitized[key as keyof T] = sanitizeObject(value)
    } else {
      sanitized[key as keyof T] = value
    }
  }

  return sanitized
}
```

3. **Apply sanitization** - Update order creation:
```typescript
import { sanitizeText, sanitizeObject } from '~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // ✅ FIX: Sanitize user input
  const sanitizedBody = {
    ...body,
    customerNotes: sanitizeText(body.customerNotes || ''),
    shippingAddress: sanitizeObject(body.shippingAddress),
    billingAddress: sanitizeObject(body.billingAddress || body.shippingAddress)
  }

  // Continue with sanitized data...
})
```

---

### 10. Weak Password Policy
**Severity**: 6/10
**File**: `composables/useAuthValidation.ts`

#### Current Policy
```typescript
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
```

This is **decent** but missing:
- Special character requirement
- Maximum length limit
- Common password check
- Entropy validation

#### Remediation
```typescript
import { z } from 'zod'

// ✅ FIX: Enhanced password validation
const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters') // Increased from 8
  .max(128, 'Password must be less than 128 characters') // Prevent DOS
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character') // NEW
  .refine((password) => {
    // Check against common passwords
    const commonPasswords = [
      'password123', 'admin123', 'welcome123', '12345678',
      'qwerty123', 'abc123456', 'password1'
    ]
    return !commonPasswords.includes(password.toLowerCase())
  }, 'This password is too common')
  .refine((password) => {
    // Check entropy (character variety)
    const uniqueChars = new Set(password).size
    return uniqueChars >= 8
  }, 'Password must use at least 8 different characters')
```

---

## 🟡 MEDIUM Priority Issues (Fix Within 1 Month)

### 11. Insecure Direct Object References (IDOR)
**Severity**: 5/10
**Files**: `/server/api/orders/[id].get.ts`, `/server/api/admin/users/[id].get.ts`

#### Issue
Order and user endpoints use sequential IDs without proper authorization checks.

#### Remediation
Always verify ownership:
```typescript
// ✅ FIX: Verify order ownership
const user = await serverSupabaseUser(event)
const orderId = getRouterParam(event, 'id')

const { data: order, error } = await supabase
  .from('orders')
  .select('*')
  .eq('id', orderId)
  .eq('user_id', user.id) // ✅ FIX: Verify ownership
  .single()

if (error || !order) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Order not found'
  })
}
```

---

### 12. Missing Security Headers
**Severity**: 5/10
**File**: `nuxt.config.ts`

#### Issue
Security headers are only set in `cartSecurity.ts` for cart endpoints. Global security headers are missing.

#### Current State
```typescript
// server/utils/cartSecurity.ts (lines 238-247)
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
  // ...
}
```

These are **ONLY applied to cart endpoints**, not globally.

#### Remediation

Add to `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  // ...
  nitro: {
    preset: 'vercel',
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          // ✅ FIX: Add CSP
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: blob:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://*.supabase.co https://api.stripe.com",
            "frame-src https://js.stripe.com https://hooks.stripe.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests"
          ].join('; ')
        }
      }
    }
  }
})
```

---

### 13. Unencrypted Sensitive Data in Logs
**Severity**: 5/10
**Files**: Multiple files with `console.log`

#### Issue
Sensitive data appears in console logs:

```bash
# Found instances:
pages/admin/users/index.vue:196: console.log('Password reset link:', result.reset_link)
server/utils/email.ts:21: console.log('📧 RESEND_API_KEY not configured...')
```

#### Remediation

1. **Create logging utility** - `/server/utils/logger.ts`:
```typescript
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'key', 'authorization']

function sanitizeLogData(data: any): any {
  if (typeof data === 'string') {
    return SENSITIVE_FIELDS.some(field => data.toLowerCase().includes(field))
      ? '[REDACTED]'
      : data
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeLogData)
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeLogData(value)
      }
    }
    return sanitized
  }

  return data
}

export function secureLog(level: 'info' | 'warn' | 'error', message: string, data?: any) {
  const sanitized = data ? sanitizeLogData(data) : undefined
  console[level](`[${new Date().toISOString()}] ${message}`, sanitized)
}
```

2. **Replace console.log calls**:
```typescript
// ❌ BEFORE
console.log('Password reset link:', result.reset_link)

// ✅ AFTER
secureLog('info', 'Password reset initiated for user', { userId: user.id })
```

---

### 14. Missing Audit Logging
**Severity**: 5/10
**Files**: Admin operations, user actions

#### Issue
No comprehensive audit trail for:
- Admin actions (user modifications, order changes)
- Security events (failed login attempts, password changes)
- Data access (who viewed what order)

#### Remediation

1. **Create audit log table** - Run in Supabase SQL editor:
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- RLS policy: Only admins can view audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

2. **Create audit utility** - `/server/utils/audit.ts`:
```typescript
export async function logAuditEvent(
  event: H3Event,
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Record<string, any>
) {
  const user = await serverSupabaseUser(event)
  const supabase = serverSupabaseServiceRole(event)

  const ip = getHeader(event, 'x-forwarded-for')?.split(',')[0] ||
             getHeader(event, 'x-real-ip') ||
             event.node.req.socket?.remoteAddress

  const userAgent = getHeader(event, 'user-agent')

  await supabase.from('audit_logs').insert({
    user_id: user?.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
    ip_address: ip,
    user_agent: userAgent
  })
}
```

3. **Add to critical operations**:
```typescript
// In admin user actions
export default defineEventHandler(async (event) => {
  const adminId = await requireAdminRole(event)
  const userId = getRouterParam(event, 'id')
  const { action } = await readBody(event)

  // Perform action...

  // ✅ FIX: Log audit event
  await logAuditEvent(event, `admin.user.${action}`, 'user', userId, {
    admin_id: adminId,
    action_type: action
  })
})
```

---

### 15. No API Request Size Limits
**Severity**: 4/10

#### Issue
No limits on request body size could lead to DOS attacks.

#### Remediation
Add to `nuxt.config.ts`:
```typescript
nitro: {
  experimental: {
    bodySizeLimit: 1024 * 1024 // 1MB limit
  }
}
```

---

## 🟢 LOW Priority Issues (Improvements)

### 16. Hardcoded Secrets in Repository
**Severity**: 3/10

#### Status
✅ **GOOD**: All secrets are properly stored in environment variables. No hardcoded secrets found in codebase.

#### Evidence
```bash
# Searched for: password|api_key|token
# Results: Only references to environment variables, no hardcoded values
```

---

### 17. CORS Configuration
**Severity**: 3/10

#### Issue
No CORS configuration found. Should be explicitly configured for API security.

#### Remediation
Add to `nuxt.config.ts`:
```typescript
nitro: {
  preset: 'vercel',
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://moldovadirect.com',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Credentials': 'true'
      }
    }
  }
}
```

---

### 18. No Database Connection Pooling Configuration
**Severity**: 3/10

#### Status
Using Supabase managed database - connection pooling is handled by Supabase. No action needed.

---

### 19. Missing API Versioning
**Severity**: 2/10

#### Recommendation
Consider adding API versioning for future compatibility:
```
/api/v1/products
/api/v1/orders
```

---

## 📊 Compliance Checklist

### PCI-DSS Compliance (Payment Card Industry Data Security Standard)

| Requirement | Status | Notes |
|------------|--------|-------|
| **1. Network Security** | ⚠️ Partial | Missing some security headers |
| **2. Secure Configuration** | ⚠️ Partial | Admin middleware disabled |
| **3. Protect Cardholder Data** | ✅ Good | Using Stripe, no card data stored |
| **4. Encrypted Transmission** | ✅ Good | HTTPS enforced |
| **5. Antivirus Protection** | N/A | Server-side |
| **6. Secure Systems** | ⚠️ Partial | Multiple vulnerabilities found |
| **7. Access Control** | ❌ Failed | Admin auth disabled |
| **8. Unique IDs** | ✅ Good | UUID for users |
| **9. Physical Access** | N/A | Cloud hosted |
| **10. Log and Monitor** | ⚠️ Partial | Missing audit logging |
| **11. Regular Testing** | ⚠️ Partial | Tests exist but coverage incomplete |
| **12. Security Policy** | ❌ Missing | Need to document security policies |

**PCI-DSS Compliance Score: 50%** - Not compliant for production

---

### GDPR Compliance (General Data Protection Regulation)

| Requirement | Status | Notes |
|------------|--------|-------|
| **Right to Access** | ✅ Good | User can view own profile |
| **Right to Erasure** | ✅ Good | Delete account functionality exists |
| **Data Minimization** | ⚠️ Partial | Collecting necessary data |
| **Purpose Limitation** | ✅ Good | Clear purpose for data collection |
| **Storage Limitation** | ⚠️ Partial | No data retention policy |
| **Security Measures** | ❌ Failed | Multiple security vulnerabilities |
| **Data Breach Notification** | ❌ Missing | No incident response plan |
| **Privacy by Design** | ⚠️ Partial | Some privacy features |
| **Consent Management** | ⚠️ Partial | Need explicit consent forms |
| **Data Protection Officer** | ❌ Missing | Need to designate DPO |

**GDPR Compliance Score: 45%** - High risk of non-compliance

---

## 🛡️ OWASP Top 10 2021 Assessment

### A01: Broken Access Control ❌ **FAILED**
**Score: 1/10**

**Critical Issues:**
- Admin middleware doesn't enforce role check (lines 39-42 in `middleware/admin.ts`)
- Missing authentication on multiple endpoints
- No verification of resource ownership in some APIs

**Status**: CRITICAL - Fix immediately

---

### A02: Cryptographic Failures ⚠️ **PARTIAL**
**Score: 6/10**

**Good:**
- Using HTTPS (enforced by Vercel)
- Passwords hashed by Supabase Auth (bcrypt)
- Stripe handles payment encryption

**Issues:**
- Session tokens not encrypted in localStorage
- No encryption for sensitive user data at rest

**Status**: MEDIUM - Acceptable for MVP, improve later

---

### A03: Injection ⚠️ **PARTIAL**
**Score: 7/10**

**Good:**
- Using Supabase parameterized queries (prevents SQL injection)
- Most user input is validated

**Issues:**
- XSS vulnerability in unsanitized user input
- Category filter needs validation

**Status**: HIGH - Fix within 1 week

---

### A04: Insecure Design ⚠️ **PARTIAL**
**Score: 5/10**

**Issues:**
- Admin middleware designed but not implemented
- Missing rate limiting design
- No comprehensive audit logging design

**Status**: HIGH - Redesign security architecture

---

### A05: Security Misconfiguration ❌ **FAILED**
**Score: 3/10**

**Critical Issues:**
- Admin middleware disabled (CRITICAL)
- Missing security headers
- Development settings in production code
- CORS not configured

**Status**: CRITICAL - Fix immediately

---

### A06: Vulnerable and Outdated Components ✅ **GOOD**
**Score: 8/10**

**Good:**
- Dependencies are recent
- Using latest Nuxt 3, Vue 3
- Supabase and Stripe SDKs up to date

**Minor Issues:**
- Should add automated dependency scanning

**Status**: LOW - Monitor and update regularly

---

### A07: Identification and Authentication Failures ❌ **FAILED**
**Score: 2/10**

**Critical Issues:**
- No rate limiting on authentication
- Weak session management
- No MFA for admin users
- Admin role not verified

**Status**: CRITICAL - Fix immediately

---

### A08: Software and Data Integrity Failures ⚠️ **PARTIAL**
**Score: 6/10**

**Good:**
- Using package-lock for dependency integrity
- Code is version controlled

**Issues:**
- No webhook signature verification
- No payment amount verification
- Missing idempotency keys

**Status**: HIGH - Fix within 1 week

---

### A09: Security Logging and Monitoring Failures ⚠️ **PARTIAL**
**Score: 4/10**

**Issues:**
- No comprehensive audit logging
- Sensitive data in logs
- No security event monitoring
- No alerting system

**Status**: MEDIUM - Implement audit logging

---

### A10: Server-Side Request Forgery (SSRF) ✅ **GOOD**
**Score**: 9/10

**Good:**
- No user-controlled URLs in backend requests
- All external APIs are hardcoded (Stripe, Supabase)

**Status**: LOW - No action needed

---

## 📈 Security Metrics Summary

| Category | Score | Status |
|----------|-------|--------|
| **Authentication & Authorization** | 2/10 | ❌ Critical |
| **Input Validation** | 6/10 | ⚠️ Needs improvement |
| **API Security** | 4/10 | ❌ Critical |
| **Payment Security** | 7/10 | ⚠️ Needs improvement |
| **Secrets Management** | 9/10 | ✅ Good |
| **Data Protection** | 5/10 | ⚠️ Needs improvement |
| **Error Handling** | 6/10 | ⚠️ Needs improvement |
| **Logging & Monitoring** | 4/10 | ❌ Needs work |
| **Code Quality** | 7/10 | ⚠️ Good |
| **Dependency Security** | 8/10 | ✅ Good |

**Overall Security Score: 4.5/10** ⚠️

---

## 🚀 Immediate Action Plan (Priority Order)

### Week 1 (CRITICAL)

**Day 1-2: Authorization**
1. ✅ Fix admin middleware role check (`middleware/admin.ts` lines 39-42)
2. ✅ Apply `requireAdminRole` to all admin API endpoints
3. ✅ Add database RLS policies for profiles table
4. ✅ Test admin access with non-admin users

**Day 3-4: Rate Limiting**
5. ✅ Install and configure rate limiting (`@upstash/ratelimit`)
6. ✅ Apply rate limiting to authentication endpoints
7. ✅ Add rate limiting middleware to API routes
8. ✅ Test rate limits with automated tools

**Day 5-7: API Authentication**
9. ✅ Add authentication middleware for cart/order endpoints
10. ✅ Implement cart ownership verification
11. ✅ Verify session IDs for guest carts
12. ✅ Test unauthorized access scenarios

### Week 2 (HIGH Priority)

**Day 8-9: CSRF Protection**
1. ✅ Create global CSRF middleware
2. ✅ Add CSRF tokens to all forms
3. ✅ Implement CSRF verification on all POST/PUT/DELETE endpoints

**Day 10-11: Payment Security**
4. ✅ Add payment amount verification
5. ✅ Implement idempotency keys
6. ✅ Create Stripe webhook handler
7. ✅ Add payment audit logging

**Day 12-14: Input Sanitization**
8. ✅ Install DOMPurify
9. ✅ Create sanitization utilities
10. ✅ Apply sanitization to all user inputs
11. ✅ Add XSS protection tests

### Week 3-4 (MEDIUM Priority)

**Day 15-17: Session Security**
1. ✅ Implement absolute session expiry
2. ✅ Add session invalidation on password change
3. ✅ Secure session storage

**Day 18-20: Security Headers**
4. ✅ Configure global security headers
5. ✅ Implement Content Security Policy
6. ✅ Test CSP with browser tools

**Day 21-28: Audit Logging**
7. ✅ Create audit_logs table
8. ✅ Implement audit logging utility
9. ✅ Add audit logs to critical operations
10. ✅ Create admin audit log viewer

---

## 🧪 Security Testing Recommendations

### 1. Automated Security Scanning

```bash
# Install security scanning tools
pnpm add -D npm-audit snyk

# Run npm audit
npm audit --production

# Run Snyk scan
npx snyk test

# Scan for secrets in git history
npx trufflehog git file://. --only-verified
```

### 2. Manual Penetration Testing

**Authentication Testing:**
```bash
# Test rate limiting
for i in {1..10}; do
  curl -X POST https://moldovadirect.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Test admin bypass
curl -X GET https://moldovadirect.com/admin/dashboard \
  -H "Authorization: Bearer ${NON_ADMIN_TOKEN}"

# Test CSRF
curl -X POST https://moldovadirect.com/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"cartId":123}' # Without CSRF token
```

**SQL Injection Testing:**
```bash
# Test search injection
curl "https://moldovadirect.com/api/search?q='; DROP TABLE products;--"

# Test category injection
curl "https://moldovadirect.com/api/search?category='; DELETE FROM orders;--"
```

**XSS Testing:**
```bash
# Test stored XSS in customer notes
curl -X POST https://moldovadirect.com/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "customerNotes": "<script>alert(document.cookie)</script>",
    ...
  }'
```

### 3. Automated Vulnerability Scanning

```bash
# Install OWASP ZAP
docker pull zaproxy/zap-stable

# Run ZAP scan
docker run -t zaproxy/zap-stable zap-baseline.py \
  -t https://moldovadirect.com \
  -r zap-report.html
```

### 4. Code Quality & Security Linting

```bash
# Install security linters
pnpm add -D eslint-plugin-security

# Add to .eslintrc.js
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"]
}

# Run linter
npm run lint
```

---

## 📚 Security Resources & References

### Documentation to Create

1. **Security Policy** (`SECURITY.md`)
   - Vulnerability reporting process
   - Security update schedule
   - Incident response plan

2. **Data Retention Policy**
   - How long data is stored
   - Deletion procedures
   - Backup retention

3. **Privacy Policy**
   - Data collection practices
   - Third-party services used
   - User rights (GDPR)

4. **Incident Response Plan**
   - Detection procedures
   - Escalation process
   - Recovery steps
   - Post-incident review

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/)
- [GDPR Guidelines](https://gdpr.eu/)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/securing-your-database)

---

## 🎯 Success Criteria

The application will be considered **production-ready** when:

✅ All CRITICAL issues are resolved (Score ≥ 8/10 in each category)
✅ PCI-DSS compliance reaches ≥ 90%
✅ GDPR compliance reaches ≥ 90%
✅ OWASP Top 10 - No failures (all scores ≥ 7/10)
✅ Security headers properly configured
✅ Rate limiting active on all endpoints
✅ Comprehensive audit logging implemented
✅ All sensitive data properly encrypted
✅ Automated security scanning in CI/CD
✅ Incident response plan documented

---

## 📞 Contact & Support

For questions about this security audit:
- **Review Date**: November 4, 2025
- **Next Review**: Recommended within 30 days after fixes
- **Auditor**: Claude Code Security Agent

---

**Document Version**: 1.0
**Last Updated**: November 4, 2025
**Classification**: CONFIDENTIAL - Internal Security Review
