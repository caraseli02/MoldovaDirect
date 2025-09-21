/**
 * Cart Security Composable
 * 
 * Provides client-side security utilities for cart operations including:
 * - Data validation before API calls
 * - CSRF token management
 * - Rate limiting awareness
 * - Secure API communication
 */

import { z } from 'zod'

interface CSRFTokenData {
  token: string
  expires: number
  sessionId: string
}

interface RateLimitInfo {
  remaining: number
  resetTime: number
  retryAfter?: number
}

interface SecureCartResponse {
  success: boolean
  data?: any
  error?: string
  rateLimit?: RateLimitInfo
}

// Client-side validation schemas (matching server-side)
const clientValidationSchemas = {
  addItem: z.object({
    productId: z.string().uuid('Invalid product ID format'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99')
  }),

  updateQuantity: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    quantity: z.number().int().min(0, 'Quantity cannot be negative').max(99, 'Quantity cannot exceed 99')
  }),

  removeItem: z.object({
    itemId: z.string().min(1, 'Item ID is required')
  }),

  cartItems: z.array(z.object({
    id: z.string().min(1, 'Item ID is required'),
    productId: z.string().uuid('Invalid product ID format'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99')
  })).max(50, 'Cart cannot contain more than 50 items')
}

export const useCartSecurity = () => {
  // CSRF token storage
  const csrfTokenData = ref<CSRFTokenData | null>(null)
  
  // Rate limit tracking
  const rateLimitInfo = ref<Record<string, RateLimitInfo>>({})
  
  // Loading states
  const isLoadingCSRF = ref(false)
  const securityError = ref<string | null>(null)

  /**
   * Get or refresh CSRF token
   */
  const getCSRFToken = async (sessionId: string): Promise<string> => {
    // Check if we have a valid cached token
    if (csrfTokenData.value && 
        csrfTokenData.value.sessionId === sessionId &&
        Date.now() < csrfTokenData.value.expires) {
      return csrfTokenData.value.token
    }

    isLoadingCSRF.value = true
    securityError.value = null

    try {
      const response = await $fetch<SecureCartResponse>('/api/cart/secure', {
        method: 'POST',
        body: {
          operation: 'getCSRFToken',
          sessionId
        }
      })

      if (!response.success || !response.csrfToken) {
        throw new Error('Failed to get CSRF token')
      }

      // Cache the token (expires in 23 hours to ensure refresh before server expiry)
      csrfTokenData.value = {
        token: response.csrfToken,
        expires: Date.now() + (23 * 60 * 60 * 1000),
        sessionId
      }

      return response.csrfToken

    } catch (error) {
      securityError.value = error.message || 'Failed to get CSRF token'
      throw error
    } finally {
      isLoadingCSRF.value = false
    }
  }

  /**
   * Validate data before sending to server
   */
  const validateCartData = (operation: string, data: any): { isValid: boolean; errors: string[] } => {
    try {
      switch (operation) {
        case 'addItem':
          clientValidationSchemas.addItem.parse(data)
          break
        case 'updateQuantity':
          clientValidationSchemas.updateQuantity.parse(data)
          break
        case 'removeItem':
          clientValidationSchemas.removeItem.parse(data)
          break
        case 'validateCart':
          clientValidationSchemas.cartItems.parse(data.items || [])
          break
        default:
          return { isValid: false, errors: [`Unknown operation: ${operation}`] }
      }

      return { isValid: true, errors: [] }
    } catch (error) {
      if (error.errors) {
        return {
          isValid: false,
          errors: error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`)
        }
      }
      return { isValid: false, errors: [error.message || 'Validation failed'] }
    }
  }

  /**
   * Check if operation is rate limited
   */
  const isRateLimited = (operation: string): boolean => {
    const rateLimit = rateLimitInfo.value[operation]
    if (!rateLimit) return false

    return rateLimit.remaining <= 0 && Date.now() < rateLimit.resetTime
  }

  /**
   * Get time until rate limit resets
   */
  const getRateLimitResetTime = (operation: string): number => {
    const rateLimit = rateLimitInfo.value[operation]
    if (!rateLimit) return 0

    return Math.max(0, rateLimit.resetTime - Date.now())
  }

  /**
   * Secure API call wrapper
   */
  const secureCartOperation = async (
    operation: string,
    data: any,
    sessionId: string
  ): Promise<any> => {
    // Validate data first
    const validation = validateCartData(operation, data)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    // Check rate limiting
    if (isRateLimited(operation)) {
      const resetTime = getRateLimitResetTime(operation)
      throw new Error(`Rate limited. Try again in ${Math.ceil(resetTime / 1000)} seconds`)
    }

    // Get CSRF token for state-changing operations
    let csrfToken: string | undefined
    if (operation !== 'validateCart') {
      csrfToken = await getCSRFToken(sessionId)
    }

    try {
      const response = await $fetch<SecureCartResponse>('/api/cart/secure', {
        method: 'POST',
        body: {
          operation,
          data,
          sessionId,
          csrfToken
        }
      })

      // Update rate limit info
      if (response.rateLimit) {
        rateLimitInfo.value[operation] = response.rateLimit
      }

      if (!response.success) {
        throw new Error(response.error || 'Operation failed')
      }

      return response.data

    } catch (error) {
      // Handle specific error types
      if (error.statusCode === 429) {
        // Rate limited
        const retryAfter = error.data?.retryAfter || 60
        rateLimitInfo.value[operation] = {
          remaining: 0,
          resetTime: Date.now() + (retryAfter * 1000)
        }
        throw new Error(`Rate limited. Try again in ${retryAfter} seconds`)
      }

      if (error.statusCode === 403) {
        // CSRF token invalid, clear cached token
        csrfTokenData.value = null
        throw new Error('Security token expired. Please try again')
      }

      throw error
    }
  }

  /**
   * Sanitize user input to prevent XSS
   */
  const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return input

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Validate session ID format
   */
  const isValidSessionId = (sessionId: string): boolean => {
    if (!sessionId || typeof sessionId !== 'string') return false
    
    const sessionIdRegex = /^cart_\d+_[a-z0-9]{12}$/
    return sessionIdRegex.test(sessionId)
  }

  /**
   * Generate secure session ID (client-side fallback)
   */
  const generateSecureSessionId = (): string => {
    const timestamp = Date.now()
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    return `cart_${timestamp}_${randomPart}`
  }

  /**
   * Validate product ID format
   */
  const isValidProductId = (productId: string): boolean => {
    if (!productId || typeof productId !== 'string') return false
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(productId)
  }

  /**
   * Secure add item operation
   */
  const secureAddItem = async (productId: string, quantity: number, sessionId: string) => {
    return await secureCartOperation('addItem', { productId, quantity }, sessionId)
  }

  /**
   * Secure update quantity operation
   */
  const secureUpdateQuantity = async (itemId: string, quantity: number, sessionId: string) => {
    return await secureCartOperation('updateQuantity', { itemId, quantity }, sessionId)
  }

  /**
   * Secure remove item operation
   */
  const secureRemoveItem = async (itemId: string, sessionId: string) => {
    return await secureCartOperation('removeItem', { itemId }, sessionId)
  }

  /**
   * Secure clear cart operation
   */
  const secureClearCart = async (sessionId: string) => {
    return await secureCartOperation('clearCart', {}, sessionId)
  }

  /**
   * Secure validate cart operation
   */
  const secureValidateCart = async (items: any[], sessionId: string) => {
    return await secureCartOperation('validateCart', { items }, sessionId)
  }

  /**
   * Clear security data (on logout, etc.)
   */
  const clearSecurityData = () => {
    csrfTokenData.value = null
    rateLimitInfo.value = {}
    securityError.value = null
  }

  return {
    // State
    isLoadingCSRF: readonly(isLoadingCSRF),
    securityError: readonly(securityError),
    rateLimitInfo: readonly(rateLimitInfo),

    // Validation utilities
    validateCartData,
    sanitizeInput,
    isValidSessionId,
    isValidProductId,
    generateSecureSessionId,

    // Rate limiting
    isRateLimited,
    getRateLimitResetTime,

    // CSRF management
    getCSRFToken,

    // Secure operations
    secureAddItem,
    secureUpdateQuantity,
    secureRemoveItem,
    secureClearCart,
    secureValidateCart,

    // Cleanup
    clearSecurityData
  }
}