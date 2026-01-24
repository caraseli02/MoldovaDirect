# Moldova Direct - E-Commerce Platform

🛒 Modern e-commerce platform for authentic Moldovan food and wine products with delivery to Spain.

## 🚀 Quick Start

```bash
# Install dependencies (this project uses pnpm)
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
pnpm dev

# Open browser
http://localhost:3000
```

**New to the project?** See [Quick Start Guide](./docs/tutorials/quick-start-guide.md) for a comprehensive getting started guide with Day 1 Checklist.

## 🔧 Development Setup

### Prerequisites
- Node.js 22+ (required for Vite/Vue tooling). Use `.nvmrc` or `.node-version` in this repo to switch.
- Supabase account and project

### Environment Variables
Create a `.env` file with:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Stripe Payment Processing (Primary payment processor)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Email Service (Transactional emails)
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL="Your Brand <onboarding@resend.dev>"

# Session Security
NUXT_SECRET_KEY=your_secret_key_for_sessions
```

**Payment Processing:** This application uses **Stripe** as the primary payment processor. PayPal integration was removed in October 2025 as it was never implemented in the UI.

**Email Configuration:** Use Resend's shared domain (`onboarding@resend.dev`) while you prototype. When you're ready for a branded sender, verify your own domain in Resend and update `FROM_EMAIL` accordingly.

### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env`
3. Run the SQL schema from `supabase/sql/supabase-schema.sql` in your Supabase SQL editor
4. Enable authentication in your Supabase dashboard

For detailed setup instructions, see [SUPABASE_SETUP.md](./docs/getting-started/SUPABASE_SETUP.md).

### Internationalization Setup
The application uses lazy-loaded translations for optimal performance. Translation files are automatically loaded when users switch languages, reducing initial bundle size by ~75%.

### Database Management
With Supabase, database management is handled through the Supabase dashboard:

- **Schema Changes**: Apply SQL directly in Supabase SQL Editor
- **Database GUI**: Use built-in Supabase Table Editor
- **Migrations**: Version controlled through Supabase CLI or SQL scripts

### Deployment Commands
```bash
# Build for production
pnpm build

# Deploy to Vercel (production)
pnpm deploy

# Deploy to Vercel (preview)
pnpm deploy:preview
```

## 📚 Documentation

**Quick Links:**
- **[Documentation Hub](./docs/README.md)** - Start here for all documentation
- **[Quick Start Guide](./docs/tutorials/quick-start-guide.md)** - Get started in 30 minutes
- **[Code Conventions](./docs/reference/configuration/code-conventions.md)** - How we write code
- **[Project Status](./docs/project/status/project-status.md)** - Current state and priorities

**Project Status & Planning:**
- **[Project Status](docs/project/status/project-status.md)** - Current state and health
- **[Roadmap](docs/project/roadmap/roadmap.md)** - Development timeline
- **[Progress](docs/project/status/progress.md)** - Completed milestones
- **[Feature Specifications](docs/archive/specs/)** - Feature requirements and designs
- **[Troubleshooting Components](docs/how-to/debugging/troubleshooting-components.md)** - Fix for duplicate component names, auto-imports, and casing

### QA & Simulation Utilities

Use the built-in QA dashboards to simulate user activity without touching production data:

- **[Test Users & Persona Simulator](docs/how-to/testing/test-user-simulation.md)** – Walkthrough for the `/test-users` page, including persona catalog, auth store helpers, and environment flag requirements.
- **[Admin Testing Dashboard](docs/how-to/testing/admin-testing.md)** – Guide to the `/admin/testing` workspace for seeding data presets, impersonating users, and cleaning up after manual QA sessions.

## 🎯 Current Status

✅ **Completed Features**
- Foundation with multi-language support (ES/EN/RO/RU)
- Product catalog with categories and search
- User authentication with Supabase Auth
- Shopping cart with persistence and analytics
- Multi-step checkout UI with shipping, payment, and review steps
- Order API endpoints with customer order history
- Admin dashboard views for products and users
- Dark/light theme system with custom UI components
- Stripe payment integration (primary payment processor)
- Email notification system with Resend

🚧 **In Progress**
- Security hardening (re-enabling auth middleware, rate limiting)
- Production payment credentials and testing
- Enhanced transactional email workflows (shipping updates, order tracking)
- Admin analytics dashboards and advanced reporting
- Code refactoring (products page, auth store split)

⚠️ **Known Issues (From Code Review)**
- Admin middleware temporarily disabled for testing (CRITICAL - needs re-enabling)
- Missing rate limiting on authentication endpoints
- Products page needs refactoring (915 lines) - **Test plan ready:** See `docs/how-to/testing/products-page-refactoring-test-plan.md`
- Auth store needs splitting (1,172 lines)

📝 **Recent Changes (November 2025)**
- Comprehensive visual test coverage added (85% of pages)
- Deep code review completed with security recommendations
- Test coverage analysis and implementation completed
- Fixed authentication middleware and dashboard routing issues
- Added visual regression tests for admin, account, and checkout pages
- Improved test infrastructure with better fixtures and helpers

**October 2025:**
- Removed PayPal integration (unused feature)
- Cleaned up unused composables and dependencies
- Organized test scripts into `scripts/` directory
- Streamlined payment processing to focus on Stripe

See [Roadmap](docs/status/ROADMAP.md) for detailed timeline.

## 🛠 Tech Stack

### Frontend
- **Framework**: Nuxt 4.2+ with Vue 3.5 Composition API
- **Language**: TypeScript with strict type checking
- **UI Components**: Custom component library (lightweight, accessible)
- **Styling**: Tailwind CSS v4 with CSS variables
- **State Management**: Pinia stores
- **Internationalization**: @nuxtjs/i18n with lazy loading (ES/EN/RO/RU)
- **Analytics**: Custom cart analytics with offline capability and memory optimization

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with email verification
- **Storage**: Supabase Storage for images
- **Deployment**: Vercel with automatic deployments
- **CI/CD**: GitHub Actions

## 🌍 Internationalization (i18n)

The application supports 4 languages with optimized lazy loading:

### Supported Languages
- **Spanish (es)** - Default language
- **English (en)** - Full translation
- **Romanian (ro)** - Full translation  
- **Russian (ru)** - Full translation

### Features
- **Lazy Loading**: Translation files are loaded only when needed, improving initial page load performance
- **Browser Detection**: Automatically detects user's preferred language
- **URL Strategy**: Uses prefix strategy (e.g., `/en/products`, `/ro/cart`) except for default Spanish
- **Persistent Storage**: Remembers user's language choice via cookies
- **SEO Optimized**: Proper hreflang tags and localized URLs

### Configuration
```typescript
// nuxt.config.ts
i18n: {
  locales: [
    { code: 'es', name: 'Español', file: 'es.json' },
    { code: 'en', name: 'English', file: 'en.json' },
    { code: 'ro', name: 'Română', file: 'ro.json' },
    { code: 'ru', name: 'Русский', file: 'ru.json' }
  ],
  lazy: true,                    // Enable lazy loading
  langDir: 'locales/',          // Translation files directory (relative to /i18n)
  defaultLocale: 'es',
  strategy: 'prefix_except_default'
}
```

### Usage in Components
```vue
<template>
  <h1>{{ $t('welcome.title') }}</h1>
  <p>{{ $t('welcome.description') }}</p>
</template>

<script setup>
// Access current locale
const { locale, locales, setLocale } = useI18n()

// Switch language programmatically
const switchToEnglish = () => setLocale('en')
</script>
```

### Translation Files Structure
```
i18n/locales/
├── es.json    # Spanish (default)
├── en.json    # English
├── ro.json    # Romanian
└── ru.json    # Russian
```

Each file contains nested translation objects:
```json
{
  "nav": {
    "home": "Home",
    "products": "Products",
    "cart": "Cart"
  },
  "auth": {
    "login": "Sign In",
    "register": "Sign Up"
  }
}
```

## 🔐 Authentication Features

### Core Authentication
- User registration with email verification
- Secure login with Supabase Auth
- Magic link authentication
- Password reset functionality
- Protected routes with RLS policies
- Account dashboard
- Multi-language authentication support

### Authentication Architecture
- **Plugin-based Initialization**: Authentication state is initialized through a dedicated client-side plugin
- **Lazy Loading**: Auth store is loaded only when needed to optimize performance
- **Cross-tab Synchronization**: Real-time session sync across browser tabs
- **Automatic Token Refresh**: Periodic session refresh during user activity (every 10 minutes)
- **Error Handling**: Comprehensive error handling with graceful fallbacks
- **Cleanup Management**: Proper cleanup of event listeners and intervals

### Cart System Architecture
- **Pinia Availability Check**: Cart composable includes intelligent Pinia readiness detection to prevent initialization errors
- **Graceful Fallbacks**: Returns minimal interface when Pinia is not available (SSR/initialization timing)
- **Error Resilience**: Comprehensive error handling with fallback states for all cart operations
- **Memory Management**: Proper cleanup of intervals and event listeners to prevent memory leaks
- **Session Persistence**: Cart state and analytics persist across page reloads and browser tabs

### Cart Analytics Architecture
- **Automatic Tracking**: Cart interactions are tracked automatically via client-side plugin
- **Offline Capability**: Events are stored locally and synced with server when online
- **Abandonment Detection**: Automatic detection and tracking of cart abandonment patterns
- **Performance Optimized**: Minimal impact on user experience with efficient event batching

### Technical Implementation

#### Authentication Plugin
The authentication system uses a plugin-based approach for initialization:

```typescript
// Access the auth initialization function
const { $initAuth } = useNuxtApp()

// Initialize authentication when needed
const cleanup = await $initAuth()

// Cleanup is handled automatically on page unload
```

#### Cart System Plugin
The cart system uses intelligent initialization with Pinia availability detection:

```typescript
// Cart composable with Pinia availability check
const { items, addItem, removeItem } = useCart()

// The composable automatically:
// - Checks if Pinia is available before initialization
// - Returns minimal interface for SSR/timing issues
// - Provides comprehensive error handling
// - Handles graceful fallbacks when store is not ready

// Pinia availability is checked internally:
const isPiniaAvailable = () => {
  try {
    const pinia = getActivePinia()
    return !!pinia
  } catch {
    return false
  }
}
```

#### Cart Analytics Plugin
Cart analytics are automatically initialized and managed:

```typescript
// Cart analytics are automatically initialized on app startup
// The plugin handles:
// - Automatic cart view tracking on navigation
// - Periodic server synchronization (every 5 minutes)
// - Event cleanup on page unload
// - Memory leak prevention with proper interval management

// Access cart analytics functionality
const { 
  trackAddToCart, 
  trackCartView, 
  syncEventsWithServer 
} = useCartAnalytics()

// Manual cleanup is available if needed
if (window.__cartAnalyticsCleanup) {
  window.__cartAnalyticsCleanup()
}
```

### Session Management

#### Authentication Sessions
- **Persistence**: Sessions persist across browser tabs and page reloads
- **Reactive Updates**: Authentication state updates reactively across the application
- **Storage Events**: Listens for authentication changes from other tabs
- **Automatic Refresh**: Maintains active sessions with periodic token refresh

#### Cart Analytics Sessions
- **Session Tracking**: Each cart session is tracked with unique identifiers
- **Activity Monitoring**: Tracks time spent in cart and user activity patterns
- **Offline Storage**: Events are stored locally using localStorage for offline capability
- **Automatic Sync**: Events are synchronized with the server every 5 minutes
- **Memory Optimization**: Proper cleanup prevents memory leaks and resource accumulation
- **Abandonment Detection**: Monitors for cart abandonment with configurable timeouts (30 minutes)

## 🎨 Theme System

The application supports both light and dark themes with seamless switching:

### Features
- **Automatic Detection**: Respects user's system color scheme preference
- **Manual Toggle**: Theme switch button in the header navigation
- **Persistent Storage**: Remembers user's theme choice via localStorage
- **Smooth Transitions**: All UI elements transition smoothly between themes
- **Complete Coverage**: All components and pages support dark mode

### Implementation
- **TailwindCSS**: Uses `dark:` variant classes for dark mode styling
- **CSS Variables**: Custom color variables for consistent theming
- **Vue Composable**: `useTheme()` composable for theme management
- **Plugin**: Automatic theme initialization on app start

### Usage for Developers
```typescript
// Use the theme composable in components
const { theme, toggleTheme, setTheme } = useTheme()

// Check current theme
console.log(theme.value) // 'light' or 'dark'

// Toggle theme programmatically
toggleTheme()

// Set specific theme
setTheme('dark')
```

### Adding Dark Mode to New Components
When creating new components, ensure to include dark mode variants:

```vue
<template>
  <!-- Light background with dark mode variant -->
  <div class="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">
    <!-- Button with dark mode support -->
    <button class="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600">
      Click me
    </button>
  </div>
</template>
```

## 🧪 Testing

### Overview
Comprehensive testing setup with both unit tests (Vitest) and end-to-end tests (Playwright) with multi-browser and multi-locale support.

### Unit Testing (Vitest)

Unit tests for composables, components, and utilities using Vitest.

```bash
# Run unit tests
pnpm test:unit

# Run unit tests in watch mode
pnpm test:unit:watch

# Run unit tests with UI
pnpm test:unit:ui

# Run unit tests with coverage
pnpm test:coverage

# View coverage report in browser
pnpm test:coverage:ui
```

#### Unit Test Coverage Status

> **Note**: Coverage thresholds are currently disabled (vitest.config.ts:36-70) to allow critical fixes to be pushed while test coverage is being improved.
>
> **Target thresholds** (to be re-enabled):
> - Global: 70% branches, 75% functions, 80% lines/statements
> - Critical paths (checkout, stripe, shipping, guest checkout): 85-90% coverage
>
> **Current status**:
> - 137 tests passing
> - 20 tests skipped due to singleton pattern issues in Stripe composable
> - TODO: Refactor Stripe composable to support test isolation

### End-to-End Testing (Playwright)

Comprehensive end-to-end testing setup using Playwright with multi-browser and multi-locale support.

#### Visual Test Coverage (November 2025)
- **Total Pages:** 47
- **Visual Coverage:** 40 pages (85%)
- **E2E Coverage:** 24 pages (51%)
- **New Visual Tests Added:** 47 tests across admin, account, and checkout flows

**Recent Additions:**
- ✅ Admin pages visual tests (15 tests)
- ✅ Account pages visual tests (10 tests)
- ✅ Checkout & static pages visual tests (22 tests)
- ✅ Fixed dashboard routing and authentication fixtures

See [TEST_COVERAGE_ANALYSIS.md](./TEST_COVERAGE_ANALYSIS.md) and [TEST_COVERAGE_IMPLEMENTATION.md](./TEST_COVERAGE_IMPLEMENTATION.md) for detailed coverage reports.

### End-to-End Testing (Playwright)

Comprehensive end-to-end testing setup using Playwright with multi-browser and multi-locale support.

### Test Structure
```
tests/
├── e2e/                    # End-to-end tests
│   ├── auth.spec.ts       # Authentication flows
│   ├── products.spec.ts   # Product browsing
│   ├── checkout.spec.ts   # Shopping cart & checkout
│   └── i18n.spec.ts       # Internationalization
├── visual/                 # Visual regression tests
│   └── visual-regression.spec.ts
├── fixtures/              # Test utilities
│   ├── base.ts           # Base test configuration
│   ├── helpers.ts        # Test helper functions
│   └── pages.ts          # Page object models
├── setup/                 # Test setup files
├── global-setup.ts       # Global test setup
└── global-teardown.ts    # Global test cleanup
```

### Available Test Scripts

#### Basic Testing
```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests in headed mode (see browser)
pnpm test:headed

# Debug tests
pnpm test:debug
```

#### Browser-specific Testing
```bash
# Test specific browsers
pnpm test:chromium
pnpm test:firefox
pnpm test:webkit
pnpm test:mobile
```

#### Feature-specific Testing
```bash
# Test specific features
pnpm test:auth        # Authentication flows
pnpm test:products    # Product browsing
pnpm test:checkout    # Shopping cart & checkout
pnpm test:i18n        # Internationalization
```

#### Visual Testing
```bash
# Run visual regression tests
pnpm test:visual

# Update visual snapshots
pnpm test:visual:update
```

#### Test Reports
```bash
# Show test report
pnpm test:report
```

#### Setup Commands
```bash
# Install browsers and dependencies
pnpm test:setup
```

### Test Configuration

#### Multi-locale Testing
Tests run across all supported locales:
- Spanish (es) - Default
- English (en)
- Romanian (ro)
- Russian (ru)

#### Multi-browser Testing
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)
- Mobile browsers (Chrome/Safari)

#### Test Categories
- **@smoke** - Critical path tests
- **@regression** - Full regression suite
- **@visual** - Visual regression tests

### Running Tests Locally

1. **Setup Environment**
   ```bash
   # Copy test environment file
   cp .env.example .env.test

   # Install test dependencies
   pnpm test:setup
   ```

2. **Start Database** (if testing with real DB)
   ```bash
   # Start local PostgreSQL
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15

   # Run migrations
   pnpm db:push
   ```

3. **Run Tests**
   ```bash
   # Run all tests
   pnpm test

   # Run specific test suite
   pnpm test:auth
   ```

### CI/CD Integration

Tests automatically run on:
- **Push to main/develop branches**
- **Pull requests to main**
- **Manual workflow dispatch**

#### GitHub Actions Workflow
- Matrix testing across browsers and locales
- Visual regression testing
- Preview deployment testing
- Parallel test execution
- Test result artifacts

### Writing Tests

#### Basic Test Structure
```typescript
import { test, expect } from '../fixtures/base'
import { HomePage } from '../fixtures/pages'

test('should display homepage correctly', async ({ page }) => {
  const homePage = new HomePage(page)
  await homePage.goto()
  
  await expect(page).toHaveTitle('Moldova Direct')
  await expect(homePage.heroSection).toBeVisible()
})
```

#### Using Test Fixtures
```typescript
test('should complete checkout flow', async ({ 
  authenticatedPage, 
  testUser, 
  testProducts 
}) => {
  // Test implementation using fixtures
})
```

#### Visual Testing
```typescript
test('should match homepage design @visual', async ({ page }) => {
  await page.goto('/')
  
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    mask: [page.locator('[data-testid="dynamic-content"]')]
  })
})
```

### Test Data Management

#### Database Seeding
Tests use isolated test database with:
- Automated setup/teardown
- Seed data for consistent testing
- Cleanup after test runs

#### Authentication States
- Pre-authenticated users per locale
- Persistent session states
- Role-based test users

### Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for network idle** before assertions
3. **Mask dynamic content** in visual tests
4. **Test across all supported locales**
5. **Include mobile viewport testing**
6. **Keep tests independent** and isolated

### Troubleshooting

#### Common Issues
- **Browser installation**: Run `pnpm test:setup`
- **Port conflicts**: Ensure dev server runs on port 3000
- **Database connection**: Check PostgreSQL is running
- **Locale issues**: Verify i18n configuration

#### Debug Mode
```bash
# Run single test in debug mode
pnpm test:debug -- tests/e2e/auth.spec.ts
```

## 🚀 Deployment

### Production Environment
- **Platform**: Vercel (automatic deployments from main branch)
- **Database**: Supabase PostgreSQL (hosted)
- **Storage**: Supabase Storage buckets
- **CDN**: Vercel Edge Network
- **CI/CD**: GitHub Actions for testing, Vercel for deployment

### Deployment Commands
```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

---

**Development Server**: http://localhost:3000
