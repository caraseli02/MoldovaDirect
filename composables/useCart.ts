import { useCartStore } from "~/stores/cart";
import { ref, computed } from "vue";

export const useCart = () => {
  // CRITICAL FIX: Always try to get the cart store directly
  // Don't check for Pinia availability - let Nuxt handle it
  // This ensures the store is properly initialized during hydration on Vercel

  let cartStore: ReturnType<typeof useCartStore> | null = null

  try {
    // On client side, always get the store
    if (process.client) {
      cartStore = useCartStore()

      // Initialize cart if not already initialized
      if (cartStore && !cartStore.sessionId) {
        cartStore.initializeCart()
      }
    }
  } catch (error) {
    console.error('Failed to initialize cart store:', error)
    cartStore = null
  }

  // If store is not available (SSR or error), return minimal interface
  if (!cartStore) {
    console.warn('Cart store not available, returning stub interface')
    // Return minimal interface for SSR
    return {
      items: ref([]),
      itemCount: ref(0),
      subtotal: ref(0),
      isEmpty: ref(true),
      loading: ref(false),
      error: ref(null),
      sessionId: ref(null),
      isInCart: () => false,
      getItemByProductId: () => undefined,
      addItem: async () => {
        console.warn('Cart not initialized - addItem stub called')
      },
      updateQuantity: async () => {},
      removeItem: async () => {},
      clearCart: async () => {},
      validateCart: async () => {},
      directAddItem: async () => {},
      directUpdateQuantity: async () => {},
      directRemoveItem: async () => {},
      directClearCart: async () => {},
      directValidateCart: async () => {},
      recoverCart: async () => false,
      forceSync: () => false,
      storageType: ref("memory"),
      lastSyncAt: ref(null),
      validationInProgress: ref(false),
      backgroundValidationEnabled: ref(false),
      lastBackgroundValidation: ref(null),
      toggleBackgroundValidation: () => {},
      clearValidationCache: () => {},
      validateCartWithRetry: async () => false,
      selectedItems: ref(new Set()),
      selectedItemsCount: ref(0),
      selectedItemsSubtotal: ref(0),
      allItemsSelected: ref(false),
      hasSelectedItems: ref(false),
      bulkOperationInProgress: ref(false),
      isItemSelected: () => false,
      getSelectedItems: ref([]),
      toggleItemSelection: () => {},
      toggleSelectAll: () => {},
      removeSelectedItems: async () => {},
      moveSelectedToSavedForLater: async () => {},
      savedForLater: ref([]),
      savedForLaterCount: ref(0),
      addToSavedForLater: async () => {},
      removeFromSavedForLater: async () => {},
      moveToCartFromSavedForLater: async () => {},
      recommendations: ref([]),
      recommendationsLoading: ref(false),
      loadRecommendations: async () => {},
      performanceMetrics: ref({
        lastOperationTime: 0,
        averageOperationTime: 0,
        operationCount: 0,
        syncCount: 0,
        errorCount: 0
      }),
      getPerformanceMetrics: () => ({
        lastOperationTime: 0,
        averageOperationTime: 0,
        operationCount: 0,
        syncCount: 0,
        errorCount: 0
      }),
      resetPerformanceMetrics: () => {}
    }
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

  // Store methods with defensive checks
  const isInCart = (productId: string) => cartStore?.isInCart ? cartStore.isInCart(productId) : false
  const getItemByProductId = (productId: string) => cartStore?.getItemByProductId ? cartStore.getItemByProductId(productId) : undefined
  const addItem = async (product: any, quantity?: number) => {
    if (cartStore?.addItem) {
      return cartStore.addItem(product, quantity)
    }
    throw new Error('Cart store not available')
  }
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (cartStore?.updateQuantity) {
      return cartStore.updateQuantity(itemId, quantity)
    }
    throw new Error('Cart store not available')
  }
  const removeItem = async (itemId: string) => {
    if (cartStore?.removeItem) {
      return cartStore.removeItem(itemId)
    }
    throw new Error('Cart store not available')
  }
  const clearCart = async () => {
    if (cartStore?.clearCart) {
      return cartStore.clearCart()
    }
    throw new Error('Cart store not available')
  }
  const validateCart = async () => {
    if (cartStore?.validateCart) {
      return cartStore.validateCart()
    }
    throw new Error('Cart store not available')
  }
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