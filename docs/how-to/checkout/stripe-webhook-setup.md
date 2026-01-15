# Stripe Webhook Setup Guide

## Steps


This guide explains how to set up and configure Stripe webhooks for Moldova Direct to handle asynchronous payment events.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Production Setup](#production-setup)
5. [Testing Webhooks](#testing-webhooks)
6. [Troubleshooting](#troubleshooting)
7. [Security Considerations](#security-considerations)

## Overview

The Moldova Direct application uses Stripe webhooks to handle asynchronous payment events. This ensures that order statuses are updated reliably even if the customer closes their browser after payment.

### Supported Events

The webhook endpoint (`/api/webhooks/stripe`) handles the following Stripe events:

| Event Type | Description | Action Taken |
|------------|-------------|--------------|
| `payment_intent.succeeded` | Payment completed successfully | Updates order `payment_status` to `paid` |
| `payment_intent.payment_failed` | Payment attempt failed | Updates order `payment_status` to `failed` |
| `charge.refunded` | Payment was refunded | Updates order `payment_status` to `refunded` (full) or keeps as `paid` (partial) |

### Architecture

```
┌─────────┐         ┌──────────┐         ┌──────────────┐
│ Stripe  │────────>│ Webhook  │────────>│  Supabase    │
│ Event   │  HTTPS  │ Endpoint │  Update │  Database    │
└─────────┘         └──────────┘         └──────────────┘
    │                     │
    │                     ├─> Verify Signature
    │                     ├─> Parse Event
    │                     ├─> Find Order
    │                     └─> Update Status
```

## Prerequisites

Before setting up webhooks, ensure you have:

1. **Stripe Account**: A Stripe account (test or live mode)
2. **Stripe API Keys**: Both publishable and secret keys configured
3. **Public HTTPS Endpoint**: Webhooks require a publicly accessible HTTPS URL

## Local Development Setup

For local development, use the Stripe CLI to forward webhook events to your local server.

### Step 1: Install Stripe CLI

Download and install the Stripe CLI from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli):

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_*_linux_x86_64.tar.gz
tar -xvf stripe_*_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

### Step 2: Authenticate with Stripe

```bash
stripe login
```

This will open your browser to complete authentication.

### Step 3: Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will output a webhook signing secret (starts with `whsec_`). Copy this value.

### Step 4: Configure Environment Variables

Add the webhook secret to your `.env` file:

```bash
# .env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From step 3
```

### Step 5: Start Your Development Server

```bash
npm run dev
```

Your local server is now ready to receive webhook events!

### Step 6: Test with Stripe CLI

Trigger test events:

```bash
# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded
```

## Production Setup

For production, configure webhooks in the Stripe Dashboard.

### Step 1: Get Your Production Webhook URL

Your production webhook endpoint will be:

```
https://your-domain.com/api/webhooks/stripe
```

For Moldova Direct on Vercel:
```
https://www.moldovadirect.com/api/webhooks/stripe
```

### Step 2: Create Webhook Endpoint in Stripe Dashboard

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter your webhook URL: `https://www.moldovadirect.com/api/webhooks/stripe`
5. Select **API version**: `2024-06-20`
6. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
7. Click **Add endpoint**

### Step 3: Get Webhook Signing Secret

After creating the endpoint:

1. Click on the newly created endpoint
2. Click **Reveal** under **Signing secret**
3. Copy the signing secret (starts with `whsec_`)

### Step 4: Add Secret to Production Environment

Add the webhook secret to your production environment variables:

**For Vercel:**

```bash
# Using Vercel CLI
vercel env add STRIPE_WEBHOOK_SECRET

# Or in Vercel Dashboard:
# Settings → Environment Variables → Add
# Name: STRIPE_WEBHOOK_SECRET
# Value: whsec_...
```

**For other platforms:**

Add `STRIPE_WEBHOOK_SECRET` to your hosting platform's environment variables.

### Step 5: Deploy and Verify

1. Deploy your application
2. In Stripe Dashboard, go to your webhook endpoint
3. Click **Send test webhook**
4. Select `payment_intent.succeeded`
5. Click **Send test webhook**
6. Verify the webhook was received successfully (status code 200)

## Testing Webhooks

### Manual Testing with Stripe Dashboard

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Scroll to **Send test webhook**
4. Select an event type
5. Click **Send test webhook**
6. Check the response and logs

### Automated Testing

Run the test suite:

```bash
npm run test server/api/webhooks/__tests__/stripe.test.ts
```

### Integration Testing

Create a test order with a payment intent:

```bash
# 1. Create a payment intent
curl -X POST http://localhost:3000/api/checkout/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "currency": "eur", "sessionId": "test-session"}'

# 2. Use Stripe CLI to trigger event
stripe trigger payment_intent.succeeded --override payment_intent:id=pi_test_123

# 3. Verify order status in database
```

## Troubleshooting

### Webhook Not Receiving Events

**Check 1: Verify webhook is registered**
```bash
stripe webhooks list
```

**Check 2: Check webhook endpoint URL**
- Ensure URL is publicly accessible
- Ensure HTTPS (not HTTP)
- Test with: `curl https://your-domain.com/api/webhooks/stripe`

**Check 3: Verify signing secret**
- Check environment variable is set: `echo $STRIPE_WEBHOOK_SECRET`
- Ensure it matches the secret in Stripe Dashboard
- Ensure no extra spaces or quotes

**Check 4: Check Stripe Dashboard logs**
- Go to Developers → Webhooks → [Your endpoint]
- Check the "Attempts" tab for failed deliveries

### Signature Verification Failing

**Error**: `Webhook signature verification failed`

**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` environment variable is correct
2. Ensure you're using the raw request body (not parsed JSON)
3. Check the signing secret matches the endpoint (test vs. production)
4. Regenerate the webhook signing secret if needed

### Order Not Found for Payment Intent

**Error**: `Order not found for payment intent pi_xxx`

**Reason**: Race condition - webhook arrived before order creation completed

**Solution**: This is handled gracefully by the webhook handler. The webhook will:
1. Log the event
2. Return success (200) to Stripe
3. If order creation completes later, status will be synced on next event

### Amount Mismatch Warning

**Warning**: `Amount mismatch for order ORD-123: expected 10000, received 15000`

**Reason**: Payment amount doesn't match order total

**Action**:
1. Check payment intent was created with correct amount
2. Verify order total is calculated correctly
3. Check for currency conversion issues
4. The webhook still updates the status but logs a warning

### Database Update Failures

**Error**: `Failed to update order payment status`

**Troubleshooting**:
1. Check Supabase connection
2. Verify database permissions
3. Check RLS (Row Level Security) policies
4. Review server logs: `npm run dev` or Vercel logs

## Security Considerations

### Webhook Signature Verification

**CRITICAL**: Always verify webhook signatures to ensure events come from Stripe.

The endpoint automatically verifies signatures using:

```typescript
const stripeEvent = stripe.webhooks.constructEvent(
  body,         // Raw request body
  signature,    // Stripe-Signature header
  webhookSecret // STRIPE_WEBHOOK_SECRET env var
)
```

Never disable signature verification in production!

### HTTPS Required

Stripe only sends webhooks to HTTPS endpoints. Ensure:

- Production uses HTTPS (not HTTP)
- SSL certificate is valid
- No self-signed certificates

### Idempotency

The webhook handler is idempotent - processing the same event multiple times has no additional effect:

```typescript
// Already marked as paid - skip update
if (order.payment_status === 'paid') {
  console.log(`Order ${order.order_number} already marked as paid (idempotent)`)
  return
}
```

Stripe may send the same event multiple times, especially if:
- Webhook response is slow
- Connection timeouts occur
- Webhook endpoint returns errors

### Rate Limiting

Stripe implements automatic rate limiting on webhooks. If your endpoint:
- Responds too slowly (>30s)
- Returns errors frequently
- Times out repeatedly

Stripe will disable your webhook endpoint. Ensure your endpoint:
- Responds quickly (< 5 seconds)
- Returns 200 on success
- Handles errors gracefully

### IP Allowlisting (Optional)

For additional security, you can restrict webhook requests to Stripe's IP addresses:

1. Get Stripe's IP ranges: [stripe.com/docs/ips](https://stripe.com/docs/ips)
2. Configure your firewall/load balancer to only allow requests from those IPs
3. Update rules when Stripe updates their IP ranges

**Note**: Moldova Direct does not currently implement IP allowlisting.

## Webhook Event Flow

### Successful Payment Flow

```
1. Customer completes payment
   ↓
2. Stripe creates payment_intent.succeeded event
   ↓
3. Stripe sends webhook to /api/webhooks/stripe
   ↓
4. Endpoint verifies signature
   ↓
5. Handler finds order by payment_intent_id
   ↓
6. Updates order.payment_status = 'paid'
   ↓
7. Returns { received: true, eventId: '...', eventType: '...' }
   ↓
8. Stripe marks webhook as successful
```

### Failed Payment Flow

```
1. Customer's payment fails
   ↓
2. Stripe creates payment_intent.payment_failed event
   ↓
3. Stripe sends webhook to /api/webhooks/stripe
   ↓
4. Endpoint verifies signature
   ↓
5. Handler finds order by payment_intent_id
   ↓
6. Updates order.payment_status = 'failed'
   ↓
7. Logs failure reason
   ↓
8. Returns success to Stripe
```

### Refund Flow

```
1. Admin initiates refund in Stripe Dashboard
   ↓
2. Stripe creates charge.refunded event
   ↓
3. Stripe sends webhook to /api/webhooks/stripe
   ↓
4. Endpoint verifies signature
   ↓
5. Handler checks if full or partial refund
   ↓
6. Full: Sets payment_status = 'refunded'
   Partial: Keeps payment_status = 'paid'
   ↓
7. Returns success to Stripe
```

## Monitoring and Logging

### Server Logs

All webhook events are logged:

```
[Stripe Webhook] Received event: payment_intent.succeeded (evt_xxx)
[Stripe Webhook] Payment succeeded: pi_xxx - 100.00 EUR
[Stripe Webhook] Order ORD-12345 marked as paid (100.00 EUR)
```

### Stripe Dashboard

Monitor webhook delivery in Stripe Dashboard:
- **Developers** → **Webhooks** → [Your endpoint]
- View successful/failed attempts
- Retry failed webhooks
- View request/response details

### Error Alerts

Set up monitoring alerts for:
- Webhook signature verification failures
- Database update failures
- High rate of 5xx errors
- Slow response times (> 5s)

## Next Steps

- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Moldova Direct Checkout Flow](./CHECKOUT_FLOW.md)

## Support

For issues with webhooks:
1. Check this documentation
2. Review Stripe Dashboard logs
3. Check server logs
4. Contact the development team

---

**Last Updated**: 2025-11-05
**API Version**: Stripe API 2024-06-20
