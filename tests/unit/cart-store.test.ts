/**
 * Unit Tests for Cart Core Module
 * Tests core cart functionality including subtotal calculations
 *
 * Tests the cart core module directly to verify calculation correctness
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCartCore } from '~/stores/cart/core'
import type { Product } from '~/stores/cart/types'

// Mock nuxt runtime config
vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    public: {
      siteUrl: 'http://localhost:3000'
    }
  })
}))

// Mock products for testing
const mockProduct1: Product = {
  id: '1',
  slug: 'test-product-1',
  name: 'Test Product 1',
  price: 25.99,
  images: ['/test-image-1.jpg'],
  stock: 10,
  category: 'Test'
}

const mockProduct2: Product = {
  id: '2',
  slug: 'test-product-2',
  name: 'Test Product 2',
  price: 15.50,
  images: ['/test-image-2.jpg'],
  stock: 5,
  category: 'Test'
}

describe('Cart Core Module', () => {
  let cartCore: ReturnType<typeof useCartCore>

  beforeEach(() => {
    cartCore = useCartCore()
    // Clear cart before each test
    cartCore.clearCart()
  })

  describe('Subtotal Calculations', () => {
    it('should calculate subtotal correctly for single item', async () => {
      await cartCore.addItem(mockProduct1, 1)

      // Single item: 25.99 * 1 = 25.99
      expect(cartCore.subtotal.value).toBe(25.99)
    })

    it('should calculate subtotal correctly for multiple quantities', async () => {
      await cartCore.addItem(mockProduct1, 3)

      // 25.99 * 3 = 77.97
      expect(cartCore.subtotal.value).toBeCloseTo(77.97, 2)
    })

    it('should calculate subtotal correctly for multiple items', async () => {
      await cartCore.addItem(mockProduct1, 1) // 25.99
      await cartCore.addItem(mockProduct2, 1) // 15.50

      // 25.99 + 15.50 = 41.49
      expect(cartCore.subtotal.value).toBeCloseTo(41.49, 2)
    })

    it('should calculate subtotal correctly for multiple items with quantities', async () => {
      await cartCore.addItem(mockProduct1, 2) // 25.99 * 2 = 51.98
      await cartCore.addItem(mockProduct2, 3) // 15.50 * 3 = 46.50

      // 51.98 + 46.50 = 98.48
      expect(cartCore.subtotal.value).toBeCloseTo(98.48, 2)
    })

    it('should return 0 for empty cart', () => {
      expect(cartCore.subtotal.value).toBe(0)
    })

    it('should update subtotal when item is removed', async () => {
      await cartCore.addItem(mockProduct1, 1) // 25.99
      await cartCore.addItem(mockProduct2, 1) // 15.50

      expect(cartCore.subtotal.value).toBeCloseTo(41.49, 2)

      // Get the actual item ID (not product ID)
      const itemToRemove = cartCore.state.value.items.find(i => i.product.id === mockProduct1.id)
      await cartCore.removeItem(itemToRemove!.id)

      expect(cartCore.subtotal.value).toBe(15.50)
    })
  })

  describe('Cart Operations', () => {
    it('should add item to cart', async () => {
      await cartCore.addItem(mockProduct1, 1)

      expect(cartCore.itemCount.value).toBe(1)
      expect(cartCore.state.value.items[0].product.id).toBe(mockProduct1.id)
    })

    it('should increase quantity when adding existing item', async () => {
      await cartCore.addItem(mockProduct1, 1)
      await cartCore.addItem(mockProduct1, 1)

      expect(cartCore.itemCount.value).toBe(2)
      expect(cartCore.state.value.items.length).toBe(1)
    })

    it('should remove item from cart', async () => {
      await cartCore.addItem(mockProduct1, 1)

      // Get the actual item ID (not product ID)
      const itemToRemove = cartCore.state.value.items.find(i => i.product.id === mockProduct1.id)
      await cartCore.removeItem(itemToRemove!.id)

      expect(cartCore.itemCount.value).toBe(0)
      expect(cartCore.state.value.items.length).toBe(0)
    })

    it('should clear all items from cart', async () => {
      await cartCore.addItem(mockProduct1, 1)
      await cartCore.addItem(mockProduct2, 1)
      cartCore.clearCart()

      expect(cartCore.itemCount.value).toBe(0)
      expect(cartCore.state.value.items.length).toBe(0)
      expect(cartCore.subtotal.value).toBe(0)
    })
  })
})
