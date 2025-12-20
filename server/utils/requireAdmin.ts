import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

/**
 * Utility function to verify admin role
 *
 * This function checks if the current user is authenticated and has admin role.
 * It queries the profiles table to get the user's role.
 *
 * @param event - H3Event from the request handler
 * @returns Promise with user and profile data
 * @throws 401 if not authenticated
 * @throws 403 if not admin
 */
export async function requireAdmin(event: H3Event) {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  // Check authentication
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Authentication required',
    })
  }

  // Check admin role from profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify user profile',
      data: error,
    })
  }

  if (profile.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - Admin role required',
    })
  }

  return { user, profile }
}
