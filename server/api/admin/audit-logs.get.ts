/**
 * Admin Audit Logs API
 * GET /api/admin/audit-logs
 *
 * Retrieves audit logs for admin actions
 *
 * Query Parameters:
 * - limit: number of records to return (default: 50, max: 500)
 * - offset: pagination offset (default: 0)
 * - userId: filter by specific user ID
 * - action: filter by specific action type
 * - resourceType: filter by resource type
 * - startDate: filter logs after this date (ISO string)
 * - endDate: filter logs before this date (ISO string)
 *
 * Security:
 * - Only admins can view audit logs
 * - Returns comprehensive audit trail
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
  const userId = query.userId as string | undefined
  const action = query.action as string | undefined
  const resourceType = query.resourceType as string | undefined
  const startDate = query.startDate as string | undefined
  const endDate = query.endDate as string | undefined

  try {
    // Build query
    let auditQuery = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (userId) {
      auditQuery = auditQuery.eq('user_id', userId)
    }

    if (action) {
      auditQuery = auditQuery.eq('action', action)
    }

    if (resourceType) {
      auditQuery = auditQuery.eq('resource_type', resourceType)
    }

    if (startDate) {
      auditQuery = auditQuery.gte('created_at', startDate)
    }

    if (endDate) {
      auditQuery = auditQuery.lte('created_at', endDate)
    }

    // Apply pagination
    auditQuery = auditQuery.range(offset, offset + limit - 1)

    const { data: logs, error, count } = await auditQuery

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to retrieve audit logs',
      })
    }

    // Get user details for the logs
    const userIds = [...new Set(logs?.map(log => log.user_id).filter(Boolean))]
    let userProfiles = {}

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .in('id', userIds)

      if (profiles) {
        userProfiles = Object.fromEntries(
          profiles.map(p => [p.id, { name: p.name, role: p.role }]),
        )
      }
    }

    // Enrich logs with user information
    const enrichedLogs = logs?.map(log => ({
      ...log,
      user: userProfiles[log.user_id] || null,
    }))

    return {
      success: true,
      logs: enrichedLogs || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0),
      },
      filters: {
        userId,
        action,
        resourceType,
        startDate,
        endDate,
      },
    }
  }
  catch (error: any) {
    console.error('Audit logs retrieval error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to retrieve audit logs',
    })
  }
})
