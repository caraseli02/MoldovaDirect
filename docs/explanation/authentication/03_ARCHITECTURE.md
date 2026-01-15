# Moldova Direct - System Architecture

## Overview

[Add high-level overview here]


## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Browser   │  │   Mobile    │  │   PWA       │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Nuxt 4 Application (SSR)                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │    │
│  │  │  Pages   │  │Components│  │   Server API     │  │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Supabase │  │  Stripe  │  │  Resend  │  │ Storage  │   │
│  │ (DB+Auth)│  │(Payments)│  │ (Email)  │  │ (Images) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Architecture

### Flow
1. User submits credentials
2. Supabase Auth validates
3. JWT tokens issued (access + refresh)
4. Tokens stored in httpOnly cookies
5. Middleware validates on protected routes

### Implementation
- **Plugin-based initialization**: `plugins/auth.client.ts`
- **Cross-tab sync**: Storage events for session updates
- **Auto-refresh**: Tokens refreshed every 10 minutes during activity
- **Cleanup**: Proper listener/interval cleanup on unmount

### Route Protection
```typescript
// Admin pages require both middlewares
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

// API routes verify server-side
const user = await verifyAdminAuth(event)
```

## Cart System Architecture

### State Management
- **Pinia Store**: Central cart state
- **localStorage**: Persistence across sessions
- **Session ID**: Anonymous cart tracking

### Features
- Add/remove products with quantity
- Real-time inventory validation
- Persistent across page reloads
- Multi-language interface

### Error Handling
- Toast notifications for user feedback
- Graceful storage failure fallbacks
- Network error recovery

### Analytics
- Automatic cart interaction tracking
- Offline event storage
- Server sync every 5 minutes
- Abandonment detection (30 min timeout)

## Checkout Flow Architecture

### Steps
1. **Cart Review** - Verify items and quantities
2. **Shipping** - Address and delivery method
3. **Payment** - Stripe payment intent
4. **Confirmation** - Order summary and receipt

### Data Flow
```
Cart → Shipping Form → Payment Intent → Order Creation → Email Notification
         ↓                  ↓                ↓
    Address Validation   Stripe API      Supabase DB
```

### Order Processing
1. Validate cart items and inventory
2. Create Stripe payment intent
3. Collect payment details
4. Confirm payment
5. Create order in database
6. Send confirmation email
7. Update inventory

## Database Schema (Supabase PostgreSQL)

### Core Tables
- `profiles` - User profile data
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Order records
- `order_items` - Line items per order
- `cart_items` - Persistent cart storage
- `email_logs` - Email tracking

### Row Level Security (RLS)
- Users can only read their own orders
- Admins have full access
- Public read for products/categories
- Protected write operations

### Naming Conventions
- Tables: singular (product, order)
- Columns: snake_case
- Primary keys: `id` (integer, auto-increment)
- Foreign keys: `user_id`, `product_id`
- Timestamps: `created_at`, `updated_at`

## Admin Panel Architecture

### Protected Routes
All admin routes require:
1. `auth` middleware - User must be logged in
2. `admin` middleware - User must have admin role

### Components
- Dashboard with metrics
- Product management (CRUD)
- Order management
- User management
- Settings

### Critical Rule: Static Imports Only
```typescript
// ✅ CORRECT - Static import
import AdminDashboard from '~/components/admin/Dashboard/Overview.vue'

// ❌ WRONG - Dynamic import causes 500 errors
const Component = defineAsyncComponent(() => import(`~/${path}.vue`))
```

## Internationalization Architecture

### URL Strategy
- Default (Spanish): `/products`
- Other locales: `/en/products`, `/ro/products`, `/ru/products`

### Lazy Loading
- Translation files loaded on demand
- Reduces initial bundle by ~75%
- Cached after first load

### Content Translation
- UI text: JSON translation files
- Product content: JSON columns in database
- Emails: Localized templates

## Security Architecture

### Implemented Measures
- Content Security Policy (CSP) headers
- CSRF protection on state-changing operations
- Rate limiting on API endpoints
- Server-side price verification
- Input validation with Zod
- XSS prevention (httpOnly cookies)

### Authentication Security
- JWT with short expiration
- Refresh token rotation
- Secure cookie storage
- PBKDF2 password hashing (Supabase)

## Performance Architecture

### Optimization Strategies
- SSR for initial page load
- Code splitting at route level
- Lazy loading for heavy components
- Image optimization with Nuxt Image
- Translation lazy loading

### Caching
- Vercel Edge caching
- API response caching
- Static asset CDN delivery

### Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Core Web Vitals: All green
