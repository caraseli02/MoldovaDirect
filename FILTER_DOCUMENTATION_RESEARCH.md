# Framework Documentation Research for Search/Filter Pages

**Project Context**: Moldova Direct - Nuxt 3 E-commerce Application
**Research Date**: 2025-11-10
**Purpose**: Comprehensive documentation for implementing modern search/filter functionality

---

## Table of Contents

1. [Project Dependencies](#project-dependencies)
2. [Nuxt 3 Data Fetching](#nuxt-3-data-fetching)
3. [Vue 3 Composition API Patterns](#vue-3-composition-api-patterns)
4. [shadcn-vue Components](#shadcn-vue-components)
5. [VueUse Composables](#vueuse-composables)
6. [Tailwind CSS Patterns](#tailwind-css-patterns)
7. [Accessibility Best Practices](#accessibility-best-practices)
8. [Implementation Recommendations](#implementation-recommendations)

---

## Project Dependencies

Current versions in use:

```json
{
  "nuxt": "^3.17.7",
  "vue": "^3.5.18",
  "@vueuse/core": "^13.9.0",
  "shadcn-nuxt": "^2.2.0",
  "tailwindcss": "^4.1.12",
  "@pinia/nuxt": "^0.11.2",
  "pinia": "^3.0.4"
}
```

**Existing Implementation**: The project already has:
- `/stores/search.ts` - Pinia store with search logic, caching, and history
- `/components/product/SearchBar.vue` - Search UI component
- `/components/product/ActiveFilters.vue` - Filter chips display

---

## Nuxt 3 Data Fetching

### Official Documentation
- **Primary Source**: https://nuxt.com/docs/3.x/getting-started/data-fetching
- **Comprehensive Guide**: https://mokkapps.de/blog/a-comprehensive-guide-to-data-fetching-in-nuxt-3

### Core Composables

#### 1. useFetch
**Best for**: Simple API calls with automatic SSR handling

```typescript
// Basic usage
const { data, status, error, refresh } = useFetch('/api/products')

// With reactive query parameters
const searchQuery = ref('')
const category = ref('')

const { data: products } = useFetch('/api/products', {
  query: {
    q: searchQuery,
    category: category
  }
})
// Automatically refetches when searchQuery or category changes
```

**Key Options**:
- `lazy: true` - Non-blocking navigation, prevents loading delays
- `server: false` - Client-side only fetching
- `immediate: false` - Manual trigger control
- `watch: false` - Disable automatic refetch on param changes
- `pick: ['id', 'name']` - Minimize payload, only select needed fields

#### 2. useAsyncData
**Best for**: Complex logic, multiple data sources, or non-HTTP operations

```typescript
// Custom query logic
const { data } = useAsyncData('products', async () => {
  const products = await $fetch('/api/products')
  const categories = await $fetch('/api/categories')

  return {
    products,
    categories,
    combined: mergeData(products, categories)
  }
})
```

#### 3. $fetch
**Best for**: Client-side event handlers (don't use in setup)

```typescript
// In event handler only
async function handleSearch() {
  const results = await $fetch('/api/search', {
    method: 'POST',
    body: { query: searchQuery.value }
  })
}
```

### Search/Filter Page Patterns

#### Pattern 1: Lazy Loading with Query Params
```typescript
const filters = ref({
  category: '',
  priceMin: 0,
  priceMax: 1000,
  sortBy: 'name'
})

const { data: products, status, refresh } = useFetch('/api/products', {
  lazy: true,  // Non-blocking navigation
  query: filters,  // Reactive - auto-refetches on change
  pick: ['id', 'name', 'price', 'image']  // Minimize payload
})
```

#### Pattern 2: Debounced Search
```typescript
import { useDebounceFn } from '@vueuse/core'

const searchQuery = ref('')
const { data: results } = useFetch('/api/search', {
  query: { q: searchQuery },
  immediate: false,  // Manual control
  watch: false  // Disable auto-refetch
})

// Debounced search trigger
const debouncedSearch = useDebounceFn(() => {
  refresh()
}, 300)

watch(searchQuery, () => {
  debouncedSearch()
})
```

#### Pattern 3: Cache with Key Management
```typescript
// Unique key prevents duplicate requests across components
const { data } = useFetch(`/api/products/${category.value}`, {
  key: `products-${category.value}`,
  getCachedData(key) {
    return useNuxtApp().payload.data[key] ||
           useNuxtApp().static.data[key]
  }
})
```

### Performance Optimization Techniques

1. **Minimize Payload**:
   ```typescript
   const { data } = useFetch('/api/products', {
     pick: ['id', 'name', 'price']  // Only needed fields
   })
   ```

2. **Deduplicate Requests**:
   ```typescript
   const { data } = useFetch('/api/products', {
     key: 'products-list',  // Same key = single request
     dedupe: 'defer'  // Wait for pending request
   })
   ```

3. **Transform Response**:
   ```typescript
   const { data } = useFetch('/api/products', {
     transform: (products) => {
       return products.map(p => ({
         ...p,
         formattedPrice: `$${p.price.toFixed(2)}`
       }))
     }
   })
   ```

### Status States
```typescript
const { status, data } = useFetch('/api/products')

// status can be: 'idle' | 'pending' | 'success' | 'error'

const isLoading = computed(() => status.value === 'pending')
const hasError = computed(() => status.value === 'error')
```

---

## Vue 3 Composition API Patterns

### Official Documentation
- **Core API**: https://vuejs.org/api/reactivity-core.html
- **Reactivity Guide**: https://vuejs.org/guide/reactivity-computed-watchers.html
- **Composition API FAQ**: https://vuejs.org/guide/extras/composition-api-faq.html

### Reactivity Fundamentals

#### ref() vs reactive()

**ref()** - For primitives and single values:
```typescript
const searchQuery = ref('')
const count = ref(0)
const isActive = ref(false)

// Access with .value
searchQuery.value = 'wine'
console.log(count.value) // 0
```

**reactive()** - For objects and collections:
```typescript
const filters = reactive({
  category: '',
  priceRange: [0, 100],
  sortBy: 'name',
  inStock: true
})

// Direct property access (no .value)
filters.category = 'wine'
console.log(filters.priceRange) // [0, 100]
```

**Best Practice**: Use `ref()` for form inputs and simple state, `reactive()` for complex filter objects.

#### computed()
Derived state with automatic dependency tracking:

```typescript
const filters = reactive({
  category: '',
  priceMin: 0,
  priceMax: 1000,
  inStock: false
})

// Read-only computed
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.category) count++
  if (filters.priceMin > 0 || filters.priceMax < 1000) count++
  if (filters.inStock) count++
  return count
})

// Writable computed
const priceRange = computed({
  get: () => [filters.priceMin, filters.priceMax],
  set: ([min, max]) => {
    filters.priceMin = min
    filters.priceMax = max
  }
})
```

#### watch() and watchEffect()

**watch()** - Explicit source tracking:
```typescript
// Watch single source
watch(searchQuery, (newVal, oldVal) => {
  console.log(`Search changed from ${oldVal} to ${newVal}`)
})

// Watch multiple sources
watch([category, sortBy], ([newCat, newSort]) => {
  fetchProducts(newCat, newSort)
})

// With options
watch(filters, async (newFilters) => {
  await applyFilters(newFilters)
}, {
  deep: true,  // Watch nested properties
  immediate: true  // Run on mount
})
```

**watchEffect()** - Automatic dependency tracking:
```typescript
watchEffect(() => {
  // Automatically tracks all reactive dependencies
  console.log(`Category: ${filters.category}, Sort: ${filters.sortBy}`)
})
```

### Filter State Management Patterns

#### Pattern 1: Simple Filter State
```typescript
<script setup lang="ts">
interface FilterState {
  search: string
  category: string
  sortBy: string
  page: number
}

const filters = reactive<FilterState>({
  search: '',
  category: '',
  sortBy: 'name',
  page: 1
})

const activeFilters = computed(() => {
  return Object.entries(filters)
    .filter(([key, value]) => value && key !== 'page')
    .map(([key, value]) => ({ key, value }))
})

function clearFilters() {
  filters.search = ''
  filters.category = ''
  filters.sortBy = 'name'
  filters.page = 1
}

function removeFilter(key: keyof FilterState) {
  filters[key] = typeof filters[key] === 'number' ? 1 : ''
}
</script>
```

#### Pattern 2: URL-Synced Filters
```typescript
import { useUrlSearchParams } from '@vueuse/core'

const params = useUrlSearchParams('history')

const filters = reactive({
  category: params.category || '',
  sortBy: params.sortBy || 'name',
  page: Number(params.page) || 1
})

// Sync to URL on change
watch(filters, (newFilters) => {
  params.category = newFilters.category
  params.sortBy = newFilters.sortBy
  params.page = String(newFilters.page)
}, { deep: true })
```

#### Pattern 3: Persistent Filters (localStorage)
```typescript
import { useStorage } from '@vueuse/core'

const filters = useStorage('product-filters', {
  category: '',
  priceRange: [0, 1000],
  sortBy: 'name'
}, localStorage, {
  mergeDefaults: true  // Merge with stored values
})

// Automatically persists on change
// Reloads on page refresh
```

### Custom Composable Pattern

**File**: `/composables/useProductFilters.ts`

```typescript
import { useUrlSearchParams } from '@vueuse/core'
import { useDebounceFn } from '@vueuse/core'

export function useProductFilters() {
  // URL sync
  const params = useUrlSearchParams('history')

  // Filter state
  const filters = reactive({
    search: params.search || '',
    category: params.category || '',
    priceMin: Number(params.priceMin) || 0,
    priceMax: Number(params.priceMax) || 1000,
    sortBy: params.sortBy || 'name',
    inStock: params.inStock === 'true'
  })

  // Computed properties
  const activeFilterCount = computed(() => {
    let count = 0
    if (filters.search) count++
    if (filters.category) count++
    if (filters.priceMin > 0 || filters.priceMax < 1000) count++
    if (filters.inStock) count++
    return count
  })

  const filterChips = computed(() => {
    const chips = []
    if (filters.category) {
      chips.push({ key: 'category', label: filters.category })
    }
    if (filters.inStock) {
      chips.push({ key: 'inStock', label: 'In Stock' })
    }
    return chips
  })

  // Actions
  function clearFilters() {
    filters.search = ''
    filters.category = ''
    filters.priceMin = 0
    filters.priceMax = 1000
    filters.sortBy = 'name'
    filters.inStock = false
  }

  function removeFilter(key: string) {
    if (key === 'category') filters.category = ''
    if (key === 'inStock') filters.inStock = false
  }

  // Sync to URL
  watch(filters, (newFilters) => {
    params.search = newFilters.search
    params.category = newFilters.category
    params.priceMin = String(newFilters.priceMin)
    params.priceMax = String(newFilters.priceMax)
    params.sortBy = newFilters.sortBy
    params.inStock = String(newFilters.inStock)
  }, { deep: true })

  return {
    filters,
    activeFilterCount,
    filterChips,
    clearFilters,
    removeFilter
  }
}
```

### Composable Best Practices

1. **Single Responsibility**: Each composable should do one thing
   - ✅ `useProductFilters()`, `useProductSearch()`, `useProductSort()`
   - ❌ `useProducts()` (too broad)

2. **Stateful vs Stateless**: Decide explicitly
   - Stateful: Maintains internal reactive state
   - Stateless: Pure input/output functions

3. **Context Requirements**: Must be called synchronously
   ```typescript
   // ✅ Correct
   const filters = useProductFilters()

   // ❌ Wrong - async context
   onMounted(async () => {
     const filters = useProductFilters()  // Error!
   })
   ```

4. **Auto-Import**: Place in `/composables` directory
   - Files named `use*.ts` are auto-imported
   - No need for explicit imports

---

## shadcn-vue Components

### Official Documentation
- **Main Site**: https://www.shadcn-vue.com
- **Radix Variant**: https://radix.shadcn-vue.com

### Available Filter Components

#### 1. Popover
**Use Case**: Desktop filter dropdowns, comboboxes

**Installation**:
```bash
pnpm dlx shadcn-vue@latest add popover
```

**Basic Usage**:
```vue
<script setup>
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
</script>

<template>
  <Popover>
    <PopoverTrigger>
      <Button>Filter by Category</Button>
    </PopoverTrigger>
    <PopoverContent class="w-80">
      <!-- Filter controls here -->
      <div class="space-y-4">
        <h4 class="font-medium">Categories</h4>
        <Checkbox v-for="cat in categories" :key="cat" />
      </div>
    </PopoverContent>
  </Popover>
</template>
```

**Filter Pattern**:
```vue
<Popover v-model:open="isPriceFilterOpen">
  <PopoverTrigger>
    <Button variant="outline">
      Price Range
      <Badge v-if="hasPriceFilter">1</Badge>
    </Button>
  </PopoverTrigger>
  <PopoverContent align="start" class="w-[280px]">
    <div class="space-y-4">
      <h4>Price Range</h4>
      <Slider v-model="priceRange" :min="0" :max="1000" />
      <div class="flex justify-between">
        <Input :value="priceRange[0]" type="number" />
        <Input :value="priceRange[1]" type="number" />
      </div>
      <Button @click="applyPriceFilter">Apply</Button>
    </div>
  </PopoverContent>
</Popover>
```

#### 2. Command
**Use Case**: Searchable command palette, filtered selections

**Installation**:
```bash
pnpm dlx shadcn-vue@latest add command
```

**Components**:
- `Command` - Main wrapper
- `CommandInput` - Search field
- `CommandList` - Scrollable results container
- `CommandEmpty` - Empty state
- `CommandGroup` - Grouped items
- `CommandItem` - Individual items
- `CommandSeparator` - Visual divider
- `CommandDialog` - Modal variant

**Search Filter Pattern**:
```vue
<script setup>
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'

const categories = ref([
  { value: 'wine', label: 'Wine' },
  { value: 'cheese', label: 'Cheese' },
  { value: 'honey', label: 'Honey' }
])

const selectedCategory = ref('')
</script>

<template>
  <Command>
    <CommandInput placeholder="Search categories..." />
    <CommandList>
      <CommandEmpty>No categories found.</CommandEmpty>
      <CommandGroup heading="Categories">
        <CommandItem
          v-for="cat in categories"
          :key="cat.value"
          :value="cat.value"
          @select="selectedCategory = cat.value"
        >
          {{ cat.label }}
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
</template>
```

**Responsive Combobox** (Desktop Popover + Mobile Drawer):
```vue
<script setup>
import { useMediaQuery } from '@vueuse/core'

const isDesktop = useMediaQuery('(min-width: 768px)')
const isOpen = ref(false)
</script>

<template>
  <!-- Desktop -->
  <Popover v-if="isDesktop" v-model:open="isOpen">
    <PopoverTrigger>
      <Button>Select Category</Button>
    </PopoverTrigger>
    <PopoverContent>
      <Command>
        <!-- Command content -->
      </Command>
    </PopoverContent>
  </Popover>

  <!-- Mobile -->
  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger>
      <Button>Select Category</Button>
    </DrawerTrigger>
    <DrawerContent>
      <Command>
        <!-- Command content -->
      </Command>
    </DrawerContent>
  </Drawer>
</template>
```

#### 3. Sheet
**Use Case**: Side panel filters (slide-out filter drawer)

**Installation**:
```bash
pnpm dlx shadcn-vue@latest add sheet
```

**Components**:
- `Sheet` - Root wrapper
- `SheetTrigger` - Opens sheet
- `SheetContent` - Content container
- `SheetHeader` - Header section
- `SheetTitle` - Title text
- `SheetDescription` - Description text

**Side Property**: `top`, `right`, `bottom`, `left`

**Filter Panel Pattern**:
```vue
<script setup>
const isFilterOpen = ref(false)
const filters = reactive({
  category: '',
  priceRange: [0, 1000],
  inStock: false
})
</script>

<template>
  <Sheet v-model:open="isFilterOpen">
    <SheetTrigger>
      <Button variant="outline">
        <Icon name="lucide:filter" />
        Filters
        <Badge v-if="activeFilterCount">{{ activeFilterCount }}</Badge>
      </Button>
    </SheetTrigger>

    <SheetContent side="left" class="w-[400px] sm:w-[540px]">
      <SheetHeader>
        <SheetTitle>Filters</SheetTitle>
        <SheetDescription>
          Refine your product search
        </SheetDescription>
      </SheetHeader>

      <div class="space-y-6 py-6">
        <!-- Category filter -->
        <div>
          <Label>Category</Label>
          <Select v-model="filters.category">
            <!-- Options -->
          </Select>
        </div>

        <!-- Price filter -->
        <div>
          <Label>Price Range</Label>
          <Slider v-model="filters.priceRange" />
        </div>

        <!-- In stock toggle -->
        <div class="flex items-center">
          <Checkbox v-model="filters.inStock" id="stock" />
          <Label for="stock">In Stock Only</Label>
        </div>
      </div>

      <div class="flex gap-2">
        <Button @click="applyFilters">Apply Filters</Button>
        <Button variant="outline" @click="clearFilters">Clear</Button>
      </div>
    </SheetContent>
  </Sheet>
</template>
```

#### 4. Drawer
**Use Case**: Mobile-first bottom drawer filters

**Installation**:
```bash
pnpm dlx shadcn-vue@latest add drawer
```

**Built on**: Vaul Vue

**Components**:
- `Drawer` - Root wrapper
- `DrawerTrigger` - Opens drawer
- `DrawerContent` - Content container
- `DrawerHeader` - Header section
- `DrawerTitle` - Title text
- `DrawerDescription` - Description
- `DrawerFooter` - Footer actions
- `DrawerClose` - Close button

**Mobile Filter Pattern**:
```vue
<template>
  <Drawer v-model:open="isOpen">
    <DrawerTrigger>
      <Button>
        <Icon name="lucide:sliders-horizontal" />
        Filters
      </Button>
    </DrawerTrigger>

    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Filter Products</DrawerTitle>
        <DrawerDescription>
          Choose your preferences
        </DrawerDescription>
      </DrawerHeader>

      <div class="px-4 py-6 space-y-4">
        <!-- Filter controls -->
      </div>

      <DrawerFooter>
        <Button @click="applyFilters">Apply</Button>
        <DrawerClose>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
```

**Background Zoom Effect**:
```html
<!-- In app.vue or layout -->
<div vaul-drawer-wrapper id="app">
  <!-- Your app -->
</div>
```

#### 5. Select
**Use Case**: Dropdown filters (sort, single category selection)

**Installation**:
```bash
pnpm dlx shadcn-vue@latest add select
```

**Components**:
- `Select` - Root wrapper
- `SelectTrigger` - Dropdown button
- `SelectValue` - Shows selected value
- `SelectContent` - Dropdown container
- `SelectGroup` - Groups items
- `SelectLabel` - Group label
- `SelectItem` - Individual option

**Sort Filter Pattern**:
```vue
<script setup>
const sortBy = ref('name')
const sortOptions = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' }
]
</script>

<template>
  <Select v-model="sortBy">
    <SelectTrigger class="w-[200px]">
      <SelectValue placeholder="Sort by" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Sort Options</SelectLabel>
        <SelectItem
          v-for="option in sortOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
```

#### 6. Checkbox
**Use Case**: Multi-select filters (multiple categories, features)

**Installation**:
```bash
pnpm dlx shadcn-vue@latest add checkbox
```

**Multi-Select Filter Pattern**:
```vue
<script setup>
const categories = ref(['wine', 'cheese', 'honey'])
const selectedCategories = ref<string[]>([])

function toggleCategory(category: string) {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(category)
  }
}
</script>

<template>
  <div class="space-y-3">
    <Label class="text-base font-semibold">Categories</Label>
    <div
      v-for="cat in categories"
      :key="cat"
      class="flex items-center space-x-2"
    >
      <Checkbox
        :id="`cat-${cat}`"
        :checked="selectedCategories.includes(cat)"
        @update:checked="toggleCategory(cat)"
      />
      <label
        :for="`cat-${cat}`"
        class="text-sm font-medium leading-none cursor-pointer"
      >
        {{ cat }}
      </label>
    </div>
  </div>
</template>
```

#### 7. RadioGroup
**Use Case**: Single-choice filters (shipping method, condition)

**Installation**:
```bash
pnpm dlx shadcn-vue@latest add radio-group
```

**Single Choice Filter Pattern**:
```vue
<script setup>
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const condition = ref('all')
const options = [
  { value: 'all', label: 'All Products' },
  { value: 'new', label: 'New Only' },
  { value: 'sale', label: 'On Sale' }
]
</script>

<template>
  <RadioGroup v-model="condition" class="space-y-2">
    <div
      v-for="option in options"
      :key="option.value"
      class="flex items-center space-x-2"
    >
      <RadioGroupItem :id="option.value" :value="option.value" />
      <Label :for="option.value">{{ option.label }}</Label>
    </div>
  </RadioGroup>
</template>
```

---

## VueUse Composables

### Official Documentation
- **Main Site**: https://vueuse.org
- **GitHub**: https://github.com/vueuse/vueuse

### Core Filter Composables

#### 1. useDebounceFn
**Purpose**: Delay function execution until user stops typing

**Documentation**: https://vueuse.org/shared/usedebouncefn/

**Size**: 455 B

**API**:
```typescript
function useDebounceFn<T extends FunctionArgs>(
  fn: T,
  ms?: MaybeRefOrGetter<number>,
  options?: DebounceFilterOptions
): UseDebounceFnReturn<T>
```

**Parameters**:
- `fn` - Function to debounce
- `ms` - Delay in milliseconds (100-250ms recommended for events)
- `options` - `{ maxWait, rejectOnCancel }`

**Search Input Pattern**:
```typescript
import { useDebounceFn } from '@vueuse/core'

const searchQuery = ref('')
const { data: results, refresh } = useFetch('/api/search', {
  query: { q: searchQuery },
  immediate: false
})

// Debounce search API calls
const debouncedSearch = useDebounceFn(() => {
  refresh()
}, 300)

watch(searchQuery, () => {
  debouncedSearch()
})
```

**With maxWait**:
```typescript
// Execute after 1s of no activity, but force execution after 5s
const debouncedFn = useDebounceFn(() => {
  console.log('Searching...')
}, 1000, { maxWait: 5000 })
```

**Promise Support**:
```typescript
const debouncedRequest = useDebounceFn(
  async () => {
    const result = await $fetch('/api/search')
    return result
  },
  1000
)

// Use with await
const data = await debouncedRequest()
```

**Best Practices**:
- Use 100-250ms for UI events (input, scroll)
- Use 300-500ms for API calls
- Add `maxWait` to guarantee eventual execution
- Only use `rejectOnCancel: true` if handling cancellation explicitly

#### 2. watchDebounced
**Purpose**: Debounced watcher for reactive sources

**Documentation**: https://vueuse.org/shared/watchdebounced/

**Size**: 455 B

**API**:
```typescript
watchDebounced(
  source,
  callback,
  {
    debounce: number,
    maxWait?: number,
    ...watchOptions
  }
)
```

**Filter State Pattern**:
```typescript
import { watchDebounced } from '@vueuse/core'

const filters = reactive({
  search: '',
  category: '',
  priceRange: [0, 1000]
})

// Debounce filter changes before API call
watchDebounced(
  filters,
  async (newFilters) => {
    await fetchProducts(newFilters)
  },
  {
    debounce: 500,
    maxWait: 2000,
    deep: true
  }
)
```

**Multiple Sources**:
```typescript
watchDebounced(
  [searchQuery, category],
  async ([query, cat]) => {
    await search(query, cat)
  },
  { debounce: 300 }
)
```

#### 3. useStorage
**Purpose**: Persistent reactive state in localStorage/sessionStorage

**Documentation**: https://vueuse.org/core/usestorage/

**Nuxt 3 Warning**: Explicitly import to avoid conflict with Nitro's `useStorage()`

**API**:
```typescript
const state = useStorage(
  key: string,
  defaults: T,
  storage?: Storage,
  options?: UseStorageOptions<T>
)
```

**Filter Persistence Pattern**:
```typescript
import { useStorage } from '@vueuse/core'

// Persist filters across page reloads
const filters = useStorage('product-filters', {
  category: '',
  priceRange: [0, 1000],
  sortBy: 'name',
  viewMode: 'grid'
}, localStorage, {
  mergeDefaults: true  // Merge with stored values
})

// Changes automatically saved
filters.value.category = 'wine'  // Saved to localStorage
```

**Serialization Options**:
```typescript
// Custom serializer
const complexFilters = useStorage('filters', null, undefined, {
  serializer: {
    read: (v) => v ? JSON.parse(v) : null,
    write: (v) => JSON.stringify(v)
  }
})

// Predefined serializers
import { StorageSerializers } from '@vueuse/core'

const objectData = useStorage('key', null, undefined, {
  serializer: StorageSerializers.object
})
```

**Configuration Options**:
- `deep: true` - Watch nested properties (default: true)
- `listenToStorageChanges: true` - Cross-tab sync (default: true)
- `writeDefaults: true` - Persist default values (default: true)
- `mergeDefaults: false` - Merge stored + defaults
- `initOnMounted: false` - Wait for component mount

**SSR-Safe Pattern**:
```typescript
// For Nuxt 3 - defer until client-side
const filters = useStorage('filters', defaultFilters, localStorage, {
  initOnMounted: true  // Read after mount
})
```

**Merge Defaults**:
```typescript
// Shallow merge
const filters = useStorage('filters', {
  category: '',
  priceRange: [0, 1000],
  newFeature: true  // Add new filters without losing stored ones
}, localStorage, {
  mergeDefaults: true
})

// Custom merge
const filters = useStorage('filters', defaults, localStorage, {
  mergeDefaults: (storageValue, defaults) => {
    return deepMerge(defaults, storageValue)
  }
})
```

#### 4. useUrlSearchParams
**Purpose**: Reactive URL query parameters

**Documentation**: https://vueuse.org/core/useurlsearchparams/

**Size**: 1.51 kB

**API**:
```typescript
const params = useUrlSearchParams(
  mode?: 'history' | 'hash' | 'hash-params',
  options?: UseUrlSearchParamsOptions
)
```

**URL-Synced Filters Pattern**:
```typescript
import { useUrlSearchParams } from '@vueuse/core'

const params = useUrlSearchParams('history')

// Read from URL
const filters = reactive({
  category: params.category || '',
  sortBy: params.sortBy || 'name',
  page: Number(params.page) || 1
})

// Write to URL (reactive)
filters.category = 'wine'
// URL updates to: ?category=wine&sortBy=name&page=1

// Direct param access
params.search = 'query'  // Updates URL immediately
```

**Mode Options**:
- `'history'` - Standard query strings: `?foo=bar` (default)
- `'hash'` - Hash routing: `#/route?foo=bar`
- `'hash-params'` - Hash-based: `#foo=bar`

**Configuration Options**:
```typescript
const params = useUrlSearchParams('history', {
  removeNullishValues: true,  // Remove null/undefined (default: true)
  removeFalsyValues: false,   // Remove false/0/'' (default: false)
  initialValue: { page: '1' },  // Default params
  write: true,                // Auto-update history (default: true)
  writeMode: 'replace'        // 'replace' or 'push' (default: replace)
})
```

**Custom Stringify**:
```typescript
const params = useUrlSearchParams('history', {
  stringify: (params) => {
    // Remove equals for empty values: ?foo&bar=value
    return params.toString().replace(/=(&|$)/g, '$1')
  }
})
```

**Complete Filter Example**:
```typescript
<script setup lang="ts">
import { useUrlSearchParams } from '@vueuse/core'

// URL sync
const params = useUrlSearchParams('history', {
  removeNullishValues: true,
  writeMode: 'replace'
})

// Filter state synced with URL
const filters = reactive({
  search: params.search || '',
  category: params.category || '',
  sortBy: params.sortBy || 'name',
  page: Number(params.page) || 1
})

// Watch filters and sync to URL
watch(filters, (newFilters) => {
  params.search = newFilters.search
  params.category = newFilters.category
  params.sortBy = newFilters.sortBy
  params.page = String(newFilters.page)
}, { deep: true })

// Fetch data based on URL params
const { data: products } = useFetch('/api/products', {
  query: computed(() => ({
    search: filters.search,
    category: filters.category,
    sortBy: filters.sortBy,
    page: filters.page
  }))
})
</script>
```

#### 5. Other Useful Composables

**useMediaQuery** - Responsive filters:
```typescript
import { useMediaQuery } from '@vueuse/core'

const isMobile = useMediaQuery('(max-width: 768px)')
const isDesktop = useMediaQuery('(min-width: 1024px)')

// Render different filter UI
<Sheet v-if="isMobile">...</Sheet>
<Popover v-else>...</Popover>
```

**useInfiniteScroll** - Load more results:
```typescript
import { useInfiniteScroll } from '@vueuse/core'

const el = ref<HTMLElement | null>(null)

useInfiniteScroll(
  el,
  async () => {
    // Load next page
    page.value++
    await fetchProducts()
  },
  { distance: 10 }
)
```

**useElementVisibility** - Lazy filter loading:
```typescript
import { useElementVisibility } from '@vueuse/core'

const filterSection = ref<HTMLElement | null>(null)
const isVisible = useElementVisibility(filterSection)

watchEffect(() => {
  if (isVisible.value) {
    loadFilterOptions()
  }
})
```

---

## Tailwind CSS Patterns

### Official Documentation
- **Core Docs**: https://tailwindcss.com/docs
- **Filter Utilities**: https://tailwindcss.com/docs/filter
- **Flowbite Components**: https://flowbite.com/docs/forms/search-input/

### Filter UI Utility Patterns

#### Search Bar Classes
```html
<!-- Base search input -->
<input
  type="search"
  class="
    w-full rounded-lg border border-gray-300
    bg-white px-4 py-2 text-sm
    placeholder:text-gray-400
    focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
    disabled:cursor-not-allowed disabled:bg-gray-50
    dark:border-gray-700 dark:bg-gray-900 dark:text-white
    dark:focus:border-blue-400 dark:focus:ring-blue-900/20
  "
  placeholder="Search products..."
/>

<!-- With icon -->
<div class="relative">
  <svg class="
    pointer-events-none absolute left-3 top-1/2 h-5 w-5
    -translate-y-1/2 text-gray-400
  ">
    <!-- Icon SVG -->
  </svg>
  <input
    type="search"
    class="w-full pl-10 pr-4 py-2 ..."
  />
</div>
```

#### Filter Button Classes
```html
<!-- Outline filter button -->
<button class="
  inline-flex items-center gap-2
  rounded-lg border border-gray-300
  bg-white px-4 py-2 text-sm font-medium
  text-gray-700
  hover:bg-gray-50 hover:border-gray-400
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  dark:border-gray-600 dark:bg-gray-800
  dark:text-gray-200 dark:hover:bg-gray-700
">
  <svg class="h-4 w-4" />
  Filters
  <span class="
    ml-1 inline-flex items-center justify-center
    rounded-full bg-blue-100 px-2 py-0.5
    text-xs font-semibold text-blue-700
    dark:bg-blue-900/40 dark:text-blue-300
  ">
    3
  </span>
</button>
```

#### Filter Chip Classes
```html
<!-- Active filter chip -->
<button class="
  inline-flex items-center gap-1.5
  rounded-full border border-transparent
  bg-blue-50 px-3 py-1.5 text-sm font-medium
  text-blue-700
  hover:bg-blue-100
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  dark:bg-blue-900/40 dark:text-blue-200
  dark:hover:bg-blue-900/60
">
  Category: Wine
  <svg class="h-4 w-4" aria-hidden="true">
    <!-- X icon -->
  </svg>
</button>
```

#### Dropdown/Select Classes
```html
<select class="
  w-full rounded-lg border border-gray-300
  bg-white px-4 py-2 text-sm font-medium
  text-gray-700
  focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
  disabled:cursor-not-allowed disabled:bg-gray-50
  dark:border-gray-700 dark:bg-gray-900
  dark:text-gray-200
  sm:w-48
">
  <option>Sort by Name</option>
  <option>Price: Low to High</option>
</select>
```

#### Checkbox/Radio Classes
```html
<!-- Checkbox -->
<input
  type="checkbox"
  class="
    h-4 w-4 rounded border-gray-300
    text-blue-600
    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50
    dark:border-gray-600 dark:bg-gray-800
    dark:focus:ring-offset-gray-900
  "
/>

<!-- With label -->
<label class="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" class="..." />
  <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
    In Stock Only
  </span>
</label>
```

#### Filter Panel Container Classes
```html
<!-- Desktop side panel -->
<aside class="
  w-64 shrink-0 space-y-6
  border-r border-gray-200
  bg-white p-6
  dark:border-gray-800 dark:bg-gray-900
  lg:w-72
">
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      Filters
    </h3>
    <!-- Filter sections -->
  </div>
</aside>

<!-- Mobile sheet/drawer content -->
<div class="
  space-y-6 px-4 py-6
  max-h-[80vh] overflow-y-auto
">
  <!-- Filter sections -->
</div>
```

#### Filter Section Classes
```html
<div class="space-y-3">
  <!-- Section header -->
  <div class="flex items-center justify-between">
    <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
      Category
    </h4>
    <button class="
      text-xs text-blue-600 hover:text-blue-700
      dark:text-blue-400 dark:hover:text-blue-300
    ">
      Clear
    </button>
  </div>

  <!-- Section content -->
  <div class="space-y-2">
    <!-- Filter options -->
  </div>
</div>

<!-- With divider -->
<div class="border-t border-gray-200 dark:border-gray-800 pt-6">
  <!-- Next section -->
</div>
```

#### Results/Grid Container Classes
```html
<!-- Container with sidebar -->
<div class="flex gap-6">
  <!-- Sidebar filters -->
  <aside class="w-64 shrink-0">...</aside>

  <!-- Results area -->
  <main class="flex-1 space-y-6">
    <!-- Products grid -->
    <div class="
      grid grid-cols-1 gap-6
      sm:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
    ">
      <!-- Product cards -->
    </div>
  </main>
</div>
```

#### Loading States
```html
<!-- Search input loading spinner -->
<div class="relative">
  <svg class="
    pointer-events-none absolute left-3 top-1/2
    h-5 w-5 -translate-y-1/2
    animate-spin text-gray-400
  " fill="none" viewBox="0 0 24 24">
    <circle
      class="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor" stroke-width="4"
    />
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z..."
    />
  </svg>
</div>

<!-- Skeleton loader for products -->
<div class="
  animate-pulse space-y-4
  rounded-lg border border-gray-200
  bg-white p-4
  dark:border-gray-800 dark:bg-gray-900
">
  <div class="h-48 rounded bg-gray-200 dark:bg-gray-800" />
  <div class="h-4 rounded bg-gray-200 dark:bg-gray-800" />
  <div class="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
</div>
```

#### Focus States Best Practices
```css
/* Always include focus states for accessibility */
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2

/* Dark mode focus states */
dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900

/* Visible focus indicator (WCAG requirement) */
focus-visible:ring-2 focus-visible:ring-blue-500
```

#### Dark Mode Patterns
```html
<!-- Always provide dark mode variants -->
class="
  bg-white text-gray-900
  dark:bg-gray-900 dark:text-white

  border-gray-300
  dark:border-gray-700

  hover:bg-gray-50
  dark:hover:bg-gray-800

  focus:ring-blue-500
  dark:focus:ring-blue-400
"
```

### Responsive Filter Patterns

#### Mobile-First Approach
```html
<!-- Mobile: Drawer button, Desktop: Inline filters -->
<div class="flex gap-4">
  <!-- Mobile filter button -->
  <button class="
    inline-flex items-center gap-2 lg:hidden
    rounded-lg border px-4 py-2
  ">
    Filters
  </button>

  <!-- Desktop inline filters -->
  <div class="hidden gap-3 lg:flex">
    <Popover>...</Popover>
    <Popover>...</Popover>
  </div>
</div>
```

---

## Accessibility Best Practices

### Official Documentation
- **Vue.js Accessibility Guide**: https://vuejs.org/guide/best-practices/accessibility.html
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/

### Forms and Filters

#### Label Best Practices
**Always link labels to inputs explicitly**:

```vue
<!-- ✅ Correct -->
<label for="search-input" class="sr-only">
  Search products
</label>
<input
  id="search-input"
  type="search"
  aria-label="Search products"
/>

<!-- ❌ Wrong - wrapping not fully supported by AT -->
<label>
  Search
  <input type="search" />
</label>
```

#### ARIA for Forms

**aria-label** - Accessible name when no visible label:
```vue
<button aria-label="Open filters">
  <Icon name="filter" aria-hidden="true" />
</button>
```

**aria-labelledby** - Link to visible label text:
```vue
<h3 id="filter-heading">Filter Products</h3>
<div role="group" aria-labelledby="filter-heading">
  <!-- Filter controls -->
</div>
```

**aria-describedby** - Additional descriptions:
```vue
<label for="price-min">Minimum Price</label>
<input
  id="price-min"
  type="number"
  aria-describedby="price-help"
/>
<span id="price-help" class="text-sm text-gray-600">
  Enter minimum price in USD
</span>
```

#### Filter Instructions
```vue
<div class="space-y-2">
  <label id="category-label" for="category-select">
    Category
  </label>
  <p id="category-desc" class="text-sm text-gray-600">
    Select one or more categories to filter products
  </p>
  <select
    id="category-select"
    aria-labelledby="category-label"
    aria-describedby="category-desc"
  >
    <!-- Options -->
  </select>
</div>
```

### Keyboard Navigation

#### Skip Links
```vue
<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
  >
    Skip to main content
  </a>

  <nav><!-- Navigation --></nav>

  <main id="main-content" tabindex="-1">
    <!-- Main content -->
  </main>
</template>
```

#### Focus Management
```vue
<script setup lang="ts">
const filterDialog = ref<HTMLElement | null>(null)
const previousFocus = ref<HTMLElement | null>(null)

function openFilters() {
  previousFocus.value = document.activeElement as HTMLElement
  isOpen.value = true

  nextTick(() => {
    filterDialog.value?.focus()
  })
}

function closeFilters() {
  isOpen.value = false
  nextTick(() => {
    previousFocus.value?.focus()
  })
}
</script>
```

#### Keyboard Shortcuts
```vue
<script setup>
import { useMagicKeys } from '@vueuse/core'

const { ctrl_k, meta_k } = useMagicKeys()

watch([ctrl_k, meta_k], ([ctrlK, metaK]) => {
  if (ctrlK || metaK) {
    openSearchDialog()
  }
})
</script>

<template>
  <button
    @click="openSearchDialog"
    aria-label="Open search (Ctrl+K)"
  >
    <Icon name="search" />
    <kbd class="ml-2 text-xs">⌘K</kbd>
  </button>
</template>
```

### Dynamic Content

#### Headings Structure
```vue
<!-- Maintain proper heading hierarchy -->
<h1>Products</h1>
  <h2>Filters</h2>
    <h3>Category</h3>
    <h3>Price Range</h3>
  <h2>Results</h2>
    <h3>Product Name</h3>

<!-- Never skip levels -->
<!-- ❌ Wrong: <h1> → <h3> -->
<!-- ✅ Correct: <h1> → <h2> → <h3> -->
```

#### Landmark Roles
```vue
<template>
  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      <!-- Navigation -->
    </nav>
  </header>

  <main role="main">
    <aside role="complementary" aria-label="Product filters">
      <!-- Filters -->
    </aside>

    <section role="region" aria-labelledby="results-heading">
      <h2 id="results-heading">Search Results</h2>
      <!-- Results -->
    </section>
  </main>

  <form role="search" aria-label="Product search">
    <!-- Search form -->
  </form>
</template>
```

### Screen Reader Patterns

#### Live Regions
```vue
<script setup>
const resultsCount = ref(0)
const isSearching = ref(false)
</script>

<template>
  <!-- Announce results count -->
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  >
    <span v-if="isSearching">Searching...</span>
    <span v-else>
      Found {{ resultsCount }} {{ resultsCount === 1 ? 'result' : 'results' }}
    </span>
  </div>

  <!-- Visual results count -->
  <p aria-hidden="true">
    {{ resultsCount }} results
  </p>
</template>
```

#### Filter Changes
```vue
<template>
  <!-- Announce filter changes -->
  <div
    role="region"
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  >
    {{ filterChangeMessage }}
  </div>

  <div class="flex flex-wrap gap-2" role="list" aria-label="Active filters">
    <button
      v-for="filter in activeFilters"
      :key="filter.id"
      role="listitem"
      :aria-label="`Remove ${filter.label} filter`"
      @click="removeFilter(filter)"
    >
      {{ filter.label }}
      <span aria-hidden="true">×</span>
    </button>
  </div>
</template>

<script setup>
const filterChangeMessage = computed(() => {
  const count = activeFilters.value.length
  return `${count} ${count === 1 ? 'filter' : 'filters'} applied`
})
</script>
```

### Hidden Content

#### Visually Hidden (Screen Reader Only)
```css
/* Tailwind: sr-only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Focus visible */
.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  /* ... */
}
```

```vue
<!-- Screen reader only labels -->
<label for="search" class="sr-only">
  Search products by name or category
</label>
<input id="search" type="search" />
```

#### aria-hidden
```vue
<!-- Hide decorative elements -->
<button aria-label="Sort by price">
  <Icon name="sort" aria-hidden="true" />
  Sort
</button>

<!-- Hide duplicate content -->
<div aria-hidden="true">
  <span class="badge">3</span>
</div>
<span class="sr-only">3 active filters</span>
```

**Never** use `aria-hidden="true"` on focusable elements:
```vue
<!-- ❌ Wrong - button hidden but focusable -->
<button aria-hidden="true">Click me</button>

<!-- ✅ Correct - hide container, button disabled -->
<div aria-hidden="true">
  <button disabled>Click me</button>
</div>
```

### Filter-Specific Accessibility

#### Filter Panel
```vue
<Sheet v-model:open="isFilterOpen">
  <SheetTrigger aria-label="Open filters" aria-expanded="false">
    <Icon name="filter" aria-hidden="true" />
    Filters
    <Badge v-if="activeCount" aria-label="`${activeCount} active filters`">
      {{ activeCount }}
    </Badge>
  </SheetTrigger>

  <SheetContent
    role="dialog"
    aria-label="Filter products"
    aria-describedby="filter-description"
  >
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription id="filter-description">
        Refine your product search using the filters below
      </SheetDescription>
    </SheetHeader>

    <!-- Filter controls -->
  </SheetContent>
</Sheet>
```

#### Search Input
```vue
<div role="search" aria-label="Product search">
  <label for="search-input" class="sr-only">
    Search products by name, category, or description
  </label>
  <input
    id="search-input"
    ref="searchRef"
    type="search"
    role="searchbox"
    aria-label="Search products"
    aria-describedby="search-help"
    :aria-expanded="showSuggestions"
    :aria-controls="showSuggestions ? 'suggestions-list' : undefined"
    aria-autocomplete="list"
  />
  <span id="search-help" class="sr-only">
    Type to search. Use arrow keys to navigate suggestions.
  </span>

  <!-- Suggestions -->
  <ul
    v-if="showSuggestions"
    id="suggestions-list"
    role="listbox"
    aria-label="Search suggestions"
  >
    <li
      v-for="(suggestion, index) in suggestions"
      :key="suggestion"
      role="option"
      :aria-selected="index === selectedIndex"
    >
      {{ suggestion }}
    </li>
  </ul>
</div>
```

#### Checkbox Groups
```vue
<fieldset>
  <legend class="text-sm font-semibold">
    Categories
  </legend>
  <div class="space-y-2">
    <div
      v-for="cat in categories"
      :key="cat.value"
      class="flex items-center"
    >
      <Checkbox
        :id="`cat-${cat.value}`"
        :checked="selectedCategories.includes(cat.value)"
        :aria-describedby="`cat-${cat.value}-desc`"
        @update:checked="toggleCategory(cat.value)"
      />
      <label
        :for="`cat-${cat.value}`"
        class="ml-2 text-sm cursor-pointer"
      >
        {{ cat.label }}
      </label>
      <span
        :id="`cat-${cat.value}-desc`"
        class="sr-only"
      >
        {{ cat.description }}
      </span>
    </div>
  </div>
</fieldset>
```

#### Sort Select
```vue
<div>
  <label for="sort-select" class="sr-only">
    Sort products
  </label>
  <select
    id="sort-select"
    v-model="sortBy"
    aria-label="Sort products by"
    @change="announceSort"
  >
    <option value="name">Name (A-Z)</option>
    <option value="price-asc">Price: Low to High</option>
    <option value="price-desc">Price: High to Low</option>
  </select>

  <!-- Live region for sort change -->
  <div role="status" aria-live="polite" class="sr-only">
    {{ sortMessage }}
  </div>
</div>

<script setup>
const sortMessage = ref('')

function announceSort() {
  const label = sortOptions.find(o => o.value === sortBy.value)?.label
  sortMessage.value = `Sorted by ${label}`

  // Clear message after announcement
  setTimeout(() => {
    sortMessage.value = ''
  }, 1000)
}
</script>
```

### WCAG Compliance Checklist

#### Search and Filter Requirements

**WCAG 3.2.2 - On Input**:
- ✅ Don't automatically submit filters on change
- ✅ Provide explicit "Apply Filters" button
- ✅ Or announce changes when auto-applying

```vue
<!-- ❌ Wrong - auto-applies on change -->
<Select
  v-model="category"
  @update:modelValue="applyFilters"
/>

<!-- ✅ Correct - manual apply -->
<Select v-model="category" />
<Button @click="applyFilters">Apply Filters</Button>

<!-- ✅ Also correct - with announcement -->
<Select
  v-model="category"
  @update:modelValue="announceFilterChange"
/>
<div role="status" aria-live="polite" class="sr-only">
  {{ changeMessage }}
</div>
```

**WCAG 1.3.1 - Info and Relationships**:
- ✅ Use semantic HTML (`<fieldset>`, `<legend>`, `<label>`)
- ✅ Group related filters
- ✅ Proper heading hierarchy

**WCAG 2.1.1 - Keyboard**:
- ✅ All filters operable via keyboard
- ✅ Logical tab order
- ✅ Visible focus indicators

**WCAG 1.4.3 - Contrast**:
- ✅ Minimum 4.5:1 for text
- ✅ 3:1 for UI components
- ✅ Test dark mode contrast

**WCAG 2.4.3 - Focus Order**:
```vue
<!-- Logical tab order -->
<div class="filter-panel">
  <input tabindex="0" />  <!-- 1. Search -->
  <button tabindex="0">Filter</button>  <!-- 2. Filter button -->
  <select tabindex="0">Sort</select>  <!-- 3. Sort -->

  <!-- Sheet content (when open) -->
  <Sheet>
    <input tabindex="0" />  <!-- 4. Filter inputs -->
    <button tabindex="0">Apply</button>  <!-- 5. Actions -->
  </Sheet>
</div>
```

---

## Implementation Recommendations

### Recommended Architecture

#### File Structure
```
composables/
  useProductFilters.ts      # Filter state management
  useProductSearch.ts       # Search logic
  useFilterPersistence.ts   # localStorage/URL sync

components/
  product/
    SearchBar.vue            # ✅ Already exists
    ActiveFilters.vue        # ✅ Already exists
    FilterPanel.vue          # New - Desktop sidebar
    FilterSheet.vue          # New - Mobile drawer
    FilterPopover.vue        # New - Inline filter dropdown
    SortSelect.vue           # New - Sort dropdown
    PriceRangeFilter.vue     # New - Price range slider

stores/
  search.ts                  # ✅ Already exists
  filters.ts                 # New - Filter-specific store (optional)
```

### useProductFilters Composable

**File**: `/composables/useProductFilters.ts`

```typescript
import { useUrlSearchParams, useDebounceFn, useStorage } from '@vueuse/core'
import { type ComputedRef, type Ref } from 'vue'

export interface ProductFilters {
  search: string
  category: string
  priceMin: number
  priceMax: number
  sortBy: string
  inStock: boolean
  page: number
}

export interface FilterChip {
  key: keyof ProductFilters
  label: string
  value: string | number | boolean
}

export function useProductFilters() {
  // URL synchronization
  const params = useUrlSearchParams('history', {
    removeNullishValues: true,
    writeMode: 'replace'
  })

  // Filter state (reactive to URL)
  const filters = reactive<ProductFilters>({
    search: (params.search as string) || '',
    category: (params.category as string) || '',
    priceMin: Number(params.priceMin) || 0,
    priceMax: Number(params.priceMax) || 1000,
    sortBy: (params.sortBy as string) || 'name',
    inStock: params.inStock === 'true',
    page: Number(params.page) || 1
  })

  // Computed properties
  const activeFilterCount = computed(() => {
    let count = 0
    if (filters.search) count++
    if (filters.category) count++
    if (filters.priceMin > 0 || filters.priceMax < 1000) count++
    if (filters.inStock) count++
    return count
  })

  const filterChips = computed<FilterChip[]>(() => {
    const chips: FilterChip[] = []

    if (filters.category) {
      chips.push({
        key: 'category',
        label: `Category: ${filters.category}`,
        value: filters.category
      })
    }

    if (filters.priceMin > 0) {
      chips.push({
        key: 'priceMin',
        label: `Min: $${filters.priceMin}`,
        value: filters.priceMin
      })
    }

    if (filters.priceMax < 1000) {
      chips.push({
        key: 'priceMax',
        label: `Max: $${filters.priceMax}`,
        value: filters.priceMax
      })
    }

    if (filters.inStock) {
      chips.push({
        key: 'inStock',
        label: 'In Stock',
        value: true
      })
    }

    return chips
  })

  const hasActiveFilters = computed(() => activeFilterCount.value > 0)

  // Sync filters to URL
  watch(filters, (newFilters) => {
    params.search = newFilters.search
    params.category = newFilters.category
    params.priceMin = newFilters.priceMin > 0 ? String(newFilters.priceMin) : ''
    params.priceMax = newFilters.priceMax < 1000 ? String(newFilters.priceMax) : ''
    params.sortBy = newFilters.sortBy
    params.inStock = newFilters.inStock ? 'true' : ''
    params.page = String(newFilters.page)
  }, { deep: true })

  // Actions
  function clearFilters() {
    filters.search = ''
    filters.category = ''
    filters.priceMin = 0
    filters.priceMax = 1000
    filters.sortBy = 'name'
    filters.inStock = false
    filters.page = 1
  }

  function removeFilter(key: keyof ProductFilters) {
    switch (key) {
      case 'search':
        filters.search = ''
        break
      case 'category':
        filters.category = ''
        break
      case 'priceMin':
        filters.priceMin = 0
        break
      case 'priceMax':
        filters.priceMax = 1000
        break
      case 'inStock':
        filters.inStock = false
        break
    }
    filters.page = 1 // Reset to first page
  }

  function resetPage() {
    filters.page = 1
  }

  return {
    filters: readonly(filters),
    activeFilterCount,
    filterChips,
    hasActiveFilters,
    clearFilters,
    removeFilter,
    resetPage,
    // Expose reactive refs for v-model
    search: toRef(filters, 'search'),
    category: toRef(filters, 'category'),
    priceMin: toRef(filters, 'priceMin'),
    priceMax: toRef(filters, 'priceMax'),
    sortBy: toRef(filters, 'sortBy'),
    inStock: toRef(filters, 'inStock'),
    page: toRef(filters, 'page')
  }
}
```

### Products Page Implementation

**File**: `/pages/products.vue`

```vue
<script setup lang="ts">
import { useDebounceFn, useMediaQuery } from '@vueuse/core'
import { useProductFilters } from '~/composables/useProductFilters'

// Filter state
const {
  filters,
  filterChips,
  activeFilterCount,
  hasActiveFilters,
  clearFilters,
  removeFilter,
  resetPage,
  search,
  category,
  sortBy
} = useProductFilters()

// Responsive
const isMobile = useMediaQuery('(max-width: 768px)')
const isFilterPanelOpen = ref(false)

// Data fetching
const { data: productsData, status, refresh } = await useFetch('/api/products', {
  query: computed(() => ({
    search: filters.search,
    category: filters.category,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    sortBy: filters.sortBy,
    inStock: filters.inStock,
    page: filters.page
  })),
  lazy: true,
  server: false,
  pick: ['products', 'total', 'page', 'pageSize']
})

const products = computed(() => productsData.value?.products || [])
const totalResults = computed(() => productsData.value?.total || 0)
const isLoading = computed(() => status.value === 'pending')

// Debounced search
const debouncedRefresh = useDebounceFn(() => {
  resetPage()
  refresh()
}, 300)

watch([search, category, () => filters.priceMin, () => filters.priceMax, () => filters.inStock], () => {
  debouncedRefresh()
})

watch(sortBy, () => {
  refresh()
})

// Filter actions
function handleRemoveChip(chip: FilterChip) {
  removeFilter(chip.key)
}

function handleClearAll() {
  clearFilters()
}

// SEO
useHead({
  title: 'Products | Moldova Direct',
  meta: [
    { name: 'description', content: 'Browse our selection of authentic Moldovan products' }
  ]
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Search bar -->
    <ProductSearchBar
      v-model:search-query="search"
      v-model:sort-by="sortBy"
      :active-filter-count="activeFilterCount"
      :loading="isLoading"
      @open-filters="isFilterPanelOpen = true"
    />

    <!-- Active filters -->
    <ProductActiveFilters
      v-if="hasActiveFilters"
      :chips="filterChips"
      :results-text="`${totalResults} products found`"
      class="mt-6"
      @remove-chip="handleRemoveChip"
      @clear-all="handleClearAll"
    />

    <div class="mt-8 flex gap-8">
      <!-- Desktop sidebar filters -->
      <ProductFilterPanel
        v-if="!isMobile"
        v-model:category="category"
        v-model:price-min="priceMin"
        v-model:price-max="priceMax"
        v-model:in-stock="inStock"
        class="w-64 shrink-0"
      />

      <!-- Mobile filter sheet -->
      <ProductFilterSheet
        v-else
        v-model:open="isFilterPanelOpen"
        v-model:category="category"
        v-model:price-min="priceMin"
        v-model:price-max="priceMax"
        v-model:in-stock="inStock"
      />

      <!-- Products grid -->
      <main class="flex-1">
        <div
          v-if="isLoading"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <ProductCardSkeleton v-for="i in 6" :key="i" />
        </div>

        <div
          v-else-if="products.length"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <ProductsEmptyState
          v-else
          @clear-filters="handleClearAll"
        />
      </main>
    </div>
  </div>
</template>
```

### Performance Optimization Checklist

1. **Data Fetching**:
   - ✅ Use `lazy: true` for non-blocking navigation
   - ✅ Use `pick` to minimize payload
   - ✅ Debounce search input (300ms)
   - ✅ Cache with unique keys
   - ✅ Use `server: false` for client-only filters

2. **Reactivity**:
   - ✅ Use `computed()` for derived state
   - ✅ Use `watchDebounced` for expensive operations
   - ✅ Avoid deep watches when possible
   - ✅ Use `readonly()` to prevent accidental mutations

3. **Components**:
   - ✅ Lazy load filter panels with `defineAsyncComponent`
   - ✅ Use `v-show` instead of `v-if` for frequently toggled filters
   - ✅ Implement virtual scrolling for long lists
   - ✅ Skeleton loaders for perceived performance

4. **State Management**:
   - ✅ Store only necessary state
   - ✅ Use composables over Pinia for simple state
   - ✅ Leverage existing search store for integration
   - ✅ Persist filter preferences in localStorage

5. **Accessibility**:
   - ✅ All filters keyboard accessible
   - ✅ Proper ARIA labels and roles
   - ✅ Live regions for dynamic content
   - ✅ Focus management for dialogs
   - ✅ Skip links for navigation
   - ✅ Announce filter changes to screen readers

### Integration with Existing Code

The project already has:

1. **Search Store** (`/stores/search.ts`):
   - Implements caching, history, suggestions
   - Can be enhanced with filter integration:
   ```typescript
   // In search store
   async search(query: string, filters: ProductFilters = {}) {
     // Existing search logic
     // Add filters to query params
   }
   ```

2. **Search Components**:
   - `SearchBar.vue` - Can be extended with filter button
   - `ActiveFilters.vue` - Already implemented, ready to use

3. **Recommended Approach**:
   - Keep search store for search-specific logic
   - Use `useProductFilters()` composable for filter state
   - Integrate both in products page
   - Share filter state via URL params

---

## Additional Resources

### Official Documentation Links

**Nuxt 3**:
- API Reference: https://nuxt.com/docs/api
- Data Fetching: https://nuxt.com/docs/getting-started/data-fetching
- State Management: https://nuxt.com/docs/getting-started/state-management
- Composables: https://nuxt.com/docs/guide/directory-structure/composables

**Vue 3**:
- Composition API: https://vuejs.org/api/composition-api-setup.html
- Reactivity API: https://vuejs.org/api/reactivity-core.html
- Best Practices: https://vuejs.org/guide/best-practices/
- Accessibility: https://vuejs.org/guide/best-practices/accessibility.html

**shadcn-vue**:
- Components: https://www.shadcn-vue.com/docs/components
- Installation: https://www.shadcn-vue.com/docs/installation
- Theming: https://www.shadcn-vue.com/docs/theming

**VueUse**:
- Functions: https://vueuse.org/functions.html
- Core: https://vueuse.org/core/
- Shared: https://vueuse.org/shared/
- GitHub: https://github.com/vueuse/vueuse

**Tailwind CSS**:
- Documentation: https://tailwindcss.com/docs
- Utilities: https://tailwindcss.com/docs/utility-first
- Dark Mode: https://tailwindcss.com/docs/dark-mode
- Customization: https://tailwindcss.com/docs/configuration

**Accessibility**:
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Practices: https://www.w3.org/WAI/ARIA/apg/
- Vue Accessibility: https://vuejs.org/guide/best-practices/accessibility.html
- WebAIM: https://webaim.org/articles/

### Community Resources

**Blogs and Guides**:
- Mastering Nuxt: https://masteringnuxt.com/blog
- Vue School: https://vueschool.io/articles
- VueDose: https://vuedose.tips
- LogRocket Blog: https://blog.logrocket.com/tag/vue/

**GitHub Examples**:
- Nuxt Examples: https://github.com/nuxt/examples
- VueUse Demos: https://github.com/vueuse/vueuse/tree/main/packages
- shadcn-vue Examples: https://github.com/unovue/shadcn-vue

---

## Summary

This research covers the complete stack for implementing modern search/filter functionality in the Moldova Direct project:

1. **Nuxt 3** - SSR-safe data fetching with `useFetch` and `useAsyncData`, optimized for search/filter pages
2. **Vue 3 Composition API** - Reactive filter state management with `ref()`, `reactive()`, `computed()`, and `watch()`
3. **shadcn-vue** - Ready-to-use filter components (Popover, Command, Sheet, Drawer, Select, Checkbox)
4. **VueUse** - Essential composables (`useDebounceFn`, `useStorage`, `useUrlSearchParams`, `watchDebounced`)
5. **Tailwind CSS** - Utility patterns for consistent, accessible filter UI
6. **Accessibility** - WCAG-compliant patterns with ARIA labels, keyboard navigation, and screen reader support

**Key Takeaways**:
- Use `useFetch` with `lazy: true` and reactive `query` params for optimal performance
- Implement `useProductFilters()` composable for centralized filter state
- Leverage URL sync for shareable filter states
- Use responsive patterns (Sheet on mobile, Popover on desktop)
- Debounce search input but not sort/select changes
- Always include proper ARIA labels and keyboard navigation
- Integrate with existing search store for unified search experience

**Next Steps**:
1. Implement `useProductFilters()` composable
2. Create filter UI components (FilterPanel, FilterSheet)
3. Update products page with filter integration
4. Test accessibility with keyboard and screen readers
5. Optimize performance with caching and debouncing
6. Add analytics tracking for filter usage
