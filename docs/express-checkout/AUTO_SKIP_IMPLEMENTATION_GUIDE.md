# Auto-Skip Countdown Implementation Guide

**Status**: Implementation blueprint for auto-skip countdown feature  
**Estimated Effort**: 8-12 hours  
**Complexity**: Medium  
**Branch**: Create new branch from feat/checkout-smart-prepopulation

---

## Quick Start

If stakeholders approve auto-skip implementation, follow this guide.

---

## Phase 1: Create Countdown Component (3 hours)

### Step 1.1: Create Component File

**File**: `/components/checkout/AutoSkipCountdown.vue`

```vue
<template>
  <div v-if="isVisible" class="auto-skip-countdown fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md mx-4 animate-slideIn">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ $t('checkout.autoSkip.title', 'Express Checkout Activated') }}
        </h3>
        <button 
          @click="cancel" 
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          :aria-label="$t('common.close', 'Close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Message -->
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        {{ $t('checkout.autoSkip.message', 'Your saved shipping details have been loaded. Redirecting you to payment...') }}
      </p>

      <!-- Countdown Display -->
      <div class="flex items-center justify-center mb-6">
        <div class="relative">
          <!-- Circular progress -->
          <svg class="transform -rotate-90" width="120" height="120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              class="text-gray-200 dark:text-gray-700"
              stroke-width="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              class="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-linear"
              stroke-width="8"
              fill="none"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="progress"
            />
          </svg>
          <!-- Countdown number -->
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {{ countdown }}
            </span>
          </div>
        </div>
      </div>

      <!-- Saved Data Summary -->
      <div class="bg-gray-50 dark:bg-gray-900 rounded-md p-4 mb-6">
        <div class="text-sm">
          <div class="font-medium text-gray-900 dark:text-white mb-2">
            {{ $t('checkout.autoSkip.shippingTo', 'Shipping to:') }}
          </div>
          <div class="text-gray-600 dark:text-gray-400">
            {{ address?.full_name }}<br>
            {{ address?.address }}<br>
            {{ address?.city }}, {{ address?.postal_code }}<br>
            {{ address?.country }}
          </div>
          <div v-if="shippingMethod" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span class="text-gray-600 dark:text-gray-400">
              {{ $t('checkout.autoSkip.method', 'Method') }}:
            </span>
            <span class="ml-1 font-medium text-gray-900 dark:text-white">
              {{ shippingMethod }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          @click="skipNow"
          class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          {{ $t('checkout.autoSkip.skipNow', 'Skip Now') }}
        </button>
        <button
          @click="cancel"
          class="flex-1 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          {{ $t('checkout.autoSkip.cancel', 'Stay Here') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address } from '~/types/checkout'

const props = defineProps<{
  address: Address
  shippingMethod?: string
  initialCountdown?: number
}>()

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'cancel'): void
  (e: 'skip-now'): void
}>()

// State
const isVisible = ref(true)
const countdown = ref(props.initialCountdown || 5)
const circumference = 2 * Math.PI * 54 // Circle radius = 54
const progress = computed(() => {
  const percent = countdown.value / (props.initialCountdown || 5)
  return circumference * (1 - percent)
})

// Timer
let interval: NodeJS.Timeout | null = null

// Methods
const startCountdown = () => {
  interval = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      stopCountdown()
      emit('complete')
    }
  }, 1000)
}

const stopCountdown = () => {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}

const cancel = () => {
  stopCountdown()
  isVisible.value = false
  emit('cancel')
}

const skipNow = () => {
  stopCountdown()
  isVisible.value = false
  emit('skip-now')
}

// Lifecycle
onMounted(() => {
  startCountdown()
  
  // Accessibility: Announce to screen readers
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'alert')
  announcement.setAttribute('aria-live', 'assertive')
  announcement.textContent = 'Express checkout activated. Redirecting to payment in 5 seconds. Press Cancel to stay on this page.'
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 100)
})

onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

/* Prevent body scroll when modal is open */
.auto-skip-countdown {
  position: fixed;
  overflow-y: auto;
}
</style>
```

---

## Phase 2: Add Auto-Skip Logic to ShippingStep (2 hours)

### Step 2.1: Update ShippingStep.vue

**File**: `/components/checkout/ShippingStep.vue`

**Add to imports** (around line 105):
```typescript
const AutoSkipCountdown = defineAsyncComponent(() =>
  import('~/components/checkout/AutoSkipCountdown.vue')
)
```

**Add to template** (around line 15, before ExpressCheckoutBanner):
```vue
<!-- Auto-Skip Countdown Modal -->
<AutoSkipCountdown
  v-if="showAutoSkipCountdown"
  :address="defaultAddress!"
  :shipping-method="checkoutStore.preferences?.preferred_shipping_method"
  @complete="handleAutoSkipComplete"
  @cancel="handleAutoSkipCancel"
  @skip-now="handleAutoSkipComplete"
/>
```

**Add to local state** (around line 171):
```typescript
const showAutoSkipCountdown = ref(false)
const autoSkipTriggered = ref(false)
```

**Add computed property** (around line 196):
```typescript
const shouldAutoSkip = computed(() => {
  // Don't auto-skip if:
  // 1. Not authenticated
  // 2. No default address
  // 3. No preferred shipping method
  // 4. User manually navigated back (check query param)
  // 5. Express banner was dismissed
  // 6. Auto-skip already triggered this session
  
  if (!user.value) return false
  if (!defaultAddress.value) return false
  if (!checkoutStore.preferences?.preferred_shipping_method) return false
  if (route.query.manual === 'true') return false
  if (expressCheckoutDismissed.value) return false
  if (autoSkipTriggered.value) return false
  
  return true
})
```

**Add methods** (around line 206):
```typescript
const handleAutoSkipComplete = async () => {
  showAutoSkipCountdown.value = false
  autoSkipTriggered.value = true
  
  try {
    // Pre-populate shipping info with saved data
    const shippingInfo: ShippingInformation = {
      address: defaultAddress.value!,
      method: {
        id: checkoutStore.preferences!.preferred_shipping_method!,
        name: checkoutStore.preferences!.preferred_shipping_method!,
        price: 0 // Will be updated by backend
      },
      instructions: undefined
    }
    
    await checkoutStore.updateShippingInfo(shippingInfo)
    
    // Navigate to payment step
    await navigateTo(localePath('/checkout/payment'))
  } catch (error) {
    console.error('Auto-skip failed:', error)
    toast.error(
      t('checkout.errors.autoSkipFailed', 'Auto-skip failed'),
      t('checkout.errors.pleaseTryAgain', 'Please try again manually')
    )
  }
}

const handleAutoSkipCancel = () => {
  showAutoSkipCountdown.value = false
  autoSkipTriggered.value = true // Prevent re-triggering
  
  // Show notification
  toast.info(
    t('checkout.autoSkip.cancelled', 'Auto-skip cancelled'),
    t('checkout.autoSkip.reviewDetails', 'You can review and edit your shipping details')
  )
}
```

**Update onMounted** (around line 299):
```typescript
onMounted(async () => {
  // ... existing code ...
  
  // NEW: Auto-skip logic at the end
  // Wait a bit for data to load before checking
  await nextTick()
  
  if (shouldAutoSkip.value) {
    // Small delay to prevent jarring immediate modal
    setTimeout(() => {
      showAutoSkipCountdown.value = true
    }, 500)
  }
})
```

---

## Phase 3: Add Translations (1 hour)

### Step 3.1: Spanish (es.json)

```json
{
  "checkout": {
    "autoSkip": {
      "title": "Pago Rápido Activado",
      "message": "Tus datos de envío guardados han sido cargados. Redirigiendo al pago...",
      "shippingTo": "Enviar a:",
      "method": "Método",
      "skipNow": "Saltar Ahora",
      "cancel": "Quedarme Aquí",
      "cancelled": "Auto-salto cancelado",
      "reviewDetails": "Puedes revisar y editar tus datos de envío"
    }
  }
}
```

### Step 3.2: English (en.json)

```json
{
  "checkout": {
    "autoSkip": {
      "title": "Express Checkout Activated",
      "message": "Your saved shipping details have been loaded. Redirecting to payment...",
      "shippingTo": "Shipping to:",
      "method": "Method",
      "skipNow": "Skip Now",
      "cancel": "Stay Here",
      "cancelled": "Auto-skip cancelled",
      "reviewDetails": "You can review and edit your shipping details"
    }
  }
}
```

### Step 3.3: Romanian (ro.json)

```json
{
  "checkout": {
    "autoSkip": {
      "title": "Checkout Express Activat",
      "message": "Detaliile tale de livrare salvate au fost încărcate. Redirecționare către plată...",
      "shippingTo": "Livrare către:",
      "method": "Metodă",
      "skipNow": "Săriți Acum",
      "cancel": "Rămâi Aici",
      "cancelled": "Auto-săritură anulată",
      "reviewDetails": "Puteți revizui și edita detaliile de livrare"
    }
  }
}
```

### Step 3.4: Russian (ru.json)

```json
{
  "checkout": {
    "autoSkip": {
      "title": "Экспресс-оформление Активировано",
      "message": "Ваши сохраненные данные доставки загружены. Перенаправление на оплату...",
      "shippingTo": "Доставка по адресу:",
      "method": "Способ",
      "skipNow": "Пропустить Сейчас",
      "cancel": "Остаться Здесь",
      "cancelled": "Автопропуск отменен",
      "reviewDetails": "Вы можете просмотреть и отредактировать данные доставки"
    }
  }
}
```

---

## Phase 4: Add User Preference (2 hours)

### Step 4.1: Update Database Schema

**Migration**: Add preference field to user preferences table

```sql
-- Add auto_skip_enabled to user preferences
ALTER TABLE user_preferences 
ADD COLUMN auto_skip_enabled BOOLEAN DEFAULT true;

-- Update existing users to opt-in by default
UPDATE user_preferences SET auto_skip_enabled = true;
```

### Step 4.2: Update Checkout Store

**File**: `/stores/checkout/session.ts`

Add to preferences interface:
```typescript
interface UserPreferences {
  preferred_shipping_method?: string | null
  preferred_payment_method?: string | null
  auto_skip_enabled?: boolean // NEW
}
```

### Step 4.3: Update Auto-Skip Logic

**File**: `/components/checkout/ShippingStep.vue`

Update `shouldAutoSkip` computed:
```typescript
const shouldAutoSkip = computed(() => {
  // ... existing checks ...
  
  // Check user preference
  if (checkoutStore.preferences?.auto_skip_enabled === false) return false
  
  return true
})
```

### Step 4.4: Add Settings UI

**File**: `/pages/account/profile.vue`

Add toggle in preferences section:
```vue
<div class="flex items-center justify-between">
  <div>
    <label class="font-medium text-gray-900 dark:text-white">
      {{ $t('profile.preferences.autoSkip', 'Enable Express Checkout Auto-Skip') }}
    </label>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      {{ $t('profile.preferences.autoSkipDescription', 'Automatically skip to payment when you have saved shipping details') }}
    </p>
  </div>
  <input
    v-model="preferences.auto_skip_enabled"
    type="checkbox"
    class="toggle"
  />
</div>
```

---

## Phase 5: Testing (3 hours)

### Step 5.1: E2E Test - Auto-Skip Success

**File**: `/tests/e2e/checkout-auto-skip.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Express Checkout Auto-Skip', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user with saved address and shipping method
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/account/profile')
  })

  test('should show countdown and auto-skip to payment', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/test-product')
    await page.click('button:has-text("Add to Cart")')
    
    // Go to checkout
    await page.goto('/cart')
    await page.click('button:has-text("Proceder al Pago")')
    
    // Verify countdown modal appears
    await expect(page.locator('[class*="auto-skip-countdown"]')).toBeVisible()
    await expect(page.locator('text=Redirecting to payment')).toBeVisible()
    
    // Verify countdown shows 5
    await expect(page.locator('text=5')).toBeVisible()
    
    // Wait for countdown to complete (6 seconds to be safe)
    await page.waitForTimeout(6000)
    
    // Verify navigated to payment step
    await expect(page).toHaveURL('/checkout/payment')
  })

  test('should allow user to cancel auto-skip', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/test-product')
    await page.click('button:has-text("Add to Cart")')
    
    // Go to checkout
    await page.goto('/cart')
    await page.click('button:has-text("Proceder al Pago")')
    
    // Verify countdown modal appears
    await expect(page.locator('[class*="auto-skip-countdown"]')).toBeVisible()
    
    // Click cancel button
    await page.click('button:has-text("Stay Here")')
    
    // Verify modal closes
    await expect(page.locator('[class*="auto-skip-countdown"]')).not.toBeVisible()
    
    // Verify still on shipping step
    await expect(page).toHaveURL('/checkout')
    
    // Verify can fill form manually
    await expect(page.locator('form')).toBeVisible()
  })

  test('should allow skip now button', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/test-product')
    await page.click('button:has-text("Add to Cart")')
    
    // Go to checkout
    await page.goto('/cart')
    await page.click('button:has-text("Proceder al Pago")')
    
    // Click skip now immediately
    await page.click('button:has-text("Skip Now")')
    
    // Verify navigated to payment step immediately
    await expect(page).toHaveURL('/checkout/payment')
  })
})
```

### Step 5.2: E2E Test - No Auto-Skip Scenarios

```typescript
test('should NOT auto-skip for user without shipping method', async ({ page }) => {
  // Login as user with address but no previous orders
  await page.goto('/auth/login')
  await page.fill('[name="email"]', 'newuser@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  // Add item and go to checkout
  await page.goto('/products/test-product')
  await page.click('button:has-text("Add to Cart")')
  await page.goto('/cart')
  await page.click('button:has-text("Proceder al Pago")')
  
  // Verify NO countdown appears
  await expect(page.locator('[class*="auto-skip-countdown"]')).not.toBeVisible()
  
  // Verify shows express banner instead
  await expect(page.locator('text=Express Checkout Available')).toBeVisible()
})

test('should NOT auto-skip for guest users', async ({ page }) => {
  // Don't login - test as guest
  await page.goto('/products/test-product')
  await page.click('button:has-text("Add to Cart")')
  await page.goto('/cart')
  await page.click('button:has-text("Proceder al Pago")')
  
  // Verify NO countdown
  await expect(page.locator('[class*="auto-skip-countdown"]')).not.toBeVisible()
  
  // Verify shows guest prompt
  await expect(page.locator('text=Continue as Guest')).toBeVisible()
})
```

### Step 5.3: Accessibility Test

```typescript
test('should be keyboard accessible', async ({ page }) => {
  // ... setup ...
  
  // Tab to cancel button
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  
  // Press Enter to cancel
  await page.keyboard.press('Enter')
  
  // Verify cancelled
  await expect(page.locator('[class*="auto-skip-countdown"]')).not.toBeVisible()
})

test('should announce to screen readers', async ({ page }) => {
  // ... setup ...
  
  // Check for ARIA live region
  const alert = page.locator('[role="alert"]')
  await expect(alert).toContainText('Express checkout activated')
})
```

---

## Phase 6: Edge Cases & Error Handling (2 hours)

### Step 6.1: Handle Stale Data

```typescript
// In handleAutoSkipComplete method
const handleAutoSkipComplete = async () => {
  try {
    // Verify address still exists
    const addresses = await loadSavedAddresses()
    const addressStillValid = addresses.some(a => a.id === defaultAddress.value?.id)
    
    if (!addressStillValid) {
      toast.error(
        t('checkout.errors.staleAddress', 'Saved address is no longer available'),
        t('checkout.errors.pleaseSelect', 'Please select a different address')
      )
      showAutoSkipCountdown.value = false
      return
    }
    
    // ... rest of logic ...
  } catch (error) {
    // Handle error
  }
}
```

### Step 6.2: Prevent Redirect Loops

```typescript
// Add query param to prevent re-triggering on back navigation
await navigateTo({
  path: localePath('/checkout/payment'),
  query: { autoSkipped: 'true' }
})

// In shouldAutoSkip computed:
if (route.query.autoSkipped === 'true') return false
```

### Step 6.3: Handle Page Reload

```typescript
// Store auto-skip state in sessionStorage
const AUTO_SKIP_KEY = 'checkout-auto-skip-triggered'

// On trigger:
sessionStorage.setItem(AUTO_SKIP_KEY, 'true')

// In shouldAutoSkip:
if (sessionStorage.getItem(AUTO_SKIP_KEY) === 'true') return false

// Clear on checkout completion:
sessionStorage.removeItem(AUTO_SKIP_KEY)
```

---

## Checklist Before Deployment

- [ ] All components created and tested
- [ ] Translations added for all 4 locales (es, en, ro, ru)
- [ ] E2E tests written and passing
- [ ] Accessibility audit completed
- [ ] Mobile testing completed
- [ ] User preference system working
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Code review completed
- [ ] Documentation updated

---

## Rollout Strategy

### Phase 1: Beta Test (Week 1)
- Enable for 10% of users
- Monitor metrics: adoption rate, errors, completion rate
- Collect user feedback

### Phase 2: Gradual Rollout (Week 2-3)
- Increase to 50% of users
- A/B test against old flow
- Measure impact on conversion

### Phase 3: Full Rollout (Week 4)
- Enable for all users
- Keep preference opt-out available
- Monitor long-term metrics

---

## Success Criteria

**Must Have**:
- ✅ Countdown shows and counts from 5 to 0
- ✅ Automatically navigates to payment after countdown
- ✅ Cancel button stops auto-skip
- ✅ No auto-skip for guest users
- ✅ No auto-skip without saved shipping method
- ✅ No console errors
- ✅ WCAG 2.1 AA compliant

**Nice to Have**:
- ✅ Skip now button works
- ✅ User preference to disable
- ✅ Analytics tracking
- ✅ Toast notifications for state changes

---

**Implementation Time**: 12 hours  
**Testing Time**: 3 hours  
**Total**: 15 hours

**Ready to implement**: Yes, all specifications complete
