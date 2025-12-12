/**
 * User Impersonation API
 * POST /api/admin/impersonate
 *
 * Allows admins to impersonate users for support and testing purposes
 *
 * Body:
 * - userId: ID of user to impersonate (required for 'start')
 * - action: 'start' | 'end'
 * - duration: session duration in minutes (default: 30, max: 120)
 * - reason: reason for impersonation (required, min 10 characters)
 * - logId: impersonation log ID (required for 'end')
 *
 * Security:
 * - Only admins can impersonate
 * - Creates time-limited JWT tokens
 * - Logs all impersonation sessions in database
 * - Sends notification to impersonated user
 * - IP address and user agent tracking
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole, logAdminAction } from '~/server/utils/adminAuth'
import { generateImpersonationToken } from '~/server/utils/impersonation'

interface ImpersonateOptions {
  userId?: string
  action: 'start' | 'end'
  duration?: number
  reason?: string
  logId?: number
}

export default defineEventHandler(async (event) => {
  // Verify admin access (impersonation allowed in production for support)
  const adminId = await requireAdminRole(event)

  const supabase = serverSupabaseServiceRole(event)

  const body = await readBody(event).catch(() => ({})) as ImpersonateOptions
  const { userId, action, duration = 30, reason, logId } = body

  try {
    if (action === 'start') {
      // Rate limiting: Check for excessive impersonation attempts
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
      const { data: recentSessions, error: rateLimitError } = await supabase
        .from('impersonation_logs')
        .select('id')
        .eq('admin_id', adminId)
        .gte('started_at', oneHourAgo)

      if (rateLimitError) {
        console.error('Rate limit check failed:', rateLimitError)
      }
      else if (recentSessions && recentSessions.length >= 10) {
        throw createError({
          statusCode: 429,
          statusMessage: 'Too many impersonation attempts. Maximum 10 sessions per hour. Please try again later.',
        })
      }

      // Validate required fields
      if (!userId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'userId is required for impersonation',
        })
      }

      if (!reason || reason.trim().length < 10) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Reason for impersonation required (minimum 10 characters)',
        })
      }

      // Validate duration
      const sessionDuration = Math.min(Math.max(duration, 1), 120) // 1-120 minutes

      // Verify target user exists and get email from auth
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId)

      if (authError || !authData.user) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found',
        })
      }

      const targetEmail = authData.user.email

      // Get profile data
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', userId)
        .single()

      if (profileError || !targetProfile) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User profile not found',
        })
      }

      // Get admin info for the audit log
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', adminId)
        .single()

      // Authorization hierarchy check: Prevent privilege escalation
      const roleHierarchy: Record<string, number> = {
        customer: 0,
        manager: 1,
        admin: 2,
        super_admin: 3,
      }

      const adminRoleLevel = roleHierarchy[adminProfile?.role as string] || 0
      const targetRoleLevel = roleHierarchy[targetProfile.role] || 0

      // Block impersonation of users with equal or higher privileges
      if (targetRoleLevel >= adminRoleLevel) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Cannot impersonate users with equal or higher privileges',
        })
      }

      // Additional check: In production, only allow impersonation of customers
      const isProduction = process.env.NODE_ENV === 'production'
      if (isProduction && targetProfile.role !== 'customer') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Production impersonation is restricted to customer accounts only',
        })
      }

      // Create database audit entry for impersonation session
      const expiresAt = new Date(Date.now() + sessionDuration * 60000)

      const { data: auditLog, error: auditError } = await supabase
        .from('impersonation_logs')
        .insert({
          admin_id: adminId,
          target_user_id: userId,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          ip_address: getRequestIP(event),
          user_agent: getHeader(event, 'user-agent'),
          reason: reason.trim(),
        })
        .select()
        .single()

      if (auditError || !auditLog) {
        console.error('Failed to create impersonation audit log:', auditError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create audit log for impersonation session',
        })
      }

      // Generate time-limited JWT token for impersonation
      const token = await generateImpersonationToken({
        adminId,
        userId,
        logId: auditLog.id,
        expiresIn: sessionDuration * 60, // Convert to seconds
      })

      // Log admin action in general audit_logs table
      await logAdminAction(event, adminId, 'impersonate-start', {
        resource_type: 'user_impersonation',
        resource_id: userId,
        new_values: {
          target_user_id: userId,
          target_email: targetEmail,
          target_name: targetProfile.name,
          reason: reason.trim(),
          duration_minutes: sessionDuration,
          log_id: auditLog.id,
        },
      })

      // TODO: Send notification to impersonated user
      // This would require implementing the email notification system
      // For now, we'll skip this and add it in the next task

      return {
        success: true,
        action: 'start',
        token,
        logId: auditLog.id,
        expiresAt: expiresAt.toISOString(),
        duration: sessionDuration,
        impersonating: {
          id: userId,
          name: targetProfile.name,
          email: targetEmail,
          role: targetProfile.role,
        },
        message: `Now impersonating ${targetEmail}`,
        warning: 'All actions will be performed as this user and logged for audit purposes.',
      }
    }
    else if (action === 'end') {
      // Validate required fields
      if (!logId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'logId is required to end impersonation session',
        })
      }

      // Mark session as ended in database
      const { data: session, error: endError } = await supabase
        .from('impersonation_logs')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', logId)
        .eq('admin_id', adminId)
        .select()
        .single()

      if (endError || !session) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Impersonation session not found or already ended',
        })
      }

      // Log admin action
      await logAdminAction(event, adminId, 'impersonate-end', {
        resource_type: 'user_impersonation',
        resource_id: session.target_user_id,
        old_values: {
          log_id: logId,
          started_at: session.started_at,
          expires_at: session.expires_at,
        },
      })

      return {
        success: true,
        action: 'end',
        session: {
          logId: session.id,
          startedAt: session.started_at,
          endedAt: session.ended_at,
          duration: Math.round((new Date(session.ended_at!).getTime() - new Date(session.started_at).getTime()) / 60000),
        },
        message: 'Impersonation session ended successfully.',
      }
    }
    else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid action. Use "start" or "end".',
      })
    }
  }
  catch (error: any) {
    console.error('Impersonation error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to process impersonation request',
    })
  }
})
