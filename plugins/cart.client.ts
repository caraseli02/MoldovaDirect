import { useCartStore } from '~/stores/cart'

export default defineNuxtPlugin({
  name: 'cart',

  setup(nuxtApp) {
    const route = useRoute()

    // Skip cart initialization for admin pages (per CLAUDE.md route guard pattern)
    if (route.path.startsWith('/admin')) {
      return
    }

    // Use app:suspense:resolve to wait for Vue hydration to complete
    // This prevents hydration mismatch errors when loading cart from storage
    nuxtApp.hook('app:suspense:resolve', () => {
      try {
        const cartStore = useCartStore()
        if (!cartStore.sessionId) {
          cartStore.initializeCart()
        }
      }
      catch (error: unknown) {
        // Log error with context for debugging - cart will work but may not persist
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('[Cart Plugin] Initialization failed:', errorMessage)
        // Cart will continue to work for the session, but persistence may be affected
      }
    })
  },
})
