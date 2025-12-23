// POST /api/cart/validate - Validate cart items before checkout
import { serverSupabaseServiceRole } from '#supabase/server'
import { validateCartItems, calculateOrderTotals, getAvailableShippingMethods } from '~/server/utils/orderUtils'

interface ValidateCartRequest {
  cartId: number
  shippingAddress?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Parse request body
    const body = await readBody(event) as ValidateCartRequest

    if (!body.cartId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cart ID is required',
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
          weight_kg,
          stock_quantity,
          is_active
        )
      `)
      .eq('cart_id', body.cartId)

    if (cartError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch cart items',
      })
    }

    if (!cartItems?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cart is empty',
      })
    }

    // Validate cart items
    const validation = validateCartItems(cartItems as any)

    if (!validation.valid) {
      return {
        success: false,
        valid: false,
        errors: validation.errors,
      }
    }

    // Calculate order totals
    const orderCalculation = calculateOrderTotals(cartItems as any)

    // Get available shipping methods
    const shippingMethods = getAvailableShippingMethods(cartItems as any, body.shippingAddress)

    return {
      success: true,
      valid: true,
      data: {
        items: cartItems,
        subtotal: orderCalculation.subtotal,
        itemCount: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        shippingMethods,
        estimatedTotal: {
          min: orderCalculation.subtotal + Math.min(...shippingMethods.map(m => m.price)),
          max: orderCalculation.subtotal + Math.max(...shippingMethods.map(m => m.price)),
        },
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Cart validation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
