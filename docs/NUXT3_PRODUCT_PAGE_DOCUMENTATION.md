# Nuxt 3 Product Listing Page Documentation

## Project Context
**Moldova Direct Wine E-commerce Site**
- Nuxt: v3.19.2
- @nuxt/image: v1.11.0
- @pinia/nuxt: v0.11.2
- @nuxtjs/supabase: v1.6.2
- Vue: v3.5.18
- Pinia: v3.0.4

**Current Route Rules (nuxt.config.ts):**
```typescript
routeRules: {
  '/': { swr: 3600, prerender: true },
  '/products': { swr: 3600 },
  '/products/**': { swr: 3600 },
}
```

---

## 1. Nuxt 3 Core Data Fetching

### 1.1 useFetch vs useAsyncData

#### useFetch
**Official Documentation:** https://nuxt.com/docs/api/composables/use-fetch

**When to Use:**
- Simple, straightforward API calls with a URL
- Loading initial data once on the server
- Prevents extra calls after hydration

**Syntax:**
```typescript
const { data, pending, error, refresh } = await useFetch('/api/products', {
  query: { category: 'wine', page: 1 },
  // Key for caching (auto-generated from URL if not provided)
  key: 'products-wine-page-1',
})
```

**Best Practice:**
`useFetch` is essentially a wrapper: `useFetch(url)` ≈ `useAsyncData(url, () => $fetch(url))`

#### useAsyncData
**Official Documentation:** https://nuxt.com/docs/api/composables/use-async-data

**When to Use:**
- Custom logic beyond simple HTTP requests
- Third-party APIs with their own query methods (like Supabase)
- More control over fetching process
- Multiple data sources combined

**Syntax:**
```typescript
const { data, pending, error } = await useAsyncData(
  'products-filtered',
  async () => {
    const supabase = useSupabaseClient()
    const { data } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('active', true)
      .range(0, 23)
    return data
  }
)
```

**Critical Best Practice:**
- Always specify a unique `key` to avoid unwanted cache reuse
- The key should represent the unique state of the data being fetched

### 1.2 Lazy Loading Data

#### useLazyFetch
**Official Documentation:** https://nuxt.com/docs/api/composables/use-lazy-fetch

**Purpose:**
By default, `useFetch` blocks navigation until its async handler is resolved. `useLazyFetch` provides a wrapper that triggers navigation before the handler is resolved by setting `lazy: true`.

**Two Approaches:**

**1. Using lazy option:**
```typescript
const { pending, data: products } = await useFetch('/api/products', {
  lazy: true,
  server: false, // Client-side only if needed
})
```

**2. Using useLazyFetch composable:**
```typescript
const { pending, data: products } = await useLazyFetch('/api/products')
```

**When to Use:**
- Non-critical data (below-the-fold content)
- Data that doesn't affect initial render
- Improved perceived performance

**Important:** You must manually handle loading state using the `pending` value.

**Example for Product Filters:**
```vue
<script setup>
// Critical data - blocks navigation
const { data: products } = await useFetch('/api/products')

// Non-critical data - doesn't block
const { pending, data: filters } = await useLazyFetch('/api/filters')
</script>

<template>
  <div>
    <ProductGrid :products="products" />
    <FilterPanel v-if="!pending" :filters="filters" />
    <FilterSkeleton v-else />
  </div>
</template>
```

### 1.3 Avoiding Double Fetching

**Problem:**
Using `$fetch` in components without wrapping causes double fetching (once on server, once on client).

**Solution:**
```typescript
// ❌ Bad - fetches twice
const products = await $fetch('/api/products')

// ✅ Good - fetches once, hydrates
const { data: products } = await useFetch('/api/products')

// ✅ Good - for custom logic
const { data: products } = await useAsyncData('products', () =>
  $fetch('/api/products')
)
```

**When to Use $fetch:**
- User interactions (button clicks, form submissions)
- Inside server routes (`/server/api/*`)
- When you explicitly want client-only fetching

---

## 2. Route Rules & Hybrid Rendering

### 2.1 Understanding Rendering Modes

**Official Guide:** https://nuxt.com/docs/guide/concepts/rendering

#### SWR (Stale-While-Revalidate)
**Configuration:**
```typescript
// nuxt.config.ts
routeRules: {
  // Cache for 1 hour (3600 seconds)
  '/products': { swr: 3600 },

  // Cache with background revalidation (boolean)
  '/products/**': { swr: true },
}
```

**How It Works:**
- First request: Generates page, caches it
- Subsequent requests: Serves cached version immediately
- Background: Regenerates page asynchronously
- TTL: If number provided, cache expires after N seconds

**Best For:**
- Product listings (frequently accessed, updated periodically)
- Category pages
- Search results

#### ISR (Incremental Static Regeneration)
**Configuration:**
```typescript
routeRules: {
  // ISR with CDN caching (Netlify/Vercel)
  '/products': { isr: 3600 },

  // ISR until next deploy
  '/products/**': { isr: true },
}
```

**Difference from SWR:**
- Adds response to CDN cache on platforms that support it
- If `true`, content persists until next deploy
- Currently supports Netlify and Vercel

**Best For:**
- Static product pages with occasional updates
- Category pages on CDN
- Blog/content pages

#### Combining Strategies
```typescript
export default defineNuxtConfig({
  routeRules: {
    // Homepage: Prerender + SWR
    '/': { prerender: true, swr: 3600 },

    // Products listing: SWR with 1 hour cache
    '/products': { swr: 3600 },

    // Individual products: ISR (rebuild on demand)
    '/products/**': { isr: 3600 },

    // Cart: CSR only (no caching)
    '/cart': { ssr: false },

    // Admin: SSR, no caching
    '/admin/**': { ssr: true },

    // API routes: Custom cache headers
    '/api/products': {
      cache: {
        maxAge: 60 * 60, // 1 hour
        staleMaxAge: 60 * 60 * 24, // 24 hours stale
      }
    }
  }
})
```

### 2.2 Best Practices

**For Product Pages:**
1. **Listing Page:** Use `swr: 3600` (1 hour cache)
2. **Product Details:** Use `isr: 3600` for CDN caching
3. **Cart/Checkout:** Use `ssr: false` (client-only)

**Important Notes:**
- Hybrid Rendering is NOT available with `nuxt generate`
- Always test caching behavior in production environment
- Use network tab to verify cache headers

---

## 3. Nuxt Image Module

### 3.1 Responsive Product Images

**Official Documentation:** https://image.nuxt.com/usage/nuxt-img

#### Basic Product Card Image
```vue
<NuxtImg
  :src="product.image"
  :alt="product.name"
  width="400"
  height="400"
  format="webp"
  quality="80"
  loading="lazy"
  sizes="sm:100vw md:50vw lg:33vw xl:25vw"
/>
```

#### Understanding `sizes` Attribute

**How It Works:**
- Default size applies until next specified screen width
- `md:400px` means image is 400px on md screens and up
- More size options = better optimization

**Product Grid Example:**
```vue
<!-- 4-column grid on desktop, full-width on mobile -->
<NuxtImg
  :src="product.image"
  sizes="100vw sm:50vw md:33vw lg:25vw"
  width="400"
  height="400"
/>
```

**Current Project Configuration (nuxt.config.ts):**
```typescript
image: {
  formats: ['webp', 'avif'],
  quality: 80,
  screens: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
  },
  presets: {
    hero: {
      modifiers: {
        format: 'webp',
        quality: 85,
        fit: 'cover',
      }
    }
  }
}
```

#### Creating Product Preset
```typescript
// nuxt.config.ts
image: {
  presets: {
    product: {
      modifiers: {
        format: 'webp',
        quality: 80,
        fit: 'cover',
        width: 400,
        height: 400,
      }
    },
    productThumb: {
      modifiers: {
        format: 'webp',
        quality: 75,
        width: 200,
        height: 200,
      }
    }
  }
}

// Usage in component
<NuxtImg preset="product" :src="product.image" />
```

### 3.2 High-DPI Displays (Retina)

**Densities Example:**
```vue
<NuxtImg
  :src="product.image"
  width="400"
  height="400"
  densities="x1 x2"
/>

<!-- Generates: -->
<img
  src="/_ipx/w_400/product.jpg"
  srcset="/_ipx/w_400/product.jpg 1x, /_ipx/w_800/product.jpg 2x"
/>
```

### 3.3 Placeholder Images

**Auto-generated Placeholder:**
```vue
<NuxtImg :src="product.image" placeholder />
```

**Custom Placeholder Size:**
```vue
<NuxtImg :src="product.image" :placeholder="[50, 25]" />
```

**With Blur Effect:**
```vue
<NuxtImg
  :src="product.image"
  :placeholder="img(product.image, { h: 10, blur: 2, q: 50 })"
/>
```

### 3.4 Performance Best Practices

**1. Lazy Loading Product Cards:**
```vue
<template>
  <div class="product-grid">
    <!-- First 4 products: eager loading (above fold) -->
    <NuxtImg
      v-for="(product, index) in products.slice(0, 4)"
      :key="product.id"
      :src="product.image"
      loading="eager"
      fetchpriority="high"
    />

    <!-- Remaining products: lazy loading -->
    <NuxtImg
      v-for="product in products.slice(4)"
      :key="product.id"
      :src="product.image"
      loading="lazy"
      fetchpriority="low"
    />
  </div>
</template>
```

**2. Specify Dimensions (Prevent Layout Shift):**
```vue
<!-- ✅ Good - prevents CLS -->
<NuxtImg :src="product.image" width="400" height="400" />

<!-- ❌ Bad - causes layout shift -->
<NuxtImg :src="product.image" />
```

**3. Use Modern Formats:**
```vue
<NuxtImg
  :src="product.image"
  format="webp"
  :modifiers="{ quality: 80 }"
/>
```

---

## 4. Pinia Store Patterns

### 4.1 Setup Store (Recommended for Nuxt 3)

**Official Docs:** https://pinia.vuejs.org/ssr/nuxt.html

**Your Current Store Structure (stores/products.ts):**
- Uses Options API pattern
- Has built-in caching with TTL
- Includes pagination, filters, search

**Setup Store Pattern (Modern Alternative):**
```typescript
// stores/products.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProductWithRelations, ProductFilters, Pagination } from '~/types'

export const useProductsStore = defineStore('products', () => {
  // State (ref)
  const products = ref<ProductWithRelations[]>([])
  const loading = ref(false)
  const filters = ref<ProductFilters>({})
  const pagination = ref<Pagination>({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0
  })

  // Getters (computed)
  const filteredProducts = computed(() => {
    let filtered = [...products.value]

    if (filters.value.inStock) {
      filtered = filtered.filter(p => p.stockQuantity > 0)
    }

    return filtered
  })

  const hasActiveFilters = computed(() => {
    return !!(
      filters.value.category ||
      filters.value.search ||
      filters.value.priceMin
    )
  })

  // Actions (functions)
  async function fetchProducts(newFilters: ProductFilters = {}) {
    loading.value = true

    try {
      const params = new URLSearchParams()
      if (newFilters.category) params.append('category', String(newFilters.category))
      if (newFilters.page) params.append('page', String(newFilters.page))

      const response = await $fetch(`/api/products?${params}`)

      products.value = response.products
      pagination.value = response.pagination
      filters.value = { ...newFilters }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      loading.value = false
    }
  }

  function updateFilters(newFilters: Partial<ProductFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {}
  }

  return {
    // State
    products,
    loading,
    filters,
    pagination,

    // Getters
    filteredProducts,
    hasActiveFilters,

    // Actions
    fetchProducts,
    updateFilters,
    clearFilters,
  }
})
```

### 4.2 Nuxt 3 Integration

**Auto-Import Configuration (nuxt.config.ts):**
```typescript
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  pinia: {
    storesDirs: ['./stores/**'],
  },
})
```

**Auto-imported:**
- `usePinia()` - Better Nuxt integration than `getActivePinia()`
- `defineStore()` - Store definition
- `storeToRefs()` - Extract reactive references
- All stores in `./stores/**`

### 4.3 Using Stores in Components

**Basic Usage:**
```vue
<script setup>
const productsStore = useProductsStore()

// Direct access (loses reactivity when destructured)
const { products, loading } = productsStore

// Reactive access (maintains reactivity)
import { storeToRefs } from 'pinia'
const { products, loading } = storeToRefs(productsStore)

// Actions don't need storeToRefs
const { fetchProducts, updateFilters } = productsStore
</script>
```

**With Data Fetching (callOnce):**
```vue
<script setup>
const productsStore = useProductsStore()

// Prevents redundant requests during SSR/hydration
await callOnce('products', () => productsStore.fetchProducts())
</script>
```

### 4.4 Filter State Management Pattern

**Current Implementation (your products.ts):**
```typescript
// State
filters: ProductFilters
pagination: Pagination

// Actions
updateFilters(newFilters: Partial<ProductFilters>) {
  this.filters = { ...this.filters, ...newFilters }

  // Reset pagination when filters change
  if (newFilters.category !== undefined ||
      newFilters.search !== undefined) {
    this.filters.page = 1
  }
}

// Usage in component
const handleFiltersUpdate = (newFilters: Partial<ProductFilters>) => {
  productsStore.updateFilters(newFilters)
  productsStore.fetchProducts(productsStore.filters)
}
```

**Persistent Filters with localStorage:**
```typescript
// stores/products.ts
import { useStorage } from '@vueuse/core'

export const useProductsStore = defineStore('products', () => {
  // Persist filters to localStorage
  const filters = useStorage<ProductFilters>('product-filters', {
    page: 1,
    limit: 24,
  })

  // Rest of store...
})
```

### 4.5 SSR Compatibility

**Important Notes:**
- `@pinia/nuxt` automatically handles SSR state synchronization
- No manual serialization/hydration needed
- State is serialized on server, hydrated on client

**Avoid Initialization Outside Functions:**
```typescript
// ❌ Bad - fails during SSR
const productsStore = useProductsStore()

export default defineNuxtComponent({
  setup() {
    // Store called before Pinia is ready
  }
})

// ✅ Good - called inside function
export default defineNuxtComponent({
  setup() {
    const productsStore = useProductsStore()
    // Pinia is initialized
  }
})
```

---

## 5. Vue 3 Composition API Patterns

### 5.1 Watching Route Params

**Official Docs:** https://router.vuejs.org/guide/advanced/composition-api.html

**Basic Pattern:**
```vue
<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const productsStore = useProductsStore()

// Watch specific route properties (recommended)
watch(
  () => route.query.category,
  async (newCategory) => {
    if (newCategory) {
      await productsStore.fetchProducts({ category: newCategory })
    }
  }
)

// ❌ Avoid watching entire route object
watch(route, (newRoute) => {
  // This triggers too often
})
</script>
```

**Multiple Query Parameters:**
```vue
<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

watch(
  () => [route.query.category, route.query.sort, route.query.page],
  async ([category, sort, page]) => {
    await productsStore.fetchProducts({
      category,
      sort,
      page: Number(page) || 1,
    })
  }
)
</script>
```

**Navigation Guards:**
```vue
<script setup>
import { onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteUpdate(async (to, from) => {
  // Fetch new data when route params change
  if (to.params.category !== from.params.category) {
    await productsStore.fetchCategory(to.params.category)
  }
})
</script>
```

### 5.2 Computed Filters

**Derived State from Filters:**
```vue
<script setup>
import { computed } from 'vue'

const productsStore = useProductsStore()
const { products, filters } = storeToRefs(productsStore)

// Client-side filtering for immediate feedback
const filteredProducts = computed(() => {
  let result = products.value

  if (filters.value.search) {
    const query = filters.value.search.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    )
  }

  if (filters.value.inStock) {
    result = result.filter(p => p.stockQuantity > 0)
  }

  return result
})
</script>
```

### 5.3 URL Query Synchronization

**Sync Filters with URL:**
```vue
<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()

// Update store from URL on mount
onMounted(() => {
  const urlFilters = {
    category: route.query.category,
    search: route.query.search,
    page: Number(route.query.page) || 1,
  }

  productsStore.updateFilters(urlFilters)
})

// Update URL when filters change
watch(
  () => productsStore.filters,
  (newFilters) => {
    router.push({
      query: {
        ...route.query,
        category: newFilters.category || undefined,
        search: newFilters.search || undefined,
        page: newFilters.page || undefined,
      }
    })
  },
  { deep: true }
)
</script>
```

### 5.4 Provide/Inject Pattern

**Product Context (for nested components):**
```vue
<!-- pages/products/[slug].vue -->
<script setup>
import { provide } from 'vue'

const product = ref<ProductWithRelations>()

// Fetch product
const { data } = await useFetch(`/api/products/${route.params.slug}`)
product.value = data.value

// Provide to child components
provide('product', readonly(product))
</script>

<!-- components/product/Details.vue -->
<script setup>
import { inject } from 'vue'

const product = inject('product')
</script>
```

### 5.5 Virtual Scrolling for Large Lists

**Using vue-virtual-scroller:**

**Installation:**
```bash
pnpm add vue-virtual-scroller@next
```

**Nuxt Plugin (plugins/virtual-scroller.client.ts):**
```typescript
import VirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VirtualScroller)
})
```

**Component Usage:**
```vue
<template>
  <RecycleScroller
    :items="products"
    :item-size="320"
    key-field="id"
    v-slot="{ item }"
  >
    <ProductCard :product="item" />
  </RecycleScroller>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller'

const products = ref([]) // Large array of 1000+ products
</script>
```

**Best Practices:**
1. **Don't make lists reactive:** Avoid wrapping with `ref()`/`reactive()` for best performance
2. **Use Object.freeze():** For Options API
3. **Set accurate item size:** Closer to average = better scrollbar
4. **Use proper keys:** Avoid array indexes

**Current Implementation (your mobile/VirtualProductGrid.vue):**
Your project already has a custom virtual scroller at `/components/mobile/VirtualProductGrid.vue`

---

## 6. TypeScript Patterns

### 6.1 Product Type Definitions

**Your Current Types (types/index.ts):**
```typescript
export type {
  Product,
  ProductImage,
  ProductAttribute,
  ProductWithRelations,
  ProductFilters,
  PriceRange,
  AttributeFilter,
  Pagination,
  ProductListResponse,
  ProductDetailResponse,
}
```

**Extended Product Types:**
```typescript
// types/database.ts
export interface Product {
  id: number
  name: Translations
  slug: string
  description: Translations | null
  price: number
  compareAtPrice: number | null
  costPrice: number | null
  sku: string
  barcode: string | null
  stockQuantity: number
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
  isFeatured: boolean
  isActive: boolean
  weight: number | null
  dimensions: {
    length: number | null
    width: number | null
    height: number | null
  } | null
  createdAt: string
  updatedAt: string
}

export interface ProductWithRelations extends Product {
  categories: Category[]
  images: ProductImage[]
  attributes: ProductAttribute[]
  reviews?: ProductReview[]
  variants?: ProductVariant[]
}

export interface ProductFilters {
  category?: string | number
  search?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  featured?: boolean
  sort?: 'created' | 'name' | 'price_asc' | 'price_desc' | 'featured'
  page?: number
  limit?: number
  attributes?: Record<string, string[]>
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
```

### 6.2 API Response Types

**Type-safe API Responses:**
```typescript
// types/api.ts
export interface ProductListResponse {
  success: boolean
  products: ProductWithRelations[]
  pagination: Pagination
  filters?: ProductFilters
}

export interface ProductDetailResponse {
  success: boolean
  product: ProductWithRelations
  relatedProducts: ProductWithRelations[]
}

export interface SearchResponse {
  success: boolean
  products: ProductWithRelations[]
  suggestions: string[]
  total: number
}
```

**Usage in Components:**
```vue
<script setup lang="ts">
import type { ProductListResponse } from '~/types'

const { data, error } = await useFetch<ProductListResponse>('/api/products', {
  query: {
    category: 'wine',
    page: 1,
  }
})

// Type-safe access
if (data.value) {
  const products = data.value.products // ProductWithRelations[]
  const total = data.value.pagination.total // number
}
</script>
```

### 6.3 Component Prop Types

**Typed Props:**
```vue
<script setup lang="ts">
import type { ProductWithRelations } from '~/types'

interface Props {
  product: ProductWithRelations
  showQuickView?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showQuickView: false,
  loading: false,
})

// Fully typed
const productName = props.product.name.es
</script>
```

### 6.4 Composable Types

**Type-safe Composables:**
```typescript
// composables/useProductCatalog.ts
import type { ProductFilters, ProductWithRelations, Pagination } from '~/types'

export function useProductCatalog() {
  const products = ref<ProductWithRelations[]>([])
  const filters = ref<ProductFilters>({})
  const pagination = ref<Pagination>({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
  })

  async function fetchProducts(
    newFilters: ProductFilters = {}
  ): Promise<void> {
    // Implementation
  }

  return {
    products: readonly(products),
    filters: readonly(filters),
    pagination: readonly(pagination),
    fetchProducts,
  }
}

// Usage with full type inference
const { products, fetchProducts } = useProductCatalog()
```

---

## 7. Supabase Integration

### 7.1 Querying Products with Filters

**Official Docs:** https://supabase.com/docs/reference/javascript/range

**Basic Product Query:**
```typescript
// server/api/products.get.ts
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const query = getQuery(event)

  let dbQuery = supabase
    .from('products')
    .select(`
      *,
      categories:product_categories(
        category:categories(*)
      ),
      images:product_images(*),
      attributes:product_attributes(*)
    `)
    .eq('is_active', true)

  // Apply filters
  if (query.category) {
    dbQuery = dbQuery.eq('category_id', query.category)
  }

  if (query.search) {
    dbQuery = dbQuery.ilike('name', `%${query.search}%`)
  }

  if (query.inStock) {
    dbQuery = dbQuery.gt('stock_quantity', 0)
  }

  // Sorting
  const sort = query.sort || 'created'
  switch (sort) {
    case 'name':
      dbQuery = dbQuery.order('name', { ascending: true })
      break
    case 'price_asc':
      dbQuery = dbQuery.order('price', { ascending: true })
      break
    case 'price_desc':
      dbQuery = dbQuery.order('price', { ascending: false })
      break
    default:
      dbQuery = dbQuery.order('created_at', { ascending: false })
  }

  // Get total count
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  // Pagination
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 24
  const from = (page - 1) * limit
  const to = from + limit - 1

  dbQuery = dbQuery.range(from, to)

  const { data: products, error } = await dbQuery

  if (error) throw error

  return {
    success: true,
    products,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    }
  }
})
```

### 7.2 Pagination Best Practices

**Important:** The `range()` method respects query order. Always use `.order()` before `.range()` for predictable results.

**Pagination Helper:**
```typescript
// utils/pagination.ts
export function calculateRange(page: number, limit: number) {
  const from = (page - 1) * limit
  const to = from + limit - 1
  return { from, to }
}

// Usage
const { from, to } = calculateRange(currentPage, 24)
const { data } = await supabase
  .from('products')
  .select('*')
  .order('created_at', { ascending: false })
  .range(from, to)
```

### 7.3 Advanced Filtering

**Price Range Filter:**
```typescript
let query = supabase.from('products').select('*')

if (priceMin) {
  query = query.gte('price', priceMin)
}

if (priceMax) {
  query = query.lte('price', priceMax)
}
```

**Multiple Categories (OR condition):**
```typescript
if (categoryIds?.length) {
  query = query.in('category_id', categoryIds)
}
```

**Nested Filter (Product Attributes):**
```typescript
// Filter by wine type attribute
query = query.contains('attributes', [
  { key: 'wine_type', value: 'red' }
])
```

### 7.4 Real-time Product Updates

**Subscribe to Changes:**
```vue
<script setup>
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()
const products = ref([])

// Subscribe to product changes
const subscription = supabase
  .channel('products')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'products'
    },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        products.value.push(payload.new)
      } else if (payload.eventType === 'UPDATE') {
        const index = products.value.findIndex(p => p.id === payload.new.id)
        if (index !== -1) {
          products.value[index] = payload.new
        }
      } else if (payload.eventType === 'DELETE') {
        products.value = products.value.filter(p => p.id !== payload.old.id)
      }
    }
  )
  .subscribe()

onUnmounted(() => {
  subscription.unsubscribe()
})
</script>
```

### 7.5 Search Optimization

**Full-Text Search:**
```typescript
// Create text search configuration (run once in Supabase SQL editor)
// ALTER TABLE products ADD COLUMN search_vector tsvector;
// CREATE INDEX products_search_idx ON products USING gin(search_vector);

// Update trigger
// CREATE TRIGGER products_search_update
//   BEFORE INSERT OR UPDATE ON products
//   FOR EACH ROW EXECUTE FUNCTION
//   tsvector_update_trigger(search_vector, 'pg_catalog.english', name, description);

// Query with full-text search
const { data } = await supabase
  .from('products')
  .select('*')
  .textSearch('search_vector', query, {
    type: 'websearch',
    config: 'english'
  })
```

**TypeScript Support:**
```typescript
// Generate types from Supabase schema
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts

// Use in queries
import type { Database } from '~/types/supabase'

const supabase = useSupabaseClient<Database>()
const { data } = await supabase
  .from('products')
  .select('*')

// data is fully typed!
```

---

## 8. SEO & Head Management

### 8.1 Product Listing Page SEO

```vue
<script setup>
const route = useRoute()
const productsStore = useProductsStore()

const seoTitle = computed(() => {
  if (productsStore.filters.category) {
    return `${getCategoryName()} - Moldova Direct`
  }
  return 'Shop Moldovan Wine & Food - Moldova Direct'
})

const seoDescription = computed(() => {
  if (productsStore.filters.category) {
    return `Browse our selection of ${getCategoryName().toLowerCase()}. Authentic Moldovan products delivered to Spain.`
  }
  return 'Browse authentic Moldovan food and wine products. Premium quality directly from Moldova to Spain.'
})

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    { property: 'og:title', content: seoTitle },
    { property: 'og:description', content: seoDescription },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `https://moldovadirect.com${route.path}` },
  ],
  link: [
    { rel: 'canonical', href: `https://moldovadirect.com${route.path}` }
  ]
})

// Or use useSeoMeta for type safety
useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogType: 'website',
  ogUrl: `https://moldovadirect.com${route.path}`,
  twitterCard: 'summary_large_image',
})
</script>
```

### 8.2 Product Detail Page SEO

```vue
<script setup>
const route = useRoute()
const { data: product } = await useFetch(`/api/products/${route.params.slug}`)

if (!product.value) {
  throw createError({ statusCode: 404, message: 'Product not found' })
}

useSeoMeta({
  title: `${product.value.name.en} - Moldova Direct`,
  description: product.value.description?.en || product.value.name.en,
  ogTitle: product.value.name.en,
  ogDescription: product.value.description?.en,
  ogImage: product.value.images[0]?.url,
  ogType: 'product',
  productPrice: product.value.price.toString(),
  productCurrency: 'EUR',
  productAvailability: product.value.stockQuantity > 0 ? 'in stock' : 'out of stock',
})

// Structured data for Google Shopping
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.value.name.en,
        description: product.value.description?.en,
        image: product.value.images.map(img => img.url),
        sku: product.value.sku,
        offers: {
          '@type': 'Offer',
          price: product.value.price,
          priceCurrency: 'EUR',
          availability: product.value.stockQuantity > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        }
      })
    }
  ]
})
</script>
```

---

## 9. Common Patterns & Pitfalls

### 9.1 Infinite Scroll Pattern

```vue
<script setup>
import { useIntersectionObserver } from '@vueuse/core'

const productsStore = useProductsStore()
const { products, pagination, loading } = storeToRefs(productsStore)

const loadMoreTrigger = ref<HTMLElement>()
const canLoadMore = computed(() =>
  pagination.value.page < pagination.value.totalPages && !loading.value
)

useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && canLoadMore.value) {
      productsStore.fetchProducts({
        ...productsStore.filters,
        page: pagination.value.page + 1,
      })
    }
  }
)
</script>

<template>
  <div>
    <ProductCard v-for="product in products" :key="product.id" :product="product" />
    <div ref="loadMoreTrigger" class="h-10" />
    <div v-if="loading" class="text-center">Loading more...</div>
  </div>
</template>
```

### 9.2 Debounced Search

```vue
<script setup>
import { useDebounceFn } from '@vueuse/core'

const searchQuery = ref('')
const productsStore = useProductsStore()

const performSearch = useDebounceFn((query: string) => {
  if (query.trim()) {
    productsStore.searchProducts(query)
  } else {
    productsStore.fetchProducts()
  }
}, 300)

watch(searchQuery, (newQuery) => {
  performSearch(newQuery)
})
</script>

<template>
  <input v-model="searchQuery" type="search" placeholder="Search products..." />
</template>
```

### 9.3 Filter Persistence

```vue
<script setup>
import { useStorage } from '@vueuse/core'

const savedFilters = useStorage<ProductFilters>(
  'product-filters',
  {
    page: 1,
    limit: 24,
  },
  localStorage,
  { mergeDefaults: true }
)

const productsStore = useProductsStore()

onMounted(() => {
  // Restore filters from localStorage
  productsStore.updateFilters(savedFilters.value)
  productsStore.fetchProducts(savedFilters.value)
})

watch(
  () => productsStore.filters,
  (newFilters) => {
    // Save to localStorage
    savedFilters.value = newFilters
  },
  { deep: true }
)
</script>
```

### 9.4 Common Pitfalls

**1. Double Fetching:**
```vue
<!-- ❌ Bad -->
<script setup>
const { data } = await useFetch('/api/products')
const products = await $fetch('/api/products') // Fetches twice!
</script>

<!-- ✅ Good -->
<script setup>
const { data: products } = await useFetch('/api/products')
</script>
```

**2. Not Handling Loading States:**
```vue
<!-- ❌ Bad -->
<script setup>
const { data } = await useLazyFetch('/api/products')
</script>
<template>
  <div>{{ data.products.length }}</div> <!-- Error if data is null -->
</template>

<!-- ✅ Good -->
<script setup>
const { pending, data } = await useLazyFetch('/api/products')
</script>
<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="data">{{ data.products.length }}</div>
</template>
```

**3. Not Specifying Keys:**
```typescript
// ❌ Bad - cache collision
await useFetch('/api/products') // Uses '/api/products' as key
await useFetch('/api/products') // Same key, returns cached data

// ✅ Good - unique keys
await useFetch('/api/products', { key: 'products-all' })
await useFetch('/api/products', {
  key: 'products-wine',
  query: { category: 'wine' }
})
```

**4. Watching Entire Route Object:**
```vue
<!-- ❌ Bad -->
<script setup>
watch(route, () => { /* triggers on every navigation */ })
</script>

<!-- ✅ Good -->
<script setup>
watch(() => route.query.category, () => { /* only when category changes */ })
</script>
```

---

## 10. Implementation Checklist

### Product Listing Page

- [ ] Implement `useFetch` or `useAsyncData` for product fetching
- [ ] Add proper `key` to avoid cache collisions
- [ ] Use `lazy: true` for below-fold content
- [ ] Configure route rules (`swr: 3600`)
- [ ] Implement pagination with Supabase `.range()`
- [ ] Add loading states and skeletons
- [ ] Optimize images with NuxtImg
  - [ ] Use `loading="lazy"` for products below fold
  - [ ] Set `sizes` attribute for responsive images
  - [ ] Add `width` and `height` to prevent CLS
- [ ] Implement filter state management with Pinia
- [ ] Sync filters with URL query params
- [ ] Add debounced search (300ms)
- [ ] Implement SEO meta tags with `useSeoMeta`
- [ ] Add structured data (JSON-LD)

### Performance Optimizations

- [ ] Enable SWR/ISR in route rules
- [ ] Lazy load filter panel
- [ ] Use virtual scrolling for 100+ products
- [ ] Implement infinite scroll (optional)
- [ ] Add filter persistence (localStorage)
- [ ] Optimize Supabase queries (indexes)
- [ ] Use `Object.freeze()` for large product arrays
- [ ] Implement image placeholders

### TypeScript

- [ ] Define product types
- [ ] Type API responses
- [ ] Type component props
- [ ] Generate Supabase types

---

## Resources

### Official Documentation
- **Nuxt 3:** https://nuxt.com/docs
- **Nuxt Image:** https://image.nuxt.com
- **Pinia:** https://pinia.vuejs.org
- **Vue Router:** https://router.vuejs.org
- **Supabase JS:** https://supabase.com/docs/reference/javascript

### Useful Articles
- Nuxt Data Fetching Guide: https://masteringnuxt.com/blog/data-fetching-basics
- Nuxt Rendering Modes: https://blog.risingstack.com/nuxt-3-rendering-modes/
- Pinia Nuxt Integration: https://pinia.vuejs.org/ssr/nuxt.html
- Vue Virtual Scroller: https://github.com/Rootmen/vue3-virtual-scroll-list

### Your Project Structure
```
/stores
  /products.ts              # Main products store (Options API)
  /categories.ts            # Categories store
  /search.ts                # Search store

/pages
  /products
    /index.vue              # Product listing page
    /[slug].vue             # Product detail page

/components
  /product
    /Card.vue               # Product card component
    /Filter/
      /Main.vue             # Filter panel
    /CategoryNavigation.vue # Category navigation
  /mobile
    /VirtualProductGrid.vue # Virtual scroller for mobile

/types
  /index.ts                 # Main types export
  /database.ts              # Database types

/server/api
  /products
    /index.get.ts           # GET /api/products
    /[slug].get.ts          # GET /api/products/:slug
    /price-range.get.ts     # GET /api/products/price-range
```

---

## Next Steps

1. **Review Current Implementation:**
   - Check `/pages/products/index.vue` (currently using Options API patterns)
   - Review `/stores/products.ts` (already has good caching)
   - Analyze filter synchronization with URL

2. **Consider Refactoring:**
   - Convert Pinia store to Setup Stores (optional, for consistency)
   - Add virtual scrolling for products > 100
   - Implement infinite scroll pattern
   - Add filter persistence

3. **Performance Audit:**
   - Test SWR caching in production
   - Measure image loading performance
   - Check Supabase query performance
   - Add database indexes if needed

4. **SEO Enhancements:**
   - Add structured data to product listing
   - Implement breadcrumbs
   - Add canonical URLs
   - Generate XML sitemap

---

**Generated:** 2025-11-09
**For:** Moldova Direct Wine E-commerce
**Version:** Nuxt 3.19.2
