/**
 * Cart Core Module
 * 
 * Handles basic cart operations: add, remove, update items
 * This module contains the essential cart functionality
 */

import { ref, computed, readonly } from 'vue'
import type { 
  Product, 
  CartItem, 
  CartCoreState, 
  CartCoreActions, 
  CartCoreGetters,
  CartError 
} from './types'

// =============================================
// STATE MANAGEMENT
// =============================================

const state = ref<CartCoreState>({
  items: [],
  sessionId: null,
  loading: false,
  error: null,
  lastSyncAt: null,
  // Cart locking state
  isLocked: false,
  lockedAt: null,
  lockedUntil: null,
  lockedByCheckoutSessionId: null
})

// Operation-level locking to prevent race conditions
// Tracks pending operations to ensure serialization
const operationLock = ref({
  isOperating: false,
  pendingOperations: [] as Array<() => Promise<void>>
})

// Performance optimization caches
const _cachedItemCount = ref<number | undefined>(undefined)
const _cachedSubtotal = ref<number | undefined>(undefined)
const _lastItemsHash = ref<string>('')
const _currentItemsHash = ref<string>('')

// =============================================
// COMPUTED PROPERTIES (GETTERS)
// =============================================

const getters: CartCoreGetters = {
  // Memoized total number of items in cart
  get itemCount(): number {
    // Use cached calculation if items haven't changed
    if (
      _cachedItemCount.value !== undefined &&
      _lastItemsHash.value === _currentItemsHash.value
    ) {
      return _cachedItemCount.value
    }

    const count = state.value.items.reduce(
      (total, item) => total + item.quantity,
      0
    )
    _cachedItemCount.value = count
    _lastItemsHash.value = _currentItemsHash.value
    return count
  },

  // Memoized total price of all items
  get subtotal(): number {
    // Use cached calculation if items haven't changed
    if (
      _cachedSubtotal.value !== undefined &&
      _lastItemsHash.value === _currentItemsHash.value
    ) {
      return _cachedSubtotal.value
    }

    const total = state.value.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity
    }, 0)

    _cachedSubtotal.value = total
    _lastItemsHash.value = _currentItemsHash.value
    return total
  },

  // Check if cart is empty
  get isEmpty(): boolean {
    return state.value.items.length === 0
  },

  // Get item by product ID
  getItemByProductId(productId: string): CartItem | undefined {
    return state.value.items.find((item) => item.product.id === productId)
  },

  // Check if product is in cart
  isInCart(productId: string): boolean {
    return state.value.items.some((item) => item.product.id === productId)
  }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Generate unique item ID
 */
function generateItemId(): string {
  return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * Invalidate calculation cache when items change
 */
function invalidateCalculationCache(): void {
  _lastItemsHash.value = _currentItemsHash.value
  _currentItemsHash.value = JSON.stringify(
    state.value.items.map(item => ({ id: item.id, quantity: item.quantity, price: item.product.price }))
  )
  _cachedItemCount.value = undefined
  _cachedSubtotal.value = undefined
}

/**
 * Create cart error object
 */
function createCartError(
  type: CartError['type'],
  code: string,
  message: string,
  retryable: boolean = false,
  context?: Record<string, any>
): CartError {
  return {
    type,
    code,
    message,
    retryable,
    timestamp: new Date(),
    context
  }
}

/**
 * Validate product data
 */
function validateProduct(product: Product): void {
  if (!product.id) {
    throw createCartError('validation', 'INVALID_PRODUCT_ID', 'Product ID is required')
  }
  if (!product.name) {
    throw createCartError('validation', 'INVALID_PRODUCT_NAME', 'Product name is required')
  }
  if (typeof product.price !== 'number' || product.price < 0) {
    throw createCartError('validation', 'INVALID_PRODUCT_PRICE', 'Product price must be a positive number')
  }
  if (typeof product.stock !== 'number' || product.stock < 0) {
    throw createCartError('validation', 'INVALID_PRODUCT_STOCK', 'Product stock must be a non-negative number')
  }
}

/**
 * Validate quantity
 */
function validateQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw createCartError('validation', 'INVALID_QUANTITY', 'Quantity must be a positive integer')
  }
}

/**
 * Check if cart is currently locked
 */
function isCartLocked(): boolean {
  if (!state.value.isLocked || !state.value.lockedUntil) {
    return false
  }

  // Check if lock has expired
  const now = new Date()
  if (state.value.lockedUntil < now) {
    // Auto-unlock if expired
    state.value.isLocked = false
    state.value.lockedAt = null
    state.value.lockedUntil = null
    state.value.lockedByCheckoutSessionId = null
    return false
  }

  return true
}

/**
 * Ensure cart is not locked before modification
 */
function ensureCartNotLocked(): void {
  if (isCartLocked()) {
    throw createCartError(
      'validation',
      'CART_LOCKED',
      'Cart is locked during checkout and cannot be modified',
      false,
      {
        lockedAt: state.value.lockedAt,
        lockedUntil: state.value.lockedUntil,
        lockedBySession: state.value.lockedByCheckoutSessionId
      }
    )
  }
}

/**
 * Execute cart operation with operation-level locking
 * Prevents race conditions from concurrent operations (rapid clicks)
 *
 * Context: Without this lock, rapidly clicking "Add to Cart" 5 times would:
 * 1. Execute 5 concurrent addItem calls
 * 2. Each sees the same cart state (e.g., stock = 10)
 * 3. All 5 succeed even if user only intended 1 item
 * 4. Worse: if stock = 3, cart could have 5 items when only 3 exist
 *
 * Solution: Serialize all cart operations using a lock queue
 * - First operation executes immediately
 * - Subsequent operations queue and execute after previous completes
 * - Guarantees consistent state across rapid interactions
 */
async function withOperationLock<T>(operation: () => Promise<T>): Promise<T> {
  // If another operation is in progress, queue this one
  if (operationLock.value.isOperating) {
    // Debounce: if multiple rapid clicks, only keep the latest
    // This prevents queue buildup from spam clicking
    if (operationLock.value.pendingOperations.length > 0) {
      // Keep only the most recent operation
      operationLock.value.pendingOperations = []
    }

    return new Promise<T>((resolve, reject) => {
      const wrappedOperation = async () => {
        try {
          const result = await operation()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      operationLock.value.pendingOperations.push(wrappedOperation as () => Promise<void>)
    })
  }

  // Mark as operating
  operationLock.value.isOperating = true

  try {
    // Execute the operation
    const result = await operation()
    return result
  } finally {
    // Process next queued operation if any
    const nextOperation = operationLock.value.pendingOperations.shift()
    if (nextOperation) {
      // Don't await - let it run asynchronously
      nextOperation().finally(() => {
        // After this operation completes, check for more
        if (operationLock.value.pendingOperations.length === 0) {
          operationLock.value.isOperating = false
        }
      })
    } else {
      operationLock.value.isOperating = false
    }
  }
}

// =============================================
// CORE ACTIONS
// =============================================

const actions: CartCoreActions = {
  /**
   * Initialize cart session
   */
  initializeCart(): void {
    if (!state.value.sessionId) {
      state.value.sessionId = generateSessionId()
    }
    invalidateCalculationCache()
  },

  /**
   * Add item to cart (with operation-level locking)
   */
  async addItem(product: Product, quantity: number = 1): Promise<void> {
    return withOperationLock(async () => {
      state.value.loading = true
      state.value.error = null

      try {
        // Check if cart is locked
        ensureCartNotLocked()

        // Validate inputs
        validateProduct(product)
        validateQuantity(quantity)

        // Check stock availability
        if (quantity > product.stock) {
          throw createCartError(
            'inventory',
            'INSUFFICIENT_STOCK',
            `Only ${product.stock} items available`,
            false,
            { productId: product.id, requestedQuantity: quantity, availableStock: product.stock }
          )
        }

        const existingItem = getters.getItemByProductId(product.id)

        if (existingItem) {
          // Update quantity if item already exists
          const newQuantity = existingItem.quantity + quantity

          if (newQuantity > product.stock) {
            const available = product.stock - existingItem.quantity
            throw createCartError(
              'inventory',
              'INSUFFICIENT_STOCK_UPDATE',
              `Can only add ${available} more items`,
              false,
              {
                productId: product.id,
                currentQuantity: existingItem.quantity,
                requestedAddition: quantity,
                availableStock: product.stock
              }
            )
          }

          existingItem.quantity = newQuantity
          existingItem.lastModified = new Date()
          // Update product data with latest information
          existingItem.product = { ...existingItem.product, ...product }
        } else {
          // Add new item to cart
          const cartItem: CartItem = {
            id: generateItemId(),
            product,
            quantity,
            addedAt: new Date(),
            source: 'manual'
          }
          state.value.items.push(cartItem)
        }

        // Invalidate cache and update sync time
        invalidateCalculationCache()
        state.value.lastSyncAt = new Date()

      } catch (error) {
        const cartError = error instanceof Error && 'type' in error
          ? error as CartError
          : createCartError('validation', 'ADD_ITEM_FAILED', error instanceof Error ? error.message : 'Failed to add item to cart')

        state.value.error = cartError.message
        throw cartError
      } finally {
        state.value.loading = false
      }
    })
  },

  /**
   * Remove item from cart (with operation-level locking)
   */
  async removeItem(itemId: string): Promise<void> {
    return withOperationLock(async () => {
      state.value.loading = true
      state.value.error = null

      try {
        // Check if cart is locked
        ensureCartNotLocked()

        if (!itemId) {
          throw createCartError('validation', 'INVALID_ITEM_ID', 'Item ID is required')
        }

        const index = state.value.items.findIndex((item) => item.id === itemId)
        if (index === -1) {
          throw createCartError('validation', 'ITEM_NOT_FOUND', 'Item not found in cart', false, { itemId })
        }

        // Remove item from cart
        state.value.items.splice(index, 1)

        // Invalidate cache and update sync time
        invalidateCalculationCache()
        state.value.lastSyncAt = new Date()

      } catch (error) {
        const cartError = error instanceof Error && 'type' in error
          ? error as CartError
          : createCartError('validation', 'REMOVE_ITEM_FAILED', error instanceof Error ? error.message : 'Failed to remove item from cart')

        state.value.error = cartError.message
        throw cartError
      } finally {
        state.value.loading = false
      }
    })
  },

  /**
   * Update item quantity (with operation-level locking)
   */
  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    return withOperationLock(async () => {
      state.value.loading = true
      state.value.error = null

      try {
        // Check if cart is locked
        ensureCartNotLocked()

        if (!itemId) {
          throw createCartError('validation', 'INVALID_ITEM_ID', 'Item ID is required')
        }

        // Handle removal if quantity is 0
        if (quantity === 0) {
          return actions.removeItem(itemId)
        }

        validateQuantity(quantity)

        const item = state.value.items.find((item) => item.id === itemId)
        if (!item) {
          throw createCartError('validation', 'ITEM_NOT_FOUND', 'Item not found in cart', false, { itemId })
        }

        // Check stock availability
        if (quantity > item.product.stock) {
          throw createCartError(
            'inventory',
            'INSUFFICIENT_STOCK',
            `Only ${item.product.stock} items available`,
            false,
            {
              productId: item.product.id,
              requestedQuantity: quantity,
              availableStock: item.product.stock
            }
          )
        }

        // Update quantity
        item.quantity = quantity
        item.lastModified = new Date()

        // Invalidate cache and update sync time
        invalidateCalculationCache()
        state.value.lastSyncAt = new Date()

      } catch (error) {
        const cartError = error instanceof Error && 'type' in error
          ? error as CartError
          : createCartError('validation', 'UPDATE_QUANTITY_FAILED', error instanceof Error ? error.message : 'Failed to update item quantity')

        state.value.error = cartError.message
        throw cartError
      } finally {
        state.value.loading = false
      }
    })
  },

  /**
   * Clear all items from cart
   */
  async clearCart(): Promise<void> {
    state.value.loading = true
    state.value.error = null

    try {
      // Check if cart is locked
      ensureCartNotLocked()

      state.value.items = []
      
      // Invalidate cache and update sync time
      invalidateCalculationCache()
      state.value.lastSyncAt = new Date()

    } catch (error) {
      const cartError = createCartError('validation', 'CLEAR_CART_FAILED', error instanceof Error ? error.message : 'Failed to clear cart')
      state.value.error = cartError.message
      throw cartError
    } finally {
      state.value.loading = false
    }
  },

  generateItemId,
  generateSessionId,

  /**
   * Lock the cart for checkout (client-side)
   */
  async lockCart(checkoutSessionId: string, lockDurationMinutes: number = 30): Promise<void> {
    try {
      const now = new Date()
      const lockUntil = new Date(now.getTime() + lockDurationMinutes * 60 * 1000)

      state.value.isLocked = true
      state.value.lockedAt = now
      state.value.lockedUntil = lockUntil
      state.value.lockedByCheckoutSessionId = checkoutSessionId

      console.log(`Cart locked for checkout session: ${checkoutSessionId} until ${lockUntil}`)
    } catch (error: any) {
      const message = error.message || 'Failed to lock cart'
      state.value.error = message
      throw createCartError('validation', 'LOCK_FAILED', message, true, { checkoutSessionId })
    }
  },

  /**
   * Unlock the cart (client-side)
   */
  async unlockCart(checkoutSessionId?: string): Promise<void> {
    try {
      // Verify session if provided
      if (checkoutSessionId && state.value.lockedByCheckoutSessionId &&
          state.value.lockedByCheckoutSessionId !== checkoutSessionId) {
        // Check if lock has expired
        if (state.value.lockedUntil && new Date() < state.value.lockedUntil) {
          throw createCartError(
            'validation',
            'UNAUTHORIZED_UNLOCK',
            'Cannot unlock cart locked by different session',
            false,
            {
              providedSession: checkoutSessionId,
              lockingSession: state.value.lockedByCheckoutSessionId
            }
          )
        }
      }

      state.value.isLocked = false
      state.value.lockedAt = null
      state.value.lockedUntil = null
      state.value.lockedByCheckoutSessionId = null

      console.log('Cart unlocked')
    } catch (error: any) {
      const message = error.message || 'Failed to unlock cart'
      state.value.error = message
      throw createCartError('validation', 'UNLOCK_FAILED', message, true, { checkoutSessionId })
    }
  },

  /**
   * Check cart lock status (returns current state)
   */
  async checkLockStatus(): Promise<{
    isLocked: boolean
    lockedAt: Date | null
    lockedUntil: Date | null
    lockedBySession: string | null
  }> {
    // Auto-unlock if expired
    isCartLocked()

    return {
      isLocked: state.value.isLocked,
      lockedAt: state.value.lockedAt,
      lockedUntil: state.value.lockedUntil,
      lockedBySession: state.value.lockedByCheckoutSessionId
    }
  },

  /**
   * Check if cart is currently locked
   */
  isCartLocked
}

// =============================================
// COMPOSABLE INTERFACE
// =============================================

export function useCartCore() {
  return {
    // State
    state: readonly(state),

    // Getters
    itemCount: computed(() => getters.itemCount),
    subtotal: computed(() => getters.subtotal),
    isEmpty: computed(() => getters.isEmpty),
    getItemByProductId: getters.getItemByProductId,
    isInCart: getters.isInCart,

    // Lock state
    isLocked: computed(() => state.value.isLocked),
    lockedAt: computed(() => state.value.lockedAt),
    lockedUntil: computed(() => state.value.lockedUntil),
    lockedByCheckoutSessionId: computed(() => state.value.lockedByCheckoutSessionId),

    // Actions
    ...actions,

    // Utilities
    invalidateCalculationCache
  }
}

// =============================================
// DIRECT EXPORTS FOR STORE USAGE
// =============================================

export {
  state as cartCoreState,
  getters as cartCoreGetters,
  actions as cartCoreActions,
  generateItemId,
  generateSessionId,
  invalidateCalculationCache
}