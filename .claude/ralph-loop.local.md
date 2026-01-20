---
active: true
iteration: 3
max_iterations: 50
completion_promise: "PRODUCTS_INDEX_REFACTOR_COMPLETE"
started_at: "2026-01-20T10:33:56Z"
---

Refactor pages/products/index.vue (610 lines) using strict TDD.

BASELINE: Unit tests 5807 passed, file at 910 lines.

COMPLETED CRITICAL ISSUES:

1. Missing Import Bug: getErrorMessage used but not imported
   Status: DONE - Added import from ~/utils/errorUtils
   Commit: 98c55d4f

2. SSR Hydration Mismatch: Duplicate searchQuery state
   Status: DONE - Removed local searchQuery ref, using store directly
   Commit: 15f98d09

3. Type Safety: Double assertion, unsafe page cast
   Status: DONE - Fixed composable return type, added isValidPage type guard
   Commit: a0107762

4. Component Extraction: 8 components extracted with tests
   Status: DONE - All components have tests
   Commit: da3dac89
   Components:
   - EditorialSection (36 lines -> extracted)
   - ProductsToolbar (78 lines -> extracted)
   - ProductsGrid (85 lines -> extracted)
   - ProductsEmptyState (33 lines -> extracted)
   - RecentlyViewed (22 lines -> extracted)
   - SearchBar (50 lines -> extracted)
   - ErrorState (32 lines -> extracted)
   - LoadingState (15 lines -> extracted)

5. Composable Created: useProductsPage for business logic
   Status: DONE - Created composables/useProductsPage.ts

PROGRESS:
- File size: 905 lines -> 610 lines (295 lines saved, 32.6% reduction)
- Tests: 446 passing (all new components have tests)
- 3 critical bug fixes with TDD (RED-GREEN cycles)
- 8 new components with tests

REMAINING WORK:
- File is still 610 lines (target: <300 lines)
- Need to save additional 310+ lines
- Next steps:
  1. Refactor script section to use useProductsPage composable
  2. Remove duplicate logic from page component
  3. Extract remaining inline handlers

TDD PROCESS FOR EACH FIX:
1. RED: Write test that FAILS, run pnpm test:unit, commit
2. GREEN: Write MINIMAL code to pass, run pnpm test:unit, commit
3. REFACTOR: Clean up if needed, run pnpm test:unit, commit

COMMANDS:
pnpm test:unit tests/pages/products tests/components/product
npx nuxi typecheck

SUCCESS: All tests pass, type check passes, file reduced to <300 lines.

Output <promise>PRODUCTS_INDEX_REFACTOR_COMPLETE</promise> when ALL issues fixed with tests passing.
