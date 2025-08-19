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

interface CartState {
  items: CartItem[]
  sessionId: string | null
  loading: boolean
  error: string | null
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    sessionId: null,
    loading: false,
    error: null
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
    }
  },

  actions: {
    // Initialize cart session
    initializeCart() {
      // Generate session ID if not exists
      if (!this.sessionId) {
        this.sessionId = this.generateSessionId()
      }
      
      // Load cart from localStorage for persistence
      this.loadFromLocalStorage()
    },

    // Generate unique session ID
    generateSessionId(): string {
      return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    },

    // Add item to cart
    async addItem(product: Product, quantity: number = 1) {
      this.loading = true
      this.error = null
      const toastStore = useToastStore()

      try {
        // Validate stock availability
        if (quantity > product.stock) {
          const errorMsg = `Only ${product.stock} items available in stock`
          toastStore.error('Stock insuficiente', errorMsg, {
            actionText: 'Ver producto',
            actionHandler: () => {
              // Navigate to product page
              navigateTo(`/products/${product.slug}`)
            }
          })
          throw new Error(errorMsg)
        }

        const existingItem = this.getItemByProductId(product.id)

        if (existingItem) {
          // Update quantity if item already exists
          const newQuantity = existingItem.quantity + quantity
          
          if (newQuantity > product.stock) {
            const available = product.stock - existingItem.quantity
            const errorMsg = `Cannot add ${quantity} more items. Only ${available} available`
            toastStore.error('Stock insuficiente', errorMsg, {
              actionText: 'Ajustar cantidad',
              actionHandler: () => {
                // Set to maximum available
                this.updateQuantity(existingItem.id, product.stock)
              }
            })
            throw new Error(errorMsg)
          }
          
          existingItem.quantity = newQuantity
          toastStore.success('Cantidad actualizada', `${product.name} - Nueva cantidad: ${newQuantity}`)
        } else {
          // Add new item to cart
          const cartItem: CartItem = {
            id: this.generateItemId(),
            product,
            quantity,
            addedAt: new Date()
          }
          this.items.push(cartItem)
          toastStore.success('Producto añadido', `${product.name} añadido al carrito`)
        }

        // Persist to localStorage
        this.saveToLocalStorage()

      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to add item to cart'
        
        // Show error toast if not already shown
        if (!error.message?.includes('stock')) {
          const toastStore = useToastStore()
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

    // Update item quantity
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

        // Validate stock availability
        if (quantity > item.product.stock) {
          const errorMsg = `Only ${item.product.stock} items available in stock`
          toastStore.error('Stock insuficiente', errorMsg, {
            actionText: 'Ajustar al máximo',
            actionHandler: () => this.updateQuantity(itemId, item.product.stock)
          })
          throw new Error(errorMsg)
        }

        const oldQuantity = item.quantity
        item.quantity = quantity
        
        // Persist to localStorage
        this.saveToLocalStorage()
        
        // Show success toast
        toastStore.success('Cantidad actualizada', `${item.product.name}: ${oldQuantity} → ${quantity}`)

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
        
        // Persist to localStorage
        this.saveToLocalStorage()
        
        // Show success message with undo option
        toastStore.success('Producto eliminado', `${removedItem.product.name} eliminado del carrito`, {
          actionText: 'Deshacer',
          actionHandler: () => {
            // Re-add the item
            this.items.splice(index, 0, removedItem)
            this.saveToLocalStorage()
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
      this.saveToLocalStorage()
      
      // Show success message with undo option
      toastStore.success('Carrito vaciado', 'Todos los productos han sido eliminados', {
        actionText: 'Deshacer',
        actionHandler: () => {
          this.items = itemsBackup
          this.saveToLocalStorage()
          toastStore.success('Carrito restaurado', 'Productos restaurados al carrito')
        },
        duration: 10000 // Longer duration for undo action
      })
    },

    // Generate unique item ID
    generateItemId(): string {
      return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    },

    // Save cart to localStorage
    saveToLocalStorage() {
      if (process.client) {
        try {
          const cartData = {
            items: this.items,
            sessionId: this.sessionId,
            updatedAt: new Date().toISOString()
          }
          localStorage.setItem('moldova-direct-cart', JSON.stringify(cartData))
        } catch (error) {
          console.warn('Failed to save cart to localStorage:', error)
          
          // Try sessionStorage as fallback
          try {
            sessionStorage.setItem('moldova-direct-cart', JSON.stringify(cartData))
            const toastStore = useToastStore()
            toastStore.warning('Almacenamiento limitado', 'El carrito se guardará solo para esta sesión')
          } catch (sessionError) {
            const toastStore = useToastStore()
            toastStore.error('Error de almacenamiento', 'No se pudo guardar el carrito. Los cambios se perderán al cerrar la página.')
          }
        }
      }
    },

    // Load cart from localStorage
    loadFromLocalStorage() {
      if (process.client) {
        try {
          let savedCart = localStorage.getItem('moldova-direct-cart')
          let storageType = 'localStorage'
          
          // Fallback to sessionStorage if localStorage fails
          if (!savedCart) {
            savedCart = sessionStorage.getItem('moldova-direct-cart')
            storageType = 'sessionStorage'
          }
          
          if (savedCart) {
            const cartData = JSON.parse(savedCart)
            
            // Check if cart is not too old (30 days for localStorage, no limit for sessionStorage)
            const updatedAt = new Date(cartData.updatedAt)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            
            if (storageType === 'sessionStorage' || updatedAt > thirtyDaysAgo) {
              this.items = cartData.items || []
              this.sessionId = cartData.sessionId || this.generateSessionId()
              
              // Convert addedAt strings back to Date objects
              this.items.forEach(item => {
                if (typeof item.addedAt === 'string') {
                  item.addedAt = new Date(item.addedAt)
                }
              })
              
              if (storageType === 'sessionStorage') {
                const toastStore = useToastStore()
                toastStore.info('Carrito restaurado', 'Carrito cargado desde la sesión actual')
              }
            } else {
              // Clear old cart
              this.items = []
              this.sessionId = this.generateSessionId()
              localStorage.removeItem('moldova-direct-cart')
              
              const toastStore = useToastStore()
              toastStore.info('Carrito expirado', 'El carrito anterior ha expirado y se ha limpiado')
            }
          }
        } catch (error) {
          console.warn('Failed to load cart from storage:', error)
          this.items = []
          this.sessionId = this.generateSessionId()
          
          const toastStore = useToastStore()
          toastStore.error('Error al cargar carrito', 'No se pudo cargar el carrito guardado')
        }
      }
    },



    // Validate cart items against current product data
    async validateCart() {
      this.loading = true
      const toastStore = useToastStore()
      
      try {
        const invalidItems: string[] = []
        const adjustedItems: string[] = []
        const removedItems: string[] = []
        
        // Create a copy of items to iterate over (since we might modify the original array)
        const itemsToValidate = [...this.items]
        
        for (const item of itemsToValidate) {
          try {
            // Fetch current product data to validate stock and availability
            const currentProduct = await $fetch(`/api/products/${item.product.slug}`)
            
            // Update product data in cart
            const originalPrice = item.product.price
            item.product = { ...item.product, ...currentProduct.product }
            
            // Check for price changes
            if (originalPrice !== currentProduct.product.price) {
              toastStore.warning('Precio actualizado', `${item.product.name}: ${originalPrice}€ → ${currentProduct.product.price}€`)
            }
            
            // Check if item is still available
            if (currentProduct.product.stock === 0) {
              removedItems.push(item.product.name)
              await this.removeItem(item.id)
            } else if (item.quantity > currentProduct.product.stock) {
              // Adjust quantity to available stock
              const oldQuantity = item.quantity
              item.quantity = currentProduct.product.stock
              adjustedItems.push(`${item.product.name}: ${oldQuantity} → ${currentProduct.product.stock}`)
            }
          } catch (error) {
            // Product might be deleted or API error
            console.warn(`Failed to validate product ${item.product.name}:`, error)
            removedItems.push(item.product.name)
            await this.removeItem(item.id)
          }
        }
        
        // Show summary of changes
        if (removedItems.length > 0) {
          toastStore.warning('Productos no disponibles', `Eliminados: ${removedItems.join(', ')}`, {
            duration: 8000
          })
        }
        
        if (adjustedItems.length > 0) {
          toastStore.warning('Cantidades ajustadas', adjustedItems.join('; '), {
            duration: 8000
          })
        }
        
        if (removedItems.length === 0 && adjustedItems.length === 0) {
          toastStore.success('Carrito validado', 'Todos los productos están disponibles')
        }
        
        this.saveToLocalStorage()
        
      } catch (error) {
        this.error = 'Failed to validate cart items'
        toastStore.error('Error de validación', 'No se pudo validar el carrito', {
          actionText: 'Reintentar',
          actionHandler: () => this.validateCart()
        })
      } finally {
        this.loading = false
      }
    }
  }
})