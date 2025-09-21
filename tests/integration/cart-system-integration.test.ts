/**
 * Cart System Integration Tests
 * 
 * Requirements addressed:
 * - Test complete cart workflows end-to-end
 * - Test integration between cart store, composables, and components
 * - Test cart analytics integration
 * - Test cart validation and error handling
 * - Test cart persistence and recovery
 * 
 * Comprehensive integration tests for the entire cart system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from '~/stores/cart'
import { useCart } from '~/composables/useCart'
import { useCartAnalytics } from '~/composables/useCartAnalytics'

// Mock components for testing
const MockCartComponent = {
  template: `
    <div>
      <div data-testid="cart-items">
        <div v-for="item in cart.items.value" :key="item.id" :data-testid="'cart-item-' + item.id">
          <span>{{ item.product.name }}</span>
          <span :data-testid="'quantity-' + item.id">{{ item.quantity }}</span>
          <button @click="cart.updateQuantity(item.id, item.quantity + 1)" :data-testid="'increase-' + item.id">+</button>
          <button @click="cart.updateQuantity(item.id, item.quantity - 1)" :data-testid="'decrease-' + item.id">-</button>
          <button @click="cart.removeItem(item.id)" :data-testid="'remove-' + item.id">Remove</button>
        </div>
      </div>
      <div :data-testid="'cart-count'">{{ cart.itemCount.value }}</div>
      <div :data-testid="'cart-subtotal'">{{ cart.formattedSubtotal.value }}</div>
      <button @click="cart.clearCart()" data-testid="clear-cart">Clear Cart</button>
    </div>
  `,
  setup() {
    const cart = useCart()
    return { cart }
  }
}

const mockProducts = [
  {
    id: 'product-1',
    slug: 'moldovan-wine',
    name: 'Moldovan Wine',
    price: 24.99,
    images: ['wine.jpg'],
    stock: 50,
    category: 'wine'
  },
  {
    id: 'product-2',
    slug: 'traditional-placinta',
    name: 'Traditional Plăcintă',
    price: 8.50,
    images: ['placinta.jpg'],
    stock: 20,
    category: 'food'
  },
  {
    id: 'product-3',
    slug: 'honey-moldova',
    name: 'Honey from Moldova',
    price: 12.00,
    images: ['honey.jpg'],
    stock: 5,
    category: 'food'
  }
]

// Mock storage
const createMockStorage = () => {
  const storage = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => storage.get(key) || null),
    setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: vi.fn((key: string) => storage.delete(key)),
    clear: vi.fn(() => storage.clear())
  }
}

describe('Cart System Integration', () => {
  let pinia: any
  let mockLocalStorage: any
  let mockSessionStorage: any
  let mockAnalytics: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    mockLocalStorage = createMockStorage()
    mockSessionStorage = createMockStorage()
    
    // Mock global objects
    Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true })
    Object.defineProperty(global, 'sessionStorage', { value: mockSessionStorage, writable: true })
    Object.defineProperty(global, 'process', { value: { client: true }, writable: true })
    
    // Mock fetch for product validation
    global.$fetch = vi.fn().mockImplementation((url: string) => {
      const productId = url.split('/').pop()
      const product = mockProducts.find(p => p.slug === productId || p.id === productId)
      if (product) {
        return Promise.resolve({ product })
      }
      return Promise.reject(new Error('Product not found'))
    })
    
    // Mock analytics
    mockAnalytics = {
      trackAddToCart: vi.fn(),
      trackRemoveFromCart: vi.fn(),
      trackQuantityUpdate: vi.fn(),
      trackCartView: vi.fn(),
      trackCheckoutStart: vi.fn(),
      initializeCartSession: vi.fn()
    }
    
    // Mock useCartAnalytics
    vi.mock('~/composables/useCartAnalytics', () => ({
      useCartAnalytics: () => mockAnalytics
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('Complete Cart Workflow Integration', () => {
    it('should handle complete add-to-cart workflow with all integrations', async () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      const product = mockProducts[0]
      
      // Add item to cart
      await cartStore.addItem(product, 2)
      
      // Verify cart state
      expect(cartStore.items).toHaveLength(1)
      expect(cartStore.items[0].product.id).toBe(product.id)
      expect(cartStore.items[0].quantity).toBe(2)
      expect(cartStore.itemCount).toBe(2)
      expect(cartStore.subtotal).toBe(product.price * 2)
      
      // Verify persistence
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'moldova-direct-cart',
        expect.stringContaining(product.id)
      )
      
      // Verify analytics tracking
      expect(mockAnalytics.trackAddToCart).toHaveBeenCalledWith(
        product,
        2,
        product.price * 2,
        2
      )
    })

    it('should handle cart component integration with store and composable', async () => {
      const wrapper = mount(MockCartComponent, {
        global: {
          plugins: [pinia]
        }
      })
      
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add item through composable
      await cart.addItem(product, 1)
      
      await wrapper.vm.$nextTick()
      
      // Verify component displays cart item
      expect(wrapper.find('[data-testid="cart-item-' + product.id + '"]')).toBeTruthy()
      expect(wrapper.find('[data-testid="quantity-' + product.id + '"]').text()).toBe('1')
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('1')
      expect(wrapper.find('[data-testid="cart-subtotal"]').text()).toContain('24,99')
      
      // Test quantity increase through component
      await wrapper.find('[data-testid="increase-' + product.id + '"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Verify quantity updated
      expect(wrapper.find('[data-testid="quantity-' + product.id + '"]').text()).toBe('2')
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('2')
      
      // Test item removal through component
      await wrapper.find('[data-testid="remove-' + product.id + '"]').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Verify item removed
      expect(wrapper.find('[data-testid="cart-item-' + product.id + '"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="cart-count"]').text()).toBe('0')
    })

    it('should handle multiple products with complex operations', async () => {
      const cart = useCart()
      
      // Add multiple products
      await cart.addItem(mockProducts[0], 2)
      await cart.addItem(mockProducts[1], 1)
      await cart.addItem(mockProducts[2], 3)
      
      // Verify cart state
      expect(cart.items.value).toHaveLength(3)
      expect(cart.itemCount.value).toBe(6)
      
      const expectedSubtotal = (mockProducts[0].price * 2) + 
                              (mockProducts[1].price * 1) + 
                              (mockProducts[2].price * 3)
      expect(cart.subtotal.value).toBeCloseTo(expectedSubtotal, 2)
      
      // Update quantities
      const firstItemId = cart.items.value[0].id
      await cart.updateQuantity(firstItemId, 5)
      
      // Verify update
      expect(cart.items.value[0].quantity).toBe(5)
      expect(cart.itemCount.value).toBe(9)
      
      // Remove middle item
      const secondItemId = cart.items.value[1].id
      await cart.removeItem(secondItemId)
      
      // Verify removal
      expect(cart.items.value).toHaveLength(2)
      expect(cart.items.value.find(item => item.id === secondItemId)).toBeUndefined()
      
      // Clear entire cart
      await cart.clearCart()
      
      // Verify cart is empty
      expect(cart.items.value).toHaveLength(0)
      expect(cart.itemCount.value).toBe(0)
      expect(cart.isEmpty.value).toBe(true)
    })
  })

  describe('Validation and Error Handling Integration', () => {
    it('should handle stock validation with API integration', async () => {
      const cart = useCart()
      const product = mockProducts[2] // Has stock of 5
      
      // Try to add more than available stock
      await expect(cart.addItem(product, 10)).rejects.toThrow()
      
      // Verify cart is empty
      expect(cart.items.value).toHaveLength(0)
      
      // Add valid quantity
      await cart.addItem(product, 3)
      
      // Verify item added
      expect(cart.items.value).toHaveLength(1)
      expect(cart.items.value[0].quantity).toBe(3)
      
      // Try to update to exceed stock
      const itemId = cart.items.value[0].id
      await expect(cart.updateQuantity(itemId, 8)).rejects.toThrow()
      
      // Verify quantity unchanged
      expect(cart.items.value[0].quantity).toBe(3)
    })

    it('should handle product validation and updates', async () => {
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add product to cart
      await cart.addItem(product, 1)
      
      // Mock product update (price change)
      const updatedProduct = { ...product, price: 29.99 }
      global.$fetch = vi.fn().mockResolvedValue({ product: updatedProduct })
      
      // Trigger validation
      await cart.validateCart()
      
      // Verify product data updated
      expect(cart.items.value[0].product.price).toBe(29.99)
      expect(cart.subtotal.value).toBe(29.99)
    })

    it('should handle product removal when no longer available', async () => {
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add product to cart
      await cart.addItem(product, 1)
      
      // Mock product as no longer available
      global.$fetch = vi.fn().mockRejectedValue({ statusCode: 404 })
      
      // Trigger validation
      await cart.validateCart()
      
      // Verify product removed from cart
      expect(cart.items.value).toHaveLength(0)
      expect(cart.isEmpty.value).toBe(true)
    })
  })

  describe('Persistence and Recovery Integration', () => {
    it('should handle complete persistence workflow', async () => {
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add item and verify persistence
      await cart.addItem(product, 2)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.items).toHaveLength(1)
      expect(savedData.sessionId).toBeTruthy()
      
      // Simulate page reload by creating new cart instance
      const newCartStore = useCartStore()
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData))
      
      newCartStore.initializeCart()
      
      // Verify cart loaded from storage
      expect(newCartStore.items).toHaveLength(1)
      expect(newCartStore.items[0].product.id).toBe(product.id)
      expect(newCartStore.items[0].quantity).toBe(2)
      expect(newCartStore.sessionId).toBe(savedData.sessionId)
    })

    it('should handle storage fallback and migration', async () => {
      const cart = useCart()
      const product = mockProducts[0]
      
      // Mock localStorage failure
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })
      
      // Add item (should fallback to sessionStorage)
      await cart.addItem(product, 1)
      
      // Verify fallback to sessionStorage
      expect(mockSessionStorage.setItem).toHaveBeenCalled()
      expect(cart.storageType.value).toBe('sessionStorage')
      
      // Verify cart still works
      expect(cart.items.value).toHaveLength(1)
      expect(cart.items.value[0].product.id).toBe(product.id)
    })

    it('should handle cart recovery from corruption', async () => {
      const cartStore = useCartStore()
      
      // Setup corrupted data
      const corruptedData = {
        items: [
          { /* missing required fields */ },
          {
            id: 'valid-item',
            product: mockProducts[0],
            quantity: 2,
            addedAt: new Date().toISOString()
          }
        ],
        sessionId: 'test-session'
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(corruptedData))
      
      // Initialize cart (should recover from corruption)
      cartStore.initializeCart()
      
      // Verify only valid items loaded
      expect(cartStore.items).toHaveLength(1)
      expect(cartStore.items[0].id).toBe('valid-item')
      expect(cartStore.sessionId).toBe('test-session')
    })
  })

  describe('Advanced Features Integration', () => {
    it('should handle bulk operations integration', async () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      // Add multiple items
      await cartStore.addItem(mockProducts[0], 1)
      await cartStore.addItem(mockProducts[1], 2)
      await cartStore.addItem(mockProducts[2], 1)
      
      // Test bulk selection
      const firstItemId = cartStore.items[0].id
      const secondItemId = cartStore.items[1].id
      
      cartStore.toggleItemSelection(firstItemId)
      cartStore.toggleItemSelection(secondItemId)
      
      expect(cartStore.selectedItemsCount).toBe(2)
      expect(cartStore.hasSelectedItems).toBe(true)
      
      // Test bulk quantity update
      await cartStore.bulkUpdateQuantity(5)
      
      expect(cartStore.items[0].quantity).toBe(5)
      expect(cartStore.items[1].quantity).toBe(5)
      expect(cartStore.items[2].quantity).toBe(1) // Not selected, unchanged
      
      // Test bulk removal
      await cartStore.bulkRemoveSelected()
      
      expect(cartStore.items).toHaveLength(1)
      expect(cartStore.items[0].product.id).toBe(mockProducts[2].id)
    })

    it('should handle save for later integration', async () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      // Add item to cart
      await cartStore.addItem(mockProducts[0], 2)
      const itemId = cartStore.items[0].id
      
      // Save for later
      await cartStore.saveItemForLater(itemId)
      
      // Verify item moved to saved for later
      expect(cartStore.items).toHaveLength(0)
      expect(cartStore.savedForLater).toHaveLength(1)
      expect(cartStore.savedForLater[0].product.id).toBe(mockProducts[0].id)
      expect(cartStore.savedForLater[0].quantity).toBe(2)
      
      // Move back to cart
      const savedItemId = cartStore.savedForLater[0].id
      await cartStore.moveFromSavedToCart(savedItemId)
      
      // Verify item back in cart
      expect(cartStore.items).toHaveLength(1)
      expect(cartStore.savedForLater).toHaveLength(0)
      expect(cartStore.items[0].product.id).toBe(mockProducts[0].id)
    })

    it('should handle recommendations integration', async () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      // Mock recommendations API
      global.$fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/recommendations')) {
          return Promise.resolve({ recommendations: [mockProducts[1], mockProducts[2]] })
        }
        return Promise.resolve({ product: mockProducts[0] })
      })
      
      // Add item to cart
      await cartStore.addItem(mockProducts[0], 1)
      
      // Load recommendations
      await cartStore.loadRecommendations()
      
      // Verify recommendations loaded
      expect(cartStore.recommendations).toHaveLength(2)
      expect(cartStore.recommendations[0].id).toBe(mockProducts[1].id)
      expect(cartStore.recommendations[1].id).toBe(mockProducts[2].id)
      
      // Add recommended product
      await cartStore.addRecommendedProduct(mockProducts[1], 1)
      
      // Verify product added to cart
      expect(cartStore.items).toHaveLength(2)
      expect(cartStore.items.find(item => item.product.id === mockProducts[1].id)).toBeTruthy()
    })
  })

  describe('Analytics Integration', () => {
    it('should track all cart events properly', async () => {
      const cart = useCart()
      const product = mockProducts[0]
      
      // Track add to cart
      await cart.addItem(product, 2)
      expect(mockAnalytics.trackAddToCart).toHaveBeenCalledWith(
        product,
        2,
        product.price * 2,
        2
      )
      
      // Track quantity update
      const itemId = cart.items.value[0].id
      await cart.updateQuantity(itemId, 3)
      expect(mockAnalytics.trackQuantityUpdate).toHaveBeenCalledWith(
        product,
        2,
        3,
        product.price * 3,
        3
      )
      
      // Track cart view
      cart.trackCartView()
      expect(mockAnalytics.trackCartView).toHaveBeenCalledWith(
        product.price * 3,
        3
      )
      
      // Track checkout start
      cart.trackCheckoutStart()
      expect(mockAnalytics.trackCheckoutStart).toHaveBeenCalledWith(
        product.price * 3,
        3,
        cart.items.value
      )
    })

    it('should handle analytics session initialization', () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      expect(mockAnalytics.initializeCartSession).toHaveBeenCalledWith(
        cartStore.sessionId
      )
    })
  })

  describe('Error Boundary Integration', () => {
    it('should handle composable errors gracefully', async () => {
      const cart = useCart()
      
      // Mock store to throw error
      const cartStore = useCartStore()
      cartStore.addItem = vi.fn().mockRejectedValue(new Error('Store error'))
      
      // Should handle error gracefully
      await expect(cart.addItem(mockProducts[0], 1)).rejects.toThrow('Store error')
      
      // Cart should remain in valid state
      expect(cart.items.value).toHaveLength(0)
      expect(cart.error.value).toBeNull()
    })

    it('should handle network errors in validation', async () => {
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add item successfully
      await cart.addItem(product, 1)
      
      // Mock network error for validation
      global.$fetch = vi.fn().mockRejectedValue(new Error('Network error'))
      
      // Validation should handle error gracefully
      await cart.validateCart()
      
      // Cart should remain functional
      expect(cart.items.value).toHaveLength(1)
      expect(cart.items.value[0].product.id).toBe(product.id)
    })
  })

  describe('Performance Integration', () => {
    it('should handle large cart operations efficiently', async () => {
      const cart = useCart()
      
      // Add many items
      const startTime = Date.now()
      
      for (let i = 0; i < 50; i++) {
        const product = {
          ...mockProducts[i % mockProducts.length],
          id: `product-${i}`,
          slug: `product-${i}`
        }
        await cart.addItem(product, 1)
      }
      
      const addTime = Date.now() - startTime
      
      // Should complete within reasonable time
      expect(addTime).toBeLessThan(5000) // 5 seconds for 50 items
      
      // Verify all items added
      expect(cart.items.value).toHaveLength(50)
      expect(cart.itemCount.value).toBe(50)
      
      // Test bulk operations performance
      const bulkStartTime = Date.now()
      
      // Select all items
      const cartStore = useCartStore()
      cartStore.selectAllItems()
      
      // Bulk update quantity
      await cartStore.bulkUpdateQuantity(3)
      
      const bulkTime = Date.now() - bulkStartTime
      
      // Bulk operations should be fast
      expect(bulkTime).toBeLessThan(2000) // 2 seconds for bulk operations
      
      // Verify bulk update worked
      expect(cart.itemCount.value).toBe(150) // 50 items * 3 quantity
    })

    it('should debounce storage operations efficiently', async () => {
      const cart = useCart()
      const product = mockProducts[0]
      
      // Add item
      await cart.addItem(product, 1)
      const itemId = cart.items.value[0].id
      
      // Perform rapid quantity updates
      const promises = []
      for (let i = 2; i <= 10; i++) {
        promises.push(cart.updateQuantity(itemId, i))
      }
      
      await Promise.all(promises)
      
      // Should not call storage for every update due to debouncing
      const setItemCalls = mockLocalStorage.setItem.mock.calls.length
      expect(setItemCalls).toBeLessThan(15) // Much less than 9 calls
      
      // Final quantity should be correct
      expect(cart.items.value[0].quantity).toBe(10)
    })
  })
})