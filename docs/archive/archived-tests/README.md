# Archived Tests

This directory contains test files that have been archived and are not currently running.

## mobile-pagination.spec.ts.archived

**Archived Date:** 2025-11-28
**Original Location:** `tests/e2e/mobile-pagination.spec.ts`

### Why Archived

This test file was archived because:

1. **Incorrect Test Selectors**: Uses generic selectors like `main` and `[data-testid="product-card"]` that may not match the actual DOM structure
2. **Wrong Event Types**: Uses `page.mouse.*` methods to simulate swipe gestures, which don't properly trigger touch events on mobile devices
3. **Timing Issues**: Relies on hard-coded `waitForTimeout()` calls instead of waiting for actual state changes
4. **Test Infrastructure**: Needs to be rewritten using proper touch event simulation (e.g., `page.touchscreen.*` methods)

### Proper Implementation Approach

When rewriting this test:

1. Use `page.touchscreen.tap()`, `page.touchscreen.swipe()` or manual touch event dispatching
2. Use actual selectors from the current product page implementation
3. Wait for network requests or state changes instead of arbitrary timeouts
4. Verify the swipe handler implementation in the codebase first to ensure tests match the actual implementation

### Test Coverage

The archived test was attempting to validate:
- Swipe left/right navigation between pages
- Multi-page pagination (pages 1→2→3)
- Boundary conditions (first/last page)
- Mixed swipe + click navigation
- Multiple consecutive swipes

This functionality should be re-tested using the corrected approach above.

### Related Files

- Fix Implementation: `composables/useSwipeHandler.ts` or similar pagination composables
- Component: `pages/products/index.vue`
- Documentation: `.docs/MOBILE_PAGINATION_FIX_SUMMARY.md`
