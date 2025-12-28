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

      // Use onNuxtReady to wait for Vue hydration to complete
      // This prevents hydration mismatch errors when loading cart from storage
      nuxtApp.hook('app:suspense:resolve', () => {
        try {
          const cartStore = useCartStore()
          if (!cartStore.sessionId) {
            cartStore.initializeCart()
          }
        }
        catch (error: any) {
          console.warn('Cart initialization deferred:', error)
        }
      })
    }
  },
})
