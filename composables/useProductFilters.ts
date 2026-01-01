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
import type { ProductFilters, CategoryWithChildren } from '~/types'
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

interface AvailableCategory {
  id: number
  name: Record<string, string>
  slug: string
  productCount: number
  children: AvailableCategory[]
}

export function useProductFilters(categoriesTree?: Ref<CategoryWithChildren[]>) {
  const router = useRouter()
  const route = useRoute()
  const { t, locale } = useI18n()

  /**
   * Parse and validate price parameter from URL query
   * Prevents DoS attacks with invalid numbers (NaN, Infinity, negative, too large)
   */
  const parsePrice = (value: string | string[] | null | undefined): number | undefined => {
    if (!value || Array.isArray(value)) return undefined

    const num = Number(value)

    // Validate: must be finite, positive, and within reasonable range
    if (!Number.isFinite(num) || num < 0 || num > 999999) {
      console.warn(`Invalid price value: ${value}`)
      return undefined
    }

    // Round to 2 decimal places
    return Math.round(num * 100) / 100
  }

  // Initialize filters from URL query parameters
  const filters = ref<FilterState>({
    category: typeof route.query.category === 'string' ? route.query.category : undefined,
    priceMin: parsePrice(typeof route.query.priceMin === 'string' ? route.query.priceMin : undefined),
    priceMax: parsePrice(typeof route.query.priceMax === 'string' ? route.query.priceMax : undefined),
    inStock: route.query.inStock === 'true',
    featured: route.query.featured === 'true',
    attributes: parseAttributesFromQuery(typeof route.query.attributes === 'string' ? route.query.attributes : undefined),
  })

  // Track if filters panel is open (for mobile)
  const isFilterPanelOpen = ref(false)

  // Price range state for filter UI
  const priceRange = ref<{ min: number, max: number }>({ min: 0, max: 200 })

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
   * Parse and validate attributes from URL query string
   * Prevents prototype pollution and JSON injection attacks
   */
  function parseAttributesFromQuery(attributesQuery?: string): Record<string, string[]> | undefined {
    if (!attributesQuery) return undefined

    try {
      const parsed = JSON.parse(attributesQuery)

      // Validate: must be an object
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        console.warn('Invalid attributes structure: must be an object')
        return undefined
      }

      // Prevent prototype pollution attacks
      const dangerousKeys = ['__proto__', 'constructor', 'prototype']
      if (Object.keys(parsed).some(key => dangerousKeys.includes(key))) {
        console.warn('Attempted prototype pollution detected in attributes')
        return undefined
      }

      // Validate structure: all values must be string arrays
      const validated: Record<string, string[]> = {}
      for (const [key, value] of Object.entries(parsed)) {
        // Skip dangerous keys again for safety
        if (dangerousKeys.includes(key)) continue

        // Validate value is array
        if (!Array.isArray(value)) {
          console.warn(`Invalid attribute value for ${key}: must be array`)
          continue
        }

        // Validate all array elements are strings with max length
        const validStrings = value.filter(v =>
          typeof v === 'string' && v.length > 0 && v.length <= 100,
        )

        if (validStrings.length > 0) {
          validated[key] = validStrings
        }
      }

      return Object.keys(validated).length > 0 ? validated : undefined
    }
    catch (error: unknown) {
      console.warn('Failed to parse attributes query:', error)
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
   * Memoized to prevent unnecessary rebuilds
   */
  const categoriesLookup = computed(() => {
    if (!categoriesTree) return new Map<string | number, string>()

    const map = new Map<string | number, string>()

    const buildMap = (nodes: CategoryWithChildren[]): void => {
      nodes.forEach((node) => {
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
   * Returns readonly array of chip objects with id, label, and type
   */
  const activeFilterChips = computed(() => {
    const chips: FilterChip[] = []

    if (filters.value.category) {
      chips.push({
        id: 'category',
        label: t('products.chips.category', {
          value: getCategoryName(filters.value.category) || t('products.filters.unknownCategory'),
        }),
        type: 'category',
      })
    }

    if (filters.value.priceMin) {
      chips.push({
        id: 'priceMin',
        label: t('products.chips.priceMin', { value: filters.value.priceMin }),
        type: 'priceMin',
      })
    }

    if (filters.value.priceMax) {
      chips.push({
        id: 'priceMax',
        label: t('products.chips.priceMax', { value: filters.value.priceMax }),
        type: 'priceMax',
      })
    }

    if (filters.value.inStock) {
      chips.push({
        id: 'inStock',
        label: t('products.chips.inStock'),
        type: 'inStock',
      })
    }

    if (filters.value.featured) {
      chips.push({
        id: 'featured',
        label: t('products.chips.featured'),
        type: 'featured',
      })
    }

    if (filters.value.attributes) {
      Object.entries(filters.value.attributes).forEach(([key, values]) => {
        values.forEach((value) => {
          chips.push({
            id: `attr-${key}-${value}`,
            label: t('products.chips.attribute', { label: key, value }),
            type: 'attribute',
            attributeKey: key,
            attributeValue: value,
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
    const convertCategories = (cats: CategoryWithChildren[]): AvailableCategory[] => {
      return cats.map((cat): AvailableCategory => ({
        id: cat.id,
        name: cat.name as Record<string, string>,
        slug: cat.slug,
        productCount: cat.productCount || 0,
        children: cat.children ? convertCategories(cat.children) : [],
      }))
    }

    return {
      categories: categoriesTree ? convertCategories(categoriesTree.value || []) : [],
      priceRange: priceRange.value,
      attributes: [],
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
      ...updates,
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
      attributes: undefined,
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
    }
    else if (key === 'inStock' || key === 'featured') {
      filters.value[key] = false
    }
    else {
      filters.value[key] = undefined
    }

    syncFiltersToUrl()
  }

  /**
   * Remove a specific attribute filter with null safety
   */
  const removeAttributeFilter = (attributeKey: string, value?: string) => {
    if (!filters.value.attributes) return

    if (value) {
      // Remove specific value from attribute
      const values = filters.value.attributes[attributeKey] || []
      filters.value.attributes[attributeKey] = values.filter(v => v !== value)

      // Safe null check: verify attribute still exists before checking length
      const updatedValues = filters.value.attributes[attributeKey]
      if (updatedValues && updatedValues.length === 0) {
        const { [attributeKey]: _removed, ...rest } = filters.value.attributes
        filters.value.attributes = rest
      }
    }
    else {
      // Remove entire attribute
      const { [attributeKey]: _removed, ...rest } = filters.value.attributes
      filters.value.attributes = rest
    }

    // Clean up if no attributes left
    if (filters.value.attributes && Object.keys(filters.value.attributes).length === 0) {
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
      query.category = String(filters.value.category)
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
    if (route.query.q && typeof route.query.q === 'string') {
      query.q = route.query.q
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
        if (chip.attributeKey && chip.attributeValue && nextFilters.attributes) {
          const currentValues = nextFilters.attributes[chip.attributeKey]
          if (currentValues) {
            const filtered = currentValues.filter(
              value => value !== chip.attributeValue,
            )
            if (filtered.length) {
              nextFilters.attributes[chip.attributeKey] = filtered
            }
            else {
              const { [chip.attributeKey]: _removed, ...rest } = nextFilters.attributes
              nextFilters.attributes = rest
            }
            if (Object.keys(nextFilters.attributes || {}).length === 0) {
              delete nextFilters.attributes
            }
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

      const res = await $fetch<{ success: boolean, min: number, max: number }>(
        `/api/products/price-range?${params.toString()}`,
      )

      if (res.success) {
        priceRange.value = { min: res.min ?? 0, max: res.max ?? 200 }
      }
    }
    catch {
      // Keep existing range on error
      console.error('Failed to load price range')
    }
  }

  /**
   * Watch for filter-related route changes only (performance optimization)
   * Avoids re-rendering on unrelated query param changes (utm_source, focus, etc.)
   */
  watch(
    () => ({
      category: route.query.category,
      priceMin: route.query.priceMin,
      priceMax: route.query.priceMax,
      inStock: route.query.inStock,
      featured: route.query.featured,
      attributes: route.query.attributes,
    }),
    (newQuery) => {
      filters.value = {
        category: typeof newQuery.category === 'string' ? newQuery.category : undefined,
        priceMin: parsePrice(typeof newQuery.priceMin === 'string' ? newQuery.priceMin : undefined),
        priceMax: parsePrice(typeof newQuery.priceMax === 'string' ? newQuery.priceMax : undefined),
        inStock: newQuery.inStock === 'true',
        featured: newQuery.featured === 'true',
        attributes: parseAttributesFromQuery(typeof newQuery.attributes === 'string' ? newQuery.attributes : undefined),
      }
    },
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
    refreshPriceRange,
  }
}
