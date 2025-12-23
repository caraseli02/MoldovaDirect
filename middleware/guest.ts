/**
 * Guest middleware for redirecting authenticated users away from auth pages
 *
 * Requirements addressed:
 * - 5.1: Session persistence across browser tabs
 * - 5.3: Reactive authentication status
 * - 10.2: Preserve redirect query parameters for seamless navigation
 * - 10.3: Handle edge cases for partially authenticated users
 */

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const localePath = useLocalePath()

  // If user is authenticated and email is verified, redirect away from auth pages
  if (user.value && user.value.email_confirmed_at) {
    // Check if there's a redirect parameter to honor post-login navigation
    const redirect = to.query.redirect as string

    // Security: Only allow internal redirects (single leading slash, not protocol-relative)
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
      // Redirect to the originally intended page
      return navigateTo(redirect)
    }

    // Default redirect to account page for authenticated users
    return navigateTo(localePath('/account'))
  }

  // If user is authenticated but email is not verified, allow access to verification pages
  if (user.value && !user.value.email_confirmed_at) {
    const allowedPaths = [
      localePath('/auth/verify-email'),
      localePath('/auth/logout'),
    ]

    // Only allow access to verification-related pages
    if (!allowedPaths.includes(to.path)) {
      return navigateTo({
        path: localePath('/auth/verify-email'),
        query: {
          message: 'email-verification-required',
          email: user.value.email,
        },
      })
    }
  }
})
