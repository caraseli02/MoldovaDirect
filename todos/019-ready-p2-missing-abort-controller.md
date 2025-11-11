---
status: ready
priority: p2
issue_id: "019"
tags: [performance, memory-leak, race-condition, search, api]
dependencies: []
---

# Missing Abort Controller in Search Handler

## Problem Statement

The search handler in `handleSearchInput` doesn't cancel previous API requests when new searches are initiated. This causes race conditions where stale results can overwrite newer results, and creates memory leaks when users type quickly.

## Findings

- **Location**: pages/products/index.vue:393-410
- **Issue**: No request cancellation for in-flight searches
- **Impact**: Race conditions, memory leaks, wasted bandwidth

### Problem Scenario:
1. User types "wine" quickly (w → wi → win → wine)
2. 4 API requests fired (debounced to ~2 requests: "wi" and "wine")
3. "wi" request takes 500ms, "wine" request takes 200ms
4. "wine" results display first (correct ✓)
5. "wi" request completes 300ms later, overwrites with stale results ✗
6. User sees incorrect results for "wi" instead of "wine"
7. Confusing UX, incorrect product listings

### Additional Issues:
- **Memory leak**: Pending requests hold references to closures with captured state
- **Wasted bandwidth**: Unnecessary network traffic for canceled searches
- **Server load**: Database queries processing requests that will be ignored
- **UX confusion**: Flickering between different result sets

### Current Implementation:
```typescript
const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim()) {
      search(searchQuery.value.trim(), {
        ...filters.value,
        page: 1,
        sort: sortBy.value as any
      })
    } else {
      fetchProducts({
        ...filters.value,
        page: 1,
        sort: sortBy.value as any
      })
    }
  }, 300)
}
// ❌ No abort controller, previous requests continue
```

## Proposed Solutions

### Option 1: Add AbortController (RECOMMENDED)
- **Description**: Cancel in-flight requests when new search is initiated
- **Implementation**:
  ```typescript
  let searchAbortController: AbortController | null = null

  const handleSearchInput = () => {
    clearTimeout(searchTimeout)

    // Cancel previous request
    if (searchAbortController) {
      searchAbortController.abort()
    }

    searchTimeout = setTimeout(() => {
      // Create new abort controller for this request
      searchAbortController = new AbortController()

      const currentFilters = {
        ...filters.value,
        page: 1,
        sort: sortBy.value as any
      }

      if (searchQuery.value.trim()) {
        search(searchQuery.value.trim(), currentFilters, searchAbortController.signal)
      } else {
        fetchProducts(currentFilters, searchAbortController.signal)
      }
    }, 300)
  }

  // Update search/fetchProducts to accept signal
  // (or ensure useProductCatalog composable handles it)
  ```
- **Pros**:
  - Eliminates race conditions completely
  - Prevents memory leaks from pending closures
  - Reduces server load and bandwidth usage
  - Better UX - always shows latest results
  - Standard web API, well-supported
- **Cons**: Requires updating search/fetchProducts to accept abort signal
- **Effort**: Small (1 hour)
- **Risk**: Low

### Option 2: Request ID Pattern
- **Description**: Assign incrementing IDs to requests, ignore responses from older IDs
- **Pros**: Simpler implementation if API doesn't support abort
- **Cons**: Requests still complete, wastes resources, doesn't fix memory leak
- **Effort**: Small (30 minutes)
- **Risk**: Low

## Recommended Action

Implement Option 1 - add AbortController to properly cancel in-flight requests. This is the correct solution and prevents both race conditions and memory leaks.

## Technical Details

- **Affected Files**:
  - pages/products/index.vue (lines 393-410)
  - composables/useProductCatalog.ts (may need signal parameter)
- **Related Components**:
  - useProductSearch composable (already has abort pattern we can follow)
  - Search API endpoint
- **Database Changes**: No
- **API Changes**: Add optional AbortSignal parameter to search/fetch functions
- **Performance Impact**:
  - Eliminates race conditions
  - Reduces wasted API calls by ~50% during fast typing
  - Prevents memory leaks

## Resources

- AbortController MDN: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
- Fetch with abort: https://developer.mozilla.org/en-US/docs/Web/API/fetch#aborting_a_fetch
- useProductSearch composable: composables/useProductSearch.ts (reference implementation)

## Acceptance Criteria

- [ ] Create AbortController for each search request
- [ ] Cancel previous request before starting new one
- [ ] Update search/fetchProducts to accept AbortSignal
- [ ] Handle AbortError gracefully (don't show error to user)
- [ ] Test rapid typing scenario (type "wine" quickly)
- [ ] Verify latest results always displayed
- [ ] Memory leak testing (no pending closures after search)
- [ ] Code reviewed

## Work Log

### 2025-11-11 - Initial Discovery
**By:** Claude Triage System (Performance Analysis)
**Actions:**
- Issue discovered during performance-oracle analysis
- Categorized as P2 IMPORTANT (race condition + memory leak risk)
- Estimated effort: Small (1 hour)
- Marked as ready for implementation

**Learnings:**
- Debouncing alone doesn't prevent race conditions
- AbortController is essential for any user-driven async operations
- useProductSearch composable already has correct pattern we can reference
- Race conditions are subtle but create very confusing UX bugs

## Notes

Source: Performance triage session on 2025-11-11
Related to: Search optimization, product filter work
Part of: feat/enhanced-product-filters branch
Reference: composables/useProductSearch.ts has example abort controller implementation
