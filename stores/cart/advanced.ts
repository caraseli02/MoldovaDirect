/**
 * Cart Advanced Features Module
 *
 * Handles advanced cart functionality like save for later, bulk operations,
 * recommendations, and item selection
 */

import { ref, computed } from 'vue'
import type {
  CartAdvancedState,
  CartAdvancedActions,
  CartAdvancedGetters,
  SavedForLaterItem,
  CartRecommendation,
  BulkOperation,
  Product,
  CartItem,
} from './types'

// =============================================
// STATE MANAGEMENT
// =============================================

const state = ref<CartAdvancedState>({
  selectedItems: new Set<string>(),
  bulkOperationInProgress: false,
  savedForLater: [],
  recommendations: [],
  recommendationsLoading: false,
})

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Generate unique saved item ID
 */
function generateSavedItemId(): string {
  return 'saved_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * Generate unique recommendation ID
 */
function generateRecommendationId(): string {
  return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// =============================================
// ITEM SELECTION MANAGEMENT
// =============================================

/**
 * Select item
 */
function selectItem(itemId: string): void {
  state.value.selectedItems.add(itemId)
}

/**
 * Deselect item
 */
function deselectItem(itemId: string): void {
  state.value.selectedItems.delete(itemId)
}

/**
 * Toggle item selection
 */
function toggleItemSelection(itemId: string): void {
  if (state.value.selectedItems.has(itemId)) {
    deselectItem(itemId)
  }
  else {
    selectItem(itemId)
  }
}

/**
 * Select all items
 */
function selectAllItems(cartItems: CartItem[]): void {
  cartItems.forEach((item) => {
    state.value.selectedItems.add(item.id)
  })
}

/**
 * Deselect all items
 */
function deselectAllItems(): void {
  state.value.selectedItems.clear()
}

/**
 * Toggle select all
 */
function toggleSelectAll(cartItems: CartItem[]): void {
  const allSelected = cartItems.length > 0
    && cartItems.every(item => state.value.selectedItems.has(item.id))

  if (allSelected) {
    deselectAllItems()
  }
  else {
    selectAllItems(cartItems)
  }
}

// =============================================
// BULK OPERATIONS
// =============================================

/**
 * Bulk remove selected items
 */
async function bulkRemoveSelected(
  cartItems: CartItem[],
  removeItemFn: (itemId: string) => Promise<void>,
): Promise<void> {
  if (state.value.bulkOperationInProgress) {
    throw new Error('Bulk operation already in progress')
  }

  state.value.bulkOperationInProgress = true

  try {
    const selectedItemIds = Array.from(state.value.selectedItems)
    const itemsToRemove = cartItems.filter(item =>
      selectedItemIds.includes(item.id),
    )

    // Remove items in parallel
    const removePromises = itemsToRemove.map(item => removeItemFn(item.id))
    await Promise.allSettled(removePromises)

    // Clear selection
    deselectAllItems()
  }
  finally {
    state.value.bulkOperationInProgress = false
  }
}

// =============================================
// SAVE FOR LATER FUNCTIONALITY
// =============================================

/**
 * Save item for later
 */
async function saveItemForLater(
  cartItem: CartItem,
  reason?: string,
  removeItemFn?: (itemId: string) => Promise<void>,
): Promise<void> {
  const savedItem: SavedForLaterItem = {
    id: generateSavedItemId(),
    product: cartItem.product,
    quantity: cartItem.quantity,
    savedAt: new Date(),
    originalCartItemId: cartItem.id,
    reason,
  }

  state.value.savedForLater.push(savedItem)

  // Remove from cart if remove function provided
  if (removeItemFn) {
    await removeItemFn(cartItem.id)
  }
}

/**
 * Restore item from saved for later
 */
async function restoreFromSaved(
  savedItemId: string,
  addItemFn: (product: Product, quantity: number) => Promise<void>,
): Promise<void> {
  const savedItemIndex = state.value.savedForLater.findIndex(
    item => item.id === savedItemId,
  )

  if (savedItemIndex === -1) {
    throw new Error('Saved item not found')
  }

  const savedItem = state.value.savedForLater[savedItemIndex]

  if (!savedItem) {
    throw new Error('Saved item not found after index check')
  }

  // Add back to cart
  await addItemFn(savedItem.product, savedItem.quantity)

  // Remove from saved for later
  state.value.savedForLater.splice(savedItemIndex, 1)
}

/**
 * Remove from saved for later
 */
async function removeFromSavedForLater(savedItemId: string): Promise<void> {
  const savedItemIndex = state.value.savedForLater.findIndex(
    item => item.id === savedItemId,
  )

  if (savedItemIndex === -1) {
    throw new Error('Saved item not found')
  }

  state.value.savedForLater.splice(savedItemIndex, 1)
}

/**
 * Move selected items to saved for later
 */
async function moveSelectedToSavedForLater(
  cartItems: CartItem[],
  removeItemFn: (itemId: string) => Promise<void>,
): Promise<void> {
  if (state.value.bulkOperationInProgress) {
    throw new Error('Bulk operation already in progress')
  }

  state.value.bulkOperationInProgress = true

  try {
    const selectedItemIds = Array.from(state.value.selectedItems)
    const itemsToSave = cartItems.filter(item =>
      selectedItemIds.includes(item.id),
    )

    // Save items for later
    const savePromises = itemsToSave.map(item =>
      saveItemForLater(item, 'bulk_move', removeItemFn),
    )
    await Promise.allSettled(savePromises)

    // Clear selection
    deselectAllItems()
  }
  finally {
    state.value.bulkOperationInProgress = false
  }
}

// =============================================
// RECOMMENDATIONS
// =============================================

/**
 * Load product recommendations
 */
async function loadRecommendations(cartItems: CartItem[]): Promise<void> {
  if (state.value.recommendationsLoading) {
    return
  }

  state.value.recommendationsLoading = true

  try {
    // Extract product IDs and categories from cart
    const productIds = cartItems.map(item => item.product.id)
    const categories = [...new Set(cartItems.map(item => item.product.category).filter(Boolean))]

    // Fetch recommendations from API
    const response = await $fetch('/api/recommendations/cart', {
      method: 'POST',
      body: {
        productIds,
        categories,
        limit: 5,
      },
    })

    if (response.success && response.recommendations) {
      state.value.recommendations = response.recommendations.map((product: Product) => ({
        id: generateRecommendationId(),
        product,
        reason: 'frequently_bought_together',
        confidence: 0.8,
        metadata: {
          source: 'cart_analysis',
          algorithm: response.metadata?.algorithm || 'unknown',
        },
      }))
    }
    else {
      // API returned unsuccessful response
      state.value.recommendations = []
    }
  }
  catch (error: unknown) {
    // Handle different types of errors gracefully
    const err = error as { statusCode?: number, statusMessage?: string, message?: string }
    if (err.statusCode === 404) {
      console.info('Recommendations API not available - feature disabled')
    }
    else if (err.statusCode && err.statusCode >= 500) {
      console.warn('Recommendations API server error:', err.statusMessage || 'Unknown server error')
    }
    else {
      console.warn('Failed to load recommendations:', err.message || String(error))
    }

    // Set empty recommendations on error
    state.value.recommendations = []
  }
  finally {
    state.value.recommendationsLoading = false
  }
}

/**
 * Clear recommendations
 */
function clearRecommendations(): void {
  state.value.recommendations = []
}

// =============================================
// GETTERS
// =============================================

const getters: CartAdvancedGetters = {
  get selectedItemsCount(): number {
    return state.value.selectedItems.size
  },

  get selectedItemsSubtotal(): number {
    // This will be calculated by the main store with access to cart items
    return 0
  },

  get allItemsSelected(): boolean {
    // This will be calculated by the main store with access to cart items
    return false
  },

  get hasSelectedItems(): boolean {
    return state.value.selectedItems.size > 0
  },

  get savedForLaterCount(): number {
    return state.value.savedForLater.length
  },

  isItemSelected(itemId: string): boolean {
    return state.value.selectedItems.has(itemId)
  },

  get getSelectedItems(): CartItem[] {
    // This will be calculated by the main store with access to cart items
    return []
  },

  getSavedForLaterItem(itemId: string): SavedForLaterItem | undefined {
    return state.value.savedForLater.find(item => item.id === itemId)
  },

  isProductSavedForLater(productId: string): boolean {
    return state.value.savedForLater.some(item => item.product.id === productId)
  },
}

// =============================================
// ACTIONS INTERFACE
// =============================================

const actions: CartAdvancedActions = {
  selectItem,
  deselectItem,
  selectAllItems: () => {
    // This will be implemented by the main store with access to cart items
    console.warn('selectAllItems called without cart items context')
  },
  deselectAllItems,
  bulkRemoveSelected: async () => {
    // This will be implemented by the main store with access to cart items and remove function
    console.warn('bulkRemoveSelected called without cart context')
  },
  saveItemForLater: async () => {
    // This will be implemented by the main store with access to cart items
    console.warn('saveItemForLater called without cart context')
  },
  restoreFromSaved: async () => {
    // This will be implemented by the main store with access to add function
    console.warn('restoreFromSaved called without cart context')
  },
  loadRecommendations: async () => {
    // This will be implemented by the main store with access to cart items
    console.warn('loadRecommendations called without cart context')
  },
}

// =============================================
// COMPOSABLE INTERFACE
// =============================================

export function useCartAdvanced() {
  return {
    // State
    state: readonly(state),

    // Getters
    selectedItemsCount: computed(() => getters.selectedItemsCount),
    selectedItemsSubtotal: computed(() => getters.selectedItemsSubtotal),
    allItemsSelected: computed(() => getters.allItemsSelected),
    hasSelectedItems: computed(() => getters.hasSelectedItems),
    savedForLaterCount: computed(() => getters.savedForLaterCount),
    isItemSelected: getters.isItemSelected,
    getSelectedItems: computed(() => getters.getSelectedItems),
    getSavedForLaterItem: getters.getSavedForLaterItem,
    isProductSavedForLater: getters.isProductSavedForLater,

    // Actions
    ...actions,

    // Utilities
    toggleItemSelection,
    toggleSelectAll: () => {
      // This will be implemented by the main store
      console.warn('toggleSelectAll called without cart context')
    },
    saveItemForLater,
    restoreFromSaved,
    removeFromSavedForLater,
    moveSelectedToSavedForLater,
    loadRecommendations,
    clearRecommendations,
  }
}

// =============================================
// DIRECT EXPORTS FOR STORE USAGE
// =============================================

export {
  state as cartAdvancedState,
  getters as cartAdvancedGetters,
  actions as cartAdvancedActions,
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
}
