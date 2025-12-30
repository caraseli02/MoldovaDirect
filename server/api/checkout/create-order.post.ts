// POST /api/checkout/create-order - Create order from checkout session
import { serverSupabaseServiceRole } from '#supabase/server'
import { createLogger } from '~/server/utils/secureLogger'
import { validateOrigin } from '~/server/utils/csrfProtection'

const logger = createLogger('checkout-create-order')

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
    method?: string
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
    // ========================================
    // CSRF PROTECTION - Validate request origin
    // ========================================
    const originResult = validateOrigin(event)
    if (!originResult.valid) {
      logger.warn('CSRF origin validation failed', {
        reason: originResult.reason,
        ip: getHeader(event, 'x-forwarded-for') || 'unknown',
      })
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Invalid request origin',
      })
    }

    // Create admin client with service role key (bypasses RLS)
    const supabase = serverSupabaseServiceRole(event)

    // Parse request body
    const body = await readBody(event) as CreateOrderFromCheckoutRequest

    logger.info('Order creation request received', {
      sessionId: body.sessionId,
      itemCount: body.items?.length || 0,
      // PII fields will be automatically redacted by secure logger
      guestEmail: body.guestEmail,
      paymentMethod: body.paymentMethod,
      hasShippingAddress: !!body.shippingAddress,
      hasAuthHeader: !!getHeader(event, 'authorization'),
    })

    // Validate required fields
    if (!body.sessionId || !body.items?.length || !body.shippingAddress || !body.paymentMethod) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      })
    }

    // Validate payment result
    if (!body.paymentResult?.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment was not successful',
      })
    }

    // ========================================
    // SERVER-SIDE PRICE VERIFICATION (Security)
    // ========================================
    // CRITICAL: Never trust client-sent prices. Always verify against database.
    const productIds = body.items.map(item => item.productId)

    const { data: dbProducts, error: productsError } = await supabase
      .from('products')
      .select('id, price_eur, name_translations, is_active, stock_quantity')
      .in('id', productIds)

    if (productsError || !dbProducts) {
      logger.error('Failed to fetch products for price verification', {
        error: productsError?.message,
        productIds,
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify product prices',
      })
    }

    // Create a map for quick lookup
    const productPriceMap = new Map(dbProducts.map(p => [p.id, p]))

    // Verify each item and calculate server-side totals
    let serverSubtotal = 0
    const verifiedItems: Array<{
      productId: number
      productSnapshot: ProductSnapshot
      quantity: number
      price: number
      total: number
    }> = []

    for (const item of body.items) {
      const dbProduct = productPriceMap.get(item.productId)

      if (!dbProduct) {
        logger.warn('Product not found during price verification', {
          productId: item.productId,
          sessionId: body.sessionId,
        })
        throw createError({
          statusCode: 400,
          statusMessage: `Product with ID ${item.productId} not found`,
        })
      }

      if (!dbProduct.is_active) {
        throw createError({
          statusCode: 400,
          statusMessage: 'One or more products are no longer available',
        })
      }

      // Use server-side price, not client-sent price
      const serverPrice = dbProduct.price_eur
      const serverItemTotal = serverPrice * item.quantity
      serverSubtotal += serverItemTotal

      // Log price discrepancy if detected (potential fraud attempt)
      if (Math.abs(item.price - serverPrice) > 0.01) {
        logger.warn('Price discrepancy detected - potential tampering', {
          productId: item.productId,
          clientPrice: item.price,
          serverPrice: serverPrice,
          difference: item.price - serverPrice,
          sessionId: body.sessionId,
        })
      }

      // Build verified item with server-side prices
      verifiedItems.push({
        productId: item.productId,
        productSnapshot: {
          ...item.productSnapshot,
          price: serverPrice, // Override with server price
        },
        quantity: item.quantity,
        price: serverPrice,
        total: serverItemTotal,
      })
    }

    // Calculate server-side shipping cost based on method
    const shippingMethod = body.shippingAddress?.method || 'standard'
    let serverShippingCost = 5.99 // Default standard shipping
    if (shippingMethod === 'express') {
      serverShippingCost = 12.99
    }
    else if (shippingMethod === 'free' && serverSubtotal >= 50) {
      serverShippingCost = 0
    }

    // Calculate server-side tax (configurable, default 0 for now)
    const TAX_RATE = 0 // No tax in current configuration
    const serverTax = serverSubtotal * TAX_RATE

    // Calculate server-side total
    const serverTotal = serverSubtotal + serverShippingCost + serverTax

    // Log if total discrepancy detected
    if (Math.abs(body.total - serverTotal) > 0.01) {
      logger.warn('Total discrepancy detected - using server-calculated values', {
        clientTotal: body.total,
        serverTotal: serverTotal,
        clientSubtotal: body.subtotal,
        serverSubtotal: serverSubtotal,
        clientShipping: body.shippingCost,
        serverShipping: serverShippingCost,
        sessionId: body.sessionId,
      })
    }

    logger.info('Price verification completed', {
      sessionId: body.sessionId,
      serverSubtotal,
      serverShippingCost,
      serverTax,
      serverTotal,
      itemCount: verifiedItems.length,
    })

    // Use verified items and server-calculated totals from here on
    // ========================================

    // Get user from session (optional for guest checkout)
    const authHeader = getHeader(event, 'authorization')
    let user = null
    let guestEmail = body.guestEmail || null

    if (authHeader) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', ''),
      )
      if (!authError && authUser) {
        user = authUser
      }
    }

    logger.info('User resolution completed', {
      isAuthenticated: !!user,
      // PII will be automatically redacted
      guestEmail,
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
    }
    else if (body.paymentMethod === 'paypal') {
      dbPaymentMethod = 'paypal'
    }
    else if (body.paymentMethod === 'cash' || body.paymentMethod === 'bank_transfer') {
      dbPaymentMethod = 'cod'
    }

    // Determine payment status based on payment method
    // Database expects: 'pending', 'paid', 'failed', 'refunded'
    let paymentStatus = 'pending'
    if (body.paymentMethod === 'cash') {
      paymentStatus = 'pending' // Will be paid on delivery
    }
    else if (body.paymentResult.pending) {
      paymentStatus = 'pending' // Bank transfer pending
    }
    else if (body.paymentResult.success) {
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
      subtotal_eur: serverSubtotal, // Use server-verified price
      shipping_cost_eur: serverShippingCost, // Use server-calculated shipping
      tax_eur: serverTax, // Use server-calculated tax
      total_eur: serverTotal, // Use server-calculated total
      shipping_address: body.shippingAddress,
      billing_address: body.billingAddress,
    }

    // Add guest_email only if user is not authenticated
    if (!user && guestEmail) {
      orderData.guest_email = guestEmail
    }

    logger.info('Creating order record', {
      orderNumber,
      userId: user?.id,
      paymentMethod: orderData.payment_method,
      paymentStatus,
      hasGuestEmail: !!orderData.guest_email,
    })

    // Prepare order items for RPC function - use VERIFIED items with server prices
    const orderItemsData = verifiedItems.map(item => ({
      product_id: typeof item.productId === 'string' ? parseInt(item.productId, 10) : item.productId,
      product_snapshot: item.productSnapshot,
      quantity: item.quantity,
      price_eur: item.price, // Server-verified price
      total_eur: item.total, // Server-calculated total
    }))

    // Call atomic RPC function that creates order + updates inventory in a single transaction
    const { data, error: rpcError } = await supabase.rpc('create_order_with_inventory', {
      order_data: orderData,
      order_items_data: orderItemsData,
    })

    if (rpcError) {
      logger.error('Failed to create order with inventory', {
        error: rpcError.message,
        orderNumber,
        userId: user?.id || null,
        status: orderStatus,
        paymentMethod: dbPaymentMethod,
        paymentStatus,
      })

      // Check if error is due to insufficient stock
      // SECURITY: Sanitize error message to prevent exposing internal details
      if (rpcError.message?.includes('Insufficient stock')) {
        throw createError({
          statusCode: 409,
          statusMessage: 'One or more items in your cart are out of stock. Please review your cart and try again.',
        })
      }

      // Check if error is due to product being locked/processed
      if (rpcError.message?.includes('currently being processed')) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Some items are currently being processed by other orders. Please try again in a moment.',
        })
      }

      // Check if error is due to product not found
      if (rpcError.message?.includes('not found or inactive')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'One or more items in your cart are no longer available.',
        })
      }

      // Log full error for debugging but return sanitized message to user
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create order. Please try again or contact support.',
      })
    }

    // Extract order from RPC response
    const order = data?.order

    if (!order) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Order creation succeeded but no order data returned',
      })
    }

    logger.info('Order created successfully with inventory update', {
      orderId: order.id,
      orderNumber: order.order_number,
      // PII will be automatically redacted
      guestEmail: orderData.guest_email,
      userId: user?.id,
    })

    // Save user preferences for authenticated users
    if (user?.id && body.shippingAddress) {
      try {
        // Extract shipping method from the request
        // Use explicit method if provided, otherwise determine based on shipping cost
        const shippingMethodId = body.shippingAddress?.method || (body.shippingCost > 0 ? 'standard' : 'free')

        // Upsert user checkout preferences
        const { error: prefError } = await supabase
          .from('user_checkout_preferences')
          .upsert({
            user_id: user.id,
            preferred_shipping_method: shippingMethodId,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          })

        if (prefError) {
          // Log error but don't fail the order
          logger.warn('Failed to save user preferences', {
            userId: user.id,
            error: prefError.message,
          })
        }
        else {
          logger.info('User preferences saved', {
            userId: user.id,
            shippingMethod: shippingMethodId,
          })
        }
      }
      catch (prefError: any) {
        // Don't fail the order if preference saving fails
        logger.warn('Error saving user preferences', {
          userId: user.id,
          error: prefError.message || 'Unknown error',
        })
      }
    }

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: order.total_eur || order.total,
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    logger.error('Order creation failed', { error: error.message || 'Unknown error' })
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
