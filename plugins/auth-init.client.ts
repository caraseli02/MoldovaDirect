/**
 * Authentication initialization plugin
 * 
 * Requirements addressed:
 * - 5.1: Session persistence across browser tabs with reactive updates
 * - 5.3: Reactive authentication status using Supabase composables
 * - Cross-tab synchronization through Supabase real-time updates
 * 
 * This plugin initializes the authentication store on the client side
 * and sets up cross-tab synchronization for authentication state.
 */

export default defineNuxtPlugin(async () => {
  // Only run on client side
  if (!process.client) return

  const { useAuthStore } = await import('~/stores/auth')
  const authStore = useAuthStore()

  // Initialize authentication state
  await authStore.initializeAuth()

  // Set up cross-tab synchronization using storage events
  const handleStorageChange = (event: StorageEvent) => {
    // Listen for authentication state changes from other tabs
    if (event.key === 'supabase.auth.token') {
      // Supabase handles token synchronization automatically
      // We just need to refresh our session to stay in sync
      authStore.refreshSession()
    }
  }

  // Add storage event listener for cross-tab sync
  window.addEventListener('storage', handleStorageChange)

  // Set up periodic session refresh to maintain active sessions
  // This ensures tokens are refreshed automatically during user activity
  let refreshInterval: NodeJS.Timeout | null = null

  const startSessionRefresh = () => {
    // Refresh session every 10 minutes if user is authenticated
    refreshInterval = setInterval(() => {
      if (authStore.isAuthenticated) {
        authStore.refreshSession()
      }
    }, 10 * 60 * 1000) // 10 minutes
  }

  const stopSessionRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  // Start session refresh if user is already authenticated
  if (authStore.isAuthenticated) {
    startSessionRefresh()
  }

  // Watch for authentication state changes to manage session refresh
  watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (isAuthenticated) {
      startSessionRefresh()
    } else {
      stopSessionRefresh()
    }
  })

  // Cleanup on page unload
  const cleanup = () => {
    window.removeEventListener('storage', handleStorageChange)
    stopSessionRefresh()
  }

  // Add cleanup listeners
  window.addEventListener('beforeunload', cleanup)
  window.addEventListener('pagehide', cleanup)

  // Provide cleanup function for manual cleanup if needed
  return {
    provide: {
      authCleanup: cleanup
    }
  }
})