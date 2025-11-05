/**
 * GDPR Data Retention Status Endpoint
 * GET /api/admin/data-retention
 *
 * Returns the current status of all data retention policies,
 * including how many records are pending deletion.
 *
 * This is useful for monitoring and compliance reporting.
 *
 * GitHub Issue: #90
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Verify admin access
  await requireAdminRole(event)

  const supabase = serverSupabaseServiceRole(event)

  try {
    // Get retention policy status
    const { data, error } = await supabase
      .rpc('get_retention_policy_status')

    if (error) {
      throw error
    }

    // Calculate summary statistics
    const summary = {
      total_tables: data.length,
      total_records: data.reduce((sum: number, p: any) => sum + (p.total_records || 0), 0),
      total_to_delete: data.reduce((sum: number, p: any) => sum + (p.records_to_delete || 0), 0),
      active_policies: data.filter((p: any) => p.is_active).length
    }

    return {
      success: true,
      message: 'Retrieved data retention policy status',
      timestamp: new Date().toISOString(),
      summary,
      policies: data
    }

  } catch (error: any) {
    console.error('Failed to get retention policy status:', error)

    return {
      success: false,
      message: 'Failed to retrieve data retention policy status',
      error: error.message
    }
  }
})
