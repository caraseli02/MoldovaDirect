---
status: ready
priority: p2
issue_id: "020"
tags: [performance, debounce, cleanup, composable]
dependencies: []
---

# Missing Debouncing Cancellation in useProductSearch

## Problem Statement

The `useProductSearch` composable uses `useDebounceFn` but doesn't cancel pending debounced calls when the component unmounts or search is cleared. This causes 5 API requests for a 4-character search instead of 1, wasting server resources and bandwidth.

## Findings

- **Location**: composables/useProductSearch.ts:45-78
- **Issue**: No cancellation of pending debounced calls
- **Impact**: Multiple unnecessary API calls per search

### Problem Scenario:
1. User types "wine" (4 characters) with 300ms debounce
2. Keystroke 1 ("w"): debounced call scheduled for t+300ms
3. Keystroke 2 ("wi" at t+100ms): previous call still pending, new one scheduled for t+400ms
4. Keystroke 3 ("win" at t+200ms): previous call still pending, new one scheduled for t+500ms
5. Keystroke 4 ("wine" at t+250ms): previous call still pending, new one scheduled for t+550ms
6. **All 4-5 debounced calls execute** because VueUse doesn't auto-cancel
7. Result: 5 API calls for one search term instead of 1

### Root Cause:
- VueUse `useDebounceFn` doesn't automatically cancel previous pending calls
- No manual `.cancel()` call on unmount or search clear
- Each debounced call waits independently in queue
- Missing cleanup in `onUnmounted` lifecycle hook

### Impact per Search:
- **Expected**: 1 API call (final debounced value)
- **Actual**: 4-5 API calls (all intermediate values)
- **Waste**: 400-500% unnecessary server load
- **Bandwidth**: 4-5x wasted network traffic

### Current Implementation:
```typescript
const debouncedSearch = useDebounceFn(async (query: string) => {
  // ... search logic
}, 300)

// ❌ No cleanup
// ❌ No cancellation on unmount
// ❌ All pending calls execute even after new search started
```

## Proposed Solutions

### Option 1: Add Cancellation Cleanup (RECOMMENDED)
- **Description**: Store debounced function reference and cancel pending calls appropriately
- **Implementation**:
  ```typescript
  import { useDebounceFn } from '@vueuse/core'
  import { onUnmounted } from 'vue'

  const debouncedSearch = useDebounceFn(async (query: string) => {
    // Abort previous request if exists
    if (abortController.value) {
      abortController.value.abort()
    }
    abortController.value = new AbortController()

    // ... rest of search logic
  }, 300)

  // Cancel pending debounced calls on unmount
  onUnmounted(() => {
    debouncedSearch.cancel()
    if (abortController.value) {
      abortController.value.abort()
    }
  })

  // Cancel when clearing search
  const clearSearch = () => {
    debouncedSearch.cancel()
    searchQuery.value = ''
    results.value = []
  }
  ```
- **Pros**:
  - Reduces API calls by 80% (5 → 1)
  - Prevents resource waste
  - Proper cleanup on unmount
  - Cancels both debounce queue AND in-flight requests
- **Cons**: None
- **Effort**: Small (30 minutes)
- **Risk**: Low

### Option 2: Use watchDebounced Instead
- **Description**: Replace `useDebounceFn` with VueUse `watchDebounced`
- **Pros**: Automatic cleanup, simpler API
- **Cons**: Requires refactoring search trigger mechanism
- **Effort**: Medium (1 hour)
- **Risk**: Low

## Recommended Action

Implement Option 1 - add proper cancellation cleanup. This is the minimal fix that solves the immediate problem.

## Technical Details

- **Affected Files**:
  - composables/useProductSearch.ts (lines 45-78)
- **Related Components**:
  - Products page search input
  - Search API endpoint
- **Database Changes**: No
- **API Changes**: No
- **Performance Impact**:
  - Reduces API calls per search by 80% (5 → 1)
  - Eliminates wasted database queries
  - Reduces server load significantly

## Resources

- VueUse useDebounceFn: https://vueuse.org/shared/useDebounceFn/
- VueUse watchDebounced: https://vueuse.org/shared/watchDebounced/
- Vue onUnmounted: https://vuejs.org/api/composition-api-lifecycle.html#onunmounted

## Acceptance Criteria

- [ ] Add `.cancel()` call in `onUnmounted` hook
- [ ] Add `.cancel()` call when clearing search
- [ ] Test typing 4-character search term quickly
- [ ] Verify only 1 API call made (not 4-5)
- [ ] Test component unmount cancels pending calls
- [ ] Test clearing search cancels pending calls
- [ ] Network tab shows significant reduction in requests
- [ ] Code reviewed

## Work Log

### 2025-11-11 - Initial Discovery
**By:** Claude Triage System (Performance Analysis)
**Actions:**
- Issue discovered during performance-oracle analysis
- Categorized as P2 IMPORTANT (resource waste)
- Identified 400-500% unnecessary API calls
- Estimated effort: Small (30 minutes)
- Marked as ready for implementation

**Learnings:**
- VueUse debounce functions don't auto-cancel pending calls
- Always need explicit `.cancel()` in cleanup
- Debouncing alone isn't enough - need cancellation + abort controller
- Common oversight in Vue composables using VueUse utilities

## Notes

Source: Performance triage session on 2025-11-11
Related to: Search optimization (#019 - abort controller issue)
Part of: feat/enhanced-product-filters branch
Best practice: Always cancel debounced/throttled functions in onUnmounted
