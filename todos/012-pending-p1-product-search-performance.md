---
status: pending
priority: p1
issue_id: "012"
tags: [performance, database, search, indexing]
dependencies: []
github_issue: 88
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

- [ ] GIN indexes created on name_translations and description_translations
- [ ] Search uses PostgreSQL JSONB operators
- [ ] Performance test shows <100ms for 10k products
- [ ] No regression in search quality
- [ ] Works for all 4 locales (es, en, ro, ru)

## Estimated Effort

2-3 hours

## Resources

- GitHub Issue: #88
- PostgreSQL GIN Indexes: https://www.postgresql.org/docs/current/gin.html
- Supabase JSONB: https://supabase.com/docs/guides/database/json

---
Source: Performance audit 2025-11-01, synced from GitHub issue #88
