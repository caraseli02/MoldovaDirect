# Moldova Direct - E-Commerce Platform

🛒 Modern e-commerce platform for authentic Moldovan food and wine products with delivery to Spain.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:3000
```

## 📚 Documentation

All project documentation is organized in the `/docs` folder:

- **[PROGRESS.md](docs/PROGRESS.md)** - Development progress and completed features
- **[README.md](docs/README.md)** - Detailed project documentation and technical specs
- **[moldova-ecommerce-docs.md](docs/moldova-ecommerce-docs.md)** - Original project specifications and requirements

## 🎯 Current Status

✅ **Phase 1 Complete** - Foundation & Static Pages
- Multi-language support (ES/EN/RO/RU)
- Responsive layouts and navigation
- Static pages and SEO optimization

✅ **Phase 2 Complete** - Product Showcase
- Product catalog with search/filtering
- Category navigation
- Admin product management
- Sample Moldovan products

✅ **Phase 3 Complete** - User Authentication
- JWT-based authentication
- User registration/login
- Protected routes & account dashboard
- Secure password handling

🔄 **Next Phase** - Phase 4: Shopping Cart & Checkout

## 🛠 Tech Stack

- **Nuxt 3** + TypeScript
- **TailwindCSS** for styling
- **Vue 3** Composition API
- **Drizzle ORM** + Cloudflare D1
- **JWT** Authentication
- **i18n** for internationalization
- **Pinia** for state management

## 🔐 Authentication Features

- User registration with email/password
- Secure login with JWT tokens
- Protected routes and API endpoints
- Account dashboard
- Session management
- Multi-language support

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