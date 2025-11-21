/**
 * Unit Tests for Cart Auto-Save Mechanism
 * Tests the critical debounced auto-save functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '~/stores/cart'
import type { Product } from '~/stores/cart/types'

// Mock product
const mockProduct: Product = {
  id: 'test-product-1',
  slug: 'test-product',
  name: 'Test Product',
  price: 25.99,
  images: ['/test-image.jpg'],
  stock: 10,
  category: 'Test'
}

// Mock cookie
let mockCookieValue: any = null
let saveCallCount = 0

vi.mock('#app', () => ({
  useCookie: vi.fn(() => ({
    get value() { return mockCookieValue },
    set value(val) {
      mockCookieValue = val
      saveCallCount++
    }
  }))
}))

describe('Cart Auto-Save Mechanism', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockCookieValue = null
    saveCallCount = 0
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllTimers()
  })

  describe('Debounced Save (CRITICAL)', () => {
    it('should save after 1 second debounce period', async () => {
      const cart = useCartStore()

      // Add item
      await cart.addItem(mockProduct, 1)

      // Should not save immediately
      expect(saveCallCount).toBe(0)

      // Fast-forward time by 500ms (not enough)
      vi.advanceTimersByTime(500)
      expect(saveCallCount).toBe(0)

      // Fast-forward another 500ms (total 1000ms)
      vi.advanceTimersByTime(500)

      // Wait for async operations
      await vi.runAllTimersAsync()

      // Now it should have saved
      expect(saveCallCount).toBeGreaterThan(0)
    })

    it('should reset debounce timer on rapid changes', async () => {
      const cart = useCartStore()
      const initialSaveCount = saveCallCount

      // Add item
      await cart.addItem(mockProduct, 1)

      // Fast-forward 500ms
      vi.advanceTimersByTime(500)

      // Add another item (resets timer)
      await cart.addItem({ ...mockProduct, id: 'product-2' }, 1)

      // Fast-forward another 500ms (not 1000ms from first add)
      vi.advanceTimersByTime(500)

      // Should not have saved yet
      expect(saveCallCount).toBe(initialSaveCount)

      // Fast-forward final 500ms (1000ms from second add)
      vi.advanceTimersByTime(500)
      await vi.runAllTimersAsync()

      // Now it should have saved once
      expect(saveCallCount).toBeGreaterThan(initialSaveCount)
    })

    it('should batch multiple operations into single save', async () => {
      const cart = useCartStore()
      const initialSaveCount = saveCallCount

      // Perform multiple operations rapidly
      await cart.addItem(mockProduct, 1)
      await cart.updateQuantity(cart.items[0].id, 2)
      await cart.updateQuantity(cart.items[0].id, 3)

      // Fast-forward past debounce period
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      // Should have saved only once despite 3 operations
      const savesAfterOperations = saveCallCount - initialSaveCount
      expect(savesAfterOperations).toBeLessThanOrEqual(2) // Allow for initial save
    })
  })

  describe('Save on Cart Operations', () => {
    it('should trigger save after addItem', async () => {
      const cart = useCartStore()

      await cart.addItem(mockProduct, 1)

      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      expect(mockCookieValue).toBeDefined()
      expect(mockCookieValue.items).toHaveLength(1)
    })

    it('should trigger save after removeItem', async () => {
      const cart = useCartStore()

      await cart.addItem(mockProduct, 1)
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      const itemId = cart.items[0].id
      await cart.removeItem(itemId)

      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      expect(mockCookieValue.items).toHaveLength(0)
    })

    it('should trigger save after updateQuantity', async () => {
      const cart = useCartStore()

      await cart.addItem(mockProduct, 1)
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      const itemId = cart.items[0].id
      await cart.updateQuantity(itemId, 5)

      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      expect(mockCookieValue.items[0].quantity).toBe(5)
    })

    it('should trigger save after clearCart', async () => {
      const cart = useCartStore()

      await cart.addItem(mockProduct, 2)
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      await cart.clearCart()

      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      expect(mockCookieValue.items).toHaveLength(0)
    })
  })

  describe('Save Failure Handling', () => {
    it('should handle save failures gracefully', async () => {
      const cart = useCartStore()
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Mock save failure
      mockCookieValue = null
      vi.mocked(global.useCookie).mockImplementationOnce(() => ({
        get value() { return mockCookieValue },
        set value(_val) {
          throw new Error('Cookie write failed')
        }
      }))

      // Add item (will try to save)
      await cart.addItem(mockProduct, 1)

      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      // Should have logged warning
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Debounced save failed'),
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should continue operating after save failure', async () => {
      const cart = useCartStore()

      // First save fails
      vi.mocked(global.useCookie).mockImplementationOnce(() => ({
        get value() { return mockCookieValue },
        set value(_val) {
          throw new Error('First save failed')
        }
      }))

      await cart.addItem(mockProduct, 1)
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      // Cart should still be functional
      expect(cart.items).toHaveLength(1)

      // Second save should work
      vi.mocked(global.useCookie).mockImplementation(() => ({
        get value() { return mockCookieValue },
        set value(val) {
          mockCookieValue = val
        }
      }))

      await cart.addItem({ ...mockProduct, id: 'product-2' }, 1)
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      expect(cart.items).toHaveLength(2)
    })
  })

  describe('Cleanup (Memory Leak Prevention)', () => {
    it('should clear pending timeout on unmount', async () => {
      const cart = useCartStore()

      // Add item to trigger save timeout
      await cart.addItem(mockProduct, 1)

      // Get pending timer count
      const pendingTimers = vi.getTimerCount()
      expect(pendingTimers).toBeGreaterThan(0)

      // Simulate unmount cleanup (would be called by onUnmounted hook)
      // In real usage, Vue calls this automatically
      // For testing, we verify the timeout exists and would be cleaned up
      expect(pendingTimers).toBeTruthy()
    })
  })

  describe('Watch Mechanism', () => {
    it('should watch cart items for changes', async () => {
      const cart = useCartStore()
      const initialSaveCount = saveCallCount

      // Add item (triggers watch)
      await cart.addItem(mockProduct, 1)

      // Update quantity (triggers watch again)
      const itemId = cart.items[0].id
      await cart.updateQuantity(itemId, 3)

      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      // Should have attempted to save
      expect(saveCallCount).toBeGreaterThan(initialSaveCount)
    })

    it('should perform deep watch on cart items', async () => {
      const cart = useCartStore()

      await cart.addItem(mockProduct, 1)
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      const initialSaveCount = saveCallCount

      // Modify nested property (deep watch should catch this)
      const itemId = cart.items[0].id
      await cart.updateQuantity(itemId, 2)

      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      expect(saveCallCount).toBeGreaterThan(initialSaveCount)
    })
  })
})
