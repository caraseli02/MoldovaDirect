import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useProductSearch } from '~/composables/useProductSearch'

// Store the router mock to access in tests
let mockRouterPush: ReturnType<typeof vi.fn>

// Mock the search store
const mockSearchStore = {
  loading: false,
  results: [] as any[],
  filteredSuggestions: [] as string[],
  recentSearches: [] as any[],
  popularSearches: [] as string[],
  hasResults: false,
  error: null,
  initialize: vi.fn(),
  search: vi.fn(),
  getSuggestions: vi.fn(),
  clearSearch: vi.fn(),
  removeFromHistory: vi.fn(),
  clearHistory: vi.fn(),
}

vi.mock('~/stores/search', () => ({
  useSearchStore: () => mockSearchStore,
}))

// Mock VueUse's useDebounceFn to return a proper debounced function with cancel
vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual('@vueuse/core')
  return {
    ...actual,
    useDebounceFn: (fn: (...args: any[]) => any, delay: number) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null
      const debouncedFn = (...args: any[]) => {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
      }
      debouncedFn.cancel = () => {
        if (timeoutId) clearTimeout(timeoutId)
      }
      return debouncedFn
    },
  }
})

describe('useProductSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Reset store state
    mockSearchStore.loading = false
    mockSearchStore.results = []
    mockSearchStore.filteredSuggestions = []
    mockSearchStore.recentSearches = []
    mockSearchStore.hasResults = false

    // Set up router mock that we can access in tests
    mockRouterPush = vi.fn()
    // @ts-expect-error - global mock setup
    global.useRouter = vi.fn(() => ({
      push: mockRouterPush,
      replace: vi.fn(),
      currentRoute: { value: { query: {} } },
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('initializes with empty search query', () => {
      const { searchQuery, showSuggestions, selectedSuggestionIndex } = useProductSearch()

      expect(searchQuery.value).toBe('')
      expect(showSuggestions.value).toBe(false)
      expect(selectedSuggestionIndex.value).toBe(-1)
    })

    it('exposes isSearching as computed from store loading', () => {
      mockSearchStore.loading = true
      const { isSearching } = useProductSearch()

      expect(isSearching.value).toBe(true)
    })
  })

  describe('handleSearchInput', () => {
    it('updates searchQuery when input changes', () => {
      const { searchQuery, handleSearchInput } = useProductSearch()

      handleSearchInput('wine')

      expect(searchQuery.value).toBe('wine')
    })

    it('shows suggestions when input has value', () => {
      const { showSuggestions, handleSearchInput } = useProductSearch()

      handleSearchInput('wine')

      expect(showSuggestions.value).toBe(true)
    })

    it('hides suggestions and clears search when input is empty', () => {
      const { showSuggestions, handleSearchInput } = useProductSearch()

      handleSearchInput('wine')
      expect(showSuggestions.value).toBe(true)

      handleSearchInput('')
      expect(showSuggestions.value).toBe(false)
      expect(mockSearchStore.clearSearch).toHaveBeenCalled()
    })

    it('resets selected suggestion index when input changes', () => {
      const { selectedSuggestionIndex, handleSearchInput } = useProductSearch()

      // Simulate having a selection
      handleSearchInput('wine')

      expect(selectedSuggestionIndex.value).toBe(-1)
    })

    it('debounces search calls by 300ms', async () => {
      const { handleSearchInput } = useProductSearch()

      handleSearchInput('w')
      handleSearchInput('wi')
      handleSearchInput('win')
      handleSearchInput('wine')

      // Before debounce completes
      expect(mockSearchStore.getSuggestions).not.toHaveBeenCalled()

      // Fast-forward 300ms
      await vi.advanceTimersByTimeAsync(300)

      // Should only be called once with final value
      expect(mockSearchStore.getSuggestions).toHaveBeenCalledTimes(1)
      expect(mockSearchStore.getSuggestions).toHaveBeenCalledWith('wine')
    })

    it('performs full search when query is 3+ characters', async () => {
      const { handleSearchInput } = useProductSearch()

      handleSearchInput('wine')
      await vi.advanceTimersByTimeAsync(300)

      expect(mockSearchStore.search).toHaveBeenCalledWith('wine')
    })

    it('does not perform full search for short queries', async () => {
      const { handleSearchInput } = useProductSearch()

      handleSearchInput('wi')
      await vi.advanceTimersByTimeAsync(300)

      expect(mockSearchStore.getSuggestions).toHaveBeenCalled()
      expect(mockSearchStore.search).not.toHaveBeenCalled()
    })
  })

  describe('handleKeyDown', () => {
    it('navigates down through suggestions with ArrowDown', () => {
      mockSearchStore.filteredSuggestions = ['wine', 'cheese', 'honey']
      const { handleSearchInput, handleKeyDown, selectedSuggestionIndex, showSuggestions } = useProductSearch()

      handleSearchInput('w')

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      vi.spyOn(event, 'preventDefault')

      handleKeyDown(event)
      expect(selectedSuggestionIndex.value).toBe(0)

      handleKeyDown(event)
      expect(selectedSuggestionIndex.value).toBe(1)

      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('navigates up through suggestions with ArrowUp', () => {
      mockSearchStore.filteredSuggestions = ['wine', 'cheese', 'honey']
      const { handleSearchInput, handleKeyDown, selectedSuggestionIndex } = useProductSearch()

      handleSearchInput('w')

      // Go down first
      handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
      handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
      expect(selectedSuggestionIndex.value).toBe(1)

      // Now go up
      handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      expect(selectedSuggestionIndex.value).toBe(0)
    })

    it('does not go below -1 with ArrowUp', () => {
      mockSearchStore.filteredSuggestions = ['wine']
      const { handleSearchInput, handleKeyDown, selectedSuggestionIndex } = useProductSearch()

      handleSearchInput('w')

      handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      expect(selectedSuggestionIndex.value).toBe(-1)

      handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      expect(selectedSuggestionIndex.value).toBe(-1)
    })

    it('closes suggestions with Escape', () => {
      mockSearchStore.filteredSuggestions = ['wine']
      const { handleSearchInput, handleKeyDown, showSuggestions, selectedSuggestionIndex } = useProductSearch()

      handleSearchInput('wine')
      expect(showSuggestions.value).toBe(true)

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      vi.spyOn(event, 'preventDefault')
      handleKeyDown(event)

      expect(showSuggestions.value).toBe(false)
      expect(selectedSuggestionIndex.value).toBe(-1)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('does nothing when suggestions are hidden', () => {
      const { handleKeyDown, selectedSuggestionIndex, showSuggestions } = useProductSearch()

      expect(showSuggestions.value).toBe(false)

      handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
      expect(selectedSuggestionIndex.value).toBe(-1)
    })
  })

  describe('clearSearch', () => {
    it('clears all search state', () => {
      const { handleSearchInput, clearSearch, searchQuery, showSuggestions, selectedSuggestionIndex } = useProductSearch()

      handleSearchInput('wine')

      clearSearch()

      expect(searchQuery.value).toBe('')
      expect(showSuggestions.value).toBe(false)
      expect(selectedSuggestionIndex.value).toBe(-1)
      expect(mockSearchStore.clearSearch).toHaveBeenCalled()
    })
  })

  describe('suggestions computed', () => {
    it('returns empty array when no results or suggestions', () => {
      const { suggestions } = useProductSearch()

      expect(suggestions.value).toEqual([])
    })

    it('includes product results as suggestions', () => {
      mockSearchStore.results = [
        { id: 1, name: 'Red Wine', price: 15, images: [{ url: '/wine.jpg' }] },
        { id: 2, name: 'White Wine', price: 12, images: [] },
      ]

      const { suggestions } = useProductSearch()

      expect(suggestions.value).toContainEqual(expect.objectContaining({
        type: 'product',
        id: 'product-1',
        label: 'Red Wine',
        subtitle: '€15',
      }))
    })

    it('includes query suggestions from store', () => {
      mockSearchStore.filteredSuggestions = ['red wine', 'white wine', 'rosé']

      const { suggestions } = useProductSearch()

      expect(suggestions.value).toContainEqual(expect.objectContaining({
        type: 'query',
        id: 'query-red wine',
        label: 'red wine',
      }))
    })

    it('limits suggestions to max 10', () => {
      mockSearchStore.results = Array(5).fill(null).map((_, i) => ({
        id: i,
        name: `Product ${i}`,
        price: 10,
        images: [],
      }))
      mockSearchStore.filteredSuggestions = Array(10).fill(null).map((_, i) => `suggestion-${i}`)

      const { suggestions } = useProductSearch()

      expect(suggestions.value.length).toBeLessThanOrEqual(10)
    })
  })

  describe('executeSearch', () => {
    it('does nothing when query is empty', async () => {
      const { executeSearch } = useProductSearch()

      await executeSearch()

      expect(mockSearchStore.search).not.toHaveBeenCalled()
      expect(mockRouterPush).not.toHaveBeenCalled()
    })

    it('searches and navigates to products page', async () => {
      const { handleSearchInput, executeSearch } = useProductSearch()

      handleSearchInput('wine')
      await executeSearch()

      expect(mockSearchStore.search).toHaveBeenCalledWith('wine')
      expect(mockRouterPush).toHaveBeenCalledWith({
        path: '/products',
        query: { q: 'wine' },
      })
    })

    it('hides suggestions after executing search', async () => {
      const { handleSearchInput, executeSearch, showSuggestions } = useProductSearch()

      handleSearchInput('wine')
      expect(showSuggestions.value).toBe(true)

      await executeSearch()
      expect(showSuggestions.value).toBe(false)
    })
  })

  describe('history management', () => {
    it('removeFromHistory calls store method', () => {
      const { removeFromHistory } = useProductSearch()

      removeFromHistory('old search')

      expect(mockSearchStore.removeFromHistory).toHaveBeenCalledWith('old search')
    })

    it('clearHistory calls store method', () => {
      const { clearHistory } = useProductSearch()

      clearHistory()

      expect(mockSearchStore.clearHistory).toHaveBeenCalled()
    })
  })

  describe('computed properties from store', () => {
    it('exposes popularSearches from store', () => {
      mockSearchStore.popularSearches = ['wine', 'cheese', 'honey']
      const { popularSearches } = useProductSearch()

      expect(popularSearches.value).toEqual(['wine', 'cheese', 'honey'])
    })

    it('exposes recentSearches from store', () => {
      mockSearchStore.recentSearches = [{ query: 'wine', resultsCount: 10 }]
      const { recentSearches } = useProductSearch()

      expect(recentSearches.value).toEqual([{ query: 'wine', resultsCount: 10 }])
    })

    it('exposes hasResults from store', () => {
      mockSearchStore.hasResults = true
      const { hasResults } = useProductSearch()

      expect(hasResults.value).toBe(true)
    })

    it('exposes results from store', () => {
      mockSearchStore.results = [{ id: 1, name: 'Wine' }]
      const { results } = useProductSearch()

      expect(results.value).toEqual([{ id: 1, name: 'Wine' }])
    })
  })
})
