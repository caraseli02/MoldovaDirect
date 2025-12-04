---
include: prompt
weight: 30
---

# Technology Stack

## Core Framework
- **Nuxt 3** with TypeScript - Full-stack Vue.js framework
- **Vue 3** Composition API - Component framework
- **Nitro** - Server engine with Cloudflare Pages preset

## Styling & UI
- **TailwindCSS** - Utility-first CSS framework
- **Reka UI** - Vue component library for complex UI components
- **Custom color palette** with primary (blue) and secondary (gray) themes
- **Inter font** for typography

## Database & Backend
- **Supabase** - Managed PostgreSQL with built-in authentication
- **Supabase Auth** - Complete authentication system with email verification
- **Row Level Security (RLS)** - Fine-grained access control
- **Real-time subscriptions** - Live data updates (when needed)

## State Management & Data
- **Pinia** - Vue state management
- **Nuxt Server API** - Built-in API routes
- **Zod** - Runtime type validation

## Internationalization
- **@nuxtjs/i18n** - Multi-language support (ES/EN/RO/RU)
- **Spanish as default locale** with prefix_except_default strategy

## Testing
- **Playwright** - End-to-end testing across multiple browsers and locales
- **Vitest** - Unit testing framework
- **Multi-locale testing** - All tests run across 4 languages
- **Visual regression testing** with screenshot comparison

## Deployment & Infrastructure
- **Vercel** - Frontend hosting with automatic deployments
- **Supabase Cloud** - Managed database and authentication
- **GitHub Actions** - CI/CD pipeline for testing

## Common Commands

### Development
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
```

### Database
```bash
# Database management is handled through Supabase dashboard
# SQL Editor for schema changes
# Table Editor for data management
# Authentication → Users for user management
```

### Testing
```bash
npm test                # Run all tests
npm run test:ui         # Run tests with UI
npm run test:headed     # Run tests in headed mode
npm run test:auth       # Test authentication flows
npm run test:visual     # Run visual regression tests
npm run test:setup      # Install test dependencies
```

### Deployment
```bash
npm run deploy          # Deploy to production
npm run deploy:preview  # Deploy preview environment
```

## Environment Setup
- Copy `.env.example` to `.env` for local development
- Supabase project URL and anon key required
- Email service (Resend) API key for transactional emails
- Payment provider keys (optional) for checkout