/**
 * API Endpoint: Lock Cart
 * POST /api/cart/lock
 *
 * Locks a cart for a specific checkout session, preventing modifications
 * until the lock expires or is explicitly released.
 */

import { serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'

const lockCartSchema = z.object({
  cartId: z.number().int().positive(),
  checkoutSessionId: z.string().min(1),
  lockDurationMinutes: z.number().int().min(1).max(60).default(30),
})

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = lockCartSchema.parse(body)

    const { cartId, checkoutSessionId, lockDurationMinutes } = validatedData

    // Get Supabase client
    const supabase = await serverSupabaseClient(event)

    // Call the lock_cart function
    const { data, error } = await supabase.rpc('lock_cart', {
      p_cart_id: cartId,
      p_checkout_session_id: checkoutSessionId,
      p_lock_duration_minutes: lockDurationMinutes,
    })

    if (error) {
      console.error('Error locking cart:', getServerErrorMessage(error))
      throw createError({
        statusCode: 500,
        message: 'Failed to lock cart',
        data: { error: error.message },
      })
    }

    // Check if the lock was successful
    if (!data.success) {
      const statusCode = data.code === 'CART_NOT_FOUND'
        ? 404
        : data.code === 'CART_ALREADY_LOCKED' ? 409 : 400

      throw createError({
        statusCode,
        message: data.error || 'Failed to lock cart',
        data: {
          code: data.code,
          lockedUntil: data.locked_until,
          lockedBySession: data.locked_by_session,
        },
      })
    }

    // Return success response
    return {
      success: true,
      locked: true,
      lockedAt: data.locked_at,
      lockedUntil: data.locked_until,
      checkoutSessionId: data.checkout_session_id,
      message: 'Cart locked successfully',
    }
  }
  catch (err: unknown) {
    // Handle Zod validation errors
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError' && 'errors' in err) {
      throw createError({
        statusCode: 400,
        message: 'Invalid request data',
        data: { errors: (err as { errors: unknown }).errors },
      })
    }

    // Re-throw HTTP errors
    if (isH3Error(err)) {
      throw err
    }

    // Generic error handler
    console.error('Unexpected error in lock cart endpoint:', getServerErrorMessage(err))
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred while locking the cart',
    })
  }
})
