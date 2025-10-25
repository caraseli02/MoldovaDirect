// GET /api/payment-methods - Get user's saved payment methods
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Get user from session
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid authentication'
      })
    }

    // Fetch user's payment methods
    const { data: paymentMethods, error: paymentError } = await supabase
      .from('payment_methods')
      .select(`
        id,
        type,
        last_four,
        brand,
        expires_month,
        expires_year,
        is_default,
        created_at
      `)
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (paymentError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch payment methods'
      })
    }

    return {
      success: true,
      data: paymentMethods || []
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Payment methods fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})