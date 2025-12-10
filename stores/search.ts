import { defineStore } from 'pinia'
import type { ProductWithRelations, ProductFilters } from '~/types'

interface SearchHistoryItem {
  query: string
  timestamp: number
  resultsCount: number
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  accessCount: number
}

/**
 * LRU Cache implementation with max size and TTL
 * Prevents unbounded memory growth from search results caching
 */
class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private maxSize: number
  private ttl: number // milliseconds

  constructor(maxSize = 20, ttl = 5 * 60 * 1000) { // 20 entries, 5 min TTL
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return undefined
    }

    // Update access time and count (LRU tracking)
    entry.timestamp = Date.now()
    entry.accessCount++

    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.data
  }

  set(key: string, data: T): void {
    // Evict oldest if at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1,
    })
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

interface CachedSearchResult {
  results: ProductWithRelations[]
  suggestions: string[]
}

interface SearchState {
  // Current search
  query: string
  results: ProductWithRelations[]
  suggestions: string[]

  // Search history
  history: SearchHistoryItem[]

  // Popular searches
  popularSearches: string[]

  // Loading states
  loading: boolean
  suggestionsLoading: boolean

  // Error states
  error: string | null

  // Filters applied to search
  filters: ProductFilters

  // Cache for search results (LRU cache with size limit and TTL)
  cache: LRUCache<CachedSearchResult>
}

export const useSearchStore = defineStore('search', {
  state: (): SearchState => ({
    // Current search
    query: '',
    results: [],
    suggestions: [],

    // Search history
    history: [],

    // Popular searches
    popularSearches: [],

    // Loading states
    loading: false,
    suggestionsLoading: false,

    // Error states
    error: null,

    // Filters
    filters: {},

    // LRU Cache with max 20 entries and 5 minute TTL
    cache: new LRUCache<CachedSearchResult>(20, 5 * 60 * 1000),
  }),

  getters: {
    // Get recent search history (last 10 searches)
    recentSearches: (state): SearchHistoryItem[] => {
      return state.history
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
    },

    // Get unique search queries from history
    uniqueSearches: (state): string[] => {
      const unique = new Set(state.history.map(item => item.query))
      return Array.from(unique).slice(0, 5)
    },

    // Check if there are search results
    hasResults: (state): boolean => {
      return state.results.length > 0
    },

    // Check if search is active
    isSearchActive: (state): boolean => {
      return state.query.length > 0
    },

    // Get filtered suggestions (exclude current query and duplicates)
    filteredSuggestions: (state): string[] => {
      return state.suggestions
        .filter(suggestion =>
          suggestion.toLowerCase() !== state.query.toLowerCase()
          && suggestion.length > 0,
        )
        .slice(0, 8) // Limit to 8 suggestions
    },
  },

  actions: {
    // Initialize search store
    initialize() {
      this.loadHistoryFromStorage()
      this.loadPopularSearches()
    },

    // Perform search
    async search(query: string, filters: ProductFilters = {}) {
      if (!query.trim()) {
        this.clearSearch()
        return
      }

      this.loading = true
      this.error = null
      this.query = query.trim()
      this.filters = { ...filters }

      try {
        // Check cache first (LRU cache handles TTL automatically)
        const cacheKey = `${query}-${JSON.stringify(filters)}`
        const cached = this.cache.get(cacheKey)

        if (cached) {
          this.results = cached.results
          this.suggestions = cached.suggestions
          this.loading = false
          return
        }

        // Build query parameters
        const params = new URLSearchParams()
        params.append('q', query)

        if (filters.category) params.append('category', filters.category.toString())
        if (filters.sort) params.append('sort', filters.sort)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())

        const response = await $fetch<{
          products: ProductWithRelations[]
          suggestions: string[]
          query: string
        }>(`/api/search?${params.toString()}`)

        this.results = response.products
        this.suggestions = response.suggestions

        // Cache the results (LRU cache handles eviction automatically)
        this.cache.set(cacheKey, {
          results: response.products,
          suggestions: response.suggestions,
        })

        // Add to search history
        this.addToHistory(query, response.products.length)
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Search failed'
        this.results = []
        this.suggestions = []
        console.error('Search error:', error)
      }
      finally {
        this.loading = false
      }
    },

    // Get search suggestions (for autocomplete)
    async getSuggestions(query: string) {
      if (!query.trim() || query.length < 2) {
        this.suggestions = []
        return
      }

      this.suggestionsLoading = true

      try {
        // Check if we have cached suggestions for this query (LRU cache handles TTL)
        const cached = this.cache.get(`suggestions-${query}`)
        if (cached) {
          this.suggestions = cached.suggestions
          this.suggestionsLoading = false
          return
        }

        const response = await $fetch<{ suggestions: string[] }>(`/api/search/suggestions?q=${encodeURIComponent(query)}`)

        this.suggestions = response.suggestions

        // Cache suggestions (LRU cache handles eviction automatically)
        this.cache.set(`suggestions-${query}`, {
          results: [],
          suggestions: response.suggestions,
        })
      }
      catch (error) {
        console.error('Error fetching suggestions:', error)
        this.suggestions = []
      }
      finally {
        this.suggestionsLoading = false
      }
    },

    // Add search to history
    addToHistory(query: string, resultsCount: number) {
      const existingIndex = this.history.findIndex(item => item.query.toLowerCase() === query.toLowerCase())

      const historyItem: SearchHistoryItem = {
        query,
        timestamp: Date.now(),
        resultsCount,
      }

      if (existingIndex > -1) {
        // Update existing entry
        this.history[existingIndex] = historyItem
      }
      else {
        // Add new entry
        this.history.unshift(historyItem)

        // Keep only last 50 searches
        if (this.history.length > 50) {
          this.history = this.history.slice(0, 50)
        }
      }

      this.saveHistoryToStorage()
    },

    // Remove search from history
    removeFromHistory(query: string) {
      this.history = this.history.filter(item => item.query !== query)
      this.saveHistoryToStorage()
    },

    // Clear search history
    clearHistory() {
      this.history = []
      this.saveHistoryToStorage()
    },

    // Clear current search
    clearSearch() {
      this.query = ''
      this.results = []
      this.suggestions = []
      this.filters = {}
      this.error = null
    },

    // Update search filters
    updateFilters(newFilters: Partial<ProductFilters>) {
      this.filters = { ...this.filters, ...newFilters }

      // Re-search with new filters if there's an active query
      if (this.query) {
        this.search(this.query, this.filters)
      }
    },

    // Load popular searches
    async loadPopularSearches() {
      try {
        const response = await $fetch<{ searches: string[] }>('/api/search/popular')
        this.popularSearches = response.searches
      }
      catch (error) {
        console.error('Error loading popular searches:', error)
        // Fallback to default popular searches
        this.popularSearches = ['wine', 'cheese', 'honey', 'preserves', 'traditional']
      }
    },

    // Save search history to localStorage
    saveHistoryToStorage() {
      if (import.meta.client) {
        try {
          localStorage.setItem('moldova-direct-search-history', JSON.stringify(this.history))
        }
        catch (error) {
          console.warn('Failed to save search history:', error)
        }
      }
    },

    // Load search history from localStorage
    loadHistoryFromStorage() {
      if (import.meta.client) {
        try {
          const saved = localStorage.getItem('moldova-direct-search-history')
          if (saved) {
            const history = JSON.parse(saved)

            // Filter out old searches (older than 30 days)
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
            this.history = history.filter((item: SearchHistoryItem) => item.timestamp > thirtyDaysAgo)

            // Save cleaned history back
            if (this.history.length !== history.length) {
              this.saveHistoryToStorage()
            }
          }
        }
        catch (error) {
          console.warn('Failed to load search history:', error)
          this.history = []
        }
      }
    },

    // Clear cache
    clearCache() {
      this.cache.clear()
    },

    // Get search analytics data
    getSearchAnalytics() {
      const totalSearches = this.history.length
      const averageResults = this.history.reduce((sum, item) => sum + item.resultsCount, 0) / totalSearches || 0
      const topQueries = this.history
        .reduce((acc, item) => {
          acc[item.query] = (acc[item.query] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      const sortedQueries = Object.entries(topQueries)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }))

      return {
        totalSearches,
        averageResults: Math.round(averageResults * 100) / 100,
        topQueries: sortedQueries,
        recentSearches: this.recentSearches.slice(0, 5),
      }
    },
  },
})
