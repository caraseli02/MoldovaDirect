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
- **Cloudflare D1** - SQLite database at the edge
- **Drizzle ORM** - Type-safe database toolkit
- **Cloudflare KV** - Key-value storage for sessions/cache
- **JWT Authentication** with refresh tokens

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
- **Cloudflare Pages** via NuxtHub - Frontend hosting
- **Cloudflare Workers** - Edge runtime
- **Wrangler** - Cloudflare development tool

## Common Commands

### Development
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
```

### Database
```bash
npm run db:generate     # Generate database migrations
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Drizzle Studio
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

### Cloudflare Commands
```bash
npm run cf:db:create    # Create D1 database
npm run cf:kv:create    # Create KV namespace
npm run cf:r2:create    # Create R2 bucket
```

## Environment Setup
- Copy `.env.example` to `.env` for local development
- Cloudflare credentials required for database operations
- JWT secrets needed for authentication