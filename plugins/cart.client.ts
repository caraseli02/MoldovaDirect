import { nextTick } from 'vue'
import { useCartStore } from '~/stores/cart'

export default defineNuxtPlugin({
  name: 'cart',

  setup(nuxtApp) {
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
            console.log('🛒 Initializing cart store from plugin')
            cartStore.initializeCart()
          }
          else {
            console.log('🛒 Cart store already initialized, sessionId:', cartStore.sessionId)
          }
        }
        catch (error) {
          console.warn('Cart initialization deferred:', error)
        }
      })
    }
  },
})
