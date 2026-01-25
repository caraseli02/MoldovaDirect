# Moldova Direct - Component Library

## Overview

The project uses a **localized component system** in `components/ui/`. These components are built on the **shadcn-vue pattern** and utilize **Reka UI** (a headless UI primitive library) for industry-standard accessibility.

Because the source code resides directly in your project, it is considered a "custom" library—allowing for critical bug fixes (e.g., v-model reactivity fixes) and design customizations that wouldn't be possible with a standard external dependency.

## Architecture

### Root/Portal Pattern (January 2026)

As of January 2026, all dialog-like components follow the **Root/Portal architecture** from reka-ui. This pattern separates concerns:

| Component Type | Purpose | Example |
|----------------|---------|---------|
| **Root** | Manages state, v-model bindings, accessibility | `DialogRoot`, `AlertDialogRoot` |
| **Portal** | Renders content outside parent DOM hierarchy | `DialogPortal`, `TooltipPortal` |
| **Content** | The visible component with styling | `DialogContent`, `TooltipContent` |
| **Trigger** | Button/element that opens the component | `DialogTrigger`, `TooltipTrigger` |

```vue
<!-- Typical usage pattern -->
<UiDialog v-model:open="isOpen">
  <UiDialogContent>
    <UiDialogHeader>
      <UiDialogTitle>Title</UiDialogTitle>
    </UiDialogHeader>
    <!-- Content -->
  </UiDialogContent>
</UiDialog>
```

### Prop Forwarding

Components use `useForwardProps` and `useForwardPropsEmits` from reka-ui to properly forward props to underlying primitive components:

```typescript
// For components without emits
const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
const forwarded = useForwardProps(delegatedProps)

// For components with emits
const forwarded = useForwardPropsEmits(delegatedProps, emits)
```

## Available Components

### Form Components
| Component | Props | Notes |
|-----------|-------|-------|
| `UiInput` | `modelValue`, `defaultValue`, `type`, `placeholder`, `disabled`, `name`, `id` | Supports v-model, all HTML input types |
| `UiTextarea` | `modelValue`, `defaultValue`, `placeholder`, `disabled`, `rows`, `name`, `id` | Supports v-model |
| `UiSelect` | - | Root component for selects |
| `UiCheckbox` | - | Checkbox input |
| `UiSwitch` | - | Toggle switch |
| `UiSlider` | - | Range slider |
| `UiLabel` | `htmlFor` | Form label |
| `UiRadioGroup` | - | Radio button group |

### Dialog/Overlay Components
| Component | Props | Notes |
|-----------|-------|-------|
| `UiDialog` | `v-model:open` | Modal dialog |
| `UiAlertDialog` | `v-model:open` | Alert/confirmation dialog |
| `UiSheet` | `v-model:open`, `side` | Side panel (drawer) |
| `UiTooltip` | - | Tooltip on hover |
| `UiPopover` | - | Click-triggered popover |

### Display Components
| Component | Props | Notes |
|-----------|-------|-------|
| `UiCard` | - | Card container |
| `UiBadge` | `variant` | Status badge |
| `UiAvatar` | - | User avatar |
| `UiTable` | - | Data table |
| `UiAlert` | - | Alert/message |
| `UiSkeleton` | - | Loading placeholder |
| `UiProgress` | - | Progress bar |

### Navigation Components
| Component | Props | Notes |
|-----------|-------|-------|
| `UiTabs` | - | Tabbed navigation |
| `UiPagination` | - | Pagination controls |
| `UiDropdownMenu` | - | Dropdown menu |

## Known Issues & Solutions

### Issue: v-model Support Removed (January 2026)

**Problem:** During the Root/Portal migration, `Input` and `Textarea` components lost their `modelValue` and `defaultValue` props.

**Solution:** Re-added proper v-model support with TypeScript types:
```typescript
const props = defineProps<{
  modelValue?: string | number | null
  defaultValue?: string | number | null
  // ... other props
}>()
```

### Issue: Type Safety Lost in Action Buttons (January 2026)

**Problem:** `AlertDialogAction` and `AlertDialogCancel` were changed to raw `<button>` elements, losing reka-ui props and accessibility features.

**Solution:** Restored reka-ui wrapper components:
```vue
<AlertDialogAction v-bind="forwarded" :class="cn(buttonVariants(), props.class)">
  <slot />
</AlertDialogAction>
```

### Issue: ResizeObserver in Tests (January 2026)

**Problem:** Filter components using `useSize()` from reka-ui failed in tests with "ResizeObserver is not defined".

**Solution:** Added polyfill in `tests/setup/vitest.setup.ts`:
```typescript
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
```

## Color Scheme

As of January 2026, the project uses **shadcn-vue's default slate theme**:

| CSS Variable | Value | Usage |
|--------------|-------|-------|
| `--primary` | `hsl(222.2 47.4% 11.2%)` | Primary buttons, links |
| `--secondary` | `hsl(210 40% 96.1%)` | Secondary buttons |
| `--destructive` | `hsl(0 84.2% 60.2%)` | Delete/danger actions |
| `--background` | `hsl(0 0% 100%)` | Page background |
| `--foreground` | `hsl(222.2 47.4% 11.2%)` | Primary text |

## Component Conventions

1. **Use shadcn-vue components, not raw HTML:**
   - ✅ `<UiButton>` instead of `<button>`
   - ✅ `<UiInput>` instead of `<input>`
   - ✅ `<UiLabel>` instead of `<label>`

2. **Always use `v-model:open` for dialogs:**
   - ✅ `<UiDialog v-model:open="isOpen">`
   - ❌ `<UiDialog :open="isOpen" @update:open="isOpen = $event">`

3. **Forward props properly:**
   - Always use `useForwardProps` or `useForwardPropsEmits`
   - Exclude `class` from forwarded props

## Related Documentation

- [CHANGELOG.md](../../CHANGELOG.md) - Recent changes to UI components
- [CODE_DESIGN_PRINCIPLES.md](../../development/CODE_DESIGN_PRINCIPLES.md) - Component design guidelines
