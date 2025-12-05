/**
 * Authentication Redirect Utilities
 *
 * Provides secure redirect URL validation to prevent open redirect vulnerabilities.
 *
 * Security Requirements:
 * - Only allow relative paths (starting with /)
 * - Prevent protocol-relative URLs (//evil.com)
 * - Prevent URLs with protocols (http://, https://, javascript:, data:)
 * - Whitelist allowed redirect paths
 */

/**
 * List of allowed redirect path prefixes
 * Add new paths here as needed
 */
const ALLOWED_REDIRECT_PREFIXES = [
  '/account',
  '/admin',
  '/checkout',
  '/orders',
  '/products',
  '/cart',
  '/auth',
  '/'
]

/**
 * List of disallowed redirect paths for security
 */
const DISALLOWED_PATHS = [
  '/auth/logout' // Prevent redirect loops
]

/**
 * Validates and sanitizes a redirect URL
 *
 * @param redirectUrl - The URL to validate
 * @param defaultRedirect - Default redirect if validation fails (default: '/account')
 * @returns A safe redirect URL
 *
 * @example
 * ```typescript
 * // Valid redirects
 * validateRedirectUrl('/account/orders') // => '/account/orders'
 * validateRedirectUrl('/admin/dashboard') // => '/admin/dashboard'
 *
 * // Invalid redirects (returns default)
 * validateRedirectUrl('//evil.com/phishing') // => '/account'
 * validateRedirectUrl('http://evil.com') // => '/account'
 * validateRedirectUrl('javascript:alert(1)') // => '/account'
 * validateRedirectUrl('/not-allowed') // => '/account'
 * ```
 */
export function validateRedirectUrl(
  redirectUrl: string | undefined | null,
  defaultRedirect: string = '/account'
): string {
  // Return default if no redirect provided
  if (!redirectUrl || typeof redirectUrl !== 'string') {
    return defaultRedirect
  }

  // Trim whitespace
  const url = redirectUrl.trim()

  // Must start with exactly one forward slash
  if (!url.startsWith('/') || url.startsWith('//')) {
    return defaultRedirect
  }

  // Check for protocol indicators (security bypass attempts)
  if (url.includes(':') || url.includes('//')) {
    return defaultRedirect
  }

  // Check for disallowed paths
  if (DISALLOWED_PATHS.some(path => url === path || url.startsWith(`${path}?`) || url.startsWith(`${path}#`))) {
    return defaultRedirect
  }

  // Check if path starts with an allowed prefix
  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(prefix => {
    // Exact match or starts with prefix followed by / or ? or #
    return url === prefix ||
           url.startsWith(`${prefix}/`) ||
           url.startsWith(`${prefix}?`) ||
           url.startsWith(`${prefix}#`)
  })

  if (!isAllowed) {
    return defaultRedirect
  }

  return url
}

/**
 * Checks if a redirect URL is valid without sanitizing
 *
 * @param redirectUrl - The URL to check
 * @returns true if the URL is valid and safe
 */
export function isValidRedirectUrl(redirectUrl: string | undefined | null): boolean {
  if (!redirectUrl || typeof redirectUrl !== 'string') {
    return false
  }

  const url = redirectUrl.trim()

  // Must start with exactly one forward slash
  if (!url.startsWith('/') || url.startsWith('//')) {
    return false
  }

  // Check for protocol indicators
  if (url.includes(':') || url.match(/\/\//)) {
    return false
  }

  // Check for disallowed paths
  if (DISALLOWED_PATHS.some(path => url === path || url.startsWith(`${path}?`) || url.startsWith(`${path}#`))) {
    return false
  }

  // Check if path starts with an allowed prefix
  return ALLOWED_REDIRECT_PREFIXES.some(prefix => {
    return url === prefix ||
           url.startsWith(`${prefix}/`) ||
           url.startsWith(`${prefix}?`) ||
           url.startsWith(`${prefix}#`)
  })
}
