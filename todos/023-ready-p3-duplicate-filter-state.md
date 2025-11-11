---
status: ready
priority: p3
issue_id: "023"
tags: [architecture, refactor, state-management, code-quality]
dependencies: []
---

# Duplicate Filter State Management

## Problem Statement

Filter state is duplicated between the products page component and the useProductCatalog composable. This creates two sources of truth and potential sync issues, making the code harder to maintain and debug.

## Findings

- **Locations**:
  - pages/products/index.vue:260-295 (local filter state)
  - composables/useProductCatalog.ts (composable filter state)
- **Issue**: Dual state management for filters
- **Impact**: Maintenance complexity, potential sync bugs, debugging difficulty

### Problem Scenario:
1. `useProductCatalog` composable maintains `filters` state
2. Page component imports `filters` from composable
3. Page also has local filter-related refs that can diverge
4. Changes in one place may not propagate correctly to the other
5. Developer modifies one but forgets to update the other
6. Result: Inconsistent state, confusing bugs, difficult debugging

### Current State Duplication:
**In useProductCatalog composable:**
```typescript
const filters = ref<ProductFilters>({
  category: undefined,
  priceMin: undefined,
  priceMax: undefined,
  inStock: undefined,
  featured: undefined,
  sort: 'created',
  page: 1,
  limit: 12
})
```

**In products page:**
```typescript
const {
  filters,  // ← imported from composable
  // ... other composable state
} = useProductCatalog()

// ❌ But page also has related state:
const sortBy = ref<string>('created')  // duplicates filters.sort
const showFilterPanel = ref(false)     // separate UI state (OK)
// Potential for filters.value and sortBy.value to diverge
```

### Issues:
- **Two sources of truth**: Composable `filters` vs page-level filter state
- **Sync complexity**: Must manually keep states in sync
- **Violates Single Responsibility**: Both page and composable manage filters
- **Debugging difficulty**: Which state is canonical?
- **Refactoring risk**: Easy to update one and forget the other
- **Testing complexity**: Must test sync logic between states

### Why This Matters:
While currently working, this pattern makes future changes risky:
- Adding new filter → must update both places
- Changing filter logic → must sync both implementations
- Bug in one state → may not manifest until states diverge
- New developer confusion about which state to use

## Proposed Solutions

### Option 1: Consolidate to Composable (RECOMMENDED)
- **Description**: Move ALL filter state management to useProductCatalog, page only consumes
- **Implementation**:
  ```typescript
  // composables/useProductCatalog.ts
  export const useProductCatalog = () => {
    const filters = ref<ProductFilters>({ /* ... */ })
    const showFilterPanel = ref(false)
    const sortBy = computed({
      get: () => filters.value.sort || 'created',
      set: (value) => { filters.value.sort = value }
    })

    const openFilterPanel = () => { showFilterPanel.value = true }
    const closeFilterPanel = () => { showFilterPanel.value = false }
    const updateSort = (sort: string) => { filters.value.sort = sort }

    return {
      filters,
      sortBy,
      showFilterPanel,
      openFilterPanel,
      closeFilterPanel,
      updateSort,
      // ... other methods
    }
  }

  // pages/products/index.vue
  const {
    filters,
    sortBy,
    showFilterPanel,
    openFilterPanel,
    closeFilterPanel,
    updateSort
  } = useProductCatalog()

  // ✓ Page is pure consumer, no local filter state
  // ✓ Single source of truth
  // ✓ Composable handles all state logic
  ```
- **Pros**:
  - Single source of truth
  - Simpler page component (separation of concerns)
  - Easier to test (composable contains all logic)
  - Easier to maintain and refactor
  - Reusable across multiple pages
- **Cons**: Composable becomes slightly larger (acceptable)
- **Effort**: Medium (4 hours)
- **Risk**: Low

### Option 2: Use Pinia Store Instead
- **Description**: Move filter state to dedicated Pinia store
- **Pros**: Better for app-wide state, DevTools support
- **Cons**: Overkill for page-specific state, more boilerplate
- **Effort**: Large (6-8 hours)
- **Risk**: Medium (larger refactor)

## Recommended Action

Implement Option 1 - consolidate all filter state to the composable. This is the right level of abstraction and follows Vue Composition API best practices.

## Technical Details

- **Affected Files**:
  - pages/products/index.vue (remove local filter state)
  - composables/useProductCatalog.ts (add filter UI state management)
- **Related Components**:
  - All filter-related components
  - ProductFilterSheet
  - Sort dropdown
- **Database Changes**: No
- **API Changes**: No
- **Architecture Impact**: Cleaner separation of concerns

## Resources

- Vue Composition API patterns: https://vuejs.org/guide/reusability/composables.html
- Single Source of Truth: https://en.wikipedia.org/wiki/Single_source_of_truth
- State management best practices: https://vuejs.org/guide/scaling-up/state-management.html

## Acceptance Criteria

- [ ] Move all filter-related state to useProductCatalog
- [ ] Remove duplicate state from products page
- [ ] Page component only consumes composable state
- [ ] All filter functionality works correctly
- [ ] No state sync issues
- [ ] Tests updated to reflect new structure
- [ ] Verify no regression in filter behavior
- [ ] Code reviewed
- [ ] Documentation updated

## Work Log

### 2025-11-11 - Initial Discovery
**By:** Claude Triage System (Performance Analysis)
**Actions:**
- Issue discovered during code simplification review
- Categorized as P3 NICE-TO-HAVE (code quality/architecture)
- Not a bug, but technical debt that should be addressed
- Estimated effort: Medium (4 hours)
- Marked as ready for implementation

**Learnings:**
- Duplicate state is common anti-pattern in Vue apps
- Composables should own their domain state completely
- Page components should be "thin" - mostly presentation logic
- Single source of truth prevents entire class of bugs
- Good architecture pays dividends during refactoring

## Notes

Source: Performance triage session on 2025-11-11
Part of: feat/enhanced-product-filters branch cleanup
**Priority Rationale**: P3 because it's working currently, but prevents future bugs
**Best Practice**: Composables should own domain state, components consume it
**Consider**: This pattern applies to other pages too - audit for similar issues
