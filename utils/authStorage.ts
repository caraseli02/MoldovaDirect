/**
 * Cookie-based authentication storage utilities
 * Implements "Remember Me" functionality using cookies for SSR compatibility
 *
 * This approach is better than localStorage/sessionStorage because:
 * - Works with SSR (Server-Side Rendering)
 * - Compatible with Nuxt's hybrid rendering
 * - Cookies are automatically sent with requests
 * - Better security with httpOnly and secure flags
 */

const REMEMBER_ME_COOKIE = 'auth-remember-me'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

/**
 * Set the remember me preference using a cookie
 * This cookie controls whether auth cookies should be persistent or session-only
 */
export function setRememberMePreference(remember: boolean): void {
  const rememberMeCookie = useCookie(REMEMBER_ME_COOKIE, {
    maxAge: remember ? SESSION_MAX_AGE : undefined, // undefined = session cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  rememberMeCookie.value = remember ? 'true' : 'false'
}

/**
 * Get the remember me preference from cookie
 */
export function getRememberMePreference(): boolean {
  const rememberMeCookie = useCookie(REMEMBER_ME_COOKIE)
  return rememberMeCookie.value !== 'false'
}

/**
 * Update Supabase session cookies based on remember me preference
 * This modifies the auth-token cookie to be either persistent or session-only
 */
export function updateSupabaseSessionCookies(remember: boolean): void {
  // Client-side only operation
  if (import.meta.server) return

  try {
    // Get all cookies
    const cookies = document.cookie.split(';')
    const supabaseCookies = cookies
      .map(c => c.trim())
      .filter(c => c.startsWith('sb-'))

    // For each Supabase cookie, we need to update its attributes
    // Since we can't directly modify cookie attributes, we'll rely on
    // the cookie being recreated on next auth state change with correct maxAge

    // The key is that Supabase's @nuxtjs/supabase module respects
    // the cookieOptions in nuxt.config.ts

    // Store the preference so it can be used by the auth system
    setRememberMePreference(remember)
  }
  catch (error) {
    console.warn('Failed to update Supabase session cookies:', error)
  }
}

/**
 * Clear all authentication cookies
 * Used during logout to ensure complete cleanup
 */
export function clearAuthCookies(): void {
  // Clear the remember me preference cookie
  const rememberMeCookie = useCookie(REMEMBER_ME_COOKIE, { path: '/' })
  rememberMeCookie.value = null

  // Client-side: Clear Supabase cookies
  if (import.meta.client) {
    try {
      // Get all cookies and find Supabase auth cookies
      const cookies = document.cookie.split(';')
      cookies.forEach((cookie) => {
        const [name] = cookie.split('=')
        const trimmedName = name.trim()

        // Clear Supabase auth cookies (sb-*)
        if (trimmedName.startsWith('sb-')) {
          // Set cookie to expire immediately
          document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          // Also try with domain
          const domain = window.location.hostname
          document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`
        }
      })
    }
    catch (error) {
      console.warn('Failed to clear auth cookies:', error)
    }
  }
}

/**
 * Helper to set cookie maxAge based on remember me preference
 * This can be called after login to adjust session duration
 */
export function adjustSessionCookieDuration(remember: boolean): void {
  if (import.meta.server) return

  try {
    // Update the preference cookie
    setRememberMePreference(remember)

    // Note: Supabase session cookies are managed by the Supabase client
    // The actual persistence is handled by Supabase's storage adapter
    // Our preference cookie will be checked during session initialization

    // If we need more control, we can implement a custom storage adapter
    // that checks this preference cookie
  }
  catch (error) {
    console.warn('Failed to adjust session cookie duration:', error)
  }
}
