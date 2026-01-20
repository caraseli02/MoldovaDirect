<template>
  <div class="bg-gray-50 dark:bg-gray-950 min-h-screen overflow-x-hidden">
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

    <div
      ref="mainContainer"
      class="relative"
    >
      <!-- Mobile Filter Sheet -->
      <ProductFilterSheet
        v-model="showFilterPanel"
        :title="t('products.filters.title')"
        :active-filter-count="activeFilterChips.length"
        :filtered-count="pagination.total || 0"
        :show-clear-button="hasActiveFilters"
        @apply="handleApplyFilters(true)"
        @clear="clearAllFilters"
      >
        <productFilterMain
          :filters="filters"
          :available-filters="availableFilters"
          :filtered-product-count="pagination.total || 0"
          :show-title="false"
          @update:filters="handleFiltersUpdate"
          @apply-filters="handleApplyFilters(true)"
        />
      </ProductFilterSheet>

      <div
        ref="contentContainer"
        class="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8"
      >
        <div
          ref="scrollContainer"
          class="w-full"
        >
          <MobilePullToRefreshIndicator
            v-if="mobileInteractions.isMobile.value"
            :is-refreshing="mobileInteractions.pullToRefresh.isRefreshing.value"
            :is-pulling="mobileInteractions.pullToRefresh.isPulling.value"
            :can-refresh="mobileInteractions.pullToRefresh.canRefresh.value"
            :pull-distance="mobileInteractions.pullToRefresh.pullDistance.value"
            :status-text="mobileInteractions.pullToRefresh.pullStatusText.value"
            :indicator-style="mobileInteractions.pullToRefresh.pullIndicatorStyle.value"
          />

          <div
            id="results"
            class="space-y-12"
          >
            <!-- Search Bar -->
            <SearchBar
              ref="searchInput"
              :model-value="searchQuery"
              :placeholder="t('common.search') + '...'"
              :clear-label="t('common.clear')"
              @update:model-value="searchQuery = $event"
              @search="handleSearchInput"
              @clear="searchQuery = ''; handleSearchInput()"
            />

            <!-- Products Toolbar -->
            <ProductsToolbar
              :pagination="pagination"
              :sort-by="localSortBy"
              :show-filter-panel="showFilterPanel"
              :active-filter-count="activeFilterChips.length"
              @open-filters="openFilterPanel"
              @sort-change="handleSortChange"
            />

            <!-- Active Filter Chips -->
            <ProductActiveFilters
              v-if="activeFilterChips.length"
              id="product-filters"
              :chips="activeFilterChips"
              :show-clear-all="true"
              @remove-chip="removeActiveChip"
              @clear-all="clearAllFilters"
            />

            <div
              v-if="error"
              class="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm dark:border-red-900/40 dark:bg-gray-900"
            >
              <ErrorState
                :error-message="error"
                @retry="retryLoad"
              />
            </div>

            <LoadingState
              v-else-if="loading"
              :skeleton-count="8"
            />

            <!-- Products Grid -->
            <ProductsGrid
              v-if="products?.length"
              :products="products"
              :pagination="pagination"
              :loading="loading"
              :is-mobile="mobileInteractions.isMobile.value"
              :visible-pages="visiblePages"
              @load-more="loadMoreProducts"
              @go-to-page="goToPage"
            />

            <ProductsEmptyState
              v-else
              :has-active-filters="hasActiveFilters"
              @clear-filters="clearAllFilters"
            />

            <RecentlyViewed :products="recentlyViewedProducts" />

            <EditorialSection :stories="editorialStories" />
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

import type { ProductFilters, ProductWithRelations, CategoryFilter, PriceRange, AttributeFilter } from '~/types'
import type { ProductSortOption } from '~/types/guards'
import type { FilterChip } from '~/composables/useProductFilters'
import { getErrorMessage } from '~/utils/errorUtils'
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// Components
import productFilterMain from '~/components/product/Filter/Main.vue'
import ProductCard from '~/components/product/Card.vue'
import commonIcon from '~/components/common/Icon.vue'
import MobileVirtualProductGrid from '~/components/mobile/VirtualProductGrid.vue'
import MobilePullToRefreshIndicator from '~/components/mobile/PullToRefreshIndicator.vue'
import EditorialSection from '~/components/product/EditorialSection.vue'
import ProductsToolbar from '~/components/product/ProductsToolbar.vue'
import ProductsGrid from '~/components/product/ProductsGrid.vue'
import ProductsEmptyState from '~/components/product/ProductsEmptyState.vue'
import RecentlyViewed from '~/components/product/RecentlyViewed.vue'
import SearchBar from '~/components/product/SearchBar.vue'
import ErrorState from '~/components/product/ErrorState.vue'
import LoadingState from '~/components/product/LoadingState.vue'

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
function debounce<T extends (...args: unknown[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// Get route and router early to access query parameters
const route = useRoute()
const router = useRouter()

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
  ensureFilterPanelInitialized,
  products,
  categoriesTree,
  currentCategory,
  searchQuery,
  filters,
  pagination,
  loading,
  error,
  sortBy,
  showFilterPanel,
} = useProductCatalog() // Re-trigger HMR

// Initialize and fetch products during SSR (using URL params)
// During client hydration, state is restored from SSR payload
await initialize()
await fetchProducts({ sort: 'created', page: initialPage, limit: initialLimit })

// Ensure filter panel state is properly initialized (fixes SSR hydration edge case)
ensureFilterPanelInitialized()

// Filter Management
const {
  activeFilterChips,
  availableFilters,
  removeFilterChip,
  refreshPriceRange,
} = useProductFilters(categoriesTree)

// Pagination UI
const { visiblePages } = useProductPagination(pagination)

// Structured Data (SEO)
const { setupWatchers: setupStructuredDataWatchers } = useProductStructuredData(products, pagination)

// Local state
const searchInput = ref<HTMLInputElement>()
const searchAbortController = ref<AbortController | null>(null)

// Type-safe sort ref
const localSortBy = ref<ProductSortOption>(sortBy.value as ProductSortOption)

// DOM refs
const scrollContainer = ref<HTMLElement>()

// State
const recentlyViewedProducts = useState<ProductWithRelations[]>('recentlyViewedProducts', () => [])

// Computed
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value
    || filters.value.category
    || filters.value.priceMin
    || filters.value.priceMax
    || (filters.value.attributes && Object.keys(filters.value.attributes).length > 0)
    || filters.value.inStock
    || filters.value.featured
  )
})

// Type guard for pagination page (number | string '...')
function isValidPage(page: number | string): page is number {
  return typeof page === 'number'
}

// Debounced search handler to prevent excessive API calls
const handleSearchInput = debounce(() => {
  // Cancel previous search request if it exists
  if (searchAbortController.value) {
    searchAbortController.value.abort()
  }

  // Create new abort controller for this search
  searchAbortController.value = new AbortController()

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), {
      ...filters.value,
      page: 1,
      sort: localSortBy.value,
    }, searchAbortController.value.signal)
  }
  else {
    fetchProducts({
      ...filters.value,
      page: 1,
      sort: localSortBy.value,
    }, searchAbortController.value.signal)
  }
}, 300)

const handleSortChange = () => {
  // Update the store sortBy
  sortBy.value = localSortBy.value

  const currentFilters: ProductFilters = {
    ...filters.value,
    sort: localSortBy.value,
    page: 1,
  }

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), currentFilters)
  }
  else {
    fetchProducts(currentFilters)
  }
}

const handleFiltersUpdate = (newFilters: Partial<ProductFilters>) => {
  updateFilters(newFilters)
}

const handleApplyFilters = (closePanel = false) => {
  const currentFilters: ProductFilters = {
    ...filters.value,
    sort: localSortBy.value,
    page: 1,
  }

  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), currentFilters)
  }
  else {
    fetchProducts(currentFilters)
  }

  if (closePanel) {
    closeFilterPanel()
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  localSortBy.value = 'created'
  sortBy.value = 'created'
  clearFilters()
  fetchProducts({ sort: 'created', page: 1, limit: 12 })
}

/**
 * Navigate to a specific page
 * Handles both search and filter scenarios
 * Validates page boundaries for security
 * Updates URL to keep state in sync
 */
const goToPage = async (page: number) => {
  // Validate page number to prevent attacks
  const validPage = Math.max(1, Math.min(
    Math.floor(page),
    pagination.value.totalPages || 1,
  ))

  if (validPage !== page) {
    console.warn(`Invalid page ${page}, using ${validPage}`)
  }

  // Update URL with new page parameter
  // The URL watcher will handle fetching products automatically
  await router.push({
    query: {
      ...route.query,
      page: validPage.toString(),
      limit: (route.query.limit || '12').toString(),
    },
  })

  // Note: Scroll is handled by the URL watcher after products load
}

/**
 * Refresh product list
 * Used by pull-to-refresh and retry actions
 */
const refreshProducts = async () => {
  try {
    const currentFilters: ProductFilters = {
      ...filters.value,
      sort: localSortBy.value,
      page: 1,
    }

    if (searchQuery.value.trim()) {
      await search(searchQuery.value.trim(), currentFilters)
    }
    else {
      await fetchProducts(currentFilters)
    }
  }
  catch (error: unknown) {
    console.error('Failed to refresh products:', getErrorMessage(error))
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
    get currentPage() { return pagination.value?.page ?? 1 },
    get totalPages() { return pagination.value?.totalPages ?? 1 },
    goToPage,
  },
)

/**
 * Load more products for infinite scroll
 */
const loadMoreProducts = async () => {
  if (loading.value || pagination.value.page >= pagination.value.totalPages) return

  try {
    const nextPage = pagination.value.page + 1
    const currentFilters: ProductFilters = {
      ...filters.value,
      sort: localSortBy.value,
      page: nextPage,
    }

    if (searchQuery.value.trim()) {
      await search(searchQuery.value.trim(), currentFilters)
    }
    else {
      await fetchProducts(currentFilters)
    }
  }
  catch (error: unknown) {
    console.error('Failed to load more products:', getErrorMessage(error))
  }
}

/**
 * Handle filter chip removal
 */
const removeActiveChip = (chip: FilterChip) => {
  const nextFilters = removeFilterChip(chip)
  fetchProducts({ ...nextFilters, page: 1, sort: localSortBy.value })
}

const editorialStories = computed(() => {
  return [
    {
      id: 'wineries',
      title: t('products.editorial.stories.wineries.title'),
      description: t('products.editorial.stories.wineries.description'),
      tag: t('products.editorial.stories.wineries.tag'),
    },
    {
      id: 'pairings',
      title: t('products.editorial.stories.pairings.title'),
      description: t('products.editorial.stories.pairings.description'),
      tag: t('products.editorial.stories.pairings.tag'),
    },
    {
      id: 'heritage',
      title: t('products.editorial.stories.heritage.title'),
      description: t('products.editorial.stories.heritage.description'),
      tag: t('products.editorial.stories.heritage.tag'),
    },
  ]
})

// Watchers
watch(() => filters.value.sort, (newValue) => {
  // Sync filters.sort to local sortBy (read-only sync, no fetch trigger)
  if (newValue && newValue !== localSortBy.value) {
    localSortBy.value = newValue
    sortBy.value = newValue
  }
}, { immediate: false })

watch(mobileInteractions.isMobile, (value) => {
  // Close filter panel when switching to desktop
  if (!value) {
    closeFilterPanel()
  }
})

watch(() => [filters.value.category, filters.value.inStock, filters.value.featured], async () => {
  // Refresh price range when filters change
  await refreshPriceRange()
})

// Watch URL query parameter changes (critical for Vercel production)
// Handles browser back/forward, direct links, and external URL changes
watch(() => route.query.page, async (newPage, oldPage) => {
  // Skip if page hasn't actually changed
  if (newPage === oldPage) return

  // Parse and validate page number
  const pageNum = parseInt((newPage as string) || '1')
  if (isNaN(pageNum)) return

  // Validate page boundaries
  const validPage = Math.max(1, Math.min(pageNum, pagination.value.totalPages || 1))

  // Build filters for fetch
  const currentFilters: ProductFilters = {
    ...filters.value,
    sort: localSortBy.value,
    page: validPage,
  }

  // Fetch products based on current context
  if (searchQuery.value.trim()) {
    await search(searchQuery.value.trim(), currentFilters)
  }
  else {
    await fetchProducts(currentFilters)
  }

  // Scroll to top for better UX
  window.scrollTo({ top: 0, behavior: 'smooth' })
}, { immediate: false })

// Lifecycle Hooks
onMounted(async () => {
  // Sync local sortBy with store
  localSortBy.value = (sortBy.value as ProductSortOption) || 'created'

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
  if (import.meta.client) {
    try {
      // Clean up any products-related session storage
      sessionStorage.removeItem('products-scroll-position')
      sessionStorage.removeItem('products-filter-state')
    }
    catch (error: unknown) {
      console.error('[Product Catalog] Session storage cleanup failed:', getErrorMessage(error))

      // Only ignore SecurityError (private browsing), rethrow others
      if (error instanceof Error && error.name !== 'SecurityError') {
        throw error
      }
    }
  }
})

onUnmounted(() => {
  // Cancel any pending search requests to prevent memory leaks
  if (searchAbortController.value) {
    searchAbortController.value.abort()
    searchAbortController.value = null
  }

  // Cleanup mobile interactions
  mobileInteractions.cleanup()
})
</script>
