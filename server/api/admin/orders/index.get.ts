// GET /api/admin/orders - Admin endpoint to get all orders with filtering and pagination
//
// Performance:
// - Cached for 30 seconds per unique query combination
// - Cache invalidated on order mutations
import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { prepareSearchPattern } from '~/server/utils/searchSanitization'
import type { OrderItemRaw, Address } from '~/types/database'

// Database response types
interface OrderFromDB {
  id: number
  order_number: string
  user_id: string | null
  guest_email: string | null
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: 'stripe' | 'paypal' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  subtotal_eur: number
  shipping_cost_eur: number
  tax_eur: number
  total_eur: number
  shipping_address: Address
  billing_address: Address
  customer_notes: string | null
  admin_notes: string | null
  tracking_number: string | null
  carrier: string | null
  priority_level: number | null
  estimated_ship_date: string | null
  fulfillment_progress: number | null
  created_at: string
  shipped_at: string | null
  delivered_at: string | null
  order_items?: OrderItemRaw[]
}

interface AggregateOrderFromDB {
  total_eur: number
  status: string
}

interface TransformedOrder {
  id: number
  order_number: string
  user_id: string | null
  guest_email: string | null
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: 'stripe' | 'paypal' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  subtotal_eur: number
  shipping_cost_eur: number
  tax_eur: number
  total_eur: number
  shipping_address: Address
  billing_address: Address
  customer_notes: string | null
  admin_notes: string | null
  tracking_number: string | null
  carrier: string | null
  priority_level: number | null
  estimated_ship_date: string | null
  fulfillment_progress: number | null
  created_at: string
  shipped_at: string | null
  delivered_at: string | null
  order_items?: OrderItemRaw[]
  customerName: string
  customerEmail: string
  itemCount: number
  daysSinceOrder: number
  items: OrderItemRaw[]
}

interface ApiResponse {
  success: boolean
  data: {
    orders: TransformedOrder[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
    aggregates: {
      totalRevenue: number
      averageOrderValue: number
      statusCounts: Record<string, number>
    }
  }
}

// NOTE: Caching disabled for admin endpoints to ensure proper header-based authentication
export default defineEventHandler(async (event): Promise<ApiResponse> => {
  // Authentication MUST happen first, never caught
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

  try {
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

    const { data: orders, error: ordersError } = await ordersQuery as { data: OrderFromDB[] | null, error: unknown }

    if (ordersError) {
      console.error('[Admin Orders] Query failed:', {
        error: ordersError.message,
        code: ordersError.code,
        timestamp: new Date().toISOString(),
        errorId: 'ADMIN_ORDERS_FETCH_FAILED',
      })

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch orders',
        data: { canRetry: true },
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
      // Apply same sanitization as main query to prevent SQL injection
      const sanitizedSearch = prepareSearchPattern(search, { validateLength: true })
      countQuery = countQuery.or(`order_number.ilike.${sanitizedSearch},guest_email.ilike.${sanitizedSearch}`)
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
      console.error('[Admin Orders] Count query failed:', {
        error: countError.message,
        code: countError.code,
        timestamp: new Date().toISOString(),
        errorId: 'ADMIN_ORDERS_COUNT_FAILED',
      })

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to count orders',
        data: { canRetry: true },
      })
    }

    // Calculate aggregates
    const { data: aggregateData, error: aggregateError } = await supabase
      .from('orders')
      .select('total_eur, status') as { data: AggregateOrderFromDB[] | null, error: unknown }

    if (aggregateError) {
      console.error('[Admin Orders] Aggregate query failed:', {
        error: aggregateError.message,
        code: aggregateError.code,
        timestamp: new Date().toISOString(),
        errorId: 'ADMIN_ORDERS_AGGREGATE_FAILED',
      })

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to calculate order statistics',
        data: { canRetry: true },
      })
    }

    const totalRevenue = aggregateData?.reduce((sum, order) => sum + Number(order.total_eur), 0) || 0
    const averageOrderValue = aggregateData && aggregateData.length > 0
      ? totalRevenue / aggregateData.length
      : 0

    const statusCounts = aggregateData?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Transform orders to include computed fields
    const transformedOrders: TransformedOrder[] = orders?.map((order): TransformedOrder => {
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
        items: order.order_items || [],
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
          hasPrev: page > 1,
        },
        aggregates: {
          totalRevenue,
          averageOrderValue,
          statusCounts,
        },
      },
    }
  }
  catch (error: unknown) {
    // Re-throw HTTP errors (including auth errors)
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('[Admin Orders] Unexpected error:', {
      error: error.message || String(error),
      stack: error.stack,
      timestamp: new Date().toISOString(),
      errorId: 'ADMIN_ORDERS_UNEXPECTED_ERROR',
    })

    // Throw generic 500 error for unexpected failures
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred while fetching orders',
      data: { canRetry: true },
    })
  }
})
