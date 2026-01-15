# Architecture Improvement Roadmap


**Project:** MoldovaDirect E-commerce Platform
**Created:** 2025-11-01
**Status:** Active Development
**Timeline:** 4-5 weeks

---

## Overview

This roadmap outlines the systematic improvement of MoldovaDirect's architecture, addressing critical security vulnerabilities, performance bottlenecks, and technical debt while preserving architectural strengths.

---

## Phase 1: Critical Security Fixes (Week 1, Days 1-2)

**Goal:** Eliminate critical security vulnerabilities
**Duration:** 2.5 hours
**Priority:** P0 - BLOCKING

### Day 1 Morning: Security Lockdown (2.5 hours)

#### Task 1.1: Rotate Exposed Supabase Service Key
- **Time:** 30 minutes
- **GitHub Issue:** #58
- **Owner:** DevOps/Lead Developer

**Steps:**
1. Access Supabase dashboard
2. Navigate to Settings → API
3. Generate new service role key
4. Update production environment variables
5. Update staging environment variables
6. Update local `.env` files (team notification)
7. Replace real key in `.env.example` with placeholder
8. Test all server API endpoints

**Verification:**
```bash
# Test that old key no longer works
curl -X GET https://api.moldovadirect.com/test \
  -H "Authorization: Bearer [OLD_KEY]"
# Should return 401 Unauthorized

# Test that new key works
curl -X GET https://api.moldovadirect.com/test \
  -H "Authorization: Bearer [NEW_KEY]"
# Should return 200 OK
```

**Files Changed:**
- `.env.example` (line 4-5)
- `.env` (local - not committed)
- Vercel environment variables (production)

---

#### Task 1.2: Remove Hardcoded Test Credentials
- **Time:** 1 hour
- **GitHub Issue:** #59

**Steps:**
1. Audit all test files for hardcoded credentials
2. Create `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` env vars
3. Update test files to use environment variables
4. Verify test accounts don't exist in production database
5. Add database constraint to prevent test emails in production

**Files to Update:**
```typescript
// Before (INSECURE):
const testEmail = 'test@moldovadirect.com'
const testPassword = 'TestPassword123!'

// After (SECURE):
const testEmail = process.env.TEST_USER_EMAIL
const testPassword = process.env.TEST_USER_PASSWORD
```

**SQL Constraint:**
```sql
-- Prevent test accounts in production
ALTER TABLE auth.users
ADD CONSTRAINT no_test_emails_in_production
CHECK (
  CASE
    WHEN current_setting('app.environment', true) = 'production'
    THEN email NOT LIKE '%test%@%' AND email NOT LIKE '%demo%@%'
    ELSE true
  END
);
```

---

#### Task 1.3: Re-enable Authentication Middleware
- **Time:** 30 minutes
- **File:** `middleware/auth.ts`

**Implementation:**
```typescript
export default defineNuxtRouteMiddleware((to) => {
  // Only bypass in test environment with explicit flag
  const isTestMode = process.env.NODE_ENV === 'test' &&
                     process.env.BYPASS_AUTH === 'true'

  if (isTestMode) {
    console.warn('[TEST MODE] Auth middleware bypassed')
    return
  }

  const user = useSupabaseUser()
  const localePath = useLocalePath()

  if (!user.value) {
    return navigateTo({
      path: localePath("/auth/login"),
      query: {
        redirect: to.fullPath !== localePath("/") ? to.fullPath : undefined,
        message: "login-required"
      }
    })
  }

  // Check email verification
  if (!user.value.email_confirmed_at) {
    return navigateTo({
      path: localePath("/auth/verify-email"),
      query: { message: "email-verification-required", email: user.value.email }
    })
  }
})
```

**Testing:**
```bash
# Test with auth bypass disabled (production behavior)
BYPASS_AUTH=false npm run test:e2e

# Test with auth bypass enabled (testing only)
BYPASS_AUTH=true npm run test:e2e
```

---

#### Task 1.4: Implement Admin Role Check
- **Time:** 30 minutes
- **File:** `middleware/admin.ts`

**Implementation:**
```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const localePath = useLocalePath()

  // Check authentication first
  if (!user.value) {
    return navigateTo({
      path: localePath('/auth/login'),
      query: { redirect: to.fullPath, message: 'login-required' }
    })
  }

  // Check admin role from profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.value.id)
    .single()

  if (error || profile?.role !== 'admin') {
    console.warn(`[SECURITY] Non-admin user ${user.value.id} attempted to access ${to.fullPath}`)

    return abortNavigation({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin access required'
    })
  }

  console.log(`[ADMIN ACCESS] User ${user.value.id} accessing ${to.fullPath}`)
})
```

**Database Setup:**
```sql
-- Add role column if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Create role enum
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'staff');
ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING role::user_role;

-- Create index for performance
CREATE INDEX idx_profiles_role ON profiles(role) WHERE role = 'admin';
```

---

### Phase 1 Deliverables

- [ ] Supabase service key rotated
- [ ] `.env.example` updated with placeholders
- [ ] All hardcoded test credentials removed
- [ ] Test accounts verified not in production
- [ ] Authentication middleware re-enabled with test flag
- [ ] Admin middleware implements role verification
- [ ] All tests passing with new security measures
- [ ] Security documentation updated

**Success Criteria:**
- Zero exposed credentials in repository
- Authentication works in production
- Admin routes protected by role check
- E2E tests still functional with `BYPASS_AUTH=true`

---

## Phase 2: Performance Optimization (Week 1-2, Days 3-7)

**Goal:** Eliminate performance bottlenecks
**Duration:** 17 hours
**Priority:** P1 - HIGH

### Day 3: Fix N+1 Query Pattern (2 hours)

**File:** `server/api/products/[slug].get.ts`

#### Task 2.1: Create Breadcrumb SQL Function

```sql
-- Create recursive CTE function for breadcrumb generation
CREATE OR REPLACE FUNCTION get_category_breadcrumb(category_id INT)
RETURNS TABLE(
  id INT,
  slug TEXT,
  name_translations JSONB,
  level INT
)
LANGUAGE SQL
STABLE
AS $$
  WITH RECURSIVE breadcrumb AS (
    -- Base case: start with the given category
    SELECT
      id,
      slug,
      name_translations,
      parent_id,
      0 AS level
    FROM categories
    WHERE id = category_id

    UNION ALL

    -- Recursive case: get parent categories
    SELECT
      c.id,
      c.slug,
      c.name_translations,
      c.parent_id,
      b.level + 1
    FROM categories c
    INNER JOIN breadcrumb b ON c.id = b.parent_id
  )
  SELECT id, slug, name_translations, level
  FROM breadcrumb
  ORDER BY level DESC;
$$;
```

#### Task 2.2: Update API to Use New Function

```typescript
// Before (N+1 queries):
const buildBreadcrumb = async (categoryId: number) => {
  const breadcrumb = []
  let currentCategoryId = categoryId
  while (currentCategoryId) {
    const { data: category } = await supabase
      .from('categories')
      .select('id, slug, name_translations, parent_id')
      .eq('id', currentCategoryId)
      .single()
    // ...
  }
}

// After (1 query):
const buildBreadcrumb = async (categoryId: number) => {
  const { data: breadcrumb, error } = await supabase
    .rpc('get_category_breadcrumb', { category_id: categoryId })

  if (error) {
    console.error('Breadcrumb generation failed:', error)
    return []
  }

  return breadcrumb.map(cat => ({
    id: cat.id,
    slug: cat.slug,
    name: getLocalizedContent(cat.name_translations, locale)
  }))
}
```

**Performance Test:**
```typescript
// Add performance logging
const start = Date.now()
const breadcrumb = await buildBreadcrumb(product.categories.id)
const duration = Date.now() - start

console.log(`Breadcrumb generation: ${duration}ms`)
// Expected: <50ms (was 200-400ms)
```

---

### Days 4-5: Fix Inventory Race Condition (3 hours)

**File:** `server/api/checkout/update-inventory.post.ts`

#### Task 2.3: Create Atomic Stock Decrement Function

```sql
CREATE OR REPLACE FUNCTION decrement_stock(
  product_id UUID,
  quantity INT
)
RETURNS TABLE(
  new_stock INT,
  product_name TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock INT;
  product_name_val TEXT;
BEGIN
  -- Select for update locks the row (prevents race conditions)
  SELECT stock_quantity, name_translations->>'en'
  INTO current_stock, product_name_val
  FROM products
  WHERE id = product_id
  FOR UPDATE;

  -- Check if product exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found: %', product_id
      USING ERRCODE = 'P0001';
  END IF;

  -- Check if enough stock available
  IF current_stock < quantity THEN
    RAISE EXCEPTION 'Insufficient stock for %. Requested: %, Available: %',
      product_name_val, quantity, current_stock
      USING ERRCODE = 'P0002';
  END IF;

  -- Atomically decrement stock
  UPDATE products
  SET
    stock_quantity = stock_quantity - quantity,
    updated_at = NOW()
  WHERE id = product_id
  RETURNING stock_quantity INTO current_stock;

  -- Return new stock level
  RETURN QUERY SELECT current_stock, product_name_val;
END;
$$;
```

#### Task 2.4: Update API to Use Atomic Function

```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = await getServiceSupabase()

  const inventoryUpdates = []
  const outOfStockItems = []

  for (const item of body.items) {
    try {
      // ✅ ATOMIC: Single query with row-level locking
      const { data, error } = await supabase.rpc('decrement_stock', {
        product_id: item.productId,
        quantity: item.quantity
      })

      if (error) {
        // Handle specific error codes
        if (error.code === 'P0001') {
          console.error(`Product ${item.productId} not found`)
          continue
        }
        if (error.code === 'P0002') {
          // Extract stock info from error message
          const match = error.message.match(/Requested: (\d+), Available: (\d+)/)
          outOfStockItems.push({
            productId: item.productId,
            productName: data?.[0]?.product_name || 'Unknown',
            requested: parseInt(match?.[1] || '0'),
            available: parseInt(match?.[2] || '0')
          })
          continue
        }
        throw error
      }

      inventoryUpdates.push({
        productId: item.productId,
        newStock: data[0].new_stock,
        quantityReduced: item.quantity
      })

    } catch (error) {
      console.error(`Failed to update stock for ${item.productId}:`, error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Inventory update failed'
      })
    }
  }

  // Return results
  if (outOfStockItems.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Some items are out of stock',
      data: { outOfStockItems, inventoryUpdates }
    })
  }

  return { success: true, inventoryUpdates }
})
```

**Testing:**
```typescript
// Test concurrent updates (should not oversell)
import { describe, it, expect } from 'vitest'

describe('Inventory Race Condition Test', () => {
  it('should prevent overselling with concurrent requests', async () => {
    // Setup: Product with stock = 10
    const productId = 'test-product-123'

    // Simulate 3 concurrent purchases of 5 items each
    const purchases = [
      updateInventory({ items: [{ productId, quantity: 5 }] }),
      updateInventory({ items: [{ productId, quantity: 5 }] }),
      updateInventory({ items: [{ productId, quantity: 5 }] })
    ]

    const results = await Promise.allSettled(purchases)

    // Expect: 2 successful, 1 out-of-stock error
    const successful = results.filter(r => r.status === 'fulfilled')
    const failed = results.filter(r => r.status === 'rejected')

    expect(successful).toHaveLength(2)
    expect(failed).toHaveLength(1)
  })
})
```

---

### Days 6-7: Implement Caching Strategy (4 hours)

#### Task 2.5: Create Cache Utility

```typescript
// server/utils/cache.ts
import { LRUCache } from 'lru-cache'

// Product cache - 5 minutes TTL
export const productCache = new LRUCache<string, any>({
  max: 500, // Cache up to 500 products
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true,
  updateAgeOnHas: false,
})

// Category cache - 15 minutes TTL (changes less frequently)
export const categoryCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 15, // 15 minutes
  updateAgeOnGet: true,
})

// Featured products - 10 minutes TTL
export const featuredCache = new LRUCache<string, any>({
  max: 10,
  ttl: 1000 * 60 * 10,
})

/**
 * Generic cache wrapper with automatic fetching
 */
export async function getCached<T>(
  cache: LRUCache<string, T>,
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttl?: number }
): Promise<T> {
  // Check cache first
  const cached = cache.get(key)
  if (cached !== undefined) {
    console.log(`[CACHE HIT] ${key}`)
    return cached
  }

  console.log(`[CACHE MISS] ${key}`)

  // Fetch fresh data
  const fresh = await fetcher()

  // Store in cache
  cache.set(key, fresh, options)

  return fresh
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCache(
  cache: LRUCache<string, any>,
  pattern: string | RegExp
) {
  const keys = [...cache.keys()]
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern

  keys.forEach(key => {
    if (regex.test(key)) {
      cache.delete(key)
      console.log(`[CACHE INVALIDATE] ${key}`)
    }
  })
}
```

#### Task 2.6: Apply Caching to Product API

```typescript
// server/api/products/[slug].get.ts
import { getCached, productCache, invalidateCache } from '~/server/utils/cache'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const locale = event.context.locale || 'es'

  // Create cache key including locale
  const cacheKey = `product:${slug}:${locale}`

  return await getCached(productCache, cacheKey, async () => {
    // This code only runs on cache miss
    const supabase = await getServiceSupabase()

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (id, slug, name_translations, parent_id),
        product_images (id, url, alt_text, sort_order)
      `)
      .eq('sku', slug)
      .eq('is_active', true)
      .single()

    if (error || !product) {
      throw createError({
        statusCode: 404,
        statusMessage: `Product not found: ${slug}`
      })
    }

    // Transform and return
    return transformProduct(product, locale)
  })
})
```

#### Task 2.7: Cache Invalidation on Updates

```typescript
// server/api/admin/products/[id].put.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  // Update product
  const { data: updated } = await supabase
    .from('products')
    .update(body)
    .eq('id', id)
    .select('sku')
    .single()

  // Invalidate related caches
  if (updated) {
    invalidateCache(productCache, `product:${updated.sku}:`)
    invalidateCache(featuredCache, 'featured:')
  }

  return { success: true, data: updated }
})
```

---

### Days 8-10: Create Repository Layer (8 hours)

**Goal:** Abstract database access, centralize query logic

#### Task 2.8: Product Repository

```typescript
// server/repositories/ProductRepository.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

export class ProductRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findBySlug(slug: string, locale: string = 'es') {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories (id, slug, name_translations, parent_id),
        product_images (id, url, alt_text, sort_order)
      `)
      .eq('sku', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      throw new RepositoryError(`Product not found: ${slug}`, error)
    }

    return this.transform(data, locale)
  }

  async findAll(filters: ProductFilters = {}) {
    let query = this.supabase
      .from('products')
      .select('*, categories(*)', { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }

    if (filters.priceMin !== undefined) {
      query = query.gte('price_eur', filters.priceMin)
    }

    if (filters.priceMax !== undefined) {
      query = query.lte('price_eur', filters.priceMax)
    }

    if (filters.search) {
      query = query.textSearch('name_translations', filters.search)
    }

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    // Sorting
    if (filters.sortBy) {
      query = query.order(filters.sortBy, {
        ascending: filters.sortOrder === 'asc'
      })
    }

    const { data, error, count } = await query

    if (error) {
      throw new RepositoryError('Failed to fetch products', error)
    }

    return {
      products: data.map(p => this.transform(p, filters.locale)),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async findFeatured(locale: string = 'es', limit: number = 8) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, categories(*)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('featured_order', { ascending: true })
      .limit(limit)

    if (error) {
      throw new RepositoryError('Failed to fetch featured products', error)
    }

    return data.map(p => this.transform(p, locale))
  }

  private transform(product: any, locale: string) {
    return {
      id: product.id,
      sku: product.sku,
      slug: product.sku,
      name: getLocalizedContent(product.name_translations, locale),
      description: getLocalizedContent(product.description_translations, locale),
      price: product.price_eur,
      formattedPrice: `€${product.price_eur.toFixed(2)}`,
      compareAtPrice: product.compare_at_price_eur,
      stock: product.stock_quantity,
      isInStock: product.stock_quantity > 0,
      images: product.product_images
        ?.sort((a, b) => a.sort_order - b.sort_order)
        .map(img => img.url) || [],
      category: product.categories ? {
        id: product.categories.id,
        slug: product.categories.slug,
        name: getLocalizedContent(product.categories.name_translations, locale)
      } : null,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }
  }
}

export class RepositoryError extends Error {
  constructor(message: string, public cause?: any) {
    super(message)
    this.name = 'RepositoryError'
  }
}
```

#### Task 2.9: Update API to Use Repository

```typescript
// server/api/products/[slug].get.ts
import { ProductRepository } from '~/server/repositories/ProductRepository'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const locale = event.context.locale || 'es'
  const supabase = await getServiceSupabase()

  // Use repository instead of direct queries
  const repo = new ProductRepository(supabase)

  // With caching
  const cacheKey = `product:${slug}:${locale}`
  return await getCached(productCache, cacheKey, async () => {
    return await repo.findBySlug(slug, locale)
  })
})
```

---

## Phase 3: Code Quality & Architecture (Week 3-4)

**Goal:** Refactor for maintainability
**Duration:** 12 hours
**Priority:** P2 - MEDIUM

### Week 3: Auth Store Refactoring (6 hours)

#### Task 3.1: Split Auth Store into Modules

**Current:** 1,172 lines in single file
**Target:** 6 modules (~200 lines each)

```
stores/auth/
├── index.ts           (Main coordinator - 200 LOC)
├── core.ts            (Authentication state - 200 LOC)
├── profile.ts         (User profile management - 200 LOC)
├── admin.ts           (Admin role checks - 150 LOC)
├── session.ts         (Session management - 150 LOC)
├── validation.ts      (Input validation - 100 LOC)
└── types.ts           (TypeScript definitions - 100 LOC)
```

**Apply same pattern as cart store:**
- Single responsibility per module
- Composable pattern
- Unified API in index.ts
- Backward compatible

---

### Week 4: Database Optimization (6 hours)

#### Task 3.2: Add Missing Indexes

```sql
-- Products table
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active_category
  ON products(is_active, category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products(is_featured, featured_order) WHERE is_featured = true;

-- Categories table
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Orders table
CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Order items table
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Analyze tables for query planner
ANALYZE products;
ANALYZE categories;
ANALYZE orders;
ANALYZE order_items;
```

#### Task 3.3: Implement Rate Limiting

```typescript
// server/middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create rate limiters for different endpoints
const rateLimiters = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  }),
  checkout: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 checkouts per minute
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 auth attempts per 15 min
  }),
}

export default defineEventHandler(async (event) => {
  const path = event.path

  // Determine which rate limiter to use
  let limiter = rateLimiters.api
  if (path.startsWith('/api/checkout')) limiter = rateLimiters.checkout
  if (path.startsWith('/api/auth')) limiter = rateLimiters.auth

  // Get identifier (IP or user ID)
  const identifier = event.context.user?.id || getRequestIP(event)

  // Check rate limit
  const { success, limit, reset, remaining } = await limiter.limit(identifier)

  // Add rate limit headers
  setResponseHeader(event, 'X-RateLimit-Limit', limit.toString())
  setResponseHeader(event, 'X-RateLimit-Remaining', remaining.toString())
  setResponseHeader(event, 'X-RateLimit-Reset', reset.toString())

  if (!success) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: { retryAfter: reset - Date.now() }
    })
  }
})
```

---

## Phase 4: Testing & Documentation (Week 5)

### Task 4.1: Write E2E Tests (Simplified)

**Focus:** 5 critical user flows

1. **Homepage to Product Purchase:**
   - Navigate to homepage
   - Search for product
   - Add to cart
   - Complete checkout
   - Verify order confirmation

2. **User Registration & Login:**
   - Register new account
   - Verify email (mock)
   - Login
   - Access profile

3. **Cart Management:**
   - Add multiple products
   - Update quantities
   - Remove items
   - Clear cart

4. **Admin Dashboard:**
   - Login as admin
   - View orders
   - Update order status
   - View analytics

5. **Multi-locale Support:**
   - Switch between es/en/ro/ru
   - Verify translations
   - Complete purchase in each locale

---

### Task 4.2: Update Documentation

**Documents to Create/Update:**

1. `docs/ARCHITECTURE.md` - System overview
2. `docs/API.md` - API endpoint documentation
3. `docs/DEPLOYMENT.md` - Deployment guide
4. `docs/SECURITY.md` - Security best practices
5. `docs/PERFORMANCE.md` - Performance optimization guide
6. `docs/TESTING.md` - Testing strategy

---

## Success Metrics

### Before Improvements:
- Security Score: MEDIUM RISK
- Performance: C+ (70/100)
- Code Quality: B-
- Test Coverage: 15%
- Response Time (P95): 800ms

### After Improvements:
- Security Score: HIGH SECURITY ✅
- Performance: A- (90/100) ✅
- Code Quality: A- ✅
- Test Coverage: 60% ✅
- Response Time (P95): 200ms ✅

---

## Timeline Summary

| Phase | Duration | Priority | Tasks |
|-------|----------|----------|-------|
| 1. Security | 2.5 hours | P0 | Rotate keys, fix auth |
| 2. Performance | 17 hours | P1 | Fix N+1, race conditions, caching |
| 3. Quality | 12 hours | P2 | Refactor auth, add indexes |
| 4. Testing | 8 hours | P2 | Write tests, documentation |
| **Total** | **39.5 hours** | | **~5 weeks** |

---

## Maintenance & Monitoring

**Post-Implementation:**

1. **Performance Monitoring:**
   - Setup Vercel Analytics
   - Monitor cache hit rates
   - Track API response times

2. **Security Audits:**
   - Monthly dependency updates
   - Quarterly security reviews
   - Annual penetration testing

3. **Code Quality:**
   - ESLint + Prettier enforcement
   - Pre-commit hooks
   - Monthly code reviews

---

**Roadmap Owner:** Development Team
**Review Frequency:** Weekly
**Last Updated:** 2025-11-01
