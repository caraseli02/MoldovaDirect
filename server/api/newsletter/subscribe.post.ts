import { serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'

// Validation schema for newsletter subscription
const subscriptionSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  locale: z.enum(['es', 'en', 'ro', 'ru']).optional().default('es'),
  source: z.enum([
    'landing_page',
    'checkout',
    'account_settings',
    'product_page',
    'cart',
    'footer',
  ]).optional().default('landing_page'),
  metadata: z.record(z.unknown()).optional().default({}),
})

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const body = await readBody(event)

    // Validate input
    const validation = subscriptionSchema.safeParse(body)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input',
        data: validation.error.issues,
      })
    }

    const { email, locale, source, metadata } = validation.data

    // Add request metadata
    const headers = getHeaders(event)
    const enrichedMetadata = {
      ...metadata,
      userAgent: headers['user-agent'],
      referer: headers['referer'] || headers['referrer'],
      ip: headers['x-forwarded-for'] || headers['x-real-ip'],
      timestamp: new Date().toISOString(),
    }

    // Call the database function to handle subscription
    const { data, error } = await supabase.rpc('subscribe_to_newsletter', {
      p_email: email,
      p_locale: locale,
      p_source: source,
      p_metadata: enrichedMetadata,
    })

    if (error) {
      console.error('Newsletter subscription error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to subscribe to newsletter',
        data: error,
      })
    }

    // Check if the function returned data
    if (!data || data.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Subscription failed - no data returned',
      })
    }

    const subscription = data[0]
    const isNewSubscription = subscription.is_new_subscription

    // Return appropriate response
    return {
      success: true,
      message: isNewSubscription
        ? 'Successfully subscribed to newsletter'
        : 'Already subscribed to newsletter',
      data: {
        email: subscription.email,
        isNewSubscription,
      },
    }
  }
  catch (error: unknown) {
    console.error('Newsletter API error:', error)

    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Handle specific database errors
    if (error.code === '23505') {
      // Unique constraint violation (duplicate email)
      return {
        success: true,
        message: 'Already subscribed to newsletter',
        data: {
          email: error.detail?.match(/\(email\)=\(([^)]+)\)/)?.[1],
          isNewSubscription: false,
        },
      }
    }

    // Generic error response
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      data: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})
