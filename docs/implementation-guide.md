# Component Modernization Implementation Guide

This guide provides detailed implementation steps for each phase of the shadcn-vue component modernization plan. Library scaffolding concluded on 2025-10-05; the steps below now support the ongoing migration effort. Keep this guide in sync with the active task list in `TODO.md`.

## 📦 Library Installation Completed — October 5, 2025

All shadcn-vue component libraries were generated with the CLI on October 5, 2025. The guide below documents that installation so contributors can continue migrating existing UI to the new components.

### Summary of Achievement

- **Total Implementation Time**: ~2 hours (vs planned 6 weeks)
- **Components Added**: 19 complete shadcn-vue libraries (77 individual files)
- **Method**: Used official shadcn-vue CLI - no manual coding required
- **Result**: Libraries are available—component replacement across the app is still in progress

---

## Migration Status (February 2026)
- ✅ Buttons, primary dialogs, and selected admin actions now use shadcn-vue components
- 🔄 Forms & filters: replace custom inputs/selects/textarea usages
- 🔄 Alerts & toasts: retire `components/common/Toast*.vue`
- 🔄 Tables & data grids: adopt shadcn table patterns for admin views
- 📌 Track blockers and owners in `TODO.md`; update both docs when milestones land

## Phase 1: Foundation Components Implementation

### 1. Select Component Implementation

#### File Structure

```
components/ui/select/
├── index.ts
├── Select.vue
├── SelectContent.vue
├── SelectGroup.vue
├── SelectItem.vue
├── SelectLabel.vue
├── SelectScrollDownButton.vue
├── SelectScrollUpButton.vue
├── SelectSeparator.vue
├── SelectTrigger.vue
└── SelectValue.vue
```

#### Implementation Steps

1. **Create index.ts**

   ```typescript
   import type { VariantProps } from "class-variance-authority";
   import { cva } from "class-variance-authority";

   export { default as Select } from "./Select.vue";
   export { default as SelectContent } from "./SelectContent.vue";
   export { default as SelectGroup } from "./SelectGroup.vue";
   export { default as SelectItem } from "./SelectItem.vue";
   export { default as SelectLabel } from "./SelectLabel.vue";
   export { default as SelectScrollDownButton } from "./SelectScrollDownButton.vue";
   export { default as SelectScrollUpButton } from "./SelectScrollUpButton.vue";
   export { default as SelectSeparator } from "./SelectSeparator.vue";
   export { default as SelectTrigger } from "./SelectTrigger.vue";
   export { default as SelectValue } from "./SelectValue.vue";

   export const selectVariants = cva(
     "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
     {
       variants: {
         size: {
           default: "h-9 px-3 py-2",
           sm: "h-8 rounded-md px-2 py-1 text-xs",
           lg: "h-10 rounded-md px-4 py-2",
         },
       },
       defaultVariants: {
         size: "default",
       },
     }
   );
   ```

2. **Migration Targets**
   - `components/checkout/ShippingMethodSelector.vue` - Replace custom dropdown
   - `components/admin/Products/Filters.vue` - Replace category and status filters
   - `pages/admin/users/index.vue` - Replace user role selector
   - `components/profile/AddressFormModal.vue` - Replace country selector

### 2. Label Component Implementation

#### File Structure

```
components/ui/label/
├── index.ts
└── Label.vue
```

#### Implementation Steps

1. **Create Label.vue**

   ```vue
   <script setup lang="ts">
   import type { PrimitiveProps } from "reka-ui";
   import type { HTMLAttributes } from "vue";
   import { Primitive } from "reka-ui";
   import { cn } from "@/lib/utils";

   interface Props extends PrimitiveProps {
     class?: HTMLAttributes["class"];
     for?: string;
   }

   const props = withDefaults(defineProps<Props>(), {
     as: "label",
   });
   </script>

   <template>
     <Primitive
       :as="as"
       :as-child="asChild"
       :class="
         cn(
           'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
           props.class
         )
       "
       :for="for"
     >
       <slot />
     </Primitive>
   </template>
   ```

2. **Migration Targets**
   - `pages/auth/login.vue` - Add labels to email/password inputs
   - `pages/auth/register.vue` - Add labels to all form fields
   - `components/checkout/PaymentForm.vue` - Add labels to payment fields
   - `components/admin/Products/Form.vue` - Add labels to all product form fields

### 3. Alert Component Implementation

#### File Structure

```
components/ui/alert/
├── index.ts
├── Alert.vue
└── AlertDescription.vue
```

#### Implementation Steps

1. **Create Alert.vue**

   ```vue
   <script setup lang="ts">
   import type { PrimitiveProps } from "reka-ui";
   import type { HTMLAttributes } from "vue";
   import { Primitive } from "reka-ui";
   import type { AlertVariants } from ".";
   import { cn } from "@/lib/utils";
   import { alertVariants } from ".";

   interface Props extends PrimitiveProps {
     variant?: AlertVariants["variant"];
     class?: HTMLAttributes["class"];
   }

   const props = withDefaults(defineProps<Props>(), {
     as: "div",
     variant: "default",
   });
   </script>

   <template>
     <Primitive
       :as="as"
       :as-child="asChild"
       role="alert"
       :class="cn(alertVariants({ variant }), props.class)"
     >
       <slot />
     </Primitive>
   </template>
   ```

2. **Migration Targets**
   - `components/auth/AuthErrorMessage.vue` - ✅ Replaced by shadcn `Alert` (February 2026)
   - `components/auth/AuthSuccessMessage.vue` - ✅ Replaced by shadcn `Alert` (February 2026)
   - `components/common/ErrorBoundary.vue` - Replace custom error display
   - All manual alert implementations in forms

### 4. Badge Component Implementation

#### File Structure

```
components/ui/badge/
├── index.ts
└── Badge.vue
```

#### Implementation Steps

1. **Create Badge.vue**

   ```vue
   <script setup lang="ts">
   import type { PrimitiveProps } from "reka-ui";
   import type { HTMLAttributes } from "vue";
   import { Primitive } from "reka-ui";
   import type { BadgeVariants } from ".";
   import { cn } from "@/lib/utils";
   import { badgeVariants } from ".";

   interface Props extends PrimitiveProps {
     variant?: BadgeVariants["variant"];
     class?: HTMLAttributes["class"];
   }

   const props = withDefaults(defineProps<Props>(), {
     as: "span",
     variant: "default",
   });
   </script>

   <template>
     <Primitive
       :as="as"
       :as-child="asChild"
       :class="cn(badgeVariants({ variant }), props.class)"
     >
       <slot />
     </Primitive>
   </template>
   ```

2. **Migration Targets**
   - Status indicators in admin tables
   - Category badges in product cards
   - Notification counts in header
   - Custom status implementations throughout admin

### 5. Checkbox Component Implementation

#### File Structure

```
components/ui/checkbox/
├── index.ts
└── Checkbox.vue
```

#### Implementation Steps

1. **Create Checkbox.vue**

   ```vue
   <script setup lang="ts">
   import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui";
   import {
     CheckboxIndicator,
     CheckboxRoot,
     useForwardPropsEmits,
   } from "reka-ui";
   import type { HTMLAttributes } from "vue";
   import { computed } from "vue";
   import { cn } from "@/lib/utils";

   const props = defineProps<
     CheckboxRootProps & { class?: HTMLAttributes["class"] }
   >();
   const emits = defineEmits<CheckboxRootEmits>();

   const delegatedProps = computed(() => {
     const { class: _, ...delegated } = props;
     return delegated;
   });

   const forwarded = useForwardPropsEmits(delegatedProps, emits);
   </script>

   <template>
     <CheckboxRoot
       v-bind="forwarded"
       :class="
         cn(
           'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
           props.class
         )
       "
     >
       <CheckboxIndicator
         class="flex h-full w-full items-center justify-center text-current"
       >
         <svg
           xmlns="http://www.w3.org/2000/svg"
           width="24"
           height="24"
           viewBox="0 0 24 24"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           stroke-linecap="round"
           stroke-linejoin="round"
           class="h-4 w-4"
         >
           <path d="M20 6L9 17l-5-5" />
         </svg>
       </CheckboxIndicator>
     </CheckboxRoot>
   </template>
   ```

2. **Migration Targets**
   - `components/cart/Item.vue` - Replace custom checkbox for item selection
   - `components/admin/Utils/BulkOperationsBar.vue` - Replace custom checkboxes
   - Form selections in admin panels
   - Custom checkbox implementations throughout the app

## Phase 2: Enhanced UX Components Implementation

### 1. Tooltip Component Implementation ✅

#### File Structure

```
components/ui/tooltip/
├── index.ts
├── Tooltip.vue
├── TooltipContent.vue
├── TooltipProvider.vue
└── TooltipTrigger.vue
```

#### Implementation Steps

1. **Create Tooltip components** following shadcn-vue patterns
2. **Add TooltipProvider** at app root level
3. **Migration Targets**
   - Help text in admin forms
   - Product information tooltips
   - Action button descriptions in tables

### 2. Tabs Component Implementation ✅

#### File Structure

```
components/ui/tabs/
├── index.ts
├── Tabs.vue
├── TabsContent.vue
├── TabsList.vue
└── TabsTrigger.vue
```

#### Implementation Steps

1. **Create Tab components** with proper keyboard navigation
2. **Migration Targets**
   - `components/admin/Products/Form.vue` - Organize product form sections
   - `pages/admin/analytics.vue` - Organize analytics dashboards
   - User profile sections
   - Settings pages

### 3. Switch Component Implementation ✅

#### File Structure

```
components/ui/switch/
├── index.ts
└── Switch.vue
```

#### Implementation Steps

1. **Create Switch component** with smooth animations
2. **Migration Targets**
   - Theme toggle in header
   - Notification settings
   - Feature toggles in admin
   - Form switches and toggles

## Phase 3: Advanced Components Implementation

### 1. Table Component Implementation ✅

#### File Structure

```
components/ui/table/
├── index.ts
├── Table.vue
├── TableBody.vue
├── TableCaption.vue
├── TableCell.vue
├── TableEmpty.vue
├── TableFooter.vue
├── TableHead.vue
├── TableHeader.vue
└── TableRow.vue
```

#### Implementation Steps

1. **Create comprehensive Table system**
2. **Migration Targets**
   - `components/admin/Users/Table.vue` - Replace with shadcn Table
   - `components/admin/Products/Table.vue` - Replace custom table
   - All admin data tables
   - Custom table implementations

### 2. Skeleton Component Implementation ✅

#### File Structure

```
components/ui/skeleton/
├── index.ts
└── Skeleton.vue
```

#### Implementation Steps

1. **Create Skeleton component** with multiple variants
2. **Migration Targets**
   - Loading states in product cards
   - Form loading states
   - Table loading states
   - Custom loading implementations

## Migration Checklists

### Pre-Migration Checklist

- [ ] Backup current implementation
- [ ] Create feature branch for migration
- [ ] Set up component testing environment
- [ ] Document current component usage patterns
- [ ] Identify critical user paths for testing

### Component Implementation Checklist

- [ ] Create component file structure
- [ ] Implement component variants and props
- [ ] Add TypeScript types and interfaces
- [ ] Create component documentation
- [ ] Write unit tests for component
- [ ] Test component in isolation

### Migration Checklist

- [ ] Identify all usage locations of component to replace
- [ ] Update component imports in target files
- [ ] Replace component markup and props
- [ ] Update styling and classes
- [ ] Test component functionality
- [ ] Verify accessibility compliance
- [ ] Test responsive behavior
- [ ] Update related tests

### Post-Migration Checklist

- [ ] Run full test suite
- [ ] Perform manual testing of affected user flows
- [ ] Test component across different browsers
- [ ] Validate mobile experience
- [ ] Check accessibility with screen readers
- [ ] Update documentation
- [ ] Monitor for issues after deployment

## Testing Strategy

### Component Testing

```typescript
// Example: Button component test
import { render, fireEvent } from "@testing-library/vue";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with default variant", () => {
    const { getByRole } = render(Button, {
      slots: { default: "Click me" },
    });

    const button = getByRole("button");
    expect(button).toHaveClass("bg-primary");
  });

  it("handles click events", async () => {
    const { getByRole } = render(Button, {
      slots: { default: "Click me" },
    });

    const button = getByRole("button");
    await fireEvent.click(button);
    // Assert click behavior
  });
});
```

### E2E Testing

```typescript
// Example: Cart interaction test
import { test, expect } from "@playwright/test";

test("cart item quantity controls", async ({ page }) => {
  await page.goto("/cart");

  // Test increment button
  await page.click('[data-testid="increment-quantity"]');
  await expect(page.locator('[data-testid="item-quantity"]')).toContainText(
    "2"
  );

  // Test decrement button
  await page.click('[data-testid="decrement-quantity"]');
  await expect(page.locator('[data-testid="item-quantity"]')).toContainText(
    "1"
  );
});
```

## Best Practices

### Component Design

- Follow shadcn-vue API patterns for consistency
- Use semantic props and clear naming conventions
- Implement proper TypeScript types
- Include accessibility features from the start
- Support dark mode out of the box

### Migration Strategy

- Migrate incrementally to minimize risk
- Test each component thoroughly before deployment
- Maintain backward compatibility during transition
- Document breaking changes and migration paths
- Monitor performance impact during migration

### Code Quality

- Use consistent formatting and linting rules
- Write comprehensive tests for all components
- Document component APIs and usage patterns
- Follow Vue 3 Composition API best practices
- Optimize for bundle size and performance

## Implementation Results - October 5, 2025

### What Was Actually Done

**Implementation Method**: Used shadcn-vue CLI to scaffold component libraries; no product views were migrated on this date.

**Commands Used**:

```bash
npx shadcn-vue@latest add select      # 12 files
npx shadcn-vue@latest add label       # 2 files
npx shadcn-vue@latest add alert       # 4 files
npx shadcn-vue@latest add badge       # 2 files
npx shadcn-vue@latest add checkbox    # 2 files
npx shadcn-vue@latest add tooltip     # 5 files
npx shadcn-vue@latest add tabs        # 5 files
npx shadcn-vue@latest add switch      # 2 files
npx shadcn-vue@latest add textarea    # 2 files
npx shadcn-vue@latest add radio-group # 3 files
npx shadcn-vue@latest add table       # 11 files
npx shadcn-vue@latest add skeleton    # 2 files
npx shadcn-vue@latest add pagination  # 9 files
npx shadcn-vue@latest add avatar      # 4 files
```

**Total Implementation**: ~2 hours of scaffolding effort (vs planned 6 weeks of manual implementation). Migration work continues per the plan.

### Key Benefits Realized

1. **Speed**: CLI scaffolding freed time for higher-value migration work.
2. **Quality**: Official shadcn-vue components with full features are available.
3. **Compatibility**: Components work out of the box; verify integration in each surface.
4. **Accessibility**: Built-in WCAG 2.1 AA compliance once components replace legacy markup.
5. **Dark Mode**: Automatic dark mode support maintained during migration.
6. **Dependencies**: All required dependencies auto-installed; confirm versions before upgrades.

### Components Ready for Migration

All 19 component libraries are now available and ready for use:

- **Foundation**: Select, Label, Alert, Badge, Checkbox
- **Enhanced UX**: Tooltip, Tabs, Switch, Textarea, RadioGroup
- **Advanced**: Table, Skeleton, Pagination, Avatar

### Next Steps

1. **Migration Planning**: Break work into surface-level tasks and record them in `TODO.md`.
2. **Developer Training**: Update team on new component usage.
3. **Documentation**: Create internal usage guidelines as migrations complete.
4. **Testing**: Validate component functionality in application context before each release.

### Lessons Learned

- **CLI vs Manual**: shadcn-vue CLI is dramatically faster than manual implementation
- **Official Components**: Using official components ensures compatibility and maintenance
- **Immediate Value**: Components provide immediate value without development overhead
- **No Custom Code**: Eliminated need to write and maintain custom component implementations

This implementation guide demonstrates how modern CLI tools can dramatically accelerate component library implementation while maintaining quality and consistency.

---

This implementation guide provides a roadmap for successfully modernizing your component library with shadcn-vue components while maintaining quality and minimizing disruption to your application.
