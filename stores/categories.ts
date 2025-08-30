import { defineStore } from 'pinia'
import type { CategoryWithChildren, ProductWithRelations } from '~/types'

interface CategoriesState {
  // Categories data
  categories: CategoryWithChildren[]
  currentCategory: CategoryWithChildren | null
  
  // Navigation state
  expandedCategories: Set<number>
  selectedCategory: string | null
  
  // Loading states
  loading: boolean
  error: string | null
  
  // Cache
  cache: Map<string, { data: any; timestamp: number }>
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],
    currentCategory: null,
    expandedCategories: new Set(),
    selectedCategory: null,
    loading: false,
    error: null,
    cache: new Map()
  }),

  getters: {
    // Get categories as tree structure
    categoriesTree: (state): CategoryWithChildren[] => {
      const buildTree = (parentId?: number): CategoryWithChildren[] => {
        return state.categories
          .filter(cat => cat.parentId === parentId)
          .map(cat => ({
            ...cat,
            children: buildTree(cat.id)
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      }
      
      return buildTree()
    },

    // Get root categories
    rootCategories: (state): CategoryWithChildren[] => {
      return state.categories
        .filter(cat => !cat.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    },

    // Get category by slug or ID
    getCategoryByIdentifier: (state) => (identifier: string): CategoryWithChildren | undefined => {
      return state.categories.find(cat => 
        cat.slug === identifier || cat.id.toString() === identifier
      )
    },

    // Get breadcrumb path for current category
    breadcrumbs: (state): CategoryWithChildren[] => {
      if (!state.currentCategory) return []
      
      const buildBreadcrumbs = (category: CategoryWithChildren, path: CategoryWithChildren[] = []): CategoryWithChildren[] => {
        const newPath = [category, ...path]
        
        if (category.parentId) {
          const parent = state.categories.find(cat => cat.id === category.parentId)
          if (parent) {
            return buildBreadcrumbs(parent, newPath)
          }
        }
        
        return newPath
      }
      
      return buildBreadcrumbs(state.currentCategory)
    },

    // Check if category is expanded
    isCategoryExpanded: (state) => (categoryId: number): boolean => {
      return state.expandedCategories.has(categoryId)
    }
  },

  actions: {
    // Fetch all categories
    async fetchCategories() {
      this.loading = true
      this.error = null
      
      try {
        // Check cache
        const cached = this.cache.get('categories')
        if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
          this.categories = cached.data
          this.loading = false
          return
        }
        
        const response = await $fetch<{ categories: CategoryWithChildren[] }>('/api/categories')
        this.categories = response.categories
        
        // Cache the response
        this.cache.set('categories', {
          data: response.categories,
          timestamp: Date.now()
        })
        
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch categories'
        console.error('Error fetching categories:', error)
      } finally {
        this.loading = false
      }
    },

    // Set current category
    setCurrentCategory(identifier: string | null) {
      if (!identifier) {
        this.currentCategory = null
        this.selectedCategory = null
        return
      }
      
      const category = this.getCategoryByIdentifier(identifier)
      if (category) {
        this.currentCategory = category
        this.selectedCategory = identifier
        
        // Auto-expand parent categories
        this.expandParentCategories(category)
      }
    },

    // Toggle category expansion
    toggleCategoryExpansion(categoryId: number) {
      if (this.expandedCategories.has(categoryId)) {
        this.expandedCategories.delete(categoryId)
      } else {
        this.expandedCategories.add(categoryId)
      }
    },

    // Expand parent categories for a given category
    expandParentCategories(category: CategoryWithChildren) {
      let current = category
      
      while (current.parentId) {
        this.expandedCategories.add(current.parentId)
        const parent = this.categories.find(cat => cat.id === current.parentId)
        if (!parent) break
        current = parent
      }
    },

    // Clear cache
    clearCache() {
      this.cache.clear()
    }
  }
})