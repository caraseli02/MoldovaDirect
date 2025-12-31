// GET /api/orders/[id]/tracking - Get tracking information for an order
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

    // Get order ID from route params
    const orderId = getRouterParam(event, 'orderId')
    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required',
      })
    }

    // Verify order ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, status, tracking_number, carrier, estimated_delivery, shipped_at')
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

    // Fetch tracking events
    const { data: trackingEvents, error: trackingError } = await supabase
      .from('order_tracking_events')
      .select('*')
      .eq('order_id', orderId)
      .order('timestamp', { ascending: false })

    if (trackingError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch tracking events',
      })
    }

    // Build tracking response
    const trackingInfo = {
      orderId: order.id,
      orderNumber: order.order_number,
      status: order.status,
      trackingNumber: order.tracking_number,
      carrier: order.carrier,
      estimatedDelivery: order.estimated_delivery,
      shippedAt: order.shipped_at,
      events: trackingEvents || [],
      lastUpdate: trackingEvents && trackingEvents.length > 0
        ? trackingEvents[0].timestamp
        : order.shipped_at || null,
    }

    return {
      success: true,
      data: trackingInfo,
    }
  }
  catch (error: unknown) {
    if (isH3Error(error)) {
      throw error
    }

    console.error('Tracking fetch error:', getServerErrorMessage(error))
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
