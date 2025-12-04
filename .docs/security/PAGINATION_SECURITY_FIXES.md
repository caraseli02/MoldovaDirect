# Pagination Security Fixes - Implementation Guide

**Related Report:** PAGINATION_SECURITY_AUDIT_REPORT.md
**Priority:** P0 (Critical)
**Estimated Time:** 2-4 hours

---

## Fix 1: API Input Validation (P1 - High Priority)

### File: `server/api/products/index.get.ts`

**Current Code (Lines 75-77):**
```typescript
// Parse pagination params as integers to prevent type coercion bugs
const page = parseInt(query.page as string) || 1
const limit = parseInt(query.limit as string) || 24
```

**Secure Replacement:**

```typescript
// Pagination bounds to prevent DoS attacks
const MAX_PAGE_SIZE = 100  // Maximum items per page
const MAX_PAGE_NUMBER = 10000  // Maximum page number
const DEFAULT_PAGE_SIZE = 24

// Parse and validate pagination parameters
const rawPage = parseInt(query.page as string, 10)
const rawLimit = parseInt(query.limit as string, 10)

// Validate page: must be positive integer within bounds
const page = Number.isNaN(rawPage) || rawPage < 1
  ? 1
  : Math.min(Math.floor(rawPage), MAX_PAGE_NUMBER)

// Validate limit: must be positive integer within bounds
const limit = Number.isNaN(rawLimit) || rawLimit < 1
  ? DEFAULT_PAGE_SIZE
  : Math.min(Math.floor(rawLimit), MAX_PAGE_SIZE)

// Security logging for suspicious requests
if (rawPage > MAX_PAGE_NUMBER || rawLimit > MAX_PAGE_SIZE || rawPage < 0 || rawLimit < 0) {
  console.warn('[Security] Suspicious pagination detected:', {
    timestamp: new Date().toISOString(),
    ip: event.node.req.socket.remoteAddress,
    userAgent: event.node.req.headers['user-agent'],
    requestedPage: rawPage,
    requestedLimit: rawLimit,
    path: event.path
  })
}
```

**Why This Fix:**
1. Prevents memory exhaustion from excessive `limit` values
2. Prevents extreme offset calculations from large `page` values
3. Handles edge cases: NaN, negative numbers, fractional values
4. Logs suspicious activity for security monitoring
5. Uses `Math.floor()` to handle decimal inputs safely

---

## Fix 2: Frontend Input Validation (P3 - Low Priority)

### File: `pages/products/index.vue`

**Current Code (Lines 371-373):**
```typescript
// Parse initial page/limit from URL query parameters
const initialPage = parseInt(route.query.page as string) || 1
const initialLimit = parseInt(route.query.limit as string) || 12
```

**Secure Replacement:**

```typescript
// Constants for pagination bounds (should match API limits)
const MAX_PAGE_SIZE = 100
const MAX_PAGE_NUMBER = 10000
const DEFAULT_PAGE_SIZE = 12

// Parse initial page/limit from URL query parameters with validation
const rawInitialPage = parseInt(route.query.page as string, 10)
const rawInitialLimit = parseInt(route.query.limit as string, 10)

const initialPage = Number.isNaN(rawInitialPage) || rawInitialPage < 1
  ? 1
  : Math.min(Math.floor(rawInitialPage), MAX_PAGE_NUMBER)

const initialLimit = Number.isNaN(rawInitialLimit) || rawInitialLimit < 1
  ? DEFAULT_PAGE_SIZE
  : Math.min(Math.floor(rawInitialLimit), MAX_PAGE_SIZE)

// Warn if URL params were invalid (helps debugging)
if (rawInitialPage !== initialPage || rawInitialLimit !== initialLimit) {
  console.debug('[Pagination] Normalized URL params:', {
    original: { page: rawInitialPage, limit: rawInitialLimit },
    normalized: { page: initialPage, limit: initialLimit }
  })
}
```

**Why This Fix:**
1. Consistent validation between frontend and backend
2. Prevents sending invalid requests to API
3. Better UX: users see clamped values immediately in URL
4. Debug logging helps troubleshoot pagination issues

---

## Fix 3: Rate Limiting Middleware (P0 - Critical)

### New File: `server/middleware/rate-limit.ts`

```typescript
/**
 * Rate Limiting Middleware
 *
 * Prevents abuse of public API endpoints by limiting requests per IP.
 * Uses token bucket algorithm for smooth rate limiting.
 */

import { defineEventHandler, createError } from 'h3'

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  // Public endpoints (no auth required)
  public: {
    tokensPerInterval: 60,  // 60 requests
    interval: 60000,        // per 60 seconds (1 minute)
    maxBurst: 10            // Allow burst of 10 requests
  },
  // Authenticated users get higher limits
  authenticated: {
    tokensPerInterval: 120,
    interval: 60000,
    maxBurst: 20
  }
}

// Simple in-memory token bucket implementation
interface TokenBucket {
  tokens: number
  lastRefill: number
  violations: number
}

const buckets = new Map<string, TokenBucket>()

// Cleanup old buckets every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, bucket] of buckets.entries()) {
    // Remove buckets inactive for 10 minutes
    if (now - bucket.lastRefill > 600000) {
      buckets.delete(ip)
    }
  }
}, 300000)

export default defineEventHandler(async (event) => {
  // Only rate limit API endpoints
  if (!event.path.startsWith('/api/')) return

  // Skip rate limiting for admin endpoints (they have auth middleware)
  if (event.path.startsWith('/api/admin/')) return

  // Get client IP
  const ip = event.node.req.socket.remoteAddress ||
             event.node.req.headers['x-forwarded-for'] as string ||
             'unknown'

  // Determine if user is authenticated (adjust based on your auth)
  const isAuthenticated = !!event.context.user

  const config = isAuthenticated
    ? RATE_LIMIT_CONFIG.authenticated
    : RATE_LIMIT_CONFIG.public

  // Get or create bucket for this IP
  let bucket = buckets.get(ip)
  const now = Date.now()

  if (!bucket) {
    bucket = {
      tokens: config.tokensPerInterval,
      lastRefill: now,
      violations: 0
    }
    buckets.set(ip, bucket)
  }

  // Refill tokens based on time elapsed
  const timePassed = now - bucket.lastRefill
  const refillAmount = (timePassed / config.interval) * config.tokensPerInterval

  if (refillAmount > 0) {
    bucket.tokens = Math.min(
      config.tokensPerInterval + config.maxBurst,
      bucket.tokens + refillAmount
    )
    bucket.lastRefill = now
  }

  // Check if request is allowed
  if (bucket.tokens < 1) {
    bucket.violations++

    // Enhanced logging for repeated violations
    if (bucket.violations % 10 === 0) {
      console.warn('[Rate Limit] Repeated violations:', {
        ip,
        path: event.path,
        violations: bucket.violations,
        userAgent: event.node.req.headers['user-agent']
      })
    }

    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: {
        retryAfter: Math.ceil((1 - bucket.tokens) * config.interval / config.tokensPerInterval / 1000)
      }
    })
  }

  // Consume token
  bucket.tokens -= 1

  // Add rate limit headers for transparency
  event.node.res.setHeader('X-RateLimit-Limit', config.tokensPerInterval.toString())
  event.node.res.setHeader('X-RateLimit-Remaining', Math.floor(bucket.tokens).toString())
  event.node.res.setHeader('X-RateLimit-Reset', (bucket.lastRefill + config.interval).toString())
})
```

**Production Considerations:**

For production, consider using Redis for distributed rate limiting:

```typescript
// Alternative: Redis-based rate limiting (for multi-instance deployments)
import { createClient } from 'redis'

const redis = createClient({ url: process.env.REDIS_URL })
await redis.connect()

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) return

  const ip = event.node.req.socket.remoteAddress || 'unknown'
  const key = `rate-limit:${ip}`

  const requests = await redis.incr(key)

  if (requests === 1) {
    await redis.expire(key, 60) // 60 seconds window
  }

  if (requests > 60) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests'
    })
  }
})
```

---

## Fix 4: Cache Key Normalization (P2 - Medium Priority)

### File: `server/utils/publicCache.ts`

**Add or Update:**

```typescript
import type { H3Event } from 'h3'

// Cache configuration with size limits
export const PUBLIC_CACHE_CONFIG = {
  productsList: {
    name: 'products-list',
    maxAge: 60 * 5, // 5 minutes
    maxCacheKeys: 1000 // Limit number of cached variations
  }
  // ... other configs
}

/**
 * Generate normalized cache key for public endpoints
 * Prevents cache pollution by normalizing and validating parameters
 */
export function getPublicCacheKey(baseName: string, event: H3Event): string {
  const query = getQuery(event)

  // Normalize pagination (match API validation)
  const MAX_PAGE_SIZE = 100
  const MAX_PAGE_NUMBER = 10000

  const page = Math.max(1, Math.min(
    Math.floor(parseInt(query.page as string, 10) || 1),
    MAX_PAGE_NUMBER
  ))

  const limit = Math.max(1, Math.min(
    Math.floor(parseInt(query.limit as string, 10) || 24),
    MAX_PAGE_SIZE
  ))

  // Only include cacheable parameters (ignore random/junk params)
  const cacheableParams: Record<string, any> = {
    page,
    limit
  }

  // Include other valid filters
  if (query.category && typeof query.category === 'string') {
    cacheableParams.category = query.category.slice(0, 100) // Limit length
  }

  if (query.search && typeof query.search === 'string') {
    cacheableParams.search = query.search.slice(0, 100)
  }

  if (query.sort && ['name', 'price_asc', 'price_desc', 'newest', 'featured'].includes(query.sort as string)) {
    cacheableParams.sort = query.sort
  }

  if (query.priceMin !== undefined) {
    const min = parseFloat(query.priceMin as string)
    if (!Number.isNaN(min) && min >= 0) {
      cacheableParams.priceMin = min
    }
  }

  if (query.priceMax !== undefined) {
    const max = parseFloat(query.priceMax as string)
    if (!Number.isNaN(max) && max >= 0) {
      cacheableParams.priceMax = max
    }
  }

  // Boolean filters
  if (query.inStock === 'true' || query.inStock === true) {
    cacheableParams.inStock = true
  }

  if (query.featured === 'true' || query.featured === true) {
    cacheableParams.featured = true
  }

  // Create deterministic cache key
  const paramsString = JSON.stringify(cacheableParams, Object.keys(cacheableParams).sort())

  return `${baseName}:${paramsString}`
}

// Optional: Cache size monitoring
let cacheKeyCount = 0
const cacheKeySet = new Set<string>()

export function trackCacheKey(key: string): void {
  if (!cacheKeySet.has(key)) {
    cacheKeySet.add(key)
    cacheKeyCount++

    if (cacheKeyCount % 100 === 0) {
      console.info('[Cache] Total unique cache keys:', cacheKeyCount)
    }

    // Warn if approaching limit
    if (cacheKeyCount > PUBLIC_CACHE_CONFIG.productsList.maxCacheKeys * 0.8) {
      console.warn('[Cache] Approaching max cache keys:', {
        current: cacheKeyCount,
        max: PUBLIC_CACHE_CONFIG.productsList.maxCacheKeys
      })
    }
  }
}
```

---

## Fix 5: Enhanced Security Logging (P2 - Medium Priority)

### File: `server/api/products/index.get.ts`

**Update logging sections (around lines 200-206):**

```typescript
// Replace existing debug logging with structured security logging
console.log('[Products API] Request:', {
  timestamp: new Date().toISOString(),
  // Request metadata
  method: event.method,
  path: event.path,
  // Client info (sanitized)
  ip: event.node.req.socket.remoteAddress,
  userAgent: event.node.req.headers['user-agent']?.slice(0, 200),
  // Query params (validated)
  params: {
    category: category?.slice(0, 100),
    search: search ? '[REDACTED]' : undefined, // Don't log search terms (PII)
    priceMin,
    priceMax,
    inStock,
    sort,
    page,
    limit
  },
  // Results metadata
  results: {
    productsCount: products?.length || 0,
    totalCount,
    hasError: !!error
  }
})

// Don't log full error details (may contain sensitive DB info)
if (error) {
  console.error('[Products API] Query failed:', {
    timestamp: new Date().toISOString(),
    errorCode: error.code,
    // Don't log error.message - may contain SQL or DB details
    params: { category, page, limit }
  })
}
```

---

## Fix 6: Security Headers (Nuxt Config)

### File: `nuxt.config.ts`

**Add security headers for API routes:**

```typescript
export default defineNuxtConfig({
  // ... existing config

  routeRules: {
    // Security headers for all API routes
    '/api/**': {
      headers: {
        // Prevent clickjacking
        'X-Frame-Options': 'DENY',
        // Prevent MIME sniffing
        'X-Content-Type-Options': 'nosniff',
        // XSS protection (legacy but still useful)
        'X-XSS-Protection': '1; mode=block',
        // Referrer policy
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // Permissions policy
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
      }
    },

    // Public API endpoints get CORS headers
    '/api/products': {
      cors: true,
      headers: {
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Max-Age': '86400'
      }
    }
  },

  // Content Security Policy
  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"], // Adjust based on needs
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'", process.env.SUPABASE_URL || '']
      }
    }
  }
})
```

---

## Testing Checklist

After implementing fixes, run these tests:

### Manual Tests

```bash
# Test 1: Excessive limit (should clamp to 100)
curl "http://localhost:3000/api/products?limit=999999" | jq '.pagination.limit'
# Expected: 100

# Test 2: Negative page (should default to 1)
curl "http://localhost:3000/api/products?page=-5" | jq '.pagination.page'
# Expected: 1

# Test 3: Fractional values (should floor)
curl "http://localhost:3000/api/products?page=2.7&limit=15.9" | jq '.pagination'
# Expected: { page: 2, limit: 15 }

# Test 4: Rate limiting (should get 429 after 60 requests)
for i in {1..65}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/products")
  echo "Request $i: $HTTP_CODE"
done
# Expected: Last 5 requests return 429

# Test 5: Security headers present
curl -I "http://localhost:3000/api/products" | grep -E "X-Frame-Options|X-Content-Type-Options"
# Expected: Both headers present
```

### Automated E2E Tests

```typescript
// tests/e2e/pagination-security.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Pagination Security Fixes', () => {
  test('enforces maximum page size', async ({ request }) => {
    const response = await request.get('/api/products?limit=999999')
    const data = await response.json()
    expect(data.pagination.limit).toBeLessThanOrEqual(100)
  })

  test('handles negative page numbers', async ({ request }) => {
    const response = await request.get('/api/products?page=-5&limit=-10')
    const data = await response.json()
    expect(data.pagination.page).toBe(1)
    expect(data.pagination.limit).toBeGreaterThan(0)
  })

  test('floors fractional pagination values', async ({ request }) => {
    const response = await request.get('/api/products?page=2.9&limit=15.7')
    const data = await response.json()
    expect(data.pagination.page).toBe(2)
    expect(data.pagination.limit).toBe(15)
  })

  test('enforces rate limiting', async ({ request }) => {
    const requests = []
    for (let i = 0; i < 70; i++) {
      requests.push(request.get('/api/products'))
    }

    const responses = await Promise.all(requests)
    const rateLimited = responses.filter(r => r.status() === 429)

    expect(rateLimited.length).toBeGreaterThan(0)
  })

  test('includes security headers', async ({ request }) => {
    const response = await request.get('/api/products')
    const headers = response.headers()

    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
  })

  test('normalizes cache keys', async ({ request }) => {
    // Same params in different order should hit same cache
    const r1 = await request.get('/api/products?page=1&limit=24&sort=newest')
    const r2 = await request.get('/api/products?sort=newest&limit=24&page=1')

    const data1 = await r1.json()
    const data2 = await r2.json()

    // Should return identical data (from cache)
    expect(data1).toEqual(data2)
  })
})
```

---

## Deployment Steps

1. **Stage 1: Backend Validation (Low Risk)**
   - Deploy Fix 1 (API input validation)
   - Monitor logs for validation warnings
   - Verify no legitimate requests are blocked

2. **Stage 2: Rate Limiting (Test Thoroughly)**
   - Deploy Fix 3 (rate limiting) to staging
   - Load test to verify limits work
   - Check for false positives
   - Deploy to production with monitoring

3. **Stage 3: Frontend & Caching (Low Risk)**
   - Deploy Fix 2 (frontend validation)
   - Deploy Fix 4 (cache normalization)
   - Monitor cache hit rates

4. **Stage 4: Observability (No Risk)**
   - Deploy Fix 5 (security logging)
   - Deploy Fix 6 (security headers)
   - Set up alerts for suspicious patterns

---

## Monitoring & Alerts

Set up alerts for:

1. **Rate Limit Violations**
   - Alert if same IP hits limit > 10 times/hour
   - Could indicate attack or misconfigured client

2. **Suspicious Pagination Params**
   - Alert if validation fires > 100 times/hour
   - Review logs for attack patterns

3. **Cache Performance**
   - Alert if cache hit rate drops below 70%
   - May indicate cache poisoning attempt

4. **API Response Times**
   - Alert if p95 latency > 500ms
   - Could indicate large pagination attack

---

## Rollback Plan

If issues occur after deployment:

1. **Rate Limiting Issues:**
   - Increase `tokensPerInterval` temporarily
   - Or disable by commenting out middleware

2. **Validation Too Strict:**
   - Increase `MAX_PAGE_SIZE` / `MAX_PAGE_NUMBER`
   - Check logs for legitimate use cases being blocked

3. **Cache Issues:**
   - Clear cache: `rm -rf .nuxt/cache`
   - Revert `getPublicCacheKey` changes

---

## Success Metrics

Track these metrics after deployment:

- ✅ Rate limit violations logged but no impact to legitimate users
- ✅ Zero requests with page > 10000 or limit > 100 reach database
- ✅ Cache hit rate remains > 70%
- ✅ API p95 latency < 300ms
- ✅ No security warnings in production logs
- ✅ All E2E security tests passing

---

**Ready to Deploy?**

Start with Fix 1 (lowest risk, highest impact). Test thoroughly in staging before production.
