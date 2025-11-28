# Express Checkout Implementation Guide
**Step-by-Step Development Roadmap**

## Quick Reference

**Architecture Document:** `EXPRESS_CHECKOUT_ARCHITECTURE.md`
**Estimated Timeline:** 3-4 weeks
**Risk Level:** Low (additive changes only)
**Breaking Changes:** None

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER CLICKS "CHECKOUT"                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Middleware Executes  │
                │  (checkout.ts)        │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ useCheckoutCompletion │
                │  Checks Data State    │
                └───────────┬───────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  NO DATA     │    │  SHIPPING    │    │  BOTH        │
│  SAVED       │    │  COMPLETE    │    │  COMPLETE    │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       ▼                   ▼                   ▼
  /checkout          /checkout/payment    /checkout/review
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   SHIPPING   │    │  ┏━━━━━━━━┓  │    │  ┏━━━━━━━━┓  │
│     FORM     │    │  ┃Shipping┃  │    │  ┃Shipping┃  │
│   (Active)   │    │  ┃Summary ┃  │    │  ┃Summary ┃  │
│              │    │  ┗━━━━━━━━┛  │    │  ┗━━━━━━━━┛  │
│              │    │               │    │  ┏━━━━━━━━┓  │
│              │    │   PAYMENT     │    │  ┃Payment ┃  │
│              │    │     FORM      │    │  ┃Summary ┃  │
│              │    │   (Active)    │    │  ┗━━━━━━━━┛  │
│              │    │               │    │               │
│              │    │               │    │    REVIEW     │
│              │    │               │    │   (Active)    │
└──────────────┘    └──────────────┘    └──────────────┘

Legend:
┏━━━━━━━━┓ = Collapsible Summary (can expand/edit)
─────────  = Active Form/Step
```

---

## Implementation Phases

### Phase 1: Foundation Components (Week 1)

#### Day 1-2: Create Core Composable

**File:** `/composables/checkout/useCheckoutCompletion.ts`

```bash
# Create directory if needed
mkdir -p composables/checkout

# Create file
touch composables/checkout/useCheckoutCompletion.ts
```

**Implementation:**
1. Copy code from architecture document Section 2.1
2. Import types from `~/types/checkout`
3. Test with existing checkout store data

**Validation:**
```typescript
// Quick test in browser console
const { getOptimalStep, isShippingComplete } = useCheckoutCompletion()
console.log('Optimal step:', getOptimalStep.value)
console.log('Shipping complete:', isShippingComplete.value)
```

#### Day 3-4: Create Collapsible Component

**File:** `/components/checkout/CollapsibleStepSummary.vue`

```bash
touch components/checkout/CollapsibleStepSummary.vue
```

**Implementation:**
1. Copy code from architecture document Section 4.1
2. Test expand/collapse animation
3. Verify accessibility (keyboard navigation, ARIA)

**Manual Test:**
```vue
<!-- Test in any checkout page temporarily -->
<CollapsibleStepSummary
  :step-number="1"
  title="Test Step"
  summary-text="Test summary"
  :is-complete="true"
>
  <template #content>
    <div>Test content</div>
  </template>
</CollapsibleStepSummary>
```

#### Day 5: Create Summary Components

**Files:**
- `/components/checkout/summaries/ShippingSummary.vue`
- `/components/checkout/summaries/PaymentSummary.vue`

```bash
mkdir -p components/checkout/summaries
touch components/checkout/summaries/ShippingSummary.vue
touch components/checkout/summaries/PaymentSummary.vue
```

**Implementation:**
1. Copy code from architecture document Section 4.2
2. Test with sample data
3. Verify formatting (addresses, prices)

**Phase 1 Deliverable:**
- ✅ All components render correctly
- ✅ Expand/collapse animations smooth
- ✅ No console errors
- ✅ Components reusable across pages

---

### Phase 2: Auto-Routing Logic (Week 2)

#### Day 1-2: Update Middleware

**File:** `/middleware/checkout.ts`

**Changes:**
1. Import `useCheckoutCompletion` at top
2. Add auto-routing logic after line 86 (see architecture doc Section 3.1)
3. Handle query parameters (`autoRouted`, `skipAutoRoute`)

**Code Addition:**
```typescript
// After existing imports
import { useCheckoutCompletion } from '~/composables/checkout/useCheckoutCompletion'

// After line 86 (prefetch data), add:
if (to.path === localePath('/checkout') && !to.query.skipAutoRoute) {
  const { shouldAutoRoute, getOptimalStep } = useCheckoutCompletion()

  if (shouldAutoRoute.value) {
    const optimalStep = getOptimalStep.value
    const redirectPath = getStepPath(optimalStep, localePath)

    console.log(`🚀 [Express Checkout] Auto-routing to optimal step: ${optimalStep}`)

    return navigateTo({
      path: redirectPath,
      query: {
        autoRouted: 'true'
      }
    })
  }
}
```

#### Day 3: Test Auto-Routing

**Test Scenarios:**

1. **Empty State (New User)**
   ```
   1. Clear all cookies
   2. Add items to cart
   3. Click checkout
   4. Expected: Land on /checkout (shipping)
   ```

2. **Shipping Complete**
   ```
   1. Fill shipping form
   2. Exit checkout (close tab)
   3. Return to cart, click checkout
   4. Expected: Auto-route to /checkout/payment
   ```

3. **All Complete**
   ```
   1. Complete shipping + payment
   2. Exit checkout before placing order
   3. Return to cart, click checkout
   4. Expected: Auto-route to /checkout/review
   ```

#### Day 4-5: Analytics & Toast Notifications

**Add Toast on Auto-Route:**
```typescript
// In middleware after auto-route
const toast = useToast()
toast.info(
  t('checkout.expressCheckout.autoRouted', { step: optimalStep }),
  { duration: 3000 }
)
```

**Add Analytics Event:**
```typescript
// Track auto-routing
if (process.client) {
  analytics.track('checkout_auto_routed', {
    from_step: 'shipping',
    to_step: optimalStep,
    timestamp: new Date().toISOString()
  })
}
```

**Phase 2 Deliverable:**
- ✅ Auto-routing works for all scenarios
- ✅ Users can override with `skipAutoRoute=true`
- ✅ Analytics tracking implemented
- ✅ No breaking changes to existing flow

---

### Phase 3: Update Page Layouts (Week 3)

#### Day 1-2: Payment Page

**File:** `/pages/checkout/payment.vue`

**Implementation:**
1. Import new components
2. Add collapsible shipping summary above payment form
3. Test expand/edit functionality

**Key Changes:**
```vue
<script setup lang="ts">
import { useCheckoutCompletion } from '~/composables/checkout/useCheckoutCompletion'

const CollapsibleStepSummary = defineAsyncComponent(() =>
  import('~/components/checkout/CollapsibleStepSummary.vue')
)
const ShippingSummary = defineAsyncComponent(() =>
  import('~/components/checkout/summaries/ShippingSummary.vue')
)

const checkoutStore = useCheckoutStore()
const { isShippingComplete } = useCheckoutCompletion()

const shippingSummaryText = computed(() => {
  const info = checkoutStore.shippingInfo
  if (!info?.address) return ''
  return `${info.address.street}, ${info.address.city}`
})

const navigateToShipping = () => {
  navigateTo(localePath('/checkout?skipAutoRoute=true'))
}
</script>

<template>
  <!-- Add before existing PaymentStep -->
  <CollapsibleStepSummary
    :step-number="1"
    :title="$t('checkout.steps.shipping.title')"
    :summary-text="shippingSummaryText"
    :is-complete="isShippingComplete"
    @edit="navigateToShipping"
  >
    <template #content>
      <ShippingSummary :shipping-info="checkoutStore.shippingInfo" />
    </template>
  </CollapsibleStepSummary>

  <!-- Existing PaymentStep wrapped in highlighted container -->
  <div class="border border-indigo-500 rounded-lg p-6 bg-indigo-50/30 dark:bg-indigo-900/10">
    <PaymentStep />
  </div>
</template>
```

**Manual Test:**
1. Navigate to /checkout/payment
2. Verify shipping summary shows
3. Click "Edit" → summary expands
4. Click header again → summary collapses
5. Verify "Edit" navigates to /checkout

#### Day 3-4: Review Page

**File:** `/pages/checkout/review.vue`

**Implementation:**
1. Import new components
2. Add collapsible shipping summary
3. Add collapsible payment summary
4. Wrap review content in highlighted container

**Key Changes:**
```vue
<script setup lang="ts">
import { useCheckoutCompletion } from '~/composables/checkout/useCheckoutCompletion'

const CollapsibleStepSummary = defineAsyncComponent(() =>
  import('~/components/checkout/CollapsibleStepSummary.vue')
)
const ShippingSummary = defineAsyncComponent(() =>
  import('~/components/checkout/summaries/ShippingSummary.vue')
)
const PaymentSummary = defineAsyncComponent(() =>
  import('~/components/checkout/summaries/PaymentSummary.vue')
)

const { isShippingComplete, isPaymentComplete } = useCheckoutCompletion()

const paymentSummaryText = computed(() => {
  const method = checkoutStore.paymentMethod
  if (!method) return ''
  return method.type === 'credit_card' ? 'Credit Card' : method.type
})
</script>

<template>
  <!-- Add before existing review content -->
  <CollapsibleStepSummary
    :step-number="1"
    :title="$t('checkout.steps.shipping.title')"
    :summary-text="shippingSummaryText"
    :is-complete="isShippingComplete"
    @edit="navigateToShipping"
  >
    <template #content>
      <ShippingSummary :shipping-info="checkoutStore.shippingInfo" />
    </template>
  </CollapsibleStepSummary>

  <CollapsibleStepSummary
    :step-number="2"
    :title="$t('checkout.steps.payment.title')"
    :summary-text="paymentSummaryText"
    :is-complete="isPaymentComplete"
    @edit="navigateToPayment"
  >
    <template #content>
      <PaymentSummary :payment-method="checkoutStore.paymentMethod" />
    </template>
  </CollapsibleStepSummary>

  <!-- Existing review content in highlighted container -->
  <div class="border border-indigo-500 rounded-lg p-6 bg-indigo-50/30 dark:bg-indigo-900/10">
    <!-- Existing ReviewCartSection, ReviewSummaryCard, etc. -->
  </div>
</template>
```

#### Day 5: Translation Keys

**Files to Update:**
- `/i18n/locales/en.json`
- `/i18n/locales/es.json`
- `/i18n/locales/ro.json`
- `/i18n/locales/ru.json`

**Add to Each File:**
```json
{
  "checkout": {
    "expressCheckout": {
      "autoRouted": "We've taken you directly to {step} based on your saved information"
    },
    "steps": {
      "shipping": {
        "title": "Shipping Information",
        "completed": "Shipping details confirmed"
      },
      "payment": {
        "title": "Payment Method",
        "completed": "Payment method selected"
      }
    }
  },
  "common": {
    "edit": "Edit"
  }
}
```

**Spanish (es.json):**
```json
{
  "checkout": {
    "expressCheckout": {
      "autoRouted": "Te hemos llevado directamente a {step} según tu información guardada"
    },
    "steps": {
      "shipping": {
        "title": "Información de Envío",
        "completed": "Detalles de envío confirmados"
      },
      "payment": {
        "title": "Método de Pago",
        "completed": "Método de pago seleccionado"
      }
    }
  },
  "common": {
    "edit": "Editar"
  }
}
```

**Romanian (ro.json):**
```json
{
  "checkout": {
    "expressCheckout": {
      "autoRouted": "Te-am dus direct la {step} pe baza informațiilor salvate"
    },
    "steps": {
      "shipping": {
        "title": "Informații de Livrare",
        "completed": "Detalii de livrare confirmate"
      },
      "payment": {
        "title": "Metodă de Plată",
        "completed": "Metodă de plată selectată"
      }
    }
  },
  "common": {
    "edit": "Editează"
  }
}
```

**Russian (ru.json):**
```json
{
  "checkout": {
    "expressCheckout": {
      "autoRouted": "Мы направили вас прямо к {step} на основе сохраненной информации"
    },
    "steps": {
      "shipping": {
        "title": "Информация о Доставке",
        "completed": "Детали доставки подтверждены"
      },
      "payment": {
        "title": "Способ Оплаты",
        "completed": "Способ оплаты выбран"
      }
    }
  },
  "common": {
    "edit": "Редактировать"
  }
}
```

**Phase 3 Deliverable:**
- ✅ Payment page shows collapsible shipping
- ✅ Review page shows collapsible shipping + payment
- ✅ All 4 locales have translation keys
- ✅ Visual design matches mockups

---

### Phase 4: Testing & Polish (Week 4)

#### Day 1-2: Write Unit Tests

**File:** `/composables/checkout/useCheckoutCompletion.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCheckoutCompletion } from './useCheckoutCompletion'

// Mock checkout store
vi.mock('~/stores/checkout', () => ({
  useCheckoutStore: vi.fn(() => ({
    shippingInfo: null,
    paymentMethod: null,
    validationErrors: { shipping: [], payment: [] },
    currentStep: 'shipping'
  }))
}))

describe('useCheckoutCompletion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should detect incomplete shipping step', () => {
    const { isShippingComplete } = useCheckoutCompletion()
    expect(isShippingComplete.value).toBe(false)
  })

  it('should detect complete shipping step', () => {
    // Mock store with complete shipping data
    const mockStore = {
      shippingInfo: {
        address: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'Madrid',
          postalCode: '28001',
          country: 'ES'
        },
        method: {
          id: 'standard',
          name: 'Standard Shipping',
          price: 5.99
        }
      },
      validationErrors: { shipping: [], payment: [] }
    }

    vi.mocked(useCheckoutStore).mockReturnValue(mockStore as any)

    const { isShippingComplete } = useCheckoutCompletion()
    expect(isShippingComplete.value).toBe(true)
  })

  it('should route to payment when only shipping complete', () => {
    const mockStore = {
      shippingInfo: { /* complete data */ },
      paymentMethod: null,
      validationErrors: { shipping: [], payment: [] }
    }

    vi.mocked(useCheckoutStore).mockReturnValue(mockStore as any)

    const { getOptimalStep } = useCheckoutCompletion()
    expect(getOptimalStep.value).toBe('payment')
  })

  it('should route to review when both complete', () => {
    const mockStore = {
      shippingInfo: { /* complete data */ },
      paymentMethod: { type: 'credit_card' },
      validationErrors: { shipping: [], payment: [] }
    }

    vi.mocked(useCheckoutStore).mockReturnValue(mockStore as any)

    const { getOptimalStep } = useCheckoutCompletion()
    expect(getOptimalStep.value).toBe('review')
  })
})
```

**Run Tests:**
```bash
npm run test:unit -- useCheckoutCompletion
```

#### Day 3-4: Write E2E Tests

**File:** `/tests/e2e/express-checkout.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Express Checkout Auto-Routing', () => {
  test('new user lands on shipping step', async ({ page }) => {
    // Clear cookies to simulate new user
    await page.context().clearCookies()

    await page.goto('/cart')
    await page.click('text=Checkout')

    await expect(page).toHaveURL(/\/checkout$/)
    await expect(page.locator('h2')).toContainText('Shipping')
  })

  test('user with saved shipping auto-routes to payment', async ({ page, context }) => {
    // Setup: Add checkout session cookie with shipping data
    await context.addCookies([{
      name: 'checkout_session',
      value: JSON.stringify({
        shippingInfo: {
          address: {
            firstName: 'Test',
            lastName: 'User',
            street: '123 Test St',
            city: 'Madrid',
            postalCode: '28001',
            country: 'ES'
          },
          method: { id: 'standard', name: 'Standard', price: 5.99 }
        }
      }),
      domain: 'localhost',
      path: '/'
    }])

    await page.goto('/cart')
    await page.click('text=Checkout')

    // Should auto-route to payment
    await expect(page).toHaveURL(/\/checkout\/payment/)

    // Should see collapsed shipping summary
    await expect(page.locator('text=Shipping Information')).toBeVisible()
    await expect(page.locator('.step-summary').first()).toBeVisible()
  })

  test('user can expand shipping summary and edit', async ({ page }) => {
    await page.goto('/checkout/payment')

    // Click Edit button
    await page.click('button:has-text("Edit")')

    // Should navigate to shipping page
    await expect(page).toHaveURL(/\/checkout$/)
  })

  test('collapsible summary expands/collapses', async ({ page }) => {
    await page.goto('/checkout/payment')

    // Summary should be collapsed by default
    const summary = page.locator('.shipping-summary')
    await expect(summary).not.toBeVisible()

    // Click header to expand
    await page.click('.step-summary >> nth=0')
    await expect(summary).toBeVisible()

    // Click again to collapse
    await page.click('.step-summary >> nth=0')
    await expect(summary).not.toBeVisible()
  })
})
```

**Run Tests:**
```bash
npm run test:e2e -- express-checkout
```

#### Day 5: Visual QA & Performance Audit

**Visual QA Checklist:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Dark mode
- [ ] All 4 locales (ES/EN/RO/RU)
- [ ] Expand/collapse animations smooth
- [ ] Edit buttons visible and clickable
- [ ] Auto-route toast notification shows

**Performance Audit:**
```bash
# Build production bundle
npm run build

# Check bundle size
npx vite-bundle-visualizer

# Lighthouse audit
npx lighthouse http://localhost:3000/checkout --view
```

**Target Metrics:**
- Bundle size increase: <10KB
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: >90

**Phase 4 Deliverable:**
- ✅ All tests passing (unit + E2E)
- ✅ Visual QA complete across devices
- ✅ Performance metrics within targets
- ✅ No regressions in existing flows

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (unit + E2E)
- [ ] Visual QA approved
- [ ] Performance audit passed
- [ ] Translation keys verified in all locales
- [ ] Code review completed
- [ ] Staging deployment tested

### Deployment
- [ ] Feature flag enabled (if using gradual rollout)
- [ ] Deploy to production
- [ ] Smoke test critical paths
- [ ] Monitor error tracking (Sentry/similar)
- [ ] Monitor analytics for auto-route events

### Post-Deployment (Week 1)
- [ ] Monitor checkout completion rate
- [ ] Monitor auto-route success rate
- [ ] Monitor step abandonment rate
- [ ] Gather user feedback
- [ ] Fix any critical bugs

---

## Rollback Procedure

### If Critical Issues Found

**Option 1: Feature Flag Disable**
```bash
# .env
NUXT_PUBLIC_EXPRESS_CHECKOUT_ENABLED=false

# Redeploy
npm run build
vercel --prod
```

**Option 2: Git Revert**
```bash
# Identify commit
git log --oneline | grep "express checkout"

# Revert
git revert <commit-hash>

# Deploy
git push origin main
```

**Option 3: Partial Rollback**
```typescript
// middleware/checkout.ts
// Comment out auto-routing logic, keep collapsible UI
// if (AUTO_ROUTE_ENABLED && to.path === localePath('/checkout')) {
//   // Auto-routing disabled temporarily
// }
```

---

## Success Criteria

### Week 1 (Foundation)
- [ ] Components render without errors
- [ ] Expand/collapse animations work
- [ ] No console warnings

### Week 2 (Auto-Routing)
- [ ] Auto-routing works for all scenarios
- [ ] Analytics tracking functional
- [ ] No breaking changes to existing flow

### Week 3 (UI Integration)
- [ ] All pages updated with collapsible UI
- [ ] Translations complete
- [ ] Visual design matches spec

### Week 4 (Launch Ready)
- [ ] Tests passing (>90% coverage)
- [ ] Performance within targets
- [ ] QA approved
- [ ] Ready for production

---

## Common Issues & Solutions

### Issue: Auto-route loops infinitely
**Solution:** Add `skipAutoRoute` check to prevent re-routing
```typescript
if (to.query.autoRouted === 'true') {
  return // Don't auto-route again
}
```

### Issue: Collapsible content flashes on page load
**Solution:** Set `defaultExpanded: false` and use CSS `display: none` initially
```vue
<Transition>
  <div v-show="expanded" class="hidden">
    <!-- Content -->
  </div>
</Transition>
```

### Issue: Store data not ready in middleware
**Solution:** Already handled in existing middleware (line 31-33)
```typescript
if (!import.meta.client) {
  return // Skip on SSR
}
```

### Issue: Translation keys missing
**Solution:** Add fallback text inline
```vue
{{ $t('checkout.steps.shipping.title', 'Shipping Information') }}
```

---

## Support & Maintenance

### Documentation Links
- Architecture: `EXPRESS_CHECKOUT_ARCHITECTURE.md`
- Implementation: `EXPRESS_CHECKOUT_IMPLEMENTATION_GUIDE.md` (this file)
- Project: `README.md`
- i18n: `docs/I18N_CONFIGURATION.md`

### Team Contacts
- Frontend Lead: [Name]
- QA Lead: [Name]
- Product Owner: [Name]

### Monitoring
- Analytics Dashboard: [URL]
- Error Tracking: [URL]
- Performance: [URL]

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Status:** Ready for Development
