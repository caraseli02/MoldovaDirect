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

3. **Check server logs for debugging**:
   - After deployment, the API now logs detailed information
   - Look for `[Products API]` log entries showing:
     - Query parameters being sent
     - Number of products returned from database
     - Any Supabase errors
     - Transformed response data

   Example logs you should see:
   ```
   [Products API] Query params: { category: undefined, search: undefined, ... }
   [Products API] Results: { productsCount: 15, totalCount: 15, hasError: false }
   [Products API] Returning: { productsCount: 15, pagination: {...}, firstProduct: {...} }
   ```

4. **Verify the fix**:
   - Visit the products page and confirm products are showing
   - Check the debug endpoint: `GET /api/admin/debug/products-count` to see database stats
   - If still empty, check server logs for clues

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

## Troubleshooting: Landing Page Works But Products Page Doesn't

If you see products on the landing page but not on the products page, here's why:

### Different API Endpoints

1. **Landing Page** uses `/api/products/featured`:
   - Always uses `categories!inner` (INNER JOIN)
   - Only returns products that HAVE categories
   - Includes additional filtering for featured products
   - **This works because featured products are specifically curated**

2. **Products Page** uses `/api/products` (index.get.ts):
   - Should use `categories!left` (LEFT JOIN) to include ALL products
   - Previously had an issue with join type syntax
   - Cache may have old empty data

### What to Check

1. **Server Logs**: Look for `[Products API]` entries
   ```bash
   # If you see:
   [Products API] Results: { productsCount: 0, totalCount: 0, hasError: false }

   # This means no products in database OR all products are inactive OR query issue
   ```

2. **Debug Endpoint**: `GET /api/admin/debug/products-count`
   ```bash
   # If activeProducts > 0 but productsCount = 0, it's a query/cache issue
   # If activeProducts = 0, you need to add/activate products in database
   ```

3. **Database Check**: Verify products exist and are active
   ```sql
   -- Run in Supabase SQL editor
   SELECT COUNT(*) FROM products WHERE is_active = true;
   SELECT COUNT(*) FROM products WHERE is_active = true AND category_id IS NULL;
   ```

4. **Clear Cache**: Use one of the three methods above to clear cached empty data

## Related Files Modified
- `server/api/products/index.get.ts` - Fixed category join syntax and added logging
- `server/api/admin/cache/invalidate.post.ts` - New cache invalidation endpoint
- `server/api/admin/debug/products-count.get.ts` - New debug endpoint

## Prevention
- Always use explicit join types (`!left`, `!inner`) when joining tables with RLS
- Build query strings conditionally rather than using template literal interpolation
- Consider products without foreign key relationships in your queries
- Implement cache invalidation endpoints for critical data
- Add debug/diagnostic endpoints for production troubleshooting
- Add comprehensive logging for complex queries
