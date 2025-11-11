/**
 * Product Filters Composable
 *
 * Manages product filtering state with URL synchronization.
 * Integrates with existing product catalog while adding modern UX patterns.
 *
 * @example
 * ```vue
 * const {
 *   filters,
 *   activeFilterCount,
 *   updateFilter,
 *   clearFilters,
 *   applyFilters
 * } = useProductFilters()
 * ```
 */

import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ProductFilters } from '~/types'

export interface FilterState extends ProductFilters {
  // Additional UI state
  isOpen?: boolean
}

export const useProductFilters = () => {
  const router = useRouter()
  const route = useRoute()

  // Initialize filters from URL query parameters
  const filters = ref<FilterState>({
    category: route.query.category as string | undefined,
    priceMin: route.query.priceMin ? Number(route.query.priceMin) : undefined,
    priceMax: route.query.priceMax ? Number(route.query.priceMax) : undefined,
    inStock: route.query.inStock === 'true',
    featured: route.query.featured === 'true',
    attributes: parseAttributesFromQuery(route.query.attributes as string | undefined)
  })

  // Track if filters panel is open (for mobile)
  const isFilterPanelOpen = ref(false)

  /**
   * Count active filters
   */
  const activeFilterCount = computed(() => {
    let count = 0

    if (filters.value.category) count++
    if (filters.value.priceMin !== undefined || filters.value.priceMax !== undefined) count++
    if (filters.value.inStock) count++
    if (filters.value.featured) count++
    if (filters.value.attributes && Object.keys(filters.value.attributes).length > 0) {
      count += Object.keys(filters.value.attributes).length
    }

    return count
  })

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => activeFilterCount.value > 0)

  /**
   * Parse attributes from URL query string
   */
  function parseAttributesFromQuery(attributesQuery?: string): Record<string, string[]> | undefined {
    if (!attributesQuery) return undefined

    try {
      return JSON.parse(attributesQuery)
    } catch {
      return undefined
    }
  }

  /**
   * Serialize attributes for URL query string
   */
  function serializeAttributesForQuery(attributes?: Record<string, string[]>): string | undefined {
    if (!attributes || Object.keys(attributes).length === 0) return undefined
    return JSON.stringify(attributes)
  }

  /**
   * Update a single filter value
   */
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    filters.value[key] = value
  }

  /**
   * Update multiple filters at once
   */
  const updateFilters = (updates: Partial<FilterState>) => {
    filters.value = {
      ...filters.value,
      ...updates
    }
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    filters.value = {
      category: undefined,
      priceMin: undefined,
      priceMax: undefined,
      inStock: false,
      featured: false,
      attributes: undefined
    }

    // Update URL
    syncFiltersToUrl()
  }

  /**
   * Clear a specific filter
   */
  const clearFilter = (key: keyof FilterState) => {
    if (key === 'attributes') {
      filters.value.attributes = undefined
    } else if (key === 'inStock' || key === 'featured') {
      filters.value[key] = false
    } else {
      filters.value[key] = undefined
    }

    syncFiltersToUrl()
  }

  /**
   * Remove a specific attribute filter
   */
  const removeAttributeFilter = (attributeKey: string, value?: string) => {
    if (!filters.value.attributes) return

    if (value) {
      // Remove specific value from attribute
      const values = filters.value.attributes[attributeKey] || []
      filters.value.attributes[attributeKey] = values.filter(v => v !== value)

      // Remove attribute key if no values left
      if (filters.value.attributes[attributeKey].length === 0) {
        delete filters.value.attributes[attributeKey]
      }
    } else {
      // Remove entire attribute
      delete filters.value.attributes[attributeKey]
    }

    // Clean up if no attributes left
    if (Object.keys(filters.value.attributes).length === 0) {
      filters.value.attributes = undefined
    }

    syncFiltersToUrl()
  }

  /**
   * Sync filters to URL query parameters
   */
  const syncFiltersToUrl = () => {
    const query: Record<string, string> = {}

    if (filters.value.category) {
      query.category = filters.value.category
    }
    if (filters.value.priceMin !== undefined) {
      query.priceMin = String(filters.value.priceMin)
    }
    if (filters.value.priceMax !== undefined) {
      query.priceMax = String(filters.value.priceMax)
    }
    if (filters.value.inStock) {
      query.inStock = 'true'
    }
    if (filters.value.featured) {
      query.featured = 'true'
    }
    if (filters.value.attributes) {
      const serialized = serializeAttributesForQuery(filters.value.attributes)
      if (serialized) {
        query.attributes = serialized
      }
    }

    // Preserve search query if it exists
    if (route.query.q) {
      query.q = route.query.q as string
    }

    router.push({ query })
  }

  /**
   * Apply filters (triggers sync to URL)
   */
  const applyFilters = () => {
    syncFiltersToUrl()
    isFilterPanelOpen.value = false
  }

  /**
   * Toggle filter panel (mobile)
   */
  const toggleFilterPanel = () => {
    isFilterPanelOpen.value = !isFilterPanelOpen.value
  }

  /**
   * Open filter panel (mobile)
   */
  const openFilterPanel = () => {
    isFilterPanelOpen.value = true
  }

  /**
   * Close filter panel (mobile)
   */
  const closeFilterPanel = () => {
    isFilterPanelOpen.value = false
  }

  /**
   * Watch for route changes to update filters
   */
  watch(
    () => route.query,
    (newQuery) => {
      filters.value = {
        category: newQuery.category as string | undefined,
        priceMin: newQuery.priceMin ? Number(newQuery.priceMin) : undefined,
        priceMax: newQuery.priceMax ? Number(newQuery.priceMax) : undefined,
        inStock: newQuery.inStock === 'true',
        featured: newQuery.featured === 'true',
        attributes: parseAttributesFromQuery(newQuery.attributes as string | undefined)
      }
    },
    { deep: true }
  )

  return {
    // State
    filters,
    isFilterPanelOpen,

    // Computed
    activeFilterCount,
    hasActiveFilters,

    // Methods
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    removeAttributeFilter,
    applyFilters,
    syncFiltersToUrl,
    toggleFilterPanel,
    openFilterPanel,
    closeFilterPanel
  }
}
