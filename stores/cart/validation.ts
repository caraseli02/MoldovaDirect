/**
 * Cart Validation Module
 * 
 * Handles product validation, caching, and background validation
 * Ensures cart items are always up-to-date with current product data
 */

import { ref } from 'vue'
import type { 
  CartValidationState, 
  CartValidationActions, 
  ValidationCache, 
  ValidationQueue, 
  ValidationResult,
  Product,
  CartItem
} from './types'

// =============================================
// STATE MANAGEMENT
// =============================================

const state = ref<CartValidationState>({
  validationCache: {},
  validationQueue: {},
  backgroundValidationEnabled: true,
  lastBackgroundValidation: null,
  validationInProgress: false
})

// Background validation worker reference
let backgroundValidationWorker: NodeJS.Timeout | null = null

// =============================================
// VALIDATION CACHE MANAGEMENT
// =============================================

/**
 * Get cached validation result
 */
function getCachedValidation(productId: string): ValidationResult | null {
  const cached = state.value.validationCache[productId]
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > cached.ttl) {
    // Cache expired, remove it
    delete state.value.validationCache[productId]
    return null
  }

  return {
    isValid: cached.isValid,
    product: cached.product
  }
}

/**
 * Set cached validation result
 */
function setCachedValidation(
  productId: string,
  result: ValidationResult,
  ttl: number = 300000 // Default TTL: 5 minutes
): void {
  state.value.validationCache[productId] = {
    isValid: result.isValid,
    product: result.product,
    timestamp: Date.now(),
    ttl
  }
}

/**
 * Clear validation cache
 */
function clearValidationCache(productId?: string): void {
  if (productId) {
    delete state.value.validationCache[productId]
  } else {
    state.value.validationCache = {}
  }
}

// =============================================
// VALIDATION QUEUE MANAGEMENT
// =============================================

/**
 * Add product to validation queue
 */
function addToValidationQueue(
  productId: string,
  priority: 'high' | 'medium' | 'low' = 'medium'
): void {
  state.value.validationQueue[productId] = {
    priority,
    timestamp: Date.now(),
    retryCount: 0
  }
}

/**
 * Remove product from validation queue
 */
function removeFromValidationQueue(productId: string): void {
  delete state.value.validationQueue[productId]
}

/**
 * Get validation queue sorted by priority
 */
function getValidationQueueByPriority(): string[] {
  const entries = Object.entries(state.value.validationQueue)
  const priorityOrder = { high: 3, medium: 2, low: 1 }

  return entries
    .sort(([, a], [, b]) => {
      // Sort by priority first, then by timestamp (older first)
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return a.timestamp - b.timestamp
    })
    .map(([productId]) => productId)
}

// =============================================
// PRODUCT VALIDATION
// =============================================

/**
 * Validate single product
 */
async function validateSingleProduct(productId: string, cartItem?: CartItem): Promise<ValidationResult> {
  try {
    // Fetch current product data from API
    const response = await $fetch(`/api/products/${cartItem?.product.slug || productId}`)
    const currentProduct = response.product || response

    // Validate product data
    if (!currentProduct) {
      return {
        isValid: false,
        product: cartItem?.product || {} as Product,
        errors: ['Product not found']
      }
    }

    // Check if product is still active
    if (currentProduct.is_active === false) {
      return {
        isValid: false,
        product: currentProduct,
        errors: ['Product is no longer available']
      }
    }

    // Check stock availability
    if (currentProduct.stock <= 0) {
      return {
        isValid: false,
        product: currentProduct,
        errors: ['Product is out of stock']
      }
    }

    // Product is valid
    return {
      isValid: true,
      product: currentProduct,
      warnings: []
    }

  } catch (error: any) {
    console.warn(`Failed to validate product ${productId}:`, error)
    
    // Handle different error scenarios
    if (error?.statusCode === 404) {
      if (process.dev && cartItem?.product) {
        return {
          isValid: true,
          product: cartItem.product,
          warnings: ['Product not found in API; using cached cart snapshot']
        }
      }
      return {
        isValid: false,
        product: cartItem?.product || {} as Product,
        errors: ['Product no longer exists']
      }
    }

    // Network or other error
    if (process.dev && cartItem?.product) {
      return {
        isValid: true,
        product: cartItem.product,
        warnings: ['Product validation skipped due to network error']
      }
    }

    return {
      isValid: false,
      product: cartItem?.product || {} as Product,
      errors: ['Validation failed due to network error'],
      warnings: ['Product validation could not be completed']
    }
  }
}

/**
 * Batch validate multiple products
 */
async function batchValidateProducts(
  productIds: string[], 
  cartItems?: CartItem[]
): Promise<void> {
  if (productIds.length === 0) return

  const validationPromises: Promise<void>[] = []

  for (const productId of productIds) {
    // Check cache first
    const cached = getCachedValidation(productId)
    if (cached) {
      continue // Skip if already cached and valid
    }

    // Find corresponding cart item
    const cartItem = cartItems?.find(item => item.product.id === productId)

    // Add to validation promise batch
    validationPromises.push(
      validateSingleProduct(productId, cartItem).then(result => {
        // Cache the result
        setCachedValidation(productId, result)
        
        // Remove from validation queue on success
        removeFromValidationQueue(productId)
      }).catch(error => {
        console.error(`Batch validation error for ${productId}:`, error)
        
        // Handle retry logic
        const queueItem = state.value.validationQueue[productId]
        if (queueItem) {
          queueItem.retryCount++
          if (queueItem.retryCount >= 3) {
            // Max retries reached, remove from queue
            removeFromValidationQueue(productId)
          }
        }
      })
    )
  }

  if (validationPromises.length > 0) {
    try {
      await Promise.allSettled(validationPromises)
    } catch (error) {
      console.error('Batch validation error:', error)
    }
  }
}

// =============================================
// BACKGROUND VALIDATION
// =============================================

/**
 * Start background validation worker
 */
function startBackgroundValidation(): void {
  if (!state.value.backgroundValidationEnabled || backgroundValidationWorker) {
    return
  }

  backgroundValidationWorker = setInterval(async () => {
    if (state.value.validationInProgress) return

    state.value.validationInProgress = true

    try {
      // Get products that need validation (prioritized)
      const queuedProducts = getValidationQueueByPriority()
      const productsToValidate: string[] = []

      // Add queued products first
      productsToValidate.push(...queuedProducts.slice(0, 3)) // Max 3 from queue

      // Add products that haven't been validated recently
      const now = Date.now()
      const validationInterval = 10 * 60 * 1000 // 10 minutes

      // Note: We would need access to cart items here
      // This will be provided by the main store coordinator
      
      if (productsToValidate.length > 0) {
        await batchValidateProducts(productsToValidate)
        state.value.lastBackgroundValidation = new Date()
      }
    } catch (error) {
      console.error('Background validation error:', error)
    } finally {
      state.value.validationInProgress = false
    }
  }, 30000) // Run every 30 seconds
}

/**
 * Stop background validation worker
 */
function stopBackgroundValidation(): void {
  if (backgroundValidationWorker) {
    clearInterval(backgroundValidationWorker)
    backgroundValidationWorker = null
  }
}

// =============================================
// DEBOUNCED VALIDATION
// =============================================

let debouncedValidationTimeout: NodeJS.Timeout | null = null
const pendingValidations = new Set<string>()

/**
 * Create debounced validation function
 */
function createDebouncedValidation(delay: number = 1000) {
  return function debouncedValidateProduct(productId: string): void {
    pendingValidations.add(productId)

    if (debouncedValidationTimeout) {
      clearTimeout(debouncedValidationTimeout)
    }

    debouncedValidationTimeout = setTimeout(async () => {
      const productIds = Array.from(pendingValidations)
      pendingValidations.clear()

      // Process validations in batches
      await batchValidateProducts(productIds)
    }, delay)
  }
}

// Default debounced validation instance
const debouncedValidateProduct = createDebouncedValidation()

// =============================================
// CART ITEM VALIDATION HELPERS
// =============================================

/**
 * Validate cart item against current product data
 */
async function validateCartItem(cartItem: CartItem): Promise<{
  isValid: boolean
  updatedItem?: CartItem
  changes: string[]
  errors: string[]
}> {
  const result = await validateSingleProduct(cartItem.product.id, cartItem)
  const changes: string[] = []
  const errors: string[] = []

  if (!result.isValid) {
    return {
      isValid: false,
      changes: [],
      errors: result.errors || ['Validation failed']
    }
  }

  const currentProduct = result.product
  const originalPrice = cartItem.product.price
  const originalStock = cartItem.product.stock

  // Create updated cart item
  const updatedItem: CartItem = {
    ...cartItem,
    product: { ...cartItem.product, ...currentProduct },
    lastModified: new Date()
  }

  // Check for significant changes
  if (originalPrice !== currentProduct.price) {
    changes.push(`Price changed from €${originalPrice} to €${currentProduct.price}`)
  }

  // Stock validation and adjustment
  if (currentProduct.stock === 0) {
    errors.push('Product is out of stock')
    return {
      isValid: false,
      changes,
      errors
    }
  } else if (cartItem.quantity > currentProduct.stock) {
    changes.push(`Quantity reduced from ${cartItem.quantity} to ${currentProduct.stock} (limited stock)`)
    updatedItem.quantity = currentProduct.stock
  }

  return {
    isValid: true,
    updatedItem,
    changes,
    errors
  }
}

/**
 * Validate all cart items
 */
async function validateAllCartItems(cartItems: CartItem[]): Promise<{
  validItems: CartItem[]
  invalidItems: CartItem[]
  changes: Array<{ itemId: string; changes: string[] }>
  errors: Array<{ itemId: string; errors: string[] }>
}> {
  const validItems: CartItem[] = []
  const invalidItems: CartItem[] = []
  const changes: Array<{ itemId: string; changes: string[] }> = []
  const errors: Array<{ itemId: string; errors: string[] }> = []

  const validationPromises = cartItems.map(async (item) => {
    const validation = await validateCartItem(item)
    
    if (validation.isValid && validation.updatedItem) {
      validItems.push(validation.updatedItem)
      
      if (validation.changes.length > 0) {
        changes.push({
          itemId: item.id,
          changes: validation.changes
        })
      }
    } else {
      invalidItems.push(item)
      errors.push({
        itemId: item.id,
        errors: validation.errors
      })
    }
  })

  await Promise.allSettled(validationPromises)

  return {
    validItems,
    invalidItems,
    changes,
    errors
  }
}

// =============================================
// ACTIONS INTERFACE
// =============================================

const actions: CartValidationActions = {
  async validateProduct(productId: string): Promise<void> {
    const result = await validateSingleProduct(productId)
    setCachedValidation(productId, result)
  },

  async batchValidateProducts(productIds: string[]): Promise<void> {
    await batchValidateProducts(productIds)
  },

  getCachedValidation,
  setCachedValidation,
  clearValidationCache,
  startBackgroundValidation,
  stopBackgroundValidation
}

// =============================================
// COMPOSABLE INTERFACE
// =============================================

export function useCartValidation() {
  return {
    // State
    state: readonly(state),
    
    // Actions
    ...actions,
    
    // Utilities
    addToValidationQueue,
    removeFromValidationQueue,
    getValidationQueueByPriority,
    validateSingleProduct,
    validateCartItem,
    validateAllCartItems,
    createDebouncedValidation,
    debouncedValidateProduct
  }
}

// =============================================
// DIRECT EXPORTS FOR STORE USAGE
// =============================================

export {
  state as cartValidationState,
  actions as cartValidationActions,
  getCachedValidation,
  setCachedValidation,
  clearValidationCache,
  addToValidationQueue,
  removeFromValidationQueue,
  validateSingleProduct,
  validateCartItem,
  validateAllCartItems,
  startBackgroundValidation,
  stopBackgroundValidation,
  createDebouncedValidation
}
