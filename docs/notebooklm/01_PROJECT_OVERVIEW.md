# Moldova Direct - Project Overview

## What Is This Project?

Moldova Direct is a modern e-commerce platform specializing in authentic Moldovan food and wine products with delivery to Spain. It's a single-seller marketplace built with a mobile-first approach.

## Business Context

- **Target Market**: Spanish consumers interested in authentic Moldovan products
- **Product Focus**: Wine, traditional foods, artisanal goods from Moldova
- **Languages**: Spanish (default), English, Romanian, Russian
- **Currency**: EUR

## Current Status (January 2026)

**Phase**: Payment & Notifications Integration (Phase 5)

### Completed
- Multi-language infrastructure (4 locales)
- Product catalog with categories and search
- User authentication with Supabase Auth
- Shopping cart with persistence
- Multi-step checkout UI
- Admin dashboard
- Order management system
- Email notifications with Resend
- Dark/light theme support
- Security hardening (CSP, CSRF, rate limiting)

### In Progress
- Stripe payment capture and webhooks
- Enhanced transactional emails
- Admin analytics dashboards

### Planned
- PWA features (offline support, push notifications)
- Product recommendations
- Customer reviews system

## Key Metrics

- **Lighthouse Score**: 90+ performance
- **Test Coverage**: 85% visual, 51% E2E
- **Languages**: 4 (ES, EN, RO, RU)
- **Admin Pages**: 5 working pages

## Project Structure

```
MoldovaDirect/
├── components/          # Vue components by feature
│   ├── admin/          # Admin dashboard components
│   ├── cart/           # Shopping cart
│   ├── checkout/       # Checkout flow
│   ├── product/        # Product display
│   └── ui/             # Reusable UI components
├── pages/              # File-based routing (Nuxt)
│   ├── admin/          # Admin pages (auth required)
│   ├── auth/           # Login, register, etc.
│   ├── checkout/       # Checkout flow
│   └── products/       # Product catalog
├── server/             # Backend API
│   ├── api/            # REST endpoints
│   └── utils/          # Server utilities
├── stores/             # Pinia state management
├── composables/        # Vue composition functions
├── i18n/locales/       # Translations
└── docs/               # Documentation
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with Supabase credentials

# Start development
pnpm dev
# Open http://localhost:3000
```

## Environment Variables Required

```env
SUPABASE_URL=https://[project].supabase.co
SUPABASE_KEY=[anon_key]
SUPABASE_SERVICE_KEY=[service_key]
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
FROM_EMAIL="Brand <noreply@domain.com>"
```

## Team & Development

- Active development with regular commits
- Test-driven development approach
- GitHub Issues for bug tracking
- Vercel for deployment with automatic previews
- GitHub Actions for CI/CD

## Success Criteria

- Mobile-first experience (60%+ mobile traffic expected)
- Page load times under 2 seconds
- 100% uptime via Vercel infrastructure
- Comprehensive test coverage
- Clean, maintainable codebase
