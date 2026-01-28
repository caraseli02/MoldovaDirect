/**
 * Admin Authorization Utilities
 *
 * Provides centralized admin authorization and environment checks
 * for admin-only endpoints and operations.
 *
 * @module server/utils/adminAuth
 *
 * @remarks
 * This module uses Nuxt's auto-import for `getServerErrorMessage` from `errorUtils.ts`.
 * All authentication supports both Bearer token (client-side) and cookie-based (SSR) auth.
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
 * Supports both Bearer token authentication (for client-side requests)
 * and cookie-based authentication (for SSR requests).
 *
 * @param event - H3Event object from the request handler
 * @returns Promise<UserId> - Returns the admin user ID (branded type) if authorized
 * @throws {H3Error} 401 if user is not authenticated (missing or invalid token/cookie)
 * @throws {H3Error} 403 if user profile cannot be retrieved or user is not an admin
 *
 * @example
 * ```typescript
 * export default defineEventHandler(async (event) => {
 *   const adminId = await requireAdminRole(event)
 *   // adminId is now guaranteed to be a valid admin user ID
 *   return { adminId, data: await fetchAdminData() }
 * })
 * ```
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
 * Use this for admin testing endpoints that should never be accessible in production.
 *
 * @param event - H3Event object from the request handler
 * @returns Promise<UserId> - Returns the admin user ID (branded type) if authorized
 * @throws {H3Error} 403 if running in production environment
 * @throws {H3Error} 401 if user is not authenticated
 * @throws {H3Error} 403 if user is not an admin
 *
 * @example
 * ```typescript
 * // Endpoint that resets test data - dangerous in production!
 * export default defineEventHandler(async (event) => {
 *   const adminId = await requireAdminTestingAccess(event)
 *   await resetTestDatabase()
 *   return { success: true, resetBy: adminId }
 * })
 * ```
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
 * Stores logs in the database for permanent record and compliance.
 *
 * CRITICAL: Audit logging failures are tracked and logged to console as fallback.
 * Returns success status so callers can warn users about potential audit gaps.
 *
 * @param event - H3Event object (used for database access and request metadata)
 * @param adminId - ID of the admin performing the action
 * @param action - Human-readable description of the action (e.g., "deleted_user", "updated_order")
 * @param metadata - Additional context about the action
 * @param metadata.resource_type - Type of resource affected (e.g., "user", "order", "product")
 * @param metadata.resource_id - ID of the affected resource
 * @param metadata.old_values - Previous values before the change (for updates/deletes)
 * @param metadata.new_values - New values after the change (for creates/updates)
 * @returns Promise<AuditLogResult> - Success status and error details if failed
 *
 * @example
 * ```typescript
 * // Log a user deletion
 * const result = await logAdminAction(event, adminId, 'deleted_user', {
 *   resource_type: 'user',
 *   resource_id: userId,
 *   old_values: { email: user.email, role: user.role }
 * })
 *
 * if (!result.success) {
 *   console.warn(`Audit log failed (${result.errorId}): ${result.error}`)
 * }
 * ```
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
