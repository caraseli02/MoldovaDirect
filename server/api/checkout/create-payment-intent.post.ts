import Stripe from 'stripe'

// Initialize Stripe only if the secret key is available
let stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Credit card payments are currently unavailable - service not configured',
      })
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    })
  }
  return stripe
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { amount, currency = 'eur', sessionId } = body

    // Validate required fields
    if (!amount || !sessionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: amount, sessionId',
      })
    }

    // Validate amount (must be positive integer in cents)
    if (!Number.isInteger(amount) || amount <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Amount must be a positive integer in cents',
      })
    }

    // Create payment intent with Stripe
    const stripeInstance = getStripe()
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata: {
        sessionId,
        source: 'moldovan-products-checkout',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
    }
  }
  catch (error: unknown) {
    console.error('Failed to create payment intent:', getServerErrorMessage(error))

    // Check if it's a createError with statusCode
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Handle Stripe errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as { type: string, message?: string }

      if (stripeError.type === 'StripeCardError') {
        throw createError({
          statusCode: 400,
          statusMessage: stripeError.message || 'Card error',
        })
      }

      if (stripeError.type === 'StripeInvalidRequestError') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid payment request',
        })
      }
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create payment intent',
    })
  }
})
