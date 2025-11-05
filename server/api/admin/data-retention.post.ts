/**
 * GDPR Data Retention Cleanup Endpoint
 * POST /api/admin/data-retention
 *
 * This endpoint manages GDPR-compliant data retention policies for PII.
 * It can be safely used in production environments.
 *
 * Actions:
 * - 'cleanup-all': Run all retention cleanups based on configured policies
 * - 'cleanup-email-logs': Clean up old email logs
 * - 'cleanup-activity-logs': Clean up old user activity logs
 * - 'cleanup-audit-logs': Clean up old audit logs
 * - 'cleanup-impersonation-logs': Clean up old impersonation logs
 * - 'get-status': Get current retention policy status
 *
 * GitHub Issue: #90
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole, logAdminAction } from '~/server/utils/adminAuth'

interface DataRetentionRequest {
  action: 'cleanup-all' | 'cleanup-email-logs' | 'cleanup-activity-logs' |
          'cleanup-audit-logs' | 'cleanup-impersonation-logs' | 'get-status'
  confirm?: boolean
  dryRun?: boolean // Preview what would be deleted without actually deleting
}

interface CleanupResult {
  table_name: string
  retention_days: number
  records_deleted: number
  oldest_deleted: string | null
  execution_time_ms: number
}

export default defineEventHandler(async (event) => {
  // Verify admin access (works in production)
  const adminId = await requireAdminRole(event)

  const supabase = serverSupabaseServiceRole(event)
  const body = await readBody(event).catch(() => ({})) as DataRetentionRequest

  // Handle status request (doesn't need confirmation)
  if (body.action === 'get-status') {
    try {
      const { data, error } = await supabase
        .rpc('get_retention_policy_status')

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Retrieved retention policy status',
        status: data,
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      console.error('Failed to get retention status:', error)
      return {
        success: false,
        message: 'Failed to retrieve retention policy status',
        error: error.message
      }
    }
  }

  // Safety check for cleanup operations
  if (!body.confirm && !body.dryRun) {
    return {
      success: false,
      message: 'Confirmation required. Set confirm: true to proceed, or dryRun: true to preview.',
      warning: 'This operation will permanently delete old PII data according to retention policies!'
    }
  }

  const action = body.action
  const results = {
    action,
    timestamp: new Date().toISOString(),
    dryRun: body.dryRun || false,
    deletedCounts: {} as Record<string, number>,
    details: [] as CleanupResult[],
    errors: [] as string[]
  }

  try {
    switch (action) {
      case 'cleanup-all':
        await cleanupAllPiiData(supabase, results, body.dryRun)
        break

      case 'cleanup-email-logs':
        await cleanupSpecificTable(supabase, results, 'email_logs', body.dryRun)
        break

      case 'cleanup-activity-logs':
        await cleanupSpecificTable(supabase, results, 'user_activity_logs', body.dryRun)
        break

      case 'cleanup-audit-logs':
        await cleanupSpecificTable(supabase, results, 'audit_logs', body.dryRun)
        break

      case 'cleanup-impersonation-logs':
        await cleanupSpecificTable(supabase, results, 'impersonation_logs', body.dryRun)
        break

      default:
        return {
          success: false,
          message: 'Invalid action specified',
          validActions: [
            'cleanup-all',
            'cleanup-email-logs',
            'cleanup-activity-logs',
            'cleanup-audit-logs',
            'cleanup-impersonation-logs',
            'get-status'
          ]
        }
    }

    // Log admin action (only if not a dry run)
    if (!body.dryRun) {
      await logAdminAction(event, adminId, 'data_retention_cleanup', {
        action,
        deletedCounts: results.deletedCounts,
        details: results.details
      })
    }

    return {
      success: true,
      message: body.dryRun
        ? `Dry run completed for ${action} - no data was deleted`
        : `Successfully completed ${action}`,
      results
    }

  } catch (error: any) {
    console.error('Data retention cleanup error:', error)

    // Log failed attempt
    await logAdminAction(event, adminId, 'data_retention_cleanup_failed', {
      action,
      error: error.message
    })

    return {
      success: false,
      message: 'Data retention cleanup failed',
      error: error.message,
      results
    }
  }
})

/**
 * Run all data retention cleanups based on configured policies
 */
async function cleanupAllPiiData(supabase: any, results: any, dryRun?: boolean) {
  try {
    if (dryRun) {
      // For dry run, get status to show what would be deleted
      const { data: status, error } = await supabase
        .rpc('get_retention_policy_status')

      if (error) throw error

      for (const policy of status) {
        results.deletedCounts[policy.table_name] = policy.records_to_delete
        results.details.push({
          table_name: policy.table_name,
          retention_days: policy.retention_days,
          records_deleted: policy.records_to_delete,
          oldest_deleted: policy.oldest_record,
          execution_time_ms: 0
        })
      }
    } else {
      // Actually perform cleanup
      const { data, error } = await supabase
        .rpc('cleanup_all_pii_data')

      if (error) throw error

      for (const result of data) {
        results.deletedCounts[result.table_name] = result.records_deleted
        results.details.push(result)
      }
    }
  } catch (error: any) {
    results.errors.push(`Error in cleanup_all_pii_data: ${error.message}`)
  }
}

/**
 * Clean up a specific table
 */
async function cleanupSpecificTable(
  supabase: any,
  results: any,
  tableName: string,
  dryRun?: boolean
) {
  try {
    // Get retention policy for this table
    const { data: policy, error: policyError } = await supabase
      .from('data_retention_policies')
      .select('retention_days')
      .eq('table_name', tableName)
      .eq('is_active', true)
      .single()

    if (policyError) {
      throw new Error(`No active retention policy found for ${tableName}`)
    }

    if (dryRun) {
      // For dry run, get status to show what would be deleted
      const { data: status, error } = await supabase
        .rpc('get_retention_policy_status')

      if (error) throw error

      const tableStatus = status.find((s: any) => s.table_name === tableName)
      if (tableStatus) {
        results.deletedCounts[tableName] = tableStatus.records_to_delete
        results.details.push({
          table_name: tableName,
          retention_days: policy.retention_days,
          records_deleted: tableStatus.records_to_delete,
          oldest_deleted: tableStatus.oldest_record,
          execution_time_ms: 0
        })
      }
    } else {
      // Actually perform cleanup based on table name
      let functionName = ''
      switch (tableName) {
        case 'email_logs':
          functionName = 'cleanup_old_email_logs'
          break
        case 'user_activity_logs':
          functionName = 'cleanup_old_user_activity_logs'
          break
        case 'audit_logs':
          functionName = 'cleanup_old_audit_logs'
          break
        case 'impersonation_logs':
          functionName = 'cleanup_old_impersonation_logs'
          break
        default:
          throw new Error(`Unknown table: ${tableName}`)
      }

      const startTime = Date.now()
      const { data, error } = await supabase.rpc(functionName, {
        retention_days: policy.retention_days
      })

      if (error) throw error

      const executionTime = Date.now() - startTime

      // Extract result (function returns a single row with deleted_count and oldest_deleted_date)
      const result = Array.isArray(data) ? data[0] : data
      const deletedCount = result?.deleted_count || 0
      const oldestDeleted = result?.oldest_deleted_date || null

      results.deletedCounts[tableName] = deletedCount
      results.details.push({
        table_name: tableName,
        retention_days: policy.retention_days,
        records_deleted: deletedCount,
        oldest_deleted: oldestDeleted,
        execution_time_ms: executionTime
      })
    }
  } catch (error: any) {
    results.errors.push(`Error cleaning ${tableName}: ${error.message}`)
  }
}
