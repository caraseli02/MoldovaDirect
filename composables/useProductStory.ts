/**
 * Product Storytelling Composable
 *
 * Extracts and formats product narrative content from attributes for display,
 * including tasting notes, food pairings, awards, origin stories, reviews,
 * and sustainability badges. Automatically determines whether culinary-specific
 * details should be shown based on product category.
 *
 * Returns null or empty arrays when data is not available - the UI layer
 * should handle displaying appropriate "no data" states.
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

    // Return empty array when no tasting notes exist - UI should handle this gracefully
    return []
  })

  /**
   * Food pairing suggestions for culinary products.
   * Returns empty array for non-culinary categories without pairing attributes.
   * Supports array, string (comma-separated), and structured object formats
   * (with foods, recipes, and occasions sub-arrays).
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

    // Return empty array when no pairing ideas exist - UI should handle this gracefully
    return []
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
   * Returns null when no review data exists - UI should display "no reviews yet" state.
   */
  const reviewSummary = computed((): ReviewSummary | null => {
    const attrs = productAttributes.value || {}
    const ratingRaw = attrs.rating
    const countRaw = attrs.review_count || attrs.reviewCount

    // Return null when no real review data exists - never fabricate reviews
    if (ratingRaw === undefined && countRaw === undefined) {
      return null
    }

    const rating = Number(ratingRaw || 0)
    const count = Number(countRaw || 0)

    const highlightsRaw = attrs.review_highlights || attrs.reviewHighlights

    let highlights: string[] = []

    if (Array.isArray(highlightsRaw)) {
      highlights = highlightsRaw
    }
    else if (typeof highlightsRaw === 'string') {
      highlights = highlightsRaw.split('|').map((item: string) => item.trim())
    }

    return {
      rating: Number(rating.toFixed(1)),
      count,
      highlights,
    }
  })

  /**
   * Sustainability and certification badges.
   * Returns only badges that the product actually has - never fabricates badges.
   * UI should handle empty array gracefully (hide section or show "no certifications").
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

    // Return only actual badges - do not fabricate badges for products without certifications
    return Array.from(new Set(badges)).slice(0, 5)
  })

  /**
   * Category-aware section titles
   * Returns appropriate titles based on whether the product is culinary or not
   */
  const sectionTitles = computed(() => {
    const isCulinary = shouldShowCulinaryDetails.value

    return {
      story: isCulinary
        ? t('products.story.titleCulinary')
        : t('products.story.titleGeneric'),
      related: isCulinary
        ? t('products.related.titleCulinary')
        : t('products.related.titleGeneric'),
      relatedSubtitle: isCulinary
        ? t('products.related.subtitle')
        : t('products.related.subtitleGeneric'),
    }
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
    isCulinaryCategory,
    sectionTitles,
  }
}
