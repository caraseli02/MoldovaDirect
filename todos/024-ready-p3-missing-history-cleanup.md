---
status: ready
priority: p3
issue_id: "024"
tags: [performance, memory, cleanup, history, navigation]
dependencies: []
---

# Missing History State Cleanup

## Problem Statement

When users navigate away from the products page, the component's history state (scroll position, filter state in URL params) isn't cleaned up. Over multiple navigations, this can accumulate in browser history and session storage, creating minor memory leaks.

## Findings

- **Location**: pages/products/index.vue (navigation/cleanup logic)
- **Issue**: No cleanup of navigation state on unmount
- **Impact**: Browser history clutter, session storage accumulation, minor memory leaks

### Problem Scenario:
1. User browses products, applies filters (category=wines, priceMin=20)
2. Filter state stored in URL: `/products?category=wines&priceMin=20`
3. User navigates to product detail page: `/products/wine-purcari`
4. User clicks back button → returns to `/products?category=wines&priceMin=20`
5. User navigates forward, changes filters → new URL state
6. After 50 back/forward navigations: 50+ entries in browser history
7. Session storage may accumulate orphaned state entries
8. Minor memory leak from unreleased history entries

### Current Issues:
- **No URL cleanup**: Query params persist in history even when not needed
- **History accumulation**: Each filter change creates new history entry
- **Session storage**: Potential accumulation of old filter states
- **Memory footprint**: Small but grows over long sessions
- **Browser history pollution**: Difficult to navigate back to previous pages

### Real-World Impact:
**Scenario**: Power user shopping session
- 1 hour browsing, 30 filter changes
- 30 history entries with full URL state
- Each URL ~200 chars: 6KB in history
- Session storage: 10-20KB accumulated state
- Browser back button: must click 30+ times to leave products page

### Browser History Example:
```
← /products?category=wines
← /products?category=wines&priceMin=20
← /products?category=wines&priceMin=20&priceMax=50
← /products?category=cheese
← /products?category=cheese&inStock=true
... (25 more entries)
← /products  (original entry)
```

## Proposed Solutions

### Option 1: Implement Proper History Management (RECOMMENDED)
- **Description**: Use `replaceState` instead of `pushState` for filter changes, cleanup on unmount
- **Implementation**:
  ```typescript
  import { onBeforeUnmount } from 'vue'
  import { useRouter, useRoute } from 'vue-router'

  const router = useRouter()
  const route = useRoute()

  // Use replaceState for filter changes (don't create new history entries)
  const updateFiltersInUrl = (newFilters: ProductFilters) => {
    const query = {
      category: newFilters.category,
      priceMin: newFilters.priceMin,
      priceMax: newFilters.priceMax,
      inStock: newFilters.inStock ? 'true' : undefined,
      search: searchQuery.value || undefined
    }

    // Remove undefined values
    Object.keys(query).forEach(key => {
      if (query[key] === undefined) delete query[key]
    })

    // Replace instead of push (no new history entry)
    router.replace({ query })
  }

  // Cleanup on unmount
  onBeforeUnmount(() => {
    // Clear session storage entries
    sessionStorage.removeItem('products-scroll-position')
    sessionStorage.removeItem('products-filter-state')

    // Optionally clean URL params (if desired)
    // router.replace({ query: {} })
  })

  // Save/restore scroll position
  const scrollPosition = ref(0)

  onMounted(() => {
    const saved = sessionStorage.getItem('products-scroll-position')
    if (saved) {
      nextTick(() => window.scrollTo(0, parseInt(saved)))
    }
  })

  watch(() => window.scrollY, (newY) => {
    sessionStorage.setItem('products-scroll-position', String(newY))
  })
  ```
- **Pros**:
  - Prevents history pollution
  - Cleaner browser back button behavior
  - Proper state cleanup
  - Better UX for navigation
  - Minimal memory footprint
- **Cons**: Need to decide on URL cleanup policy
- **Effort**: Medium (3 hours)
- **Risk**: Low

### Option 2: Simple Cleanup Only
- **Description**: Just clear session storage on unmount, leave history as-is
- **Pros**: Simplest approach
- **Cons**: Doesn't prevent history accumulation
- **Effort**: Small (30 minutes)
- **Risk**: Low

### Option 3: Full History State Management
- **Description**: Implement complete state preservation/restoration
- **Pros**: Best UX - perfect state restoration
- **Cons**: More complex, may be overkill
- **Effort**: Large (6 hours)
- **Risk**: Medium

## Recommended Action

Implement Option 1 - use `replaceState` for filter changes and cleanup session storage on unmount. This provides the best balance of cleanup and UX.

**Policy Decisions Needed:**
- Should URL params be cleared on unmount? (Recommend: NO - allows sharing URLs)
- Should we use `replace` or `push` for filters? (Recommend: `replace` - cleaner history)
- What session storage keys to clean? (Recommend: cleanup all products-* keys)

## Technical Details

- **Affected Files**:
  - pages/products/index.vue (add cleanup logic)
  - Anywhere filter state updates URL
- **Related Components**:
  - Router navigation
  - Browser history API
  - Session storage
- **Database Changes**: No
- **Performance Impact**:
  - Reduces browser history clutter
  - Cleaner session storage
  - Better back button UX
  - Minimal memory savings (~10-20KB per long session)

## Resources

- Vue Router replace vs push: https://router.vuejs.org/guide/essentials/navigation.html#replace
- History API: https://developer.mozilla.org/en-US/docs/Web/API/History_API
- Session Storage best practices: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage

## Acceptance Criteria

- [ ] Implement replaceState for filter changes (no new history entries)
- [ ] Add onBeforeUnmount cleanup for session storage
- [ ] Clean up products-* session storage keys
- [ ] Decide on URL cleanup policy (recommend keep for sharing)
- [ ] Test browser back button behavior (max 1-2 clicks to leave page)
- [ ] Test filter changes don't create excessive history
- [ ] Test state restoration works correctly
- [ ] Verify no memory leaks in long sessions
- [ ] Code reviewed

## Work Log

### 2025-11-11 - Initial Discovery
**By:** Claude Triage System (Performance Analysis)
**Actions:**
- Issue discovered during performance-oracle analysis
- Categorized as P3 NICE-TO-HAVE (minor memory/UX issue)
- Not urgent but improves long-term UX
- Estimated effort: Medium (3 hours)
- Marked as ready for implementation

**Learnings:**
- History state management often overlooked in SPAs
- `replaceState` vs `pushState` matters for UX
- Session storage cleanup prevents accumulation
- Small memory leaks add up in long sessions
- Good navigation UX requires thoughtful history management

## Notes

Source: Performance triage session on 2025-11-11
Part of: feat/enhanced-product-filters branch cleanup
**Priority Rationale**: P3 because it's minor, but affects UX over time
**UX Impact**: Better back button behavior, cleaner history
**Decision Needed**: URL cleanup policy - keep for shareability or clean for privacy?
**Consider**: Apply same pattern to other pages with complex state
