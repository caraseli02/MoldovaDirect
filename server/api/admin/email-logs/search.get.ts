/**
 * Search email logs with filters
 * Requirements: 4.5, 4.6
 */

import { requireAdminRole } from '~/server/utils/adminAuth'
import { getEmailLogs } from '~/server/utils/emailLogging'
import type { EmailLogFilters } from '~/types/email'

export default defineEventHandler(async (event) => {
  await requireAdminRole(event)
  const query = getQuery(event)

  const filters: EmailLogFilters = {
    orderNumber: query.orderNumber as string | undefined,
    recipientEmail: query.recipientEmail as string | undefined,
    emailType: query.emailType as unknown,
    status: query.status as unknown,
    dateFrom: query.dateFrom as string | undefined,
    dateTo: query.dateTo as string | undefined,
    page: query.page ? parseInt(query.page as string) : 1,
    limit: query.limit ? parseInt(query.limit as string) : 20,
  }

  const result = await getEmailLogs(filters)

  return result
})
