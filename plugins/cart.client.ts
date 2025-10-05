export default defineNuxtPlugin(() => {
  // Ensure Pinia is properly initialized before cart operations
  if (import.meta.client) {
    // Initialize cart store to ensure Pinia is ready
    const { $pinia } = useNuxtApp()
    if ($pinia) {
      try {
        const cartStore = useCartStore()
        if (!cartStore.sessionId) {
          cartStore.initializeCart()
        }
      } catch (error) {
        console.warn('Cart initialization deferred:', error)
      }
    }
  }
})