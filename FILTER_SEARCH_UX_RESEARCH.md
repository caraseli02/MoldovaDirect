# E-Commerce Product Filtering & Search UI - Best Practices Research

**Research Date:** 2025-11-10
**Target Framework:** Vue 3 / Nuxt 3
**Focus:** Actionable patterns for implementation

---

## Executive Summary

Research from Baymard Institute (2025) shows that **58% of desktop sites and 78% of mobile sites have mediocre or worse filtering implementations**. Only **16% of major e-commerce sites provide good filtering experiences**. Users who use filters are **52% more likely to convert** than those who don't.

---

## 1. Modern Filter UI Patterns

### Desktop Layout Patterns

#### A. Vertical Sidebar (Most Common)
**Best for:** Stores with **5+ filter types**

**Specifications:**
- Position: Left side of product grid
- Width: 240-280px typical
- Sticky/Fixed positioning for long product lists
- Collapsible accordion sections after first 5 groups

**Pros:**
- Accommodates many filter types
- Familiar pattern (high discoverability)
- Maintains product grid width consistency

**Implementation Example:**
```vue
<template>
  <div class="flex gap-6">
    <!-- Sidebar Filters -->
    <aside class="w-64 shrink-0 sticky top-4 h-fit">
      <div class="space-y-6">
        <FilterGroup
          v-for="group in filterGroups"
          :key="group.id"
          :group="group"
          :expanded="expandedGroups.includes(group.id)"
        />
      </div>
    </aside>

    <!-- Product Grid -->
    <main class="flex-1">
      <ProductGrid :products="filteredProducts" />
    </main>
  </div>
</template>
```

#### B. Horizontal Toolbar
**Best for:** Stores with **fewer than 5 filter types**

**Specifications:**
- Position: Above product list
- Full-width or centered
- Inline filter dropdowns/menus

**Limitations:**
- Struggles with many filter types
- Limited space for applied filters display
- Not scalable for complex catalogs

#### C. Drawer/Modal (Overlay)
**Best for:** Mobile-first designs, secondary filtering

**Specifications:**
- Triggered by "Filter" button
- Full-screen or partial overlay
- Slide-in from left, right, or bottom
- Includes Apply/Cancel actions

---

### Mobile Filter Patterns (Critical for Mobile-First)

#### Pattern 1: Bottom Drawer (Recommended)
**Why it works:**
- Thumb-friendly reach zone
- Natural swipe-up gesture
- Maintains context with background content visible

**Implementation:**
```vue
<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="isOpen" class="fixed inset-0 z-50">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50"
          @click="close"
        />

        <!-- Drawer -->
        <div class="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
            <h2 class="text-lg font-semibold">Filters</h2>
            <button @click="clearAll">Clear all</button>
          </div>

          <div class="p-4 space-y-6">
            <FilterGroup
              v-for="group in filterGroups"
              :key="group.id"
              :group="group"
            />
          </div>

          <!-- Sticky Apply Button -->
          <div class="sticky bottom-0 bg-white border-t p-4">
            <button class="w-full btn-primary">
              Apply Filters ({{ resultCount }})
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

#### Pattern 2: Filter Button + Side Drawer
**Best for:** Desktop-like experience on mobile

**Specifications:**
- Single "Filter" button (top-right typical)
- Side drawer slides from left or right
- Maintains connection between filter UI and results

#### Pattern 3: Horizontal Scrolling Quick Filters
**Best for:** Primary filters with modal fallback

**Specifications:**
- Horizontal scrollable list of filter chips
- Quick access to most-used filters
- "More Filters" button opens full modal

**Implementation:**
```vue
<template>
  <div class="flex gap-2 overflow-x-auto pb-2 px-4 hide-scrollbar">
    <button
      v-for="filter in quickFilters"
      :key="filter.id"
      class="px-4 py-2 rounded-full whitespace-nowrap"
      :class="filter.active ? 'bg-primary text-white' : 'bg-gray-100'"
    >
      {{ filter.label }}
    </button>
    <button class="px-4 py-2 rounded-full bg-gray-100">
      All Filters
    </button>
  </div>
</template>
```

---

## 2. Search Bar UX Best Practices

### Placement & Visibility

**Golden Rule:** Place at the **top of the website** where users expect it.

**Desktop:**
- Top navigation (centered or right-aligned)
- Width: 300-400px minimum when focused
- Always visible (sticky header)

**Mobile:**
- Top-right corner (most expected location)
- Icon that expands to full-width input
- Visible from any page

### Search Input Design

```vue
<template>
  <div class="relative">
    <!-- Search Input -->
    <div class="relative">
      <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search products..."
        class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2"
        @input="handleSearch"
        @focus="showSuggestions = true"
      />
      <button
        v-if="searchQuery"
        class="absolute right-3 top-1/2 -translate-y-1/2"
        @click="clearSearch"
      >
        <XIcon class="text-gray-400" />
      </button>
    </div>

    <!-- Autocomplete Suggestions -->
    <div
      v-if="showSuggestions && suggestions.length"
      class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto z-50"
    >
      <ul>
        <li
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="px-4 py-2 hover:bg-gray-50 cursor-pointer"
          @click="selectSuggestion(suggestion)"
        >
          <span v-html="highlightMatch(suggestion.text, searchQuery)" />
        </li>
      </ul>
    </div>
  </div>
</template>
```

### Autocomplete Suggestions Best Practices

**Display Immediately:**
- Show suggestions as user types (after 2-3 characters)
- Display frequently used or most relevant options first
- Don't wait too long or users won't discover autocomplete

**Optimal Count:**
- **Desktop:** Max 10 suggestions (prevents choice paralysis)
- **Mobile:** Max 8 suggestions (fits viewport without scroll)

**Visual Design:**
- **Bold** matching search terms in results
- Clear visual differentiation between typed and suggested content
- Adequate spacing between items (44px minimum touch target on mobile)

**Keyboard Navigation:**
- Up/Down arrows to navigate list
- Enter to submit selected suggestion
- Escape to close suggestions
- Highlight selected item visually
- Announce to screen readers (ARIA)

**Mobile-Specific:**
- Larger font size (16px minimum to prevent zoom)
- Larger touch targets (44x44px minimum)
- Fewer suggestions to fit viewport

---

## 3. Active Filter Chips/Tags Pattern

### Visual Design Specifications

**Material Design 3 Guidelines:**
- Use chips to display active filters
- Include checkmark icon when selected
- "X" icon for removal (right side)
- Text: Succinct (ideally 1-2 words)

**Layout:**
```vue
<template>
  <div class="flex flex-wrap gap-2 mb-4">
    <!-- Active Filter Chips -->
    <button
      v-for="filter in activeFilters"
      :key="filter.id"
      class="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors"
      @click="removeFilter(filter.id)"
    >
      <CheckIcon class="w-4 h-4" />
      <span>{{ filter.label }}</span>
      <XIcon class="w-4 h-4 ml-1" />
    </button>

    <!-- Clear All Button -->
    <button
      v-if="activeFilters.length > 1"
      class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
      @click="clearAll"
    >
      Clear all
    </button>
  </div>
</template>
```

### Placement Best Practices

**Primary Location:** Above product results (most visible)

**Secondary Location:** Within filter panel

**Alternative:** Sticky bar that follows scroll

### Removal Methods

1. **Individual removal:** Click X icon on chip
2. **Bulk removal:** "Clear all" button
3. **Re-toggle:** Click same filter in panel

### Visual States

- **Active:** Colored background, checkmark icon
- **Hover:** Slightly darker background
- **Focus:** Visible focus ring (accessibility)

---

## 4. Mobile-First Filter Design

### Key Principles

**1. Touch-Friendly Elements**
- Minimum touch target: **44x44px** (WCAG 2.1 AAA)
- Generous spacing between interactive elements
- Large checkboxes and radio buttons

**2. Progressive Disclosure**
- Collapse filter groups by default (except first 1-2)
- "Show more" for long value lists
- Expandable sections to prevent scroll fatigue

**3. Thumb-Friendly Positioning**
- Bottom sheets for modal filters
- Apply button at bottom (always visible/sticky)
- Primary actions in easy-reach zones

**4. Minimal Scrolling**
- Truncate filter lists to 10 items with "View more"
- Sticky section headers
- Collapse after first 5 groups

### Mobile Filter Component Pattern

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface FilterGroup {
  id: string
  label: string
  type: 'checkbox' | 'radio' | 'range' | 'color'
  values: FilterValue[]
  expanded?: boolean
}

interface FilterValue {
  id: string
  label: string
  count: number
  selected: boolean
}

const props = defineProps<{
  groups: FilterGroup[]
}>()

const emit = defineEmits<{
  apply: [filters: Record<string, any>]
  close: []
}>()

const expandedGroups = ref<Set<string>>(new Set([props.groups[0]?.id]))
const localFilters = ref<Record<string, any>>({})

const resultCount = computed(() => {
  // Calculate based on localFilters
  return 0 // placeholder
})

const toggleGroup = (groupId: string) => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId)
  } else {
    expandedGroups.value.add(groupId)
  }
}

const applyFilters = () => {
  emit('apply', localFilters.value)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <header class="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
      <h2 class="text-lg font-semibold">Filters</h2>
      <button class="text-sm text-primary-600" @click="$emit('close')">
        Done
      </button>
    </header>

    <!-- Filter Groups -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="group in groups"
        :key="group.id"
        class="border-b"
      >
        <!-- Group Header (Collapsible) -->
        <button
          class="w-full px-4 py-4 flex items-center justify-between text-left"
          @click="toggleGroup(group.id)"
        >
          <span class="font-medium">{{ group.label }}</span>
          <ChevronIcon
            class="w-5 h-5 transition-transform"
            :class="{ 'rotate-180': expandedGroups.has(group.id) }"
          />
        </button>

        <!-- Group Values (Expanded) -->
        <div
          v-if="expandedGroups.has(group.id)"
          class="px-4 pb-4 space-y-3"
        >
          <!-- Checkbox Type -->
          <label
            v-if="group.type === 'checkbox'"
            v-for="value in group.values"
            :key="value.id"
            class="flex items-center gap-3 min-h-[44px]"
          >
            <input
              type="checkbox"
              :value="value.id"
              v-model="localFilters[group.id]"
              class="w-5 h-5 rounded border-gray-300"
            />
            <span class="flex-1">{{ value.label }}</span>
            <span class="text-sm text-gray-500">({{ value.count }})</span>
          </label>

          <!-- Add other filter types: radio, range, color -->
        </div>
      </div>
    </div>

    <!-- Sticky Apply Button -->
    <footer class="sticky bottom-0 bg-white border-t p-4 safe-area-pb">
      <button
        class="w-full py-3 bg-primary-600 text-white rounded-lg font-medium min-h-[44px]"
        @click="applyFilters"
      >
        Show {{ resultCount }} results
      </button>
    </footer>
  </div>
</template>
```

---

## 5. Accessibility for Filters (WCAG 2.1 AA)

### Keyboard Navigation Requirements

**WCAG 2.1.1 - Keyboard Accessible:**
- All filter controls operable via keyboard
- No keyboard traps
- Logical tab order

**WCAG 2.4.7 - Focus Visible:**
- Clear focus indicators on all interactive elements
- Minimum 2px outline, high contrast color

**WCAG 2.4.3 - Focus Order:**
- Tab order follows visual layout
- Filter groups → Individual filters → Apply/Clear buttons

### ARIA Implementation

```vue
<template>
  <!-- Filter Group -->
  <div
    role="group"
    :aria-labelledby="`filter-group-${group.id}`"
  >
    <h3 :id="`filter-group-${group.id}`">
      {{ group.label }}
    </h3>

    <!-- Checkbox Filters -->
    <div role="group" aria-label="Filter options">
      <label v-for="option in group.options">
        <input
          type="checkbox"
          :id="`filter-${option.id}`"
          :aria-label="`Filter by ${option.label}`"
          :aria-describedby="`filter-count-${option.id}`"
        />
        <span>{{ option.label }}</span>
        <span :id="`filter-count-${option.id}`">({{ option.count }})</span>
      </label>
    </div>
  </div>

  <!-- Active Filters (Live Region) -->
  <div
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  >
    {{ activeFilters.length }} filters active
  </div>

  <!-- Filter Chips -->
  <button
    v-for="filter in activeFilters"
    :aria-label="`Remove ${filter.label} filter`"
    @click="removeFilter(filter)"
  >
    {{ filter.label }}
    <XIcon aria-hidden="true" />
  </button>
</template>
```

### Color Contrast Requirements

**WCAG 1.4.3 - Contrast (Minimum):**
- Text: Minimum 4.5:1 contrast ratio
- Large text (18pt+): Minimum 3:1
- UI components: Minimum 3:1

**Implementation:**
```css
/* Good contrast examples */
.filter-chip-active {
  background: #2563eb; /* Primary 600 */
  color: #ffffff; /* White - 9.1:1 ratio */
}

.filter-chip-inactive {
  background: #f3f4f6; /* Gray 100 */
  color: #111827; /* Gray 900 - 16.4:1 ratio */
}
```

### Screen Reader Support

**Labels:**
- Every form control has associated label
- Use `aria-label` or `aria-labelledby`

**State Announcements:**
- Use `aria-live="polite"` for filter count updates
- Announce applied/removed filters

**Hidden Elements:**
- Use `aria-hidden="true"` for decorative icons
- Provide `sr-only` text alternatives

### Touch Target Size

**WCAG 2.5.5 - Target Size (Enhanced - AAA):**
- Minimum: 44x44px
- Applies to all clickable elements
- Adequate spacing between targets

---

## 6. Performance Considerations

### Debouncing & Throttling

**Use Cases:**

| Interaction | Technique | Delay | Reason |
|-------------|-----------|-------|--------|
| Search input | Debounce | 300-500ms | Wait for user to finish typing |
| Range slider | Throttle | 100-200ms | Limit rapid updates |
| Scroll events | Throttle | 100-150ms | Prevent excessive calculations |
| Window resize | Debounce | 150-250ms | Wait for resize to complete |

**VueUse Implementation:**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

const searchQuery = ref('')
const priceRange = ref([0, 1000])

// Debounced search
const debouncedSearch = useDebounceFn((query: string) => {
  performSearch(query)
}, 300)

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})

// Throttled range slider
const throttledRangeUpdate = useThrottleFn((range: number[]) => {
  updatePriceFilter(range)
}, 100)

watch(priceRange, (newRange) => {
  throttledRangeUpdate(newRange)
})
</script>
```

### Lazy Loading Strategies

**1. Virtual Scrolling for Long Filter Lists**

```vue
<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'

const { list, containerProps, wrapperProps } = useVirtualList(
  filterOptions,
  {
    itemHeight: 44, // Fixed height for calculations
    overscan: 5, // Render extra items for smooth scrolling
  }
)
</script>

<template>
  <div v-bind="containerProps" class="max-h-96 overflow-auto">
    <div v-bind="wrapperProps">
      <div
        v-for="{ data, index } in list"
        :key="index"
        class="h-11 flex items-center"
      >
        <label>
          <input type="checkbox" :value="data.id" />
          {{ data.label }}
        </label>
      </div>
    </div>
  </div>
</template>
```

**2. Progressive Filter Loading**

Only load filter options when:
- Filter group is expanded
- User scrolls to filter section
- User interacts with filter panel

```vue
<script setup lang="ts">
import { ref } from 'vue'

const filterData = ref<Record<string, any>>({})
const loadingFilters = ref<Set<string>>(new Set())

const loadFilterOptions = async (groupId: string) => {
  if (filterData.value[groupId] || loadingFilters.value.has(groupId)) {
    return
  }

  loadingFilters.value.add(groupId)

  try {
    const data = await fetchFilterOptions(groupId)
    filterData.value[groupId] = data
  } finally {
    loadingFilters.value.delete(groupId)
  }
}

const onGroupExpand = (groupId: string) => {
  loadFilterOptions(groupId)
}
</script>
```

### Optimistic UI Updates

Update UI immediately, sync with server in background:

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const activeFilters = ref<Set<string>>(new Set())
const optimisticFilters = ref<Set<string>>(new Set())

const toggleFilter = async (filterId: string) => {
  // Immediate UI update
  if (optimisticFilters.value.has(filterId)) {
    optimisticFilters.value.delete(filterId)
  } else {
    optimisticFilters.value.add(filterId)
  }

  // Background sync
  try {
    await applyFilterToServer(filterId)
    // Sync with actual state
    activeFilters.value = new Set(optimisticFilters.value)
  } catch (error) {
    // Rollback on error
    optimisticFilters.value = new Set(activeFilters.value)
    showError('Failed to apply filter')
  }
}
</script>
```

### Caching Strategies

```typescript
// Composable for filter data with caching
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'

export function useFilterCache(cacheKey: string) {
  const cache = useStorage(cacheKey, {
    data: null,
    timestamp: 0,
  })

  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const isCacheValid = computed(() => {
    return Date.now() - cache.value.timestamp < CACHE_DURATION
  })

  const getCachedData = () => {
    if (isCacheValid.value) {
      return cache.value.data
    }
    return null
  }

  const setCachedData = (data: any) => {
    cache.value = {
      data,
      timestamp: Date.now(),
    }
  }

  return {
    getCachedData,
    setCachedData,
    isCacheValid,
  }
}
```

### Bundle Size Optimization

```typescript
// Lazy load filter components
const FilterDrawer = defineAsyncComponent(() =>
  import('./components/FilterDrawer.vue')
)

const AdvancedFilters = defineAsyncComponent(() =>
  import('./components/AdvancedFilters.vue')
)
```

---

## 7. Vue 3/Nuxt 3 Filter Component Patterns

### Composable-Based Filter Management

```typescript
// composables/useProductFilters.ts
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { Product, FilterState, FilterGroup } from '~/types'

export function useProductFilters(products: Ref<Product[]>) {
  // Filter state
  const filters = ref<FilterState>({
    search: '',
    categories: [],
    priceRange: [0, 1000],
    brands: [],
    inStock: false,
    sortBy: 'relevance',
  })

  // UI state
  const isFilterDrawerOpen = ref(false)
  const expandedGroups = ref<Set<string>>(new Set(['categories']))

  // Filtered products (computed)
  const filteredProducts = computed(() => {
    let results = [...products.value]

    // Search filter
    if (filters.value.search) {
      const query = filters.value.search.toLowerCase()
      results = results.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (filters.value.categories.length > 0) {
      results = results.filter(p =>
        filters.value.categories.includes(p.category)
      )
    }

    // Price range filter
    results = results.filter(p =>
      p.price >= filters.value.priceRange[0] &&
      p.price <= filters.value.priceRange[1]
    )

    // Brand filter
    if (filters.value.brands.length > 0) {
      results = results.filter(p =>
        filters.value.brands.includes(p.brand)
      )
    }

    // Stock filter
    if (filters.value.inStock) {
      results = results.filter(p => p.stock > 0)
    }

    // Sorting
    switch (filters.value.sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        results.sort((a, b) => b.price - a.price)
        break
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return results
  })

  // Active filter chips
  const activeFilterChips = computed(() => {
    const chips: Array<{ id: string; label: string; type: string }> = []

    if (filters.value.search) {
      chips.push({
        id: 'search',
        label: `Search: ${filters.value.search}`,
        type: 'search',
      })
    }

    filters.value.categories.forEach(cat => {
      chips.push({
        id: `category-${cat}`,
        label: cat,
        type: 'category',
      })
    })

    filters.value.brands.forEach(brand => {
      chips.push({
        id: `brand-${brand}`,
        label: brand,
        type: 'brand',
      })
    })

    if (filters.value.inStock) {
      chips.push({
        id: 'inStock',
        label: 'In Stock',
        type: 'stock',
      })
    }

    return chips
  })

  // Available filter options (with counts)
  const availableFilters = computed<FilterGroup[]>(() => {
    const allProducts = products.value

    // Calculate counts for each filter option
    const categoryCounts = new Map<string, number>()
    const brandCounts = new Map<string, number>()

    allProducts.forEach(product => {
      categoryCounts.set(
        product.category,
        (categoryCounts.get(product.category) || 0) + 1
      )
      brandCounts.set(
        product.brand,
        (brandCounts.get(product.brand) || 0) + 1
      )
    })

    return [
      {
        id: 'categories',
        label: 'Categories',
        type: 'checkbox',
        values: Array.from(categoryCounts.entries()).map(([cat, count]) => ({
          id: cat,
          label: cat,
          count,
          selected: filters.value.categories.includes(cat),
        })),
      },
      {
        id: 'brands',
        label: 'Brands',
        type: 'checkbox',
        values: Array.from(brandCounts.entries()).map(([brand, count]) => ({
          id: brand,
          label: brand,
          count,
          selected: filters.value.brands.includes(brand),
        })),
      },
      {
        id: 'price',
        label: 'Price Range',
        type: 'range',
        min: 0,
        max: Math.max(...allProducts.map(p => p.price)),
        value: filters.value.priceRange,
      },
      {
        id: 'stock',
        label: 'Availability',
        type: 'toggle',
        value: filters.value.inStock,
      },
    ]
  })

  // Methods
  const updateFilter = (key: keyof FilterState, value: any) => {
    filters.value[key] = value
  }

  const removeFilter = (chipId: string) => {
    if (chipId === 'search') {
      filters.value.search = ''
    } else if (chipId === 'inStock') {
      filters.value.inStock = false
    } else if (chipId.startsWith('category-')) {
      const cat = chipId.replace('category-', '')
      filters.value.categories = filters.value.categories.filter(c => c !== cat)
    } else if (chipId.startsWith('brand-')) {
      const brand = chipId.replace('brand-', '')
      filters.value.brands = filters.value.brands.filter(b => b !== brand)
    }
  }

  const clearAllFilters = () => {
    filters.value = {
      search: '',
      categories: [],
      priceRange: [0, 1000],
      brands: [],
      inStock: false,
      sortBy: 'relevance',
    }
  }

  const toggleGroup = (groupId: string) => {
    if (expandedGroups.value.has(groupId)) {
      expandedGroups.value.delete(groupId)
    } else {
      expandedGroups.value.add(groupId)
    }
  }

  // Persist filters to URL
  const syncFiltersToURL = useDebounceFn(() => {
    const params = new URLSearchParams()

    if (filters.value.search) {
      params.set('q', filters.value.search)
    }
    if (filters.value.categories.length > 0) {
      params.set('categories', filters.value.categories.join(','))
    }
    if (filters.value.brands.length > 0) {
      params.set('brands', filters.value.brands.join(','))
    }
    if (filters.value.inStock) {
      params.set('inStock', '1')
    }

    const newURL = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newURL)
  }, 500)

  watch(filters, () => {
    syncFiltersToURL()
  }, { deep: true })

  return {
    // State
    filters,
    isFilterDrawerOpen,
    expandedGroups,

    // Computed
    filteredProducts,
    activeFilterChips,
    availableFilters,

    // Methods
    updateFilter,
    removeFilter,
    clearAllFilters,
    toggleGroup,
  }
}
```

### Filter Component Architecture

```
components/
├── filters/
│   ├── FilterBar.vue              # Main filter bar container
│   ├── FilterDrawer.vue           # Mobile drawer/modal
│   ├── FilterSidebar.vue          # Desktop sidebar
│   ├── FilterGroup.vue            # Individual filter group
│   ├── FilterChips.vue            # Active filter chips
│   ├── types/
│   │   ├── CheckboxFilter.vue     # Multi-select checkboxes
│   │   ├── RadioFilter.vue        # Single-select radio
│   │   ├── RangeFilter.vue        # Price/numeric range
│   │   ├── ColorFilter.vue        # Color swatch selector
│   │   └── ToggleFilter.vue       # On/off toggle
│   └── SearchBar.vue              # Search input with autocomplete
```

### Complete Filter Component Example

```vue
<!-- components/filters/FilterDrawer.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { FilterGroup } from '~/types'

interface Props {
  isOpen: boolean
  filterGroups: FilterGroup[]
  expandedGroups: Set<string>
  resultCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  apply: []
  clearAll: []
  toggleGroup: [groupId: string]
  updateFilter: [groupId: string, value: any]
}>()

// Prevent body scroll when drawer is open
watchEffect(() => {
  if (props.isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex flex-col bg-white md:hidden"
      >
        <!-- Header -->
        <header class="flex items-center justify-between border-b px-4 py-4">
          <h2 class="text-lg font-semibold">Filters</h2>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="text-sm font-medium text-primary-600"
              @click="emit('clearAll')"
            >
              Clear all
            </button>
            <button
              type="button"
              class="p-2 hover:bg-gray-100 rounded-lg"
              @click="emit('close')"
            >
              <XIcon class="w-5 h-5" />
            </button>
          </div>
        </header>

        <!-- Filter Groups -->
        <div class="flex-1 overflow-y-auto">
          <FilterGroup
            v-for="group in filterGroups"
            :key="group.id"
            :group="group"
            :expanded="expandedGroups.has(group.id)"
            @toggle="emit('toggleGroup', group.id)"
            @update="(value) => emit('updateFilter', group.id, value)"
          />
        </div>

        <!-- Apply Button (Sticky) -->
        <footer class="border-t bg-white p-4 safe-area-pb">
          <button
            type="button"
            class="w-full rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-700 min-h-[44px]"
            @click="emit('apply')"
          >
            Show {{ resultCount }} results
          </button>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>
```

---

## 8. Real-World Examples & Patterns

### Shopify Storefront Filtering Guidelines

**Official Recommendations:**
1. Use horizontal toolbar for <5 filters
2. Use vertical sidebar for 5+ filters
3. Always show result counts per filter value
4. Disable filters with zero results
5. Display applied filters overview
6. Progressive enhancement (work without JS)

### PrimeVue Filter Patterns

**DataTable Filter Menu:**
- Menu mode: Filters in overlay popover
- Row mode: Filters in header row
- Custom filter templates with `filterModel` and `filterCallback`

**DataView Component:**
- Grid/list layout toggle
- Built-in pagination
- Custom item templates

### Material Design 3 Filter Chips

**Specifications:**
- Selected state: Checkmark icon (leading)
- Removal: X icon (trailing)
- Keep text concise (1-2 words)
- Clear visual distinction between states

---

## 9. Implementation Checklist

### Must Have (Priority 1)

- [ ] Responsive filter layout (sidebar desktop, drawer mobile)
- [ ] Search bar with clear/reset functionality
- [ ] Basic filter types: categories, price range, availability
- [ ] Active filter chips with individual removal
- [ ] "Clear all" functionality
- [ ] Result count display
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] ARIA labels on all interactive elements
- [ ] Minimum 44x44px touch targets (mobile)
- [ ] Focus visible indicators
- [ ] Debounced search input (300ms)

### Recommended (Priority 2)

- [ ] Autocomplete suggestions (max 10 items)
- [ ] Filter result counts
- [ ] Collapsible filter groups
- [ ] Sticky filter bar on scroll
- [ ] URL parameter sync
- [ ] Loading states
- [ ] Empty state handling
- [ ] Optimistic UI updates
- [ ] Filter presets/saved searches
- [ ] Sort options

### Nice to Have (Priority 3)

- [ ] Voice search
- [ ] AI-powered smart filters
- [ ] Virtual scrolling for long lists
- [ ] Filter history
- [ ] Recommended filters
- [ ] Color swatch filters
- [ ] Image-based filtering
- [ ] Multi-language support
- [ ] Advanced filter operators (AND/OR)
- [ ] Filter analytics tracking

---

## 10. Testing Checklist

### Functional Testing

- [ ] All filter combinations work correctly
- [ ] URL parameters sync properly
- [ ] Page refresh preserves filters
- [ ] Clear all removes all filters
- [ ] Individual chip removal works
- [ ] Search autocomplete displays correctly
- [ ] Filter counts are accurate
- [ ] Zero-result filters are disabled

### Accessibility Testing

- [ ] Keyboard-only navigation works
- [ ] Screen reader announces filter changes
- [ ] Focus order is logical
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Touch targets meet minimum size (44px)
- [ ] ARIA labels are descriptive
- [ ] Live regions announce updates

### Performance Testing

- [ ] Initial load time <2s
- [ ] Filter interactions <100ms
- [ ] Search debounce working (300ms)
- [ ] No layout shifts when opening filters
- [ ] Smooth animations (60fps)
- [ ] Virtual scrolling for 1000+ items

### Mobile Testing

- [ ] Drawer opens smoothly
- [ ] Touch targets are adequate
- [ ] Horizontal scrolling works
- [ ] Bottom drawer thumb-friendly
- [ ] Apply button always visible
- [ ] No horizontal overflow

### Browser Testing

- [ ] Chrome/Edge (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Mobile Safari (iOS 15+)
- [ ] Chrome Mobile (Android 10+)

---

## 11. Key Takeaways

### Critical Success Factors

1. **Mobile-First is Essential:** 78% of mobile sites have poor filtering - prioritize mobile UX
2. **Performance Matters:** Debounce inputs, throttle sliders, lazy load options
3. **Accessibility is Non-Negotiable:** Keyboard nav, ARIA labels, contrast ratios
4. **Show, Don't Hide:** Display result counts, disable zero-result filters
5. **Make Removal Easy:** Clear chips, "Clear all" button, intuitive deselection
6. **Progressive Disclosure:** Collapse groups, truncate long lists, expand on demand
7. **User Language:** Use customer terminology, not technical jargon
8. **Context Preservation:** URL sync, page refresh persistence, browser back support

### Common Mistakes to Avoid

1. **No Result Counts:** Users need to know impact before applying filters
2. **Hidden Zero-Result Filters:** Don't show filters that return no results
3. **Too Many Visible Options:** Truncate lists to 10 items with "Show more"
4. **Poor Mobile Touch Targets:** Minimum 44x44px for all interactive elements
5. **Missing "Clear All":** Always provide easy way to reset
6. **No Keyboard Support:** All interactions must work via keyboard
7. **Overwhelming Users:** Start with most important filters, progressive disclosure
8. **Ignoring URL State:** Users expect back button and refresh to work

### Performance Benchmarks

- **Filter Interaction Response:** <100ms
- **Search Debounce Delay:** 300-500ms
- **Slider Throttle:** 100-200ms
- **Initial Load:** <2s for filter options
- **Autocomplete Display:** <50ms after debounce

---

## 12. Resources & References

### Official Documentation

- **Baymard Institute:** Product List & Filtering UX Research
  - https://baymard.com/research/ecommerce-product-lists
- **Shopify:** Storefront Filtering UX Guidelines
  - https://shopify.dev/docs/storefronts/themes/navigation-search/filtering
- **Material Design 3:** Filter Chips Guidelines
  - https://m3.material.io/components/chips/guidelines
- **WCAG 2.1:** Web Content Accessibility Guidelines
  - https://www.w3.org/TR/WCAG21/

### Component Libraries

- **PrimeVue:** DataTable & DataView
  - https://primevue.org/datatable
  - https://primevue.org/dataview
- **Tailwind UI:** E-commerce Components
  - https://tailwindcss.com/plus/ui-blocks/ecommerce
- **VueUse:** Utility Composables
  - https://vueuse.org

### Articles & Guides

- **Pencil & Paper:** Mobile Filter UX Patterns
- **The Good:** 25 E-commerce Filter Best Practices
- **Algolia:** Search Filter UX Best Practices

### Tools

- **VueUse:** `useDebounceFn`, `useThrottleFn`, `useVirtualList`
- **Chrome DevTools:** Accessibility audit, performance profiling
- **axe DevTools:** WCAG compliance testing
- **WAVE:** Web accessibility evaluation

---

**Last Updated:** 2025-11-10
**Framework Version:** Vue 3.4+ / Nuxt 3.10+
**Standards Compliance:** WCAG 2.1 AA
