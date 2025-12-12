// GET /api/admin/orders/[id] - Get detailed order information with items
import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    // Verify admin authentication
    await requireAdminRole(event)

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

    // Fetch order with all related data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        guest_email,
        status,
        payment_method,
        payment_status,
        payment_intent_id,
        subtotal_eur,
        shipping_cost_eur,
        tax_eur,
        total_eur,
        shipping_address,
        billing_address,
        customer_notes,
        admin_notes,
        tracking_number,
        carrier,
        priority_level,
        estimated_ship_date,
        fulfillment_progress,
        created_at,
        updated_at,
        shipped_at,
        delivered_at,
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

    // Fetch order status history if the table exists
    const { data: statusHistory } = await supabase
      .from('order_status_history')
      .select(`
        id,
        order_id,
        from_status,
        to_status,
        changed_by,
        changed_at,
        notes,
        automated
      `)
      .eq('order_id', orderId)
      .order('changed_at', { ascending: false })

    // Fetch order notes if the table exists
    const { data: notes } = await supabase
      .from('order_notes')
      .select(`
        id,
        order_id,
        note_type,
        content,
        created_by,
        created_at,
        updated_at
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    // Fetch fulfillment tasks if the table exists
    const { data: fulfillmentTasks } = await supabase
      .from('order_fulfillment_tasks')
      .select(`
        id,
        order_id,
        task_type,
        task_name,
        description,
        required,
        completed,
        completed_at,
        completed_by,
        created_at
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    // Calculate additional metrics
    const itemCount = order.order_items?.length || 0
    const daysSinceOrder = Math.floor(
      (new Date().getTime() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24),
    )

    // Determine urgency level based on days since order and status
    let urgencyLevel: 'low' | 'medium' | 'high' = 'low'
    if (order.status === 'pending' && daysSinceOrder > 2) {
      urgencyLevel = 'high'
    }
    else if (order.status === 'processing' && daysSinceOrder > 3) {
      urgencyLevel = 'high'
    }
    else if (daysSinceOrder > 1) {
      urgencyLevel = 'medium'
    }

    // Build comprehensive order response
    const orderWithDetails = {
      ...order,
      statusHistory: statusHistory || [],
      notes: notes || [],
      fulfillmentTasks: fulfillmentTasks || [],
      itemCount,
      daysSinceOrder,
      urgencyLevel,
      customer: {
        name: 'Guest Customer',
        email: order.guest_email || '',
        phone: null,
        preferredLanguage: 'en',
      },
    }

    return {
      success: true,
      data: orderWithDetails,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Admin order detail fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
