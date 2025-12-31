/**
 * Secure Cart Operations API Endpoint
 *
 * Requirements addressed:
 * - Add client-side data validation for cart operations
 * - Implement rate limiting for cart API calls
 * - Add CSRF protection for cart modifications
 *
 * Provides secure server-side cart operations with comprehensive security measures.
 */

import type { H3Event } from 'h3'
import {
  cartValidationSchemas,
  checkRateLimit,
  validateCSRFToken,
  sanitizeCartData,
  securityHeaders,
  validateSessionId,
  isValidProductId,
  rateLimitConfig,
} from '~/server/utils/cartSecurity'

interface SecureCartOperation {
  operation: 'addItem' | 'updateQuantity' | 'removeItem' | 'clearCart' | 'validateCart' | 'getCSRFToken'
  data?: any
  sessionId: string
  csrfToken?: string
}

interface CartValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedData?: unknown
}

interface ProductResponse {
  id: number
  sku: string
  slug: string
  name: Record<string, string>
  description: Record<string, string>
  price: number
  formattedPrice: string
  compareAtPrice: number | null
  formattedCompareAtPrice: string | null
  stockQuantity: number
  stockStatus: string
  images: Array<{ url: string, alt?: string }>
  primaryImage: string
  attributes: Record<string, any>
  category: {
    id: number
    slug: string
    name: string
    description: string
    nameTranslations: Record<string, string>
    breadcrumb: any[]
  }
  relatedProducts: any[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  locale: string
  availableLocales: string[]
}

interface ErrorWithStatusCode extends Error {
  statusCode?: number
  statusMessage?: string
}

interface ZodError extends Error {
  errors?: Array<{
    path: Array<string | number>
    message: string
  }>
}

export default defineEventHandler(async (event) => {
  // Set security headers
  for (const [header, value] of Object.entries(securityHeaders)) {
    setHeader(event, header, value)
  }

  try {
    const body = await readBody(event)
    const { operation, data, sessionId: rawSessionId, csrfToken } = body as SecureCartOperation

    // Validate and sanitize session ID
    const sessionId = validateSessionId(rawSessionId)

    // Get client IP for rate limiting
    const clientIP = getClientIP(event) || 'unknown'
    const rateLimitKey = `${clientIP}:${sessionId}`

    // Handle CSRF token generation (doesn't require rate limiting or CSRF validation)
    if (operation === 'getCSRFToken') {
      const { generateCSRFToken } = await import('~/server/utils/cartSecurity')
      const token = generateCSRFToken(sessionId)

      return {
        success: true,
        csrfToken: token,
        sessionId,
      }
    }

    // Check rate limiting for all other operations
    const rateLimit = checkRateLimit(rateLimitKey, operation)
    if (!rateLimit.allowed) {
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

    // Set rate limit headers
    setHeader(event, 'X-RateLimit-Limit', rateLimitConfig[operation].maxRequests.toString())
    setHeader(event, 'X-RateLimit-Remaining', rateLimit.remaining!.toString())
    setHeader(event, 'X-RateLimit-Reset', Math.ceil(rateLimit.resetTime! / 1000).toString())

    // Validate CSRF token for state-changing operations
    const stateChangingOps: Array<'addItem' | 'updateQuantity' | 'removeItem' | 'clearCart'> = [
      'addItem',
      'updateQuantity',
      'removeItem',
      'clearCart',
    ]
    if (stateChangingOps.includes(operation as 'addItem' | 'updateQuantity' | 'removeItem' | 'clearCart')) {
      if (!csrfToken || !validateCSRFToken(sessionId, csrfToken)) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
          data: {
            error: 'Invalid or missing CSRF token',
            code: 'CSRF_TOKEN_INVALID',
          },
        })
      }
    }

    // Validate operation data
    const validation = validateCartOperationData(operation, data, sessionId, csrfToken)
    if (!validation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          error: 'Validation failed',
          details: validation.errors,
        },
      })
    }

    // Process the cart operation
    const result = await processCartOperation(operation, validation.sanitizedData!, sessionId)

    return {
      success: true,
      operation,
      sessionId,
      data: result,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime,
      },
    }
  }
  catch (error: unknown) {
    // Log security-related errors
    const err = error as ErrorWithStatusCode
    if (err.statusCode === 429 || err.statusCode === 403) {
      console.warn('Cart security violation:', {
        ip: getClientIP(event),
        error: err.statusMessage,
        timestamp: new Date().toISOString(),
      })
    }

    throw error
  }
})

/**
 * Validate cart operation data against schemas
 */
function validateCartOperationData(
  operation: string,
  data: any,
  sessionId: string,
  csrfToken?: string,
): CartValidationResult {
  try {
    let validatedData: any
    const dataWithSession = { ...(data as Record<string, any>), sessionId, csrfToken }

    switch (operation) {
      case 'addItem':
        validatedData = cartValidationSchemas.addItem.parse(dataWithSession)

        // Additional product ID validation
        if (!isValidProductId(validatedData.productId)) {
          return {
            isValid: false,
            errors: ['Invalid product ID format'],
          }
        }
        break

      case 'updateQuantity':
        validatedData = cartValidationSchemas.updateQuantity.parse(dataWithSession)
        break

      case 'removeItem':
        validatedData = cartValidationSchemas.removeItem.parse(dataWithSession)
        break

      case 'clearCart':
        validatedData = cartValidationSchemas.clearCart.parse(dataWithSession)
        break

      case 'validateCart':
        validatedData = cartValidationSchemas.validateCart.parse({ ...data, sessionId })

        // Validate all product IDs in cart items
        for (const item of validatedData.items) {
          if (!isValidProductId(item.productId)) {
            return {
              isValid: false,
              errors: [`Invalid product ID format for item: ${item.id}`],
            }
          }
        }
        break

      default:
        return {
          isValid: false,
          errors: [`Unknown operation: ${operation}`],
        }
    }

    // Sanitize the validated data
    const sanitizedData = sanitizeCartData(validatedData)

    return {
      isValid: true,
      errors: [],
      sanitizedData,
    }
  }
  catch (error: unknown) {
    const zodError = error as ZodError
    if (zodError.errors) {
      // Zod validation errors
      return {
        isValid: false,
        errors: zodError.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      }
    }

    const genericError = error as Error
    return {
      isValid: false,
      errors: [genericError.message || 'Validation failed'],
    }
  }
}

/**
 * Process validated cart operations
 */
async function processCartOperation(
  operation: string,
  data: any,
  _sessionId: string,
): Promise<unknown> {
  switch (operation) {
    case 'addItem':
      return await processAddItem(data)

    case 'updateQuantity':
      return await processUpdateQuantity(data)

    case 'removeItem':
      return await processRemoveItem(data)

    case 'clearCart':
      return await processClearCart(data)

    case 'validateCart':
      return await processValidateCart(data)

    default:
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid operation',
      })
  }
}

/**
 * Process add item operation
 */
async function processAddItem(data: any): Promise<unknown> {
  const { productId, quantity } = data

  try {
    // Fetch product data to validate availability
    const product = await $fetch<ProductResponse>(`/api/products/${productId}`)

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found',
      })
    }

    // Check stock availability
    if (product.stockQuantity < quantity) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Insufficient stock',
        data: {
          available: product.stockQuantity,
          requested: quantity,
        },
      })
    }

    // Return validated product data for client-side cart update
    return {
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        images: product.images,
        stock: product.stockQuantity,
      },
      quantity,
      validated: true,
      timestamp: new Date().toISOString(),
    }
  }
  catch (error: unknown) {
    const err = error as ErrorWithStatusCode
    if (err.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to validate product',
    })
  }
}

/**
 * Process update quantity operation
 */
async function processUpdateQuantity(data: any): Promise<unknown> {
  const { itemId, quantity } = data

  // For quantity updates, we need to validate against current product stock
  // This would typically involve fetching the cart item and checking current stock
  // For now, we'll return a success response with validation timestamp

  return {
    itemId,
    quantity,
    validated: true,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Process remove item operation
 */
async function processRemoveItem(data: any): Promise<unknown> {
  const { itemId } = data

  return {
    itemId,
    removed: true,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Process clear cart operation
 */
async function processClearCart(_data: any): Promise<unknown> {
  return {
    cleared: true,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Process validate cart operation
 */
async function processValidateCart(data: any): Promise<unknown> {
  const { items } = data
  const validationResults = []

  for (const item of items) {
    try {
      // Fetch current product data
      const product = await $fetch<ProductResponse>(`/api/products/${item.productId}`)

      if (!product) {
        validationResults.push({
          itemId: item.id,
          valid: false,
          error: 'Product not found',
          action: 'remove',
        })
        continue
      }

      // Check stock availability
      if (product.stockQuantity === 0) {
        validationResults.push({
          itemId: item.id,
          valid: false,
          error: 'Product out of stock',
          action: 'remove',
        })
        continue
      }

      if (item.quantity > product.stockQuantity) {
        validationResults.push({
          itemId: item.id,
          valid: false,
          error: 'Quantity exceeds available stock',
          action: 'adjust',
          suggestedQuantity: product.stockQuantity,
        })
        continue
      }

      // Item is valid
      validationResults.push({
        itemId: item.id,
        valid: true,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stockQuantity,
        },
      })
    }
    catch {
      validationResults.push({
        itemId: item.id,
        valid: false,
        error: 'Failed to validate product',
        action: 'retry',
      })
    }
  }

  return {
    validationResults,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Get client IP address
 */
function getClientIP(event: H3Event): string | null {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const realIP = getHeader(event, 'x-real-ip')
  const remoteAddress = event.node.req.socket?.remoteAddress

  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const parts = forwarded.split(',')
    return parts[0]?.trim() || null
  }

  if (typeof realIP === 'string') {
    return realIP
  }

  if (typeof remoteAddress === 'string') {
    return remoteAddress
  }

  return null
}
