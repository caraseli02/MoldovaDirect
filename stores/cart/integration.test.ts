/**
 * Cart Integration Tests
 * 
 * Tests for the integrated modular cart system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCartStore } from './index'
import type { Product } from './types'

// Mock fetch for API calls
global.$fetch = vi.fn()

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

describe('Cart Integration Tests', () => {
  let cartStore: ReturnType<typeof useCartStore>

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock successful API responses
    vi.mocked($fetch).mockResolvedValue({
      product: mockProduct
    })
    
    // Create fresh cart store instance
    cartStore = useCartStore()
    
    // Initialize cart
    cartStore.initializeCart()
  })

  describe('Core Integration', () => {
    it('should integrate core, persistence, and analytics', async () => {
      expect(cartStore.isEmpty).toBe(true)
      expect(cartStore.itemCount).toBe(0)
      
      await cartStore.addItem(mockProduct, 2)
      
      expect(cartStore.itemCount).toBe(2)
      expect(cartStore.subtotal).toBe(21.98)
      expect(cartStore.isInCart(mockProduct.id)).toBe(true)
    })

    it('should handle validation integration', async () => {
      // Add item to trigger validation queue
      await cartStore.addItem(mockProduct, 1)
      
      // Check that validation module is accessible
      expect(cartStore._modules.validation).toBeDefined()
      expect(cartStore.validationInProgress).toBe(false)
    })

    it('should handle analytics integration', async () => {
      // Check analytics module is accessible
      expect(cartStore._modules.analytics).toBeDefined()
      expect(cartStore.analyticsSessionStartTime).toBeDefined()
      
      // Add item should trigger analytics
      await cartStore.addItem(mockProduct, 1)
      
      // Analytics should be tracking
      expect(cartStore.analyticsLastActivity).toBeDefined()
    })

    it('should handle security integration', async () => {
      // Check security module is accessible
      expect(cartStore._modules.security).toBeDefined()
      expect(cartStore.securityEnabled).toBe(true)
      expect(cartStore.riskLevel).toBe('low')
      
      // Security should be involved in operations
      await cartStore.addItem(mockProduct, 1)
      
      // Should still work even if security fails
      expect(cartStore.itemCount).toBe(1)
    })
  })

  describe('Module Coordination', () => {
    it('should coordinate add item across all modules', async () => {
      const addSpy = vi.spyOn(cartStore._modules.core, 'addItem')
      
      await cartStore.addItem(mockProduct, 2)
      
      // Core should be called
      expect(addSpy).toHaveBeenCalledWith(mockProduct, 2)
      
      // State should be updated
      expect(cartStore.itemCount).toBe(2)
      expect(cartStore.subtotal).toBe(21.98)
    })

    it('should coordinate remove item across all modules', async () => {
      // Add item first
      await cartStore.addItem(mockProduct, 1)
      const item = cartStore.getItemByProductId(mockProduct.id)
      
      expect(item).toBeTruthy()
      
      // Remove item
      const removeSpy = vi.spyOn(cartStore._modules.core, 'removeItem')
      await cartStore.removeItem(item!.id)
      
      // Core should be called
      expect(removeSpy).toHaveBeenCalledWith(item!.id)
      
      // State should be updated
      expect(cartStore.isEmpty).toBe(true)
    })

    it('should coordinate quantity updates across all modules', async () => {
      // Add item first
      await cartStore.addItem(mockProduct, 1)
      const item = cartStore.getItemByProductId(mockProduct.id)
      
      expect(item).toBeTruthy()
      
      // Update quantity
      const updateSpy = vi.spyOn(cartStore._modules.core, 'updateQuantity')
      await cartStore.updateQuantity(item!.id, 3)
      
      // Core should be called
      expect(updateSpy).toHaveBeenCalledWith(item!.id, 3)
      
      // State should be updated
      expect(cartStore.itemCount).toBe(3)
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle core errors gracefully', async () => {
      // Mock core error
      const coreError = new Error('Core operation failed')
      vi.spyOn(cartStore._modules.core, 'addItem').mockRejectedValueOnce(coreError)
      
      await expect(cartStore.addItem(mockProduct, 1)).rejects.toThrow('Core operation failed')
      
      // Cart should remain empty
      expect(cartStore.isEmpty).toBe(true)
    })

    it('should handle security errors gracefully', async () => {
      // Mock security error but core success
      vi.spyOn(cartStore._modules.security, 'secureAddItem').mockRejectedValueOnce(
        new Error('Security check failed')
      )
      
      // Should still work with fallback
      await cartStore.addItem(mockProduct, 1)
      
      expect(cartStore.itemCount).toBe(1)
    })

    it('should handle validation errors gracefully', async () => {
      // Mock validation error
      vi.spyOn(cartStore._modules.validation, 'validateProduct').mockRejectedValueOnce(
        new Error('Validation failed')
      )
      
      // Should still work
      await cartStore.addItem(mockProduct, 1)
      
      expect(cartStore.itemCount).toBe(1)
    })
  })

  describe('Persistence Integration', () => {
    it('should save to storage after operations', async () => {
      const saveSpy = vi.spyOn(cartStore, 'saveToStorage')
      
      await cartStore.addItem(mockProduct, 1)
      
      // Should trigger save
      expect(saveSpy).toHaveBeenCalled()
    })

    it('should load from storage on initialization', async () => {
      const loadSpy = vi.spyOn(cartStore, 'loadFromStorage')
      
      cartStore.initializeCart()
      
      // Should trigger load
      expect(loadSpy).toHaveBeenCalled()
    })
  })

  describe('Backward Compatibility', () => {
    it('should maintain the same public API', () => {
      // Check all expected properties exist
      expect(cartStore.items).toBeDefined()
      expect(cartStore.sessionId).toBeDefined()
      expect(cartStore.loading).toBeDefined()
      expect(cartStore.error).toBeDefined()
      expect(cartStore.itemCount).toBeDefined()
      expect(cartStore.subtotal).toBeDefined()
      expect(cartStore.isEmpty).toBeDefined()
      
      // Check all expected methods exist
      expect(typeof cartStore.addItem).toBe('function')
      expect(typeof cartStore.removeItem).toBe('function')
      expect(typeof cartStore.updateQuantity).toBe('function')
      expect(typeof cartStore.clearCart).toBe('function')
      expect(typeof cartStore.getItemByProductId).toBe('function')
      expect(typeof cartStore.isInCart).toBe('function')
    })

    it('should work exactly like the old API', async () => {
      // This should work exactly as before
      expect(cartStore.isEmpty).toBe(true)
      
      await cartStore.addItem(mockProduct, 2)
      
      expect(cartStore.itemCount).toBe(2)
      expect(cartStore.subtotal).toBe(21.98)
      expect(cartStore.isInCart(mockProduct.id)).toBe(true)
      
      const item = cartStore.getItemByProductId(mockProduct.id)
      expect(item).toBeTruthy()
      expect(item?.quantity).toBe(2)
      
      await cartStore.updateQuantity(item!.id, 3)
      expect(cartStore.itemCount).toBe(3)
      
      await cartStore.removeItem(item!.id)
      expect(cartStore.isEmpty).toBe(true)
    })
  })

  describe('Module Access', () => {
    it('should provide access to individual modules', () => {
      expect(cartStore._modules.core).toBeDefined()
      expect(cartStore._modules.persistence).toBeDefined()
      expect(cartStore._modules.validation).toBeDefined()
      expect(cartStore._modules.analytics).toBeDefined()
      expect(cartStore._modules.security).toBeDefined()
    })

    it('should allow direct module usage for advanced cases', () => {
      const coreModule = cartStore._modules.core
      
      expect(typeof coreModule.addItem).toBe('function')
      expect(typeof coreModule.removeItem).toBe('function')
      expect(typeof coreModule.updateQuantity).toBe('function')
    })
  })
})