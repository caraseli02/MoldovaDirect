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

import { ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue'

// Components
import productFilterMain from '~/components/product/Filter/Main.vue'
import ProductBreadcrumbs from '~/components/product/Breadcrumbs.vue'
import ProductFilterSheet from '~/components/product/FilterSheet.vue'
import ProductActiveFilters from '~/components/product/ActiveFilters.vue'
import SearchBar from '~/components/product/SearchBar.vue'
import ProductsToolbar from '~/components/product/ProductsToolbar.vue'
import ProductsGrid from '~/components/product/ProductsGrid.vue'
import ProductsEmptyState from '~/components/product/ProductsEmptyState.vue'
import RecentlyViewed from '~/components/product/RecentlyViewed.vue'
import EditorialSection from '~/components/product/EditorialSection.vue'
import ErrorState from '~/components/product/ErrorState.vue'
import LoadingState from '~/components/product/LoadingState.vue'
import MobilePullToRefreshIndicator from '~/components/mobile/PullToRefreshIndicator.vue'

// Composables
import { useProductCatalog } from '~/composables/useProductCatalog'
import { useProductFilters } from '~/composables/useProductFilters'
import { useProductPagination } from '~/composables/useProductPagination'
import { useMobileProductInteractions } from '~/composables/useMobileProductInteractions'
import { useProductStructuredData } from '~/composables/useProductStructuredData'
import { useProductsPage } from '~/composables/useProductsPage'

const { t } = useI18n()

// Parse initial page/limit from URL with bounds validation
const route = useRoute()
const MAX_LIMIT = 100
const initialPage = Math.max(1, parseInt(route.query.page as string) || 1)
const initialLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(route.query.limit as string) || 12))

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
} = useProductCatalog()

// Initialize and fetch products (SSR-safe)
await initialize()
await fetchProducts({ sort: 'created', page: initialPage, limit: initialLimit })
ensureFilterPanelInitialized()

// Filter Management, Pagination, and SEO
const { activeFilterChips, availableFilters, removeFilterChip, refreshPriceRange } = useProductFilters(categoriesTree)
const { visiblePages } = useProductPagination(pagination)
const { setupWatchers: setupStructuredDataWatchers } = useProductStructuredData(products, pagination)

// DOM refs
const mainContainer = ref<HTMLElement>()
const contentContainer = ref<HTMLElement>()
const scrollContainer = ref<HTMLElement>()

// Mobile Interactions (with placeholders)
const mobileInteractions = useMobileProductInteractions(
  scrollContainer,
  async () => {}, // refreshProducts placeholder
  {
    get currentPage() { return pagination.value?.page ?? 1 },
    get totalPages() { return pagination.value?.totalPages ?? 1 },
    goToPage: async () => {}, // placeholder
  },
)

// Products Page Business Logic
const {
  searchInput,
  localSortBy,
  recentlyViewedProducts,
  hasActiveFilters,
  editorialStories,
  handleSearchInput,
  handleSortChange,
  handleFiltersUpdate,
  handleApplyFilters,
  clearAllFilters,
  goToPage,
  refreshProducts,
  retryLoad,
  loadMoreProducts,
  removeActiveChip,
  onMountedHook,
  onBeforeUnmountHook,
  onUnmountedHook,
} = useProductsPage({
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
  initialize,
  fetchProducts,
  search,
  updateFilters,
  clearFilters,
  openFilterPanel,
  closeFilterPanel,
  ensureFilterPanelInitialized,
  activeFilterChips,
  removeFilterChip,
  refreshPriceRange,
  visiblePages,
  scrollContainer,
  mobileInteractions,
})

// Update mobile interactions with actual implementations
;(mobileInteractions as any).refreshProducts = refreshProducts
;(mobileInteractions as any).paginationControls.goToPage = goToPage

// Lifecycle Hooks
onMounted(onMountedHook)
onBeforeUnmount(onBeforeUnmountHook)
onUnmounted(onUnmountedHook)

// Setup structured data watchers for SEO
setupStructuredDataWatchers()
</script>
