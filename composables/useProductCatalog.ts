import type { ProductFilters } from '~/types'

/**
 * Product Catalog Composable
 * Provides integrated access to products, categories, and search functionality
 */
export const useProductCatalog = () => {
  // Store instances
  const productsStore = useProductsStore()
  const searchStore = useSearchStore()
  const categoriesStore = useCategoriesStore()

  // Initialize stores
  const initialize = async () => {
    searchStore.initialize()
    
    // Fetch categories if not already loaded
    if (categoriesStore.categories.length === 0) {
      await categoriesStore.fetchCategories()
    }
  }

  // Product operations
  const fetchProducts = (filters?: ProductFilters) => {
    return productsStore.fetchProducts(filters)
  }

  const fetchProduct = (slug: string) => {
    return productsStore.fetchProduct(slug)
  }

  const fetchFeaturedProducts = (limit?: number, category?: string) => {
    return productsStore.fetchFeaturedProducts(limit, category)
  }

  // Search operations
  const search = (query: string, filters?: ProductFilters) => {
    return searchStore.search(query, filters)
  }

  const getSuggestions = (query: string) => {
    return searchStore.getSuggestions(query)
  }

  // Category operations
  const fetchCategories = () => {
    return categoriesStore.fetchCategories()
  }

  const setCurrentCategory = (identifier: string | null) => {
    categoriesStore.setCurrentCategory(identifier)
  }

  // Filter operations
  const updateFilters = (filters: Partial<ProductFilters>) => {
    productsStore.updateFilters(filters)
  }

  const clearFilters = () => {
    productsStore.clearFilters()
    searchStore.clearSearch()
  }

  // Reactive state
  const products = computed(() => productsStore.products)
  const currentProduct = computed(() => productsStore.currentProduct)
  const featuredProducts = computed(() => productsStore.featuredProducts)
  const relatedProducts = computed(() => productsStore.relatedProducts)
  
  const categories = computed(() => categoriesStore.categories)
  const categoriesTree = computed(() => categoriesStore.categoriesTree)
  const currentCategory = computed(() => categoriesStore.currentCategory)
  const breadcrumbs = computed(() => categoriesStore.breadcrumbs)
  
  const searchResults = computed(() => searchStore.results)
  const searchQuery = computed(() => searchStore.query)
  const searchSuggestions = computed(() => searchStore.suggestions)
  const searchHistory = computed(() => searchStore.recentSearches)
  
  const filters = computed(() => productsStore.filters)
  const pagination = computed(() => productsStore.pagination)
  
  const loading = computed(() => 
    productsStore.loading || searchStore.loading || categoriesStore.loading
  )
  
  const error = computed(() => 
    productsStore.error || searchStore.error || categoriesStore.error
  )

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
    
    // Reactive state
    products,
    currentProduct,
    featuredProducts,
    relatedProducts,
    
    categories,
    categoriesTree,
    currentCategory,
    breadcrumbs,
    
    searchResults,
    searchQuery,
    searchSuggestions,
    searchHistory,
    
    filters,
    pagination,
    
    loading,
    error,
    
    // Store instances (for advanced usage)
    productsStore,
    searchStore,
    categoriesStore
  }
}