# Moldova Direct - Features Documentation


## Product Catalog

### Product Display
- Grid and list view options
- Product cards with images, prices, stock status
- Quick view functionality
- Category filtering
- Search with autocomplete
- Sort by price, name, date

### Product Detail Page
- Image gallery with zoom
- Localized descriptions
- Stock availability indicator
- Add to cart with quantity selector
- Related products section
- Wine-specific attributes (origin, volume, alcohol content)

### Categories
- Hierarchical category structure
- Category pages with product filtering
- Category navigation in header
- SEO-friendly category URLs

## Shopping Cart

### Core Functionality
- Add/remove items
- Quantity adjustment
- Real-time price calculation
- Stock validation on add
- Persistent storage (localStorage)

### User Experience
- Cart drawer (slide-out panel)
- Cart page for full view
- Mini cart in header with item count
- Empty cart state
- Continue shopping links

### Technical Features
- Session-based cart identification
- Cross-tab synchronization
- Offline resilience
- Cart analytics tracking
- Abandonment detection

## User Authentication

### Registration
- Email/password registration
- Email verification required
- Profile creation on signup
- Terms acceptance

### Login
- Email/password login
- Magic link option
- Remember me functionality
- Session persistence

### Password Management
- Forgot password flow
- Email-based reset
- Secure token validation
- Password strength requirements

### Account Dashboard
- Profile information
- Order history
- Address management
- Password change
- Language preference

## Checkout Flow

### Step 1: Cart Review
- Item list with images
- Quantity editing
- Remove items
- Subtotal calculation
- Proceed to checkout button

### Step 2: Shipping Information
- Address form (name, street, city, postal, country)
- Address validation
- Save address option
- Shipping method selection
- Delivery time estimates

### Step 3: Payment
- Stripe integration
- Credit card form
- Order summary
- Price breakdown (subtotal, shipping, tax, total)
- Terms acceptance

### Step 4: Confirmation
- Order number
- Order summary
- Estimated delivery
- Email confirmation sent
- Continue shopping option

### Guest Checkout
- Available without account
- Email required for notifications
- Option to create account after purchase

## Order Management

### Customer View
- Order history list
- Order detail page
- Order status tracking
- Reorder functionality

### Order Statuses
- Pending (payment processing)
- Confirmed (payment received)
- Processing (preparing shipment)
- Shipped (in transit)
- Delivered (completed)
- Cancelled (by customer or admin)

## Admin Dashboard

### Overview
- Sales metrics
- Recent orders
- Low stock alerts
- Quick actions

### Product Management
- Product list with search/filter
- Add new product
- Edit product details
- Manage images
- Set pricing and inventory
- Publish/unpublish

### Order Management
- Order list with filters
- Order detail view
- Update order status
- Process refunds
- Print packing slips

### User Management
- User list
- User roles (customer, admin)
- Account status
- Order history per user

## Internationalization (i18n)

### Language Support
- Spanish (es) - Default
- English (en)
- Romanian (ro)
- Russian (ru)

### Features
- Language switcher in header
- URL-based locale (prefix strategy)
- Browser language detection
- Persistent language preference
- Localized content (UI, products, emails)

### Implementation
```vue
<template>
  <h1>{{ $t('products.title') }}</h1>
</template>

<script setup>
const { locale, setLocale } = useI18n()
</script>
```

## Theme System

### Dark Mode
- System preference detection
- Manual toggle in header
- Persistent preference
- Smooth transitions
- Full component coverage

### Implementation
- Tailwind `dark:` variant
- CSS variables for colors
- `useTheme()` composable

## Email Notifications

### Transactional Emails
- Order confirmation
- Shipping notification
- Password reset
- Email verification
- Order status updates

### Features
- Localized templates
- HTML and text versions
- Retry on failure
- Logging for debugging

## Security Features

### Authentication
- Secure session management
- JWT with refresh tokens
- Role-based access control
- Protected routes

### Data Protection
- Input validation (Zod)
- SQL injection prevention (Supabase RLS)
- XSS prevention
- CSRF protection
- Rate limiting

### Admin Security
- Two middleware requirement
- Server-side verification
- Audit logging
- Session timeout

## Mobile Experience

### Responsive Design
- Mobile-first approach
- Touch-optimized interactions
- Swipe gestures
- Bottom navigation on mobile

### Performance
- Lazy image loading
- Code splitting
- Offline capability
- Fast page transitions

### PWA Features (Planned)
- Service worker
- Offline mode
- Push notifications
- Install prompt
