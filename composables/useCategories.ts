// Category management composable using the new TypeScript interfaces
import type {
  CategoryWithChildren,
  CategoriesApiResponse,
  CategoryApiResponse,
  UseCategoriesReturn,
  LanguageCode
} from '~/types'

import {
  getLocalizedText,
  buildCategoryBreadcrumbs
} from '~/types'

/**
 * Composable for managing category data and operations
 */
export const useCategories = (): UseCategoriesReturn => {
  // State
  const categories = ref<CategoryWithChildren[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get current locale
  const { locale } = useI18n()
  const currentLocale = computed(() => locale.value as LanguageCode)

  /**
   * Fetch all categories
   */
  const fetchCategories = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const queryParams = new URLSearchParams()
      queryParams.append('locale', currentLocale.value)
      queryParams.append('includeProductCount', 'true')

      const response = await $fetch<CategoriesApiResponse>(`/api/categories?${queryParams.toString()}`)
      categories.value = response.categories

    } catch (err) {
      console.error('Error fetching categories:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch categories'
      categories.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get category by slug
   */
  const getCategoryBySlug = (slug: string): CategoryWithChildren | undefined => {
    const findInCategories = (cats: CategoryWithChildren[]): CategoryWithChildren | undefined => {
      for (const category of cats) {
        if (category.slug === slug) {
          return category
        }
        if (category.children) {
          const found = findInCategories(category.children)
          if (found) return found
        }
      }
      return undefined
    }

    return findInCategories(categories.value)
  }

  /**
   * Get category by ID
   */
  const getCategoryById = (id: number): CategoryWithChildren | undefined => {
    const findInCategories = (cats: CategoryWithChildren[]): CategoryWithChildren | undefined => {
      for (const category of cats) {
        if (category.id === id) {
          return category
        }
        if (category.children) {
          const found = findInCategories(category.children)
          if (found) return found
        }
      }
      return undefined
    }

    return findInCategories(categories.value)
  }

  /**
   * Get root categories (no parent)
   */
  const getRootCategories = computed((): CategoryWithChildren[] => {
    return categories.value.filter(category => !category.parentId)
  })

  /**
   * Get children of a specific category
   */
  const getCategoryChildren = (categoryId: number): CategoryWithChildren[] => {
    return categories.value.filter(category => category.parentId === categoryId)
  }

  /**
   * Get category breadcrumbs
   */
  const getCategoryBreadcrumbs = (category: CategoryWithChildren): Array<{ name: string; slug: string; url: string }> => {
    return buildCategoryBreadcrumbs(category, categories.value, currentLocale.value)
  }

  /**
   * Get localized category name
   */
  const getCategoryName = (category: CategoryWithChildren): string => {
    return getLocalizedText(category.nameTranslations, currentLocale.value)
  }

  /**
   * Get localized category description
   */
  const getCategoryDescription = (category: CategoryWithChildren): string => {
    return getLocalizedText(category.descriptionTranslations, currentLocale.value)
  }

  /**
   * Get category tree structure for navigation
   */
  const getCategoryTree = computed((): CategoryWithChildren[] => {
    const buildTree = (parentId?: number): CategoryWithChildren[] => {
      return categories.value
        .filter(category => category.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(category => ({
          ...category,
          children: buildTree(category.id)
        }))
    }

    return buildTree()
  })

  /**
   * Get flattened list of all categories
   */
  const getFlatCategories = computed((): CategoryWithChildren[] => {
    const flatten = (cats: CategoryWithChildren[]): CategoryWithChildren[] => {
      const result: CategoryWithChildren[] = []
      
      for (const category of cats) {
        result.push(category)
        if (category.children) {
          result.push(...flatten(category.children))
        }
      }
      
      return result
    }

    return flatten(categories.value)
  })

  /**
   * Search categories by name
   */
  const searchCategories = (query: string): CategoryWithChildren[] => {
    if (!query.trim()) return []

    const searchTerm = query.toLowerCase()
    
    return getFlatCategories.value.filter(category => {
      const name = getCategoryName(category).toLowerCase()
      const description = getCategoryDescription(category).toLowerCase()
      
      return name.includes(searchTerm) || description.includes(searchTerm)
    })
  }

  /**
   * Get categories with products
   */
  const getCategoriesWithProducts = computed((): CategoryWithChildren[] => {
    return getFlatCategories.value.filter(category => category.productCount > 0)
  })

  /**
   * Get category path (array of parent categories)
   */
  const getCategoryPath = (category: CategoryWithChildren): CategoryWithChildren[] => {
    const path: CategoryWithChildren[] = []
    let current: CategoryWithChildren | undefined = category

    while (current) {
      path.unshift(current)
      current = current.parentId ? getCategoryById(current.parentId) : undefined
    }

    return path
  }

  /**
   * Check if category has children
   */
  const hasChildren = (category: CategoryWithChildren): boolean => {
    return Boolean(category.children && category.children.length > 0)
  }

  /**
   * Get category depth level
   */
  const getCategoryDepth = (category: CategoryWithChildren): number => {
    let depth = 0
    let current: CategoryWithChildren | undefined = category

    while (current?.parentId) {
      depth++
      current = getCategoryById(current.parentId)
    }

    return depth
  }

  return {
    // State
    categories: readonly(categories),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    rootCategories: getRootCategories,
    categoryTree: getCategoryTree,
    flatCategories: getFlatCategories,
    categoriesWithProducts: getCategoriesWithProducts,
    
    // Actions
    fetchCategories,
    
    // Getters
    getCategoryBySlug,
    getCategoryById,
    getCategoryChildren,
    getCategoryBreadcrumbs,
    getCategoryName,
    getCategoryDescription,
    searchCategories,
    getCategoryPath,
    hasChildren,
    getCategoryDepth
  }
}