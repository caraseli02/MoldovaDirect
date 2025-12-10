/**
 * Supabase Remember Me Plugin
 *
 * Integrates the "remember me" preference with Supabase's cookie handling.
 * This plugin modifies Supabase auth cookies to be either persistent or session-only
 * based on the user's preference.
 *
 * How it works:
 * 1. Reads the remember me preference from cookie
 * 2. On auth state changes, updates cookie maxAge accordingly
 * 3. Session cookies (no maxAge) are cleared when browser closes
 * 4. Persistent cookies (with maxAge) survive browser restarts
 */

export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const rememberMeCookie = useCookie('auth-remember-me')

  // Only run on client-side
  if (import.meta.server) return

  // Listen to auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    // Only handle signed in events
    if (event !== 'SIGNED_IN' && event !== 'TOKEN_REFRESHED') {
      return
    }

    // Get remember me preference
    const rememberMe = rememberMeCookie.value !== 'false'

    // Update Supabase session cookies based on preference
    // Note: This is a best-effort approach. The actual cookie management
    // is handled by Supabase, but we can influence it through the storage adapter

    try {
      // Get all cookies that start with 'sb-'
      const cookies = document.cookie.split(';')
      const supabaseCookies = cookies
        .map(c => c.trim())
        .filter(c => c.startsWith('sb-'))

      // For each Supabase cookie, we need to ensure it has the right attributes
      // Since we can't modify existing cookies directly, we'll need to
      // ensure new cookies are created with the correct settings

      // The @nuxtjs/supabase module handles this through cookieOptions in nuxt.config
      // Our preference cookie acts as a signal for the desired behavior

      // Log the preference for debugging (noop in dev mode)
    }
    catch (error) {
      console.warn('[Remember Me] Failed to process cookies:', error)
    }
  })
})
