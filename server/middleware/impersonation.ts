/**
 * Impersonation Middleware
 *
 * Validates impersonation tokens and switches user context for authenticated requests.
 * This middleware checks for the X-Impersonation-Token header and validates the token
 * against the database session to ensure it's still active and not expired.
 *
 * Usage:
 * - Client sends X-Impersonation-Token header with JWT token
 * - Middleware validates token and session
 * - If valid, user context is switched to impersonated user
 * - All subsequent requests are performed as the impersonated user
 *
 * Security:
 * - Token must be valid JWT signed with IMPERSONATION_JWT_SECRET
 * - Session must exist in database and be active
 * - Session must not be expired or ended
 * - IP address and user agent are validated against session
 */

import type { H3Event } from 'h3'
import { validateImpersonationSession } from '~/server/utils/impersonation'

export default defineEventHandler(async (event: H3Event) => {
  // Check for impersonation token in headers
  const impersonationToken = getHeader(event, 'x-impersonation-token')

  if (!impersonationToken) {
    // No impersonation token, continue with normal flow
    return
  }

  try {
    // Validate the impersonation session
    const session = await validateImpersonationSession(event, impersonationToken)

    // Store impersonation context in event for downstream handlers
    event.context.impersonation = {
      isImpersonating: true,
      adminId: session.admin_id,
      targetUserId: session.target_user_id,
      sessionId: session.id,
      reason: session.reason
    }

    // Log impersonation context for debugging
    console.log('[IMPERSONATION]', {
      admin: session.admin_id,
      target: session.target_user_id,
      session: session.id
    })

  } catch (error: any) {
    // Invalid or expired token - log and clear the impersonation context
    console.warn('[IMPERSONATION] Invalid token:', error.statusMessage)

    // Don't throw error, just clear impersonation context
    // This allows the request to continue as the original user
    event.context.impersonation = {
      isImpersonating: false,
      error: error.statusMessage
    }
  }
})
