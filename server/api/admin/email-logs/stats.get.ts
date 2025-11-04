/**
 * Get email delivery statistics
 * Requirements: 4.4
 */

import { requireAdminRole } from '~/server/utils/adminAuth'
import { getEmailDeliveryStats } from '~/server/utils/emailLogging'

export default defineEventHandler(async (event) => {
  await requireAdminRole(event)
  const query = getQuery(event)
  const dateFrom = query.dateFrom as string | undefined
  const dateTo = query.dateTo as string | undefined

  const stats = await getEmailDeliveryStats(dateFrom, dateTo)

  return stats
})
