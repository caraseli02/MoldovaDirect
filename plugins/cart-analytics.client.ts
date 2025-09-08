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

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (!process.client) return

  const { $router } = useNuxtApp()
  
  // Initialize cart analytics when navigating to cart page
  $router.afterEach((to) => {
    if (to.path === '/cart') {
      // Use nextTick to ensure cart store is initialized
      nextTick(() => {
        const { trackCartView } = useCart()
        trackCartView()
      })
    }
  })

  // Set up periodic sync of cart analytics data
  const syncInterval = setInterval(async () => {
    try {
      const { syncEventsWithServer } = useCartAnalytics()
      await syncEventsWithServer()
    } catch (error) {
      console.warn('Failed to sync cart analytics:', error)
    }
  }, 5 * 60 * 1000) // Sync every 5 minutes

  // Sync on page unload
  window.addEventListener('beforeunload', async () => {
    try {
      const { syncEventsWithServer } = useCartAnalytics()
      await syncEventsWithServer()
    } catch (error) {
      console.warn('Failed to sync cart analytics on unload:', error)
    }
  })

  // Cleanup on app unmount
  onUnmounted(() => {
    if (syncInterval) {
      clearInterval(syncInterval)
    }
  })
})