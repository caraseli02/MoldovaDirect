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
 * @returns User object if authenticated
 * @throws 401 error if not authenticated
 * 
 * TODO: Add proper role-based access control
 * Currently checks if user is authenticated. In production, should verify admin role.
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

  // TODO: Add role verification
  // Example:
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('role')
  //   .eq('id', user.id)
  //   .single()
  // 
  // if (profile?.role !== 'admin') {
  //   throw createError({
  //     statusCode: 403,
  //     statusMessage: 'Forbidden - Admin role required'
  //   })
  // }

  return user
}
