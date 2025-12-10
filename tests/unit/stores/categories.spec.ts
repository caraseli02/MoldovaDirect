/**
 * Categories Store Unit Tests
 *
 * Tests for the categories store getters, navigation, and state operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCategoriesStore } from '~/stores/categories'
import type { CategoryWithChildren } from '~/types'

// Mock $fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Sample test data
const mockCategories: CategoryWithChildren[] = [
  { id: 1, slug: 'wines', name: { es: 'Vinos', en: 'Wines', ro: 'Vinuri', ru: 'Вина' }, parentId: undefined, sortOrder: 1, isActive: true, children: [] },
  { id: 2, slug: 'red-wines', name: { es: 'Vinos Tintos', en: 'Red Wines', ro: 'Vinuri Roșii', ru: 'Красные вина' }, parentId: 1, sortOrder: 1, isActive: true, children: [] },
  { id: 3, slug: 'white-wines', name: { es: 'Vinos Blancos', en: 'White Wines', ro: 'Vinuri Albe', ru: 'Белые вина' }, parentId: 1, sortOrder: 2, isActive: true, children: [] },
  { id: 4, slug: 'sparkling', name: { es: 'Espumantes', en: 'Sparkling', ro: 'Spumante', ru: 'Игристые' }, parentId: 1, sortOrder: 3, isActive: true, children: [] },
  { id: 5, slug: 'spirits', name: { es: 'Licores', en: 'Spirits', ro: 'Spirtoase', ru: 'Спиртные напитки' }, parentId: undefined, sortOrder: 2, isActive: true, children: [] },
  { id: 6, slug: 'brandy', name: { es: 'Brandy', en: 'Brandy', ro: 'Brandy', ru: 'Бренди' }, parentId: 5, sortOrder: 1, isActive: true, children: [] }
]

describe('Categories Store', () => {
  let store: ReturnType<typeof useCategoriesStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCategoriesStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    store.$reset()
  })

  describe('Initial State', () => {
    it('starts with empty categories array', () => {
      expect(store.categories).toEqual([])
    })

    it('starts with null currentCategory', () => {
      expect(store.currentCategory).toBeNull()
    })

    it('starts with empty expandedCategories set', () => {
      expect(store.expandedCategories.size).toBe(0)
    })

    it('starts with null selectedCategory', () => {
      expect(store.selectedCategory).toBeNull()
    })

    it('starts with loading false', () => {
      expect(store.loading).toBe(false)
    })

    it('starts with null error', () => {
      expect(store.error).toBeNull()
    })
  })

  describe('Getters', () => {
    describe('categoriesTree', () => {
      beforeEach(() => {
        store.categories = mockCategories
      })

      it('builds tree structure from flat categories', () => {
        const tree = store.categoriesTree
        // Should have 2 root categories: wines and spirits
        expect(tree).toHaveLength(2)
      })

      it('sorts categories by sortOrder', () => {
        const tree = store.categoriesTree
        expect(tree[0].slug).toBe('wines') // sortOrder: 1
        expect(tree[1].slug).toBe('spirits') // sortOrder: 2
      })

      it('nests children under parent categories', () => {
        const tree = store.categoriesTree
        const wines = tree.find(c => c.slug === 'wines')

        expect(wines?.children).toHaveLength(3) // red, white, sparkling
        expect(wines?.children?.[0].slug).toBe('red-wines')
        expect(wines?.children?.[1].slug).toBe('white-wines')
        expect(wines?.children?.[2].slug).toBe('sparkling')
      })

      it('handles deeply nested categories', () => {
        const tree = store.categoriesTree
        const spirits = tree.find(c => c.slug === 'spirits')

        expect(spirits?.children).toHaveLength(1)
        expect(spirits?.children?.[0].slug).toBe('brandy')
      })

      it('returns empty array when no categories', () => {
        store.categories = []
        expect(store.categoriesTree).toEqual([])
      })
    })

    describe('rootCategories', () => {
      beforeEach(() => {
        store.categories = mockCategories
      })

      it('returns only root categories (no parent)', () => {
        expect(store.rootCategories).toHaveLength(2)
        expect(store.rootCategories.every(c => !c.parentId)).toBe(true)
      })

      it('sorts by sortOrder', () => {
        expect(store.rootCategories[0].slug).toBe('wines')
        expect(store.rootCategories[1].slug).toBe('spirits')
      })

      it('returns empty array when no categories', () => {
        store.categories = []
        expect(store.rootCategories).toEqual([])
      })
    })

    describe('getCategoryByIdentifier', () => {
      beforeEach(() => {
        store.categories = mockCategories
      })

      it('finds category by slug', () => {
        const category = store.getCategoryByIdentifier('wines')
        expect(category?.id).toBe(1)
      })

      it('finds category by ID string', () => {
        const category = store.getCategoryByIdentifier('1')
        expect(category?.slug).toBe('wines')
      })

      it('returns undefined for non-existent identifier', () => {
        const category = store.getCategoryByIdentifier('non-existent')
        expect(category).toBeUndefined()
      })

      it('finds nested category', () => {
        const category = store.getCategoryByIdentifier('red-wines')
        expect(category?.id).toBe(2)
        expect(category?.parentId).toBe(1)
      })
    })

    describe('breadcrumbs', () => {
      beforeEach(() => {
        store.categories = mockCategories
      })

      it('returns empty array when no current category', () => {
        expect(store.breadcrumbs).toEqual([])
      })

      it('returns single item for root category', () => {
        store.currentCategory = mockCategories[0] // wines
        expect(store.breadcrumbs).toHaveLength(1)
        expect(store.breadcrumbs[0].slug).toBe('wines')
      })

      it('builds full path for nested category', () => {
        store.currentCategory = mockCategories[1] // red-wines
        expect(store.breadcrumbs).toHaveLength(2)
        expect(store.breadcrumbs[0].slug).toBe('wines')
        expect(store.breadcrumbs[1].slug).toBe('red-wines')
      })

      it('includes all ancestors in order', () => {
        store.currentCategory = mockCategories[5] // brandy
        expect(store.breadcrumbs).toHaveLength(2)
        expect(store.breadcrumbs[0].slug).toBe('spirits')
        expect(store.breadcrumbs[1].slug).toBe('brandy')
      })
    })

    describe('isCategoryExpanded', () => {
      it('returns false for non-expanded category', () => {
        expect(store.isCategoryExpanded(1)).toBe(false)
      })

      it('returns true for expanded category', () => {
        store.expandedCategories.add(1)
        expect(store.isCategoryExpanded(1)).toBe(true)
      })
    })
  })

  describe('Actions', () => {
    describe('fetchCategories', () => {
      it('sets loading state during fetch', async () => {
        mockFetch.mockResolvedValueOnce({ categories: mockCategories })

        const fetchPromise = store.fetchCategories()
        expect(store.loading).toBe(true)

        await fetchPromise
        expect(store.loading).toBe(false)
      })

      it('populates categories from API response', async () => {
        mockFetch.mockResolvedValueOnce({ categories: mockCategories })

        await store.fetchCategories()

        expect(store.categories).toHaveLength(6)
        expect(store.categories[0].slug).toBe('wines')
      })

      it('uses cached data when available', async () => {
        // Pre-populate cache
        store.cache.set('categories', {
          data: mockCategories,
          timestamp: Date.now()
        })

        await store.fetchCategories()

        // Should not call API
        expect(mockFetch).not.toHaveBeenCalled()
        expect(store.categories).toHaveLength(6)
      })

      it('fetches from API when cache is expired', async () => {
        // Set expired cache (31 minutes old)
        store.cache.set('categories', {
          data: [],
          timestamp: Date.now() - 31 * 60 * 1000
        })

        mockFetch.mockResolvedValueOnce({ categories: mockCategories })

        await store.fetchCategories()

        expect(mockFetch).toHaveBeenCalled()
        expect(store.categories).toHaveLength(6)
      })

      it('handles API errors gracefully', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        await store.fetchCategories()

        expect(store.error).toBe('Network error')
        expect(store.loading).toBe(false)
      })
    })

    describe('setCurrentCategory', () => {
      beforeEach(() => {
        store.categories = mockCategories
      })

      it('sets currentCategory by slug', () => {
        store.setCurrentCategory('wines')

        expect(store.currentCategory?.id).toBe(1)
        expect(store.selectedCategory).toBe('wines')
      })

      it('sets currentCategory by ID', () => {
        store.setCurrentCategory('1')

        expect(store.currentCategory?.slug).toBe('wines')
        expect(store.selectedCategory).toBe('1')
      })

      it('clears currentCategory when null passed', () => {
        store.currentCategory = mockCategories[0]
        store.selectedCategory = 'wines'

        store.setCurrentCategory(null)

        expect(store.currentCategory).toBeNull()
        expect(store.selectedCategory).toBeNull()
      })

      it('auto-expands parent categories when selecting nested category', () => {
        store.setCurrentCategory('red-wines')

        expect(store.currentCategory?.slug).toBe('red-wines')
        expect(store.expandedCategories.has(1)).toBe(true) // Parent (wines) should be expanded
      })

      it('does not modify state for non-existent category', () => {
        store.currentCategory = mockCategories[0]

        store.setCurrentCategory('non-existent')

        // Should remain unchanged when category not found
        expect(store.currentCategory?.slug).toBe('wines')
      })
    })

    describe('toggleCategoryExpansion', () => {
      it('expands collapsed category', () => {
        expect(store.expandedCategories.has(1)).toBe(false)

        store.toggleCategoryExpansion(1)

        expect(store.expandedCategories.has(1)).toBe(true)
      })

      it('collapses expanded category', () => {
        store.expandedCategories.add(1)

        store.toggleCategoryExpansion(1)

        expect(store.expandedCategories.has(1)).toBe(false)
      })
    })

    describe('expandParentCategories', () => {
      beforeEach(() => {
        store.categories = mockCategories
      })

      it('expands parent of nested category', () => {
        const redWines = mockCategories[1] // has parentId: 1

        store.expandParentCategories(redWines)

        expect(store.expandedCategories.has(1)).toBe(true)
      })

      it('does nothing for root category', () => {
        const wines = mockCategories[0] // no parentId

        store.expandParentCategories(wines)

        expect(store.expandedCategories.size).toBe(0)
      })

      it('expands all ancestors for deeply nested category', () => {
        // Add a deeply nested category for testing
        const deepCategory = {
          ...mockCategories[1],
          id: 100,
          parentId: 2, // Child of red-wines
          slug: 'merlot'
        }
        store.categories = [...mockCategories, deepCategory]

        store.expandParentCategories(deepCategory)

        // Should expand red-wines (2) and wines (1)
        expect(store.expandedCategories.has(2)).toBe(true)
        expect(store.expandedCategories.has(1)).toBe(true)
      })
    })

    describe('clearCache', () => {
      it('clears all cached data', () => {
        store.cache.set('categories', { data: mockCategories, timestamp: Date.now() })
        store.cache.set('other', { data: [], timestamp: Date.now() })

        store.clearCache()

        expect(store.cache.size).toBe(0)
      })
    })
  })

  describe('Navigation State', () => {
    beforeEach(() => {
      store.categories = mockCategories
    })

    it('maintains expansion state across category selections', () => {
      // Expand wines category
      store.toggleCategoryExpansion(1)
      expect(store.expandedCategories.has(1)).toBe(true)

      // Select a different category
      store.setCurrentCategory('spirits')

      // Wines should still be expanded
      expect(store.expandedCategories.has(1)).toBe(true)
    })

    it('tracks multiple expanded categories', () => {
      store.toggleCategoryExpansion(1) // wines
      store.toggleCategoryExpansion(5) // spirits

      expect(store.expandedCategories.has(1)).toBe(true)
      expect(store.expandedCategories.has(5)).toBe(true)
    })
  })
})
