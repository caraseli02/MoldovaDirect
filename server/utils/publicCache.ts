import type { H3Event } from 'h3'
/**
 * Public API Cache Management Utilities
 *
 * Provides cache configuration and invalidation for customer-facing endpoints.
 * These utilities optimize performance for high-traffic public routes.
 */

type PublicCacheScope = 'products' | 'categories' | 'search' | 'landing' | 'all'

/**
 * Cache key patterns for different public scopes
 */
const PUBLIC_CACHE_KEY_PATTERNS = {
  products: ['public-products-', 'public-featured-products', 'public-price-range'],
  categories: ['public-categories-'],
  search: ['public-search-'],
  landing: ['public-landing-'],
  all: ['public-'],
} as const

/**
 * Invalidate public cache for specific scope or all public caches
 *
 * @param scope - The scope of cache to invalidate
 *
 * @example
 * // After updating a product (called from admin mutations)
 * await invalidatePublicCache('products')
 */
export async function invalidatePublicCache(scope: PublicCacheScope): Promise<void> {
  try {
    const storage = useStorage('cache')

    const keysToInvalidate = scope === 'all'
      ? PUBLIC_CACHE_KEY_PATTERNS.all
      : PUBLIC_CACHE_KEY_PATTERNS[scope] || []

    for (const keyPattern of keysToInvalidate) {
      if (keyPattern.endsWith('-')) {
        // Prefix pattern - remove all matching keys
        const allKeys = await storage.getKeys()
        const matchingKeys = allKeys.filter(key => key.startsWith(keyPattern))

        for (const key of matchingKeys) {
          await storage.removeItem(key)
        }
      }
      else {
        // Direct key removal
        await storage.removeItem(keyPattern)
      }
    }
  }
  catch (error: unknown) {
    console.error(`[Cache] Failed to invalidate public cache for scope ${scope}:`, getServerErrorMessage(error))
  }
}

/**
 * Generate a cache key for public endpoints with query parameters
 *
 * @param baseName - Base name for the cache key
 * @param event - The H3 event object
 * @returns Cache key string
 */
export function getPublicCacheKey(baseName: string, event: H3Event): string {
  const query = getQuery(event)

  // Convert query params to a stable sorted string
  const queryKeys = Object.keys(query).sort()
  const queryString = queryKeys
    .map(key => `${key}=${query[key]}`)
    .join('&')

  return queryString
    ? `${baseName}?${queryString}`
    : baseName
}

/**
 * Cache configuration for public endpoints
 * Longer cache times than admin routes since public data changes less frequently
 */
export const PUBLIC_CACHE_CONFIG = {
  // Products endpoints - moderate caching
  productsList: {
    maxAge: 300, // 5 minutes
    name: 'public-products-list',
  },
  productDetail: {
    maxAge: 600, // 10 minutes
    name: 'public-product-detail',
  },
  featuredProducts: {
    maxAge: 300, // 5 minutes
    name: 'public-featured-products',
  },
  relatedProducts: {
    maxAge: 600, // 10 minutes
    name: 'public-related-products',
  },
  priceRange: {
    maxAge: 300, // 5 minutes
    name: 'public-price-range',
  },

  // Categories - longer caching (rarely change)
  categoriesList: {
    maxAge: 600, // 10 minutes
    name: 'public-categories-list',
  },
  categoryDetail: {
    maxAge: 600, // 10 minutes
    name: 'public-category-detail',
  },

  // Search - short caching (user-specific queries)
  search: {
    maxAge: 180, // 3 minutes
    name: 'public-search',
  },

  // Landing sections - longer caching (admin managed)
  landingSections: {
    maxAge: 600, // 10 minutes
    name: 'public-landing-sections',
  },
} as const
