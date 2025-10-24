# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Development
npm run dev                    # Start development server on port 3000
npm run build                  # Build for production
npm run preview                # Preview production build
npm run deploy                 # Deploy to Vercel production
npm run deploy:preview         # Deploy to Vercel preview

# Testing
npm test                       # Run all Playwright tests
npm run test:ui                # Run tests with Playwright UI
npm run test:headed            # Run tests in headed mode (visible browser)
npm run test:debug             # Run tests in debug mode
npm run test:unit              # Run unit tests with Vitest
npm run test:unit:watch        # Run unit tests in watch mode

# Test specific features
npm run test:auth              # Authentication flows
npm run test:products          # Product browsing
npm run test:checkout          # Shopping cart & checkout
npm run test:i18n              # Internationalization
npm run test:visual            # Visual regression tests
npm run test:visual:update     # Update visual snapshots

# Browser-specific testing
npm run test:chromium          # Chrome/Edge tests
npm run test:firefox           # Firefox tests
npm run test:webkit            # Safari tests
npm run test:mobile            # Mobile browser tests

# Setup
npm run test:setup             # Install browsers and test dependencies
npm run test:install           # Install Playwright browsers
npm run test:install:deps      # Install system dependencies

# Testing utilities
npm run test:report            # Show test report
npm run test:smoke             # Run smoke tests (@smoke)
npm run test:regression        # Run regression tests (@regression)
```

## Project Architecture

### Tech Stack
- **Framework**: Nuxt 3.17+ with Vue 3.5 Composition API and TypeScript
- **UI**: shadcn-vue components with Tailwind CSS v4
- **State Management**: Pinia stores
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe (PayPal integration removed October 2025)
- **Email Service**: Resend
- **Internationalization**: @nuxtjs/i18n with lazy loading (ES/EN/RO/RU)
- **Testing**: Playwright for E2E, Vitest for unit tests
- **Deployment**: Vercel

### Key Architecture Patterns

#### Plugin-Based Authentication
Authentication is initialized through a client-side plugin pattern:
```typescript
// Initialize auth when needed
const { $initAuth } = useNuxtApp()
const cleanup = await $initAuth() // Returns cleanup function
```

#### Intelligent Cart System
Cart composable includes Pinia availability detection:
```typescript
const { items, addItem, removeItem } = useCart()
// Automatically handles SSR timing issues and graceful fallbacks
```

#### Automatic Cart Analytics
Cart interactions are tracked automatically via client-side plugin:
```typescript
// Analytics are auto-initialized, no manual setup needed
const { trackAddToCart, trackCartView } = useCartAnalytics()
```

#### Lazy-Loaded i18n
Translation files are loaded only when needed to optimize bundle size:
- Default: Spanish (es)
- Supported: English (en), Romanian (ro), Russian (ru)
- Strategy: `prefix_except_default` (e.g., `/en/products`)

### Store Architecture
Pinia stores follow consistent naming patterns:
- `stores/auth.ts` - Authentication state and user management
- `stores/cart.ts` - Shopping cart state and operations
- `stores/products.ts` - Product catalog and search
- `stores/admin*.ts` - Admin dashboard functionality
- `stores/toast.ts` - Global toast notifications

### Composables Pattern
Composables provide reusable logic with consistent error handling:
- `useAuth()` - Authentication operations with session management
- `useCart()` - Shopping cart with Pinia availability detection
- `useCartAnalytics()` - Cart interaction tracking and analytics
- `useProducts()` - Product catalog and filtering
- `useStripe()` - Stripe payment integration
- `useCheckout()` - Checkout flow management
- `useOrders()` - Order management and history
- `useOrderTracking()` - Real-time order tracking
- `useTheme()` - Theme switching (light/dark mode)
- `useDevice()` - Device detection (mobile/tablet/desktop)
- `useHapticFeedback()` - Mobile haptic feedback
- `useSwipeGestures()` - Touch gesture handling
- `usePullToRefresh()` - Pull-to-refresh functionality

**Note:** PayPal integration (usePayPal) was removed in October 2025 as it was unused.

### Admin Dashboard Structure
Admin pages follow the pattern `/admin/[feature]/[action]`:
- `/admin/products` - Product management with CRUD operations
- `/admin/users` - User management with search and filtering
- `/admin/analytics` - Dashboard analytics and reporting
- `/admin/inventory` - Inventory management

### Component Architecture
- `components/ui/` - shadcn-vue components
- `components/admin/` - Admin-specific components
- `components/layout/` - Layout and navigation components
- All components support dark mode with Tailwind CSS variants

### Testing Architecture
- **E2E Tests**: Playwright with multi-browser and multi-locale support
- **Unit Tests**: Vitest with jsdom environment
- **Visual Tests**: Playwright screenshot comparisons
- **Test Fixtures**: Located in `tests/fixtures/` for reusable test utilities
- **Test Data**: Managed through Supabase with isolated test environments

### Database Schema
Supabase schema files in `supabase/sql/`:
- `supabase-schema.sql` - Main database schema
- `supabase-cart-analytics-simple.sql` - Cart analytics tracking
- `supabase-analytics-schema.sql` - Analytics and reporting schema

### Internationalization
- Translation files: `i18n/locales/[locale].json`
- Lazy loading reduces initial bundle size by ~75%
- Automatic browser detection with cookie persistence
- URL prefix strategy for SEO optimization

### PWA Features
- Service worker for offline capability
- App manifest for mobile installation
- Automatic updates and background sync
- Push notifications support

## Development Notes

- **Environment Variables**: Required in `.env` for Supabase configuration
- **Database**: Managed through Supabase dashboard - no local migrations
- **Authentication**: Uses Supabase Auth with email verification
- **Theme System**: Automatic light/dark mode detection with manual toggle
- **Mobile-First**: All components are responsive and mobile-optimized
- **Performance**: Lazy loading, code splitting, and optimized bundles

## Testing Guidelines

- Use `data-testid` attributes for reliable element selection
- Test across all supported locales (es, en, ro, ru)
- Include mobile viewport testing
- Visual tests should mask dynamic content
- Use proper authentication setup for protected routes
- Implement proper cleanup in tests to prevent memory leaks

## Common Issues

- **Authentication**: Use test users created via Supabase console for admin testing
- **Development Server**: Runs on port 3000 by default
- **Database**: Supabase connection required for most functionality
- **Testing**: Run `npm run test:setup` before running tests