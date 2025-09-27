// PATCH /api/admin/orders/[id]/status - Update order status
import { createClient } from '@supabase/supabase-js'

interface UpdateOrderStatusRequest {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  adminNotes?: string
  trackingNumber?: string
  carrier?: string
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = createClient(
      useRuntimeConfig().public.supabaseUrl,
      useRuntimeConfig().supabaseServiceKey
    )

    // Get user from session and verify admin role
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid authentication'
      })
    }

    // TODO: Implement proper admin role checking

    // Get order ID from route params
    const orderId = getRouterParam(event, 'id')
    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required'
      })
    }

    // Parse request body
    const body = await readBody(event) as UpdateOrderStatusRequest

    if (!body.status) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Status is required'
      })
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(body.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid status'
      })
    }

    // Prepare update data
    const updateData: any = {
      status: body.status,
      updated_at: new Date().toISOString()
    }

    if (body.adminNotes !== undefined) {
      updateData.admin_notes = body.adminNotes
    }

    if (body.trackingNumber !== undefined) {
      updateData.tracking_number = body.trackingNumber
    }

    if (body.carrier !== undefined) {
      updateData.carrier = body.carrier
    }

    // Set timestamps based on status
    if (body.status === 'shipped' && !updateData.shipped_at) {
      updateData.shipped_at = new Date().toISOString()
    }

    if (body.status === 'delivered' && !updateData.delivered_at) {
      updateData.delivered_at = new Date().toISOString()
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Order not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update order'
      })
    }

    return {
      success: true,
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        trackingNumber: updatedOrder.tracking_number,
        carrier: updatedOrder.carrier,
        shippedAt: updatedOrder.shipped_at,
        deliveredAt: updatedOrder.delivered_at
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Order status update error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})