// DELETE /api/payment-methods/[id] - Delete a saved payment method
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Get user from session
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid authentication',
      })
    }

    // Get payment method ID from route params
    const paymentMethodId = getRouterParam(event, 'paymentMethodId')
    if (!paymentMethodId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment method ID is required',
      })
    }

    // Delete payment method (RLS will ensure user can only delete their own)
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', user.id)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete payment method',
      })
    }

    return {
      success: true,
      message: 'Payment method deleted successfully',
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Payment method deletion error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
