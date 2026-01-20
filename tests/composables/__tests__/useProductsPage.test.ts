/**
 * useProductsPage Composable Tests
 *
 * Tests error handling in the products page composable.
 * Focuses on verifying that errors are handled gracefully without throwing.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useProductsPage } from '~/composables/useProductsPage'
import type { ProductFilters, ProductWithRelations } from '~/types'

// Mock vue-router
const mockRouterPush = vi.fn()
const mockRouter = {
  push: mockRouterPush,
}

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => mockRouter),
  useRoute: vi.fn(() => ({
    query: {},
  })),
}))

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  useDebounceFn: vi.fn((fn: () => void) => fn),
}))

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: ref('es'),
  })),
}))

describe('useProductsPage Composable', () => {
  const createMockOptions = () => ({
    products: ref<ProductWithRelations[]>([]),
    categoriesTree: ref([]),
    currentCategory: ref(null),
    searchQuery: ref(''),
    filters: ref<ProductFilters>({}),
    pagination: ref({ page: 1, limit: 12, total: 0, totalPages: 1 }),
    loading: ref(false),
    error: ref(null),
    sortBy: ref('created'),
    showFilterPanel: ref(false),
    initialize: vi.fn(),
    fetchProducts: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockResolvedValue(undefined),
    updateFilters: vi.fn(),
    clearFilters: vi.fn(),
    openFilterPanel: vi.fn(),
    closeFilterPanel: vi.fn(),
    ensureFilterPanelInitialized: vi.fn(),
    activeFilterChips: ref([]),
    removeFilterChip: vi.fn(),
    refreshPriceRange: vi.fn().mockResolvedValue(undefined),
    visiblePages: ref([]),
    scrollContainer: ref(undefined),
    mobileInteractions: {
      isMobile: ref(false),
      setup: vi.fn().mockResolvedValue(undefined),
      cleanup: vi.fn(),
    },
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockRouterPush.mockResolvedValue(undefined)
    // Mock Nuxt auto-imported composables
    vi.stubGlobal('useState', (_key: string, init: () => any) => ref(init()))
    vi.stubGlobal('getCurrentInstance', () => null)
    vi.stubGlobal('onMounted', () => {})
    vi.stubGlobal('onBeforeUnmount', () => {})
    vi.stubGlobal('onUnmounted', () => {})
    vi.stubGlobal('nextTick', (fn: () => void) => fn?.())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllTimers()
  })

  describe('Error Handling - All handlers should catch errors', () => {
    it('handleSearchInput should not throw on search errors', async () => {
      const mockOptions = createMockOptions()
      mockOptions.search.mockRejectedValue(new Error('Search API error'))
      mockOptions.searchQuery.value = 'test'

      const { handleSearchInput } = useProductsPage(mockOptions)

      // Should not throw despite search failure
      await expect(handleSearchInput()).resolves.toBeUndefined()
    })

    it('handleSortChange should not throw on fetch errors', async () => {
      const mockOptions = createMockOptions()
      mockOptions.fetchProducts.mockRejectedValue(new Error('Fetch error'))

      const { handleSortChange } = useProductsPage(mockOptions)

      // Should not throw
      await expect(handleSortChange()).resolves.toBeUndefined()
    })

    it('handleApplyFilters should not throw on errors', async () => {
      const mockOptions = createMockOptions()
      mockOptions.fetchProducts.mockRejectedValue(new Error('Filter apply error'))

      const { handleApplyFilters } = useProductsPage(mockOptions)

      // Should not throw
      await expect(handleApplyFilters(true)).resolves.toBeUndefined()
    })

    it('clearAllFilters should reset state and not throw', async () => {
      const mockOptions = createMockOptions()
      mockOptions.searchQuery.value = 'test query'
      mockOptions.sortBy.value = 'price-asc'
      mockOptions.fetchProducts.mockRejectedValue(new Error('Clear filters error'))

      const { clearAllFilters } = useProductsPage(mockOptions)

      await clearAllFilters()

      // State should be reset despite error
      expect(mockOptions.searchQuery.value).toBe('')
      expect(mockOptions.sortBy.value).toBe('created')
    })

    it('removeActiveChip should not throw on fetch errors', async () => {
      const mockOptions = createMockOptions()
      mockOptions.removeFilterChip.mockReturnValue({})
      mockOptions.fetchProducts.mockRejectedValue(new Error('Remove chip error'))

      const { removeActiveChip } = useProductsPage(mockOptions)

      // Should not throw
      await expect(removeActiveChip({ id: 'test', label: 'Test', type: 'test' }))
        .resolves.toBeUndefined()
    })

    it('refreshProducts should return false on error', async () => {
      const mockOptions = createMockOptions()
      mockOptions.fetchProducts.mockRejectedValue(new Error('Refresh error'))

      const { refreshProducts } = useProductsPage(mockOptions)

      const result = await refreshProducts()

      // Should return false on error
      expect(result).toBe(false)
    })

    it('loadMoreProducts should return false on error', async () => {
      const mockOptions = createMockOptions()
      mockOptions.fetchProducts.mockRejectedValue(new Error('Load more error'))

      const { loadMoreProducts } = useProductsPage(mockOptions)

      const result = await loadMoreProducts()

      // Should return false on error
      expect(result).toBe(false)
    })
  })

  describe('Pagination Validation', () => {
    it('goToPage should handle invalid page numbers gracefully', async () => {
      const mockOptions = createMockOptions()

      const { goToPage } = useProductsPage(mockOptions)

      // Should not throw for invalid page numbers
      await expect(goToPage(-1)).resolves.toBeUndefined()
      await expect(goToPage(0)).resolves.toBeUndefined()
      await expect(goToPage(999999)).resolves.toBeUndefined()
    })
  })

  describe('Lifecycle Hooks Error Handling', () => {
    it('onBeforeUnmountHook should not throw on SecurityError (private browsing)', () => {
      const mockOptions = createMockOptions()

      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.removeItem = vi.fn(() => {
        const error = new Error('SecurityError')
        ;(error as any).name = 'SecurityError'
        throw error
      })

      const originalClient = import.meta.client
      ;(import.meta as any).client = true

      const { onBeforeUnmountHook } = useProductsPage(mockOptions)

      // Should not throw
      expect(() => onBeforeUnmountHook()).not.toThrow()

      // Restore
      Storage.prototype.removeItem = originalRemoveItem
      ;(import.meta as any).client = originalClient
    })

    it('onBeforeUnmountHook should not rethrow other storage errors', () => {
      const mockOptions = createMockOptions()

      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.removeItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      const originalClient = import.meta.client
      ;(import.meta as any).client = true

      const { onBeforeUnmountHook } = useProductsPage(mockOptions)

      // Should not throw (this was the bug - it used to rethrow)
      expect(() => onBeforeUnmountHook()).not.toThrow()

      // Restore
      Storage.prototype.removeItem = originalRemoveItem
      ;(import.meta as any).client = originalClient
    })
  })

  describe('hasActiveFilters computed', () => {
    it('should return true when searchQuery has value', () => {
      const mockOptions = createMockOptions()
      mockOptions.searchQuery.value = 'test'

      const { hasActiveFilters } = useProductsPage(mockOptions)

      expect(hasActiveFilters.value).toBe(true)
    })

    it('should return false when no filters are active', () => {
      const mockOptions = createMockOptions()

      const { hasActiveFilters } = useProductsPage(mockOptions)

      expect(hasActiveFilters.value).toBe(false)
    })
  })
})
