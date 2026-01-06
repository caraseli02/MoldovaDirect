/**
 * Cart Security Tests
 *
 * Tests for CSRF token management with focus on timing-safe comparison.
 * Security requirement: CSRF validation must use constant-time comparison
 * to prevent timing attacks.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import crypto from 'crypto'
import {
  generateCSRFToken,
  validateCSRFToken,
  checkRateLimit,
  generateSessionId,
  isValidProductId,
  sanitizeCartData,
  validateSessionId,
} from '~/server/utils/cartSecurity'

describe('cartSecurity', () => {
  describe('CSRF Token Management', () => {
    const testSessionId = 'test-session-123'

    beforeEach(() => {
      // Reset any stored tokens between tests
      vi.clearAllMocks()
    })

    describe('generateCSRFToken', () => {
      it('should generate a valid hex token', () => {
        const token = generateCSRFToken(testSessionId)

        expect(token).toBeDefined()
        expect(typeof token).toBe('string')
        expect(token).toMatch(/^[a-f0-9]{64}$/) // 32 bytes = 64 hex chars
      })

      it('should generate unique tokens for different sessions', () => {
        const token1 = generateCSRFToken('session-1')
        const token2 = generateCSRFToken('session-2')

        expect(token1).not.toBe(token2)
      })

      it('should generate unique tokens for same session on regeneration', () => {
        const token1 = generateCSRFToken(testSessionId)
        const token2 = generateCSRFToken(testSessionId)

        expect(token1).not.toBe(token2)
      })
    })

    describe('validateCSRFToken', () => {
      it('should return true for valid token', () => {
        const token = generateCSRFToken(testSessionId)
        const result = validateCSRFToken(testSessionId, token)

        expect(result).toBe(true)
      })

      it('should return false for invalid token', () => {
        generateCSRFToken(testSessionId)
        const result = validateCSRFToken(testSessionId, 'invalid-token')

        expect(result).toBe(false)
      })

      it('should return false for non-existent session', () => {
        const result = validateCSRFToken('non-existent-session', 'any-token')

        expect(result).toBe(false)
      })

      it('should return false for token from different session', () => {
        const token1 = generateCSRFToken('session-1')
        generateCSRFToken('session-2')

        // Try to use session-1's token with session-2
        const result = validateCSRFToken('session-2', token1)

        expect(result).toBe(false)
      })

      /**
       * SECURITY TEST: Timing-Safe Comparison
       *
       * This test verifies that CSRF token validation uses constant-time
       * comparison (crypto.timingSafeEqual) to prevent timing attacks.
       *
       * In a timing attack, an attacker can guess the token character by
       * character by measuring response times. If the comparison stops
       * early on mismatch, they can detect which characters are correct.
       */
      it('should use timing-safe comparison for token validation', () => {
        // Spy on crypto.timingSafeEqual to verify it's being used
        const timingSafeEqualSpy = vi.spyOn(crypto, 'timingSafeEqual')

        const token = generateCSRFToken(testSessionId)

        // Valid token should use timingSafeEqual
        validateCSRFToken(testSessionId, token)

        expect(timingSafeEqualSpy).toHaveBeenCalled()

        timingSafeEqualSpy.mockRestore()
      })

      it('should use timing-safe comparison even for invalid tokens', () => {
        // Spy on crypto.timingSafeEqual
        const timingSafeEqualSpy = vi.spyOn(crypto, 'timingSafeEqual')

        generateCSRFToken(testSessionId)

        // Create an invalid token of the same length
        const invalidToken = 'a'.repeat(64)

        // Invalid token should still use timingSafeEqual (not early return)
        validateCSRFToken(testSessionId, invalidToken)

        expect(timingSafeEqualSpy).toHaveBeenCalled()

        timingSafeEqualSpy.mockRestore()
      })

      it('should handle tokens of different lengths securely', () => {
        // Tokens of different lengths should not throw and should return false
        generateCSRFToken(testSessionId)

        // Test with various invalid token lengths
        expect(validateCSRFToken(testSessionId, '')).toBe(false)
        expect(validateCSRFToken(testSessionId, 'short')).toBe(false)
        expect(validateCSRFToken(testSessionId, 'a'.repeat(100))).toBe(false)
      })
    })
  })

  describe('Rate Limiting', () => {
    const testIdentifier = 'test-user-ip'

    it('should allow requests within limit', () => {
      const result = checkRateLimit(testIdentifier + '-new', 'addItem')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeDefined()
    })

    it('should track remaining requests', () => {
      const uniqueId = `rate-test-${Date.now()}`

      const result1 = checkRateLimit(uniqueId, 'addItem')
      expect(result1.remaining).toBe(9) // 10 max - 1 used

      const result2 = checkRateLimit(uniqueId, 'addItem')
      expect(result2.remaining).toBe(8) // 10 max - 2 used
    })
  })

  describe('Session ID Management', () => {
    describe('generateSessionId', () => {
      it('should generate valid session ID format', () => {
        const sessionId = generateSessionId()

        expect(sessionId).toMatch(/^cart_\d+_[a-f0-9]{12}$/)
      })

      it('should generate unique session IDs', () => {
        const id1 = generateSessionId()
        const id2 = generateSessionId()

        expect(id1).not.toBe(id2)
      })
    })

    describe('validateSessionId', () => {
      it('should return valid session ID unchanged', () => {
        const validId = 'cart_1234567890_abcdef123'
        const result = validateSessionId(validId)

        expect(result).toBe(validId)
      })

      it('should generate new ID for null input', () => {
        const result = validateSessionId(null)

        expect(result).toMatch(/^cart_\d+_[a-f0-9]{12}$/)
      })

      it('should generate new ID for undefined input', () => {
        const result = validateSessionId(undefined)

        expect(result).toMatch(/^cart_\d+_[a-f0-9]{12}$/)
      })

      it('should generate new ID for invalid format', () => {
        const result = validateSessionId('invalid-format')

        expect(result).toMatch(/^cart_\d+_[a-f0-9]{12}$/)
      })
    })
  })

  describe('Product ID Validation', () => {
    it('should accept valid UUID v4', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000'
      expect(isValidProductId(validUUID)).toBe(true)
    })

    it('should reject invalid UUID', () => {
      expect(isValidProductId('invalid-uuid')).toBe(false)
      expect(isValidProductId('')).toBe(false)
      expect(isValidProductId('12345')).toBe(false)
    })
  })

  describe('Data Sanitization', () => {
    it('should sanitize HTML in strings', () => {
      const input = '<script>alert("xss")</script>'
      const result = sanitizeCartData(input)

      expect(result).not.toContain('<script>')
      expect(result).toContain('&lt;script&gt;')
    })

    it('should sanitize nested objects', () => {
      const input = {
        name: '<b>Bold</b>',
        items: ['<i>italic</i>'],
      }
      const result = sanitizeCartData(input) as Record<string, unknown>

      expect(result.name).not.toContain('<b>')
      expect((result.items as string[])[0]).not.toContain('<i>')
    })

    it('should preserve non-string values', () => {
      const input = {
        count: 42,
        active: true,
        price: 19.99,
      }
      const result = sanitizeCartData(input) as Record<string, unknown>

      expect(result.count).toBe(42)
      expect(result.active).toBe(true)
      expect(result.price).toBe(19.99)
    })
  })
})
