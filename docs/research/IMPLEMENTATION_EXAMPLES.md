# Implementation Examples for Moldova Direct

Based on your current project structure and stack.

---

## 1. Refactoring Products Store to Setup Stores

### Current (Options API)
Your `/stores/products.ts` uses Options API pattern.

### Proposed (Setup Stores - Modern)

```typescript
// stores/products.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ProductWithRelations,
  CategoryWithChildren,
  ProductFilters,
  Pagination,
  ProductListResponse,
  ProductDetailResponse,
} from '~/types'

export const useProductsStore = defineStore('products', () => {
  // ========== STATE ==========
  const products = ref<ProductWithRelations[]>([])
  const currentProduct = ref<ProductWithRelations | null>(null)
  const featuredProducts = ref<ProductWithRelations[]>([])
  const relatedProducts = ref<ProductWithRelations[]>([])

  const categories = ref<CategoryWithChildren[]>([])
  const currentCategory = ref<CategoryWithChildren | null>(null)

  const filters = ref<ProductFilters>({})
  const searchQuery = ref('')
  const searchResults = ref<ProductWithRelations[]>([])
  const searchSuggestions = ref<string[]>([])

  const pagination = ref<Pagination>({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
  })

  const loading = ref(false)
  const searchLoading = ref(false)
  const categoryLoading = ref(false)

  const error = ref<string | null>(null)
  const searchError = ref<string | null>(null)

  const cache = ref(new Map<string, { data: any; timestamp: number; ttl: number }>())

  // ========== GETTERS ==========
  const filteredProducts = computed(() => {
    let filtered = [...products.value]

    if (filters.value.search) {
      const query = filters.value.search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.es?.toLowerCase().includes(query) ||
        product.name.en?.toLowerCase().includes(query) ||
        product.description?.es?.toLowerCase().includes(query) ||
        product.description?.en?.toLowerCase().includes(query)
      )
    }

    if (filters.value.inStock) {
      filtered = filtered.filter(product => product.stockQuantity > 0)
    }

    if (filters.value.featured) {
      filtered = filtered.filter(product => product.isFeatured)
    }

    return filtered
  })

  const categoriesTree = computed(() => {
    const buildTree = (cats: CategoryWithChildren[], parentId?: number): CategoryWithChildren[] => {
      return cats
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cats, cat.id),
        }))
    }

    return buildTree(categories.value)
  })

  const hasActiveFilters = computed(() => {
    return !!(
      filters.value.category ||
      filters.value.search ||
      filters.value.priceMin ||
      filters.value.priceMax ||
      filters.value.inStock ||
      filters.value.featured ||
      (filters.value.attributes && Object.keys(filters.value.attributes).length > 0)
    )
  })

  // ========== ACTIONS ==========

  // Cache management
  function setCache(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    cache.value.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  function getCache(key: string): any | null {
    const cached = cache.value.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      cache.value.delete(key)
      return null
    }

    return cached.data
  }

  function clearCache(pattern?: string) {
    if (pattern) {
      for (const key of cache.value.keys()) {
        if (key.includes(pattern)) {
          cache.value.delete(key)
        }
      }
    } else {
      cache.value.clear()
    }
  }

  // Fetch products with filters
  async function fetchProducts(newFilters: ProductFilters = {}) {
    loading.value = true
    error.value = null

    try {
      const cacheKey = `products-${JSON.stringify(newFilters)}`
      const cached = getCache(cacheKey)

      if (cached) {
        products.value = cached.products
        pagination.value = cached.pagination
        filters.value = { ...newFilters }
        loading.value = false
        return
      }

      const params = new URLSearchParams()
      if (newFilters.category) params.append('category', String(newFilters.category))
      if (newFilters.search) params.append('search', newFilters.search)
      if (newFilters.priceMin) params.append('priceMin', String(newFilters.priceMin))
      if (newFilters.priceMax) params.append('priceMax', String(newFilters.priceMax))
      if (newFilters.inStock) params.append('inStock', 'true')
      if (newFilters.featured) params.append('featured', 'true')
      if (newFilters.sort) params.append('sort', newFilters.sort)
      if (newFilters.page) params.append('page', String(newFilters.page))
      if (newFilters.limit) params.append('limit', String(newFilters.limit))

      const response = await $fetch<ProductListResponse>(`/api/products?${params}`)

      products.value = response.products
      pagination.value = response.pagination
      filters.value = { ...newFilters }

      setCache(cacheKey, {
        products: response.products,
        pagination: response.pagination,
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch products'
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  // Update filters
  function updateFilters(newFilters: Partial<ProductFilters>) {
    filters.value = { ...filters.value, ...newFilters }

    if (
      newFilters.category !== undefined ||
      newFilters.search !== undefined ||
      newFilters.priceMin !== undefined ||
      newFilters.priceMax !== undefined ||
      newFilters.attributes !== undefined
    ) {
      filters.value.page = 1
    }
  }

  // Clear filters
  function clearFilters() {
    filters.value = {}
    searchQuery.value = ''
    searchResults.value = []
  }

  // Return public API
  return {
    // State
    products: readonly(products),
    currentProduct: readonly(currentProduct),
    featuredProducts: readonly(featuredProducts),
    relatedProducts: readonly(relatedProducts),
    categories: readonly(categories),
    currentCategory: readonly(currentCategory),
    filters: readonly(filters),
    searchQuery: readonly(searchQuery),
    pagination: readonly(pagination),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    filteredProducts,
    categoriesTree,
    hasActiveFilters,

    // Actions
    fetchProducts,
    updateFilters,
    clearFilters,
    setCache,
    getCache,
    clearCache,
  }
})
```

### Benefits
- Better TypeScript inference
- Consistent with Vue 3 Composition API
- Cleaner, less boilerplate
- Easier to extract logic into composables

---

## 2. Optimized Product Card Component

```vue
<!-- components/product/Card.vue -->
<template>
  <article
    class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
  >
    <NuxtLink :to="`/products/${product.slug}`" class="block">
      <!-- Product Image -->
      <div class="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <NuxtImg
          :src="product.images[0]?.url || '/images/placeholder-product.jpg'"
          :alt="product.name[locale] || product.name.es"
          :width="400"
          :height="400"
          format="webp"
          :loading="eagerLoad ? 'eager' : 'lazy'"
          :fetchpriority="eagerLoad ? 'high' : 'low'"
          sizes="sm:100vw md:50vw lg:33vw xl:25vw"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          placeholder
        />

        <!-- Stock Badge -->
        <div v-if="product.stockQuantity === 0" class="absolute left-3 top-3">
          <span class="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
            {{ t('products.outOfStock') }}
          </span>
        </div>

        <!-- Featured Badge -->
        <div v-if="product.isFeatured" class="absolute right-3 top-3">
          <span class="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
            {{ t('products.featured') }}
          </span>
        </div>
      </div>

      <!-- Product Info -->
      <div class="p-4">
        <h3 class="mb-2 text-lg font-semibold text-gray-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {{ product.name[locale] || product.name.es }}
        </h3>

        <p v-if="product.description" class="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {{ product.description[locale] || product.description.es }}
        </p>

        <!-- Price -->
        <div class="flex items-center gap-2">
          <span class="text-xl font-bold text-gray-900 dark:text-white">
            €{{ product.price.toFixed(2) }}
          </span>
          <span v-if="product.compareAtPrice && product.compareAtPrice > product.price" class="text-sm text-gray-500 line-through">
            €{{ product.compareAtPrice.toFixed(2) }}
          </span>
        </div>

        <!-- Quick Add Button -->
        <UiButton
          v-if="product.stockQuantity > 0"
          type="button"
          class="mt-4 w-full"
          @click.prevent="handleAddToCart"
        >
          {{ t('products.addToCart') }}
        </UiButton>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '~/stores/cart'
import { toast } from 'vue-sonner'

interface Props {
  product: ProductWithRelations
  eagerLoad?: boolean // First few products should eager load
}

const props = withDefaults(defineProps<Props>(), {
  eagerLoad: false,
})

const { t, locale } = useI18n()
const cartStore = useCartStore()

const handleAddToCart = async () => {
  try {
    await cartStore.addItem({
      productId: props.product.id,
      quantity: 1,
    })

    toast.success(t('cart.itemAdded', { name: props.product.name[locale.value] }))
  } catch (error) {
    toast.error(t('cart.addFailed'))
  }
}
</script>
```

### Usage in Product Grid

```vue
<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <!-- First 4 products: eager load (above fold) -->
    <ProductCard
      v-for="(product, index) in products.slice(0, 4)"
      :key="product.id"
      :product="product"
      :eager-load="true"
    />

    <!-- Remaining products: lazy load -->
    <ProductCard
      v-for="product in products.slice(4)"
      :key="product.id"
      :product="product"
    />
  </div>
</template>
```

---

## 3. Enhanced Filter Component with URL Sync

```vue
<!-- components/product/Filter/Enhanced.vue -->
<template>
  <aside class="space-y-6">
    <div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('products.filters.categories') }}</h3>
      <CategoryTree
        :categories="categories"
        :selected-id="filters.category"
        @select="handleCategorySelect"
      />
    </div>

    <div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('products.filters.price') }}</h3>
      <PriceRangeSlider
        :min="priceRange.min"
        :max="priceRange.max"
        :value="[filters.priceMin || priceRange.min, filters.priceMax || priceRange.max]"
        @update="handlePriceUpdate"
      />
    </div>

    <div>
      <h3 class="mb-4 text-lg font-semibold">{{ t('products.filters.availability') }}</h3>
      <UiCheckbox
        :checked="!!filters.inStock"
        @update:checked="handleInStockToggle"
      >
        {{ t('products.filters.inStockOnly') }}
      </UiCheckbox>
    </div>

    <div>
      <UiButton
        type="button"
        variant="outline"
        class="w-full"
        @click="handleClearFilters"
      >
        {{ t('products.filters.clearAll') }}
      </UiButton>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '~/stores/products'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'

interface Props {
  categories: any[]
  priceRange: { min: number; max: number }
}

const props = defineProps<Props>()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const productsStore = useProductsStore()
const { filters } = storeToRefs(productsStore)

// Initialize filters from URL on mount
onMounted(() => {
  const urlFilters = {
    category: route.query.category ? Number(route.query.category) : undefined,
    priceMin: route.query.priceMin ? Number(route.query.priceMin) : undefined,
    priceMax: route.query.priceMax ? Number(route.query.priceMax) : undefined,
    inStock: route.query.inStock === 'true',
    page: route.query.page ? Number(route.query.page) : 1,
  }

  productsStore.updateFilters(urlFilters)
  productsStore.fetchProducts(urlFilters)
})

// Debounced URL update
const updateURL = useDebounceFn((newFilters: any) => {
  router.push({
    query: {
      ...route.query,
      category: newFilters.category || undefined,
      priceMin: newFilters.priceMin || undefined,
      priceMax: newFilters.priceMax || undefined,
      inStock: newFilters.inStock || undefined,
      page: newFilters.page || undefined,
    },
  })
}, 300)

// Watch filters and update URL
watch(
  () => filters.value,
  (newFilters) => {
    updateURL(newFilters)
  },
  { deep: true }
)

function handleCategorySelect(categoryId: number) {
  productsStore.updateFilters({ category: categoryId, page: 1 })
  productsStore.fetchProducts(filters.value)
}

function handlePriceUpdate([min, max]: [number, number]) {
  productsStore.updateFilters({ priceMin: min, priceMax: max, page: 1 })
  productsStore.fetchProducts(filters.value)
}

function handleInStockToggle(checked: boolean) {
  productsStore.updateFilters({ inStock: checked, page: 1 })
  productsStore.fetchProducts(filters.value)
}

function handleClearFilters() {
  productsStore.clearFilters()
  productsStore.fetchProducts({ page: 1, limit: 24 })
  router.push({ query: {} })
}
</script>
```

---

## 4. Server API Route with Supabase

```typescript
// server/api/products/index.get.ts
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const query = getQuery(event)

  try {
    // Build base query
    let productsQuery = supabase
      .from('products')
      .select(`
        *,
        categories:product_categories!inner(
          category:categories(*)
        ),
        images:product_images(*),
        attributes:product_attributes(*)
      `, { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (query.category) {
      productsQuery = productsQuery.eq('product_categories.category_id', Number(query.category))
    }

    if (query.search) {
      productsQuery = productsQuery.or(`
        name->>es.ilike.%${query.search}%,
        name->>en.ilike.%${query.search}%,
        description->>es.ilike.%${query.search}%,
        description->>en.ilike.%${query.search}%
      `)
    }

    if (query.priceMin) {
      productsQuery = productsQuery.gte('price', Number(query.priceMin))
    }

    if (query.priceMax) {
      productsQuery = productsQuery.lte('price', Number(query.priceMax))
    }

    if (query.inStock === 'true') {
      productsQuery = productsQuery.gt('stock_quantity', 0)
    }

    if (query.featured === 'true') {
      productsQuery = productsQuery.eq('is_featured', true)
    }

    // Sorting
    const sort = query.sort || 'created'
    switch (sort) {
      case 'name':
        productsQuery = productsQuery.order('name->es', { ascending: true })
        break
      case 'price_asc':
        productsQuery = productsQuery.order('price', { ascending: true })
        break
      case 'price_desc':
        productsQuery = productsQuery.order('price', { ascending: false })
        break
      case 'featured':
        productsQuery = productsQuery
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
        break
      default:
        productsQuery = productsQuery.order('created_at', { ascending: false })
    }

    // Pagination
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 24
    const from = (page - 1) * limit
    const to = from + limit - 1

    productsQuery = productsQuery.range(from, to)

    // Execute query
    const { data: products, error, count } = await productsQuery

    if (error) {
      throw createError({
        statusCode: 500,
        message: error.message,
      })
    }

    // Set cache headers
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    })

    return {
      success: true,
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      filters: {
        category: query.category,
        search: query.search,
        priceMin: query.priceMin,
        priceMax: query.priceMax,
        inStock: query.inStock,
        featured: query.featured,
        sort,
      },
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch products',
    })
  }
})
```

---

## 5. Infinite Scroll Implementation

```vue
<!-- pages/products/infinite.vue -->
<template>
  <div class="space-y-10">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ProductCard
        v-for="(product, index) in allProducts"
        :key="product.id"
        :product="product"
        :eager-load="index < 4"
      />
    </div>

    <!-- Intersection observer target -->
    <div ref="loadMoreTrigger" class="flex h-20 items-center justify-center">
      <div v-if="loading" class="flex items-center gap-2">
        <div class="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        <span class="text-gray-600">{{ t('products.loadingMore') }}</span>
      </div>
      <div v-else-if="hasMore" class="text-gray-500">
        {{ t('products.scrollToLoadMore') }}
      </div>
      <div v-else class="text-gray-400">
        {{ t('products.allLoaded') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import type { ProductWithRelations } from '~/types'

const { t } = useI18n()

const allProducts = ref<ProductWithRelations[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const loadMoreTrigger = ref<HTMLElement>()

const hasMore = computed(() => currentPage.value < totalPages.value)

async function loadProducts(page: number) {
  if (loading.value) return

  loading.value = true

  try {
    const { data } = await $fetch('/api/products', {
      query: {
        page,
        limit: 24,
      },
    })

    if (data) {
      if (page === 1) {
        allProducts.value = data.products
      } else {
        allProducts.value.push(...data.products)
      }

      totalPages.value = data.pagination.totalPages
      currentPage.value = page
    }
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
  }
}

// Load initial products
await loadProducts(1)

// Set up intersection observer
useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasMore.value && !loading.value) {
      loadProducts(currentPage.value + 1)
    }
  },
  {
    threshold: 0.5,
  }
)
</script>
```

---

## 6. SEO-Optimized Product Detail Page

```vue
<!-- pages/products/[slug].vue -->
<template>
  <div v-if="product" class="mx-auto max-w-7xl px-4 py-10">
    <!-- Product content -->
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t, locale } = useI18n()
const config = useRuntimeConfig()

// Fetch product
const { data: product, error } = await useFetch(`/api/products/${route.params.slug}`, {
  key: `product-${route.params.slug}`,
})

if (error.value || !product.value) {
  throw createError({
    statusCode: 404,
    message: 'Product not found',
  })
}

// SEO Meta Tags
const productName = computed(() => product.value?.name[locale.value] || product.value?.name.es)
const productDescription = computed(() => product.value?.description?.[locale.value] || product.value?.description?.es)
const productImage = computed(() => product.value?.images[0]?.url)

useSeoMeta({
  title: `${productName.value} - Moldova Direct`,
  description: productDescription.value || `Buy ${productName.value} from Moldova Direct`,
  ogTitle: productName.value,
  ogDescription: productDescription.value,
  ogImage: productImage.value,
  ogType: 'product',
  ogUrl: `${config.public.siteUrl}${route.path}`,
  twitterCard: 'summary_large_image',
  twitterTitle: productName.value,
  twitterDescription: productDescription.value,
  twitterImage: productImage.value,
})

// Structured Data (JSON-LD)
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productName.value,
        description: productDescription.value,
        image: product.value?.images.map(img => img.url),
        sku: product.value?.sku,
        brand: {
          '@type': 'Brand',
          name: 'Moldova Direct',
        },
        offers: {
          '@type': 'Offer',
          price: product.value?.price,
          priceCurrency: 'EUR',
          availability: product.value?.stockQuantity > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: `${config.public.siteUrl}${route.path}`,
        },
        aggregateRating: product.value?.reviews?.length > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: calculateAverageRating(product.value.reviews),
          reviewCount: product.value.reviews.length,
        } : undefined,
      }),
    },
  ],
})

function calculateAverageRating(reviews: any[]) {
  if (!reviews.length) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return (sum / reviews.length).toFixed(1)
}
</script>
```

---

## Implementation Priority

1. **High Priority**
   - [ ] Optimize product images (eager/lazy loading)
   - [ ] Add proper cache headers in API routes
   - [ ] Implement URL sync for filters
   - [ ] Add SEO meta tags and structured data

2. **Medium Priority**
   - [ ] Refactor store to Setup Stores (optional)
   - [ ] Add infinite scroll (alternative to pagination)
   - [ ] Implement filter persistence
   - [ ] Add real-time stock updates

3. **Low Priority**
   - [ ] Virtual scrolling for 100+ products
   - [ ] Advanced search with autocomplete
   - [ ] Product comparison feature
   - [ ] Wishlist functionality

---

**Files to Update:**
- `/stores/products.ts` - Consider Setup Stores refactor
- `/pages/products/index.vue` - Add URL sync and optimization
- `/components/product/Card.vue` - Optimize images
- `/server/api/products/index.get.ts` - Add cache headers
- `/nuxt.config.ts` - Already configured well!

**New Files to Create:**
- `/components/product/InfiniteScroll.vue` - Infinite scroll variant
- `/server/api/products/price-range.get.ts` - Dynamic price range (already exists!)
