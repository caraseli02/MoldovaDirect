/**
 * Cart Advanced Features Module Tests
 * Tests for save for later, bulk operations, recommendations, and item selection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import {
  cartAdvancedState,
  selectItem,
  deselectItem,
  toggleItemSelection,
  selectAllItems,
  deselectAllItems,
  toggleSelectAll,
  bulkRemoveSelected,
  saveItemForLater,
  restoreFromSaved,
  removeFromSavedForLater,
  moveSelectedToSavedForLater,
  loadRecommendations,
  clearRecommendations,
} from '~/stores/cart/advanced'
import type { CartItem, Product } from '~/stores/cart/types'

// Mock $fetch before importing the module
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock product data
const mockProduct: Product = {
  id: 'prod-1',
  slug: 'test-wine',
  name: 'Test Wine',
  price: 25.99,
  images: ['/images/wine.jpg'],
  stock: 10,
  category: 'Wines',
}

const mockProduct2: Product = {
  id: 'prod-2',
  slug: 'test-wine-2',
  name: 'Test Wine 2',
  price: 35.99,
  images: ['/images/wine2.jpg'],
  stock: 5,
  category: 'Wines',
}

// Mock cart items
const mockCartItem: CartItem = {
  id: 'item-1',
  product: mockProduct,
  quantity: 2,
  addedAt: new Date(),
  source: 'manual',
}

const mockCartItem2: CartItem = {
  id: 'item-2',
  product: mockProduct2,
  quantity: 1,
  addedAt: new Date(),
  source: 'manual',
}

// Helper to reset advanced state
function resetAdvancedState() {
  cartAdvancedState.value = {
    selectedItems: new Set<string>(),
    bulkOperationInProgress: false,
    savedForLater: [],
    recommendations: [],
    recommendationsLoading: false,
  }
}

describe('Cart Advanced Features Module', () => {
  beforeEach(() => {
    resetAdvancedState()
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetAdvancedState()
  })

  describe('State Management', () => {
    it('should initialize with correct default state', () => {
      resetAdvancedState()

      expect(cartAdvancedState.value.selectedItems.size).toBe(0)
      expect(cartAdvancedState.value.bulkOperationInProgress).toBe(false)
      expect(cartAdvancedState.value.savedForLater).toEqual([])
      expect(cartAdvancedState.value.recommendations).toEqual([])
      expect(cartAdvancedState.value.recommendationsLoading).toBe(false)
    })

    it('should track bulk operation progress', () => {
      expect(cartAdvancedState.value.bulkOperationInProgress).toBe(false)

      cartAdvancedState.value.bulkOperationInProgress = true
      expect(cartAdvancedState.value.bulkOperationInProgress).toBe(true)

      cartAdvancedState.value.bulkOperationInProgress = false
      expect(cartAdvancedState.value.bulkOperationInProgress).toBe(false)
    })

    it('should track recommendations loading state', () => {
      expect(cartAdvancedState.value.recommendationsLoading).toBe(false)

      cartAdvancedState.value.recommendationsLoading = true
      expect(cartAdvancedState.value.recommendationsLoading).toBe(true)
    })
  })

  describe('Item Selection', () => {
    describe('selectItem', () => {
      it('should select an item', () => {
        selectItem('item-1')

        expect(cartAdvancedState.value.selectedItems.has('item-1')).toBe(true)
      })

      it('should allow selecting multiple items', () => {
        selectItem('item-1')
        selectItem('item-2')
        selectItem('item-3')

        expect(cartAdvancedState.value.selectedItems.size).toBe(3)
      })

      it('should not duplicate selected items', () => {
        selectItem('item-1')
        selectItem('item-1')

        expect(cartAdvancedState.value.selectedItems.size).toBe(1)
      })
    })

    describe('deselectItem', () => {
      it('should deselect a selected item', () => {
        selectItem('item-1')
        expect(cartAdvancedState.value.selectedItems.has('item-1')).toBe(true)

        deselectItem('item-1')
        expect(cartAdvancedState.value.selectedItems.has('item-1')).toBe(false)
      })

      it('should handle deselecting non-selected item gracefully', () => {
        expect(() => deselectItem('non-existent')).not.toThrow()
      })
    })

    describe('toggleItemSelection', () => {
      it('should select unselected item', () => {
        toggleItemSelection('item-1')

        expect(cartAdvancedState.value.selectedItems.has('item-1')).toBe(true)
      })

      it('should deselect selected item', () => {
        selectItem('item-1')
        toggleItemSelection('item-1')

        expect(cartAdvancedState.value.selectedItems.has('item-1')).toBe(false)
      })

      it('should toggle correctly multiple times', () => {
        toggleItemSelection('item-1') // select
        expect(cartAdvancedState.value.selectedItems.has('item-1')).toBe(true)

        toggleItemSelection('item-1') // deselect
        expect(cartAdvancedState.value.selectedItems.has('item-1')).toBe(false)

        toggleItemSelection('item-1') // select again
        expect(cartAdvancedState.value.selectedItems.has('item-1')).toBe(true)
      })
    })

    describe('selectAllItems', () => {
      it('should select all cart items', () => {
        selectAllItems([mockCartItem, mockCartItem2])

        expect(cartAdvancedState.value.selectedItems.size).toBe(2)
        expect(cartAdvancedState.value.selectedItems.has('item-1')).toBe(true)
        expect(cartAdvancedState.value.selectedItems.has('item-2')).toBe(true)
      })

      it('should handle empty cart items array', () => {
        selectAllItems([])

        expect(cartAdvancedState.value.selectedItems.size).toBe(0)
      })

      it('should not affect already selected items', () => {
        selectItem('item-1')
        selectAllItems([mockCartItem, mockCartItem2])

        expect(cartAdvancedState.value.selectedItems.size).toBe(2)
      })
    })

    describe('deselectAllItems', () => {
      it('should deselect all items', () => {
        selectItem('item-1')
        selectItem('item-2')
        selectItem('item-3')

        deselectAllItems()

        expect(cartAdvancedState.value.selectedItems.size).toBe(0)
      })

      it('should handle empty selection gracefully', () => {
        expect(() => deselectAllItems()).not.toThrow()
        expect(cartAdvancedState.value.selectedItems.size).toBe(0)
      })
    })

    describe('toggleSelectAll', () => {
      it('should select all items when none selected', () => {
        toggleSelectAll([mockCartItem, mockCartItem2])

        expect(cartAdvancedState.value.selectedItems.size).toBe(2)
      })

      it('should deselect all items when all selected', () => {
        selectAllItems([mockCartItem, mockCartItem2])
        toggleSelectAll([mockCartItem, mockCartItem2])

        expect(cartAdvancedState.value.selectedItems.size).toBe(0)
      })

      it('should select all when only some selected', () => {
        selectItem('item-1')
        toggleSelectAll([mockCartItem, mockCartItem2])

        expect(cartAdvancedState.value.selectedItems.size).toBe(2)
      })

      it('should handle empty cart items', () => {
        toggleSelectAll([])

        expect(cartAdvancedState.value.selectedItems.size).toBe(0)
      })
    })
  })

  describe('Bulk Operations', () => {
    describe('bulkRemoveSelected', () => {
      it('should remove selected items using provided function', async () => {
        const removeItemFn = vi.fn().mockResolvedValue(undefined)

        selectItem('item-1')
        selectItem('item-2')

        await bulkRemoveSelected([mockCartItem, mockCartItem2], removeItemFn)

        expect(removeItemFn).toHaveBeenCalledTimes(2)
        expect(removeItemFn).toHaveBeenCalledWith('item-1')
        expect(removeItemFn).toHaveBeenCalledWith('item-2')
      })

      it('should clear selection after bulk remove', async () => {
        const removeItemFn = vi.fn().mockResolvedValue(undefined)

        selectItem('item-1')
        await bulkRemoveSelected([mockCartItem], removeItemFn)

        expect(cartAdvancedState.value.selectedItems.size).toBe(0)
      })

      it('should throw if bulk operation already in progress', async () => {
        cartAdvancedState.value.bulkOperationInProgress = true
        const removeItemFn = vi.fn()

        await expect(bulkRemoveSelected([mockCartItem], removeItemFn)).rejects.toThrow(
          'Bulk operation already in progress',
        )

        cartAdvancedState.value.bulkOperationInProgress = false
      })

      it('should reset bulkOperationInProgress after completion', async () => {
        const removeItemFn = vi.fn().mockResolvedValue(undefined)

        selectItem('item-1')
        await bulkRemoveSelected([mockCartItem], removeItemFn)

        expect(cartAdvancedState.value.bulkOperationInProgress).toBe(false)
      })

      it('should reset bulkOperationInProgress even on error', async () => {
        const removeItemFn = vi.fn().mockRejectedValue(new Error('Remove failed'))

        selectItem('item-1')
        await bulkRemoveSelected([mockCartItem], removeItemFn)

        expect(cartAdvancedState.value.bulkOperationInProgress).toBe(false)
      })

      it('should only remove items that are both selected and in cart', async () => {
        const removeItemFn = vi.fn().mockResolvedValue(undefined)

        selectItem('item-1')
        selectItem('item-3') // Not in cart items

        await bulkRemoveSelected([mockCartItem, mockCartItem2], removeItemFn)

        // Should only remove item-1 (selected and in cart)
        expect(removeItemFn).toHaveBeenCalledTimes(1)
        expect(removeItemFn).toHaveBeenCalledWith('item-1')
      })
    })
  })

  describe('Save for Later', () => {
    describe('saveItemForLater', () => {
      it('should save cart item for later', async () => {
        await saveItemForLater(mockCartItem)

        expect(cartAdvancedState.value.savedForLater).toHaveLength(1)
        expect(cartAdvancedState.value.savedForLater[0].product).toEqual(mockProduct)
        expect(cartAdvancedState.value.savedForLater[0].quantity).toBe(2)
      })

      it('should include original cart item ID', async () => {
        await saveItemForLater(mockCartItem)

        expect(cartAdvancedState.value.savedForLater[0].originalCartItemId).toBe('item-1')
      })

      it('should include saved timestamp', async () => {
        await saveItemForLater(mockCartItem)

        expect(cartAdvancedState.value.savedForLater[0].savedAt).toBeInstanceOf(Date)
      })

      it('should include optional reason', async () => {
        await saveItemForLater(mockCartItem, 'out_of_stock')

        expect(cartAdvancedState.value.savedForLater[0].reason).toBe('out_of_stock')
      })

      it('should call remove function if provided', async () => {
        const removeItemFn = vi.fn().mockResolvedValue(undefined)

        await saveItemForLater(mockCartItem, undefined, removeItemFn)

        expect(removeItemFn).toHaveBeenCalledWith('item-1')
      })

      it('should generate unique saved item ID', async () => {
        await saveItemForLater(mockCartItem)
        await saveItemForLater(mockCartItem2)

        const ids = cartAdvancedState.value.savedForLater.map(item => item.id)
        const uniqueIds = new Set(ids)

        expect(uniqueIds.size).toBe(ids.length)
      })
    })

    describe('restoreFromSaved', () => {
      it('should restore saved item to cart', async () => {
        const _addItemFn = vi.fn().mockResolvedValue(undefined)

        await saveItemForLater(mockCartItem)
        const savedId = cartAdvancedState.value.savedForLater[0].id

        await restoreFromSaved(savedId, _addItemFn)

        expect(_addItemFn).toHaveBeenCalledWith(mockProduct, 2)
      })

      it('should remove item from saved for later after restore', async () => {
        const addItemFn = vi.fn().mockResolvedValue(undefined)

        await saveItemForLater(mockCartItem)
        const savedId = cartAdvancedState.value.savedForLater[0].id

        await restoreFromSaved(savedId, addItemFn)

        expect(cartAdvancedState.value.savedForLater).toHaveLength(0)
      })

      it('should throw if saved item not found', async () => {
        const addItemFn = vi.fn()

        await expect(restoreFromSaved('non-existent', addItemFn)).rejects.toThrow(
          'Saved item not found',
        )
      })
    })

    describe('removeFromSavedForLater', () => {
      it('should remove saved item', async () => {
        await saveItemForLater(mockCartItem)
        const savedId = cartAdvancedState.value.savedForLater[0].id

        await removeFromSavedForLater(savedId)

        expect(cartAdvancedState.value.savedForLater).toHaveLength(0)
      })

      it('should throw if item not found', async () => {
        await expect(removeFromSavedForLater('non-existent')).rejects.toThrow(
          'Saved item not found',
        )
      })

      it('should only remove specified item', async () => {
        await saveItemForLater(mockCartItem)
        await saveItemForLater(mockCartItem2)
        const savedId = cartAdvancedState.value.savedForLater[0].id

        await removeFromSavedForLater(savedId)

        expect(cartAdvancedState.value.savedForLater).toHaveLength(1)
        expect(cartAdvancedState.value.savedForLater[0].product.id).toBe('prod-2')
      })
    })

    describe('moveSelectedToSavedForLater', () => {
      it('should move selected items to saved for later', async () => {
        const removeItemFn = vi.fn().mockResolvedValue(undefined)

        selectItem('item-1')
        selectItem('item-2')

        await moveSelectedToSavedForLater([mockCartItem, mockCartItem2], removeItemFn)

        expect(cartAdvancedState.value.savedForLater).toHaveLength(2)
      })

      it('should clear selection after move', async () => {
        const removeItemFn = vi.fn().mockResolvedValue(undefined)

        selectItem('item-1')
        await moveSelectedToSavedForLater([mockCartItem], removeItemFn)

        expect(cartAdvancedState.value.selectedItems.size).toBe(0)
      })

      it('should throw if bulk operation in progress', async () => {
        cartAdvancedState.value.bulkOperationInProgress = true
        const removeItemFn = vi.fn()

        await expect(moveSelectedToSavedForLater([mockCartItem], removeItemFn)).rejects.toThrow(
          'Bulk operation already in progress',
        )

        cartAdvancedState.value.bulkOperationInProgress = false
      })

      it('should include bulk_move reason', async () => {
        const removeItemFn = vi.fn().mockResolvedValue(undefined)

        selectItem('item-1')
        await moveSelectedToSavedForLater([mockCartItem], removeItemFn)

        expect(cartAdvancedState.value.savedForLater[0].reason).toBe('bulk_move')
      })
    })
  })

  describe('Recommendations', () => {
    describe('loadRecommendations', () => {
      it('should load recommendations from API', async () => {
        mockFetch.mockResolvedValueOnce({
          success: true,
          recommendations: [mockProduct, mockProduct2],
          metadata: { algorithm: 'collaborative_filtering' },
        })

        await loadRecommendations([mockCartItem])

        expect(cartAdvancedState.value.recommendations).toHaveLength(2)
      })

      it('should call API with product IDs and categories', async () => {
        mockFetch.mockResolvedValueOnce({
          success: true,
          recommendations: [],
        })

        await loadRecommendations([mockCartItem, mockCartItem2])

        expect(mockFetch).toHaveBeenCalledWith('/api/recommendations/cart', {
          method: 'POST',
          body: {
            productIds: ['prod-1', 'prod-2'],
            categories: ['Wines'],
            limit: 5,
          },
        })
      })

      it('should not load if already loading', async () => {
        cartAdvancedState.value.recommendationsLoading = true

        await loadRecommendations([mockCartItem])

        expect(mockFetch).not.toHaveBeenCalled()

        cartAdvancedState.value.recommendationsLoading = false
      })

      it('should set loading state during fetch', async () => {
        mockFetch.mockImplementation(() => {
          expect(cartAdvancedState.value.recommendationsLoading).toBe(true)
          return Promise.resolve({ success: true, recommendations: [] })
        })

        await loadRecommendations([mockCartItem])

        expect(cartAdvancedState.value.recommendationsLoading).toBe(false)
      })

      it('should handle API errors gracefully', async () => {
        mockFetch.mockRejectedValueOnce({ statusCode: 500, statusMessage: 'Server Error' })

        await loadRecommendations([mockCartItem])

        expect(cartAdvancedState.value.recommendations).toEqual([])
        expect(cartAdvancedState.value.recommendationsLoading).toBe(false)
      })

      it('should handle 404 errors specifically', async () => {
        mockFetch.mockRejectedValueOnce({ statusCode: 404 })

        await loadRecommendations([mockCartItem])

        expect(cartAdvancedState.value.recommendations).toEqual([])
      })

      it('should handle empty cart items', async () => {
        mockFetch.mockResolvedValueOnce({
          success: true,
          recommendations: [],
        })

        await loadRecommendations([])

        expect(mockFetch).toHaveBeenCalledWith('/api/recommendations/cart', {
          method: 'POST',
          body: {
            productIds: [],
            categories: [],
            limit: 5,
          },
        })
      })

      it('should include metadata in recommendations', async () => {
        mockFetch.mockResolvedValueOnce({
          success: true,
          recommendations: [mockProduct],
          metadata: { algorithm: 'ml_model' },
        })

        await loadRecommendations([mockCartItem])

        expect(cartAdvancedState.value.recommendations[0].metadata?.algorithm).toBe('ml_model')
      })

      it('should clear recommendations on unsuccessful response', async () => {
        mockFetch.mockResolvedValueOnce({
          success: false,
          recommendations: null,
        })

        await loadRecommendations([mockCartItem])

        expect(cartAdvancedState.value.recommendations).toEqual([])
      })
    })

    describe('clearRecommendations', () => {
      it('should clear all recommendations', async () => {
        mockFetch.mockResolvedValueOnce({
          success: true,
          recommendations: [mockProduct],
        })

        await loadRecommendations([mockCartItem])
        expect(cartAdvancedState.value.recommendations.length).toBeGreaterThan(0)

        clearRecommendations()

        expect(cartAdvancedState.value.recommendations).toEqual([])
      })
    })
  })

  describe('ID Generation', () => {
    it('should generate unique saved item IDs', async () => {
      const ids = new Set<string>()
      for (let i = 0; i < 50; i++) {
        await saveItemForLater({ ...mockCartItem, id: `item-${i}` })
        ids.add(cartAdvancedState.value.savedForLater[i].id)
      }

      expect(ids.size).toBe(50)
    })

    it('should generate IDs with saved prefix', async () => {
      await saveItemForLater(mockCartItem)

      expect(cartAdvancedState.value.savedForLater[0].id).toMatch(/^saved_/)
    })
  })

  describe('Edge Cases', () => {
    it('should handle concurrent bulk operations protection', async () => {
      const removeItemFn = vi.fn().mockResolvedValue(undefined)

      selectItem('item-1')

      // Start first operation
      const promise1 = bulkRemoveSelected([mockCartItem], removeItemFn)

      // Try second operation immediately
      selectItem('item-2')
      const promise2 = moveSelectedToSavedForLater([mockCartItem2], removeItemFn)
        .catch(err => err)

      const results = await Promise.all([promise1, promise2])

      // Second operation should fail
      expect(results[1]).toBeInstanceOf(Error)
      expect(results[1].message).toBe('Bulk operation already in progress')
    })

    it('should handle products with undefined category', async () => {
      const productNoCategory = { ...mockProduct, category: undefined }
      const itemNoCategory = { ...mockCartItem, product: productNoCategory }

      mockFetch.mockResolvedValueOnce({
        success: true,
        recommendations: [],
      })

      await loadRecommendations([itemNoCategory])

      expect(mockFetch).toHaveBeenCalledWith('/api/recommendations/cart', {
        method: 'POST',
        body: {
          productIds: ['prod-1'],
          categories: [],
          limit: 5,
        },
      })
    })

    it('should deduplicate categories in recommendations request', async () => {
      const item3: CartItem = {
        id: 'item-3',
        product: { ...mockProduct, id: 'prod-3' },
        quantity: 1,
        addedAt: new Date(),
        source: 'manual',
      }

      mockFetch.mockResolvedValueOnce({
        success: true,
        recommendations: [],
      })

      await loadRecommendations([mockCartItem, mockCartItem2, item3])

      expect(mockFetch).toHaveBeenCalledWith('/api/recommendations/cart', {
        method: 'POST',
        body: {
          productIds: ['prod-1', 'prod-2', 'prod-3'],
          categories: ['Wines'], // Only one, deduplicated
          limit: 5,
        },
      })
    })
  })
})
