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
import type { 
  Product, 
  CartItem, 
  CartCoreState,
  CartPersistenceState,
  CartValidationState,
  CartAnalyticsState,
  CartSecurityState,
  CartAdvancedState
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
    return items.value.length > 0 && 
           items.value.every(item => advanced.state.value.selectedItems.has(item.id))
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
  // ENHANCED PERSISTENCE ACTIONS
  // =============================================
  
  /**
   * Save cart data to storage using cookies
   */
  async function saveToStorage() {
    try {
      const cartData = {
        items: items.value,
        sessionId: sessionId.value,
        lastSyncAt: lastSyncAt.value,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }

      // Use Nuxt's useCookie directly in Pinia store (auto-imported)
      const cartCookie = useCookie('moldova_direct_cart', {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        watch: true
      })

      cartCookie.value = cartData as any

      return { success: true }
    } catch (error) {
      console.error('Failed to save cart to storage:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Save failed' }
    }
  }
  
  /**
   * Load cart data from storage using cookies
   */
  async function loadFromStorage() {
    try {
      // Use Nuxt's useCookie directly in Pinia store (auto-imported)
      const cartCookie = useCookie<any>('moldova_direct_cart', {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })

      const loadedData = cartCookie.value

      if (loadedData && loadedData.items) {
        // Convert date strings back to Date objects
        const items = loadedData.items.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
          lastModified: item.lastModified ? new Date(item.lastModified) : undefined
        }))

        // Update core state with loaded data
        core.state.value.items = items
        core.state.value.sessionId = loadedData.sessionId
        core.state.value.lastSyncAt = loadedData.lastSyncAt ? new Date(loadedData.lastSyncAt) : null

        // Invalidate calculation cache
        core.invalidateCalculationCache()

        return { success: true, data: loadedData }
      }

      return { success: true, data: null }
    } catch (error) {
      console.error('Failed to load cart from storage:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Load failed' }
    }
  }
  
  /**
   * Clear cart data from storage using cookies
   */
  async function clearStorage() {
    try {
      const cartCookie = useCookie('moldova_direct_cart')
      cartCookie.value = null
      return { success: true }
    } catch (error) {
      console.error('Failed to clear cart storage:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Clear failed' }
    }
  }

  // =============================================
  // INITIALIZATION
  // =============================================
  
  /**
   * Initialize cart with all modules
   */
  function initializeCart() {
    // Initialize core
    core.initializeCart()
    
    // Load from storage
    if (process.client) {
      loadFromStorage().catch(error => {
        console.warn('Failed to load cart from storage:', error)
      })
    }

    // Initialize analytics
    if (process.client && sessionId.value) {
      analytics.initializeCartSession(sessionId.value)
    }
    
    // Start background validation
    if (backgroundValidationEnabled.value && process.client) {
      validation.startBackgroundValidation()
    }
    
    // Initialize advanced features
    if (process.client) {
      // Load recommendations if cart has items
      if (items.value.length > 0) {
        advanced.loadRecommendations(items.value).catch(error => {
          console.warn('Failed to load recommendations:', error)
        })
      }
    }
  }

  // =============================================
  // DEBOUNCED SAVE FUNCTIONALITY
  // =============================================
  
  let debouncedSaveToStorage: (() => Promise<void>) | null = null
  
  /**
   * Create debounced save function
   */
  function createDebouncedSave() {
    let timeoutId: NodeJS.Timeout | null = null
    
    debouncedSaveToStorage = function() {
      return new Promise((resolve, reject) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        
        timeoutId = setTimeout(async () => {
          try {
            await saveToStorage()
            resolve()
          } catch (error) {
            reject(error)
          }
        }, 1000) // 1 second debounce
      })
    }
  }
  
  /**
   * Save and cache cart data (with debouncing)
   */
  async function saveAndCacheCartData() {
    if (!debouncedSaveToStorage) {
      createDebouncedSave()
    }
    
    if (debouncedSaveToStorage) {
      try {
        await debouncedSaveToStorage()
      } catch (error) {
        console.warn('Debounced save failed:', error)
      }
    }
  }

  // =============================================
  // ENHANCED CORE ACTIONS
  // =============================================
  
  /**
   * Add item to cart with all enhancements
   */
  async function addItem(product: Product, quantity: number = 1) {
    try {
      // Use secure add if security is enabled
      if (securityEnabled.value && sessionId.value) {
        try {
          await security.secureAddItem(product.id, quantity, sessionId.value)
        } catch (securityError) {
          console.warn('Secure add failed, falling back to regular add:', securityError)
        }
      }
      
      // Add item via core module
      await core.addItem(product, quantity)
      
      // Track analytics
      if (process.client && sessionId.value) {
        analytics.trackAddToCart(
          product, 
          quantity, 
          subtotal.value, 
          itemCount.value, 
          sessionId.value
        )
      }
      
      // Add to validation queue for background validation
      validation.addToValidationQueue(product.id, 'high')
      
      // Save to storage
      await saveAndCacheCartData()
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Remove item from cart with all enhancements
   */
  async function removeItem(itemId: string) {
    try {
      // Get item for analytics before removal
      const item = core.getItemByProductId(itemId) || 
                   items.value.find(i => i.id === itemId)
      
      // Use secure remove if security is enabled
      if (securityEnabled.value && sessionId.value) {
        try {
          await security.secureRemoveItem(itemId, sessionId.value)
        } catch (securityError) {
          console.warn('Secure remove failed, falling back to regular remove:', securityError)
        }
      }
      
      // Remove item via core module
      await core.removeItem(itemId)
      
      // Track analytics
      if (process.client && sessionId.value && item) {
        analytics.trackRemoveFromCart(
          item.product, 
          item.quantity, 
          subtotal.value, 
          itemCount.value, 
          sessionId.value
        )
      }
      
      // Save to storage
      await saveAndCacheCartData()
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Update item quantity with all enhancements
   */
  async function updateQuantity(itemId: string, quantity: number) {
    try {
      // Get item for analytics before update
      const item = items.value.find(i => i.id === itemId)
      const oldQuantity = item?.quantity || 0
      
      // Use secure update if security is enabled
      if (securityEnabled.value && sessionId.value) {
        try {
          await security.secureUpdateQuantity(itemId, quantity, sessionId.value)
        } catch (securityError) {
          console.warn('Secure update failed, falling back to regular update:', securityError)
        }
      }
      
      // Update quantity via core module
      await core.updateQuantity(itemId, quantity)
      
      // Track analytics
      if (process.client && sessionId.value && item) {
        analytics.trackQuantityUpdate(
          item.product, 
          oldQuantity, 
          quantity, 
          subtotal.value, 
          itemCount.value, 
          sessionId.value
        )
      }
      
      // Save to storage
      await saveAndCacheCartData()
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Clear cart with persistence
   */
  async function clearCart() {
    try {
      await core.clearCart()
      await saveAndCacheCartData()
    } catch (error) {
      throw error
    }
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
  const toggleItemSelection = (itemId: string) => advanced.toggleItemSelection(itemId)
  const toggleSelectAll = () => {
    const allSelected = items.value.length > 0 && 
      items.value.every(item => advanced.state.value.selectedItems.has(item.id))
    
    if (allSelected) {
      advanced.deselectAllItems()
    } else {
      items.value.forEach(item => advanced.selectItem(item.id))
    }
  }
  
  const removeSelectedItems = async () => {
    const selectedItemIds = Array.from(advanced.state.value.selectedItems)
    const removePromises = selectedItemIds.map(itemId => removeItem(itemId))
    await Promise.allSettled(removePromises)
    advanced.deselectAllItems()
  }
  
  const moveSelectedToSavedForLater = async () => {
    const selectedItemIds = Array.from(advanced.state.value.selectedItems)
    const itemsToSave = items.value.filter(item => selectedItemIds.includes(item.id))
    
    for (const item of itemsToSave) {
      await advanced.saveItemForLater(item, 'bulk_move', removeItem)
    }
    
    advanced.deselectAllItems()
  }
  
  const addToSavedForLater = async (product: Product, quantity: number = 1) => {
    const savedItem = {
      id: 'saved_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      product,
      quantity,
      savedAt: new Date()
    }
    advanced.state.value.savedForLater.push(savedItem)
  }
  
  const removeFromSavedForLater = async (itemId: string) => {
    await advanced.removeFromSavedForLater(itemId)
  }
  
  const moveToCartFromSavedForLater = async (itemId: string) => {
    const savedItem = advanced.getSavedForLaterItem(itemId)
    if (savedItem) {
      await addItem(savedItem.product, savedItem.quantity)
      await advanced.removeFromSavedForLater(itemId)
    }
  }
  
  const loadRecommendations = async () => {
    await advanced.loadRecommendations(items.value)
  }

  // =============================================
  // VALIDATION AND UTILITY METHODS
  // =============================================
  
  const validateCart = async () => {
    try {
      const result = await validation.validateAllCartItems(items.value)
      
      // Update cart with validated items
      core.state.value.items = result.validItems
      
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
    } catch (error) {
      console.error('Cart validation failed:', error)
      return false
    }
  }
  
  const validateCartWithRetry = async (maxRetries: number = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const success = await validateCart()
        if (success) return true
      } catch (error) {
        if (i === maxRetries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
    return false
  }
  
  const directAddItem = async (product: Product, quantity: number = 1) => {
    return core.addItem(product, quantity)
  }
  
  const directUpdateQuantity = async (itemId: string, quantity: number) => {
    return core.updateQuantity(itemId, quantity)
  }
  
  const directRemoveItem = async (itemId: string) => {
    return core.removeItem(itemId)
  }
  
  const directClearCart = async () => {
    return core.clearCart()
  }
  
  const directValidateCart = async () => {
    return validateCart()
  }
  
  const recoverCart = async () => {
    try {
      const result = await loadFromStorage()
      return result.success
    } catch (error) {
      console.error('Cart recovery failed:', error)
      return false
    }
  }
  
  const forceSync = () => {
    return saveToStorage()
  }
  
  const toggleBackgroundValidation = () => {
    if (validation.state.value.backgroundValidationEnabled) {
      validation.stopBackgroundValidation()
    } else {
      validation.startBackgroundValidation()
    }
  }
  
  const clearValidationCache = (productId?: string) => {
    validation.clearValidationCache(productId)
  }
  
  // Performance metrics (mock implementation)
  const performanceMetrics = computed(() => ({
    lastOperationTime: 0,
    averageOperationTime: 0,
    operationCount: 0,
    syncCount: 0,
    errorCount: 0
  }))
  
  const getPerformanceMetrics = () => performanceMetrics.value
  const resetPerformanceMetrics = () => {
    // Mock implementation
  }

  // =============================================
  // AUTO-SAVE FUNCTIONALITY
  // =============================================

  // Watch for cart changes and automatically save to cookies
  if (process.client) {
    let saveTimeout: NodeJS.Timeout | null = null

    watch(
      () => items.value,
      () => {
        // Debounce saves to avoid excessive cookie writes
        if (saveTimeout) {
          clearTimeout(saveTimeout)
        }

        saveTimeout = setTimeout(() => {
          saveToStorage().catch(error => {
            console.warn('Failed to auto-save cart:', error)
          })
        }, 500) // 500ms debounce
      },
      { deep: true }
    )
  }

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
    createDebouncedSave,

    // Utilities
    generateItemId,
    generateSessionId,
    
    // Additional state
    validationInProgress,
    backgroundValidationEnabled,
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
      advanced
    }
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
  CartPersistenceState
} from './types'