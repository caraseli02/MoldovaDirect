/**
 * Main Cart Store - Modular Coordinator
 *
 * This is the main cart store that coordinates all cart modules
 * while maintaining backward compatibility with the existing API
 */

import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { useCartCore } from './core'
import { useCartPersistence } from './persistence'
import { useCartValidation } from './validation'
import { useCartAnalytics } from './analytics'
import { useCartSecurity } from './security'
import { useCartAdvanced } from './advanced'
import { CART_COOKIE_CONFIG, COOKIE_NAMES } from '~/config/cookies'
import type {
  Product,
  CartItem,
  SavedForLaterItem,
} from './types'

// =============================================
// MAIN CART STORE
// =============================================

export const useCartStore = defineStore('cart', () => {
  // =============================================
  // MODULE INITIALIZATION
  // =============================================

  const core = useCartCore()
  const persistence = useCartPersistence()
  const validation = useCartValidation()
  const analytics = useCartAnalytics()
  const security = useCartSecurity()
  const advanced = useCartAdvanced()

  // =============================================
  // SINGLE COOKIE INSTANCE (CRITICAL FOR SYNC)
  // =============================================

  // IMPORTANT: Create ONE cookie ref and reuse it everywhere
  // Multiple useCookie() calls are NOT synced in Nuxt 3
  const cartCookie = useCookie<any>(COOKIE_NAMES.CART, {
    ...CART_COOKIE_CONFIG,
    watch: CART_COOKIE_CONFIG.watch === 'deep' ? false : CART_COOKIE_CONFIG.watch,
  } as any)

  // =============================================
  // UNIFIED STATE
  // =============================================

  // Core state
  const items = computed(() => core.state.value.items)
  const sessionId = computed(() => core.state.value.sessionId)
  const loading = computed(() => core.state.value.loading)
  const error = computed(() => core.state.value.error)
  const lastSyncAt = computed(() => core.state.value.lastSyncAt)

  // Persistence state
  const storageType = computed(() => persistence.state.value.storageType)
  const lastSaveAt = computed(() => persistence.state.value.lastSaveAt)
  const saveInProgress = computed(() => persistence.state.value.saveInProgress)

  // Validation state
  const validationInProgress = computed(() => validation.state.value.validationInProgress)
  const backgroundValidationEnabled = computed(() => validation.state.value.backgroundValidationEnabled)
  const lastBackgroundValidation = computed(() => validation.state.value.lastBackgroundValidation)

  // Analytics state
  const analyticsSessionStartTime = computed(() => analytics.state.value.sessionStartTime)
  const analyticsLastActivity = computed(() => analytics.state.value.lastActivity)

  // Security state
  const securityEnabled = computed(() => security.state.value.securityEnabled)
  const riskLevel = computed(() => security.state.value.riskLevel)

  // Advanced features state
  const selectedItems = computed(() => advanced.state.value.selectedItems)
  const selectedItemsCount = computed(() => advanced.selectedItemsCount.value)
  const selectedItemsSubtotal = computed(() => {
    return items.value
      .filter(item => advanced.state.value.selectedItems.has(item.id))
      .reduce((total, item) => total + item.product.price * item.quantity, 0)
  })
  const allItemsSelected = computed(() => {
    return items.value.length > 0
      && items.value.every(item => advanced.state.value.selectedItems.has(item.id))
  })
  const hasSelectedItems = computed(() => advanced.hasSelectedItems.value)
  const bulkOperationInProgress = computed(() => advanced.state.value.bulkOperationInProgress)
  const savedForLater = computed(() => advanced.state.value.savedForLater)
  const savedForLaterCount = computed(() => advanced.savedForLaterCount.value)
  const recommendations = computed(() => advanced.state.value.recommendations)
  const recommendationsLoading = computed(() => advanced.state.value.recommendationsLoading)

  // =============================================
  // UNIFIED GETTERS
  // =============================================

  const itemCount = computed(() => core.itemCount.value)
  const subtotal = computed(() => core.subtotal.value)
  const isEmpty = computed(() => core.isEmpty.value)

  // =============================================
  // CART DATA PERSISTENCE
  // =============================================

  /**
   * Convert items to serializable format
   */
  function serializeCartData(): any {
    return {
      items: items.value,
      sessionId: sessionId.value,
      lastSyncAt: lastSyncAt.value,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }
  }

  /**
   * Convert serialized data back to cart items
   */
  function deserializeCartData(data: any): void {
    if (!data?.items) {
      console.log('   No items to deserialize')
      return
    }

    // Validate that items is actually an array
    if (!Array.isArray(data.items)) {
      throw new Error('Invalid cart data: items must be an array')
    }

    console.log(`🔄 Deserializing ${data.items.length} items...`)

    try {
      // Pause the auto-save watch temporarily to avoid saving during deserialization
      if (stopWatcher) {
        stopWatcher()
        console.log('   Paused auto-save watch')
      }

      // Clear existing items using proper API
      core.clearCart()
      console.log('   Cleared existing items')

      // Restore each item using the proper addItem API
      for (const item of data.items) {
        const product = {
          id: item.product.id,
          slug: item.product.slug,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images || [],
          stock: item.product.stock,
        }
        core.addItem(product, item.quantity)
      }
      console.log(`   Restored ${data.items.length} items`)

      // Note: sessionId and lastSyncAt are managed by core module
      // They will be automatically regenerated/updated as needed

      // Resume the auto-save watch
      stopWatcher = watch(
        () => items.value,
        () => {
          saveAndCacheCartData()
        },
        { deep: true },
      )
      console.log('   Resumed auto-save watch')
      console.log('✅ Deserialization complete')
    }
    catch (error) {
      console.error('❌ Failed to deserialize cart items:', error)
      // Ensure watch is resumed even if deserialization fails
      if (!stopWatcher) {
        stopWatcher = watch(
          () => items.value,
          () => {
            saveAndCacheCartData()
          },
          { deep: true },
        )
      }
    }
  }

  /**
   * Save cart data to storage using cookies
   */
  async function saveToStorage(): Promise<{ success: boolean, error?: string }> {
    try {
      const data = serializeCartData()
      console.log('💾 Saving cart to cookie:', {
        itemsCount: data.items?.length || 0,
        sessionId: data.sessionId,
        timestamp: data.timestamp,
      })
      cartCookie.value = data
      console.log('✅ Cart cookie value set')
      return { success: true }
    }
    catch (error) {
      console.error('❌ Failed to save cart to storage:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Save failed',
      }
    }
  }

  /**
   * Load cart data from storage using cookies
   */
  async function loadFromStorage(): Promise<{ success: boolean, data?: any, error?: string }> {
    try {
      console.log('📥 Loading cart from cookie...')
      const loadedData = cartCookie.value
      console.log('   Cookie data:', loadedData ? `${JSON.stringify(loadedData).length} bytes` : 'null')

      if (loadedData?.items) {
        console.log(`   Found ${loadedData.items.length} items in cookie`)
        deserializeCartData(loadedData)
        console.log('✅ Cart loaded successfully')
        return { success: true, data: loadedData }
      }

      console.log('   No items in cookie (empty cart)')
      return { success: true, data: null }
    }
    catch (error) {
      console.error('❌ Failed to load cart from storage:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Load failed',
      }
    }
  }

  /**
   * Clear cart data from storage using cookies
   */
  async function clearStorage(): Promise<{ success: boolean, error?: string }> {
    try {
      cartCookie.value = null
      return { success: true }
    }
    catch (error) {
      console.error('Failed to clear cart storage:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Clear failed',
      }
    }
  }

  // =============================================
  // INITIALIZATION
  // =============================================

  /**
   * Initialize cart with all modules
   */
  function initializeCart(): void {
    // Initialize core
    core.initializeCart()

    // Load from storage
    if (import.meta.client) {
      loadFromStorage().catch((error) => {
        console.warn('Failed to load cart from storage:', error)
      })
    }

    // Initialize analytics
    if (import.meta.client && sessionId.value) {
      analytics.initializeCartSession(sessionId.value)
    }

    // Start background validation if enabled
    if (backgroundValidationEnabled.value && import.meta.client) {
      validation.startBackgroundValidation()
    }

    // Load recommendations if cart has items
    if (import.meta.client && items.value.length > 0) {
      advanced.loadRecommendations([...items.value] as CartItem[]).catch((error) => {
        console.warn('Failed to load recommendations:', error)
      })
    }
  }

  // =============================================
  // DEBOUNCED SAVE FUNCTIONALITY
  // =============================================

  let saveTimeoutId: NodeJS.Timeout | null = null

  /**
   * Save cart data with debouncing to avoid excessive writes
   */
  async function saveAndCacheCartData(): Promise<void> {
    console.log('⏱️  saveAndCacheCartData called - scheduling save in 1 second')

    // Clear any existing timeout
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId)
      console.log('   Cleared previous save timeout')
    }

    // Set a new timeout for saving
    saveTimeoutId = setTimeout(async () => {
      console.log('🔔 Save timeout fired - calling saveToStorage()')
      try {
        await saveToStorage()
      }
      catch (error) {
        console.warn('❌ Debounced save failed:', error)
      }
    }, 1000) // 1 second debounce
  }

  // =============================================
  // ENHANCED CORE ACTIONS
  // =============================================

  /**
   * Add item to cart with all enhancements
   */
  async function addItem(product: Product, quantity: number = 1): Promise<void> {
    // Use secure add if security is enabled
    if (securityEnabled.value && sessionId.value) {
      try {
        await security.secureAddItem(product.id, quantity, sessionId.value)
      }
      catch (securityError) {
        console.warn('Secure add failed, falling back to regular add:', securityError)
      }
    }

    // Add item via core module
    await core.addItem(product, quantity)

    // Track analytics
    if (import.meta.client && sessionId.value) {
      analytics.trackAddToCart(
        product,
        quantity,
        subtotal.value,
        itemCount.value,
        sessionId.value,
      )
    }

    // Add to validation queue for background validation
    validation.addToValidationQueue(product.id, 'high')

    // Save to storage
    await saveAndCacheCartData()
  }

  /**
   * Remove item from cart with all enhancements
   */
  async function removeItem(itemId: string): Promise<void> {
    // Get item for analytics before removal
    const item = core.getItemByProductId(itemId)
      || items.value.find(i => i.id === itemId)

    // Use secure remove if security is enabled
    if (securityEnabled.value && sessionId.value) {
      try {
        await security.secureRemoveItem(itemId, sessionId.value)
      }
      catch (securityError) {
        console.warn('Secure remove failed, falling back to regular remove:', securityError)
      }
    }

    // Remove item via core module
    await core.removeItem(itemId)

    // Track analytics
    if (import.meta.client && sessionId.value && item) {
      analytics.trackRemoveFromCart(
        { ...item.product } as Product,
        item.quantity,
        subtotal.value,
        itemCount.value,
        sessionId.value,
      )
    }

    // Save to storage
    await saveAndCacheCartData()
  }

  /**
   * Update item quantity with all enhancements
   */
  async function updateQuantity(itemId: string, quantity: number): Promise<void> {
    // Get item for analytics before update
    const item = items.value.find(i => i.id === itemId)
    const oldQuantity = item?.quantity || 0

    // Use secure update if security is enabled
    if (securityEnabled.value && sessionId.value) {
      try {
        await security.secureUpdateQuantity(itemId, quantity, sessionId.value)
      }
      catch (securityError) {
        console.warn('Secure update failed, falling back to regular update:', securityError)
      }
    }

    // Update quantity via core module
    await core.updateQuantity(itemId, quantity)

    // Track analytics
    if (import.meta.client && sessionId.value && item) {
      analytics.trackQuantityUpdate(
        { ...item.product } as Product,
        oldQuantity,
        quantity,
        subtotal.value,
        itemCount.value,
        sessionId.value,
      )
    }

    // Save to storage
    await saveAndCacheCartData()
  }

  /**
   * Clear cart with persistence
   */
  async function clearCart(): Promise<void> {
    await core.clearCart()
    await saveAndCacheCartData()
  }

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  const getItemByProductId = (productId: string) => core.getItemByProductId(productId)
  const isInCart = (productId: string) => core.isInCart(productId)
  const generateItemId = () => core.generateItemId()
  const generateSessionId = () => core.generateSessionId()

  // =============================================
  // ADVANCED FEATURES METHODS
  // =============================================

  const isItemSelected = (itemId: string) => advanced.isItemSelected(itemId)
  const getSelectedItems = () => items.value.filter(item => advanced.state.value.selectedItems.has(item.id))

  function toggleItemSelection(itemId: string): void {
    advanced.toggleItemSelection(itemId)
  }

  function toggleSelectAll(): void {
    if (allItemsSelected.value) {
      advanced.deselectAllItems()
    }
    else {
      items.value.forEach(item => advanced.selectItem(item.id))
    }
  }

  async function removeSelectedItems(): Promise<void> {
    const selectedItemIds = Array.from(advanced.state.value.selectedItems)
    const removePromises = selectedItemIds.map(itemId => removeItem(itemId))
    await Promise.allSettled(removePromises)
    advanced.deselectAllItems()
  }

  async function moveSelectedToSavedForLater(): Promise<void> {
    const selectedItemIds = Array.from(advanced.state.value.selectedItems)
    const itemsToSave = items.value.filter(item => selectedItemIds.includes(item.id))

    for (const item of itemsToSave) {
      await advanced.saveItemForLater({ ...item } as CartItem, 'bulk_move', removeItem)
    }

    advanced.deselectAllItems()
  }

  async function addToSavedForLater(product: Product, quantity: number = 1): Promise<void> {
    const savedItem: SavedForLaterItem = {
      id: 'saved_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      product,
      quantity,
      savedAt: new Date(),
    }
    // Use advanced module's internal state directly to avoid readonly issues
    const stateRef = advanced.state as unknown as { value: CartAdvancedState }
    stateRef.value.savedForLater = [...stateRef.value.savedForLater, savedItem]
  }

  async function removeFromSavedForLater(itemId: string): Promise<void> {
    await advanced.removeFromSavedForLater(itemId)
  }

  async function moveToCartFromSavedForLater(itemId: string): Promise<void> {
    const savedItem = advanced.getSavedForLaterItem(itemId)
    if (savedItem) {
      await addItem(savedItem.product, savedItem.quantity)
      await advanced.removeFromSavedForLater(itemId)
    }
  }

  async function loadRecommendations(): Promise<void> {
    await advanced.loadRecommendations([...items.value] as CartItem[])
  }

  // =============================================
  // VALIDATION METHODS
  // =============================================

  async function validateCart(): Promise<boolean> {
    try {
      const result = await validation.validateAllCartItems([...items.value] as CartItem[])

      // Update cart with validated items by clearing and re-adding
      core.clearCart()
      result.validItems.forEach((item) => {
        core.addItem(item.product, item.quantity)
      })

      // Handle invalid items
      if (result.invalidItems.length > 0) {
        console.warn('Some cart items were invalid and removed:', result.invalidItems)
      }

      // Handle changes
      if (result.changes.length > 0) {
        console.info('Cart items were updated:', result.changes)
      }

      await saveAndCacheCartData()
      return true
    }
    catch (error) {
      console.error('Cart validation failed:', error)
      return false
    }
  }

  async function validateCartWithRetry(maxRetries: number = 3): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const success = await validateCart()
        if (success) return true
      }
      catch (error) {
        if (i === maxRetries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
    return false
  }

  // Direct access methods (bypassing enhancements)
  const directAddItem = (product: Product, quantity: number = 1) => core.addItem(product, quantity)
  const directUpdateQuantity = (itemId: string, quantity: number) => core.updateQuantity(itemId, quantity)
  const directRemoveItem = (itemId: string) => core.removeItem(itemId)
  const directClearCart = () => core.clearCart()
  const directValidateCart = () => validateCart()

  async function recoverCart(): Promise<boolean> {
    try {
      const result = await loadFromStorage()
      return result.success
    }
    catch (error) {
      console.error('Cart recovery failed:', error)
      return false
    }
  }

  function forceSync(): Promise<{ success: boolean, error?: string }> {
    return saveToStorage()
  }

  function toggleBackgroundValidation(): void {
    if (validation.state.value.backgroundValidationEnabled) {
      validation.stopBackgroundValidation()
    }
    else {
      validation.startBackgroundValidation()
    }
  }

  function clearValidationCache(productId?: string): void {
    validation.clearValidationCache(productId)
  }

  // Performance metrics (mock implementation)
  const performanceMetrics = computed(() => ({
    lastOperationTime: 0,
    averageOperationTime: 0,
    operationCount: 0,
    syncCount: 0,
    errorCount: 0,
  }))

  const getPerformanceMetrics = () => performanceMetrics.value
  const resetPerformanceMetrics = () => {
    // Mock implementation
  }

  // =============================================
  // AUTO-SAVE FUNCTIONALITY
  // =============================================

  // Watch for cart changes and automatically save to cookies
  let stopWatcher: (() => void) | null = null

  if (import.meta.client) {
    stopWatcher = watch(
      () => items.value,
      () => {
        saveAndCacheCartData()
      },
      { deep: true },
    )
  }

  // =============================================
  // LIFECYCLE HOOKS
  // =============================================

  // NOTE: onMounted/onUnmounted don't work in Pinia stores outside components
  // Cart loading is handled by initializeCart() called from plugin
  // Auto-save watch will be cleaned up when store instance is disposed

  // =============================================
  // RETURN STORE INTERFACE
  // =============================================

  return {
    // State
    items,
    sessionId,
    loading,
    error,
    lastSyncAt,
    storageType,
    lastSaveAt,
    saveInProgress,

    // Getters
    itemCount,
    subtotal,
    isEmpty,
    getItemByProductId,
    isInCart,

    // Lock state
    isLocked: core.isLocked,
    lockedAt: core.lockedAt,
    lockedUntil: core.lockedUntil,
    lockedByCheckoutSessionId: core.lockedByCheckoutSessionId,

    // Core Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,

    // Cart locking actions
    lockCart: core.lockCart,
    unlockCart: core.unlockCart,
    checkLockStatus: core.checkLockStatus,
    isCartLocked: core.isCartLocked,

    // Persistence Actions
    saveToStorage,
    loadFromStorage,
    clearStorage,
    saveAndCacheCartData,

    // Initialization
    initializeCart,

    // Utilities
    generateItemId,
    generateSessionId,

    // Additional state
    validationInProgress,
    backgroundValidationEnabled,
    lastBackgroundValidation,
    analyticsSessionStartTime,
    analyticsLastActivity,
    securityEnabled,
    riskLevel,

    // Advanced features state
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

    // Advanced features methods
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

    // Validation and utility methods
    validateCart,
    validateCartWithRetry,
    directAddItem,
    directUpdateQuantity,
    directRemoveItem,
    directClearCart,
    directValidateCart,
    recoverCart,
    forceSync,
    toggleBackgroundValidation,
    clearValidationCache,
    performanceMetrics,
    getPerformanceMetrics,
    resetPerformanceMetrics,

    // Module Access (for advanced usage)
    _modules: {
      core,
      persistence,
      validation,
      analytics,
      security,
      advanced,
    },
  }
})

// =============================================
// BACKWARD COMPATIBILITY EXPORTS
// =============================================

// Export the main store as default
export default useCartStore

// Export types for external usage
export type {
  Product,
  CartItem,
  CartCoreState,
  CartPersistenceState,
} from './types'
