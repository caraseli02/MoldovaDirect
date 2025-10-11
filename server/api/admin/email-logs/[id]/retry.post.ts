/**
 * Retry failed email delivery
 * Requirements: 4.2
 */

import { retryEmailDelivery } from '~/server/utils/orderEmails'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '0')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email log ID is required'
    })
  }

  const result = await retryEmailDelivery(id)

  return result
})
