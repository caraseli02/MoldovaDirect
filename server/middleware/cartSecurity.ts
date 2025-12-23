/**
 * Cart Security Middleware
 *
 * Provides security middleware for cart-related API endpoints including:
 * - Request validation
 * - Rate limiting
 * - CSRF protection
 * - Security headers
 */

import type { H3Event } from 'h3'
import {
  checkRateLimit,
  validateCSRFToken,
  securityHeaders,
  performSecurityCleanup,
} from '~/server/utils/cartSecurity'

interface SecurityOptions {
  requireCSRF?: boolean
  rateLimitOperation?: string
  skipRateLimit?: boolean
  customHeaders?: Record<string, string>
}

/**
 * Cart security middleware factory
 */
export function createCartSecurityMiddleware(options: SecurityOptions = {}) {
  return defineEventHandler(async (event) => {
    // Only apply to cart-related endpoints
    if (!event.node.req.url?.includes('/api/cart')) {
      return
    }

    // Set security headers
    const headers = { ...securityHeaders, ...options.customHeaders }
    for (const [header, value] of Object.entries(headers)) {
      setHeader(event, header, value)
    }

    // Skip security for GET requests (read-only operations)
    if (event.node.req.method === 'GET') {
      return
    }

    try {
      const body = await readBody(event)
      const { sessionId, csrfToken, operation } = body

      // Get client identifier for rate limiting
      const clientIP = getClientIP(event) || 'unknown'
      const userAgent = getHeader(event, 'user-agent') || 'unknown'
      const rateLimitKey = `${clientIP}:${userAgent.substring(0, 50)}`

      // Apply rate limiting if not skipped
      if (!options.skipRateLimit && options.rateLimitOperation) {
        const rateLimit = checkRateLimit(
          rateLimitKey,
          options.rateLimitOperation as 'addItem' | 'updateQuantity' | 'removeItem' | 'clearCart' | 'validateCart',
        )

        if (!rateLimit.allowed) {
          // Set rate limit headers
          setHeader(event, 'X-RateLimit-Limit', 0)
          setHeader(event, 'X-RateLimit-Remaining', 0)
          setHeader(
            event,
            'X-RateLimit-Reset',
            Math.ceil((rateLimit.resetTime || Date.now()) / 1000).toString(),
          )
          setHeader(
            event,
            'Retry-After',
            Math.ceil(((rateLimit.resetTime || Date.now()) - Date.now()) / 1000),
          )

          throw createError({
            statusCode: 429,
            statusMessage: 'Too Many Requests',
            data: {
              error: 'Rate limit exceeded',
              resetTime: rateLimit.resetTime,
              retryAfter: Math.ceil((rateLimit.resetTime! - Date.now()) / 1000),
            },
          })
        }

        // Set rate limit headers for successful requests
        setHeader(
          event,
          'X-RateLimit-Remaining',
          rateLimit.remaining!.toString(),
        )
        setHeader(
          event,
          'X-RateLimit-Reset',
          Math.ceil(rateLimit.resetTime! / 1000).toString(),
        )
      }

      // Validate CSRF token if required
      if (options.requireCSRF && operation !== 'getCSRFToken') {
        if (!sessionId || !csrfToken) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            data: {
              error: 'Missing session ID or CSRF token',
              code: 'MISSING_SECURITY_TOKENS',
            },
          })
        }

        if (!validateCSRFToken(sessionId, csrfToken)) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            data: {
              error: 'Invalid or expired CSRF token',
              code: 'CSRF_TOKEN_INVALID',
            },
          })
        }
      }

      // Log security events for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.log('Cart security check passed:', {
          ip: clientIP,
          operation,
          sessionId: sessionId?.substring(0, 10) + '...',
          timestamp: new Date().toISOString(),
        })
      }
    }
    catch (error: any) {
      // Log security violations
      console.warn('Cart security violation:', {
        ip: getClientIP(event),
        url: event.node.req.url,
        method: event.node.req.method,
        error: error.statusMessage || error.message,
        timestamp: new Date().toISOString(),
      })

      throw error
    }
  })
}

/**
 * Get client IP address from request
 */
function getClientIP(event: H3Event): string | null {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const realIP = getHeader(event, 'x-real-ip')
  const remoteAddress = event.node.req.socket?.remoteAddress

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || null
  }

  return realIP || remoteAddress || null
}

/**
 * Security cleanup cron job (runs every 5 minutes)
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    try {
      performSecurityCleanup()
    }
    catch (error: any) {
      console.error('Security cleanup failed:', error)
    }
  }, 5 * 60 * 1000)
}

// Default export for Nuxt middleware
export default createCartSecurityMiddleware({
  requireCSRF: true,
  rateLimitOperation: 'addItem',
  skipRateLimit: false,
})
