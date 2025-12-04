/**
 * Custom Supabase Storage Adapter with Remember Me Support
 *
 * This custom storage adapter wraps the default Supabase cookie storage
 * and modifies cookie behavior based on the "remember me" preference.
 *
 * When remember me is:
 * - Checked: Cookies have maxAge (persistent across browser restarts)
 * - Unchecked: Cookies have no maxAge (session cookies, cleared on browser close)
 */

import type { CookieOptions } from '@supabase/ssr'

const REMEMBER_ME_COOKIE = 'auth-remember-me'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

/**
 * Get remember me preference from cookies
 */
function getRememberMeFromCookies(): boolean {
  if (typeof document === 'undefined') return true

  const cookies = document.cookie.split(';')
  const rememberMeCookie = cookies.find(c => c.trim().startsWith(`${REMEMBER_ME_COOKIE}=`))

  if (!rememberMeCookie) return true // Default to persistent

  const value = rememberMeCookie.split('=')[1]
  return value !== 'false'
}

/**
 * Create a cookie storage adapter that respects remember me preference
 */
export function createRememberMeStorage() {
  return {
    getItem: (key: string): string | null => {
      if (typeof document === 'undefined') return null

      const cookies = document.cookie.split(';')
      const cookie = cookies.find(c => c.trim().startsWith(`${key}=`))

      if (!cookie) return null

      return cookie.split('=').slice(1).join('=')
    },

    setItem: (key: string, value: string): void => {
      if (typeof document === 'undefined') return

      const rememberMe = getRememberMeFromCookies()

      // Build cookie string with appropriate attributes
      let cookieString = `${key}=${value}; path=/; SameSite=Lax`

      // Add maxAge if remember me is enabled
      if (rememberMe) {
        cookieString += `; max-age=${SESSION_MAX_AGE}`
      }
      // If remember me is disabled, don't add max-age (makes it a session cookie)

      // Add secure flag in production
      if (process.env.NODE_ENV === 'production') {
        cookieString += '; Secure'
      }

      document.cookie = cookieString
    },

    removeItem: (key: string): void => {
      if (typeof document === 'undefined') return

      // Expire the cookie immediately
      document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`

      // Also try with domain to ensure removal
      const domain = window.location.hostname
      document.cookie = `${key}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC`
    }
  }
}

/**
 * Check if we should use custom storage based on context
 */
export function shouldUseCustomStorage(): boolean {
  // Only use custom storage on client-side
  return typeof window !== 'undefined'
}
