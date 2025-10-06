// GET /api/orders - Get user's orders with pagination and advanced filtering
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
    const search = query.search as string
    const dateFrom = query.dateFrom as string
    const dateTo = query.dateTo as string
    const minAmount = query.minAmount ? parseFloat(query.minAmount as string) : undefined
    const maxAmount = query.maxAmount ? parseFloat(query.maxAmount as string) : undefined
    const sortBy = query.sortBy as string || 'created_at'
    const sortOrder = query.sortOrder as string || 'desc'
    const offset = (page - 1) * limit

    // Validate sort parameters
    const validSortFields = ['created_at', 'total_eur', 'status', 'order_number']
    const validSortOrders = ['asc', 'desc']
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at'
    const finalSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc'

    // For advanced search (product names), we need to fetch all orders first if search is provided
    // This is a trade-off for better search functionality
    let orders: any[] = []
    let totalCount = 0

    if (search && search.length >= 2) {
      // Fetch all user orders with items for search
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_method,
          payment_status,
          total_eur,
          shipping_address,
          tracking_number,
          carrier,
          estimated_delivery,
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

      if (allOrdersError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch orders'
        })
      }

      // Filter orders by search term (order number or product names)
      const searchLower = search.toLowerCase()
      const filteredOrders = (allOrders || []).filter(order => {
        // Search in order number
        if (order.order_number?.toLowerCase().includes(searchLower)) {
          return true
        }
        
        // Search in product names within order items
        if (order.order_items && Array.isArray(order.order_items)) {
          return order.order_items.some((item: any) => {
            const snapshot = item.product_snapshot
            if (snapshot?.name_translations) {
              return Object.values(snapshot.name_translations).some((name: any) => 
                name?.toLowerCase().includes(searchLower)
              )
            }
            return false
          })
        }
        
        return false
      })

      // Apply additional filters
      let finalOrders = filteredOrders

      if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        finalOrders = finalOrders.filter(order => order.status === status)
      }

      if (dateFrom) {
        finalOrders = finalOrders.filter(order => new Date(order.created_at) >= new Date(dateFrom))
      }

      if (dateTo) {
        const dateToEnd = new Date(dateTo)
        dateToEnd.setHours(23, 59, 59, 999)
        finalOrders = finalOrders.filter(order => new Date(order.created_at) <= dateToEnd)
      }

      if (minAmount !== undefined) {
        finalOrders = finalOrders.filter(order => order.total_eur >= minAmount)
      }

      if (maxAmount !== undefined) {
        finalOrders = finalOrders.filter(order => order.total_eur <= maxAmount)
      }

      // Sort orders
      finalOrders.sort((a, b) => {
        let aVal = a[finalSortBy]
        let bVal = b[finalSortBy]
        
        if (finalSortBy === 'created_at') {
          aVal = new Date(aVal).getTime()
          bVal = new Date(bVal).getTime()
        }
        
        if (finalSortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })

      totalCount = finalOrders.length
      orders = finalOrders.slice(offset, offset + limit)
    } else {
      // Standard query without product search
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
          tracking_number,
          carrier,
          estimated_delivery,
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

      // Apply filters
      if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        ordersQuery = ordersQuery.eq('status', status)
      }

      if (search) {
        ordersQuery = ordersQuery.ilike('order_number', `%${search}%`)
      }

      if (dateFrom) {
        ordersQuery = ordersQuery.gte('created_at', dateFrom)
      }

      if (dateTo) {
        // Add time to end of day for inclusive date range
        const dateToEnd = new Date(dateTo)
        dateToEnd.setHours(23, 59, 59, 999)
        ordersQuery = ordersQuery.lte('created_at', dateToEnd.toISOString())
      }

      if (minAmount !== undefined) {
        ordersQuery = ordersQuery.gte('total_eur', minAmount)
      }

      if (maxAmount !== undefined) {
        ordersQuery = ordersQuery.lte('total_eur', maxAmount)
      }

      // Apply sorting and pagination
      ordersQuery = ordersQuery
        .order(finalSortBy, { ascending: finalSortOrder === 'asc' })
        .range(offset, offset + limit - 1)

      const { data: ordersData, error: ordersError } = await ordersQuery

      if (ordersError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch orders'
        })
      }

      orders = ordersData || []

      // Get total count for pagination with same filters
      let countQuery = supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (status) {
        countQuery = countQuery.eq('status', status)
      }
      if (search) {
        countQuery = countQuery.ilike('order_number', `%${search}%`)
      }
      if (dateFrom) {
        countQuery = countQuery.gte('created_at', dateFrom)
      }
      if (dateTo) {
        const dateToEnd = new Date(dateTo)
        dateToEnd.setHours(23, 59, 59, 999)
        countQuery = countQuery.lte('created_at', dateToEnd.toISOString())
      }
      if (minAmount !== undefined) {
        countQuery = countQuery.gte('total_eur', minAmount)
      }
      if (maxAmount !== undefined) {
        countQuery = countQuery.lte('total_eur', maxAmount)
      }

      const { count, error: countError } = await countQuery

      if (countError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to get orders count'
        })
      }

      totalCount = count || 0
    }

    // Transform order_items to items and convert snake_case to camelCase
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      status: order.status,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      subtotalEur: order.subtotal_eur,
      shippingCostEur: order.shipping_cost_eur,
      taxEur: order.tax_eur,
      totalEur: order.total_eur,
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
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
      }))
    }))

    return {
      success: true,
      data: {
        orders: transformedOrders,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        },
        filters: {
          status,
          search,
          dateFrom,
          dateTo,
          minAmount,
          maxAmount,
          sortBy: finalSortBy,
          sortOrder: finalSortOrder
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