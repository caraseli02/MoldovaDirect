# shadcn-vue Migration Documentation
**Started: August 31, 2025 — Status: Ongoing adoption**

## Overview
We scaffolded shadcn-vue component libraries and began migrating product surfaces. Adoption is in progress across checkout, cart, admin tables, and mobile navigation. The stack is based on Radix Vue primitives with Tailwind CSS v4.

## Migration Scope

### Installed Component Libraries (via shadcn CLI)
- Button, Card, Dialog, Input
- Select, Label, Alert, Badge
- Checkbox, Tooltip, Tabs, Switch, Textarea, RadioGroup
- Table, Pagination, Skeleton, Avatar
- Sonner (toast)

### Adopted in Product Surfaces (as of Feb 2026)
- Buttons: migrated in high-traffic flows (cart, language switcher)
- Dialogs: primary modals migrated
- Alerts: adopted in authentication flows
- Forms (Input/Label/Select/RadioGroup/Textarea): migration in progress
- Table/Pagination: pending in admin screens
- Sonner: prepared, but legacy toast container still in layouts

### Custom Components Preserved
Moved to `components/custom/` to differentiate from shadcn-vue components:
- `ConfirmDialog.vue` - Application-specific confirmation dialogs
- `ErrorBoundary.vue` - Error handling wrapper
- `Toast.vue` - Legacy toast component (being phased out)
- `ToastContainer.vue` - Legacy toast container

## Technical Changes

### Tailwind CSS Upgrade
- **Before**: Tailwind CSS v3 with traditional configuration
- **After**: Tailwind CSS v4 with CSS variables and modern configuration

### File Structure Changes
```
components/
├── ui/                  # shadcn-vue components
│   ├── button/
│   ├── card/
│   ├── dialog/
│   ├── input/
│   └── sonner/
├── custom/              # Application-specific components
└── [other components]   # Feature components
```

### Configuration Files

#### components.json
```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "default",
  "typescript": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "assets/css/tailwind.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "composables": "@/composables",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  },
  "iconLibrary": "lucide"
}
```

Note: This project uses Tailwind CSS v4 via `@tailwindcss/vite` and `assets/css/tailwind.css`. A `tailwind.config.js` file is not required for v4; the `config` path above is retained for CLI compatibility and is effectively unused.

#### CSS Variables (assets/css/tailwind.css)
New CSS variables system for theming:
- Light/dark mode support via CSS variables
- Consistent color palette across components
- Easy theme customization

## Benefits Achieved

### Developer Experience
- **Type Safety**: Full TypeScript support for all components
- **Consistency**: Unified component API and styling
- **Documentation**: Well-documented components with examples
- **Accessibility**: Built-in ARIA attributes and keyboard navigation

### Performance
- **Bundle Size**: Optimized tree-shaking for unused components
- **CSS**: Modern CSS with reduced specificity conflicts
- **Rendering**: Improved component rendering with Radix Vue primitives

### Maintenance
- **Updates**: Easy component updates via shadcn-vue CLI
- **Customization**: Components are copied to project for full control
- **Theming**: CSS variables make theme changes straightforward

## Migration Process

### Phase 1: Setup
1. Installed shadcn-vue dependencies
2. Configured Tailwind CSS v4
3. Set up component aliases and paths

### Phase 2: Component Migration
1. Added shadcn-vue libraries via CLI
2. Updated imports in targeted pages and components
3. Adjusted styling to match new component APIs
4. Incrementally replaced legacy markup (forms, tables, toasts)

### Phase 3: Cleanup
1. Removed old component files
2. Moved custom components to dedicated folder
3. Updated documentation

## Usage Examples

### Button Component
```vue
<!-- Before -->
<button class="btn-primary">Click me</button>

<!-- After -->
<UiButton variant="default">Click me</UiButton>
```

### Card Component
```vue
<!-- After -->
<UiCard>
  <UiCardHeader>
    <UiCardTitle>Title</UiCardTitle>
    <UiCardDescription>Description</UiCardDescription>
  </UiCardHeader>
  <UiCardContent>
    Content here
  </UiCardContent>
</UiCard>
```

### Dialog Component
```vue
<!-- After -->
<UiDialog v-model:open="isOpen">
  <UiDialogTrigger as-child>
    <UiButton>Open Dialog</UiButton>
  </UiDialogTrigger>
  <UiDialogContent>
    <UiDialogHeader>
      <UiDialogTitle>Dialog Title</UiDialogTitle>
      <UiDialogDescription>Dialog description</UiDialogDescription>
    </UiDialogHeader>
    <!-- Content -->
  </UiDialogContent>
</UiDialog>
```

## Adding New Components

To add new shadcn-vue components:

```bash
# Install shadcn-vue CLI globally (if not already installed)
npm install -g shadcn-vue

# Add a new component
npx shadcn-vue add [component-name]

# Example: Add select component
npx shadcn-vue add select
```

## Customization Guide

### Theming
Edit CSS variables in `assets/css/tailwind.css`:
```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... other variables */
}
```

### Component Variants
Components support multiple variants via props:
```vue
<UiButton variant="default|destructive|outline|secondary|ghost|link" />
<UiButton size="default|sm|lg|icon" />
```

## Best Practices

1. **Import from index**: Always import from component's index file
   ```typescript
   import { Button } from '@/components/ui/button'
   ```

2. **Use TypeScript**: Leverage TypeScript for prop validation
   ```vue
   <script setup lang="ts">
   import type { ButtonVariants } from '@/components/ui/button'
   </script>
   ```

3. **Accessibility**: Don't override built-in accessibility features

4. **Customization**: Extend components rather than modifying core files

## Troubleshooting

### Common Issues
1. **Import errors**: Ensure paths use `@/components/ui/[component]`
2. **Styling conflicts**: Check for conflicting Tailwind classes
3. **Dark mode**: Ensure dark mode classes are properly applied
4. **Duplicate component names (Alert, Button, etc.)**: Avoid auto-scanning `components/ui`; see `docs/troubleshooting-components.md`.
5. **Anonymous or unknown component warnings**: Use PascalCase tags and ensure `index.ts` barrels are not auto-registered as components; see `docs/troubleshooting-components.md`.

### Resources
- [shadcn-vue Documentation](https://www.shadcn-vue.com/)
- [Radix Vue Documentation](https://www.radix-vue.com/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/)

## Future Enhancements

1. Adopt installed components across surfaces:
   - Checkout: Inputs, Selects, RadioGroups, Textareas, Labels
   - Admin: Table + Pagination + Badge for statuses
   - Mobile: Dialog/Sheet patterns for navigation and cart
2. Migrate toast system from `components/common/Toast*.vue` to `components/ui/sonner` and replace `CommonToastContainer` in layouts with Sonner
3. Create thin wrappers for app-specific patterns (e.g., ConfirmDialog) extending shadcn primitives
4. Implement advanced theming with multiple brand themes (optional)

## Conclusion

The migration is delivering consistency, accessibility, and developer velocity. Library scaffolding is complete; product-wide adoption is ongoing and tracked in `docs/component-modernization-plan.md` and `.kiro/PROJECT_STATUS.md`.
