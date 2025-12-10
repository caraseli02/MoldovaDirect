import { z } from 'zod'
import { invalidatePublicCache } from '~/server/utils/publicCache'
import { requireAdminRole, logAdminAction } from '~/server/utils/adminAuth'

// Request validation schema
const InvalidateCacheSchema = z.object({
  scope: z.enum(['products', 'categories', 'search', 'landing', 'all'], {
    required_error: 'scope is required',
    invalid_type_error: 'scope must be a valid cache scope',
  }),
})

/**
 * Admin endpoint to invalidate public cache
 *
 * @endpoint POST /api/admin/cache/invalidate
 * @auth Requires active admin session
 *
 * @param {Object} body - Request body
 * @param {PublicCacheScope} body.scope - Cache scope to invalidate
 *
 * @returns Success response with timestamp
 * @throws {401} Unauthorized - No valid session
 * @throws {403} Forbidden - User is not admin
 * @throws {400} Bad Request - Invalid scope provided
 * @throws {500} Internal Server Error - Cache invalidation failed
 */
export default defineEventHandler(async (event) => {
  try {
    // Verify admin authentication (uses proper auth client)
    const adminId = await requireAdminRole(event)

    // Validate and parse request body
    const body = await readBody(event)
    const validationResult = InvalidateCacheSchema.safeParse(body)

    if (!validationResult.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body',
        data: validationResult.error.format(),
      })
    }

    const { scope } = validationResult.data

    // Log admin action for audit trail
    await logAdminAction(event, adminId, 'cache_invalidation', {
      resource_type: 'cache',
      scope,
      ip_address: getRequestIP(event),
    })

    // Invalidate cache (type-safe now)
    await invalidatePublicCache(scope)

    return {
      success: true,
      message: `Successfully invalidated ${scope} cache`,
      scope,
    }
  }
  catch (error) {
    console.error('[Cache Invalidation Error]', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })

    // Preserve HTTP errors from validation or auth
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to invalidate cache',
    })
  }
})
