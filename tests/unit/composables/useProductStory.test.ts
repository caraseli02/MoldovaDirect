import { computed, ref } from 'vue'
import { describe, it, expect, vi } from 'vitest'
import { useProductStory } from '~/composables/useProductStory'
import type { ProductWithRelations } from '~/types/database'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, any>) => {
      const translations: Record<string, string> = {
        'products.story.defaultNotes': 'Crisp apple|Citrus zest',
        'products.story.defaultPairings': 'Seafood|Soft cheese',
        'products.story.producerFallback': 'Producer fallback',
        'products.story.originFallback': 'Origin fallback',
        'products.story.originCategoryFallback': 'Origin category fallback',
        'products.socialProof.highlights': 'Balanced|Bright',
      }

      if (params?.category) return `${translations[key]}:${params.category}`
      if (params?.origin) return `${translations[key]}:${params.origin}`

      return translations[key] || key
    },
    locale: ref('en'),
  }),
}))

const baseProduct: ProductWithRelations = {
  id: 1,
  sku: 'SKU-1',
  categoryId: 1,
  nameTranslations: { en: 'Test Product', es: 'Producto de prueba' },
  descriptionTranslations: { en: 'Description', es: 'Descripción' },
  shortDescriptionTranslations: { en: 'Short desc', es: 'Desc corta' },
  priceEur: 10,
  compareAtPriceEur: 12,
  weightKg: 1,
  stockQuantity: 5,
  lowStockThreshold: 1,
  reorderPoint: 0,
  images: [],
  attributes: {},
  isActive: true,
  createdAt: '',
  updatedAt: '',
  category: {
    id: 1,
    slug: 'wine',
    parentId: undefined,
    nameTranslations: { en: 'Wine', es: 'Vino' },
    descriptionTranslations: { en: 'Wine category', es: 'Categoría de vino' },
    imageUrl: undefined,
    sortOrder: 1,
    isActive: true,
    createdAt: '',
  },
  name: { en: 'Test Product', es: 'Producto de prueba' },
  description: { en: 'Description', es: 'Descripción' },
  shortDescription: { en: 'Short desc', es: 'Desc corta' },
  price: 10,
  comparePrice: 12,
  slug: 'test-product',
  stockStatus: 'in_stock',
  formattedPrice: '10.00',
}

const createProduct = (overrides: Partial<ProductWithRelations> & { attributes?: Record<string, any> } = {}) => {
  const product = ref<ProductWithRelations & { attributes?: Record<string, any> }>({
    ...baseProduct,
    ...overrides,
    category: {
      ...baseProduct.category,
      ...(overrides.category || {}),
    },
    attributes: {
      ...(baseProduct.attributes || {}),
      ...(overrides.attributes || {}),
    },
  })

  return computed(() => product.value)
}

describe('useProductStory', () => {
  it('uses culinary defaults for beverage categories without tasting data', () => {
    const product = createProduct({
      category: { ...baseProduct.category, slug: 'wine' },
      attributes: {},
    })
    const { tastingNotes, pairingIdeas } = useProductStory(product)

    expect(tastingNotes.value).toEqual(['Crisp apple', 'Citrus zest'])
    expect(pairingIdeas.value).toEqual(['Seafood', 'Soft cheese'])
  })

  it('hides tasting and pairing sections for non-food categories without attributes', () => {
    const product = createProduct({
      category: {
        ...baseProduct.category,
        slug: 'skincare',
        nameTranslations: { en: 'Skincare', es: 'Cuidado de la piel' },
      },
      attributes: {},
    })
    const { tastingNotes, pairingIdeas } = useProductStory(product)

    expect(tastingNotes.value).toEqual([])
    expect(pairingIdeas.value).toEqual([])
  })

  it('uses tasting and pairing attributes when provided even for non-food categories', () => {
    const product = createProduct({
      category: {
        ...baseProduct.category,
        slug: 'home-decor',
        nameTranslations: { en: 'Home decor', es: 'Decoración del hogar' },
      },
      attributes: {
        tasting_notes: 'Bright, Floral',
        pairings: ['Morning routines', 'Relaxing evenings'],
      },
    })
    const { tastingNotes, pairingIdeas } = useProductStory(product)

    expect(tastingNotes.value).toEqual(['Bright', 'Floral'])
    expect(pairingIdeas.value).toEqual(['Morning routines', 'Relaxing evenings'])
  })

  it('combines structured tasting notes and pairings when provided', () => {
    const product = createProduct({
      category: {
        ...baseProduct.category,
        slug: 'beverage',
        nameTranslations: { en: 'Beverages', es: 'Bebidas' },
      },
      attributes: {
        tastingNotes: {
          aromas: ['Honey', 'Pear'],
          flavors: ['Vanilla'],
        },
        pairings: {
          foods: ['Cheese board'],
          recipes: [{ name: 'Pear tart' }],
          occasions: ['Weekend brunch'],
        },
      },
    })
    const { tastingNotes, pairingIdeas } = useProductStory(product)

    expect(tastingNotes.value).toEqual(['Honey', 'Pear', 'Vanilla'])
    expect(pairingIdeas.value).toEqual(['Cheese board', 'Pear tart', 'Weekend brunch'])
  })
})
