// POST /api/checkout/create-order - Create order from checkout session
import { createClient } from '@supabase/supabase-js'

interface CreateOrderFromCheckoutRequest {
  sessionId: string
  items: Array<{
    productId: number
    productSnapshot: any
    quantity: number
    price: number
    total: number
  }>
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    street: string
    city: string
    postalCode: string
    province?: string
    country: string
    phone?: string
  }
  billingAddress: {
    firstName: string
    lastName: string
    company?: string
    street: string
    city: string
    postalCode: string
    province?: string
    country: string
    phone?: string
  }
  paymentMethod: 'cash' | 'credit_card' | 'paypal' | 'bank_transfer'
  paymentResult: {
    success: boolean
    transactionId: string
    paymentMethod: string
    status?: string
    pending?: boolean
  }
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  currency: string
}

export default defineEventHandler(async (event) => {
  try {
    // Create admin client with service role key (bypasses RLS)
    const supabase = createClient(
      useRuntimeConfig().public.supabaseUrl,
      useRuntimeConfig().supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse request body
    const body = await readBody(event) as CreateOrderFromCheckoutRequest

    // Validate required fields
    if (!body.sessionId || !body.items?.length || !body.shippingAddress || !body.paymentMethod) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }

    // Validate payment result
    if (!body.paymentResult?.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment was not successful'
      })
    }

    // Get user from session (optional for guest checkout)
    const authHeader = getHeader(event, 'authorization')
    let user = null
    let guestEmail = null

    if (authHeader) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (!authError && authUser) {
        user = authUser
      }
    }

    // For guest checkout, try to get email from shipping address or body
    if (!user) {
      // Guest checkout - we'll need email from somewhere
      // For now, we'll use a placeholder or get it from the session
      guestEmail = body.shippingAddress.phone || 'guest@checkout.com' // This should be passed in the request
    }

    // Generate order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase()

    // Map payment method to database values
    // Frontend uses: 'cash', 'credit_card', 'paypal', 'bank_transfer'
    // Database expects: 'stripe', 'paypal', 'cod'
    let dbPaymentMethod = 'cod'
    if (body.paymentMethod === 'credit_card') {
      dbPaymentMethod = 'stripe'
    } else if (body.paymentMethod === 'paypal') {
      dbPaymentMethod = 'paypal'
    } else if (body.paymentMethod === 'cash' || body.paymentMethod === 'bank_transfer') {
      dbPaymentMethod = 'cod'
    }

    // Determine payment status based on payment method
    // Database expects: 'pending', 'paid', 'failed', 'refunded'
    let paymentStatus = 'pending'
    if (body.paymentMethod === 'cash') {
      paymentStatus = 'pending' // Will be paid on delivery
    } else if (body.paymentResult.pending) {
      paymentStatus = 'pending' // Bank transfer pending
    } else if (body.paymentResult.success) {
      paymentStatus = 'paid' // Credit card or PayPal completed
    }

    // Determine order status
    let orderStatus = 'pending'
    if (paymentStatus === 'paid') {
      orderStatus = 'processing' // Ready to be fulfilled
    }

    // Create order
    const orderData: any = {
      order_number: orderNumber,
      user_id: user?.id || null,
      status: orderStatus,
      payment_method: dbPaymentMethod,
      payment_status: paymentStatus,
      payment_intent_id: body.paymentResult.transactionId,
      subtotal_eur: body.subtotal,
      shipping_cost_eur: body.shippingCost,
      tax_eur: body.tax,
      total_eur: body.total,
      shipping_address: body.shippingAddress,
      billing_address: body.billingAddress
    }

    // Add guest_email only if user is not authenticated
    if (!user && guestEmail) {
      orderData.guest_email = guestEmail
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Failed to create order:', orderError)
      console.error('Order data:', {
        order_number: orderNumber,
        user_id: user?.id || null,
        status: orderStatus,
        payment_method: dbPaymentMethod,
        payment_status: paymentStatus
      })
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create order: ${orderError.message || 'Unknown error'}`
      })
    }

    // Create order items - ensure productId is a number
    const orderItems = body.items.map(item => ({
      order_id: order.id,
      product_id: typeof item.productId === 'string' ? parseInt(item.productId, 10) : item.productId,
      product_snapshot: item.productSnapshot,
      quantity: item.quantity,
      price_eur: item.price,
      total_eur: item.total
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Failed to create order items:', itemsError)
      console.error('Order items data:', orderItems)
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create order items: ${itemsError.message || 'Unknown error'}`
      })
    }

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: order.total_eur,
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Order creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
