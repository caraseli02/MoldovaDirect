# Remaining Work Summary - MoldovaDirect
**Last Updated: February 2026**

## Priority 1: Payment Integration (UI in place, backend pending)
**Estimated Effort: 2 weeks**

### Outstanding Tasks
- Complete Stripe payment intent flow: confirm, capture, and handle webhooks for order success/failure.
- Implement PayPal checkout option with sandbox validation and graceful fallbacks.
- Harden payment error states in the checkout UI and surface actionable feedback to shoppers.
- Store customer payment preferences securely and document environment variable requirements.

## Priority 2: Transactional Email System
**Estimated Effort: 1 week**

### Outstanding Tasks
- Build localized email templates for order confirmations, shipping updates, and password recovery.
- Integrate Resend (or Supabase functions) for delivery with retry logic and logging.
- Capture email notification preferences within the account area and honour opt-outs.
- Automate smoke tests to verify templates render correctly across locales.

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
- Multi-step checkout pages (shipping, payment, review) with responsive layouts.
- Admin product and user management views with bulk actions and inventory controls.
- Order API endpoints for creation, retrieval, and customer history.
- Cart validation improvements and shadcn-vue component migration.
