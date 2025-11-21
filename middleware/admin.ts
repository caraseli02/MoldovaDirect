/**
 * Admin Authorization Middleware
 *
 * Requirements addressed:
 * - 5.1: Verify admin privileges for dashboard access
 * - 5.2: Redirect unauthorized users
 * - MFA Enforcement: Require Multi-Factor Authentication for admin users
 *
 * This middleware enforces:
 * 1. User must be authenticated
 * 2. User must have admin role
 * 3. Admin users must have MFA enabled (AAL2)
 * 4. If MFA not enabled, redirect to MFA setup page
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Check if user is authenticated
  // Wait for session to load if we're on the client
  let userId: string | undefined
  if (!user.value) {
    // Double-check with getSession to handle hydration timing
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return navigateTo('/auth/login')
    }
    // Use session user if user.value hasn't hydrated yet
    userId = session.user.id
  } else {
    userId = user.value.id
  }

  // Check if user has admin role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single<{ role: string | null }>()

  if (error || !profile) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Verify user has admin role
  if (profile.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required. You do not have permission to access this area.'
    })
  }

  // Check MFA status for additional security (REQUIRED for admin users)
  // Skip MFA in development for test accounts (@moldovadirect.com emails)
  const isDev = process.env.NODE_ENV === 'development'
  const { data: { session } } = await supabase.auth.getSession()
  const userEmail = user.value?.email || session?.user?.email
  const isTestAccount = userEmail?.includes('@moldovadirect.com')
  const shouldSkipMFA = isDev && isTestAccount

  if (!shouldSkipMFA) {
    const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    if (mfaError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify MFA status. Please try again.'
      })
    }

    if (mfaData?.currentLevel !== 'aal2') {
      return navigateTo('/account/security/mfa')
    }
  }
})
