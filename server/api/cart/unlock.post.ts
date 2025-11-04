/**
 * API Endpoint: Unlock Cart
 * POST /api/cart/unlock
 *
 * Unlocks a cart, allowing modifications again.
 * Can only unlock if the checkout session matches or the lock has expired.
 */

import { serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'

const unlockCartSchema = z.object({
  cartId: z.number().int().positive(),
  checkoutSessionId: z.string().min(1).optional()
})

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = unlockCartSchema.parse(body)

    const { cartId, checkoutSessionId } = validatedData

    // Get Supabase client
    const supabase = await serverSupabaseClient(event)

    // Call the unlock_cart function
    const { data, error } = await supabase.rpc('unlock_cart', {
      p_cart_id: cartId,
      p_checkout_session_id: checkoutSessionId || null
    })

    if (error) {
      console.error('Error unlocking cart:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to unlock cart',
        data: { error: error.message }
      })
    }

    // Check if the unlock was successful
    if (!data.success) {
      const statusCode = data.code === 'CART_NOT_FOUND' ? 404 :
                         data.code === 'UNAUTHORIZED_UNLOCK' ? 403 : 400

      throw createError({
        statusCode,
        message: data.error || 'Failed to unlock cart',
        data: {
          code: data.code,
          lockedBySession: data.locked_by_session
        }
      })
    }

    // Return success response
    return {
      success: true,
      locked: false,
      message: data.message || 'Cart unlocked successfully'
    }

  } catch (err: any) {
    // Handle Zod validation errors
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid request data',
        data: { errors: err.errors }
      })
    }

    // Re-throw HTTP errors
    if (err.statusCode) {
      throw err
    }

    // Generic error handler
    console.error('Unexpected error in unlock cart endpoint:', err)
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred while unlocking the cart'
    })
  }
})
