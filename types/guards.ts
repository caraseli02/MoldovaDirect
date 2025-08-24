// Type guards and validation utilities for Moldova Direct
// These functions help with runtime type checking and validation

import type {
  Product,
  ProductWithRelations,
  Category,
  CategoryWithChildren,
  ProductFilters,
  Translations,
  StockStatus,
  LanguageCode,
  ProductSortOption
} from './index'

// =============================================
// TYPE GUARDS
// =============================================

/**
 * Check if a value is a valid translations object
 */
export function isTranslations(value: any): value is Translations {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.es === 'string' &&
    typeof value.en === 'string' &&
    (value.ro === undefined || typeof value.ro === 'string') &&
    (value.ru === undefined || typeof value.ru === 'string')
  )
}

/**
 * Check if a value is a valid Product
 */
export function isProduct(value: any): value is Product {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'number' &&
    typeof value.sku === 'string' &&
    typeof value.categoryId === 'number' &&
    isTranslations(value.nameTranslations) &&
    typeof value.priceEur === 'number' &&
    typeof value.stockQuantity === 'number' &&
    typeof value.isActive === 'boolean'
  )
}

/**
 * Check if a value is a ProductWithRelations
 */
export function isProductWithRelations(value: any): value is ProductWithRelations {
  return (
    isProduct(value) &&
    typeof value.category === 'object' &&
    Array.isArray(value.images) &&
    typeof value.stockStatus === 'string' &&
    ['in_stock', 'low_stock', 'out_of_stock'].includes(value.stockStatus)
  )
}

/**
 * Check if a value is a valid Category
 */
export function isCategory(value: any): value is Category {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'number' &&
    typeof value.slug === 'string' &&
    isTranslations(value.nameTranslations) &&
    typeof value.sortOrder === 'number' &&
    typeof value.isActive === 'boolean'
  )
}

/**
 * Check if a value is a CategoryWithChildren
 */
export function isCategoryWithChildren(value: any): value is CategoryWithChildren {
  return (
    isCategory(value) &&
    typeof value.productCount === 'number' &&
    (value.children === undefined || Array.isArray(value.children))
  )
}

/**
 * Check if a value is a valid language code
 */
export function isLanguageCode(value: any): value is LanguageCode {
  return typeof value === 'string' && ['es', 'en', 'ro', 'ru'].includes(value)
}

/**
 * Check if a value is a valid product sort option
 */
export function isProductSortOption(value: any): value is ProductSortOption {
  return typeof value === 'string' && 
    ['name', 'price_asc', 'price_desc', 'newest', 'featured', 'created'].includes(value)
}

/**
 * Check if a value is a valid stock status
 */
export function isStockStatus(value: any): value is StockStatus {
  return typeof value === 'string' && 
    ['in_stock', 'low_stock', 'out_of_stock'].includes(value)
}

/**
 * Check if a value is valid ProductFilters
 */
export function isProductFilters(value: any): value is ProductFilters {
  if (typeof value !== 'object' || value === null) return false
  
  const filters = value as ProductFilters
  
  return (
    (filters.category === undefined || typeof filters.category === 'string' || typeof filters.category === 'number') &&
    (filters.search === undefined || typeof filters.search === 'string') &&
    (filters.priceMin === undefined || typeof filters.priceMin === 'number') &&
    (filters.priceMax === undefined || typeof filters.priceMax === 'number') &&
    (filters.inStock === undefined || typeof filters.inStock === 'boolean') &&
    (filters.featured === undefined || typeof filters.featured === 'boolean') &&
    (filters.sort === undefined || isProductSortOption(filters.sort)) &&
    (filters.page === undefined || typeof filters.page === 'number') &&
    (filters.limit === undefined || typeof filters.limit === 'number')
  )
}

// =============================================
// VALIDATION FUNCTIONS
// =============================================

/**
 * Validate product data for creation/update
 */
export function validateProduct(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.sku || typeof data.sku !== 'string') {
    errors.push('SKU is required and must be a string')
  }
  
  if (!data.nameTranslations || !isTranslations(data.nameTranslations)) {
    errors.push('Name translations are required and must include Spanish and English')
  }
  
  if (typeof data.priceEur !== 'number' || data.priceEur < 0) {
    errors.push('Price must be a positive number')
  }
  
  if (typeof data.stockQuantity !== 'number' || data.stockQuantity < 0) {
    errors.push('Stock quantity must be a non-negative number')
  }
  
  if (typeof data.categoryId !== 'number') {
    errors.push('Category ID is required and must be a number')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate category data for creation/update
 */
export function validateCategory(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.slug || typeof data.slug !== 'string') {
    errors.push('Slug is required and must be a string')
  }
  
  if (!data.nameTranslations || !isTranslations(data.nameTranslations)) {
    errors.push('Name translations are required and must include Spanish and English')
  }
  
  if (typeof data.sortOrder !== 'number') {
    errors.push('Sort order must be a number')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate product filters
 */
export function validateProductFilters(filters: any): ProductFilters {
  const validated: ProductFilters = {}
  
  if (filters.category && (typeof filters.category === 'string' || typeof filters.category === 'number')) {
    validated.category = filters.category
  }
  
  if (filters.search && typeof filters.search === 'string') {
    validated.search = filters.search.trim()
  }
  
  if (typeof filters.priceMin === 'number' && filters.priceMin >= 0) {
    validated.priceMin = filters.priceMin
  }
  
  if (typeof filters.priceMax === 'number' && filters.priceMax >= 0) {
    validated.priceMax = filters.priceMax
  }
  
  if (typeof filters.inStock === 'boolean') {
    validated.inStock = filters.inStock
  }
  
  if (typeof filters.featured === 'boolean') {
    validated.featured = filters.featured
  }
  
  if (filters.sort && isProductSortOption(filters.sort)) {
    validated.sort = filters.sort
  }
  
  if (typeof filters.page === 'number' && filters.page > 0) {
    validated.page = filters.page
  }
  
  if (typeof filters.limit === 'number' && filters.limit > 0 && filters.limit <= 100) {
    validated.limit = filters.limit
  }
  
  return validated
}

// =============================================
// TRANSFORMATION FUNCTIONS
// =============================================

/**
 * Transform a raw product from database to ProductWithRelations
 */
export function transformProduct(rawProduct: any, locale: LanguageCode = 'es'): ProductWithRelations | null {
  if (!isProduct(rawProduct)) return null
  
  const stockStatus: StockStatus = 
    rawProduct.stockQuantity <= 0 ? 'out_of_stock' :
    rawProduct.stockQuantity <= rawProduct.lowStockThreshold ? 'low_stock' :
    'in_stock'
  
  return {
    ...rawProduct,
    name: rawProduct.nameTranslations,
    description: rawProduct.descriptionTranslations,
    shortDescription: rawProduct.shortDescriptionTranslations,
    price: rawProduct.priceEur,
    comparePrice: rawProduct.compareAtPriceEur,
    slug: rawProduct.slug || `product-${rawProduct.id}`,
    stockStatus,
    formattedPrice: formatPrice(rawProduct.priceEur),
    primaryImage: rawProduct.images?.find((img: any) => img.isPrimary) || rawProduct.images?.[0],
    images: rawProduct.images || [],
    category: rawProduct.category || { id: rawProduct.categoryId, name: { es: 'Sin categoría', en: 'No category' } }
  } as ProductWithRelations
}

/**
 * Get localized text from translations object
 */
export function getLocalizedText(
  translations: Translations | null | undefined, 
  locale: LanguageCode = 'es'
): string {
  if (!translations || !isTranslations(translations)) return ''
  
  // Try requested locale
  if (translations[locale]) return translations[locale]
  
  // Try Spanish as default
  if (translations.es) return translations.es
  
  // Try English as fallback
  if (translations.en) return translations.en
  
  // Return first available translation
  return Object.values(translations)[0] || ''
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = '€'): string {
  return `${currency}${price.toFixed(2)}`
}

/**
 * Calculate stock status based on quantity and threshold
 */
export function calculateStockStatus(quantity: number, threshold: number = 5): StockStatus {
  if (quantity <= 0) return 'out_of_stock'
  if (quantity <= threshold) return 'low_stock'
  return 'in_stock'
}

/**
 * Generate product slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 100) // Limit length
}

/**
 * Build breadcrumbs for category navigation
 */
export function buildCategoryBreadcrumbs(
  category: CategoryWithChildren,
  categories: CategoryWithChildren[],
  locale: LanguageCode = 'es'
): Array<{ name: string; slug: string; url: string }> {
  const breadcrumbs: Array<{ name: string; slug: string; url: string }> = []
  
  let current: CategoryWithChildren | undefined = category
  
  while (current) {
    breadcrumbs.unshift({
      name: getLocalizedText(current.nameTranslations, locale),
      slug: current.slug,
      url: `/categories/${current.slug}`
    })
    
    current = current.parentId 
      ? categories.find(cat => cat.id === current!.parentId)
      : undefined
  }
  
  return breadcrumbs
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Deep clone an object (for immutable updates)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T
  
  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}