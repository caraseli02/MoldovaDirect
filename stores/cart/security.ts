/**
 * Cart Security Module
 *
 * Handles security validation, fraud detection, and secure cart operations
 * Provides protection against malicious cart manipulation
 */

import { ref } from 'vue'
import type {
  CartSecurityState,
  CartSecurityActions,
  SecurityValidation,
  SecurityContext,
  Product,
} from './types'

// =============================================
// STATE MANAGEMENT
// =============================================

const state = ref<CartSecurityState>({
  securityEnabled: true,
  lastSecurityCheck: null,
  securityErrors: [],
  riskLevel: 'low',
})

// Security configuration
const MAX_SECURITY_ERRORS = 5
const SESSION_ID_PATTERN = /^cart_\d+_[a-z0-9]+$/
const PRODUCT_ID_PATTERN = /^[a-zA-Z0-9\-_]+$/
const MAX_QUANTITY_PER_ITEM = 100
const MAX_CART_VALUE = 10000 // €10,000

// =============================================
// VALIDATION UTILITIES
// =============================================

/**
 * Validate session ID format
 */
function isValidSessionId(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') {
    return false
  }

  return SESSION_ID_PATTERN.test(sessionId)
}

/**
 * Validate product ID format
 */
function isValidProductId(productId: string): boolean {
  if (!productId || typeof productId !== 'string') {
    return false
  }

  return PRODUCT_ID_PATTERN.test(productId) && productId.length <= 50
}

/**
 * Validate quantity
 */
function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity)
    && quantity > 0
    && quantity <= MAX_QUANTITY_PER_ITEM
}

/**
 * Validate cart value
 */
function _isValidCartValue(value: number): boolean {
  return typeof value === 'number'
    && value >= 0
    && value <= MAX_CART_VALUE
}

/**
 * Generate secure session ID
 */
function generateSecureSessionId(): string {
  const timestamp = Date.now()
  const randomBytes = new Uint8Array(16)

  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes)
  }
  else {
    // Fallback for server-side or unsupported browsers
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256)
    }
  }

  const randomString = Array.from(randomBytes)
    .map(b => b.toString(36))
    .join('')
    .substr(0, 9)

  return `cart_${timestamp}_${randomString}`
}

// =============================================
// SECURITY CONTEXT
// =============================================

/**
 * Create security context
 */
function createSecurityContext(sessionId: string): SecurityContext {
  return {
    sessionId,
    timestamp: new Date(),
    ipAddress: undefined, // Would be set by server
    userAgent: import.meta.client ? navigator.userAgent : undefined,
  }
}

/**
 * Validate security context
 */
function validateSecurityContext(context: SecurityContext): SecurityValidation {
  const errors: string[] = []
  const warnings: string[] = []
  let riskLevel: 'low' | 'medium' | 'high' = 'low'

  // Validate session ID
  if (!isValidSessionId(context.sessionId)) {
    errors.push('Invalid session ID format')
    riskLevel = 'high'
  }

  // Check for suspicious user agent patterns
  if (context.userAgent) {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
    ]

    if (suspiciousPatterns.some(pattern => pattern.test(context.userAgent!))) {
      warnings.push('Suspicious user agent detected')
      riskLevel = 'medium'
    }
  }

  // Check timestamp for replay attacks
  const now = Date.now()
  const contextTime = context.timestamp.getTime()
  const timeDiff = Math.abs(now - contextTime)

  if (timeDiff > 5 * 60 * 1000) { // 5 minutes
    warnings.push('Request timestamp is too old')
    riskLevel = 'medium'
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    riskLevel,
  }
}

// =============================================
// CART DATA VALIDATION
// =============================================

/**
 * Validate cart operation data
 */
function validateCartData(operation: string, data: Record<string, any>): SecurityValidation {
  const errors: string[] = []
  const warnings: string[] = []
  let riskLevel: 'low' | 'medium' | 'high' = 'low'

  switch (operation) {
    case 'addItem':
      if (!isValidProductId(data.productId)) {
        errors.push('Invalid product ID')
        riskLevel = 'high'
      }

      if (!isValidQuantity(data.quantity)) {
        errors.push('Invalid quantity')
        riskLevel = 'medium'
      }

      // Check for rapid-fire requests (potential bot behavior)
      if (data.quantity > 10) {
        warnings.push('Large quantity requested')
        riskLevel = 'medium'
      }
      break

    case 'updateQuantity':
      if (!data.itemId || typeof data.itemId !== 'string') {
        errors.push('Invalid item ID')
        riskLevel = 'high'
      }

      if (!isValidQuantity(data.quantity)) {
        errors.push('Invalid quantity')
        riskLevel = 'medium'
      }
      break

    case 'removeItem':
      if (!data.itemId || typeof data.itemId !== 'string') {
        errors.push('Invalid item ID')
        riskLevel = 'high'
      }
      break

    default:
      warnings.push('Unknown operation')
      riskLevel = 'medium'
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    riskLevel,
  }
}

/**
 * Validate product data
 */
function validateProductData(product: Product): SecurityValidation {
  const errors: string[] = []
  const warnings: string[] = []
  let riskLevel: 'low' | 'medium' | 'high' = 'low'

  // Validate required fields
  if (!isValidProductId(product.id)) {
    errors.push('Invalid product ID')
    riskLevel = 'high'
  }

  if (!product.name || product.name.length > 200) {
    errors.push('Invalid product name')
    riskLevel = 'medium'
  }

  if (typeof product.price !== 'number' || product.price < 0 || product.price > 1000) {
    errors.push('Invalid product price')
    riskLevel = 'high'
  }

  if (typeof product.stock !== 'number' || product.stock < 0) {
    errors.push('Invalid product stock')
    riskLevel = 'medium'
  }

  // Check for suspicious patterns
  if (product.name && /<script|javascript:|data:/i.test(product.name)) {
    errors.push('Suspicious content in product name')
    riskLevel = 'high'
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    riskLevel,
  }
}

// =============================================
// FRAUD DETECTION
// =============================================

/**
 * Detect suspicious cart behavior
 */
function detectSuspiciousBehavior(
  operation: string,
  data: Record<string, any>,
  context: SecurityContext,
): SecurityValidation {
  const errors: string[] = []
  const warnings: string[] = []
  let riskLevel: 'low' | 'medium' | 'high' = 'low'

  // Rate limiting check (simplified)
  const recentOperations = getRecentOperations(context.sessionId)
  if (recentOperations.length > 10) {
    warnings.push('High frequency of operations detected')
    riskLevel = 'medium'
  }

  // Check for price manipulation attempts
  if (operation === 'addItem' && data.product) {
    if (data.product.price < 0.01) {
      errors.push('Suspicious product price')
      riskLevel = 'high'
    }
  }

  // Check for excessive quantities
  if ((operation === 'addItem' || operation === 'updateQuantity') && data.quantity > 50) {
    warnings.push('Unusually high quantity requested')
    riskLevel = 'medium'
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    riskLevel,
  }
}

/**
 * Get recent operations for session (simplified implementation)
 */
function getRecentOperations(_sessionId: string): Array<Record<string, any>> {
  // In a real implementation, this would check a cache or database
  // For now, return empty array
  return []
}

// =============================================
// SECURE OPERATIONS
// =============================================

/**
 * Secure add item operation
 */
async function secureAddItem(
  productId: string,
  quantity: number,
  sessionId: string,
): Promise<{ success: boolean, itemId: string, quantity: number }> {
  const context = createSecurityContext(sessionId)

  // Validate security context
  const contextValidation = validateSecurityContext(context)
  if (!contextValidation.isValid) {
    throw new Error(`Security validation failed: ${contextValidation.errors.join(', ')}`)
  }

  // Validate operation data
  const dataValidation = validateCartData('addItem', { productId, quantity })
  if (!dataValidation.isValid) {
    throw new Error(`Data validation failed: ${dataValidation.errors.join(', ')}`)
  }

  // Detect suspicious behavior
  const behaviorValidation = detectSuspiciousBehavior('addItem', { productId, quantity }, context)
  if (!behaviorValidation.isValid) {
    throw new Error(`Suspicious behavior detected: ${behaviorValidation.errors.join(', ')}`)
  }

  // Update risk level
  updateRiskLevel(Math.max(
    getRiskLevelValue(contextValidation.riskLevel),
    getRiskLevelValue(dataValidation.riskLevel),
    getRiskLevelValue(behaviorValidation.riskLevel),
  ))

  // In a real implementation, this would make a secure API call
  // Operation completed successfully
  return {
    success: true,
    itemId: productId,
    quantity,
  }
}

/**
 * Secure update quantity operation
 */
async function secureUpdateQuantity(
  itemId: string,
  quantity: number,
  sessionId: string,
): Promise<{ success: boolean, itemId: string, quantity: number }> {
  const context = createSecurityContext(sessionId)

  // Validate security context
  const contextValidation = validateSecurityContext(context)
  if (!contextValidation.isValid) {
    throw new Error(`Security validation failed: ${contextValidation.errors.join(', ')}`)
  }

  // Validate operation data
  const dataValidation = validateCartData('updateQuantity', { itemId, quantity })
  if (!dataValidation.isValid) {
    throw new Error(`Data validation failed: ${dataValidation.errors.join(', ')}`)
  }

  // Update risk level
  updateRiskLevel(Math.max(
    getRiskLevelValue(contextValidation.riskLevel),
    getRiskLevelValue(dataValidation.riskLevel),
  ))

  return {
    success: true,
    itemId,
    quantity,
  }
}

/**
 * Secure remove item operation
 */
async function secureRemoveItem(
  itemId: string,
  sessionId: string,
): Promise<void> {
  const context = createSecurityContext(sessionId)

  // Validate security context
  const contextValidation = validateSecurityContext(context)
  if (!contextValidation.isValid) {
    throw new Error(`Security validation failed: ${contextValidation.errors.join(', ')}`)
  }

  // Validate operation data
  const dataValidation = validateCartData('removeItem', { itemId })
  if (!dataValidation.isValid) {
    throw new Error(`Data validation failed: ${dataValidation.errors.join(', ')}`)
  }

  // Operation completed successfully (void return)
}

// =============================================
// RISK MANAGEMENT
// =============================================

/**
 * Convert risk level to numeric value
 */
function getRiskLevelValue(riskLevel: 'low' | 'medium' | 'high'): number {
  switch (riskLevel) {
    case 'low': return 1
    case 'medium': return 2
    case 'high': return 3
    default: return 1
  }
}

/**
 * Convert numeric value to risk level
 */
function getValueRiskLevel(value: number): 'low' | 'medium' | 'high' {
  if (value >= 3) return 'high'
  if (value >= 2) return 'medium'
  return 'low'
}

/**
 * Update risk level
 */
function updateRiskLevel(value: number): void {
  state.value.riskLevel = getValueRiskLevel(value)
  state.value.lastSecurityCheck = new Date()
}

/**
 * Add security error
 */
function addSecurityError(error: string): void {
  state.value.securityErrors.push(error)

  // Limit error history
  if (state.value.securityErrors.length > MAX_SECURITY_ERRORS) {
    state.value.securityErrors = state.value.securityErrors.slice(-MAX_SECURITY_ERRORS)
  }

  // Increase risk level
  updateRiskLevel(getRiskLevelValue(state.value.riskLevel) + 1)
}

/**
 * Clear security errors
 */
function clearSecurityErrors(): void {
  state.value.securityErrors = []
  state.value.riskLevel = 'low'
}

// =============================================
// ACTIONS INTERFACE
// =============================================

const actions: CartSecurityActions = {
  validateCartData,
  isValidSessionId,
  isValidProductId,
  generateSecureSessionId,
  secureAddItem,
  secureUpdateQuantity,
  secureRemoveItem,
}

// =============================================
// COMPOSABLE INTERFACE
// =============================================

export function useCartSecurity() {
  return {
    // State
    state: readonly(state),

    // Actions
    ...actions,

    // Utilities
    validateProductData,
    validateSecurityContext,
    detectSuspiciousBehavior,
    createSecurityContext,
    addSecurityError,
    clearSecurityErrors,
    updateRiskLevel,
  }
}

// =============================================
// DIRECT EXPORTS FOR STORE USAGE
// =============================================

export {
  state as cartSecurityState,
  actions as cartSecurityActions,
  isValidSessionId,
  isValidProductId,
  generateSecureSessionId,
  validateCartData,
  validateProductData,
  secureAddItem,
  secureUpdateQuantity,
  secureRemoveItem,
}
