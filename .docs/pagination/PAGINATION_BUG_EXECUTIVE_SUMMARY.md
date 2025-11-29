# Pagination Bug - Executive Summary

## Problem
Page 2 of product search displays the same products as Page 1 (products are not advancing).

## Root Cause
Search API does not implement server-side pagination - it fetches ALL matching results and only slices the first N items.

## Exact Location
**File**: `/Users/vladislavcaraseli/Documents/MoldovaDirect/server/api/search/index.get.ts:89`

**Broken Code**:
```typescript
const { data: matchingProducts, error } = await queryBuilder
// No .range() call - fetches ALL products

const limitedResults = matchingProducts.slice(0, limit)  // Always slices from 0
```

**Working Example** from products API (`server/api/products/index.get.ts:189-191`):
```typescript
const offset = (page - 1) * limit
queryBuilder = queryBuilder.range(offset, offset + limit - 1)
const { data: products, error, count } = await queryBuilder
```

## Impact
- Users cannot paginate through search results
- All search pages show the same 20 products
- Pagination controls may disappear or show incorrect counts
- Performance: Fetches 100+ products from DB but only shows 20

## Quick Fix (3 Steps)

### Step 1: Add page parameter
**File**: `server/api/search/index.get.ts:20-21`

```typescript
const limit = parseInt((query.limit as string) || '20')
const page = parseInt((query.page as string) || '1')  // ADD THIS
const category = query.category as string
```

### Step 2: Apply server-side pagination
**File**: `server/api/search/index.get.ts:89`

```typescript
// OLD:
const { data: matchingProducts, error } = await queryBuilder

// NEW:
const offset = (page - 1) * limit
const { data: matchingProducts, error, count } = await queryBuilder
  .range(offset, offset + limit - 1)
```

### Step 3: Return pagination metadata
**File**: `server/api/search/index.get.ts:156-167`

```typescript
// OLD:
return {
  products: transformedProducts,
  meta: { ... }
}

// NEW:
const totalCount = count || matchingProducts.length
return {
  products: transformedProducts,
  pagination: {
    page,
    limit,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    hasNext: page < Math.ceil(totalCount / limit),
    hasPrev: page > 1
  },
  meta: { query: searchTerm, locale, category: category || null }
}
```

### Step 4: Fix frontend pagination handling
**File**: `composables/useProductCatalog.ts:156-163`

```typescript
// OLD:
pagination.value = {
  ...pagination.value,
  page: searchFilters.page || 1,
  limit: searchFilters.limit || 24,
  total: response.products.length,  // WRONG!
  totalPages: Math.ceil(response.products.length / (searchFilters.limit || 24))
}

// NEW:
pagination.value = response.pagination  // Trust server metadata
```

## Testing
1. Search for a term with 30+ results (e.g., "wine")
2. Verify Page 1 shows products 1-20
3. Click Page 2
4. Verify Page 2 shows products 21-40 (not the same as Page 1)
5. Check pagination shows correct total pages

## Files to Modify
1. `/Users/vladislavcaraseli/Documents/MoldovaDirect/server/api/search/index.get.ts`
2. `/Users/vladislavcaraseli/Documents/MoldovaDirect/composables/useProductCatalog.ts`

## Related Issues
- Search has limit of 20, products page has limit of 12 (inconsistent)
- Response structures differ between search and products APIs
- Frontend calculates pagination instead of trusting server

## Priority
**P0 - Critical**: Breaks core product discovery functionality

---

**For Full Analysis**: See `PAGINATION_ANTI_PATTERN_ANALYSIS.md`
