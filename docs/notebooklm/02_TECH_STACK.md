# Moldova Direct - Technology Stack

## Core Framework

### Nuxt 4.2+ (Full-Stack Vue.js Framework)
- Server-side rendering (SSR) with Nitro engine
- File-based routing
- Auto-imports for components and composables
- TypeScript support with strict mode
- Vercel deployment preset

### Vue 3.5 (Component Framework)
- Composition API with `<script setup>` syntax
- Reactive state with `ref()` and `reactive()`
- Computed properties and watchers
- Lifecycle hooks (onMounted, onUnmounted, etc.)

## Frontend Technologies

### TypeScript
- Strict type checking enabled
- Interface definitions for all data structures
- Type imports using `import type`
- Generic types for reusable components

### Tailwind CSS v4
- Utility-first CSS framework
- CSS variables for theming
- Dark mode support via `dark:` variant
- Custom color palette (primary blue, secondary gray)
- Inter font for typography

### Localized Component System
Located in `components/ui/`:
- Button, Card, Dialog, Input, Select
- Alert, Badge, Tooltip, Skeleton
- Table, Tabs, Pagination, Avatar
- Checkbox, Switch, RadioGroup, Textarea

Originally scaffolded via shadcn-vue but migrated to a **localized system** in January 2026 (PR #346). This allows the project to own the source code and apply critical fixes (like v-model reactivity improvements) while still leveraging **Reka UI** for accessible primitives.


### State Management (Pinia)
- Vue's official state management
- TypeScript-first design
- Stores for cart, auth, products
- Persistent storage integration

## Backend & Infrastructure

### Supabase (Backend-as-a-Service)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with email verification
- **Storage**: Supabase Storage for product images
- **Real-time**: Live data updates (when needed)

### API Architecture
- Nuxt Server API routes (`server/api/`)
- RESTful conventions
- Zod for request validation
- Consistent error handling

### Email Service (Resend)
- Transactional emails (order confirmation, password reset)
- Localized email templates
- Retry logic and monitoring

### Payment Processing (Stripe)
- Payment intents for checkout
- Webhook handling for events
- Test mode for development

## Internationalization

### @nuxtjs/i18n
- 4 languages: Spanish (es), English (en), Romanian (ro), Russian (ru)
- Lazy loading (translations loaded on demand)
- URL strategy: prefix_except_default
- Browser detection for initial language
- Cookie persistence for language choice

### Translation Files
```
i18n/locales/
├── es.json  # Spanish (default)
├── en.json  # English
├── ro.json  # Romanian
└── ru.json  # Russian
```

## Testing Stack

### Playwright (E2E Testing)
- Multi-browser: Chrome, Firefox, Safari, Mobile
- Multi-locale testing (all 4 languages)
- Visual regression testing
- Page Object Model pattern

### Vitest (Unit Testing)
- Fast test execution
- Vue Test Utils integration
- Coverage reporting
- Watch mode for development

## Deployment & CI/CD

### Vercel
- Automatic deployments from GitHub
- Preview deployments for PRs
- Edge Network CDN
- Environment variable management

### GitHub Actions
- Automated testing on push/PR
- Matrix testing (browsers, locales)
- Test result artifacts

## Development Tools

### Package Manager
- pnpm (fast, disk-efficient)
- Lock file for reproducible builds

### Code Quality
- ESLint for linting
- Prettier for formatting
- TypeScript strict mode
- Git hooks for pre-commit checks

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview build

# Testing
pnpm test             # All tests
pnpm test:unit        # Unit tests
pnpm test:e2e         # E2E tests
pnpm test:visual      # Visual regression

# Deployment
pnpm deploy           # Production
pnpm deploy:preview   # Preview

# Utilities
pnpm type-check       # TypeScript check
npx supabase status   # Database status
```

## Environment Setup

### Prerequisites
- Node.js 22+ (check `.nvmrc`)
- pnpm package manager
- Supabase account
- Stripe account (for payments)
- Resend account (for emails)

### Local Development
1. Clone repository
2. `pnpm install`
3. Copy `.env.example` to `.env`
4. Add credentials
5. `pnpm dev`
