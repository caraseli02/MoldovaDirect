/**
 * Admin Authorization Utilities
 *
 * Provides centralized admin authorization and environment checks
 * for admin-only endpoints and operations
 */

import type { H3Event } from 'h3'
import { createError, getHeader, getRequestIP } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

/**
 * Authenticated user data from Supabase
 */
interface AuthUser {
  id: string
  email: string
  role?: string
  app_metadata?: Record<string, any>
  user_metadata?: Record<string, any>
}

/**
 * Authentication error from Supabase
 */
interface AuthError {
  message: string
  code?: string
  status?: number
}

/**
 * Branded type for user IDs to prevent string misuse
 */
type UserId = string & { readonly __brand: 'UserId' }

/**
 * Type guard to validate if an unknown value is a valid AuthUser
 */
function isValidAuthUser(user: any): user is AuthUser {
  return (
    typeof user === 'object'
    && user !== null
    && 'id' in user
    && typeof user.id === 'string'
    && 'email' in user
    && typeof user.email === 'string'
  )
}

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
export function requireNonProductionEnvironment(_event: H3Event) {
  if (isProductionEnvironment()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin testing endpoints are disabled in production for security',
    })
  }
}

/**
 * Verifies that the current user has admin role
 *
 * @param event - H3Event object
 * @returns Promise<UserId> - Returns the admin user ID if authorized
 * @throws Error if user is not authenticated or not an admin
 */
export async function requireAdminRole(event: H3Event): Promise<UserId> {
  const path = event.path || 'unknown'
  const method = event.method || 'unknown'

  // Check for Authorization header (Bearer token) first
  // Access directly from Node.js request headers for reliability
  const nodeHeaders = event.node.req.headers
  const authHeader = nodeHeaders.authorization || nodeHeaders.Authorization
    || getHeader(event, 'authorization') || getHeader(event, 'Authorization')

  let currentUser: AuthUser | null = null
  let userError: AuthError | null = null
  let authMethod = 'unknown'

  const authHeaderStr = typeof authHeader === 'string' ? authHeader : String(authHeader || '')

  if (authHeaderStr.startsWith('Bearer ')) {
    authMethod = 'bearer'
    // Extract token from Authorization header
    const token = authHeaderStr.substring(7)

    // Use service role client to verify the token
    const supabase = serverSupabaseServiceRole(event)
    const { data, error } = await supabase.auth.getUser(token)

    if (data.user && isValidAuthUser(data.user)) {
      currentUser = data.user as AuthUser
    }
    userError = error ? { message: getServerErrorMessage(error), code: error.code } : null

    if (userError) {
      console.error(`[AdminAuth] Bearer token validation failed for ${method} ${path}:`, {
        error: userError.message,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...',
      })
    }
  }
  else {
    authMethod = 'cookie'
    // Fall back to cookie-based auth
    const supabaseClient = await serverSupabaseClient(event)
    const { data, error } = await supabaseClient.auth.getUser()

    if (data.user && isValidAuthUser(data.user)) {
      currentUser = data.user as AuthUser
    }
    userError = error ? { message: getServerErrorMessage(error), code: error.code } : null

    if (userError) {
      console.error(`[AdminAuth] Cookie auth failed for ${method} ${path}:`, userError.message)
    }
  }

  // Check if user is authenticated
  if (userError || !currentUser) {
    console.warn(`[AdminAuth] 401 Unauthorized - ${method} ${path} - Auth method: ${authMethod}`)
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
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
      email: currentUser.email,
    })
    throw createError({
      statusCode: 403,
      statusMessage: 'Unable to verify admin privileges',
    })
  }

  if (profile.role !== 'admin') {
    console.warn(`[AdminAuth] 403 Forbidden - User ${currentUser.email} (role: ${profile.role}) attempted to access ${method} ${path}`)
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  return currentUser.id as UserId
}

/**
 * Combined check for admin role and non-production environment
 * Use this for admin testing endpoints
 *
 * @param event - H3Event object
 * @returns Promise<UserId> - Returns the admin user ID if authorized
 */
export async function requireAdminTestingAccess(event: H3Event): Promise<UserId> {
  // First check environment
  requireNonProductionEnvironment(event)

  // Then check admin role
  return await requireAdminRole(event)
}

/**
 * Audit log result with error tracking
 */
export interface AuditLogResult {
  success: boolean
  errorId?: string
  error?: string
}

/**
 * Fallback audit logging to console when database logging fails
 * This ensures critical admin actions are always logged somewhere
 */
function logAuditToConsole(logEntry: any, errorId: string, dbError?: unknown) {
  console.error('[ADMIN_AUDIT_CRITICAL] Database logging failed - using console fallback', {
    errorId,
    timestamp: logEntry.timestamp,
    adminId: logEntry.adminId,
    action: logEntry.action,
    metadata: logEntry.metadata,
    dbError: dbError instanceof Error ? dbError.message : String(dbError),
  })
}

/**
 * Logs admin actions to an audit trail
 * Stores logs in the database for permanent record and compliance
 *
 * CRITICAL: Audit logging failures are tracked and logged to console as fallback.
 * Returns success status so callers can warn users about potential audit gaps.
 *
 * @param event - H3Event object (for database access)
 * @param adminId - ID of the admin performing the action
 * @param action - Description of the action
 * @param metadata - Additional metadata about the action
 * @returns Promise<AuditLogResult> - Success status and error details if failed
 */
export async function logAdminAction(
  event: H3Event,
  adminId: string,
  action: string,
  metadata?: Record<string, any>,
): Promise<AuditLogResult> {
  const errorId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const logEntry = {
    timestamp: new Date().toISOString(),
    adminId,
    action,
    metadata,
  }

  try {
    const supabase = serverSupabaseServiceRole(event)

    // Store in audit_logs table for permanent record
    const { error: dbError } = await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: action,
      resource_type: metadata?.resource_type || 'admin_action',
      resource_id: metadata?.resource_id || null,
      old_values: metadata?.old_values || null,
      new_values: metadata?.new_values || null,
      ip_address: getRequestIP(event),
      user_agent: getHeader(event, 'user-agent'),
      created_at: new Date().toISOString(),
    })

    if (dbError) {
      // Use fallback logging - this is critical for compliance
      logAuditToConsole(logEntry, errorId, dbError)
      return {
        success: false,
        errorId,
        error: `Failed to store audit log in database: ${dbError.message}`,
      }
    }

    return { success: true }
  }
  catch (error: unknown) {
    // Use fallback logging - this is critical for compliance
    logAuditToConsole(logEntry, errorId, error)
    return {
      success: false,
      errorId,
      error: error instanceof Error ? error.message : 'Unknown audit logging error',
    }
  }
}
