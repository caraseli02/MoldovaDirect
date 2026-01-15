# Accessibility Refactoring Implementation Plan

## Overview

[Add high-level overview here]

## Transforming PR #258 into Sustainable Architecture

**Related:** PR #258 Architecture Review
**Priority:** HIGH - Should block PR merge
**Effort:** 9 hours upfront, saves 200+ hours long-term
**Status:** PROPOSED

---

## Executive Summary

This plan provides step-by-step instructions to refactor PR #258's accessibility improvements from duplicated code into a sustainable, maintainable architecture using composables and shared components.

**Goals:**
1. Reduce code duplication from 70% to <20%
2. Establish consistent accessibility patterns
3. Create reusable components and composables
4. Document standards for future development

---

## Phase 1: Foundation (3 hours)

### Step 1.1: Create Accessibility Constants (30 min)

**File:** `constants/accessibility.ts`

```typescript
/**
 * Accessibility Constants
 * Centralized WCAG compliance standards
 */

/**
 * Touch Target Standards (WCAG 2.1 Level AAA)
 * Minimum size: 44x44 pixels
 */
export const TOUCH_TARGET = {
  MIN_SIZE: 44, // pixels
  CLASSES: 'min-h-[44px] min-w-[44px]',
} as const

/**
 * Focus Ring Styles
 * Consistent focus indicators for keyboard navigation
 */
export const FOCUS_STYLES = {
  PRIMARY: 'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  DESTRUCTIVE: 'focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
  SECONDARY: 'focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
  NONE: 'focus-visible:outline-none',
} as const

/**
 * ARIA Live Region Politeness Levels
 */
export const LIVE_REGION = {
  POLITE: 'polite' as const,
  ASSERTIVE: 'assertive' as const,
  OFF: 'off' as const,
} as const

/**
 * Common ARIA Roles
 */
export const ARIA_ROLES = {
  DIALOG: 'dialog' as const,
  ALERT: 'alert' as const,
  STATUS: 'status' as const,
  REGION: 'region' as const,
  LIST: 'list' as const,
  LISTITEM: 'listitem' as const,
  BUTTON: 'button' as const,
  SEARCHBOX: 'searchbox' as const,
} as const

/**
 * Minimum Color Contrast Ratios (WCAG 2.1 Level AA)
 */
export const CONTRAST = {
  NORMAL_TEXT: 4.5,
  LARGE_TEXT: 3.0,
  UI_COMPONENTS: 3.0,
} as const

// Type exports
export type FocusStyle = typeof FOCUS_STYLES[keyof typeof FOCUS_STYLES]
export type LiveRegionPoliteness = typeof LIVE_REGION[keyof typeof LIVE_REGION]
export type AriaRole = typeof ARIA_ROLES[keyof typeof ARIA_ROLES]
```

**Update:** `constants/products.ts` to reference accessibility constants

```typescript
import { TOUCH_TARGET } from './accessibility'

export const PRODUCTS = {
  // ... existing constants

  // Touch Targets (Accessibility) - REFERENCE ONLY
  // Use TOUCH_TARGET from ~/constants/accessibility instead
  MIN_TOUCH_TARGET_SIZE: TOUCH_TARGET.MIN_SIZE,
} as const
```

---

### Step 1.2: Create Core Accessibility Composable (2 hours)

**File:** `composables/useAccessibility.ts`

```typescript
import { computed, type Ref } from 'vue'
import {
  TOUCH_TARGET,
  FOCUS_STYLES,
  ARIA_ROLES,
  LIVE_REGION,
  type FocusStyle,
  type LiveRegionPoliteness
} from '~/constants/accessibility'

export interface ButtonAccessibilityOptions {
  busy?: boolean | Ref<boolean>
  disabled?: boolean | Ref<boolean>
  expanded?: boolean | Ref<boolean>
  variant?: 'primary' | 'destructive' | 'secondary'
}

export interface InputAccessibilityOptions {
  invalid?: boolean | Ref<boolean>
  errorId?: string
  describedBy?: string | string[]
  helpTextId?: string
}

export interface DialogAccessibilityOptions {
  titleId: string
  descriptionId?: string
}

export interface ErrorAccessibilityOptions {
  id: string
  live?: boolean
  politeness?: LiveRegionPoliteness
}

/**
 * Composable for consistent accessibility patterns
 * Provides helpers for WCAG 2.1 AA compliance
 *
 * @example
 * const { buttonProps, inputProps } = useAccessibility()
 *
 * <button v-bind="buttonProps('Delete', { variant: 'destructive' })">
 *   Delete
 * </button>
 */
export function useAccessibility() {
  /**
   * Generate accessible button properties
   *
   * @param label - Accessible label for screen readers
   * @param options - Button state options
   * @returns Object with aria-* attributes and classes
   */
  const buttonProps = (
    label: string,
    options: ButtonAccessibilityOptions = {}
  ) => {
    const busy = unref(options.busy) ?? false
    const disabled = unref(options.disabled) ?? false
    const expanded = unref(options.expanded)

    return {
      'aria-label': label,
      'aria-busy': busy || undefined,
      'aria-disabled': disabled || undefined,
      'aria-expanded': expanded !== undefined ? expanded : undefined,
      class: getTouchTargetClasses(options.variant),
    }
  }

  /**
   * Generate accessible form input properties
   *
   * @param fieldName - Field identifier
   * @param options - Input state options
   * @returns Object with aria-* attributes
   */
  const inputProps = (
    fieldName: string,
    options: InputAccessibilityOptions = {}
  ) => {
    const invalid = unref(options.invalid) ?? false
    const describedByArray = [
      invalid && options.errorId,
      options.helpTextId,
      ...(Array.isArray(options.describedBy)
        ? options.describedBy
        : options.describedBy
        ? [options.describedBy]
        : []),
    ].filter(Boolean)

    return {
      'aria-invalid': invalid || undefined,
      'aria-describedby': describedByArray.length > 0
        ? describedByArray.join(' ')
        : undefined,
    }
  }

  /**
   * Generate accessible modal dialog properties
   *
   * @param titleId - ID of the dialog title element
   * @param descriptionId - ID of the dialog description element (optional)
   * @returns Object with dialog aria-* attributes
   */
  const dialogProps = (titleId: string, descriptionId?: string) => {
    return {
      role: ARIA_ROLES.DIALOG,
      'aria-modal': 'true',
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId || undefined,
    }
  }

  /**
   * Generate accessible error message properties
   *
   * @param id - Unique ID for the error message
   * @param live - Whether to announce dynamically
   * @param politeness - Live region politeness level
   * @returns Object with error aria-* attributes
   */
  const errorProps = (
    id: string,
    live: boolean = false,
    politeness: LiveRegionPoliteness = LIVE_REGION.POLITE
  ) => {
    return {
      id,
      role: ARIA_ROLES.ALERT,
      'aria-live': live ? politeness : undefined,
      'aria-atomic': live ? 'true' : undefined,
    }
  }

  /**
   * Generate accessible loading state properties
   *
   * @param label - Accessible label for loading state
   * @returns Object with loading aria-* attributes
   */
  const loadingProps = (label: string) => {
    return {
      role: ARIA_ROLES.STATUS,
      'aria-label': label,
      'aria-live': LIVE_REGION.POLITE,
    }
  }

  /**
   * Generate accessible list properties
   *
   * @param label - Accessible label for the list (optional)
   * @returns Object with list aria-* attributes
   */
  const listProps = (label?: string) => {
    return {
      role: ARIA_ROLES.LIST,
      'aria-label': label || undefined,
    }
  }

  /**
   * Get touch target and focus classes
   *
   * @param variant - Visual variant of the component
   * @returns Combined class string
   */
  const getTouchTargetClasses = (
    variant: 'primary' | 'destructive' | 'secondary' = 'primary'
  ): string => {
    const focusStyle =
      variant === 'destructive'
        ? FOCUS_STYLES.DESTRUCTIVE
        : variant === 'secondary'
        ? FOCUS_STYLES.SECONDARY
        : FOCUS_STYLES.PRIMARY

    return `${TOUCH_TARGET.CLASSES} ${focusStyle}`
  }

  /**
   * Generate ID for associated elements (error, help text, etc.)
   *
   * @param fieldName - Base field name
   * @param suffix - Suffix for the ID (e.g., 'error', 'help')
   * @returns Generated ID string
   */
  const generateId = (fieldName: string, suffix: string): string => {
    return `${fieldName}-${suffix}`
  }

  return {
    // Property generators
    buttonProps,
    inputProps,
    dialogProps,
    errorProps,
    loadingProps,
    listProps,

    // Utility functions
    getTouchTargetClasses,
    generateId,

    // Constants (re-export for convenience)
    TOUCH_TARGET,
    FOCUS_STYLES,
    ARIA_ROLES,
    LIVE_REGION,
  }
}
```

---

### Step 1.3: Create Form Accessibility Composable (30 min)

**File:** `composables/useFormAccessibility.ts`

```typescript
import { computed, type Ref } from 'vue'
import { useAccessibility } from './useAccessibility'

export interface FormFieldState {
  value: Ref<string>
  error: Ref<string | null>
  touched: Ref<boolean>
}

/**
 * Specialized composable for form field accessibility
 * Builds on useAccessibility with form-specific helpers
 */
export function useFormAccessibility() {
  const { inputProps, errorProps, generateId } = useAccessibility()

  /**
   * Get complete accessibility props for a form field
   *
   * @param fieldName - Field identifier
   * @param state - Field reactive state
   * @param helpTextId - Optional help text ID
   * @returns Combined input and error props
   */
  const fieldProps = (
    fieldName: string,
    state: FormFieldState,
    helpTextId?: string
  ) => {
    const errorId = generateId(fieldName, 'error')
    const hasError = computed(() => state.touched.value && !!state.error.value)

    return {
      input: computed(() =>
        inputProps(fieldName, {
          invalid: hasError.value,
          errorId: hasError.value ? errorId : undefined,
          helpTextId,
        })
      ),
      error: computed(() =>
        hasError.value ? errorProps(errorId, true) : null
      ),
      hasError,
      errorId,
    }
  }

  /**
   * Generate form-level accessibility attributes
   *
   * @param formId - Unique form identifier
   * @param labelId - ID of form title/label
   * @returns Form accessibility attributes
   */
  const formProps = (formId: string, labelId: string) => {
    return {
      id: formId,
      'aria-labelledby': labelId,
      novalidate: true, // Use custom validation
    }
  }

  return {
    fieldProps,
    formProps,
  }
}
```

---

## Phase 2: Shared Components (2.5 hours)

### Step 2.1: Create AccessibleInput Component (1 hour)

**File:** `components/form/AccessibleInput.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useFormAccessibility } from '~/composables/useFormAccessibility'
import UiInput from '~/components/ui/input/Input.vue'
import UiLabel from '~/components/ui/label/Label.vue'

interface Props {
  name: string
  label: string
  modelValue: string
  error?: string
  helpText?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  input: [event: Event]
}>()

const { fieldProps } = useFormAccessibility()

// Create reactive state for accessibility
const touched = ref(false)
const error = computed(() => props.error || null)
const value = computed(() => props.modelValue)

const state = {
  value,
  error,
  touched,
}

const helpTextId = props.helpText
  ? `${props.name}-help`
  : undefined

const accessibility = computed(() =>
  fieldProps(props.name, state, helpTextId)
)

const handleBlur = () => {
  touched.value = true
  emit('blur')
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', event)
}
</script>

<template>
  <div class="space-y-1">
    <UiLabel :for="name" class="block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500" aria-label="required">*</span>
    </UiLabel>

    <UiInput
      :id="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      v-bind="accessibility.input.value"
      @input="handleInput"
      @blur="handleBlur"
    />

    <p
      v-if="helpText && !accessibility.hasError.value"
      :id="helpTextId"
      class="text-sm text-muted-foreground"
    >
      {{ helpText }}
    </p>

    <p
      v-if="accessibility.hasError.value && error"
      v-bind="accessibility.error.value"
      class="text-sm text-destructive"
    >
      {{ error }}
    </p>
  </div>
</template>
```

---

### Step 2.2: Create ErrorMessage Component (30 min)

**File:** `components/form/ErrorMessage.vue`

```vue
<script setup lang="ts">
import { useAccessibility } from '~/composables/useAccessibility'

interface Props {
  /** Unique ID for the error message */
  id: string
  /** Error message text */
  message: string
  /** Whether to announce dynamically via screen reader */
  live?: boolean
  /** Visual variant */
  variant?: 'error' | 'warning' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  live: true,
  variant: 'error',
})

const { errorProps, LIVE_REGION } = useAccessibility()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'error':
      return 'text-destructive bg-destructive/10 border-destructive/20'
    case 'warning':
      return 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    case 'info':
      return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    default:
      return 'text-destructive'
  }
})
</script>

<template>
  <div
    v-bind="errorProps(id, live, LIVE_REGION.POLITE)"
    :class="[
      'text-sm px-3 py-2 rounded-md border',
      variantClasses
    ]"
  >
    <slot>{{ message }}</slot>
  </div>
</template>
```

---

### Step 2.3: Create LiveRegion Component (30 min)

**File:** `components/ui/a11y/LiveRegion.vue`

```vue
<script setup lang="ts">
import { useAccessibility, type LiveRegionPoliteness } from '~/composables/useAccessibility'

interface Props {
  /** Type of announcement */
  type: 'status' | 'alert' | 'loading'
  /** Message to announce */
  message?: string
  /** Politeness level */
  politeness?: LiveRegionPoliteness
  /** Show visual indicator */
  visual?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  politeness: 'polite',
  visual: true,
})

const { ARIA_ROLES, LIVE_REGION } = useAccessibility()

const role = computed(() => {
  switch (props.type) {
    case 'alert':
      return ARIA_ROLES.ALERT
    case 'loading':
    case 'status':
      return ARIA_ROLES.STATUS
    default:
      return ARIA_ROLES.STATUS
  }
})

const ariaProps = computed(() => ({
  role: role.value,
  'aria-live': props.politeness,
  'aria-atomic': 'true',
}))
</script>

<template>
  <div
    v-bind="ariaProps"
    :class="[
      visual ? 'sr-only-if-empty' : 'sr-only'
    ]"
  >
    <slot>{{ message }}</slot>
  </div>
</template>

<style scoped>
/* Screen reader only unless it has content */
.sr-only-if-empty:empty {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

---

### Step 2.4: Create SkipLink Component (30 min)

**File:** `components/ui/a11y/SkipLink.vue`

```vue
<script setup lang="ts">
interface Props {
  /** Target element ID to skip to */
  to: string
  /** Link text */
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Skip to main content',
})
</script>

<template>
  <a
    :href="`#${to}`"
    class="skip-link"
  >
    {{ text }}
  </a>
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  text-decoration: none;
  z-index: 100;
  border-radius: 0 0 0.25rem 0;
  font-weight: 500;
}

.skip-link:focus {
  top: 0;
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
</style>
```

---

## Phase 3: Refactor Existing Components (3 hours)

### Step 3.1: Refactor PaymentForm.vue (1.5 hours)

**Before (Current - 688 lines):**
```vue
<!-- 96 lines of duplicated input patterns -->
<div>
  <UiLabel for="card-number">{{ $t('checkout.payment.cardNumber') }}</UiLabel>
  <UiInput
    id="card-number"
    :value="creditCardData.number"
    :aria-invalid="hasError('cardNumber')"
    :aria-describedby="hasError('cardNumber') ? 'card-number-error' : undefined"
  />
  <p v-if="hasError('cardNumber')" id="card-number-error" role="alert">
    {{ getError('cardNumber') }}
  </p>
</div>
<!-- Repeat for 7 more fields... -->
```

**After (Refactored - ~400 lines):**
```vue
<script setup lang="ts">
import AccessibleInput from '~/components/form/AccessibleInput.vue'
import { useAccessibility } from '~/composables/useAccessibility'

const { FOCUS_STYLES } = useAccessibility()
</script>

<template>
  <!-- Card Number Input - Now 5 lines instead of 12 -->
  <AccessibleInput
    name="card-number"
    :label="$t('checkout.payment.cardNumber')"
    :placeholder="$t('checkout.payment.cardNumberPlaceholder')"
    v-model="creditCardData.number"
    :error="getError('cardNumber')"
    required
    autocomplete="cc-number"
    @input="formatCardNumber"
    @blur="validateCardNumber"
  />

  <!-- Expiry Date - 5 lines instead of 12 -->
  <AccessibleInput
    name="expiry-date"
    :label="$t('checkout.payment.expiryDate')"
    :placeholder="$t('checkout.payment.expiryPlaceholder')"
    v-model="expiryDisplay"
    :error="getError('expiry')"
    required
    autocomplete="cc-exp"
    @input="formatExpiry"
    @blur="validateExpiry"
  />

  <!-- CVV - 5 lines instead of 20 (includes help button) -->
  <AccessibleInput
    name="cvv"
    :label="$t('checkout.payment.cvv')"
    :placeholder="$t('checkout.payment.cvvPlaceholder')"
    v-model="creditCardData.cvv"
    :error="getError('cvv')"
    :help-text="showCVVHelp ? $t('checkout.payment.cvvHelp') : undefined"
    required
    autocomplete="cc-csc"
    @input="formatCVV"
    @blur="validateCVV"
  >
    <template #append>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        :class="FOCUS_STYLES.PRIMARY"
        :aria-label="$t('checkout.payment.cvvHelpLabel')"
        :aria-expanded="showCVVHelp"
        @click="showCVVHelp = !showCVVHelp"
      >
        <commonIcon name="lucide:circle-help" aria-hidden="true" />
      </Button>
    </template>
  </AccessibleInput>

  <!-- Cardholder Name - 5 lines instead of 12 -->
  <AccessibleInput
    name="cardholder-name"
    :label="$t('checkout.payment.cardholderName')"
    :placeholder="$t('checkout.payment.cardholderNamePlaceholder')"
    v-model="creditCardData.holderName"
    :error="getError('holderName')"
    required
    autocomplete="cc-name"
    @blur="validateHolderName"
  />
</template>
```

**Savings:**
- **Lines reduced:** 96 → 32 (67% reduction)
- **Duplication eliminated:** 8 ARIA patterns → 1 component
- **Maintainability:** Update once, applies to all

---

### Step 3.2: Refactor cart/Item.vue (30 min)

**Before:**
```vue
<Button
  :aria-label="$t('cart.decreaseQuantity')"
  class="w-11 h-11"
>
  <svg aria-hidden="true">...</svg>
</Button>
```

**After:**
```vue
<script setup>
import { useAccessibility } from '~/composables/useAccessibility'
const { buttonProps } = useAccessibility()
</script>

<template>
  <Button
    v-bind="buttonProps($t('cart.decreaseQuantity'), {
      disabled: loading || item.quantity <= 1
    })"
    @click="updateQuantity(item.quantity - 1)"
  >
    <svg aria-hidden="true">...</svg>
  </Button>
</template>
```

---

### Step 3.3: Refactor NewsletterSignup.vue (30 min)

**Before:**
```vue
<div role="status" aria-live="polite" aria-atomic="true">
  <p v-if="submitted" id="newsletter-success">{{ t('home.newsletter.success') }}</p>
  <p v-if="error" id="newsletter-error" role="alert">{{ error }}</p>
</div>
```

**After:**
```vue
<script setup>
import LiveRegion from '~/components/ui/a11y/LiveRegion.vue'
</script>

<template>
  <LiveRegion v-if="submitted" type="status" :message="t('home.newsletter.success')" />
  <LiveRegion v-if="error" type="alert" :message="error" politeness="assertive" />
</template>
```

---

### Step 3.4: Refactor DeleteAccountModal.vue (30 min)

**Before:**
```vue
<div
  class="fixed inset-0"
  role="dialog"
  aria-modal="true"
  aria-labelledby="delete-account-title"
  aria-describedby="delete-account-description"
>
  <!-- modal content -->
</div>
```

**After:**
```vue
<script setup>
import { useAccessibility } from '~/composables/useAccessibility'
const { dialogProps } = useAccessibility()
</script>

<template>
  <div
    class="fixed inset-0"
    v-bind="dialogProps('delete-account-title', 'delete-account-description')"
  >
    <h3 id="delete-account-title">{{ $t('profile.deleteAccount') }}</h3>
    <p id="delete-account-description">{{ $t('profile.deleteAccountWarning') }}</p>
    <!-- modal content -->
  </div>
</template>
```

---

## Phase 4: Documentation (30 min)

### Step 4.1: Create Accessibility Guidelines

**File:** `docs/development/ACCESSIBILITY_GUIDELINES.md`

```markdown
# Accessibility Development Guidelines

## Quick Reference

### Touch Targets
```vue
import { TOUCH_TARGET } from '~/constants/accessibility'

<Button :class="TOUCH_TARGET.CLASSES" />
```

### Form Inputs
```vue
<AccessibleInput
  name="email"
  :label="$t('form.email')"
  v-model="email"
  :error="errors.email"
  required
/>
```

### Error Messages
```vue
<LiveRegion v-if="error" type="alert" :message="error" />
```

### Modal Dialogs
```vue
<script setup>
const { dialogProps } = useAccessibility()
</script>

<template>
  <div v-bind="dialogProps('modal-title', 'modal-desc')">
    <h2 id="modal-title">Title</h2>
    <p id="modal-desc">Description</p>
  </div>
</template>
```

## WCAG Compliance Checklist

- [ ] All interactive elements have minimum 44x44px touch targets
- [ ] All form inputs have associated labels
- [ ] Error messages are linked with aria-describedby
- [ ] Loading states announced to screen readers
- [ ] Focus indicators visible for keyboard navigation
- [ ] Modal dialogs have proper aria-labelledby/describedby
- [ ] Decorative icons marked with aria-hidden="true"
- [ ] Dynamic content changes announced with live regions
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `constants/accessibility.ts`
- [ ] Create `composables/useAccessibility.ts`
- [ ] Create `composables/useFormAccessibility.ts`
- [ ] Add tests for composables

### Phase 2: Components
- [ ] Create `components/form/AccessibleInput.vue`
- [ ] Create `components/form/ErrorMessage.vue`
- [ ] Create `components/ui/a11y/LiveRegion.vue`
- [ ] Create `components/ui/a11y/SkipLink.vue`
- [ ] Add component tests

### Phase 3: Refactoring
- [ ] Refactor `components/checkout/PaymentForm.vue`
- [ ] Refactor `components/cart/Item.vue`
- [ ] Refactor `components/home/NewsletterSignup.vue`
- [ ] Refactor `components/profile/DeleteAccountModal.vue`
- [ ] Update `components/product/Card.vue`
- [ ] Update `components/product/SearchBar.vue`
- [ ] Update `pages/cart.vue`

### Phase 4: Documentation
- [ ] Create `docs/development/ACCESSIBILITY_GUIDELINES.md`
- [ ] Update component documentation
- [ ] Add examples to Storybook (if applicable)
- [ ] Update PR checklist with accessibility requirements

### Phase 5: Validation
- [ ] Run axe-core accessibility tests
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Test keyboard navigation
- [ ] Verify WCAG 2.1 AA compliance
- [ ] Update architecture review status

---

## Testing Strategy

### Unit Tests
```typescript
// tests/composables/useAccessibility.test.ts
describe('useAccessibility', () => {
  it('generates button props with busy state', () => {
    const { buttonProps } = useAccessibility()
    expect(buttonProps('Delete', { busy: true })).toMatchObject({
      'aria-label': 'Delete',
      'aria-busy': true
    })
  })
})
```

### Component Tests
```typescript
// tests/components/AccessibleInput.test.ts
it('links error message with aria-describedby', async () => {
  const wrapper = mount(AccessibleInput, {
    props: {
      name: 'email',
      label: 'Email',
      modelValue: '',
      error: 'Invalid email'
    }
  })

  await wrapper.find('input').trigger('blur')

  expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  expect(wrapper.find('[role="alert"]').exists()).toBe(true)
})
```

### E2E Tests
```typescript
// tests/e2e/accessibility.spec.ts
test('form inputs have accessible error messages', async ({ page }) => {
  await page.goto('/checkout')
  await page.fill('[name="card-number"]', 'invalid')
  await page.click('button[type="submit"]')

  const input = page.locator('[name="card-number"]')
  const errorId = await input.getAttribute('aria-describedby')
  const error = page.locator(`#${errorId}`)

  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(error).toHaveRole('alert')
})
```

---

## Success Metrics

### Before Refactoring
- Lines of duplicated code: 168
- Components with manual ARIA: 7
- Touch target inconsistencies: 12
- Focus style variations: 3

### After Refactoring
- Lines of duplicated code: <20
- Components using composables: 7
- Touch target consistency: 100%
- Focus style consistency: 100%

### Long-term Impact
- **Code reduction:** 60-70% in accessibility code
- **Consistency:** 95%+ pattern compliance
- **Maintainability:** Single source of truth
- **Developer experience:** Faster feature development

---

## Timeline

| Phase | Duration | Developer Hours |
|-------|----------|-----------------|
| Phase 1: Foundation | Day 1 | 3 hours |
| Phase 2: Components | Day 1-2 | 2.5 hours |
| Phase 3: Refactoring | Day 2-3 | 3 hours |
| Phase 4: Documentation | Day 3 | 0.5 hours |
| **Total** | **3 days** | **9 hours** |

---

## Approval Required

Before proceeding with PR #258 merge:
- [ ] Architecture lead review
- [ ] Accessibility specialist review
- [ ] Team agreement on patterns
- [ ] Testing strategy approval

**Status:** READY FOR IMPLEMENTATION
