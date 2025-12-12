import { defineStore } from 'pinia'
import type {
  ProductWithRelations,
  CategoryWithChildren,
  ProductFilters,
  Pagination,
  ProductListResponse,
  ProductDetailResponse,
  CategoryListResponse,
  SearchResponse,
} from '~/types'

interface ProductsState {
  // Products
  products: ProductWithRelations[]
  currentProduct: ProductWithRelations | null
  featuredProducts: ProductWithRelations[]
  relatedProducts: ProductWithRelations[]

  // Categories
  categories: CategoryWithChildren[]
  currentCategory: CategoryWithChildren | null

  // Filters and search
  filters: ProductFilters
  searchQuery: string
  searchResults: ProductWithRelations[]
  searchSuggestions: string[]

  // Pagination
  pagination: Pagination

  // Loading states
  loading: boolean
  searchLoading: boolean
  categoryLoading: boolean

  // Error states
  error: string | null
  searchError: string | null

  // Cache
  cache: Map<string, { data: unknown, timestamp: number, ttl: number }>
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    // Products
    products: [],
    currentProduct: null,
    featuredProducts: [],
    relatedProducts: [],

    // Categories
    categories: [],
    currentCategory: null,

    // Filters and search
    filters: {},
    searchQuery: '',
    searchResults: [],
    searchSuggestions: [],

    // Pagination
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },

    // Loading states
    loading: false,
    searchLoading: false,
    categoryLoading: false,

    // Error states
    error: null,
    searchError: null,

    // Cache
    cache: new Map(),
  }),

  getters: {
    // Get products with applied filters
    filteredProducts: (state): ProductWithRelations[] => {
      let filtered = [...state.products]

      // Apply client-side filters for immediate feedback
      if (state.filters.search) {
        const query = state.filters.search.toLowerCase()
        filtered = filtered.filter(product =>
          product.name.es?.toLowerCase().includes(query)
          || product.name.en?.toLowerCase().includes(query)
          || product.description?.es?.toLowerCase().includes(query)
          || product.description?.en?.toLowerCase().includes(query),
        )
      }

      if (state.filters.inStock) {
        filtered = filtered.filter(product => product.stockQuantity > 0)
      }

      if (state.filters.featured) {
        filtered = filtered.filter(product => product.isFeatured)
      }

      return filtered
    },

    // Get categories as a tree structure
    categoriesTree: (state): CategoryWithChildren[] => {
      const buildTree = (categories: CategoryWithChildren[], parentId?: number): CategoryWithChildren[] => {
        return categories
          .filter(cat => cat.parentId === parentId)
          .map(cat => ({
            ...cat,
            children: buildTree(categories, cat.id),
          }))
      }

      return buildTree(state.categories)
    },

    // Get root categories (no parent)
    rootCategories: (state): CategoryWithChildren[] => {
      return state.categories.filter(cat => !cat.parentId)
    },

    // Check if there are active filters
    hasActiveFilters: (state): boolean => {
      return !!(
        state.filters.category
        || state.filters.search
        || state.filters.priceMin
        || state.filters.priceMax
        || state.filters.inStock
        || state.filters.featured
        || (state.filters.attributes && Object.keys(state.filters.attributes).length > 0)
      )
    },

    // Get current category by slug or ID
    getCurrentCategory: state => (identifier: string): CategoryWithChildren | undefined => {
      return state.categories.find(cat =>
        cat.slug === identifier || cat.id.toString() === identifier,
      )
    },

    // Get product by slug
    getProductBySlug: state => (slug: string): ProductWithRelations | undefined => {
      const normalizedSlug = slug ? slug.toLowerCase() : ''
      if (!normalizedSlug) return undefined
      return state.products.find(product => product.slug?.toLowerCase() === normalizedSlug)
    },

    // Check if data is cached and valid
    isCached: state => (key: string): boolean => {
      const cached = state.cache.get(key)
      if (!cached) return false

      const now = Date.now()
      return now - cached.timestamp < cached.ttl
    },
  },

  actions: {
    // Cache management
    setCache(key: string, data: unknown, ttl: number = 5 * 60 * 1000) {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      })
    },

    getCache(key: string): unknown {
      const cached = this.cache.get(key)
      if (!cached) return null

      const now = Date.now()
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key)
        return null
      }

      return cached.data
    },

    clearCache(pattern?: string) {
      if (pattern) {
        for (const key of this.cache.keys()) {
          if (key.includes(pattern)) {
            this.cache.delete(key)
          }
        }
      }
      else {
        this.cache.clear()
      }
    },

    // Fetch products with filters
    async fetchProducts(filters: ProductFilters = {}) {
      this.loading = true
      this.error = null

      try {
        // Create cache key
        const cacheKey = `products-${JSON.stringify(filters)}`

        // Check cache first
        const cached = this.getCache(cacheKey)
        if (cached) {
          this.products = cached.products
          this.pagination = cached.pagination
          this.filters = { ...filters }
          this.loading = false
          return
        }

        // Build query parameters
        const params = new URLSearchParams()

        if (filters.category) params.append('category', filters.category.toString())
        if (filters.search) params.append('search', filters.search)
        if (filters.priceMin) params.append('priceMin', filters.priceMin.toString())
        if (filters.priceMax) params.append('priceMax', filters.priceMax.toString())
        if (filters.inStock) params.append('inStock', 'true')
        if (filters.featured) params.append('featured', 'true')
        if (filters.sort) params.append('sort', filters.sort)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())

        // Add attribute filters
        if (filters.attributes) {
          Object.entries(filters.attributes).forEach(([key, values]) => {
            values.forEach((value) => {
              params.append(`attributes[${key}]`, value)
            })
          })
        }

        const response = await $fetch<ProductListResponse>(`/api/products?${params.toString()}`)

        this.products = response.products
        this.pagination = response.pagination
        this.filters = { ...filters }

        // Cache the response
        this.setCache(cacheKey, {
          products: response.products,
          pagination: response.pagination,
        })
      }
      catch (error: any) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch products'
        console.error('Error fetching products:', error)
      }
      finally {
        this.loading = false
      }
    },

    // Fetch single product by slug
    async fetchProduct(slug: string) {
      const trimmedSlug = slug ? slug.trim() : ''
      if (!trimmedSlug) {
        this.error = 'Product slug is required'
        this.loading = false
        return
      }

      const normalizedSlug = trimmedSlug.toLowerCase()
      this.loading = true
      this.error = null

      try {
        // Check cache first
        const cacheKey = `product-${normalizedSlug}`
        const cached = this.getCache(cacheKey)
        if (cached) {
          this.currentProduct = cached.product
          this.relatedProducts = cached.relatedProducts
          this.loading = false
          return
        }

        const response = await $fetch<ProductDetailResponse>(`/api/products/${trimmedSlug}`)

        this.currentProduct = response.product
        this.relatedProducts = response.relatedProducts

        // Cache the response
        this.setCache(cacheKey, {
          product: response.product,
          relatedProducts: response.relatedProducts,
        }, 10 * 60 * 1000) // 10 minutes cache for product details
      }
      catch (error: any) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch product'
        this.currentProduct = null
        console.error('Error fetching product:', error)
      }
      finally {
        this.loading = false
      }
    },

    // Fetch featured products
    async fetchFeaturedProducts(limit: number = 8, category?: string) {
      try {
        // Check cache first
        const cacheKey = `featured-${limit}-${category || 'all'}`
        const cached = this.getCache(cacheKey)
        if (cached) {
          this.featuredProducts = cached
          return
        }

        const params = new URLSearchParams()
        params.append('limit', limit.toString())
        if (category) params.append('category', category)

        const response = await $fetch<{ products: ProductWithRelations[] }>(`/api/products/featured?${params.toString()}`)

        this.featuredProducts = response.products

        // Cache the response
        this.setCache(cacheKey, response.products, 15 * 60 * 1000) // 15 minutes cache
      }
      catch (error: any) {
        console.error('Error fetching featured products:', error)
      }
    },

    // Search products
    async searchProducts(query: string, filters: Partial<ProductFilters> = {}) {
      this.searchLoading = true
      this.searchError = null

      try {
        // Check cache first
        const cacheKey = `search-${query}-${JSON.stringify(filters)}`
        const cached = this.getCache(cacheKey)
        if (cached) {
          this.searchResults = cached.products
          this.searchSuggestions = cached.suggestions
          this.searchQuery = query
          this.searchLoading = false
          return
        }

        const params = new URLSearchParams()
        params.append('q', query)

        if (filters.category) params.append('category', filters.category.toString())
        if (filters.sort) params.append('sort', filters.sort)
        if (filters.page) params.append('page', filters.page?.toString() || '1')
        if (filters.limit) params.append('limit', filters.limit?.toString() || '12')

        const response = await $fetch<SearchResponse>(`/api/search?${params.toString()}`)

        this.searchResults = response.products
        this.searchSuggestions = response.suggestions
        this.searchQuery = query

        // Cache the response
        this.setCache(cacheKey, {
          products: response.products,
          suggestions: response.suggestions,
        }, 2 * 60 * 1000) // 2 minutes cache for search results
      }
      catch (error: any) {
        this.searchError = error instanceof Error ? error.message : 'Search failed'
        console.error('Error searching products:', error)
      }
      finally {
        this.searchLoading = false
      }
    },

    // Fetch categories
    async fetchCategories() {
      this.categoryLoading = true

      try {
        // Check cache first
        const cacheKey = 'categories'
        const cached = this.getCache(cacheKey)
        if (cached) {
          this.categories = cached
          this.categoryLoading = false
          return
        }

        const response = await $fetch<CategoryListResponse>('/api/categories')

        this.categories = response.categories

        // Cache the response
        this.setCache(cacheKey, response.categories, 30 * 60 * 1000) // 30 minutes cache
      }
      catch (error: any) {
        console.error('Error fetching categories:', error)
      }
      finally {
        this.categoryLoading = false
      }
    },

    // Fetch category with products
    async fetchCategory(slug: string, filters: Partial<ProductFilters> = {}) {
      this.loading = true
      this.error = null

      try {
        // Check cache first
        const cacheKey = `category-${slug}-${JSON.stringify(filters)}`
        const cached = this.getCache(cacheKey)
        if (cached) {
          this.currentCategory = cached.category
          this.products = cached.products
          this.pagination = cached.pagination
          this.loading = false
          return
        }

        const params = new URLSearchParams()
        if (filters.sort) params.append('sort', filters.sort)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())

        const response = await $fetch<{
          category: CategoryWithChildren
          products: ProductWithRelations[]
          pagination: Pagination
        }>(`/api/categories/${slug}?${params.toString()}`)

        this.currentCategory = response.category
        this.products = response.products
        this.pagination = response.pagination

        // Cache the response
        this.setCache(cacheKey, {
          category: response.category,
          products: response.products,
          pagination: response.pagination,
        })
      }
      catch (error: any) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch category'
        console.error('Error fetching category:', error)
      }
      finally {
        this.loading = false
      }
    },

    // Update filters
    updateFilters(newFilters: Partial<ProductFilters>) {
      this.filters = { ...this.filters, ...newFilters }

      // Reset pagination when filters change
      if (newFilters.category !== undefined
        || newFilters.search !== undefined
        || newFilters.priceMin !== undefined
        || newFilters.priceMax !== undefined
        || newFilters.attributes !== undefined) {
        this.filters.page = 1
      }
    },

    // Clear filters
    clearFilters() {
      this.filters = {}
      this.searchQuery = ''
      this.searchResults = []
    },

    // Clear current product
    clearCurrentProduct() {
      this.currentProduct = null
      this.relatedProducts = []
    },

    // Clear products
    clearProducts() {
      this.products = []
      this.pagination = {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
      }
    },

    // Refresh data (clear cache and refetch)
    async refresh() {
      this.clearCache()

      // Refetch current data
      if (this.hasActiveFilters) {
        await this.fetchProducts(this.filters)
      }

      if (this.categories.length === 0) {
        await this.fetchCategories()
      }
    },
  },
})
