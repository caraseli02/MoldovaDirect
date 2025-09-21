/**
 * Cart Security Tests
 * 
 * Tests for cart security enhancements including:
 * - Client-side data validation
 * - Rate limiting functionality
 * - CSRF protection
 * - Input sanitization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  cartValidationSchemas,
  checkRateLimit,
  generateCSRFToken,
  validateCSRFToken,
  sanitizeCartData,
  validateSessionId,
  isValidProductId,
  cleanupExpiredCSRFTokens,
  cleanupExpiredRateLimits
} from '~/server/utils/cartSecurity'

describe('Cart Security Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Data Validation Schemas', () => {
    it('should validate addItem data correctly', () => {
      const validData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 2,
        sessionId: 'cart_1234567890_abcdef123',
        csrfToken: 'valid-csrf-token'
      }

      expect(() => cartValidationSchemas.addItem.parse(validData)).not.toThrow()
    })

    it('should reject invalid product ID format', () => {
      const invalidData = {
        productId: 'invalid-id',
        quantity: 1,
        sessionId: 'cart_1234567890_abcdef123',
        csrfToken: 'valid-csrf-token'
      }

      expect(() => cartValidationSchemas.addItem.parse(invalidData)).toThrow()
    })

    it('should reject invalid quantity values', () => {
      const invalidQuantityData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 0, // Invalid: must be at least 1
        sessionId: 'cart_1234567890_abcdef123',
        csrfToken: 'valid-csrf-token'
      }

      expect(() => cartValidationSchemas.addItem.parse(invalidQuantityData)).toThrow()

      const tooHighQuantityData = {
        ...invalidQuantityData,
        quantity: 100 // Invalid: exceeds max of 99
      }

      expect(() => cartValidationSchemas.addItem.parse(tooHighQuantityData)).toThrow()
    })

    it('should validate updateQuantity data correctly', () => {
      const validData = {
        itemId: 'item_123',
        quantity: 5,
        sessionId: 'cart_1234567890_abcdef123',
        csrfToken: 'valid-csrf-token'
      }

      expect(() => cartValidationSchemas.updateQuantity.parse(validData)).not.toThrow()
    })

    it('should allow zero quantity for updateQuantity (removal)', () => {
      const validData = {
        itemId: 'item_123',
        quantity: 0,
        sessionId: 'cart_1234567890_abcdef123',
        csrfToken: 'valid-csrf-token'
      }

      expect(() => cartValidationSchemas.updateQuantity.parse(validData)).not.toThrow()
    })

    it('should validate cart items array', () => {
      const validItems = [
        {
          id: 'item_1',
          productId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 2
        },
        {
          id: 'item_2',
          productId: '123e4567-e89b-12d3-a456-426614174001',
          quantity: 1
        }
      ]

      expect(() => cartValidationSchemas.validateCart.parse({
        sessionId: 'cart_1234567890_abcdef123',
        items: validItems
      })).not.toThrow()
    })

    it('should reject cart with too many items', () => {
      const tooManyItems = Array.from({ length: 51 }, (_, i) => ({
        id: `item_${i}`,
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 1
      }))

      expect(() => cartValidationSchemas.validateCart.parse({
        sessionId: 'cart_1234567890_abcdef123',
        items: tooManyItems
      })).toThrow()
    })
  })

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', () => {
      const result = checkRateLimit('test-user', 'addItem')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeDefined()
      expect(result.resetTime).toBeDefined()
    })

    it('should block requests exceeding rate limit', () => {
      const identifier = 'test-user-blocked'
      
      // Make requests up to the limit
      for (let i = 0; i < 10; i++) {
        checkRateLimit(identifier, 'addItem')
      }
      
      // Next request should be blocked
      const result = checkRateLimit(identifier, 'addItem')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset rate limit after window expires', () => {
      const identifier = 'test-user-reset'
      
      // Mock time to simulate window expiry
      const originalNow = Date.now
      Date.now = vi.fn(() => originalNow() + 70000) // 70 seconds later
      
      const result = checkRateLimit(identifier, 'addItem')
      expect(result.allowed).toBe(true)
      
      // Restore original Date.now
      Date.now = originalNow
    })
  })

  describe('CSRF Protection', () => {
    it('should generate valid CSRF token', () => {
      const sessionId = 'test-session'
      const token = generateCSRFToken(sessionId)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should validate correct CSRF token', () => {
      const sessionId = 'test-session'
      const token = generateCSRFToken(sessionId)
      
      const isValid = validateCSRFToken(sessionId, token)
      expect(isValid).toBe(true)
    })

    it('should reject invalid CSRF token', () => {
      const sessionId = 'test-session'
      generateCSRFToken(sessionId)
      
      const isValid = validateCSRFToken(sessionId, 'invalid-token')
      expect(isValid).toBe(false)
    })

    it('should reject expired CSRF token', () => {
      const sessionId = 'test-session'
      const token = generateCSRFToken(sessionId)
      
      // Mock time to simulate token expiry
      const originalNow = Date.now
      Date.now = vi.fn(() => originalNow() + (25 * 60 * 60 * 1000)) // 25 hours later
      
      const isValid = validateCSRFToken(sessionId, token)
      expect(isValid).toBe(false)
      
      // Restore original Date.now
      Date.now = originalNow
    })
  })

  describe('Input Sanitization', () => {
    it('should sanitize HTML entities', () => {
      const maliciousInput = '<script>alert("xss")</script>'
      const sanitized = sanitizeCartData(maliciousInput)
      
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
    })

    it('should sanitize nested objects', () => {
      const maliciousData = {
        name: '<img src="x" onerror="alert(1)">',
        description: 'Safe text',
        nested: {
          value: '<script>evil()</script>'
        }
      }
      
      const sanitized = sanitizeCartData(maliciousData)
      
      expect(sanitized.name).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;')
      expect(sanitized.description).toBe('Safe text')
      expect(sanitized.nested.value).toBe('&lt;script&gt;evil()&lt;&#x2F;script&gt;')
    })

    it('should sanitize arrays', () => {
      const maliciousArray = ['<script>alert(1)</script>', 'safe', '<img src="x">']
      const sanitized = sanitizeCartData(maliciousArray)
      
      expect(sanitized[0]).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;')
      expect(sanitized[1]).toBe('safe')
      expect(sanitized[2]).toBe('&lt;img src=&quot;x&quot;&gt;')
    })
  })

  describe('Session ID Validation', () => {
    it('should validate correct session ID format', () => {
      const validSessionId = 'cart_1234567890_abcdef123'
      const result = validateSessionId(validSessionId)
      
      expect(result).toBe(validSessionId)
    })

    it('should generate new session ID for invalid format', () => {
      const invalidSessionId = 'invalid-session'
      const result = validateSessionId(invalidSessionId)
      
      expect(result).not.toBe(invalidSessionId)
      expect(result).toMatch(/^cart_\d+_[a-z0-9]{12}$/)
    })

    it('should generate new session ID for null/undefined', () => {
      const result1 = validateSessionId(null)
      const result2 = validateSessionId(undefined)
      
      expect(result1).toMatch(/^cart_\d+_[a-z0-9]{12}$/)
      expect(result2).toMatch(/^cart_\d+_[a-z0-9]{12}$/)
    })
  })

  describe('Product ID Validation', () => {
    it('should validate correct UUID format', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000'
      const result = isValidProductId(validUUID)
      
      expect(result).toBe(true)
    })

    it('should reject invalid UUID format', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123-456-789',
        '123e4567-e89b-12d3-a456-42661417400', // too short
        '123e4567-e89b-12d3-a456-4266141740000', // too long
        '123e4567-e89b-62d3-a456-426614174000', // invalid version (6)
        '123e4567-e89b-02d3-a456-426614174000', // invalid version (0)
        '123e4567-e89b-12d3-c456-426614174000' // invalid variant (c)
      ]
      
      invalidUUIDs.forEach(uuid => {
        expect(isValidProductId(uuid)).toBe(false)
      })
    })
  })

  describe('Cleanup Functions', () => {
    it('should clean up expired CSRF tokens', () => {
      const sessionId = 'cleanup-test'
      generateCSRFToken(sessionId)
      
      // Mock time to simulate expiry
      const originalNow = Date.now
      Date.now = vi.fn(() => originalNow() + (25 * 60 * 60 * 1000)) // 25 hours later
      
      cleanupExpiredCSRFTokens()
      
      // Token should be invalid after cleanup
      const isValid = validateCSRFToken(sessionId, 'any-token')
      expect(isValid).toBe(false)
      
      // Restore original Date.now
      Date.now = originalNow
    })

    it('should clean up expired rate limits', () => {
      const identifier = 'cleanup-rate-limit'
      checkRateLimit(identifier, 'addItem')
      
      // Mock time to simulate expiry
      const originalNow = Date.now
      Date.now = vi.fn(() => originalNow() + (70 * 1000)) // 70 seconds later
      
      cleanupExpiredRateLimits()
      
      // Should allow new requests after cleanup
      const result = checkRateLimit(identifier, 'addItem')
      expect(result.allowed).toBe(true)
      
      // Restore original Date.now
      Date.now = originalNow
    })
  })
})