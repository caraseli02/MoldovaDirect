// GET /api/admin/orders - Admin endpoint to get all orders with filtering and pagination
//
// Performance:
// - Cached for 30 seconds per unique query combination
// - Cache invalidated on order mutations
import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { ADMIN_CACHE_CONFIG, getAdminCacheKey } from '~/server/utils/adminCache'
import { prepareSearchPattern } from '~/server/utils/searchSanitization'

// NOTE: Caching disabled for admin endpoints to ensure proper header-based authentication
export default defineEventHandler(async (event) => {
  try {
    // Verify admin authentication
    await requireAdminRole(event)
    
    // Use service role for database operations
    const supabase = serverSupabaseServiceRole(event)

    // Parse query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 20, 100)
    const status = query.status as string
    const paymentStatus = query.payment_status as string
    const search = query.search as string
    const dateFrom = query.date_from as string
    const dateTo = query.date_to as string
    const amountMin = query.amount_min ? parseFloat(query.amount_min as string) : undefined
    const amountMax = query.amount_max ? parseFloat(query.amount_max as string) : undefined
    const priority = query.priority ? parseInt(query.priority as string) : undefined
    const shippingMethod = query.shipping_method as string
    const sortBy = (query.sort_by as string) || 'created_at'
    const sortOrder = (query.sort_order as string) || 'desc'
    const offset = (page - 1) * limit

    // Validate sort parameters
    const validSortFields = ['created_at', 'total_eur', 'status', 'priority_level']
    const validSortOrders = ['asc', 'desc']
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at'
    const finalSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc'

    // Build query - simplified without profiles join since orders are guest orders
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
        priority_level,
        estimated_ship_date,
        fulfillment_progress,
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
      .order(finalSortBy, { ascending: finalSortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      ordersQuery = ordersQuery.eq('status', status)
    }

    if (paymentStatus && ['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      ordersQuery = ordersQuery.eq('payment_status', paymentStatus)
    }

    if (search) {
      // Search: order number and guest email (sanitized to prevent SQL injection)
      const sanitizedSearch = prepareSearchPattern(search, { validateLength: true })
      ordersQuery = ordersQuery.or(`order_number.ilike.${sanitizedSearch},guest_email.ilike.${sanitizedSearch}`)
    }

    if (dateFrom) {
      ordersQuery = ordersQuery.gte('created_at', dateFrom)
    }

    if (dateTo) {
      ordersQuery = ordersQuery.lte('created_at', dateTo)
    }

    if (amountMin !== undefined) {
      ordersQuery = ordersQuery.gte('total_eur', amountMin)
    }

    if (amountMax !== undefined) {
      ordersQuery = ordersQuery.lte('total_eur', amountMax)
    }

    if (priority !== undefined) {
      ordersQuery = ordersQuery.eq('priority_level', priority)
    }

    if (shippingMethod) {
      ordersQuery = ordersQuery.eq('shipping_method', shippingMethod)
    }

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error('Orders query error:', ordersError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch orders',
        data: ordersError
      })
    }

    console.log('Orders fetched:', orders?.length || 0)

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
    if (amountMin !== undefined) {
      countQuery = countQuery.gte('total_eur', amountMin)
    }
    if (amountMax !== undefined) {
      countQuery = countQuery.lte('total_eur', amountMax)
    }
    if (priority !== undefined) {
      countQuery = countQuery.eq('priority_level', priority)
    }
    if (shippingMethod) {
      countQuery = countQuery.eq('shipping_method', shippingMethod)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get orders count'
      })
    }

    // Calculate aggregates
    const { data: aggregateData } = await supabase
      .from('orders')
      .select('total_eur, status')

    const totalRevenue = aggregateData?.reduce((sum, order) => sum + Number(order.total_eur), 0) || 0
    const averageOrderValue = aggregateData && aggregateData.length > 0 
      ? totalRevenue / aggregateData.length 
      : 0

    const statusCounts = aggregateData?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Transform orders to include computed fields
    const transformedOrders = orders?.map(order => {
      const orderDate = new Date(order.created_at)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - orderDate.getTime())
      const daysSinceOrder = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return {
        ...order,
        customerName: 'Guest Customer',
        customerEmail: order.guest_email || 'N/A',
        itemCount: order.order_items?.length || 0,
        daysSinceOrder,
        items: order.order_items || []
      }
    }) || []

    return {
      success: true,
      data: {
        orders: transformedOrders,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page < Math.ceil((count || 0) / limit),
          hasPrev: page > 1
        },
        aggregates: {
          totalRevenue,
          averageOrderValue,
          statusCounts
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