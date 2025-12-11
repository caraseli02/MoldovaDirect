// PUT /api/orders/[id]/tracking - Update order tracking information (admin only)
import { serverSupabaseServiceRole } from '#supabase/server'

interface UpdateTrackingRequest {
  trackingNumber?: string
  carrier?: string
  estimatedDelivery?: string
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
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
    const body = await readBody(event) as UpdateTrackingRequest

    // Build update object
    const updateData: unknown = {}

    if (body.trackingNumber !== undefined) {
      updateData.tracking_number = body.trackingNumber
    }
    if (body.carrier !== undefined) {
      updateData.carrier = body.carrier
    }
    if (body.estimatedDelivery !== undefined) {
      updateData.estimated_delivery = body.estimatedDelivery
    }
    if (body.status !== undefined) {
      updateData.status = body.status

      // Update shipped_at when status changes to shipped
      if (body.status === 'shipped' && !updateData.shipped_at) {
        updateData.shipped_at = new Date().toISOString()
      }

      // Update delivered_at when status changes to delivered
      if (body.status === 'delivered' && !updateData.delivered_at) {
        updateData.delivered_at = new Date().toISOString()
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No valid fields to update',
      })
    }

    // Update order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
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
        statusMessage: 'Failed to update order tracking',
      })
    }

    // If status was updated, create a tracking event
    if (body.status) {
      const statusDescriptions: Record<string, string> = {
        pending: 'Order received and pending processing',
        processing: 'Order is being processed',
        shipped: 'Order has been shipped',
        delivered: 'Order has been delivered',
        cancelled: 'Order has been cancelled',
      }

      await supabase
        .from('order_tracking_events')
        .insert({
          order_id: parseInt(orderId),
          status: body.status,
          description: statusDescriptions[body.status] || `Order status updated to ${body.status}`,
          timestamp: new Date().toISOString(),
        })
    }

    return {
      success: true,
      data: order,
    }
  }
  catch (error: unknown) {
    if (error.statusCode) {
      throw error
    }

    console.error('Tracking update error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
