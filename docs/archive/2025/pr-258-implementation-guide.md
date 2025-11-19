# PR #258 - Implementation Guide for Recommendations

This guide provides **copy-paste ready code** for implementing the recommendations from the PR #258 analysis.

---

## 1. Formatting Utilities Composable

### Create File: `composables/useFormatting.ts`

```typescript
/**
 * Formatting utilities composable
 * Provides consistent number, currency, and date formatting across the app
 *
 * Usage:
 * const { formatPrice, formatDate, formatNumber } = useFormatting()
 */

export const useFormatting = () => {
  const { locale } = useI18n()

  /**
   * Format price with currency symbol
   * @param price - The price to format
   * @param currency - Currency code (default: EUR)
   * @param decimals - Number of decimal places (default: 2)
   */
  const formatPrice = (
    price: number | string,
    currency = 'EUR',
    decimals = 2
  ): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price

    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(numPrice)
  }

  /**
   * Format date according to current locale
   * @param date - Date to format (Date object or ISO string)
   * @param style - Format style: 'short', 'medium', 'long', 'full'
   */
  const formatDate = (
    date: Date | string,
    style: 'short' | 'medium' | 'long' | 'full' = 'medium'
  ): string => {
    const d = typeof date === 'string' ? new Date(date) : date

    return new Intl.DateTimeFormat(locale.value, {
      dateStyle: style
    }).format(d)
  }

  /**
   * Format date and time according to current locale
   * @param date - Date to format (Date object or ISO string)
   * @param dateStyle - Date format style
   * @param timeStyle - Time format style
   */
  const formatDateTime = (
    date: Date | string,
    dateStyle: 'short' | 'medium' | 'long' = 'medium',
    timeStyle: 'short' | 'medium' | 'long' = 'short'
  ): string => {
    const d = typeof date === 'string' ? new Date(date) : date

    return new Intl.DateTimeFormat(locale.value, {
      dateStyle,
      timeStyle
    }).format(d)
  }

  /**
   * Format number with locale-specific separators
   * @param num - The number to format
   * @param decimals - Number of decimal places
   */
  const formatNumber = (num: number, decimals = 0): string => {
    return new Intl.NumberFormat(locale.value, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  /**
   * Format percentage
   * @param value - The value to format as percentage (0.25 = 25%)
   * @param decimals - Number of decimal places
   */
  const formatPercent = (value: number, decimals = 0): string => {
    return new Intl.NumberFormat(locale.value, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  /**
   * Format distance (in meters) to human-readable format
   * @param meters - Distance in meters
   */
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`
    }
    return `${formatNumber(meters / 1000, 1)} km`
  }

  /**
   * Format file size to human-readable format
   * @param bytes - File size in bytes
   */
  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${formatNumber(size, unitIndex > 0 ? 2 : 0)} ${units[unitIndex]}`
  }

  return {
    formatPrice,
    formatDate,
    formatDateTime,
    formatNumber,
    formatPercent,
    formatDistance,
    formatFileSize
  }
}
```

### Migration Example

**Before:**
```vue
<script setup lang="ts">
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}
</script>

<template>
  <div>{{ formatPrice(item.price) }}</div>
</template>
```

**After:**
```vue
<script setup lang="ts">
const { formatPrice } = useFormatting()
</script>

<template>
  <div>{{ formatPrice(item.price) }}</div>
</template>
```

### Files to Update (29 total)

Run this find/replace script:

```bash
# Find all files with formatPrice
grep -r "const formatPrice" --include="*.vue" components/ pages/ | cut -d: -f1 | sort -u

# For each file, replace:
# OLD: const formatPrice = (price: number) => { ... }
# NEW: const { formatPrice } = useFormatting()
```

---

## 2. LoadingButton Component

### Create File: `components/ui/LoadingButton.vue`

```vue
<template>
  <Button
    v-bind="$attrs"
    :disabled="loading || disabled"
    :aria-busy="loading"
    :aria-label="computedAriaLabel"
    :class="cn('relative', props.class)"
  >
    <!-- Loading State -->
    <span v-if="loading" class="flex items-center justify-center">
      <slot name="loading-icon">
        <svg
          class="animate-spin h-5 w-5"
          :class="{ 'mr-2': loadingText || $slots['loading-text'] }"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="status"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </slot>
      <slot name="loading-text">
        {{ loadingText || $t('common.loading') }}
      </slot>
    </span>

    <!-- Normal State -->
    <span v-else class="flex items-center justify-center">
      <slot name="icon" />
      <slot />
    </span>
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  loading?: boolean
  disabled?: boolean
  loadingText?: string
  loadingLabel?: string
  ariaLabel?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  loadingText: '',
  loadingLabel: '',
  ariaLabel: '',
  class: ''
})

const { t } = useI18n()

const computedAriaLabel = computed(() => {
  if (props.loading && props.loadingLabel) {
    return props.loadingLabel
  }
  if (props.loading) {
    return t('common.loading')
  }
  return props.ariaLabel
})
</script>
```

### Usage Examples

**Basic Usage:**
```vue
<LoadingButton :loading="isSubmitting">
  Submit
</LoadingButton>
```

**With Custom Loading Text:**
```vue
<LoadingButton
  :loading="isSubmitting"
  :loading-text="$t('common.processing')"
  :aria-label="$t('forms.submit')"
>
  Submit Form
</LoadingButton>
```

**With Icon:**
```vue
<LoadingButton :loading="isSaving">
  <template #icon>
    <Icon name="lucide:save" class="mr-2 h-4 w-4" />
  </template>
  Save Changes
</LoadingButton>
```

**With Custom Loading Icon:**
```vue
<LoadingButton :loading="isUploading">
  <template #loading-icon>
    <Icon name="lucide:upload-cloud" class="mr-2 h-4 w-4 animate-pulse" />
  </template>
  <template #loading-text>Uploading...</template>
  Upload File
</LoadingButton>
```

### Migration Examples

**Newsletter Signup (Before):**
```vue
<UiButton
  type="submit"
  :disabled="loading"
  :aria-label="$t('home.newsletter.subscribeButton')"
  :aria-busy="loading"
>
  <commonIcon v-if="!loading" name="lucide:send" class="mr-2 h-5 w-5" />
  <commonIcon v-else name="lucide:loader-2" class="mr-2 h-5 w-5 animate-spin" />
  {{ loading ? $t('common.loading') : $t('home.newsletter.cta') }}
</UiButton>
```

**Newsletter Signup (After):**
```vue
<LoadingButton
  type="submit"
  :loading="loading"
  :loading-text="$t('common.loading')"
  :aria-label="$t('home.newsletter.subscribeButton')"
>
  <template #icon>
    <commonIcon name="lucide:send" class="mr-2 h-5 w-5" />
  </template>
  {{ $t('home.newsletter.cta') }}
</LoadingButton>
```

**Delete Account Modal (Before):**
```vue
<Button
  type="submit"
  :disabled="isLoading"
  :aria-label="$t('profile.confirmDelete')"
  :aria-busy="isLoading"
>
  <span v-if="isLoading">
    <commonIcon name="lucide:loader-2" class="animate-spin h-4 w-4 mr-2" />
    {{ $t('common.loading') }}
  </span>
  <span v-else>{{ $t('profile.confirmDelete') }}</span>
</Button>
```

**Delete Account Modal (After):**
```vue
<LoadingButton
  type="submit"
  variant="destructive"
  :loading="isLoading"
  :aria-label="$t('profile.confirmDelete')"
>
  {{ $t('profile.confirmDelete') }}
</LoadingButton>
```

---

## 3. Localization Helper

### Add to File: `lib/utils.ts`

```typescript
/**
 * Get localized text from a multi-language object
 * Falls back through locale chain: current -> fallback -> first available
 *
 * @param text - Multi-language text object { es: '...', en: '...', ro: '...', ru: '...' }
 * @param locale - Current locale code
 * @param fallbackLocale - Fallback locale (default: 'es')
 * @returns Localized string or empty string
 *
 * @example
 * const name = { es: 'Vino Tinto', en: 'Red Wine', ro: 'Vin Roșu' }
 * getLocalizedText(name, 'en') // 'Red Wine'
 * getLocalizedText(name, 'fr') // 'Vino Tinto' (fallback to Spanish)
 * getLocalizedText(null, 'en') // ''
 */
export function getLocalizedText(
  text: Record<string, string> | null | undefined,
  locale: string,
  fallbackLocale = 'es'
): string {
  if (!text) return ''

  // Try current locale
  if (text[locale]) return text[locale]

  // Try fallback locale
  if (text[fallbackLocale]) return text[fallbackLocale]

  // Return first available value
  const values = Object.values(text)
  return values.length > 0 ? values[0] : ''
}

/**
 * Composable version with automatic locale detection
 *
 * @example
 * const { getLocalizedText } = useLocalization()
 * const productName = getLocalizedText(product.name)
 */
export const useLocalization = () => {
  const { locale } = useI18n()

  const getText = (text: Record<string, string> | null | undefined): string => {
    return getLocalizedText(text, locale.value)
  }

  return {
    getLocalizedText: getText
  }
}
```

### Migration Example

**Before:**
```vue
<script setup lang="ts">
const { locale } = useI18n()

const getLocalizedText = (text: Record<string, string> | null | undefined) => {
  if (!text) return ''
  return text[locale.value] || text.es || Object.values(text)[0] || ''
}
</script>

<template>
  <h3>{{ getLocalizedText(product.name) }}</h3>
  <p>{{ getLocalizedText(product.description) }}</p>
</template>
```

**After (Option 1 - Composable):**
```vue
<script setup lang="ts">
const { getLocalizedText } = useLocalization()
</script>

<template>
  <h3>{{ getLocalizedText(product.name) }}</h3>
  <p>{{ getLocalizedText(product.description) }}</p>
</template>
```

**After (Option 2 - Utility Function):**
```vue
<script setup lang="ts">
import { getLocalizedText } from '@/lib/utils'

const { locale } = useI18n()
const getText = (text: Record<string, string> | null | undefined) => {
  return getLocalizedText(text, locale.value)
}
</script>

<template>
  <h3>{{ getText(product.name) }}</h3>
  <p>{{ getText(product.description) }}</p>
</template>
```

---

## 4. FormField Component

### Create File: `components/ui/FormField.vue`

```vue
<template>
  <div class="space-y-2" :class="props.class">
    <!-- Label -->
    <UiLabel
      v-if="label"
      :for="id"
      :class="labelClass"
    >
      {{ label }}
      <span v-if="required" class="text-destructive ml-1" aria-label="required">*</span>
    </UiLabel>

    <!-- Input slot with error props -->
    <slot
      :error-id="errorId"
      :hint-id="hintId"
      :has-error="hasError"
      :describedby="describedby"
    />

    <!-- Error message -->
    <p
      v-if="hasError"
      :id="errorId"
      class="text-sm text-destructive"
      role="alert"
    >
      {{ error }}
    </p>

    <!-- Hint text -->
    <p
      v-else-if="hint"
      :id="hintId"
      class="text-sm text-muted-foreground"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id: string
  label?: string
  error?: string
  hint?: string
  required?: boolean
  labelClass?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  error: '',
  hint: '',
  required: false,
  labelClass: '',
  class: ''
})

const hasError = computed(() => !!props.error)
const errorId = computed(() => `${props.id}-error`)
const hintId = computed(() => `${props.id}-hint`)

const describedby = computed(() => {
  if (hasError.value) return errorId.value
  if (props.hint) return hintId.value
  return undefined
})
</script>
```

### Usage Examples

**Basic Text Input:**
```vue
<FormField
  id="email"
  :label="$t('auth.email')"
  :error="errors.email"
  :hint="$t('auth.emailHint')"
  required
>
  <template #default="{ errorId, hasError, describedby }">
    <UiInput
      id="email"
      v-model="form.email"
      type="email"
      :aria-invalid="hasError"
      :aria-describedby="describedby"
      autocomplete="email"
    />
  </template>
</FormField>
```

**Select Field:**
```vue
<FormField
  id="country"
  :label="$t('address.country')"
  :error="errors.country"
  required
>
  <template #default="{ errorId, hasError, describedby }">
    <select
      id="country"
      v-model="form.country"
      :aria-invalid="hasError"
      :aria-describedby="describedby"
    >
      <option value="">{{ $t('address.selectCountry') }}</option>
      <option value="ES">Spain</option>
      <option value="RO">Romania</option>
    </select>
  </template>
</FormField>
```

**Textarea:**
```vue
<FormField
  id="message"
  :label="$t('contact.message')"
  :error="errors.message"
  :hint="$t('contact.messageHint')"
>
  <template #default="{ describedby }">
    <textarea
      id="message"
      v-model="form.message"
      :aria-describedby="describedby"
      rows="4"
    />
  </template>
</FormField>
```

### Migration Example (Payment Form)

**Before:**
```vue
<div>
  <UiLabel for="card-number" class="mb-1">
    {{ $t('checkout.payment.cardNumber') }}
  </UiLabel>
  <UiInput
    id="card-number"
    type="text"
    :value="creditCardData.number"
    :aria-invalid="hasError('cardNumber')"
    :aria-describedby="hasError('cardNumber') ? 'card-number-error' : undefined"
    @input="formatCardNumber"
  />
  <p v-if="hasError('cardNumber')" id="card-number-error" role="alert">
    {{ getError('cardNumber') }}
  </p>
</div>
```

**After:**
```vue
<FormField
  id="card-number"
  :label="$t('checkout.payment.cardNumber')"
  :error="getError('cardNumber')"
>
  <template #default="{ describedby, hasError }">
    <UiInput
      id="card-number"
      :value="creditCardData.number"
      :aria-invalid="hasError"
      :aria-describedby="describedby"
      @input="formatCardNumber"
    />
  </template>
</FormField>
```

---

## 5. Split PaymentForm Component

### New Structure

```
components/checkout/
├── PaymentForm.vue (main orchestrator, ~100 lines)
└── payment-methods/
    ├── CashPayment.vue (~80 lines)
    ├── CreditCardPayment.vue (~300 lines)
    ├── PayPalPayment.vue (~100 lines)
    └── BankTransferPayment.vue (~150 lines)
```

### Main PaymentForm.vue

```vue
<template>
  <div class="payment-form">
    <component
      :is="currentPaymentComponent"
      :model-value="modelValue"
      :loading="loading"
      :errors="errors"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { PaymentMethod } from '~/types/checkout'

interface Props {
  modelValue: PaymentMethod
  loading?: boolean
  errors?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  errors: () => ({})
})

defineEmits<{
  (e: 'update:modelValue', value: PaymentMethod): void
}>()

// Lazy load payment method components
const paymentComponents = {
  cash: defineAsyncComponent(() => import('./payment-methods/CashPayment.vue')),
  credit_card: defineAsyncComponent(() => import('./payment-methods/CreditCardPayment.vue')),
  paypal: defineAsyncComponent(() => import('./payment-methods/PayPalPayment.vue')),
  bank_transfer: defineAsyncComponent(() => import('./payment-methods/BankTransferPayment.vue'))
}

const currentPaymentComponent = computed(() => {
  return paymentComponents[props.modelValue.type] || paymentComponents.cash
})
</script>
```

### Example: CashPayment.vue

```vue
<template>
  <div class="space-y-4">
    <div class="text-center py-8">
      <commonIcon name="lucide:banknote" class="h-16 w-16 text-green-600 mx-auto mb-4" aria-hidden="true" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('checkout.payment.cash.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ $t('checkout.payment.cash.description') }}
      </p>
    </div>

    <!-- Cash Payment Instructions -->
    <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6" role="region" aria-labelledby="cash-instructions-title">
      <h4 id="cash-instructions-title" class="text-md font-semibold text-green-900 dark:text-green-100 mb-4">
        {{ $t('checkout.payment.cashInstructions') }}
      </h4>

      <ul class="space-y-3 text-sm text-green-800 dark:text-green-200" role="list">
        <li v-for="i in 4" :key="i" class="flex items-start space-x-2">
          <commonIcon name="lucide:check-circle-2" class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{{ $t(`checkout.payment.cashInstruction${i}`) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import type { PaymentMethod } from '~/types/checkout'

interface Props {
  modelValue: PaymentMethod
  loading?: boolean
  errors?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  errors: () => ({})
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: PaymentMethod): void
}>()

// Auto-confirm cash payment on mount
onMounted(() => {
  emit('update:modelValue', {
    ...props.modelValue,
    cash: { confirmed: true }
  })
})
</script>
```

---

## 6. Test Examples

### Accessibility Test Template

```typescript
// tests/accessibility/aria-compliance.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

describe('ARIA Compliance', () => {
  describe('Buttons', () => {
    it('all buttons should have accessible names', () => {
      const wrapper = mount(Component)
      const buttons = wrapper.findAll('button')

      buttons.forEach(button => {
        const hasAccessibleName =
          button.attributes('aria-label') ||
          button.text().trim() ||
          button.find('[aria-label]').exists()

        expect(hasAccessibleName).toBeTruthy()
      })
    })

    it('loading buttons should have aria-busy', async () => {
      const wrapper = mount(LoadingButton, {
        props: { loading: true }
      })

      expect(wrapper.attributes('aria-busy')).toBe('true')
    })
  })

  describe('Form Fields', () => {
    it('errors should be associated with fields', () => {
      const wrapper = mount(FormField, {
        props: {
          id: 'email',
          error: 'Invalid email'
        }
      })

      const input = wrapper.find('input')
      const errorId = input.attributes('aria-describedby')
      const errorMessage = wrapper.find(`#${errorId}`)

      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.attributes('role')).toBe('alert')
    })
  })

  describe('Touch Targets', () => {
    it('interactive elements should meet 44x44px minimum', () => {
      const wrapper = mount(Component)
      const interactive = wrapper.findAll('button, a, input[type="button"]')

      interactive.forEach(el => {
        const classes = el.classes()
        const hasMinHeight = classes.some(c => c.includes('min-h-[44px]'))
        expect(hasMinHeight).toBe(true)
      })
    })
  })
})
```

---

## Implementation Checklist

### Phase 1: Quick Wins (Sprint 1)
- [ ] Create `composables/useFormatting.ts`
- [ ] Update 29 files to use `useFormatting()`
- [ ] Create `components/ui/LoadingButton.vue`
- [ ] Update 10+ files to use `LoadingButton`
- [ ] Add tests for new utilities

### Phase 2: Medium Effort (Sprint 2)
- [ ] Add `getLocalizedText` to `lib/utils.ts`
- [ ] Create `useLocalization` composable
- [ ] Update 14 files with localization helper
- [ ] Create `components/ui/FormField.vue`
- [ ] Update forms to use `FormField`

### Phase 3: Long-term (Sprint 3)
- [ ] Split `PaymentForm.vue` into sub-components
- [ ] Create payment method components
- [ ] Add comprehensive accessibility tests
- [ ] Document new patterns in team wiki

---

## Validation Script

Run this after implementation to verify improvements:

```bash
#!/bin/bash

echo "Checking implementation progress..."

# Check for formatting utility
if [ -f "composables/useFormatting.ts" ]; then
  echo "✅ useFormatting composable created"
else
  echo "❌ Missing useFormatting composable"
fi

# Check for LoadingButton
if [ -f "components/ui/LoadingButton.vue" ]; then
  echo "✅ LoadingButton component created"
else
  echo "❌ Missing LoadingButton component"
fi

# Count formatPrice usage
OLD_COUNT=$(grep -r "const formatPrice = " --include="*.vue" . | wc -l)
echo "Remaining formatPrice duplications: $OLD_COUNT (target: 0)"

# Count LoadingButton usage
NEW_COUNT=$(grep -r "LoadingButton" --include="*.vue" . | wc -l)
echo "LoadingButton usage count: $NEW_COUNT (target: 10+)"

echo "Implementation check complete!"
```

---

## Support and Questions

If you have questions while implementing these recommendations:

1. Review the full analysis: `docs/pr-258-code-analysis.md`
2. Check existing composables for patterns: `composables/`
3. Review UI components for consistency: `components/ui/`
4. Test thoroughly with accessibility tools (Lighthouse, axe)

**Remember:** These are recommendations, not requirements. Implement at your own pace while maintaining code quality.
