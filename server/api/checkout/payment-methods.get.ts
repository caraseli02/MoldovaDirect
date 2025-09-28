import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Get user from session
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const runtimeConfig = useRuntimeConfig()
    const supabase = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceKey
    )

    // Get saved payment methods for user
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load payment methods:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load payment methods'
      })
    }

    const paymentMethods = data.map(method => ({
      id: method.id.toString(),
      type: method.type,
      lastFour: method.last_four,
      brand: method.brand,
      expiryMonth: method.expires_month,
      expiryYear: method.expires_year,
      isDefault: method.is_default
    }))

    return {
      success: true,
      paymentMethods
    }

  } catch (error) {
    console.error('Load payment methods error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load payment methods'
    })
  }
})