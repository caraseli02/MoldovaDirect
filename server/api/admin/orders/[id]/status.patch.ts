// PATCH /api/admin/orders/[id]/status - Update order status
import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { invalidateMultipleScopes } from '~/server/utils/adminCache'

interface UpdateOrderStatusRequest {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  adminNotes?: string
  trackingNumber?: string
  carrier?: string
}

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // Terminal state
  cancelled: [], // Terminal state
}

export default defineEventHandler(async (event) => {
  try {
    // Verify admin authentication
    const userId = await requireAdminRole(event)

    // Use service role for database operations
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
    const body = await readBody(event) as UpdateOrderStatusRequest

    if (!body.status) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Status is required',
      })
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(body.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid status',
      })
    }

    // Fetch current order to validate status transition
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('id', orderId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
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

    // Validate status transition
    const allowedTransitions = STATUS_TRANSITIONS[currentOrder.status] || []
    if (currentOrder.status !== body.status && !allowedTransitions.includes(body.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid status transition from ${currentOrder.status} to ${body.status}. Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
      })
    }

    // Validate required fields for specific statuses
    if (body.status === 'shipped') {
      if (!body.trackingNumber) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Tracking number is required when marking order as shipped',
        })
      }
      if (!body.carrier) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Carrier is required when marking order as shipped',
        })
      }
    }

    // Prepare update data
    const updateData = {
      status: body.status,
      updated_at: new Date().toISOString(),
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
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update order',
      })
    }

    // Record status change in history if table exists
    if (currentOrder.status !== body.status) {
      await supabase
        .from('order_status_history')
        .insert({
          order_id: parseInt(orderId),
          from_status: currentOrder.status,
          to_status: body.status,
          changed_by: userId,
          changed_at: new Date().toISOString(),
          notes: body.adminNotes || null,
          automated: false,
        })
        .select()
    }

    // Invalidate related caches
    await invalidateMultipleScopes(['orders', 'stats'])

    return {
      success: true,
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        trackingNumber: updatedOrder.tracking_number,
        carrier: updatedOrder.carrier,
        shippedAt: updatedOrder.shipped_at,
        deliveredAt: updatedOrder.delivered_at,
        previousStatus: currentOrder.status,
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Order status update error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
