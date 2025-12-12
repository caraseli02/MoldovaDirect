// POST /api/orders/create - Create a new order from cart
import { serverSupabaseServiceRole } from '#supabase/server'
import { sendOrderConfirmationEmail } from '~/server/utils/orderEmails'
import {
  extractCustomerInfoFromOrder,
  transformOrderToEmailData,
  validateOrderForEmail,
} from '~/server/utils/orderDataTransform'

interface CreateOrderRequest {
  cartId: number
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
  billingAddress?: {
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
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer'
  paymentIntentId?: string
  shippingMethod?: {
    id: string
    name: string
    price: number
    estimatedDays: number
  }
  customerNotes?: string
  guestEmail?: string
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Parse request body
    const body = await readBody(event) as CreateOrderRequest

    // Validate required fields
    if (!body.cartId || !body.shippingAddress || !body.paymentMethod) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      })
    }

    // Get user from session (optional for guest checkout)
    const authHeader = getHeader(event, 'authorization')
    let user = null

    if (authHeader) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', ''),
      )
      if (!authError && authUser) {
        user = authUser
      }
    }

    // For guest checkout, email is required
    if (!user && !body.guestEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required for guest checkout',
      })
    }

    // Validate cart and get items
    const { data: cartValidation, error: validationError } = await supabase
      .rpc('validate_cart_for_checkout', { cart_id_param: body.cartId })

    if (validationError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to validate cart',
      })
    }

    if (!cartValidation[0]?.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cart validation failed',
        data: cartValidation[0]?.errors,
      })
    }

    // Get cart items with product details
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        products (
          id,
          sku,
          name_translations,
          description_translations,
          price_eur,
          images,
          weight_kg
        )
      `)
      .eq('cart_id', body.cartId)

    if (cartError || !cartItems?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cart is empty or invalid',
      })
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.products.price_eur * item.quantity)
    }, 0)

    const shippingCost = body.shippingMethod?.price || 0
    const tax = 0 // Tax calculation would be implemented based on business rules
    const total = subtotal + shippingCost + tax

    // Use billing address same as shipping if not provided
    const billingAddress = body.billingAddress || body.shippingAddress

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        guest_email: body.guestEmail || null,
        status: 'pending',
        payment_method: body.paymentMethod,
        payment_status: 'pending',
        payment_intent_id: body.paymentIntentId || null,
        subtotal_eur: subtotal,
        shipping_cost_eur: shippingCost,
        tax_eur: tax,
        total_eur: total,
        shipping_address: body.shippingAddress,
        billing_address: billingAddress,
        shipping_method: body.shippingMethod || null,
        customer_notes: body.customerNotes || null,
      })
      .select()
      .single()

    if (orderError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create order',
      })
    }

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_snapshot: item.products,
      quantity: item.quantity,
      price_eur: item.products.price_eur,
      total_eur: item.products.price_eur * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create order items',
      })
    }

    // Fetch complete order with items for email
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price_eur,
          total_eur,
          product_snapshot
        )
      `)
      .eq('id', order.id)
      .single()

    if (fetchError || !completeOrder) {
      console.error('Failed to fetch complete order for email:', fetchError)
    }

    // Send order confirmation email (non-blocking)
    // Requirements: 1.1, 1.6
    if (completeOrder) {
      // Send email asynchronously without blocking the response
      sendOrderConfirmationEmailAsync(completeOrder, user, supabase)
        .catch((error: any) => {
          console.error('Failed to send order confirmation email:', error)
          // Email failure doesn't block order creation
        })
    }

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        total: order.total_eur,
        status: order.status,
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Order creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})

/**
 * Send order confirmation email asynchronously
 * Handles both authenticated users and guest checkout
 * Requirements: 1.1, 1.6
 *
 * @param order - Complete order with items
 * @param user - Authenticated user (if any)
 * @param supabase - Supabase client
 */
async function sendOrderConfirmationEmailAsync(
  order: Record<string, any>,
  user: User | null,
  supabase: SupabaseClient,
): Promise<void> {
  try {
    // Validate order data before sending email
    const validation = validateOrderForEmail(order)
    if (!validation.isValid) {
      console.error('Order validation failed for email:', validation.errors)
      return
    }

    // Get user profile if authenticated
    let userProfile = null
    if (user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, preferred_locale')
        .eq('id', user.id)
        .single()

      userProfile = profile
    }

    // Extract customer information (handles both authenticated and guest)
    const customerInfo = await extractCustomerInfoFromOrder(order, userProfile)

    // Transform order data for email template
    const emailData = transformOrderToEmailData(
      order,
      customerInfo.name,
      customerInfo.email,
      customerInfo.locale,
    )

    // Send confirmation email
    const result = await sendOrderConfirmationEmail(emailData, { supabaseClient: supabase })

    if (!result.success) {
      console.error(`❌ Failed to send order confirmation email for order ${order.order_number}:`, result.error)
    }
  }
  catch (error: any) {
    console.error('Error in sendOrderConfirmationEmailAsync:', error)
    // Don't throw - email failure should not affect order creation
  }
}
