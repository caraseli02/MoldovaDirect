# Products Page Empty Display Fix

## Issue
The products page was not showing any items in production, despite working correctly in local development.

## Root Cause
The issue was related to how products were being joined with categories in the Supabase query:

1. **Implicit LEFT JOIN Issue**: The original query used `categories (...)` without explicitly specifying the join type. When Supabase applies Row Level Security (RLS) policies, this could cause products to be filtered out if:
   - They have no `category_id` (NULL value)
   - They reference inactive categories (`is_active = FALSE`)
   - The RLS policy on categories restricts access

2. **Cache Persistence**: Once bad data (empty array) was cached, it would persist for 5 minutes due to the caching layer, making the issue appear to persist even after potential fixes.

## Solution

### 1. Fixed Category Join (server/api/products/index.get.ts)
Changed from implicit join to explicit LEFT/INNER join based on filtering:

```typescript
// Before:
categories (
  id,
  slug,
  name_translations
)

// After:
const categoryJoinType = category ? '!inner' : '!left'
categories${categoryJoinType} (
  id,
  slug,
  name_translations
)
```

**Why this works:**
- When NO category filter is applied: Uses `!left` (LEFT JOIN) to include all products, even those without categories
- When category filter IS applied: Uses `!inner` (INNER JOIN) to only return products in that specific category
- Adds `category_id` to the select to help with debugging

### 2. Added Cache Invalidation Endpoint (server/api/admin/cache/invalidate.post.ts)
Created an admin-only endpoint to clear cached data:

**Usage:**
```bash
POST /api/admin/cache/invalidate
Body: { "scope": "products" }
```

**Available scopes:**
- `products`: Clears product-related caches
- `categories`: Clears category caches
- `search`: Clears search caches
- `landing`: Clears landing page caches
- `all`: Clears all public caches

### 3. Added Debug Endpoint (server/api/admin/debug/products-count.get.ts)
Created an admin-only diagnostic endpoint to check database state:

**Usage:**
```bash
GET /api/admin/debug/products-count
```

**Returns:**
```json
{
  "success": true,
  "counts": {
    "totalProducts": 100,
    "activeProducts": 95,
    "productsWithCategories": 85,
    "productsWithoutCategories": 10,
    "activeCategories": 12
  },
  "sampleProducts": [...]
}
```

## How to Apply the Fix

### In Production:

1. **Deploy the changes** (already done when you see this)

2. **Clear the cache** using one of these methods:

   **Option A: Wait 5 minutes**
   - The cache will expire automatically and fresh data will be fetched

   **Option B: Use the cache invalidation endpoint**
   - As an admin, call: `POST /api/admin/cache/invalidate` with body `{ "scope": "products" }`

   **Option C: Restart the application**
   - This will clear all in-memory caches

3. **Verify the fix**:
   - Visit the products page and confirm products are showing
   - Check the debug endpoint: `GET /api/admin/debug/products-count` to see database stats

### For Future Issues:

If products page is empty again, use the debug endpoint to diagnose:

1. Check if products exist: `GET /api/admin/debug/products-count`
2. If products exist but aren't showing, clear cache: `POST /api/admin/cache/invalidate`
3. Check browser console and network tab for API errors
4. Verify RLS policies haven't changed in Supabase

## Testing

To test this locally:

```bash
# 1. Create a product without a category
# 2. Create a product with a category
# 3. Visit /products - should see both
# 4. Visit /products?category=wine - should only see products in that category
```

## Related Files Modified
- `server/api/products/index.get.ts` - Fixed category join
- `server/api/admin/cache/invalidate.post.ts` - New cache invalidation endpoint
- `server/api/admin/debug/products-count.get.ts` - New debug endpoint

## Prevention
- Always use explicit join types (`!left`, `!inner`) when joining tables with RLS
- Consider products without foreign key relationships in your queries
- Implement cache invalidation endpoints for critical data
- Add debug/diagnostic endpoints for production troubleshooting
