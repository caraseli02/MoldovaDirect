// GET /api/orders/[id] - Get specific order details
import { serverSupabaseServiceRole } from '#supabase/server'
import type { OrderItemRaw, Address } from '~/types/database'

// Database response types
interface OrderFromDB {
  id: number
  order_number: string
  user_id: string | null
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: 'stripe' | 'paypal' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_intent_id: string | null
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
  estimated_delivery: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItemRaw[]
}

interface TrackingEventFromDB {
  id: number
  order_id: number
  status: string
  location: string | null
  description: string | null
  timestamp: string
  created_at: string
}

interface TransformedOrderItem {
  id: number
  orderId: number
  productId: number
  productSnapshot: unknown
  quantity: number
  priceEur: number
  totalEur: number
}

interface TransformedOrder {
  id: number
  orderNumber: string
  userId: string | null
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'stripe' | 'paypal' | 'cod'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentIntentId: string | null
  subtotalEur: number
  shippingCostEur: number
  taxEur: number
  totalEur: number
  shippingAddress: Address
  billingAddress: Address
  customerNotes: string | null
  adminNotes: string | null
  trackingNumber: string | null
  carrier: string | null
  estimatedDelivery: string | null
  shippedAt: string | null
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
  items: TransformedOrderItem[]
  tracking_events: TrackingEventFromDB[]
}

interface ApiResponse {
  success: boolean
  data: TransformedOrder
}

export default defineEventHandler(async (event): Promise<ApiResponse> => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Get user from session
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid authentication',
      })
    }

    // Get order ID from route params
    const orderId = getRouterParam(event, 'id')
    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required',
      })
    }

    // Fetch order with all details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          order_id,
          product_id,
          product_snapshot,
          quantity,
          price_eur,
          total_eur
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single() as { data: OrderFromDB | null, error: unknown }

    if (orderError || !order) {
      const errorObj = orderError as any
      if (errorObj?.code === 'PGRST116') {
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

    // Fetch tracking events for this order
    const { data: trackingEvents } = await supabase
      .from('order_tracking_events')
      .select('*')
      .eq('order_id', orderId)
      .order('timestamp', { ascending: false }) as { data: TrackingEventFromDB[] | null, error: unknown }

    // Transform order_items to items and convert snake_case to camelCase
    const transformedOrder: TransformedOrder = {
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
      items: (order.order_items || []).map((item): TransformedOrderItem => ({
        id: item.id,
        orderId: item.order_id ?? order.id,
        productId: item.product_id,
        productSnapshot: item.product_snapshot,
        quantity: item.quantity,
        priceEur: item.price_eur,
        totalEur: item.total_eur,
      })),
      tracking_events: trackingEvents || [],
    }

    return {
      success: true,
      data: transformedOrder,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Order fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
