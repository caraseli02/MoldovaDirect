import { useCartStore } from "~/stores/cart";
import { ref, computed } from "vue";

export const useCart = () => {
  // CRITICAL FIX v3: Cart store is client-only, check before accessing
  // The cart uses cookies which are only available on the client
  // Attempting to access the store during SSR will fail

  if (!process.client) {
    // Return empty cart interface for SSR
    return {
      items: computed(() => []),
      itemCount: computed(() => 0),
      subtotal: computed(() => 0),
      isEmpty: computed(() => true),
      loading: computed(() => false),
      error: computed(() => null),
      sessionId: computed(() => null),
      storageType: computed(() => 'cookie' as const),
      lastSyncAt: computed(() => null),
      validationInProgress: computed(() => false),
      backgroundValidationEnabled: computed(() => false),
      lastBackgroundValidation: computed(() => null),
      selectedItems: computed(() => []),
      selectedItemsCount: computed(() => 0),
      selectedItemsSubtotal: computed(() => 0),
      allItemsSelected: computed(() => false),
      hasSelectedItems: computed(() => false),
      bulkOperationInProgress: computed(() => false),
      savedForLater: computed(() => []),
      savedForLaterCount: computed(() => 0),
      recommendations: computed(() => []),
      recommendationsLoading: computed(() => false),
      performanceMetrics: computed(() => ({
        totalOperations: 0,
        averageOperationTime: 0,
        slowestOperation: null,
        fastestOperation: null
      })),
      isInCart: () => false,
      getItemByProductId: () => undefined,
      addItem: async () => {},
      updateQuantity: async () => {},
      removeItem: async () => {},
      clearCart: async () => {},
      validateCart: async () => {},
      directAddItem: async () => {},
      directUpdateQuantity: async () => {},
      directRemoveItem: async () => {},
      directClearCart: async () => {},
      directValidateCart: async () => {},
      recoverCart: async () => {},
      forceSync: () => {},
      toggleBackgroundValidation: () => {},
      clearValidationCache: () => {},
      validateCartWithRetry: async () => {},
      isItemSelected: () => false,
      getSelectedItems: () => [],
      toggleItemSelection: () => {},
      toggleSelectAll: () => {},
      removeSelectedItems: async () => {},
      moveSelectedToSavedForLater: async () => {},
      addToSavedForLater: async () => {},
      removeFromSavedForLater: async () => {},
      moveToCartFromSavedForLater: async () => {},
      loadRecommendations: async () => {},
      getPerformanceMetrics: () => ({
        totalOperations: 0,
        averageOperationTime: 0,
        slowestOperation: null,
        fastestOperation: null
      }),
      resetPerformanceMetrics: () => {}
    }
  }

  const cartStore = useCartStore()

  // Initialize cart on client side only
  if (cartStore && !cartStore.sessionId) {
    cartStore.initializeCart()
  }

  // Store-based reactive properties
  const items = computed(() => cartStore.items)
  const itemCount = computed(() => cartStore.itemCount)
  const subtotal = computed(() => cartStore.subtotal)
  const isEmpty = computed(() => cartStore.isEmpty)
  const loading = computed(() => cartStore.loading)
  const error = computed(() => cartStore.error)
  const sessionId = computed(() => cartStore.sessionId)
  const storageType = computed(() => cartStore.storageType)
  const lastSyncAt = computed(() => cartStore.lastSyncAt)
  const validationInProgress = computed(() => cartStore.validationInProgress)
  const backgroundValidationEnabled = computed(() => cartStore.backgroundValidationEnabled)
  const lastBackgroundValidation = computed(() => cartStore.lastBackgroundValidation)
  const selectedItems = computed(() => cartStore.selectedItems)
  const selectedItemsCount = computed(() => cartStore.selectedItemsCount)
  const selectedItemsSubtotal = computed(() => cartStore.selectedItemsSubtotal)
  const allItemsSelected = computed(() => cartStore.allItemsSelected)
  const hasSelectedItems = computed(() => cartStore.hasSelectedItems)
  const bulkOperationInProgress = computed(() => cartStore.bulkOperationInProgress)
  const savedForLater = computed(() => cartStore.savedForLater)
  const savedForLaterCount = computed(() => cartStore.savedForLaterCount)
  const recommendations = computed(() => cartStore.recommendations)
  const recommendationsLoading = computed(() => cartStore.recommendationsLoading)
  const performanceMetrics = computed(() => cartStore.performanceMetrics)

  // Store methods - direct passthrough to store
  const isInCart = (productId: string) => cartStore.isInCart(productId)
  const getItemByProductId = (productId: string) => cartStore.getItemByProductId(productId)
  const addItem = async (product: any, quantity?: number) => cartStore.addItem(product, quantity)
  const updateQuantity = async (itemId: string, quantity: number) => cartStore.updateQuantity(itemId, quantity)
  const removeItem = async (itemId: string) => cartStore.removeItem(itemId)
  const clearCart = async () => cartStore.clearCart()
  const validateCart = async () => cartStore.validateCart()
  const directAddItem = async (product: any, quantity?: number) => cartStore.directAddItem(product, quantity)
  const directUpdateQuantity = async (itemId: string, quantity: number) => cartStore.directUpdateQuantity(itemId, quantity)
  const directRemoveItem = async (itemId: string) => cartStore.directRemoveItem(itemId)
  const directClearCart = async () => cartStore.directClearCart()
  const directValidateCart = async () => cartStore.directValidateCart()
  const recoverCart = async () => cartStore.recoverCart()
  const forceSync = () => cartStore.forceSync()
  const toggleBackgroundValidation = () => cartStore.toggleBackgroundValidation()
  const clearValidationCache = () => cartStore.clearValidationCache()
  const validateCartWithRetry = async (maxRetries?: number) => cartStore.validateCartWithRetry(maxRetries)
  const isItemSelected = (itemId: string) => cartStore.isItemSelected(itemId)
  const getSelectedItems = () => cartStore.getSelectedItems()
  const toggleItemSelection = (itemId: string) => cartStore.toggleItemSelection(itemId)
  const toggleSelectAll = () => cartStore.toggleSelectAll()
  const removeSelectedItems = async () => cartStore.removeSelectedItems()
  const moveSelectedToSavedForLater = async () => cartStore.moveSelectedToSavedForLater()
  const addToSavedForLater = async (product: any, quantity?: number) => cartStore.addToSavedForLater(product, quantity)
  const removeFromSavedForLater = async (itemId: string) => cartStore.removeFromSavedForLater(itemId)
  const moveToCartFromSavedForLater = async (itemId: string) => cartStore.moveToCartFromSavedForLater(itemId)
  const loadRecommendations = async () => cartStore.loadRecommendations()
  const getPerformanceMetrics = () => cartStore.getPerformanceMetrics()
  const resetPerformanceMetrics = () => cartStore.resetPerformanceMetrics()

  return {
    items,
    itemCount,
    subtotal,
    isEmpty,
    loading,
    error,
    sessionId,
    storageType,
    lastSyncAt,
    validationInProgress,
    backgroundValidationEnabled,
    lastBackgroundValidation,
    selectedItems,
    selectedItemsCount,
    selectedItemsSubtotal,
    allItemsSelected,
    hasSelectedItems,
    bulkOperationInProgress,
    savedForLater,
    savedForLaterCount,
    recommendations,
    recommendationsLoading,
    performanceMetrics,
    isInCart,
    getItemByProductId,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    validateCart,
    directAddItem,
    directUpdateQuantity,
    directRemoveItem,
    directClearCart,
    directValidateCart,
    recoverCart,
    forceSync,
    toggleBackgroundValidation,
    clearValidationCache,
    validateCartWithRetry,
    isItemSelected,
    getSelectedItems,
    toggleItemSelection,
    toggleSelectAll,
    removeSelectedItems,
    moveSelectedToSavedForLater,
    addToSavedForLater,
    removeFromSavedForLater,
    moveToCartFromSavedForLater,
    loadRecommendations,
    getPerformanceMetrics,
    resetPerformanceMetrics
  }
}