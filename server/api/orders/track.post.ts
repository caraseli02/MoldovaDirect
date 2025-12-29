// POST /api/orders/track - Public endpoint to track order by order number and email
import { serverSupabaseServiceRole } from '#supabase/server'

interface TrackOrderRequest {
  orderNumber: string
  email: string
}

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10 // 10 requests per minute per IP

/**
 * Check if the request is rate limited
 * @param ip - Client IP address
 * @returns true if rate limited
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    // New window or expired
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  record.count++
  return false
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip)
    }
  }
}, 5 * 60 * 1000)

export default defineEventHandler(async (event) => {
  try {
    // Get client IP for rate limiting
    const clientIP = getRequestIP(event, { xForwardedFor: true }) || 'unknown'

    // Check rate limit
    if (isRateLimited(clientIP)) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again later.',
      })
    }

    const supabase = serverSupabaseServiceRole(event)

    // Parse and validate request body
    let body: TrackOrderRequest
    try {
      body = await readBody<TrackOrderRequest>(event)
    }
    catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body',
      })
    }

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

    // Sanitized order number for logging (first 4 chars only)
    const sanitizedOrderNumber = orderNumber.length > 4
      ? `${orderNumber.substring(0, 4)}***`
      : '***'

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
      console.error('Order fetch error:', { orderNumber: sanitizedOrderNumber, error: orderError })
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
      try {
        const { data: userData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', order.user_id)
          .single()

        if (profileError) {
          console.error('Profile lookup failed:', { userId: order.user_id, error: profileError })
          // Continue - don't block on profile errors
        }

        if (userData || !profileError) {
          // Get user email from auth.users
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(order.user_id)

          if (authError) {
            console.error('Auth user lookup failed:', { userId: order.user_id, error: authError })
          }
          else if (authUser?.user?.email?.toLowerCase() === email) {
            emailMatch = true
          }
        }
      }
      catch (e) {
        console.error('Email verification error:', { orderNumber: sanitizedOrderNumber, error: e })
        // Continue - will result in 404 if email doesn't match
      }
    }

    if (!emailMatch) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found',
      })
    }

    // Fetch tracking events with error handling
    const { data: trackingEvents, error: trackingError } = await supabase
      .from('order_tracking_events')
      .select('*')
      .eq('order_id', order.id)
      .order('timestamp', { ascending: false })

    if (trackingError) {
      console.error('Failed to fetch tracking events:', { orderId: order.id, error: trackingError })
      // Continue but data will be incomplete
    }

    // Fetch order items with error handling
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        unit_price,
        product_snapshot
      `)
      .eq('order_id', order.id)

    if (itemsError) {
      console.error('Failed to fetch order items:', { orderId: order.id, error: itemsError })
      // Continue but items will be empty
    }

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
      shippingAddress: order.shipping_address
        ? {
            city: order.shipping_address.city,
            country: order.shipping_address.country,
            // Only show partial address for security
            postalCode: order.shipping_address.postalCode?.slice(0, 2) + '***',
          }
        : null,
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
      // Flag if some data might be incomplete due to errors
      dataIncomplete: !!(trackingError || itemsError),
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
