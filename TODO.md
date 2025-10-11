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
