/**
 * Product Storytelling Composable
 *
 * Extracts marketing and storytelling content from product attributes including:
 * - Producer stories and origin narratives
 * - Tasting notes and food pairings (conditionally shown for culinary categories)
 * - Awards and sustainability badges
 * - Review summaries with ratings
 *
 * Provides localized fallback content when product attributes are not available.
 */

import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductUtils } from './useProductUtils'
import type { ProductWithRelations } from '~/types/database'

/** Review summary with rating, count, and highlighted excerpts */
interface ReviewSummary {
  rating: number
  count: number
  highlights: string[]
}

/**
 * Recipe item from structured pairing data.
 * Used when pairings.recipes contains objects rather than strings.
 */
interface PairingRecipe {
  name?: string
}

// Default values for products without review data
const DEFAULT_RATING = 4.8
const DEFAULT_REVIEW_COUNT = 126

/**
 * Safely parses a numeric value with NaN protection and dev-mode logging.
 */
function parseNumeric(value: unknown, fallback: number, fieldName: string, productId?: number): number {
  if (value === null || value === undefined) return fallback
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value).replace(',', '.'))
  if (Number.isNaN(parsed)) {
    if (import.meta.dev) {
      console.warn(`[useProductStory] Invalid numeric value for ${fieldName}: ${JSON.stringify(value)}${productId ? ` (product ${productId})` : ''}, using fallback ${fallback}`)
    }
    return fallback
  }
  return parsed
}

export function useProductStory(
  product: ComputedRef<(ProductWithRelations & { attributes?: Record<string, any> }) | null>,
) {
  const { t } = useI18n()
  const { getLocalizedText, getCategoryLabel } = useProductUtils()

  const productAttributes = computed(() => product.value?.attributes || {})
  const categoryLabel = computed(() => getCategoryLabel(product.value?.category))
  const culinaryKeywords = [
    'wine', 'beverage', 'drink', 'beer', 'cider', 'spirits', 'liqueur',
    'food', 'gourmet', 'grocery', 'tea', 'coffee', 'snack', 'confection',
    'condiment', 'sauce', 'spice', 'bakery', 'dairy', 'meat', 'seafood',
    'honey', 'jam', 'preserve', 'oil', 'vinegar', 'chocolate', 'candy',
  ]
  const isCulinaryCategory = computed(() => {
    const slug = (product.value?.category?.slug || '').toString().toLowerCase()
    const name = (categoryLabel.value || '').toLowerCase()

    return culinaryKeywords.some(keyword => slug.includes(keyword) || name.includes(keyword))
  })

  const hasCulinaryAttributes = computed(() => {
    const attrs = productAttributes.value || {}
    const tastingNotesAttr = attrs.tasting_notes || attrs.tastingNotes
    const pairingsAttr = attrs.pairings || attrs.pairingIdeas
    const flavorSignals = [
      attrs.flavorProfile,
      attrs.flavor_profile,
      attrs.tasteProfile,
      attrs.taste_profile,
    ].filter(Boolean)

    return Boolean(tastingNotesAttr || pairingsAttr || flavorSignals.length)
  })

  /**
   * Whether to display culinary-specific content (tasting notes, pairings).
   * True when product is in a culinary category or has culinary-related attributes.
   */
  const shouldShowCulinaryDetails = computed(() => isCulinaryCategory.value || hasCulinaryAttributes.value)

  /**
   * Producer story and background
   */
  const storytelling = computed((): { producer: string } => {
    const producerStory
      = productAttributes.value?.producer_story || productAttributes.value?.producerStory

    return {
      producer:
        producerStory
        || t('products.story.producerFallback', {
          category: categoryLabel.value || t('products.commonProduct'),
        }),
    }
  })

  /**
   * Tasting notes for culinary products.
   * Returns empty array for non-culinary categories without tasting attributes.
   * Supports array, string (comma-separated), and structured object formats
   * (with aromas and flavors sub-arrays).
   * Falls back to localized defaults when no tasting_notes attribute is present.
   */
  const tastingNotes = computed((): string[] => {
    if (!shouldShowCulinaryDetails.value) return []

    const notes = productAttributes.value?.tasting_notes || productAttributes.value?.tastingNotes

    if (Array.isArray(notes)) return notes

    if (notes && typeof notes === 'object') {
      const structuredNotes = [
        ...(Array.isArray(notes.aromas) ? notes.aromas : []),
        ...(Array.isArray(notes.flavors) ? notes.flavors : []),
      ].filter(Boolean)

      if (structuredNotes.length) return structuredNotes
    }

    if (typeof notes === 'string') {
      return notes.split(',').map(note => note.trim()).filter(Boolean)
    }

    return t('products.story.defaultNotes')
      .split('|')
      .map(entry => entry.trim())
  })

  /**
   * Food pairing suggestions for culinary products.
   * Returns empty array for non-culinary categories without pairing attributes.
   * Supports array, string (comma-separated), and structured object formats
   * (with foods, recipes, and occasions sub-arrays).
   * Falls back to localized defaults when no pairings attribute is present.
   */
  const pairingIdeas = computed((): string[] => {
    if (!shouldShowCulinaryDetails.value) return []

    const pairings = productAttributes.value?.pairings

    if (Array.isArray(pairings)) return pairings

    if (pairings && typeof pairings === 'object') {
      const structuredPairings = [
        ...(Array.isArray(pairings.foods) ? pairings.foods : []),
        ...(Array.isArray(pairings.recipes) ? pairings.recipes.map((recipe: PairingRecipe) => recipe?.name).filter(Boolean) : []),
        ...(Array.isArray(pairings.occasions) ? pairings.occasions : []),
      ].filter(Boolean)

      if (structuredPairings.length) return structuredPairings
    }

    if (typeof pairings === 'string') {
      return pairings.split(',').map(pairing => pairing.trim()).filter(Boolean)
    }

    return t('products.story.defaultPairings')
      .split('|')
      .map(entry => entry.trim())
  })

  /**
   * Product awards and recognitions
   */
  const awards = computed((): string[] => {
    const awardList = productAttributes.value?.awards

    if (Array.isArray(awardList)) return awardList

    if (typeof awardList === 'string') {
      return awardList.split(',').map(award => award.trim()).filter(Boolean)
    }

    return []
  })

  /**
   * Origin and terroir story
   */
  const originStory = computed((): string => {
    if (productAttributes.value?.terroir) {
      return productAttributes.value.terroir
    }

    if (product.value?.origin) {
      return t('products.story.originFallback', { origin: product.value.origin })
    }

    const categoryTranslations = product.value?.category?.nameTranslations || {}
    const categoryName = getLocalizedText(categoryTranslations)

    return t('products.story.originCategoryFallback', {
      category: categoryName || t('products.commonProduct'),
    })
  })

  /**
   * Review summary with ratings and highlights.
   * Uses default values (4.8 rating, 126 count) when review data is missing.
   * Logs warnings in dev mode when falling back to defaults.
   */
  const reviewSummary = computed((): ReviewSummary => {
    const productId = product.value?.id
    const rawRating = productAttributes.value?.rating
    const rawCount = productAttributes.value?.review_count || productAttributes.value?.reviewCount

    // Log when using fallback values in dev mode
    if (import.meta.dev && !rawRating && !rawCount && productId) {
      console.warn(`[useProductStory] Product ${productId} missing review data - using placeholder values`)
    }

    const rating = parseNumeric(rawRating, DEFAULT_RATING, 'rating', productId)
    const count = parseNumeric(rawCount, DEFAULT_REVIEW_COUNT, 'review_count', productId)

    const highlightsRaw
      = productAttributes.value?.review_highlights
        || productAttributes.value?.reviewHighlights

    let highlights: string[] = []

    if (Array.isArray(highlightsRaw)) {
      highlights = highlightsRaw
    }
    else if (typeof highlightsRaw === 'string') {
      highlights = highlightsRaw.split('|').map((item: string) => item.trim())
    }
    else {
      highlights = t('products.socialProof.highlights')
        .split('|')
        .map(entry => entry.trim())
    }

    return {
      rating: Number(rating.toFixed(1)),
      count,
      highlights,
    }
  })

  /**
   * Sustainability and certification badges
   */
  const sustainabilityBadges = computed((): string[] => {
    const badges: string[] = []
    const attrs = productAttributes.value || {}

    const truthy = (value: any) => value === true || value === 'true' || value === 1

    if (truthy(attrs.organic) || truthy(attrs.organicCertified)) badges.push('organic')
    if (truthy(attrs.handcrafted) || truthy(attrs.smallBatch)) badges.push('handcrafted')
    if (truthy(attrs.familyOwned)) badges.push('familyOwned')
    if (truthy(attrs.limitedRelease) || truthy(attrs.limitedEdition)) badges.push('limited')
    if (truthy(attrs.protectedOrigin) || truthy(attrs.geographicIndication)) {
      badges.push('heritage')
    }

    // Default badges if none are set
    if (!badges.length) {
      if (import.meta.dev && product.value?.id) {
        console.warn(`[useProductStory] Product ${product.value.id} has no sustainability badges - using defaults`)
      }
      badges.push('handcrafted', 'familyOwned')
    }

    return Array.from(new Set(badges)).slice(0, 5)
  })

  return {
    storytelling,
    tastingNotes,
    pairingIdeas,
    awards,
    originStory,
    reviewSummary,
    sustainabilityBadges,
    shouldShowCulinaryDetails,
  }
}
