/**
 * Test Template for Pinia Stores
 *
 * INSTRUCTIONS:
 * 1. Replace `useStoreName` with your store name
 * 2. Update import path
 * 3. Add/remove test sections based on store features
 *
 * CRITICAL: Always use setActivePinia(createPinia()) in beforeEach
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
// import { useStoreName } from '~/stores/storeName'

// ============================================================================
// Mocks
// ============================================================================

// API mock
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Router mock (if store uses router)
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}))

// ============================================================================
// Test Data
// ============================================================================

// const createMockItem = (overrides = {}) => ({
//   id: '1',
//   name: 'Test Item',
//   ...overrides,
// })

// ============================================================================
// Tests
// ============================================================================

describe('useStoreName', () => {
  // let store: ReturnType<typeof useStoreName>

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    // store = useStoreName()
  })

  afterEach(() => {
    // store.$reset()
  })

  // --------------------------------------------------------------------------
  // Initial State
  // --------------------------------------------------------------------------
  describe('Initial State', () => {
    it('should have correct initial values', () => {
      // expect(store.items).toEqual([])
      // expect(store.selectedId).toBe(null)
      // expect(store.isLoading).toBe(false)
    })
  })

  // --------------------------------------------------------------------------
  // State Mutations
  // --------------------------------------------------------------------------
  describe('State Mutations', () => {
    it('should update state directly', () => {
      // const items = [createMockItem()]
      // store.items = items
      //
      // expect(store.items).toEqual(items)
    })

    it('should reset state', () => {
      // store.items = [createMockItem()]
      // store.selectedId = '1'
      //
      // store.$reset()
      //
      // expect(store.items).toEqual([])
      // expect(store.selectedId).toBe(null)
    })
  })

  // --------------------------------------------------------------------------
  // Getters
  // --------------------------------------------------------------------------
  describe('Getters', () => {
    it('should compute derived values', () => {
      // store.items = [
      //   createMockItem({ id: '1', category: 'a' }),
      //   createMockItem({ id: '2', category: 'b' }),
      //   createMockItem({ id: '3', category: 'a' }),
      // ]
      // store.selectedCategory = 'a'
      //
      // expect(store.filteredItems).toHaveLength(2)
    })

    it('should return selected item', () => {
      // store.items = [
      //   createMockItem({ id: '1' }),
      //   createMockItem({ id: '2' }),
      // ]
      // store.selectedId = '2'
      //
      // expect(store.selectedItem?.id).toBe('2')
    })

    it('should compute count', () => {
      // store.items = [createMockItem(), createMockItem(), createMockItem()]
      //
      // expect(store.itemCount).toBe(3)
    })

    it('should compute total', () => {
      // store.items = [
      //   createMockItem({ price: 10 }),
      //   createMockItem({ price: 20 }),
      // ]
      //
      // expect(store.totalPrice).toBe(30)
    })

    it('should handle empty state', () => {
      // expect(store.isEmpty).toBe(true)
      // expect(store.filteredItems).toEqual([])
    })
  })

  // --------------------------------------------------------------------------
  // Actions - Synchronous
  // --------------------------------------------------------------------------
  describe('Actions - Synchronous', () => {
    it('should add item', () => {
      // const item = createMockItem()
      //
      // store.addItem(item)
      //
      // expect(store.items).toContainEqual(item)
      // expect(store.items).toHaveLength(1)
    })

    it('should remove item', () => {
      // store.items = [
      //   createMockItem({ id: '1' }),
      //   createMockItem({ id: '2' }),
      // ]
      //
      // store.removeItem('1')
      //
      // expect(store.items).toHaveLength(1)
      // expect(store.items.find(i => i.id === '1')).toBeUndefined()
    })

    it('should update item', () => {
      // store.items = [createMockItem({ id: '1', name: 'Original' })]
      //
      // store.updateItem('1', { name: 'Updated' })
      //
      // expect(store.items[0].name).toBe('Updated')
    })

    it('should select item', () => {
      // store.selectItem('123')
      //
      // expect(store.selectedId).toBe('123')
    })

    it('should clear selection', () => {
      // store.selectedId = '123'
      //
      // store.clearSelection()
      //
      // expect(store.selectedId).toBe(null)
    })
  })

  // --------------------------------------------------------------------------
  // Actions - Asynchronous
  // --------------------------------------------------------------------------
  describe('Actions - Asynchronous', () => {
    it('should fetch items successfully', async () => {
      // const mockItems = [createMockItem()]
      // mockFetch.mockResolvedValue({ items: mockItems })
      //
      // await store.fetchItems()
      //
      // expect(store.items).toEqual(mockItems)
      // expect(store.isLoading).toBe(false)
    })

    it('should set loading state during fetch', async () => {
      // mockFetch.mockImplementation(() => new Promise(() => {}))
      //
      // const fetchPromise = store.fetchItems()
      //
      // expect(store.isLoading).toBe(true)
    })

    it('should handle fetch error', async () => {
      // mockFetch.mockRejectedValue(new Error('Network error'))
      //
      // await store.fetchItems()
      //
      // expect(store.error?.message).toBe('Network error')
      // expect(store.isLoading).toBe(false)
    })

    it('should create item via API', async () => {
      // const newItem = { name: 'New Item' }
      // const createdItem = { id: '1', ...newItem }
      // mockFetch.mockResolvedValue(createdItem)
      //
      // await store.createItem(newItem)
      //
      // expect(mockFetch).toHaveBeenCalledWith('/api/items', {
      //   method: 'POST',
      //   body: newItem,
      // })
      // expect(store.items).toContainEqual(createdItem)
    })

    it('should delete item via API', async () => {
      // store.items = [createMockItem({ id: '1' })]
      // mockFetch.mockResolvedValue({ success: true })
      //
      // await store.deleteItem('1')
      //
      // expect(mockFetch).toHaveBeenCalledWith('/api/items/1', {
      //   method: 'DELETE',
      // })
      // expect(store.items).toHaveLength(0)
    })
  })

  // --------------------------------------------------------------------------
  // Side Effects
  // --------------------------------------------------------------------------
  describe('Side Effects', () => {
    it('should navigate after action', async () => {
      // mockFetch.mockResolvedValue({ id: '1' })
      //
      // await store.createAndNavigate({ name: 'New' })
      //
      // expect(mockPush).toHaveBeenCalledWith('/items/1')
    })
  })

  // --------------------------------------------------------------------------
  // Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle removing non-existent item', () => {
      // store.items = [createMockItem({ id: '1' })]
      //
      // store.removeItem('non-existent')
      //
      // expect(store.items).toHaveLength(1)
    })

    it('should handle updating non-existent item', () => {
      // store.items = [createMockItem({ id: '1' })]
      //
      // store.updateItem('non-existent', { name: 'Updated' })
      //
      // expect(store.items[0].name).toBe('Test Item')
    })

    it('should handle duplicate adds', () => {
      // const item = createMockItem({ id: '1' })
      //
      // store.addItem(item)
      // store.addItem(item) // Adding same item again
      //
      // // Behavior depends on implementation
      // // Either prevent duplicates or allow them
      // expect(store.items).toHaveLength(1) // or 2
    })
  })

  // --------------------------------------------------------------------------
  // $subscribe (if testing subscriptions)
  // --------------------------------------------------------------------------
  describe('Subscriptions', () => {
    it('should notify on state change', () => {
      // const callback = vi.fn()
      //
      // store.$subscribe(callback)
      // store.items = [createMockItem()]
      //
      // expect(callback).toHaveBeenCalled()
    })

    it('should track action calls', () => {
      // const callback = vi.fn()
      //
      // store.$onAction(callback)
      // store.addItem(createMockItem())
      //
      // expect(callback).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     name: 'addItem',
      //   })
      // )
    })
  })
})

// ============================================================================
// Store with External Dependencies Template
// ============================================================================

describe('useStoreName with dependencies', () => {
  // For stores that use router, other stores, or have complex dependencies,
  // use dynamic imports to ensure mocks are applied
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('$fetch', mockFetch)
    setActivePinia(createPinia())
  })

  async function getStore() {
    // Dynamic import after mocks are set up
    // const { useStoreName } = await import('~/stores/storeName')
    // return useStoreName()
  }

  it('should use router', async () => {
    // const store = await getStore()
    // await store.navigateToItem('123')
    // expect(mockPush).toHaveBeenCalledWith('/items/123')
  })
})
