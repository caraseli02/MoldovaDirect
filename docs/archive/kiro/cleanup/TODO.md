# Repository TODOs (2025-02)

## Recent Cleanup (October 12, 2025)

- [x] Removed unused PayPal integration (composable + API endpoints + config)
- [x] Deleted unused composables (useMobileCodeSplitting, usePushNotifications)
- [x] Removed tw-animate-css package (unused)
- [x] Organized test scripts into `scripts/` directory
- [x] Archived duplicate documentation (AGENTS.md)

See [CLEANUP_COMPLETED_2025-10-12.md](./CLEANUP_COMPLETED_2025-10-12.md) for details.

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
- [ ] **Toast / notification system** (HIGH PRIORITY): consolidate on Sonner, remove `components/common/Toast*.vue`, and update notification docs/tests accordingly.
  - Current custom system: `components/common/Toast.vue`, `ToastContainer.vue`, `composables/useToast.ts`, `stores/toast.ts`
  - Target: Use `vue-sonner` (already installed)
  - Benefits: Better maintained, more features, smaller bundle, consistent with shadcn-vue
  - Estimated effort: 2-3 hours
  - See [CODE_CLEANUP_REPORT.md](./CODE_CLEANUP_REPORT.md) for migration details

## Code Quality & Maintenance

- [x] Remove unused PayPal integration (composables, API endpoints, configuration)
- [x] Remove unused composables (useMobileCodeSplitting, usePushNotifications)
- [x] Remove unused dependencies (tw-animate-css)
- [x] Organize test scripts into `scripts/` directory
- [x] Update environment variable documentation
- [ ] Migrate toast system to vue-sonner (see Component Modernization above)
- [ ] Archive outdated documentation files (BUGFIX-recursive-updates.md, CHECKOUT-FIXES-SUMMARY.md, etc.)
- [ ] Run dependency audit and verify all packages are actively used
