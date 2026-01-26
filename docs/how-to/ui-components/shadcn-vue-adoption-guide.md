# shadcn-vue UI Component Adoption Guide

**Purpose:** Understand why we use shadcn-vue components and how to work with them correctly.

---

## Table of Contents

1. [Why shadcn-vue?](#why-shadcn-vue)
2. [The Enforcement Rule](#the-enforcement-rule)
3. [Component Reference](#component-reference)
4. [Common Pitfalls](#common-pitfalls)
5. [Migration Checklist](#migration-checklist)

---

## Why shadcn-vue?

### What Is shadcn-vue?

shadcn-vue is **not** a component library you install. It's a **collection of re-usable components** that you copy into your project.

```
Unlike traditional libraries:
  ❌ npm install library-name
  ✅ npx shadcn-vue add button

The component code is YOURS:
  • Modify it however you want
  • No dependency version conflicts
  • Full control over styling
```

### Benefits

| Benefit | Why It Matters |
|---------|----------------|
| **Accessibility** | Built on Reka UI - industry-standard a11y |
| **Type Safety** | Full TypeScript support, typed props/emits |
| **Customizable** | Copy/paste to your project, modify as needed |
| **No Bundle Bloat** | Only import what you use |
| **Consistent Design** | All components follow same patterns |
| **Tree Shakable** | Unused code is eliminated |

### Our Custom Theme

We use the **slate** theme from shadcn-vue:

```css
/* Primary color */
--primary: hsl(222.2 47.4% 11.2%)  /* Dark slate */

/* Secondary */
--secondary: hsl(210 40% 96.1%)   /* Light gray */

/* Destructive */
--destructive: hsl(0 84.2% 60.2%) /* Red for delete/danger */
```

---

## The Enforcement Rule

### ESLint Rule

We have an ESLint rule that **prevents raw HTML form elements**:

```javascript
// eslint.config.mjs
'vue/no-restricted-html-elements': ['error', {
  elements: ['button', 'input', 'select', 'textarea', 'label'],
  message: 'Use shadcn-vue components instead of raw HTML elements. ' +
           'See docs/how-to/ui-components/shadcn-vue-adoption-guide.md'
}]
```

### What This Means

**❌ FORBIDDEN:** Raw HTML elements with manual styling

```vue
<!-- ❌ WRONG - This will cause ESLint error -->
<button class="rounded-lg border px-4 py-2 hover:bg-gray-100">
  Click me
</button>

<input
  type="text"
  class="w-full px-4 py-2 border rounded-lg"
  placeholder="Name"
/>

<select class="rounded-lg border">
  <option value="1">Option 1</option>
</select>
```

**✅ CORRECT:** Use shadcn-vue components

```vue
<!-- ✅ CORRECT -->
<UiButton variant="outline">Click me</UiButton>

<UiInput v-model="name" placeholder="Name" />

<UiSelect v-model="value">
  <UiSelectTrigger>
    <UiSelectValue placeholder="Select..." />
  </UiSelectTrigger>
  <UiSelectContent>
    <UiSelectItem value="1">Option 1</UiSelectItem>
  </UiSelectContent>
</UiSelect>
```

### When Raw HTML IS Allowed

Layout divs and semantic HTML are fine:

```vue
<!-- ✅ ALLOWED - Layout structure -->
<div class="grid grid-cols-2 gap-4">
<div class="flex items-center gap-2">
<div v-if="condition" class="p-4">

<!-- ✅ ALLOWED - Semantic HTML -->
<nav>...</nav>
<main>...</main>
<section>...</section>
<article>...</article>
<header>...</header>
<footer>...</footer>

<!-- ✅ ALLOWED - SVG icons -->
<svg xmlns="http://www.w3.org/2000/svg">...</svg>
```

---

## Component Reference

### Form Components

#### UiButton

```vue
<!-- Basic button -->
<UiButton>Click me</UiButton>

<!-- Variants -->
<UiButton variant="default">Default</UiButton>
<UiButton variant="destructive">Delete</UiButton>
<UiButton variant="outline">Outline</UiButton>
<UiButton variant="secondary">Secondary</UiButton>
<UiButton variant="ghost">Ghost</UiButton>
<UiButton variant="link">Link</UiButton>

<!-- Sizes -->
<UiButton size="default">Default</UiButton>
<UiButton size="sm">Small</UiButton>
<UiButton size="lg">Large</UiButton>
<UiButton size="icon"><Icon name="lucide:check" /></UiButton>

<!-- Disabled -->
<UiButton disabled>Disabled</UiButton>

<!-- Loading state (combine with spinner) -->
<UiButton :disabled="isLoading">
  <Icon v-if="isLoading" name="lucide:loader-2" class="animate-spin" />
  Save
</UiButton>
```

#### UiInput

```vue
<!-- Basic input -->
<UiInput v-model="name" placeholder="Name" />

<!-- Types -->
<UiInput type="text" />
<UiInput type="email" />
<UiInput type="password" />
<UiInput type="number" />
<UiInput type="date" />

<!-- With error -->
<UiInput
  v-model="email"
  type="email"
  :class="{ 'border-red-500': errors.email }"
/>
<span v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</span>

<!-- Disabled -->
<UiInput v-model="name" disabled />
```

#### UiTextarea

```vue
<UiTextarea
  v-model="message"
  placeholder="Your message"
  :rows="4"
/>
```

#### UiSelect

```vue
<UiSelect v-model="selectedValue">
  <UiSelectTrigger>
    <UiSelectValue placeholder="Select an option" />
  </UiSelectTrigger>
  <UiSelectContent>
    <UiSelectItem value="option1">Option 1</UiSelectItem>
    <UiSelectItem value="option2">Option 2</UiSelectItem>
    <UiSelectItem value="option3">Option 3</UiSelectItem>
  </UiSelectContent>
</UiSelect>
```

#### UiCheckbox

```vue
<UiCheckbox
  v-model:checked="agreed"
  :disabled="disabled"
>
  I agree to the terms
</UiCheckbox>

<!-- Array-based selection -->
<UiCheckbox
  :checked="selectedItems.includes(item.id)"
  @update:checked="toggleItem(item.id)"
>
  {{ item.name }}
</UiCheckbox>
```

#### UiLabel

```vue
<!-- Use with for attribute -->
<UiLabel for="name">Name</UiLabel>
<UiInput id="name" v-model="name" />

<!-- With required indicator -->
<UiLabel for="email">
  Email <span class="text-red-500">*</span>
</UiLabel>
<UiInput id="email" v-model="email" type="email" required />
```

### Display Components

#### UiCard

```vue
<UiCard>
  <UiCardHeader>
    <UiCardTitle>Card Title</UiCardTitle>
    <UiCardDescription>Card description goes here</UiCardDescription>
  </UiCardHeader>
  <UiCardContent>
    <p>Card content</p>
  </UiCardContent>
  <UiCardFooter>
    <UiButton>Action</UiButton>
  </UiCardFooter>
</UiCard>
```

#### UiAlert

```vue
<UiAlert variant="default">Default alert</UiAlert>
<UiAlert variant="destructive">Error alert</UiAlert>

<!-- With icon -->
<UiAlert>
  <Icon name="lucide:info" class="h-4 w-4" />
  <UiAlertTitle>Info</UiAlertTitle>
  <UiAlertDescription>Detailed message here.</UiAlertDescription>
</UiAlert>
```

### Dialog Components

#### UiDialog (Modal)

```vue
<script setup lang="ts">
const isOpen = ref(false)
</script>

<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogContent>
      <UiDialogHeader>
        <UiDialogTitle>Dialog Title</UiDialogTitle>
        <UiDialogDescription>
          Dialog description goes here
        </UiDialogDescription>
      </UiDialogHeader>

      <!-- Dialog content -->

      <UiDialogFooter>
        <UiButton variant="outline" @click="isOpen = false">Cancel</UiButton>
        <UiButton @click="confirm">Confirm</UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
```

#### UiSheet (Side Panel)

```vue
<UiSheet v-model:open="isOpen" side="right">
  <UiSheetContent>
    <UiSheetHeader>
      <UiSheetTitle>Sheet Title</UiSheetTitle>
      <UiSheetDescription>
        Sheet description
      </UiSheetDescription>
    </UiSheetHeader>

    <!-- Sheet content -->
  </UiSheetContent>
</UiSheet>
```

---

## Common Pitfalls

### Pitfall 1: Lost v-model Support

**Problem:** After Root/Portal migration, some components lost `v-model` support.

**Symptom:** Input doesn't update when typing.

**Solution:** Ensure `modelValue` and `defaultValue` props are defined:

```typescript
// components/ui/input/Input.vue
const props = defineProps<{
  modelValue?: string | number | null
  defaultValue?: string | number | null
  // ... other props
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()
```

### Pitfall 2: Type Safety Lost

**Problem:** `UiSelect` loses type information for value.

**Symptom:** TypeScript doesn't know your select value type.

**Current workaround:** Use type assertion:

```typescript
const selectedCategoryId = ref<number | undefined>(undefined)

// In template, select works but value is typed as string | number
<UiSelect v-model="selectedCategoryId" />
```

### Pitfall 3: ESLint Violations in components/ui/

**Problem:** The rule flags our own UI components!

**Solution:** Exclude `components/ui/` from the ESLint rule:

```javascript
// eslint.config.mjs
'vue/no-restricted-html-elements': ['error', {
  elements: ['button', 'input', 'select', 'textarea', 'label'],
  message: 'Use shadcn-vue components instead...',
}],
// This rule doesn't apply to components/ui/ directory
```

### Pitfall 4: Wrong Component Name

**Problem:** Using the component instead of the wrapper.

```vue
<!-- ❌ WRONG - Using SelectRoot directly -->
<SelectRoot v-model="value">
  <!-- ... -->
</SelectRoot>

<!-- ✅ CORRECT - Use UiSelect wrapper -->
<UiSelect v-model="value">
  <UiSelectTrigger>
    <UiSelectValue placeholder="..." />
  </UiSelectTrigger>
  <UiSelectContent>
    <!-- ... -->
  </UiSelectContent>
</UiSelect>
```

---

## Migration Checklist

Use this checklist when migrating existing code:

### Phase 1: Audit

```
□ Run ESLint to find violations
□ List all files with violations
□ Categorize by component type (button, input, etc.)
```

### Phase 2: Replace

```
□ Replace <button> with <UiButton>
□ Replace <input> with <UiInput>
□ Replace <select> with <UiSelect>
□ Replace <textarea> with <UiTextarea>
□ Replace <label> with <UiLabel>
```

### Phase 3: Fix v-for Selects

```
□ Check for v-for in select options
□ Use <UiSelectItem> in loop
□ Ensure :value prop is set correctly
```

### Phase 4: Verify

```
□ Test all forms still work
□ Check v-model bindings
□ Test variant classes
□ Run TypeScript check
```

### Example Migration

**Before:**
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <label for="name" class="block mb-2">Name</label>
    <input
      id="name"
      v-model="form.name"
      type="text"
      class="w-full px-4 py-2 border rounded-lg"
      required
    />

    <label for="role" class="block mb-2 mt-4">Role</label>
    <select
      id="role"
      v-model="form.role"
      class="w-full px-4 py-2 border rounded-lg"
    >
      <option value="">Select role</option>
      <option v-for="role in roles" :key="role.id" :value="role.id">
        {{ role.name }}
      </option>
    </select>

    <button
      type="submit"
      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Save
    </button>
  </form>
</template>
```

**After:**
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <div>
        <UiLabel for="name">Name</UiLabel>
        <UiInput
          id="name"
          v-model="form.name"
          type="text"
          required
        />
      </div>

      <div>
        <UiLabel for="role">Role</UiLabel>
        <UiSelect v-model="form.role">
          <UiSelectTrigger>
            <UiSelectValue placeholder="Select role" />
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem
              v-for="role in roles"
              :key="role.id"
              :value="role.id"
            >
              {{ role.name }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>

      <UiButton type="submit">Save</UiButton>
    </div>
  </form>
</template>
```

---

## Adding New Components

When you need a component that doesn't exist yet:

```bash
# Check if it exists in shadcn-vue
npx shadcn-vue add [component-name]

# Examples:
npx shadcn-vue add calendar
npx shadcn-vue add command
npx shadcn-vue add menubar
```

Components will be added to `components/ui/` and are ready to use with the `Ui` prefix.

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [component-library.md](../../reference/components/component-library.md) | Full component API reference |
| [bug-patterns.md](../../reference/bug-patterns.md) | Known issues and fixes |
| [design-guide](../../.claude/skills/design-guide/) | Visual design principles |

---

**Last Updated:** 2026-01-25
**Component Version:** shadcn-vue (reka-ui)
