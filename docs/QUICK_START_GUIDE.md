# Moldova Direct - Quick Start Guide

**Last Updated:** November 1, 2025

## 🚀 Getting Started in 5 Minutes

### 1. Clone and Install
```bash
git clone <repository-url>
cd MoldovaDirect
pnpm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your credentials
```

**Required Variables:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
FROM_EMAIL="Your Brand <onboarding@resend.dev>"
```

### 3. Start Development
```bash
pnpm dev
# Open http://localhost:3000
```

## 🎯 Common Tasks

### Run Tests
```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Visual regression tests
pnpm test:visual

# Specific test suite
pnpm test:auth
pnpm test:products
pnpm test:checkout
```

### Build for Production
```bash
pnpm build
pnpm preview
```

### Deploy
```bash
# Production
pnpm deploy

# Preview
pnpm deploy:preview
```

## 📚 Key Documentation

### Essential Reading
1. [README.md](./README.md) - Complete project overview
2. [PROJECT_STATUS.md](./.kiro/PROJECT_STATUS.md) - Current status and priorities
3. [CODE_REVIEW_2025.md](./CODE_REVIEW_2025.md) - Security and architecture review

### For Development
- [Code Conventions](./.kiro/steering/code-conventions.md)
- [Tech Stack](./.kiro/steering/tech.md)
- [Supabase Best Practices](./.kiro/steering/supabase-best-practices.md)

### For Testing
- [Test Coverage Analysis](./TEST_COVERAGE_ANALYSIS.md)
- [Testing Strategy](./docs/TESTING_STRATEGY.md)
- [Auth Testing Guide](./tests/AUTH_TESTING_GUIDE.md)

## 🚨 Critical Issues (Action Required)

### Security (IMMEDIATE)
1. **Re-enable Admin Middleware** - Currently disabled in `middleware/admin.ts`
2. **Add Rate Limiting** - Auth endpoints vulnerable to brute force
3. **Server-Side Price Verification** - Cart prices need server validation

### Code Quality (HIGH PRIORITY)
1. **Refactor Products Page** - 915 lines, needs splitting
2. **Split Auth Store** - 1,172 lines, needs modularization
3. **Add API Authorization** - Secondary checks needed

See [CODE_REVIEW_2025.md](./CODE_REVIEW_2025.md) for complete details.

## 🏗️ Project Structure

```
MoldovaDirect/
├── .kiro/                    # Project documentation & specs
│   ├── PROJECT_STATUS.md    # Current status
│   ├── ROADMAP.md          # Development timeline
│   ├── specs/              # Feature specifications
│   └── steering/           # Project standards
├── components/             # Vue components
│   ├── admin/             # Admin dashboard components
│   ├── auth/              # Authentication components
│   ├── cart/              # Shopping cart components
│   ├── checkout/          # Checkout flow components
│   └── ui/                # shadcn-vue UI components
├── composables/           # Reusable composition functions
├── pages/                 # Nuxt pages (routes)
├── stores/                # Pinia state management
├── server/                # API routes and utilities
│   ├── api/              # API endpoints
│   └── utils/            # Server utilities
├── tests/                 # Test files
│   ├── e2e/              # End-to-end tests
│   └── visual/           # Visual regression tests
└── docs/                  # Technical documentation
```

## 🔑 Key Features

### Implemented ✅
- Multi-language support (ES, EN, RO, RU)
- User authentication with Supabase Auth
- Product catalog with search and filtering
- Shopping cart with persistence
- Admin dashboard with real-time updates
- Order management system
- Email notifications with Resend
- Dark/light theme support
- Comprehensive test coverage (85% visual)

### In Progress 🚧
- Stripe payment integration (webhooks pending)
- Enhanced email workflows
- Admin analytics dashboards
- Security hardening

### Planned 📋
- PWA features (offline support, push notifications)
- Advanced product recommendations
- Customer reviews system
- Wishlist functionality

## 🧪 Testing

### Test Coverage
- **Visual Tests:** 40/47 pages (85%)
- **E2E Tests:** 24/47 pages (51%)
- **Unit Tests:** 137 passing

### Running Tests
```bash
# Quick test
pnpm test:chromium

# Full suite
pnpm test

# With UI
pnpm test:ui

# Update snapshots
pnpm test:visual:update
```

## 🌍 Internationalization

### Supported Languages
- Spanish (es) - Default
- English (en)
- Romanian (ro)
- Russian (ru)

### Adding Translations
1. Edit `i18n/locales/{lang}.json`
2. Use `$t('key.path')` in components
3. Test with `pnpm test:i18n`

## 🎨 UI Components

### shadcn-vue Components
Located in `components/ui/`
- Button, Input, Select, Dialog, etc.
- Fully typed with TypeScript
- Dark mode support built-in

### Usage
```vue
<template>
  <UiButton variant="default" size="lg">
    Click me
  </UiButton>
</template>
```

## 🔐 Authentication

### User Roles
- **User** - Regular customer
- **Admin** - Full dashboard access

### Auth Flow
1. Register → Email verification
2. Login → Session created
3. Optional: MFA setup
4. Access protected routes

### Testing Auth
```bash
pnpm test:auth
```

## 📦 Database

### Supabase Setup
1. Create project at supabase.com
2. Run SQL from `supabase/sql/supabase-schema.sql`
3. Configure RLS policies
4. Add credentials to `.env`

### Key Tables
- `products` - Product catalog
- `orders` - Order management
- `profiles` - User profiles
- `cart_items` - Shopping cart
- `email_logs` - Email tracking

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Set all `.env` variables in Vercel dashboard.

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -ti:3000 | xargs kill -9
pnpm dev
```

**Database connection failed:**
- Check Supabase credentials in `.env`
- Verify project is not paused
- Check RLS policies

**Tests failing:**
```bash
# Update snapshots
pnpm test:visual:update

# Clear cache
rm -rf .nuxt node_modules/.cache
pnpm install
```

**Build errors:**
```bash
# Clean build
rm -rf .nuxt .output
pnpm build
```

## 📞 Getting Help

### Documentation
- [Main README](./README.md)
- [Documentation Index](./docs/README.md)
- [Project Status](./.kiro/PROJECT_STATUS.md)

### Code Review
- [Security Analysis](./CODE_REVIEW_2025.md)
- [Test Coverage](./TEST_COVERAGE_ANALYSIS.md)

### Specifications
- [User Authentication](./.kiro/specs/user-authentication/)
- [Shopping Cart](./.kiro/specs/shopping-cart/)
- [Checkout Flow](./.kiro/specs/checkout/)
- [Admin Dashboard](./.kiro/specs/admin-dashboard/)

## 🎯 Next Steps

### For New Developers
1. Read [README.md](./README.md)
2. Review [CODE_REVIEW_2025.md](./CODE_REVIEW_2025.md)
3. Check [PROJECT_STATUS.md](./.kiro/PROJECT_STATUS.md)
4. Run tests: `pnpm test`
5. Start development: `pnpm dev`

### For Contributors
1. Check [Code Conventions](./.kiro/steering/code-conventions.md)
2. Review open issues in [PROJECT_STATUS.md](./.kiro/PROJECT_STATUS.md)
3. Create feature branch
4. Write tests
5. Submit PR

---

**Quick Links:**
- [Full Documentation](./docs/README.md)
- [Project Status](./.kiro/PROJECT_STATUS.md)
- [Code Review](./CODE_REVIEW_2025.md)
- [Test Coverage](./TEST_COVERAGE_ANALYSIS.md)

**Status:** ⚠️ Action Required - See critical security items above
**Last Updated:** November 1, 2025
