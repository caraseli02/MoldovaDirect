/**
 * Global middleware to handle locale-based redirects
 * Ensures language switching works properly without authentication interference
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip for auth pages, API routes, and assets
  const skipPaths = ['/api/', '/auth/', '/_nuxt/', '/favicon.ico']
  if (skipPaths.some(path => to.path.startsWith(path))) return

  // Get available locales from the configuration
  const availableLocales = ['es', 'en', 'ro', 'ru']
  const defaultLocale = 'es'

  // Handle language switching - check if URL contains language prefix
  const pathSegments = to.path.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]

  // Check if first segment is a valid locale
  const isValidLocale = availableLocales.includes(firstSegment)

  if (isValidLocale) {
    // This is a valid locale route - allow it to proceed
    return
  }

  // For all other routes, let them proceed normally
  // The i18n module will handle locale detection automatically
  return
})
