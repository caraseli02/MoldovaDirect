# Component Inventory

**Last Updated:** January 6, 2026

This document provides a comprehensive inventory of UI components available in the Moldova Direct project.

## Overview

As of January 2026, the project uses a **custom component library** located in `components/ui/`. This replaces the previous shadcn-vue and Reka UI dependencies (removed in PR #346) for a lighter-weight, more maintainable solution.

## Available UI Components

All components are located in `components/ui/` and can be imported directly:

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
```

### Core Components

| Component      | Location                      | Description |
|----------------|-------------------------------|-------------|
| **Button**     | `components/ui/button/`       | Primary action button with variants |
| **Card**       | `components/ui/card/`         | Content container with header/body/footer |
| **Dialog**     | `components/ui/dialog/`       | Modal dialogs and overlays |
| **Input**      | `components/ui/input/`        | Text input fields |
| **Label**      | `components/ui/label/`        | Form labels |
| **Select**     | `components/ui/select/`       | Dropdown selection |
| **Checkbox**   | `components/ui/checkbox/`     | Checkbox inputs |
| **Switch**     | `components/ui/switch/`       | Toggle switches |
| **Textarea**   | `components/ui/textarea/`     | Multi-line text input |
| **RadioGroup** | `components/ui/radio-group/`  | Radio button groups |

### Feedback Components

| Component    | Location                    | Description |
|--------------|----------------------------|-------------|
| **Alert**    | `components/ui/alert/`     | Alert messages and notifications |
| **Badge**    | `components/ui/badge/`     | Status badges and labels |
| **Sonner**   | `components/ui/sonner/`    | Toast notifications |
| **Skeleton** | `components/ui/skeleton/`  | Loading placeholders |
| **Tooltip**  | `components/ui/tooltip/`   | Hover tooltips |

### Layout Components

| Component      | Location                      | Description |
|----------------|-------------------------------|-------------|
| **Tabs**       | `components/ui/tabs/`         | Tabbed content sections |
| **Table**      | `components/ui/table/`        | Data tables |
| **Pagination** | `components/ui/pagination/`   | Page navigation |
| **Avatar**     | `components/ui/avatar/`       | User avatars |

## Usage Examples

### Button
```vue
<template>
  <Button variant="default" size="lg" @click="handleClick">
    Click me
  </Button>
</template>

<script setup>
import { Button } from '@/components/ui/button'
</script>
```

### Card
```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>
      Content goes here
    </CardContent>
  </Card>
</template>

<script setup>
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
</script>
```

### Form Input
```vue
<template>
  <div class="space-y-2">
    <Label for="email">Email</Label>
    <Input
      id="email"
      v-model="email"
      type="email"
      placeholder="Enter email"
    />
  </div>
</template>

<script setup>
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const email = ref('')
</script>
```

## Feature-Specific Components

Beyond UI primitives, the project has feature-specific components:

### Product Components (`components/product/`)
- `Card.vue` - Product card display
- `Gallery.vue` - Product image gallery
- `Details.vue` - Product detail view
- `Reviews.vue` - Product reviews section

### Cart Components (`components/cart/`)
- `Item.vue` - Cart item row
- `Summary.vue` - Cart totals
- `Drawer.vue` - Side cart drawer

### Checkout Components (`components/checkout/`)
- `ShippingForm.vue` - Shipping address form
- `PaymentForm.vue` - Payment method selection
- `OrderSummary.vue` - Order review

### Admin Components (`components/admin/`)
- `Dashboard/` - Dashboard widgets
- `Products/` - Product management
- `Orders/` - Order management
- `Users/` - User management

## Styling Guidelines

### Dark Mode Support
All components support dark mode via Tailwind's `dark:` variant:

```vue
<div class="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">
  Content
</div>
```

### Consistent Spacing
Use Tailwind's spacing scale:
- `p-4` / `px-4 py-2` for padding
- `gap-4` for flex/grid gaps
- `space-y-4` for vertical stacking

### Focus States
All interactive elements should have visible focus states:

```vue
<button class="focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2">
  Action
</button>
```

## Adding New Components

When creating new UI components:

1. **Location**: Place in `components/ui/[component-name]/`
2. **Structure**: Create `index.ts` for exports and `[Component].vue` for implementation
3. **TypeScript**: Use proper interfaces for props
4. **Accessibility**: Include ARIA attributes and keyboard navigation
5. **Dark Mode**: Support light and dark themes
6. **Documentation**: Update this inventory

### Component Template

```vue
<template>
  <div
    :class="cn(baseClasses, props.class)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  variant?: 'default' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const baseClasses = computed(() => ({
  // base classes
}))
</script>
```

## Migration Notes

### From shadcn-vue (Historical)
The project previously used shadcn-vue components. As of PR #346 (January 2026), these were replaced with custom components to:
- Reduce bundle size
- Remove Reka UI dependency
- Improve maintainability
- Maintain accessibility standards

Components maintain the same API patterns, so existing usage should work with minimal changes.

## Related Documentation

- [Code Conventions](./code-conventions.md) - Coding standards
- [Troubleshooting Components](./troubleshooting-components.md) - Common issues and fixes
- [Project Structure](./structure.md) - Where components live
