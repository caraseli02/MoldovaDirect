---
status: ready
priority: p2
issue_id: "021"
tags: [performance, algorithm, tree-traversal, optimization]
dependencies: ["018"]
---

# Inefficient Category Tree Traversal

## Problem Statement

The `findCategoryName` function performs O(n) tree traversal on every call instead of using an O(1) lookup. With a category tree of 50+ nodes, this is called repeatedly during rendering and filter operations, causing performance degradation.

## Findings

- **Location**: pages/products/index.vue:649-666
- **Issue**: Recursive O(n) tree traversal on every category name lookup
- **Impact**: 150+ node checks per render with multiple filters

### Problem Scenario:
1. Category tree has 50 nodes (10 top-level × 5 children each)
2. User has 3 category filters active
3. Each render calls `findCategoryName` 3 times
4. Each call traverses up to 50 nodes to find match
5. Result: **150 node checks per render** (3 calls × 50 nodes)
6. With 10 renders per filter change: **1,500 node checks**

### Current Implementation:
```typescript
const findCategoryName = (slugOrId: string | number | undefined) => {
  if (!slugOrId) return ''

  const findInTree = (nodes: any[]): string | undefined => {
    for (const node of nodes) {
      if (node.slug === slugOrId || node.id === slugOrId) {
        return node.name?.[locale.value] || node.name?.es || Object.values(node.name || {})[0]
      }
      if (node.children?.length) {
        const child = findInTree(node.children) // ❌ Recursive O(n)
        if (child) return child
      }
    }
    return undefined
  }

  return findInTree(categoriesTree.value || []) || ''
}
```

### Issues:
- **O(n) complexity**: Checks every node until match found
- **No caching**: Same traversal repeated for same category
- **Worst case**: Must traverse entire tree if category is last leaf node
- **Repeated work**: Tree traversal on every render/call

### Performance Impact:
- **With 10 categories**: Up to 10 node checks per lookup
- **With 50 categories**: Up to 50 node checks per lookup
- **With 100 categories**: Up to 100 node checks per lookup
- Scales linearly with category tree size

## Proposed Solutions

### Option 1: Build Categories Lookup Map (RECOMMENDED)
- **Description**: Create a flat Map for O(1) category name lookups
- **Implementation**: See Issue #018 - this is the same solution
- **Pros**:
  - O(n) → O(1) lookup complexity
  - Build once, lookup unlimited times
  - Works for both slug and ID lookups
  - Handles locale changes automatically
- **Cons**: Minimal memory overhead (~1KB for typical tree)
- **Effort**: Medium (2 hours)
- **Risk**: Low
- **Note**: This solution will be implemented as part of Issue #018

### Option 2: Add Simple Cache
- **Description**: Cache previous lookups in a Map
- **Pros**: Simpler than full rebuild
- **Cons**: Cache invalidation complexity, still O(n) on miss
- **Effort**: Small (1 hour)
- **Risk**: Medium (cache invalidation bugs)

## Recommended Action

**This issue is a dependency of Issue #018.** The categoriesLookup Map solution in #018 will resolve this issue as well. Mark this as dependent and implement as part of #018.

## Technical Details

- **Affected Files**:
  - pages/products/index.vue (lines 649-666)
- **Related Components**:
  - Issue #018 (activeFilterChips memoization) - parent issue
  - ProductActiveFilters component
  - useProductCatalog composable
- **Database Changes**: No
- **Performance Impact**:
  - Lookup complexity: O(n) → O(1)
  - Eliminates 150+ node checks per render
  - Scales to any category tree size without performance degradation

## Resources

- JavaScript Map performance: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
- Algorithm complexity: https://www.bigocheatsheet.com/

## Acceptance Criteria

- [ ] Build categoriesLookup Map (part of #018)
- [ ] Replace findCategoryName with O(1) getCategoryName
- [ ] Test with large category tree (50+ nodes)
- [ ] Verify performance improvement in profiler
- [ ] All category names display correctly
- [ ] Works with locale changes
- [ ] Code reviewed

## Work Log

### 2025-11-11 - Initial Discovery
**By:** Claude Triage System (Performance Analysis)
**Actions:**
- Issue discovered during performance-oracle analysis
- Categorized as P2 IMPORTANT (algorithm efficiency)
- Identified as duplicate/related to Issue #018
- Marked as dependency of #018
- Estimated effort: Medium (2 hours) - shared with #018
- Marked as ready for implementation

**Learnings:**
- Tree traversal in hot paths is a common performance bottleneck
- O(n) → O(1) with Map is a standard optimization pattern
- This issue and #018 should be solved together with single solution
- Always build lookup structures for frequently accessed tree data

## Notes

Source: Performance triage session on 2025-11-11
**Dependencies**: Issue #018 (activeFilterChips memoization)
**Implementation Note**: This will be resolved by the categoriesLookup Map in #018
Part of: feat/enhanced-product-filters branch cleanup
