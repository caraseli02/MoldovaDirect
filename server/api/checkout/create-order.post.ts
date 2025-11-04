// POST /api/checkout/create-order - Create order from checkout session
import { serverSupabaseServiceRole } from '#supabase/server'

interface ProductSnapshot {
  id: number
  name: string
  price: number
  description?: string
  image_url?: string
  sku?: string
  category?: string
}

interface CreateOrderFromCheckoutRequest {
  sessionId: string
  items: Array<{
    productId: number
    productSnapshot: ProductSnapshot
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
  guestEmail?: string
  customerName?: string
  locale?: string
  marketingConsent?: boolean
}

export default defineEventHandler(async (event) => {
  try {
    // Create admin client with service role key (bypasses RLS)
    const supabase = serverSupabaseServiceRole(event)

    // Parse request body
    const body = await readBody(event) as CreateOrderFromCheckoutRequest

    console.log('[Checkout API] create-order request received', {
      sessionId: body.sessionId,
      itemCount: body.items?.length || 0,
      guestEmail: body.guestEmail,
      paymentMethod: body.paymentMethod,
      hasShippingAddress: !!body.shippingAddress,
      hasAuthHeader: !!getHeader(event, 'authorization')
    })

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
    let guestEmail = body.guestEmail || null

    if (authHeader) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (!authError && authUser) {
        user = authUser
      }
    }

    console.log('[Checkout API] create-order user resolution', {
      isAuthenticated: !!user,
      guestEmail
    })

    // For guest checkout, try to get email from shipping address or body
    if (!user && !guestEmail) {
      guestEmail = null
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
    const orderData: {
      order_number: string
      user_id: string | null
      status: string
      payment_method: string
      payment_status: string
      payment_intent_id: string
      subtotal_eur: number
      shipping_cost_eur: number
      tax_eur: number
      total_eur: number
      shipping_address: typeof body.shippingAddress
      billing_address: typeof body.billingAddress
      guest_email?: string
    } = {
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

    console.log('[Checkout API] creating order record', {
      orderNumber,
      userId: user?.id,
      paymentMethod: orderData.payment_method,
      paymentStatus,
      hasGuestEmail: !!orderData.guest_email
    })

    // Prepare order items for RPC function - ensure productId is a number
    const orderItemsData = body.items.map(item => ({
      product_id: typeof item.productId === 'string' ? parseInt(item.productId, 10) : item.productId,
      product_snapshot: item.productSnapshot,
      quantity: item.quantity,
      price_eur: item.price,
      total_eur: item.total
    }))

    // Call atomic RPC function that creates order + updates inventory in a single transaction
    const { data, error: rpcError } = await supabase.rpc('create_order_with_inventory', {
      order_data: orderData,
      order_items_data: orderItemsData
    })

    if (rpcError) {
      console.error('Failed to create order with inventory:', rpcError)
      console.error('Order data:', {
        order_number: orderNumber,
        user_id: user?.id || null,
        status: orderStatus,
        payment_method: dbPaymentMethod,
        payment_status: paymentStatus
      })

      // Check if error is due to insufficient stock
      // SECURITY: Sanitize error message to prevent exposing internal details
      if (rpcError.message?.includes('Insufficient stock')) {
        throw createError({
          statusCode: 409,
          statusMessage: 'One or more items in your cart are out of stock. Please review your cart and try again.'
        })
      }

      // Check if error is due to product being locked/processed
      if (rpcError.message?.includes('currently being processed')) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Some items are currently being processed by other orders. Please try again in a moment.'
        })
      }

      // Check if error is due to product not found
      if (rpcError.message?.includes('not found or inactive')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'One or more items in your cart are no longer available.'
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create order: ${rpcError.message || 'Unknown error'}`
      })
    }

    // Extract order from RPC response
    const order = data?.order

    if (!order) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Order creation succeeded but no order data returned'
      })
    }

    console.log('[Checkout API] create-order success (atomic with inventory update)', {
      orderId: order.id,
      orderNumber: order.order_number,
      guestEmail: orderData.guest_email,
      userId: user?.id
    })

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: order.total,
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
