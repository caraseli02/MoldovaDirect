import { defineStore } from 'pinia'

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

      try {
        // Validate stock availability
        if (quantity > product.stock) {
          throw new Error(`Only ${product.stock} items available in stock`)
        }

        const existingItem = this.getItemByProductId(product.id)

        if (existingItem) {
          // Update quantity if item already exists
          const newQuantity = existingItem.quantity + quantity
          
          if (newQuantity > product.stock) {
            throw new Error(`Cannot add ${quantity} more items. Only ${product.stock - existingItem.quantity} available`)
          }
          
          existingItem.quantity = newQuantity
        } else {
          // Add new item to cart
          const cartItem: CartItem = {
            id: this.generateItemId(),
            product,
            quantity,
            addedAt: new Date()
          }
          this.items.push(cartItem)
        }

        // Persist to localStorage
        this.saveToLocalStorage()
        
        // Show success message
        this.showSuccessMessage(`${product.name} added to cart`)

      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to add item to cart'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update item quantity
    async updateQuantity(itemId: string, quantity: number) {
      this.loading = true
      this.error = null

      try {
        const item = this.items.find(item => item.id === itemId)
        
        if (!item) {
          throw new Error('Item not found in cart')
        }

        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          await this.removeItem(itemId)
          return
        }

        // Validate stock availability
        if (quantity > item.product.stock) {
          throw new Error(`Only ${item.product.stock} items available in stock`)
        }

        item.quantity = quantity
        
        // Persist to localStorage
        this.saveToLocalStorage()

      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update quantity'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Remove item from cart
    async removeItem(itemId: string) {
      this.loading = true
      this.error = null

      try {
        const index = this.items.findIndex(item => item.id === itemId)
        
        if (index === -1) {
          throw new Error('Item not found in cart')
        }

        const removedItem = this.items.splice(index, 1)[0]
        
        // Persist to localStorage
        this.saveToLocalStorage()
        
        // Show success message
        this.showSuccessMessage(`${removedItem.product.name} removed from cart`)

      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to remove item'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Clear entire cart
    async clearCart() {
      this.items = []
      this.saveToLocalStorage()
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
        }
      }
    },

    // Load cart from localStorage
    loadFromLocalStorage() {
      if (process.client) {
        try {
          const savedCart = localStorage.getItem('moldova-direct-cart')
          if (savedCart) {
            const cartData = JSON.parse(savedCart)
            
            // Check if cart is not too old (30 days)
            const updatedAt = new Date(cartData.updatedAt)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            
            if (updatedAt > thirtyDaysAgo) {
              this.items = cartData.items || []
              this.sessionId = cartData.sessionId || this.generateSessionId()
            } else {
              // Clear old cart
              this.clearCart()
            }
          }
        } catch (error) {
          console.warn('Failed to load cart from localStorage:', error)
          this.clearCart()
        }
      }
    },

    // Show success message (can be integrated with toast system)
    showSuccessMessage(message: string) {
      // This can be integrated with a toast notification system
      console.log('Cart Success:', message)
    },

    // Validate cart items against current product data
    async validateCart() {
      this.loading = true
      
      try {
        const invalidItems: string[] = []
        
        for (const item of this.items) {
          // Fetch current product data to validate stock and availability
          try {
            const currentProduct = await $fetch(`/api/products/${item.product.slug}`)
            
            // Update product data in cart
            item.product = { ...item.product, ...currentProduct.product }
            
            // Check if item is still available
            if (currentProduct.product.stock === 0) {
              invalidItems.push(`${item.product.name} is out of stock`)
              await this.removeItem(item.id)
            } else if (item.quantity > currentProduct.product.stock) {
              // Adjust quantity to available stock
              item.quantity = currentProduct.product.stock
              invalidItems.push(`${item.product.name} quantity adjusted to available stock (${currentProduct.product.stock})`)
            }
          } catch (error) {
            // Product might be deleted
            invalidItems.push(`${item.product.name} is no longer available`)
            await this.removeItem(item.id)
          }
        }
        
        if (invalidItems.length > 0) {
          this.error = invalidItems.join(', ')
        }
        
        this.saveToLocalStorage()
        
      } catch (error) {
        this.error = 'Failed to validate cart items'
      } finally {
        this.loading = false
      }
    }
  }
})