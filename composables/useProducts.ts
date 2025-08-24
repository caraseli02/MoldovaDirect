// Product management composable using the new TypeScript interfaces
import type {
  ProductWithRelations,
  ProductFilters,
  ProductListResponse,
  ProductDetailResponse,
  UseProductsReturn,
  Pagination,
  LanguageCode
} from '~/types'

import {
  validateProductFilters,
  getLocalizedText,
  transformProduct,
  sanitizeSearchQuery
} from '~/types'

/**
 * Composable for managing product data and operations
 */
export const useProducts = (): UseProductsReturn => {
  // State
  const products = ref<ProductWithRelations[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<Pagination>({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0
  })

  // Get current locale
  const { locale } = useI18n()
  const currentLocale = computed(() => locale.value as LanguageCode)

  /**
   * Fetch products with optional filters
   */
  const fetchProducts = async (filters?: ProductFilters): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      // Validate and sanitize filters
      const validatedFilters = filters ? validateProductFilters(filters) : {}
      
      // Sanitize search query if present
      if (validatedFilters.search) {
        validatedFilters.search = sanitizeSearchQuery(validatedFilters.search)
      }

      // Build query parameters
      const queryParams = new URLSearchParams()
      
      if (validatedFilters.category) {
        queryParams.append('category', String(validatedFilters.category))
      }
      
      if (validatedFilters.search) {
        queryParams.append('search', validatedFilters.search)
      }
      
      if (validatedFilters.sort) {
        queryParams.append('sort', validatedFilters.sort)
      }
      
      if (validatedFilters.page) {
        queryParams.append('page', String(validatedFilters.page))
      }
      
      if (validatedFilters.limit) {
        queryParams.append('limit', String(validatedFilters.limit))
      }
      
      if (validatedFilters.featured !== undefined) {
        queryParams.append('featured', String(validatedFilters.featured))
      }
      
      if (validatedFilters.inStock !== undefined) {
        queryParams.append('inStock', String(validatedFilters.inStock))
      }
      
      if (validatedFilters.priceMin !== undefined) {
        queryParams.append('priceMin', String(validatedFilters.priceMin))
      }
      
      if (validatedFilters.priceMax !== undefined) {
        queryParams.append('priceMax', String(validatedFilters.priceMax))
      }

      // Add locale
      queryParams.append('locale', currentLocale.value)

      // Fetch data from API
      const response = await $fetch<ProductListResponse>(`/api/products?${queryParams.toString()}`)

      // Update state
      products.value = response.products
      pagination.value = response.pagination

    } catch (err) {
      console.error('Error fetching products:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch products'
      products.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Search products by query
   */
  const searchProducts = async (query: string): Promise<void> => {
    if (!query.trim()) {
      await fetchProducts()
      return
    }

    const filters: ProductFilters = {
      search: query,
      page: 1,
      limit: pagination.value.limit
    }

    await fetchProducts(filters)
  }

  /**
   * Clear products and reset state
   */
  const clearProducts = (): void => {
    products.value = []
    error.value = null
    pagination.value = {
      page: 1,
      limit: 24,
      total: 0,
      totalPages: 0
    }
  }

  /**
   * Load more products (for infinite scroll)
   */
  const loadMoreProducts = async (filters?: ProductFilters): Promise<void> => {
    if (loading.value || pagination.value.page >= pagination.value.totalPages) {
      return
    }

    const nextPageFilters = {
      ...filters,
      page: pagination.value.page + 1
    }

    try {
      loading.value = true
      
      const validatedFilters = validateProductFilters(nextPageFilters)
      const queryParams = new URLSearchParams()
      
      // Build query params (same logic as fetchProducts)
      Object.entries(validatedFilters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
      
      queryParams.append('locale', currentLocale.value)

      const response = await $fetch<ProductListResponse>(`/api/products?${queryParams.toString()}`)

      // Append new products to existing ones
      products.value = [...products.value, ...response.products]
      pagination.value = response.pagination

    } catch (err) {
      console.error('Error loading more products:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load more products'
    } finally {
      loading.value = false
    }
  }

  /**
   * Get product by ID from current products list
   */
  const getProductById = (id: number): ProductWithRelations | undefined => {
    return products.value.find(product => product.id === id)
  }

  /**
   * Get localized product name
   */
  const getProductName = (product: ProductWithRelations): string => {
    return getLocalizedText(product.nameTranslations, currentLocale.value)
  }

  /**
   * Get localized product description
   */
  const getProductDescription = (product: ProductWithRelations): string => {
    return getLocalizedText(product.descriptionTranslations, currentLocale.value)
  }

  /**
   * Check if product is in stock
   */
  const isInStock = (product: ProductWithRelations): boolean => {
    return product.stockStatus === 'in_stock'
  }

  /**
   * Check if product is low stock
   */
  const isLowStock = (product: ProductWithRelations): boolean => {
    return product.stockStatus === 'low_stock'
  }

  /**
   * Get stock status text
   */
  const getStockStatusText = (product: ProductWithRelations): string => {
    const { t } = useI18n()
    
    switch (product.stockStatus) {
      case 'in_stock':
        return t('products.inStock')
      case 'low_stock':
        return t('products.lowStock', { count: product.stockQuantity })
      case 'out_of_stock':
        return t('products.outOfStock')
      default:
        return ''
    }
  }

  return {
    // State
    products: readonly(products),
    loading: readonly(loading),
    error: readonly(error),
    pagination: readonly(pagination),
    
    // Actions
    fetchProducts,
    searchProducts,
    clearProducts,
    loadMoreProducts,
    
    // Getters
    getProductById,
    getProductName,
    getProductDescription,
    isInStock,
    isLowStock,
    getStockStatusText
  }
}