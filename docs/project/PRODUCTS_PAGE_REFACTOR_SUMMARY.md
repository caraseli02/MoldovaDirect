# Products Page Refactoring - Summary

**Date:** 2026-01-16  
**Status:** Planning Complete - Ready to Execute  
**Priority:** HIGH

---

## Quick Overview

The products page (`pages/products/index.vue`) is **915 lines** and needs refactoring. Before starting, we assessed test coverage and found **critical gaps** that must be addressed first.

---

## Test Coverage Assessment: 60% Ready ⚠️

### ✅ What We Have
- E2E pagination tests (11 tests)
- API integration tests (9 tests)
- Product component tests (10 files)
- `useProductPagination` composable tests (40+ tests)
- Visual regression tests

### ❌ What's Missing (CRITICAL)
- **No tests for the 915-line page itself**
- **9 product composables have NO tests (93% untested)**
  - `useProductCatalog.ts` (279 lines)
  - `useProductFilters.ts`
  - `useProductSearch.ts`
  - And 6 more...

---

## The Plan: Test First, Then Refactor

### Phase 1: Add Safety Net Tests (2-3 days)
**DO THIS FIRST - Required before any refactoring**

1. **Page Integration Tests** (1 day)
   - Test filter + search + pagination together
   - Test URL sync for all query params
   - Test state management across navigation
   - Snapshot current behavior

2. **Composable Unit Tests** (2 days)
   - `useProductFilters.test.ts` - 20+ tests
   - `useProductSearch.test.ts` - 12+ tests
   - `useProductCatalog.test.ts` - 10+ tests

**Goal:** 50+ new tests, >80% coverage for composables

### Phase 2: Refactor with Confidence (4 days)
**Only start after Phase 1 tests pass**

Extract into smaller components:
```
pages/products/index.vue (200 lines) ← from 915 lines
  ├─ components/product/Filters.vue (150 lines)
  ├─ components/product/SearchBar.vue (100 lines)
  ├─ components/product/Grid.vue (120 lines)
  ├─ components/product/Pagination.vue (80 lines)
  └─ components/product/EditorialStories.vue (100 lines)
```

---

## Why Test First?

**Without tests, refactoring risks:**
- ❌ Subtle bugs in filter logic
- ❌ State management issues
- ❌ URL sync problems
- ❌ Edge cases in search/filter combinations

**E2E tests will catch major breakage, but NOT subtle bugs**

**With tests, we get:**
- ✅ Confidence that refactoring preserves behavior
- ✅ Immediate feedback when something breaks
- ✅ Documentation of expected behavior
- ✅ Easier debugging when issues arise

---

## Timeline

| Phase | Duration | What |
|-------|----------|------|
| Phase 1 | 2-3 days | Add 50+ tests |
| Phase 2 | 4 days | Refactor into components |
| **Total** | **6-7 days** | Complete refactor |

---

## Documents Updated

1. ✅ `.github/ISSUES_FROM_REVIEW.md` - Issue #6 updated with test requirements
2. ✅ `docs/project/status/project-status.md` - Added Phase 1 & 2 breakdown
3. ✅ `docs/archive/reports/CODE_QUALITY_ANALYSIS_2025-11-01.md` - Issue #90 updated
4. ✅ `docs/how-to/testing/products-page-refactoring-test-plan.md` - **NEW** detailed test plan
5. ✅ `README.md` - Added reference to test plan

---

## Next Steps

1. **Review the detailed test plan:** `docs/how-to/testing/products-page-refactoring-test-plan.md`
2. **Start Phase 1:** Create `tests/pages/products/index.test.ts`
3. **Add composable tests** for filters, search, and catalog
4. **Verify all tests pass** before starting Phase 2
5. **Begin refactoring** with confidence

---

## Key Takeaway

**Don't refactor without tests.** The 2-3 days spent on Phase 1 will save debugging time and give confidence that the refactor preserves behavior.

---

**Status:** Ready to begin  
**Next Action:** Create page integration tests  
**Owner:** Development Team
