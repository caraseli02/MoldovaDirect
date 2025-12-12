/**
 * Impersonation Logs API
 * GET /api/admin/impersonation-logs
 *
 * Retrieves impersonation session logs for compliance and audit purposes
 *
 * Query Parameters:
 * - limit: number of records to return (default: 50, max: 500)
 * - offset: pagination offset (default: 0)
 * - adminId: filter by specific admin ID
 * - targetUserId: filter by specific target user ID
 * - status: filter by status ('active' | 'ended' | 'expired' | 'all') (default: 'all')
 * - startDate: filter logs after this date (ISO string)
 * - endDate: filter logs before this date (ISO string)
 *
 * Security:
 * - Only admins can view impersonation logs
 * - Returns detailed session information including reasons and durations
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Verify admin access
  await requireAdminRole(event)

  const supabase = serverSupabaseServiceRole(event)

  // Parse query parameters
  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 50, 500)
  const offset = parseInt(query.offset as string) || 0
  const adminId = query.adminId as string | undefined
  const targetUserId = query.targetUserId as string | undefined
  const status = (query.status as string) || 'all'
  const startDate = query.startDate as string | undefined
  const endDate = query.endDate as string | undefined

  try {
    // Build query
    let logsQuery = supabase
      .from('impersonation_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (adminId) {
      logsQuery = logsQuery.eq('admin_id', adminId)
    }

    if (targetUserId) {
      logsQuery = logsQuery.eq('target_user_id', targetUserId)
    }

    if (status !== 'all') {
      const now = new Date().toISOString()

      switch (status) {
        case 'active':
          // Still active: not ended and not expired
          logsQuery = logsQuery
            .is('ended_at', null)
            .gt('expires_at', now)
          break

        case 'ended':
          // Explicitly ended by admin
          logsQuery = logsQuery.not('ended_at', 'is', null)
          break

        case 'expired':
          // Expired but not explicitly ended
          logsQuery = logsQuery
            .is('ended_at', null)
            .lt('expires_at', now)
          break
      }
    }

    if (startDate) {
      logsQuery = logsQuery.gte('created_at', startDate)
    }

    if (endDate) {
      logsQuery = logsQuery.lte('created_at', endDate)
    }

    // Apply pagination
    logsQuery = logsQuery.range(offset, offset + limit - 1)

    const { data: logs, error, count } = await logsQuery

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to retrieve impersonation logs',
      })
    }

    // Get user details for admins and target users
    const adminIds = [...new Set(logs?.map(log => log.admin_id).filter(Boolean))]
    const targetUserIds = [...new Set(logs?.map(log => log.target_user_id).filter(Boolean))]
    const allUserIds = [...new Set([...adminIds, ...targetUserIds])]

    let userProfiles: unknown = {}

    if (allUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .in('id', allUserIds)

      if (profiles) {
        userProfiles = Object.fromEntries(
          profiles.map(p => [p.id, { name: p.name, email: p.email, role: p.role }]),
        )
      }
    }

    // Calculate session status and enrich logs
    const now = new Date()
    const enrichedLogs = logs?.map((log) => {
      const expiresAt = new Date(log.expires_at)
      const isExpired = expiresAt < now
      const isEnded = !!log.ended_at

      let sessionStatus: 'active' | 'ended' | 'expired'
      if (isEnded) {
        sessionStatus = 'ended'
      }
      else if (isExpired) {
        sessionStatus = 'expired'
      }
      else {
        sessionStatus = 'active'
      }

      // Calculate duration
      const endTime = log.ended_at ? new Date(log.ended_at) : (isExpired ? expiresAt : now)
      const startTime = new Date(log.started_at)
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)

      return {
        ...log,
        status: sessionStatus,
        duration_minutes: durationMinutes,
        admin: userProfiles[log.admin_id] || null,
        target_user: userProfiles[log.target_user_id] || null,
      }
    })

    // Calculate summary statistics
    const summary = {
      total: count || 0,
      active: enrichedLogs?.filter(l => l.status === 'active').length || 0,
      ended: enrichedLogs?.filter(l => l.status === 'ended').length || 0,
      expired: enrichedLogs?.filter(l => l.status === 'expired').length || 0,
    }

    return {
      success: true,
      logs: enrichedLogs || [],
      summary,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0),
      },
      filters: {
        adminId,
        targetUserId,
        status,
        startDate,
        endDate,
      },
    }
  }
  catch (error: any) {
    console.error('Impersonation logs retrieval error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to retrieve impersonation logs',
    })
  }
})
