/**
 * Centralized Cookie Configuration
 *
 * This file contains all cookie configuration constants used across the application
 * to ensure consistency and make it easier to manage cookie settings.
 */

export interface CookieConfig {
  maxAge: number
  sameSite: 'strict' | 'lax' | 'none'
  secure: boolean
  path?: string
  watch?: 'shallow' | 'deep' | boolean
  default?: () => any
}

/**
 * Cart cookie configuration
 * Used for persisting shopping cart data across sessions
 * Long expiration (30 days) for better user experience
 */
export const CART_COOKIE_CONFIG: CookieConfig = {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/', // Ensure cookie is accessible from all routes
  // watch removed - let Nuxt handle reactivity
  default: () => null,
}

/**
 * Checkout session cookie configuration
 * Used for persisting checkout flow data
 * Shorter expiration (2 hours) for security
 */
export const CHECKOUT_SESSION_COOKIE_CONFIG: CookieConfig = {
  maxAge: 60 * 60 * 2, // 2 hours
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/', // Ensure cookie is accessible from all routes (fixes scoping issue)
}

/**
 * Cookie name constants
 */
export const COOKIE_NAMES = {
  CART: 'moldova_direct_cart',
  CHECKOUT_SESSION: 'checkout_session',
} as const
