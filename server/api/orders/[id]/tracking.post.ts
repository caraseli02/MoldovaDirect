// POST /api/orders/[id]/tracking - Add tracking event to an order (admin only)
import { serverSupabaseServiceRole } from '#supabase/server'

interface TrackingEventRequest {
  status: string
  location?: string
  description: string
  timestamp?: string
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
    const orderId = getRouterParam(event, 'id')
    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required',
      })
    }

    // Parse request body
    const body = await readBody(event) as TrackingEventRequest

    // Validate required fields
    if (!body.status || !body.description) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Status and description are required',
      })
    }

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number')
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

    // Create tracking event
    const { data: trackingEvent, error: trackingError } = await supabase
      .from('order_tracking_events')
      .insert({
        order_id: parseInt(orderId),
        status: body.status,
        location: body.location || null,
        description: body.description,
        timestamp: body.timestamp || new Date().toISOString(),
      })
      .select()
      .single()

    if (trackingError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create tracking event',
      })
    }

    return {
      success: true,
      data: trackingEvent,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Tracking event creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
