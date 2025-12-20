/**
 * API Endpoint: Get Cart Lock Status
 * GET /api/cart/lock-status?cartId=123
 *
 * Checks if a cart is currently locked and returns lock details.
 */

import { serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'

const querySchema = z.object({
  cartId: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()),
})

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate query parameters
    const query = getQuery(event)
    const validatedQuery = querySchema.parse(query)

    const { cartId } = validatedQuery

    // Get Supabase client
    const supabase = await serverSupabaseClient(event)

    // Call the check_cart_lock_status function
    const { data, error } = await supabase.rpc('check_cart_lock_status', {
      p_cart_id: cartId,
    })

    if (error) {
      console.error('Error checking cart lock status:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to check cart lock status',
        data: { error: error.message },
      })
    }

    // Check if the cart was found
    if (!data.success) {
      throw createError({
        statusCode: 404,
        message: data.error || 'Cart not found',
        data: { code: data.code },
      })
    }

    // Return lock status
    return {
      success: true,
      cartId,
      isLocked: data.is_locked,
      lockedAt: data.locked_at,
      lockedUntil: data.locked_until,
      lockedBySession: data.locked_by_session,
      currentTime: data.current_time,
    }
  }
  catch (err: any) {
    // Handle Zod validation errors
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid query parameters',
        data: { errors: err.errors },
      })
    }

    // Re-throw HTTP errors
    if (err.statusCode) {
      throw err
    }

    // Generic error handler
    console.error('Unexpected error in lock status endpoint:', err)
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred while checking cart lock status',
    })
  }
})
