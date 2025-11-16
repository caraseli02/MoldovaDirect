/**
 * Product Filters Composable
 *
 * Manages product filtering state with URL synchronization and filter chips.
 * Follows Single Responsibility Principle - handles filter state, chips, and UI logic.
 *
 * @example
 * ```vue
 * const {
 *   filters,
 *   activeFilterCount,
 *   activeFilterChips,
 *   updateFilter,
 *   clearFilters,
 *   removeFilterChip,
 *   applyFilters
 * } = useProductFilters(categoriesTree)
 * ```
 */

import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { ProductFilters } from '~/types'
import type { Ref } from 'vue'

export interface FilterState extends ProductFilters {
  // Additional UI state
  isOpen?: boolean
}

export interface FilterChip {
  id: string
  label: string
  type: string
  attributeKey?: string
  attributeValue?: string
}

export const useProductFilters = (categoriesTree?: Ref<any[]>) => {
  const router = useRouter()
  const route = useRoute()
  const { t, locale } = useI18n()

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

  // Price range state for filter UI
  const priceRange = ref<{ min: number; max: number }>({ min: 0, max: 200 })

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
   * Build category lookup Map for O(1) access instead of O(n) tree traversal
   * Performance optimization for large category trees
   */
  const categoriesLookup = computed(() => {
    if (!categoriesTree) return new Map<string | number, string>()

    const map = new Map<string | number, string>()

    const buildMap = (nodes: any[]) => {
      nodes.forEach(node => {
        // Get localized name with fallback
        const name = node.name?.[locale.value] || node.name?.es || Object.values(node.name || {})[0] || ''

        // Store by both slug and ID for flexible lookup
        if (node.slug) map.set(node.slug, name)
        if (node.id) map.set(node.id, name)

        // Recursively process children
        if (node.children?.length) {
          buildMap(node.children)
        }
      })
    }

    buildMap(categoriesTree.value || [])
    return map
  })

  /**
   * O(1) category name lookup
   */
  const getCategoryName = (slugOrId: string | number | undefined): string => {
    if (!slugOrId) return ''
    return categoriesLookup.value.get(slugOrId) || ''
  }

  /**
   * Generate filter chips for active filters
   * Returns array of chip objects with id, label, and type
   */
  const activeFilterChips = computed<FilterChip[]>(() => {
    const chips: FilterChip[] = []

    if (filters.value.category) {
      chips.push({
        id: 'category',
        label: t('products.chips.category', {
          value: getCategoryName(filters.value.category) || t('products.filters.unknownCategory')
        }),
        type: 'category'
      })
    }

    if (filters.value.priceMin) {
      chips.push({
        id: 'priceMin',
        label: t('products.chips.priceMin', { value: filters.value.priceMin }),
        type: 'priceMin'
      })
    }

    if (filters.value.priceMax) {
      chips.push({
        id: 'priceMax',
        label: t('products.chips.priceMax', { value: filters.value.priceMax }),
        type: 'priceMax'
      })
    }

    if (filters.value.inStock) {
      chips.push({
        id: 'inStock',
        label: t('products.chips.inStock'),
        type: 'inStock'
      })
    }

    if (filters.value.featured) {
      chips.push({
        id: 'featured',
        label: t('products.chips.featured'),
        type: 'featured'
      })
    }

    if (filters.value.attributes) {
      Object.entries(filters.value.attributes).forEach(([key, values]) => {
        values.forEach(value => {
          chips.push({
            id: `attr-${key}-${value}`,
            label: t('products.chips.attribute', { label: key, value }),
            type: 'attribute',
            attributeKey: key,
            attributeValue: value
          })
        })
      })
    }

    return chips
  })

  /**
   * Generate available filters based on categories tree
   */
  const availableFilters = computed(() => {
    const convertCategories = (cats: any[]): any[] => {
      return cats.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        productCount: cat.productCount || 0,
        children: cat.children ? convertCategories(cat.children) : []
      }))
    }

    return {
      categories: categoriesTree ? convertCategories(categoriesTree.value || []) : [],
      priceRange: priceRange.value,
      attributes: []
    }
  })

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
   * Remove a specific filter chip
   * Returns the updated filters object for further processing
   */
  const removeFilterChip = (chip: FilterChip): ProductFilters => {
    const nextFilters: ProductFilters = { ...filters.value }

    switch (chip.type) {
      case 'category':
        delete nextFilters.category
        break
      case 'priceMin':
        delete nextFilters.priceMin
        break
      case 'priceMax':
        delete nextFilters.priceMax
        break
      case 'inStock':
        delete nextFilters.inStock
        break
      case 'featured':
        delete nextFilters.featured
        break
      case 'attribute':
        if (chip.attributeKey && chip.attributeValue && nextFilters.attributes?.[chip.attributeKey]) {
          const filtered = nextFilters.attributes[chip.attributeKey].filter(
            value => value !== chip.attributeValue
          )
          if (filtered.length) {
            nextFilters.attributes![chip.attributeKey] = filtered
          } else {
            delete nextFilters.attributes![chip.attributeKey]
          }
          if (Object.keys(nextFilters.attributes || {}).length === 0) {
            delete nextFilters.attributes
          }
        }
        break
    }

    // Update the filters state
    filters.value = nextFilters
    syncFiltersToUrl()

    return nextFilters
  }

  /**
   * Fetch dynamic price range based on current filter scope
   * Updates the available price range for the price filter
   */
  const refreshPriceRange = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.value.category) params.append('category', String(filters.value.category))
      if (filters.value.inStock) params.append('inStock', 'true')
      if (filters.value.featured) params.append('featured', 'true')

      const res = await $fetch<{ success: boolean; min: number; max: number }>(
        `/api/products/price-range?${params.toString()}`
      )

      if (res.success) {
        priceRange.value = { min: res.min ?? 0, max: res.max ?? 200 }
      }
    } catch (e) {
      // Keep existing range on error
      console.error('Failed to load price range', e)
    }
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
    priceRange,

    // Computed
    activeFilterCount,
    hasActiveFilters,
    activeFilterChips,
    availableFilters,
    categoriesLookup,

    // Methods
    getCategoryName,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    removeAttributeFilter,
    removeFilterChip,
    applyFilters,
    syncFiltersToUrl,
    toggleFilterPanel,
    openFilterPanel,
    closeFilterPanel,
    refreshPriceRange
  }
}
