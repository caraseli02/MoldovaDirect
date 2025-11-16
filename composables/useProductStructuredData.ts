import { watch } from 'vue'
import type { Ref } from 'vue'
import { useHead } from '#imports'
import { useI18n } from 'vue-i18n'
import type { ProductWithRelations } from '~/types'
import type { PaginationState } from './useProductPagination'

/**
 * Structured data for a product item in a list
 */
interface ProductListItem {
  '@type': 'ListItem'
  position: number
  item: {
    '@type': 'Product'
    name: string
    image?: string
    offers: {
      '@type': 'Offer'
      priceCurrency: string
      price: string
      availability: string
    }
  }
}

/**
 * Structured data for a product list
 */
interface ProductListStructuredData {
  '@context': string
  '@type': 'ItemList'
  itemListElement: ProductListItem[]
  numberOfItems: number
}

/**
 * Composable for managing product structured data (Schema.org)
 * Handles SEO metadata generation for product listings
 *
 * Follows Single Responsibility Principle - only handles structured data
 *
 * @example
 * ```vue
 * const { updateStructuredData } = useProductStructuredData(products, pagination)
 * ```
 */
export function useProductStructuredData(
  products: Ref<ProductWithRelations[] | null>,
  pagination: Ref<PaginationState>
) {
  const { locale } = useI18n()

  /**
   * Build ItemList structured data for product listing
   * Returns null if no products available
   */
  const buildProductListStructuredData = (): ProductListStructuredData | null => {
    if (!products.value || products.value.length === 0) {
      return null
    }

    const itemListElements: ProductListItem[] = products.value.map((product, index) => {
      // Extract localized product name with fallbacks
      const productName = typeof product.name === 'string'
        ? product.name
        : product.name?.[locale.value] || product.name?.es || Object.values(product.name || {})[0] || 'Product'

      // Extract product images
      const productImages = Array.isArray(product.images)
        ? product.images.map(img => img.url).filter(Boolean)
        : []

      return {
        '@type': 'ListItem',
        position: (pagination.value.page - 1) * pagination.value.limit + index + 1,
        item: {
          '@type': 'Product',
          name: productName,
          image: productImages.length > 0 ? productImages[0] : undefined,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: Number(product.price).toFixed(2),
            availability: (product.stockQuantity || 0) > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock'
          }
        }
      }
    })

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: itemListElements,
      numberOfItems: pagination.value.total || products.value.length
    }
  }

  /**
   * Update HTML head with structured data and metadata
   */
  const updateStructuredData = () => {
    const structuredData = buildProductListStructuredData()
    const scripts = structuredData ? [
      {
        type: 'application/ld+json',
        children: JSON.stringify(structuredData)
      }
    ] : []

    useHead({
      title: 'Shop - Moldova Direct',
      meta: [
        {
          name: 'description',
          content: 'Browse authentic Moldovan food and wine products. Premium quality directly from Moldova to Spain.'
        }
      ],
      script: scripts
    })
  }

  /**
   * Setup watchers to automatically update structured data
   * Updates when products or page number changes
   */
  const setupWatchers = () => {
    // Initial update
    updateStructuredData()

    // Watch for changes
    watch([products, () => pagination.value.page], () => {
      updateStructuredData()
    }, { deep: true })
  }

  return {
    // Methods
    buildProductListStructuredData,
    updateStructuredData,
    setupWatchers
  }
}
