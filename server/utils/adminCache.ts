/**
 * Admin Cache Management Utilities
 *
 * Provides cache invalidation and management for admin endpoints.
 * These utilities ensure data consistency when admin operations modify data.
 */

type CacheScope = 'stats' | 'products' | 'orders' | 'users' | 'analytics' | 'audit-logs' | 'email-logs' | 'inventory' | 'all'

/**
 * Cache key patterns for different admin scopes
 */
const CACHE_KEY_PATTERNS = {
  stats: ['admin-dashboard-stats', 'admin-stats'],
  products: ['admin-products-list', 'admin-product-'],
  orders: ['admin-orders-list', 'admin-order-'],
  users: ['admin-users-list', 'admin-user-'],
  analytics: ['admin-analytics-overview', 'admin-analytics-users', 'admin-analytics-products'],
  'audit-logs': ['admin-audit-logs'],
  'email-logs': ['admin-email-logs'],
  inventory: ['admin-inventory-reports', 'admin-inventory-movements'],
  all: ['admin-']
} as const

/**
 * Invalidate admin cache for specific scope or all admin caches
 *
 * @param scope - The scope of cache to invalidate
 * @returns Promise<void>
 *
 * @example
 * // After updating a product
 * await invalidateAdminCache('products')
 *
 * // After bulk operations affecting multiple areas
 * await invalidateAdminCache('all')
 */
export async function invalidateAdminCache(scope: CacheScope): Promise<void> {
  try {
    const storage = useStorage('cache')

    // Get all keys to invalidate for this scope
    const keysToInvalidate = scope === 'all'
      ? CACHE_KEY_PATTERNS.all
      : CACHE_KEY_PATTERNS[scope] || []

    // Remove each cache key
    for (const keyPattern of keysToInvalidate) {
      // If key pattern ends with '-', it's a prefix pattern
      if (keyPattern.endsWith('-')) {
        // Get all keys and remove those matching the prefix
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

    console.log(`[Cache] Invalidated admin cache for scope: ${scope}`)
  } catch (error) {
    console.error(`[Cache] Failed to invalidate cache for scope ${scope}:`, error)
    // Don't throw - cache invalidation failures shouldn't break the app
  }
}

/**
 * Invalidate multiple cache scopes at once
 *
 * @param scopes - Array of scopes to invalidate
 *
 * @example
 * // After creating an order (affects orders and stats)
 * await invalidateMultipleScopes(['orders', 'stats'])
 */
export async function invalidateMultipleScopes(scopes: CacheScope[]): Promise<void> {
  await Promise.all(scopes.map(scope => invalidateAdminCache(scope)))
}

/**
 * Generate a cache key for admin endpoints
 * Includes query parameters to ensure different filters/pagination have separate caches
 *
 * @param baseName - Base name for the cache key
 * @param event - The H3 event object
 * @returns Cache key string
 */
export function getAdminCacheKey(baseName: string, event: any): string {
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
 * Cache configuration for different admin endpoints
 */
export const ADMIN_CACHE_CONFIG = {
  // Dashboard endpoints - moderate caching (users expect relatively fresh data)
  dashboardStats: {
    maxAge: 60, // 60 seconds
    name: 'admin-dashboard-stats'
  },
  dashboardActivity: {
    maxAge: 30, // 30 seconds (activity should be fresher)
    name: 'admin-dashboard-activity'
  },

  // Analytics endpoints - longer caching (complex queries, less frequent changes)
  analyticsOverview: {
    maxAge: 300, // 5 minutes
    name: 'admin-analytics-overview'
  },
  analyticsUsers: {
    maxAge: 300, // 5 minutes
    name: 'admin-analytics-users'
  },
  analyticsProducts: {
    maxAge: 300, // 5 minutes
    name: 'admin-analytics-products'
  },

  // Listing endpoints - short caching (data changes frequently)
  productsList: {
    maxAge: 60, // 60 seconds
    name: 'admin-products-list'
  },
  ordersList: {
    maxAge: 30, // 30 seconds (orders change frequently)
    name: 'admin-orders-list'
  },
  usersList: {
    maxAge: 60, // 60 seconds
    name: 'admin-users-list'
  },

  // Audit/logs endpoints - longer caching (historical data, append-only)
  auditLogs: {
    maxAge: 120, // 2 minutes
    name: 'admin-audit-logs'
  },
  emailLogs: {
    maxAge: 120, // 2 minutes
    name: 'admin-email-logs'
  },

  // Inventory endpoints - moderate caching
  inventoryReports: {
    maxAge: 120, // 2 minutes
    name: 'admin-inventory-reports'
  },
  inventoryMovements: {
    maxAge: 60, // 60 seconds
    name: 'admin-inventory-movements'
  },

  // General stats endpoint
  stats: {
    maxAge: 60, // 60 seconds
    name: 'admin-stats'
  }
} as const
