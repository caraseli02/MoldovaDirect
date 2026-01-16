# Products Page Refactoring - Test Plan

**Created:** 2026-01-16  
**Status:** Planning  
**Priority:** HIGH - Required before refactoring  
**Related Issues:** #6, #90, #91

---

## Executive Summary

Before refactoring the 915-line products page, we must establish a comprehensive test safety net. Current test coverage is **60% ready** - good E2E coverage but critical gaps in composable and page-level tests.

**Risk:** Refactoring without these tests may introduce subtle bugs in filter logic, state management, and URL sync that E2E tests won't catch.

---

## Current Test Coverage Assessment

### ✅ What We Have (Good Foundation)

**E2E Tests:**
- ✅ `tests/e2e/products-pagination.spec.ts` - 11 comprehensive pagination tests
- ✅ `tests/api/products-api.test.ts` - 9 API integration tests
- ✅ Visual regression tests for products pages
- ✅ Cart integration tests using products

**Component Tests:**
- ✅ 10 product component tests:
  - `ActiveFilters.test.ts`
  - `AttributeCheckboxGroup.test.ts`
  - `Breadcrumbs.test.ts`
  - `Card.test.ts` & `Card.enhanced.test.ts`
  - `CategoryNavigation.test.ts`
  - `EditorialStories.test.ts`
  - `FilterSheet.test.ts`
  - `Hero.test.ts`
  - `SearchBar.test.ts`

**Composable Tests:**
- ✅ `composables/useProductPagination.test.ts` - 40+ test cases (excellent coverage)

### ❌ Critical Gaps (Must Fix Before Refactoring)

**Missing Page Tests:**
- ❌ No tests for `pages/products/index.vue` (915 lines)
- ❌ No tests for `pages/products/[slug].vue` (detail page)
- ❌ No integration tests for filter + search + pagination together

**Missing Composable Tests (9 files, 93% untested):**
- ❌ `useProductCatalog.ts` (279 lines) - **CRITICAL**
- ❌ `useProductFilters.ts` - **CRITICAL**
- ❌ `useProductSearch.ts` - **CRITICAL**
- ❌ `useProductUtils.ts` - **HIGH**
- ❌ `useProductDetailSEO.ts` - **MEDIUM**
- ❌ `useProductStructuredData.ts` - **MEDIUM**
- ❌ `useProductStockStatus.ts` - **MEDIUM**
- ❌ `useProductStory.ts` - **LOW**
- ❌ `useProductPlaceholder.ts` - **LOW**

---

## Phase 1: Safety Net Tests (2-3 days)

**Goal:** Capture current behavior before refactoring begins

### Task 1.1: Page Integration Tests (1 day)

**File:** `tests/pages/products/index.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductsPage from '~/pages/products/index.vue'

describe('Products Page Integration', () => {
  describe('Filter + Search + Pagination Integration', () => {
    it('should apply filters and update URL', async () => {
      // Test that selecting a filter updates the URL query params
    })

    it('should combine search with filters', async () => {
      // Test search + category filter + price filter together
    })

    it('should maintain filters when paginating', async () => {
      // Test that filters persist across page navigation
    })

    it('should reset pagination when filters change', async () => {
      // Test that changing filters resets to page 1
    })
  })

  describe('URL Sync', () => {
    it('should load filters from URL on mount', async () => {
      // Test SSR: URL params should initialize filters
    })

    it('should sync all query params to URL', async () => {
      // Test: page, limit, category, priceMin, priceMax, search, sort
    })

    it('should handle invalid URL params gracefully', async () => {
      // Test: page=-1, limit=999999, invalid category
    })
  })

  describe('State Management', () => {
    it('should maintain state when navigating away and back', async () => {
      // Test that filters/search persist in browser history
    })

    it('should clear state when explicitly requested', async () => {
      // Test "Clear Filters" button
    })

    it('should handle concurrent filter updates', async () => {
      // Test rapid filter changes don't cause race conditions
    })
  })

  describe('Snapshot Tests', () => {
    it('should render products page correctly', () => {
      const wrapper = mount(ProductsPage, {
        global: {
          stubs: ['NuxtLink', 'ProductCard']
        }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render with filters applied', () => {
      // Snapshot with active filters
    })

    it('should render empty state', () => {
      // Snapshot when no products match filters
    })
  })
})
```

**Acceptance Criteria:**
- [ ] 15+ integration tests covering filter/search/pagination
- [ ] URL sync tests for all query parameters
- [ ] State management tests for navigation
- [ ] Snapshot tests for current rendering
- [ ] All tests passing

---

### Task 1.2: useProductFilters Tests (1 day)

**File:** `tests/composables/useProductFilters.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useProductFilters } from '~/composables/useProductFilters'

describe('useProductFilters', () => {
  describe('Filter State Management', () => {
    it('should initialize with default filters', () => {
      const { filters } = useProductFilters()
      expect(filters.value).toEqual({
        category: null,
        priceMin: null,
        priceMax: null,
        attributes: {},
        inStock: false
      })
    })

    it('should update category filter', () => {
      const { filters, setCategory } = useProductFilters()
      setCategory('wines')
      expect(filters.value.category).toBe('wines')
    })

    it('should update price range', () => {
      const { filters, setPriceRange } = useProductFilters()
      setPriceRange(10, 50)
      expect(filters.value.priceMin).toBe(10)
      expect(filters.value.priceMax).toBe(50)
    })
  })

  describe('Filter Application', () => {
    it('should apply filters to product list', () => {
      // Test filtering logic
    })

    it('should handle multiple filters together', () => {
      // Test category + price + attributes
    })

    it('should return empty array when no matches', () => {
      // Test no products match filters
    })
  })

  describe('URL Sync', () => {
    it('should serialize filters to URL params', () => {
      const { filters, toURLParams } = useProductFilters()
      filters.value = { category: 'wines', priceMin: 10, priceMax: 50 }
      expect(toURLParams()).toEqual({
        category: 'wines',
        priceMin: '10',
        priceMax: '50'
      })
    })

    it('should deserialize URL params to filters', () => {
      const { fromURLParams } = useProductFilters()
      const filters = fromURLParams({
        category: 'wines',
        priceMin: '10',
        priceMax: '50'
      })
      expect(filters.category).toBe('wines')
      expect(filters.priceMin).toBe(10)
      expect(filters.priceMax).toBe(50)
    })
  })

  describe('Filter Clearing', () => {
    it('should clear all filters', () => {
      const { filters, clearFilters } = useProductFilters()
      filters.value = { category: 'wines', priceMin: 10 }
      clearFilters()
      expect(filters.value.category).toBeNull()
      expect(filters.value.priceMin).toBeNull()
    })

    it('should clear individual filter', () => {
      const { filters, clearCategory } = useProductFilters()
      filters.value.category = 'wines'
      clearCategory()
      expect(filters.value.category).toBeNull()
    })
  })

  describe('Active Filters', () => {
    it('should return list of active filters', () => {
      const { filters, activeFilters } = useProductFilters()
      filters.value = { category: 'wines', priceMin: 10 }
      expect(activeFilters.value).toHaveLength(2)
    })

    it('should return empty array when no filters', () => {
      const { activeFilters } = useProductFilters()
      expect(activeFilters.value).toHaveLength(0)
    })
  })
})
```

**Acceptance Criteria:**
- [ ] 20+ tests covering all filter operations
- [ ] URL serialization/deserialization tests
- [ ] Filter application logic tests
- [ ] Edge case handling (invalid values, null, undefined)
- [ ] >80% code coverage

---

### Task 1.3: useProductSearch Tests (0.5 days)

**File:** `tests/composables/useProductSearch.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { useProductSearch } from '~/composables/useProductSearch'

describe('useProductSearch', () => {
  describe('Search State', () => {
    it('should initialize with empty search', () => {
      const { searchQuery } = useProductSearch()
      expect(searchQuery.value).toBe('')
    })

    it('should update search query', () => {
      const { searchQuery, setSearch } = useProductSearch()
      setSearch('wine')
      expect(searchQuery.value).toBe('wine')
    })
  })

  describe('Search Execution', () => {
    it('should debounce search input', async () => {
      // Test that search doesn't fire on every keystroke
    })

    it('should search across product fields', () => {
      // Test searching name, description, SKU
    })

    it('should handle special characters', () => {
      // Test search with quotes, slashes, etc.
    })
  })

  describe('Search Results', () => {
    it('should return matching products', () => {
      // Test search returns correct results
    })

    it('should combine with filters', () => {
      // Test search + category filter
    })

    it('should return empty array for no matches', () => {
      // Test no results
    })
  })

  describe('Search Clearing', () => {
    it('should clear search query', () => {
      const { searchQuery, clearSearch } = useProductSearch()
      searchQuery.value = 'wine'
      clearSearch()
      expect(searchQuery.value).toBe('')
    })
  })
})
```

**Acceptance Criteria:**
- [ ] 12+ tests covering search functionality
- [ ] Debounce behavior tests
- [ ] Search + filter integration tests
- [ ] >80% code coverage

---

### Task 1.4: useProductCatalog Tests (0.5 days)

**File:** `tests/composables/useProductCatalog.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { useProductCatalog } from '~/composables/useProductCatalog'

describe('useProductCatalog', () => {
  describe('Product Loading', () => {
    it('should load products on mount', async () => {
      const { products, loading } = useProductCatalog()
      expect(loading.value).toBe(true)
      await nextTick()
      expect(products.value.length).toBeGreaterThan(0)
      expect(loading.value).toBe(false)
    })

    it('should handle loading errors', async () => {
      // Test API error handling
    })
  })

  describe('Product State', () => {
    it('should maintain product list', () => {
      const { products } = useProductCatalog()
      expect(Array.isArray(products.value)).toBe(true)
    })

    it('should update when filters change', async () => {
      // Test reactive updates
    })
  })

  describe('Pagination State', () => {
    it('should track current page', () => {
      const { currentPage } = useProductCatalog()
      expect(currentPage.value).toBe(1)
    })

    it('should track total products', () => {
      const { total } = useProductCatalog()
      expect(typeof total.value).toBe('number')
    })
  })
})
```

**Acceptance Criteria:**
- [ ] 10+ tests covering catalog state
- [ ] Loading state tests
- [ ] Error handling tests
- [ ] >80% code coverage

---

## Phase 2: Refactoring (4 days)

**Only start after Phase 1 tests are complete and passing**

### Task 2.1: Extract Filter Component (1 day)
- Create `components/product/Filters.vue`
- Move filter UI from main page
- Use `useProductFilters` composable
- Ensure all tests still pass

### Task 2.2: Extract Search Component (0.5 days)
- Create `components/product/SearchBar.vue`
- Move search UI from main page
- Use `useProductSearch` composable
- Ensure all tests still pass

### Task 2.3: Extract Grid Component (0.5 days)
- Create `components/product/Grid.vue`
- Move product grid rendering
- Ensure all tests still pass

### Task 2.4: Extract Pagination Component (0.5 days)
- Create `components/product/Pagination.vue`
- Move pagination UI
- Use existing `useProductPagination` composable
- Ensure all tests still pass

### Task 2.5: Refactor Main Page (1 day)
- Reduce `pages/products/index.vue` to <200 lines
- Compose extracted components
- Ensure all tests still pass
- Update documentation

### Task 2.6: Performance Testing (0.5 days)
- Benchmark before/after performance
- Ensure no regressions
- Document improvements

---

## Success Criteria

### Phase 1 Complete When:
- [ ] 50+ new tests added
- [ ] All composables have >80% coverage
- [ ] Page integration tests cover all critical paths
- [ ] Snapshot tests capture current behavior
- [ ] All tests passing
- [ ] Test execution time <30 seconds

### Phase 2 Complete When:
- [ ] Main page <200 lines
- [ ] 4+ new components created
- [ ] All Phase 1 tests still passing
- [ ] No performance regressions
- [ ] Documentation updated
- [ ] Code review approved

---

## Risk Mitigation

### High Risk Areas
1. **Filter Logic** - Complex, no tests → Add comprehensive tests first
2. **URL Sync** - Easy to break → Test all query param combinations
3. **State Management** - 40+ refs → Test state transitions

### Medium Risk Areas
1. **Search Integration** - Debouncing, special chars → Test edge cases
2. **Pagination** - Already tested, but test with filters → Integration tests

### Low Risk Areas
1. **Visual Appearance** - Visual regression tests will catch
2. **API Calls** - Already tested at API level

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| 1.1 Page Integration Tests | 1 day | None |
| 1.2 useProductFilters Tests | 1 day | None |
| 1.3 useProductSearch Tests | 0.5 days | None |
| 1.4 useProductCatalog Tests | 0.5 days | None |
| **Phase 1 Total** | **3 days** | |
| 2.1 Extract Filters | 1 day | Phase 1 complete |
| 2.2 Extract Search | 0.5 days | Phase 1 complete |
| 2.3 Extract Grid | 0.5 days | Phase 1 complete |
| 2.4 Extract Pagination | 0.5 days | Phase 1 complete |
| 2.5 Refactor Main Page | 1 day | Tasks 2.1-2.4 |
| 2.6 Performance Testing | 0.5 days | Task 2.5 |
| **Phase 2 Total** | **4 days** | |
| **Grand Total** | **7 days** | |

---

## Test Execution Commands

```bash
# Run all product-related tests
npm run test:unit -- products

# Run specific test files
npm run test:unit tests/pages/products/index.test.ts
npm run test:unit tests/composables/useProductFilters.test.ts

# Run with coverage
npm run test:coverage -- --include="**/products/**"

# Run E2E tests
npm run test:products

# Watch mode during development
npm run test:unit -- --watch products
```

---

## Documentation Updates Required

After refactoring:
- [ ] Update component documentation
- [ ] Update composable documentation
- [ ] Update architecture diagrams
- [ ] Update testing guide
- [ ] Update CHANGELOG.md

---

**Status:** Ready to begin Phase 1  
**Next Step:** Create `tests/pages/products/index.test.ts`  
**Owner:** Development Team  
**Review Date:** After Phase 1 completion
