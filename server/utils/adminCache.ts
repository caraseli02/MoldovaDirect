/**
 * Admin Cache Management Utilities
 *
 * Provides cache invalidation and management for admin endpoints.
 * These utilities ensure data consistency when admin operations modify data.
 */

import type { H3Event } from 'h3'
import { getQuery } from 'h3'
import { useStorage } from '#nitro'
import { serverSupabaseClient } from '#supabase/server'

type CacheScope = 'stats' | 'products' | 'orders' | 'users' | 'analytics' | 'audit-logs' | 'email-logs' | 'inventory' | 'all'

/**
 * Cache key patterns for different admin scopes
 */
const CACHE_KEY_PATTERNS = {
  'stats': ['admin-dashboard-stats', 'admin-stats'],
  'products': ['admin-products-list', 'admin-product-'],
  'orders': ['admin-orders-list', 'admin-order-'],
  'users': ['admin-users-list', 'admin-user-'],
  'analytics': ['admin-analytics-overview', 'admin-analytics-users', 'admin-analytics-products'],
  'audit-logs': ['admin-audit-logs'],
  'email-logs': ['admin-email-logs'],
  'inventory': ['admin-inventory-reports', 'admin-inventory-movements'],
  'all': ['admin-'],
} as const

/**
 * Cache invalidation result with error tracking
 */
export interface CacheInvalidationResult {
  success: boolean
  scope: CacheScope
  keysInvalidated?: number
  error?: string
}

/**
 * Invalidate admin cache for specific scope or all admin caches
 *
 * Returns result so callers can warn users about potential stale data issues.
 *
 * @param scope - The scope of cache to invalidate
 * @returns Promise<CacheInvalidationResult> - Success status and details
 *
 * @example
 * // After updating a product
 * const result = await invalidateAdminCache('products')
 * if (!result.success) {
 *   console.warn('Cache invalidation failed - data may be stale', result.error)
 * }
 *
 * // After bulk operations affecting multiple areas
 * await invalidateAdminCache('all')
 */
export async function invalidateAdminCache(scope: CacheScope): Promise<CacheInvalidationResult> {
  try {
    const storage = useStorage('cache')
    let keysInvalidated = 0

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
          keysInvalidated++
        }
      }
      else {
        // Direct key removal
        await storage.removeItem(keyPattern)
        keysInvalidated++
      }
    }

    console.log(`[Cache] Invalidated admin cache for scope: ${scope} (${keysInvalidated} keys)`)
    return {
      success: true,
      scope,
      keysInvalidated,
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[Cache] Failed to invalidate cache for scope ${scope}:`, error)
    return {
      success: false,
      scope,
      error: errorMessage,
    }
  }
}

/**
 * Invalidate multiple cache scopes at once
 *
 * Returns aggregated results for all scopes.
 *
 * @param scopes - Array of scopes to invalidate
 * @returns Promise<CacheInvalidationResult[]> - Array of results for each scope
 *
 * @example
 * // After creating an order (affects orders and stats)
 * const results = await invalidateMultipleScopes(['orders', 'stats'])
 * const failed = results.filter(r => !r.success)
 * if (failed.length > 0) {
 *   console.warn('Some cache scopes failed to invalidate:', failed)
 * }
 */
export async function invalidateMultipleScopes(scopes: CacheScope[]): Promise<CacheInvalidationResult[]> {
  return await Promise.all(scopes.map(scope => invalidateAdminCache(scope)))
}

/**
 * Allowed query parameter keys for cache key generation
 * Only these parameters will be included in cache keys
 */
const ALLOWED_QUERY_PARAMS = [
  'page', 'limit', 'search', 'status', 'payment_status',
  'date_from', 'date_to', 'amount_min', 'amount_max',
  'priority', 'sort_by', 'order', 'category', 'brand',
  'in_stock', 'featured', 'period', 'role', 'email_verified',
]

/**
 * Maximum length for query parameter values
 */
const MAX_QUERY_VALUE_LENGTH = 200

/**
 * Sanitize a query parameter value for use in cache keys
 * Removes special characters that could cause issues
 *
 * @param value - The query parameter value
 * @returns Sanitized value
 */
function sanitizeQueryValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // Validate length
  if (stringValue.length > MAX_QUERY_VALUE_LENGTH) {
    return stringValue.substring(0, MAX_QUERY_VALUE_LENGTH)
  }

  // Remove characters that could cause issues in cache keys
  // Security: Remove special chars while preserving legitimate search terms
  return stringValue
    .replace(/[^a-zA-Z0-9\-_. +]/g, '') // Remove special chars, keep hyphen, underscore, dot, space, plus
    .replace(/\.{2,}/g, '') // Remove multiple consecutive dots (path traversal: ../)
    .replace(/^\.*|\.*$/g, '') // Remove leading/trailing dots
    .trim() // Remove leading/trailing whitespace
}

/**
 * Generate a cache key for admin endpoints
 * Includes query parameters to ensure different filters/pagination have separate caches
 *
 * Note: Does not include user ID to keep cache key generation synchronous.
 * Authentication is handled by requireAdminRole() in the handler, which runs
 * BEFORE serving cached content.
 *
 * Security features:
 * - Whitelists allowed query parameters
 * - Validates and truncates query value lengths
 * - Sanitizes query values to prevent injection
 *
 * @param baseName - Base name for the cache key
 * @param event - The H3 event object
 * @returns Cache key string
 */
export function getAdminCacheKey(baseName: string, event: H3Event): string {
  const query = getQuery(event)

  // Filter to only allowed query parameters and sanitize values
  const queryKeys = Object.keys(query)
    .filter(key => ALLOWED_QUERY_PARAMS.includes(key))
    .sort()

  const queryString = queryKeys
    .map(key => `${key}=${sanitizeQueryValue(query[key])}`)
    .filter(param => !param.endsWith('=')) // Remove empty params
    .join('&')

  const fullKey = queryString
    ? `${baseName}?${queryString}`
    : baseName

  return fullKey
}

/**
 * Cache configuration for different admin endpoints
 */
export const ADMIN_CACHE_CONFIG = {
  // Dashboard endpoints - moderate caching (users expect relatively fresh data)
  dashboardStats: {
    maxAge: 60, // 60 seconds
    name: 'admin-dashboard-stats',
  },
  dashboardActivity: {
    maxAge: 30, // 30 seconds (activity should be fresher)
    name: 'admin-dashboard-activity',
  },

  // Analytics endpoints - longer caching (complex queries, less frequent changes)
  analyticsOverview: {
    maxAge: 300, // 5 minutes
    name: 'admin-analytics-overview',
  },
  analyticsUsers: {
    maxAge: 300, // 5 minutes
    name: 'admin-analytics-users',
  },
  analyticsProducts: {
    maxAge: 300, // 5 minutes
    name: 'admin-analytics-products',
  },

  // Listing endpoints - short caching (data changes frequently)
  productsList: {
    maxAge: 60, // 60 seconds
    name: 'admin-products-list',
  },
  ordersList: {
    maxAge: 30, // 30 seconds (orders change frequently)
    name: 'admin-orders-list',
  },
  usersList: {
    maxAge: 60, // 60 seconds
    name: 'admin-users-list',
  },

  // Audit/logs endpoints - longer caching (historical data, append-only)
  auditLogs: {
    maxAge: 120, // 2 minutes
    name: 'admin-audit-logs',
  },
  emailLogs: {
    maxAge: 120, // 2 minutes
    name: 'admin-email-logs',
  },

  // Inventory endpoints - moderate caching
  inventoryReports: {
    maxAge: 120, // 2 minutes
    name: 'admin-inventory-reports',
  },
  inventoryMovements: {
    maxAge: 60, // 60 seconds
    name: 'admin-inventory-movements',
  },

  // General stats endpoint
  stats: {
    maxAge: 60, // 60 seconds
    name: 'admin-stats',
  },
} as const
