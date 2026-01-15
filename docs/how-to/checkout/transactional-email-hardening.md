# Transactional Email Hardening


## Summary
Transactional notifications cover confirmations and status updates, but gaps in the support workflow, retry pipeline, and opt-out handling block the roadmap goal of a production-ready system. This issue tracks the fixes and QA needed to close those gaps.

## Current State
- `sendOrderConfirmationEmail` and `sendOrderStatusEmail` generate localized templates, log sends to `email_logs`, and back the checkout + status endpoints. 【F:server/utils/orderEmails.ts†L27-L210】【F:server/api/checkout/send-confirmation.post.ts†L1-L129】【F:server/api/orders/[id]/update-status.post.ts†L1-L191】
- Admin tooling and scripts (`/admin/tools/email-testing`, `scripts/test-email-integration.js`) already exercise confirmation flows manually. 【F:scripts/test-email-integration.js†L1-L115】
- Supabase schema + logging utilities persist delivery attempts and enable retry scheduling. 【F:supabase/sql/supabase-email-logs-schema.sql†L1-L74】【F:server/utils/emailLogging.ts†L1-L159】

## Gaps
1. **Support ticket notifications are still TODO** – the support endpoint creates tickets but leaves both the customer and internal notification `TODO`. 【F:server/api/orders/[id]/support.post.ts†L120-L188】
2. **Retry helper references missing template imports** – `retryEmailDelivery` calls `generateOrderConfirmationTemplate`/`generateOrderProcessingTemplate` etc. without importing them, leading to runtime ReferenceErrors during retries. 【F:server/utils/orderEmails.ts†L213-L341】
3. **Status endpoints omit Supabase service imports** – both `/api/orders/[id]/send-status-email` and `/api/orders/[id]/update-status` call `serverSupabaseClient(event)` without importing it, so the handlers crash when invoked. 【F:server/api/orders/[id]/send-status-email.post.ts†L1-L106】【F:server/api/orders/[id]/update-status.post.ts†L1-L191】
4. **Automated coverage is confirmation-only** – the Vitest suite mocks confirmation emails but never exercises status templates, retry flows, or the API handlers, leaving core logic untested. 【F:tests/unit/order-emails.test.ts†L1-L176】
5. **Preference enforcement missing** – utilities and endpoints always send emails, and there is no account/guest opt-out persistence to honour notification preferences. 【F:server/api/checkout/send-confirmation.post.ts†L1-L129】【F:server/api/orders/[id]/update-status.post.ts†L82-L191】

## Proposed Tasks
- Implement customer + staff notifications in `server/api/orders/[id]/support.post.ts`, reusing shared template helpers and logging the sends.
- Fix `retryEmailDelivery` by importing the template generators (or referencing them via the existing `orderConfirmation`/`orderStatus` namespaces) and cover mixed-locale + issue-description cases.
- Add the missing `serverSupabaseClient` import to both status API routes and ensure type-safe event handling.
- Persist notification preferences (profiles + guest orders) and guard both email senders and endpoints accordingly.
- Expand tests:
  - Unit tests for `sendOrderStatusEmail` (all branches) and `retryEmailDelivery`.
  - Integration tests for `/api/orders/[id]/send-status-email` and `/api/orders/[id]/update-status` covering preference checks and retry logging.
  - QA automation for the retry service (`processEmailRetries`).

## Acceptance Criteria
- Support tickets trigger both customer acknowledgements and internal alerts with successful email logs.
- Retrying a failed log uses the correct template without runtime errors and respects exponential backoff rules.
- Status endpoints deploy with passing type checks and no runtime ReferenceErrors from missing imports.
- Email sends honour stored opt-out preferences across checkout, account, and support flows.
- Vitest/Playwright coverage includes the new scenarios and passes in CI.

## Risks & Mitigations
- **Data model changes**: Introducing preferences may need new Supabase tables/columns; coordinate schema migration reviews and document in `supabase/sql`.
- **Template regressions**: Added coverage should render snapshots per locale; store fixtures and visual diffs to detect layout drift.
- **Operational load**: Retry job may spike sends; guard with rate limits and admin alerts from `emailRetryService`.

## Labels
`bug`, `enhancement`, `email`, `backend`, `qa`, `high-priority`
