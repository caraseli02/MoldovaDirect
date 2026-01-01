// POST /api/orders/[id]/sync-tracking - Sync tracking from carrier API (admin only)
import { serverSupabaseServiceRole } from '#supabase/server'
import { syncCarrierTracking } from '~/server/utils/carrierTracking'

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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required',
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

    // Get order with tracking info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, tracking_number, carrier')
      .eq('id', orderId)
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

    // Validate tracking info exists
    if (!order.tracking_number || !order.carrier) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order does not have tracking information',
      })
    }

    // Sync tracking from carrier
    const success = await syncCarrierTracking(
      parseInt(orderId),
      order.tracking_number,
      order.carrier,
      supabase,
    )

    if (!success) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Failed to sync tracking from carrier',
      })
    }

    // Fetch updated tracking events
    const { data: trackingEvents } = await supabase
      .from('order_tracking_events')
      .select('*')
      .eq('order_id', orderId)
      .order('timestamp', { ascending: false })

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        trackingNumber: order.tracking_number,
        carrier: order.carrier,
        events: trackingEvents || [],
        syncedAt: new Date().toISOString(),
      },
    }
  }
  catch (error: unknown) {
    if (isH3Error(error)) {
      throw error
    }

    console.error('Tracking sync error:', getServerErrorMessage(error))
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
