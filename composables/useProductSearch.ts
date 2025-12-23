/**
 * Product Search Composable
 *
 * Enhanced search functionality with autocomplete, debouncing, and keyboard navigation.
 * Integrates with existing search store while adding modern UX patterns.
 *
 * @example
 * ```vue
 * const {
 *   searchQuery,
 *   suggestions,
 *   isSearching,
 *   handleSearch,
 *   selectSuggestion
 * } = useProductSearch()
 * ```
 */

import { ref, computed, watch, onUnmounted } from 'vue'
import { useDebounceFn, type UseDebounceFnReturn } from '@vueuse/core'
import { useSearchStore } from '~/stores/search'

export interface SearchSuggestion {
  type: 'product' | 'query' | 'history'
  id: string
  label: string
  subtitle?: string
  image?: string
  resultsCount?: number
}

export const useProductSearch = () => {
  const searchStore = useSearchStore()
  const router = useRouter()
  const localePath = useLocalePath()

  // Local reactive state
  const searchQuery = ref('')
  const showSuggestions = ref(false)
  const selectedSuggestionIndex = ref(-1)
  const isSearching = computed(() => searchStore.loading)

  // Initialize search store
  if (import.meta.client) {
    searchStore.initialize()
  }

  /**
   * Enhanced suggestions that combine products, queries, and history
   */
  const suggestions = computed((): SearchSuggestion[] => {
    const allSuggestions: SearchSuggestion[] = []

    // Add product results as suggestions (top 3)
    const topProducts = searchStore.results.slice(0, 3)
    topProducts.forEach((product) => {
      allSuggestions.push({
        type: 'product',
        id: `product-${product.id}`,
        label: typeof product.name === 'string' ? product.name : product.name?.en || 'Product',
        subtitle: `€${product.price}`,
        image: product.images?.[0]?.url,
      })
    })

    // Add query suggestions (next 5)
    searchStore.filteredSuggestions.slice(0, 5).forEach((suggestion) => {
      allSuggestions.push({
        type: 'query',
        id: `query-${suggestion}`,
        label: suggestion,
      })
    })

    // Add search history if no results yet (max 8 total)
    if (searchQuery.value && searchStore.results.length === 0) {
      searchStore.recentSearches
        .filter(item => item.query.toLowerCase().includes(searchQuery.value.toLowerCase()))
        .slice(0, 8 - allSuggestions.length)
        .forEach((historyItem) => {
          allSuggestions.push({
            type: 'history',
            id: `history-${historyItem.query}`,
            label: historyItem.query,
            resultsCount: historyItem.resultsCount,
          })
        })
    }

    // Limit to 10 suggestions max (8 on mobile)
    const maxSuggestions = import.meta.client && window.innerWidth < 768 ? 8 : 10
    return allSuggestions.slice(0, maxSuggestions)
  })

  /**
   * Debounced search function (300ms delay)
   */
  const debouncedSearch = useDebounceFn(async (query: string) => {
    if (!query.trim()) {
      searchStore.clearSearch()
      return
    }

    // Get suggestions for autocomplete
    await searchStore.getSuggestions(query)

    // Optionally perform full search if query is substantial
    if (query.length >= 3) {
      await searchStore.search(query)
    }
  }, 300) as UseDebounceFnReturn<(query: string) => Promise<void>> & { cancel: () => void }

  /**
   * Handle search input changes
   */
  const handleSearchInput = (value: string) => {
    searchQuery.value = value
    selectedSuggestionIndex.value = -1

    if (value.trim()) {
      showSuggestions.value = true
      debouncedSearch(value)
    }
    else {
      showSuggestions.value = false
      searchStore.clearSearch()
    }
  }

  /**
   * Execute search (typically on Enter key or submit button)
   */
  const executeSearch = async () => {
    if (!searchQuery.value.trim()) return

    showSuggestions.value = false
    await searchStore.search(searchQuery.value)

    // Navigate to products page with search query
    router.push({
      path: '/products',
      query: { q: searchQuery.value },
    })
  }

  /**
   * Select a suggestion from the list
   */
  const selectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      // Navigate to product detail page
      const productSlug = suggestion.id.replace('product-', '')
      router.push(localePath({ name: 'products-slug', params: { slug: productSlug } }))
    }
    else {
      // Use the suggestion as search query
      searchQuery.value = suggestion.label
      executeSearch()
    }

    showSuggestions.value = false
  }

  /**
   * Keyboard navigation for suggestions
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!showSuggestions.value || suggestions.value.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        selectedSuggestionIndex.value = Math.min(
          selectedSuggestionIndex.value + 1,
          suggestions.value.length - 1,
        )
        break

      case 'ArrowUp':
        event.preventDefault()
        selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1)
        break

      case 'Enter':
        event.preventDefault()
        if (selectedSuggestionIndex.value >= 0) {
          const selectedSuggestion = suggestions.value[selectedSuggestionIndex.value]
          if (selectedSuggestion) {
            selectSuggestion(selectedSuggestion)
          }
        }
        else {
          executeSearch()
        }
        break

      case 'Escape':
        event.preventDefault()
        showSuggestions.value = false
        selectedSuggestionIndex.value = -1
        break
    }
  }

  /**
   * Clear search
   */
  const clearSearch = () => {
    debouncedSearch.cancel() // Cancel pending debounced calls
    searchQuery.value = ''
    searchStore.clearSearch()
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1
  }

  /**
   * Cleanup on unmount
   */
  onUnmounted(() => {
    debouncedSearch.cancel() // Cancel any pending debounced searches
  })

  /**
   * Remove item from search history
   */
  const removeFromHistory = (query: string) => {
    searchStore.removeFromHistory(query)
  }

  /**
   * Clear all search history
   */
  const clearHistory = () => {
    searchStore.clearHistory()
  }

  /**
   * Get popular searches
   */
  const popularSearches = computed(() => searchStore.popularSearches)

  /**
   * Get recent searches
   */
  const recentSearches = computed(() => searchStore.recentSearches)

  /**
   * Check if there are results
   */
  const hasResults = computed(() => searchStore.hasResults)

  /**
   * Get search results
   */
  const results = computed(() => searchStore.results)

  /**
   * Watch for route changes to sync search query
   */
  watch(
    () => router.currentRoute.value.query.q,
    (newQuery) => {
      if (typeof newQuery === 'string' && newQuery !== searchQuery.value) {
        searchQuery.value = newQuery
        if (newQuery) {
          searchStore.search(newQuery)
        }
      }
    },
    { immediate: true },
  )

  return {
    // State
    searchQuery,
    showSuggestions,
    selectedSuggestionIndex,
    isSearching,

    // Computed
    suggestions,
    popularSearches,
    recentSearches,
    hasResults,
    results,

    // Methods
    handleSearchInput,
    executeSearch,
    selectSuggestion,
    handleKeyDown,
    clearSearch,
    removeFromHistory,
    clearHistory,
  }
}
