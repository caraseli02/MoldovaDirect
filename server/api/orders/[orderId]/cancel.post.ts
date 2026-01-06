/**
 * API endpoint to cancel an order
 * Only allows cancellation for orders with 'pending' status
 * User must be the owner of the order
 */

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { sendOrderStatusEmail } from '~/server/utils/orderEmails'
import { transformOrderToEmailData } from '~/server/utils/orderDataTransform'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const orderId = getRouterParam(event, 'orderId')

    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required',
      })
    }

    // Get the order and verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(*)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found',
      })
    }

    // Verify ownership - must be the order owner
    if (user) {
      if (order.user_id !== user.id) {
        throw createError({
          statusCode: 403,
          statusMessage: 'You do not have permission to cancel this order',
        })
      }
    }
    else {
      // Guest users cannot cancel orders through the API
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required to cancel orders',
      })
    }

    // Check if order can be cancelled (only pending orders)
    if (order.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot cancel order with status '${order.status}'. Only pending orders can be cancelled.`,
      })
    }

    // Get cancellation reason from body (optional)
    const body = await readBody(event).catch(() => ({}))
    const { reason } = body as { reason?: string }

    // Update order status to cancelled
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || 'Cancelled by customer',
      })
      .eq('id', orderId)
      .select(`
        *,
        order_items:order_items(*)
      `)
      .single()

    if (updateError || !updatedOrder) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to cancel order',
      })
    }

    // Send cancellation email
    let emailResult = null
    try {
      // Get customer information
      let customerName = 'Customer'
      let customerEmail = ''
      let locale = 'en'

      if (updatedOrder.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, preferred_locale')
          .eq('id', updatedOrder.user_id)
          .single()

        if (profile) {
          customerName = profile.full_name || 'Customer'
          customerEmail = profile.email
          locale = profile.preferred_locale || 'en'
        }
      }

      if (customerEmail) {
        const emailData = transformOrderToEmailData(
          updatedOrder,
          customerName,
          customerEmail,
          locale,
        )

        emailResult = await sendOrderStatusEmail(
          emailData,
          'order_cancelled',
          reason || 'Cancelled by customer',
          { supabaseClient: supabase },
        )
      }
    }
    catch (emailError: any) {
      console.error('Failed to send cancellation email:', emailError)
      emailResult = {
        success: false,
        error: emailError.message,
      }
    }

    return {
      success: true,
      message: 'Order cancelled successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        cancelledAt: updatedOrder.cancelled_at,
        cancellationReason: updatedOrder.cancellation_reason,
      },
      emailSent: emailResult?.success ?? false,
    }
  }
  catch (error: unknown) {
    console.error('Error cancelling order:', getServerErrorMessage(error))

    if (isH3Error(error)) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to cancel order',
    })
  }
})
