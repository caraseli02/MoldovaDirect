# Documentation Conventions & Best Practices

## Prerequisites

- [Add prerequisites here]

## Steps


**Last Updated:** November 2, 2025
**Purpose:** Comprehensive guide to documentation standards for the Moldova Direct e-commerce platform

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Documentation Structure](#documentation-structure)
3. [Framework-Specific Conventions](#framework-specific-conventions)
4. [Testing Documentation](#testing-documentation)
5. [Naming Conventions](#naming-conventions)
6. [Version Control Guidelines](#version-control-guidelines)
7. [Deployment Documentation](#deployment-documentation)
8. [Official Documentation Resources](#official-documentation-resources)

---

## Tech Stack Overview

### Identified Frameworks & Tools

Based on `package.json` analysis:

**Frontend Framework:**
- Nuxt 3.17.7 (Vue 3.5.18)
- TypeScript 24.3.0
- Tailwind CSS 4.1.12
- shadcn-nuxt 2.2.0

**State & Utilities:**
- Pinia 0.11.2 (state management)
- @nuxtjs/i18n 10.0.3 (internationalization)
- @vueuse/core 13.9.0 (composable utilities)

**Testing:**
- Vitest 3.2.4 (unit testing)
- Playwright 1.55.0 (e2e testing)
- @nuxt/test-utils 3.19.2

**Backend & Services:**
- Supabase (@nuxtjs/supabase 1.6.0)
- Stripe 18.5.0
- Resend 6.0.1 (email)

**Build & Deployment:**
- Vercel (deployment platform)
- pnpm 9.0.0+ (package manager)
- Node.js 22.4.0+

---

## Documentation Structure

### Current Project Structure

The project follows a **hybrid documentation approach** combining:
1. Top-level technical guides (`/docs/`)
2. Kiro spec-driven development (`.kiro/`)
3. Component-level documentation (inline JSDoc/TSDoc)

```
MoldovaDirect/
├── README.md                    # Main project README (always version-controlled)
├── QUICK_START_GUIDE.md        # Getting started guide
├── DOCUMENTATION_INDEX.md       # Master documentation index
├── DOCUMENTATION_SUMMARY.md     # Documentation overview
│
├── docs/                        # Technical documentation (version-controlled)
│   ├── README.md               # Documentation index
│   ├── CHANGELOG.md            # Version history & updates
│   ├── AUTHENTICATION_ARCHITECTURE.md
│   ├── CART_SYSTEM_ARCHITECTURE.md
│   ├── CHECKOUT_FLOW.md
│   ├── TESTING_STRATEGY.md
│   ├── LOCAL_TESTING_GUIDE.md
│   └── SUPABASE_SETUP.md
│
├── .kiro/                       # Kiro spec-driven docs (version-controlled)
│   ├── README.md               # Kiro system index
│   ├── PROJECT_STATUS.md       # Current status
│   ├── ROADMAP.md              # Development timeline
│   ├── PROGRESS.md             # Completed milestones
│   │
│   ├── steering/               # Project standards
│   │   ├── product.md
│   │   ├── tech.md
│   │   ├── structure.md
│   │   ├── code-conventions.md
│   │   └── supabase-best-practices.md
│   │
│   ├── specs/                  # Feature specifications
│   │   ├── user-authentication/
│   │   ├── checkout/
│   │   └── admin-order-management/
│   │
│   ├── docs/                   # Operational guides
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   ├── DATABASE_SETUP.md
│   │   └── TESTING.md
│   │
│   └── archive/                # Historical docs
│
├── tests/                      # Testing documentation
│   └── AUTH_TESTING_GUIDE.md
│
├── todos/                      # Issue tracking (version-controlled)
│   ├── README.md
│   └── [issue-files].md
│
├── components/                 # Component-level docs
│   └── [component]/README.md
│
├── middleware/
│   └── README.md
│
├── scripts/
│   └── README.md
│
└── server/
    └── utils/
        └── [feature].README.md
```

### Best Practices from Research

#### Where to Put Documentation

**1. Technical Guides → `/docs/`**
- Setup and installation instructions
- Architecture documentation
- API documentation
- Migration guides
- Development workflows
- System architecture

**2. Project Specifications → `/.kiro/specs/`**
- Feature requirements (requirements.md)
- Technical designs (design.md)
- Implementation tasks (tasks.md)
- Completion summaries

**3. Project Management → `/.kiro/`**
- Status reports
- Roadmaps and timelines
- Progress tracking
- Project standards (steering/)

**4. Component Documentation → Inline + README**
- JSDoc/TSDoc comments in code
- Component README files for complex features
- Usage examples
- Props, events, slots documentation

**5. Testing Documentation → `/tests/` or `/docs/`**
- Testing guides in `/tests/` directory
- Strategy docs in `/docs/`
- Test-specific READMEs near test files

**6. API/Server Documentation → `/server/` or `/docs/`**
- Endpoint documentation near implementation
- High-level API guides in `/docs/`
- Server utility READMEs in `/server/utils/`

---

## Framework-Specific Conventions

### Nuxt 3 Documentation Standards

**Official Resources:**
- [Nuxt 3 Guide](https://nuxt.com/docs/3.x/guide)
- [Nuxt Directory Structure](https://nuxt.com/docs/guide/directory-structure)
- [Nuxt Module Conventions](https://nuxt.com/docs/guide/going-further/modules)

**Key Conventions:**

1. **Directory-Based Documentation**
   - Nuxt uses convention-over-configuration
   - Document directory purposes in `/docs/`
   - Each major feature directory should have context

2. **Module Documentation**
   - Follow [Nuxt module template](https://github.com/nuxt/starter/tree/module)
   - Include README with usage examples
   - Document module options and configuration

3. **Content Directory** (if using @nuxt/content)
   - Documentation lives in `/content/` directory
   - Automatic navigation from folder structure
   - Supports MDC syntax (Markdown + Vue components)

4. **Nuxt-Specific Files**
   - `nuxt.config.ts` should have inline comments explaining complex configs
   - Document runtime config in `.env.example` with descriptions

**Example Documentation Pattern:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Restrict component auto-registration to prevent TypeScript
  // index files from being treated as components
  components: {
    extensions: ['vue'],
    dirs: [...BASE_COMPONENT_DIRS],
  },
})
```

### Vue 3 & Composition API

**Official Resources:**
- [Vue 3 Composition API Guide](https://vuejs.org/guide/extras/composition-api-faq)
- [Vue Composables](https://vuejs.org/guide/reusability/composables)

**Documentation Best Practices:**

1. **Composable Documentation**
   - Composable names start with `use` (e.g., `useCart`, `useAuth`)
   - Document parameters, return values, and side effects
   - Include usage examples in JSDoc

2. **Component Documentation**
   - Use `<script setup>` with TypeScript
   - Document props with TypeScript interfaces
   - Add JSDoc for complex computed properties

3. **Code Organization Order** (recommended):
   ```typescript
   // 1. Imports
   // 2. Props definition
   // 3. Emits definition
   // 4. Reactive state (ref, reactive)
   // 5. Computed properties
   // 6. Methods/functions
   // 7. Lifecycle hooks (onMounted, onUnmounted, etc.)
   // 8. Watch/watchEffect
   ```

**Example:**
```typescript
/**
 * Cart management composable with Pinia availability check
 *
 * @returns Cart operations and state
 * @example
 * ```typescript
 * const { items, addItem, removeItem } = useCart()
 * await addItem(product, quantity)
 * ```
 */
export function useCart() {
  // Implementation
}
```

### TypeScript & JSDoc Standards

**Official Resources:**
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [TypeScript Documentation Generation Guide](https://www.ceos3c.com/typescript/typescript-documentation-generation-a-complete-guide/)

**Documentation Conventions:**

1. **JSDoc Comments**
   - Use `/** */` for documentation comments
   - Place JSDoc before decorators (for Angular/decorated code)
   - Document exported functions, classes, and interfaces

2. **Supported Tags**
   - `@param` - Parameter documentation
   - `@returns` - Return value documentation
   - `@throws` - Exception documentation
   - `@example` - Usage examples
   - `@deprecated` - Mark deprecated code
   - `@template` - Generic type parameters
   - `@typedef` - Type definitions

3. **Avoid Redundancy**
   - Don't restate what's obvious from the name
   - Focus on "why" not "what"
   - Document non-obvious behavior

4. **Documentation Generation**
   - Use TypeDoc for generating documentation sites
   - Configure in `typedoc.json`
   - Auto-generate API docs from code

**Example:**
```typescript
/**
 * Creates an order with payment processing
 *
 * @param orderData - Order details including items and shipping
 * @param paymentMethod - Payment method ("stripe" | "cash_on_delivery")
 * @returns Created order with confirmation details
 * @throws {PaymentError} When payment processing fails
 * @example
 * ```typescript
 * const order = await createOrder(orderData, 'stripe')
 * console.log(order.id)
 * ```
 */
export async function createOrder(
  orderData: OrderInput,
  paymentMethod: PaymentMethod
): Promise<Order> {
  // Implementation
}
```

### Pinia Store Documentation

**Official Resources:**
- [Pinia Core Concepts](https://pinia.vuejs.org/core-concepts/)
- [Pinia Introduction](https://pinia.vuejs.org/introduction.html)

**Naming Conventions:**
- Store names: `use[Feature]Store` (e.g., `useCartStore`, `useAuthStore`)
- Store IDs: kebab-case matching feature (e.g., `'cart'`, `'auth'`)

**Documentation Standards:**

1. **Store Definition**
   - Document store purpose and responsibility
   - List key state properties
   - Explain complex getters and actions

2. **Organization**
   - One store per file
   - File location: `/stores/[feature].ts`
   - Export using `defineStore()`

**Example:**
```typescript
/**
 * Shopping cart store
 *
 * Manages cart items, quantities, and persistence.
 * Syncs with local storage and authenticates users.
 *
 * @example
 * ```typescript
 * const cartStore = useCartStore()
 * cartStore.addItem(product, quantity)
 * ```
 */
export const useCartStore = defineStore('cart', () => {
  // Setup function style (Composition API)
  const items = ref<CartItem[]>([])

  // All state must be returned for Pinia to track it
  return { items, addItem, removeItem }
})
```

### Tailwind CSS Documentation

**Best Practices:**
- Document custom theme configurations in code comments
- Maintain design system documentation separately
- Use semantic class names in components
- Document color variables and design tokens

**Example:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      // Brand colors - see docs/DESIGN_SYSTEM.md
      colors: {
        brand: {
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
        },
      },
    },
  },
}
```

---

## Testing Documentation

### Vitest Unit Testing

**Official Resources:**
- [Vitest Guide](https://vitest.dev/guide/)
- [Vitest Component Testing](https://vitest.dev/guide/browser/component-testing)

**Documentation Standards:**

1. **Test File Organization**
   ```
   tests/
   ├── unit/                    # Unit tests mirror source structure
   │   ├── composables/
   │   ├── components/
   │   └── utils/
   ├── fixtures/                # Shared test fixtures
   └── setup/                   # Test setup files
   ```

2. **Test Documentation**
   - Use descriptive test names
   - Group related tests with `describe`
   - Document complex test setup in comments
   - Include coverage requirements

**Example:**
```typescript
describe('useCart', () => {
  /**
   * Tests cart initialization with Pinia availability check
   * Ensures graceful fallback when Pinia is not ready
   */
  it('should handle Pinia unavailability gracefully', () => {
    // Test implementation
  })
})
```

### Playwright E2E Testing

**Official Resources:**
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Organizing Playwright Tests](https://dev.to/playwright/organizing-playwright-tests-effectively-2hi0)

**Test Organization Standards:**

1. **Folder Structure**
   ```
   tests/
   ├── e2e/                     # End-to-end test suites
   │   ├── auth.spec.ts
   │   ├── products.spec.ts
   │   ├── checkout.spec.ts
   │   └── i18n.spec.ts
   ├── visual/                  # Visual regression tests
   │   └── visual-regression.spec.ts
   ├── fixtures/               # Page objects and helpers
   │   ├── base.ts
   │   ├── helpers.ts
   │   └── pages.ts
   ├── global-setup.ts
   └── AUTH_TESTING_GUIDE.md
   ```

2. **Test Documentation**
   - Use test.step() for complex flows with descriptive labels
   - Document test tags (@smoke, @regression, @visual)
   - Maintain testing guides in `/tests/` directory
   - Include setup instructions

3. **Page Object Model**
   - One file per major page/feature
   - Document selectors and actions
   - Use data-testid attributes

**Example:**
```typescript
/**
 * Checkout flow test covering all payment methods
 *
 * @tag @smoke @critical-path
 * @requires authenticated user
 * @requires products in cart
 */
test('should complete checkout with Stripe payment', async ({ page }) => {
  await test.step('Navigate to checkout', async () => {
    // Step implementation
  })

  await test.step('Fill shipping information', async () => {
    // Step implementation
  })
})
```

### Testing Documentation Best Practices

1. **Test Strategy Document** (`/docs/TESTING_STRATEGY.md`)
   - Overall testing approach
   - Coverage requirements
   - Test categorization
   - CI/CD integration

2. **Setup Guides** (`/tests/[FEATURE]_TESTING_GUIDE.md`)
   - Environment setup
   - Running specific test suites
   - Troubleshooting common issues
   - Test data management

3. **Coverage Reports**
   - Generated in `/coverage/` (gitignored)
   - Summary in documentation
   - Coverage badges in README

---

## Naming Conventions

### Documentation File Naming

**Standard Naming Patterns:**

1. **Top-Level Documentation:**
   - `README.md` - Project overview (required)
   - `CONTRIBUTING.md` - Contribution guidelines
   - `CHANGELOG.md` - Version history
   - `LICENSE.md` - License information
   - `SECURITY.md` - Security policy
   - `CODE_OF_CONDUCT.md` - Community guidelines

2. **Technical Documentation:**
   - `[FEATURE]_ARCHITECTURE.md` - Architecture docs
   - `[FEATURE]_GUIDE.md` - How-to guides
   - `[SYSTEM]_SETUP.md` - Setup instructions
   - `[FEATURE]_API.md` - API documentation

3. **Status & Planning:**
   - `PROJECT_STATUS.md` - Current status
   - `ROADMAP.md` - Future plans
   - `PROGRESS.md` - Completed work

4. **Kiro Specifications:**
   - `requirements.md` - Feature requirements
   - `design.md` - Technical design
   - `tasks.md` - Implementation tasks
   - `COMPLETION_SUMMARY.md` - Final summary

**Naming Rules:**
- Use `UPPERCASE_WITH_UNDERSCORES.md` for important top-level docs
- Use `kebab-case.md` for feature-specific docs
- Use descriptive names that indicate content
- Include dates in time-sensitive docs (e.g., `CODE_QUALITY_ANALYSIS_2025-11-01.md`)

### Component & Code Documentation

**File Naming:**
- Components: `PascalCase.vue` (e.g., `ProductCard.vue`)
- Composables: `use[Feature].ts` (e.g., `useCart.ts`)
- Stores: `[feature].ts` in `/stores/` (e.g., `cart.ts`)
- Types: `[feature].types.ts` or `types.ts`
- README: Always `README.md` (uppercase)

---

## Version Control Guidelines

### What to Version Control

**✅ Always Commit:**
- All documentation files (*.md)
- README files at all levels
- CHANGELOG.md
- Code comments and JSDoc
- .env.example (with placeholders)
- Configuration files with docs
- Test documentation

**❌ Never Commit (add to .gitignore):**
- `.env` files (actual credentials)
- `/node_modules/`
- `/coverage/` (test coverage reports)
- `/test-results/` (Playwright results)
- `/playwright-report/` (HTML reports)
- `/.nuxt/` (build artifacts)
- `/.output/` (build output)
- `/.vercel/` (deployment artifacts)
- Generated documentation sites
- IDE-specific files (`.vscode/settings.json`)
- OS files (`.DS_Store`, `Thumbs.db`)

**Current Project .gitignore (Relevant Sections):**
```gitignore
# Documentation artifacts (gitignored)
/coverage/
/test-results/
/playwright-report/
screenshots/

# But documentation source is committed
# *.md files are version-controlled
```

### Git Workflow Documentation

**Official Resources:**
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

**Commit Message Conventions:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Test additions or fixes
- `chore:` Build process, dependencies, etc.

**Documentation Commit Examples:**
```bash
# Good examples
docs(readme): update quick start guide with pnpm commands
docs(api): document new payment webhook endpoints
docs(testing): add Playwright visual regression guide

# With body for complex changes
docs(architecture): document cart system improvements

- Added Pinia availability detection
- Documented memory management patterns
- Updated cart analytics architecture
```

### Changelog Maintenance

**Standards:**
- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Group changes by type (Added, Changed, Deprecated, Removed, Fixed, Security)
- Include dates for all releases
- Link to relevant documentation
- Update immediately after significant changes

**Example Structure:**
```markdown
# Changelog

## [Unreleased]

### Added
- New feature X with documentation

## [1.2.0] - 2025-11-01

### Added
- Visual regression tests for all admin pages
- Comprehensive testing documentation

### Fixed
- Dashboard routing issues in tests

### Changed
- Updated authentication flow documentation

## [1.1.0] - 2025-10-12
...
```

---

## Deployment Documentation

### Vercel Deployment Standards

**Official Resources:**
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Deployment Environments](https://vercel.com/docs/deployments/environments)

**Documentation Requirements:**

1. **Environment Variables Documentation**
   - Document all required variables in `.env.example`
   - Include descriptions and example values
   - Note which are required vs optional
   - Separate by environment (dev, preview, production)

2. **Deployment Guide** (`/docs/DEPLOYMENT_GUIDE.md` or `.kiro/docs/DEPLOYMENT_GUIDE.md`)
   - Pre-deployment checklist
   - Environment setup steps
   - Deployment commands
   - Post-deployment verification
   - Rollback procedures

3. **Environment-Specific Docs**
   - Development setup
   - Staging/preview configuration
   - Production requirements

**Example .env.example:**
```bash
# Supabase Configuration (Required for all environments)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key                    # Public anon key
SUPABASE_SERVICE_KEY=your-service-key         # Server-side only (NEVER expose)

# Stripe Payment Processing (Required for production)
STRIPE_PUBLISHABLE_KEY=pk_test_...            # Use pk_live_... in production
STRIPE_SECRET_KEY=sk_test_...                 # Use sk_live_... in production

# Email Service - Resend (Required for transactional emails)
RESEND_API_KEY=re_...
FROM_EMAIL="Moldova Direct <noreply@moldovadirect.com>"

# Feature Flags (Optional)
ENABLE_TEST_USERS=true                        # Set to false in production
```

### Database Documentation

**Supabase-Specific:**
- SQL schemas in `/supabase/sql/`
- Migration documentation
- RLS policy documentation
- Database setup guide (`/docs/SUPABASE_SETUP.md`)

**Best Practices:**
- Document all database schemas
- Explain RLS policies and security
- Include seed data scripts with docs
- Document backup/restore procedures

---

## E-Commerce Specific Documentation

### Payment Integration Documentation

**Required Documentation:**
- Payment provider setup (Stripe)
- Webhook configuration
- Testing procedures
- Error handling
- Security considerations

**Example Location:**
- `/docs/CHECKOUT_FLOW.md` - Overall checkout process
- `/docs/STRIPE_INTEGRATION.md` - Stripe-specific details
- Server API docs near implementation

### Order Management

**Documentation Needs:**
- Order lifecycle documentation
- Status transitions
- Email notifications
- Admin management workflows

**Current Implementation:**
- Order flow in `/docs/CHECKOUT_FLOW.md`
- Specifications in `/.kiro/specs/admin-order-management/`

### Internationalization (i18n)

**Documentation Requirements:**
- Supported languages
- Translation file structure
- Adding new languages
- Translation workflow

**Current Implementation:**
- `/docs/I18N_CONFIGURATION.md` - Configuration details
- README sections on i18n usage
- Inline comments in `nuxt.config.ts`

---

## Official Documentation Resources

### Framework Documentation

**Nuxt 3:**
- Official Guide: https://nuxt.com/docs/3.x/guide
- Directory Structure: https://nuxt.com/docs/guide/directory-structure
- Module Development: https://nuxt.com/docs/guide/going-further/modules
- Best Practices: https://nuxt.com/docs/getting-started/best-practices
- Community Contribution: https://nuxt.com/docs/community/contribution

**Vue 3:**
- Composition API FAQ: https://vuejs.org/guide/extras/composition-api-faq
- Composables Guide: https://vuejs.org/guide/reusability/composables
- Style Guide: https://vuejs.org/style-guide/
- TypeScript Support: https://vuejs.org/guide/typescript/overview

**TypeScript:**
- JSDoc Reference: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
- Google TS Style Guide: https://google.github.io/styleguide/tsguide.html
- Documentation Generation: https://www.ceos3c.com/typescript/typescript-documentation-generation-a-complete-guide/

**Pinia:**
- Core Concepts: https://pinia.vuejs.org/core-concepts/
- Introduction: https://pinia.vuejs.org/introduction.html
- Composing Stores: https://pinia.vuejs.org/cookbook/composing-stores

### Testing Frameworks

**Vitest:**
- Guide: https://vitest.dev/guide/
- Component Testing: https://vitest.dev/guide/browser/component-testing
- API Reference: https://vitest.dev/api/

**Playwright:**
- Best Practices: https://playwright.dev/docs/best-practices
- Test Organization: https://dev.to/playwright/organizing-playwright-tests-effectively-2hi0
- Writing Tests: https://playwright.dev/docs/writing-tests
- Page Object Models: https://playwright.dev/docs/pom

### Build & Deployment

**Vercel:**
- Environment Variables: https://vercel.com/docs/environment-variables
- Deployment Environments: https://vercel.com/docs/deployments/environments
- System Variables: https://vercel.com/docs/environment-variables/system-environment-variables
- CLI Reference: https://vercel.com/docs/cli

**Supabase:**
- Getting Started: https://supabase.com/docs
- Auth Documentation: https://supabase.com/docs/guides/auth
- Database: https://supabase.com/docs/guides/database
- Storage: https://supabase.com/docs/guides/storage

### Standards & Conventions

**Git & Versioning:**
- Conventional Commits: https://www.conventionalcommits.org/
- Semantic Versioning: https://semver.org/
- Keep a Changelog: https://keepachangelog.com/
- Git Ignore Templates: https://github.com/github/gitignore

**Documentation Tools:**
- Markdown Guide: https://www.markdownguide.org/
- TypeDoc: https://typedoc.org/
- VitePress (Vue docs): https://vitepress.dev/
- MkDocs (Python): https://www.mkdocs.org/

**E-Commerce Best Practices:**
- Stripe Integration: https://stripe.com/docs
- Stripe Testing: https://stripe.com/docs/testing
- Resend Email: https://resend.com/docs

---

## Documentation Maintenance

### Regular Updates

**When to Update Documentation:**
1. **Immediately:**
   - When adding new features
   - When changing APIs or interfaces
   - When fixing bugs that affect documented behavior
   - When updating dependencies with breaking changes

2. **Weekly/Sprint:**
   - Update PROJECT_STATUS.md
   - Update CHANGELOG.md with accumulated changes
   - Review and update ROADMAP.md

3. **Monthly:**
   - Review all documentation for accuracy
   - Archive outdated documentation
   - Update dependency documentation
   - Audit external documentation links

### Documentation Review Checklist

- [ ] Are code examples still accurate?
- [ ] Do all external links still work?
- [ ] Is the documentation structure still logical?
- [ ] Are there any outdated screenshots or diagrams?
- [ ] Does the changelog reflect recent changes?
- [ ] Are environment variables documented correctly?
- [ ] Is the test documentation up to date?
- [ ] Are breaking changes clearly marked?

### Documentation Quality Standards

1. **Clarity:**
   - Write for your audience (developers, users, admins)
   - Use clear, concise language
   - Include examples for complex topics
   - Define acronyms and technical terms

2. **Completeness:**
   - Cover all features and functionality
   - Include edge cases and limitations
   - Document error handling
   - Provide troubleshooting guides

3. **Accuracy:**
   - Test all code examples
   - Verify all instructions
   - Keep documentation in sync with code
   - Update dates on time-sensitive docs

4. **Structure:**
   - Use consistent formatting
   - Include table of contents for long docs
   - Use headings hierarchically
   - Cross-reference related documentation

---

## Quick Reference

### Documentation Checklist for New Features

When implementing a new feature, ensure:

- [ ] Feature specification in `/.kiro/specs/[feature]/`
- [ ] API documentation (if applicable)
- [ ] Component JSDoc comments
- [ ] Usage examples in README or guide
- [ ] Test documentation
- [ ] Update CHANGELOG.md
- [ ] Update PROJECT_STATUS.md
- [ ] Update relevant architecture docs
- [ ] Add to DOCUMENTATION_INDEX.md
- [ ] Environment variables in .env.example

### File Locations Quick Reference

| Documentation Type | Location | Version Controlled |
|-------------------|----------|-------------------|
| Main README | `/README.md` | ✅ Yes |
| Technical Guides | `/docs/*.md` | ✅ Yes |
| Feature Specs | `/.kiro/specs/*/` | ✅ Yes |
| Project Status | `/.kiro/PROJECT_STATUS.md` | ✅ Yes |
| Changelog | `/docs/CHANGELOG.md` | ✅ Yes |
| Test Guides | `/tests/*.md` | ✅ Yes |
| Component Docs | Inline JSDoc + README | ✅ Yes |
| Coverage Reports | `/coverage/` | ❌ No (gitignored) |
| Test Results | `/test-results/` | ❌ No (gitignored) |
| Build Artifacts | `/.nuxt/`, `/.output/` | ❌ No (gitignored) |

---

## Summary

This documentation convention guide establishes standards for the Moldova Direct e-commerce platform based on:

1. **Industry Best Practices:** Following official framework conventions from Nuxt, Vue, TypeScript, Vitest, and Playwright
2. **Project Structure:** Hybrid approach with technical docs in `/docs/` and specs in `/.kiro/`
3. **Version Control:** All documentation source files are version-controlled; generated reports are gitignored
4. **Testing Standards:** Comprehensive documentation for both unit (Vitest) and e2e (Playwright) testing
5. **Deployment:** Clear documentation for Vercel deployment and environment configuration
6. **Maintenance:** Regular update cycles and quality standards

**Key Takeaway:** Good documentation is code. Treat it with the same care as production code—version it, review it, test it, and keep it up to date.

---

**Maintained by:** Development Team
**Last Updated:** November 2, 2025
**Next Review:** December 2025
