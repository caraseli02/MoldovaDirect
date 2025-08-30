/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '../../stores/cart'

// Mock the toast store
vi.mock('../../stores/toast', () => ({
  useToastStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  })
}))

// Mock $fetch
global.$fetch = vi.fn()

// Mock process.client and process.env
Object.defineProperty(global, 'process', {
  value: { 
    client: true,
    env: {
      NODE_ENV: 'test'
    }
  }
})

describe('Cart Advanced Features', () => {
  let cartStore: ReturnType<typeof useCartStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    cartStore = useCartStore()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })
  })

  describe('Bulk Selection', () => {
    beforeEach(() => {
      // Add some test items
      cartStore.items = [
        {
          id: 'item1',
          product: {
            id: '1',
            slug: 'product-1',
            name: 'Product 1',
            price: 10,
            images: [],
            stock: 5
          },
          quantity: 2,
          addedAt: new Date()
        },
        {
          id: 'item2',
          product: {
            id: '2',
            slug: 'product-2',
            name: 'Product 2',
            price: 20,
            images: [],
            stock: 3
          },
          quantity: 1,
          addedAt: new Date()
        }
      ]
    })

    it('should toggle item selection', () => {
      expect(cartStore.isItemSelected('item1')).toBe(false)
      
      cartStore.toggleItemSelection('item1')
      expect(cartStore.isItemSelected('item1')).toBe(true)
      
      cartStore.toggleItemSelection('item1')
      expect(cartStore.isItemSelected('item1')).toBe(false)
    })

    it('should select all items', () => {
      cartStore.selectAllItems()
      
      expect(cartStore.selectedItemsCount).toBe(2)
      expect(cartStore.allItemsSelected).toBe(true)
      expect(cartStore.isItemSelected('item1')).toBe(true)
      expect(cartStore.isItemSelected('item2')).toBe(true)
    })

    it('should clear all selections', () => {
      cartStore.selectAllItems()
      expect(cartStore.selectedItemsCount).toBe(2)
      
      cartStore.clearSelection()
      expect(cartStore.selectedItemsCount).toBe(0)
      expect(cartStore.allItemsSelected).toBe(false)
    })

    it('should calculate selected items subtotal', () => {
      cartStore.toggleItemSelection('item1') // 10 * 2 = 20
      cartStore.toggleItemSelection('item2') // 20 * 1 = 20
      
      expect(cartStore.selectedItemsSubtotal).toBe(40)
    })

    it('should have selected items', () => {
      expect(cartStore.hasSelectedItems).toBe(false)
      
      cartStore.toggleItemSelection('item1')
      expect(cartStore.hasSelectedItems).toBe(true)
    })

    it('should get selected items', () => {
      cartStore.toggleItemSelection('item1')
      
      const selectedItems = cartStore.getSelectedItems
      expect(selectedItems).toHaveLength(1)
      expect(selectedItems[0].id).toBe('item1')
    })
  })

  describe('Save for Later', () => {
    beforeEach(() => {
      cartStore.items = [
        {
          id: 'item1',
          product: {
            id: '1',
            slug: 'product-1',
            name: 'Product 1',
            price: 10,
            images: [],
            stock: 5
          },
          quantity: 2,
          addedAt: new Date()
        }
      ]
    })

    it('should save item for later', async () => {
      expect(cartStore.items).toHaveLength(1)
      expect(cartStore.savedForLater).toHaveLength(0)
      
      await cartStore.saveItemForLater('item1')
      
      expect(cartStore.items).toHaveLength(0)
      expect(cartStore.savedForLater).toHaveLength(1)
      expect(cartStore.savedForLater[0].product.name).toBe('Product 1')
      expect(cartStore.savedForLater[0].quantity).toBe(2)
    })

    it('should move item from saved to cart', async () => {
      await cartStore.saveItemForLater('item1')
      const savedItemId = cartStore.savedForLater[0].id
      
      expect(cartStore.items).toHaveLength(0)
      expect(cartStore.savedForLater).toHaveLength(1)
      
      await cartStore.moveFromSavedToCart(savedItemId)
      
      expect(cartStore.items).toHaveLength(1)
      expect(cartStore.savedForLater).toHaveLength(0)
      expect(cartStore.items[0].product.name).toBe('Product 1')
    })

    it('should remove item from saved for later', async () => {
      await cartStore.saveItemForLater('item1')
      const savedItemId = cartStore.savedForLater[0].id
      
      expect(cartStore.savedForLater).toHaveLength(1)
      
      await cartStore.removeFromSavedForLater(savedItemId)
      
      expect(cartStore.savedForLater).toHaveLength(0)
    })

    it('should check if product is saved for later', async () => {
      expect(cartStore.isProductSavedForLater('1')).toBe(false)
      
      await cartStore.saveItemForLater('item1')
      
      expect(cartStore.isProductSavedForLater('1')).toBe(true)
    })

    it('should get saved for later count', async () => {
      expect(cartStore.savedForLaterCount).toBe(0)
      
      await cartStore.saveItemForLater('item1')
      
      expect(cartStore.savedForLaterCount).toBe(1)
    })
  })

  describe('Bulk Operations', () => {
    beforeEach(() => {
      cartStore.items = [
        {
          id: 'item1',
          product: {
            id: '1',
            slug: 'product-1',
            name: 'Product 1',
            price: 10,
            images: [],
            stock: 5
          },
          quantity: 2,
          addedAt: new Date()
        },
        {
          id: 'item2',
          product: {
            id: '2',
            slug: 'product-2',
            name: 'Product 2',
            price: 20,
            images: [],
            stock: 3
          },
          quantity: 1,
          addedAt: new Date()
        }
      ]
      
      // Select both items
      cartStore.selectAllItems()
    })

    it('should bulk remove selected items', async () => {
      expect(cartStore.items).toHaveLength(2)
      expect(cartStore.selectedItemsCount).toBe(2)
      
      await cartStore.bulkRemoveSelected()
      
      expect(cartStore.items).toHaveLength(0)
      expect(cartStore.selectedItemsCount).toBe(0)
    })

    it('should bulk update quantities', async () => {
      await cartStore.bulkUpdateQuantity(3)
      
      expect(cartStore.items[0].quantity).toBe(3)
      expect(cartStore.items[1].quantity).toBe(3)
      expect(cartStore.selectedItemsCount).toBe(0) // Selection cleared after operation
    })

    it('should bulk save for later', async () => {
      expect(cartStore.items).toHaveLength(2)
      expect(cartStore.savedForLater).toHaveLength(0)
      
      await cartStore.bulkSaveForLater()
      
      expect(cartStore.items).toHaveLength(0)
      expect(cartStore.savedForLater).toHaveLength(2)
      expect(cartStore.selectedItemsCount).toBe(0)
    })
  })

  describe('Recommendations', () => {
    beforeEach(() => {
      cartStore.items = [
        {
          id: 'item1',
          product: {
            id: '1',
            slug: 'product-1',
            name: 'Product 1',
            price: 10,
            images: [],
            stock: 5,
            categoryId: 1
          },
          quantity: 2,
          addedAt: new Date()
        }
      ]
    })

    it('should load recommendations', async () => {
      const mockProducts = [
        {
          id: '2',
          name: 'Recommended Product',
          price: 15,
          images: [],
          stock: 10,
          categoryId: 1
        }
      ]

      vi.mocked($fetch).mockResolvedValue({ products: mockProducts })
      
      await cartStore.loadRecommendations()
      
      expect(cartStore.recommendations).toEqual(mockProducts)
      expect(cartStore.recommendationsLoading).toBe(false)
    })

    it('should clear recommendations', () => {
      cartStore.recommendations = [
        {
          id: '2',
          name: 'Test Product',
          price: 15,
          images: [],
          stock: 10
        }
      ]
      
      cartStore.clearRecommendations()
      
      expect(cartStore.recommendations).toHaveLength(0)
    })

    it('should add recommended product', async () => {
      const recommendedProduct = {
        id: '2',
        slug: 'recommended-product',
        name: 'Recommended Product',
        price: 15,
        images: [],
        stock: 10
      }

      vi.mocked($fetch).mockResolvedValue({ products: [] })
      
      await cartStore.addRecommendedProduct(recommendedProduct, 1)
      
      expect(cartStore.items).toHaveLength(2)
      expect(cartStore.items[1].product.name).toBe('Recommended Product')
    })
  })
})