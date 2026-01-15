# Accessibility Quick Reference

## Overview

[Add high-level overview here]

## Developer Cheat Sheet for WCAG Compliance

**Last Updated:** 2025-11-16
**WCAG Level:** AA (targeting AAA for touch targets)

---

## Quick Links

- **Full Architecture Review:** `docs/architecture/PR_258_ACCESSIBILITY_ARCHITECTURE_REVIEW.md`
- **Implementation Plan:** `docs/architecture/ACCESSIBILITY_REFACTORING_PLAN.md`
- **Constants:** `constants/accessibility.ts` (to be created)
- **Composable:** `composables/useAccessibility.ts` (to be created)

---

## Common Patterns

### 1. Form Inputs with Errors

#### ✅ DO (After Refactoring)
```vue
<script setup>
import AccessibleInput from '~/components/form/AccessibleInput.vue'
</script>

<template>
  <AccessibleInput
    name="email"
    :label="$t('form.email')"
    v-model="email"
    :error="errors.email"
    required
  />
</template>
```

#### ❌ DON'T (Current Pattern)
```vue
<template>
  <UiLabel for="email">{{ $t('form.email') }}</UiLabel>
  <UiInput
    id="email"
    v-model="email"
    :aria-invalid="!!errors.email"
    :aria-describedby="errors.email ? 'email-error' : undefined"
  />
  <p v-if="errors.email" id="email-error" role="alert">
    {{ errors.email }}
  </p>
</template>
```

---

### 2. Buttons with Touch Targets

#### ✅ DO (After Refactoring)
```vue
<script setup>
import { useAccessibility } from '~/composables/useAccessibility'
const { buttonProps } = useAccessibility()
</script>

<template>
  <Button v-bind="buttonProps($t('cart.remove'), { variant: 'destructive' })">
    <Icon name="trash" aria-hidden="true" />
    {{ $t('cart.remove') }}
  </Button>
</template>
```

#### ❌ DON'T (Current Pattern)
```vue
<Button
  :aria-label="$t('cart.remove')"
  class="min-h-[44px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
>
  <Icon name="trash" />
  {{ $t('cart.remove') }}
</Button>
```

---

### 3. Loading States

#### ✅ DO (After Refactoring)
```vue
<script setup>
import LiveRegion from '~/components/ui/a11y/LiveRegion.vue'
</script>

<template>
  <LiveRegion v-if="loading" type="loading" :message="$t('common.loading')" />
</template>
```

#### ❌ DON'T (Current Pattern)
```vue
<div v-if="loading" role="status" :aria-label="$t('common.loading')">
  <svg class="animate-spin" aria-hidden="true">...</svg>
</div>
```

---

### 4. Modal Dialogs

#### ✅ DO (After Refactoring)
```vue
<script setup>
import { useAccessibility } from '~/composables/useAccessibility'
const { dialogProps } = useAccessibility()
</script>

<template>
  <div
    class="modal"
    v-bind="dialogProps('modal-title', 'modal-description')"
  >
    <h2 id="modal-title">{{ $t('modal.title') }}</h2>
    <p id="modal-description">{{ $t('modal.description') }}</p>
  </div>
</template>
```

#### ❌ DON'T (Current Pattern)
```vue
<div
  class="modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">{{ $t('modal.title') }}</h2>
  <p id="modal-description">{{ $t('modal.description') }}</p>
</div>
```

---

### 5. Error Messages

#### ✅ DO (After Refactoring)
```vue
<script setup>
import ErrorMessage from '~/components/form/ErrorMessage.vue'
</script>

<template>
  <ErrorMessage
    v-if="error"
    id="form-error"
    :message="error"
    variant="error"
  />
</template>
```

#### ❌ DON'T (Current Pattern)
```vue
<p
  v-if="error"
  id="form-error"
  role="alert"
  aria-live="polite"
  class="text-destructive"
>
  {{ error }}
</p>
```

---

### 6. Icon-Only Buttons

#### ✅ DO
```vue
<Button :aria-label="$t('actions.close')">
  <Icon name="x" aria-hidden="true" />
</Button>
```

#### ❌ DON'T
```vue
<!-- Missing aria-label -->
<Button>
  <Icon name="x" />
</Button>

<!-- Redundant aria-label on icon -->
<Button>
  <Icon name="x" :aria-label="$t('actions.close')" />
</Button>
```

---

### 7. Decorative Images

#### ✅ DO
```vue
<!-- Decorative - hide from screen readers -->
<img src="decoration.png" alt="" aria-hidden="true" />

<!-- Or for SVG icons -->
<svg aria-hidden="true">...</svg>
<commonIcon name="icon" aria-hidden="true" />
```

#### ❌ DON'T
```vue
<!-- Missing aria-hidden -->
<img src="decoration.png" alt="" />

<!-- Decorative images should not have meaningful alt text -->
<img src="decoration.png" alt="Beautiful pattern" aria-hidden="true" />
```

---

## ARIA Attributes Reference

### States

```vue
<!-- Invalid state for form inputs -->
:aria-invalid="hasError"

<!-- Busy state for loading -->
:aria-busy="isLoading"

<!-- Disabled state (use :disabled instead when possible) -->
:aria-disabled="isDisabled"

<!-- Expanded state for collapsible elements -->
:aria-expanded="isOpen"

<!-- Selected state for selectable items -->
:aria-selected="isSelected"

<!-- Checked state for checkboxes -->
:aria-checked="isChecked"
```

### Relationships

```vue
<!-- Link input to error message -->
:aria-describedby="hasError ? 'input-error' : undefined"

<!-- Link multiple descriptions -->
:aria-describedby="'input-help input-error'"

<!-- Link to title/label -->
:aria-labelledby="'modal-title'"

<!-- Label directly -->
:aria-label="$t('actions.delete')"
```

### Live Regions

```vue
<!-- Polite announcement (wait for user to pause) -->
aria-live="polite"

<!-- Assertive announcement (immediate) -->
aria-live="assertive"

<!-- Announce entire region on change -->
aria-atomic="true"
```

### Roles

```vue
<!-- Modal dialog -->
role="dialog"

<!-- Alert message -->
role="alert"

<!-- Status update -->
role="status"

<!-- Navigation region -->
role="navigation"

<!-- Search form -->
role="search"

<!-- List -->
role="list"
```

---

## Touch Target Sizes

### WCAG Standards

```
Level AA: 24px × 24px minimum
Level AAA: 44px × 44px minimum (our target)
```

### Implementation

#### ✅ DO (After Refactoring)
```vue
<script setup>
import { TOUCH_TARGET } from '~/constants/accessibility'
</script>

<template>
  <Button :class="TOUCH_TARGET.CLASSES">Click me</Button>
</template>
```

#### Current Workaround
```vue
<!-- Use Tailwind classes -->
<Button class="min-h-[44px] min-w-[44px]">Click me</Button>

<!-- Or for square buttons -->
<Button class="h-11 w-11">Icon</Button>
```

---

## Focus Management

### Keyboard Navigation

```vue
<!-- Visible focus indicator (required) -->
<Button class="focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
  Action
</Button>

<!-- Skip to main content -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

### Focus Trap in Modals

```vue
<script setup>
import { useFocusTrap } from '@vueuse/core'

const modalRef = ref()
const { activate, deactivate } = useFocusTrap(modalRef)

onMounted(() => activate())
onUnmounted(() => deactivate())
</script>

<template>
  <div ref="modalRef" role="dialog">
    <!-- Modal content -->
  </div>
</template>
```

---

## Form Validation

### Accessible Error Pattern

```vue
<script setup>
const emailError = ref('')
const touched = ref(false)

const validateEmail = () => {
  touched.value = true
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!isValidEmail(email.value)) {
    emailError.value = 'Email is invalid'
  } else {
    emailError.value = ''
  }
}
</script>

<template>
  <div>
    <label for="email">Email</label>
    <input
      id="email"
      v-model="email"
      type="email"
      :aria-invalid="touched && !!emailError"
      :aria-describedby="emailError ? 'email-error' : undefined"
      @blur="validateEmail"
    />
    <p
      v-if="emailError"
      id="email-error"
      role="alert"
      class="text-destructive"
    >
      {{ emailError }}
    </p>
  </div>
</template>
```

---

## Color Contrast

### Minimum Ratios (WCAG AA)

```
Normal text (< 18pt): 4.5:1
Large text (≥ 18pt or bold ≥ 14pt): 3:1
UI components and graphics: 3:1
```

### Tools

- **Chrome DevTools:** Inspect element → Accessibility
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **axe DevTools:** Browser extension

---

## Testing Checklist

### Manual Testing

- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Test with screen reader (VoiceOver/NVDA/JAWS)
- [ ] Verify all images have appropriate alt text or aria-hidden
- [ ] Check color contrast for all text
- [ ] Test form validation announcements
- [ ] Verify modal focus trap works
- [ ] Test with keyboard only (no mouse)
- [ ] Verify mobile touch targets are 44px minimum

### Automated Testing

```bash
# Run axe-core accessibility tests
npm run test:a11y

# Run Lighthouse accessibility audit
npm run lighthouse

# Run pa11y for WCAG compliance
npm run pa11y
```

---

## Common Mistakes

### ❌ Missing aria-hidden on decorative icons
```vue
<!-- Wrong -->
<svg>...</svg>

<!-- Right -->
<svg aria-hidden="true">...</svg>
```

### ❌ Using aria-label AND text content
```vue
<!-- Wrong - redundant -->
<Button :aria-label="$t('delete')">
  {{ $t('delete') }}
</Button>

<!-- Right - text content is enough -->
<Button>{{ $t('delete') }}</Button>

<!-- Right - icon only needs aria-label -->
<Button :aria-label="$t('delete')">
  <Icon name="trash" aria-hidden="true" />
</Button>
```

### ❌ Missing error message association
```vue
<!-- Wrong - screen reader won't announce error -->
<input v-model="email" />
<p v-if="error">{{ error }}</p>

<!-- Right - linked with aria-describedby -->
<input
  v-model="email"
  :aria-describedby="error ? 'email-error' : undefined"
/>
<p v-if="error" id="email-error" role="alert">{{ error }}</p>
```

### ❌ Insufficient touch target size
```vue
<!-- Wrong - too small for mobile -->
<button class="w-6 h-6">×</button>

<!-- Right - minimum 44px -->
<button class="w-11 h-11">×</button>
```

---

## Resources

### Internal
- Architecture Review: `docs/architecture/PR_258_ACCESSIBILITY_ARCHITECTURE_REVIEW.md`
- Implementation Plan: `docs/architecture/ACCESSIBILITY_REFACTORING_PLAN.md`
- Constants: `constants/accessibility.ts`
- Composables: `composables/useAccessibility.ts`

### External
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **WAI-ARIA Practices:** https://www.w3.org/WAI/ARIA/apg/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **WebAIM:** https://webaim.org/
- **A11y Project:** https://www.a11yproject.com/

### Tools
- **axe DevTools:** Browser extension for testing
- **WAVE:** Web accessibility evaluation tool
- **Lighthouse:** Built into Chrome DevTools
- **Screen Readers:**
  - macOS: VoiceOver (built-in)
  - Windows: NVDA (free) or JAWS
  - Linux: Orca

---

## Getting Help

### Questions?
- Check `docs/architecture/PR_258_ACCESSIBILITY_ARCHITECTURE_REVIEW.md`
- Ask in #accessibility Slack channel
- Tag @accessibility-team in PR

### Found an Accessibility Issue?
1. Create GitHub issue with label `a11y`
2. Include:
   - Component/page affected
   - WCAG criterion violated
   - Steps to reproduce
   - Suggested fix

---

**Last Updated:** 2025-11-16
**Maintained by:** Development Team
**Status:** Living Document
