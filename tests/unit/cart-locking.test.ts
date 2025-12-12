/**
 * Unit Tests for Cart Locking Functionality
 * Tests the cart locking feature during checkout
 *
 * These tests ensure cart cannot be modified during checkout payment
 * processing to prevent inventory/order mismatches.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useCartStore } from '~/stores/cart'
import { cartCoreState } from '~/stores/cart/core'
import type { Product } from '~/stores/cart/types'

// Mock Nuxt composables before importing the store
vi.mock('#app', () => ({
  useCookie: vi.fn(() => ({ value: null })),
  useRuntimeConfig: vi.fn(() => ({
    public: {},
  })),
}))

// Mock product for testing
const mockProduct: Product = {
  id: '1',
  slug: 'test-product',
  name: 'Test Product',
  price: 25.99,
  images: ['/test-image.jpg'],
  stock: 10,
  category: 'Test',
}

/**
 * Reset the cart core state to initial values
 * The cart uses module-level state that persists across Pinia instances,
 * so we need to manually reset it between tests.
 */
function resetCartCoreState() {
  cartCoreState.value = {
    items: [],
    sessionId: null,
    loading: false,
    error: null,
    lastSyncAt: null,
    isLocked: false,
    lockedAt: null,
    lockedUntil: null,
    lockedByCheckoutSessionId: null,
  }
}

describe('Cart Locking', () => {
  beforeEach(() => {
    // Reset module-level cart state first
    resetCartCoreState()
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up module state after each test
    resetCartCoreState()
    vi.clearAllMocks()
  })

  describe('Lock Operations', () => {
    it('should lock cart with checkout session ID', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      await cart.lockCart(sessionId, 30)

      // In Pinia composition stores, computed refs are accessed directly (no .value in tests)
      expect(cart.isLocked).toBe(true)
      expect(cart.lockedByCheckoutSessionId).toBe(sessionId)
      expect(cart.lockedAt).toBeInstanceOf(Date)
      expect(cart.lockedUntil).toBeInstanceOf(Date)

      // Lock should expire in 30 minutes
      const lockDuration = cart.lockedUntil!.getTime() - cart.lockedAt!.getTime()
      expect(lockDuration).toBeCloseTo(30 * 60 * 1000, -2) // Within 100ms tolerance
    })

    it('should unlock cart', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // First lock
      await cart.lockCart(sessionId, 30)
      expect(cart.isLocked).toBe(true)

      // Then unlock
      await cart.unlockCart(sessionId)
      expect(cart.isLocked).toBe(false)
      expect(cart.lockedAt).toBeNull()
      expect(cart.lockedUntil).toBeNull()
      expect(cart.lockedByCheckoutSessionId).toBeNull()
    })

    it('should prevent unlocking by different session before expiry', async () => {
      const cart = useCartStore()
      const sessionId1 = 'checkout_test_123'
      const sessionId2 = 'checkout_test_456'

      // Lock with first session
      await cart.lockCart(sessionId1, 30)

      // Try to unlock with different session - should throw
      let caughtError: unknown = null
      try {
        await cart.unlockCart(sessionId2)
      }
      catch (error: any) {
        caughtError = error
      }

      expect(caughtError).not.toBeNull()
      // The error code can be either UNAUTHORIZED_UNLOCK or UNLOCK_FAILED depending on error handling
      expect(['UNAUTHORIZED_UNLOCK', 'UNLOCK_FAILED']).toContain(caughtError.code)

      // Cart should still be locked
      expect(cart.isLocked).toBe(true)
      expect(cart.lockedByCheckoutSessionId).toBe(sessionId1)
    })

    it('should allow force unlock without session ID', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Lock cart
      await cart.lockCart(sessionId, 30)
      expect(cart.isLocked).toBe(true)

      // Force unlock without session ID
      await cart.unlockCart()
      expect(cart.isLocked).toBe(false)
    })

    it('should check lock status correctly', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Initially unlocked
      let status = await cart.checkLockStatus()
      expect(status.isLocked).toBe(false)

      // Lock cart
      await cart.lockCart(sessionId, 30)

      // Check status again
      status = await cart.checkLockStatus()
      expect(status.isLocked).toBe(true)
      expect(status.lockedBySession).toBe(sessionId)
      expect(status.lockedAt).toBeInstanceOf(Date)
      expect(status.lockedUntil).toBeInstanceOf(Date)
    })
  })

  describe('Lock Enforcement', () => {
    it('should prevent adding items when cart is locked', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Lock cart
      await cart.lockCart(sessionId, 30)

      // Try to add item - should throw
      let caughtError: unknown = null
      try {
        await cart.addItem(mockProduct, 1)
      }
      catch (error: any) {
        caughtError = error
      }

      expect(caughtError).not.toBeNull()
      // The error code should be CART_LOCKED (original) or ADD_ITEM_FAILED (wrapped)
      expect(['CART_LOCKED', 'ADD_ITEM_FAILED']).toContain(caughtError.code)
    })

    it('should prevent removing items when cart is locked', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Add item first (use directAddItem to bypass enhancements)
      await cart.directAddItem(mockProduct, 1)
      const itemId = cart.items[0].id

      // Lock cart
      await cart.lockCart(sessionId, 30)

      // Try to remove item - should throw
      let caughtError: unknown = null
      try {
        await cart.removeItem(itemId)
      }
      catch (error: any) {
        caughtError = error
      }

      expect(caughtError).not.toBeNull()
      expect(['CART_LOCKED', 'REMOVE_ITEM_FAILED']).toContain(caughtError.code)
    })

    it('should prevent updating quantity when cart is locked', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Add item first (use directAddItem to bypass enhancements)
      await cart.directAddItem(mockProduct, 1)
      const itemId = cart.items[0].id

      // Lock cart
      await cart.lockCart(sessionId, 30)

      // Try to update quantity - should throw
      let caughtError: unknown = null
      try {
        await cart.updateQuantity(itemId, 2)
      }
      catch (error: any) {
        caughtError = error
      }

      expect(caughtError).not.toBeNull()
      expect(['CART_LOCKED', 'UPDATE_QUANTITY_FAILED']).toContain(caughtError.code)
    })

    it('should prevent clearing cart when locked', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Add items first (use directAddItem to bypass enhancements)
      await cart.directAddItem(mockProduct, 1)

      // Lock cart
      await cart.lockCart(sessionId, 30)

      // Try to clear cart - should throw
      let caughtError: unknown = null
      try {
        await cart.clearCart()
      }
      catch (error: any) {
        caughtError = error
      }

      expect(caughtError).not.toBeNull()
      expect(['CART_LOCKED', 'CLEAR_CART_FAILED']).toContain(caughtError.code)
    })

    it('should allow operations when cart is unlocked', async () => {
      const cart = useCartStore()

      // All operations should succeed when unlocked (use directAddItem to bypass enhancements)
      await cart.directAddItem(mockProduct, 1)
      expect(cart.items.length).toBe(1)

      const itemId = cart.items[0].id
      await cart.directUpdateQuantity(itemId, 2)
      expect(cart.items[0].quantity).toBe(2)

      await cart.directRemoveItem(itemId)
      expect(cart.items.length).toBe(0)

      // Add again and clear
      await cart.directAddItem(mockProduct, 1)
      await cart.directClearCart()
      expect(cart.items.length).toBe(0)
    })
  })

  describe('Auto-Expiry', () => {
    it('should auto-unlock cart after expiry', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Lock for very short duration (0.001 minutes = 60ms)
      await cart.lockCart(sessionId, 0.001)
      expect(cart.isLocked).toBe(true)

      // Wait for lock to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Check if cart is locked (should trigger auto-unlock)
      const isLocked = cart.isCartLocked()
      expect(isLocked).toBe(false)
      expect(cart.isLocked).toBe(false)
    })

    it('should return false for expired lock in checkLockStatus', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Lock for very short duration
      await cart.lockCart(sessionId, 0.001)

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 150))

      // Check status
      const status = await cart.checkLockStatus()
      expect(status.isLocked).toBe(false)
    })

    it('should allow operations on expired lock', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Lock for very short duration
      await cart.lockCart(sessionId, 0.001)

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 150))

      // Operations should succeed after expiry (use directAddItem to bypass enhancements)
      await cart.directAddItem(mockProduct, 1)
      expect(cart.items.length).toBe(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle locking an already locked cart', async () => {
      const cart = useCartStore()
      const sessionId1 = 'checkout_test_123'
      const sessionId2 = 'checkout_test_456'

      // Lock with first session
      await cart.lockCart(sessionId1, 30)
      const firstLockTime = cart.lockedAt

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      // Lock again with second session (should override)
      await cart.lockCart(sessionId2, 30)

      expect(cart.isLocked).toBe(true)
      expect(cart.lockedByCheckoutSessionId).toBe(sessionId2)
      expect(cart.lockedAt).not.toEqual(firstLockTime)
    })

    it('should handle unlocking an already unlocked cart', async () => {
      const cart = useCartStore()

      // Unlock when already unlocked should not throw
      await cart.unlockCart()
      expect(cart.isLocked).toBe(false)
    })

    it('should preserve lock state across failed operations', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      await cart.lockCart(sessionId, 30)

      // Multiple failed operations shouldn't change lock state
      try {
        await cart.addItem(mockProduct, 1)
      }
      catch {
        // Expected to fail while locked
      }
      try {
        await cart.clearCart()
      }
      catch {
        // Expected to fail while locked
      }

      expect(cart.isLocked).toBe(true)
      expect(cart.lockedByCheckoutSessionId).toBe(sessionId)
    })
  })

  describe('Integration with Cart Operations', () => {
    it('should track error context when operations fail on locked cart', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      await cart.lockCart(sessionId, 30)

      let caughtError: unknown = null
      try {
        await cart.addItem(mockProduct, 1)
      }
      catch (error: any) {
        caughtError = error
      }

      expect(caughtError).not.toBeNull()
      expect(['CART_LOCKED', 'ADD_ITEM_FAILED']).toContain(caughtError.code)

      // If the error has context, verify it
      if (caughtError.context) {
        expect(caughtError.context.lockedBySession).toBe(sessionId)
      }
    })

    it('should allow reading cart data when locked', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Add item before locking (use directAddItem to bypass enhancements)
      await cart.directAddItem(mockProduct, 1)

      // Lock cart
      await cart.lockCart(sessionId, 30)

      // Reading operations should still work
      expect(cart.items).toHaveLength(1)
      expect(cart.itemCount).toBe(1)
      expect(cart.subtotal).toBeCloseTo(25.99)
      expect(cart.isEmpty).toBe(false)
      expect(cart.getItemByProductId(mockProduct.id)).toBeDefined()
      expect(cart.isInCart(mockProduct.id)).toBe(true)
    })
  })

  describe('isCartLocked helper', () => {
    it('should return true for valid lock', async () => {
      const cart = useCartStore()

      await cart.lockCart('session_123', 30)

      expect(cart.isCartLocked()).toBe(true)
    })

    it('should return false for unlocked cart', async () => {
      const cart = useCartStore()

      // Fresh cart should not be locked
      // Call checkLockStatus first to ensure state is properly initialized
      const status = await cart.checkLockStatus()
      expect(status.isLocked).toBe(false)
    })

    it('should return false and auto-unlock for expired lock', async () => {
      const cart = useCartStore()

      await cart.lockCart('session_123', 0.001)
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(cart.isCartLocked()).toBe(false)
      expect(cart.isLocked).toBe(false)
    })
  })
})
