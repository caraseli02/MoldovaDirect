/**
 * API endpoint to get email retry statistics
 * Requirements: 4.2, 4.3
 */

import { requireAdminRole } from '~/server/utils/adminAuth'
import { serverSupabaseServiceRole } from '#supabase/server'
import { getRetryStatistics } from '~/server/utils/emailRetryService'

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)

    const supabase = serverSupabaseServiceRole(event)
    const query = getQuery(event)
    const dateFrom = query.dateFrom as string | undefined
    const dateTo = query.dateTo as string | undefined

    const stats = await getRetryStatistics(dateFrom, dateTo, supabase)

    return {
      success: true,
      data: stats,
    }
  }
  catch (error: unknown) {
    console.error('❌ Error getting retry statistics:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get retry statistics',
      data: {
        error: error.message,
      },
    })
  }
})
