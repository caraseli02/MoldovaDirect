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

# Application
APP_URL=http://localhost:3000
NODE_ENV=development

# Email Service (optional for development)
RESEND_API_KEY=re_your_resend_api_key
```

### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env`
3. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
4. Enable authentication in your Supabase dashboard

For detailed setup instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

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

✅ **Completed Phases**
- Phase 1: Foundation & Static Pages
- Phase 2: Product Showcase
- Phase 3: User Authentication
- Phase 4: Shopping Cart & Error Handling

🚀 **Next Phase** - Phase 5: Checkout & Payment Integration

See [.kiro/ROADMAP.md](.kiro/ROADMAP.md) for detailed timeline.

## 🛠 Tech Stack

- **Nuxt 3** + TypeScript
- **TailwindCSS** for styling with dark mode support
- **Vue 3** Composition API
- **Supabase** for database and authentication
- **i18n** for internationalization
- **Pinia** for state management
- **Vercel** for deployment

## 🔐 Authentication Features

- User registration with email verification
- Secure login with Supabase Auth
- Magic link authentication
- Password reset functionality
- Protected routes with RLS policies
- Account dashboard
- Multi-language support
- Dark/light theme toggle with system preference detection

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

- **Platform**: Cloudflare Pages
- **Database**: Cloudflare D1
- **Storage**: Cloudflare KV
- **CI/CD**: GitHub Actions with NuxtHub

---

**Development Server**: http://localhost:3000