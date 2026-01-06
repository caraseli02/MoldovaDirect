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
      apiVersion: '2025-08-27.basil',
    })
  }
  return stripe
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { paymentIntentId, paymentMethodId, sessionId } = body as {
      paymentIntentId?: string
      paymentMethodId?: string
      sessionId?: string
    }

    // Validate required fields
    if (!paymentIntentId || !sessionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: paymentIntentId, sessionId',
      })
    }

    let paymentIntent: Stripe.PaymentIntent

    const stripeInstance = getStripe()

    if (paymentMethodId) {
      // Confirm payment intent with payment method
      paymentIntent = await stripeInstance.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
        return_url: `${getHeader(event, 'origin')}/checkout/confirmation`,
      })
    }
    else {
      // Retrieve payment intent status
      paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId)
    }

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Retrieve charges separately if needed
      const charges = paymentIntent.latest_charge
        ? [await stripeInstance.charges.retrieve(paymentIntent.latest_charge as string)]
        : []

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          charges: charges.map(charge => ({
            id: charge.id,
            amount: charge.amount,
            currency: charge.currency,
            status: charge.status,
            payment_method_details: charge.payment_method_details,
          })),
        },
      }
    }
    else if (paymentIntent.status === 'requires_action') {
      return {
        success: false,
        requiresAction: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret,
        },
      }
    }
    else {
      return {
        success: false,
        error: 'Payment failed',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
        },
      }
    }
  }
  catch (error: unknown) {
    console.error('Failed to confirm payment:', getServerErrorMessage(error))

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
          statusMessage: 'Invalid payment confirmation request',
        })
      }
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to confirm payment',
    })
  }
})
