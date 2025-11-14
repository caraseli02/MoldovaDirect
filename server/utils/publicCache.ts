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
  all: ['public-']
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
      } else {
        // Direct key removal
        await storage.removeItem(keyPattern)
      }
    }

    console.log(`[Cache] Invalidated public cache for scope: ${scope}`)
  } catch (error) {
    console.error(`[Cache] Failed to invalidate public cache for scope ${scope}:`, error)
  }
}

/**
 * Generate a cache key for public endpoints with query parameters
 *
 * @param baseName - Base name for the cache key
 * @param event - The H3 event object
 * @returns Cache key string
 */
export function getPublicCacheKey(baseName: string, event: any): string {
  try {
    // Handle ISR context where event might be undefined or malformed
    if (!event || !event.node || !event.node.req) {
      console.warn('[Cache] Invalid event context for cache key, using base name')
      return baseName
    }

    const query = getQuery(event)

    // Validate query is an object
    if (!query || typeof query !== 'object' || Array.isArray(query)) {
      return baseName
    }

    const queryKeys = Object.keys(query).sort()

    // Skip empty or invalid queries
    if (queryKeys.length === 0) {
      return baseName
    }

    const queryString = queryKeys
      .map(key => {
        const value = query[key]

        // Skip undefined/null values
        if (value === undefined || value === null) {
          return null
        }

        // Handle different value types safely
        let stringValue: string
        try {
          if (Array.isArray(value)) {
            stringValue = value.join(',')
          } else if (typeof value === 'object') {
            stringValue = JSON.stringify(value)
          } else {
            stringValue = String(value)
          }

          // URL encode to handle special characters
          return `${key}=${encodeURIComponent(stringValue)}`
        } catch (e) {
          console.warn(`[Cache] Failed to serialize query param ${key}:`, e)
          return null
        }
      })
      .filter(Boolean) // Remove null entries
      .join('&')

    return queryString ? `${baseName}?${queryString}` : baseName
  } catch (error) {
    console.error('[Cache] Error generating cache key:', error)
    // Always return a valid key, even if it's just the base name
    return baseName
  }
}

/**
 * Cache configuration for public endpoints
 * Longer cache times than admin routes since public data changes less frequently
 */
export const PUBLIC_CACHE_CONFIG = {
  // Products endpoints - moderate caching
  productsList: {
    maxAge: 300, // 5 minutes
    name: 'public-products-list'
  },
  productDetail: {
    maxAge: 600, // 10 minutes
    name: 'public-product-detail'
  },
  featuredProducts: {
    maxAge: 300, // 5 minutes
    name: 'public-featured-products'
  },
  relatedProducts: {
    maxAge: 600, // 10 minutes
    name: 'public-related-products'
  },
  priceRange: {
    maxAge: 300, // 5 minutes
    name: 'public-price-range'
  },

  // Categories - longer caching (rarely change)
  categoriesList: {
    maxAge: 600, // 10 minutes
    name: 'public-categories-list'
  },
  categoryDetail: {
    maxAge: 600, // 10 minutes
    name: 'public-category-detail'
  },

  // Search - short caching (user-specific queries)
  search: {
    maxAge: 180, // 3 minutes
    name: 'public-search'
  },

  // Landing sections - longer caching (admin managed)
  landingSections: {
    maxAge: 600, // 10 minutes
    name: 'public-landing-sections'
  }
} as const
