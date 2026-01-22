/**
 * Global Security Headers Middleware
 *
 * Applies security headers to all responses including:
 * - Content Security Policy (CSP)
 * - X-Content-Type-Options
 * - X-Frame-Options
 * - X-XSS-Protection
 * - Referrer-Policy
 * - Permissions-Policy
 * - Strict-Transport-Security (HSTS)
 *
 * Security features:
 * - Prevents XSS attacks via CSP
 * - Prevents clickjacking via X-Frame-Options
 * - Prevents MIME type sniffing
 * - Controls referrer information leakage
 * - Enforces HTTPS via HSTS
 */

export default defineEventHandler((event) => {
  const url = event.node.req.url || ''

  // Skip security headers for static assets (they have their own caching headers)
  if (url.startsWith('/_nuxt/') || url.startsWith('/assets/')) {
    return
  }

  // Determine environment
  const isDev = process.env.NODE_ENV === 'development'

  // Build CSP directives
  // More permissive in development, stricter in production
  const cspDirectives = buildCSPDirectives(isDev, url)

  // Set security headers
  setHeader(event, 'Content-Security-Policy', cspDirectives)
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'X-Frame-Options', 'SAMEORIGIN') // Allow same-origin framing for admin panels
  setHeader(event, 'X-XSS-Protection', '1; mode=block')
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy - restrict access to sensitive browser features
  setHeader(event, 'Permissions-Policy', [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=(self)', // Allow payment APIs for Stripe
    'usb=()',
  ].join(', '))

  // HSTS - only in production and for HTTPS
  if (!isDev) {
    setHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // X-DNS-Prefetch-Control
  setHeader(event, 'X-DNS-Prefetch-Control', 'on')

  // X-Download-Options (IE specific)
  setHeader(event, 'X-Download-Options', 'noopen')

  // X-Permitted-Cross-Domain-Policies
  setHeader(event, 'X-Permitted-Cross-Domain-Policies', 'none')
})

/**
 * Build Content Security Policy directives
 */
function buildCSPDirectives(isDev: boolean, _url: string): string {
  // Trusted domains
  const supabaseUrl = process.env.SUPABASE_URL || 'https://*.supabase.co'
  const supabaseDomain = supabaseUrl.replace('https://', '').replace('http://', '')

  // Base CSP directives
  const directives: Record<string, string[]> = {
    'default-src': ['\'self\''],

    'script-src': [
      '\'self\'',
      // Allow inline scripts for Nuxt hydration (required for SSR)
      '\'unsafe-inline\'',
      // Allow eval in development for hot reload
      ...(isDev ? ['\'unsafe-eval\''] : []),
      // Stripe
      'https://js.stripe.com',
      'https://checkout.stripe.com',
      // Google Analytics (if used)
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ],

    'style-src': [
      '\'self\'',
      // Allow inline styles for Vue/Nuxt
      '\'unsafe-inline\'',
      // Google Fonts
      'https://fonts.googleapis.com',
    ],

    'img-src': [
      '\'self\'',
      'data:',
      'blob:',
      // Supabase storage
      supabaseDomain,
      `*.${supabaseDomain}`,
      // Common CDNs for product images
      'https://*.unsplash.com',
      'https://images.unsplash.com',
      'https://*.cloudinary.com',
      // Stripe
      'https://*.stripe.com',
      // Placeholder services
      'https://via.placeholder.com',
      'https://placehold.co',
    ],

    'font-src': [
      '\'self\'',
      'data:',
      // Google Fonts
      'https://fonts.gstatic.com',
    ],

    'connect-src': [
      '\'self\'',
      // Supabase API and realtime
      supabaseDomain,
      `*.${supabaseDomain}`,
      'wss://*.supabase.co',
      // Images (for color extraction or other fetch operations)
      'https://*.unsplash.com',
      'https://images.unsplash.com',
      // Stripe
      'https://api.stripe.com',
      'https://checkout.stripe.com',
      // Sentry (if used for error tracking)
      'https://*.sentry.io',
      // Development
      ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : []),
    ],

    'frame-src': [
      '\'self\'',
      // Stripe checkout iframe
      'https://js.stripe.com',
      'https://checkout.stripe.com',
      'https://hooks.stripe.com',
    ],

    'object-src': ['\'none\''],

    'base-uri': ['\'self\''],

    'form-action': ['\'self\''],

    'frame-ancestors': ['\'self\''],

    'upgrade-insecure-requests': [],
  }

  // Remove upgrade-insecure-requests in development
  if (isDev) {
    delete directives['upgrade-insecure-requests']
  }

  // Build CSP string
  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key
      }
      return `${key} ${values.join(' ')}`
    })
    .join('; ')
}
