# Code Conventions


This document defines naming conventions, file organization, and code style rules.

## Naming Conventions

### file

**Convention:** Use kebab-case for file names

**Example:** `product-list.vue, use-cart.ts, api-client.ts`

### component

**Convention:** Use PascalCase for component names

**Example:** `ProductList, CartItem, CheckoutForm`

### composable

**Convention:** Use camelCase with "use" prefix for composables

**Example:** `useCart, useAuth, useProductFilters`

### type

**Convention:** Use PascalCase for TypeScript types and interfaces

**Example:** `Product, CartItem, UserProfile`

### constant

**Convention:** Use UPPER_SNAKE_CASE for constants

**Example:** `MAX_CART_ITEMS, DEFAULT_CURRENCY, API_BASE_URL`

## File Organization

```
project-root/
├── components/          # Vue components
│   ├── admin/          # Admin-specific components
│   ├── cart/           # Cart-related components
│   ├── checkout/       # Checkout flow components
│   ├── common/         # Shared components
│   └── product/        # Product-related components
├── composables/        # Reusable business logic
├── pages/              # Nuxt pages (routes)
├── server/             # Server-side code
│   ├── api/           # API routes
│   ├── middleware/    # Server middleware
│   └── utils/         # Server utilities
├── stores/             # Pinia stores
├── types/              # TypeScript type definitions
└── utils/              # Client utilities
```

### Rules

- Group related components in subdirectories
- Keep composables focused on single responsibility
- Place API routes in server/api/ matching URL structure
- Define shared types in types/ directory
- Keep utilities pure functions when possible

## Code Style

### Use TypeScript strict mode

```typescript
// tsconfig.json: "strict": true
```

### Prefer Composition API over Options API

```typescript
<script setup lang="ts"> instead of export default { ... }
```

### Use explicit return types for functions

```typescript
function getTotal(): number { return 100 }
```

### Use const for immutable values, let for mutable

```typescript
const MAX = 100; let count = 0
```

### Prefer async/await over .then() chains

```typescript
const data = await fetchData() instead of fetchData().then()
```

### Add data-testid to interactive elements

```typescript
<button data-testid="submit-btn">Submit</button>
```
