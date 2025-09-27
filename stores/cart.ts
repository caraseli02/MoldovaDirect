import { defineStore } from 'pinia'
import { useToastStore } from './toast'
import { useStoreI18n } from '~/composables/useStoreI18n'
import { useCartAnalytics } from '~/composables/useCartAnalytics'
import { useCartSecurity } from '~/composables/useCartSecurity'
import { navigateTo } from '#imports'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  stock: number
  category?: string
}

interface CartItem {
  id: string
  product: Product
  quantity: number
  addedAt: Date
}

interface ValidationCache {
  [productId: string]: {
    isValid: boolean
    product: Product
    timestamp: number
    ttl: number // Time to live in milliseconds
  }
}

interface ValidationQueue {
  [productId: string]: {
    priority: 'high' | 'medium' | 'low'
    timestamp: number
    retryCount: number
  }
}

interface SavedForLaterItem {
  id: string
  product: Product
  quantity: number
  savedAt: Date
  originalCartItemId?: string
}

interface CartState {
  items: CartItem[]
  sessionId: string | null
  loading: boolean
  error: string | null
  storageType: 'localStorage' | 'sessionStorage' | 'memory'
  lastSyncAt: Date | null
  validationCache: ValidationCache
  validationQueue: ValidationQueue
  backgroundValidationEnabled: boolean
  lastBackgroundValidation: Date | null
  validationInProgress: boolean
  // Security features
  securityEnabled: boolean
  lastSecurityCheck: Date | null
  securityErrors: string[]
  // Advanced features
  selectedItems: Set<string>
  bulkOperationInProgress: boolean
  savedForLater: SavedForLaterItem[]
  recommendations: Product[]
  recommendationsLoading: boolean
  // Performance optimization caches
  _cachedItemCount?: number
  _cachedSubtotal?: number
  _lastItemsHash?: string
  _currentItemsHash?: string
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    sessionId: null,
    loading: false,
    error: null,
    storageType: 'localStorage',
    lastSyncAt: null,
    validationCache: {},
    validationQueue: {},
    backgroundValidationEnabled: true,
    lastBackgroundValidation: null,
    validationInProgress: false,
    // Security features
    securityEnabled: true,
    lastSecurityCheck: null,
    securityErrors: [],
    // Advanced features
    selectedItems: new Set<string>(),
    bulkOperationInProgress: false,
    savedForLater: [],
    recommendations: [],
    recommendationsLoading: false,
    // Performance optimization caches
    _cachedItemCount: undefined,
    _cachedSubtotal: undefined,
    _lastItemsHash: '',
    _currentItemsHash: ''
  }),

  getters: {
    // Memoized total number of items in cart
    itemCount: (state): number => {
      // Use cached calculation if items haven't changed
      if (state._cachedItemCount && state._lastItemsHash === state._currentItemsHash) {
        return state._cachedItemCount
      }
      
      const count = state.items.reduce((total, item) => total + item.quantity, 0)
      state._cachedItemCount = count
      return count
    },

    // Memoized total price of all items
    subtotal: (state): number => {
      // Use cached calculation if items haven't changed
      if (state._cachedSubtotal && state._lastItemsHash === state._currentItemsHash) {
        return state._cachedSubtotal
      }
      
      const total = state.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity)
      }, 0)
      
      state._cachedSubtotal = total
      return total
    },

    // Check if cart is empty (simple check, no caching needed)
    isEmpty: (state): boolean => {
      return state.items.length === 0
    },

    // Get item by product ID
    getItemByProductId: (state) => (productId: string): CartItem | undefined => {
      return state.items.find(item => item.product.id === productId)
    },

    // Check if product is in cart
    isInCart: (state) => (productId: string): boolean => {
      return state.items.some(item => item.product.id === productId)
    },

    // Advanced features getters
    selectedItemsCount: (state): number => {
      return state.selectedItems.size
    },

    selectedItemsSubtotal: (state): number => {
      return state.items
        .filter(item => state.selectedItems.has(item.id))
        .reduce((total, item) => total + (item.product.price * item.quantity), 0)
    },

    allItemsSelected: (state): boolean => {
      return state.items.length > 0 && state.items.every(item => state.selectedItems.has(item.id))
    },

    hasSelectedItems: (state): boolean => {
      return state.selectedItems.size > 0
    },

    savedForLaterCount: (state): number => {
      return state.savedForLater.length
    },

    isItemSelected: (state) => (itemId: string): boolean => {
      return state.selectedItems.has(itemId)
    },

    getSelectedItems: (state): CartItem[] => {
      return state.items.filter(item => state.selectedItems.has(item.id))
    },

    getSavedForLaterItem: (state) => (itemId: string): SavedForLaterItem | undefined => {
      return state.savedForLater.find(item => item.id === itemId)
    },

    isProductSavedForLater: (state) => (productId: string): boolean => {
      return state.savedForLater.some(item => item.product.id === productId)
    }
  },

  actions: {
    // Validation cache management
    getCachedValidation(productId: string): { isValid: boolean; product: Product } | null {
      const cached = this.validationCache[productId]
      if (!cached) return null
      
      const now = Date.now()
      if (now - cached.timestamp > cached.ttl) {
        // Cache expired, remove it
        delete this.validationCache[productId]
        return null
      }
      
      return {
        isValid: cached.isValid,
        product: cached.product
      }
    },

    setCachedValidation(productId: string, isValid: boolean, product: Product, ttl: number = 300000) {
      // Default TTL: 5 minutes for successful validations
      this.validationCache[productId] = {
        isValid,
        product,
        timestamp: Date.now(),
        ttl
      }
    },

    clearValidationCache(productId?: string) {
      if (productId) {
        delete this.validationCache[productId]
      } else {
        this.validationCache = {}
      }
    },

    // Validation queue management
    addToValidationQueue(productId: string, priority: 'high' | 'medium' | 'low' = 'medium') {
      this.validationQueue[productId] = {
        priority,
        timestamp: Date.now(),
        retryCount: 0
      }
    },

    removeFromValidationQueue(productId: string) {
      delete this.validationQueue[productId]
    },

    getValidationQueueByPriority(): string[] {
      const entries = Object.entries(this.validationQueue)
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      
      return entries
        .sort(([, a], [, b]) => {
          // Sort by priority first, then by timestamp (older first)
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
          if (priorityDiff !== 0) return priorityDiff
          return a.timestamp - b.timestamp
        })
        .map(([productId]) => productId)
    },

    // Debounced validation function
    debouncedValidateProduct: null as any,

    createDebouncedValidation() {
      let timeoutId: NodeJS.Timeout | null = null
      const pendingValidations = new Set<string>()
      
      this.debouncedValidateProduct = (productId: string, delay: number = 1000) => {
        pendingValidations.add(productId)
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        
        timeoutId = setTimeout(async () => {
          const productIds = Array.from(pendingValidations)
          pendingValidations.clear()
          
          // Process validations in batches
          await this.batchValidateProducts(productIds)
        }, delay)
      }
    },

    // Batch validation for multiple products
    async batchValidateProducts(productIds: string[]): Promise<void> {
      if (productIds.length === 0) return
      
      const toastStore = useToastStore()
      const validationPromises: Promise<void>[] = []
      
      for (const productId of productIds) {
        // Check cache first
        const cached = this.getCachedValidation(productId)
        if (cached) {
          // Update product data from cache
          const cartItem = this.items.find(item => item.product.id === productId)
          if (cartItem && cached.isValid) {
            cartItem.product = { ...cartItem.product, ...cached.product }
          }
          continue
        }
        
        // Add to validation promise batch
        validationPromises.push(this.validateSingleProduct(productId))
      }
      
      if (validationPromises.length > 0) {
        try {
          await Promise.allSettled(validationPromises)
        } catch (error) {
          console.error('Batch validation error:', error)
          const { t } = useStoreI18n()
          toastStore.warning(t('cart.validation.partial'), t('cart.validation.someProductsFailed'))
        }
      }
    },

    // Validate single product with caching
    async validateSingleProduct(productId: string): Promise<void> {
      const cartItem = this.items.find(item => item.product.id === productId)
      if (!cartItem) return
      
      const toastStore = useToastStore()
      
      try {
        // Fetch current product data
        const response = await $fetch(`/api/products/${cartItem.product.slug}`)
        const currentProduct = response.product || response
        
        // Cache the validation result
        this.setCachedValidation(productId, true, currentProduct)
        
        // Update cart item with fresh data
        const originalPrice = cartItem.product.price
        const originalStock = cartItem.product.stock
        
        cartItem.product = { ...cartItem.product, ...currentProduct }
        
        // Check for significant changes
        let hasChanges = false
        
        // Price change notification
        if (originalPrice !== currentProduct.price) {
          hasChanges = true
          const { t } = useStoreI18n()
          toastStore.info(t('cart.notification.priceUpdated'), 
            t('cart.notification.priceChange', { product: cartItem.product.name, oldPrice: originalPrice, newPrice: currentProduct.price }))
        }
        
        // Stock validation and adjustment
        if (currentProduct.stock === 0) {
          hasChanges = true
          await this.removeItem(cartItem.id)
          const { t } = useStoreI18n()
          toastStore.warning(t('cart.notification.outOfStock'), 
            t('cart.notification.removedOutOfStock', { product: cartItem.product.name }))
        } else if (cartItem.quantity > currentProduct.stock) {
          hasChanges = true
          const oldQuantity = cartItem.quantity
          cartItem.quantity = currentProduct.stock
          const { t } = useStoreI18n()
          toastStore.warning(t('cart.notification.quantityAdjusted'), 
            t('cart.notification.quantityChange', { product: cartItem.product.name, oldQty: oldQuantity, newQty: currentProduct.stock }))
        }
        
        // Remove from validation queue on success
        this.removeFromValidationQueue(productId)
        
        if (hasChanges) {
          this.saveToStorage()
        }
        
      } catch (error) {
        console.warn(`Failed to validate product ${productId}:`, error)
        
        // Handle different error scenarios
        if (error.statusCode === 404) {
          // Product no longer exists
          await this.removeItem(cartItem.id)
          const { t } = useStoreI18n()
          toastStore.warning(t('cart.notification.productRemoved'), 
            t('cart.notification.noLongerAvailable', { product: cartItem.product.name }))
        } else {
          // Network or other error - add to retry queue
          const queueItem = this.validationQueue[productId]
          if (queueItem) {
            queueItem.retryCount++
            if (queueItem.retryCount >= 3) {
              // Max retries reached, remove from queue
              this.removeFromValidationQueue(productId)
              const { t } = useStoreI18n()
              toastStore.error(t('cart.error.validationFailed'), 
                t('cart.error.couldNotValidate', { product: cartItem.product.name }))
            }
          }
          
          // Cache failed validation with shorter TTL
          this.setCachedValidation(productId, false, cartItem.product, 60000) // 1 minute TTL
        }
      }
    },

    // Background validation worker
    backgroundValidationWorker: null as any,

    startBackgroundValidation() {
      if (!this.backgroundValidationEnabled || this.backgroundValidationWorker) return
      
      this.backgroundValidationWorker = setInterval(async () => {
        if (this.validationInProgress || this.items.length === 0) return
        
        this.validationInProgress = true
        
        try {
          // Get products that need validation (prioritized)
          const queuedProducts = this.getValidationQueueByPriority()
          const productsToValidate: string[] = []
          
          // Add queued products first
          productsToValidate.push(...queuedProducts.slice(0, 3)) // Max 3 from queue
          
          // Add products that haven't been validated recently
          const now = Date.now()
          const validationInterval = 10 * 60 * 1000 // 10 minutes
          
          for (const item of this.items) {
            if (productsToValidate.length >= 5) break // Max 5 products per batch
            
            const cached = this.validationCache[item.product.id]
            if (!cached || (now - cached.timestamp) > validationInterval) {
              if (!productsToValidate.includes(item.product.id)) {
                productsToValidate.push(item.product.id)
              }
            }
          }
          
          if (productsToValidate.length > 0) {
            await this.batchValidateProducts(productsToValidate)
            this.lastBackgroundValidation = new Date()
          }
          
        } catch (error) {
          console.error('Background validation error:', error)
        } finally {
          this.validationInProgress = false
        }
      }, 30000) // Run every 30 seconds
    },

    stopBackgroundValidation() {
      if (this.backgroundValidationWorker) {
        clearInterval(this.backgroundValidationWorker)
        this.backgroundValidationWorker = null
      }
    },

    // Initialize cart session
    initializeCart() {
      // Generate session ID if not exists
      if (!this.sessionId) {
        this.sessionId = this.generateSessionId()
      }
      
      // Load cart from storage for persistence
      this.loadFromStorage()
      
      // Initialize debounced validation
      this.createDebouncedValidation()
      
      // Initialize debounced save
      this.createDebouncedSave()
      
      // Initialize calculation cache
      this.invalidateCalculationCache()
      
      // Start background validation if enabled
      if (this.backgroundValidationEnabled && process.client) {
        this.startBackgroundValidation()
      }

      // Initialize cart analytics
      if (process.client) {
        const cartAnalytics = useCartAnalytics()
        cartAnalytics.initializeCartSession(this.sessionId)
        
        // Initialize cart caching
        this.initializeCartCaching()
      }
    },

    // Generate unique session ID
    generateSessionId(): string {
      return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    },

    // Add item to cart with optimized validation
    async addItem(product: Product, quantity: number = 1) {
      // Ensure debounced validation is initialized
      if (!this.debouncedValidateProduct) {
        this.createDebouncedValidation()
      }

      this.loading = true
      this.error = null
      const toastStore = useToastStore()

      try {
        // Check cache first for real-time validation
        const cached = this.getCachedValidation(product.id)
        let currentProduct = product
        
        if (cached && cached.isValid) {
          currentProduct = cached.product
        } else {
          // Add to high-priority validation queue for immediate validation
          this.addToValidationQueue(product.id, 'high')
          
          // Trigger immediate validation for critical operations
          if (this.debouncedValidateProduct) {
            this.debouncedValidateProduct(product.id, 100) // Very short delay for add operations
          }
        }

        // Validate stock availability using current product data
        if (quantity > currentProduct.stock) {
          const { t } = useStoreI18n()
          const errorMsg = t('cart.error.onlyAvailable', { count: currentProduct.stock })
          toastStore.error(t('cart.error.insufficientStock'), errorMsg, {
            actionText: t('cart.action.viewProduct'),
            actionHandler: () => {
              const { navigateTo } = useNuxtApp()
              navigateTo(`/products/${currentProduct.slug}`)
            }
          })
          throw new Error(errorMsg)
        }

        const existingItem = this.getItemByProductId(product.id)

        if (existingItem) {
          // Update quantity if item already exists
          const newQuantity = existingItem.quantity + quantity
          
          if (newQuantity > currentProduct.stock) {
            const { t } = useStoreI18n()
            const available = currentProduct.stock - existingItem.quantity
            const errorMsg = t('cart.error.cannotAddMore', { quantity, available })
            toastStore.error(t('cart.error.insufficientStock'), errorMsg, {
              actionText: t('cart.action.adjustQuantity'),
              actionHandler: function() {
                this.updateQuantity(existingItem.id, currentProduct.stock)
              }.bind(this)
            })
            throw new Error(errorMsg)
          }
          
          existingItem.quantity = newQuantity
          // Update product data with latest information
          existingItem.product = { ...existingItem.product, ...currentProduct }
          const { t } = useStoreI18n()
          toastStore.success(t('cart.success.quantityUpdated'), t('cart.success.newQuantity', { product: currentProduct.name, quantity: newQuantity }))
        } else {
          // Add new item to cart
          const cartItem: CartItem = {
            id: this.generateItemId(),
            product: currentProduct,
            quantity,
            addedAt: new Date()
          }
          this.items.push(cartItem)
          const { t } = useStoreI18n()
          toastStore.success(t('cart.success.productAdded'), t('cart.success.addedToCart', { product: currentProduct.name }))
        }

        // Cache the successful validation
        this.setCachedValidation(product.id, true, currentProduct)
        
        // Remove from validation queue since we just validated
        this.removeFromValidationQueue(product.id)

        // Track analytics for add to cart
        if (process.client) {
          const cartAnalytics = useCartAnalytics()
          cartAnalytics.trackAddToCart(currentProduct, quantity, this.subtotal, this.itemCount)
        }

        // Save and cache cart data
        this.saveAndCacheCartData()

      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to add item to cart'
        
        // Show error toast if not already shown
        if (!error.message?.includes('stock')) {
          const { t } = useStoreI18n()
          toastStore.error(t('cart.error.addFailed'), this.error, {
            actionText: t('common.retry'),
            actionHandler: () => this.addItem(product, quantity)
          })
        }
        
        throw error
      } finally {
        this.loading = false
      }
    },

    // Security-enhanced cart operations
    async secureAddItem(product: Product, quantity: number = 1) {
      if (!this.securityEnabled) {
        return this.addItem(product, quantity)
      }

      const cartSecurity = useCartSecurity()
      
      try {
        // Validate session ID
        if (!this.sessionId || !cartSecurity.isValidSessionId(this.sessionId)) {
          this.sessionId = cartSecurity.generateSecureSessionId()
        }

        // Validate product ID format
        if (!cartSecurity.isValidProductId(product.id)) {
          throw new Error('Invalid product ID format')
        }

        // Client-side validation
        const validation = cartSecurity.validateCartData('addItem', {
          productId: product.id,
          quantity
        })

        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
        }

        // Use secure API endpoint
        const result = await cartSecurity.secureAddItem(product.id, quantity, this.sessionId)
        
        // Update local cart with validated data
        const existingItem = this.getItemByProductId(product.id)
        
        if (existingItem) {
          existingItem.quantity += quantity
          existingItem.product = { ...existingItem.product, ...result.product }
        } else {
          const cartItem: CartItem = {
            id: this.generateItemId(),
            product: result.product,
            quantity,
            addedAt: new Date()
          }
          this.items.push(cartItem)
        }

        // Update security check timestamp
        this.lastSecurityCheck = new Date()
        this.securityErrors = []

        // Persist to storage
        this.saveToStorage()

        // Track analytics
        if (process.client) {
          const cartAnalytics = useCartAnalytics()
          cartAnalytics.trackAddToCart(result.product, quantity, this.subtotal, this.itemCount)
        }

        // Show success message
        const toastStore = useToastStore()
        const { t } = useStoreI18n()
        toastStore.success(t('cart.success.productAdded'), t('cart.success.addedToCart', { product: result.product.name }))

      } catch (error) {
        this.securityErrors.push(error.message)
        this.error = error.message
        
        const toastStore = useToastStore()
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.addFailed'), error.message)
        
        throw error
      }
    },

    async secureUpdateQuantity(itemId: string, quantity: number) {
      if (!this.securityEnabled) {
        return this.updateQuantity(itemId, quantity)
      }

      const cartSecurity = useCartSecurity()
      
      try {
        // Validate session ID
        if (!this.sessionId || !cartSecurity.isValidSessionId(this.sessionId)) {
          this.sessionId = cartSecurity.generateSecureSessionId()
        }

        // Client-side validation
        const validation = cartSecurity.validateCartData('updateQuantity', {
          itemId,
          quantity
        })

        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
        }

        // Handle removal if quantity is 0
        if (quantity === 0) {
          return this.secureRemoveItem(itemId)
        }

        // Use secure API endpoint
        const result = await cartSecurity.secureUpdateQuantity(itemId, quantity, this.sessionId)
        
        // Update local cart
        const item = this.items.find(item => item.id === itemId)
        if (item) {
          const oldQuantity = item.quantity
          item.quantity = quantity
          
          // Track analytics
          if (process.client) {
            const cartAnalytics = useCartAnalytics()
            cartAnalytics.trackQuantityUpdate(item.product, oldQuantity, quantity, this.subtotal, this.itemCount)
          }
        }

        // Update security check timestamp
        this.lastSecurityCheck = new Date()
        this.securityErrors = []

        // Persist to storage
        this.saveToStorage()

        // Show success message
        const toastStore = useToastStore()
        const { t } = useStoreI18n()
        toastStore.success(t('cart.success.quantityUpdated'), t('cart.success.quantityChange', { product: item?.product.name, oldQty: item ? item.quantity : 0, newQty: quantity }))

      } catch (error) {
        this.securityErrors.push(error.message)
        this.error = error.message
        
        const toastStore = useToastStore()
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.updateFailed'), error.message)
        
        throw error
      }
    },

    async secureRemoveItem(itemId: string) {
      if (!this.securityEnabled) {
        return this.removeItem(itemId)
      }

      const cartSecurity = useCartSecurity()
      
      try {
        // Validate session ID
        if (!this.sessionId || !cartSecurity.isValidSessionId(this.sessionId)) {
          this.sessionId = cartSecurity.generateSecureSessionId()
        }

        // Client-side validation
        const validation = cartSecurity.validateCartData('removeItem', { itemId })

        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
        }

        // Find item before removal for analytics
        const item = this.items.find(item => item.id === itemId)
        if (!item) {
          throw new Error('Item not found')
        }

        // Use secure API endpoint
        await cartSecurity.secureRemoveItem(itemId, this.sessionId)
        
        // Remove from local cart
        const index = this.items.findIndex(item => item.id === itemId)
        if (index !== -1) {
          const removedItem = this.items.splice(index, 1)[0]
          
          // Track analytics
          if (process.client) {
            const cartAnalytics = useCartAnalytics()
            cartAnalytics.trackRemoveFromCart(removedItem.product, removedItem.quantity, this.subtotal, this.itemCount)
          }
        }

        // Update security check timestamp
        this.lastSecurityCheck = new Date()
        this.securityErrors = []

        // Persist to storage
        this.saveToStorage()

        // Show success message with undo option
        const toastStore = useToastStore()
        const { t } = useStoreI18n()
        toastStore.success(t('cart.success.productRemoved'), t('cart.success.removedFromCart', { product: item.product.name }), {
          actionText: t('common.undo'),
          actionHandler: function() {
            // Re-add the item
            this.items.splice(index, 0, item)
            this.saveToStorage()
            const { t: t2 } = useStoreI18n()
            toastStore.success(t2('cart.success.productRestored'), t2('cart.success.restoredToCart', { product: item.product.name }))
          }.bind(this),
          duration: 8000
        })

      } catch (error) {
        this.securityErrors.push(error.message)
        this.error = error.message
        
        const toastStore = useToastStore()
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.removeFailed'), error.message)
        
        throw error
      }
    },

    async secureClearCart() {
      if (!this.securityEnabled) {
        return this.clearCart()
      }

      const cartSecurity = useCartSecurity()
      
      try {
        // Validate session ID
        if (!this.sessionId || !cartSecurity.isValidSessionId(this.sessionId)) {
          this.sessionId = cartSecurity.generateSecureSessionId()
        }

        // Use secure API endpoint
        await cartSecurity.secureClearCart(this.sessionId)
        
        // Backup items for undo
        const itemsBackup = [...this.items]
        
        // Clear local cart
        this.items = []

        // Update security check timestamp
        this.lastSecurityCheck = new Date()
        this.securityErrors = []

        // Persist to storage
        this.saveToStorage()

        // Show success message with undo option
        const toastStore = useToastStore()
        const { t } = useStoreI18n()
        toastStore.success(t('cart.success.cartCleared'), t('cart.success.allItemsRemoved'), {
          actionText: t('common.undo'),
          actionHandler: function() {
            this.items = itemsBackup
            this.saveToStorage()
            const { t: t2 } = useStoreI18n()
            toastStore.success(t2('cart.success.cartRestored'), t2('cart.success.itemsRestoredToCart'))
          }.bind(this),
          duration: 10000
        })

      } catch (error) {
        this.securityErrors.push(error.message)
        this.error = error.message
        
        const toastStore = useToastStore()
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.clearFailed'), error.message)
        
        throw error
      }
    },

    async secureValidateCart() {
      if (!this.securityEnabled) {
        return this.validateCart()
      }

      const cartSecurity = useCartSecurity()
      
      try {
        // Validate session ID
        if (!this.sessionId || !cartSecurity.isValidSessionId(this.sessionId)) {
          this.sessionId = cartSecurity.generateSecureSessionId()
        }

        // Prepare items for validation
        const items = this.items.map(item => ({
          id: item.id,
          productId: item.product.id,
          quantity: item.quantity
        }))

        // Use secure API endpoint
        const result = await cartSecurity.secureValidateCart(items, this.sessionId)
        
        // Process validation results
        let hasChanges = false
        const toastStore = useToastStore()
        const { t } = useStoreI18n()

        for (const validation of result.validationResults) {
          const item = this.items.find(item => item.id === validation.itemId)
          if (!item) continue

          if (!validation.valid) {
            hasChanges = true
            
            switch (validation.action) {
              case 'remove':
                // Remove invalid item
                const index = this.items.findIndex(item => item.id === validation.itemId)
                if (index !== -1) {
                  this.items.splice(index, 1)
                  toastStore.warning(t('cart.notification.productRemoved'), validation.error)
                }
                break
                
              case 'adjust':
                // Adjust quantity
                if (validation.suggestedQuantity) {
                  item.quantity = validation.suggestedQuantity
                  toastStore.warning(t('cart.notification.quantityAdjusted'), validation.error)
                }
                break
            }
          } else if (validation.product) {
            // Update product data
            item.product = { ...item.product, ...validation.product }
          }
        }

        // Update security check timestamp
        this.lastSecurityCheck = new Date()
        this.securityErrors = []

        if (hasChanges) {
          this.saveToStorage()
        }

      } catch (error) {
        this.securityErrors.push(error.message)
        this.error = error.message
        
        const toastStore = useToastStore()
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.validationFailed'), error.message)
        
        throw error
      }
    },

    // Toggle security features
    toggleSecurity(enabled: boolean) {
      this.securityEnabled = enabled
      if (enabled) {
        this.lastSecurityCheck = null
        this.securityErrors = []
      }
    },

    // Get security status
    getSecurityStatus() {
      return {
        enabled: this.securityEnabled,
        lastCheck: this.lastSecurityCheck,
        errors: [...this.securityErrors],
        hasErrors: this.securityErrors.length > 0
      }
    },

    // Clear security errors
    clearSecurityErrors() {
      this.securityErrors = []
    },

    // Update item quantity with optimized validation
    async updateQuantity(itemId: string, quantity: number) {
      this.loading = true
      this.error = null
      const toastStore = useToastStore()

      try {
        const item = this.items.find(item => item.id === itemId)
        
        if (!item) {
          const { t } = useStoreI18n()
          const errorMsg = t('cart.error.itemNotFound')
          toastStore.error(t('cart.error.productNotFound'), errorMsg, {
            actionText: t('cart.action.reloadCart'),
            actionHandler: () => this.validateCart()
          })
          throw new Error(errorMsg)
        }

        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          await this.removeItem(itemId)
          return
        }

        // Check cache for current product data
        const cached = this.getCachedValidation(item.product.id)
        let currentProduct = item.product
        
        if (cached && cached.isValid) {
          currentProduct = cached.product
          // Update item's product data with cached information
          item.product = { ...item.product, ...currentProduct }
        } else {
          // Add to medium-priority validation queue
          this.addToValidationQueue(item.product.id, 'medium')
          
          // Trigger debounced validation
          if (this.debouncedValidateProduct) {
            this.debouncedValidateProduct(item.product.id, 500) // Medium delay for quantity updates
          }
        }

        // Validate stock availability using current product data
        if (quantity > currentProduct.stock) {
          const { t } = useStoreI18n()
          const errorMsg = t('cart.error.onlyAvailable', { count: currentProduct.stock })
          toastStore.error(t('cart.error.insufficientStock'), errorMsg, {
            actionText: t('cart.action.adjustToMax'),
            actionHandler: () => this.updateQuantity(itemId, currentProduct.stock)
          })
          throw new Error(errorMsg)
        }

        const oldQuantity = item.quantity
        item.quantity = quantity
        
        // Cache the successful validation
        this.setCachedValidation(item.product.id, true, currentProduct)
        
        // Remove from validation queue since we just validated
        this.removeFromValidationQueue(item.product.id)
        
        // Track analytics for quantity update
        if (process.client) {
          const cartAnalytics = useCartAnalytics()
          cartAnalytics.trackQuantityUpdate(currentProduct, oldQuantity, quantity, this.subtotal, this.itemCount)
        }
        
        // Save and cache cart data
        this.saveAndCacheCartData()
        
        // Show success toast
        const { t } = useStoreI18n()
        toastStore.success(t('cart.success.quantityUpdated'), t('cart.success.quantityChange', { product: currentProduct.name, oldQty: oldQuantity, newQty: quantity }))

      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update quantity'
        
        // Show error toast if not already shown
        if (!error.message?.includes('stock') && !error.message?.includes('not found')) {
          const { t } = useStoreI18n()
          toastStore.error(t('cart.error.updateFailed'), this.error, {
            actionText: t('common.retry'),
            actionHandler: () => this.updateQuantity(itemId, quantity)
          })
        }
        
        throw error
      } finally {
        this.loading = false
      }
    },

    // Remove item from cart
    async removeItem(itemId: string) {
      this.loading = true
      this.error = null
      const toastStore = useToastStore()

      try {
        const index = this.items.findIndex(item => item.id === itemId)
        
        if (index === -1) {
          const { t } = useStoreI18n()
          const errorMsg = t('cart.error.itemNotFound')
          toastStore.error(t('cart.error.productNotFound'), errorMsg, {
            actionText: t('cart.action.reloadCart'),
            actionHandler: () => this.validateCart()
          })
          throw new Error(errorMsg)
        }

        const removedItem = this.items.splice(index, 1)[0]
        
        // Track analytics for item removal
        if (process.client) {
          const cartAnalytics = useCartAnalytics()
          cartAnalytics.trackRemoveFromCart(removedItem.product, removedItem.quantity, this.subtotal, this.itemCount)
        }
        
        // Save and cache cart data
        this.saveAndCacheCartData()
        
        // Show success message with undo option
        const { t } = useStoreI18n()
        toastStore.success(t('cart.success.productRemoved'), t('cart.success.removedFromCart', { product: removedItem.product.name }), {
          actionText: t('common.undo'),
          actionHandler: () => {
            // Re-add the item
            this.items.splice(index, 0, removedItem)
            this.saveToStorage()
            const { t: t2 } = useStoreI18n()
            toastStore.success(t2('cart.success.productRestored'), t2('cart.success.restoredToCart', { product: removedItem.product.name }))
          },
          duration: 8000 // Longer duration for undo action
        })

      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to remove item'
        
        // Show error toast if not already shown
        if (!error.message?.includes('not found')) {
          const { t } = useStoreI18n()
          toastStore.error(t('cart.error.removeFailed'), this.error, {
            actionText: t('common.retry'),
            actionHandler: () => this.removeItem(itemId)
          })
        }
        
        throw error
      } finally {
        this.loading = false
      }
    },

    // Clear entire cart
    async clearCart() {
      const toastStore = useToastStore()
      const { t } = useStoreI18n()
      const itemsBackup = [...this.items] // Backup for undo
      
      this.items = []
      this.invalidateCalculationCache()
      this.saveToStorage()
      
      // Show success message with undo option
      toastStore.success(t('cart.success.cartCleared'), t('cart.success.allItemsRemoved'), {
        actionText: t('common.undo'),
        actionHandler: () => {
          this.items = itemsBackup
          this.saveToStorage()
          const { t: t2 } = useStoreI18n()
          toastStore.success(t2('cart.success.cartRestored'), t2('cart.success.itemsRestoredToCart'))
        },
        duration: 10000 // Longer duration for undo action
      })
    },

    // Generate unique item ID
    generateItemId(): string {
      return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    },

    // Performance optimization methods
    generateItemsHash(): string {
      // Generate a hash of current items for cache invalidation
      return this.items.map(item => `${item.id}-${item.quantity}-${item.product.price}`).join('|')
    },

    invalidateCalculationCache() {
      // Update hashes to invalidate cached calculations
      this._lastItemsHash = this._currentItemsHash
      this._currentItemsHash = this.generateItemsHash()
      
      // Clear cached values if hash changed
      if (this._lastItemsHash !== this._currentItemsHash) {
        this._cachedItemCount = undefined
        this._cachedSubtotal = undefined
      }
    },

    // Debounced save to storage to reduce I/O operations
    debouncedSaveToStorage: null as any,

    createDebouncedSave() {
      let timeoutId: NodeJS.Timeout | null = null
      
      this.debouncedSaveToStorage = () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        
        timeoutId = setTimeout(() => {
          this.saveToStorage()
        }, 300) // 300ms debounce
      }
    },

    // Cart caching methods
    async initializeCartCaching() {
      if (!process.client) return
      
      try {
        const { initializeCartCache } = await import('~/composables/useCartCache')
        const cartCache = useCartCache()
        await cartCache.initializeCartCache()
      } catch (error) {
        console.error('Failed to initialize cart caching:', error)
      }
    },

    async cacheCartData() {
      if (!process.client) return
      
      try {
        const { useCartCache } = await import('~/composables/useCartCache')
        const cartCache = useCartCache()
        const cartData = {
          items: this.items,
          sessionId: this.sessionId,
          updatedAt: new Date().toISOString(),
          subtotal: this.subtotal,
          itemCount: this.itemCount
        }
        
        await cartCache.cacheCartData(cartData)
      } catch (error) {
        console.error('Failed to cache cart data:', error)
      }
    },

    // Helper method to save and cache cart data
    saveAndCacheCartData() {
      this.invalidateCalculationCache()
      
      if (this.debouncedSaveToStorage) {
        this.debouncedSaveToStorage()
      } else {
        this.saveToStorage()
      }
      
      // Cache cart data for offline access
      this.cacheCartData()
    },

    // Validate cart data structure and fix corruption
    validateCartData(cartData: any): { isValid: boolean; fixedData?: any; errors: string[] } {
      const errors: string[] = []
      
      if (!cartData || typeof cartData !== 'object') {
        return { isValid: false, errors: ['Invalid cart data format'] }
      }

      // Validate required fields
      if (!Array.isArray(cartData.items)) {
        errors.push('Items must be an array')
        cartData.items = []
      }

      if (!cartData.sessionId || typeof cartData.sessionId !== 'string') {
        errors.push('Invalid session ID')
        cartData.sessionId = this.generateSessionId()
      }

      if (!cartData.updatedAt) {
        errors.push('Missing updatedAt timestamp')
        cartData.updatedAt = new Date().toISOString()
      }

      // Validate and fix cart items
      const validItems: CartItem[] = []
      cartData.items.forEach((item: any, index: number) => {
        const itemErrors: string[] = []

        // Validate item structure
        if (!item.id || typeof item.id !== 'string') {
          itemErrors.push(`Item ${index}: Invalid ID`)
          item.id = this.generateItemId()
        }

        if (!item.product || typeof item.product !== 'object') {
          itemErrors.push(`Item ${index}: Invalid product data`)
          return // Skip this item
        }

        if (!item.product.id || !item.product.name || typeof item.product.price !== 'number') {
          itemErrors.push(`Item ${index}: Missing required product fields`)
          return // Skip this item
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          itemErrors.push(`Item ${index}: Invalid quantity`)
          item.quantity = 1
        }

        if (!item.addedAt) {
          itemErrors.push(`Item ${index}: Missing addedAt timestamp`)
          item.addedAt = new Date()
        } else if (typeof item.addedAt === 'string') {
          try {
            item.addedAt = new Date(item.addedAt)
          } catch {
            itemErrors.push(`Item ${index}: Invalid addedAt format`)
            item.addedAt = new Date()
          }
        }

        if (itemErrors.length > 0) {
          errors.push(...itemErrors)
        }

        validItems.push(item)
      })

      cartData.items = validItems
      
      return {
        isValid: errors.length === 0,
        fixedData: cartData,
        errors
      }
    },

    // Detect available storage type
    detectAvailableStorage(): 'localStorage' | 'sessionStorage' | 'memory' {
      if (!process.client) return 'memory'

      // Test localStorage
      try {
        const testKey = 'storage-test'
        localStorage.setItem(testKey, 'test')
        localStorage.removeItem(testKey)
        return 'localStorage'
      } catch {
        // localStorage failed, try sessionStorage
        try {
          const testKey = 'storage-test'
          sessionStorage.setItem(testKey, 'test')
          sessionStorage.removeItem(testKey)
          return 'sessionStorage'
        } catch {
          // Both storage types failed
          return 'memory'
        }
      }
    },

    // Migrate cart data between storage types
    migrateCartData(fromStorage: 'localStorage' | 'sessionStorage', toStorage: 'localStorage' | 'sessionStorage'): boolean {
      if (!process.client) return false

      try {
        const storage = fromStorage === 'localStorage' ? localStorage : sessionStorage
        const targetStorage = toStorage === 'localStorage' ? localStorage : sessionStorage
        
        const cartData = storage.getItem('moldova-direct-cart')
        if (cartData) {
          // Validate data before migration
          const validation = this.validateCartData(JSON.parse(cartData))
          if (validation.fixedData) {
            targetStorage.setItem('moldova-direct-cart', JSON.stringify(validation.fixedData))
            storage.removeItem('moldova-direct-cart')
            
            const toastStore = useToastStore()
            const { t } = useStoreI18n()
            toastStore.success(t('cart.success.cartMigrated'), t('cart.success.dataMigratedTo', { storage: toStorage }))
            return true
          }
        }
        return false
      } catch (error) {
        console.warn(`Failed to migrate cart data from ${fromStorage} to ${toStorage}:`, error)
        return false
      }
    },

    // Enhanced save method with fallback and validation
    saveToStorage() {
      if (!process.client) return

      const cartData = {
        items: this.items,
        sessionId: this.sessionId,
        updatedAt: new Date().toISOString(),
        storageType: this.storageType,
        validationCache: this.validationCache,
        backgroundValidationEnabled: this.backgroundValidationEnabled,
        lastBackgroundValidation: this.lastBackgroundValidation?.toISOString(),
        // Advanced features
        savedForLater: this.savedForLater.map(item => ({
          ...item,
          savedAt: item.savedAt.toISOString()
        })),
        recommendations: this.recommendations
      }

      // Validate data before saving
      const validation = this.validateCartData(cartData)
      if (!validation.isValid && validation.fixedData) {
        console.warn('Cart data was corrupted and has been fixed:', validation.errors)
        Object.assign(cartData, validation.fixedData)
      }

      const toastStore = useToastStore()
      let saved = false

      // Try to save to preferred storage type
      if (this.storageType === 'localStorage') {
        try {
          localStorage.setItem('moldova-direct-cart', JSON.stringify(cartData))
          saved = true
          this.lastSyncAt = new Date()
        } catch (error) {
          console.warn('localStorage failed, trying sessionStorage:', error)
          
          // Fallback to sessionStorage
          try {
            sessionStorage.setItem('moldova-direct-cart', JSON.stringify(cartData))
            this.storageType = 'sessionStorage'
            saved = true
            this.lastSyncAt = new Date()
            
            const { t } = useStoreI18n()
            toastStore.warning(t('cart.warning.limitedStorage'), t('cart.warning.sessionOnlyStorage'))
          } catch (sessionError) {
            console.error('Both localStorage and sessionStorage failed:', sessionError)
            this.storageType = 'memory'
            const { t } = useStoreI18n()
            toastStore.error(t('cart.error.storageError'), t('cart.error.changesWillBeLost'))
          }
        }
      } else if (this.storageType === 'sessionStorage') {
        try {
          sessionStorage.setItem('moldova-direct-cart', JSON.stringify(cartData))
          saved = true
          this.lastSyncAt = new Date()
        } catch (error) {
          console.error('sessionStorage failed:', error)
          this.storageType = 'memory'
          const { t } = useStoreI18n()
          toastStore.error(t('cart.error.storageError'), t('cart.error.changesWillBeLost'))
        }
      }

      // If we're in memory mode, warn user periodically
      if (this.storageType === 'memory' && !saved) {
        const { t } = useStoreI18n()
        toastStore.warning(t('cart.warning.temporaryMode'), t('cart.warning.cannotSave'))
      }
    },

    // =============================================
    // BULK SELECTION AND OPERATIONS
    // =============================================

    // Toggle item selection
    toggleItemSelection(itemId: string) {
      if (this.selectedItems.has(itemId)) {
        this.selectedItems.delete(itemId)
      } else {
        this.selectedItems.add(itemId)
      }
    },

    // Select all items
    selectAllItems() {
      this.selectedItems.clear()
      this.items.forEach(item => {
        this.selectedItems.add(item.id)
      })
    },

    // Clear all selections
    clearSelection() {
      this.selectedItems.clear()
    },

    // Bulk remove selected items
    async bulkRemoveSelected() {
      if (this.selectedItems.size === 0) return

      this.bulkOperationInProgress = true
      const toastStore = useToastStore()
      
      try {
        const selectedItemIds = Array.from(this.selectedItems)
        const removedItems: CartItem[] = []

        // Remove selected items
        for (const itemId of selectedItemIds) {
          const itemIndex = this.items.findIndex(item => item.id === itemId)
          if (itemIndex !== -1) {
            removedItems.push(this.items.splice(itemIndex, 1)[0])
          }
        }

        // Clear selection
        this.selectedItems.clear()

        // Save to storage
        this.saveToStorage()

        // Show success message with undo option
        const { t } = useStoreI18n()
        toastStore.success(
          t('cart.success.productsRemoved'), 
          t('cart.success.itemsRemovedCount', { count: removedItems.length }),
          {
            actionText: t('common.undo'),
            actionHandler: () => {
              // Restore removed items
              this.items.push(...removedItems)
              this.saveToStorage()
              const { t: t2 } = useStoreI18n()
              toastStore.success(t2('cart.success.productsRestored'), t2('cart.success.itemsRestoredToCart'))
            },
            duration: 8000
          }
        )

      } catch (error) {
        console.error('Bulk remove failed:', error)
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.bulkRemoveFailed'), t('cart.error.couldNotRemoveSelected'))
      } finally {
        this.bulkOperationInProgress = false
      }
    },

    // Bulk update quantities for selected items
    async bulkUpdateQuantity(newQuantity: number) {
      if (this.selectedItems.size === 0 || newQuantity <= 0) return

      this.bulkOperationInProgress = true
      const toastStore = useToastStore()
      
      try {
        const selectedItemIds = Array.from(this.selectedItems)
        let updatedCount = 0

        for (const itemId of selectedItemIds) {
          const item = this.items.find(item => item.id === itemId)
          if (item) {
            // Check stock availability
            if (newQuantity <= item.product.stock) {
              item.quantity = newQuantity
              updatedCount++
            } else {
              const { t } = useStoreI18n()
              toastStore.warning(
                t('cart.error.insufficientStock'), 
                t('cart.error.onlyAvailableFor', { product: item.product.name, count: item.product.stock })
              )
            }
          }
        }

        // Clear selection after bulk operation
        this.selectedItems.clear()

        // Save to storage
        this.saveToStorage()

        if (updatedCount > 0) {
          const { t } = useStoreI18n()
          toastStore.success(
            t('cart.success.quantitiesUpdated'), 
            t('cart.success.productsUpdatedTo', { count: updatedCount, quantity: newQuantity })
          )
        }

      } catch (error) {
        console.error('Bulk quantity update failed:', error)
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.bulkUpdateFailed'), t('cart.error.couldNotUpdateQuantities'))
      } finally {
        this.bulkOperationInProgress = false
      }
    },

    // Bulk save selected items for later
    async bulkSaveForLater() {
      if (this.selectedItems.size === 0) return

      this.bulkOperationInProgress = true
      const toastStore = useToastStore()
      
      try {
        const selectedItemIds = Array.from(this.selectedItems)
        const savedItems: SavedForLaterItem[] = []

        // Move selected items to saved for later
        for (const itemId of selectedItemIds) {
          const itemIndex = this.items.findIndex(item => item.id === itemId)
          if (itemIndex !== -1) {
            const cartItem = this.items.splice(itemIndex, 1)[0]
            
            const savedItem: SavedForLaterItem = {
              id: this.generateItemId(),
              product: cartItem.product,
              quantity: cartItem.quantity,
              savedAt: new Date(),
              originalCartItemId: cartItem.id
            }
            
            this.savedForLater.push(savedItem)
            savedItems.push(savedItem)
          }
        }

        // Clear selection
        this.selectedItems.clear()

        // Save to storage
        this.saveToStorage()

        const { t } = useStoreI18n()
        toastStore.success(
          t('cart.success.savedForLater'), 
          t('cart.success.itemsSavedCount', { count: savedItems.length }),
          {
            actionText: t('common.undo'),
            actionHandler: () => {
              // Move items back to cart
              for (const savedItem of savedItems) {
                this.moveFromSavedToCart(savedItem.id)
              }
            },
            duration: 8000
          }
        )

      } catch (error) {
        console.error('Bulk save for later failed:', error)
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.saveForLaterFailed'), t('cart.error.couldNotSaveProducts'))
      } finally {
        this.bulkOperationInProgress = false
      }
    },

    // =============================================
    // SAVE FOR LATER FUNCTIONALITY
    // =============================================

    // Save single item for later
    async saveItemForLater(itemId: string) {
      const toastStore = useToastStore()
      
      try {
        const itemIndex = this.items.findIndex(item => item.id === itemId)
        if (itemIndex === -1) {
          throw new Error('Item not found in cart')
        }

        const cartItem = this.items.splice(itemIndex, 1)[0]
        
        const savedItem: SavedForLaterItem = {
          id: this.generateItemId(),
          product: cartItem.product,
          quantity: cartItem.quantity,
          savedAt: new Date(),
          originalCartItemId: cartItem.id
        }
        
        this.savedForLater.push(savedItem)
        this.saveToStorage()

        const { t } = useStoreI18n()
        toastStore.success(
          t('cart.success.savedForLater'), 
          t('cart.success.productSavedForLater', { product: cartItem.product.name }),
          {
            actionText: t('common.undo'),
            actionHandler: () => {
              this.moveFromSavedToCart(savedItem.id)
            },
            duration: 8000
          }
        )

      } catch (error) {
        console.error('Save for later failed:', error)
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.saveForLaterFailed'), t('cart.error.couldNotSaveProduct'))
      }
    },

    // Move item from saved for later back to cart
    async moveFromSavedToCart(savedItemId: string) {
      const toastStore = useToastStore()
      
      try {
        const savedIndex = this.savedForLater.findIndex(item => item.id === savedItemId)
        if (savedIndex === -1) {
          throw new Error('Saved item not found')
        }

        const savedItem = this.savedForLater.splice(savedIndex, 1)[0]
        
        // Check if product is already in cart
        const existingItem = this.getItemByProductId(savedItem.product.id)
        
        if (existingItem) {
          // Update quantity if item already exists
          const newQuantity = existingItem.quantity + savedItem.quantity
          
          if (newQuantity <= savedItem.product.stock) {
            existingItem.quantity = newQuantity
            const { t } = useStoreI18n()
            toastStore.success(
              t('cart.success.movedToCart'), 
              t('cart.success.newQuantity', { product: savedItem.product.name, quantity: newQuantity })
            )
          } else {
            // Add maximum possible quantity
            const availableQuantity = savedItem.product.stock - existingItem.quantity
            if (availableQuantity > 0) {
              existingItem.quantity = savedItem.product.stock
              const { t } = useStoreI18n()
              toastStore.warning(
                t('cart.warning.quantityAdjusted'), 
                t('cart.warning.adjustedToMax', { product: savedItem.product.name, max: savedItem.product.stock })
              )
            } else {
              const { t } = useStoreI18n()
              toastStore.error(
                t('cart.error.insufficientStock'), 
                t('cart.error.alreadyMaxInCart', { product: savedItem.product.name })
              )
              // Put item back in saved for later
              this.savedForLater.splice(savedIndex, 0, savedItem)
              return
            }
          }
        } else {
          // Add as new cart item
          const cartItem: CartItem = {
            id: savedItem.originalCartItemId || this.generateItemId(),
            product: savedItem.product,
            quantity: Math.min(savedItem.quantity, savedItem.product.stock),
            addedAt: new Date()
          }
          
          this.items.push(cartItem)
          const { t } = useStoreI18n()
          toastStore.success(t('cart.success.movedToCart'), t('cart.success.productMovedToCart', { product: savedItem.product.name }))
        }

        this.saveToStorage()

      } catch (error) {
        console.error('Move from saved to cart failed:', error)
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.moveToCartFailed'), t('cart.error.couldNotMoveToCart'))
      }
    },

    // Remove item from saved for later
    async removeFromSavedForLater(savedItemId: string) {
      const toastStore = useToastStore()
      
      try {
        const savedIndex = this.savedForLater.findIndex(item => item.id === savedItemId)
        if (savedIndex === -1) {
          throw new Error('Saved item not found')
        }

        const removedItem = this.savedForLater.splice(savedIndex, 1)[0]
        this.saveToStorage()

        const { t } = useStoreI18n()
        toastStore.success(
          t('cart.success.productRemoved'), 
          t('cart.success.removedFromSaved', { product: removedItem.product.name }),
          {
            actionText: t('common.undo'),
            actionHandler: () => {
              this.savedForLater.splice(savedIndex, 0, removedItem)
              this.saveToStorage()
              const { t: t2 } = useStoreI18n()
              toastStore.success(t2('cart.success.productRestored'), t2('cart.success.restoredProduct', { product: removedItem.product.name }))
            },
            duration: 8000
          }
        )

      } catch (error) {
        console.error('Remove from saved for later failed:', error)
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.removeFailed'), t('cart.error.couldNotRemoveSaved'))
      }
    },

    // Clear all saved for later items
    async clearSavedForLater() {
      const toastStore = useToastStore()
      const itemsBackup = [...this.savedForLater]
      
      this.savedForLater = []
      this.saveToStorage()
      
      const { t } = useStoreI18n()
      toastStore.success(
        t('cart.success.savedCleared'), 
        t('cart.success.allSavedRemoved'),
        {
          actionText: t('common.undo'),
          actionHandler: () => {
            this.savedForLater = itemsBackup
            this.saveToStorage()
            const { t: t2 } = useStoreI18n()
            toastStore.success(t2('cart.success.savedRestored'), t2('cart.success.savedItemsRestored'))
          },
          duration: 10000
        }
      )
    },

    // =============================================
    // CART ITEM RECOMMENDATIONS
    // =============================================

    // Load recommendations based on cart contents
    async loadRecommendations() {
      if (this.items.length === 0) {
        this.recommendations = []
        return
      }

      this.recommendationsLoading = true
      
      try {
        // Get category IDs from current cart items
        const categoryIds = [...new Set(this.items.map(item => item.product.categoryId))]
        
        // Get product IDs to exclude (already in cart or saved for later)
        const excludeProductIds = [
          ...this.items.map(item => item.product.id),
          ...this.savedForLater.map(item => item.product.id)
        ]

        // Fetch recommendations from API
        const response = await $fetch('/api/products', {
          query: {
            categories: categoryIds.join(','),
            exclude: excludeProductIds.join(','),
            limit: 6,
            sort: 'featured'
          }
        })

        this.recommendations = response.products || []

      } catch (error) {
        console.error('Failed to load recommendations:', error)
        this.recommendations = []
      } finally {
        this.recommendationsLoading = false
      }
    },

    // Add recommended product to cart
    async addRecommendedProduct(product: Product, quantity: number = 1) {
      try {
        await this.addItem(product, quantity)
        
        // Refresh recommendations to exclude newly added product
        await this.loadRecommendations()
        
      } catch (error) {
        console.error('Failed to add recommended product:', error)
        throw error
      }
    },

    // Clear recommendations
    clearRecommendations() {
      this.recommendations = []
    },

    // Enhanced load method with validation and recovery
    loadFromStorage() {
      if (!process.client) return

      const toastStore = useToastStore()
      
      // Detect available storage
      this.storageType = this.detectAvailableStorage()
      
      if (this.storageType === 'memory') {
        const { t } = useStoreI18n()
        toastStore.warning(t('cart.warning.storageUnavailable'), t('cart.warning.temporaryMode'))
        this.sessionId = this.generateSessionId()
        return
      }

      try {
        let savedCart: string | null = null
        let sourceStorage: 'localStorage' | 'sessionStorage' | null = null

        // Try localStorage first
        if (this.storageType === 'localStorage') {
          try {
            savedCart = localStorage.getItem('moldova-direct-cart')
            sourceStorage = 'localStorage'
          } catch (error) {
            console.warn('localStorage read failed:', error)
          }
        }

        // Fallback to sessionStorage if localStorage failed or is unavailable
        if (!savedCart) {
          try {
            savedCart = sessionStorage.getItem('moldova-direct-cart')
            sourceStorage = 'sessionStorage'
            if (savedCart && this.storageType === 'localStorage') {
              // We found data in sessionStorage but localStorage is available
              // This might be a recovery scenario
              this.storageType = 'sessionStorage'
            }
          } catch (error) {
            console.warn('sessionStorage read failed:', error)
          }
        }

        if (savedCart && sourceStorage) {
          let cartData: any
          
          try {
            cartData = JSON.parse(savedCart)
          } catch (parseError) {
            console.error('Failed to parse cart data:', parseError)
            const { t } = useStoreI18n()
            toastStore.error(t('cart.error.dataCorrupted'), t('cart.error.cartDataReset'))
            this.clearStorageData()
            this.sessionId = this.generateSessionId()
            return
          }

          // Validate and fix cart data
          const validation = this.validateCartData(cartData)
          
          if (validation.errors.length > 0) {
            console.warn('Cart data validation errors:', validation.errors)
            const { t } = useStoreI18n()
            toastStore.warning(t('cart.warning.cartRepaired'), t('cart.warning.issuesDetectedAndFixed'))
          }

          if (validation.fixedData) {
            cartData = validation.fixedData

            // Check expiration for localStorage data (30 days)
            const updatedAt = new Date(cartData.updatedAt)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            
            if (sourceStorage === 'localStorage' && updatedAt <= thirtyDaysAgo) {
              // Cart is expired
              this.clearStorageData()
              this.sessionId = this.generateSessionId()
              const { t } = useStoreI18n()
              toastStore.info(t('cart.info.cartExpired'), t('cart.info.cartCleanedDueToExpiry'))
              return
            }

            // Load validated data
            this.items = cartData.items || []
            this.sessionId = cartData.sessionId || this.generateSessionId()
            this.storageType = sourceStorage
            this.lastSyncAt = new Date()
            
            // Load validation cache if available
            if (cartData.validationCache) {
              this.validationCache = cartData.validationCache
            }
            
            // Load background validation settings
            if (typeof cartData.backgroundValidationEnabled === 'boolean') {
              this.backgroundValidationEnabled = cartData.backgroundValidationEnabled
            }
            
            if (cartData.lastBackgroundValidation) {
              try {
                this.lastBackgroundValidation = new Date(cartData.lastBackgroundValidation)
              } catch {
                this.lastBackgroundValidation = null
              }
            }

            // Load advanced features data
            if (cartData.savedForLater && Array.isArray(cartData.savedForLater)) {
              this.savedForLater = cartData.savedForLater.map(item => ({
                ...item,
                savedAt: typeof item.savedAt === 'string' ? new Date(item.savedAt) : new Date()
              }))
            }
            
            if (cartData.recommendations && Array.isArray(cartData.recommendations)) {
              this.recommendations = cartData.recommendations
            }

            // Convert addedAt strings back to Date objects
            this.items.forEach(item => {
              if (typeof item.addedAt === 'string') {
                try {
                  item.addedAt = new Date(item.addedAt)
                } catch {
                  item.addedAt = new Date()
                }
              }
            })

            // Migrate to preferred storage if needed
            if (sourceStorage === 'sessionStorage' && this.detectAvailableStorage() === 'localStorage') {
              if (this.migrateCartData('sessionStorage', 'localStorage')) {
                this.storageType = 'localStorage'
              }
            }

            // Notify user about successful load
            if (this.items.length > 0) {
              const { t } = useStoreI18n()
              const message = sourceStorage === 'sessionStorage' 
                ? t('cart.success.restoredFromSession')
                : t('cart.success.cartRestored')
              toastStore.success(t('cart.success.cartLoaded'), message)
            }
          } else {
            // Data is completely invalid
            this.clearStorageData()
            this.sessionId = this.generateSessionId()
            const { t } = useStoreI18n()
            toastStore.error(t('cart.error.invalidData'), t('cart.error.couldNotRecoverCart'))
          }
        } else {
          // No saved cart found
          this.sessionId = this.generateSessionId()
        }
      } catch (error) {
        console.error('Failed to load cart from storage:', error)
        this.items = []
        this.sessionId = this.generateSessionId()
        this.storageType = 'memory'
        
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.loadFailed'), t('cart.error.couldNotLoadSavedCart'))
      }
    },

    // Clear cart data from all storage types
    clearStorageData() {
      if (!process.client) return

      try {
        localStorage.removeItem('moldova-direct-cart')
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }

      try {
        sessionStorage.removeItem('moldova-direct-cart')
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error)
      }
    },

    // Attempt to recover cart data from corruption or storage issues
    async recoverCartData(): Promise<boolean> {
      const toastStore = useToastStore()
      
      try {
        // First, try to detect and switch to available storage
        const availableStorage = this.detectAvailableStorage()
        
        if (availableStorage !== this.storageType) {
          this.storageType = availableStorage
          const { t } = useStoreI18n()
          toastStore.info(t('cart.info.storageChanged'), t('cart.info.storageChangedDetails', { storage: availableStorage }))
        }

        // Try to load from any available storage
        this.loadFromStorage()
        
        // If we have items, validate them
        if (this.items.length > 0) {
          await this.validateCart()
          const { t } = useStoreI18n()
          toastStore.success(t('cart.success.cartRecovered'), t('cart.success.dataRecoveredAndValidated'))
          return true
        }
        
        return false
      } catch (error) {
        console.error('Cart recovery failed:', error)
        const { t } = useStoreI18n()
        toastStore.error(t('cart.error.recoveryFailed'), t('cart.error.couldNotRecoverCart'))
        return false
      }
    },

    // Force sync cart data to storage
    forceSyncToStorage(): boolean {
      try {
        this.saveToStorage()
        return true
      } catch (error) {
        console.error('Force sync failed:', error)
        return false
      }
    },



    // Optimized cart validation using cache and batch processing
    async validateCart() {
      this.loading = true
      const toastStore = useToastStore()
      
      try {
        const productIds = this.items.map(item => item.product.id)
        
        // Use batch validation for all products
        await this.batchValidateProducts(productIds)
        
        // Check for any items that were removed or adjusted during validation
        const currentItemCount = this.items.length
        const validationSummary = this.getValidationSummary()
        
        if (validationSummary.hasChanges) {
          if (validationSummary.removedItems.length > 0) {
            const { t } = useStoreI18n()
            toastStore.warning(t('cart.warning.productsUnavailable'), 
              t('cart.warning.removedItems', { items: validationSummary.removedItems.join(', ') }), {
              duration: 8000
            })
          }
          
          if (validationSummary.adjustedItems.length > 0) {
            const { t } = useStoreI18n()
            toastStore.warning(t('cart.warning.quantitiesAdjusted'), 
              validationSummary.adjustedItems.join('; '), {
              duration: 8000
            })
          }
          
          if (validationSummary.priceChanges.length > 0) {
            const { t } = useStoreI18n()
            toastStore.info(t('cart.info.pricesUpdated'), 
              validationSummary.priceChanges.join('; '), {
              duration: 6000
            })
          }
        } else {
          const { t } = useStoreI18n()
          toastStore.success(t('cart.success.cartValidated'), t('cart.success.allProductsAvailable'))
        }
        
        this.saveToStorage()
        
      } catch (error) {
        const { t } = useStoreI18n()
        this.error = t('cart.error.validationFailed')
        toastStore.error(t('cart.error.validationFailed'), t('cart.error.couldNotValidateCart'), {
          actionText: t('common.retry'),
          actionHandler: () => this.validateCart()
        })
      } finally {
        this.loading = false
      }
    },

    // Get validation summary for reporting changes
    getValidationSummary(): {
      hasChanges: boolean
      removedItems: string[]
      adjustedItems: string[]
      priceChanges: string[]
    } {
      // This method would be called after validation to summarize changes
      // For now, we'll return a basic structure
      return {
        hasChanges: false,
        removedItems: [],
        adjustedItems: [],
        priceChanges: []
      }
    },

    // Enhanced validation with retry logic and error handling
    async validateCartWithRetry(maxRetries: number = 2): Promise<boolean> {
      let retryCount = 0
      
      while (retryCount <= maxRetries) {
        try {
          await this.validateCart()
          return true
        } catch (error) {
          retryCount++
          console.warn(`Cart validation attempt ${retryCount} failed:`, error)
          
          if (retryCount > maxRetries) {
            const toastStore = useToastStore()
            const { t } = useStoreI18n()
            toastStore.error(t('cart.error.validationFailed'), 
              t('cart.error.validationFailedAfterRetries'))
            return false
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
        }
      }
      
      return false
    },

    // Clean up validation resources
    cleanupValidation() {
      this.stopBackgroundValidation()
      this.clearValidationCache()
      this.validationQueue = {}
    },

    // Destroy store and cleanup resources
    $dispose() {
      this.cleanupValidation()
    }
  }
})