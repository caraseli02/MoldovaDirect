import { defineStore } from 'pinia'
import { useToastStore } from './toast'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  stock: number
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
  // Advanced features
  selectedItems: Set<string>
  bulkOperationInProgress: boolean
  savedForLater: SavedForLaterItem[]
  recommendations: Product[]
  recommendationsLoading: boolean
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
    // Advanced features
    selectedItems: new Set<string>(),
    bulkOperationInProgress: false,
    savedForLater: [],
    recommendations: [],
    recommendationsLoading: false
  }),

  getters: {
    // Total number of items in cart
    itemCount: (state): number => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },

    // Total price of all items
    subtotal: (state): number => {
      return state.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity)
      }, 0)
    },

    // Check if cart is empty
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
          toastStore.warning('Validación parcial', 'Algunos productos no se pudieron validar')
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
          toastStore.info('Precio actualizado', 
            `${cartItem.product.name}: €${originalPrice} → €${currentProduct.price}`)
        }
        
        // Stock validation and adjustment
        if (currentProduct.stock === 0) {
          hasChanges = true
          await this.removeItem(cartItem.id)
          toastStore.warning('Producto agotado', 
            `${cartItem.product.name} ha sido eliminado del carrito`)
        } else if (cartItem.quantity > currentProduct.stock) {
          hasChanges = true
          const oldQuantity = cartItem.quantity
          cartItem.quantity = currentProduct.stock
          toastStore.warning('Cantidad ajustada', 
            `${cartItem.product.name}: ${oldQuantity} → ${currentProduct.stock}`)
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
          toastStore.warning('Producto eliminado', 
            `${cartItem.product.name} ya no está disponible`)
        } else {
          // Network or other error - add to retry queue
          const queueItem = this.validationQueue[productId]
          if (queueItem) {
            queueItem.retryCount++
            if (queueItem.retryCount >= 3) {
              // Max retries reached, remove from queue
              this.removeFromValidationQueue(productId)
              toastStore.error('Error de validación', 
                `No se pudo validar ${cartItem.product.name}`)
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
      
      // Start background validation if enabled
      if (this.backgroundValidationEnabled && process.client) {
        this.startBackgroundValidation()
      }
    },

    // Generate unique session ID
    generateSessionId(): string {
      return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    },

    // Add item to cart with optimized validation
    async addItem(product: Product, quantity: number = 1) {
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
          const errorMsg = `Only ${currentProduct.stock} items available in stock`
          toastStore.error('Stock insuficiente', errorMsg, {
            actionText: 'Ver producto',
            actionHandler: () => {
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
            const available = currentProduct.stock - existingItem.quantity
            const errorMsg = `Cannot add ${quantity} more items. Only ${available} available`
            toastStore.error('Stock insuficiente', errorMsg, {
              actionText: 'Ajustar cantidad',
              actionHandler: () => {
                this.updateQuantity(existingItem.id, currentProduct.stock)
              }
            })
            throw new Error(errorMsg)
          }
          
          existingItem.quantity = newQuantity
          // Update product data with latest information
          existingItem.product = { ...existingItem.product, ...currentProduct }
          toastStore.success('Cantidad actualizada', `${currentProduct.name} - Nueva cantidad: ${newQuantity}`)
        } else {
          // Add new item to cart
          const cartItem: CartItem = {
            id: this.generateItemId(),
            product: currentProduct,
            quantity,
            addedAt: new Date()
          }
          this.items.push(cartItem)
          toastStore.success('Producto añadido', `${currentProduct.name} añadido al carrito`)
        }

        // Cache the successful validation
        this.setCachedValidation(product.id, true, currentProduct)
        
        // Remove from validation queue since we just validated
        this.removeFromValidationQueue(product.id)

        // Persist to storage
        this.saveToStorage()

      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to add item to cart'
        
        // Show error toast if not already shown
        if (!error.message?.includes('stock')) {
          toastStore.error('Error al añadir producto', this.error, {
            actionText: 'Reintentar',
            actionHandler: () => this.addItem(product, quantity)
          })
        }
        
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update item quantity with optimized validation
    async updateQuantity(itemId: string, quantity: number) {
      this.loading = true
      this.error = null
      const toastStore = useToastStore()

      try {
        const item = this.items.find(item => item.id === itemId)
        
        if (!item) {
          const errorMsg = 'Item not found in cart'
          toastStore.error('Producto no encontrado', errorMsg, {
            actionText: 'Recargar carrito',
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
          const errorMsg = `Only ${currentProduct.stock} items available in stock`
          toastStore.error('Stock insuficiente', errorMsg, {
            actionText: 'Ajustar al máximo',
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
        
        // Persist to storage
        this.saveToStorage()
        
        // Show success toast
        toastStore.success('Cantidad actualizada', `${currentProduct.name}: ${oldQuantity} → ${quantity}`)

      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update quantity'
        
        // Show error toast if not already shown
        if (!error.message?.includes('stock') && !error.message?.includes('not found')) {
          toastStore.error('Error al actualizar', this.error, {
            actionText: 'Reintentar',
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
          const errorMsg = 'Item not found in cart'
          toastStore.error('Producto no encontrado', errorMsg, {
            actionText: 'Recargar carrito',
            actionHandler: () => this.validateCart()
          })
          throw new Error(errorMsg)
        }

        const removedItem = this.items.splice(index, 1)[0]
        
        // Persist to storage
        this.saveToStorage()
        
        // Show success message with undo option
        toastStore.success('Producto eliminado', `${removedItem.product.name} eliminado del carrito`, {
          actionText: 'Deshacer',
          actionHandler: () => {
            // Re-add the item
            this.items.splice(index, 0, removedItem)
            this.saveToStorage()
            toastStore.success('Producto restaurado', `${removedItem.product.name} restaurado al carrito`)
          },
          duration: 8000 // Longer duration for undo action
        })

      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to remove item'
        
        // Show error toast if not already shown
        if (!error.message?.includes('not found')) {
          toastStore.error('Error al eliminar', this.error, {
            actionText: 'Reintentar',
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
      const itemsBackup = [...this.items] // Backup for undo
      
      this.items = []
      this.saveToStorage()
      
      // Show success message with undo option
      toastStore.success('Carrito vaciado', 'Todos los productos han sido eliminados', {
        actionText: 'Deshacer',
        actionHandler: () => {
          this.items = itemsBackup
          this.saveToStorage()
          toastStore.success('Carrito restaurado', 'Productos restaurados al carrito')
        },
        duration: 10000 // Longer duration for undo action
      })
    },

    // Generate unique item ID
    generateItemId(): string {
      return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
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
            toastStore.success('Carrito migrado', `Datos del carrito migrados a ${toStorage}`)
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
            
            toastStore.warning('Almacenamiento limitado', 'El carrito se guardará solo para esta sesión debido a limitaciones de almacenamiento')
          } catch (sessionError) {
            console.error('Both localStorage and sessionStorage failed:', sessionError)
            this.storageType = 'memory'
            toastStore.error('Error de almacenamiento', 'No se pudo guardar el carrito. Los cambios se perderán al cerrar la página.')
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
          toastStore.error('Error de almacenamiento', 'No se pudo guardar el carrito. Los cambios se perderán al cerrar la página.')
        }
      }

      // If we're in memory mode, warn user periodically
      if (this.storageType === 'memory' && !saved) {
        toastStore.warning('Modo temporal', 'El carrito no se puede guardar. Los cambios se perderán al cerrar la página.')
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
        toastStore.success(
          'Productos eliminados', 
          `${removedItems.length} productos eliminados del carrito`,
          {
            actionText: 'Deshacer',
            actionHandler: () => {
              // Restore removed items
              this.items.push(...removedItems)
              this.saveToStorage()
              toastStore.success('Productos restaurados', 'Productos restaurados al carrito')
            },
            duration: 8000
          }
        )

      } catch (error) {
        console.error('Bulk remove failed:', error)
        toastStore.error('Error al eliminar', 'No se pudieron eliminar los productos seleccionados')
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
              toastStore.warning(
                'Stock insuficiente', 
                `${item.product.name}: Solo ${item.product.stock} disponibles`
              )
            }
          }
        }

        // Clear selection after bulk operation
        this.selectedItems.clear()

        // Save to storage
        this.saveToStorage()

        if (updatedCount > 0) {
          toastStore.success(
            'Cantidades actualizadas', 
            `${updatedCount} productos actualizados a cantidad ${newQuantity}`
          )
        }

      } catch (error) {
        console.error('Bulk quantity update failed:', error)
        toastStore.error('Error al actualizar', 'No se pudieron actualizar las cantidades')
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

        toastStore.success(
          'Guardado para después', 
          `${savedItems.length} productos guardados para después`,
          {
            actionText: 'Deshacer',
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
        toastStore.error('Error al guardar', 'No se pudieron guardar los productos')
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

        toastStore.success(
          'Guardado para después', 
          `${cartItem.product.name} guardado para después`,
          {
            actionText: 'Deshacer',
            actionHandler: () => {
              this.moveFromSavedToCart(savedItem.id)
            },
            duration: 8000
          }
        )

      } catch (error) {
        console.error('Save for later failed:', error)
        toastStore.error('Error al guardar', 'No se pudo guardar el producto')
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
            toastStore.success(
              'Movido al carrito', 
              `${savedItem.product.name} - Nueva cantidad: ${newQuantity}`
            )
          } else {
            // Add maximum possible quantity
            const availableQuantity = savedItem.product.stock - existingItem.quantity
            if (availableQuantity > 0) {
              existingItem.quantity = savedItem.product.stock
              toastStore.warning(
                'Cantidad ajustada', 
                `${savedItem.product.name} - Cantidad ajustada a ${savedItem.product.stock} (máximo disponible)`
              )
            } else {
              toastStore.error(
                'Stock insuficiente', 
                `${savedItem.product.name} ya está en el carrito con la cantidad máxima disponible`
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
          toastStore.success('Movido al carrito', `${savedItem.product.name} movido al carrito`)
        }

        this.saveToStorage()

      } catch (error) {
        console.error('Move from saved to cart failed:', error)
        toastStore.error('Error al mover', 'No se pudo mover el producto al carrito')
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

        toastStore.success(
          'Producto eliminado', 
          `${removedItem.product.name} eliminado de guardados`,
          {
            actionText: 'Deshacer',
            actionHandler: () => {
              this.savedForLater.splice(savedIndex, 0, removedItem)
              this.saveToStorage()
              toastStore.success('Producto restaurado', `${removedItem.product.name} restaurado`)
            },
            duration: 8000
          }
        )

      } catch (error) {
        console.error('Remove from saved for later failed:', error)
        toastStore.error('Error al eliminar', 'No se pudo eliminar el producto guardado')
      }
    },

    // Clear all saved for later items
    async clearSavedForLater() {
      const toastStore = useToastStore()
      const itemsBackup = [...this.savedForLater]
      
      this.savedForLater = []
      this.saveToStorage()
      
      toastStore.success(
        'Guardados eliminados', 
        'Todos los productos guardados han sido eliminados',
        {
          actionText: 'Deshacer',
          actionHandler: () => {
            this.savedForLater = itemsBackup
            this.saveToStorage()
            toastStore.success('Guardados restaurados', 'Productos guardados restaurados')
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
        toastStore.warning('Almacenamiento no disponible', 'El carrito funcionará en modo temporal')
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
            toastStore.error('Datos corruptos', 'Los datos del carrito estaban corruptos y se han reiniciado')
            this.clearStorageData()
            this.sessionId = this.generateSessionId()
            return
          }

          // Validate and fix cart data
          const validation = this.validateCartData(cartData)
          
          if (validation.errors.length > 0) {
            console.warn('Cart data validation errors:', validation.errors)
            toastStore.warning('Carrito reparado', 'Se detectaron y corrigieron algunos problemas en el carrito')
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
              toastStore.info('Carrito expirado', 'El carrito anterior ha expirado y se ha limpiado')
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
              const message = sourceStorage === 'sessionStorage' 
                ? 'Carrito restaurado desde la sesión actual'
                : 'Carrito restaurado'
              toastStore.success('Carrito cargado', message)
            }
          } else {
            // Data is completely invalid
            this.clearStorageData()
            this.sessionId = this.generateSessionId()
            toastStore.error('Datos inválidos', 'Los datos del carrito no se pudieron recuperar')
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
        
        toastStore.error('Error al cargar carrito', 'No se pudo cargar el carrito guardado')
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
          toastStore.info('Almacenamiento cambiado', `Cambiado a ${availableStorage}`)
        }

        // Try to load from any available storage
        this.loadFromStorage()
        
        // If we have items, validate them
        if (this.items.length > 0) {
          await this.validateCart()
          toastStore.success('Carrito recuperado', 'Los datos del carrito han sido recuperados y validados')
          return true
        }
        
        return false
      } catch (error) {
        console.error('Cart recovery failed:', error)
        toastStore.error('Recuperación fallida', 'No se pudo recuperar el carrito')
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
            toastStore.warning('Productos no disponibles', 
              `Eliminados: ${validationSummary.removedItems.join(', ')}`, {
              duration: 8000
            })
          }
          
          if (validationSummary.adjustedItems.length > 0) {
            toastStore.warning('Cantidades ajustadas', 
              validationSummary.adjustedItems.join('; '), {
              duration: 8000
            })
          }
          
          if (validationSummary.priceChanges.length > 0) {
            toastStore.info('Precios actualizados', 
              validationSummary.priceChanges.join('; '), {
              duration: 6000
            })
          }
        } else {
          toastStore.success('Carrito validado', 'Todos los productos están disponibles y actualizados')
        }
        
        this.saveToStorage()
        
      } catch (error) {
        this.error = 'Failed to validate cart items'
        toastStore.error('Error de validación', 'No se pudo validar el carrito', {
          actionText: 'Reintentar',
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
            toastStore.error('Validación fallida', 
              'No se pudo validar el carrito después de varios intentos')
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