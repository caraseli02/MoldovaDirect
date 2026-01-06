# Moldova Direct - Quick Start Guide

**Last Updated:** January 6, 2026

## Day 1 Checklist

Complete these steps in order to get up and running:

- [ ] **Step 1**: Clone repo and install dependencies (5 min)
- [ ] **Step 2**: Set up environment variables (5 min)
- [ ] **Step 3**: Start dev server and verify it works (2 min)
- [ ] **Step 4**: Read the 3 essential docs (15 min)
- [ ] **Step 5**: Run tests to verify setup (5 min)

**Total time: ~30 minutes**

---

## Step 1: Clone and Install

```bash
git clone <repository-url>
cd MoldovaDirect
pnpm install
```

> **Note**: This project uses `pnpm` as the package manager. Install it with `npm install -g pnpm` if you don't have it.

---

## Step 2: Environment Setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

**Required Variables:**
```env
# Get from https://supabase.com/dashboard/project/_/settings/api
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Get from https://dashboard.stripe.com/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Get from https://resend.com/api-keys
RESEND_API_KEY=re_...
FROM_EMAIL="Your Brand <onboarding@resend.dev>"
```

---

## Step 3: Start Development

```bash
pnpm dev
# Open http://localhost:3000
```

**Verify it works:**
- Homepage loads without errors
- No console errors in browser DevTools
- Language switcher works (ES/EN/RO/RU)

---

## Step 4: Essential Reading (15 min)

Read these 3 documents before writing any code:

| Priority | Document | Why It Matters |
|----------|----------|----------------|
| 1 | [Code Conventions](../development/code-conventions.md) | How to write code that matches the project style |
| 2 | [Project Structure](../development/structure.md) | Where files go and naming conventions |
| 3 | [Project Status](../status/PROJECT_STATUS.md) | Current state, what's done, what's in progress |

**Optional but helpful:**
- [Tech Stack](../development/tech.md) - Technology choices and rationale
- [Patterns to Preserve](../development/PATTERNS_TO_PRESERVE.md) - Existing patterns to follow

---

## Step 5: Run Tests

```bash
# Run all tests
pnpm test

# Or run specific test suites
pnpm test:unit        # Unit tests
pnpm test:chromium    # E2E tests in Chrome
```

---

## Common Tasks

### Development Commands
```bash
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm preview          # Preview production build
```

### Testing Commands
```bash
pnpm test             # All tests
pnpm test:unit        # Unit tests only
pnpm test:visual      # Visual regression tests
pnpm test:auth        # Auth flow tests
pnpm test:checkout    # Checkout flow tests
```

### Deployment Commands
```bash
pnpm deploy           # Production deploy
pnpm deploy:preview   # Preview deploy
```

### Clean Restart (If Things Break)
```bash
pkill -9 node && rm -rf .nuxt node_modules/.vite && pnpm dev
```

---

## Project Structure Overview

```
MoldovaDirect/
├── components/             # Vue components
│   ├── admin/             # Admin dashboard components
│   ├── cart/              # Shopping cart components
│   ├── checkout/          # Checkout flow components
│   ├── product/           # Product display components
│   └── ui/                # Custom UI components (Button, Card, etc.)
├── composables/           # Reusable Vue composition functions
├── pages/                 # Nuxt pages (file-based routing)
│   ├── admin/            # Admin pages (auth required)
│   ├── auth/             # Login, register, etc.
│   ├── checkout/         # Checkout flow pages
│   └── products/         # Product listing and detail
├── server/                # API routes and utilities
│   ├── api/              # REST endpoints
│   └── utils/            # Server utilities
├── stores/                # Pinia state management
├── i18n/locales/          # Translations (es, en, ro, ru)
└── docs/                  # Documentation
```

---

## Key Features

### Implemented
- Multi-language support (ES, EN, RO, RU)
- User authentication with Supabase Auth
- Product catalog with search and filtering
- Shopping cart with persistence
- Admin dashboard with real-time updates
- Order management system
- Email notifications with Resend
- Dark/light theme support

### In Progress
- Stripe payment integration (webhooks pending)
- Enhanced email workflows
- Admin analytics dashboards

---

## Internationalization (i18n)

**Important**: All user-facing text must have translations in ALL 4 locales.

### Adding Translations
1. Edit files in `i18n/locales/`:
   - `es.json` (Spanish - default)
   - `en.json` (English)
   - `ro.json` (Romanian)
   - `ru.json` (Russian)

2. Use in components:
```vue
<template>
  <h1>{{ $t('products.title') }}</h1>
</template>

<script setup>
const { t } = useI18n()
const title = t('products.title')
</script>
```

---

## Troubleshooting

### Port Already in Use
```bash
lsof -ti:3000 | xargs kill -9
pnpm dev
```

### Database Connection Failed
- Check Supabase credentials in `.env`
- Verify project is not paused in Supabase dashboard
- Check RLS policies

### Import/Component Errors
```bash
# Clear cache and restart
rm -rf .nuxt node_modules/.vite .output
pnpm dev
```

### Tests Failing
```bash
# Update visual snapshots
pnpm test:visual:update

# Clear test cache
rm -rf node_modules/.cache
pnpm install
```

---

## Getting Help

### Documentation
- [Main README](../../README.md)
- [Documentation Index](../README.md)
- [Project Status](../status/PROJECT_STATUS.md)

### Key Guides
- [Testing Strategy](../guides/TESTING_STRATEGY.md)
- [Troubleshooting Components](../development/troubleshooting-components.md)
- [i18n Configuration](../features/I18N_CONFIGURATION.md)

---

## Next Steps After Setup

1. **Explore the codebase**: Look at `components/product/Card.vue` for a well-structured component example
2. **Run the admin panel**: Navigate to `/admin` (requires admin user)
3. **Check open issues**: See [Project Status](../status/PROJECT_STATUS.md) for current work items
4. **Read the CHANGELOG**: See [CHANGELOG](../CHANGELOG.md) for recent changes

---

**Status**: Ready for development
**Last Verified**: January 6, 2026
