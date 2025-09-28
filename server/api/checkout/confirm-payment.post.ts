import Stripe from 'stripe'

// Initialize Stripe only if the secret key is available
let stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Credit card payments are currently unavailable - service not configured'
      })
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20'
    })
  }
  return stripe
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { paymentIntentId, paymentMethodId, sessionId } = body

    // Validate required fields
    if (!paymentIntentId || !sessionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: paymentIntentId, sessionId'
      })
    }

    let paymentIntent

    const stripeInstance = getStripe()
    
    if (paymentMethodId) {
      // Confirm payment intent with payment method
      paymentIntent = await stripeInstance.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
        return_url: `${getHeader(event, 'origin')}/checkout/confirmation`
      })
    } else {
      // Retrieve payment intent status
      paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId)
    }

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          charges: paymentIntent.charges.data.map(charge => ({
            id: charge.id,
            amount: charge.amount,
            currency: charge.currency,
            status: charge.status,
            payment_method_details: charge.payment_method_details
          }))
        }
      }
    } else if (paymentIntent.status === 'requires_action') {
      return {
        success: false,
        requiresAction: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret
        }
      }
    } else {
      return {
        success: false,
        error: 'Payment failed',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status
        }
      }
    }

  } catch (error) {
    console.error('Failed to confirm payment:', error)
    
    if (error.statusCode) {
      throw error
    }

    // Handle Stripe errors
    if (error.type === 'StripeCardError') {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }

    if (error.type === 'StripeInvalidRequestError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid payment confirmation request'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to confirm payment'
    })
  }
})