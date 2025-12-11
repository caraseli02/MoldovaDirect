// GET /api/admin/orders/analytics - Admin endpoint to get order analytics and metrics
import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { subDays } from 'date-fns'

export default defineEventHandler(async (event) => {
  try {
    // Verify admin authentication
    await requireAdminRole(event)

    // Use service role for database operations
    const supabase = serverSupabaseServiceRole(event)

    // Parse query parameters for date range
    const query = getQuery(event)
    const dateFrom = query.date_from as string
    const dateTo = query.date_to as string

    // Default to last 30 days if no range specified
    const endDate = dateTo ? new Date(dateTo) : new Date()
    const startDate = dateFrom ? new Date(dateFrom) : subDays(endDate, 30)

    // Fetch all orders within date range
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        payment_method,
        total_eur,
        subtotal_eur,
        shipping_cost_eur,
        tax_eur,
        created_at,
        shipped_at,
        delivered_at
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (ordersError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch orders for analytics',
      })
    }

    // Calculate key metrics
    const totalOrders = orders?.length || 0
    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_eur), 0) || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Status breakdown
    const statusCounts = orders?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Payment status breakdown
    const paymentStatusCounts = orders?.reduce((acc, order) => {
      acc[order.payment_status] = (acc[order.payment_status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Payment method breakdown
    const paymentMethodCounts = orders?.reduce((acc, order) => {
      const method = order.payment_method || 'unknown'
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Revenue by payment method
    const revenueByPaymentMethod = orders?.reduce((acc, order) => {
      const method = order.payment_method || 'unknown'
      acc[method] = (acc[method] || 0) + Number(order.total_eur)
      return acc
    }, {} as Record<string, number>) || {}

    // Calculate fulfillment metrics
    const shippedOrders = orders?.filter(o => o.status === 'shipped' || o.status === 'delivered') || []
    const deliveredOrders = orders?.filter(o => o.status === 'delivered') || []
    const fulfillmentRate = totalOrders > 0 ? (deliveredOrders.length / totalOrders) * 100 : 0

    // Calculate average fulfillment time (from created to shipped)
    const fulfillmentTimes = shippedOrders
      .filter(o => o.shipped_at)
      .map((o) => {
        const created = new Date(o.created_at).getTime()
        const shipped = new Date(o.shipped_at!).getTime()
        return (shipped - created) / (1000 * 60 * 60 * 24) // days
      })
    const averageFulfillmentTime = fulfillmentTimes.length > 0
      ? fulfillmentTimes.reduce((sum, time) => sum + time, 0) / fulfillmentTimes.length
      : 0

    // Calculate average delivery time (from shipped to delivered)
    const deliveryTimes = deliveredOrders
      .filter(o => o.shipped_at && o.delivered_at)
      .map((o) => {
        const shipped = new Date(o.shipped_at!).getTime()
        const delivered = new Date(o.delivered_at!).getTime()
        return (delivered - shipped) / (1000 * 60 * 60 * 24) // days
      })
    const averageDeliveryTime = deliveryTimes.length > 0
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
      : 0

    // Helper function to format date as yyyy-MM-dd (native alternative to date-fns format)
    const formatDateISO = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Daily revenue trend
    const dailyRevenue: Record<string, number> = {}
    const dailyOrders: Record<string, number> = {}

    orders?.forEach((order) => {
      const date = formatDateISO(new Date(order.created_at))
      dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(order.total_eur)
      dailyOrders[date] = (dailyOrders[date] || 0) + 1
    })

    // Convert to arrays for charting
    const dates = Object.keys(dailyRevenue).sort()
    const revenueTimeSeries = dates.map(date => ({
      date,
      revenue: dailyRevenue[date],
      orders: dailyOrders[date],
    }))

    // Calculate revenue breakdown
    const subtotalRevenue = orders?.reduce((sum, order) => sum + Number(order.subtotal_eur), 0) || 0
    const shippingRevenue = orders?.reduce((sum, order) => sum + Number(order.shipping_cost_eur || 0), 0) || 0
    const taxRevenue = orders?.reduce((sum, order) => sum + Number(order.tax_eur || 0), 0) || 0

    return {
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          fulfillmentRate,
          averageFulfillmentTime,
          averageDeliveryTime,
        },
        statusBreakdown: statusCounts,
        paymentStatusBreakdown: paymentStatusCounts,
        paymentMethodBreakdown: paymentMethodCounts,
        revenueByPaymentMethod,
        revenueBreakdown: {
          subtotal: subtotalRevenue,
          shipping: shippingRevenue,
          tax: taxRevenue,
          total: totalRevenue,
        },
        timeSeries: revenueTimeSeries,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    }
  }
  catch (error: unknown) {
    if (error.statusCode) {
      throw error
    }

    console.error('Admin orders analytics error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
