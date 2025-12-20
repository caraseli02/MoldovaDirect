/**
 * Search Store Tests
 * Simple tests for search functionality, caching, and history
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useSearchStore } from '~/stores/search'

// Mock $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockLocalStorage.store[key] = value }),
  removeItem: vi.fn((key: string) => {
    const store = mockLocalStorage.store as Record<string, string>
    if (key in store) {
      const { [key]: _removed, ...newStore } = store
      mockLocalStorage.store = newStore
    }
  }),
  clear: vi.fn(() => { mockLocalStorage.store = {} }),
}
vi.stubGlobal('localStorage', mockLocalStorage)

// Mock process with NODE_ENV
vi.stubGlobal('process', { client: true, env: { NODE_ENV: 'test' } })

describe('Search Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
    mockLocalStorage.store = {}
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const store = useSearchStore()

      expect(store.query).toBe('')
      expect(store.results).toEqual([])
      expect(store.suggestions).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should have empty history on initialization', () => {
      const store = useSearchStore()
      expect(store.history).toEqual([])
    })
  })

  describe('Getters', () => {
    it('should return recent searches sorted by timestamp', () => {
      const store = useSearchStore()
      store.history = [
        { query: 'old', timestamp: 1000, resultsCount: 5 },
        { query: 'new', timestamp: 3000, resultsCount: 10 },
        { query: 'middle', timestamp: 2000, resultsCount: 7 },
      ]

      const recent = store.recentSearches
      expect(recent[0].query).toBe('new')
      expect(recent[1].query).toBe('middle')
      expect(recent[2].query).toBe('old')
    })

    it('should limit recent searches to 10', () => {
      const store = useSearchStore()
      store.history = Array.from({ length: 15 }, (_, i) => ({
        query: `search-${i}`,
        timestamp: i * 1000,
        resultsCount: i,
      }))

      expect(store.recentSearches.length).toBe(10)
    })

    it('should return unique search queries', () => {
      const store = useSearchStore()
      store.history = [
        { query: 'wine', timestamp: 1000, resultsCount: 5 },
        { query: 'cheese', timestamp: 2000, resultsCount: 3 },
        { query: 'wine', timestamp: 3000, resultsCount: 5 },
      ]

      const unique = store.uniqueSearches
      expect(unique).toContain('wine')
      expect(unique).toContain('cheese')
      expect(unique.length).toBeLessThanOrEqual(5)
    })

    it('should report hasResults correctly', () => {
      const store = useSearchStore()
      expect(store.hasResults).toBe(false)

      store.results = [{ id: '1', name: 'Product' }] as unknown
      expect(store.hasResults).toBe(true)
    })

    it('should report isSearchActive correctly', () => {
      const store = useSearchStore()
      expect(store.isSearchActive).toBe(false)

      store.query = 'wine'
      expect(store.isSearchActive).toBe(true)
    })

    it('should filter suggestions excluding current query', () => {
      const store = useSearchStore()
      store.query = 'wine'
      store.suggestions = ['wine', 'wine red', 'cheese', '']

      const filtered = store.filteredSuggestions
      expect(filtered).not.toContain('wine')
      expect(filtered).not.toContain('')
      expect(filtered).toContain('wine red')
      expect(filtered).toContain('cheese')
    })

    it('should limit filtered suggestions to 8', () => {
      const store = useSearchStore()
      store.query = ''
      store.suggestions = Array.from({ length: 12 }, (_, i) => `suggestion-${i}`)

      expect(store.filteredSuggestions.length).toBeLessThanOrEqual(8)
    })
  })

  describe('Search Action', () => {
    it('should clear search for empty query', async () => {
      const store = useSearchStore()
      store.query = 'existing'
      store.results = [{ id: '1' }] as unknown

      await store.search('   ')

      expect(store.query).toBe('')
      expect(store.results).toEqual([])
    })

    it('should perform search and update state', async () => {
      const store = useSearchStore()
      mockFetch.mockResolvedValueOnce({
        products: [{ id: '1', name: 'Wine' }],
        suggestions: ['wine red', 'wine white'],
        query: 'wine',
      })

      await store.search('wine')

      expect(store.query).toBe('wine')
      expect(store.results).toHaveLength(1)
      expect(store.suggestions).toHaveLength(2)
      expect(store.loading).toBe(false)
    })

    it('should use cached results', async () => {
      const store = useSearchStore()

      // First search
      mockFetch.mockResolvedValueOnce({
        products: [{ id: '1' }],
        suggestions: [],
        query: 'wine',
      })
      await store.search('wine')

      // Reset mock to verify it's not called again
      mockFetch.mockReset()

      // Second search - should use cache
      await store.search('wine')

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle search errors', async () => {
      const store = useSearchStore()
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await store.search('wine')

      expect(store.error).toBe('Network error')
      expect(store.results).toEqual([])
      expect(store.loading).toBe(false)
    })

    it('should add to history after search', async () => {
      const store = useSearchStore()
      mockFetch.mockResolvedValueOnce({
        products: [{ id: '1' }, { id: '2' }],
        suggestions: [],
        query: 'wine',
      })

      await store.search('wine')

      expect(store.history.length).toBe(1)
      expect(store.history[0].query).toBe('wine')
      expect(store.history[0].resultsCount).toBe(2)
    })
  })

  describe('Suggestions Action', () => {
    it('should clear suggestions for short queries', async () => {
      const store = useSearchStore()
      store.suggestions = ['existing']

      await store.getSuggestions('a')

      expect(store.suggestions).toEqual([])
    })

    it('should fetch suggestions', async () => {
      const store = useSearchStore()
      mockFetch.mockResolvedValueOnce({
        suggestions: ['wine', 'wine red'],
      })

      await store.getSuggestions('wi')

      expect(store.suggestions).toEqual(['wine', 'wine red'])
    })

    it('should handle suggestion errors gracefully', async () => {
      const store = useSearchStore()
      mockFetch.mockRejectedValueOnce(new Error('Failed'))

      await store.getSuggestions('wine')

      expect(store.suggestions).toEqual([])
    })
  })

  describe('History Management', () => {
    it('should add new search to history', () => {
      const store = useSearchStore()

      store.addToHistory('wine', 10)

      expect(store.history.length).toBe(1)
      expect(store.history[0].query).toBe('wine')
      expect(store.history[0].resultsCount).toBe(10)
    })

    it('should update existing search in history', () => {
      const store = useSearchStore()
      store.addToHistory('wine', 10)
      store.addToHistory('wine', 15)

      expect(store.history.length).toBe(1)
      expect(store.history[0].resultsCount).toBe(15)
    })

    it('should limit history to 50 entries', () => {
      const store = useSearchStore()

      for (let i = 0; i < 55; i++) {
        store.addToHistory(`query-${i}`, i)
      }

      expect(store.history.length).toBe(50)
    })

    it('should remove from history', () => {
      const store = useSearchStore()
      store.addToHistory('wine', 10)
      store.addToHistory('cheese', 5)

      store.removeFromHistory('wine')

      expect(store.history.length).toBe(1)
      expect(store.history[0].query).toBe('cheese')
    })

    it('should clear history', () => {
      const store = useSearchStore()
      store.addToHistory('wine', 10)
      store.addToHistory('cheese', 5)

      store.clearHistory()

      expect(store.history).toEqual([])
    })
  })

  describe('Clear Search', () => {
    it('should reset all search state', () => {
      const store = useSearchStore()
      store.query = 'wine'
      store.results = [{ id: '1' }] as unknown
      store.suggestions = ['wine red']
      store.filters = { category: 'wines' }
      store.error = 'Previous error'

      store.clearSearch()

      expect(store.query).toBe('')
      expect(store.results).toEqual([])
      expect(store.suggestions).toEqual([])
      expect(store.filters).toEqual({})
      expect(store.error).toBeNull()
    })
  })

  describe('Filter Updates', () => {
    it('should update filters', () => {
      const store = useSearchStore()

      store.updateFilters({ category: 'wines', sort: 'price' })

      expect(store.filters.category).toBe('wines')
      expect(store.filters.sort).toBe('price')
    })

    it('should merge with existing filters', () => {
      const store = useSearchStore()
      store.filters = { category: 'wines' }

      store.updateFilters({ sort: 'price' })

      expect(store.filters.category).toBe('wines')
      expect(store.filters.sort).toBe('price')
    })

    it('should re-search when query exists', async () => {
      const store = useSearchStore()
      store.query = 'wine'
      mockFetch.mockResolvedValueOnce({
        products: [],
        suggestions: [],
        query: 'wine',
      })

      store.updateFilters({ sort: 'price' })

      // Wait for the search to complete
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('Popular Searches', () => {
    it('should load popular searches', async () => {
      const store = useSearchStore()
      mockFetch.mockResolvedValueOnce({
        searches: ['wine', 'cheese', 'honey'],
      })

      await store.loadPopularSearches()

      expect(store.popularSearches).toEqual(['wine', 'cheese', 'honey'])
    })

    it('should use fallback on error', async () => {
      const store = useSearchStore()
      mockFetch.mockRejectedValueOnce(new Error('Failed'))

      await store.loadPopularSearches()

      expect(store.popularSearches).toContain('wine')
      expect(store.popularSearches.length).toBeGreaterThan(0)
    })
  })

  describe('Storage Operations', () => {
    it.skip('should save history to localStorage', () => {
      const store = useSearchStore()
      store.addToHistory('wine', 10)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'moldova-direct-search-history',
        expect.any(String),
      )
    })

    it.skip('should load history from localStorage', () => {
      const history = [{ query: 'wine', timestamp: Date.now(), resultsCount: 10 }]
      mockLocalStorage.store['moldova-direct-search-history'] = JSON.stringify(history)

      const store = useSearchStore()
      store.loadHistoryFromStorage()

      expect(store.history.length).toBe(1)
      expect(store.history[0].query).toBe('wine')
    })

    it.skip('should filter out old searches (>30 days)', () => {
      const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000
      const history = [
        { query: 'old', timestamp: thirtyOneDaysAgo, resultsCount: 5 },
        { query: 'recent', timestamp: Date.now(), resultsCount: 10 },
      ]
      mockLocalStorage.store['moldova-direct-search-history'] = JSON.stringify(history)

      const store = useSearchStore()
      store.loadHistoryFromStorage()

      expect(store.history.length).toBe(1)
      expect(store.history[0].query).toBe('recent')
    })
  })

  describe('Cache Operations', () => {
    it('should clear cache', () => {
      const store = useSearchStore()
      store.clearCache()

      // Cache is cleared - size should be 0
      expect(store.cache.size()).toBe(0)
    })
  })

  describe('Search Analytics', () => {
    it('should return analytics data', () => {
      const store = useSearchStore()
      store.addToHistory('wine', 10)
      store.addToHistory('cheese', 5)
      store.addToHistory('wine', 15)

      const analytics = store.getSearchAnalytics()

      expect(analytics.totalSearches).toBe(2) // wine was updated, not added
      expect(analytics.topQueries).toBeDefined()
      expect(analytics.recentSearches).toBeDefined()
    })

    it('should handle empty history', () => {
      const store = useSearchStore()

      const analytics = store.getSearchAnalytics()

      expect(analytics.totalSearches).toBe(0)
      expect(analytics.averageResults).toBe(0)
    })
  })
})
