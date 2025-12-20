/**
 * Admin Cache Headers Middleware
 *
 * Sets appropriate cache control headers for admin API endpoints
 * to ensure sensitive data is not cached in shared caches (CDNs, proxies)
 * while allowing private browser/server caching for performance.
 *
 * Security features:
 * - Private cache control (no CDN/proxy caching)
 * - No-store for mutation endpoints (POST, PUT, DELETE, PATCH)
 * - Stale-while-revalidate for GET endpoints
 * - Additional security headers
 */

export default defineEventHandler((event) => {
  const path = event.path

  // Only apply to admin API routes
  if (!path.startsWith('/api/admin/')) {
    return
  }

  const method = event.method

  // For mutation endpoints (POST, PUT, DELETE, PATCH), set no-cache headers
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    setResponseHeaders(event, {
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
      'CDN-Cache-Control': 'no-store',
      'Pragma': 'no-cache',
      'Expires': '0',
    })
    return
  }

  // For GET endpoints, headers are already set by route rules in nuxt.config.ts
  // But we ensure they have the private directive to prevent CDN caching
  const existingCacheControl = getResponseHeader(event, 'Cache-Control')

  if (!existingCacheControl || (typeof existingCacheControl === 'string' && !existingCacheControl.includes('private'))) {
    // Set default private cache control if not already set
    setResponseHeaders(event, {
      'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
      'CDN-Cache-Control': 'no-store',
    })
  }

  // Add security headers for all admin routes
  setResponseHeaders(event, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  })
})
