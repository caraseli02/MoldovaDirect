/**
 * Products Store Unit Tests
 *
 * Tests for the products store getters, cache management, and state operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductsStore } from '~/stores/products'
import type { ProductWithRelations, CategoryWithChildren } from '~/types'

// Mock $fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Sample test data
const mockProducts: ProductWithRelations[] = [
  {
    id: 1,
    slug: 'test-wine-1',
    name: { es: 'Vino Tinto', en: 'Red Wine', ro: 'Vin Roșu', ru: 'Красное вино' },
    description: { es: 'Un vino excelente', en: 'An excellent wine', ro: 'Un vin excelent', ru: 'Отличное вино' },
    price: 25.00,
    stockQuantity: 10,
    isFeatured: true,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    category: null,
    images: [],
    attributes: [],
  },
  {
    id: 2,
    slug: 'test-wine-2',
    name: { es: 'Vino Blanco', en: 'White Wine', ro: 'Vin Alb', ru: 'Белое вино' },
    description: { es: 'Un vino refrescante', en: 'A refreshing wine', ro: 'Un vin răcoritor', ru: 'Освежающее вино' },
    price: 20.00,
    stockQuantity: 0,
    isFeatured: false,
    isActive: true,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
    category: null,
    images: [],
    attributes: [],
  },
  {
    id: 3,
    slug: 'test-wine-3',
    name: { es: 'Vino Rosado', en: 'Rosé Wine', ro: 'Vin Roze', ru: 'Розовое вино' },
    description: { es: 'Un vino elegante', en: 'An elegant wine', ro: 'Un vin elegant', ru: 'Элегантное вино' },
    price: 22.00,
    stockQuantity: 5,
    isFeatured: true,
    isActive: true,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
    category: null,
    images: [],
    attributes: [],
  },
]

const mockCategories: CategoryWithChildren[] = [
  { id: 1, slug: 'wines', name: { es: 'Vinos', en: 'Wines', ro: 'Vinuri', ru: 'Вина' }, parentId: undefined, sortOrder: 1, isActive: true, children: [] },
  { id: 2, slug: 'red-wines', name: { es: 'Vinos Tintos', en: 'Red Wines', ro: 'Vinuri Roșii', ru: 'Красные вина' }, parentId: 1, sortOrder: 1, isActive: true, children: [] },
  { id: 3, slug: 'white-wines', name: { es: 'Vinos Blancos', en: 'White Wines', ro: 'Vinuri Albe', ru: 'Белые вина' }, parentId: 1, sortOrder: 2, isActive: true, children: [] },
  { id: 4, slug: 'spirits', name: { es: 'Licores', en: 'Spirits', ro: 'Spirtoase', ru: 'Спиртные напитки' }, parentId: undefined, sortOrder: 2, isActive: true, children: [] },
]

describe('Products Store', () => {
  let store: ReturnType<typeof useProductsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useProductsStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    store.$reset()
  })

  describe('Initial State', () => {
    it('starts with empty products array', () => {
      expect(store.products).toEqual([])
    })

    it('starts with null currentProduct', () => {
      expect(store.currentProduct).toBeNull()
    })

    it('starts with default pagination', () => {
      expect(store.pagination).toEqual({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
      })
    })

    it('starts with empty filters', () => {
      expect(store.filters).toEqual({})
    })

    it('starts with loading false', () => {
      expect(store.loading).toBe(false)
    })

    it('starts with null error', () => {
      expect(store.error).toBeNull()
    })
  })

  describe('Getters', () => {
    describe('filteredProducts', () => {
      beforeEach(() => {
        store.products = mockProducts
      })

      it('returns all products when no filters applied', () => {
        expect(store.filteredProducts).toHaveLength(3)
      })

      it('filters by search query in Spanish name', () => {
        store.filters = { search: 'tinto' }
        expect(store.filteredProducts).toHaveLength(1)
        expect(store.filteredProducts[0].slug).toBe('test-wine-1')
      })

      it('filters by search query in English name', () => {
        store.filters = { search: 'red wine' }
        expect(store.filteredProducts).toHaveLength(1)
        expect(store.filteredProducts[0].slug).toBe('test-wine-1')
      })

      it('filters by inStock', () => {
        store.filters = { inStock: true }
        expect(store.filteredProducts).toHaveLength(2)
        expect(store.filteredProducts.every(p => p.stockQuantity > 0)).toBe(true)
      })

      it('filters by featured', () => {
        store.filters = { featured: true }
        expect(store.filteredProducts).toHaveLength(2)
        expect(store.filteredProducts.every(p => p.isFeatured)).toBe(true)
      })

      it('combines multiple filters', () => {
        store.filters = { featured: true, inStock: true }
        expect(store.filteredProducts).toHaveLength(2)
      })

      it('returns empty array when no products match', () => {
        store.filters = { search: 'nonexistent' }
        expect(store.filteredProducts).toHaveLength(0)
      })
    })

    describe('categoriesTree', () => {
      beforeEach(() => {
        store.categories = mockCategories
      })

      it('builds tree from flat categories', () => {
        const tree = store.categoriesTree
        expect(tree).toHaveLength(2) // Only root categories
        expect(tree[0].slug).toBe('wines')
        expect(tree[1].slug).toBe('spirits')
      })

      it('nests children correctly', () => {
        const tree = store.categoriesTree
        const wines = tree.find(c => c.slug === 'wines')
        expect(wines?.children).toHaveLength(2)
        expect(wines?.children?.[0].slug).toBe('red-wines')
        expect(wines?.children?.[1].slug).toBe('white-wines')
      })
    })

    describe('rootCategories', () => {
      beforeEach(() => {
        store.categories = mockCategories
      })

      it('returns only root categories', () => {
        expect(store.rootCategories).toHaveLength(2)
        expect(store.rootCategories.every(c => !c.parentId)).toBe(true)
      })
    })

    describe('hasActiveFilters', () => {
      it('returns false when no filters set', () => {
        expect(store.hasActiveFilters).toBe(false)
      })

      it('returns true when category filter is set', () => {
        store.filters = { category: '1' }
        expect(store.hasActiveFilters).toBe(true)
      })

      it('returns true when search filter is set', () => {
        store.filters = { search: 'test' }
        expect(store.hasActiveFilters).toBe(true)
      })

      it('returns true when price filters are set', () => {
        store.filters = { priceMin: 10, priceMax: 50 }
        expect(store.hasActiveFilters).toBe(true)
      })

      it('returns true when inStock filter is set', () => {
        store.filters = { inStock: true }
        expect(store.hasActiveFilters).toBe(true)
      })
    })

    describe('getProductBySlug', () => {
      beforeEach(() => {
        store.products = mockProducts
      })

      it('returns product with matching slug', () => {
        const product = store.getProductBySlug('test-wine-1')
        expect(product?.id).toBe(1)
      })

      it('matches case-insensitively', () => {
        const product = store.getProductBySlug('TEST-WINE-1')
        expect(product?.id).toBe(1)
      })

      it('returns undefined for non-existent slug', () => {
        const product = store.getProductBySlug('non-existent')
        expect(product).toBeUndefined()
      })

      it('returns undefined for empty slug', () => {
        const product = store.getProductBySlug('')
        expect(product).toBeUndefined()
      })
    })

    describe('getCurrentCategory', () => {
      beforeEach(() => {
        store.categories = mockCategories
      })

      it('returns category by slug', () => {
        const category = store.getCurrentCategory('wines')
        expect(category?.id).toBe(1)
      })

      it('returns category by ID string', () => {
        const category = store.getCurrentCategory('1')
        expect(category?.slug).toBe('wines')
      })

      it('returns undefined for non-existent identifier', () => {
        const category = store.getCurrentCategory('non-existent')
        expect(category).toBeUndefined()
      })
    })
  })

  describe('Cache Management', () => {
    it('sets and gets cached data', () => {
      const testData = { products: mockProducts }
      store.setCache('test-key', testData, 60000)

      const cached = store.getCache('test-key')
      expect(cached).toEqual(testData)
    })

    it('returns null for non-existent cache key', () => {
      const cached = store.getCache('non-existent')
      expect(cached).toBeNull()
    })

    it('returns null for expired cache', async () => {
      const testData = { products: mockProducts }
      store.setCache('test-key', testData, 1) // 1ms TTL

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 10))

      const cached = store.getCache('test-key')
      expect(cached).toBeNull()
    })

    it('clears all cache', () => {
      store.setCache('key1', { a: 1 }, 60000)
      store.setCache('key2', { b: 2 }, 60000)

      store.clearCache()

      expect(store.getCache('key1')).toBeNull()
      expect(store.getCache('key2')).toBeNull()
    })

    it('clears cache by pattern', () => {
      store.setCache('products-list', { a: 1 }, 60000)
      store.setCache('products-featured', { b: 2 }, 60000)
      store.setCache('categories', { c: 3 }, 60000)

      store.clearCache('products')

      expect(store.getCache('products-list')).toBeNull()
      expect(store.getCache('products-featured')).toBeNull()
      expect(store.getCache('categories')).not.toBeNull()
    })

    it('isCached returns true for valid cache', () => {
      store.setCache('test-key', { data: true }, 60000)
      expect(store.isCached('test-key')).toBe(true)
    })

    it('isCached returns false for expired cache', async () => {
      store.setCache('test-key', { data: true }, 1)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(store.isCached('test-key')).toBe(false)
    })
  })

  describe('Actions', () => {
    describe('fetchProducts', () => {
      it('sets loading state during fetch', async () => {
        mockFetch.mockResolvedValueOnce({
          products: mockProducts,
          pagination: { page: 1, limit: 12, total: 3, totalPages: 1 },
        })

        const fetchPromise = store.fetchProducts()
        expect(store.loading).toBe(true)

        await fetchPromise
        expect(store.loading).toBe(false)
      })

      it('populates products from API response', async () => {
        mockFetch.mockResolvedValueOnce({
          products: mockProducts,
          pagination: { page: 1, limit: 12, total: 3, totalPages: 1 },
        })

        await store.fetchProducts()

        expect(store.products).toHaveLength(3)
        expect(store.pagination.total).toBe(3)
      })

      it('uses cached data when available', async () => {
        // Pre-populate cache
        store.setCache('products-{}', {
          products: mockProducts,
          pagination: { page: 1, limit: 12, total: 3, totalPages: 1 },
        }, 60000)

        await store.fetchProducts()

        // Should not call API
        expect(mockFetch).not.toHaveBeenCalled()
        expect(store.products).toHaveLength(3)
      })

      it('handles API errors gracefully', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        await store.fetchProducts()

        expect(store.error).toBe('Network error')
        expect(store.loading).toBe(false)
      })

      it('builds query params from filters', async () => {
        mockFetch.mockResolvedValueOnce({
          products: [],
          pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
        })

        await store.fetchProducts({
          category: '1',
          search: 'wine',
          priceMin: 10,
          priceMax: 50,
          inStock: true,
          featured: true,
          sort: 'price_asc',
          page: 2,
          limit: 24,
        })

        const callUrl = mockFetch.mock.calls[0][0]
        expect(callUrl).toContain('category=1')
        expect(callUrl).toContain('search=wine')
        expect(callUrl).toContain('priceMin=10')
        expect(callUrl).toContain('priceMax=50')
        expect(callUrl).toContain('inStock=true')
        expect(callUrl).toContain('featured=true')
        expect(callUrl).toContain('sort=price_asc')
        expect(callUrl).toContain('page=2')
        expect(callUrl).toContain('limit=24')
      })
    })

    describe('fetchProduct', () => {
      it('fetches single product by slug', async () => {
        mockFetch.mockResolvedValueOnce({
          product: mockProducts[0],
          relatedProducts: [mockProducts[1]],
        })

        await store.fetchProduct('test-wine-1')

        expect(store.currentProduct?.id).toBe(1)
        expect(store.relatedProducts).toHaveLength(1)
      })

      it('handles empty slug gracefully', async () => {
        await store.fetchProduct('')

        expect(store.error).toBe('Product slug is required')
        expect(mockFetch).not.toHaveBeenCalled()
      })

      it('handles API error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Product not found'))

        await store.fetchProduct('non-existent')

        expect(store.error).toBe('Product not found')
        expect(store.currentProduct).toBeNull()
      })
    })

    describe('updateFilters', () => {
      it('merges new filters with existing', () => {
        store.filters = { category: '1' }
        store.updateFilters({ search: 'wine' })

        // Note: page is reset to 1 when search changes
        expect(store.filters).toEqual({ category: '1', search: 'wine', page: 1 })
      })

      it('resets page when category changes', () => {
        store.filters = { page: 3 }
        store.updateFilters({ category: '1' })

        expect(store.filters.page).toBe(1)
      })

      it('resets page when search changes', () => {
        store.filters = { page: 3 }
        store.updateFilters({ search: 'wine' })

        expect(store.filters.page).toBe(1)
      })
    })

    describe('clearFilters', () => {
      it('resets filters to empty object', () => {
        store.filters = { category: '1', search: 'wine' }
        store.clearFilters()

        expect(store.filters).toEqual({})
      })

      it('clears search query and results', () => {
        store.searchQuery = 'wine'
        store.searchResults = mockProducts
        store.clearFilters()

        expect(store.searchQuery).toBe('')
        expect(store.searchResults).toEqual([])
      })
    })

    describe('clearCurrentProduct', () => {
      it('resets currentProduct and relatedProducts', () => {
        store.currentProduct = mockProducts[0]
        store.relatedProducts = [mockProducts[1]]
        store.clearCurrentProduct()

        expect(store.currentProduct).toBeNull()
        expect(store.relatedProducts).toEqual([])
      })
    })

    describe('clearProducts', () => {
      it('resets products array', () => {
        store.products = mockProducts
        store.clearProducts()

        expect(store.products).toEqual([])
      })

      it('resets pagination to defaults', () => {
        store.pagination = { page: 3, limit: 24, total: 100, totalPages: 5 }
        store.clearProducts()

        expect(store.pagination).toEqual({
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        })
      })
    })
  })
})
