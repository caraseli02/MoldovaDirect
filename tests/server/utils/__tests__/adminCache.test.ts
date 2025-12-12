/**
 * Admin Cache Management Utilities Tests
 *
 * Comprehensive tests covering:
 * - Cache key generation with query parameters
 * - Query parameter sanitization and validation
 * - Query parameter whitelisting
 * - Cache invalidation (single and multiple scopes)
 * - Security features (injection prevention, length limits)
 * - Error handling and edge cases
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { H3Event } from 'h3'

// Import mocked modules
import { getQuery } from 'h3'
import { useStorage } from '#nitro'

// Import the module under test
import {
  getAdminCacheKey,
  invalidateAdminCache,
  invalidateMultipleScopes,
} from '../../../../server/utils/adminCache'

// Mock h3 before importing modules that use it
vi.mock('h3', async () => {
  return {
    getQuery: vi.fn(() => ({})),
    getCookie: vi.fn(),
    getHeader: vi.fn(),
    getRequestIP: vi.fn(() => '127.0.0.1'),
    createError: vi.fn((error: any) => {
      const err = new Error(error.statusMessage || error.message) as unknown
      err.statusCode = error.statusCode
      err.statusMessage = error.statusMessage
      return err
    }),
  }
})

// Mock #nitro before importing modules that use it
vi.mock('#nitro', async () => {
  return {
    useStorage: vi.fn(() => ({
      getKeys: vi.fn().mockResolvedValue([]),
      removeItem: vi.fn().mockResolvedValue(undefined),
      getItem: vi.fn().mockResolvedValue(null),
      setItem: vi.fn().mockResolvedValue(undefined),
    })),
  }
})

// Get the mock function for manipulation in tests
const mockGetQuery = getQuery as ReturnType<typeof vi.fn>
const mockUseStorage = useStorage as ReturnType<typeof vi.fn>

// Type for H3Event (simplified for testing)
type H3Event = unknown

describe('adminCache', () => {
  let mockEvent: Partial<H3Event>
  let mockStorage: any

  beforeEach(() => {
    // Setup mock H3Event
    mockEvent = {} as H3Event

    // Setup mock storage
    mockStorage = {
      getKeys: vi.fn(),
      removeItem: vi.fn(),
      getItem: vi.fn(),
      setItem: vi.fn(),
    }

    // Setup useStorage mock
    mockUseStorage.mockReturnValue(mockStorage)

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getAdminCacheKey', () => {
    describe('Basic cache key generation', () => {
      it('should generate key with baseName only when no query params', () => {
        mockGetQuery.mockReturnValue({})

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toBe('admin-products-list')
      })

      it('should generate key with baseName and single query param', () => {
        mockGetQuery.mockReturnValue({ page: '1' })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toBe('admin-products-list?page=1')
      })

      it('should generate key with baseName and multiple query params', () => {
        mockGetQuery.mockReturnValue({
          page: '1',
          limit: '10',
          search: 'wine',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toBe('admin-products-list?limit=10&page=1&search=wine')
      })
    })

    describe('Query parameter consistency', () => {
      it('should generate consistent keys for same params in different order', () => {
        const params1 = { page: '1', limit: '10', search: 'wine' }
        const params2 = { search: 'wine', page: '1', limit: '10' }

        mockGetQuery.mockReturnValueOnce(params1)
        const key1 = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        mockGetQuery.mockReturnValueOnce(params2)
        const key2 = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key1).toBe(key2)
        expect(key1).toBe('admin-products-list?limit=10&page=1&search=wine')
      })

      it('should sort query parameters alphabetically', () => {
        mockGetQuery.mockReturnValue({
          status: 'active',
          category: 'wine',
          brand: 'test',
          page: '1',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toBe('admin-products-list?brand=test&category=wine&page=1&status=active')
      })
    })

    describe('Query parameter whitelisting', () => {
      it('should only include allowed query parameters', () => {
        mockGetQuery.mockReturnValue({
          page: '1',
          limit: '10',
          malicious_param: 'hack',
          unknown_param: 'value',
          search: 'wine',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toContain('page=1')
        expect(key).toContain('limit=10')
        expect(key).toContain('search=wine')
        expect(key).not.toContain('malicious_param')
        expect(key).not.toContain('unknown_param')
      })

      it('should include all allowed filter parameters', () => {
        mockGetQuery.mockReturnValue({
          status: 'active',
          payment_status: 'paid',
          date_from: '2024-01-01',
          date_to: '2024-12-31',
          amount_min: '10',
          amount_max: '100',
        })

        const key = getAdminCacheKey('admin-orders-list', mockEvent as H3Event)

        expect(key).toContain('status=active')
        expect(key).toContain('payment_status=paid')
        expect(key).toContain('date_from=2024-01-01')
        expect(key).toContain('date_to=2024-12-31')
        expect(key).toContain('amount_min=10')
        expect(key).toContain('amount_max=100')
      })

      it('should include sorting and categorization parameters', () => {
        mockGetQuery.mockReturnValue({
          sort_by: 'created_at',
          order: 'desc',
          category: 'wine',
          brand: 'test-brand',
          priority: 'high',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toContain('sort_by=created_at')
        expect(key).toContain('order=desc')
        expect(key).toContain('category=wine')
        expect(key).toContain('brand=test-brand')
        expect(key).toContain('priority=high')
      })

      it('should include boolean filter parameters', () => {
        mockGetQuery.mockReturnValue({
          in_stock: 'true',
          featured: 'false',
          email_verified: 'true',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toContain('in_stock=true')
        expect(key).toContain('featured=false')
        expect(key).toContain('email_verified=true')
      })
    })

    describe('Query parameter sanitization', () => {
      it('should remove special characters from query values', () => {
        mockGetQuery.mockReturnValue({
          search: 'wine<script>alert("xss")</script>',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).not.toContain('<script>')
        expect(key).not.toContain('</script>')
        expect(key).toContain('search=winescriptalertxssscript')
      })

      it('should preserve alphanumeric characters', () => {
        mockGetQuery.mockReturnValue({
          search: 'Wine123Test',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toBe('admin-products-list?search=Wine123Test')
      })

      it('should preserve allowed special characters', () => {
        mockGetQuery.mockReturnValue({
          search: 'test-name_value.com@email+tag',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toBe('admin-products-list?search=test-name_value.comemail+tag')
      })

      it('should preserve spaces in query values', () => {
        mockGetQuery.mockReturnValue({
          search: 'red wine vintage',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toBe('admin-products-list?search=red wine vintage')
      })

      it('should truncate excessively long query values', () => {
        const longValue = 'a'.repeat(250) // Exceeds MAX_QUERY_VALUE_LENGTH (200)
        mockGetQuery.mockReturnValue({
          search: longValue,
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        // Should be truncated to 200 characters
        expect(key.length).toBeLessThan('admin-products-list?search='.length + 250)
        expect(key).toContain('a'.repeat(200))
      })

      it('should handle null and undefined query values', () => {
        mockGetQuery.mockReturnValue({
          page: '1',
          search: null,
          limit: undefined,
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toBe('admin-products-list?page=1')
        expect(key).not.toContain('search')
        expect(key).not.toContain('limit')
      })

      it('should remove empty parameter values', () => {
        mockGetQuery.mockReturnValue({
          page: '1',
          search: '',
          status: 'active',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toBe('admin-products-list?page=1&status=active')
        expect(key).not.toMatch(/search=&/)
        expect(key).not.toMatch(/search=$/)
      })
    })

    describe('Security - Cache key injection prevention', () => {
      it('should prevent SQL injection attempts in query params', () => {
        mockGetQuery.mockReturnValue({
          search: '\'; DROP TABLE products; --',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        // Special characters like ';' are removed, hyphen is kept (it's in allowed chars)
        expect(key).not.toContain(';')
        // DROP and TABLE are separated by space, so '--' won't appear consecutively
        // Actual result: 'DROP TABLE products' with spaces preserved and special chars removed
        expect(key).toContain('search=DROP TABLE products')
      })

      it('should prevent cache key collision with special characters', () => {
        mockGetQuery.mockReturnValue({
          search: '?page=99&admin=true',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        // Should not create confusing query params
        expect(key).not.toContain('?page=99')
        expect(key).not.toContain('&admin=true')
        expect(key).toContain('search=page99admintrue')
      })

      it('should prevent path traversal attempts', () => {
        mockGetQuery.mockReturnValue({
          search: '../../../etc/passwd',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).not.toContain('../')
        expect(key).toContain('search=etcpasswd')
      })

      it('should prevent XSS attempts in cache keys', () => {
        mockGetQuery.mockReturnValue({
          search: '<img src=x onerror=alert(1)>',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        // Special characters like '<', '>' are removed by sanitization
        // The '=' in the query string is part of the key structure, not the sanitized value
        expect(key).not.toContain('<img')
        expect(key).not.toContain('<')
        expect(key).not.toContain('>')
        // Spaces are preserved, special chars removed (=, angles)
        expect(key).toContain('search=img srcx onerroralert1')
      })

      it('should prevent command injection attempts', () => {
        mockGetQuery.mockReturnValue({
          search: '$(rm -rf /)',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        // Special characters like '$', '(', ')', '/' are removed by sanitization
        expect(key).not.toContain('$(')
        expect(key).not.toContain(')')
        expect(key).not.toContain('$')
        // Spaces are preserved, but special chars are removed. Trailing spaces are trimmed.
        expect(key).toContain('search=rm -rf')
      })
    })
  })

  describe('invalidateAdminCache', () => {
    describe('Single scope invalidation', () => {
      it('should invalidate specific scope and return success result', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-products-list',
          'admin-product-123',
          'admin-orders-list',
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const result = await invalidateAdminCache('products')

        expect(result.success).toBe(true)
        expect(result.scope).toBe('products')
        expect(result.keysInvalidated).toBe(2)
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-products-list')
        expect(mockStorage.getKeys).toHaveBeenCalled()
      })

      it('should invalidate stats scope', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-dashboard-stats',
          'admin-stats',
          'admin-orders-list',
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const result = await invalidateAdminCache('stats')

        expect(result.success).toBe(true)
        expect(result.scope).toBe('stats')
        expect(result.keysInvalidated).toBe(2)
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-dashboard-stats')
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-stats')
      })

      it('should invalidate orders scope with prefix pattern', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-orders-list',
          'admin-order-123',
          'admin-order-456',
          'admin-products-list',
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const result = await invalidateAdminCache('orders')

        expect(result.success).toBe(true)
        expect(result.keysInvalidated).toBe(3)
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-orders-list')
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-order-123')
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-order-456')
        expect(mockStorage.removeItem).not.toHaveBeenCalledWith('admin-products-list')
      })

      it('should invalidate users scope', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-users-list',
          'admin-user-abc',
          'admin-products-list',
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const result = await invalidateAdminCache('users')

        expect(result.success).toBe(true)
        expect(result.keysInvalidated).toBe(2)
      })

      it('should invalidate analytics scope with multiple keys', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-analytics-overview',
          'admin-analytics-users',
          'admin-analytics-products',
          'admin-products-list',
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const result = await invalidateAdminCache('analytics')

        expect(result.success).toBe(true)
        expect(result.keysInvalidated).toBe(3)
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-analytics-overview')
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-analytics-users')
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-analytics-products')
      })

      it('should invalidate audit-logs scope', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-audit-logs',
          'admin-email-logs',
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const result = await invalidateAdminCache('audit-logs')

        expect(result.success).toBe(true)
        expect(result.keysInvalidated).toBe(1)
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-audit-logs')
        expect(mockStorage.removeItem).not.toHaveBeenCalledWith('admin-email-logs')
      })

      it('should invalidate email-logs scope', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-email-logs',
          'admin-audit-logs',
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const result = await invalidateAdminCache('email-logs')

        expect(result.success).toBe(true)
        expect(result.keysInvalidated).toBe(1)
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-email-logs')
      })

      it('should invalidate inventory scope', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-inventory-reports',
          'admin-inventory-movements',
          'admin-products-list',
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const result = await invalidateAdminCache('inventory')

        expect(result.success).toBe(true)
        expect(result.keysInvalidated).toBe(2)
      })
    })

    describe('All scopes invalidation', () => {
      it('should invalidate all admin cache keys', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-products-list',
          'admin-product-123',
          'admin-orders-list',
          'admin-dashboard-stats',
          'admin-users-list',
          'public-cache-key', // Should not be removed
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const result = await invalidateAdminCache('all')

        expect(result.success).toBe(true)
        expect(result.scope).toBe('all')
        expect(result.keysInvalidated).toBe(5)
        expect(mockStorage.getKeys).toHaveBeenCalled()

        // Should remove all admin- prefixed keys
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-products-list')
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-product-123')
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-orders-list')
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-dashboard-stats')
        expect(mockStorage.removeItem).toHaveBeenCalledWith('admin-users-list')

        // Should not remove non-admin keys
        expect(mockStorage.removeItem).not.toHaveBeenCalledWith('public-cache-key')
      })

      it('should handle empty cache when invalidating all', async () => {
        mockStorage.getKeys.mockResolvedValue([])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const result = await invalidateAdminCache('all')

        expect(result.success).toBe(true)
        expect(result.keysInvalidated).toBe(0)
      })
    })

    describe('Error handling', () => {
      it('should handle storage.getKeys failure gracefully', async () => {
        const error = new Error('Storage unavailable')
        mockStorage.getKeys.mockRejectedValue(error)

        const result = await invalidateAdminCache('products')

        expect(result.success).toBe(false)
        expect(result.scope).toBe('products')
        expect(result.error).toBe('Storage unavailable')
        expect(result.keysInvalidated).toBeUndefined()
      })

      it('should handle storage.removeItem failure gracefully', async () => {
        mockStorage.getKeys.mockResolvedValue(['admin-products-list'])
        mockStorage.removeItem.mockRejectedValue(new Error('Remove failed'))

        const result = await invalidateAdminCache('products')

        expect(result.success).toBe(false)
        expect(result.error).toBe('Remove failed')
      })

      it('should handle non-Error exceptions', async () => {
        mockStorage.getKeys.mockRejectedValue('String error')

        const result = await invalidateAdminCache('products')

        expect(result.success).toBe(false)
        expect(result.error).toBe('String error')
      })

      it('should continue on partial failures in prefix removal', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-product-1',
          'admin-product-2',
          'admin-product-3',
        ])

        // First two calls succeed, third fails
        mockStorage.removeItem
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce(new Error('Failed'))

        const result = await invalidateAdminCache('products')

        expect(result.success).toBe(false)
        expect(result.error).toBe('Failed')
      })
    })

    describe('Return value structure', () => {
      it('should return correct structure on success', async () => {
        mockStorage.getKeys.mockResolvedValue(['admin-products-list'])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const result = await invalidateAdminCache('products')

        expect(result).toMatchObject({
          success: true,
          scope: 'products',
          keysInvalidated: expect.any(Number),
        })
        expect(result.error).toBeUndefined()
      })

      it('should return correct structure on error', async () => {
        mockStorage.getKeys.mockRejectedValue(new Error('Test error'))

        const result = await invalidateAdminCache('products')

        expect(result).toMatchObject({
          success: false,
          scope: 'products',
          error: 'Test error',
        })
        expect(result.keysInvalidated).toBeUndefined()
      })
    })
  })

  describe('invalidateMultipleScopes', () => {
    describe('Multiple scope invalidation', () => {
      it('should invalidate multiple scopes and return all results', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-products-list',
          'admin-orders-list',
          'admin-dashboard-stats',
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const results = await invalidateMultipleScopes(['products', 'orders'])

        expect(results).toHaveLength(2)
        expect(results[0].scope).toBe('products')
        expect(results[0].success).toBe(true)
        expect(results[1].scope).toBe('orders')
        expect(results[1].success).toBe(true)
      })

      it('should invalidate orders and stats together', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-orders-list',
          'admin-dashboard-stats',
          'admin-stats',
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const results = await invalidateMultipleScopes(['orders', 'stats'])

        expect(results).toHaveLength(2)
        expect(results.every(r => r.success)).toBe(true)
      })

      it('should handle single scope in array', async () => {
        mockStorage.getKeys.mockResolvedValue(['admin-products-list'])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const results = await invalidateMultipleScopes(['products'])

        expect(results).toHaveLength(1)
        expect(results[0].scope).toBe('products')
        expect(results[0].success).toBe(true)
      })

      it('should handle empty scope array', async () => {
        const results = await invalidateMultipleScopes([])

        expect(results).toHaveLength(0)
      })

      it('should invalidate all available scopes', async () => {
        mockStorage.getKeys.mockResolvedValue([
          'admin-products-list',
          'admin-orders-list',
          'admin-users-list',
          'admin-analytics-overview',
          'admin-audit-logs',
          'admin-email-logs',
          'admin-inventory-reports',
        ])
        mockStorage.removeItem.mockResolvedValue(undefined)

        const results = await invalidateMultipleScopes([
          'products',
          'orders',
          'users',
          'analytics',
          'audit-logs',
          'email-logs',
          'inventory',
        ])

        expect(results).toHaveLength(7)
        expect(results.every(r => r.success)).toBe(true)
      })
    })

    describe('Partial failure handling', () => {
      it('should handle partial failures gracefully', async () => {
        mockStorage.getKeys
          .mockResolvedValueOnce(['admin-products-list'])
          .mockRejectedValueOnce(new Error('Storage error'))
          .mockResolvedValueOnce(['admin-users-list'])

        mockStorage.removeItem.mockResolvedValue(undefined)

        const results = await invalidateMultipleScopes(['products', 'orders', 'users'])

        expect(results).toHaveLength(3)
        expect(results[0].success).toBe(true)
        expect(results[1].success).toBe(false)
        expect(results[1].error).toBe('Storage error')
        expect(results[2].success).toBe(true)
      })

      it('should return error details for failed scopes', async () => {
        mockStorage.getKeys
          .mockResolvedValueOnce(['admin-products-list'])
          .mockRejectedValueOnce(new Error('Network timeout'))

        mockStorage.removeItem.mockResolvedValue(undefined)

        const results = await invalidateMultipleScopes(['products', 'orders'])

        const failed = results.filter(r => !r.success)
        expect(failed).toHaveLength(1)
        expect(failed[0].scope).toBe('orders')
        expect(failed[0].error).toBe('Network timeout')
      })
    })

    describe('Concurrent execution', () => {
      it('should execute scope invalidations in parallel', async () => {
        const startTime = Date.now()

        mockStorage.getKeys.mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve([]), 50)),
        )

        await invalidateMultipleScopes(['products', 'orders', 'users'])

        const duration = Date.now() - startTime

        // If sequential, would take 150ms. Parallel should be close to 50ms
        expect(duration).toBeLessThan(100)
      })
    })
  })

  describe('Edge Cases', () => {
    describe('Extreme query parameter lengths', () => {
      it('should handle maximum allowed query value length', () => {
        const maxLength = 'a'.repeat(200)
        mockGetQuery.mockReturnValue({ search: maxLength })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toContain(maxLength)
      })

      it('should truncate values exceeding maximum length', () => {
        const tooLong = 'a'.repeat(300)
        mockGetQuery.mockReturnValue({ search: tooLong })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).not.toContain(tooLong)
        expect(key).toContain('a'.repeat(200))
        expect(key.length).toBeLessThan('admin-products-list?search='.length + 250)
      })

      it('should handle multiple long parameters', () => {
        const long1 = 'x'.repeat(200)
        const long2 = 'y'.repeat(200)
        mockGetQuery.mockReturnValue({
          search: long1,
          category: long2,
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toContain('x'.repeat(200))
        expect(key).toContain('y'.repeat(200))
      })
    })

    describe('Unicode and special characters', () => {
      it('should sanitize unicode characters for security', () => {
        mockGetQuery.mockReturnValue({
          search: 'café résumé naïve',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        // Unicode characters are sanitized for security (cache key injection prevention)
        expect(key).toContain('admin-products-list')
        expect(key).toContain('search')
        // Accented characters (é, è, ï, etc.) are removed, only ASCII alphanumeric remains
        expect(key).toContain('search=caf rsum nave')
      })

      it('should sanitize emoji for security', () => {
        mockGetQuery.mockReturnValue({
          search: 'wine 🍷 product',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        // Emoji are sanitized for security (prevents cache key issues)
        expect(key).toContain('admin-products-list')
        expect(key).toContain('wine')
        expect(key).toContain('product')
        // Emoji should be removed
        expect(key).not.toContain('🍷')
      })

      it('should sanitize non-Latin characters for security', () => {
        mockGetQuery.mockReturnValue({
          search: 'Вино 日本酒 와인',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        // Non-Latin scripts are sanitized for security
        expect(key).toBe('admin-products-list')
        // All non-ASCII characters are removed, leaving only spaces which then get trimmed
        // The entire value becomes empty after trim(), so the parameter is excluded
        expect(key).not.toContain('search')
        expect(key).not.toContain('Вино')
        expect(key).not.toContain('日本酒')
        expect(key).not.toContain('와인')
      })
    })

    describe('Complex real-world scenarios', () => {
      it('should handle complex filter combinations', () => {
        mockGetQuery.mockReturnValue({
          page: '2',
          limit: '25',
          search: 'vintage wine',
          category: 'red-wine',
          brand: 'test-winery',
          status: 'active',
          in_stock: 'true',
          featured: 'false',
          sort_by: 'price',
          order: 'desc',
          amount_min: '10',
          amount_max: '100',
        })

        const key = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key).toContain('page=2')
        expect(key).toContain('limit=25')
        expect(key).toContain('search=vintage wine')
        expect(key).toContain('category=red-wine')
        // Should be sorted alphabetically
        expect(key.indexOf('amount_max')).toBeLessThan(key.indexOf('amount_min'))
        expect(key.indexOf('brand')).toBeLessThan(key.indexOf('category'))
      })

      it('should handle date range filters', () => {
        mockGetQuery.mockReturnValue({
          date_from: '2024-01-01T00:00:00Z',
          date_to: '2024-12-31T23:59:59Z',
          page: '1',
        })

        const key = getAdminCacheKey('admin-orders-list', mockEvent as H3Event)

        expect(key).toContain('date_from=2024-01-01T000000Z')
        expect(key).toContain('date_to=2024-12-31T235959Z')
      })
    })

    describe('Cache key collision prevention', () => {
      it('should not create identical keys for different queries', () => {
        mockGetQuery.mockReturnValueOnce({ search: 'wine', page: '1' })
        const key1 = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        mockGetQuery.mockReturnValueOnce({ search: 'wine1', page: '' })
        const key2 = getAdminCacheKey('admin-products-list', mockEvent as H3Event)

        expect(key1).not.toBe(key2)
      })

      it('should differentiate between different baseNames', () => {
        mockGetQuery.mockReturnValue({ page: '1' })

        const key1 = getAdminCacheKey('admin-products-list', mockEvent as H3Event)
        const key2 = getAdminCacheKey('admin-orders-list', mockEvent as H3Event)

        expect(key1).not.toBe(key2)
        expect(key1).toContain('products')
        expect(key2).toContain('orders')
      })
    })
  })
})
