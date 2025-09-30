/**
 * Cart Core Module Tests
 * 
 * Unit tests for the cart core functionality
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useCartCore } from './core'
import type { Product } from './types'

// Mock product for testing
const mockProduct: Product = {
  id: 'test-product-1',
  slug: 'test-product',
  name: 'Test Product',
  price: 10.99,
  images: ['test-image.jpg'],
  stock: 5,
  category: 'test'
}

describe('Cart Core Module', () => {
  let cartCore: ReturnType<typeof useCartCore>

  beforeEach(() => {
    cartCore = useCartCore()
    // Clear cart before each test
    cartCore.state.value.items = []
    cartCore.state.value.sessionId = null
    cartCore.state.value.loading = false
    cartCore.state.value.error = null
  })

  describe('Initialization', () => {
    it('should initialize cart with empty state', () => {
      expect(cartCore.isEmpty.value).toBe(true)
      expect(cartCore.itemCount.value).toBe(0)
      expect(cartCore.subtotal.value).toBe(0)
    })

    it('should generate session ID on initialization', () => {
      cartCore.initializeCart()
      expect(cartCore.state.value.sessionId).toBeTruthy()
      expect(cartCore.state.value.sessionId).toMatch(/^cart_\d+_[a-z0-9]+$/)
    })
  })

  describe('Adding Items', () => {
    it('should add item to empty cart', async () => {
      await cartCore.addItem(mockProduct, 2)
      
      expect(cartCore.itemCount.value).toBe(2)
      expect(cartCore.subtotal.value).toBe(21.98)
      expect(cartCore.isEmpty.value).toBe(false)
      expect(cartCore.isInCart(mockProduct.id)).toBe(true)
    })

    it('should update quantity when adding existing item', async () => {
      await cartCore.addItem(mockProduct, 1)
      await cartCore.addItem(mockProduct, 2)
      
      expect(cartCore.itemCount.value).toBe(3)
      expect(cartCore.state.value.items).toHaveLength(1)
    })

    it('should throw error when adding more than available stock', async () => {
      await expect(cartCore.addItem(mockProduct, 10)).rejects.toThrow('Only 5 items available')
    })

    it('should throw error when adding invalid quantity', async () => {
      await expect(cartCore.addItem(mockProduct, 0)).rejects.toThrow('Quantity must be a positive integer')
      await expect(cartCore.addItem(mockProduct, -1)).rejects.toThrow('Quantity must be a positive integer')
    })
  })

  describe('Removing Items', () => {
    it('should remove item from cart', async () => {
      await cartCore.addItem(mockProduct, 2)
      const item = cartCore.getItemByProductId(mockProduct.id)
      
      expect(item).toBeTruthy()
      await cartCore.removeItem(item!.id)
      
      expect(cartCore.isEmpty.value).toBe(true)
      expect(cartCore.isInCart(mockProduct.id)).toBe(false)
    })

    it('should throw error when removing non-existent item', async () => {
      await expect(cartCore.removeItem('non-existent')).rejects.toThrow('Item not found in cart')
    })
  })

  describe('Updating Quantities', () => {
    it('should update item quantity', async () => {
      await cartCore.addItem(mockProduct, 2)
      const item = cartCore.getItemByProductId(mockProduct.id)
      
      await cartCore.updateQuantity(item!.id, 4)
      
      expect(cartCore.itemCount.value).toBe(4)
      expect(cartCore.subtotal.value).toBe(43.96)
    })

    it('should remove item when quantity is set to 0', async () => {
      await cartCore.addItem(mockProduct, 2)
      const item = cartCore.getItemByProductId(mockProduct.id)
      
      await cartCore.updateQuantity(item!.id, 0)
      
      expect(cartCore.isEmpty.value).toBe(true)
    })

    it('should throw error when updating to more than available stock', async () => {
      await cartCore.addItem(mockProduct, 2)
      const item = cartCore.getItemByProductId(mockProduct.id)
      
      await expect(cartCore.updateQuantity(item!.id, 10)).rejects.toThrow('Only 5 items available')
    })
  })

  describe('Cart Operations', () => {
    it('should clear all items from cart', async () => {
      await cartCore.addItem(mockProduct, 2)
      expect(cartCore.isEmpty.value).toBe(false)
      
      await cartCore.clearCart()
      
      expect(cartCore.isEmpty.value).toBe(true)
      expect(cartCore.itemCount.value).toBe(0)
      expect(cartCore.subtotal.value).toBe(0)
    })
  })

  describe('Utility Functions', () => {
    it('should generate unique item IDs', () => {
      const id1 = cartCore.generateItemId()
      const id2 = cartCore.generateItemId()
      
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^item_\d+_[a-z0-9]+$/)
    })

    it('should generate unique session IDs', () => {
      const id1 = cartCore.generateSessionId()
      const id2 = cartCore.generateSessionId()
      
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^cart_\d+_[a-z0-9]+$/)
    })
  })

  describe('Getters', () => {
    it('should calculate item count correctly', async () => {
      expect(cartCore.itemCount.value).toBe(0)
      
      await cartCore.addItem(mockProduct, 2)
      expect(cartCore.itemCount.value).toBe(2)
      
      await cartCore.addItem({ ...mockProduct, id: 'product-2' }, 3)
      expect(cartCore.itemCount.value).toBe(5)
    })

    it('should calculate subtotal correctly', async () => {
      expect(cartCore.subtotal.value).toBe(0)
      
      await cartCore.addItem(mockProduct, 2)
      expect(cartCore.subtotal.value).toBe(21.98)
      
      await cartCore.addItem({ ...mockProduct, id: 'product-2', price: 5.50 }, 2)
      expect(cartCore.subtotal.value).toBe(32.98)
    })

    it('should find item by product ID', async () => {
      await cartCore.addItem(mockProduct, 2)
      
      const item = cartCore.getItemByProductId(mockProduct.id)
      expect(item).toBeTruthy()
      expect(item?.product.id).toBe(mockProduct.id)
      expect(item?.quantity).toBe(2)
      
      const nonExistent = cartCore.getItemByProductId('non-existent')
      expect(nonExistent).toBeUndefined()
    })
  })
})