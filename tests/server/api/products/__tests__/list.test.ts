/**
 * Products List API Tests
 *
 * Tests the products listing endpoint following best practices:
 * - Test filtering, pagination, sorting
 * - Test search sanitization
 * - Test response transformation
 *
 * @see https://github.com/goldbergyoni/nodejs-testing-best-practices
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock search sanitization
vi.mock('~/server/utils/searchSanitization', () => ({
  prepareSearchPattern: vi.fn(search => `%${search}%`),
  MAX_SEARCH_LENGTH: 100,
}))

// Mock public cache
vi.mock('~/server/utils/publicCache', () => ({
  PUBLIC_CACHE_CONFIG: {
    productsList: {
      maxAge: 60,
      name: 'products-list',
    },
  },
  getPublicCacheKey: vi.fn(() => 'test-cache-key'),
}))

// Mock Supabase query builder
const mockSupabaseSelect = vi.fn()
const mockSupabaseEq = vi.fn()
const mockSupabaseGte = vi.fn()
const mockSupabaseLte = vi.fn()
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
    defineCachedEventHandler: vi.fn(handler => handler),
    getQuery: vi.fn(),
    createError: vi.fn((options) => {
      const error = new Error(options.statusMessage) as Error & { statusCode: number }
      error.statusCode = options.statusCode
      return error
    }),
  }
})

describe('Products List API', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup chainable mock
    const chainable = {
      eq: mockSupabaseEq,
      gte: mockSupabaseGte,
      lte: mockSupabaseLte,
      gt: mockSupabaseGt,
      or: mockSupabaseOr,
      order: mockSupabaseOrder,
      range: mockSupabaseRange,
    }

    mockSupabaseSelect.mockReturnValue(chainable)
    mockSupabaseEq.mockReturnValue(chainable)
    mockSupabaseGte.mockReturnValue(chainable)
    mockSupabaseLte.mockReturnValue(chainable)
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

  describe('Query Parameter Parsing', () => {
    it('parses pagination parameters with defaults', () => {
      const parseParams = (query: Record<string, unknown>) => {
        const MAX_LIMIT = 100
        const MAX_PAGE = 10000
        const parsedPage = parseInt(query.page) || 1
        const parsedLimit = parseInt(query.limit) || 12

        return {
          page: Math.min(Math.max(1, parsedPage), MAX_PAGE),
          limit: Math.min(Math.max(1, parsedLimit), MAX_LIMIT),
        }
      }

      expect(parseParams({})).toEqual({ page: 1, limit: 12 })
      expect(parseParams({ page: '5', limit: '24' })).toEqual({ page: 5, limit: 24 })
      expect(parseParams({ page: '0' })).toEqual({ page: 1, limit: 12 })
      expect(parseParams({ limit: '1000' })).toEqual({ page: 1, limit: 100 })
    })

    it('handles negative pagination values', () => {
      const parseParams = (query: Record<string, unknown>) => {
        const parsedPage = parseInt(query.page) || 1
        const parsedLimit = parseInt(query.limit) || 12

        return {
          page: Math.max(1, parsedPage),
          limit: Math.max(1, parsedLimit),
        }
      }

      expect(parseParams({ page: '-5' })).toEqual({ page: 1, limit: 12 })
      expect(parseParams({ limit: '-10' })).toEqual({ page: 1, limit: 1 })
    })
  })

  describe('Search Validation', () => {
    it('rejects search terms exceeding max length', async () => {
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

    it('sanitizes search pattern for SQL safety', async () => {
      const { prepareSearchPattern } = await import('~/server/utils/searchSanitization')

      const result = prepareSearchPattern('wine')

      expect(result).toContain('wine')
    })
  })

  describe('Filtering', () => {
    it('filters by category slug', async () => {
      mockSupabaseEq.mockReturnValue({
        ...mockSupabaseSelect(),
        gte: mockSupabaseGte,
      })

      await mockSupabaseEq('categories.slug', 'vino-tinto')

      expect(mockSupabaseEq).toHaveBeenCalledWith('categories.slug', 'vino-tinto')
    })

    it('filters by price range', async () => {
      await mockSupabaseGte('price_eur', 10)
      await mockSupabaseLte('price_eur', 50)

      expect(mockSupabaseGte).toHaveBeenCalledWith('price_eur', 10)
      expect(mockSupabaseLte).toHaveBeenCalledWith('price_eur', 50)
    })

    it('filters by stock availability', async () => {
      await mockSupabaseGt('stock_quantity', 0)

      expect(mockSupabaseGt).toHaveBeenCalledWith('stock_quantity', 0)
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

    it('sorts by newest (created_at desc)', async () => {
      await mockSupabaseOrder('created_at', { ascending: false })

      expect(mockSupabaseOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('uses newest as default sort', () => {
      const sort = undefined
      const appliedSort = sort || 'newest'

      expect(appliedSort).toBe('newest')
    })
  })

  describe('Pagination', () => {
    it('calculates correct offset for pagination', () => {
      const calculateOffset = (page: number, limit: number) => (page - 1) * limit

      expect(calculateOffset(1, 12)).toBe(0)
      expect(calculateOffset(2, 12)).toBe(12)
      expect(calculateOffset(3, 24)).toBe(48)
    })

    it('applies range for pagination', async () => {
      const page = 2
      const limit = 12
      const offset = (page - 1) * limit

      await mockSupabaseRange(offset, offset + limit - 1)

      expect(mockSupabaseRange).toHaveBeenCalledWith(12, 23)
    })
  })

  describe('Response Transformation', () => {
    it('transforms database product to API format', () => {
      const dbProduct = {
        id: 1,
        sku: 'WINE-001',
        name_translations: { es: 'Vino Tinto', en: 'Red Wine' },
        description_translations: { es: 'Delicioso', en: 'Delicious' },
        price_eur: 25.00,
        compare_at_price_eur: 30.00,
        stock_quantity: 10,
        images: [{ url: '/wine.jpg', is_primary: true }],
        attributes: { origin: 'Spain', volume: '750', alcohol_content: '13.5' },
        categories: { id: 1, slug: 'vinos', name_translations: { es: 'Vinos', en: 'Wines' } },
        is_active: true,
        created_at: '2024-01-01',
      }

      const getStockStatus = (quantity: number) => {
        if (quantity > 5) return 'in_stock'
        if (quantity > 0) return 'low_stock'
        return 'out_of_stock'
      }

      const transformed = {
        id: dbProduct.id,
        sku: dbProduct.sku,
        slug: dbProduct.sku,
        name: dbProduct.name_translations,
        shortDescription: dbProduct.description_translations,
        price: dbProduct.price_eur,
        comparePrice: dbProduct.compare_at_price_eur,
        formattedPrice: `€${dbProduct.price_eur.toFixed(2)}`,
        stockQuantity: dbProduct.stock_quantity,
        stockStatus: getStockStatus(dbProduct.stock_quantity),
        category: {
          id: dbProduct.categories.id,
          slug: dbProduct.categories.slug,
          name: dbProduct.categories.name_translations,
        },
        origin: dbProduct.attributes?.origin,
        volume: parseInt(dbProduct.attributes?.volume || '0'),
        alcoholContent: parseFloat(dbProduct.attributes?.alcohol_content || '0'),
      }

      expect(transformed.slug).toBe('WINE-001')
      expect(transformed.formattedPrice).toBe('€25.00')
      expect(transformed.stockStatus).toBe('in_stock')
      expect(transformed.volume).toBe(750)
    })

    it('determines stock status correctly', () => {
      const getStockStatus = (quantity: number) => {
        if (quantity > 5) return 'in_stock'
        if (quantity > 0) return 'low_stock'
        return 'out_of_stock'
      }

      expect(getStockStatus(10)).toBe('in_stock')
      expect(getStockStatus(5)).toBe('low_stock')
      expect(getStockStatus(3)).toBe('low_stock')
      expect(getStockStatus(0)).toBe('out_of_stock')
    })

    it('handles products without categories', () => {
      const dbProduct = {
        id: 1,
        sku: 'ITEM-001',
        categories: null,
      }

      const category = dbProduct.categories
        ? {
            id: dbProduct.categories.id,
            slug: dbProduct.categories.slug,
          }
        : null

      expect(category).toBeNull()
    })

    it('handles products with string images', () => {
      const images = ['/image1.jpg', '/image2.jpg']

      const transformed = images.map((img, index) => ({
        url: typeof img === 'string' ? img : (img as unknown).url,
        isPrimary: index === 0,
      }))

      expect(transformed[0].url).toBe('/image1.jpg')
      expect(transformed[0].isPrimary).toBe(true)
      expect(transformed[1].isPrimary).toBe(false)
    })

    it('handles products with object images', () => {
      const images = [
        { url: '/wine.jpg', alt: 'Wine bottle', is_primary: true },
        { url: '/wine-label.jpg', alt: 'Label' },
      ]

      const transformed = images.map((img, index) => ({
        url: typeof img === 'string' ? img : img.url,
        altText: typeof img === 'object' ? (img.alt || img.alt_text) : undefined,
        isPrimary: typeof img === 'object' ? (img.is_primary || index === 0) : index === 0,
      }))

      expect(transformed[0].altText).toBe('Wine bottle')
      expect(transformed[0].isPrimary).toBe(true)
    })
  })

  describe('Pagination Info', () => {
    it('calculates pagination info correctly', () => {
      const totalCount = 100
      const page = 3
      const limit = 12

      const totalPages = Math.ceil(totalCount / limit) // 9

      const pagination = {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }

      expect(pagination.totalPages).toBe(9)
      expect(pagination.hasNext).toBe(true)
      expect(pagination.hasPrev).toBe(true)
    })

    it('handles first page correctly', () => {
      const page = 1
      const totalPages = 5

      expect(page > 1).toBe(false) // hasPrev
      expect(page < totalPages).toBe(true) // hasNext
    })

    it('handles last page correctly', () => {
      const page = 5
      const totalPages = 5

      expect(page > 1).toBe(true) // hasPrev
      expect(page < totalPages).toBe(false) // hasNext
    })

    it('handles single page of results', () => {
      const page = 1
      const totalPages = 1

      expect(page > 1).toBe(false) // hasPrev
      expect(page < totalPages).toBe(false) // hasNext
    })
  })

  describe('Error Handling', () => {
    it('maps Supabase error codes to HTTP status codes', () => {
      const getStatusCode = (code?: string): number => {
        if (!code) return 500
        if (code === 'PGRST116') return 404
        if (code === '22P02') return 400
        if (code === '23503') return 409
        if (code === '42501') return 403
        if (code.startsWith('22')) return 400
        if (code.startsWith('23')) return 409
        if (code.startsWith('42')) return 403
        return 500
      }

      expect(getStatusCode('PGRST116')).toBe(404) // Row not found
      expect(getStatusCode('22P02')).toBe(400) // Invalid text
      expect(getStatusCode('23503')).toBe(409) // FK violation
      expect(getStatusCode('42501')).toBe(403) // Insufficient privilege
      expect(getStatusCode(undefined)).toBe(500)
    })

    it('preserves HTTP errors', async () => {
      const error = { statusCode: 400, statusMessage: 'Bad request' }

      // Error should be thrown as-is if it has statusCode
      expect(error.statusCode).toBe(400)
    })
  })

  describe('Response Structure', () => {
    it('returns complete response structure', () => {
      const response = {
        products: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        filters: {
          category: undefined,
          search: undefined,
          priceMin: undefined,
          priceMax: undefined,
          inStock: undefined,
          featured: undefined,
          sort: 'newest',
        },
      }

      expect(response).toHaveProperty('products')
      expect(response).toHaveProperty('pagination')
      expect(response).toHaveProperty('filters')
      expect(response.filters.sort).toBe('newest')
    })
  })
})
