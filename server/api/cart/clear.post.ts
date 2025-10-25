// POST /api/cart/clear - Clear all items from cart
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Get user from session (optional for guest carts)
    const authHeader = getHeader(event, 'authorization')
    let userId = null

    if (authHeader) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (!authError && user) {
        userId = user.id
      }
    }

    // Get session ID from body or cookies
    const body = await readBody(event)
    const sessionId = body?.sessionId || getCookie(event, 'cart_session_id')

    console.log('[Cart API] clear-cart request', {
      hasAuthHeader: !!authHeader,
      userId,
      sessionIdFromBody: body?.sessionId,
      sessionIdFromCookie: getCookie(event, 'cart_session_id')
    })

    if (!userId && !sessionId) {
      return {
        success: true,
        message: 'No cart to clear'
      }
    }

    // Find the cart
    let cartQuery = supabase
      .from('carts')
      .select('id')
      .limit(1)

    if (userId) {
      cartQuery = cartQuery.eq('user_id', userId)
    } else {
      cartQuery = cartQuery.eq('session_id', sessionId)
    }

    const { data: carts, error: cartError } = await cartQuery

    if (cartError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to find cart'
      })
    }

    if (!carts || carts.length === 0) {
      // No cart found, nothing to clear
      console.log('[Cart API] clear-cart no cart found', { userId, sessionId })
      return {
        success: true,
        message: 'No cart to clear'
      }
    }

    const cartId = carts[0].id
    console.log('[Cart API] clear-cart deleting cart', { cartId })

    // Delete all cart items
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to clear cart items'
      })
    }

    // Optionally delete the cart itself
    const { error: cartDeleteError } = await supabase
      .from('carts')
      .delete()
      .eq('id', cartId)

    if (cartDeleteError) {
      console.error('Failed to delete cart:', cartDeleteError)
      // Don't throw - cart items are cleared which is the main goal
    }

    console.log('[Cart API] clear-cart success', { cartId })

    return {
      success: true,
      message: 'Cart cleared successfully'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Cart clear error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
