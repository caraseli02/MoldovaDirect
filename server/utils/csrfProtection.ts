/**
 * General-Purpose CSRF Protection Utilities
 *
 * Provides CSRF protection for sensitive API endpoints beyond cart:
 * - Checkout endpoints
 * - User account actions (delete account, update profile)
 * - Order modifications
 * - Any state-changing operations
 *
 * Security Features:
 * - Cryptographically secure token generation
 * - Token expiration (configurable)
 * - Origin/Referer validation
 * - Double-submit cookie pattern support
 */

import type { H3Event } from 'h3'
import crypto from 'crypto'

// CSRF token storage (in-memory, consider Redis for production clusters)
const csrfTokenStore = new Map<string, { token: string, expires: number, userId?: string }>()

// Configuration
const CSRF_CONFIG = {
  tokenLength: 32, // bytes
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  headerName: 'x-csrf-token',
  cookieName: 'csrf-token',
}

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(sessionId: string, userId?: string): string {
  const token = crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex')
  const expires = Date.now() + CSRF_CONFIG.tokenExpiry

  csrfTokenStore.set(sessionId, { token, expires, userId })

  return token
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(
  sessionId: string,
  token: string,
  userId?: string,
): { valid: boolean, reason?: string } {
  const stored = csrfTokenStore.get(sessionId)

  if (!stored) {
    return { valid: false, reason: 'No token found for session' }
  }

  if (Date.now() > stored.expires) {
    csrfTokenStore.delete(sessionId)
    return { valid: false, reason: 'Token expired' }
  }

  // Constant-time comparison to prevent timing attacks
  const tokenBuffer = Buffer.from(token)
  const storedBuffer = Buffer.from(stored.token)

  if (tokenBuffer.length !== storedBuffer.length) {
    return { valid: false, reason: 'Invalid token' }
  }

  if (!crypto.timingSafeEqual(tokenBuffer, storedBuffer)) {
    return { valid: false, reason: 'Invalid token' }
  }

  // If userId is provided, verify it matches
  if (userId && stored.userId && stored.userId !== userId) {
    return { valid: false, reason: 'Token user mismatch' }
  }

  return { valid: true }
}

/**
 * Validate request origin/referer
 */
export function validateOrigin(event: H3Event): { valid: boolean, reason?: string } {
  const origin = getHeader(event, 'origin')
  const referer = getHeader(event, 'referer')
  const host = getHeader(event, 'host')

  // In development, be more permissive
  if (process.env.NODE_ENV === 'development') {
    return { valid: true }
  }

  // Check origin header first
  if (origin) {
    try {
      const originUrl = new URL(origin)
      const expectedHost = host?.split(':')[0]
      if (originUrl.hostname === expectedHost || originUrl.hostname === 'localhost') {
        return { valid: true }
      }
      return { valid: false, reason: `Origin mismatch: ${origin}` }
    }
    catch {
      return { valid: false, reason: 'Invalid origin header' }
    }
  }

  // Fall back to referer
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const expectedHost = host?.split(':')[0]
      if (refererUrl.hostname === expectedHost || refererUrl.hostname === 'localhost') {
        return { valid: true }
      }
      return { valid: false, reason: `Referer mismatch: ${referer}` }
    }
    catch {
      return { valid: false, reason: 'Invalid referer header' }
    }
  }

  // No origin or referer - could be a direct API call, allow with warning
  return { valid: true }
}

/**
 * CSRF protection middleware for API endpoints
 *
 * Usage in API route:
 * ```ts
 * import { requireCSRFProtection } from '~/server/utils/csrfProtection'
 *
 * export default defineEventHandler(async (event) => {
 *   requireCSRFProtection(event)
 *   // ... rest of handler
 * })
 * ```
 */
export function requireCSRFProtection(
  event: H3Event,
  options: {
    skipMethods?: string[]
    requireToken?: boolean
    checkOrigin?: boolean
  } = {},
): void {
  const {
    skipMethods = ['GET', 'HEAD', 'OPTIONS'],
    requireToken = true,
    checkOrigin = true,
  } = options

  const method = event.node.req.method || 'GET'

  // Skip safe HTTP methods
  if (skipMethods.includes(method.toUpperCase())) {
    return
  }

  // Validate origin/referer
  if (checkOrigin) {
    const originResult = validateOrigin(event)
    if (!originResult.valid) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        data: {
          error: 'Origin validation failed',
          code: 'CSRF_ORIGIN_INVALID',
          reason: originResult.reason,
        },
      })
    }
  }

  // Validate CSRF token if required
  if (requireToken) {
    const csrfToken = getHeader(event, CSRF_CONFIG.headerName)
      || getCookie(event, CSRF_CONFIG.cookieName)

    // Try to get session ID from various sources
    const sessionId = getHeader(event, 'x-session-id')
      || getCookie(event, 'session-id')
      || getCookie(event, 'cart-session-id')

    if (!sessionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          error: 'Session ID required for CSRF protection',
          code: 'CSRF_SESSION_MISSING',
        },
      })
    }

    if (!csrfToken) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        data: {
          error: 'CSRF token required',
          code: 'CSRF_TOKEN_MISSING',
        },
      })
    }

    const tokenResult = validateCSRFToken(sessionId, csrfToken)
    if (!tokenResult.valid) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        data: {
          error: 'Invalid or expired CSRF token',
          code: 'CSRF_TOKEN_INVALID',
          reason: tokenResult.reason,
        },
      })
    }
  }
}

/**
 * Get or generate CSRF token for a session
 */
export function getOrCreateCSRFToken(sessionId: string, userId?: string): string {
  const existing = csrfTokenStore.get(sessionId)

  if (existing && Date.now() < existing.expires) {
    return existing.token
  }

  return generateCSRFToken(sessionId, userId)
}

/**
 * Cleanup expired CSRF tokens
 */
export function cleanupExpiredCSRFTokens(): number {
  const now = Date.now()
  let cleaned = 0

  for (const [sessionId, data] of csrfTokenStore.entries()) {
    if (now > data.expires) {
      csrfTokenStore.delete(sessionId)
      cleaned++
    }
  }

  return cleaned
}

/**
 * API endpoint to get CSRF token
 * Should be called before making state-changing requests
 */
export function createCSRFTokenEndpoint() {
  return defineEventHandler(async (event) => {
    // Only allow GET requests
    if (event.node.req.method !== 'GET') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      })
    }

    // Get or create session ID
    let sessionId = getCookie(event, 'session-id') || getCookie(event, 'cart-session-id')

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
      setCookie(event, 'session-id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      })
    }

    // Get user ID if authenticated (optional)
    const authHeader = getHeader(event, 'authorization')
    let userId: string | undefined

    if (authHeader) {
      // Extract user ID from JWT if needed
      // This is a placeholder - implement based on your auth system
      // For now, we'll leave userId as undefined
      userId = undefined
    }

    const token = getOrCreateCSRFToken(sessionId, userId)

    // Also set as cookie for double-submit pattern
    setCookie(event, CSRF_CONFIG.cookieName, token, {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })

    return {
      success: true,
      token,
      sessionId,
      expiresIn: CSRF_CONFIG.tokenExpiry,
    }
  })
}

// Periodic cleanup (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cleaned = cleanupExpiredCSRFTokens()
    if (cleaned > 0 && process.env.NODE_ENV === 'development') {
      console.log(`[CSRF] Cleaned up ${cleaned} expired tokens`)
    }
  }, 5 * 60 * 1000)
}
