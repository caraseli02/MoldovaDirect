// POST /api/orders/[id]/complete - Complete order after successful payment
import { serverSupabaseServiceRole } from '#supabase/server'

interface CompleteOrderRequest {
  paymentIntentId?: string
  paymentStatus: 'paid' | 'failed'
  transactionId?: string
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Get order ID from route params
    const orderId = getRouterParam(event, 'id')
    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required',
      })
    }

    // Parse request body
    const body = await readBody(event) as CompleteOrderRequest

    if (!body.paymentStatus) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment status is required',
      })
    }

    // Get user from session (optional for guest orders)
    const authHeader = getHeader(event, 'authorization')
    let user = null

    if (authHeader) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', ''),
      )
      if (!authError && authUser) {
        user = authUser
      }
    }

    // Get order to verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found',
      })
    }

    // Verify order ownership (for authenticated users)
    if (user && order.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied',
      })
    }

    // Update order status based on payment result
    const updateData: unknown = {
      payment_status: body.paymentStatus,
      updated_at: new Date().toISOString(),
    }

    if (body.paymentIntentId) {
      updateData.payment_intent_id = body.paymentIntentId
    }

    if (body.paymentStatus === 'paid') {
      updateData.status = 'processing'
    }
    else if (body.paymentStatus === 'failed') {
      updateData.status = 'cancelled'
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update order',
      })
    }

    // If payment successful, update inventory
    if (body.paymentStatus === 'paid') {
      const { error: inventoryError } = await supabase
        .rpc('update_inventory_on_order', { order_id_param: parseInt(orderId) })

      if (inventoryError) {
        console.error('Inventory update error:', inventoryError)
        // Don't fail the order completion, but log the error
      }

      // Clear the cart if user is authenticated
      if (user) {
        // Find and clear the user's cart
        const { data: userCart } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (userCart) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', userCart.id)
        }
      }
    }

    return {
      success: true,
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.payment_status,
      },
    }
  }
  catch (error: unknown) {
    if (error.statusCode) {
      throw error
    }

    console.error('Order completion error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
