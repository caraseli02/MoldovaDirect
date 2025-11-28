<template>
  <div class="bg-gray-50 dark:bg-gray-950 min-h-screen">
    <!-- Skip Links for Accessibility -->
    <div class="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        class="absolute top-0 left-0 z-50 bg-primary-600 text-white px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      <a
        href="#product-filters"
        class="absolute top-0 left-28 z-50 bg-primary-600 text-white px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to filters
      </a>
    </div>

    <!-- Breadcrumb Navigation -->
    <ProductBreadcrumbs
      :current-category="currentCategory"
      :search-query="searchQuery"
    />

    <div class="relative" ref="mainContainer">
      <!-- Mobile Filter Sheet -->
      <ProductFilterSheet
        v-model="showFilterPanel"
        :title="t('products.filters.title')"
        :active-filter-count="activeFilterChips.length"
        :filtered-count="products?.length || 0"
        :show-clear-button="hasActiveFilters"
        @apply="handleApplyFilters(true)"
        @clear="clearAllFilters"
      >
        <productFilterMain
          :filters="filters"
          :available-filters="availableFilters"
          :filtered-product-count="products?.length || 0"
          :show-title="false"
          @update:filters="handleFiltersUpdate"
          @apply-filters="handleApplyFilters(true)"
        />
      </ProductFilterSheet>

      <div class="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8" ref="contentContainer">
        <div class="w-full" ref="scrollContainer">
          <MobilePullToRefreshIndicator
            v-if="mobileInteractions.isMobile.value"
            :is-refreshing="mobileInteractions.pullToRefresh.isRefreshing.value"
            :is-pulling="mobileInteractions.pullToRefresh.isPulling.value"
            :can-refresh="mobileInteractions.pullToRefresh.canRefresh.value"
            :pull-distance="mobileInteractions.pullToRefresh.pullDistance.value"
            :status-text="mobileInteractions.pullToRefresh.pullStatusText.value"
            :indicator-style="mobileInteractions.pullToRefresh.pullIndicatorStyle.value"
          />

          <div id="results" class="space-y-12">
            <!-- Search Bar -->
            <div class="relative">
              <div class="relative">
                <input
                  ref="searchInput"
                  v-model="searchQuery"
                  type="search"
                  :placeholder="t('common.search') + '...'"
                  class="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-600 transition focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-400 dark:focus:ring-primary-400"
                  @input="handleSearchInput"
                />
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  v-if="searchQuery"
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  :aria-label="t('common.clear')"
                  @click="searchQuery = ''; handleSearchInput()"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Clean Header Section -->
            <div class="flex items-end justify-between border-b border-gray-200 pb-6 dark:border-gray-800">
              <div class="flex-1">
                <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-4xl">
                  {{ t('products.discovery.title') }}
                </h1>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {{ t('products.showingResults', {
                    start: ((pagination.page - 1) * pagination.limit) + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total || 0),
                    total: pagination.total || 0
                  }) }}
                </p>
              </div>

              <!-- Right Side Controls -->
              <div class="flex items-center gap-4">
                <!-- Filter Button -->
                <button
                  type="button"
                  :aria-label="t('products.filters.title')"
                  :aria-expanded="showFilterPanel"
                  aria-controls="filter-panel"
                  class="relative inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
                  @click="openFilterPanel"
                >
                  <commonIcon name="lucide:sliders-horizontal" class="h-4 w-4" aria-hidden="true" />
                  <span>{{ t('products.filters.title') }}</span>
                  <span v-if="activeFilterChips.length" class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white ring-2 ring-white dark:ring-gray-900">
                    {{ activeFilterChips.length }}
                  </span>
                </button>

                <!-- Sort Dropdown -->
                <div class="relative">
                  <label for="product-sort" class="sr-only">
                    {{ t('products.sortLabel') }}
                  </label>
                  <select
                    id="product-sort"
                    v-model="sortBy"
                    :aria-label="t('products.sortLabel')"
                    class="h-10 appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    @change="handleSortChange"
                  >
                    <option value="created">{{ t('products.sortNewest') }}</option>
                    <option value="name">{{ t('products.sortName') }}</option>
                    <option value="price_asc">{{ t('products.sortPriceLowHigh') }}</option>
                    <option value="price_desc">{{ t('products.sortPriceHighLow') }}</option>
                    <option value="featured">{{ t('products.sortFeatured') }}</option>
                  </select>
                  <commonIcon name="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" aria-hidden="true" />
                </div>
              </div>
            </div>

            <!-- Active Filter Chips -->
            <ProductActiveFilters
              v-if="activeFilterChips.length"
              id="product-filters"
              :chips="activeFilterChips"
              :show-clear-all="true"
              @remove-chip="removeActiveChip"
              @clear-all="clearAllFilters"
            />

            <div v-if="error" class="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm dark:border-red-900/40 dark:bg-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-4 h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {{ t('common.error') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                {{ error || t('common.errorGeneric') }}
              </p>
              <UiButton type="button" class="rounded-full" @click="retryLoad">
                {{ t('common.tryAgain') }}
              </UiButton>
            </div>

            <div v-else-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <UiCard v-for="n in 8" :key="`skeleton-${n}`">
                <UiCardContent class="p-4">
                  <UiSkeleton class="mb-4 aspect-square rounded-xl" />
                  <UiSkeleton class="mb-2 h-4 w-full" />
                  <UiSkeleton class="h-3 w-2/3" />
                </UiCardContent>
              </UiCard>
            </div>

            <div v-else-if="products?.length" id="main-content" class="space-y-10" role="main">
              <MobileVirtualProductGrid
                v-if="mobileInteractions.isMobile.value && products.length > 20"
                :items="products"
                :container-height="600"
                :loading="loading"
                @load-more="loadMoreProducts"
              />
              <!-- Standard Grid: Clean, predictable layout -->
              <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <ProductCard v-for="product in products" :key="product.id" :product="product" />
              </div>

              <div v-if="pagination.totalPages > 1" class="space-y-4 text-center">
                <p class="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
                  {{ t('products.pagination.pageOf', { page: pagination.page, total: pagination.totalPages }) }} ·
                  {{ t('products.pagination.showing', { count: pagination.total || products.length }) }}
                </p>
                <nav class="flex items-center justify-center gap-2" aria-label="Pagination">
                  <UiButton
                    :disabled="pagination.page <= 1"
                    variant="outline"
                    size="sm"
                    class="rounded-full"
                    :aria-label="t('products.pagination.previousPage')"
                    @click="goToPage(pagination.page - 1)"
                  >
                    {{ t('common.previous') }}
                  </UiButton>
                  <UiButton
                    v-for="page in visiblePages"
                    :key="`page-${page}`"
                    v-if="page !== '...'"
                    size="sm"
                    :variant="page === pagination.page ? 'default' : 'ghost'"
                    class="rounded-full"
                    :class="page === pagination.page ? 'shadow-lg shadow-blue-500/30' : ''"
                    :aria-label="t('products.pagination.goToPage', { page })"
                    :aria-current="page === pagination.page ? 'page' : undefined"
                    @click="goToPage(page as number)"
                  >
                    {{ page }}
                  </UiButton>
                  <span v-else class="px-3 py-2 text-sm text-gray-600" aria-hidden="true">…</span>
                  <UiButton
                    :disabled="pagination.page >= pagination.totalPages"
                    variant="outline"
                    size="sm"
                    class="rounded-full"
                    :aria-label="t('products.pagination.nextPage')"
                    @click="goToPage(pagination.page + 1)"
                  >
                    {{ t('common.next') }}
                  </UiButton>
                </nav>
              </div>
            </div>

            <div v-else class="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-4 h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {{ hasActiveFilters ? t('products.noResults') : t('products.noProducts') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                {{ hasActiveFilters ? t('products.tryDifferentFilters') : t('products.comingSoon') }}
              </p>
              <UiButton v-if="hasActiveFilters" type="button" class="mt-6 rounded-full" @click="clearAllFilters">
                {{ t('products.clearFilters') }}
              </UiButton>
            </div>

            <section v-if="recentlyViewedProducts.length" class="space-y-6">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {{ t('products.recentlyViewed.title') }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ t('products.recentlyViewed.subtitle') }}
                  </p>
                </div>
              </div>
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <ProductCard v-for="item in recentlyViewedProducts" :key="`recent-${item.id}`" :product="item" />
              </div>
            </section>

            <section class="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {{ t('products.editorial.title') }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ t('products.editorial.subtitle') }}
                  </p>
                </div>
              </div>
              <div class="grid gap-4 md:grid-cols-3">
                <article
                  v-for="story in editorialStories"
                  :key="story.id"
                  class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-gray-800"
                >
                  <span class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                    {{ story.tag }}
                  </span>
                  <h4 class="mt-4 text-lg font-semibold text-gray-900 transition group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-200">
                    {{ story.title }}
                  </h4>
                  <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {{ story.description }}
                  </p>
                  <button type="button" class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-800 dark:text-blue-200 dark:hover:text-blue-100">
                    {{ t('products.editorial.cta') }}
                    <span aria-hidden="true">→</span>
                  </button>
                </article>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Product Catalog Page
 *
 * Main product listing page with search, filters, pagination, and mobile interactions.
 * Refactored to follow clean code principles and Single Responsibility Principle.
 *
 * Responsibilities:
 * - Render product catalog UI
 * - Coordinate between composables
 * - Handle user interactions
 */

import type { ProductFilters, ProductWithRelations, ProductSortOption } from '~/types'
import type { FilterChip } from '~/composables/useProductFilters'
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, nextTick, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

// Components
import productFilterMain from '~/components/product/Filter/Main.vue'
import ProductCard from '~/components/product/Card.vue'
import commonIcon from '~/components/common/Icon.vue'
import MobileVirtualProductGrid from '~/components/mobile/VirtualProductGrid.vue'
import MobilePullToRefreshIndicator from '~/components/mobile/PullToRefreshIndicator.vue'

// Composables
import { useProductCatalog } from '~/composables/useProductCatalog'
import { useProductFilters } from '~/composables/useProductFilters'
import { useProductPagination } from '~/composables/useProductPagination'
import { useMobileProductInteractions } from '~/composables/useMobileProductInteractions'
import { useProductStructuredData } from '~/composables/useProductStructuredData'

const { t } = useI18n()

// CRITICAL: Custom debounce implementation (DO NOT replace with VueUse)
//
// Context: useDebounceFn from @vueuse/core caused 500 errors on mobile production (commit ffbe86a)
// Root cause: VueUse's debounce is not SSR-safe and fails during server-side rendering
//
// This implementation:
// - Works correctly in both SSR and client contexts
// - Uses standard setTimeout which is available in all environments
// - Properly cleans up timeouts to prevent memory leaks
//
// Performance: 300ms delay prevents excessive API calls during rapid typing
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function(this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// Get route early to access query parameters
const route = useRoute()

// Parse initial page/limit from URL query parameters with bounds validation
const MAX_LIMIT = 100
const parsedPage = parseInt(route.query.page as string) || 1
const parsedLimit = parseInt(route.query.limit as string) || 12
const initialPage = Math.max(1, parsedPage)
const initialLimit = Math.min(MAX_LIMIT, Math.max(1, parsedLimit))

// Product Catalog Store
const {
  initialize,
  fetchProducts,
  search,
  updateFilters,
  clearFilters,
  openFilterPanel,
  closeFilterPanel,
  products,
  categoriesTree,
  currentCategory,
  searchQuery: storeSearchQuery,
  filters,
  pagination,
  loading,
  error,
  sortBy,
  showFilterPanel
} = useProductCatalog()

// Initialize and fetch products during SSR (using URL params)
await initialize()
await fetchProducts({ sort: 'created', page: initialPage, limit: initialLimit })

// Filter Management
const {
  priceRange,
  hasActiveFilters: hasActiveFiltersComputed,
  activeFilterChips,
  availableFilters,
  getCategoryName,
  removeFilterChip,
  refreshPriceRange
} = useProductFilters(categoriesTree)

// Pagination UI
const { visiblePages } = useProductPagination(pagination)

// Structured Data (SEO)
const { setupWatchers: setupStructuredDataWatchers } = useProductStructuredData(products, pagination)

// Local state
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()
let searchAbortController: AbortController | null = null

// DOM refs
const scrollContainer = ref<HTMLElement>()

// State
const recentlyViewedProducts = useState<ProductWithRelations[]>('recentlyViewedProducts', () => [])

// Computed
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    filters.value.category ||
    filters.value.priceMin ||
    filters.value.priceMax ||
    (filters.value.attributes && Object.keys(filters.value.attributes).length > 0) ||
    filters.value.inStock ||
    filters.value.featured
  )
})

const totalProducts = computed(() => pagination.value?.total || products.value?.length || 0)

// Debounced search handler to prevent excessive API calls
const handleSearchInput = debounce(() => {
  // Cancel previous search request if it exists
  if (searchAbortController) {
    searchAbortController.abort()
  }

  // Create new abort controller for this search
  searchAbortController = new AbortController()

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), {
      ...filters.value,
      page: 1,
      sort: sortBy.value
    }, searchAbortController.signal)
  } else {
    fetchProducts({
      ...filters.value,
      page: 1,
      sort: sortBy.value
    }, searchAbortController.signal)
  }
}, 300)

const handleSortChange = () => {
  const currentFilters = {
    ...filters.value,
    sort: sortBy.value,
    page: 1
  }

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), currentFilters)
  } else {
    fetchProducts(currentFilters)
  }
}

const handleFiltersUpdate = (newFilters: Partial<ProductFilters>) => {
  updateFilters(newFilters)
}

const handleApplyFilters = (closePanel = false) => {
  const currentFilters = {
    ...filters.value,
    sort: sortBy.value,
    page: 1
  }

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), currentFilters)
  } else {
    fetchProducts(currentFilters)
  }

  if (closePanel) {
    closeFilterPanel()
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  sortBy.value = 'created'
  clearFilters()
  fetchProducts({ sort: 'created', page: 1, limit: 12 })
}

/**
 * Navigate to a specific page
 * Handles both search and filter scenarios
 * Validates page boundaries for security
 */
const goToPage = (page: number) => {
  // Validate page number to prevent attacks
  const validPage = Math.max(1, Math.min(
    Math.floor(page),
    pagination.value.totalPages || 1
  ))

  if (validPage !== page) {
    console.warn(`Invalid page ${page}, using ${validPage}`)
  }

  const currentFilters = {
    ...filters.value,
    sort: sortBy.value,
    page: validPage
  }

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), currentFilters)
  } else {
    fetchProducts(currentFilters)
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * Refresh product list
 * Used by pull-to-refresh and retry actions
 */
const refreshProducts = async () => {
  try {
    const currentFilters = {
      ...filters.value,
      sort: sortBy.value,
      page: 1
    }

    if (searchQuery.value.trim()) {
      await search(searchQuery.value.trim(), currentFilters)
    } else {
      await fetchProducts(currentFilters)
    }
  } catch (error) {
    console.error('Failed to refresh products:', error)
  }
}

/**
 * Retry loading products after error
 */
const retryLoad = () => {
  fetchProducts({ sort: 'created', page: 1, limit: 12 })
}

// Mobile Interactions Setup
const mobileInteractions = useMobileProductInteractions(
  scrollContainer,
  refreshProducts,
  {
    currentPage: computed(() => pagination.value.page),
    totalPages: computed(() => pagination.value.totalPages),
    goToPage
  }
)

/**
 * Load more products for infinite scroll
 */
const loadMoreProducts = async () => {
  if (loading.value || pagination.value.page >= pagination.value.totalPages) return

  try {
    const nextPage = pagination.value.page + 1
    const currentFilters = {
      ...filters.value,
      sort: sortBy.value,
      page: nextPage
    }

    if (searchQuery.value.trim()) {
      await search(searchQuery.value.trim(), currentFilters)
    } else {
      await fetchProducts(currentFilters)
    }
  } catch (error) {
    console.error('Failed to load more products:', error)
  }
}

/**
 * Handle filter chip removal
 */
const removeActiveChip = (chip: FilterChip) => {
  const nextFilters = removeFilterChip(chip)
  fetchProducts({ ...nextFilters, page: 1, sort: sortBy.value })
}

const editorialStories = computed(() => {
  return [
    {
      id: 'wineries',
      title: t('products.editorial.stories.wineries.title'),
      description: t('products.editorial.stories.wineries.description'),
      tag: t('products.editorial.stories.wineries.tag')
    },
    {
      id: 'pairings',
      title: t('products.editorial.stories.pairings.title'),
      description: t('products.editorial.stories.pairings.description'),
      tag: t('products.editorial.stories.pairings.tag')
    },
    {
      id: 'heritage',
      title: t('products.editorial.stories.heritage.title'),
      description: t('products.editorial.stories.heritage.description'),
      tag: t('products.editorial.stories.heritage.tag')
    }
  ]
})

// Watchers
watchEffect(() => {
  // Sync store search query to local (read-only sync, no fetch trigger)
  if (storeSearchQuery.value && storeSearchQuery.value !== searchQuery.value) {
    searchQuery.value = storeSearchQuery.value
  }
})

watch(() => filters.value.sort, newValue => {
  // Sync filters.sort to sortBy (read-only sync, no fetch trigger)
  if (newValue && newValue !== sortBy.value) {
    sortBy.value = newValue as string
  }
}, { immediate: false })

watch(mobileInteractions.isMobile, value => {
  // Close filter panel when switching to desktop
  if (!value) {
    closeFilterPanel()
  }
})

watch(() => [filters.value.category, filters.value.inStock, filters.value.featured], async () => {
  // Refresh price range when filters change
  await refreshPriceRange()
})

// Lifecycle Hooks
onMounted(async () => {
  searchQuery.value = storeSearchQuery.value || ''

  // Auto-focus search input if focus=search query parameter is present
  if (route.query.focus === 'search' && searchInput.value) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }

  // Setup mobile interactions
  nextTick(() => {
    mobileInteractions.setup()
  })

  // Fetch dynamic price range
  await refreshPriceRange()

  // Setup structured data watchers for SEO
  setupStructuredDataWatchers()
})

// Cleanup session storage to prevent accumulation over multiple navigations
onBeforeUnmount(() => {
  if (process.client) {
    try {
      // Clean up any products-related session storage
      sessionStorage.removeItem('products-scroll-position')
      sessionStorage.removeItem('products-filter-state')
    } catch (error) {
      // Silently fail if session storage is unavailable
      console.debug('Session storage cleanup failed:', error)
    }
  }
})

onUnmounted(() => {
  // Cancel any pending search requests to prevent memory leaks
  if (searchAbortController) {
    searchAbortController.abort()
    searchAbortController = null
  }

  // Cleanup mobile interactions
  mobileInteractions.cleanup()
})
</script>
