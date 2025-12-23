import { useCartStore } from '~/stores/cart'
/**
 * Cart Analytics Plugin
 *
 * Requirements addressed:
 * - Initialize cart analytics tracking on app startup
 * - Set up automatic cart view tracking for page navigation
 * - Handle cart analytics synchronization
 *
 * Automatically initializes cart analytics and sets up tracking.
 */

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __cartAnalyticsCleanup?: () => void
  }
}

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (!import.meta.client) return

  const { $router } = useNuxtApp()
  const route = useRoute()

  // Skip cart analytics for admin pages
  if (route.path.startsWith('/admin')) {
    return
  }

  // Initialize cart analytics when navigating to cart page
  $router.afterEach((to) => {
    // Skip analytics for admin pages
    if (to.path.startsWith('/admin')) {
      return
    }

    if (to.path === '/cart') {
      // Use setTimeout to ensure Pinia and cart store are ready
      setTimeout(() => {
        try {
          const cartAnalytics = useCartAnalytics()

          // Try to get cart store - skip tracking if not available
          try {
            const cartStore = useCartStore()

            if (cartAnalytics.trackCartView && cartStore) {
              const cartValue = cartStore.subtotal || 0
              const itemCount = cartStore.itemCount || 0
              cartAnalytics.trackCartView(cartValue, itemCount)
            }
          }
          catch {
            // Cart store not ready yet - skip tracking (not critical)
            return
          }
        }
        catch (error: any) {
          console.warn('Failed to track cart view:', error)
        }
      }, 500) // Increased delay to ensure cart plugin has initialized
    }
  })

  // Set up periodic sync of cart analytics data with delay
  let syncInterval: NodeJS.Timeout | null = null

  setTimeout(() => {
    syncInterval = setInterval(async () => {
      try {
        const { syncEventsWithServer } = useCartAnalytics()
        await syncEventsWithServer()
      }
      catch (error: any) {
        console.warn('Failed to sync cart analytics:', error)
      }
    }, 5 * 60 * 1000) // Sync every 5 minutes

    // Sync on page unload
    const handleBeforeUnload = async () => {
      try {
        const { syncEventsWithServer } = useCartAnalytics()
        await syncEventsWithServer()
      }
      catch (error: any) {
        console.warn('Failed to sync cart analytics on unload:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Store cleanup function for potential future use
    window.__cartAnalyticsCleanup = () => {
      if (syncInterval) {
        clearInterval(syncInterval)
        syncInterval = null
      }
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, 1000) // Wait 1 second for Pinia to be ready
})
