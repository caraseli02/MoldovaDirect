/**
 * Unit Tests for Cart Cookie Persistence
 * Tests the critical cookie-based storage for SSR compatibility
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '~/stores/cart'
import { nextTick } from 'vue'
import type { Product } from '~/stores/cart/types'

// Mock product for testing
const mockProduct: Product = {
  id: 'test-product-1',
  slug: 'test-product',
  name: 'Test Product',
  price: 25.99,
  images: ['/test-image.jpg'],
  stock: 10,
  category: 'Test'
}

// Mock cookie data
let mockCookieValue: any = null

// Mock useCookie
vi.mock('#app', () => ({
  useCookie: vi.fn((name: string, options?: any) => {
    return {
      value: mockCookieValue
    }
  })
}))

describe('Cart Cookie Persistence', () => {
  beforeEach(() => {
    // Reset cookie mock
    mockCookieValue = null

    // Create fresh Pinia instance
    setActivePinia(createPinia())

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Cookie Synchronization (CRITICAL)', () => {
    it('should use single cookie instance across all operations', async () => {
      const cart = useCartStore()

      // Add item
      await cart.addItem(mockProduct, 2)

      // Save to storage
      const saveResult = await cart.saveToStorage()
      expect(saveResult.success).toBe(true)

      // Verify cookie was written
      expect(mockCookieValue).toBeDefined()
      expect(mockCookieValue.items).toHaveLength(1)
      expect(mockCookieValue.items[0].product.id).toBe(mockProduct.id)
    })

    it('should load cart from cookie on mount', async () => {
      // Set up cookie with cart data
      mockCookieValue = {
        items: [{
          id: 'cart-item-1',
          product: mockProduct,
          quantity: 3,
          addedAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }],
        sessionId: 'test-session-123',
        lastSyncAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        version: '1.0'
      }

      const cart = useCartStore()

      // Simulate onMounted
      await nextTick()
      await cart.loadFromStorage()

      // Verify cart loaded from cookie
      expect(cart.items.length).toBe(1)
      expect(cart.items[0].product.id).toBe(mockProduct.id)
      expect(cart.items[0].quantity).toBe(3)
    })

    it('should handle corrupted cookie data gracefully', async () => {
      // Set corrupted cookie data
      mockCookieValue = {
        items: 'not-an-array', // Invalid
        sessionId: 123 // Wrong type
      }

      const cart = useCartStore()

      // Should not crash
      const result = await cart.loadFromStorage()

      // Should return success but no data loaded
      expect(result.success).toBe(true)
      expect(cart.items.length).toBe(0)
    })

    it('should convert date strings to Date objects on load', async () => {
      const isoDate = '2024-01-15T10:30:00.000Z'

      mockCookieValue = {
        items: [{
          id: 'cart-item-1',
          product: mockProduct,
          quantity: 1,
          addedAt: isoDate,
          lastModified: isoDate
        }],
        sessionId: 'test-session',
        lastSyncAt: isoDate,
        timestamp: isoDate,
        version: '1.0'
      }

      const cart = useCartStore()
      await cart.loadFromStorage()

      // Verify dates were converted
      expect(cart.items[0].addedAt).toBeInstanceOf(Date)
      if (cart.items[0].lastModified) {
        expect(cart.items[0].lastModified).toBeInstanceOf(Date)
      }
    })
  })

  describe('Save/Load Operations', () => {
    it('should save cart data with correct structure', async () => {
      const cart = useCartStore()
      await cart.addItem(mockProduct, 2)

      const result = await cart.saveToStorage()

      expect(result.success).toBe(true)
      expect(mockCookieValue).toMatchObject({
        items: expect.any(Array),
        sessionId: expect.any(String),
        timestamp: expect.any(String),
        version: '1.0'
      })
    })

    it('should clear cart storage', async () => {
      mockCookieValue = {
        items: [{ id: '1', product: mockProduct, quantity: 1, addedAt: new Date() }]
      }

      const cart = useCartStore()
      const result = await cart.clearStorage()

      expect(result.success).toBe(true)
      expect(mockCookieValue).toBeNull()
    })

    it('should handle save failures gracefully', async () => {
      const cart = useCartStore()
      await cart.addItem(mockProduct, 1)

      // Mock cookie write failure
      vi.mocked(global.useCookie).mockImplementationOnce(() => {
        throw new Error('Cookie write failed')
      })

      const result = await cart.saveToStorage()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Data Serialization', () => {
    it('should serialize cart items correctly', async () => {
      const cart = useCartStore()
      await cart.addItem(mockProduct, 1)
      await cart.saveToStorage()

      expect(mockCookieValue.items[0]).toMatchObject({
        id: expect.any(String),
        product: expect.objectContaining({
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price
        }),
        quantity: 1,
        addedAt: expect.any(Date)
      })
    })

    it('should deserialize cart items correctly', async () => {
      const now = new Date()

      mockCookieValue = {
        items: [{
          id: 'test-item',
          product: mockProduct,
          quantity: 5,
          addedAt: now.toISOString(),
          lastModified: now.toISOString()
        }],
        sessionId: 'session-123',
        timestamp: now.toISOString(),
        version: '1.0'
      }

      const cart = useCartStore()
      await cart.loadFromStorage()

      expect(cart.items[0]).toMatchObject({
        id: 'test-item',
        product: expect.objectContaining({
          id: mockProduct.id
        }),
        quantity: 5
      })
      expect(cart.items[0].addedAt).toBeInstanceOf(Date)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty cookie gracefully', async () => {
      mockCookieValue = null

      const cart = useCartStore()
      const result = await cart.loadFromStorage()

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
      expect(cart.items.length).toBe(0)
    })

    it('should handle cookie with no items array', async () => {
      mockCookieValue = {
        sessionId: 'test',
        // Missing items array
      }

      const cart = useCartStore()
      await cart.loadFromStorage()

      expect(cart.items.length).toBe(0)
    })

    it('should handle cookie size limits', async () => {
      const cart = useCartStore()

      // Add many items (simulate large cart)
      for (let i = 0; i < 50; i++) {
        await cart.addItem({
          ...mockProduct,
          id: `product-${i}`,
          name: `Product ${i}`
        }, 1)
      }

      const result = await cart.saveToStorage()

      // Should succeed even with large cart
      expect(result.success).toBe(true)
      expect(mockCookieValue.items.length).toBe(50)
    })
  })
})
