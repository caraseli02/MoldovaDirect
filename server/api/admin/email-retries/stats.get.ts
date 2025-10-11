/**
 * API endpoint to get email retry statistics
 * Requirements: 4.2, 4.3
 */

import { getRetryStatistics } from '~/server/utils/emailRetryService'

export default defineEventHandler(async (event) => {
  try {
    // TODO: Add admin authentication check
    // const user = await requireAdmin(event)
    
    const query = getQuery(event)
    const dateFrom = query.dateFrom as string | undefined
    const dateTo = query.dateTo as string | undefined
    
    const stats = await getRetryStatistics(dateFrom, dateTo)
    
    return {
      success: true,
      data: stats
    }
  } catch (error: any) {
    console.error('❌ Error getting retry statistics:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get retry statistics',
      data: {
        error: error.message
      }
    })
  }
})
