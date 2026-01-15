# Project Structure & Conventions


## Directory Organization

### Core Application Structure
```
├── components/          # Vue components organized by feature
│   ├── layout/         # Header, footer, navigation components
│   ├── ui/             # Reusable UI components (buttons, inputs, etc.)
│   └── [feature]/      # Feature-specific components (ProductCard.vue, etc.)
├── pages/              # File-based routing (Nuxt convention)
├── server/             # Backend API routes and utilities
│   ├── api/           # API endpoints following REST conventions
│   ├── database/      # Database schema and migrations
│   ├── middleware/    # Server middleware (auth, rate limiting)
│   └── utils/         # Server utility functions
├── stores/            # Pinia state management stores
├── composables/       # Vue composables for reusable logic
├── middleware/        # Route middleware
├── plugins/           # Nuxt plugins
├── assets/            # Static assets (CSS, images)
├── i18n/locales/      # Translation files (es.json, en.json, ro.json, ru.json)
└── types/             # TypeScript type definitions
```

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (e.g., `ProductCard.vue`, `LanguageSwitcher.vue`)
- **Pages**: kebab-case (e.g., `track-order.vue`, `forgot-password.vue`)
- **API Routes**: RESTful naming with HTTP method suffix (e.g., `login.post.ts`, `products.get.ts`)
- **Stores**: camelCase (e.g., `cart.ts`, `auth.ts`)
- **Composables**: camelCase with `use` prefix (e.g., `useCart.ts`, `useAuth.ts`)
- **Types**: PascalCase interfaces (e.g., `ProductWithRelations`, `CartItem`)

### Code Conventions
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **CSS Classes**: TailwindCSS utility classes preferred
- **Database**: snake_case for table/column names

## Component Architecture

### Component Structure Template
```vue
<template>
  <!-- Template with semantic HTML -->
</template>

<script setup lang="ts">
// 1. Imports (Vue, composables, types)
// 2. Props definition with TypeScript
// 3. Emits definition
// 4. Composables usage
// 5. Reactive state
// 6. Computed properties
// 7. Methods/functions
// 8. Lifecycle hooks
</script>

<style scoped>
/* Minimal scoped styles - prefer TailwindCSS */
</style>
```

### State Management Pattern
- **Pinia stores** for global state (cart, auth, products)
- **Local component state** with `ref()` and `reactive()`
- **Composables** for reusable stateful logic
- **Props/emits** for parent-child communication

## API Route Conventions

### File Structure
```
server/api/
├── auth/              # Authentication endpoints
├── products/          # Product-related endpoints
├── categories/        # Category endpoints
├── admin/             # Admin-only endpoints
└── upload/            # File upload endpoints
```

### Route Naming
- `index.get.ts` - GET /api/resource
- `[id].get.ts` - GET /api/resource/:id
- `create.post.ts` - POST /api/resource
- `[id].patch.ts` - PATCH /api/resource/:id
- `[id].delete.ts` - DELETE /api/resource/:id

## Database Schema Conventions

### Table Structure
- **Primary keys**: `id` (integer, auto-increment)
- **Timestamps**: `createdAt`, `updatedAt` (automatic)
- **Foreign keys**: `userId`, `productId` (descriptive naming)
- **JSON columns**: For translations and flexible data (`nameTranslations`, `attributes`)
- **Indexes**: On foreign keys and frequently queried columns

### Schema Organization
```
server/database/
├── schema/
│   ├── index.ts       # Export all schemas
│   ├── users.ts       # User-related tables
│   ├── products.ts    # Product catalog tables
│   └── orders.ts      # Order management tables
└── migrations/        # Generated migration files
```

## Internationalization Structure

### Translation Files
- **Location**: `i18n/locales/`
- **Format**: Nested JSON objects
- **Keys**: Dot notation (e.g., `products.addToCart`, `auth.login.title`)
- **Fallback**: Spanish (es) as default locale

### Usage Pattern
```typescript
// In components
const { t } = useI18n()
const title = t('products.title')

// In templates
{{ $t('products.addToCart') }}
```

## Testing Organization

### Test Structure
```
tests/
├── e2e/               # End-to-end tests by feature
├── visual/            # Visual regression tests
├── fixtures/          # Test utilities and page objects
├── setup/             # Test setup files
└── global-setup.ts    # Global test configuration
```

### Test Naming
- **Files**: `feature.spec.ts` (e.g., `auth.spec.ts`, `products.spec.ts`)
- **Test cases**: Descriptive names starting with "should"
- **Data attributes**: `data-testid` for reliable element selection

## Code Quality Standards

### TypeScript Usage
- **Strict mode enabled** - No implicit any
- **Interface definitions** for all data structures
- **Type imports** using `import type`
- **Generic types** for reusable components

### Component Guidelines
- **Single responsibility** - One concern per component
- **Props validation** with TypeScript interfaces
- **Emit typing** for type-safe events
- **Composables** for complex logic extraction
- **Maximum 200 lines** per component file

### Performance Considerations
- **Lazy loading** for heavy components
- **Image optimization** with Nuxt Image
- **Code splitting** at route level
- **Caching strategies** for API responses

## Environment Configuration

### File Structure
- `.env.example` - Template with all required variables
- `.env` - Local development (gitignored)
- `.env.test` - Testing environment

### Variable Naming
- `NUXT_` prefix for Nuxt-specific variables
- `SUPABASE_` prefix for Supabase credentials
- `JWT_` prefix for authentication secrets