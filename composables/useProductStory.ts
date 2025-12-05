/**
 * Product Storytelling Composable
 *
 * Handles product storytelling, attributes, and marketing content
 */

import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductUtils } from './useProductUtils'
import type { ProductWithRelations } from '~/types/database'

interface ProductStoryData {
  producer: string
  tastingNotes: string[]
  pairingIdeas: string[]
  awards: string[]
  originStory: string
  sustainabilityBadges: string[]
}

interface ReviewSummary {
  rating: number
  count: number
  highlights: string[]
}

export function useProductStory(
  product: ComputedRef<(ProductWithRelations & { attributes?: Record<string, any> }) | null>
) {
  const { t } = useI18n()
  const { getLocalizedText, getCategoryLabel } = useProductUtils()

  const productAttributes = computed(() => product.value?.attributes || {})
  const categoryLabel = computed(() => getCategoryLabel(product.value?.category))

  /**
   * Producer story and background
   */
  const storytelling = computed((): { producer: string } => {
    const producerStory =
      productAttributes.value?.producer_story || productAttributes.value?.producerStory

    return {
      producer:
        producerStory ||
        t('products.story.producerFallback', {
          category: categoryLabel.value || t('products.commonProduct')
        })
    }
  })

  /**
   * Tasting notes from product attributes
   */
  const tastingNotes = computed((): string[] => {
    const notes = productAttributes.value?.tasting_notes || productAttributes.value?.tastingNotes

    if (Array.isArray(notes)) return notes

    if (typeof notes === 'string') {
      return notes.split(',').map(note => note.trim()).filter(Boolean)
    }

    return t('products.story.defaultNotes')
      .split('|')
      .map(entry => entry.trim())
  })

  /**
   * Food pairing suggestions
   */
  const pairingIdeas = computed((): string[] => {
    const pairings = productAttributes.value?.pairings

    if (Array.isArray(pairings)) return pairings

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
      category: categoryName || t('products.commonProduct')
    })
  })

  /**
   * Review summary with ratings and highlights
   */
  const reviewSummary = computed((): ReviewSummary => {
    const rating = Number(productAttributes.value?.rating || 4.8)
    const count = Number(
      productAttributes.value?.review_count ||
      productAttributes.value?.reviewCount ||
      126
    )

    const highlightsRaw =
      productAttributes.value?.review_highlights ||
      productAttributes.value?.reviewHighlights

    let highlights: string[] = []

    if (Array.isArray(highlightsRaw)) {
      highlights = highlightsRaw
    } else if (typeof highlightsRaw === 'string') {
      highlights = highlightsRaw.split('|').map((item: string) => item.trim())
    } else {
      highlights = t('products.socialProof.highlights')
        .split('|')
        .map(entry => entry.trim())
    }

    return {
      rating: Number(rating.toFixed(1)),
      count,
      highlights
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
    sustainabilityBadges
  }
}
