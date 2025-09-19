<template>
  <div>
    <!-- Category Navigation -->
    <ProductCategoryNavigation
      :categories="categoriesTree"
      :current-category="currentCategory"
      :show-product-count="true"
    />

    <div class="flex min-h-screen bg-gray-50 dark:bg-gray-900" ref="mainContainer">
      <!-- Product Filter Sidebar -->
      <productFilterMain
        :filters="filters"
        :available-filters="availableFilters"
        :filtered-product-count="products?.length || 0"
        @update:filters="handleFiltersUpdate"
        @apply-filters="handleApplyFilters"
      />

      <!-- Main Content -->
      <div class="flex-1" ref="contentContainer">
        <!-- Pull to Refresh Indicator (Mobile Only) -->
        <MobilePullToRefreshIndicator
          v-if="isMobile"
          :is-refreshing="pullToRefresh.isRefreshing.value"
          :is-pulling="pullToRefresh.isPulling.value"
          :can-refresh="pullToRefresh.canRefresh.value"
          :pull-distance="pullToRefresh.pullDistance.value"
          :status-text="pullToRefresh.pullStatusText.value"
          :indicator-style="pullToRefresh.pullIndicatorStyle.value"
        />
        
        <div class="p-6 lg:p-8" ref="scrollContainer">
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{{ $t('common.shop') }}</h1>
            <p class="text-gray-600 dark:text-gray-400">{{ $t('products.browseDescription') }}</p>
          </div>

          <!-- Search and Sort Bar -->
          <div class="mb-8">
            <div class="flex flex-col sm:flex-row gap-4 mb-6">
              <!-- Search -->
              <div class="flex-1">
                <div class="relative">
                  <commonIcon
                    v-if="!loading"
                    name="heroicons:magnifying-glass"
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                  />
                  <div 
                    v-else 
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  >
                    <svg class="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="$t('products.searchPlaceholder')"
                    :disabled="loading"
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    @input="handleSearchInput"
                  />
                </div>
              </div>
              
              <!-- Sort -->
              <div class="sm:w-48">
                <select
                  v-model="sortBy"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  @change="handleSortChange"
                >
                  <option value="created">{{ $t('products.sortNewest') }}</option>
                  <option value="name">{{ $t('products.sortName') }}</option>
                  <option value="price_asc">{{ $t('products.sortPriceLowHigh') }}</option>
                  <option value="price_desc">{{ $t('products.sortPriceHighLow') }}</option>
                  <option value="featured">{{ $t('products.sortFeatured') }}</option>
                </select>
              </div>
            </div>

            <!-- Results Summary -->
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {{ $t('products.showingResults', { 
                  start: ((pagination.page - 1) * pagination.limit) + 1,
                  end: Math.min(pagination.page * pagination.limit, pagination.total || 0),
                  total: pagination.total || 0
                }) }}
              </span>
              <span v-if="hasActiveFilters">
                {{ $t('products.filtersApplied') }}
                <button @click="clearAllFilters" class="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  {{ $t('products.clearFilters') }}
                </button>
              </span>
            </div>
          </div>

      <!-- Error State -->
      <div v-if="error" class="text-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ $t('common.error') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ error || $t('common.errorGeneric') }}
        </p>
        <button 
          @click="retryLoad" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {{ $t('common.tryAgain') }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="n" class="animate-pulse">
          <div class="bg-gray-200 aspect-square rounded-lg mb-4"></div>
          <div class="h-4 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else-if="products?.length" class="mb-8">
        <!-- Virtual scrolling for mobile -->
        <MobileVirtualProductGrid
          v-if="isMobile && products.length > 20"
          :items="products"
          :container-height="600"
          :loading="loading"
          @load-more="loadMoreProducts"
        />
        
        <!-- Regular grid for desktop or small lists -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ hasActiveFilters ? $t('products.noResults') : $t('products.noProducts') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ hasActiveFilters ? $t('products.tryDifferentFilters') : $t('products.comingSoon') }}
        </p>
        <button v-if="hasActiveFilters" @click="clearAllFilters" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {{ $t('products.clearFilters') }}
        </button>
      </div>

          <!-- Pagination -->
          <div v-if="products?.length && pagination.totalPages > 1" class="flex justify-center">
            <nav class="flex items-center space-x-2">
              <button
                :disabled="pagination.page <= 1"
                @click="goToPage(pagination.page - 1)"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {{ $t('common.previous') }}
              </button>
              
              <span v-for="page in visiblePages" :key="page">
                <button
                  v-if="page !== '...'"
                  :class="[
                    'px-3 py-2 border rounded-lg',
                    page === pagination.page ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  ]"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <span v-else class="px-3 py-2">...</span>
              </span>
              
              <button
                :disabled="pagination.page >= pagination.totalPages"
                @click="goToPage(pagination.page + 1)"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {{ $t('common.next') }}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductFilters } from '~/types'

// Component imports
import ProductCategoryNavigation from '~/components/product/CategoryNavigation.vue'
import productFilterMain from '~/components/product/Filter/Main.vue'
import ProductCard from '~/components/product/Card.vue'
import commonIcon from '~/components/common/Icon.vue'
import MobileVirtualProductGrid from '~/components/mobile/VirtualProductGrid.vue'

// Mobile-specific imports
import MobilePullToRefreshIndicator from '~/components/mobile/PullToRefreshIndicator.vue'

// Use product catalog composable for integrated functionality
const {
  // Initialization
  initialize,
  
  // Product operations
  fetchProducts,
  
  // Search operations
  search,
  
  // Category operations
  fetchCategories,
  setCurrentCategory,
  
  // Filter operations
  updateFilters,
  clearFilters,
  
  // Reactive state
  products,
  categories,
  categoriesTree,
  currentCategory,
  
  searchResults,
  searchQuery: storeSearchQuery,
  
  filters,
  pagination,
  loading,
  error
} = useProductCatalog()

// Local reactive state for UI
const searchQuery = ref('')
const sortBy = ref<string>('created')

// Mobile functionality
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()

// Template refs
const mainContainer = ref<HTMLElement>()
const contentContainer = ref<HTMLElement>()
const scrollContainer = ref<HTMLElement>()

// Pull to refresh functionality
const pullToRefresh = usePullToRefresh(async () => {
  vibrate('pullRefresh')
  await refreshProducts()
})

// Swipe gestures for navigation
const swipeGestures = useSwipeGestures()

// Initialize the catalog
await initialize()

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    filters.value.categoryId ||
    filters.value.priceMin ||
    filters.value.priceMax ||
    (filters.value.attributes && Object.keys(filters.value.attributes).length > 0) ||
    filters.value.inStock
  )
})

// Available filters for ProductFilter component
const availableFilters = computed(() => {
  // Convert CategoryWithChildren to CategoryFilter format
  const convertCategories = (cats: any[]): any[] => {
    return cats.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productCount: cat.productCount || 0,
      children: cat.children ? convertCategories(cat.children) : []
    }))
  }

  return {
    categories: convertCategories(categoriesTree.value || []),
    priceRange: {
      min: 0,
      max: 200 // TODO: Get from API or calculate from products
    },
    attributes: [] // TODO: Get available attributes from API
  }
})

// Pagination helpers
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = pagination.value.totalPages
  const current = pagination.value.page
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    
    if (current > 4) {
      pages.push('...')
    }
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 3) {
      pages.push('...')
    }
    
    if (total > 1) {
      pages.push(total)
    }
  }
  
  return pages
})

// Debounce utility
let searchTimeout: NodeJS.Timeout

// Event handlers
const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim()) {
      search(searchQuery.value.trim(), {
        ...filters.value,
        page: 1,
        sortBy: sortBy.value as any
      })
    } else {
      fetchProducts({
        ...filters.value,
        page: 1,
        sortBy: sortBy.value as any
      })
    }
  }, 300)
}

const handleSortChange = () => {
  const currentFilters = {
    ...filters.value,
    sortBy: sortBy.value as any,
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

const handleApplyFilters = () => {
  const currentFilters = {
    ...filters.value,
    sortBy: sortBy.value as any,
    page: 1
  }
  
  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), currentFilters)
  } else {
    fetchProducts(currentFilters)
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  sortBy.value = 'created'
  clearFilters()
  fetchProducts({ sortBy: 'created', page: 1, limit: 12 })
}

const goToPage = (page: number) => {
  const currentFilters = {
    ...filters.value,
    sortBy: sortBy.value as any,
    page
  }
  
  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim(), currentFilters)
  } else {
    fetchProducts(currentFilters)
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Refresh products function
const refreshProducts = async () => {
  try {
    const currentFilters = {
      ...filters.value,
      sortBy: sortBy.value as any,
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

// Error handling
const retryLoad = () => {
  fetchProducts({ sortBy: 'created', page: 1, limit: 12 })
}

// Setup mobile interactions
const setupMobileInteractions = () => {
  if (!isMobile.value || !scrollContainer.value) return
  
  // Setup pull to refresh
  pullToRefresh.setupPullToRefresh(scrollContainer.value)
  
  // Setup swipe gestures for navigation
  swipeGestures.setupSwipeListeners(scrollContainer.value)
  swipeGestures.setSwipeHandlers({
    onLeft: () => {
      // Navigate to next page if available
      if (pagination.value.page < pagination.value.totalPages) {
        goToPage(pagination.value.page + 1)
      }
    },
    onRight: () => {
      // Navigate to previous page if available
      if (pagination.value.page > 1) {
        goToPage(pagination.value.page - 1)
      }
    }
  })
}

// Cleanup mobile interactions
const cleanupMobileInteractions = () => {
  pullToRefresh.cleanupPullToRefresh()
  swipeGestures.cleanupSwipeListeners()
}

// Load more products for virtual scrolling
const loadMoreProducts = async () => {
  if (loading.value || pagination.value.page >= pagination.value.totalPages) return
  
  try {
    const nextPage = pagination.value.page + 1
    const currentFilters = {
      ...filters.value,
      sortBy: sortBy.value as any,
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

// Load initial products
onMounted(() => {
  fetchProducts({ sortBy: 'created', page: 1, limit: 12 })
  
  // Setup mobile interactions after DOM is ready
  nextTick(() => {
    setupMobileInteractions()
  })
})

// Cleanup on unmount
onUnmounted(() => {
  cleanupMobileInteractions()
})

// SEO Meta
useHead({
  title: 'Shop - Moldova Direct',
  meta: [
    {
      name: 'description',
      content: 'Browse authentic Moldovan food and wine products. Premium quality directly from Moldova to Spain.'
    }
  ]
})
</script>