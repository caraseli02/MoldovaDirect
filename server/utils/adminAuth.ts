/**
 * Admin Authorization Utilities
 *
 * Provides centralized admin authorization and environment checks
 * for admin-only endpoints and operations
 */

import type { H3Event } from 'h3'
import { getCookie, getHeader, getRequestIP } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

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
  const path = event.path || 'unknown'
  const method = event.method || 'unknown'

  // Check for Authorization header (Bearer token) first
  // Access directly from Node.js request headers for reliability
  const nodeHeaders = event.node.req.headers
  const authHeader = nodeHeaders.authorization || nodeHeaders.Authorization ||
                     getHeader(event, 'authorization') || getHeader(event, 'Authorization')

  let currentUser: any = null
  let userError: any = null
  let authMethod = 'unknown'

  if (authHeader?.startsWith('Bearer ')) {
    authMethod = 'bearer'
    // Extract token from Authorization header
    const token = authHeader.substring(7)

    // Use service role client to verify the token
    const supabase = serverSupabaseServiceRole(event)
    const { data, error } = await supabase.auth.getUser(token)

    currentUser = data.user
    userError = error

    if (userError) {
      console.error(`[AdminAuth] Bearer token validation failed for ${method} ${path}:`, {
        error: userError.message,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...'
      })
    }
  } else {
    authMethod = 'cookie'
    // Fall back to cookie-based auth
    const supabaseClient = await serverSupabaseClient(event)
    const { data, error } = await supabaseClient.auth.getUser()

    currentUser = data.user
    userError = error

    if (userError) {
      console.error(`[AdminAuth] Cookie auth failed for ${method} ${path}:`, userError.message)
    }
  }

  // Check if user is authenticated
  if (userError || !currentUser) {
    console.warn(`[AdminAuth] 401 Unauthorized - ${method} ${path} - Auth method: ${authMethod}`)
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Get user profile with role using service role client
  const supabase = serverSupabaseServiceRole(event)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (error || !profile) {
    console.error(`[AdminAuth] Profile lookup failed for user ${currentUser.id}:`, {
      error: error?.message,
      hasProfile: !!profile,
      email: currentUser.email
    })
    throw createError({
      statusCode: 403,
      statusMessage: 'Unable to verify admin privileges'
    })
  }

  if (profile.role !== 'admin') {
    console.warn(`[AdminAuth] 403 Forbidden - User ${currentUser.email} (role: ${profile.role}) attempted to access ${method} ${path}`)
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  // Log successful admin access in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AdminAuth] ✓ Admin access granted - ${method} ${path} - User: ${currentUser.email} - Auth: ${authMethod}`)
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
 * Stores logs in the database for permanent record and compliance
 *
 * @param event - H3Event object (for database access)
 * @param adminId - ID of the admin performing the action
 * @param action - Description of the action
 * @param metadata - Additional metadata about the action
 */
export async function logAdminAction(
  event: H3Event,
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

  // Log to console for development/debugging
  console.log('[ADMIN_AUDIT]', JSON.stringify(logEntry))

  try {
    const supabase = serverSupabaseServiceRole(event)

    // Store in audit_logs table for permanent record
    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: action,
      resource_type: metadata?.resource_type || 'admin_action',
      resource_id: metadata?.resource_id || null,
      old_values: metadata?.old_values || null,
      new_values: metadata?.new_values || null,
      ip_address: getRequestIP(event),
      user_agent: getHeader(event, 'user-agent'),
      created_at: new Date().toISOString()
    })
  } catch (error) {
    // Don't fail the operation if audit logging fails, but log the error
    console.error('[ADMIN_AUDIT] Failed to store audit log:', error)
  }
}
