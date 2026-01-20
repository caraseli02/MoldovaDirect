/**
 * Products Page Composable
 *
 * Extracted business logic from pages/products/index.vue
 * to reduce component size and improve testability.
 */
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import type { ProductFilters, ProductWithRelations } from '~/types'
import type { ProductSortOption } from '~/types/guards'
import type { FilterChip } from '~/composables/useProductFilters'
import { getErrorMessage } from '~/utils/errorUtils'

interface UseProductsPageOptions {
  products: Ref<ProductWithRelations[]>
  categoriesTree: Ref<any[]>
  currentCategory: Ref<any>
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

  const searchInput = ref<HTMLInputElement>()
  const searchAbortController = ref<AbortController | null>(null)
  const localSortBy = ref<ProductSortOption>(sortBy.value as ProductSortOption)
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

  // Debounced search handler to prevent excessive API calls
  const handleSearchInput = useDebounceFn(() => {
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
      })
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

  // Editorial stories computed
  const { t } = useI18n()
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

  // Lifecycle hooks that need to be called by the component
  const onMountedHook = async () => {
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
  }

  const onBeforeUnmountHook = () => {
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
  }

  const onUnmountedHook = () => {
    // Cancel any pending search requests to prevent memory leaks
    if (searchAbortController.value) {
      searchAbortController.value.abort()
      searchAbortController.value = null
    }

    // Cleanup mobile interactions
    mobileInteractions.cleanup()
  }

  return {
    // State
    searchInput,
    localSortBy,
    recentlyViewedProducts,
    hasActiveFilters,
    editorialStories,

    // Methods
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

    // Lifecycle
    onMountedHook,
    onBeforeUnmountHook,
    onUnmountedHook,
  }
}
