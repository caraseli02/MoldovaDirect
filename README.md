# Moldova Direct - E-Commerce Platform

🛒 Modern e-commerce platform for authentic Moldovan food and wine products with delivery to Spain.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev

# Open browser
http://localhost:3000
```

## 🔧 Development Setup

### Prerequisites
- Node.js 20.11+
- Supabase account and project

### Environment Variables
Create a `.env` file with:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
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
3. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
4. Enable authentication in your Supabase dashboard

For detailed setup instructions, see [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md).

### Internationalization Setup
The application uses lazy-loaded translations for optimal performance. Translation files are automatically loaded when users switch languages, reducing initial bundle size by ~75%.

For detailed i18n configuration, see [I18N_CONFIGURATION.md](./docs/I18N_CONFIGURATION.md).

### Database Management
With Supabase, database management is handled through the Supabase dashboard:

- **Schema Changes**: Apply SQL directly in Supabase SQL Editor
- **Database GUI**: Use built-in Supabase Table Editor
- **Migrations**: Version controlled through Supabase CLI or SQL scripts

### Deployment Commands
```bash
# Build for production
npm run build

# Deploy to Vercel (production)
npm run deploy

# Deploy to Vercel (preview)
npm run deploy:preview
```

## 📚 Documentation

All project documentation follows Kiro's spec-driven development approach in the `.kiro/` folder:

- **[Documentation Hub](.kiro/README.md)** - Complete documentation index
- **[Project Status](.kiro/PROJECT_STATUS.md)** - Current state and health
- **[Roadmap](.kiro/ROADMAP.md)** - Development timeline
- **[Progress](.kiro/PROGRESS.md)** - Completed milestones
- **[Specifications](.kiro/specs/)** - Feature requirements and designs

## 🎯 Current Status

✅ **Completed Features**
- Foundation with multi-language support (ES/EN/RO/RU)
- Product catalog with categories and search
- User authentication with Supabase Auth
- Shopping cart with persistence and analytics
- Multi-step checkout UI with shipping, payment, and review steps
- Order API endpoints with customer order history
- Admin dashboard views for products and users
- Dark/light theme system and shadcn-vue UI migration
- Stripe payment integration (primary payment processor)
- Email notification system with Resend

🚧 **In Progress**
- Production payment credentials and testing
- Enhanced transactional email workflows (shipping updates, order tracking)
- Admin analytics dashboards and advanced reporting
- Toast system migration to vue-sonner

📝 **Recent Changes (October 2025)**
- Removed PayPal integration (unused feature)
- Cleaned up unused composables and dependencies
- Organized test scripts into `scripts/` directory
- Streamlined payment processing to focus on Stripe

See [.kiro/ROADMAP.md](.kiro/ROADMAP.md) for detailed timeline.

## 🛠 Tech Stack

### Frontend
- **Framework**: Nuxt 3.17+ with Vue 3.5 Composition API
- **Language**: TypeScript with strict type checking
- **UI Components**: shadcn-vue component library
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
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests
npm run test:debug
```

#### Browser-specific Testing
```bash
# Test specific browsers
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:mobile
```

#### Feature-specific Testing
```bash
# Test specific features
npm run test:auth        # Authentication flows
npm run test:products    # Product browsing
npm run test:checkout    # Shopping cart & checkout
npm run test:i18n        # Internationalization
```

#### Visual Testing
```bash
# Run visual regression tests
npm run test:visual

# Update visual snapshots
npm run test:visual:update
```

#### Test Reports
```bash
# Show test report
npm run test:report
```

#### Setup Commands
```bash
# Install browsers and dependencies
npm run test:setup
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
   npm run test:setup
   ```

2. **Start Database** (if testing with real DB)
   ```bash
   # Start local PostgreSQL
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
   
   # Run migrations
   npm run db:push
   ```

3. **Run Tests**
   ```bash
   # Run all tests
   npm test
   
   # Run specific test suite
   npm run test:auth
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
- **Browser installation**: Run `npm run test:setup`
- **Port conflicts**: Ensure dev server runs on port 3000
- **Database connection**: Check PostgreSQL is running
- **Locale issues**: Verify i18n configuration

#### Debug Mode
```bash
# Run single test in debug mode
npm run test:debug -- tests/e2e/auth.spec.ts
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
