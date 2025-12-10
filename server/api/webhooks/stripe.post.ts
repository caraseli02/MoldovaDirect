import Stripe from 'stripe'
import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

/**
 * Stripe Webhook Handler
 *
 * Handles asynchronous payment events from Stripe:
 * - payment_intent.succeeded: Confirms successful payment
 * - payment_intent.payment_failed: Marks payment as failed
 * - charge.refunded: Updates order to refunded status
 *
 * Security: Verifies webhook signature to ensure events are from Stripe
 *
 * @endpoint POST /api/webhooks/stripe
 */

let stripeInstance: Stripe | null = null

function getStripe(secretKey: string): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    })
  }
  return stripeInstance
}

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()
  const stripeSecretKey = config.stripeSecretKey
  const webhookSecret = config.stripeWebhookSecret

  if (!stripeSecretKey || !webhookSecret) {
    console.error('[Stripe Webhook] Missing Stripe configuration')
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe configuration missing',
    })
  }

  // Get raw body for signature verification
  const body = await readRawBody(event)
  if (!body) {
    console.error('[Stripe Webhook] Missing request body')
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing request body',
    })
  }

  // Get Stripe signature from headers
  const signature = getHeader(event, 'stripe-signature')
  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header')
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing stripe-signature header',
    })
  }

  const stripe = getStripe(stripeSecretKey)

  // Verify webhook signature
  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    )
  }
  catch (err) {
    const error = err as Error
    console.error('[Stripe Webhook] Signature verification failed:', error.message)
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook signature verification failed: ${error.message}`,
    })
  }

  // Handle the event based on type
  try {
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event, stripeEvent.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event, stripeEvent.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event, stripeEvent.data.object as Stripe.Charge)
        break

      case 'payment_intent.created':
      case 'payment_intent.canceled':
      case 'charge.succeeded':
        // Log these events but don't take action (handled elsewhere)
        break

      default:
    }

    // Return success response
    return {
      received: true,
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
    }
  }
  catch (error: any) {
    console.error(`[Stripe Webhook] Error processing event ${stripeEvent.type}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Error processing webhook: ${error.message}`,
    })
  }
})

/**
 * Handle successful payment intent
 * Updates order payment_status to 'paid'
 */
async function handlePaymentIntentSucceeded(
  event: H3Event,
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  const paymentIntentId = paymentIntent.id
  const amountReceived = paymentIntent.amount_received
  const currency = paymentIntent.currency

  // Get Supabase service role client (bypasses RLS for webhook operations)
  const client = serverSupabaseServiceRole(event)

  // Find order by payment_intent_id
  const { data: order, error: fetchError } = await client
    .from('orders')
    .select('id, order_number, payment_status, total_eur')
    .eq('payment_intent_id', paymentIntentId)
    .single()

  if (fetchError || !order) {
    console.error(
      `[Stripe Webhook] Order not found for payment intent ${paymentIntentId}:`,
      fetchError,
    )
    // Throw error to trigger Stripe retry - order might not exist yet (race condition)
    // Stripe will retry the webhook and eventually the order should exist
    throw new Error(`Order not found for payment intent ${paymentIntentId}`)
  }

  // Check if already marked as paid (idempotency)
  if (order.payment_status === 'paid') {
    return
  }

  // Verify amount matches
  const expectedAmountCents = Math.round(order.total_eur * 100)
  if (amountReceived !== expectedAmountCents) {
    console.error(
      `[Stripe Webhook] Amount mismatch for order ${order.order_number}: `
      + `expected ${expectedAmountCents}, received ${amountReceived}`,
    )
    // Still update status but log warning
  }

  // Update order payment status to 'paid'
  const { error: updateError } = await client
    .from('orders')
    .update({
      payment_status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  if (updateError) {
    console.error(
      `[Stripe Webhook] Failed to update order ${order.order_number}:`,
      updateError,
    )
    throw new Error(`Failed to update order payment status: ${updateError.message}`)
  }
}

/**
 * Handle failed payment intent
 * Updates order payment_status to 'failed'
 */
async function handlePaymentIntentFailed(
  event: H3Event,
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  const paymentIntentId = paymentIntent.id
  const failureMessage = paymentIntent.last_payment_error?.message || 'Unknown error'

  // Get Supabase service role client (bypasses RLS for webhook operations)
  const client = serverSupabaseServiceRole(event)

  // Find order by payment_intent_id
  const { data: order, error: fetchError } = await client
    .from('orders')
    .select('id, order_number, payment_status')
    .eq('payment_intent_id', paymentIntentId)
    .single()

  if (fetchError || !order) {
    console.error(
      `[Stripe Webhook] Order not found for payment intent ${paymentIntentId}:`,
      fetchError,
    )
    // Throw error to trigger Stripe retry - order might not exist yet (race condition)
    throw new Error(`Order not found for payment intent ${paymentIntentId}`)
  }

  // Check if already marked as failed (idempotency)
  if (order.payment_status === 'failed') {
    return
  }

  // Update order payment status to 'failed'
  const { error: updateError } = await client
    .from('orders')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  if (updateError) {
    console.error(
      `[Stripe Webhook] Failed to update order ${order.order_number}:`,
      updateError,
    )
    throw new Error(`Failed to update order payment status: ${updateError.message}`)
  }
}

/**
 * Handle charge refunded
 * Updates order payment_status to 'refunded'
 */
async function handleChargeRefunded(
  event: H3Event,
  charge: Stripe.Charge,
): Promise<void> {
  const chargeId = charge.id
  const paymentIntentId = charge.payment_intent as string
  const amountRefunded = charge.amount_refunded
  const currency = charge.currency

  if (!paymentIntentId) {
    console.error(`[Stripe Webhook] No payment intent ID found for charge ${chargeId}`)
    return
  }

  // Get Supabase service role client (bypasses RLS for webhook operations)
  const client = serverSupabaseServiceRole(event)

  // Find order by payment_intent_id
  const { data: order, error: fetchError } = await client
    .from('orders')
    .select('id, order_number, payment_status, total_eur')
    .eq('payment_intent_id', paymentIntentId)
    .single()

  if (fetchError || !order) {
    console.error(
      `[Stripe Webhook] Order not found for payment intent ${paymentIntentId}:`,
      fetchError,
    )
    // Throw error to trigger Stripe retry - order might not exist yet (race condition)
    throw new Error(`Order not found for payment intent ${paymentIntentId}`)
  }

  // Check if already marked as refunded (idempotency)
  if (order.payment_status === 'refunded') {
    return
  }

  // Check if full refund
  const fullRefund = charge.refunded === true
  const refundStatus = fullRefund ? 'refunded' : 'paid' // Partial refunds keep 'paid' status

  // Update order payment status
  const { error: updateError } = await client
    .from('orders')
    .update({
      payment_status: refundStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  if (updateError) {
    console.error(
      `[Stripe Webhook] Failed to update order ${order.order_number}:`,
      updateError,
    )
    throw new Error(`Failed to update order payment status: ${updateError.message}`)
  }
}
