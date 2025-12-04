# Pagination Bug - Flow Diagram

## Current Broken Flow (Search)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SEARCHES "wine"                         │
│                       (50 products match)                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND: composables/useProductCatalog.ts:131                      │
│  search(query, { page: 1, limit: 24 })                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API CALL: GET /api/search?q=wine&page=1&limit=24                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND: server/api/search/index.get.ts:89                          │
│                                                                       │
│  ❌ const { data: matchingProducts } = await queryBuilder            │
│     // Fetches ALL 50 products from database                         │
│     // Ignores 'page' parameter!                                     │
│                                                                       │
│  ❌ const limitedResults = matchingProducts.slice(0, 20)             │
│     // Always slices from index 0                                    │
│     // limit defaults to 20, not 24!                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API RESPONSE:                                                        │
│  {                                                                    │
│    products: [20 products],  // IDs 1-20                             │
│    meta: {                                                            │
│      total: 50,                                                       │
│      returned: 20,                                                    │
│      limit: 20                                                        │
│    }                                                                  │
│  }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND: composables/useProductCatalog.ts:156-163                  │
│                                                                       │
│  products.value = [20 products]  // Products 1-20                    │
│                                                                       │
│  ❌ pagination.value = {                                             │
│       page: 1,                                                        │
│       limit: 24,                                                      │
│       total: 20,  // WRONG! Should be 50                             │
│       totalPages: Math.ceil(20/24) = 1  // WRONG! Should be 3        │
│     }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  UI: pages/products/index.vue:190                                    │
│  Renders: 20 products                                                │
│  Pagination: Hidden (totalPages = 1)                                 │
└─────────────────────────────────────────────────────────────────────┘


                         ═══════════════════════════════════
                         USER CLICKS "PAGE 2" (if visible)
                         ═══════════════════════════════════


┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND: composables/useProductCatalog.ts:131                      │
│  search(query, { page: 2, limit: 24 })                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API CALL: GET /api/search?q=wine&page=2&limit=24                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND: server/api/search/index.get.ts:89                          │
│                                                                       │
│  ❌ const { data: matchingProducts } = await queryBuilder            │
│     // Fetches ALL 50 products AGAIN                                 │
│     // Still ignores 'page' parameter!                               │
│                                                                       │
│  ❌ const limitedResults = matchingProducts.slice(0, 20)             │
│     // SAME slice as before! (0-20)                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API RESPONSE:                                                        │
│  {                                                                    │
│    products: [20 products],  // SAME IDs 1-20                        │
│    meta: { total: 50, returned: 20 }                                 │
│  }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  UI: Displays SAME 20 products as Page 1                             │
│  ❌ USER SEES NO DIFFERENCE                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Fixed Flow (How it should work)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SEARCHES "wine"                         │
│                       (50 products match)                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API CALL: GET /api/search?q=wine&page=1&limit=24                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND: server/api/search/index.get.ts                             │
│                                                                       │
│  ✅ const page = parseInt(query.page || '1')                         │
│  ✅ const limit = parseInt(query.limit || '24')                      │
│  ✅ const offset = (page - 1) * limit  // = 0                        │
│                                                                       │
│  ✅ const { data, error, count } = await queryBuilder                │
│       .range(offset, offset + limit - 1)  // 0 to 23                 │
│     // Fetches only 24 products from database                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API RESPONSE:                                                        │
│  {                                                                    │
│    products: [24 products],  // IDs 1-24                             │
│    pagination: {                                                      │
│      page: 1,                                                         │
│      limit: 24,                                                       │
│      total: 50,                                                       │
│      totalPages: 3,                                                   │
│      hasNext: true,                                                   │
│      hasPrev: false                                                   │
│    }                                                                  │
│  }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND: composables/useProductCatalog.ts                          │
│                                                                       │
│  products.value = [24 products]  // Products 1-24                    │
│  ✅ pagination.value = response.pagination  // Trust server          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  UI: pages/products/index.vue                                        │
│  Renders: 24 products (IDs 1-24)                                     │
│  Pagination: Shows "Page 1 of 3"                                     │
└─────────────────────────────────────────────────────────────────────┘


                         ═══════════════════════════════════
                         USER CLICKS "PAGE 2"
                         ═══════════════════════════════════


┌─────────────────────────────────────────────────────────────────────┐
│  API CALL: GET /api/search?q=wine&page=2&limit=24                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND: server/api/search/index.get.ts                             │
│                                                                       │
│  ✅ const offset = (2 - 1) * 24  // = 24                             │
│  ✅ queryBuilder.range(24, 47)  // Products 25-48                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API RESPONSE:                                                        │
│  {                                                                    │
│    products: [24 products],  // IDs 25-48                            │
│    pagination: {                                                      │
│      page: 2,                                                         │
│      limit: 24,                                                       │
│      total: 50,                                                       │
│      totalPages: 3,                                                   │
│      hasNext: true,                                                   │
│      hasPrev: true                                                    │
│    }                                                                  │
│  }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  UI: Displays products 25-48                                         │
│  ✅ USER SEES DIFFERENT PRODUCTS                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Comparison: Products API (Working) vs Search API (Broken)

### Products API ✅ (Working)
**File**: `server/api/products/index.get.ts`

```typescript
// Line 73-75: Parse page parameter
const page = query.page || 1
const limit = query.limit || 24

// Line 189-191: Server-side pagination
const offset = (page - 1) * limit
queryBuilder = queryBuilder.range(offset, offset + limit - 1)

// Line 194: Get count for pagination metadata
const { data: products, error, count } = await queryBuilder

// Line 267-278: Return pagination metadata
return {
  products: transformedProducts,
  pagination: {
    page,
    limit,
    total: totalCount,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}
```

### Search API ❌ (Broken)
**File**: `server/api/search/index.get.ts`

```typescript
// Line 20: Parse limit (but NOT page!)
const limit = parseInt(query.limit || '20')
// ❌ Missing: const page = parseInt(query.page || '1')

// Line 89: No pagination!
const { data: matchingProducts, error } = await queryBuilder
// ❌ Missing: .range(offset, offset + limit - 1)

// Line 123: Client-side slice
const limitedResults = matchingProducts.slice(0, limit)
// ❌ Wrong: Should be .slice(offset, offset + limit)

// Line 156-167: No pagination metadata
return {
  products: transformedProducts,
  meta: { total, returned, limit }
  // ❌ Missing: pagination object
}
```

---

## Key Differences

| Aspect | Products API ✅ | Search API ❌ |
|--------|----------------|---------------|
| Page parameter | Parsed | Ignored |
| Database query | `.range(offset, limit)` | Fetches all |
| Slice logic | Server-side | Client-side from 0 |
| Count query | `count: 'exact'` | Not used |
| Response structure | `pagination` object | `meta` object |
| Metadata accuracy | Correct | Incorrect |

---

## Performance Impact

### Current (Broken)
- Search for "wine" with 500 results
- Database fetches all 500 rows
- Network transfers 500 products
- JavaScript processes 500 products
- Slices to 20
- Discards 480 products

### Fixed
- Search for "wine" with 500 results
- Database fetches 24 rows
- Network transfers 24 products
- JavaScript processes 24 products
- No discarding

**Performance gain**: ~20x reduction in data transfer and processing
