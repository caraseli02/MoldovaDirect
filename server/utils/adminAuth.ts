/**
 * Admin Authentication Utilities
 * 
 * Provides helper functions for verifying admin access in API endpoints
 */

import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Verify that the request is from an authenticated admin user
 *
 * @param event - H3 event object
 * @returns User object if authenticated and has admin role
 * @throws 401 error if not authenticated
 * @throws 403 error if authenticated but not admin
 */
export async function requireAdminAuth(event: H3Event) {
  const supabase = await serverSupabaseClient(event)
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Admin access required'
    })
  }

  // Verify admin role in profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error verifying user permissions'
    })
  }

  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - Admin or manager role required'
    })
  }

  return user
}
