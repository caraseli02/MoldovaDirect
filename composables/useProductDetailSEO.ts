/**
 * Product Detail SEO Composable
 *
 * Generates Schema.org structured data and meta tags for product detail pages
 */

import { computed, type ComputedRef } from 'vue'
import { useProductUtils } from './useProductUtils'
import type { ProductWithRelations } from '~/types/database'

interface StructuredDataOptions {
  productUrl: string
  rating?: {
    rating: number
    count: number
  }
  brand?: string
}

export function useProductDetailSEO(
  product: ComputedRef<(ProductWithRelations & { attributes?: Record<string, any> }) | null>,
  options: ComputedRef<StructuredDataOptions>,
) {
  const { getLocalizedText, getCategoryLabel } = useProductUtils()

  /**
   * Generate complete product structured data
   */
  const structuredData = computed(() => {
    if (!product.value) return null

    const stockQuantity = product.value.stockQuantity || 0
    const availabilityStatus
      = stockQuantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'

    // Build image array
    const productImages = product.value.images?.map(img => img.url).filter(Boolean) || []

    // Get brand from attributes or use category as fallback
    const brand
      = options.value.brand
        || product.value.attributes?.brand
        || product.value.attributes?.producer
        || getCategoryLabel(product.value.category)
        || 'Moldova Direct'

    // Build Product structured data
    const data: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': getLocalizedText(product.value.name),
      'description':
        getLocalizedText(product.value.description)
        || getLocalizedText(product.value.shortDescription),
      'image': productImages,
      'sku': product.value.sku,
      'brand': {
        '@type': 'Brand',
        'name': brand,
      },
      'offers': {
        '@type': 'Offer',
        'url': options.value.productUrl,
        'priceCurrency': 'EUR',
        'price': Number(product.value.price).toFixed(2),
        'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split('T')[0],
        'availability': availabilityStatus,
        'itemCondition': 'https://schema.org/NewCondition',
      },
    }

    // Add compare price if available
    if (
      product.value.comparePrice
      && Number(product.value.comparePrice) > Number(product.value.price)
    ) {
      data.offers.priceType = 'https://schema.org/SalePrice'
    }

    // Add aggregate rating if available
    const rating = options.value.rating
    if (rating && rating.count > 0) {
      data.aggregateRating = {
        '@type': 'AggregateRating',
        'ratingValue': rating.rating.toString(),
        'reviewCount': rating.count.toString(),
        'bestRating': '5',
        'worstRating': '1',
      }
    }

    // Add additional product details if available
    if (product.value.origin) {
      data.countryOfOrigin = {
        '@type': 'Country',
        'name': product.value.origin,
      }
    }

    if (product.value.weightKg) {
      data.weight = {
        '@type': 'QuantitativeValue',
        'value': product.value.weightKg,
        'unitCode': 'KGM',
      }
    }

    // Add category
    if (product.value.category) {
      data.category = getCategoryLabel(product.value.category)
    }

    return data
  })

  /**
   * Generate meta tags for social sharing
   */
  const metaTags = computed(() => {
    if (!product.value) return []

    return [
      {
        name: 'description',
        content:
          getLocalizedText(product.value.description)
          || getLocalizedText(product.value.shortDescription)
          || `${getLocalizedText(product.value.name)} - Authentic Moldovan product`,
      },
      {
        property: 'og:title',
        content: getLocalizedText(product.value.name),
      },
      {
        property: 'og:description',
        content:
          getLocalizedText(product.value.shortDescription)
          || getLocalizedText(product.value.description),
      },
      {
        property: 'og:image',
        content: product.value.images?.[0]?.url,
      },
      {
        property: 'og:type',
        content: 'product',
      },
      {
        property: 'product:price:amount',
        content: product.value.price,
      },
      {
        property: 'product:price:currency',
        content: 'EUR',
      },
    ]
  })

  /**
   * Generate page title
   */
  const pageTitle = computed(() => {
    if (!product.value) return 'Product - Moldova Direct'
    return `${getLocalizedText(product.value.name)} - Moldova Direct`
  })

  return {
    structuredData,
    metaTags,
    pageTitle,
  }
}
