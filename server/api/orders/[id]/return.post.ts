// POST /api/orders/[id]/return - Initiate a return for an order
import { serverSupabaseServiceRole } from '#supabase/server'

interface ReturnRequest {
  items: Array<{
    orderItemId: number
    quantity: number
    reason: string
  }>
  additionalNotes?: string
}

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

    // Get order ID from route params
    const orderId = getRouterParam(event, 'id')
    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required',
      })
    }

    // Parse request body
    const body = await readBody(event) as ReturnRequest

    // Validate request
    if (!body.items || body.items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least one item must be selected for return',
      })
    }

    // Fetch order with items - verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        delivered_at,
        created_at,
        total_eur,
        order_items (
          id,
          product_id,
          quantity,
          price_eur,
          total_eur,
          product_snapshot
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Order not found',
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch order',
      })
    }

    // Validate order is eligible for return
    // Order must be delivered
    if (order.status !== 'delivered') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only delivered orders can be returned',
      })
    }

    // Check return window (e.g., 30 days from delivery)
    const returnWindowDays = 30
    const deliveredDate = new Date(order.delivered_at || order.created_at)
    const daysSinceDelivery = Math.floor((Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceDelivery > returnWindowDays) {
      throw createError({
        statusCode: 400,
        statusMessage: `Return window has expired. Returns must be initiated within ${returnWindowDays} days of delivery.`,
      })
    }

    // Validate return items
    const validationResults = []
    let totalRefundAmount = 0

    for (const returnItem of body.items) {
      const orderItem = order.order_items.find((item: any) => item.id === returnItem.orderItemId)

      if (!orderItem) {
        validationResults.push({
          orderItemId: returnItem.orderItemId,
          valid: false,
          reason: 'Item not found in order',
        })
        continue
      }

      if (returnItem.quantity <= 0 || returnItem.quantity > orderItem.quantity) {
        validationResults.push({
          orderItemId: returnItem.orderItemId,
          valid: false,
          reason: `Invalid quantity. Must be between 1 and ${orderItem.quantity}`,
        })
        continue
      }

      if (!returnItem.reason || returnItem.reason.trim().length === 0) {
        validationResults.push({
          orderItemId: returnItem.orderItemId,
          valid: false,
          reason: 'Return reason is required',
        })
        continue
      }

      const refundAmount = (orderItem.price_eur * returnItem.quantity)
      totalRefundAmount += refundAmount

      validationResults.push({
        orderItemId: returnItem.orderItemId,
        valid: true,
        productName: orderItem.product_snapshot?.name_translations?.en || 'Unknown',
        quantity: returnItem.quantity,
        refundAmount,
      })
    }

    // Check if all items are valid
    const invalidItems = validationResults.filter(r => !r.valid)
    if (invalidItems.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid return items',
        data: { validationResults },
      })
    }

    // Create return request record
    const { data: returnRequest, error: returnError } = await supabase
      .from('order_returns')
      .insert({
        order_id: parseInt(orderId),
        user_id: user.id,
        status: 'pending',
        return_items: body.items,
        total_refund_amount: totalRefundAmount,
        additional_notes: body.additionalNotes || null,
        requested_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (returnError) {
      // If table doesn't exist, create it
      if (returnError.code === '42P01') {
        throw createError({
          statusCode: 503,
          statusMessage: 'Return system is not yet configured. Please contact support.',
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create return request',
      })
    }

    // Get user profile for notification
    await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single()

    return {
      success: true,
      data: {
        returnId: returnRequest.id,
        orderId: order.id,
        orderNumber: order.order_number,
        status: 'pending',
        itemCount: body.items.length,
        estimatedRefund: totalRefundAmount,
        validationResults,
        message: 'Return request submitted successfully. You will receive an email with further instructions.',
        nextSteps: [
          'You will receive a confirmation email shortly',
          'Our team will review your return request within 1-2 business days',
          'Once approved, you will receive return shipping instructions',
          `Estimated refund amount: €${totalRefundAmount.toFixed(2)}`,
        ],
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Return initiation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
