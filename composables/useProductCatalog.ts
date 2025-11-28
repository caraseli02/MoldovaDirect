import type { ProductFilters, ProductWithRelations, CategoryWithChildren } from '~/types'

/**
 * Product Catalog Composable
 * Provides integrated access to products, categories, and search functionality
 * Uses direct API calls for SSR compatibility
 */
export const useProductCatalog = () => {
  // Use Nuxt's useState for SSR-compatible reactive state
  const products = useState<ProductWithRelations[]>('products', () => [])
  const categories = useState<CategoryWithChildren[]>('categories', () => [])
  const categoriesTree = useState<CategoryWithChildren[]>('categoriesTree', () => [])
  const currentCategory = useState<CategoryWithChildren | null>('currentCategory', () => null)
  const searchResults = useState<ProductWithRelations[]>('searchResults', () => [])
  const searchQuery = useState<string>('searchQuery', () => '')
  const filters = useState<ProductFilters>('filters', () => ({}))
  const pagination = useState('pagination', () => ({ page: 1, limit: 12, total: 0, totalPages: 1 }))
  const loading = useState<boolean>('loading', () => true)
  const error = useState<string | null>('error', () => null)

  // Filter UI state
  const sortBy = useState<string>('sortBy', () => 'created')
  const showFilterPanel = useState<boolean>('showFilterPanel', () => false)

  // Initialize the catalog
  const initialize = async () => {
    // Fetch categories if not already loaded
    if (categories.value.length === 0) {
      await fetchCategories()
    }
  }

  // Fetch products with filters
  const fetchProducts = async (productFilters: ProductFilters = {}, signal?: AbortSignal) => {
    loading.value = true
    error.value = null

    try {
      // Build query parameters
      const params = new URLSearchParams()

      if (productFilters.category) params.append('category', productFilters.category.toString())
      if (productFilters.search) params.append('search', productFilters.search)
      if (productFilters.priceMin) params.append('priceMin', productFilters.priceMin.toString())
      if (productFilters.priceMax) params.append('priceMax', productFilters.priceMax.toString())
      if (productFilters.inStock) params.append('inStock', 'true')
      if (productFilters.featured) params.append('featured', 'true')
      if (productFilters.sort) params.append('sort', productFilters.sort)
      if (productFilters.page) params.append('page', productFilters.page.toString())
      if (productFilters.limit) params.append('limit', productFilters.limit.toString())

      // Add attribute filters
      if (productFilters.attributes) {
        Object.entries(productFilters.attributes).forEach(([key, values]) => {
          values.forEach(value => {
            params.append(`attributes[${key}]`, value)
          })
        })
      }

      const response = await $fetch<{
        products: ProductWithRelations[]
        pagination: { page: number; limit: number; total: number; totalPages: number }
        filters: any
      }>(`/api/products?${params.toString()}`, {
        signal
      })

      products.value = response.products
      pagination.value = response.pagination
      filters.value = { ...productFilters }

    } catch (err) {
      // Ignore abort errors - they're expected when canceling requests
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      error.value = err instanceof Error ? err.message : 'Failed to fetch products'
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch single product by slug
  const fetchProduct = async (slug: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{
        product: ProductWithRelations
        relatedProducts: ProductWithRelations[]
      }>(`/api/products/${slug}`)

      // Update current product in products array if needed
      const normalizedSlug = slug.toLowerCase()
      const existingIndex = products.value.findIndex(p => p.slug?.toLowerCase() === normalizedSlug)
      if (existingIndex >= 0) {
        products.value[existingIndex] = response.product
      }

      return response.product

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch product'
      console.error('Error fetching product:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Fetch featured products
  const fetchFeaturedProducts = async (limit: number = 8, category?: string) => {
    try {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (category) params.append('category', category)

      const response = await $fetch<{ products: ProductWithRelations[] }>(`/api/products/featured?${params.toString()}`)
      return response.products

    } catch (err) {
      console.error('Error fetching featured products:', err)
      return []
    }
  }

  // Search products
  const search = async (query: string, searchFilters: ProductFilters = {}, signal?: AbortSignal) => {
    loading.value = true
    error.value = null
    searchQuery.value = query.trim()

    try {
      const params = new URLSearchParams()
      params.append('q', query)

      if (searchFilters.category) params.append('category', searchFilters.category.toString())
      if (searchFilters.sort) params.append('sort', searchFilters.sort)
      if (searchFilters.page) params.append('page', searchFilters.page?.toString() || '1')
      if (searchFilters.limit) params.append('limit', searchFilters.limit?.toString() || '24')

      const response = await $fetch<{
        products: ProductWithRelations[]
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
          hasNextPage: boolean
          hasPreviousPage: boolean
        }
        suggestions: string[]
        meta: {
          query: string
          returned: number
          locale: string
          category: string | null
        }
      }>(`/api/search?${params.toString()}`, {
        signal
      })

      searchResults.value = response.products
      products.value = response.products // Update main products array

      // Update pagination using API response (not recalculating!)
      pagination.value = response.pagination

      filters.value = { ...searchFilters }

    } catch (err) {
      // Ignore abort errors - they're expected when canceling requests
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      error.value = err instanceof Error ? err.message : 'Search failed'
      searchResults.value = []
      console.error('Error searching products:', err)
    } finally {
      loading.value = false
    }
  }

  // Get search suggestions
  const getSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      return []
    }

    try {
      const response = await $fetch<{ suggestions: string[] }>(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
      return response.suggestions
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      return []
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ categories: CategoryWithChildren[] }>('/api/categories')
      categories.value = response.categories

      // Build categories tree
      const buildTree = (parentId?: number): CategoryWithChildren[] => {
        return response.categories
          .filter(cat => cat.parentId === parentId)
          .map(cat => ({
            ...cat,
            children: buildTree(cat.id)
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      }

      categoriesTree.value = buildTree()

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch categories'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  // Set current category
  const setCurrentCategory = (identifier: string | null) => {
    if (!identifier) {
      currentCategory.value = null
      return
    }

    const category = categories.value.find(cat =>
      cat.slug === identifier || cat.id.toString() === identifier
    )

    if (category) {
      currentCategory.value = category
    }
  }

  // Update filters
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    filters.value = { ...filters.value, ...newFilters }

    // Reset pagination when filters change
    if (newFilters.category !== undefined ||
        newFilters.search !== undefined ||
        newFilters.priceMin !== undefined ||
        newFilters.priceMax !== undefined ||
        newFilters.attributes !== undefined) {
      filters.value.page = 1
    }
  }

  // Clear filters
  const clearFilters = () => {
    filters.value = {}
    searchQuery.value = ''
    searchResults.value = []
  }

  // Filter panel UI helpers
  const openFilterPanel = () => {
    showFilterPanel.value = true
  }

  const closeFilterPanel = () => {
    showFilterPanel.value = false
  }

  // Sort helpers
  const updateSort = (sort: string) => {
    sortBy.value = sort
    filters.value.sort = sort as any
  }

  return {
    // Initialization
    initialize,

    // Product operations
    fetchProducts,
    fetchProduct,
    fetchFeaturedProducts,

    // Search operations
    search,
    getSuggestions,

    // Category operations
    fetchCategories,
    setCurrentCategory,

    // Filter operations
    updateFilters,
    clearFilters,
    openFilterPanel,
    closeFilterPanel,
    updateSort,

    // Reactive state
    products,
    categories,
    categoriesTree,
    currentCategory,
    searchResults,
    searchQuery,
    filters,
    pagination,
    loading,
    error,
    sortBy,
    showFilterPanel
  }
}
