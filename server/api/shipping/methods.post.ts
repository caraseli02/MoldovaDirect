// POST /api/shipping/methods - Get available shipping methods for cart and address
import { serverSupabaseServiceRole } from '#supabase/server'
import { getAvailableShippingMethods, calculateOrderTotals } from '~/server/utils/orderUtils'
import type { CartItem } from '~/types/database'

interface ShippingMethodsRequest {
  cartId: number
  shippingAddress: {
    country: string
    postalCode: string
    city: string
    province?: string
  }
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Parse request body
    const body = await readBody(event) as ShippingMethodsRequest

    if (!body.cartId || !body.shippingAddress) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cart ID and shipping address are required',
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
          price_eur,
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

    // Get available shipping methods
    const shippingMethods = getAvailableShippingMethods(cartItems as any, body.shippingAddress)

    // Calculate totals for each shipping method
    const methodsWithTotals = shippingMethods.map((method) => {
      const calculation = calculateOrderTotals(cartItems as any, method, body.shippingAddress)
      return {
        ...method,
        total: calculation.total,
        subtotal: calculation.subtotal,
        tax: calculation.tax,
      }
    })

    return {
      success: true,
      data: {
        shippingMethods: methodsWithTotals,
        cartSummary: {
          itemCount: cartItems.length,
          totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: cartItems.reduce((sum, item) => sum + (item.products.price_eur * item.quantity), 0),
        },
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Shipping methods error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
