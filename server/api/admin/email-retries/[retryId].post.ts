/**
 * API endpoint to manually retry a specific email
 * Requirements: 4.2
 */

import { requireAdminRole } from '~/server/utils/adminAuth'
import { retryEmailDelivery } from '~/server/utils/orderEmails'

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)

    const emailLogId = parseInt(getRouterParam(event, 'retryId') || '0')

    if (!emailLogId || isNaN(emailLogId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email log ID',
      })
    }

    const result = await retryEmailDelivery(emailLogId)

    if (result.success) {
      return {
        success: true,
        data: {
          emailLogId: result.emailLogId,
          externalId: result.externalId,
        },
        message: 'Email retry successful',
      }
    }
    else {
      return {
        success: false,
        data: {
          emailLogId: result.emailLogId,
          error: result.error,
        },
        message: 'Email retry failed',
      }
    }
  }
  catch (error: any) {
    console.error('❌ Error retrying email:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retry email',
      data: {
        error: error.message,
      },
    })
  }
})
