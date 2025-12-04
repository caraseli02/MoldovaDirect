# Moldova Direct - Component Library

This directory contains all Vue 3 components for the Moldova Direct e-commerce platform.

## Overview

- **Total Components:** 239 Vue components
- **Framework:** Vue 3.5 with Composition API (`<script setup>`)
- **UI Library:** shadcn-vue (Tailwind-based)
- **Styling:** Tailwind CSS v4

## Directory Structure

```
components/
├── admin/           # Admin dashboard components (auth required)
│   ├── Charts/      # Analytics charts and graphs
│   ├── Dashboard/   # Dashboard overview widgets
│   ├── Email/       # Email management components
│   ├── Inventory/   # Stock management
│   ├── Orders/      # Order management tables/forms
│   ├── Products/    # Product CRUD components
│   ├── Tables/      # Reusable admin tables
│   ├── testing/     # Admin testing utilities
│   └── Users/       # User management
│
├── auth/            # Authentication components
│                    # Login, register, password reset forms
│
├── cart/            # Shopping cart components
│                    # Cart drawer, items, summary
│
├── checkout/        # Checkout flow components
│   └── payment/     # Payment form components
│                    # Shipping, payment, review steps
│
├── common/          # Shared/reusable components
│                    # Loaders, errors, notifications
│
├── custom/          # Custom one-off components
│                    # Specialized implementations
│
├── home/            # Homepage components
│                    # Hero, features, product sliders
│
├── layout/          # Layout components
│                    # Header, footer, navigation
│
├── mobile/          # Mobile-specific components
│                    # Bottom nav, mobile menus
│
├── order/           # Order display components
│                    # Order details, tracking, history
│
├── pairing/         # Product pairing components
│                    # Wine/food pairing suggestions
│
├── producer/        # Producer/brand components
│                    # Producer profiles, info
│
├── product/         # Product display components
│   ├── detail/      # Product detail subcomponents
│   └── gallery/     # Image gallery components
│                    # Cards, grids, filters
│
├── profile/         # User profile components
│                    # Account settings, preferences
│
└── ui/              # shadcn-vue UI primitives
    ├── alert/       # Alert dialogs
    ├── avatar/      # User avatars
    ├── badge/       # Status badges
    ├── button/      # Button variants
    ├── card/        # Card containers
    ├── checkbox/    # Checkbox inputs
    ├── dialog/      # Modal dialogs
    ├── dropdown-menu/ # Dropdown menus
    ├── form/        # Form components
    ├── input/       # Text inputs
    ├── label/       # Form labels
    ├── pagination/  # Pagination controls
    ├── popover/     # Popover tooltips
    ├── scroll-area/ # Scrollable containers
    ├── select/      # Select dropdowns
    ├── separator/   # Visual separators
    ├── skeleton/    # Loading skeletons
    ├── switch/      # Toggle switches
    ├── table/       # Data tables
    ├── tabs/        # Tab navigation
    └── textarea/    # Multiline inputs
```

## Component Categories

### Admin Components (`admin/`)
Components for the admin dashboard. Require authentication and admin role.

**Key Components:**
- `Dashboard/Overview.vue` - Main dashboard view
- `Orders/Table.vue` - Order management table
- `Products/Form.vue` - Product edit form
- `Users/List.vue` - User management list

### UI Primitives (`ui/`)
shadcn-vue components providing consistent design system. These are auto-imported and can be used directly in templates.

**Usage:**
```vue
<template>
  <UiButton variant="default">Click Me</UiButton>
  <UiCard>
    <UiCardHeader>Title</UiCardHeader>
    <UiCardContent>Content</UiCardContent>
  </UiCard>
</template>
```

### Product Components (`product/`)
Product display and interaction components.

**Key Components:**
- `ProductCard.vue` - Product card for grids
- `ProductGallery.vue` - Image gallery
- `ProductDetails.vue` - Full product view

### Cart Components (`cart/`)
Shopping cart functionality.

**Key Components:**
- `CartDrawer.vue` - Slide-out cart
- `CartItem.vue` - Individual cart item
- `CartSummary.vue` - Order summary

### Checkout Components (`checkout/`)
Multi-step checkout flow.

**Key Components:**
- `ShippingStep.vue` - Address form
- `PaymentStep.vue` - Payment integration
- `ReviewStep.vue` - Order review

## Naming Conventions

### File Names
- **PascalCase** for component files: `ProductCard.vue`
- **Index files** for barrel exports: `index.ts`

### Component Names
Components are auto-registered using directory structure:
- `components/product/Card.vue` → `<ProductCard />`
- `components/ui/button/Button.vue` → `<UiButton />`
- `components/admin/Dashboard/Overview.vue` → `<AdminDashboardOverview />`

### Props & Events
- Props: camelCase with TypeScript interfaces
- Events: kebab-case with `emit('event-name')`

## Development Guidelines

### Creating New Components

1. **Choose the right directory** based on component purpose
2. **Use TypeScript** with `<script setup lang="ts">`
3. **Define props** with TypeScript interfaces
4. **Add JSDoc comments** for complex components

**Template:**
```vue
<script setup lang="ts">
/**
 * ComponentName - Brief description
 *
 * @example
 * <ComponentName :prop="value" @event="handler" />
 */

interface Props {
  /** Description of prop */
  propName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'event-name', value: string): void
}>()
</script>

<template>
  <!-- Template content -->
</template>
```

### Styling Guidelines

1. **Use Tailwind CSS** utility classes
2. **Support dark mode** with `dark:` variants
3. **Follow design system** in `tailwind.config.ts`
4. **Ensure responsiveness** with mobile-first approach

```vue
<template>
  <div class="p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
    <!-- Responsive text -->
    <h2 class="text-lg md:text-xl font-semibold">Title</h2>
  </div>
</template>
```

### Accessibility Requirements

- Add `aria-*` attributes where needed
- Support keyboard navigation
- Include `sr-only` text for screen readers
- Minimum 44px touch targets on mobile

```vue
<button
  class="min-h-[44px] min-w-[44px]"
  aria-label="Add to cart"
>
  <Icon name="plus" aria-hidden="true" />
  <span class="sr-only">Add to cart</span>
</button>
```

## i18n Support

All user-facing text must use i18n:

```vue
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <h1>{{ t('product.title') }}</h1>
  <p>{{ t('product.description') }}</p>
</template>
```

## Testing

Components should have corresponding tests:
- **Unit tests:** `tests/unit/components/`
- **Visual tests:** `tests/visual/`
- **E2E tests:** `tests/e2e/`

## Related Documentation

- [Component Inventory](../docs/development/component-inventory.md)
- [Component Modernization Plan](../docs/development/component-modernization-plan.md)
- [Troubleshooting Components](../docs/development/troubleshooting-components.md)
- [UI/UX Review](../docs/development/ui-ux-review.md)
- [shadcn Migration Guide](../docs/development/SHADCN_MIGRATION.md)

---

**Last Updated:** November 27, 2025
**Component Count:** 239 Vue components
