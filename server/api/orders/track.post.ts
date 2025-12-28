// POST /api/orders/track - Public endpoint to track order by order number and email
import { serverSupabaseServiceRole } from '#supabase/server'

interface TrackOrderRequest {
  orderNumber: string
  email: string
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    const body = await readBody<TrackOrderRequest>(event)

    // Validate required fields
    if (!body.orderNumber || !body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order number and email are required',
      })
    }

    // Normalize inputs
    const orderNumber = body.orderNumber.trim().toUpperCase()
    const email = body.email.trim().toLowerCase()

    // Find order by order number and verify email matches
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        tracking_number,
        carrier,
        estimated_delivery,
        shipped_at,
        created_at,
        total,
        currency,
        guest_email,
        user_id,
        shipping_address
      `)
      .eq('order_number', orderNumber)
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

    // Verify email matches either guest_email or user email
    let emailMatch = false

    // Check guest email
    if (order.guest_email && order.guest_email.toLowerCase() === email) {
      emailMatch = true
    }

    // Check user email if order has a user_id
    if (!emailMatch && order.user_id) {
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', order.user_id)
        .single()

      if (userData) {
        // Get user email from auth.users
        const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id)
        if (authUser?.user?.email?.toLowerCase() === email) {
          emailMatch = true
        }
      }
    }

    if (!emailMatch) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found',
      })
    }

    // Fetch tracking events
    const { data: trackingEvents } = await supabase
      .from('order_tracking_events')
      .select('*')
      .eq('order_id', order.id)
      .order('timestamp', { ascending: false })

    // Fetch order items
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        unit_price,
        product_snapshot
      `)
      .eq('order_id', order.id)

    // Build tracking response (limited info for security)
    const trackingInfo = {
      orderNumber: order.order_number,
      status: order.status,
      trackingNumber: order.tracking_number,
      carrier: order.carrier,
      estimatedDelivery: order.estimated_delivery,
      shippedAt: order.shipped_at,
      createdAt: order.created_at,
      total: order.total,
      currency: order.currency || 'EUR',
      shippingAddress: order.shipping_address ? {
        city: order.shipping_address.city,
        country: order.shipping_address.country,
        // Only show partial address for security
        postalCode: order.shipping_address.postalCode?.slice(0, 2) + '***',
      } : null,
      items: orderItems?.map(item => ({
        name: item.product_snapshot?.name,
        quantity: item.quantity,
        price: item.unit_price,
        image: item.product_snapshot?.images?.[0],
      })) || [],
      events: trackingEvents?.map(e => ({
        status: e.status,
        description: e.description,
        location: e.location,
        timestamp: e.timestamp,
      })) || [],
      lastUpdate: trackingEvents && trackingEvents.length > 0
        ? trackingEvents[0].timestamp
        : order.shipped_at || order.created_at,
    }

    return {
      success: true,
      data: trackingInfo,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Public tracking fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
