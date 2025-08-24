// Single product management composable using the new TypeScript interfaces
import type {
  ProductWithRelations,
  ProductDetailResponse,
  UseProductReturn,
  LanguageCode
} from '~/types'

import {
  getLocalizedText,
  formatPrice
} from '~/types'

/**
 * Composable for managing individual product data and operations
 */
export const useProduct = (): UseProductReturn => {
  // State
  const product = ref<ProductWithRelations | null>(null)
  const relatedProducts = ref<ProductWithRelations[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get current locale
  const { locale } = useI18n()
  const currentLocale = computed(() => locale.value as LanguageCode)

  /**
   * Fetch product by slug
   */
  const fetchProduct = async (slug: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const queryParams = new URLSearchParams()
      queryParams.append('locale', currentLocale.value)

      const response = await $fetch<ProductDetailResponse>(`/api/products/${slug}?${queryParams.toString()}`)
      
      product.value = response.product
      relatedProducts.value = response.relatedProducts

    } catch (err) {
      console.error('Error fetching product:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch product'
      product.value = null
      relatedProducts.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get localized product name
   */
  const getProductName = computed((): string => {
    if (!product.value) return ''
    return getLocalizedText(product.value.nameTranslations, currentLocale.value)
  })

  /**
   * Get localized product description
   */
  const getProductDescription = computed((): string => {
    if (!product.value) return ''
    return getLocalizedText(product.value.descriptionTranslations, currentLocale.value)
  })

  /**
   * Get localized short description
   */
  const getProductShortDescription = computed((): string => {
    if (!product.value) return ''
    return getLocalizedText(product.value.shortDescriptionTranslations, currentLocale.value)
  })

  /**
   * Get formatted price
   */
  const getFormattedPrice = computed((): string => {
    if (!product.value) return ''
    return formatPrice(product.value.priceEur)
  })

  /**
   * Get formatted compare price
   */
  const getFormattedComparePrice = computed((): string => {
    if (!product.value?.compareAtPriceEur) return ''
    return formatPrice(product.value.compareAtPriceEur)
  })

  /**
   * Check if product is on sale
   */
  const isOnSale = computed((): boolean => {
    if (!product.value) return false
    return Boolean(
      product.value.compareAtPriceEur && 
      product.value.compareAtPriceEur > product.value.priceEur
    )
  })

  /**
   * Get sale percentage
   */
  const getSalePercentage = computed((): number => {
    if (!isOnSale.value || !product.value?.compareAtPriceEur) return 0
    
    const original = product.value.compareAtPriceEur
    const current = product.value.priceEur
    
    return Math.round(((original - current) / original) * 100)
  })

  /**
   * Check if product is in stock
   */
  const isInStock = computed((): boolean => {
    if (!product.value) return false
    return product.value.stockStatus === 'in_stock'
  })

  /**
   * Check if product is low stock
   */
  const isLowStock = computed((): boolean => {
    if (!product.value) return false
    return product.value.stockStatus === 'low_stock'
  })

  /**
   * Check if product is out of stock
   */
  const isOutOfStock = computed((): boolean => {
    if (!product.value) return false
    return product.value.stockStatus === 'out_of_stock'
  })

  /**
   * Get stock status text
   */
  const getStockStatusText = computed((): string => {
    if (!product.value) return ''
    
    const { t } = useI18n()
    
    switch (product.value.stockStatus) {
      case 'in_stock':
        return t('products.inStock')
      case 'low_stock':
        return t('products.lowStock', { count: product.value.stockQuantity })
      case 'out_of_stock':
        return t('products.outOfStock')
      default:
        return ''
    }
  })

  /**
   * Get primary product image
   */
  const getPrimaryImage = computed(() => {
    if (!product.value?.images?.length) return null
    return product.value.images.find(img => img.isPrimary) || product.value.images[0]
  })

  /**
   * Get all product images
   */
  const getProductImages = computed(() => {
    if (!product.value?.images) return []
    return product.value.images.sort((a, b) => a.sortOrder - b.sortOrder)
  })

  /**
   * Get product attributes
   */
  const getProductAttributes = computed(() => {
    if (!product.value?.attributes) return {}
    return product.value.attributes
  })

  /**
   * Get category name
   */
  const getCategoryName = computed((): string => {
    if (!product.value?.category) return ''
    return getLocalizedText(product.value.category.nameTranslations, currentLocale.value)
  })

  /**
   * Get product breadcrumbs
   */
  const getBreadcrumbs = computed(() => {
    if (!product.value) return []
    
    const breadcrumbs = [
      { name: 'Home', slug: '', url: '/' },
      { name: 'Products', slug: 'products', url: '/products' }
    ]
    
    if (product.value.category) {
      breadcrumbs.push({
        name: getCategoryName.value,
        slug: product.value.category.slug,
        url: `/categories/${product.value.category.slug}`
      })
    }
    
    breadcrumbs.push({
      name: getProductName.value,
      slug: product.value.slug,
      url: `/products/${product.value.slug}`
    })
    
    return breadcrumbs
  })

  /**
   * Check if product can be added to cart
   */
  const canAddToCart = computed((): boolean => {
    if (!product.value) return false
    return product.value.stockQuantity > 0 && product.value.isActive
  })

  /**
   * Get maximum quantity that can be added to cart
   */
  const getMaxQuantity = computed((): number => {
    if (!product.value) return 0
    return Math.max(0, product.value.stockQuantity)
  })

  /**
   * Clear product data
   */
  const clearProduct = (): void => {
    product.value = null
    relatedProducts.value = []
    error.value = null
  }

  /**
   * Refresh product data
   */
  const refreshProduct = async (): Promise<void> => {
    if (product.value?.slug) {
      await fetchProduct(product.value.slug)
    }
  }

  return {
    // State
    product: readonly(product),
    relatedProducts: readonly(relatedProducts),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed properties
    productName: getProductName,
    productDescription: getProductDescription,
    productShortDescription: getProductShortDescription,
    formattedPrice: getFormattedPrice,
    formattedComparePrice: getFormattedComparePrice,
    isOnSale,
    salePercentage: getSalePercentage,
    isInStock,
    isLowStock,
    isOutOfStock,
    stockStatusText: getStockStatusText,
    primaryImage: getPrimaryImage,
    productImages: getProductImages,
    productAttributes: getProductAttributes,
    categoryName: getCategoryName,
    breadcrumbs: getBreadcrumbs,
    canAddToCart,
    maxQuantity: getMaxQuantity,
    
    // Actions
    fetchProduct,
    clearProduct,
    refreshProduct
  }
}