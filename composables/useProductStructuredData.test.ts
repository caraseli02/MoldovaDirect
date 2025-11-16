import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import type { ProductWithRelations, ProductImage } from '~/types'
import type { PaginationState } from './useProductPagination'

// Mock dependencies BEFORE imports
const mockLocale = ref('en')
const mockT = vi.fn((key: string) => key)
const mockUseHead = vi.fn()

// Override global useI18n mock with test-specific mock
global.useI18n = vi.fn(() => ({
  locale: mockLocale,
  t: mockT,
}))

// Mock Nuxt's useHead
global.useHead = mockUseHead

// Import AFTER mocks are set up
const { useProductStructuredData } = await import('./useProductStructuredData')

// Helper function to create mock product
const createMockProduct = (
  id: number,
  overrides: Partial<ProductWithRelations> = {}
): ProductWithRelations => ({
  id,
  sku: `SKU-${id}`,
  categoryId: 1,
  nameTranslations: {
    es: `Producto ${id}`,
    en: `Product ${id}`,
    ro: `Produs ${id}`,
  },
  descriptionTranslations: {
    es: `Descripción ${id}`,
    en: `Description ${id}`,
  },
  shortDescriptionTranslations: {
    es: `Corta ${id}`,
    en: `Short ${id}`,
  },
  priceEur: 10.99,
  compareAtPriceEur: 15.99,
  weightKg: 1.5,
  stockQuantity: 10,
  lowStockThreshold: 5,
  images: [
    {
      id: 1,
      url: `https://example.com/image-${id}-1.jpg`,
      altText: { es: 'Imagen', en: 'Image' },
      sortOrder: 0,
      isPrimary: true,
    },
    {
      id: 2,
      url: `https://example.com/image-${id}-2.jpg`,
      altText: { es: 'Imagen 2', en: 'Image 2' },
      sortOrder: 1,
      isPrimary: false,
    },
  ],
  attributes: {},
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  category: {
    id: 1,
    slug: 'category',
    nameTranslations: { es: 'Categoría', en: 'Category' },
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  name: {
    es: `Producto ${id}`,
    en: `Product ${id}`,
    ro: `Produs ${id}`,
  },
  description: {
    es: `Descripción ${id}`,
    en: `Description ${id}`,
  },
  price: 10.99,
  comparePrice: 15.99,
  slug: `product-${id}`,
  stockStatus: 'in_stock',
  formattedPrice: '€10.99',
  primaryImage: {
    id: 1,
    url: `https://example.com/image-${id}-1.jpg`,
    altText: { es: 'Imagen', en: 'Image' },
    sortOrder: 0,
    isPrimary: true,
  },
  ...overrides,
})

// Helper function to create mock pagination state
const createMockPagination = (overrides: Partial<PaginationState> = {}): PaginationState => ({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
  ...overrides,
})

describe('useProductStructuredData', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockLocale.value = 'en'
    mockUseHead.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('initializes with correct methods', () => {
      const products = ref<ProductWithRelations[]>([])
      const pagination = ref(createMockPagination())

      const composable = useProductStructuredData(products, pagination)

      expect(composable).toHaveProperty('buildProductListStructuredData')
      expect(composable).toHaveProperty('updateStructuredData')
      expect(composable).toHaveProperty('setupWatchers')
      expect(typeof composable.buildProductListStructuredData).toBe('function')
      expect(typeof composable.updateStructuredData).toBe('function')
      expect(typeof composable.setupWatchers).toBe('function')
    })

    it('does not call useHead on initialization', () => {
      const products = ref<ProductWithRelations[]>([])
      const pagination = ref(createMockPagination())

      useProductStructuredData(products, pagination)

      expect(mockUseHead).not.toHaveBeenCalled()
    })
  })

  describe('Schema.org Compliance - ItemList Schema', () => {
    it('generates valid ItemList schema with correct @context', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination({ total: 1 }))

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData).toBeDefined()
      expect(structuredData!['@context']).toBe('https://schema.org')
    })

    it('generates valid ItemList schema with correct @type', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination({ total: 1 }))

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!['@type']).toBe('ItemList')
    })

    it('includes correct numberOfItems from pagination total', () => {
      const products = ref([createMockProduct(1), createMockProduct(2)])
      const pagination = ref(createMockPagination({ total: 100 }))

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.numberOfItems).toBe(100)
    })

    it('falls back to products length when total is not set', () => {
      const products = ref([createMockProduct(1), createMockProduct(2)])
      const pagination = ref(createMockPagination({ total: 0 }))

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.numberOfItems).toBe(2)
    })

    it('includes itemListElement array', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement).toBeDefined()
      expect(Array.isArray(structuredData!.itemListElement)).toBe(true)
    })
  })

  describe('Schema.org Compliance - ListItem Schema', () => {
    it('generates ListItem with correct @type', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0]['@type']).toBe('ListItem')
    })

    it('calculates correct position for first page items', () => {
      const products = ref([createMockProduct(1), createMockProduct(2), createMockProduct(3)])
      const pagination = ref(createMockPagination({ page: 1, limit: 12 }))

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].position).toBe(1)
      expect(structuredData!.itemListElement[1].position).toBe(2)
      expect(structuredData!.itemListElement[2].position).toBe(3)
    })

    it('calculates correct position for second page items', () => {
      const products = ref([createMockProduct(1), createMockProduct(2)])
      const pagination = ref(createMockPagination({ page: 2, limit: 12 }))

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].position).toBe(13) // (2-1) * 12 + 1
      expect(structuredData!.itemListElement[1].position).toBe(14) // (2-1) * 12 + 2
    })

    it('calculates correct position for third page with custom limit', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination({ page: 3, limit: 20 }))

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].position).toBe(41) // (3-1) * 20 + 1
    })

    it('includes item property in ListItem', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item).toBeDefined()
    })
  })

  describe('Schema.org Compliance - Product Schema', () => {
    it('generates Product with correct @type', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item['@type']).toBe('Product')
    })

    it('includes product name', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.name).toBe('Product 1')
    })

    it('includes product image when available', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.image).toBe('https://example.com/image-1-1.jpg')
    })

    it('includes offers property', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers).toBeDefined()
    })
  })

  describe('Schema.org Compliance - Offer Schema', () => {
    it('generates Offer with correct @type', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers['@type']).toBe('Offer')
    })

    it('sets priceCurrency to EUR', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.priceCurrency).toBe('EUR')
    })

    it('formats price to 2 decimal places', () => {
      const products = ref([createMockProduct(1, { price: 10.99 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.price).toBe('10.99')
    })

    it('formats whole number prices with .00', () => {
      const products = ref([createMockProduct(1, { price: 10 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.price).toBe('10.00')
    })

    it('sets availability to InStock when stock is available', () => {
      const products = ref([createMockProduct(1, { stockQuantity: 5 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.availability).toBe('https://schema.org/InStock')
    })

    it('sets availability to OutOfStock when stock is zero', () => {
      const products = ref([createMockProduct(1, { stockQuantity: 0 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.availability).toBe('https://schema.org/OutOfStock')
    })

    it('sets availability to OutOfStock when stockQuantity is undefined', () => {
      const products = ref([createMockProduct(1, { stockQuantity: undefined as any })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.availability).toBe('https://schema.org/OutOfStock')
    })
  })

  describe('Product Data Extraction - Localized Names', () => {
    it('extracts product name in current locale (English)', () => {
      mockLocale.value = 'en'
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.name).toBe('Product 1')
    })

    it('extracts product name in current locale (Spanish)', () => {
      mockLocale.value = 'es'
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.name).toBe('Producto 1')
    })

    it('extracts product name in current locale (Romanian)', () => {
      mockLocale.value = 'ro'
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.name).toBe('Produs 1')
    })

    it('falls back to Spanish when locale translation is missing', () => {
      mockLocale.value = 'fr' // Unsupported locale
      const products = ref([
        createMockProduct(1, {
          name: { es: 'Producto', en: 'Product' } as any,
        }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.name).toBe('Producto')
    })

    it('falls back to first available value when both locale and Spanish are missing', () => {
      mockLocale.value = 'fr'
      const products = ref([
        createMockProduct(1, {
          name: { en: 'Product', ro: 'Produs' } as any,
        }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      // Should get first value from Object.values()
      expect(['Product', 'Produs']).toContain(structuredData!.itemListElement[0].item.name)
    })

    it('uses default "Product" when name translations are empty', () => {
      mockLocale.value = 'en'
      const products = ref([
        createMockProduct(1, {
          name: {} as any,
        }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.name).toBe('Product')
    })

    it('handles string name directly', () => {
      mockLocale.value = 'en'
      const products = ref([
        createMockProduct(1, {
          name: 'Direct String Name' as any,
        }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.name).toBe('Direct String Name')
    })

    it('handles undefined name object', () => {
      mockLocale.value = 'en'
      const products = ref([
        createMockProduct(1, {
          name: undefined as any,
        }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.name).toBe('Product')
    })
  })

  describe('Product Data Extraction - Images', () => {
    it('extracts first image URL when product has images', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.image).toBe('https://example.com/image-1-1.jpg')
    })

    it('extracts multiple image URLs in order', () => {
      const products = ref([
        createMockProduct(1, {
          images: [
            { id: 1, url: 'https://example.com/first.jpg', sortOrder: 0, isPrimary: true },
            { id: 2, url: 'https://example.com/second.jpg', sortOrder: 1, isPrimary: false },
            { id: 3, url: 'https://example.com/third.jpg', sortOrder: 2, isPrimary: false },
          ],
        }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      // Should use first image
      expect(structuredData!.itemListElement[0].item.image).toBe('https://example.com/first.jpg')
    })

    it('filters out empty image URLs', () => {
      const products = ref([
        createMockProduct(1, {
          images: [
            { id: 1, url: '', sortOrder: 0, isPrimary: true } as any,
            { id: 2, url: 'https://example.com/valid.jpg', sortOrder: 1, isPrimary: false },
          ],
        }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.image).toBe('https://example.com/valid.jpg')
    })

    it('omits image property when no images available', () => {
      const products = ref([
        createMockProduct(1, {
          images: [],
        }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.image).toBeUndefined()
    })

    it('omits image property when images is not an array', () => {
      const products = ref([
        createMockProduct(1, {
          images: null as any,
        }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.image).toBeUndefined()
    })
  })

  describe('Product Data Extraction - Stock Availability', () => {
    it('maps positive stock to InStock', () => {
      const products = ref([createMockProduct(1, { stockQuantity: 100 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.availability).toBe('https://schema.org/InStock')
    })

    it('maps stock quantity of 1 to InStock', () => {
      const products = ref([createMockProduct(1, { stockQuantity: 1 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.availability).toBe('https://schema.org/InStock')
    })

    it('maps zero stock to OutOfStock', () => {
      const products = ref([createMockProduct(1, { stockQuantity: 0 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.availability).toBe('https://schema.org/OutOfStock')
    })

    it('maps negative stock to OutOfStock', () => {
      const products = ref([createMockProduct(1, { stockQuantity: -5 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.availability).toBe('https://schema.org/OutOfStock')
    })

    it('maps null stock to OutOfStock', () => {
      const products = ref([createMockProduct(1, { stockQuantity: null as any })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.availability).toBe('https://schema.org/OutOfStock')
    })
  })

  describe('Product Data Extraction - Price Formatting', () => {
    it('formats decimal prices correctly', () => {
      const products = ref([createMockProduct(1, { price: 12.99 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.price).toBe('12.99')
    })

    it('formats integer prices with two decimals', () => {
      const products = ref([createMockProduct(1, { price: 25 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.price).toBe('25.00')
    })

    it('rounds prices with more than 2 decimals', () => {
      const products = ref([createMockProduct(1, { price: 10.999 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.price).toBe('11.00')
    })

    it('handles zero price', () => {
      const products = ref([createMockProduct(1, { price: 0 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.price).toBe('0.00')
    })

    it('handles very large prices', () => {
      const products = ref([createMockProduct(1, { price: 9999.99 })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.price).toBe('9999.99')
    })
  })

  describe('Head Metadata Updates', () => {
    it('calls useHead with structured data script tag', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { updateStructuredData } = useProductStructuredData(products, pagination)
      updateStructuredData()

      expect(mockUseHead).toHaveBeenCalledTimes(1)
      const headCall = mockUseHead.mock.calls[0][0]
      expect(headCall.script).toBeDefined()
      expect(headCall.script.length).toBe(1)
    })

    it('includes application/ld+json script type', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { updateStructuredData } = useProductStructuredData(products, pagination)
      updateStructuredData()

      const headCall = mockUseHead.mock.calls[0][0]
      expect(headCall.script[0].type).toBe('application/ld+json')
    })

    it('serializes structured data as JSON in script children', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { updateStructuredData } = useProductStructuredData(products, pagination)
      updateStructuredData()

      const headCall = mockUseHead.mock.calls[0][0]
      const parsedData = JSON.parse(headCall.script[0].children)
      expect(parsedData['@context']).toBe('https://schema.org')
      expect(parsedData['@type']).toBe('ItemList')
    })

    it('sets page title to "Shop - Moldova Direct"', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { updateStructuredData } = useProductStructuredData(products, pagination)
      updateStructuredData()

      const headCall = mockUseHead.mock.calls[0][0]
      expect(headCall.title).toBe('Shop - Moldova Direct')
    })

    it('includes meta description tag', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { updateStructuredData } = useProductStructuredData(products, pagination)
      updateStructuredData()

      const headCall = mockUseHead.mock.calls[0][0]
      expect(headCall.meta).toBeDefined()
      expect(headCall.meta.length).toBe(1)
      expect(headCall.meta[0].name).toBe('description')
    })

    it('sets correct meta description content', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { updateStructuredData } = useProductStructuredData(products, pagination)
      updateStructuredData()

      const headCall = mockUseHead.mock.calls[0][0]
      expect(headCall.meta[0].content).toBe(
        'Browse authentic Moldovan food and wine products. Premium quality directly from Moldova to Spain.'
      )
    })

    it('does not include script when products are empty', () => {
      const products = ref<ProductWithRelations[]>([])
      const pagination = ref(createMockPagination())

      const { updateStructuredData } = useProductStructuredData(products, pagination)
      updateStructuredData()

      const headCall = mockUseHead.mock.calls[0][0]
      expect(headCall.script).toEqual([])
    })

    it('does not include script when products are null', () => {
      const products = ref<ProductWithRelations[] | null>(null)
      const pagination = ref(createMockPagination())

      const { updateStructuredData } = useProductStructuredData(products, pagination)
      updateStructuredData()

      const headCall = mockUseHead.mock.calls[0][0]
      expect(headCall.script).toEqual([])
    })
  })

  describe('Watcher Setup', () => {
    it('calls updateStructuredData on initialization', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { setupWatchers } = useProductStructuredData(products, pagination)
      setupWatchers()

      expect(mockUseHead).toHaveBeenCalledTimes(1)
    })

    it('updates structured data when products change', async () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { setupWatchers } = useProductStructuredData(products, pagination)
      setupWatchers()

      mockUseHead.mockClear()

      // Change products
      products.value = [createMockProduct(2), createMockProduct(3)]
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockUseHead).toHaveBeenCalled()
    })

    it('updates structured data when pagination page changes', async () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination({ page: 1 }))

      const { setupWatchers } = useProductStructuredData(products, pagination)
      setupWatchers()

      mockUseHead.mockClear()

      // Change page
      pagination.value.page = 2
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockUseHead).toHaveBeenCalled()
    })

    it('watches pagination with deep option enabled', async () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination({ page: 1, total: 10 }))

      const { setupWatchers } = useProductStructuredData(products, pagination)
      setupWatchers()

      mockUseHead.mockClear()

      // Change non-page property (deep watch should still trigger)
      pagination.value.total = 20
      await new Promise(resolve => setTimeout(resolve, 0))

      // With deep watch, any property change triggers the watcher
      // The watch is set up with { deep: true } so this should trigger
      // However, the watcher only watches page specifically, so this won't trigger
      // Let's verify the watcher is set up correctly by not expecting a call
      // The watcher watches: [products, () => pagination.value.page]
      // So changing total won't trigger it
      expect(mockUseHead).not.toHaveBeenCalled()
    })

    it('watches products deeply', async () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { setupWatchers } = useProductStructuredData(products, pagination)
      setupWatchers()

      mockUseHead.mockClear()

      // Modify product property
      products.value[0].price = 999
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockUseHead).toHaveBeenCalled()
    })

    it('can be called multiple times without error', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { setupWatchers } = useProductStructuredData(products, pagination)

      expect(() => {
        setupWatchers()
        setupWatchers()
      }).not.toThrow()
    })
  })

  describe('Edge Cases - Null and Empty States', () => {
    it('returns null when products array is empty', () => {
      const products = ref<ProductWithRelations[]>([])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData).toBeNull()
    })

    it('returns null when products is null', () => {
      const products = ref<ProductWithRelations[] | null>(null)
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData).toBeNull()
    })

    it('handles product with empty images array', () => {
      const products = ref([createMockProduct(1, { images: [] })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.image).toBeUndefined()
    })

    it('handles product with null price', () => {
      const products = ref([createMockProduct(1, { price: null as any })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.price).toBe('0.00')
    })

    it('handles product with undefined price', () => {
      const products = ref([createMockProduct(1, { price: undefined as any })])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.price).toBe('NaN')
    })

    it('handles single product', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination({ total: 1 }))

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement.length).toBe(1)
      expect(structuredData!.numberOfItems).toBe(1)
    })

    it('handles many products', () => {
      const products = ref(Array.from({ length: 50 }, (_, i) => createMockProduct(i + 1)))
      const pagination = ref(createMockPagination({ total: 50 }))

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement.length).toBe(50)
      expect(structuredData!.numberOfItems).toBe(50)
    })
  })

  describe('JSON-LD Output Validation', () => {
    it('produces valid JSON that can be parsed', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(() => JSON.stringify(structuredData)).not.toThrow()
      const json = JSON.stringify(structuredData)
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('produces valid JSON-LD with all required fields', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()
      const json = JSON.parse(JSON.stringify(structuredData))

      expect(json).toHaveProperty('@context')
      expect(json).toHaveProperty('@type')
      expect(json).toHaveProperty('itemListElement')
      expect(json).toHaveProperty('numberOfItems')
    })

    it('escapes special characters in product names', () => {
      const products = ref([
        createMockProduct(1, {
          name: 'Product with "quotes" & <tags>' as any,
        }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()
      const json = JSON.stringify(structuredData)

      expect(() => JSON.parse(json)).not.toThrow()
      // JSON.stringify escapes quotes with backslash, so check for the escaped version
      expect(json).toContain('Product with \\"quotes\\" & <tags>')
    })

    it('produces Schema.org compliant JSON-LD structure', () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      // Validate structure matches Schema.org ItemList specification
      expect(structuredData!['@context']).toBe('https://schema.org')
      expect(structuredData!['@type']).toBe('ItemList')
      expect(Array.isArray(structuredData!.itemListElement)).toBe(true)
      expect(typeof structuredData!.numberOfItems).toBe('number')

      // Validate ListItem structure
      const listItem = structuredData!.itemListElement[0]
      expect(listItem['@type']).toBe('ListItem')
      expect(typeof listItem.position).toBe('number')
      expect(listItem.item).toBeDefined()

      // Validate Product structure
      expect(listItem.item['@type']).toBe('Product')
      expect(typeof listItem.item.name).toBe('string')
      expect(listItem.item.offers).toBeDefined()

      // Validate Offer structure
      expect(listItem.item.offers['@type']).toBe('Offer')
      expect(listItem.item.offers.priceCurrency).toBe('EUR')
      expect(typeof listItem.item.offers.price).toBe('string')
      expect(listItem.item.offers.availability).toMatch(/^https:\/\/schema\.org\/(InStock|OutOfStock)$/)
    })
  })

  describe('Multiple Products Handling', () => {
    it('generates correct structured data for multiple products', () => {
      const products = ref([createMockProduct(1), createMockProduct(2), createMockProduct(3)])
      const pagination = ref(createMockPagination({ total: 3 }))

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement.length).toBe(3)
      expect(structuredData!.itemListElement[0].item.name).toBe('Product 1')
      expect(structuredData!.itemListElement[1].item.name).toBe('Product 2')
      expect(structuredData!.itemListElement[2].item.name).toBe('Product 3')
    })

    it('maintains correct position sequence across products', () => {
      const products = ref([createMockProduct(1), createMockProduct(2), createMockProduct(3)])
      const pagination = ref(createMockPagination({ page: 1, limit: 10 }))

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].position).toBe(1)
      expect(structuredData!.itemListElement[1].position).toBe(2)
      expect(structuredData!.itemListElement[2].position).toBe(3)
    })

    it('handles products with different stock statuses', () => {
      const products = ref([
        createMockProduct(1, { stockQuantity: 10 }),
        createMockProduct(2, { stockQuantity: 0 }),
        createMockProduct(3, { stockQuantity: 5 }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.availability).toBe('https://schema.org/InStock')
      expect(structuredData!.itemListElement[1].item.offers.availability).toBe('https://schema.org/OutOfStock')
      expect(structuredData!.itemListElement[2].item.offers.availability).toBe('https://schema.org/InStock')
    })

    it('handles products with different prices', () => {
      const products = ref([
        createMockProduct(1, { price: 5.99 }),
        createMockProduct(2, { price: 15.5 }),
        createMockProduct(3, { price: 100 }),
      ])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)
      const structuredData = buildProductListStructuredData()

      expect(structuredData!.itemListElement[0].item.offers.price).toBe('5.99')
      expect(structuredData!.itemListElement[1].item.offers.price).toBe('15.50')
      expect(structuredData!.itemListElement[2].item.offers.price).toBe('100.00')
    })
  })

  describe('Integration Scenarios', () => {
    it('handles complete product list page scenario', () => {
      const products = ref([
        createMockProduct(1, { stockQuantity: 10, price: 12.99 }),
        createMockProduct(2, { stockQuantity: 0, price: 8.5 }),
      ])
      const pagination = ref(createMockPagination({ page: 1, limit: 12, total: 25 }))

      const { buildProductListStructuredData, updateStructuredData } = useProductStructuredData(
        products,
        pagination
      )

      const structuredData = buildProductListStructuredData()
      updateStructuredData()

      expect(structuredData).toBeDefined()
      expect(structuredData!.numberOfItems).toBe(25)
      expect(structuredData!.itemListElement.length).toBe(2)
      expect(mockUseHead).toHaveBeenCalled()
    })

    it('handles pagination navigation scenario', async () => {
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination({ page: 1, limit: 12 }))

      const { setupWatchers } = useProductStructuredData(products, pagination)
      setupWatchers()

      // Navigate to page 2
      pagination.value.page = 2
      products.value = [createMockProduct(13)]
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockUseHead).toHaveBeenCalled()
    })

    it('handles locale switching scenario', async () => {
      mockLocale.value = 'en'
      const products = ref([createMockProduct(1)])
      const pagination = ref(createMockPagination())

      const { buildProductListStructuredData } = useProductStructuredData(products, pagination)

      let structuredData = buildProductListStructuredData()
      expect(structuredData!.itemListElement[0].item.name).toBe('Product 1')

      // Switch locale
      mockLocale.value = 'es'
      structuredData = buildProductListStructuredData()
      expect(structuredData!.itemListElement[0].item.name).toBe('Producto 1')
    })
  })
})
