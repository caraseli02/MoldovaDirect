---
status: ready
priority: p1
issue_id: "017"
tags: [performance, frontend, watchers, optimization]
dependencies: []
---

# Excessive Watchers Causing Re-renders

## Problem Statement

The products page has 3 separate watchers monitoring filter changes that all trigger the same fetchProducts call. This causes unnecessary re-renders and multiple API calls when filters change, resulting in poor performance and wasted resources.

## Findings

- **Location**: pages/products/index.vue:772-841
- **Issue**: Multiple watchers triggering duplicate API calls
- **Impact**: 3x API calls for single user action

### Current Watchers:
1. `watchEffect(() => { storeSearchQuery })` - line 772
2. `watch(() => filters.value.sort)` - line 778
3. `watch(() => [filters.value.category, filters.value.inStock, filters.value.featured])` - line 839

### Problem Scenario:
1. User changes a filter (e.g., price range)
2. `watchEffect` fires → fetchProducts called
3. `watch(() => filters.value.sort)` fires → fetchProducts called again
4. `watch(() => [filters.value.category, ...])` fires → fetchProducts called a third time
5. Result: 3 API calls for a single user action, wasted database queries, poor UX

## Proposed Solutions

### Option 1: Consolidate Watchers with Debouncing (RECOMMENDED)
- **Description**: Replace all 3 watchers with a single debounced watcher that monitors all filter-related state
- **Implementation**:
  ```typescript
  import { useDebounceFn } from '@vueuse/core'

  const debouncedFetch = useDebounceFn(() => {
    const currentFilters = {
      ...filters.value,
      sort: sortBy.value as any,
      page: pagination.value.page
    }

    if (searchQuery.value.trim()) {
      search(searchQuery.value.trim(), currentFilters)
    } else {
      fetchProducts(currentFilters)
    }
  }, 300)

  watch(
    () => ({
      filters: filters.value,
      sort: sortBy.value,
      search: searchQuery.value,
      page: pagination.value.page
    }),
    debouncedFetch,
    { deep: true }
  )
  ```
- **Pros**:
  - Reduces API calls by 66% (3 → 1)
  - Better UX with debouncing
  - Cleaner code with single source of truth
- **Cons**: None
- **Effort**: Small (1 hour)
- **Risk**: Low

## Recommended Action

Implement Option 1 - consolidate watchers with debouncing.

## Technical Details

- **Affected Files**:
  - pages/products/index.vue (lines 772-841)
- **Related Components**:
  - useProductCatalog composable
  - Filter components
- **Database Changes**: No
- **Performance Impact**: 66% reduction in API calls

## Resources

- VueUse useDebounceFn: https://vueuse.org/shared/useDebounceFn/
- Vue watch API: https://vuejs.org/api/reactivity-core.html#watch

## Acceptance Criteria

- [ ] Remove all 3 existing watchers
- [ ] Implement single consolidated watcher with debouncing
- [ ] Verify only 1 API call made per filter change
- [ ] Test all filter combinations work correctly
- [ ] Verify search functionality still works
- [ ] Performance tests show improvement
- [ ] Code reviewed

## Work Log

### 2025-11-11 - Initial Discovery
**By:** Claude Triage System (Performance Analysis)
**Actions:**
- Issue discovered during performance-oracle analysis
- Categorized as P1 CRITICAL performance issue
- Estimated effort: Small (1 hour)
- Marked as ready for immediate implementation

**Learnings:**
- Multiple reactive watchers monitoring overlapping state is a common Vue anti-pattern
- Debouncing is essential for user input-driven API calls
- Deep watching complex objects can be expensive - use shallow comparison where possible

## Notes

Source: Performance triage session on 2025-11-11
Related to: Product filter optimization work
Part of: feat/enhanced-product-filters branch cleanup
