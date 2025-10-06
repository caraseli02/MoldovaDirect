// GET /api/orders/[id] - Get specific order details
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const supabase = createClient(
      useRuntimeConfig().public.supabaseUrl,
      useRuntimeConfig().supabaseServiceKey
    )

    // Get user from session
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

    // Get order ID from route params
    const orderId = getRouterParam(event, 'id')
    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required'
      })
    }

    // Fetch order with all details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_snapshot,
          quantity,
          price_eur,
          total_eur
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Order not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch order'
      })
    }

    // Fetch tracking events for this order
    const { data: trackingEvents, error: trackingError } = await supabase
      .from('order_tracking_events')
      .select('*')
      .eq('order_id', orderId)
      .order('timestamp', { ascending: false })

    // Transform order_items to items and convert snake_case to camelCase
    const transformedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      status: order.status,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      paymentIntentId: order.payment_intent_id,
      subtotalEur: order.subtotal_eur,
      shippingCostEur: order.shipping_cost_eur,
      taxEur: order.tax_eur,
      totalEur: order.total_eur,
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      customerNotes: order.customer_notes,
      adminNotes: order.admin_notes,
      trackingNumber: order.tracking_number,
      carrier: order.carrier,
      estimatedDelivery: order.estimated_delivery,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        productSnapshot: item.product_snapshot,
        quantity: item.quantity,
        priceEur: item.price_eur,
        totalEur: item.total_eur
      })),
      tracking_events: trackingEvents || []
    }

    return {
      success: true,
      data: transformedOrder
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Order fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})