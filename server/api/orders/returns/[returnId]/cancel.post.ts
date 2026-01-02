// POST /api/orders/returns/[returnId]/cancel - Cancel a return request
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

    // Get return ID from route params
    const returnId = getRouterParam(event, 'returnId')
    if (!returnId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Return ID is required',
      })
    }

    // Fetch return request - verify ownership
    const { data: returnRequest, error: fetchError } = await supabase
      .from('order_returns')
      .select(`
        id,
        order_id,
        user_id,
        status
      `)
      .eq('id', returnId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Return request not found',
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch return request',
      })
    }

    // Only pending returns can be cancelled
    if (returnRequest.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only pending return requests can be cancelled',
      })
    }

    // Update return request status to cancelled
    const { error: updateError } = await supabase
      .from('order_returns')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', returnId)

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to cancel return request',
      })
    }

    return {
      success: true,
      message: 'Return request cancelled successfully',
      returnId: parseInt(returnId),
    }
  }
  catch (error: unknown) {
    if (isH3Error(error)) {
      throw error
    }

    console.error('Cancel return error:', getServerErrorMessage(error))
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
