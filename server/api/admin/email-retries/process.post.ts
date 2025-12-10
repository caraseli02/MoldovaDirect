/**
 * API endpoint to manually trigger email retry processing
 * Requirements: 4.2, 4.3
 */

import { requireAdminRole } from '~/server/utils/adminAuth'
import { processEmailRetries } from '~/server/utils/emailRetryService'

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)

    const result = await processEmailRetries()

    return {
      success: true,
      data: result,
      message: `Processed ${result.processed} emails: ${result.succeeded} succeeded, ${result.failed} failed`,
    }
  }
  catch (error: any) {
    console.error('❌ Error processing email retries:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process email retries',
      data: {
        error: error.message,
      },
    })
  }
})
