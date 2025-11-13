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
  if (!user.value) {
    return navigateTo('/auth/login')
  }

  // Check if user has admin role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.value.id)
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
  const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (mfaData?.currentLevel !== 'aal2') {
    return navigateTo('/account/security/mfa')
  }
})
