# Architecture Analysis: pages/products/index.vue

**Date:** 2026-01-20
**Reviewer:** Claude Code (feature-dev:code-explorer agent)
**File:** `/pages/products/index.vue`
**Lines:** 910 (target: <300)

---

## Executive Summary

**Current State:** 910 lines (violate 300-line limit)
**Health Score:** 5/10
**Primary Issue:** The page is doing too much - it's a "god component" that coordinates UI, state management, event handling, and business logic.

- Well-organized composables extraction (good use of SRP in underlying logic)
- Page component still acts as a "coordination layer" with too many responsibilities
- Mixed concerns: UI rendering, event coordination, state synchronization, URL watching
- High coupling to 8+ composables and multiple components

---

## 1. Component Responsibilities

### Current Responsibilities (Too Many):

1. **UI Rendering** (Lines 2-445)
   - Search bar with debounced input
   - Filter button with active count badge
   - Sort dropdown
   - Product grid (standard vs virtual)
   - Pagination controls
   - Active filter chips
   - Loading skeletons
   - Error states
   - Empty states
   - Recently viewed section
   - Editorial stories section

2. **State Coordination** (Lines 520-575)
   - Managing search query local state
   - Syncing between store and local state
   - Managing sort option
   - Tracking abort controllers
   - Recently viewed products state

3. **Event Handling** (Lines 591-769)
   - Debounced search input
   - Sort changes
   - Filter updates
   - Filter application
   - Filter clearing
   - Pagination navigation
   - Chip removal
   - Load more (infinite scroll)

4. **URL Synchronization** (Lines 824-852)
   - Watching route.query.page changes
   - Updating URL on pagination
   - Preserving other query params

5. **Lifecycle Management** (Lines 855-908)
   - Auto-focus search input
   - Setup mobile interactions
   - Fetch dynamic price range
   - Setup SEO watchers
   - Cleanup session storage
   - Abort pending requests
   - Cleanup mobile listeners

6. **Custom Debounce Implementation** (Lines 484-506)
   - SSR-safe debounce (critical comment explains why)

---

## 2. Coupling Analysis

### Dependencies by Category:

**Composables (8 total):**
- `useProductCatalog` - Main store/state
- `useProductFilters` - Filter state/chips
- `useProductPagination` - Pagination UI
- `useMobileProductInteractions` - Mobile gestures
- `useProductStructuredData` - SEO
- `useI18n` - Translations
- `useRoute` / `useRouter` - URL routing

**Components (9 total):**
- `productFilterMain` - Filter panel content
- `ProductCard` - Product display
- `commonIcon` - Icons
- `MobileVirtualProductGrid` - Virtualized grid
- `MobilePullToRefreshIndicator` - Pull-to-refresh UI
- `ProductFilterSheet` - Mobile filter sheet
- `ProductActiveFilters` - Filter chips
- `UiButton`, `UiCard`, `UiSkeleton` - UI components

**Types (3 imported):**
- `ProductFilters`, `ProductWithRelations` - Database types
- `ProductSortOption` - Sort option type
- `FilterChip` - Filter chip type

### Coupling Score: **HIGH TIGHT COUPLING**

**Issues:**
1. Direct coordination of 8+ composables creates tight coupling
2. Business logic scattered across multiple handlers
3. URL watching logic embedded in page component
4. Mobile interaction setup mixed with page lifecycle
5. No abstraction layer between page and composables

---

## 3. Abstraction Opportunities

### A. Extract to Sub-Components

#### 1. Search Section Component (Lines 72-121)
**File:** `components/product/SearchSection.vue`
**Responsibility:** Search input with debounce, clear button, icon
**Props:**
```typescript
interface Props {
  modelValue: string
  placeholder?: string
}
interface Emits {
  'update:modelValue': [value: string]
  'search': [query: string]
}
```
**Reduces:** 50 lines → 1 component call

#### 2. Toolbar Component (Lines 124-211)
**File:** `components/product/Toolbar.vue`
**Responsibility:** Title, results count, filter button, sort dropdown
**Props:**
```typescript
interface Props {
  title: string
  resultsCount: number
  activeFilterCount: number
  sortBy: ProductSortOption
  showFilterPanel: boolean
}
interface Emits {
  'open-filters': []
  'update:sortBy': [value: ProductSortOption]
}
```
**Reduces:** 88 lines → 1 component call

#### 3. Product Grid Component (Lines 262-346)
**File:** `components/product/ProductGrid.vue`
**Responsibility:** Grid layout, loading, error, empty, virtual grid
**Props:**
```typescript
interface Props {
  products: ProductWithRelations[]
  loading: boolean
  error: string | null
  pagination: PaginationState
  isMobile: boolean
}
interface Emits {
  'load-more': []
  'retry': []
}
```
**Reduces:** 85 lines → 1 component call

#### 4. Pagination Component (Lines 287-345)
**File:** `components/product/Pagination.vue`
**Responsibility:** Page navigation with ellipsis
**Props:**
```typescript
interface Props {
  pagination: PaginationState
  visiblePages: (number | string)[]
}
interface Emits {
  'go-to-page': [page: number]
}
```
**Reduces:** 58 lines → 1 component call

#### 5. Editorial Section Component (Lines 405-440)
**File:** `components/product/EditorialSection.vue`
**Responsibility:** Editorial stories display
**Note:** Check if `EditorialStories.vue` already handles this
**Reduces:** 36 lines → 1 component call

---

### B. Extract to Composables

#### 1. Search State Composable
**File:** `composables/useProductSearchState.ts`
**Current Issue:** Page has local search state and debounce logic
**Extraction:**
```typescript
export function useProductSearchState() {
  const searchQuery = ref('')
  const searchInput = ref<HTMLInputElement>()
  const searchAbortController = ref<AbortController | null>(null)

  const handleSearchInput = debounce((query: string) => {
    // Debounced search logic
  }, 300)

  return {
    searchQuery,
    searchInput,
    handleSearchInput,
    cleanup: () => searchAbortController.value?.abort()
  }
}
```
**Reduces:** 80 lines (debounce + search handlers)

#### 2. URL Synchronization Composable
**File:** `composables/useProductUrlSync.ts`
**Responsibility:** Watch URL params and sync with state
**Extraction:**
```typescript
export function useProductUrlSync(filters, pagination, searchQuery, sortBy) {
  const route = useRoute()
  const router = useRouter()

  watch(() => route.query.page, async (newPage, oldPage) => {
    // URL watching logic (lines 824-852)
  })

  const syncToUrl = (params) => {
    router.push({ query: params })
  }

  return { syncToUrl }
}
```
**Reduces:** 50 lines (URL watching logic)

#### 3. Product List Coordination Composable
**File:** `composables/useProductFiltersCoordination.ts`
**Responsibility:** Coordinate between catalog, filters, and search
**Extraction:**
```typescript
export function useProductFiltersCoordination() {
  const catalog = useProductCatalog()
  const filters = useProductFilters(categoriesTree)
  const searchState = useProductSearchState()

  const handleSortChange = () => { /* ... */ }
  const handleApplyFilters = () => { /* ... */ }
  const clearAllFilters = () => { /* ... */ }

  return {
    products: catalog.products,
    filters: filters.filters,
    searchQuery: searchState.searchQuery,
    // ... methods
  }
}
```
**Reduces:** 100 lines (coordination logic)

---

### C. Extract to Utility Functions

#### 1. Filter Query Builder
**File:** `utils/buildFilterQuery.ts`
**Responsibility:** Build filter objects for API calls
**Extraction:**
```typescript
export function buildFilterQuery(
  filters: ProductFilters,
  sortBy: ProductSortOption,
  page: number = 1
): ProductFilters {
  return {
    ...filters,
    sort: sortBy,
    page,
  }
}
```

#### 2. Debounce Utility
**File:** `utils/debounce.ts`
**Responsibility:** SSR-safe debounce
**Current:** Lines 484-506 (in-page)
**Extract:** Move to utils/ with comment about SSR safety

---

## 4. Three-Layer Pattern Check

### Current Architecture:

```
┌─────────────────────────────────────────────────────────┐
│  PAGE COMPONENT (910 lines)                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │  LAYER 1: UI (Lines 2-445)                       │  │
│  │  - Template rendering                             │  │
│  │  - Component composition                         │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  LAYER 2: LOGIC (Lines 448-908)                  │  │
│  │  - Event handlers (mixed with coordination)      │  │
│  │  - State synchronization                         │  │
│  │  - URL watching                                  │  │
│  │  - Lifecycle management                          │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  LAYER 3: TYPES (Imported)                       │  │
│  │  - ProductFilters                                 │  │
│  │  - ProductWithRelations                           │  │
│  │  - FilterChip                                     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
           ↓ imports
┌─────────────────────────────────────────────────────────┐
│  COMPOSABLES (8 total, well-separated)                 │
│  - useProductCatalog (402 lines) ✅                    │
│  - useProductFilters (575 lines) ✅                    │
│  - useProductPagination (110 lines) ✅                 │
│  - useMobileProductInteractions (98 lines) ✅          │
└─────────────────────────────────────────────────────────┘
```

### Three-Layer Compliance: **PARTIAL** ⚠️

**✅ Good:**
- Types properly separated in `/types/database.ts`
- Composables follow SRP (each has single responsibility)
- No business logic in template

**❌ Issues:**
1. **Logic Layer (Page Script):**
   - Event handlers mixed with coordination logic
   - URL synchronization in page component (should be composable)
   - Search state management in page (should be composable)
   - Mobile interaction setup in page lifecycle

2. **UI Layer (Template):**
   - Too much inline conditional logic
   - Large sections that could be components
   - Mixed concerns (search, toolbar, grid, pagination all in one template)

3. **Missing Abstraction:**
   - No "coordination layer" between page and composables
   - Page directly orchestrates 8+ composables
   - No encapsulation of common patterns

---

## 5. Refactoring Path (Priority Order)

### Phase 1: Quick Wins (Low Risk, High Impact)

#### Priority 1: Extract UI Sections to Components (Save ~200 lines)

1. **`components/product/SearchSection.vue`** (Lines 72-121)
   - Isolate search input + debounce UI
   - Emit `search` event with debounced value
   - **Benefit:** Remove 50 lines, testable search interaction

2. **`components/product/Toolbar.vue`** (Lines 124-211)
   - Combine header + filter button + sort dropdown
   - Emit events for user actions
   - **Benefit:** Remove 88 lines, clear UI responsibility

3. **`components/product/ProductGrid.vue`** (Lines 262-346)
   - Encapsulate grid + loading + error + empty states
   - Handle virtual grid switching internally
   - **Benefit:** Remove 85 lines, isolate grid logic

**Estimated Reduction:** 910 → 710 lines (-200 lines, 22% reduction)

---

### Phase 2: Extract Logic to Composables (Save ~150 lines)

#### Priority 2: Create `useProductSearchState` (Lines 564-614)
```typescript
// composables/useProductSearchState.ts
export function useProductSearchState(initialQuery: string = '') {
  const searchQuery = ref(initialQuery)
  const searchInput = ref<HTMLInputElement>()
  const searchAbortController = ref<AbortController | null>(null)

  const handleSearchInput = debounce((query: string, callback) => {
    // Cancel previous + trigger search
  }, 300)

  const cleanup = () => {
    searchAbortController.value?.abort()
  }

  return { searchQuery, searchInput, handleSearchInput, cleanup }
}
```
**Benefit:** Encapsulate search state, remove 50 lines from page

#### Priority 3: Create `useProductUrlSync` (Lines 824-852)
```typescript
// composables/useProductUrlSync.ts
export function useProductUrlSync(
  filters: Ref<ProductFilters>,
  pagination: Ref<PaginationState>,
  fetchCallback: (params: ProductFilters) => Promise<void>
) {
  const route = useRoute()
  const router = useRouter()

  watch(() => route.query.page, async (newPage, oldPage) => {
    // URL watching logic
  })

  const syncToUrl = (params: Record<string, string>) => {
    router.push({ query: { ...route.query, ...params } })
  }

  return { syncToUrl }
}
```
**Benefit:** Remove URL watching from page, testable in isolation

#### Priority 4: Create `useProductFiltersCoordination` (Lines 616-670)
```typescript
// composables/useProductFiltersCoordination.ts
export function useProductFiltersCoordination(
  catalog: ReturnType<typeof useProductCatalog>,
  filters: ReturnType<typeof useProductFilters>,
  searchQuery: Ref<string>
) {
  const handleSortChange = (newSort: ProductSortOption) => {
    // Coordinated sort change
  }

  const handleApplyFilters = (closePanel = false) => {
    // Coordinated filter application
  }

  const clearAllFilters = () => {
    // Coordinated clear
  }

  return { handleSortChange, handleApplyFilters, clearAllFilters }
}
```
**Benefit:** Remove coordination logic, single responsibility

**Estimated Reduction:** 710 → 560 lines (-150 lines total, 38% reduction)

---

### Final Target Architecture

```
pages/products/index.vue (200 lines)
├── Template
│   ├── SearchSection (component)
│   ├── Toolbar (component)
│   ├── ActiveFilters (existing)
│   ├── ProductGrid (new component)
│   └── Pagination (new component)
└── Script
    ├── useProductSearchState (composable)
    ├── useProductUrlSync (composable)
    ├── useProductFiltersCoordination (composable)
    └── Lifecycle hooks (minimal)

Composables (all < 150 lines, testable without DOM)
├── useProductCatalog (402 lines) ✅
├── useProductFilters (575 lines) ✅
├── useProductSearchState (new, ~80 lines)
├── useProductUrlSync (new, ~60 lines)
└── useProductFiltersCoordination (new, ~100 lines)

Components (all < 200 lines, single responsibility)
├── SearchSection (~100 lines)
├── Toolbar (~120 lines)
├── ProductGrid (~150 lines)
└── Pagination (~80 lines)
```

---

## Summary: Key Recommendations

### Essential Files to Understand This Feature:

1. `/pages/products/index.vue` (910 lines) - **Main page, needs refactoring**
2. `/composables/useProductCatalog.ts` (402 lines) - **Core state management**
3. `/composables/useProductFilters.ts` (575 lines) - **Filter logic**
4. `/composables/useProductPagination.ts` (110 lines) - **Pagination UI**
5. `/composables/useMobileProductInteractions.ts` (98 lines) - **Mobile gestures**
6. `/types/database.ts` (Lines 134-145) - **ProductFilters type**
7. `/components/product/Card.vue` - **Product display**
8. `/components/product/ActiveFilters.vue` - **Filter chips**

### Refactoring Priority:

1. **Extract 3 UI components** (SearchSection, Toolbar, ProductGrid) - Save 200 lines
2. **Extract 3 composables** (SearchState, UrlSync, Coordination) - Save 150 lines
3. **Extract pagination handler** - Save 50 lines
4. **Consolidate filter building utility** - Save 50 lines

**Target:** 910 → 200 lines (78% reduction, 300-line compliant)

### Testing Strategy:

After extraction, each component/composable should be testable independently:
- **Components:** Visual testing with Vitest + Testing Library
- **Composables:** Unit tests without DOM (pure logic)
- **Page:** Integration tests (component + composable interaction)
