# Design Document

## Overview

This refactor separates the ShippingStep component into focused, single-responsibility pieces. The main component becomes a thin orchestration layer that composes smaller UI components and delegates logic to specialized composables. This approach improves testability, reduces complexity, and makes the codebase easier to maintain.

## Architecture

### Component Structure

```
ShippingStep.vue (Orchestrator - ~80 lines)
├── GuestCheckoutPrompt.vue (UI only - ~40 lines)
├── GuestInfoForm.vue (UI + validation - ~60 lines)
├── AddressForm.vue (Existing - already good)
├── ShippingMethodSelector.vue (Existing - already good)
├── ShippingInstructions.vue (UI only - ~30 lines)
└── CheckoutNavigation.vue (UI + events - ~40 lines)
```

### Composables Structure

```
composables/
├── useShippingMethods.ts (API + state management)
├── useGuestCheckout.ts (Guest info + validation)
└── useShippingAddress.ts (Address validation + helpers)
```

## Components and Interfaces

### ShippingStep.vue (Refactored)

**Purpose:** Orchestrate the shipping step flow and compose child components.

```typescript
// Simplified structure - delegates to composables
const { 
  showGuestForm, 
  guestInfo, 
  guestErrors, 
  isGuestInfoValid,
  continueAsGuest,
  validateGuestField,
  clearGuestFieldError 
} = useGuestCheckout()

const {
  shippingAddress,
  isAddressValid,
  savedAddresses,
  loadSavedAddresses,
  handleSaveAddress
} = useShippingAddress()

const {
  selectedMethod,
  availableMethods,
  loading: loadingMethods,
  error: methodsError,
  loadShippingMethods
} = useShippingMethods(shippingAddress)
```

### New Components

#### GuestCheckoutPrompt.vue

**Purpose:** Display login/guest options for non-authenticated users.

```typescript
interface Props {
  show: boolean
}

interface Emits {
  (e: 'continue-as-guest'): void
}
```

#### GuestInfoForm.vue

**Purpose:** Collect and validate guest email information.

```typescript
interface Props {
  modelValue: {
    email: string
    emailUpdates: boolean
  }
  errors: Record<string, string>
}

interface Emits {
  (e: 'update:modelValue', value: GuestInfo): void
  (e: 'validate', field: string): void
  (e: 'clear-error', field: string): void
}
```

#### ShippingInstructions.vue

**Purpose:** Collect optional delivery instructions.

```typescript
interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}
```

#### CheckoutNavigation.vue

**Purpose:** Provide consistent navigation buttons across checkout steps.

```typescript
interface Props {
  canProceed: boolean
  processing: boolean
  backLabel?: string
  nextLabel?: string
  backTo?: string
}

interface Emits {
  (e: 'proceed'): void
}
```

### Composables

#### useShippingMethods.ts

**Purpose:** Manage shipping method loading, caching, and state.

```typescript
export function useShippingMethods(address: Ref<Address>) {
  const availableMethods = ref<ShippingMethod[]>([])
  const selectedMethod = ref<ShippingMethod | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Debounced loading with address change detection
  const loadShippingMethods = useDebounceFn(async () => {
    if (!isValidAddress(address.value)) return
    
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch('/api/checkout/shipping-methods', {
        query: {
          country: address.value.country,
          postalCode: address.value.postalCode,
          orderTotal: checkoutStore.orderData?.subtotal || 0
        }
      })
      
      availableMethods.value = localizeShippingMethods(response.methods)
    } catch (e) {
      error.value = e.message
      availableMethods.value = getFallbackMethods()
    } finally {
      loading.value = false
    }
  }, 1000)
  
  return {
    availableMethods,
    selectedMethod,
    loading,
    error,
    loadShippingMethods
  }
}
```

#### useGuestCheckout.ts

**Purpose:** Manage guest checkout state and validation.

```typescript
export function useGuestCheckout() {
  const showGuestForm = ref(false)
  const guestInfo = ref({
    email: '',
    emailUpdates: false
  })
  const guestErrors = ref<Record<string, string>>({})
  
  const isGuestInfoValid = computed(() => {
    return guestInfo.value.email && !guestErrors.value.email
  })
  
  const continueAsGuest = () => {
    showGuestForm.value = true
  }
  
  const validateGuestField = (field: string) => {
    if (field === 'email') {
      const email = guestInfo.value.email
      if (!email) {
        guestErrors.value.email = t('checkout.validation.emailRequired')
      } else if (!isValidEmail(email)) {
        guestErrors.value.email = t('checkout.validation.emailInvalid')
      } else {
        delete guestErrors.value.email
      }
    }
  }
  
  const clearGuestFieldError = (field: string) => {
    delete guestErrors.value[field]
  }
  
  return {
    showGuestForm,
    guestInfo,
    guestErrors,
    isGuestInfoValid,
    continueAsGuest,
    validateGuestField,
    clearGuestFieldError
  }
}
```

#### useShippingAddress.ts

**Purpose:** Manage address state, validation, and saved addresses.

```typescript
export function useShippingAddress() {
  const user = useSupabaseUser()
  const checkoutStore = useCheckoutStore()
  
  const shippingAddress = ref<Address>({
    type: 'shipping',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
    phone: ''
  })
  
  const savedAddresses = ref<Address[]>([])
  
  const isAddressValid = computed(() => {
    return !!(
      shippingAddress.value.firstName &&
      shippingAddress.value.lastName &&
      shippingAddress.value.street &&
      shippingAddress.value.city &&
      shippingAddress.value.postalCode &&
      shippingAddress.value.country
    )
  })
  
  const loadSavedAddresses = async () => {
    if (!user.value) return
    
    try {
      const response = await $fetch('/api/checkout/addresses')
      if (response.success) {
        savedAddresses.value = mapAddressesFromApi(response.addresses)
      }
    } catch (error) {
      console.error('Failed to load saved addresses:', error)
    }
  }
  
  const handleSaveAddress = async (address: Address) => {
    if (!user.value) return
    
    try {
      const response = await $fetch('/api/checkout/addresses', {
        method: 'POST',
        body: address
      })
      
      if (response.success && response.address) {
        savedAddresses.value.push(mapAddressFromApi(response.address))
      }
    } catch (error) {
      console.error('Failed to save address:', error)
    }
  }
  
  return {
    shippingAddress,
    savedAddresses,
    isAddressValid,
    loadSavedAddresses,
    handleSaveAddress
  }
}
```

## Data Models

All existing data models remain unchanged. The refactor only reorganizes code structure.

## Error Handling

Error handling is centralized in composables:

- **useShippingMethods**: Handles API errors with fallback methods
- **useGuestCheckout**: Handles validation errors with i18n messages
- **useShippingAddress**: Handles save/load errors gracefully

## Testing Strategy

### Unit Tests

Each composable can be tested independently:

```typescript
describe('useShippingMethods', () => {
  it('loads methods when address is valid', async () => {
    const address = ref(validAddress)
    const { loadShippingMethods, availableMethods } = useShippingMethods(address)
    
    await loadShippingMethods()
    
    expect(availableMethods.value.length).toBeGreaterThan(0)
  })
  
  it('debounces multiple calls', async () => {
    // Test debouncing logic
  })
})
```

### Component Tests

Components become simpler to test with props/events:

```typescript
describe('GuestInfoForm', () => {
  it('emits validation on blur', async () => {
    const wrapper = mount(GuestInfoForm, {
      props: { modelValue: { email: '', emailUpdates: false }, errors: {} }
    })
    
    await wrapper.find('input[type="email"]').trigger('blur')
    
    expect(wrapper.emitted('validate')).toBeTruthy()
  })
})
```

## Implementation Benefits

1. **Reduced Complexity**: Main component goes from ~400 lines to ~80 lines
2. **Better Testability**: Logic in composables can be unit tested easily
3. **Improved Reusability**: Composables can be used in other checkout steps
4. **Easier Debugging**: Clear separation makes it easier to locate issues
5. **Better Performance**: Debouncing and state management are optimized
