/**
 * Middleware to protect test-users page from production access
 * Ensures the test user simulator is only accessible when explicitly enabled
 * with enhanced production environment detection
 */
export default defineNuxtRouteMiddleware((_to) => {
  const config = useRuntimeConfig()

  // Check explicit flag
  if (!config.public.enableTestUsers) {
    return navigateTo('/')
  }

  // Additional production safety checks
  if (process.env.NODE_ENV === 'production') {
    // Allow only on preview deployments (Vercel, Netlify, etc.)
    const isPreview
      = process.env.VERCEL_ENV === 'preview'
        || process.env.CONTEXT === 'deploy-preview'
        || process.env.DEPLOY_PRIME_URL?.includes('preview')

    // Block if it's production but not a preview environment
    if (!isPreview && !process.env.ENABLE_TEST_USERS_OVERRIDE) {
      console.warn('⚠️ Test users page blocked: Production environment detected')
      return navigateTo('/')
    }
  }

  // Rate limiting check (prevent abuse)
  if (import.meta.client) {
    const lastAccess = sessionStorage.getItem('md-test-users-last-access')
    const now = Date.now()

    if (lastAccess) {
      const timeSinceLastAccess = now - parseInt(lastAccess, 10)
      // Require at least 1 second between accesses
      if (timeSinceLastAccess < 1000) {
        console.warn('⚠️ Test users page: Rate limit triggered')
        // Don't block, just warn
      }
    }

    sessionStorage.setItem('md-test-users-last-access', now.toString())
  }
})
