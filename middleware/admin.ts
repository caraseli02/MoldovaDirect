/**
 * Admin Authorization Middleware
 *
 * Requirements addressed:
 * - 5.1: Verify admin privileges for dashboard access
 * - 5.2: Redirect unauthorized users
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
    .single()

  if (error || !profile) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unable to verify admin privileges'
    })
  }

  if (profile.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }
})