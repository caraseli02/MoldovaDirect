# Changelog - Moldova Direct

This document tracks significant changes, updates, and improvements to the Moldova Direct e-commerce platform.

---

## November 2025

### Security & GDPR Compliance (November 16, 2025)

**Major security and compliance milestone achieved** with comprehensive GDPR implementation and authentication hardening.

#### GDPR Compliance (Article 17 - Right to Erasure)
- ✅ **Atomic Account Deletion:** Implemented all-or-nothing deletion via database stored procedure
  - Prevents partial data deletion (GDPR compliance)
  - Order anonymization (preserves for legal/business requirements)
  - Profile picture deletion from storage
  - Comprehensive audit logging
- ✅ **Data Deletion Coverage:**
  - User profiles, addresses, shopping carts
  - Activity logs, email preferences, newsletter subscriptions
  - Orders anonymized (not deleted) per legal requirements

#### PII Protection (Article 5)
- ✅ **Secure Logger:** Created `server/utils/secureLogger.ts` with automatic PII redaction
  - Auto-redacts 8+ PII types (emails, phones, cards, IPs, SSNs, tokens)
  - Field name-based redaction (30+ sensitive field names)
  - Safe for production log aggregation
  - Prevents accidental PII exposure in application logs
- ✅ **Applied to Production:** Checkout order creation endpoint uses secure logger

#### Authentication Security (Article 32)
- ✅ **Rate Limiting:** Implemented `server/utils/authRateLimit.ts`
  - Login: 5 attempts per 15 minutes
  - Register: 3 attempts per hour
  - Password reset: 3 attempts per hour
  - Account lockout after 10 failed attempts (30 min duration)
  - Protects against brute force, credential stuffing, account enumeration
- ✅ **Admin MFA Enforcement:** Enabled previously commented-out MFA requirement
  - All admin users must complete MFA setup
  - Development bypass for @moldovadirect.com emails

#### Data Retention Policies (Planned)
- ⚠️ **Database migrations pending** for automated data retention:
  - User activity logs: 90 days
  - Auth events: 1 year
  - Email logs: 2 years
  - Audit logs: 7 years
  - Automated cleanup jobs via pg_cron

**Related PRs:** #255, #263
**Documentation:** `docs/security/GDPR_COMPLIANCE.md`, `docs/security/SECURE_LOGGER.md`

### Accessibility Improvements - WCAG 2.1 AA Compliance (November 16, 2025)

**Achieved WCAG 2.1 AA compliance** across 7 critical components with comprehensive accessibility enhancements.

#### Touch Accessibility
- ✅ **Touch Targets:** Increased from 32px to 44px minimum (WCAG AAA standard)
- ✅ **Applied to:** All buttons, form controls, interactive elements
- ✅ **Mobile Optimization:** Enhanced mobile touch interactions for product cards

#### ARIA Enhancements
- ✅ **Decorative Icons:** Added `aria-hidden="true"` to 50+ decorative SVG icons
- ✅ **Form Errors:** Added `aria-describedby` linking error messages to inputs
- ✅ **Loading States:** Added `aria-busy` and `aria-live` for dynamic content
- ✅ **Dialogs & Modals:** Proper `role="dialog"`, `aria-modal`, `aria-labelledby`
- ✅ **Interactive Elements:** Added `aria-label` to all icon-only buttons

#### Keyboard Navigation
- ✅ **Focus Indicators:** Added `focus-visible` styles to all interactive elements
- ✅ **Focus Management:** Proper focus trap implementation in modals
- ✅ **Tab Order:** Ensured logical tab order across all forms

#### Component Coverage
- ✅ **Cart Components:** Item quantity controls, remove buttons, loading states
- ✅ **Checkout Forms:** Payment form, shipping form, error associations
- ✅ **Product Components:** Product cards, quick view, add-to-cart states
- ✅ **Modals & Dialogs:** Delete confirmation, CVV help, quick view
- ✅ **Search & Filter:** Search input loading states, filter buttons
- ✅ **Newsletter:** Form validation, success/error announcements

**Impact:** Screen reader compatible, keyboard-only navigation supported, mobile-friendly touch targets

**Related PRs:** #258, #265
**Documentation:** `docs/architecture/PR_258_ACCESSIBILITY_ARCHITECTURE_REVIEW.md`

### Mobile Navigation UX Improvements (November 15-16, 2025)

**Modernized mobile navigation** following 2025 UX best practices for e-commerce mobile apps.

#### Bottom Navigation Bar
- ✅ **Replaced hamburger menu** with modern bottom navigation
- ✅ **Always-visible navigation:** Home, Shop, Cart, Search, Account
- ✅ **Cart badge:** Real-time item count indicator
- ✅ **32.8% faster task completion** (based on UX research)
- ✅ **Thumb-friendly:** Matches natural phone grip patterns

#### Language Selector Fixes
- ✅ **Fixed broken functionality:** Repaired click-outside detection
- ✅ **Keyboard navigation:** Full Arrow/Enter/Escape support
- ✅ **Accessibility:** Enhanced ARIA attributes and focus management
- ✅ **Visual improvements:** Globe icon, checkmark for selected language, smooth animations
- ✅ **Touch targets:** 44px minimum for mobile usability

**Related PRs:** #253, #265

### Authentication E2E Test Coverage (November 15, 2025)

**Comprehensive E2E test suite** for authentication flows with 2,100+ lines of coverage.

#### Test Coverage Added
- ✅ **Login Flow:** 392 lines covering all locales, error states, redirects
- ✅ **Registration Flow:** 460 lines covering validation, success, error handling
- ✅ **Password Reset:** 284 lines covering request, validation, completion
- ✅ **Logout Flow:** 310 lines covering session cleanup, redirects
- ✅ **MFA Verification:** Full multi-factor authentication testing
- ✅ **Mobile Responsive:** 318 lines testing mobile layouts
- ✅ **Accessibility:** 458 lines testing WCAG 2.2 AA compliance
- ✅ **i18n:** 383 lines testing all 4 locales (ES, EN, RO, RU)

#### Test Features
- Test data setup via `scripts/create-e2e-test-user.mjs`
- Mobile viewport testing (375x667)
- Keyboard navigation validation
- Screen reader compatibility checks
- Form validation testing across locales

**Total:** 2,100+ lines of new E2E test coverage

**Related PR:** #256

### Code Refactoring - Component Modularity (November 16, 2025)

**Major refactoring effort** to improve code maintainability and reduce component complexity.

#### Admin Testing Page (PR #271)
- ✅ **Reduced from 1,102 to 302 lines** (73% reduction)
- ✅ **Extracted 11 focused components:**
  - DatabaseStatsCard, QuickActionsCard, ProgressIndicator
  - UserSimulationCard, UserImpersonationCard, DataCleanupCard
  - ScenarioTemplatesCard, AdvancedDataGenerationCard
  - TestResultsCard, GenerationHistoryCard, SaveScenarioDialog
- ✅ **Created composable:** Dedicated composable for shared state and business logic
- ✅ **Benefits:** Improved testability, reusability, maintainability

#### Products Page (PR #270)
- ✅ **Reduced from 857 to 642 lines** (25% reduction)
- ✅ **Extracted composables:**
  - `useProductFilters` - Filter chips and category lookup
  - `useProductPagination` - Pagination UI logic
  - `useMobileProductInteractions` - Mobile gesture handling
  - `useProductStructuredData` - SEO metadata generation
- ✅ **Benefits:** Better separation of concerns, easier testing

#### Auth Store Modularization (PR #269)
- ✅ **Split monolithic 1,418-line store** into focused modules
- ✅ **Created `stores/auth/` directory:**
  - `auth/mfa.ts` (224 lines) - Multi-factor authentication
  - `auth/lockout.ts` (81 lines) - Account lockout management
  - `auth/test-users.ts` (196 lines) - Test user simulation
  - `auth/types.ts` (37 lines) - Shared types
  - `auth/index.ts` (1,162 lines) - Main store (18% reduction)
- ✅ **100% backward compatible** via symlink
- ✅ **Benefits:** Single Responsibility Principle, improved testability, easier maintenance

**Total Impact:** ~2,000 lines reorganized, 15+ new focused modules created

**Related PRs:** #269, #270, #271

### Performance Optimizations (November 13-14, 2025)

**Significant performance improvements** through API caching and ISR optimization.

#### API Endpoint Caching (PR #240)
- ✅ **Implemented `defineCachedEventHandler`** for 6 critical endpoints:
  - Product detail: 10 min cache (locale-aware)
  - Price range: 5 min cache (query-aware)
  - Related products: 10 min cache
  - Category detail: 10 min cache
  - Landing sections: 10 min cache (2 endpoints)
- ✅ **Performance Impact:**
  - 40-60% reduction in database queries
  - 20-30% faster page loads
  - Better scalability under high traffic

#### ISR Rendering Fixes (PR #249)
- ✅ **Fixed homepage ISR errors:** Resolved FUNCTION_INVOCATION_FAILED issues
- ✅ **Database query optimization:**
  - Featured products: 4.12s → 500ms (8x faster)
  - Filtered in PostgreSQL vs JavaScript
  - 97% reduction in data transfer (1000+ → 36 rows)
- ✅ **Sharp binary fix:** Externalized to prevent platform-specific issues
- ✅ **ISR configuration:**
  - maxDuration: 10s (increased from 5s)
  - Regions: Paris (cdg1) - closest to Spain
- ✅ **Performance indexes added** (pending migration):
  - idx_products_featured_attribute
  - idx_products_stock_price_active
  - idx_products_category_active

**Combined Performance Improvement:** 8-10x faster on high-traffic endpoints

**Related PRs:** #240, #249
**Documentation:** `docs/performance/CACHING_STRATEGY.md` (planned)

### Bug Fixes & UX Polish (November 13-16, 2025)

#### Products Page Fixes (PR #242)
- ✅ **Fixed empty products page** issue in production
- ✅ **Explicit JOIN types:** Use `!left` when no category filter, `!inner` for category filtering
- ✅ **Admin cache invalidation:** POST endpoint to clear cached data by scope
- ✅ **Debug endpoint:** GET endpoint to check database state and product counts

#### Mobile Carousel Fixes (PR #247, #267, #268)
- ✅ **Fixed products slider** on home page (filter tab switching)
- ✅ **Fixed "Start Your Journey" section** scroll on mobile
- ✅ **Fixed collections section** scrolling
- ✅ **Replaced Swiper with native CSS scroll** for better mobile compatibility

#### Header Visibility (PR #244)
- ✅ **Fixed header on white backgrounds:** Intelligent page type detection
- ✅ **Pages with dark hero** maintain transparent header (home)
- ✅ **Other pages** always show solid header for visibility

#### Admin Login UX (PR #264)
- ✅ **Fixed MFA popup for admin users** in development
- ✅ **Development bypass:** @moldovadirect.com emails skip MFA in dev mode
- ✅ **Production unchanged:** MFA still enforced for security

**Related PRs:** #242, #244, #247, #264, #267, #268

### Documentation Cleanup & Archival Strategy (November 2, 2025)

**Established systematic documentation management** with archival policies and automated health checks.

#### Archive Structure Created
- ✅ **Archive Directories:** Created organized archive structure in `docs/archive/2025/`, `.kiro/archive/2025/`, and `todos/archive/`
- ✅ **Archival Policy:** Documented comprehensive policy in `docs/ARCHIVAL_POLICY.md`
- ✅ **Archive Index:** Created `docs/archive/README.md` for easy navigation

#### Documentation Cleanup
- ✅ **Removed Empty File:** Deleted empty `docs/CART_SECURITY.md` (0 bytes)
- ✅ **Updated Index:** Updated `DOCUMENTATION_INDEX.md` with archive section and removed broken references
- ✅ **Documentation Conventions:** Added comprehensive framework documentation guide

#### Automated Tooling
- ✅ **Link Checker:** Installed `markdown-link-check` for broken link detection
- ✅ **Markdown Linter:** Installed `markdownlint-cli` with custom configuration
- ✅ **npm Scripts:** Added `docs:check-links`, `docs:lint`, `docs:find-outdated`, and `docs:audit`
- ✅ **Configuration:** Created `.markdownlint.json` with project-specific rules

#### Documentation Health
- **Total Markdown Files:** 28 in docs/ + 9 at root level
- **Archive Strategy:** Clear criteria for when to archive vs. delete
- **Maintenance Schedule:** Monthly, quarterly, and annual review processes documented

See [GitHub Issue #138](https://github.com/caraseli02/MoldovaDirect/issues/138) for complete cleanup strategy.

### Visual Test Coverage Implementation (November 1, 2025)

**Major testing milestone achieved** with comprehensive visual regression test coverage.

#### Visual Test Coverage Added
- ✅ **Admin Pages:** 15 visual tests covering dashboard, orders, products, inventory, users, analytics, and email management
- ✅ **Account Pages:** 10 visual tests covering profile, orders, security/MFA settings
- ✅ **Checkout & Static Pages:** 22 visual tests covering checkout flow, order tracking, and all informational pages
- ✅ **Total New Tests:** 47 visual regression tests added

#### Coverage Improvement
- **Before:** 9 pages with visual tests (19%)
- **After:** 40 pages with visual tests (85%)
- **Remaining:** 7 low-priority dev/test pages (15%)

#### Bug Fixes
- ✅ Fixed dashboard reference in visual-regression.spec.ts (changed `/dashboard` to `/account`)
- ✅ Fixed authenticatedPage fixture to expect correct redirect
- ✅ Added proper masking for dynamic content (timestamps, user data, charts)
- ✅ Implemented consistent wait strategies for stable screenshots

#### Test Features
- Full-page screenshot coverage with animation disabling
- Responsive testing (mobile, tablet, desktop)
- Dynamic content masking to prevent false positives
- Authentication helpers for protected pages
- Empty state testing where applicable

See [TEST_COVERAGE_IMPLEMENTATION.md](../TEST_COVERAGE_IMPLEMENTATION.md) for complete details.

### Deep Code Review (October 30, 2025)

**Comprehensive code review completed** identifying security issues, technical debt, and improvement opportunities.

#### Key Findings
- 🚨 **Critical:** Admin middleware temporarily disabled for testing (needs immediate re-enabling)
- 🚨 **Critical:** Missing rate limiting on authentication endpoints
- ⚠️ **High Priority:** Products page needs refactoring (915 lines)
- ⚠️ **High Priority:** Auth store needs splitting (1,172 lines)
- ⚠️ **Medium Priority:** Missing server-side price verification
- ⚠️ **Medium Priority:** Cart data encryption needed

#### Recommendations
- Immediate: Re-enable authentication middleware and add rate limiting
- Short-term: Refactor large components and implement security hardening
- Medium-term: Improve test coverage and mobile UX consistency
- Long-term: Add advanced features (PWA, personalization, advanced analytics)

See [CODE_REVIEW_2025.md](../CODE_REVIEW_2025.md) for complete analysis.

---

## October 2025

### Code Cleanup & Optimization (October 12, 2025)

**Major cleanup completed** to remove unused code and improve maintainability. The archived report is available at `.kiro/archive/cleanup/CLEANUP_COMPLETED_2025-10-12.md`.

#### Removed Features
- ❌ **PayPal Integration** - Completely removed (composables, API endpoints, configuration)
  - `composables/usePayPal.ts`
  - `server/api/checkout/paypal/create-order.post.ts`
  - `server/api/checkout/paypal/capture-order.post.ts`
  - PayPal configuration from `nuxt.config.ts`
  - PayPal environment variables from `.env.example`
  - **Reason**: Never implemented in UI, Stripe is the primary payment processor

#### Removed Composables
- ❌ `composables/useMobileCodeSplitting.ts` - Feature was planned but not used
- ❌ `composables/usePushNotifications.ts` - Push notifications not yet implemented

#### Removed Dependencies
- ❌ `tw-animate-css` v1.4.0 - Unused package (project uses `tailwindcss-animate`)

#### Removed Files
- ❌ `components/admin/Products/Pricing.vue.backup` - Backup file (use git history instead)

#### Organization Improvements
- ✅ Moved test scripts to `scripts/` directory
  - `scripts/test-email-integration.js`
  - `scripts/test-order-creation.sh`
- ✅ Archived duplicate documentation
  - `AGENTS.md` → `.kiro/archive/docs/AGENTS.md`

#### Impact Summary
- **~850 lines** of code removed
- **3 composables** deleted
- **2 API endpoints** deleted
- **1 npm package** removed
- **No breaking changes** introduced
- Cleaner dependency tree
- Better code maintainability

#### Documentation Updates
- ✅ Updated `README.md` with current payment processing information
- ✅ Updated `docs/CHECKOUT_FLOW.md` to reflect Stripe-only payment processing
- ✅ Updated `docs/REMAINING_WORK_SUMMARY.md` with recent changes
- ✅ Updated `.env.example` to remove PayPal variables
- ✅ Created comprehensive cleanup documentation

---

## September 2025

### Email Notification System
- ✅ Integrated Resend for transactional emails
- ✅ Email logging and retry service
- ✅ Order confirmation email templates
- ✅ Email delivery statistics tracking

### Cart System Enhancements
- ✅ Enhanced cart system with Pinia availability detection
- ✅ Comprehensive cart architecture documentation
- ✅ Cart analytics system with offline capability
- ✅ Memory management improvements
- ✅ Fixed TypeScript issues in cart analytics plugin

### Authentication Improvements
- ✅ Comprehensive authentication architecture documentation
- ✅ Enhanced i18n configuration with lazy loading optimization
- ✅ Improved session management and token refresh

---

## August 2025

### UI Component Migration
- ✅ Migrated to shadcn-vue UI components
- ✅ Completed user profile management
- ✅ Enhanced mobile accessibility
- ✅ Major documentation cleanup and reorganization

### Admin Dashboard
- ✅ Product management views with bulk actions
- ✅ User management with role-based access
- ✅ Inventory controls and reporting

---

## Pending Work

### High Priority
- [x] **Toast System Migration** - Migrate from custom toast system to vue-sonner
  - Replaced `CommonToastContainer` in layouts with `<UiToaster>`
  - Routed `useToast()` composable to `vue-sonner` API with legacy shims
  - Note: `stores/toast.ts` remains temporarily for backwards-compat helpers in some stores; will be removed after follow-up refactor

### Medium Priority
- [ ] Complete Stripe payment webhook handling
- [ ] Configure production payment credentials
- [ ] Enhanced transactional email workflows
- [ ] Admin analytics dashboards

### Low Priority
- [ ] Archive outdated documentation files
- [ ] Run dependency audit
- [ ] Performance optimizations
- [ ] SEO enhancements

---

## References

- [.kiro/archive/cleanup/CODE_CLEANUP_REPORT.md](../.kiro/archive/cleanup/CODE_CLEANUP_REPORT.md) - Archived cleanup tracking
- [.kiro/archive/cleanup/CLEANUP_COMPLETED_2025-10-12.md](../.kiro/archive/cleanup/CLEANUP_COMPLETED_2025-10-12.md) - Archived cleanup summary
- [.kiro/ROADMAP.md](../.kiro/ROADMAP.md) - Development timeline
- [.kiro/PROJECT_STATUS.md](../.kiro/PROJECT_STATUS.md) - Current project status

---

**Maintained by:** Development Team
**Last Updated:** November 16, 2025
