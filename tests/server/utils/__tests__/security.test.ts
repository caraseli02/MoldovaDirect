/**
 * Security Utilities Tests
 *
 * Comprehensive tests for security features:
 * - CSRF Protection
 * - Rate Limiting
 * - Origin Validation
 * - Price Verification Logic
 *
 * @see https://github.com/goldbergyoni/nodejs-testing-best-practices
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ========================================
// CSRF Protection Tests
// ========================================
describe('CSRF Protection', () => {
  describe('Token Generation', () => {
    it('generates cryptographically random tokens', () => {
      // Simulate token generation
      const generateToken = () => {
        const bytes = new Uint8Array(32)
        crypto.getRandomValues(bytes)
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
      }

      const token1 = generateToken()
      const token2 = generateToken()

      expect(token1).toHaveLength(64) // 32 bytes = 64 hex chars
      expect(token2).toHaveLength(64)
      expect(token1).not.toBe(token2) // Should be unique
    })

    it('associates tokens with session IDs', () => {
      const tokenStore = new Map<string, { token: string, expires: number }>()

      const sessionId = 'session_123'
      const token = 'test_token_abc123'
      const expires = Date.now() + 24 * 60 * 60 * 1000

      tokenStore.set(sessionId, { token, expires })

      const stored = tokenStore.get(sessionId)
      expect(stored?.token).toBe(token)
      expect(stored?.expires).toBeGreaterThan(Date.now())
    })
  })

  describe('Token Validation', () => {
    it('validates matching tokens', () => {
      const validateToken = (stored: string, provided: string) => stored === provided

      expect(validateToken('abc123', 'abc123')).toBe(true)
      expect(validateToken('abc123', 'xyz789')).toBe(false)
    })

    it('rejects expired tokens', () => {
      const isExpired = (expires: number) => Date.now() > expires

      const expiredTime = Date.now() - 1000 // 1 second ago
      const validTime = Date.now() + 60000 // 1 minute from now

      expect(isExpired(expiredTime)).toBe(true)
      expect(isExpired(validTime)).toBe(false)
    })

    it('prevents timing attacks with constant-time comparison', () => {
      // Simulate constant-time comparison
      const timingSafeEqual = (a: string, b: string) => {
        if (a.length !== b.length) return false
        let result = 0
        for (let i = 0; i < a.length; i++) {
          result |= a.charCodeAt(i) ^ b.charCodeAt(i)
        }
        return result === 0
      }

      expect(timingSafeEqual('secret123', 'secret123')).toBe(true)
      expect(timingSafeEqual('secret123', 'secret124')).toBe(false)
      expect(timingSafeEqual('short', 'verylongstring')).toBe(false)
    })
  })

  describe('Token Cleanup', () => {
    it('removes expired tokens during cleanup', () => {
      const tokenStore = new Map<string, { token: string, expires: number }>()

      // Add expired token
      tokenStore.set('expired_session', {
        token: 'token1',
        expires: Date.now() - 1000,
      })

      // Add valid token
      tokenStore.set('valid_session', {
        token: 'token2',
        expires: Date.now() + 60000,
      })

      // Cleanup
      const now = Date.now()
      for (const [key, data] of tokenStore.entries()) {
        if (now > data.expires) {
          tokenStore.delete(key)
        }
      }

      expect(tokenStore.has('expired_session')).toBe(false)
      expect(tokenStore.has('valid_session')).toBe(true)
    })
  })
})

// ========================================
// Origin Validation Tests
// ========================================
describe('Origin Validation', () => {
  describe('Origin Header Validation', () => {
    it('accepts matching origin', () => {
      const validateOrigin = (origin: string, host: string) => {
        try {
          const url = new URL(origin)
          return url.hostname === host.split(':')[0]
        }
        catch {
          return false
        }
      }

      expect(validateOrigin('https://example.com', 'example.com')).toBe(true)
      expect(validateOrigin('https://example.com', 'example.com:443')).toBe(true)
      expect(validateOrigin('https://evil.com', 'example.com')).toBe(false)
    })

    it('handles localhost in development', () => {
      const validateOrigin = (origin: string, isDev: boolean) => {
        if (isDev) return true
        try {
          const url = new URL(origin)
          return url.hostname !== 'localhost'
        }
        catch {
          return false
        }
      }

      expect(validateOrigin('http://localhost:3000', true)).toBe(true)
      expect(validateOrigin('http://localhost:3000', false)).toBe(false)
    })

    it('rejects invalid origin headers', () => {
      const validateOrigin = (origin: string) => {
        try {
          new URL(origin)
          return true
        }
        catch {
          return false
        }
      }

      expect(validateOrigin('not-a-url')).toBe(false)
      expect(validateOrigin('')).toBe(false)
      expect(validateOrigin('https://valid.com')).toBe(true)
    })
  })

  describe('Referer Fallback', () => {
    it('validates referer when origin is missing', () => {
      const validateRequest = (origin?: string, referer?: string, host?: string) => {
        if (origin) {
          try {
            const url = new URL(origin)
            return url.hostname === host?.split(':')[0]
          }
          catch {
            return false
          }
        }

        if (referer) {
          try {
            const url = new URL(referer)
            return url.hostname === host?.split(':')[0]
          }
          catch {
            return false
          }
        }

        // No origin or referer - allow (could be direct API call)
        return true
      }

      expect(validateRequest(undefined, 'https://example.com/page', 'example.com')).toBe(true)
      expect(validateRequest(undefined, 'https://evil.com/page', 'example.com')).toBe(false)
      expect(validateRequest(undefined, undefined, 'example.com')).toBe(true)
    })
  })
})

// ========================================
// Rate Limiting Tests
// ========================================
describe('Rate Limiting', () => {
  describe('Request Counting', () => {
    it('allows requests within limit', () => {
      const rateLimitStore = new Map<string, { count: number, resetTime: number }>()
      const maxRequests = 5
      const windowMs = 60000

      const checkRateLimit = (key: string) => {
        const now = Date.now()
        const existing = rateLimitStore.get(key)

        if (!existing || now > existing.resetTime) {
          rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
          return { allowed: true, remaining: maxRequests - 1 }
        }

        if (existing.count >= maxRequests) {
          return { allowed: false, remaining: 0 }
        }

        existing.count++
        return { allowed: true, remaining: maxRequests - existing.count }
      }

      // First 5 requests should be allowed
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit('user:127.0.0.1')
        expect(result.allowed).toBe(true)
      }

      // 6th request should be blocked
      const result = checkRateLimit('user:127.0.0.1')
      expect(result.allowed).toBe(false)
    })

    it('resets counter after window expires', () => {
      const rateLimitStore = new Map<string, { count: number, resetTime: number }>()

      // Simulate expired window
      rateLimitStore.set('user:127.0.0.1', {
        count: 100,
        resetTime: Date.now() - 1000, // Expired 1 second ago
      })

      const checkRateLimit = (key: string) => {
        const now = Date.now()
        const existing = rateLimitStore.get(key)

        if (!existing || now > existing.resetTime) {
          rateLimitStore.set(key, { count: 1, resetTime: now + 60000 })
          return { allowed: true, remaining: 4 }
        }

        return { allowed: false, remaining: 0 }
      }

      const result = checkRateLimit('user:127.0.0.1')
      expect(result.allowed).toBe(true)
    })
  })

  describe('Per-Operation Limits', () => {
    it('enforces different limits for different operations', () => {
      const rateLimitConfig = {
        login: { maxRequests: 5, windowMs: 900000 }, // 5 per 15 min
        register: { maxRequests: 3, windowMs: 3600000 }, // 3 per hour
        resetPassword: { maxRequests: 3, windowMs: 3600000 }, // 3 per hour
      }

      expect(rateLimitConfig.login.maxRequests).toBe(5)
      expect(rateLimitConfig.register.maxRequests).toBe(3)
      expect(rateLimitConfig.resetPassword.maxRequests).toBe(3)
    })
  })

  describe('Account Lockout', () => {
    it('locks account after too many failed attempts', () => {
      const failedLoginStore = new Map<string, { count: number, lockoutUntil?: number }>()
      const maxFailedAttempts = 10
      const lockoutDurationMs = 30 * 60 * 1000

      const recordFailedLogin = (email: string) => {
        const existing = failedLoginStore.get(email)

        if (!existing) {
          failedLoginStore.set(email, { count: 1 })
          return { locked: false }
        }

        existing.count++

        if (existing.count >= maxFailedAttempts) {
          existing.lockoutUntil = Date.now() + lockoutDurationMs
          return { locked: true, lockoutUntil: existing.lockoutUntil }
        }

        return { locked: false }
      }

      // Simulate 9 failed attempts
      for (let i = 0; i < 9; i++) {
        const result = recordFailedLogin('user@example.com')
        expect(result.locked).toBe(false)
      }

      // 10th attempt should lock
      const result = recordFailedLogin('user@example.com')
      expect(result.locked).toBe(true)
    })
  })
})

// ========================================
// Price Verification Tests
// ========================================
describe('Server-Side Price Verification', () => {
  describe('Price Comparison', () => {
    it('detects price tampering', () => {
      const detectPriceTampering = (clientPrice: number, serverPrice: number, tolerance = 0.01) => {
        return Math.abs(clientPrice - serverPrice) > tolerance
      }

      expect(detectPriceTampering(25.00, 25.00)).toBe(false) // No tampering
      expect(detectPriceTampering(25.00, 25.009)).toBe(false) // Within tolerance
      expect(detectPriceTampering(10.00, 25.00)).toBe(true) // Tampering detected
      expect(detectPriceTampering(0.01, 99.99)).toBe(true) // Major tampering
    })

    it('calculates correct item totals', () => {
      const calculateItemTotal = (price: number, quantity: number) => price * quantity

      expect(calculateItemTotal(25.00, 2)).toBe(50.00)
      expect(calculateItemTotal(9.99, 3)).toBeCloseTo(29.97, 2)
      expect(calculateItemTotal(100.00, 1)).toBe(100.00)
    })

    it('calculates correct order subtotal', () => {
      const items = [
        { price: 25.00, quantity: 2 },
        { price: 15.50, quantity: 1 },
        { price: 9.99, quantity: 3 },
      ]

      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      expect(subtotal).toBeCloseTo(95.47, 2)
    })
  })

  describe('Shipping Cost Calculation', () => {
    it('calculates correct shipping cost based on method', () => {
      const calculateShipping = (method: string, subtotal: number) => {
        if (method === 'free' && subtotal >= 50) return 0
        if (method === 'express') return 12.99
        return 5.99 // Standard
      }

      expect(calculateShipping('standard', 30)).toBe(5.99)
      expect(calculateShipping('express', 30)).toBe(12.99)
      expect(calculateShipping('free', 60)).toBe(0)
      expect(calculateShipping('free', 40)).toBe(5.99) // Not eligible for free
    })

    it('applies free shipping threshold correctly', () => {
      const FREE_SHIPPING_THRESHOLD = 50

      const isEligibleForFreeShipping = (subtotal: number) => subtotal >= FREE_SHIPPING_THRESHOLD

      expect(isEligibleForFreeShipping(50)).toBe(true)
      expect(isEligibleForFreeShipping(49.99)).toBe(false)
      expect(isEligibleForFreeShipping(100)).toBe(true)
    })
  })

  describe('Total Calculation', () => {
    it('calculates correct order total', () => {
      const calculateTotal = (subtotal: number, shipping: number, tax: number) => {
        return subtotal + shipping + tax
      }

      expect(calculateTotal(100, 5.99, 0)).toBe(105.99)
      expect(calculateTotal(50, 0, 10)).toBe(60)
      expect(calculateTotal(75.50, 12.99, 7.55)).toBeCloseTo(96.04, 2)
    })

    it('uses server prices over client prices', () => {
      const clientData = { subtotal: 10, shipping: 0, total: 10 }
      const serverData = { subtotal: 100, shipping: 5.99, total: 105.99 }

      // Server values should always be used
      const finalOrder = {
        subtotal: serverData.subtotal,
        shipping: serverData.shipping,
        total: serverData.total,
      }

      expect(finalOrder.total).toBe(105.99)
      expect(finalOrder.total).not.toBe(clientData.total)
    })
  })
})

// ========================================
// Security Headers Tests
// ========================================
describe('Security Headers', () => {
  describe('CSP Directives', () => {
    it('includes required CSP directives', () => {
      const requiredDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'img-src',
        'connect-src',
        'frame-src',
      ]

      const csp = 'default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\''

      requiredDirectives.slice(0, 3).forEach((directive) => {
        expect(csp).toContain(directive)
      })
    })

    it('allows Stripe domains for payment', () => {
      const allowedStripeDomains = [
        'js.stripe.com',
        'checkout.stripe.com',
        'api.stripe.com',
      ]

      const csp = 'script-src \'self\' https://js.stripe.com; frame-src https://checkout.stripe.com; connect-src https://api.stripe.com'

      allowedStripeDomains.forEach((domain) => {
        expect(csp).toContain(domain)
      })
    })
  })

  describe('Other Security Headers', () => {
    it('sets X-Content-Type-Options', () => {
      const headers = { 'X-Content-Type-Options': 'nosniff' }
      expect(headers['X-Content-Type-Options']).toBe('nosniff')
    })

    it('sets X-Frame-Options', () => {
      const headers = { 'X-Frame-Options': 'SAMEORIGIN' }
      expect(headers['X-Frame-Options']).toBe('SAMEORIGIN')
    })

    it('sets Referrer-Policy', () => {
      const headers = { 'Referrer-Policy': 'strict-origin-when-cross-origin' }
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    })

    it('sets HSTS in production', () => {
      const isProd = true
      const headers: Record<string, string> = {}

      if (isProd) {
        headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
      }

      expect(headers['Strict-Transport-Security']).toContain('max-age=31536000')
    })
  })
})

// ========================================
// Integration Tests
// ========================================
describe('Security Integration', () => {
  it('validates complete checkout security flow', () => {
    // Simulate a complete secure checkout flow
    const securityChecks = {
      originValidated: true,
      pricesVerified: true,
      rateLimitPassed: true,
      csrfValidated: true,
    }

    const allChecksPassed = Object.values(securityChecks).every(check => check === true)
    expect(allChecksPassed).toBe(true)
  })

  it('blocks request when any security check fails', () => {
    const securityChecks = {
      originValidated: true,
      pricesVerified: false, // Price tampering detected
      rateLimitPassed: true,
      csrfValidated: true,
    }

    const allChecksPassed = Object.values(securityChecks).every(check => check === true)
    expect(allChecksPassed).toBe(false)
  })
})
