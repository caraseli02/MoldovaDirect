import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { paymentMethodId, type, lastFour, brand, expiryMonth, expiryYear, isDefault } = body

    // Get user from session
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Validate required fields
    if (!paymentMethodId || !type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: paymentMethodId, type'
      })
    }

    const runtimeConfig = useRuntimeConfig()
    const supabase = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceKey
    )

    // If this is set as default, unset other default payment methods
    if (isDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    // Save payment method
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: user.id,
        type,
        provider_id: paymentMethodId,
        last_four: lastFour,
        brand,
        expires_month: expiryMonth,
        expires_year: expiryYear,
        is_default: isDefault || false
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to save payment method:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save payment method'
      })
    }

    return {
      success: true,
      paymentMethod: {
        id: data.id,
        type: data.type,
        lastFour: data.last_four,
        brand: data.brand,
        expiryMonth: data.expires_month,
        expiryYear: data.expires_year,
        isDefault: data.is_default
      }
    }

  } catch (error) {
    console.error('Save payment method error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save payment method'
    })
  }
})