# Remaining Work Summary - MoldovaDirect

**Last Updated: November 2025**

## Priority 1: Payment Integration (Stripe - Production Ready)
**Estimated Effort: 1 week**

### Outstanding Tasks
- Complete Stripe payment intent flow: confirm, capture, and handle webhooks for order success/failure.
- Harden payment error states in the checkout UI and surface actionable feedback to shoppers.
- Configure production Stripe credentials and test with live payment methods.
- Store customer payment preferences securely.

### Recent Changes (October 2025)
- ✅ Removed PayPal integration (unused feature, never implemented in UI)
- ✅ Streamlined payment processing to focus on Stripe as primary processor
- ✅ Cleaned up payment-related configuration and environment variables

## Priority 2: Transactional Email System
**Estimated Effort: 1 week**

### Outstanding Tasks
- Wire customer + internal notifications into the order support flow (`server/api/orders/[id]/support.post.ts`) using the shared utilities so tickets trigger the right follow-ups.
- Capture and enforce email notification preferences across the account area (persisted in Supabase) before calling `sendOrderConfirmationEmail` / `sendOrderStatusEmail`.
- Expand automated coverage for status templates and endpoints—unit tests for `sendOrderStatusEmail`/`retryEmailDelivery` plus integration tests for `/api/orders/[id]/send-status-email` and `/api/orders/[id]/update-status`.
- Harden the retry pipeline by fixing the missing template imports inside `retryEmailDelivery` and validating the admin retry job handles mixed locales + issue descriptions gracefully.

## Priority 3: Admin Analytics & Reporting
**Estimated Effort: 1-2 weeks**