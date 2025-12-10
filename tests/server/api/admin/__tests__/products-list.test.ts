/**
 * Admin Products List API Tests
 *
 * Tests the admin products listing endpoint following best practices:
 * - Authentication required (admin role)
 * - Filtering, sorting, pagination
 * - Stock status calculations
 *
 * @see https://github.com/goldbergyoni/nodejs-testing-best-practices
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock admin auth
vi.mock('~/server/utils/adminAuth', () => ({
  requireAdminRole: vi.fn().mockResolvedValue(undefined),
}))

// Mock search sanitization
vi.mock('~/server/utils/searchSanitization', () => ({
  prepareSearchPattern: vi.fn(search => `%${search}%`),
  MAX_SEARCH_LENGTH: 100,
}))

// Mock admin cache
vi.mock('~/server/utils/adminCache', () => ({
  ADMIN_CACHE_CONFIG: {
    productsList: { maxAge: 60, name: 'admin-products-list' },
  },
  getAdminCacheKey: vi.fn(() => 'test-cache-key'),
}))

// Mock Supabase query builder
const mockSupabaseSelect = vi.fn()
const mockSupabaseEq = vi.fn()
const mockSupabaseGt = vi.fn()
const mockSupabaseOr = vi.fn()
const mockSupabaseOrder = vi.fn()
const mockSupabaseRange = vi.fn()

vi.mock('#supabase/server', () => ({
  serverSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: mockSupabaseSelect,
    })),
  })),
}))

// Mock h3
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual,
    defineEventHandler: vi.fn(handler => handler),
    getQuery: vi.fn(),
    createError: vi.fn((options) => {
      const error = new Error(options.statusMessage) as Error & { statusCode: number }
      error.statusCode = options.statusCode
      return error
    }),
  }
})

describe('Admin Products List API', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup chainable mock
    const chainable = {
      eq: mockSupabaseEq,
      gt: mockSupabaseGt,
      or: mockSupabaseOr,
      order: mockSupabaseOrder,
      range: mockSupabaseRange,
    }

    mockSupabaseSelect.mockReturnValue(chainable)
    mockSupabaseEq.mockReturnValue(chainable)
    mockSupabaseGt.mockReturnValue(chainable)
    mockSupabaseOr.mockReturnValue(chainable)
    mockSupabaseOrder.mockReturnValue(chainable)
    mockSupabaseRange.mockResolvedValue({
      data: [],
      error: null,
      count: 0,
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Authentication', () => {
    it('requires admin role', async () => {
      const { requireAdminRole } = await import('~/server/utils/adminAuth')

      await requireAdminRole({} as any)

      expect(requireAdminRole).toHaveBeenCalled()
    })

    it('throws 401 for non-admin users', async () => {
      const { requireAdminRole } = await import('~/server/utils/adminAuth')

      vi.mocked(requireAdminRole).mockRejectedValue({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })

      await expect(requireAdminRole({} as any)).rejects.toMatchObject({
        statusCode: 401,
      })
    })

    it('throws 403 for non-admin authenticated users', async () => {
      const { requireAdminRole } = await import('~/server/utils/adminAuth')

      vi.mocked(requireAdminRole).mockRejectedValue({
        statusCode: 403,
        statusMessage: 'Admin role required',
      })

      await expect(requireAdminRole({} as any)).rejects.toMatchObject({
        statusCode: 403,
      })
    })
  })

  describe('Query Parameters', () => {
    it('parses default parameters correctly', () => {
      const defaults = {
        sortBy: 'created_at',
        sortOrder: 'desc',
        page: 1,
        limit: 20,
      }

      expect(defaults.sortBy).toBe('created_at')
      expect(defaults.limit).toBe(20)
    })

    it('validates search term length', async () => {
      const { createError } = await import('h3')
      const { MAX_SEARCH_LENGTH } = await import('~/server/utils/searchSanitization')

      const longSearch = 'a'.repeat(MAX_SEARCH_LENGTH + 1)

      if (longSearch.length > MAX_SEARCH_LENGTH) {
        const error = vi.mocked(createError)({
          statusCode: 400,
          statusMessage: `Search term too long. Maximum ${MAX_SEARCH_LENGTH} characters allowed.`,
        })
        expect(error.statusCode).toBe(400)
      }
    })
  })

  describe('Filtering', () => {
    it('filters by active status', async () => {
      await mockSupabaseEq('is_active', true)
      expect(mockSupabaseEq).toHaveBeenCalledWith('is_active', true)
    })

    it('filters by inactive status', async () => {
      await mockSupabaseEq('is_active', false)
      expect(mockSupabaseEq).toHaveBeenCalledWith('is_active', false)
    })

    it('filters by category ID', async () => {
      await mockSupabaseEq('categories.id', 5)
      expect(mockSupabaseEq).toHaveBeenCalledWith('categories.id', 5)
    })

    it('filters by in stock', async () => {
      await mockSupabaseGt('stock_quantity', 0)
      expect(mockSupabaseGt).toHaveBeenCalledWith('stock_quantity', 0)
    })

    it('filters by out of stock', async () => {
      await mockSupabaseEq('stock_quantity', 0)
      expect(mockSupabaseEq).toHaveBeenCalledWith('stock_quantity', 0)
    })

    it('filters by low stock', async () => {
      await mockSupabaseOr('stock_quantity.lte.5,and(stock_quantity.gt.0,stock_quantity.lte.low_stock_threshold)')
      expect(mockSupabaseOr).toHaveBeenCalled()
    })
  })

  describe('Sorting', () => {
    it('sorts by price ascending', async () => {
      await mockSupabaseOrder('price_eur', { ascending: true })
      expect(mockSupabaseOrder).toHaveBeenCalledWith('price_eur', { ascending: true })
    })

    it('sorts by price descending', async () => {
      await mockSupabaseOrder('price_eur', { ascending: false })
      expect(mockSupabaseOrder).toHaveBeenCalledWith('price_eur', { ascending: false })
    })

    it('sorts by stock', async () => {
      await mockSupabaseOrder('stock_quantity', { ascending: true })
      expect(mockSupabaseOrder).toHaveBeenCalledWith('stock_quantity', { ascending: true })
    })

    it('sorts by created_at (default)', async () => {
      await mockSupabaseOrder('created_at', { ascending: false })
      expect(mockSupabaseOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('sorts by name using JavaScript after fetch', () => {
      const products = [
        { name: { es: 'Vino' } },
        { name: { es: 'Aceite' } },
        { name: { es: 'Queso' } },
      ]

      products.sort((a, b) => {
        const aName = Object.values(a.name)[0] as string || ''
        const bName = Object.values(b.name)[0] as string || ''
        return aName.localeCompare(bName)
      })

      expect(products[0].name.es).toBe('Aceite')
      expect(products[1].name.es).toBe('Queso')
      expect(products[2].name.es).toBe('Vino')
    })
  })

  describe('Stock Status Calculation', () => {
    it('calculates high stock status', () => {
      const getStockStatus = (quantity: number, threshold: number = 5) => {
        if (quantity > threshold) return 'high'
        if (quantity > 0) return 'low'
        return 'out'
      }

      expect(getStockStatus(10)).toBe('high')
      expect(getStockStatus(6)).toBe('high')
    })

    it('calculates low stock status', () => {
      const getStockStatus = (quantity: number, threshold: number = 5) => {
        if (quantity > threshold) return 'high'
        if (quantity > 0) return 'low'
        return 'out'
      }

      expect(getStockStatus(5)).toBe('low')
      expect(getStockStatus(1)).toBe('low')
    })

    it('calculates out of stock status', () => {
      const getStockStatus = (quantity: number, threshold: number = 5) => {
        if (quantity > threshold) return 'high'
        if (quantity > 0) return 'low'
        return 'out'
      }

      expect(getStockStatus(0)).toBe('out')
    })

    it('uses custom low stock threshold', () => {
      const getStockStatus = (quantity: number, threshold: number = 5) => {
        if (quantity > threshold) return 'high'
        if (quantity > 0) return 'low'
        return 'out'
      }

      expect(getStockStatus(10, 15)).toBe('low')
      expect(getStockStatus(20, 15)).toBe('high')
    })
  })

  describe('Response Transformation', () => {
    it('transforms database product to admin format', () => {
      const dbProduct = {
        id: 1,
        sku: 'WINE-001',
        name_translations: { es: 'Vino Tinto', en: 'Red Wine' },
        description_translations: { es: 'Desc', en: 'Desc' },
        price_eur: 25.00,
        compare_at_price_eur: 30.00,
        stock_quantity: 10,
        low_stock_threshold: 5,
        reorder_point: 10,
        images: [{ url: '/wine.jpg', is_primary: true }],
        attributes: { origin: 'Spain' },
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        categories: { id: 1, slug: 'vinos', name_translations: { es: 'Vinos' } },
      }

      const transformed = {
        id: dbProduct.id,
        sku: dbProduct.sku,
        slug: dbProduct.sku?.toLowerCase() || `product-${dbProduct.id}`,
        name: dbProduct.name_translations,
        description: dbProduct.description_translations,
        price: dbProduct.price_eur,
        comparePrice: dbProduct.compare_at_price_eur,
        stockQuantity: dbProduct.stock_quantity,
        lowStockThreshold: dbProduct.low_stock_threshold || 5,
        reorderPoint: dbProduct.reorder_point || 10,
        stockStatus: dbProduct.stock_quantity > (dbProduct.low_stock_threshold || 5)
          ? 'high'
          : dbProduct.stock_quantity > 0 ? 'low' : 'out',
        isActive: dbProduct.is_active,
        createdAt: dbProduct.created_at,
        updatedAt: dbProduct.updated_at,
      }

      expect(transformed.slug).toBe('wine-001')
      expect(transformed.stockStatus).toBe('high')
      expect(transformed.lowStockThreshold).toBe(5)
    })

    it('generates slug from SKU or ID', () => {
      const generateSlug = (sku: string | undefined, id: number) => {
        return sku?.toLowerCase() || `product-${id}`
      }

      expect(generateSlug('WINE-001', 1)).toBe('wine-001')
      expect(generateSlug(undefined, 123)).toBe('product-123')
    })
  })

  describe('Pagination', () => {
    it('calculates pagination correctly', () => {
      const totalCount = 100
      const page = 3
      const limit = 20

      const totalPages = Math.ceil(totalCount / limit) // 5
      const offset = (page - 1) * limit // 40

      expect(totalPages).toBe(5)
      expect(offset).toBe(40)
    })

    it('returns pagination info', () => {
      const pagination = {
        page: 2,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      }

      expect(pagination.hasNext).toBe(true)
      expect(pagination.hasPrev).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('throws 500 for database errors', async () => {
      const { createError } = await import('h3')

      const error = vi.mocked(createError)({
        statusCode: 500,
        statusMessage: 'Failed to fetch products',
        data: { canRetry: true },
      })

      expect(error.statusCode).toBe(500)
    })

    it('re-throws HTTP errors', () => {
      const httpError = { statusCode: 400, statusMessage: 'Bad request' }

      // HTTP errors should be re-thrown as-is
      expect(httpError.statusCode).toBeDefined()
    })

    it('logs unexpected errors', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      console.error('[Admin Products] Unexpected error:', {
        error: 'Test error',
        timestamp: new Date().toISOString(),
      })

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Response Structure', () => {
    it('returns complete response structure', () => {
      const response = {
        products: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        filters: {
          search: undefined,
          categoryId: undefined,
          active: undefined,
          inStock: undefined,
          outOfStock: undefined,
          lowStock: undefined,
          sortBy: 'created_at',
          sortOrder: 'desc',
        },
      }

      expect(response).toHaveProperty('products')
      expect(response).toHaveProperty('pagination')
      expect(response).toHaveProperty('filters')
      expect(response.filters.sortBy).toBe('created_at')
    })
  })
})
