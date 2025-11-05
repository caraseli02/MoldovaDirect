# Remaining Work Summary - MoldovaDirect
**Last Updated: October 2025**

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

### Outstanding Tasks
- Add sales, inventory, and customer growth widgets to the admin dashboard.
- Surface product performance insights (best sellers, low stock) with drill-down links.
- Schedule downloadable CSV/Excel exports and audit trails for admin actions.
- Document monitoring/alerting expectations and wire up observability hooks.

## Priority 4: Checkout Hardening & QA
**Estimated Effort: 1 week**

### Outstanding Tasks
- Finalize guest checkout edge cases and ensure inventory reservation is enforced via Supabase SQL.
- Expand Playwright coverage to include full checkout success/failure paths and mobile breakpoints.
- Add Vitest coverage for checkout composables (shipping, payment, order review).
- Validate accessibility (keyboard navigation, screen reader cues) across the multi-step flow.

## Priority 5: Performance & SEO Enhancements
**Estimated Effort: 1 week**

### Outstanding Tasks
- Configure Nuxt Image with CDN-backed transformations and WebP fallbacks.
- Generate structured data, sitemaps, and robots rules aligned with the latest URL schema.
- Optimize bundle size via route-level code splitting and shared module audits.
- Add PWA/offline improvements (service worker caching strategy, install prompts).

---

## Recently Completed ✅

### October 2025
- ✅ Major code cleanup: removed PayPal integration, unused composables, and dependencies
- ✅ Organized test scripts into `scripts/` directory
- ✅ Streamlined payment processing to Stripe-only
- ✅ Updated documentation to reflect current architecture

### September 2025
- ✅ Multi-step checkout pages (shipping, payment, review) with responsive layouts
- ✅ Admin product and user management views with bulk actions and inventory controls
- ✅ Order API endpoints for creation, retrieval, and customer history
- ✅ Cart validation improvements and shadcn-vue component migration
- ✅ Email notification system with Resend integration
