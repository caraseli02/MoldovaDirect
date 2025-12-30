/**
 * Products Page Constants
 *
 * Centralized constants to eliminate magic numbers and improve code maintainability.
 * These constants define product listing behavior, UI limits, and performance thresholds.
 */

export const PRODUCTS = {
  // Pagination
  DEFAULT_PER_PAGE: 12,
  VIRTUAL_SCROLL_THRESHOLD: 20, // Activate virtual scrolling when items exceed this count

  // UI Limits
  SKELETON_CARD_COUNT: 8, // Number of skeleton cards to show while loading
  MAX_VISIBLE_PAGES: 7, // Maximum pagination buttons to display
  MAX_VISIBLE_TAGS: 2, // Maximum product tags to show on cards

  // Touch Targets (Accessibility)
  MIN_TOUCH_TARGET_SIZE: 44, // Minimum touch target size in pixels (WCAG 2.1)

  // Business Rules
  NEW_PRODUCT_DAYS: 30, // Days to consider a product "new"
  MAX_CART_QUANTITY: 10, // Maximum quantity per product in cart
  LOW_STOCK_THRESHOLD: 5, // Show "low stock" warning below this count

  // Performance
  SEARCH_DEBOUNCE_MS: 300, // Debounce delay for search input
  IMAGE_LAZY_LOAD_THRESHOLD: 4, // First N products load eagerly, rest lazy

  // Price Range
  DEFAULT_PRICE_MIN: 0,
  DEFAULT_PRICE_MAX: 200,

  // Cache/Revalidation
  CACHE_TTL_SECONDS: 3600, // 1 hour SWR cache
  RECENTLY_VIEWED_MAX: 4, // Maximum recently viewed products to show
} as const

/**
 * Product Sort Options
 * Maps to API sort parameters
 */
export const PRODUCT_SORT_OPTIONS = {
  CREATED: 'created',
  NAME: 'name',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  FEATURED: 'featured',
} as const

/**
 * Discovery Collection IDs
 * Pre-defined filter combinations for quick browsing
 */
export const DISCOVERY_COLLECTIONS = {
  CELEBRATION: 'featured',
  WEEKNIGHT: 'weekday',
  GIFTS: 'gifts',
  CELLAR: 'cellar',
} as const

// Type exports for TypeScript - derived types for external use
/** @public */
export type ProductSortOption = typeof PRODUCT_SORT_OPTIONS[keyof typeof PRODUCT_SORT_OPTIONS]
/** @public */
export type DiscoveryCollectionId = typeof DISCOVERY_COLLECTIONS[keyof typeof DISCOVERY_COLLECTIONS]
