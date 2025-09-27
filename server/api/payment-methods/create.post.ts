// POST /api/payment-methods/create - Save a new payment method
import { createClient } from '@supabase/supabase-js'

interface CreatePaymentMethodRequest {
  type: 'credit_card' | 'paypal'
  providerId: string // Stripe customer ID, PayPal reference, etc.
  lastFour?: string
  brand?: string
  expiresMonth?: number
  expiresYear?: number
  isDefault?: boolean
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = createClient(
      useRuntimeConfig().public.supabaseUrl,
      useRuntimeConfig().supabaseServiceKey
    )

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

    // Parse request body
    const body = await readBody(event) as CreatePaymentMethodRequest

    // Validate required fields
    if (!body.type || !body.providerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Type and provider ID are required'
      })
    }

    // If this is set as default, unset other defaults
    if (body.isDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    // Create payment method
    const { data: paymentMethod, error: createError } = await supabase
      .from('payment_methods')
      .insert({
        user_id: user.id,
        type: body.type,
        provider_id: body.providerId,
        last_four: body.lastFour || null,
        brand: body.brand || null,
        expires_month: body.expiresMonth || null,
        expires_year: body.expiresYear || null,
        is_default: body.isDefault || false
      })
      .select()
      .single()

    if (createError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save payment method'
      })
    }

    return {
      success: true,
      data: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        lastFour: paymentMethod.last_four,
        brand: paymentMethod.brand,
        expiresMonth: paymentMethod.expires_month,
        expiresYear: paymentMethod.expires_year,
        isDefault: paymentMethod.is_default
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Payment method creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})