// GET /api/orders - Get user's orders with pagination and filtering
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

    // Parse query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 10, 50)
    const status = query.status as string
    const offset = (page - 1) * limit

    // Build query
    let ordersQuery = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_method,
        payment_status,
        total_eur,
        shipping_address,
        created_at,
        shipped_at,
        delivered_at,
        order_items (
          id,
          product_snapshot,
          quantity,
          price_eur,
          total_eur
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter if provided
    if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      ordersQuery = ordersQuery.eq('status', status)
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
      .eq('user_id', user.id)

    if (status) {
      countQuery = countQuery.eq('status', status)
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

    console.error('Orders fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})