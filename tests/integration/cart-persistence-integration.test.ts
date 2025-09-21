/**
 * Cart Persistence Integration Tests
 * 
 * Requirements addressed:
 * - Test cart persistence across browser sessions
 * - Test localStorage/sessionStorage fallback mechanisms
 * - Test cart data migration between storage types
 * - Test cart recovery from corrupted data
 * 
 * Integration tests for cart persistence functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from '~/stores/cart'

// Mock localStorage and sessionStorage
const createMockStorage = () => {
  const storage = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => storage.get(key) || null),
    setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: vi.fn((key: string) => storage.delete(key)),
    clear: vi.fn(() => storage.clear()),
    length: 0,
    key: vi.fn()
  }
}

const mockProduct = {
  id: 'test-product-1',
  slug: 'test-product',
  name: 'Test Product',
  price: 29.99,
  images: ['test-image.jpg'],
  stock: 10,
  category: 'test'
}

describe('Cart Persistence Integration', () => {
  let pinia: any
  let mockLocalStorage: any
  let mockSessionStorage: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    mockLocalStorage = createMockStorage()
    mockSessionStorage = createMockStorage()
    
    // Mock global storage objects
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
    
    Object.defineProperty(global, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    })
    
    // Mock process.client
    Object.defineProperty(global, 'process', {
      value: { client: true },
      writable: true
    })
    
    // Mock $fetch
    global.$fetch = vi.fn().mockResolvedValue(mockProduct)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Persistence', () => {
    it('should save cart data to localStorage when items are added', async () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      await cartStore.addItem(mockProduct, 2)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'moldova-direct-cart',
        expect.stringContaining('"items"')
      )
      
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.items).toHaveLength(1)
      expect(savedData.items[0].product.id).toBe(mockProduct.id)
      expect(savedData.items[0].quantity).toBe(2)
      expect(savedData.sessionId).toBeTruthy()
    })

    it('should load cart data from localStorage on initialization', () => {
      const existingCartData = {
        items: [{
          id: 'item-1',
          product: mockProduct,
          quantity: 3,
          addedAt: new Date().toISOString()
        }],
        sessionId: 'existing-session-123',
        updatedAt: new Date().toISOString()
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingCartData))
      
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      expect(cartStore.items).toHaveLength(1)
      expect(cartStore.items[0].product.id).toBe(mockProduct.id)
      expect(cartStore.items[0].quantity).toBe(3)
      expect(cartStore.sessionId).toBe('existing-session-123')
    })

    it('should handle localStorage unavailability by falling back to sessionStorage', async () => {
      // Mock localStorage to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage is not available')
      })
      
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      await cartStore.addItem(mockProduct, 1)
      
      // Should fallback to sessionStorage
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'moldova-direct-cart',
        expect.stringContaining('"items"')
      )
      
      expect(cartStore.storageType).toBe('sessionStorage')
    })

    it('should handle both localStorage and sessionStorage unavailability', async () => {
      // Mock both storage types to throw errors
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage is not available')
      })
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('sessionStorage is not available')
      })
      
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      await cartStore.addItem(mockProduct, 1)
      
      // Should fallback to memory storage
      expect(cartStore.storageType).toBe('memory')
      expect(cartStore.items).toHaveLength(1)
    })
  })

  describe('Data Migration', () => {
    it('should migrate cart data from localStorage to sessionStorage when localStorage fails', () => {
      const existingCartData = {
        items: [{
          id: 'item-1',
          product: mockProduct,
          quantity: 2,
          addedAt: new Date().toISOString()
        }],
        sessionId: 'migration-session-123',
        updatedAt: new Date().toISOString()
      }
      
      // Setup localStorage with existing data
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingCartData))
      
      // Make localStorage.setItem fail
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded')
      })
      
      const cartStore = useCartStore()
      
      // Trigger migration
      const migrationResult = cartStore.migrateCartData('localStorage', 'sessionStorage')
      
      expect(migrationResult).toBe(true)
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'moldova-direct-cart',
        expect.stringContaining('"sessionId":"migration-session-123"')
      )
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('moldova-direct-cart')
    })

    it('should migrate cart data from sessionStorage to localStorage when sessionStorage fails', () => {
      const existingCartData = {
        items: [{
          id: 'item-1',
          product: mockProduct,
          quantity: 1,
          addedAt: new Date().toISOString()
        }],
        sessionId: 'reverse-migration-session-456',
        updatedAt: new Date().toISOString()
      }
      
      // Setup sessionStorage with existing data
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(existingCartData))
      
      const cartStore = useCartStore()
      
      // Trigger reverse migration
      const migrationResult = cartStore.migrateCartData('sessionStorage', 'localStorage')
      
      expect(migrationResult).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'moldova-direct-cart',
        expect.stringContaining('"sessionId":"reverse-migration-session-456"')
      )
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('moldova-direct-cart')
    })

    it('should handle migration failure gracefully', () => {
      // Setup invalid data in localStorage
      mockLocalStorage.getItem.mockReturnValue('invalid-json-data')
      
      const cartStore = useCartStore()
      
      // Attempt migration
      const migrationResult = cartStore.migrateCartData('localStorage', 'sessionStorage')
      
      expect(migrationResult).toBe(false)
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('Data Validation and Recovery', () => {
    it('should validate and fix corrupted cart data', () => {
      const corruptedData = {
        items: [
          {
            // Missing required fields
            product: { name: 'Incomplete Product' },
            quantity: 'invalid-quantity'
          },
          {
            id: 'valid-item',
            product: mockProduct,
            quantity: 2,
            addedAt: new Date().toISOString()
          }
        ],
        // Missing sessionId
        updatedAt: new Date().toISOString()
      }
      
      const cartStore = useCartStore()
      const validation = cartStore.validateCartData(corruptedData)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
      expect(validation.fixedData).toBeDefined()
      
      // Should have fixed the data
      expect(validation.fixedData.sessionId).toBeTruthy()
      expect(validation.fixedData.items).toHaveLength(1) // Invalid item should be removed
      expect(validation.fixedData.items[0].id).toBe('valid-item')
    })

    it('should recover from completely corrupted cart data', () => {
      mockLocalStorage.getItem.mockReturnValue('completely-invalid-json')
      
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      // Should initialize with empty cart
      expect(cartStore.items).toHaveLength(0)
      expect(cartStore.sessionId).toBeTruthy()
      expect(cartStore.error).toBeNull()
    })

    it('should handle expired cart data', () => {
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 35) // 35 days ago
      
      const expiredCartData = {
        items: [{
          id: 'expired-item',
          product: mockProduct,
          quantity: 1,
          addedAt: expiredDate.toISOString()
        }],
        sessionId: 'expired-session',
        updatedAt: expiredDate.toISOString()
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredCartData))
      
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      // Should clear expired cart data
      expect(cartStore.items).toHaveLength(0)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('moldova-direct-cart')
    })
  })

  describe('Session Management', () => {
    it('should generate new session ID when none exists', () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      expect(cartStore.sessionId).toBeTruthy()
      expect(cartStore.sessionId).toMatch(/^cart_\d+_[a-z0-9]+$/)
    })

    it('should preserve existing session ID from storage', () => {
      const existingSessionId = 'existing-session-789'
      const cartData = {
        items: [],
        sessionId: existingSessionId,
        updatedAt: new Date().toISOString()
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cartData))
      
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      expect(cartStore.sessionId).toBe(existingSessionId)
    })

    it('should handle session renewal correctly', async () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      const originalSessionId = cartStore.sessionId
      
      // Add item to cart
      await cartStore.addItem(mockProduct, 1)
      
      // Simulate session renewal
      const newSessionId = cartStore.generateSessionId()
      cartStore.sessionId = newSessionId
      cartStore.saveToStorage()
      
      // Verify cart data persists with new session ID
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1])
      expect(savedData.sessionId).toBe(newSessionId)
      expect(savedData.items).toHaveLength(1)
    })
  })

  describe('Cross-Session Persistence', () => {
    it('should maintain cart across browser restart simulation', async () => {
      // First session - add items
      const cartStore1 = useCartStore()
      cartStore1.initializeCart()
      
      await cartStore1.addItem(mockProduct, 3)
      const sessionId1 = cartStore1.sessionId
      
      // Simulate browser restart - create new store instance
      const cartStore2 = useCartStore()
      cartStore2.initializeCart()
      
      // Should load previous cart data
      expect(cartStore2.items).toHaveLength(1)
      expect(cartStore2.items[0].quantity).toBe(3)
      expect(cartStore2.sessionId).toBe(sessionId1)
    })

    it('should handle concurrent cart modifications across sessions', async () => {
      // Setup initial cart data
      const initialCartData = {
        items: [{
          id: 'concurrent-item',
          product: mockProduct,
          quantity: 1,
          addedAt: new Date().toISOString()
        }],
        sessionId: 'concurrent-session',
        updatedAt: new Date().toISOString()
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialCartData))
      
      // First store instance
      const cartStore1 = useCartStore()
      cartStore1.initializeCart()
      
      // Second store instance (simulating another tab)
      const cartStore2 = useCartStore()
      cartStore2.initializeCart()
      
      // Modify cart in first instance
      await cartStore1.updateQuantity('concurrent-item', 5)
      
      // Simulate storage event in second instance
      const updatedData = JSON.parse(mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1])
      cartStore2.loadFromStorage()
      
      // Second instance should reflect changes
      expect(cartStore2.items[0].quantity).toBe(5)
    })
  })

  describe('Storage Quota Management', () => {
    it('should handle storage quota exceeded gracefully', async () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      // Mock storage quota exceeded
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError')
      })
      
      // Should fallback to sessionStorage
      await cartStore.addItem(mockProduct, 1)
      
      expect(cartStore.storageType).toBe('sessionStorage')
      expect(mockSessionStorage.setItem).toHaveBeenCalled()
    })

    it('should clean up old cart data when storage is full', async () => {
      const cartStore = useCartStore()
      
      // Mock multiple old cart entries
      const oldCartData1 = { sessionId: 'old-1', items: [], updatedAt: new Date(Date.now() - 86400000).toISOString() }
      const oldCartData2 = { sessionId: 'old-2', items: [], updatedAt: new Date(Date.now() - 172800000).toISOString() }
      
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(oldCartData1))
        .mockReturnValueOnce(JSON.stringify(oldCartData2))
      
      // Simulate cleanup process
      cartStore.cleanupExpiredCartData()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('moldova-direct-cart')
    })
  })

  describe('Performance Optimization', () => {
    it('should debounce storage operations', async () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      // Add multiple items quickly
      await Promise.all([
        cartStore.addItem(mockProduct, 1),
        cartStore.addItem({ ...mockProduct, id: 'product-2' }, 1),
        cartStore.addItem({ ...mockProduct, id: 'product-3' }, 1)
      ])
      
      // Should not call setItem for every operation due to debouncing
      const setItemCalls = mockLocalStorage.setItem.mock.calls.length
      expect(setItemCalls).toBeLessThan(6) // Less than 2 calls per item
    })

    it('should batch storage updates efficiently', async () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      // Perform bulk operations
      await cartStore.addItem(mockProduct, 1)
      const itemId = cartStore.items[0].id
      
      // Multiple quick updates
      await cartStore.updateQuantity(itemId, 2)
      await cartStore.updateQuantity(itemId, 3)
      await cartStore.updateQuantity(itemId, 4)
      
      // Should batch the updates
      const finalData = JSON.parse(mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1])
      expect(finalData.items[0].quantity).toBe(4)
    })
  })

  describe('Error Recovery', () => {
    it('should recover from storage corruption during operation', async () => {
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      await cartStore.addItem(mockProduct, 1)
      
      // Corrupt storage during operation
      mockLocalStorage.getItem.mockReturnValue('corrupted-data')
      
      // Should recover gracefully
      const recovered = await cartStore.recoverCartData()
      
      expect(recovered).toBe(true)
      expect(cartStore.items).toHaveLength(1) // Should maintain current state
    })

    it('should provide fallback when all storage methods fail', async () => {
      // Mock all storage methods to fail
      mockLocalStorage.setItem.mockImplementation(() => { throw new Error('localStorage failed') })
      mockSessionStorage.setItem.mockImplementation(() => { throw new Error('sessionStorage failed') })
      
      const cartStore = useCartStore()
      cartStore.initializeCart()
      
      // Should still work in memory mode
      await cartStore.addItem(mockProduct, 1)
      
      expect(cartStore.storageType).toBe('memory')
      expect(cartStore.items).toHaveLength(1)
      expect(cartStore.items[0].product.id).toBe(mockProduct.id)
    })
  })
})