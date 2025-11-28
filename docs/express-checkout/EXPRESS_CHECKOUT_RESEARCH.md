# Amazon-Style Express Checkout - Research & Implementation Guide

## Executive Summary

This document provides comprehensive research on Amazon's express checkout implementation and specific recommendations for Moldova Direct's Nuxt 4 + Vue 3 application. Based on industry best practices from 2024-2025, this guide covers smart routing logic, UX patterns, performance optimization, and production-ready code examples.

---

## Table of Contents

1. [Smart Landing Step Detection](#1-smart-landing-step-detection)
2. [User Flow Scenarios](#2-user-flow-scenarios)
3. [Review Page Patterns](#3-review-page-patterns)
4. [UX Patterns & Visual Design](#4-ux-patterns--visual-design)
5. [Performance Considerations](#5-performance-considerations)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [Code Examples](#7-code-examples)
8. [Sources](#sources)

---

## 1. Smart Landing Step Detection

### Amazon's Approach

Amazon uses **intelligent routing** that analyzes the user's saved data and automatically navigates them to the first incomplete step in the checkout flow. This creates a seamless "express" experience where returning customers skip unnecessary steps.

### Detection Logic

```typescript
/**
 * Determine optimal landing step based on user data completeness
 *
 * Priority order:
 * 1. Confirmation (if coming from completed order)
 * 2. Review (if all data complete and valid)
 * 3. Payment (if shipping complete, payment incomplete)
 * 4. Shipping (default/incomplete data)
 */
function determineOptimalCheckoutStep(userData: UserCheckoutData): CheckoutStep {
  // Check if user just completed an order
  if (userData.recentOrderId && isWithinTimeframe(userData.orderCompletedAt, 5)) {
    return 'confirmation'
  }

  // Check data completeness
  const hasValidShipping = validateShippingData(userData.savedAddress, userData.preferences?.shipping_method)
  const hasValidPayment = validatePaymentData(userData.savedPaymentMethods)

  // Both complete → Review (express checkout)
  if (hasValidShipping && hasValidPayment) {
    return 'review'
  }

  // Only shipping complete → Payment
  if (hasValidShipping && !hasValidPayment) {
    return 'payment'
  }

  // Nothing saved or incomplete → Shipping
  return 'shipping'
}

/**
 * Data validation helpers
 */
function validateShippingData(address?: Address, preferredMethod?: string): boolean {
  if (!address) return false

  // Verify address has all required fields
  const hasRequiredFields = !!(
    address.firstName &&
    address.lastName &&
    address.street &&
    address.city &&
    address.postalCode &&
    address.country
  )

  // Check if address is still valid (not expired)
  const isRecent = address.last_used_at
    ? isWithinTimeframe(address.last_used_at, 180) // 6 months
    : isWithinTimeframe(address.created_at, 180)

  return hasRequiredFields && isRecent
}

function validatePaymentData(paymentMethods?: SavedPaymentMethod[]): boolean {
  if (!paymentMethods || paymentMethods.length === 0) return false

  // Find default or most recent payment method
  const defaultMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0]

  // Verify payment method is not expired
  if (defaultMethod.type === 'card' && defaultMethod.card_expiry) {
    const [month, year] = defaultMethod.card_expiry.split('/')
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month))
    if (expiryDate < new Date()) return false
  }

  return true
}

function isWithinTimeframe(date: string | Date, days: number): boolean {
  const targetDate = new Date(date)
  const now = new Date()
  const diffDays = (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= days
}
```

### Integration with Current Middleware

Your current `middleware/checkout.ts` can be enhanced:

```typescript
// In middleware/checkout.ts - Enhanced version

export default defineNuxtRouteMiddleware(async (to) => {
  const localePath = useLocalePath()
  const stepFromPath = extractStepFromPath(to.path)

  if (stepFromPath === 'confirmation') {
    return // Allow confirmation page access
  }

  if (!import.meta.client) {
    return // SSR bypass
  }

  // Initialize cart and checkout
  const cartStore = useCartStore()
  const checkoutStore = useCheckoutStore()

  if (!cartStore.sessionId) {
    await cartStore.initializeCart()
  }

  const { items, itemCount } = useCart()

  if (itemCount.value === 0) {
    return navigateTo({
      path: localePath('/cart'),
      query: { message: 'empty-cart-checkout' }
    })
  }

  if (!checkoutStore.sessionId) {
    await checkoutStore.initializeCheckout(items.value)
  }

  // NEW: Prefetch user data for smart routing
  if (!checkoutStore.dataPrefetched) {
    await checkoutStore.prefetchCheckoutData()
  }

  // NEW: Smart routing for first-time checkout access
  if (!stepFromPath && checkoutStore.dataPrefetched) {
    const optimalStep = determineOptimalCheckoutStep({
      savedAddress: checkoutStore.savedAddresses?.[0],
      savedPaymentMethods: checkoutStore.savedPaymentMethods,
      preferences: checkoutStore.preferences,
      recentOrderId: checkoutStore.orderData?.orderId,
      orderCompletedAt: checkoutStore.orderData?.completedAt
    })

    // Only auto-route if not on default shipping step
    if (optimalStep !== 'shipping') {
      console.log(`🚀 Smart routing: Navigating to ${optimalStep}`)
      return navigateTo(getStepPath(optimalStep, localePath))
    }
  }

  // Existing step validation logic...
})
```

---

## 2. User Flow Scenarios

### Scenario A: Saved Address + Saved Payment
**User Profile:** Returning customer with complete profile

```
Cart → [Middleware detects complete data] → Review Page
```

**UX Highlights:**
- Skip shipping AND payment steps entirely
- Show collapsible summaries on review page
- Display "Express Checkout" badge
- Estimated experience: **< 10 seconds to complete order**

**Implementation:**
```typescript
// In ShippingStep.vue - Auto-advance logic
onMounted(async () => {
  const user = useSupabaseUser()
  const checkoutStore = useCheckoutStore()

  if (user.value && checkoutStore.savedAddresses?.length > 0) {
    const defaultAddress = checkoutStore.savedAddresses.find(a => a.is_default)

    if (defaultAddress && checkoutStore.preferences?.preferred_shipping_method) {
      // Auto-populate data
      shippingAddress.value = { ...defaultAddress }
      selectedMethod.value = checkoutStore.preferences.preferred_shipping_method

      // Check if we can skip to payment
      if (checkoutStore.savedPaymentMethods?.length > 0) {
        // Show express checkout banner with auto-advance option
        showExpressCheckoutBanner.value = true
        startExpressCheckoutCountdown(5) // 5 second countdown
      } else {
        // Just auto-advance to payment
        await autoAdvanceToPayment()
      }
    }
  }
})

async function autoAdvanceToPayment() {
  // Validate data first
  if (!isAddressValid.value || !selectedMethod.value) return

  // Show toast notification
  toast.info('Shipping info loaded from your profile', {
    duration: 2000,
    action: { label: 'Edit', onClick: () => cancelAutoAdvance() }
  })

  // Wait 2 seconds for user to review/cancel
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Proceed automatically
  await proceedToPayment()
}
```

### Scenario B: Saved Address + No Payment
**User Profile:** Returning customer, never saved payment

```
Cart → [Middleware detects shipping data only] → Payment Page
```

**UX Highlights:**
- Skip shipping step
- Land directly on payment page
- Show "Shipping to [address]" summary at top
- Allow editing via "Change" link
- Estimated experience: **< 20 seconds to complete order**

**Implementation:**
```typescript
// In PaymentStep.vue
<template>
  <div>
    <!-- Shipping Summary (Collapsible) -->
    <CollapsibleSection
      v-if="checkoutStore.shippingInfo"
      title="Shipping Address"
      :is-complete="true"
      :is-editable="true"
      @edit="editShipping"
    >
      <AddressSummary :address="checkoutStore.shippingInfo.address" />
      <ShippingMethodBadge :method="checkoutStore.shippingInfo.method" />
    </CollapsibleSection>

    <!-- Payment Form -->
    <PaymentMethodForm v-model="paymentMethod" />
  </div>
</template>

<script setup lang="ts">
const editShipping = () => {
  navigateTo(localePath('/checkout/shipping'))
}
</script>
```

### Scenario C: No Saved Data
**User Profile:** First-time buyer or guest

```
Cart → Shipping Page → Payment Page → Review Page → Confirmation
```

**UX Highlights:**
- Traditional multi-step flow
- Progress indicator shows all 4 steps
- Option to save data for next time (authenticated users)
- Guest checkout available
- Estimated experience: **60-90 seconds**

---

## 3. Review Page Patterns

### Collapsible Sections Best Practices

Based on [Baymard Institute research](https://baymard.com/blog/accordion-checkout-usability), collapsible sections should **always show summaries, not just headers**.

#### ❌ Wrong Approach
```html
<!-- DON'T: Header-only sections force users to expand to review -->
<div class="checkout-section collapsed">
  <h3>Shipping Address</h3>
</div>
```

#### ✅ Correct Approach
```vue
<!-- DO: Show summary with edit option -->
<div class="checkout-section collapsed">
  <div class="section-header">
    <h3>Shipping Address</h3>
    <button class="edit-btn" @click="expandSection">Edit</button>
  </div>
  <div class="section-summary">
    <p class="address-line">{{ address.firstName }} {{ address.lastName }}</p>
    <p class="address-line">{{ address.street }}</p>
    <p class="address-line">{{ address.city }}, {{ address.postalCode }}</p>
    <p class="shipping-method">
      <TruckIcon class="w-4 h-4" />
      {{ shippingMethod.name }} - {{ formatPrice(shippingMethod.cost) }}
    </p>
  </div>
</div>
```

### Review Page Component Architecture

```vue
<!-- components/checkout/ReviewStep.vue -->
<template>
  <div class="review-step max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">Review Your Order</h1>

    <!-- Express Checkout Indicator -->
    <ExpressCheckoutBadge
      v-if="isExpressCheckout"
      class="mb-6"
    />

    <div class="space-y-6">
      <!-- Shipping Section -->
      <AccordionSection
        v-model:expanded="sections.shipping"
        title="Shipping Address"
        :completed="!!shippingInfo"
        :icon="TruckIcon"
      >
        <template #summary>
          <AddressSummaryCompact
            :address="shippingInfo.address"
            :shipping-method="shippingInfo.method"
          />
        </template>
        <template #content>
          <AddressForm
            v-model="editableShipping"
            :readonly="true"
          />
          <div class="mt-4 flex justify-end">
            <Button
              variant="outline"
              @click="editShipping"
            >
              Change Shipping
            </Button>
          </div>
        </template>
      </AccordionSection>

      <!-- Payment Section -->
      <AccordionSection
        v-model:expanded="sections.payment"
        title="Payment Method"
        :completed="!!paymentMethod"
        :icon="CreditCardIcon"
      >
        <template #summary>
          <PaymentMethodSummary
            :method="paymentMethod"
            :show-last-4="true"
          />
        </template>
        <template #content>
          <PaymentMethodDetails :method="paymentMethod" />
          <div class="mt-4 flex justify-end">
            <Button
              variant="outline"
              @click="editPayment"
            >
              Change Payment
            </Button>
          </div>
        </template>
      </AccordionSection>

      <!-- Order Items -->
      <AccordionSection
        v-model:expanded="sections.items"
        title="Order Items"
        :completed="true"
        :icon="ShoppingBagIcon"
        :default-expanded="true"
      >
        <template #summary>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">{{ itemCount }} items</span>
            <span class="font-semibold">{{ formatPrice(subtotal) }}</span>
          </div>
        </template>
        <template #content>
          <CheckoutItemList
            :items="items"
            :readonly="true"
          />
        </template>
      </AccordionSection>
    </div>

    <!-- Order Summary Sticky Sidebar -->
    <OrderSummarySidebar
      :subtotal="subtotal"
      :shipping="shippingCost"
      :tax="taxAmount"
      :total="orderTotal"
      :processing="processing"
      @place-order="placeOrder"
    />

    <!-- Trust Signals -->
    <TrustSignalsBar class="mt-8" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TruckIcon, CreditCardIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline'

const checkoutStore = useCheckoutStore()
const { items, itemCount, subtotal } = useCart()

// Section expansion state
const sections = ref({
  shipping: false,  // Collapsed by default
  payment: false,   // Collapsed by default
  items: true       // Expanded by default
})

const isExpressCheckout = computed(() => {
  return checkoutStore.preferences?.express_checkout_enabled
})

const shippingInfo = computed(() => checkoutStore.shippingInfo)
const paymentMethod = computed(() => checkoutStore.paymentMethod)
const shippingCost = computed(() => shippingInfo.value?.method?.cost || 0)
const taxAmount = computed(() => calculateTax(subtotal.value))
const orderTotal = computed(() => subtotal.value + shippingCost.value + taxAmount.value)

const editableShipping = ref({ ...shippingInfo.value?.address })
const processing = ref(false)

const editShipping = () => {
  navigateTo('/checkout/shipping')
}

const editPayment = () => {
  navigateTo('/checkout/payment')
}

const placeOrder = async () => {
  processing.value = true
  try {
    await checkoutStore.processPayment()
    navigateTo('/checkout/confirmation')
  } catch (error) {
    toast.error('Failed to place order', error.message)
  } finally {
    processing.value = false
  }
}
</script>
```

### Inline Edit Functionality

For high-trust users (returning customers), consider **inline editing** to avoid navigation:

```vue
<!-- components/checkout/InlineEditableSection.vue -->
<template>
  <div class="editable-section">
    <div v-if="!editing" class="view-mode">
      <slot name="summary" />
      <Button
        variant="ghost"
        size="sm"
        @click="startEdit"
        class="edit-trigger"
      >
        Edit
      </Button>
    </div>

    <div v-else class="edit-mode">
      <slot name="editor" />
      <div class="edit-actions">
        <Button
          variant="outline"
          @click="cancelEdit"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          @click="saveEdit"
          :loading="saving"
        >
          Save Changes
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const editing = ref(false)
const saving = ref(false)

const emit = defineEmits(['save', 'cancel'])

const startEdit = () => {
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
  emit('cancel')
}

const saveEdit = async () => {
  saving.value = true
  try {
    await emit('save')
    editing.value = false
  } finally {
    saving.value = false
  }
}
</script>
```

---

## 4. UX Patterns & Visual Design

### Visual Indicators for Pre-filled Data

#### 1. **Green Checkmark Icons**
```vue
<template>
  <div class="field-group">
    <label class="flex items-center gap-2">
      <span>Shipping Address</span>
      <CheckCircleIcon
        v-if="isPreFilled"
        class="w-5 h-5 text-green-600"
        aria-label="Pre-filled from your profile"
      />
    </label>
    <input
      v-model="address.street"
      :class="{ 'prefilled': isPreFilled }"
      readonly
    />
  </div>
</template>

<style scoped>
.prefilled {
  @apply bg-green-50 border-green-300;
}
</style>
```

#### 2. **"Saved" Badge**
```vue
<div class="relative">
  <AddressCard :address="defaultAddress" />
  <Badge
    class="absolute top-2 right-2 bg-green-100 text-green-800"
  >
    <BookmarkIcon class="w-3 h-3 mr-1" />
    Saved Address
  </Badge>
</div>
```

#### 3. **Auto-fill Animation**
```vue
<Transition name="autofill">
  <div v-if="autoFilling" class="autofill-indicator">
    <SpinnerIcon class="animate-spin" />
    Loading your saved information...
  </div>
</Transition>

<style scoped>
.autofill-enter-active, .autofill-leave-active {
  transition: all 0.3s ease;
}
.autofill-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.autofill-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
```

### Trust Signals & Security Icons

Based on [research](https://www.webstacks.com/blog/trust-signals), adding a simple lock icon can increase conversions by **17%**.

```vue
<!-- components/checkout/TrustSignalsBar.vue -->
<template>
  <div class="trust-signals flex items-center justify-center gap-8 py-6 border-t">
    <!-- SSL Security -->
    <div class="trust-item">
      <LockClosedIcon class="w-5 h-5 text-green-600" />
      <span class="text-sm text-gray-600">Secure Checkout</span>
    </div>

    <!-- Money-back Guarantee -->
    <div class="trust-item">
      <ShieldCheckIcon class="w-5 h-5 text-blue-600" />
      <span class="text-sm text-gray-600">30-Day Returns</span>
    </div>

    <!-- Payment Methods -->
    <div class="trust-item">
      <CreditCardIcon class="w-5 h-5 text-purple-600" />
      <div class="flex gap-2">
        <img src="/icons/visa.svg" alt="Visa" class="h-6" />
        <img src="/icons/mastercard.svg" alt="Mastercard" class="h-6" />
        <img src="/icons/paypal.svg" alt="PayPal" class="h-6" />
      </div>
    </div>

    <!-- Data Privacy -->
    <div class="trust-item">
      <EyeSlashIcon class="w-5 h-5 text-gray-600" />
      <span class="text-sm text-gray-600">Privacy Protected</span>
    </div>
  </div>
</template>

<style scoped>
.trust-item {
  @apply flex items-center gap-2;
}
</style>
```

### Saved Card Indicators

```vue
<!-- components/checkout/SavedCardDisplay.vue -->
<template>
  <div class="saved-card border rounded-lg p-4 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <!-- Card Brand Icon -->
      <div class="card-brand-icon">
        <component :is="getCardIcon(card.brand)" class="w-12 h-8" />
      </div>

      <!-- Card Details -->
      <div>
        <p class="font-medium">
          {{ card.brand }} •••• {{ card.last4 }}
        </p>
        <p class="text-sm text-gray-500">
          Expires {{ card.exp_month }}/{{ card.exp_year }}
        </p>
      </div>
    </div>

    <!-- Trust Indicators -->
    <div class="flex items-center gap-3">
      <!-- Default Badge -->
      <Badge v-if="card.is_default" variant="success">
        Default
      </Badge>

      <!-- Verified Badge -->
      <div class="flex items-center gap-1 text-green-600">
        <ShieldCheckIcon class="w-4 h-4" />
        <span class="text-xs">Verified</span>
      </div>

      <!-- Lock Icon -->
      <LockClosedIcon class="w-4 h-4 text-gray-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
const getCardIcon = (brand: string) => {
  const icons = {
    visa: VisaIcon,
    mastercard: MastercardIcon,
    amex: AmexIcon,
    discover: DiscoverIcon
  }
  return icons[brand.toLowerCase()] || CreditCardIcon
}
</script>
```

### Edit Button Placement

Place edit buttons in **consistent, expected locations**:

```vue
<template>
  <div class="section-container">
    <!-- Option 1: Top-right (Desktop) -->
    <div class="section-header flex justify-between items-center">
      <h3 class="text-lg font-semibold">Shipping Address</h3>
      <Button variant="ghost" size="sm" @click="edit">
        <PencilIcon class="w-4 h-4 mr-2" />
        Edit
      </Button>
    </div>

    <!-- Option 2: Bottom-left (after content) -->
    <div class="section-content">
      <AddressSummary :address="address" />
    </div>
    <div class="section-footer">
      <Button variant="link" @click="edit">
        Change shipping address
      </Button>
    </div>

    <!-- Option 3: Inline (next to each field) - for granular editing -->
    <div class="field-row flex items-center justify-between">
      <span>{{ address.street }}</span>
      <Button variant="ghost" size="xs" @click="editField('street')">
        Edit
      </Button>
    </div>
  </div>
</template>
```

---

## 5. Performance Considerations

### When to Pre-fetch Data

#### Strategy 1: Aggressive Pre-fetching (Recommended)
Pre-fetch user data as soon as they add first item to cart:

```typescript
// In composables/useCart.ts or plugins/cart.client.ts
export function useCart() {
  const cartStore = useCartStore()
  const checkoutStore = useCheckoutStore()
  const user = useSupabaseUser()

  // Watch for first item added
  watch(
    () => cartStore.itemCount,
    async (newCount, oldCount) => {
      // Pre-fetch on first item add
      if (newCount === 1 && oldCount === 0 && user.value) {
        console.log('🚀 Pre-fetching checkout data (first item added)')
        await checkoutStore.prefetchCheckoutData()
      }
    }
  )

  return {
    // ... existing cart methods
  }
}
```

#### Strategy 2: Progressive Pre-fetching
Pre-fetch in stages based on user intent:

```typescript
// Stage 1: Basic data on cart page view
onMounted(async () => {
  if (user.value && !checkoutStore.basicDataLoaded) {
    await checkoutStore.prefetchBasicData() // Just addresses
  }
})

// Stage 2: Full data when "Checkout" button is visible/hovered
const checkoutButton = ref<HTMLElement>()
const { stop } = useIntersectionObserver(
  checkoutButton,
  ([{ isIntersecting }]) => {
    if (isIntersecting && user.value && !checkoutStore.fullDataLoaded) {
      checkoutStore.prefetchFullData() // Addresses + payment methods + preferences
      stop()
    }
  }
)
```

#### Strategy 3: On-demand with Cache
Pre-fetch only when needed, but cache aggressively:

```typescript
// stores/checkout/session.ts
export const useCheckoutSessionStore = defineStore('checkout-session', () => {
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const prefetchCheckoutData = async () => {
    // Check cache first
    const cached = sessionStorage.getItem('checkout_data_cache')
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('✅ Using cached checkout data')
        loadCachedData(data)
        return
      }
    }

    // Fetch fresh data
    const data = await $fetch('/api/checkout/user-data')

    // Cache for future use
    sessionStorage.setItem('checkout_data_cache', JSON.stringify({
      data,
      timestamp: Date.now()
    }))

    loadFreshData(data)
  }

  return { prefetchCheckoutData }
})
```

### Loading States

Use **skeleton screens** instead of spinners for better perceived performance:

```vue
<!-- components/checkout/AddressFormSkeleton.vue -->
<template>
  <div class="space-y-4 animate-pulse">
    <div class="h-10 bg-gray-200 rounded"></div>
    <div class="grid grid-cols-2 gap-4">
      <div class="h-10 bg-gray-200 rounded"></div>
      <div class="h-10 bg-gray-200 rounded"></div>
    </div>
    <div class="h-10 bg-gray-200 rounded"></div>
    <div class="h-10 bg-gray-200 rounded"></div>
  </div>
</template>
```

**Usage:**
```vue
<Suspense>
  <template #default>
    <AddressForm v-model="address" />
  </template>
  <template #fallback>
    <AddressFormSkeleton />
  </template>
</Suspense>
```

### Session Management

Use **hybrid approach** - cookies for persistence, session storage for performance:

```typescript
// config/cookies.ts
export const CHECKOUT_COOKIE_CONFIG = {
  maxAge: 60 * 60 * 24 * 7, // 7 days
  secure: true,
  httpOnly: false, // Allow client-side access
  sameSite: 'lax' as const,
  path: '/checkout'
} as const

// stores/checkout/session.ts
export const useCheckoutSessionStore = defineStore('checkout-session', () => {
  const checkoutCookie = useCookie('checkout_session', CHECKOUT_COOKIE_CONFIG)

  // Session storage for temporary state (cleared on tab close)
  const sessionCache = ref<CheckoutSessionCache>({
    expandedSections: {},
    scrollPosition: 0,
    lastInteraction: Date.now()
  })

  // Cookie for persistent state (survives tab close)
  const persist = async (data: CheckoutSessionData) => {
    // Save to cookie
    checkoutCookie.value = {
      sessionId: data.sessionId,
      shippingInfo: data.shippingInfo,
      paymentMethod: data.paymentMethod,
      timestamp: Date.now()
    }

    // Also save to session storage for quick access
    if (import.meta.client) {
      sessionStorage.setItem('checkout_cache', JSON.stringify(sessionCache.value))
    }
  }

  return { persist, sessionCache }
})
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create `determineOptimalCheckoutStep()` function
- [ ] Enhance middleware with smart routing
- [ ] Add data validation helpers
- [ ] Update `prefetchCheckoutData()` to include payment methods
- [ ] Implement basic caching layer

### Phase 2: UX Components (Week 3-4)
- [ ] Build `AccordionSection` component
- [ ] Create `AddressSummaryCompact` component
- [ ] Build `PaymentMethodSummary` component
- [ ] Implement `TrustSignalsBar` component
- [ ] Add `ExpressCheckoutBadge` component
- [ ] Create skeleton loading states

### Phase 3: Smart Routing (Week 5-6)
- [ ] Implement auto-advance logic in ShippingStep
- [ ] Add countdown timer for express checkout
- [ ] Build inline edit functionality
- [ ] Add "Change" buttons with smooth navigation
- [ ] Implement edit mode state management

### Phase 4: Performance & Polish (Week 7-8)
- [ ] Add progressive pre-fetching
- [ ] Implement intersection observer for checkout button
- [ ] Add session storage caching
- [ ] Optimize image loading for payment icons
- [ ] Add analytics tracking for express checkout usage
- [ ] A/B test auto-advance timing (2s vs 5s)

### Phase 5: Testing & Optimization (Week 9-10)
- [ ] User testing with 5-10 returning customers
- [ ] Performance audit (Lighthouse)
- [ ] Conversion rate analysis
- [ ] Mobile responsiveness testing
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## 7. Code Examples

### Complete Smart Routing Composable

```typescript
// composables/useSmartCheckoutRouting.ts
import type { CheckoutStep, UserCheckoutData } from '~/types/checkout'

export function useSmartCheckoutRouting() {
  const checkoutStore = useCheckoutStore()
  const localePath = useLocalePath()
  const router = useRouter()

  /**
   * Determine optimal landing step based on user data
   */
  const determineOptimalStep = (userData: UserCheckoutData): CheckoutStep => {
    // Recent order confirmation
    if (userData.recentOrderId && isWithinTimeframe(userData.orderCompletedAt, 5)) {
      return 'confirmation'
    }

    // Validate data completeness
    const hasValidShipping = validateShippingData(
      userData.savedAddress,
      userData.preferences?.preferred_shipping_method
    )
    const hasValidPayment = validatePaymentData(userData.savedPaymentMethods)

    // Express checkout - both complete
    if (hasValidShipping && hasValidPayment) {
      return 'review'
    }

    // Partial completion - shipping only
    if (hasValidShipping && !hasValidPayment) {
      return 'payment'
    }

    // Default - nothing saved
    return 'shipping'
  }

  /**
   * Validate shipping data completeness and recency
   */
  const validateShippingData = (address?: Address, preferredMethod?: string): boolean => {
    if (!address) return false

    const hasRequiredFields = !!(
      address.firstName &&
      address.lastName &&
      address.street &&
      address.city &&
      address.postalCode &&
      address.country
    )

    const lastUsed = address.last_used_at || address.created_at
    const isRecent = isWithinTimeframe(lastUsed, 180) // 6 months

    return hasRequiredFields && isRecent && !!preferredMethod
  }

  /**
   * Validate payment method (not expired)
   */
  const validatePaymentData = (methods?: SavedPaymentMethod[]): boolean => {
    if (!methods || methods.length === 0) return false

    const defaultMethod = methods.find(m => m.is_default) || methods[0]

    // Check card expiry for credit/debit cards
    if (defaultMethod.type === 'card') {
      const expiryDate = parseCardExpiry(defaultMethod.card_expiry)
      if (!expiryDate || expiryDate < new Date()) return false
    }

    return true
  }

  /**
   * Parse card expiry string (MM/YY) to Date
   */
  const parseCardExpiry = (expiry?: string): Date | null => {
    if (!expiry) return null
    const [month, year] = expiry.split('/')
    return new Date(2000 + parseInt(year), parseInt(month) - 1)
  }

  /**
   * Check if date is within X days of now
   */
  const isWithinTimeframe = (date: string | Date | undefined, days: number): boolean => {
    if (!date) return false
    const targetDate = new Date(date)
    const now = new Date()
    const diffDays = (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= days
  }

  /**
   * Navigate to optimal checkout step
   */
  const navigateToOptimalStep = async () => {
    const userData: UserCheckoutData = {
      savedAddress: checkoutStore.savedAddresses?.[0],
      savedPaymentMethods: checkoutStore.savedPaymentMethods,
      preferences: checkoutStore.preferences,
      recentOrderId: checkoutStore.orderData?.orderId,
      orderCompletedAt: checkoutStore.orderData?.completedAt
    }

    const optimalStep = determineOptimalStep(userData)

    // Track analytics
    if (import.meta.client && window.gtag) {
      window.gtag('event', 'smart_checkout_routing', {
        optimal_step: optimalStep,
        has_saved_address: !!userData.savedAddress,
        has_saved_payment: !!userData.savedPaymentMethods?.length
      })
    }

    // Navigate
    const path = getStepPath(optimalStep)
    await router.push(path)
  }

  /**
   * Get path for checkout step
   */
  const getStepPath = (step: CheckoutStep): string => {
    const paths = {
      shipping: '/checkout',
      payment: '/checkout/payment',
      review: '/checkout/review',
      confirmation: '/checkout/confirmation'
    }
    return localePath(paths[step])
  }

  return {
    determineOptimalStep,
    validateShippingData,
    validatePaymentData,
    navigateToOptimalStep,
    getStepPath
  }
}
```

### Accordion Section Component

```vue
<!-- components/checkout/AccordionSection.vue -->
<template>
  <div
    class="accordion-section border rounded-lg overflow-hidden"
    :class="{ 'border-green-500': completed, 'border-gray-200': !completed }"
  >
    <!-- Header (always visible) -->
    <button
      class="section-header w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      @click="toggle"
      :aria-expanded="isExpanded"
    >
      <div class="flex items-center gap-3">
        <!-- Icon -->
        <component
          :is="icon"
          class="w-6 h-6"
          :class="completed ? 'text-green-600' : 'text-gray-400'"
        />

        <!-- Title -->
        <h3 class="text-lg font-semibold">{{ title }}</h3>

        <!-- Completed Badge -->
        <CheckCircleIcon
          v-if="completed"
          class="w-5 h-5 text-green-600"
        />
      </div>

      <div class="flex items-center gap-4">
        <!-- Edit Button (when collapsed and editable) -->
        <Button
          v-if="!isExpanded && editable"
          variant="ghost"
          size="sm"
          @click.stop="edit"
        >
          <PencilIcon class="w-4 h-4 mr-2" />
          Edit
        </Button>

        <!-- Expand/Collapse Icon -->
        <ChevronDownIcon
          class="w-5 h-5 text-gray-400 transition-transform"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </button>

    <!-- Summary (visible when collapsed) -->
    <div
      v-if="!isExpanded && $slots.summary"
      class="section-summary px-6 py-3 bg-gray-50 border-t"
    >
      <slot name="summary" />
    </div>

    <!-- Content (visible when expanded) -->
    <Transition
      name="accordion"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
    >
      <div
        v-show="isExpanded"
        class="section-content"
      >
        <div class="px-6 py-4 border-t">
          <slot name="content" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  ChevronDownIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'

interface Props {
  title: string
  icon: any
  completed?: boolean
  editable?: boolean
  defaultExpanded?: boolean
  expanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  completed: false,
  editable: true,
  defaultExpanded: false
})

const emit = defineEmits(['update:expanded', 'edit'])

const localExpanded = ref(props.defaultExpanded)

const isExpanded = computed({
  get: () => props.expanded !== undefined ? props.expanded : localExpanded.value,
  set: (val) => {
    localExpanded.value = val
    emit('update:expanded', val)
  }
})

const toggle = () => {
  isExpanded.value = !isExpanded.value
}

const edit = () => {
  emit('edit')
  isExpanded.value = true
}

// Accordion animation handlers
const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.overflow = 'hidden'
}

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = element.scrollHeight + 'px'
  setTimeout(() => {
    element.style.height = 'auto'
    element.style.overflow = 'visible'
  }, 300)
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = element.scrollHeight + 'px'
  element.style.overflow = 'hidden'
  requestAnimationFrame(() => {
    element.style.height = '0'
  })
}
</script>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: height 0.3s ease;
}

.section-summary {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
```

### Express Checkout Countdown Banner

```vue
<!-- components/checkout/ExpressCheckoutCountdown.vue -->
<template>
  <Transition name="slide-down">
    <div
      v-if="!dismissed"
      class="express-checkout-banner bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 mb-6"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <BoltIcon class="w-6 h-6 text-green-600" />
            <h3 class="text-lg font-bold text-gray-900">Express Checkout</h3>
            <Badge variant="success">Fast Track</Badge>
          </div>

          <p class="text-gray-700 mb-4">
            We found your saved information. You can complete this order in under 10 seconds!
          </p>

          <!-- Preview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <!-- Address Preview -->
            <div class="bg-white rounded-lg p-3 border border-gray-200">
              <div class="flex items-center gap-2 mb-2">
                <TruckIcon class="w-4 h-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Shipping</span>
              </div>
              <p class="text-sm text-gray-600">
                {{ defaultAddress.street }}, {{ defaultAddress.city }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ preferredShippingMethod?.name }}
              </p>
            </div>

            <!-- Payment Preview -->
            <div class="bg-white rounded-lg p-3 border border-gray-200">
              <div class="flex items-center gap-2 mb-2">
                <CreditCardIcon class="w-4 h-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Payment</span>
              </div>
              <p class="text-sm text-gray-600">
                {{ defaultPayment.brand }} •••• {{ defaultPayment.last4 }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Expires {{ defaultPayment.exp_month }}/{{ defaultPayment.exp_year }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              @click="useExpressCheckout"
              :disabled="countdown <= 0"
              class="relative"
            >
              <BoltIcon class="w-5 h-5 mr-2" />
              {{ countdown > 0 ? `Continue (${countdown}s)` : 'Review Order' }}

              <!-- Progress Bar -->
              <div
                class="absolute bottom-0 left-0 h-1 bg-green-300 transition-all duration-1000"
                :style="{ width: `${(countdown / totalSeconds) * 100}%` }"
              ></div>
            </Button>

            <Button
              variant="outline"
              @click="dismiss"
            >
              Use Different Info
            </Button>
          </div>
        </div>

        <!-- Close Button -->
        <button
          @click="dismiss"
          class="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  BoltIcon,
  TruckIcon,
  CreditCardIcon,
  XMarkIcon
} from '@heroicons/vue/24/solid'

interface Props {
  defaultAddress: Address
  preferredShippingMethod?: ShippingMethod
  defaultPayment?: SavedPaymentMethod
  autoAdvanceSeconds?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoAdvanceSeconds: 5
})

const emit = defineEmits(['use-express', 'dismiss'])

const dismissed = ref(false)
const countdown = ref(props.autoAdvanceSeconds)
const totalSeconds = props.autoAdvanceSeconds
let intervalId: NodeJS.Timeout | null = null

const startCountdown = () => {
  intervalId = setInterval(() => {
    countdown.value--

    if (countdown.value <= 0) {
      stopCountdown()
      // Auto-advance to review page
      useExpressCheckout()
    }
  }, 1000)
}

const stopCountdown = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const useExpressCheckout = () => {
  stopCountdown()
  emit('use-express')
}

const dismiss = () => {
  stopCountdown()
  dismissed.value = true
  emit('dismiss')
}

onMounted(() => {
  startCountdown()
})

onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
```

---

## Sources

### Official Documentation & Research
- [Amazon's Checkout Process UX Case Study 2024](https://www.shaheermalik.com/blog/amazon-checkout-process-ux-design-case-study)
- [15 Ecommerce Checkout & Cart UX Best Practices for 2025](https://www.designstudiouiux.com/blog/ecommerce-checkout-ux-best-practices/)
- [Checkout UX Best Practices 2025 – Baymard Institute](https://baymard.com/blog/current-state-of-checkout-ux)
- [Always Collapse Completed Accordion Checkout Steps – Baymard](https://baymard.com/blog/accordion-checkout-usability)

### E-commerce Best Practices
- [Ecommerce Checkout: 10 Best Practices for 2025 | Salesforce](https://www.salesforce.com/commerce/online-payment-solution/checkout-guide/)
- [6 Steps for Designing Your eCommerce Checkout Flow | Cloudflight](https://www.cloudflight.io/en/blog/6-steps-for-designing-your-ecommerce-checkout-flow/)
- [One-Click Checkout: 5 Examples & Tested Tactics (2025)](https://wisernotify.com/blog/one-click-checkout/)

### UX & Visual Design
- [Trust Signals: What Are They & How to Use Them](https://www.webstacks.com/blog/trust-signals)
- [How Users Perceive Security During Checkout – Baymard](https://baymard.com/blog/perceived-security-of-payment-form)
- [14 eCommerce Checkout Page Examples That Increase Conversions](https://contentsquare.com/guides/ecommerce-cro/checkout-pages/)

### Performance & Technical
- [Nuxt Performance Best Practices v4](https://nuxt.com/docs/4.x/guide/best-practices/performance)
- [Data Fetching in Nuxt 3: A Comprehensive Guide](https://dulan.me/blog/nuxt-3-data-fetching-composables/)
- [State Management with Composition API - Vue School](https://vueschool.io/articles/vuejs-tutorials/state-management-with-composition-api/)
- [Persisting Vue.js Pinia States: A Step-by-Step Guide](https://blog.openreplay.com/persisting-vue-pinia-state/)

### Payment & Express Checkout
- [Accept a Payment with Express Checkout Element | Stripe](https://docs.stripe.com/elements/express-checkout-element/accept-a-payment)
- [Express Checkout | Adyen Docs](https://docs.adyen.com/payment-methods/express-checkout)
- [Intelligent Payment Routing Explained | Checkout.com](https://www.checkout.com/blog/intelligent-payment-routing-explained)

---

## Summary

Implementing Amazon-style express checkout for Moldova Direct requires:

1. **Smart routing** that detects user data completeness and navigates to optimal step
2. **Collapsible review sections** with summaries (never header-only)
3. **Pre-fetching** user data aggressively (on first cart item add)
4. **Trust signals** (lock icons, badges, secure payment icons)
5. **Skeleton loading** for better perceived performance
6. **Session + cookie hybrid** for persistence and speed

The key insight: **Reduce cognitive load** by pre-filling everything possible and only asking users to confirm, not re-enter. Users exhibit patterns of skimming and looking for trust signals (green checkmarks, lock icons) rather than reading content.

**Expected Impact:**
- Returning customers: 60-90s → **< 10s** checkout time
- Partial data customers: 60-90s → **< 20s** checkout time
- Conversion rate increase: **15-35%** (based on Baymard research)

Use the provided code examples as starting points and adapt to your specific business requirements and brand guidelines.
