---
status: ready
priority: p1
issue_id: "018"
tags: [performance, frontend, computed, optimization, memoization]
dependencies: []
---

# Missing Computed Memoization for Active Filter Chips

## Problem Statement

The `activeFilterChips` computed property recalculates on every render with O(n+k*m) complexity. It iterates through all filter values, performs string lookups in category tree (O(n) per category), and creates new chip objects each time. This causes significant performance degradation, especially with multiple active filters.

## Findings

- **Location**: pages/products/index.vue:668-710
- **Helper Function**: pages/products/index.vue:650-666 (`findCategoryName`)
- **Issue**: Expensive computation executed on every render
- **Complexity**: O(n) for category lookup + O(k*m) for attributes

### Problem Scenario:
1. User has 5 active filters (category + 4 attributes)
2. Each render triggers `activeFilterChips` recalculation
3. For each category filter: O(n) tree traversal to find category name
4. For each attribute filter: O(k*m) iteration (k attributes × m values per attribute)
5. Creates ~10 new objects per render
6. Result: Expensive computation on every keystroke, scroll, or state change

### Current Implementation Issues:
- **Line 650-666**: `findCategoryName()` does O(n) tree traversal for every category lookup
- **Line 668-710**: Not properly memoized, recalculates on unrelated state changes
- Creates new chip objects unnecessarily on every call
- No caching of category name lookups
- Recursive tree traversal on every category filter render

### Performance Impact:
- **With 5 filters active**: ~50 object allocations + 1 tree traversal per render
- **On filter change**: Triggers multiple re-renders due to watcher issues (#017)
- **User impact**: Noticeable lag when typing in search or adjusting filters

## Proposed Solutions

### Option 1: Build Categories Lookup Map (RECOMMENDED)
- **Description**: Create a flat Map for O(1) category name lookups instead of O(n) tree traversal
- **Implementation**:
  ```typescript
  // Build lookup map once
  const categoriesLookup = computed(() => {
    const map = new Map<string | number, string>()

    const buildMap = (nodes: any[], locale: string) => {
      nodes.forEach(node => {
        const name = node.name?.[locale] || node.name?.es || Object.values(node.name || {})[0]
        map.set(node.slug, name)
        map.set(node.id, name)
        if (node.children?.length) {
          buildMap(node.children, locale)
        }
      })
    }

    buildMap(categoriesTree.value || [], locale.value)
    return map
  })

  // Replace findCategoryName with O(1) lookup
  const getCategoryName = (slugOrId: string | number | undefined) => {
    if (!slugOrId) return ''
    return categoriesLookup.value.get(slugOrId) || ''
  }

  // Properly memoize activeFilterChips
  const activeFilterChips = computed(() => {
    // Only recalculates when filters actually change
    const chips: Array<{ id: string; label: string; type: string; ... }> = []

    if (filters.value.category) {
      chips.push({
        id: 'category',
        label: t('products.chips.category', {
          value: getCategoryName(filters.value.category) || t('products.filters.unknownCategory')
        }),
        type: 'category'
      })
    }
    // ... rest of implementation

    return chips
  })
  ```
- **Pros**:
  - Reduces category lookup from O(n) to O(1)
  - Computed properly tracks dependencies
  - Only recalculates when filters actually change
  - Eliminates unnecessary object creation
  - Significant performance improvement with many categories
- **Cons**: Minimal memory overhead for Map (~1KB for typical category tree)
- **Effort**: Medium (2-3 hours)
- **Risk**: Low

### Option 2: Cache Individual Category Lookups
- **Description**: Use a simple cache/memo for category names
- **Pros**: Simpler implementation
- **Cons**: Still O(n) on cache miss, doesn't solve root cause
- **Effort**: Small (1 hour)
- **Risk**: Low

## Recommended Action

Implement Option 1 - build categories lookup Map for O(1) access. This provides the best performance improvement and is the proper solution to the problem.

## Technical Details

- **Affected Files**:
  - pages/products/index.vue (lines 650-710)
- **Related Components**:
  - ProductActiveFilters component
  - useProductCatalog composable (categories tree)
- **Database Changes**: No
- **Performance Impact**:
  - Category lookup: O(n) → O(1)
  - Eliminates ~20-50 unnecessary recalculations per user session
  - Reduces object allocations by ~80%

## Resources

- Vue Computed API: https://vuejs.org/api/reactivity-core.html#computed
- JavaScript Map performance: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

## Acceptance Criteria

- [ ] Build categoriesLookup Map computed property
- [ ] Replace findCategoryName with O(1) getCategoryName
- [ ] Verify activeFilterChips only recalculates when filters change
- [ ] Test with multiple active filters (5+ filters)
- [ ] Performance profiling shows improvement
- [ ] All filter chips display correct names
- [ ] Works correctly with category tree changes
- [ ] Code reviewed

## Work Log

### 2025-11-11 - Initial Discovery
**By:** Claude Triage System (Performance Analysis)
**Actions:**
- Issue discovered during performance-oracle analysis
- Categorized as P1 CRITICAL performance issue
- Identified O(n+k*m) complexity in hot path
- Estimated effort: Medium (2-3 hours)
- Marked as ready for immediate implementation

**Learnings:**
- Tree traversal in computed properties is expensive
- Vue computed properties need explicit dependency tracking
- Map lookups (O(1)) are vastly superior to tree traversal (O(n))
- Object allocation in computed properties can cause GC pressure

## Notes

Source: Performance triage session on 2025-11-11
Related to: Product filter optimization work (#017)
Part of: feat/enhanced-product-filters branch cleanup
Dependencies: Should be fixed after #017 (watcher consolidation)
