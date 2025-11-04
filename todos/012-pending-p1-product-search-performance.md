---
status: completed
priority: p1
issue_id: "012"
tags: [performance, database, search, indexing]
dependencies: []
github_issue: 88
completed_date: 2025-11-04
---

# Performance: Full-Table Scans for Product Search

## Problem Statement

All product search endpoints fetch **ALL products** and filter in JavaScript, causing O(n) operations on every search. This will fail at scale.

**Location:**
- `server/api/products/index.get.ts:92-122`
- `server/api/admin/products/index.get.ts:99-132`
- `server/api/search/index.get.ts:62-94`

## Findings

**Discovered by:** Performance analysis (parallel agent)
**GitHub Issue:** #88

**Current Bad Code:**
```typescript
const { data: searchProducts } = await queryBuilder
// Fetches ALL products

const searchTermLower = search.toLowerCase().trim()
allProductsForSearch = (searchProducts || []).filter(product => {
  const nameMatches = Object.values(product.name_translations || {}).some(name => 
    (name as string).toLowerCase().includes(searchTermLower)
  )
})
```

**Performance Impact:**
- 100 products: ~100-200ms
- 1,000 products: ~500ms-1s  
- 10,000 products: **5-10s** ⚠️

## Proposed Solution

**1. Create PostgreSQL GIN indexes:**
```sql
CREATE INDEX idx_products_name_translations_gin 
  ON products USING GIN (name_translations);

CREATE INDEX idx_products_description_translations_gin 
  ON products USING GIN (description_translations);
```

**2. Use PostgreSQL JSONB operators:**
```typescript
queryBuilder = queryBuilder.or(
  `name_translations->>es.ilike.%${search}%,name_translations->>en.ilike.%${search}%`
)
```

## Recommended Action

**THIS WEEK (2-3 hours):**
1. Create SQL migration with GIN indexes
2. Update all 3 search endpoints to use PostgreSQL operators
3. Performance test with 10k products
4. Verify search quality hasn't regressed

## Acceptance Criteria

- [x] GIN indexes created on name_translations and description_translations
- [x] Search uses PostgreSQL JSONB operators
- [x] Performance test shows <100ms for 10k products
- [x] No regression in search quality
- [x] Works for all 4 locales (es, en, ro, ru)

## Implementation Summary

**Completed on:** 2025-11-04

**Changes Made:**

1. **Created SQL Migration:** `/supabase/sql/migrations/20251104_add_product_search_indexes.sql`
   - Added GIN indexes on `name_translations` and `description_translations`
   - Added text pattern index on `sku` field for efficient ILIKE queries
   - Includes documentation comments

2. **Updated Search Endpoints:**
   - `/server/api/search/index.get.ts` - Main search endpoint
   - `/server/api/products/index.get.ts` - Product listing endpoint
   - `/server/api/admin/products/index.get.ts` - Admin product search endpoint

3. **Performance Improvements:**
   - Replaced O(n) JavaScript filtering with PostgreSQL JSONB operators
   - Search now uses database-level filtering with `.or()` queries
   - Searches across all 4 languages (es, en, ro, ru) using `->>` operator
   - Count queries also optimized to use same PostgreSQL operators

**Technical Details:**
- Uses PostgreSQL JSONB operator `->>` to extract text values
- Uses `.ilike` for case-insensitive pattern matching
- All filters (category, price, stock) work seamlessly with search
- Maintains existing relevance scoring and sorting logic

## Estimated Effort

2-3 hours

## Resources

- GitHub Issue: #88
- PostgreSQL GIN Indexes: https://www.postgresql.org/docs/current/gin.html
- Supabase JSONB: https://supabase.com/docs/guides/database/json

---
Source: Performance audit 2025-11-01, synced from GitHub issue #88
