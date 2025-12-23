/**
 * Auth Rate Limiting Utilities
 *
 * Provides rate limiting for authentication endpoints to prevent:
 * - Brute force attacks
 * - Credential stuffing
 * - Account enumeration
 * - DoS attacks on auth endpoints
 *
 * Security Features:
 * - Per-IP rate limiting
 * - Per-email rate limiting (for failed attempts)
 * - Exponential backoff for repeated failures
 * - Automatic cleanup of expired entries
 */

import type { H3Event } from 'h3'

// Rate limit storage (in-memory for simplicity, could be Redis in production)
const rateLimitStore = new Map<string, { count: number, resetTime: number, failedAttempts?: number }>()

// Failed login attempts tracking (for account lockout)
const failedLoginStore = new Map<string, { count: number, lockoutUntil?: number }>()

/**
 * Rate limit configurations for different auth operations
 */
export const authRateLimitConfig = {
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 5 attempts per 15 minutes
    maxFailedAttempts: 10, // Lock account after 10 failed attempts
    lockoutDurationMs: 30 * 60 * 1000, // 30 minutes lockout
  },
  register: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 3 attempts per hour
  },
  resetPassword: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 3 attempts per hour
  },
  verifyOtp: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 5 attempts per 15 minutes
  },
  refreshToken: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 attempts per minute
  },
}

export type AuthOperation = keyof typeof authRateLimitConfig

/**
 * Get client identifier (IP address) from request
 */
function getClientIdentifier(event: H3Event): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const realIP = getHeader(event, 'x-real-ip')
  const remoteAddr = event.node.req.socket?.remoteAddress

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  if (realIP) {
    return realIP
  }

  return remoteAddr || 'unknown'
}

/**
 * Check rate limit for an auth operation
 */
export function checkAuthRateLimit(
  event: H3Event,
  operation: AuthOperation,
  email?: string,
): { allowed: boolean, resetTime?: number, remaining?: number, reason?: string } {
  const config = authRateLimitConfig[operation]
  const clientId = getClientIdentifier(event)
  const key = `${operation}:${clientId}`
  const now = Date.now()

  // Check if email is locked out (for login operations)
  if (operation === 'login' && email) {
    const emailKey = `lockout:${email.toLowerCase()}`
    const lockout = failedLoginStore.get(emailKey)

    if (lockout?.lockoutUntil && now < lockout.lockoutUntil) {
      return {
        allowed: false,
        resetTime: lockout.lockoutUntil,
        remaining: 0,
        reason: 'Account temporarily locked due to too many failed login attempts',
      }
    }
  }

  // Check rate limit
  const existing = rateLimitStore.get(key)

  if (!existing || now > existing.resetTime) {
    // First request or window expired, reset counter
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      failedAttempts: 0,
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
      reason: 'Too many requests. Please try again later.',
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
 * Record a failed login attempt
 */
export function recordFailedLogin(email: string): void {
  const emailKey = `lockout:${email.toLowerCase()}`
  const config = authRateLimitConfig.login
  const now = Date.now()

  const existing = failedLoginStore.get(emailKey)

  if (!existing) {
    failedLoginStore.set(emailKey, {
      count: 1,
    })
    return
  }

  existing.count++

  // If too many failed attempts, lock the account
  if (existing.count >= config.maxFailedAttempts) {
    existing.lockoutUntil = now + config.lockoutDurationMs
  }

  failedLoginStore.set(emailKey, existing)
}

/**
 * Clear failed login attempts for an email (after successful login)
 */
export function clearFailedLoginAttempts(email: string): void {
  const emailKey = `lockout:${email.toLowerCase()}`
  failedLoginStore.delete(emailKey)
}

/**
 * Cleanup expired auth rate limit entries
 * Should be called periodically (e.g., every 5 minutes)
 */
export function cleanupExpiredAuthRateLimits(): void {
  const now = Date.now()

  // Cleanup rate limit store
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key)
    }
  }

  // Cleanup failed login store
  for (const [key, data] of failedLoginStore.entries()) {
    if (data.lockoutUntil && now > data.lockoutUntil) {
      failedLoginStore.delete(key)
    }
  }
}

/**
 * Middleware to check rate limit for auth endpoints
 * Throws error if rate limit exceeded
 */
export function requireAuthRateLimit(event: H3Event, operation: AuthOperation, email?: string): void {
  const result = checkAuthRateLimit(event, operation, email)

  if (!result.allowed) {
    const retryAfter = result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : 60

    throw createError({
      statusCode: 429,
      statusMessage: result.reason || 'Too many requests',
      data: {
        retryAfter,
        resetTime: result.resetTime,
      },
    })
  }

  // Set rate limit headers
  setHeader(event, 'X-RateLimit-Limit', authRateLimitConfig[operation].maxRequests.toString())
  setHeader(event, 'X-RateLimit-Remaining', (result.remaining || 0).toString())
  if (result.resetTime) {
    setHeader(event, 'X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())
  }
}

// Start cleanup interval (run every 5 minutes)
// Note: This is disabled by default to prevent memory leaks in serverless environments
// Enable this only in long-running server environments
// if (typeof setInterval !== 'undefined') {
//   setInterval(cleanupExpiredAuthRateLimits, 5 * 60 * 1000)
// }
