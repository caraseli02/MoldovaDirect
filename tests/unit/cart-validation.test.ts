import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '~/stores/cart'

// Mock the toast store
vi.mock('~/stores/toast', () => ({
  useToastStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  })
}))

// Mock the $fetch function
global.$fetch = vi.fn()

// Mock process.client
Object.defineProperty(global, 'process', {
  value: { client: true }
})

describe('Cart Validation System', () => {
  let cartStore: ReturnType<typeof useCartStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    cartStore = useCartStore()
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })
    
    // Initialize cart
    cartStore.initializeCart()
  })

  afterEach(() => {
    cartStore.cleanupValidation()
    vi.clearAllMocks()
  })

  describe('Validation Cache', () => {
    it('should cache validation results', () => {
      const productId = 'test-product-1'
      const product = {
        id: productId,
        slug: 'test-product',
        name: 'Test Product',
        price: 10.99,
        images: [],
        stock: 5
      }

      cartStore.setCachedValidation(productId, true, product)
      
      const cached = cartStore.getCachedValidation(productId)
      expect(cached).toBeTruthy()
      expect(cached?.isValid).toBe(true)
      expect(cached?.product.name).toBe('Test Product')
    })

    it('should expire cached validation after TTL', async () => {
      const productId = 'test-product-1'
      const product = {
        id: productId,
        slug: 'test-product',
        name: 'Test Product',
        price: 10.99,
        images: [],
        stock: 5
      }

      // Set cache with very short TTL
      cartStore.setCachedValidation(productId, true, product, 1)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 2))
      
      const cached = cartStore.getCachedValidation(productId)
      expect(cached).toBeNull()
    })

    it('should clear validation cache', () => {
      const productId = 'test-product-1'
      const product = {
        id: productId,
        slug: 'test-product',
        name: 'Test Product',
        price: 10.99,
        images: [],
        stock: 5
      }

      cartStore.setCachedValidation(productId, true, product)
      cartStore.clearValidationCache(productId)
      
      const cached = cartStore.getCachedValidation(productId)
      expect(cached).toBeNull()
    })
  })

  describe('Validation Queue', () => {
    it('should add items to validation queue', () => {
      const productId = 'test-product-1'
      
      cartStore.addToValidationQueue(productId, 'high')
      
      expect(cartStore.validationQueue[productId]).toBeTruthy()
      expect(cartStore.validationQueue[productId].priority).toBe('high')
    })

    it('should prioritize validation queue correctly', () => {
      cartStore.addToValidationQueue('product-1', 'low')
      cartStore.addToValidationQueue('product-2', 'high')
      cartStore.addToValidationQueue('product-3', 'medium')
      
      const prioritized = cartStore.getValidationQueueByPriority()
      
      expect(prioritized[0]).toBe('product-2') // high priority first
      expect(prioritized[1]).toBe('product-3') // medium priority second
      expect(prioritized[2]).toBe('product-1') // low priority last
    })

    it('should remove items from validation queue', () => {
      const productId = 'test-product-1'
      
      cartStore.addToValidationQueue(productId, 'medium')
      cartStore.removeFromValidationQueue(productId)
      
      expect(cartStore.validationQueue[productId]).toBeUndefined()
    })
  })

  describe('Debounced Validation', () => {
    it('should create debounced validation function', () => {
      cartStore.createDebouncedValidation()
      
      expect(cartStore.debouncedValidateProduct).toBeTruthy()
      expect(typeof cartStore.debouncedValidateProduct).toBe('function')
    })

    it('should batch multiple validation requests', async () => {
      const batchValidateSpy = vi.spyOn(cartStore, 'batchValidateProducts')
      cartStore.createDebouncedValidation()
      
      // Trigger multiple validations
      cartStore.debouncedValidateProduct('product-1', 10)
      cartStore.debouncedValidateProduct('product-2', 10)
      cartStore.debouncedValidateProduct('product-3', 10)
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 15))
      
      expect(batchValidateSpy).toHaveBeenCalledWith(['product-1', 'product-2', 'product-3'])
    })
  })

  describe('Background Validation', () => {
    it('should start background validation', () => {
      cartStore.backgroundValidationEnabled = true
      cartStore.startBackgroundValidation()
      
      expect(cartStore.backgroundValidationWorker).toBeTruthy()
    })

    it('should stop background validation', () => {
      cartStore.startBackgroundValidation()
      cartStore.stopBackgroundValidation()
      
      expect(cartStore.backgroundValidationWorker).toBeNull()
    })

    it('should not start background validation when disabled', () => {
      cartStore.backgroundValidationEnabled = false
      cartStore.startBackgroundValidation()
      
      expect(cartStore.backgroundValidationWorker).toBeNull()
    })
  })

  describe('Single Product Validation', () => {
    it('should validate single product successfully', async () => {
      const product = {
        id: 'test-product-1',
        slug: 'test-product',
        name: 'Test Product',
        price: 10.99,
        images: [],
        stock: 5
      }

      // Add item to cart
      cartStore.items.push({
        id: 'cart-item-1',
        product,
        quantity: 2,
        addedAt: new Date()
      })

      // Mock successful API response
      vi.mocked($fetch).mockResolvedValueOnce({
        id: 'test-product-1',
        slug: 'test-product',
        name: 'Test Product Updated',
        price: 12.99,
        stock: 8
      })

      await cartStore.validateSingleProduct('test-product-1')

      // Check that product was updated
      const cartItem = cartStore.items[0]
      expect(cartItem.product.name).toBe('Test Product Updated')
      expect(cartItem.product.price).toBe(12.99)
      expect(cartItem.product.stock).toBe(8)

      // Check that validation was cached
      const cached = cartStore.getCachedValidation('test-product-1')
      expect(cached?.isValid).toBe(true)
    })

    it('should handle out of stock products', async () => {
      const product = {
        id: 'test-product-1',
        slug: 'test-product',
        name: 'Test Product',
        price: 10.99,
        images: [],
        stock: 5
      }

      // Add item to cart
      cartStore.items.push({
        id: 'cart-item-1',
        product,
        quantity: 2,
        addedAt: new Date()
      })

      // Mock API response with zero stock
      vi.mocked($fetch).mockResolvedValueOnce({
        id: 'test-product-1',
        slug: 'test-product',
        name: 'Test Product',
        price: 10.99,
        stock: 0
      })

      await cartStore.validateSingleProduct('test-product-1')

      // Check that item was removed from cart
      expect(cartStore.items.length).toBe(0)
    })

    it('should adjust quantity when stock is insufficient', async () => {
      const product = {
        id: 'test-product-1',
        slug: 'test-product',
        name: 'Test Product',
        price: 10.99,
        images: [],
        stock: 5
      }

      // Add item to cart with quantity higher than new stock
      cartStore.items.push({
        id: 'cart-item-1',
        product,
        quantity: 8,
        addedAt: new Date()
      })

      // Mock API response with reduced stock
      vi.mocked($fetch).mockResolvedValueOnce({
        id: 'test-product-1',
        slug: 'test-product',
        name: 'Test Product',
        price: 10.99,
        stock: 3
      })

      await cartStore.validateSingleProduct('test-product-1')

      // Check that quantity was adjusted
      const cartItem = cartStore.items[0]
      expect(cartItem.quantity).toBe(3)
    })
  })

  describe('Batch Validation', () => {
    it('should use cached results when available', async () => {
      const productIds = ['product-1', 'product-2']
      
      // Cache validation for product-1
      cartStore.setCachedValidation('product-1', true, {
        id: 'product-1',
        slug: 'product-1',
        name: 'Cached Product',
        price: 5.99,
        images: [],
        stock: 10
      })

      // Add items to cart
      cartStore.items.push(
        {
          id: 'cart-item-1',
          product: {
            id: 'product-1',
            slug: 'product-1',
            name: 'Product 1',
            price: 5.99,
            images: [],
            stock: 10
          },
          quantity: 1,
          addedAt: new Date()
        },
        {
          id: 'cart-item-2',
          product: {
            id: 'product-2',
            slug: 'product-2',
            name: 'Product 2',
            price: 7.99,
            images: [],
            stock: 5
          },
          quantity: 1,
          addedAt: new Date()
        }
      )

      const validateSingleSpy = vi.spyOn(cartStore, 'validateSingleProduct')

      await cartStore.batchValidateProducts(productIds)

      // Should only validate product-2 (product-1 was cached)
      expect(validateSingleSpy).toHaveBeenCalledTimes(1)
      expect(validateSingleSpy).toHaveBeenCalledWith('product-2')
    })
  })
})