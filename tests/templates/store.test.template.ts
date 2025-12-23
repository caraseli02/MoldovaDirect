/**
 * Store Test Template
 *
 * This template provides a standard structure for testing Pinia stores.
 * Test state, getters, and actions systematically.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStoreNameStore } from './storeName'

describe('StoreName Store', () => {
  beforeEach(() => {
    // Setup: Create fresh Pinia instance for each test
    setActivePinia(createPinia())

    // Reset any mocks
    vi.clearAllMocks()
  })

  describe('State Initialization', () => {
    it('initializes with correct default state', () => {
      // Arrange & Act
      const store = useStoreNameStore()

      // Assert
      expect(store.items).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.currentItem).toBeNull()
    })
  })

  describe('Getters', () => {
    it('computes total count correctly', () => {
      // Arrange
      const store = useStoreNameStore()
      store.items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ]

      // Assert
      expect(store.totalCount).toBe(3)
    })

    it('filters items by search query', () => {
      // Arrange
      const store = useStoreNameStore()
      store.items = [
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' },
        { id: 3, name: 'Orange' },
      ]
      store.searchQuery = 'app'

      // Assert
      expect(store.filteredItems).toHaveLength(1)
      expect(store.filteredItems[0].name).toBe('Apple')
    })

    it('returns empty array when no items match', () => {
      // Arrange
      const store = useStoreNameStore()
      store.items = [{ id: 1, name: 'Apple' }]
      store.searchQuery = 'xyz'

      // Assert
      expect(store.filteredItems).toHaveLength(0)
    })
  })

  describe('Actions', () => {
    describe('fetchItems', () => {
      it('fetches items successfully', async () => {
        // Arrange
        const store = useStoreNameStore()
        const mockItems = [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ]

        // Mock API call
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ data: mockItems }),
        })

        // Act
        await store.fetchItems()

        // Assert
        expect(store.items).toEqual(mockItems)
        expect(store.isLoading).toBe(false)
        expect(store.error).toBeNull()
      })

      it('sets loading state during fetch', async () => {
        // Arrange
        const store = useStoreNameStore()

        // Mock API with delay
        global.fetch = vi.fn().mockImplementation(() =>
          new Promise(resolve =>
            setTimeout(() => resolve({
              ok: true,
              json: async () => ({ data: [] }),
            }), 100),
          ),
        )

        // Act
        const promise = store.fetchItems()

        // Assert: Loading state
        expect(store.isLoading).toBe(true)

        await promise

        // Assert: Completed state
        expect(store.isLoading).toBe(false)
      })

      it('handles fetch errors', async () => {
        // Arrange
        const store = useStoreNameStore()
        const errorMessage = 'Network error'

        // Mock API failure
        global.fetch = vi.fn().mockRejectedValue(new Error(errorMessage))

        // Act
        await store.fetchItems()

        // Assert
        expect(store.items).toEqual([])
        expect(store.isLoading).toBe(false)
        expect(store.error).toContain(errorMessage)
      })
    })

    describe('addItem', () => {
      it('adds new item to store', async () => {
        // Arrange
        const store = useStoreNameStore()
        const newItem = { id: 1, name: 'New Item' }

        // Mock API call
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => newItem,
        })

        // Act
        await store.addItem(newItem)

        // Assert
        expect(store.items).toContainEqual(newItem)
      })

      it('validates item before adding', async () => {
        // Arrange
        const store = useStoreNameStore()
        const invalidItem = { name: '' } // Missing required field

        // Act & Assert
        await expect(store.addItem(invalidItem)).rejects.toThrow()
      })
    })

    describe('updateItem', () => {
      it('updates existing item', async () => {
        // Arrange
        const store = useStoreNameStore()
        store.items = [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ]

        // Mock API call
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ id: 1, name: 'Updated Item' }),
        })

        // Act
        await store.updateItem(1, { name: 'Updated Item' })

        // Assert
        expect(store.items[0].name).toBe('Updated Item')
      })

      it('throws error when item not found', async () => {
        // Arrange
        const store = useStoreNameStore()
        store.items = []

        // Act & Assert
        await expect(store.updateItem(999, { name: 'Test' })).rejects.toThrow()
      })
    })

    describe('deleteItem', () => {
      it('removes item from store', async () => {
        // Arrange
        const store = useStoreNameStore()
        store.items = [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ]

        // Mock API call
        global.fetch = vi.fn().mockResolvedValue({ ok: true })

        // Act
        await store.deleteItem(1)

        // Assert
        expect(store.items).toHaveLength(1)
        expect(store.items.find(item => item.id === 1)).toBeUndefined()
      })
    })

    describe('resetState', () => {
      it('resets store to initial state', () => {
        // Arrange
        const store = useStoreNameStore()
        store.items = [{ id: 1, name: 'Item' }]
        store.error = 'Error'
        store.isLoading = true

        // Act
        store.$reset()

        // Assert
        expect(store.items).toEqual([])
        expect(store.error).toBeNull()
        expect(store.isLoading).toBe(false)
      })
    })
  })

  describe('State Persistence', () => {
    it('persists state across store instances', () => {
      // Arrange
      const store1 = useStoreNameStore()
      store1.items = [{ id: 1, name: 'Item' }]

      // Act
      const store2 = useStoreNameStore()

      // Assert
      expect(store2.items).toEqual(store1.items)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty state operations', async () => {
      // Arrange
      const store = useStoreNameStore()

      // Act & Assert
      expect(() => store.items.forEach(item => console.log(item))).not.toThrow()
    })

    it('handles concurrent action calls', async () => {
      // Arrange
      const store = useStoreNameStore()

      // Mock API
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      })

      // Act
      await Promise.all([
        store.fetchItems(),
        store.fetchItems(),
        store.fetchItems(),
      ])

      // Assert: Should handle concurrent calls gracefully
      expect(store.isLoading).toBe(false)
    })
  })
})
