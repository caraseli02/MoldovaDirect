import { useCartStore } from '~/stores/cart'

export const useCart = () => {
  const cartStore = useCartStore()
  const toast = useToast()

  // Initialize cart on first use with error handling
  if (process.client && !cartStore.sessionId) {
    try {
      cartStore.initializeCart()
    } catch (error) {
      console.error('Failed to initialize cart:', error)
      toast.error('Error de inicialización', 'No se pudo cargar el carrito')
    }
  }

  // Enhanced actions with error handling
  const safeAddItem = async (product: any, quantity: number = 1) => {
    try {
      await cartStore.addItem(product, quantity)
    } catch (error) {
      // Error is already handled by the store, but we can add additional logic here
      console.error('Failed to add item:', error)
      throw error // Re-throw to allow component-level handling
    }
  }

  const safeUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await cartStore.updateQuantity(itemId, quantity)
    } catch (error) {
      console.error('Failed to update quantity:', error)
      throw error
    }
  }

  const safeRemoveItem = async (itemId: string) => {
    try {
      await cartStore.removeItem(itemId)
    } catch (error) {
      console.error('Failed to remove item:', error)
      throw error
    }
  }

  const safeClearCart = async () => {
    try {
      await cartStore.clearCart()
    } catch (error) {
      console.error('Failed to clear cart:', error)
      toast.error('Error al vaciar carrito', 'No se pudo vaciar el carrito')
      throw error
    }
  }

  const safeValidateCart = async () => {
    try {
      await cartStore.validateCart()
    } catch (error) {
      console.error('Failed to validate cart:', error)
      throw error
    }
  }

  return {
    // State
    items: computed(() => cartStore.items),
    itemCount: computed(() => cartStore.itemCount),
    subtotal: computed(() => cartStore.subtotal),
    isEmpty: computed(() => cartStore.isEmpty),
    loading: computed(() => cartStore.loading),
    error: computed(() => cartStore.error),
    sessionId: computed(() => cartStore.sessionId),

    // Getters
    isInCart: (productId: string) => cartStore.isInCart(productId),
    getItemByProductId: (productId: string) => cartStore.getItemByProductId(productId),

    // Safe actions (with error handling)
    addItem: safeAddItem,
    updateQuantity: safeUpdateQuantity,
    removeItem: safeRemoveItem,
    clearCart: safeClearCart,
    validateCart: safeValidateCart,

    // Direct store actions (for cases where you want to handle errors yourself)
    directAddItem: cartStore.addItem,
    directUpdateQuantity: cartStore.updateQuantity,
    directRemoveItem: cartStore.removeItem,
    directClearCart: cartStore.clearCart,
    directValidateCart: cartStore.validateCart,

    // Utility methods
    formatPrice: (price: number) => {
      try {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR'
        }).format(price)
      } catch (error) {
        console.error('Failed to format price:', error)
        return `€${price.toFixed(2)}`
      }
    },

    // Get formatted subtotal
    formattedSubtotal: computed(() => {
      try {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR'
        }).format(cartStore.subtotal)
      } catch (error) {
        console.error('Failed to format subtotal:', error)
        return `€${cartStore.subtotal.toFixed(2)}`
      }
    })
  }
}