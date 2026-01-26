# Component Refactoring Patterns

**Purpose:** Reference catalog of refactoring patterns used in this codebase.

> This is a **reference**, not a tutorial. Browse by pattern name to see implementation details, examples, and when to use each pattern.

---

## Table of Contents

| Pattern | When to Use | Complexity |
|---------|-------------|------------|
| [Page Orchestration](#1-page-orchestration-pattern) | Large pages (>300 lines) with mixed concerns | High |
| [Form State Extraction](#2-form-state-pattern) | Forms with validation, auto-save | Medium |
| [Filter State Management](#3-filter-state-pattern) | Pages with filters, sorting, pagination | Medium |
| [Component Decomposition](#4-component-decomposition-pattern) | Large UI sections (>200 lines) | Low |
| [URL State Preservation](#5-url-state-preservation-pattern) | Pages with query param state | Medium |

---

## 1. Page Orchestration Pattern

**Purpose:** Extract all business logic from a large page component into a dedicated composable.

### When to Use
- Page component exceeds 300 lines
- Multiple concerns mixed together (data fetching, user input, URL sync)
- Hard to test business logic without rendering entire UI

### Structure
```typescript
// composables/use[Feature]Page.ts
export function use[Feature]Page(options: Use[Feature]PageOptions) {
  // Destructure dependencies
  const { state, actions } = options

  // Local state
  const localState = ref<T>()

  // Computed
  const derived = computed(() => /* ... */)

  // Methods
  const handleX = async () => { /* ... */ }

  // Lifecycle hooks (returned for component to call)
  const onMountedHook = async () => { /* ... */ }
  const onUnmountedHook = () => { /* ... */ }

  return {
    // State
    localState,
    derived,

    // Methods
    handleX,

    // Lifecycle
    onMountedHook,
    onUnmountedHook,
  }
}
```

### Real Example: `useProductsPage`

**File:** `composables/useProductsPage.ts`

**Before:** `pages/products/index.vue` was 905 lines with everything mixed together.

**After:** Page reduced to 297 lines. All handlers, watchers, and lifecycle in composable.

```typescript
// composables/useProductsPage.ts
interface UseProductsPageOptions {
  products: Ref<ProductWithRelations[]>
  categoriesTree: Ref<any[]>
  searchQuery: Ref<string>
  filters: Ref<ProductFilters>
  pagination: Ref<{ page: number, limit: number, total: number, totalPages: number }>
  loading: Ref<boolean>
  error: Ref<string | null>
  sortBy: Ref<string>
  showFilterPanel: Ref<boolean>
  initialize: () => Promise<void>
  fetchProducts: (args?: any) => Promise<void>
  search: (query: string, filters: ProductFilters, signal?: AbortSignal) => Promise<void>
  updateFilters: (filters: Partial<ProductFilters>) => void
  clearFilters: () => void
  openFilterPanel: () => void
  closeFilterPanel: () => void
  ensureFilterPanelInitialized: () => void
  activeFilterChips: Ref<FilterChip[]>
  removeFilterChip: (chip: FilterChip) => ProductFilters
  refreshPriceRange: () => Promise<void>
  visiblePages: Ref<(number | string)[]>
  scrollContainer: Ref<HTMLElement | undefined>
  mobileInteractions: any
}

export function useProductsPage(options: UseProductsPageOptions) {
  const route = useRoute()
  const router = useRouter()

  const {
    searchQuery,
    filters,
    pagination,
    sortBy,
    loading,
    fetchProducts,
    search,
    updateFilters,
    clearFilters,
    closeFilterPanel,
    removeFilterChip,
    refreshPriceRange,
    mobileInteractions,
  } = options

  // ... implementation

  return {
    // State
    searchInput,
    localSortBy,
    hasActiveFilters,

    // Methods
    handleSearchInput,
    handleSortChange,
    handleApplyFilters,
    clearAllFilters,
    goToPage,
    refreshProducts,

    // Lifecycle (component must call these)
    onMountedHook,
    onBeforeUnmountHook,
    onUnmountedHook,
  }
}
```

**Usage in component:**
```vue
<!-- pages/products/index.vue -->
<script setup lang="ts">
const {
  searchInput,
  localSortBy,
  handleSearchInput,
  onMountedHook,
  onUnmountedHook,
} = useProductsPage({
  products,
  categoriesTree,
  // ... pass all dependencies
})

onMounted(onMountedHook)
onUnmounted(onUnmountedHook)
</script>
```

### Key Principles
1. **Accept dependencies as parameters** - Don't import stores directly
2. **Return lifecycle hooks** - Let component control when to call them
3. **Use VueUse for common patterns** - `useDebounceFn` is SSR-safe
4. **Preserve URL state** - Watch and update route query params

### Related Patterns
- [URL State Preservation](#5-url-state-preservation-pattern)
- [Filter State Management](#3-filter-state-pattern)

---

## 2. Form State Pattern

**Purpose:** Extract form state, validation, and auto-save logic into a dedicated composable.

### When to Use
- Form has validation rules
- Auto-save or debounced save behavior
- Form used in multiple contexts

### Structure
```typescript
// composables/use[Feature]Form.ts
export function use[Feature]Form() {
  // Form state
  const form = reactive<FormState>({ /* ... */ })

  // Validation errors
  const errors = reactive<FormErrors>({ /* ... */ })

  // Loading/saving status
  const isLoading = ref(false)
  const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Validation
  const validateForm = (): boolean => {
    // Clear previous errors
    Object.keys(errors).forEach(key => { errors[key] = '' })

    // Run validation
    let isValid = true
    if (form.name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
      isValid = false
    }
    // ... more validation

    return isValid
  }

  // Save (possibly debounced)
  const saveForm = async () => {
    if (!validateForm()) return

    isLoading.value = true
    saveStatus.value = 'saving'

    try {
      // ... API call
      saveStatus.value = 'saved'
    }
    catch (err) {
      saveStatus.value = 'error'
    }
    finally {
      isLoading.value = false
    }
  }

  const debouncedSave = useDebounceFn(saveForm, 500)

  return {
    form,
    errors,
    isLoading,
    saveStatus,
    validateForm,
    saveForm,
    debouncedSave,
  }
}
```

### Real Example: `useProfileForm`

**File:** `composables/useProfileForm.ts`

```typescript
export function useProfileForm(initialData: UserMetadata = {}) {
  const form = reactive<ProfileForm>({
    name: initialData.name || '',
    phone: initialData.phone || '',
  })

  const errors = reactive<ProfileFormErrors>({
    name: '',
    phone: '',
  })

  const validateField = (field: keyof ProfileForm): boolean => {
    let isValid = true

    if (field === 'name') {
      if (!form.name || form.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters'
        isValid = false
      }
      else if (form.name.length > 50) {
        errors.name = 'Name must be less than 50 characters'
        isValid = false
      }
      else {
        errors.name = ''
      }
    }

    if (field === 'phone') {
      if (form.phone && !PHONE_REGEX.test(form.phone)) {
        errors.phone = 'Please enter a valid phone number'
        isValid = false
      }
      else {
        errors.phone = ''
      }
    }

    return isValid
  }

  const validateForm = (): boolean => {
    const nameValid = validateField('name')
    const phoneValid = validateField('phone')
    return nameValid && phoneValid
  }

  return {
    form,
    errors,
    validateField,
    validateForm,
  }
}
```

### Key Principles
1. **Separate validation logic** - `validateField()` for single field, `validateForm()` for all
2. **Return reactive objects** - Use `reactive()` for form, `ref()` for status
3. **Clear errors on re-validation** - Don't let stale errors persist

---

## 3. Filter State Pattern

**Purpose:** Manage filter state, active chips, and filter removal logic.

### When to Use
- Page has multiple filters (category, price, attributes)
- Need visual "chips" showing active filters
- Filters can be individually removed

### Structure
```typescript
// composables/use[Feature]Filters.ts
export function use[Feature]Filters() {
  // Active filters
  const filters = ref<Filters>({
    category: undefined,
    priceMin: undefined,
    priceMax: undefined,
    attributes: {},
    inStock: undefined,
  })

  // Derived: active filter chips for display
  const activeFilterChips = computed<FilterChip[]>(() => {
    const chips: FilterChip[] = []

    if (filters.value.category) {
      chips.push({
        type: 'category',
        label: getCategoryLabel(filters.value.category),
        value: filters.value.category,
      })
    }

    if (filters.value.priceMin || filters.value.priceMax) {
      chips.push({
        type: 'price',
        label: `$${filters.value.priceMin} - $${filters.value.priceMax}`,
        value: { min: filters.value.priceMin, max: filters.value.priceMax },
      })
    }

    return chips
  })

  // Remove a single filter (returns new filter state)
  const removeFilter = (chip: FilterChip): Filters => {
    const newFilters = { ...filters.value }

    switch (chip.type) {
      case 'category':
        newFilters.category = undefined
        break
      case 'price':
        newFilters.priceMin = undefined
        newFilters.priceMax = undefined
        break
    }

    return newFilters
  }

  // Clear all filters
  const clearFilters = (): Filters => {
    return {
      category: undefined,
      priceMin: undefined,
      priceMax: undefined,
      attributes: {},
      inStock: undefined,
    }
  }

  return {
    filters,
    activeFilterChips,
    removeFilter,
    clearFilters,
  }
}
```

### Real Example: `useProductFilters`

**File:** `composables/useProductFilters.ts`

```typescript
export function useProductFilters() {
  const filters = ref<ProductFilters>({
    category: undefined,
    priceMin: undefined,
    priceMax: undefined,
    attributes: {},
    inStock: undefined,
    featured: undefined,
  })

  // Normalize Map keys to strings for reliable lookup
  const categoryMap = ref<Map<string, Category>>(new Map())

  const activeFilterChips = computed<FilterChip[]>(() => {
    const chips: FilterChip[] = []

    if (filters.value.category) {
      const category = categoryMap.value.get(String(filters.value.category))
      chips.push({
        type: 'category',
        label: category?.name || `Category ${filters.value.category}`,
        value: filters.value.category,
      })
    }

    if (filters.value.inStock) {
      chips.push({
        type: 'inStock',
        label: 'In Stock Only',
        value: true,
      })
    }

    // ... more chips

    return chips
  })

  const removeFilterChip = (chip: FilterChip): ProductFilters => {
    const newFilters = { ...filters.value }

    switch (chip.type) {
      case 'category':
        newFilters.category = undefined
        break
      case 'inStock':
        newFilters.inStock = undefined
        break
      case 'price':
        newFilters.priceMin = undefined
        newFilters.priceMax = undefined
        break
    }

    return newFilters
  }

  return {
    filters,
    categoryMap,
    activeFilterChips,
    removeFilterChip,
  }
}
```

### Key Principles
1. **Normalize Map keys** - Use strings as Map keys for reliable lookups
2. **Derived chips** - Compute chips from filters, don't manage separately
3. **Immutable updates** - `removeFilter` returns new state, doesn't mutate

---

## 4. Component Decomposition Pattern

**Purpose:** Split large UI sections into focused, reusable components.

### When to Use
- Component exceeds 200-300 lines
- Multiple distinct UI sections
- Section could be reused elsewhere

### Process

**Step 1: Identify UI sections**
```vue
<!-- BEFORE: One large component -->
<template>
  <div>
    <!-- Header section -->
    <section class="header">...</section>

    <!-- Filters toolbar -->
    <section class="toolbar">...</section>

    <!-- Products grid -->
    <section class="grid">...</section>

    <!-- Empty state -->
    <section v-if="!products.length" class="empty">...</section>
  </div>
</template>
```

**Step 2: Extract each section**
```vue
<!-- components/product/ProductsToolbar.vue -->
<script setup lang="ts">
interface Props {
  filterCount: number
  sortBy: string
}

interface Emits {
  (e: 'openFilter'): void
  (e: 'update:sort', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="flex items-center justify-between">
    <UiButton @click="emit('openFilter')">
      Filters ({{ filterCount }})
    </UiButton>

    <UiSelect :model-value="sortBy" @update:model-value="emit('update:sort', $event)">
      <!-- ... -->
    </UiSelect>
  </div>
</template>
```

**Step 3: Use extracted components**
```vue
<!-- AFTER: Clean parent component -->
<template>
  <div>
    <ProductsToolbar
      :filter-count="activeFilterCount"
      :sort-by="sortBy"
      @open-filter="openFilterPanel"
      @update:sort="handleSortChange"
    />

    <ProductsGrid
      :products="products"
      :loading="loading"
    />

    <ProductsEmptyState
      v-if="!products.length && !loading"
      @clear-filters="clearAllFilters"
    />
  </div>
</template>
```

### Real Example: Products Page Components

**Extracted from `pages/products/index.vue`:**

| Component | Lines | Responsibility |
|-----------|-------|----------------|
| `EditorialSection` | 40 | Editorial stories |
| `ProductsToolbar` | 35 | Filter button + sort dropdown |
| `ProductsGrid` | 60 | Product cards + pagination |
| `ProductsEmptyState` | 30 | Empty state with clear button |
| `RecentlyViewed` | 45 | Recently viewed products |
| `SearchBar` | 50 | Search input with clear button |
| `ErrorState` | 25 | Error display with retry |
| `LoadingState` | 30 | Loading skeletons |

**Result:** 905 → 297 lines in main component.

### Key Principles
1. **Single responsibility** - Each component does ONE thing
2. **Props down, events up** - Standard Vue pattern
3. **Test in isolation** - Each component has its own test file

---

## 5. URL State Preservation Pattern

**Purpose:** Keep URL query params in sync with component state.

### When to Use
- Page has filters, sort, pagination that should be shareable
- Browser back/forward should work
- Direct links to filtered views should work

### Structure
```typescript
// In page composable

// 1. Initialize state from URL on mount
const initialQuery = (route.query.q as string) || ''
if (initialQuery && !searchQuery.value) {
  searchQuery.value = initialQuery
}

// 2. Watch state changes, update URL
watch(searchQuery, async (newQuery) => {
  const currentQuery = { ...route.query }

  if (newQuery.trim()) {
    currentQuery.q = newQuery.trim()
  }
  else {
    delete currentQuery.q
  }

  await router.replace({ query: currentQuery })
})

// 3. Watch URL changes, update state
watch(() => route.query.page, async (newPage) => {
  const pageNum = parseInt((newPage as string) || '1')
  if (isNaN(pageNum)) return

  const validPage = Math.max(1, Math.min(pageNum, pagination.value.totalPages || 1))

  // Fetch products for this page
  await fetchProducts({ page: validPage })
})
```

### Real Example: Products Page URL Sync

**File:** `composables/useProductsPage.ts` (lines 363-434)

```typescript
// Initialize searchQuery from URL query parameter
const initialQueryFromUrl = (route.query.q as string) || ''
if (initialQueryFromUrl && !searchQuery.value) {
  searchQuery.value = initialQueryFromUrl
}

// Watch searchQuery and sync to URL
watch(searchQuery, async (newQuery, oldQuery) => {
  if (newQuery === oldQuery) return

  const currentUrlQuery = route.query.q as string || ''
  const newQueryTrimmed = newQuery.trim()

  // Skip if URL already has the correct value
  if (currentUrlQuery === newQueryTrimmed) return

  const currentQuery = { ...route.query }

  if (newQueryTrimmed) {
    currentQuery.q = newQueryTrimmed
  }
  else {
    delete currentQuery.q
  }

  await router.replace({ query: currentQuery })
})

// Watch URL query parameter changes (handles browser back/forward)
watch(() => route.query.page, async (newPage, oldPage) => {
  if (newPage === oldPage) return

  const pageNum = parseInt((newPage as string) || '1')
  if (isNaN(pageNum)) return

  const validPage = Math.max(1, Math.min(pageNum, pagination.value.totalPages || 1))

  const currentFilters: ProductFilters = {
    ...filters.value,
    sort: localSortBy.value,
    page: validPage,
  }

  if (searchQuery.value.trim()) {
    await search(searchQuery.value.trim(), currentFilters)
  }
  else {
    await fetchProducts(currentFilters)
  }

  // Scroll to top
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})
```

### Key Principles
1. **Initialize from URL** - Read query params on first load
2. **Bidirectional sync** - State → URL and URL → State
3. **Use `router.replace`** - Avoid cluttering browser history
4. **Debounce URL updates** - Don't update on every keystroke

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  REFACTORING DECISION TREE                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Component > 300 lines?                                     │
│     ├─ YES: Use Page Orchestration Pattern                 │
│     │        → Extract to use[Feature]Page.ts              │
│     │                                                        │
│  Has form with validation?                                  │
│     ├─ YES: Use Form State Pattern                         │
│     │        → Extract to use[Feature]Form.ts              │
│     │                                                        │
│  Has filters/sort/pagination?                               │
│     ├─ YES: Use Filter State Pattern                       │
│     │        → Extract to use[Feature]Filters.ts           │
│     │                                                        │
│  UI section > 200 lines?                                    │
│     └─ YES: Use Component Decomposition                     │
│              → Extract to [Feature][Section].vue            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [CODE_DESIGN_PRINCIPLES.md](../development/CODE_DESIGN_PRINCIPLES.md) | Component size limits, three-layer separation |
| [profile-refactor-architecture-deep-dive.md](../development/profile-refactor-architecture-deep-dive.md) | Detailed analysis of profile page refactor |
| [component-library.md](../components/component-library.md) | UI component conventions |
| [composable-patterns.md](composable-patterns.md) | Catalog of composable patterns |

---

**Last Updated:** 2026-01-25
**Status:** Active - Add new patterns as they emerge
