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
        // Section titles for culinary products
        'products.story.titleCulinary': 'The Story Behind This Flavor',
        'products.story.titleGeneric': 'About This Product',
        'products.related.titleCulinary': 'Complete Your Tasting Experience',
        'products.related.titleGeneric': 'You May Also Like',
        'products.related.subtitle': 'Pair with these selections',
        'products.related.subtitleGeneric': 'Explore similar items',
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
  it('handles null product gracefully', () => {
    const product = computed(() => null)
    const {
      tastingNotes,
      pairingIdeas,
      storytelling,
      awards,
      sustainabilityBadges,
      shouldShowCulinaryDetails,
      reviewSummary,
    } = useProductStory(product)

    expect(tastingNotes.value).toEqual([])
    expect(pairingIdeas.value).toEqual([])
    expect(awards.value).toEqual([])
    expect(shouldShowCulinaryDetails.value).toBe(false)
    // No fake badges when no product
    expect(sustainabilityBadges.value).toEqual([])
    // Storytelling uses fallback with category param (mock appends :param)
    expect(storytelling.value.producer).toContain('Producer fallback')
    // Review summary returns null when no data exists
    expect(reviewSummary.value).toBeNull()
  })

  describe('tastingNotes and pairingIdeas', () => {
    it('returns empty arrays for culinary categories without tasting data', () => {
      const product = createProduct({
        category: { ...baseProduct.category, slug: 'wine' },
        attributes: {},
      })
      const { tastingNotes, pairingIdeas, shouldShowCulinaryDetails } = useProductStory(product)

      // shouldShowCulinaryDetails is true for wine category
      expect(shouldShowCulinaryDetails.value).toBe(true)
      // But without actual data, returns empty arrays (no fake data)
      expect(tastingNotes.value).toEqual([])
      expect(pairingIdeas.value).toEqual([])
    })

    it('returns empty arrays for non-food categories without attributes', () => {
      const product = createProduct({
        category: {
          ...baseProduct.category,
          slug: 'skincare',
          nameTranslations: { en: 'Skincare', es: 'Cuidado de la piel' },
        },
        attributes: {},
      })
      const { tastingNotes, pairingIdeas, shouldShowCulinaryDetails } = useProductStory(product)

      expect(shouldShowCulinaryDetails.value).toBe(false)
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
      const { tastingNotes, pairingIdeas, shouldShowCulinaryDetails } = useProductStory(product)

      // Has culinary attributes so shouldShowCulinaryDetails is true
      expect(shouldShowCulinaryDetails.value).toBe(true)
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

  describe('reviewSummary', () => {
    it('returns null when no review data exists', () => {
      const product = createProduct({
        attributes: {},
      })
      const { reviewSummary } = useProductStory(product)

      expect(reviewSummary.value).toBeNull()
    })

    it('returns review data when rating is provided', () => {
      const product = createProduct({
        attributes: {
          rating: 4.5,
          review_count: 50,
        },
      })
      const { reviewSummary } = useProductStory(product)

      expect(reviewSummary.value).not.toBeNull()
      expect(reviewSummary.value?.rating).toBe(4.5)
      expect(reviewSummary.value?.count).toBe(50)
    })

    it('parses highlights from pipe-delimited string', () => {
      const product = createProduct({
        attributes: {
          rating: 4.0,
          review_highlights: 'Great taste|Smooth finish',
        },
      })
      const { reviewSummary } = useProductStory(product)

      expect(reviewSummary.value?.highlights).toEqual(['Great taste', 'Smooth finish'])
    })
  })

  describe('sustainabilityBadges', () => {
    it('returns empty array when no sustainability attributes are set', () => {
      const product = createProduct({
        attributes: {},
      })
      const { sustainabilityBadges } = useProductStory(product)

      // No fake badges - returns empty array
      expect(sustainabilityBadges.value).toEqual([])
    })

    it('returns actual badges when attributes are set', () => {
      const product = createProduct({
        attributes: {
          organic: true,
          handcrafted: true,
          familyOwned: true,
        },
      })
      const { sustainabilityBadges } = useProductStory(product)

      expect(sustainabilityBadges.value).toContain('organic')
      expect(sustainabilityBadges.value).toContain('handcrafted')
      expect(sustainabilityBadges.value).toContain('familyOwned')
    })

    it('recognizes truthy string values', () => {
      const product = createProduct({
        attributes: {
          organic: 'true',
          handcrafted: 1,
        },
      })
      const { sustainabilityBadges } = useProductStory(product)

      expect(sustainabilityBadges.value).toContain('organic')
      expect(sustainabilityBadges.value).toContain('handcrafted')
    })
  })

  describe('awards', () => {
    it('returns empty array when no awards exist', () => {
      const product = createProduct({
        attributes: {},
      })
      const { awards } = useProductStory(product)

      expect(awards.value).toEqual([])
    })

    it('returns array awards directly', () => {
      const product = createProduct({
        attributes: {
          awards: ['Gold Medal 2023', 'Best in Class'],
        },
      })
      const { awards } = useProductStory(product)

      expect(awards.value).toEqual(['Gold Medal 2023', 'Best in Class'])
    })

    it('parses comma-separated award string', () => {
      const product = createProduct({
        attributes: {
          awards: 'Silver Medal, Bronze Award',
        },
      })
      const { awards } = useProductStory(product)

      expect(awards.value).toEqual(['Silver Medal', 'Bronze Award'])
    })
  })

  describe('sectionTitles', () => {
    it('returns culinary titles for wine category', () => {
      const product = createProduct({
        category: { ...baseProduct.category, slug: 'wine' },
      })
      const { sectionTitles } = useProductStory(product)

      expect(sectionTitles.value.story).toBe('The Story Behind This Flavor')
      expect(sectionTitles.value.related).toBe('Complete Your Tasting Experience')
      expect(sectionTitles.value.relatedSubtitle).toBe('Pair with these selections')
    })

    it('returns culinary titles for honey category', () => {
      const product = createProduct({
        category: { ...baseProduct.category, slug: 'honey' },
      })
      const { sectionTitles } = useProductStory(product)

      expect(sectionTitles.value.story).toBe('The Story Behind This Flavor')
      expect(sectionTitles.value.related).toBe('Complete Your Tasting Experience')
    })

    it('returns culinary titles for preserves category', () => {
      const product = createProduct({
        category: { ...baseProduct.category, slug: 'preserves' },
      })
      const { sectionTitles } = useProductStory(product)

      expect(sectionTitles.value.story).toBe('The Story Behind This Flavor')
      expect(sectionTitles.value.related).toBe('Complete Your Tasting Experience')
    })

    it('returns generic titles for non-culinary category', () => {
      const product = createProduct({
        category: {
          ...baseProduct.category,
          slug: 'home-decor',
          nameTranslations: { en: 'Home Decor', es: 'Decoración' },
        },
      })
      const { sectionTitles } = useProductStory(product)

      expect(sectionTitles.value.story).toBe('About This Product')
      expect(sectionTitles.value.related).toBe('You May Also Like')
      expect(sectionTitles.value.relatedSubtitle).toBe('Explore similar items')
    })

    it('returns generic titles for skincare category', () => {
      const product = createProduct({
        category: {
          ...baseProduct.category,
          slug: 'skincare',
          nameTranslations: { en: 'Skincare', es: 'Cuidado de la piel' },
        },
      })
      const { sectionTitles } = useProductStory(product)

      expect(sectionTitles.value.story).toBe('About This Product')
      expect(sectionTitles.value.related).toBe('You May Also Like')
    })

    it('returns culinary titles when non-food product has culinary attributes', () => {
      const product = createProduct({
        category: {
          ...baseProduct.category,
          slug: 'gifts',
          nameTranslations: { en: 'Gifts', es: 'Regalos' },
        },
        attributes: {
          tasting_notes: 'Sweet, Aromatic',
          pairings: ['Tea time', 'Desserts'],
        },
      })
      const { sectionTitles } = useProductStory(product)

      // Has culinary attributes so uses culinary titles
      expect(sectionTitles.value.story).toBe('The Story Behind This Flavor')
      expect(sectionTitles.value.related).toBe('Complete Your Tasting Experience')
    })

    it('returns generic titles for null product', () => {
      const product = computed(() => null)
      const { sectionTitles } = useProductStory(product)

      expect(sectionTitles.value.story).toBe('About This Product')
      expect(sectionTitles.value.related).toBe('You May Also Like')
      expect(sectionTitles.value.relatedSubtitle).toBe('Explore similar items')
    })
  })
})
