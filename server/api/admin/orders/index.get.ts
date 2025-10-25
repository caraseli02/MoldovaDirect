// GET /api/admin/orders - Admin endpoint to get all orders with filtering and pagination
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

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
    // For now, we'll assume the user is admin if they have access to this endpoint
    // In production, you would check user roles from a user_roles table

    // Parse query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 20, 100)
    const status = query.status as string
    const paymentStatus = query.payment_status as string
    const search = query.search as string
    const dateFrom = query.date_from as string
    const dateTo = query.date_to as string
    const offset = (page - 1) * limit

    // Build query
    let ordersQuery = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        guest_email,
        status,
        payment_method,
        payment_status,
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
        created_at,
        shipped_at,
        delivered_at,
        profiles (
          name
        ),
        order_items (
          id,
          product_snapshot,
          quantity,
          price_eur,
          total_eur
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      ordersQuery = ordersQuery.eq('status', status)
    }

    if (paymentStatus && ['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      ordersQuery = ordersQuery.eq('payment_status', paymentStatus)
    }

    if (search) {
      ordersQuery = ordersQuery.or(`order_number.ilike.%${search}%,guest_email.ilike.%${search}%`)
    }

    if (dateFrom) {
      ordersQuery = ordersQuery.gte('created_at', dateFrom)
    }

    if (dateTo) {
      ordersQuery = ordersQuery.lte('created_at', dateTo)
    }

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch orders'
      })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })

    // Apply same filters for count
    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    if (paymentStatus) {
      countQuery = countQuery.eq('payment_status', paymentStatus)
    }
    if (search) {
      countQuery = countQuery.or(`order_number.ilike.%${search}%,guest_email.ilike.%${search}%`)
    }
    if (dateFrom) {
      countQuery = countQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      countQuery = countQuery.lte('created_at', dateTo)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get orders count'
      })
    }

    return {
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Admin orders fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})