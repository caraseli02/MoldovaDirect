import { useCartStore } from '~/stores/cart'

export const useCart = () => {
  const cartStore = useCartStore()

  // Initialize cart on first use
  if (process.client && !cartStore.sessionId) {
    cartStore.initializeCart()
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

    // Actions
    addItem: cartStore.addItem,
    updateQuantity: cartStore.updateQuantity,
    removeItem: cartStore.removeItem,
    clearCart: cartStore.clearCart,
    validateCart: cartStore.validateCart,

    // Utility methods
    formatPrice: (price: number) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },

    // Get formatted subtotal
    formattedSubtotal: computed(() => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(cartStore.subtotal)
    })
  }
}