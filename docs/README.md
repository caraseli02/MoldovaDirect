# Moldova Direct Documentation

> **Stack:** Nuxt 4 + Vue 3 + Supabase + TailwindCSS + Vercel

---

## Start Here

### 🆕 New to the Project?

1. **[Quick Start Guide](./getting-started/QUICK_START_GUIDE.md)** - Get the app running locally (5 min)
2. **[Tech Stack](./development/tech.md)** - Understand our technology choices
3. **[Code Conventions](./development/code-conventions.md)** - How we write code
4. **[Project Structure](./development/structure.md)** - Where things live

### 🔄 Returning After Time Away?

1. **[CHANGELOG](./CHANGELOG.md)** - What changed recently
2. **[Project Status](./status/PROJECT_STATUS.md)** - Current state of the project
3. **[Roadmap](./status/ROADMAP.md)** - What's planned next

### 🐛 Need to Debug Something?

1. **[Troubleshooting Components](./development/troubleshooting-components.md)** - Common issues
2. **[Testing Strategy](./guides/TESTING_STRATEGY.md)** - How to run tests
3. **[SSR Safety Verification](./analysis/SSR-SAFETY-VERIFICATION.md)** - SSR-related issues

### 🛠️ Working on a Feature?

1. **[Patterns to Preserve](./development/PATTERNS_TO_PRESERVE.md)** - Code patterns to follow
2. **[Component Inventory](./development/component-inventory.md)** - Available UI components
3. **[i18n Configuration](./features/I18N_CONFIGURATION.md)** - Adding translations (required for all UI)

---

## Core Documentation

### Architecture
How the system is designed:

| Document | Description |
|----------|-------------|
| [Architecture Review (Nov 2025)](./archive/architecture-reviews/ARCHITECTURE_REVIEW_2025_11.md) | Historical system design (Archived) |
| [Authentication](./architecture/AUTHENTICATION_ARCHITECTURE.md) | Auth flow with Supabase |
| [Checkout Flow](./architecture/CHECKOUT_FLOW.md) | Multi-step checkout process |
| [Cart System](./architecture/CART_SYSTEM_ARCHITECTURE.md) | Shopping cart internals |

### Key Features
Feature-specific documentation:

| Feature | Key Docs |
|---------|----------|
| **Auth** | [MFA](./features/authentication/MFA_IMPLEMENTATION.md), [Auth Flow](./features/authentication/auth-flow-review.md) |
| **Cart** | [Cart Locking](./features/cart/CART_LOCKING.md), [Analytics](./features/cart/CART_ANALYTICS.md) |
| **i18n** | [Configuration](./features/I18N_CONFIGURATION.md) - 4 languages: ES, EN, RO, RU |
| **Admin** | [Admin Testing](./guides/ADMIN_TESTING.md) |

### Testing
How to test the application:

| Type | Guide |
|------|-------|
| E2E Tests | [Testing Strategy](./manuals/TESTING_STRATEGY.md) |
| Visual Tests | [Test Coverage](./archive/testing/TEST_COVERAGE_IMPLEMENTATION.md) |
| Local Testing | [Local Testing Guide](./getting-started/LOCAL_TESTING_GUIDE.md) |

---

## Quick Reference

### Common Commands

```bash
# Development
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build

# Testing
pnpm test             # Run all tests
pnpm test:e2e         # E2E tests only

# Clean restart (if imports fail)
pkill -9 node && rm -rf .nuxt node_modules/.vite && pnpm dev
```

### Project Structure

```
components/
├── admin/           # Admin panel (requires auth)
├── layout/          # Header, footer, nav
├── product/         # Product display
└── ui/              # Reusable UI (shadcn-style)

pages/
├── admin/           # Admin pages (middleware: auth + admin)
├── auth/            # Login, register, forgot password
└── products/        # Product listing and detail

server/
├── api/             # REST endpoints
└── utils/           # Server utilities (auth, db)

i18n/locales/        # Translations (es, en, ro, ru)
```

### Key Rules

1. **Static imports only** in admin pages (no dynamic imports)
2. **All UI text** must have translations in all 4 locales
3. **Admin pages** need both `auth` and `admin` middleware
4. **Never skip git hooks** - fix the issue instead

---

## All Documentation

<details>
<summary><strong>📁 Getting Started</strong> - Setup guides</summary>

- [Quick Start Guide](./getting-started/QUICK_START_GUIDE.md)
- [MVP Quick Start](./getting-started/MVP_QUICK_START.md)
- [Supabase Setup](./getting-started/SUPABASE_SETUP.md)
- [Database Setup](./getting-started/DATABASE_SETUP.md)
- [Local Testing Guide](./getting-started/LOCAL_TESTING_GUIDE.md)

</details>

<details>
<summary><strong>🏗️ Architecture</strong> - System design</summary>

- [Architecture Review (Nov 2025)](./archive/architecture-reviews/ARCHITECTURE_REVIEW_2025_11.md) *(archived)*
- [Architecture Improvement Roadmap](./architecture/ARCHITECTURE_IMPROVEMENT_ROADMAP.md)
- [Authentication Architecture](./architecture/AUTHENTICATION_ARCHITECTURE.md)
- [Cart System Architecture](./architecture/CART_SYSTEM_ARCHITECTURE.md)
- [Checkout Flow](./architecture/CHECKOUT_FLOW.md)

</details>

<details>
<summary><strong>🛠️ Development</strong> - Patterns and standards</summary>

- [Tech Stack](./development/tech.md)
- [Code Conventions](./development/code-conventions.md)
- [Project Structure](./development/structure.md)
- [Patterns to Preserve](./development/PATTERNS_TO_PRESERVE.md)
- [Component Inventory](./development/component-inventory.md)
- [Troubleshooting Components](./development/troubleshooting-components.md)
- [shadcn Migration](./archive/migrations/SHADCN_MIGRATION.md) *(archived)*

</details>

<details>
<summary><strong>✨ Features</strong> - Feature documentation</summary>

**Authentication:**
- [MFA Implementation](./features/authentication/MFA_IMPLEMENTATION.md)
- [Auth Flow Review](./features/authentication/auth-flow-review.md)
- [Auth Middleware Test Results](./features/authentication/AUTH_MIDDLEWARE_TEST_RESULTS.md)

**Cart:**
- [Cart Analytics](./features/cart/CART_ANALYTICS.md)
- [Cart Locking](./features/cart/CART_LOCKING.md)
- [Atomic Inventory Fix](./features/cart/ATOMIC_INVENTORY_FIX.md)

**Other:**
- [i18n Configuration](./features/I18N_CONFIGURATION.md)
- [Landing Page CMS](./features/LANDING-PAGE-CMS.md)
- [Audit Logging](./features/AUDIT_LOGGING.md)

</details>

<details>
<summary><strong>📚 Guides</strong> - How-to guides</summary>

- [Implementation Guide](./manuals/IMPLEMENTATION_GUIDE.md)
- [Testing Strategy](./manuals/TESTING_STRATEGY.md)
- [Admin Testing](./manuals/ADMIN_TESTING.md)
- [Test User Simulation](./manuals/TEST_USER_SIMULATION.md)
- [Key Rotation Guide](./guides/KEY_ROTATION_COMPLETION_GUIDE.md)

</details>

<details>
<summary><strong>🧪 Testing</strong> - Test documentation</summary>

- [Test Coverage Implementation](./archive/testing/TEST_COVERAGE_IMPLEMENTATION.md) *(archived)*
- [Test Coverage Analysis](./testing/TEST_COVERAGE_ANALYSIS.md)
- [Playwright Best Practices](./archive/testing/playwright/PLAYWRIGHT_BEST_PRACTICES_ANALYSIS.md) *(archived)*
- [E2E Checkout Best Practices](./archive/testing/playwright/E2E_CHECKOUT_BEST_PRACTICES.md) *(archived)*
- [Visual Regression Issues](./visual-regression/VISUAL_REGRESSION_ISSUES_AND_FIXES.md)

</details>

<details>
<summary><strong>🔍 Analysis</strong> - Code reviews and analysis</summary>

- [SSR Safety Verification](./analysis/SSR-SAFETY-VERIFICATION.md)
- [LocalStorage Verification](./analysis/LOCALSTORAGE-VERIFICATION-COMPLETE.md)
- [Code Quality Analysis (Nov 2025)](./archive/reports/CODE_QUALITY_ANALYSIS_2025-11-01.md) *(archived)*
- [Code Review 2025](./archive/reviews/CODE_REVIEW_2025.md) *(archived)*

</details>

<details>
<summary><strong>🔬 Research</strong> - Research and exploration</summary>

- [Hero Section Quick Reference](./research/hero-section-quick-reference.md)
- [Filter Documentation](./research/FILTER_DOCUMENTATION_RESEARCH.md)
- [Landing Page Analysis](./research/LANDING_PAGE_SECTION_ANALYSIS.md)
- See also: `archive/research/` for completed research

</details>

<details>
<summary><strong>📝 Meta</strong> - Documentation guidelines</summary>

- [Archival Policy](./meta/ARCHIVAL_POLICY.md)
- [Documentation Conventions](./meta/DOCUMENTATION_CONVENTIONS.md)
- [Consolidation Plan](./meta/DOCUMENTATION_CONSOLIDATION_PLAN.md)

</details>

<details>
<summary><strong>📊 Status</strong> - Project status</summary>

- [Project Status](./status/PROJECT_STATUS.md)
- [Roadmap](./status/ROADMAP.md)
- [Progress](./status/PROGRESS.md)

</details>

<details>
<summary><strong>📋 Specs</strong> - Feature specifications</summary>

Active feature specifications in `specs/`:
- `user-authentication/` - Authentication system design
- `admin-order-management/` - Order management for admins
- `order-confirmation-emails/` - Email notification system
- `product-catalog/` - Product display and filtering
- See folder for full list (12+ active specs)

</details>

<details>
<summary><strong>🔧 Fixes</strong> - Bug fixes and solutions</summary>

- [Admin Fixes](./archive/fixes/admin-fixes/) - Admin panel issues and solutions *(archived)*
- Error handling guides

</details>

<details>
<summary><strong>🔒 Security</strong> - Security documentation</summary>

- GDPR compliance documentation
- Security logging guides

</details>

<details>
<summary><strong>📦 Archive</strong> - Historical docs</summary>

See [archive/README.md](./archive/README.md) for archived documentation.

</details>

---

## Need Help?

1. **Search docs:** `grep -r "search term" docs/`
2. **Check CLAUDE.md:** Project rules and conventions
3. **See archive:** Historical context in `docs/archive/`

---

**Last Updated:** January 6, 2026
