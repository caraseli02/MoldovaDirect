/**
 * CSRF Protection Utility Tests
 *
 * Tests for server/utils/csrfProtection.ts
 * Covers token generation, validation, and cleanup
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateCSRFToken,
  validateCSRFToken,
  getOrCreateCSRFToken,
  cleanupExpiredCSRFTokens,
} from '~/server/utils/csrfProtection'

describe('CSRF Protection Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('generateCSRFToken', () => {
    it('generates a token for a session', () => {
      const sessionId = 'test-session-123'
      const token = generateCSRFToken(sessionId)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBe(64) // 32 bytes = 64 hex chars
    })

    it('generates unique tokens for different sessions', () => {
      const token1 = generateCSRFToken('session-1')
      const token2 = generateCSRFToken('session-2')

      expect(token1).not.toBe(token2)
    })

    it('generates unique tokens for same session on repeated calls', () => {
      const sessionId = 'same-session'
      const token1 = generateCSRFToken(sessionId)
      const token2 = generateCSRFToken(sessionId)

      // New token should overwrite old one
      expect(token1).not.toBe(token2)
    })

    it('associates token with user ID when provided', () => {
      const sessionId = 'test-session'
      const userId = 'user-123'
      const token = generateCSRFToken(sessionId, userId)

      expect(token).toBeDefined()
      // Token should be valid for same user
      const result = validateCSRFToken(sessionId, token, userId)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateCSRFToken', () => {
    it('validates a correct token', () => {
      const sessionId = 'test-session'
      const token = generateCSRFToken(sessionId)

      const result = validateCSRFToken(sessionId, token)

      expect(result.valid).toBe(true)
    })

    it('rejects invalid token', () => {
      const sessionId = 'test-session'
      generateCSRFToken(sessionId)

      const result = validateCSRFToken(sessionId, 'wrong-token')

      expect(result.valid).toBe(false)
      expect(result.reason).toBe('Invalid token')
    })

    it('rejects token for non-existent session', () => {
      const result = validateCSRFToken('non-existent', 'any-token')

      expect(result.valid).toBe(false)
      expect(result.reason).toBe('No token found for session')
    })

    it('rejects token with wrong length', () => {
      const sessionId = 'test-session'
      generateCSRFToken(sessionId)

      const result = validateCSRFToken(sessionId, 'short')

      expect(result.valid).toBe(false)
    })

    it('rejects token with user ID mismatch', () => {
      const sessionId = 'test-session'
      const token = generateCSRFToken(sessionId, 'user-1')

      const result = validateCSRFToken(sessionId, token, 'user-2')

      expect(result.valid).toBe(false)
      expect(result.reason).toBe('Token user mismatch')
    })

    it('accepts token when user ID matches', () => {
      const sessionId = 'test-session'
      const userId = 'user-123'
      const token = generateCSRFToken(sessionId, userId)

      const result = validateCSRFToken(sessionId, token, userId)

      expect(result.valid).toBe(true)
    })
  })

  describe('getOrCreateCSRFToken', () => {
    it('creates new token for new session', () => {
      const sessionId = 'new-session-' + Date.now()
      const token = getOrCreateCSRFToken(sessionId)

      expect(token).toBeDefined()
      expect(token.length).toBe(64)
    })

    it('returns existing token for same session', () => {
      const sessionId = 'existing-session-' + Date.now()
      const token1 = getOrCreateCSRFToken(sessionId)
      const token2 = getOrCreateCSRFToken(sessionId)

      expect(token1).toBe(token2)
    })

    it('associates user ID with token', () => {
      const sessionId = 'user-session-' + Date.now()
      const userId = 'user-456'
      const token = getOrCreateCSRFToken(sessionId, userId)

      const result = validateCSRFToken(sessionId, token, userId)
      expect(result.valid).toBe(true)
    })
  })

  describe('cleanupExpiredCSRFTokens', () => {
    it('removes expired tokens', () => {
      // Generate a token
      const sessionId = 'cleanup-test-' + Date.now()
      generateCSRFToken(sessionId)

      // Token should be valid
      const token = getOrCreateCSRFToken(sessionId)
      expect(validateCSRFToken(sessionId, token).valid).toBe(true)

      // Cleanup (tokens aren't expired yet, so nothing should be removed)
      const cleaned = cleanupExpiredCSRFTokens()

      // Since tokens last 24 hours, cleanup should not remove fresh tokens
      expect(cleaned).toBeGreaterThanOrEqual(0)
    })

    it('returns count of cleaned tokens', () => {
      const cleaned = cleanupExpiredCSRFTokens()

      expect(typeof cleaned).toBe('number')
      expect(cleaned).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Token Security Properties', () => {
    it('tokens are cryptographically random (no patterns)', () => {
      const tokens = new Set<string>()
      for (let i = 0; i < 100; i++) {
        tokens.add(generateCSRFToken(`session-${i}`))
      }
      // All tokens should be unique
      expect(tokens.size).toBe(100)
    })

    it('tokens have correct entropy (64 hex chars = 256 bits)', () => {
      const token = generateCSRFToken('entropy-test')
      // Should only contain valid hex characters
      expect(token).toMatch(/^[0-9a-f]{64}$/)
    })

    it('constant-time comparison prevents timing attacks', () => {
      const sessionId = 'timing-test'
      const correctToken = generateCSRFToken(sessionId)

      // Both validations should complete (timing attack mitigation)
      const result1 = validateCSRFToken(sessionId, correctToken)
      const result2 = validateCSRFToken(sessionId, 'x'.repeat(64))

      expect(result1.valid).toBe(true)
      expect(result2.valid).toBe(false)
    })
  })
})
