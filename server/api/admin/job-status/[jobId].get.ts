/**
 * Job Status API
 * GET /api/admin/job-status/:id
 *
 * Returns the status of a background job
 */

import { requireAdminRole } from '~/server/utils/adminAuth'
import { getJob } from '~/server/utils/jobManager'

export default defineEventHandler(async (event) => {
  // Verify admin access
  await requireAdminRole(event)

  const id = getRouterParam(event, 'jobId')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job ID is required',
    })
  }

  const job = getJob(id)

  if (!job) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Job not found or expired',
    })
  }

  return {
    success: true,
    job,
  }
})
