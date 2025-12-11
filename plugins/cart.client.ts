import { nextTick } from 'vue'
import { useCartStore } from '~/stores/cart'

export default defineNuxtPlugin({
  name: 'cart',

  setup(_nuxtApp) {
    // Only initialize cart on client-side and for non-admin pages
    if (import.meta.client) {
      const route = useRoute()

      // Skip cart initialization for admin pages
      if (route.path.startsWith('/admin')) {
        return
      }

      // Defer initialization to allow Pinia to be ready
      nextTick(() => {
        try {
          const cartStore = useCartStore()
          if (!cartStore.sessionId) {
            cartStore.initializeCart()
          }
        }
        catch (error) {
          console.warn('Cart initialization deferred:', error)
        }
      })
    }
  },
})
