// Checkout error handling utilities
// Provides comprehensive error handling for checkout flow

import type { CheckoutError } from '~/types/checkout'

// =============================================
// ERROR TYPES AND CODES
// =============================================

export enum CheckoutErrorCode {
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_LENGTH = 'INVALID_LENGTH',

  // Payment errors
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  PAYMENT_PROCESSING_ERROR = 'PAYMENT_PROCESSING_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  CARD_EXPIRED = 'CARD_EXPIRED',
  INVALID_CARD = 'INVALID_CARD',
  PAYMENT_METHOD_NOT_SUPPORTED = 'PAYMENT_METHOD_NOT_SUPPORTED',

  // Inventory errors
  PRODUCT_OUT_OF_STOCK = 'PRODUCT_OUT_OF_STOCK',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  PRODUCT_UNAVAILABLE = 'PRODUCT_UNAVAILABLE',
  PRICE_CHANGED = 'PRICE_CHANGED',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  API_ERROR = 'API_ERROR',

  // System errors
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Shipping errors
  SHIPPING_ADDRESS_INVALID = 'SHIPPING_ADDRESS_INVALID',
  SHIPPING_METHOD_UNAVAILABLE = 'SHIPPING_METHOD_UNAVAILABLE',
  SHIPPING_CALCULATION_FAILED = 'SHIPPING_CALCULATION_FAILED',

  // Order errors
  ORDER_CREATION_FAILED = 'ORDER_CREATION_FAILED',
  ORDER_PROCESSING_FAILED = 'ORDER_PROCESSING_FAILED',
  INVENTORY_UPDATE_FAILED = 'INVENTORY_UPDATE_FAILED',
}

export interface CheckoutErrorDetails {
  code: CheckoutErrorCode
  message: string
  field?: string
  retryable: boolean
  userAction?: string
  technicalDetails?: unknown
  timestamp: Date
}

// =============================================
// ERROR FACTORY FUNCTIONS
// =============================================

export function createValidationError(
  field: string,
  message: string,
  code: CheckoutErrorCode = CheckoutErrorCode.VALIDATION_FAILED,
): CheckoutError {
  return {
    type: 'validation',
    code: code.toString(),
    message,
    field,
    retryable: true,
    userAction: 'Please correct the highlighted fields',
  }
}

export function createPaymentError(
  message: string,
  code: CheckoutErrorCode,
  retryable: boolean = true,
): CheckoutError {
  const userActions: Record<string, string> = {
    [CheckoutErrorCode.PAYMENT_DECLINED]: 'Please try a different payment method or contact your bank',
    [CheckoutErrorCode.INSUFFICIENT_FUNDS]: 'Please check your account balance or use a different payment method',
    [CheckoutErrorCode.CARD_EXPIRED]: 'Please use a different card or update your payment information',
    [CheckoutErrorCode.INVALID_CARD]: 'Please check your card details or use a different payment method',
    [CheckoutErrorCode.PAYMENT_METHOD_NOT_SUPPORTED]: 'Please select a different payment method',
  }

  return {
    type: 'payment',
    code: code.toString(),
    message,
    retryable,
    userAction: userActions[code] || 'Please try again or contact support',
  }
}

export function createInventoryError(
  message: string,
  code: CheckoutErrorCode,
  productName?: string,
): CheckoutError {
  const userActions: Record<string, string> = {
    [CheckoutErrorCode.PRODUCT_OUT_OF_STOCK]: `${productName || 'This product'} is no longer available. Please remove it from your cart`,
    [CheckoutErrorCode.INSUFFICIENT_STOCK]: `Only limited quantity available for ${productName || 'this product'}. Please adjust the quantity`,
    [CheckoutErrorCode.PRICE_CHANGED]: `The price for ${productName || 'this product'} has changed. Please review your order`,
  }

  return {
    type: 'inventory',
    code: code.toString(),
    message,
    retryable: false,
    userAction: userActions[code] || 'Please review your cart and try again',
  }
}

export function createNetworkError(
  message: string,
  code: CheckoutErrorCode = CheckoutErrorCode.NETWORK_ERROR,
): CheckoutError {
  return {
    type: 'network',
    code: code.toString(),
    message,
    retryable: true,
    userAction: 'Please check your internet connection and try again',
  }
}

export function createSystemError(
  message: string,
  code: CheckoutErrorCode = CheckoutErrorCode.SYSTEM_ERROR,
): CheckoutError {
  return {
    type: 'system',
    code: code.toString(),
    message,
    retryable: true,
    userAction: 'Please try again. If the problem persists, contact support',
  }
}

// =============================================
// ERROR PARSING AND HANDLING
// =============================================

export function parseApiError(error: any): CheckoutError {
  // Handle different error formats from API responses
  if (error?.response?.data) {
    const apiError = error.response.data

    if (apiError.code) {
      return parseErrorByCode(apiError.code, apiError.message, apiError.field)
    }
  }

  // Handle network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
    return createNetworkError('Network connection failed')
  }

  // Handle timeout errors
  if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
    return createNetworkError('Request timed out', CheckoutErrorCode.TIMEOUT_ERROR)
  }

  // Handle validation errors
  if (error?.statusCode === 400 || error?.status === 400) {
    return createValidationError(
      error.field || 'general',
      error.message || 'Validation failed',
    )
  }

  // Handle unauthorized errors
  if (error?.statusCode === 401 || error?.status === 401) {
    return createSystemError('Session expired', CheckoutErrorCode.SESSION_EXPIRED)
  }

  // Handle payment errors
  if (error?.statusCode === 402 || error?.status === 402) {
    return createPaymentError(
      error.message || 'Payment failed',
      CheckoutErrorCode.PAYMENT_FAILED,
    )
  }

  // Default system error
  return createSystemError(
    error?.message || 'An unexpected error occurred',
  )
}

export function parseErrorByCode(code: string, message: string, field?: string): CheckoutError {
  const errorCode = code as CheckoutErrorCode

  switch (errorCode) {
    // Validation errors
    case CheckoutErrorCode.VALIDATION_FAILED:
    case CheckoutErrorCode.REQUIRED_FIELD_MISSING:
    case CheckoutErrorCode.INVALID_FORMAT:
    case CheckoutErrorCode.INVALID_LENGTH:
      return createValidationError(field || 'general', message, errorCode)

    // Payment errors
    case CheckoutErrorCode.PAYMENT_FAILED:
    case CheckoutErrorCode.PAYMENT_DECLINED:
    case CheckoutErrorCode.PAYMENT_PROCESSING_ERROR:
    case CheckoutErrorCode.INSUFFICIENT_FUNDS:
    case CheckoutErrorCode.CARD_EXPIRED:
    case CheckoutErrorCode.INVALID_CARD:
    case CheckoutErrorCode.PAYMENT_METHOD_NOT_SUPPORTED:
      return createPaymentError(message, errorCode)

    // Inventory errors
    case CheckoutErrorCode.PRODUCT_OUT_OF_STOCK:
    case CheckoutErrorCode.INSUFFICIENT_STOCK:
    case CheckoutErrorCode.PRODUCT_UNAVAILABLE:
    case CheckoutErrorCode.PRICE_CHANGED:
      return createInventoryError(message, errorCode)

    // Network errors
    case CheckoutErrorCode.NETWORK_ERROR:
    case CheckoutErrorCode.TIMEOUT_ERROR:
    case CheckoutErrorCode.CONNECTION_FAILED:
    case CheckoutErrorCode.API_ERROR:
      return createNetworkError(message, errorCode)

    // System errors
    default:
      return createSystemError(message, errorCode)
  }
}

// =============================================
// ERROR RECOVERY STRATEGIES
// =============================================

export interface ErrorRecoveryStrategy {
  canRecover: boolean
  recoveryAction?: () => Promise<void>
  fallbackAction?: () => Promise<void>
  maxRetries: number
  retryDelay: number
}

export function getErrorRecoveryStrategy(error: CheckoutError): ErrorRecoveryStrategy {
  switch (error.code) {
    case CheckoutErrorCode.NETWORK_ERROR:
    case CheckoutErrorCode.TIMEOUT_ERROR:
    case CheckoutErrorCode.CONNECTION_FAILED:
      return {
        canRecover: true,
        maxRetries: 3,
        retryDelay: 2000, // 2 seconds
      }

    case CheckoutErrorCode.PAYMENT_PROCESSING_ERROR:
    case CheckoutErrorCode.API_ERROR:
      return {
        canRecover: true,
        maxRetries: 2,
        retryDelay: 5000, // 5 seconds
      }

    case CheckoutErrorCode.SESSION_EXPIRED:
      return {
        canRecover: true,
        maxRetries: 1,
        retryDelay: 1000,
        recoveryAction: async () => {
          // Refresh session
          await refreshCheckoutSession()
        },
      }

    case CheckoutErrorCode.INSUFFICIENT_STOCK:
    case CheckoutErrorCode.PRICE_CHANGED:
      return {
        canRecover: true,
        maxRetries: 1,
        retryDelay: 0,
        recoveryAction: async () => {
          // Refresh cart data
          await refreshCartData()
        },
      }

    case CheckoutErrorCode.PRODUCT_OUT_OF_STOCK:
    case CheckoutErrorCode.PRODUCT_UNAVAILABLE:
    case CheckoutErrorCode.PAYMENT_DECLINED:
    case CheckoutErrorCode.INSUFFICIENT_FUNDS:
    case CheckoutErrorCode.CARD_EXPIRED:
    case CheckoutErrorCode.INVALID_CARD:
      return {
        canRecover: false,
        maxRetries: 0,
        retryDelay: 0,
      }

    default:
      return {
        canRecover: error.retryable,
        maxRetries: error.retryable ? 1 : 0,
        retryDelay: 3000,
      }
  }
}

// =============================================
// ERROR LOGGING AND ANALYTICS
// =============================================

export interface ErrorLogEntry {
  error: CheckoutError
  context: {
    sessionId?: string
    userId?: string
    step: string
    timestamp: Date
    userAgent?: string
    url?: string
  }
  stackTrace?: string
  additionalData?: unknown
}

export function logCheckoutError(
  error: CheckoutError,
  context: Partial<ErrorLogEntry['context']>,
  additionalData?: any,
): void {
  const logEntry: ErrorLogEntry = {
    error,
    context: {
      timestamp: new Date(),
      ...context,
    },
    additionalData,
  }

  // Send to analytics/logging service
  if (import.meta.client) {
    try {
      // This would integrate with your analytics service
      // analytics.track('checkout_error', logEntry)

      // Store in local storage for debugging
      const errorLog = JSON.parse(localStorage.getItem('checkout_errors') || '[]')
      errorLog.push(logEntry)

      // Keep only last 50 errors
      if (errorLog.length > 50) {
        errorLog.splice(0, errorLog.length - 50)
      }

      localStorage.setItem('checkout_errors', JSON.stringify(errorLog))
    }
    catch (e: any) {
      console.error('Failed to log checkout error:', e)
    }
  }
}

// =============================================
// ERROR DISPLAY HELPERS
// =============================================

export function getErrorDisplayMessage(error: CheckoutError, locale: string = 'en'): string {
  // This would integrate with your i18n system
  const messages: Record<string, Record<string, string>> = {
    en: {
      [CheckoutErrorCode.VALIDATION_FAILED]: 'Please check the highlighted fields',
      [CheckoutErrorCode.PAYMENT_FAILED]: 'Payment could not be processed',
      [CheckoutErrorCode.NETWORK_ERROR]: 'Connection error. Please try again',
      [CheckoutErrorCode.SYSTEM_ERROR]: 'Something went wrong. Please try again',
    },
    es: {
      [CheckoutErrorCode.VALIDATION_FAILED]: 'Por favor, revise los campos resaltados',
      [CheckoutErrorCode.PAYMENT_FAILED]: 'No se pudo procesar el pago',
      [CheckoutErrorCode.NETWORK_ERROR]: 'Error de conexión. Inténtelo de nuevo',
      [CheckoutErrorCode.SYSTEM_ERROR]: 'Algo salió mal. Inténtelo de nuevo',
    },
  }

  return messages[locale]?.[error.code] || error.message
}

export function getErrorSeverity(error: CheckoutError): 'low' | 'medium' | 'high' | 'critical' {
  switch (error.type) {
    case 'validation':
      return 'low'
    case 'inventory':
      return 'medium'
    case 'payment':
      return 'high'
    case 'network':
      return 'medium'
    case 'system':
      return 'critical'
    default:
      return 'medium'
  }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

async function refreshCheckoutSession(): Promise<void> {
  // Implementation would refresh the checkout session
}

async function refreshCartData(): Promise<void> {
  // Implementation would refresh cart data
}

export function isRetryableError(error: CheckoutError): boolean {
  return error.retryable && getErrorRecoveryStrategy(error).canRecover
}

export function shouldShowUserAction(error: CheckoutError): boolean {
  return !!error.userAction && !isRetryableError(error)
}

export function formatErrorForUser(error: CheckoutError, locale: string = 'en'): {
  title: string
  message: string
  action?: string
  severity: string
} {
  return {
    title: getErrorDisplayMessage(error, locale),
    message: error.message,
    action: error.userAction,
    severity: getErrorSeverity(error),
  }
}
