/**
 * Cart Security Utilities
 *
 * Provides security enhancements for cart operations including:
 * - Data validation schemas
 * - Rate limiting utilities
 * - CSRF token management
 * - Input sanitization
 */

import { z } from 'zod'
import crypto from 'crypto'

// Rate limiting storage (in-memory for simplicity, could be Redis in production)
const rateLimitStore = new Map<string, { count: number, resetTime: number }>()

// CSRF token storage (in-memory for simplicity, could be Redis in production)
const csrfTokenStore = new Map<string, { token: string, expires: number }>()

// Cart operation validation schemas
export const cartValidationSchemas = {
  addItem: z.object({
    productId: z.string().uuid('Invalid product ID format'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99'),
    sessionId: z.string().min(1, 'Session ID is required'),
    csrfToken: z.string().min(1, 'CSRF token is required'),
  }),

  updateQuantity: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    quantity: z.number().int().min(0, 'Quantity cannot be negative').max(99, 'Quantity cannot exceed 99'),
    sessionId: z.string().min(1, 'Session ID is required'),
    csrfToken: z.string().min(1, 'CSRF token is required'),
  }),

  removeItem: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    sessionId: z.string().min(1, 'Session ID is required'),
    csrfToken: z.string().min(1, 'CSRF token is required'),
  }),

  clearCart: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    csrfToken: z.string().min(1, 'CSRF token is required'),
  }),

  validateCart: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    items: z.array(z.object({
      id: z.string().min(1, 'Item ID is required'),
      productId: z.string().uuid('Invalid product ID format'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99'),
    })).max(50, 'Cart cannot contain more than 50 items'),
  }),
}

// Rate limiting configuration
export const rateLimitConfig = {
  addItem: { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute
  updateQuantity: { maxRequests: 20, windowMs: 60000 }, // 20 requests per minute
  removeItem: { maxRequests: 15, windowMs: 60000 }, // 15 requests per minute
  clearCart: { maxRequests: 3, windowMs: 300000 }, // 3 requests per 5 minutes
  validateCart: { maxRequests: 30, windowMs: 60000 }, // 30 requests per minute
}

/**
 * Rate limiting middleware for cart operations
 */
export function checkRateLimit(
  identifier: string,
  operation: keyof typeof rateLimitConfig,
): { allowed: boolean, resetTime?: number, remaining?: number } {
  const config = rateLimitConfig[operation]
  const key = `${operation}:${identifier}`
  const now = Date.now()

  const existing = rateLimitStore.get(key)

  if (!existing || now > existing.resetTime) {
    // First request or window expired, reset counter
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })

    return {
      allowed: true,
      resetTime: now + config.windowMs,
      remaining: config.maxRequests - 1,
    }
  }

  if (existing.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      resetTime: existing.resetTime,
      remaining: 0,
    }
  }

  // Increment counter
  existing.count++
  rateLimitStore.set(key, existing)

  return {
    allowed: true,
    resetTime: existing.resetTime,
    remaining: config.maxRequests - existing.count,
  }
}

/**
 * Generate CSRF token for session
 */
export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + (24 * 60 * 60 * 1000) // 24 hours

  csrfTokenStore.set(sessionId, { token, expires })

  return token
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokenStore.get(sessionId)

  if (!stored) {
    return false
  }

  if (Date.now() > stored.expires) {
    // Token expired, remove it
    csrfTokenStore.delete(sessionId)
    return false
  }

  return stored.token === token
}

/**
 * Clean up expired CSRF tokens (should be called periodically)
 */
export function cleanupExpiredCSRFTokens(): void {
  const now = Date.now()

  for (const [sessionId, data] of csrfTokenStore.entries()) {
    if (now > data.expires) {
      csrfTokenStore.delete(sessionId)
    }
  }
}

/**
 * Clean up expired rate limit entries (should be called periodically)
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now()

  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Sanitize cart item data to prevent XSS
 */
export function sanitizeCartData(data: any): unknown {
  if (typeof data === 'string') {
    // Basic HTML entity encoding
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeCartData)
  }

  if (data && typeof data === 'object') {
    const sanitized = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeCartData(value)
    }
    return sanitized
  }

  return data
}

/**
 * Validate session ID format and generate if invalid
 */
export function validateSessionId(sessionId: string | null | undefined): string {
  if (!sessionId || typeof sessionId !== 'string') {
    return generateSessionId()
  }

  // Check if session ID matches expected format
  const sessionIdRegex = /^cart_\d+_[a-z0-9]{9}$/
  if (!sessionIdRegex.test(sessionId)) {
    return generateSessionId()
  }

  return sessionId
}

/**
 * Generate secure session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now()
  const randomPart = crypto.randomBytes(6).toString('hex')
  return `cart_${timestamp}_${randomPart}`
}

/**
 * Validate product ID format
 */
export function isValidProductId(productId: string): boolean {
  // UUID v4 format validation (more flexible to accept any valid UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(productId)
}

/**
 * Security headers for cart API responses
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': 'default-src \'self\'',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

/**
 * Periodic cleanup function (should be called by a cron job or similar)
 */
export function performSecurityCleanup(): void {
  cleanupExpiredCSRFTokens()
  cleanupExpiredRateLimits()
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(performSecurityCleanup, 5 * 60 * 1000)
}
