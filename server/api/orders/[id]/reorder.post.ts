// POST /api/orders/[id]/reorder - Add all items from an order to cart
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
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

    // Fetch order with items - verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_items (
          id,
          product_id,
          quantity,
          product_snapshot
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError) {
      if (orderError.code === 'PGRST116') {
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

    if (!order.order_items || order.order_items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order has no items to reorder',
      })
    }

    // Get or create cart for user
    const { data: initialCart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .is('session_id', null)
      .single()

    let cart = initialCart

    if (cartError && cartError.code === 'PGRST116') {
      // Create new cart
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({
          user_id: user.id,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .select('id')
        .single()

      if (createError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create cart',
        })
      }

      cart = newCart
    }
    else if (cartError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch cart',
      })
    }

    // Validate products still exist and have stock
    const validationResults = []
    const itemsToAdd = []

    for (const orderItem of order.order_items) {
      try {
        // Check if product still exists and is active
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, stock_quantity, is_active, price_eur')
          .eq('id', orderItem.product_id)
          .single()

        if (productError || !product || !product.is_active) {
          validationResults.push({
            productId: orderItem.product_id,
            productName: orderItem.product_snapshot?.name_translations?.en || 'Unknown',
            status: 'unavailable',
            reason: 'Product no longer available',
          })
          continue
        }

        // Check stock
        if (product.stock_quantity === 0) {
          validationResults.push({
            productId: orderItem.product_id,
            productName: orderItem.product_snapshot?.name_translations?.en || 'Unknown',
            status: 'out_of_stock',
            reason: 'Product is out of stock',
          })
          continue
        }

        // Adjust quantity if insufficient stock
        const availableQuantity = Math.min(orderItem.quantity, product.stock_quantity)

        itemsToAdd.push({
          productId: orderItem.product_id,
          quantity: availableQuantity,
          originalQuantity: orderItem.quantity,
          adjusted: availableQuantity < orderItem.quantity,
        })

        validationResults.push({
          productId: orderItem.product_id,
          productName: orderItem.product_snapshot?.name_translations?.en || 'Unknown',
          status: 'success',
          quantity: availableQuantity,
          adjusted: availableQuantity < orderItem.quantity,
          reason: availableQuantity < orderItem.quantity
            ? `Quantity adjusted from ${orderItem.quantity} to ${availableQuantity} due to stock availability`
            : null,
        })
      }
      catch {
        validationResults.push({
          productId: orderItem.product_id,
          productName: orderItem.product_snapshot?.name_translations?.en || 'Unknown',
          status: 'error',
          reason: 'Failed to validate product',
        })
      }
    }

    // Add items to cart
    const addedItems = []

    for (const item of itemsToAdd) {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', item.productId)
        .single()

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + item.quantity

        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)

        if (!updateError) {
          addedItems.push({
            productId: item.productId,
            quantity: item.quantity,
            totalQuantity: newQuantity,
            action: 'updated',
          })
        }
      }
      else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: item.productId,
            quantity: item.quantity,
          })

        if (!insertError) {
          addedItems.push({
            productId: item.productId,
            quantity: item.quantity,
            action: 'added',
          })
        }
      }
    }

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        cartId: cart.id,
        itemsProcessed: validationResults.length,
        itemsAdded: addedItems.length,
        validationResults,
        addedItems,
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Reorder error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
