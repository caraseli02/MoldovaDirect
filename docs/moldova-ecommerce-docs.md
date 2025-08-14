# Moldova Direct - E-Commerce Platform Documentation

## Project Overview
E-commerce platform enabling international customers (primarily from Spain) to purchase Moldovan food and wine products with home delivery.

## Business Requirements

### Core Business Model
- **Product Type**: Food and wine from Moldova
- **Seller Model**: Single seller (not marketplace)
- **Target Market**: Spain (primary)
- **Languages**: Spanish, English, Romanian, Russian
- **Currency**: EUR
- **Payment Methods**: Stripe, PayPal, Cash on Delivery
- **Users**: Registration required (no guest checkout)
- **Delivery**: Handled by external company (integration pending)

### Technical Requirements
- **Mobile-first** design approach
- **Real-time inventory tracking**
- **Order tracking** within platform
- **Multi-language support** (4 languages)
- **Admin panel** for management

## Technology Stack

### Frontend
- **Framework**: Nuxt 3 with TypeScript
- **CSS**: TailwindCSS
- **UI Components**: Reka UI
- **State Management**: Pinia
- **Image Optimization**: Nuxt Image
- **Internationalization**: @nuxtjs/i18n

### Backend
- **API**: Nuxt 3 server routes (simple operations)
- **Microservice**: FastAPI (complex operations - payments, inventory)
- **Database**: PostgreSQL
- **ORM**: Prisma or Drizzle
- **Authentication**: JWT with refresh tokens

### Infrastructure (NuxtHub + Cloudflare)
- **Frontend Hosting**: Cloudflare Pages via NuxtHub
- **Edge Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite at the edge)
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Cache/Sessions**: Cloudflare KV
- **CDN**: Cloudflare Global Network (300+ locations)
- **Image Optimization**: Cloudflare Images
- **Email Service**: SendGrid or Resend
- **Monitoring**: Cloudflare Analytics + Sentry

## Database Schema

```sql
-- Users and Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    preferred_language VARCHAR(2) DEFAULT 'es',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Addresses
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'billing' or 'shipping'
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    province VARCHAR(100),
    country VARCHAR(2) DEFAULT 'ES',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name_translations JSONB NOT NULL, -- {en: "Wine", es: "Vino", ro: "Vin", ru: "Вино"}
    description_translations JSONB,
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name_translations JSONB NOT NULL,
    description_translations JSONB,
    price_eur DECIMAL(10, 2) NOT NULL,
    compare_at_price_eur DECIMAL(10, 2),
    weight_kg DECIMAL(6, 3),
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    images JSONB, -- Array of image URLs
    attributes JSONB, -- {alcohol_percentage: 13.5, volume_ml: 750, year: 2020}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shopping Cart (for persistent carts)
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For anonymous users (future feature)
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL, -- pending, processing, shipped, delivered, cancelled
    payment_method VARCHAR(50) NOT NULL, -- stripe, paypal, cod
    payment_status VARCHAR(50) NOT NULL, -- pending, paid, failed, refunded
    payment_intent_id VARCHAR(255), -- Stripe/PayPal reference
    subtotal_eur DECIMAL(10, 2) NOT NULL,
    shipping_cost_eur DECIMAL(10, 2) NOT NULL,
    tax_eur DECIMAL(10, 2) DEFAULT 0,
    total_eur DECIMAL(10, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    customer_notes TEXT,
    admin_notes TEXT,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_snapshot JSONB NOT NULL, -- Store product details at time of purchase
    quantity INTEGER NOT NULL,
    price_eur DECIMAL(10, 2) NOT NULL,
    total_eur DECIMAL(10, 2) NOT NULL
);

-- Inventory Tracking
CREATE TABLE inventory_logs (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL, -- Positive for additions, negative for removals
    quantity_after INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL, -- sale, return, manual_adjustment, stock_receipt
    reference_id INTEGER, -- order_id or adjustment_id
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Queue (for transactional emails)
CREATE TABLE email_queue (
    id SERIAL PRIMARY KEY,
    to_email VARCHAR(255) NOT NULL,
    template VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
```

## Project Structure

```
moldova-direct/
├── nuxt.config.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── .env.example
├── README.md
├── PROGRESS.md
│
├── apps/
│   ├── web/                         # Nuxt 3 Frontend
│   │   ├── assets/
│   │   │   └── css/
│   │   │       └── main.css        # Tailwind imports
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.vue
│   │   │   │   ├── AppFooter.vue
│   │   │   │   ├── MobileNav.vue
│   │   │   │   └── LanguageSwitcher.vue
│   │   │   │
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.vue
│   │   │   │   ├── ProductGrid.vue
│   │   │   │   ├── ProductDetails.vue
│   │   │   │   ├── ProductGallery.vue
│   │   │   │   ├── ProductFilters.vue
│   │   │   │   └── ProductSearch.vue
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   ├── CartDrawer.vue
│   │   │   │   ├── CartItem.vue
│   │   │   │   ├── CartSummary.vue
│   │   │   │   └── CartEmpty.vue
│   │   │   │
│   │   │   ├── checkout/
│   │   │   │   ├── CheckoutSteps.vue
│   │   │   │   ├── CheckoutAddress.vue
│   │   │   │   ├── CheckoutPayment.vue
│   │   │   │   ├── CheckoutReview.vue
│   │   │   │   └── CheckoutSuccess.vue
│   │   │   │
│   │   │   ├── account/
│   │   │   │   ├── OrderList.vue
│   │   │   │   ├── OrderDetails.vue
│   │   │   │   ├── AddressBook.vue
│   │   │   │   └── ProfileForm.vue
│   │   │   │
│   │   │   └── ui/                  # Reka UI customizations
│   │   │       ├── Button.vue
│   │   │       ├── Input.vue
│   │   │       ├── Card.vue
│   │   │       └── Modal.vue
│   │   │
│   │   ├── composables/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCart.ts
│   │   │   ├── useProducts.ts
│   │   │   ├── useOrders.ts
│   │   │   ├── usePayment.ts
│   │   │   └── useToast.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── auth.ts
│   │   │   ├── cart.ts
│   │   │   ├── products.ts
│   │   │   └── checkout.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── index.vue                    # Home page
│   │   │   ├── products/
│   │   │   │   ├── index.vue               # Product listing
│   │   │   │   └── [id].vue                # Product detail
│   │   │   ├── category/
│   │   │   │   └── [slug].vue              # Category page
│   │   │   ├── cart.vue                    # Cart page
│   │   │   ├── checkout/
│   │   │   │   ├── index.vue               # Checkout flow
│   │   │   │   └── success.vue             # Order confirmation
│   │   │   ├── account/
│   │   │   │   ├── index.vue               # Account dashboard
│   │   │   │   ├── orders/
│   │   │   │   │   ├── index.vue           # Order history
│   │   │   │   │   └── [id].vue            # Order details
│   │   │   │   ├── addresses.vue           # Address book
│   │   │   │   └── settings.vue            # Profile settings
│   │   │   ├── auth/
│   │   │   │   ├── login.vue
│   │   │   │   ├── register.vue
│   │   │   │   ├── forgot-password.vue
│   │   │   │   └── reset-password.vue
│   │   │   └── admin/                      # Admin pages
│   │   │       ├── index.vue
│   │   │       ├── products/
│   │   │       ├── orders/
│   │   │       └── inventory/
│   │   │
│   │   ├── server/
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login.post.ts
│   │   │   │   │   ├── register.post.ts
│   │   │   │   │   ├── logout.post.ts
│   │   │   │   │   └── refresh.post.ts
│   │   │   │   ├── products/
│   │   │   │   │   ├── index.get.ts
│   │   │   │   │   ├── [id].get.ts
│   │   │   │   │   └── search.get.ts
│   │   │   │   ├── cart/
│   │   │   │   │   ├── index.get.ts
│   │   │   │   │   ├── add.post.ts
│   │   │   │   │   ├── update.patch.ts
│   │   │   │   │   └── remove.delete.ts
│   │   │   │   ├── orders/
│   │   │   │   │   ├── index.get.ts
│   │   │   │   │   ├── create.post.ts
│   │   │   │   │   └── [id].get.ts
│   │   │   │   └── payment/
│   │   │   │       ├── stripe-intent.post.ts
│   │   │   │       └── paypal-order.post.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   └── rate-limit.ts
│   │   │   └── utils/
│   │   │       ├── db.ts
│   │   │       ├── jwt.ts
│   │   │       └── email.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.global.ts
│   │   │   └── i18n.global.ts
│   │   │
│   │   ├── plugins/
│   │   │   ├── api.ts
│   │   │   └── error-handler.ts
│   │   │
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   ├── es.json
│   │   │   ├── ro.json
│   │   │   └── ru.json
│   │   │
│   │   └── types/
│   │       ├── product.ts
│   │       ├── user.ts
│   │       ├── order.ts
│   │       └── api.ts
│   │
│   └── api/                         # FastAPI Backend (optional)
│       ├── main.py
│       ├── requirements.txt
│       ├── .env.example
│       ├── app/
│       │   ├── __init__.py
│       │   ├── config.py
│       │   ├── database.py
│       │   ├── models/
│       │   │   ├── __init__.py
│       │   │   ├── user.py
│       │   │   ├── product.py
│       │   │   └── order.py
│       │   ├── schemas/
│       │   │   ├── __init__.py
│       │   │   ├── user.py
│       │   │   ├── product.py
│       │   │   └── order.py
│       │   ├── services/
│       │   │   ├── __init__.py
│       │   │   ├── payment.py
│       │   │   ├── inventory.py
│       │   │   ├── email.py
│       │   │   └── export.py
│       │   ├── routers/
│       │   │   ├── __init__.py
│       │   │   ├── admin.py
│       │   │   └── reports.py
│       │   └── utils/
│       │       ├── __init__.py
│       │       ├── security.py
│       │       └── validators.py
│       └── tests/
│           ├── __init__.py
│           └── test_api.py
```

## Feature-Based Development Roadmap

### Feature 1: Foundation & Static Pages ✅
**Deliverable**: Basic working website with multi-language support

#### Implementation Steps:
1. Initialize Nuxt 3 project with TypeScript
2. Configure TailwindCSS and Reka UI
3. Set up i18n with 4 languages
4. Create base layouts (header, footer, mobile nav)
5. Implement language switcher
6. Create static pages (home, about, contact, terms, privacy)
7. Configure SEO meta tags
8. Deploy to Vercel

#### Key Files to Create:
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/image',
    'reka-ui/nuxt'
  ],
  i18n: {
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ro', name: 'Română', file: 'ro.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' }
    ],
    defaultLocale: 'es',
    lazy: true,
    langDir: 'locales/'
  }
})
```

---

### Feature 2: Product Showcase ✅
**Deliverable**: Product catalog without purchase capability

#### Implementation Steps:
1. Set up PostgreSQL database
2. Create products and categories tables
3. Implement product listing page with filters
4. Create product detail pages
5. Add category navigation
6. Implement search functionality
7. Optimize images with Nuxt Image
8. Add product admin interface (basic CRUD)

#### Key Components:
```vue
<!-- components/product/ProductCard.vue -->
<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <NuxtImg 
      :src="product.images[0]" 
      :alt="product.name"
      class="w-full h-48 object-cover"
    />
    <div class="p-4">
      <h3 class="text-lg font-semibold">{{ product.name }}</h3>
      <p class="text-gray-600 mt-1">{{ formatPrice(product.price_eur) }}</p>
    </div>
  </div>
</template>
```

---

### Feature 3: User Authentication ✅
**Deliverable**: Complete user account system

#### Implementation Steps:
1. Create user registration flow
2. Implement JWT authentication with refresh tokens
3. Build login/logout functionality
4. Add password reset via email
5. Create user profile management
6. Implement address book
7. Add auth middleware for protected routes
8. Set up email verification

#### Authentication Flow:
```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const login = async (credentials: LoginCredentials) => {
    const { data } = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    navigateTo('/account')
  }
  
  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    navigateTo('/')
  }
  
  return { login, logout }
}
```

---

### Feature 4: Shopping Cart ✅
**Deliverable**: Persistent shopping cart functionality

#### Implementation Steps:
1. Create cart store with Pinia
2. Implement add to cart functionality
3. Build cart drawer/page
4. Add quantity management
5. Implement cart persistence (localStorage + DB)
6. Add stock validation
7. Create cart animations
8. Build saved cart feature for users

#### Cart Store Example:
```typescript
// stores/cart.ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  
  const addItem = async (product: Product, quantity: number = 1) => {
    const existingItem = items.value.find(i => i.product.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }
    
    await saveCart()
  }
  
  const total = computed(() => 
    items.value.reduce((sum, item) => 
      sum + (item.product.price_eur * item.quantity), 0
    )
  )
  
  return { items, addItem, total }
})
```

---

### Feature 5: Checkout & Payments ✅
**Deliverable**: Complete purchase flow with payment processing

#### Implementation Steps:
1. Create multi-step checkout flow
2. Build address selection/creation
3. Integrate Stripe payment
4. Integrate PayPal
5. Add Cash on Delivery option
6. Implement order creation
7. Send order confirmation emails
8. Generate invoices

#### Payment Integration:
```typescript
// server/api/payment/stripe-intent.post.ts
export default defineEventHandler(async (event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const { amount, currency } = await readBody(event)
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency || 'eur',
    automatic_payment_methods: {
      enabled: true,
    },
  })
  
  return {
    clientSecret: paymentIntent.client_secret
  }
})
```

---

### Feature 6: Order Management ✅
**Deliverable**: Order tracking and history

#### Implementation Steps:
1. Create order history page
2. Build order detail views
3. Implement order status updates
4. Add order tracking UI
5. Create order emails (shipped, delivered)
6. Build customer support contact
7. Add order invoice download

---

### Feature 7: Inventory System ✅
**Deliverable**: Automated inventory management

#### Implementation Steps:
1. Implement real-time stock updates
2. Add low stock alerts
3. Create stock reservation during checkout
4. Build inventory history logs
5. Add bulk inventory update tool
6. Implement automatic restock notifications

---

### Feature 8: Admin Dashboard ✅
**Deliverable**: Complete business management interface

#### Implementation Steps:
1. Create admin authentication
2. Build order management interface
3. Implement product CRUD operations
4. Add category management
5. Create customer management
6. Build analytics dashboard
7. Add export features (CSV)
8. Implement email blast feature

---

### Feature 9: Enhanced Features ✅
**Deliverable**: Marketing and growth tools

#### Implementation Steps:
1. Add discount codes system
2. Implement abandoned cart recovery
3. Create product recommendations
4. Add customer reviews
5. Build wishlist functionality
6. Implement referral program
7. Add social sharing
8. Create email marketing automation

## Development Guidelines

### Mobile-First Design Principles

```vue
<!-- Always design for mobile first -->
<template>
  <div class="px-4 sm:px-6 lg:px-8"> <!-- Responsive padding -->
    <div class="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4">
      <!-- Mobile: Stack | Tablet: 2 cols | Desktop: 4 cols -->
    </div>
  </div>
</template>
```

### Component Structure

```vue
<!-- components/ComponentName.vue -->
<template>
  <div class="component-name">
    <!-- Template here -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PropType } from 'vue'

// Props
const props = defineProps({
  item: {
    type: Object as PropType<ItemType>,
    required: true
  }
})

// Emits
const emit = defineEmits<{
  update: [value: string]
}>()

// Composables
const { t } = useI18n()

// State
const isLoading = ref(false)

// Computed
const formattedPrice = computed(() => 
  new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(props.item.price)
)

// Methods
const handleClick = async () => {
  // Implementation
}
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
```

### API Route Structure

```typescript
// server/api/resource/action.method.ts
export default defineEventHandler(async (event) => {
  // Authentication check
  const user = await requireAuth(event)
  
  // Validation
  const body = await readBody(event)
  const validated = validateSchema(body)
  
  // Business logic
  try {
    const result = await performAction(validated)
    return {
      success: true,
      data: result
    }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})
```

### State Management Pattern

```typescript
// stores/storeName.ts
export const useStoreName = defineStore('storeName', () => {
  // State
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  
  // Getters
  const itemCount = computed(() => items.value.length)
  
  // Actions
  const fetchItems = async () => {
    isLoading.value = true
    try {
      const data = await $fetch('/api/items')
      items.value = data
    } catch (err) {
      error.value = err
    } finally {
      isLoading.value = false
    }
  }
  
  // Return public interface
  return {
    // State
    items: readonly(items),
    isLoading: readonly(isLoading),
    error: readonly(error),
    // Getters
    itemCount,
    // Actions
    fetchItems
  }
})
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/moldova_direct"

# Authentication
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Payment
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_WEBHOOK_ID="..."

# Email
SENDGRID_API_KEY="..."
EMAIL_FROM="noreply@moldovadirect.com"

# Storage
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# App
APP_URL="https://moldovadirect.com"
NODE_ENV="development"
```

## Security Checklist

- [ ] JWT tokens stored in httpOnly cookies
- [ ] CSRF protection enabled
- [ ] Rate limiting on all API endpoints
- [ ] Input validation on all forms
- [ ] SQL injection protection (use ORM)
- [ ] XSS protection (Vue handles this)
- [ ] HTTPS only in production
- [ ] Secure headers configured
- [ ] Payment tokenization (never store card details)
- [ ] Regular security updates
- [ ] Error messages don't leak sensitive info
- [ ] Admin routes properly protected
- [ ] File upload restrictions
- [ ] CORS properly configured

## Performance Optimization

### Image Optimization
```vue
<NuxtImg
  src="/product.jpg"
  alt="Product"
  loading="lazy"
  :modifiers="{ quality: 80, format: 'webp' }"
  sizes="sm:100vw md:50vw lg:33vw"
/>
```

### Code Splitting
```typescript
// Lazy load heavy components
const HeavyComponent = defineAsyncComponent(() => 
  import('~/components/HeavyComponent.vue')
)
```

### Caching Strategy
```typescript
// API caching example
export default cachedEventHandler(async () => {
  return await getProducts()
}, {
  maxAge: 60 * 60, // 1 hour
  name: 'products-list',
  getKey: (event) => event.node.req.url
})
```

## Testing Strategy

### Unit Tests (Vitest)
```typescript
// tests/unit/cart.test.ts
import { describe, it, expect } from 'vitest'
import { useCartStore } from '~/stores/cart'

describe('Cart Store', () => {
  it('adds item to cart', () => {
    const cart = useCartStore()
    cart.addItem(mockProduct)
    expect(cart.items.length).toBe(1)
  })
})
```

### E2E Tests (Playwright)
```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test('complete checkout flow', async ({ page }) => {
  await page.goto('/products')
  await page.click('[data-testid="add-to-cart"]')
  await page.goto('/checkout')
  // ... complete checkout steps
  await expect(page).toHaveURL('/checkout/success')
})
```

## Deployment Guide

### Vercel Deployment (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables
# Set in Vercel dashboard
```

### Railway/Render Deployment (Backend)
```yaml
# railway.toml or render.yaml
services:
  - type: web
    name: moldova-api
    env: docker
    dockerfilePath: ./Dockerfile
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: moldova-db
          property: connectionString
```

## Quick Start Commands

```bash
# Initial setup
npx nuxi@latest init moldova-direct
cd moldova-direct

# Install dependencies
npm install @nuxtjs/tailwindcss @nuxtjs/i18n @pinia/nuxt reka-ui prisma @prisma/client

# Database setup
npx prisma init
npx prisma migrate dev --name init
npx prisma generate

# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Deploy
vercel --prod
```

## Progress Tracking Template

```markdown
# Moldova Direct - Progress Tracker

## Completed ✅
- [ ] Project setup
- [ ] Foundation & Static Pages
  - [ ] Nuxt 3 + TypeScript
  - [ ] TailwindCSS + Reka UI
  - [ ] i18n configuration
  - [ ] Basic layouts
  - [ ] Static pages

## In Progress 🚧
- [ ] Product Showcase
  - [ ] Database setup
  - [ ] Product listing
  - [ ] Product details
  - [ ] Search & filters

## Upcoming 📋
- [ ] User Authentication
- [ ] Shopping Cart
- [ ] Checkout & Payments
- [ ] Order Management
- [ ] Inventory System
- [ ] Admin Dashboard
- [ ] Enhanced Features

## Notes
- Last worked on: [Date]
- Next priority: [Feature]
- Blockers: [Any issues]
```

## Useful Resources

### Documentation
- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Vue 3 Docs](https://vuejs.org/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Reka UI](https://reka-ui.com/)
- [Pinia](https://pinia.vuejs.org/)
- [Prisma](https://www.prisma.io/docs)

### Payment Integration
- [Stripe Docs](https://stripe.com/docs)
- [PayPal Developer](https://developer.paypal.com/)

### Tools
- [Nuxt DevTools](https://devtools.nuxtjs.org/)
- [Vue DevTools](https://devtools.vuejs.org/)
- [Prisma Studio](https://www.prisma.io/studio)

### Testing
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

## Solo Developer Tips

### Time Management
1. **Work in 2-hour focused sessions**
2. **Complete one feature fully before moving on**
3. **Deploy after every feature**
4. **Document as you code**

### Code Quality
1. **Use TypeScript strictly**
2. **Write self-documenting code**
3. **Keep components under 200 lines**
4. **Extract reusable logic to composables**

### Avoiding Burnout
1. **No artificial deadlines**
2. **Celebrate small wins**
3. **Take breaks between features**
4. **Ask for help when stuck**

### Maintaining Momentum
1. **Keep a development log**
2. **Use TODO comments liberally**
3. **Screenshot progress regularly**
4. **Share updates with someone**

---

*Last updated: [Current Date]*
*Version: 1.0.0*