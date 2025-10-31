/**
 * Admin Authorization Utilities
 *
 * Provides centralized admin authorization and environment checks
 * for admin-only endpoints and operations
 */

import type { H3Event } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

/**
 * Checks if the application is running in a production environment
 */
export function isProductionEnvironment(): boolean {
  const env = process.env.NODE_ENV
  const vercelEnv = process.env.VERCEL_ENV

  // Check for production indicators
  return env === 'production' || vercelEnv === 'production'
}

/**
 * Verifies that admin testing endpoints are not used in production
 * Throws an error if in production environment
 */
export function requireNonProductionEnvironment(event: H3Event) {
  if (isProductionEnvironment()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin testing endpoints are disabled in production for security'
    })
  }
}

/**
 * Verifies that the current user has admin role
 *
 * @param event - H3Event object
 * @returns Promise<string> - Returns the admin user ID if authorized
 * @throws Error if user is not authenticated or not an admin
 */
export async function requireAdminRole(event: H3Event): Promise<string> {
  const currentUser = await serverSupabaseUser(event)

  // Check if user is authenticated
  if (!currentUser) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Get user profile with role
  const supabase = serverSupabaseServiceRole(event)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
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

  return currentUser.id
}

/**
 * Combined check for admin role and non-production environment
 * Use this for admin testing endpoints
 *
 * @param event - H3Event object
 * @returns Promise<string> - Returns the admin user ID if authorized
 */
export async function requireAdminTestingAccess(event: H3Event): Promise<string> {
  // First check environment
  requireNonProductionEnvironment(event)

  // Then check admin role
  return await requireAdminRole(event)
}

/**
 * Logs admin actions to an audit trail
 * For now logs to console, but should be enhanced to log to database
 *
 * @param adminId - ID of the admin performing the action
 * @param action - Description of the action
 * @param metadata - Additional metadata about the action
 */
export function logAdminAction(
  adminId: string,
  action: string,
  metadata?: Record<string, any>
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    adminId,
    action,
    metadata
  }

  // Log to console (should be enhanced to log to database audit table)
  console.log('[ADMIN_AUDIT]', JSON.stringify(logEntry))

  // TODO: Store in audit_logs table for permanent record
  // await supabase.from('audit_logs').insert(logEntry)
}
