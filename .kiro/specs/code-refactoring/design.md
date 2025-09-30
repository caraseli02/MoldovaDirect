# Code Refactoring Design Document

## Overview

This document outlines the technical design for refactoring oversized files in the Moldova Direct e-commerce platform. The refactoring will transform monolithic files into modular, maintainable components while preserving all existing functionality and maintaining backward compatibility.

## Architecture

### Current State Analysis

#### Cart Store Issues (stores/cart.ts - 2,666 lines)
- **Monolithic Structure**: Single file handling multiple concerns
- **Mixed Responsibilities**: Validation, analytics, security, persistence all in one place
- **Testing Challenges**: Difficult to test individual features in isolation
- **Maintenance Burden**: Changes require understanding the entire file
- **Performance Impact**: Large bundle size affects initial load

#### Checkout Store Issues (stores/checkout.ts - 1,063+ lines)
- **Complex State Management**: Multiple checkout steps and validation in one file
- **Payment Logic Mixing**: Different payment methods handled in single location
- **Scalability Concerns**: Adding new features requires modifying large file

### Target Architecture

#### Modular Cart System
```
stores/cart/
├── index.ts                 # Main cart store (coordinator)
├── types.ts                 # TypeScript interfaces and types
├── core.ts                  # Basic cart operations (add, remove, update)
├── validation.ts            # Product validation and caching
├── security.ts              # Security features and validation
├── analytics.ts             # Cart analytics and tracking
├── persistence.ts           # Storage and session management
├── advanced.ts              # Save for later, bulk operations
└── recommendations.ts       # Product recommendations
```

#### Modular Checkout System
```
stores/checkout/
├── index.ts                 # Main checkout store
├── types.ts                 # Checkout-specific types
├── shipping.ts              # Shipping logic and validation
├── payment.ts               # Payment processing
├── order.ts                 # Order creation and management
└── validation.ts            # Checkout validation utilities
```

#### Component Structure
```
components/
├── cart/
│   ├── CartCore.vue         # Basic cart display
│   ├── CartItem.vue         # Individual cart item
│   ├── CartSummary.vue      # Cart totals and summary
│   └── CartActions.vue      # Cart action buttons
├── checkout/
│   ├── steps/
│   │   ├── ShippingStep.vue
│   │   ├── PaymentStep.vue
│   │   └── ReviewStep.vue
│   └── forms/
│       ├── AddressForm.vue
│       └── payment/
│           ├── CashPayment.vue
│           ├── CreditCardPayment.vue
│           ├── PayPalPayment.vue
│           └── BankTransferPayment.vue
```

#### Composables Structure
```
composables/
├── cart/
│   ├── useCartCore.ts       # Basic cart operations
│   ├── useCartValidation.ts # Validation logic
│   ├── useCartAnalytics.ts  # Analytics functionality
│   ├── useCartSecurity.ts   # Security features
│   └── useCartPersistence.ts # Storage management
├── checkout/
│   ├── useCheckoutCore.ts   # Core checkout logic
│   ├── useCheckoutValidation.ts # Validation utilities
│   └── useCheckoutPayment.ts # Payment processing
└── shared/
    ├── useValidation.ts     # Shared validation utilities
    └── useStorage.ts        # Shared storage utilities
```

## Components and Interfaces

### Cart Store Modules

#### Core Module (stores/cart/core.ts)
```typescript
export interface CartCoreState {
  items: CartItem[]
  sessionId: string | null
  loading: boolean
  error: string | null
}

export interface CartCoreActions {
  addItem(product: Product, quantity: number): Promise<void>
  removeItem(itemId: string): Promise<void>
  updateQuantity(itemId: string, quantity: number): Promise<void>
  clearCart(): Promise<void>
  generateItemId(): string
  generateSessionId(): string
}
```

#### Validation Module (stores/cart/validation.ts)
```typescript
export interface ValidationCache {
  [productId: string]: {
    isValid: boolean
    product: Product
    timestamp: number
    ttl: number
  }
}

export interface ValidationActions {
  validateProduct(productId: string): Promise<void>
  batchValidateProducts(productIds: string[]): Promise<void>
  getCachedValidation(productId: string): ValidationResult | null
  setCachedValidation(productId: string, result: ValidationResult): void
  startBackgroundValidation(): void
  stopBackgroundValidation(): void
}
```

#### Analytics Module (stores/cart/analytics.ts)
```typescript
export interface AnalyticsState {
  sessionStartTime: Date | null
  lastActivity: Date | null
  events: AnalyticsEvent[]
  abandonmentTimer: NodeJS.Timeout | null
}

export interface AnalyticsActions {
  trackAddToCart(product: Product, quantity: number): void
  trackRemoveFromCart(product: Product, quantity: number): void
  trackCartView(): void
  trackAbandonmentWarning(): void
  syncEventsWithServer(): Promise<void>
}
```

### Checkout Store Modules

#### Shipping Module (stores/checkout/shipping.ts)
```typescript
export interface ShippingState {
  shippingInfo: ShippingInformation | null
  availableShippingMethods: ShippingMethod[]
  savedAddresses: Address[]
}

export interface ShippingActions {
  updateShippingInfo(info: ShippingInformation): Promise<void>
  loadShippingMethods(): Promise<void>
  validateShippingInfo(info: ShippingInformation): string[]
  calculateShippingCost(method: ShippingMethod): number
}
```

#### Payment Module (stores/checkout/payment.ts)
```typescript
export interface PaymentState {
  paymentMethod: PaymentMethod | null
  paymentIntent: string | null
  paymentClientSecret: string | null
  savedPaymentMethods: SavedPaymentMethod[]
}

export interface PaymentActions {
  updatePaymentMethod(method: PaymentMethod): Promise<void>
  preparePayment(): Promise<void>
  processPayment(): Promise<PaymentResult>
  validatePaymentMethod(method: PaymentMethod): string[]
}
```

## Data Models

### Enhanced Type Definitions

#### Cart Types (stores/cart/types.ts)
```typescript
export interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  stock: number
  category?: string
  weight?: number
  dimensions?: ProductDimensions
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  addedAt: Date
  lastModified?: Date
  source?: 'manual' | 'recommendation' | 'saved'
}

export interface CartSession {
  id: string
  userId?: string
  createdAt: Date
  lastActivity: Date
  expiresAt: Date
  metadata?: Record<string, any>
}
```

#### Checkout Types (stores/checkout/types.ts)
```typescript
export interface CheckoutSession {
  id: string
  cartItems: CartItem[]
  currentStep: CheckoutStep
  shippingInfo?: ShippingInformation
  paymentMethod?: PaymentMethod
  orderData?: OrderData
  expiresAt: Date
  metadata?: Record<string, any>
}

export interface OrderData {
  subtotal: number
  shippingCost: number
  tax: number
  discount?: number
  total: number
  currency: string
  items: OrderItem[]
  estimatedDelivery?: Date
}
```

## Error Handling

### Centralized Error Management

#### Error Types
```typescript
export interface CartError {
  type: 'validation' | 'inventory' | 'network' | 'storage' | 'security'
  code: string
  message: string
  field?: string
  retryable: boolean
  timestamp: Date
  context?: Record<string, any>
}

export interface CheckoutError {
  type: 'validation' | 'payment' | 'shipping' | 'inventory' | 'network'
  code: string
  message: string
  step?: CheckoutStep
  field?: string
  retryable: boolean
  userAction?: string
  timestamp: Date
}
```

#### Error Handling Strategy
1. **Module-Level Errors**: Each module handles its own error types
2. **Centralized Logging**: All errors are logged to a central error service
3. **User-Friendly Messages**: Errors are translated to user-friendly messages
4. **Recovery Actions**: Automatic retry for transient errors
5. **Fallback Behavior**: Graceful degradation when features fail

## Testing Strategy

### Unit Testing Approach

#### Module Testing
```typescript
// stores/cart/core.test.ts
describe('Cart Core Module', () => {
  it('should add item to cart', async () => {
    const cartCore = useCartCore()
    await cartCore.addItem(mockProduct, 1)
    expect(cartCore.items.value).toHaveLength(1)
  })
})

// stores/cart/validation.test.ts
describe('Cart Validation Module', () => {
  it('should validate product availability', async () => {
    const validation = useCartValidation()
    const result = await validation.validateProduct('product-1')
    expect(result.isValid).toBe(true)
  })
})
```

#### Component Testing
```typescript
// components/cart/CartItem.test.ts
describe('CartItem Component', () => {
  it('should display product information', () => {
    const wrapper = mount(CartItem, {
      props: { item: mockCartItem }
    })
    expect(wrapper.text()).toContain(mockCartItem.product.name)
  })
})
```

#### Integration Testing
```typescript
// tests/integration/cart-flow.test.ts
describe('Cart Integration', () => {
  it('should complete add to cart flow', async () => {
    // Test full flow from product page to cart
    await addProductToCart(mockProduct)
    await validateCartContents()
    await proceedToCheckout()
  })
})
```

### Performance Testing

#### Bundle Size Monitoring
- Track bundle size changes after refactoring
- Ensure tree-shaking works effectively
- Monitor lazy loading performance

#### Runtime Performance
- Measure store operation performance
- Track component render times
- Monitor memory usage patterns

## Migration Strategy

### Phase 1: Module Creation (Week 1)
1. Create new directory structure
2. Extract core cart operations
3. Create basic composables
4. Maintain backward compatibility

### Phase 2: Advanced Features (Week 2)
1. Extract validation and analytics modules
2. Create security and persistence modules
3. Update existing components to use new modules
4. Add comprehensive tests

### Phase 3: Checkout Refactoring (Week 3)
1. Modularize checkout store
2. Split payment form components
3. Create checkout-specific composables
4. Update checkout flow components

### Phase 4: Component Decomposition (Week 4)
1. Split large components into focused ones
2. Extract shared component logic
3. Create reusable UI components
4. Update component tests

### Phase 5: Optimization and Cleanup (Week 5)
1. Remove deprecated code
2. Optimize bundle size
3. Performance testing and optimization
4. Documentation updates

## Backward Compatibility

### API Preservation
```typescript
// stores/cart.ts (legacy compatibility layer)
export const useCartStore = defineStore('cart', () => {
  // Import new modules
  const core = useCartCore()
  const validation = useCartValidation()
  const analytics = useCartAnalytics()
  
  // Expose legacy API
  return {
    // Legacy getters and actions
    items: core.items,
    addItem: core.addItem,
    removeItem: core.removeItem,
    // ... other legacy methods
  }
})
```

### Import Compatibility
```typescript
// Ensure existing imports continue to work
export { useCartStore } from './cart'
export { useCheckoutStore } from './checkout'

// New modular imports (optional)
export { useCartCore } from './cart/core'
export { useCartValidation } from './cart/validation'
```

## Performance Considerations

### Bundle Optimization
- **Code Splitting**: Each module can be loaded independently
- **Tree Shaking**: Unused modules are excluded from bundles
- **Lazy Loading**: Non-critical modules loaded on demand

### Runtime Performance
- **Memoization**: Expensive computations are cached
- **Debouncing**: Frequent operations are debounced
- **Background Processing**: Heavy operations run in background

### Memory Management
- **Cleanup**: Proper cleanup of timers and event listeners
- **Weak References**: Use weak references where appropriate
- **Garbage Collection**: Avoid memory leaks in long-running processes

## Security Considerations

### Data Protection
- **Sensitive Data**: Payment information is not stored in modules
- **Validation**: All inputs are validated before processing
- **Sanitization**: User inputs are sanitized to prevent XSS

### Access Control
- **Module Isolation**: Modules only access their required data
- **Permission Checks**: Security-sensitive operations require validation
- **Audit Logging**: Security events are logged for monitoring

## Monitoring and Observability

### Performance Metrics
- Module load times
- Operation execution times
- Memory usage patterns
- Error rates by module

### Business Metrics
- Cart abandonment rates
- Checkout completion rates
- Payment method usage
- User interaction patterns

### Alerting
- High error rates
- Performance degradation
- Security incidents
- Business metric anomalies