# Repository TODOs (2025-02)

## Blockers

- [x] Replace removed `CommonConfirmDialog` usage in `pages/admin/products/index.vue` with a working shadcn dialog implementation so bulk delete and product removal flows render without runtime errors.

## Documentation Alignment

- [x] Refresh high-level status docs (`README.md`, `.kiro/PROJECT_STATUS.md`, `docs/REMAINING_WORK_SUMMARY.md`) to acknowledge delivered admin dashboard, checkout, and order APIs, and move remaining gaps into roadmap sections.
- [x] Align i18n documentation with the active configuration (either restore lazy-loading in `nuxt.config.ts` or update `docs/I18N_CONFIGURATION.md` and `README.md` to describe eager loading).
- [x] Rewrite `docs/SUPABASE_SETUP.md` to point to the actual `supabase-*.sql` scripts, correct RLS guidance, and document the current seeding approach (or add a script if needed).
- [x] Update `docs/AUTHENTICATION_ARCHITECTURE.md` to match the watcher-based initialization and include current refresh/session behaviour; add coverage for checkout/order backend docs to the library.

## Follow-up Enhancements

- [x] Add dedicated documentation for the checkout pipeline (UI flow, API endpoints, payment intent lifecycle) and order management features now present in `server/api`.

## Email Notifications

- [ ] Propagate `FROM_EMAIL` Resend sender to preview and production environments so transactional emails work after deployment.
- [ ] Update email setup docs to mention using the Resend shared domain (`onboarding@resend.dev`) for development and how to swap to a branded domain once verified.
- [ ] Add an automated test (unit or e2e) that confirms an email log entry is created after completing the checkout flow.
- [ ] Monitor the Supabase `email_logs` table in staging to validate retry logic once live payments are processed.

## Component Modernization

- [x] Auth flows (login/register, auth alerts): replaced legacy inputs/selects with shadcn `Input`, migrated to `Label`/`Alert`, removed `Auth*Message.vue`, and updated unit coverage.
- [ ] Checkout (shipping, payment, confirmation): swap custom selects, inputs, and alerts for shadcn equivalents; move modal interactions to `Dialog`; validate Playwright checkout suite.
- [ ] Cart experience (drawer, line items, bulk actions): adopt shadcn buttons, checkboxes, and Sonner toasts; confirm accessibility and mobile touch targets.
- [ ] Admin tables & filters: migrate to `components/ui/table`, `Pagination`, and `Badge` variants; retire bespoke table utilities after rollout.
- [ ] Mobile navigation & sheets: replace custom menus with shadcn dialog/sheet patterns and ensure 44px touch targets; cover drawer smoke tests.
- [ ] Toast / notification system: consolidate on Sonner, remove `components/common/Toast*.vue`, and update notification docs/tests accordingly.
