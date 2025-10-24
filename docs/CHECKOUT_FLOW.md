# Checkout & Order Flow

This guide outlines the multi-step checkout implemented in Moldova Direct and the supporting APIs that bridge Supabase, Stripe, and the storefront UI (status: February 2026).

---

## UX Overview

| Step | Route | Primary Component | Responsibilities |
|------|-------|-------------------|------------------|
| Shipping | `pages/checkout/index.vue` | `components/checkout/ShippingStep.vue` | Collect shipping address, validate fields, fetch delivery options |
| Payment | `pages/checkout/payment.vue` | `components/checkout/PaymentStep.vue` | Pick payment method (cash available today, card/PayPal ready for activation), capture billing info |
| Review | `pages/checkout/review.vue` | `components/checkout/CheckoutSummary.vue` | Display order summary, totals, shipping method, and terms |
| Confirmation | `pages/checkout/confirmation.vue` | `components/checkout/CheckoutConfirmation.vue` | Show success/failure state after API call |

Shared helpers live in `composables/useCheckout.ts` and `components/checkout/CheckoutNavigation.vue`. Progress state persists via a trio of Pinia stores: session orchestration (`stores/checkout/session.ts`), shipping logic (`stores/checkout/shipping.ts`), and payment handling (`stores/checkout/payment.ts`). The façade in `stores/checkout.ts` composes those slices so components continue to interact with a single checkout API. API orchestration and domain types remain centralized under `lib/checkout/api.ts`, `lib/checkout/order-calculation.ts`, and `types/checkout.ts`.

---

## Server Endpoints

| Endpoint | Purpose | Notes |
|----------|---------|-------|
| `POST /api/checkout/addresses` & `GET /api/checkout/addresses` | Persist and retrieve saved addresses | Reads/writes Supabase `addresses` table |
| `GET /api/checkout/shipping-methods` | Fetch shipping options | Currently returns static config; extend for dynamic carriers |
| `POST /api/checkout/create-payment-intent` | Create Stripe payment intent | Requires `SUPABASE_SERVICE_KEY` and `STRIPE_SECRET_KEY`; throws 503 if Stripe is not configured |
| `POST /api/checkout/confirm-payment` | Placeholder for confirming card payments | Extend once Stripe webhooks are wired |
| `POST /api/checkout/create-order` | Write order records after review | Validates cart via Supabase RPC (`validate_cart_for_checkout`) and inserts into `orders` / `order_items` |
| `POST /api/checkout/save-payment-method` / `GET /api/checkout/payment-methods` | Manage saved payment methods | Currently scaffolding for Stripe + future PayPal vault |
| `POST /api/orders/create` / `GET /api/orders/*` | General order creation and queries | Used by admin and account order history |

All endpoints rely on Supabase service-role access for writes; keep environment variables populated in local and hosted environments.

---

## Supabase Requirements

Run the following SQL scripts when standing up or refreshing an environment:

- `supabase/sql/supabase-schema.sql` – core tables (`orders`, `order_items`, `carts`, etc.) and RLS policies.
- `supabase/sql/supabase-checkout-schema.sql` & `supabase/sql/supabase-checkout-indexes.sql` – checkout metadata, indexes, and helper functions.
- `supabase/sql/supabase-order-tracking-schema.sql`, `supabase/sql/supabase-order-returns-schema.sql`, `supabase/sql/supabase-order-indexes.sql`, `supabase/sql/supabase-order-policies.sql` – tracking numbers, returns workflow, and stricter policies.
- Optional seeds: `supabase/sql/supabase-mock-orders.sql` (demos) and analytics scripts for dashboards.

When adding new columns or RPC functions for checkout, extend these scripts to keep every environment in sync.

---

## Payment Options

### Current Implementation (October 2025)

- **Cash on Delivery**: ✅ Fully implemented in UI and order creation logic; confirmation step marks orders as `pending` with `cash` payment method.
- **Card Payments (Stripe)**: ✅ Primary payment processor with API integration complete. Enable by supplying live keys and finalizing webhook handling in `server/api/checkout/confirm-payment.post.ts`.

### Removed Features

- **PayPal**: ❌ Removed in October 2025 cleanup. The PayPal integration was never implemented in the UI and has been completely removed from the codebase (composables, API endpoints, and configuration). If PayPal support is needed in the future, it should be implemented as a new feature with proper planning and testing.

### Configuration

Payment processing is configured through environment variables:

```bash
# Stripe (Primary payment processor)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

No additional payment provider configuration is needed in `nuxt.config.ts`. All payment processing is handled through Stripe's API.

---

## Testing Tips

- **Vitest**: Add unit tests under `tests/unit/checkout-*` for new composables and utilities.
- **Playwright**: Extend scenarios in `tests/e2e/checkout.spec.ts` to cover regression cases (e.g., failed payment, address validation, multi-locale flow).  
- **Visual Tests**: Update snapshots via `npm run test:visual:update` when modifying the checkout UI.

---

## Roadmap Notes

Short-term priorities for the checkout pipeline (tracked in `docs/REMAINING_WORK_SUMMARY.md`):

1. Activate Stripe/PayPal flows and capture payment webhooks.
2. Send localized transactional emails (order confirmation, shipping updates).
3. Tighten inventory reservation and rollback logic in Supabase RPCs.
