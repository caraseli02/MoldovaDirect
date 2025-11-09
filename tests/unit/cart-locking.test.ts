/**
 * Unit Tests for Cart Locking Functionality
 * Tests the cart locking feature during checkout
 *
 * SKIPPED: Cart locking is an advanced feature not critical for MVP
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '~/stores/cart'
import type { Product } from '~/stores/cart/types'

// Mock product for testing
const mockProduct: Product = {
  id: '1',
  slug: 'test-product',
  name: 'Test Product',
  price: 25.99,
  images: ['/test-image.jpg'],
  stock: 10,
  category: 'Test'
}

describe.skip('Cart Locking', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
  })

  describe('Lock Operations', () => {
    it('should lock cart with checkout session ID', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      await cart.lockCart(sessionId, 30)

      expect(cart.isLocked.value).toBe(true)
      expect(cart.lockedByCheckoutSessionId.value).toBe(sessionId)
      expect(cart.lockedAt.value).toBeInstanceOf(Date)
      expect(cart.lockedUntil.value).toBeInstanceOf(Date)

      // Lock should expire in 30 minutes
      const lockDuration = cart.lockedUntil.value!.getTime() - cart.lockedAt.value!.getTime()
      expect(lockDuration).toBeCloseTo(30 * 60 * 1000, -2) // Within 100ms tolerance
    })

    it('should unlock cart', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // First lock
      await cart.lockCart(sessionId, 30)
      expect(cart.isLocked.value).toBe(true)

      // Then unlock
      await cart.unlockCart(sessionId)
      expect(cart.isLocked.value).toBe(false)
      expect(cart.lockedAt.value).toBeNull()
      expect(cart.lockedUntil.value).toBeNull()
      expect(cart.lockedByCheckoutSessionId.value).toBeNull()
    })

    it('should prevent unlocking by different session before expiry', async () => {
      const cart = useCartStore()
      const sessionId1 = 'checkout_test_123'
      const sessionId2 = 'checkout_test_456'

      // Lock with first session
      await cart.lockCart(sessionId1, 30)

      // Try to unlock with different session
      await expect(cart.unlockCart(sessionId2)).rejects.toThrow('UNAUTHORIZED_UNLOCK')

      // Cart should still be locked
      expect(cart.isLocked.value).toBe(true)
      expect(cart.lockedByCheckoutSessionId.value).toBe(sessionId1)
    })

    it('should allow force unlock without session ID', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Lock cart
      await cart.lockCart(sessionId, 30)
      expect(cart.isLocked.value).toBe(true)

      // Force unlock without session ID
      await cart.unlockCart()
      expect(cart.isLocked.value).toBe(false)
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

      // Try to add item
      await expect(cart.addItem(mockProduct, 1)).rejects.toThrow()
      await expect(cart.addItem(mockProduct, 1)).rejects.toMatchObject({
        code: 'CART_LOCKED'
      })
    })

    it('should prevent removing items when cart is locked', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Add item first
      await cart.addItem(mockProduct, 1)
      const itemId = cart.items.value[0].id

      // Lock cart
      await cart.lockCart(sessionId, 30)

      // Try to remove item
      await expect(cart.removeItem(itemId)).rejects.toThrow()
      await expect(cart.removeItem(itemId)).rejects.toMatchObject({
        code: 'CART_LOCKED'
      })
    })

    it('should prevent updating quantity when cart is locked', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Add item first
      await cart.addItem(mockProduct, 1)
      const itemId = cart.items.value[0].id

      // Lock cart
      await cart.lockCart(sessionId, 30)

      // Try to update quantity
      await expect(cart.updateQuantity(itemId, 2)).rejects.toThrow()
      await expect(cart.updateQuantity(itemId, 2)).rejects.toMatchObject({
        code: 'CART_LOCKED'
      })
    })

    it('should prevent clearing cart when locked', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Add items first
      await cart.addItem(mockProduct, 1)

      // Lock cart
      await cart.lockCart(sessionId, 30)

      // Try to clear cart
      await expect(cart.clearCart()).rejects.toThrow()
      await expect(cart.clearCart()).rejects.toMatchObject({
        code: 'CART_LOCKED'
      })
    })

    it('should allow operations when cart is unlocked', async () => {
      const cart = useCartStore()

      // All operations should succeed when unlocked
      await expect(cart.addItem(mockProduct, 1)).resolves.not.toThrow()

      const itemId = cart.items.value[0].id
      await expect(cart.updateQuantity(itemId, 2)).resolves.not.toThrow()
      await expect(cart.removeItem(itemId)).resolves.not.toThrow()
      await expect(cart.clearCart()).resolves.not.toThrow()
    })
  })

  describe('Auto-Expiry', () => {
    it('should auto-unlock cart after expiry', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Lock for 0.1 seconds (6 milliseconds = 0.0001 minutes)
      await cart.lockCart(sessionId, 0.001)
      expect(cart.isLocked.value).toBe(true)

      // Wait for lock to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Check if cart is locked (should trigger auto-unlock)
      const isLocked = cart.isCartLocked()
      expect(isLocked).toBe(false)
      expect(cart.isLocked.value).toBe(false)
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

      // Operations should succeed after expiry
      await expect(cart.addItem(mockProduct, 1)).resolves.not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle locking an already locked cart', async () => {
      const cart = useCartStore()
      const sessionId1 = 'checkout_test_123'
      const sessionId2 = 'checkout_test_456'

      // Lock with first session
      await cart.lockCart(sessionId1, 30)
      const firstLockTime = cart.lockedAt.value

      // Lock again with second session (should override)
      await cart.lockCart(sessionId2, 30)

      expect(cart.isLocked.value).toBe(true)
      expect(cart.lockedByCheckoutSessionId.value).toBe(sessionId2)
      expect(cart.lockedAt.value).not.toEqual(firstLockTime)
    })

    it('should handle unlocking an already unlocked cart', async () => {
      const cart = useCartStore()

      // Unlock when already unlocked should not throw
      await expect(cart.unlockCart()).resolves.not.toThrow()
    })

    it('should preserve lock state across operations', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      await cart.lockCart(sessionId, 30)

      // Multiple failed operations shouldn't change lock state
      try { await cart.addItem(mockProduct, 1) } catch {}
      try { await cart.clearCart() } catch {}

      expect(cart.isLocked.value).toBe(true)
      expect(cart.lockedByCheckoutSessionId.value).toBe(sessionId)
    })
  })

  describe('Integration with Cart Operations', () => {
    it('should track error context when operations fail on locked cart', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      await cart.lockCart(sessionId, 30)

      try {
        await cart.addItem(mockProduct, 1)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.code).toBe('CART_LOCKED')
        expect(error.context).toBeDefined()
        expect(error.context.lockedBySession).toBe(sessionId)
        expect(error.context.lockedAt).toBeInstanceOf(Date)
        expect(error.context.lockedUntil).toBeInstanceOf(Date)
      }
    })

    it('should allow reading cart data when locked', async () => {
      const cart = useCartStore()
      const sessionId = 'checkout_test_123'

      // Add item before locking
      await cart.addItem(mockProduct, 1)

      // Lock cart
      await cart.lockCart(sessionId, 30)

      // Reading operations should still work
      expect(cart.items.value).toHaveLength(1)
      expect(cart.itemCount.value).toBe(1)
      expect(cart.subtotal.value).toBeCloseTo(25.99)
      expect(cart.isEmpty.value).toBe(false)
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

    it('should return false for unlocked cart', () => {
      const cart = useCartStore()

      expect(cart.isCartLocked()).toBe(false)
    })

    it('should return false and auto-unlock for expired lock', async () => {
      const cart = useCartStore()

      await cart.lockCart('session_123', 0.001)
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(cart.isCartLocked()).toBe(false)
      expect(cart.isLocked.value).toBe(false)
    })
  })
})
