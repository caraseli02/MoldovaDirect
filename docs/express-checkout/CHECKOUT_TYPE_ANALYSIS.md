# Checkout Flow TypeScript Type Analysis

**Analyzed Files:**
- `/types/checkout.ts`
- `/types/address.ts`
- `/server/api/checkout/*.ts`
- `/stores/checkout/*.ts`
- `/stores/cart/types.ts`

---

## Executive Summary

The checkout type system shows **solid foundational design** with clear domain modeling, but suffers from **inconsistent encapsulation**, **unsafe type practices**, and **weak invariant enforcement**. The address types are well-designed with strong helpers, while checkout types expose mutable state and lack proper validation boundaries.

**Key Strengths:**
- Good use of discriminated unions for payment methods
- Comprehensive address type system with conversion helpers
- Clear separation between database and UI representations

**Critical Issues:**
- Extensive use of `any` types bypassing type safety
- No constructor validation or factory functions
- Mutable state exposed directly in stores
- Inconsistent null handling patterns
- Missing branded types for IDs and sensitive data

---

## Type 1: Address (types/address.ts)

### Invariants Identified
- `firstName`, `lastName`, `street`, `city`, `postalCode`, `country` must be non-empty strings
- `type` must be exactly 'shipping' or 'billing'
- `isDefault` is a required boolean (cannot be undefined)
- `id` is a number when present (database-assigned)
- `phone` must match international phone format when provided
- `postalCode` must match country-specific regex patterns
- Database entity uses snake_case, UI uses camelCase consistently

### Ratings

**Encapsulation: 7/10**

*Justification:* Good separation between `AddressEntity` (database) and `Address` (UI) with helper functions for conversion. However, all fields are mutable and no factory functions ensure valid construction. The type itself doesn't prevent invalid states.

**Invariant Expression: 8/10**

*Justification:* Excellent use of discriminated union for `type` field. Clear documentation explains the purpose of each type. Helper functions like `validateAddress()` make invariants explicit. Country-specific postal code validation is well-structured. Minor deduction for optional fields (`company`, `province`, `phone`) not being clearly documented as business requirements vs technical optionals.

**Invariant Usefulness: 9/10**

*Justification:* Invariants directly map to business requirements (addresses must have complete mailing information). Country-specific postal code validation prevents real shipping errors. Type discrimination prevents mixing shipping/billing addresses inappropriately. The validation function catches common user input errors.

**Invariant Enforcement: 6/10**

*Justification:* Validation only happens through the `validateAddress()` helper function - nothing prevents constructing invalid `Address` objects directly. No readonly fields prevent mutation after creation. The type guard `isAddress()` is useful but not enforced at construction time.

### Strengths
- **Excellent helper ecosystem**: Conversion functions (`addressFromEntity`, `addressToEntity`) ensure safe boundary crossing
- **Strong validation logic**: Country-specific postal code patterns, phone validation, required field checks
- **Clear type guard**: `isAddress()` provides runtime type checking
- **Format helper**: `formatAddress()` with multiple display styles
- **Comprehensive documentation**: Clear usage instructions and schema alignment notes

### Concerns
- **No immutability**: All fields are mutable, addresses can be corrupted after validation
- **Validation is optional**: Nothing enforces calling `validateAddress()` before use
- **Type guard uses `any`**: `isAddress(obj: any)` - should use `unknown`
- **Missing branded ID**: `id?: number` should be `AddressId` branded type
- **Optional vs nullable confusion**: Uses both `string | null` and `string?` inconsistently
- **No construction validation**: Can create invalid addresses without errors

### Recommended Improvements

```typescript
// 1. Use branded types for IDs
type AddressId = number & { readonly __brand: 'AddressId' }

// 2. Make Address immutable with readonly fields
export interface Address {
  readonly id?: AddressId
  readonly type: 'shipping' | 'billing'
  readonly firstName: string
  readonly lastName: string
  // ... other readonly fields
}

// 3. Add factory function with validation
export function createAddress(data: AddressFormData): Result<Address, AddressValidationError[]> {
  const errors = validateAddress(data)
  if (errors.length > 0) {
    return { success: false, errors }
  }
  return {
    success: true,
    value: Object.freeze({ ...data })
  }
}

// 4. Fix type guard to use unknown
export function isAddress(obj: unknown): obj is Address {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    // ... rest of checks
  )
}

// 5. Use Result type instead of throwing in helpers
type Result<T, E> =
  | { success: true; value: T }
  | { success: false; errors: E }
```

---

## Type 2: CheckoutState (types/checkout.ts)

### Invariants Identified
- `currentStep` must progress sequentially through 'shipping' → 'payment' → 'review' → 'confirmation'
- `sessionId` must be unique and non-guessable
- `sessionExpiresAt` must be in the future when set
- `termsAccepted` and `privacyAccepted` must both be true before order completion
- `shippingInfo` required before advancing from shipping step
- `paymentMethod` required before advancing from payment step
- `orderData` required before advancing from review step
- Email in `guestInfo` and `contactEmail` must be valid email format
- `validationErrors` should be empty when `isValid` is true

### Ratings

**Encapsulation: 3/10**

*Justification:* Severe encapsulation violations. All state is mutable and exposed directly. No private fields. No validation on setters. The store exposes raw reactive state with `...toRefs(state)`, allowing external mutation. Anyone can call setters in any order, violating state machine invariants.

**Invariant Expression: 5/10**

*Justification:* Invariants are implied by field names and types but not enforced. The `CheckoutStep` union type is good. Error types use discriminated unions well. However, relationships between fields (e.g., step progression, required data per step) are completely unexpressed in types. No use of conditional types or branded types for IDs.

**Invariant Usefulness: 7/10**

*Justification:* The invariants are useful and map to real checkout requirements (progressive disclosure, validation before advancement, session expiry). Error categorization is practical. However, some invariants are business logic that belongs in the type system but is only enforced at runtime.

**Invariant Enforcement: 2/10**

*Justification:* Virtually no enforcement. No readonly fields. No constructor validation. Setters accept any value without validation. State can be corrupted by setting contradictory values (e.g., `currentStep='confirmation'` but `orderData=null`). Session expiry is computed but not enforced. Terms acceptance can be changed after order creation.

### Strengths
- **Good error modeling**: `CheckoutError` with discriminated union for error types
- **Clear step enumeration**: `CheckoutStep` union prevents invalid step names
- **Separate concerns**: Different error types, validation state, and session state
- **Expiry computation**: `isSessionExpired` computed property

### Concerns
- **No state machine**: Steps can be set arbitrarily, violating flow
- **Mutable everything**: All fields can be changed at any time
- **No validation on setters**: `setGuestInfo(info: GuestInfo)` doesn't validate email
- **Contradictory state possible**: Can have `currentStep='confirmation'` with `orderData=null`
- **Session ID is plain string**: Should be branded type to prevent confusion
- **`any` types everywhere**: `cartItems: any[]`, `productSnapshot: Record<string, any>`
- **Optional validation**: `termsAccepted` can be false even on confirmation page
- **No encapsulation**: All setters are public, can be called in wrong order
- **Deprecated type not removed**: `OldAddress` still exported despite being deprecated
- **Inconsistent null handling**: Mix of `null`, `undefined`, and optional fields

### Recommended Improvements

```typescript
// 1. Use branded types
type SessionId = string & { readonly __brand: 'SessionId' }
type OrderId = number & { readonly __brand: 'OrderId' }

// 2. Model state machine with discriminated unions
type CheckoutState =
  | {
      step: 'shipping'
      sessionId: SessionId
      guestInfo: GuestInfo | null
      shippingInfo: null  // Not set yet
      paymentMethod: null
      orderData: null
    }
  | {
      step: 'payment'
      sessionId: SessionId
      guestInfo: GuestInfo | null
      shippingInfo: ShippingInformation  // Required!
      paymentMethod: null  // Not set yet
      orderData: OrderData  // Calculated from shipping
    }
  | {
      step: 'review'
      sessionId: SessionId
      guestInfo: GuestInfo | null
      shippingInfo: ShippingInformation
      paymentMethod: PaymentMethod  // Required!
      orderData: OrderData
    }
  | {
      step: 'confirmation'
      sessionId: SessionId
      guestInfo: GuestInfo | null
      shippingInfo: ShippingInformation
      paymentMethod: PaymentMethod
      orderData: OrderData & { orderId: OrderId }  // Must have order ID
      termsAccepted: true  // Must be true!
      privacyAccepted: true
    }

// 3. Create factory functions for state transitions
export function advanceToPayment(
  shippingState: Extract<CheckoutState, { step: 'shipping' }>,
  shippingInfo: ShippingInformation
): Result<Extract<CheckoutState, { step: 'payment' }>, ValidationError[]> {
  const errors = validateShippingInformation(shippingInfo)
  if (errors.length > 0) {
    return { success: false, errors }
  }

  return {
    success: true,
    value: {
      ...shippingState,
      step: 'payment',
      shippingInfo,
      orderData: calculateOrderData(shippingInfo)
    }
  }
}

// 4. Make sensitive data types opaque
interface GuestInfo {
  readonly email: Email  // Branded type, validated
  readonly emailUpdates: boolean
}

type Email = string & { readonly __brand: 'Email' }

function createEmail(value: string): Result<Email, string> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { success: false, error: 'Invalid email format' }
  }
  return { success: true, value: value as Email }
}

// 5. Remove deprecated type
// Delete OldAddress entirely, not just deprecate
```

---

## Type 3: PaymentMethod (types/checkout.ts)

### Invariants Identified
- `type` determines which optional fields are present
- For `type='credit_card'`: `creditCard` object must be present with all fields
- For `type='paypal'`: `paypal` object must be present with email
- For `type='cash'`: `cash` object must be present with confirmation
- For `type='bank_transfer'`: `bankTransfer` object must be present
- Credit card CVV must be 3-4 digits
- Credit card expiry must be in the future
- PayPal email must be valid email format
- Only one payment type field should be present at a time

### Ratings

**Encapsulation: 4/10**

*Justification:* No encapsulation at all. All fields are mutable and public. Sensitive credit card data is stored in plain strings. No methods to interact with the type safely. The sanitization function is separate and optional to use.

**Invariant Expression: 6/10**

*Justification:* Good use of discriminated union for `type` field, but fails to properly express that payment type determines required fields. Should use discriminated union across entire interface, not just type field. The relationship between `type` and optional fields is only documented, not enforced by types.

**Invariant Usefulness: 8/10**

*Justification:* Invariants prevent payment processing errors and security issues. Distinguishing payment methods is critical for business logic. However, storing full credit card details violates PCI compliance - should only store tokens.

**Invariant Enforcement: 2/10**

*Justification:* Almost no enforcement. Can create `PaymentMethod` with `type='credit_card'` but no `creditCard` field. Can have multiple payment type fields set simultaneously. No validation of credit card numbers, expiry dates, or CVV format. Sensitive data not protected.

### Strengths
- **Clear payment type enumeration**: Union type for `type` field
- **Separate data structures**: Each payment method has its own structure
- **Sanitization helper**: `sanitizePaymentMethodForStorage` removes sensitive data

### Concerns
- **Not a proper discriminated union**: Should use tagged union pattern
- **Stores sensitive data**: Credit card numbers, CVV in plain strings (PCI violation)
- **No validation**: Can create invalid payment methods
- **Contradictory state possible**: Can have `type='cash'` with `creditCard` field set
- **No readonly fields**: Payment method can be mutated after creation
- **Weak sanitization**: Relies on optional helper, not enforced
- **No expiry validation**: Accepts expired credit cards
- **Missing payment provider types**: Should have Stripe/PayPal types

### Recommended Improvements

```typescript
// 1. Use proper discriminated union
type PaymentMethod =
  | {
      type: 'cash'
      cash: { confirmed: boolean }
      saveForFuture?: never  // Can't save cash
    }
  | {
      type: 'credit_card'
      creditCard: {
        tokenId: string  // Use token, not raw card data!
        lastFour: string
        brand: CardBrand
        expiryMonth: Month  // 1-12
        expiryYear: Year  // Branded type
        holderName: string
      }
      saveForFuture?: boolean
      // No raw CVV or card number!
    }
  | {
      type: 'paypal'
      paypal: {
        email: Email  // Branded type
        paypalOrderId?: string
      }
      saveForFuture?: boolean
    }
  | {
      type: 'bank_transfer'
      bankTransfer: {
        reference: BankTransferReference  // Branded
      }
      saveForFuture?: never
    }

// 2. Branded types for payment data
type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Year = number & { readonly __brand: 'Year' }
type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover'

// 3. Factory with validation
function createCreditCardPayment(
  tokenId: string,
  lastFour: string,
  brand: CardBrand,
  expiry: { month: number; year: number },
  holderName: string,
  saveForFuture: boolean = false
): Result<Extract<PaymentMethod, { type: 'credit_card' }>, PaymentError> {
  // Validate expiry is in future
  const now = new Date()
  if (expiry.year < now.getFullYear() ||
      (expiry.year === now.getFullYear() && expiry.month < now.getMonth() + 1)) {
    return { success: false, error: 'Card expired' }
  }

  if (expiry.month < 1 || expiry.month > 12) {
    return { success: false, error: 'Invalid month' }
  }

  return {
    success: true,
    value: Object.freeze({
      type: 'credit_card',
      creditCard: Object.freeze({
        tokenId,
        lastFour,
        brand,
        expiryMonth: expiry.month as Month,
        expiryYear: expiry.year as Year,
        holderName
      }),
      saveForFuture
    })
  }
}

// 4. NEVER store raw card data
// Use Stripe/PayPal tokens only
```

---

## Type 4: OrderItem (types/checkout.ts)

### Invariants Identified
- `productId` must reference an existing product
- `quantity` must be positive integer
- `price` must be positive number
- `total` must equal `price * quantity`
- `productSnapshot` must contain product details at time of order

### Ratings

**Encapsulation: 2/10**

*Justification:* Completely exposed mutable fields. No validation. `productSnapshot: Record<string, any>` is completely untyped. No methods to ensure invariants.

**Invariant Expression: 3/10**

*Justification:* Basic structure is clear, but critical invariant (`total = price * quantity`) is not expressed. Product ID type is inconsistent (`number | string`). Product snapshot is untyped `any`.

**Invariant Usefulness: 7/10**

*Justification:* Capturing product snapshot is crucial for order history. Price/quantity tracking is essential. However, the calculation invariant not being enforced could lead to billing errors.

**Invariant Enforcement: 1/10**

*Justification:* Zero enforcement. Can set `total` to anything regardless of `price * quantity`. Can set negative quantities or prices. Product ID inconsistency causes bugs (see line 203 in create-order.post.ts trying to parse string to number).

### Strengths
- **Product snapshot concept**: Good practice to freeze product state at order time
- **Simple structure**: Easy to understand

### Concerns
- **`productSnapshot: Record<string, any>`**: Completely untyped
- **`productId: number | string`**: Type inconsistency causes bugs
- **No calculation enforcement**: `total` can be wrong
- **No readonly fields**: Can corrupt order after creation
- **No validation**: Accepts negative values
- **Missing required fields**: Should specify what's in snapshot

### Recommended Improvements

```typescript
// 1. Define ProductSnapshot type
interface ProductSnapshot {
  readonly id: number
  readonly name: string
  readonly price: number
  readonly description?: string
  readonly image_url?: string
  readonly sku?: string
  readonly category?: string
}

// 2. Use branded types and make immutable
type ProductId = number & { readonly __brand: 'ProductId' }
type Quantity = number & { readonly __brand: 'Quantity' }
type Price = number & { readonly __brand: 'Price' }
type Total = number & { readonly __brand: 'Total' }

interface OrderItem {
  readonly productId: ProductId
  readonly productSnapshot: ProductSnapshot
  readonly quantity: Quantity
  readonly price: Price
  readonly total: Total
}

// 3. Factory function with validation and calculation
function createOrderItem(
  productId: ProductId,
  productSnapshot: ProductSnapshot,
  quantity: number,
  price: number
): Result<OrderItem, string> {
  if (quantity < 1 || !Number.isInteger(quantity)) {
    return { success: false, error: 'Quantity must be positive integer' }
  }

  if (price <= 0) {
    return { success: false, error: 'Price must be positive' }
  }

  const total = price * quantity

  return {
    success: true,
    value: Object.freeze({
      productId,
      productSnapshot: Object.freeze(productSnapshot),
      quantity: quantity as Quantity,
      price: price as Price,
      total: total as Total
    })
  }
}

// 4. Utility to recalculate if needed
function recalculateTotal(item: OrderItem): Total {
  return (item.price * item.quantity) as Total
}
```

---

## Type 5: CreateOrderFromCheckoutRequest (server/api/checkout/create-order.post.ts)

### Invariants Identified
- `sessionId` must be a valid checkout session
- `items` must have at least one item
- All addresses must have required fields
- `paymentResult.success` must be true
- `total` must equal `subtotal + shippingCost + tax`
- Product IDs in items must be valid numbers
- Guest checkout requires `guestEmail`

### Ratings

**Encapsulation: 5/10**

*Justification:* Server-side type, not exposed to client, which is good. However, no validation class or methods. Type is just a data bag. Validation happens in handler function, not encapsulated with type.

**Invariant Expression: 6/10**

*Justification:* Structure is clear and well-documented. However, calculation invariants not expressed. Address duplication (shipping vs billing) not handled with types. Payment method uses string literals without union type.

**Invariant Usefulness: 8/10**

*Justification:* Captures all necessary order data. Payment result structure is practical. Locale and marketing consent are good additions. Useful for business requirements.

**Invariant Enforcement: 4/10**

*Justification:* Runtime validation in handler (lines 86-99) but not type-level. Product ID conversion (line 203) indicates type mismatch. No automatic total calculation. Guest email only validated as present, not format.

### Strengths
- **Comprehensive structure**: Captures all order details
- **Runtime validation**: Handler checks required fields
- **Good documentation**: Clear inline interface
- **Payment result structure**: Practical for different payment states

### Concerns
- **No validation at type level**: Just an interface, no class with validation
- **Address duplication**: `shippingAddress` and `billingAddress` are separate objects
- **Payment method string**: Should use PaymentMethod type
- **Product ID type issue**: Has to convert string to number (line 203)
- **No total calculation**: Should calculate, not accept from client
- **Guest email not validated**: Only checks presence, not format
- **Inline interface**: Should be in types file for reuse
- **Payment method mapping**: Lines 129-139 show impedance mismatch between frontend and DB

### Recommended Improvements

```typescript
// 1. Move to types file and use proper types
interface CreateOrderRequest {
  readonly sessionId: SessionId
  readonly items: readonly OrderItem[]  // Use existing type
  readonly shippingAddress: Address  // Reuse type
  readonly billingAddress: Address
  readonly paymentMethod: PaymentMethod  // Reuse type
  readonly paymentResult: PaymentResult
  readonly locale: Locale
  readonly marketingConsent: boolean
  // Remove subtotal, tax, total - calculate server-side!
}

// 2. Payment result as discriminated union
type PaymentResult =
  | {
      success: true
      transactionId: TransactionId
      paymentMethod: PaymentMethodType
      status: 'completed'
      charges?: any  // Stripe charges
    }
  | {
      success: true
      transactionId: TransactionId
      paymentMethod: PaymentMethodType
      status: 'pending'
      pending: true
    }
  | {
      success: false
      error: string
      paymentMethod: PaymentMethodType
    }

// 3. Server-side validation class
class CreateOrderValidator {
  constructor(private request: CreateOrderRequest) {}

  validate(): Result<ValidatedOrderData, OrderValidationError[]> {
    const errors: OrderValidationError[] = []

    // Validate session exists
    // Validate items exist and in stock
    // Validate addresses are complete
    // Validate payment succeeded
    // Calculate totals server-side

    if (errors.length > 0) {
      return { success: false, errors }
    }

    return {
      success: true,
      value: {
        ...this.request,
        calculatedTotal: this.calculateTotal()
      }
    }
  }

  private calculateTotal(): Total {
    // Never trust client calculations!
    const subtotal = this.calculateSubtotal()
    const shipping = this.calculateShipping()
    const tax = this.calculateTax(subtotal)
    return (subtotal + shipping + tax) as Total
  }
}
```

---

## Type 6: CheckoutSessionStore State (stores/checkout/session.ts)

### Invariants Identified
- Session ID must be unique and secure
- Session expiry must be in future when active
- Cookie storage must be encrypted and HTTP-only
- Payment method must be sanitized before storage
- State must be restorable from cookie
- Expired sessions must be cleared

### Ratings

**Encapsulation: 2/10**

*Justification:* Exports entire state with `...toRefs(state)` (line 293), allowing external mutation. All setters are public. No private state. No state machine enforcement. Cookie handling is good but state is still exposed.

**Invariant Expression: 4/10**

*Justification:* Basic types are clear, but state machine not expressed. Persistence logic is separate from state. Sanitization is manual, not automatic. Session expiry computed but not enforced.

**Invariant Usefulness: 7/10**

*Justification:* Session expiry and sanitization are valuable security measures. Cookie persistence enables good UX. However, lack of state machine means useful invariants (step progression) are not captured.

**Invariant Enforcement: 3/10**

*Justification:* Minimal enforcement. Expiry is checked (line 252) but not prevented. Sanitization is manual (line 234). State can be corrupted by external mutation. No validation in setters.

### Strengths
- **Cookie persistence**: Good implementation with expiry checking
- **Payment sanitization**: Removes sensitive data before storage
- **Session expiry computation**: `isSessionExpired` computed
- **Restore validation**: Checks expiry on restore (line 252)

### Concerns
- **Exports mutable state**: `...toRefs(state)` allows external mutation
- **No state machine**: Steps can be set arbitrarily
- **Public setters**: No validation, can be called in wrong order
- **Manual sanitization**: Not automatic, can be forgotten
- **Session ID generation**: Uses `Math.random()` (line 152) - not cryptographically secure
- **Type safety**: `checkoutCookie = useCookie<any>` (line 218) - should be typed
- **Error handling**: Silent failures in persist/restore (lines 239, 277)

### Recommended Improvements

```typescript
// 1. Don't export raw state, export getters only
export const useCheckoutSessionStore = defineStore('checkout-session', () => {
  const state = reactive<CheckoutState>({ ...INITIAL_STATE })

  // Don't do this:
  // return { ...toRefs(state) }

  // Do this instead:
  return {
    // Readonly computed getters
    currentStep: computed(() => state.currentStep),
    sessionId: computed(() => state.sessionId),
    // ... other readonly getters

    // Actions only
    advanceToPayment,
    advanceToReview,
    // ...
  }
})

// 2. Use crypto for session ID
const generateSessionId = (): SessionId => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `checkout_${crypto.randomUUID()}` as SessionId
  }
  // Fallback for Node.js
  const { randomBytes } = await import('crypto')
  return `checkout_${randomBytes(16).toString('hex')}` as SessionId
}

// 3. Type the cookie properly
interface CheckoutSessionCookie {
  sessionId: SessionId
  currentStep: CheckoutStep
  guestInfo: GuestInfo | null
  shippingInfo: ShippingInformation | null
  paymentMethod: SanitizedPaymentMethod | null  // Specific type
  orderData: OrderData | null
  sessionExpiresAt: string  // ISO date string
  termsAccepted: boolean
  privacyAccepted: boolean
  marketingConsent: boolean
}

const checkoutCookie = useCookie<CheckoutSessionCookie>(
  COOKIE_NAMES.CHECKOUT_SESSION,
  CHECKOUT_SESSION_COOKIE_CONFIG
)

// 4. Automatic sanitization
const persist = async (): Promise<void> => {
  const snapshot: CheckoutSessionCookie = {
    sessionId: state.sessionId,
    // ... other fields
    paymentMethod: state.paymentMethod
      ? sanitizePaymentMethodForStorage(state.paymentMethod)
      : null  // Automatic, can't forget
  }

  checkoutCookie.value = snapshot
}

// 5. Enforce expiry
const advanceStep = (nextStep: CheckoutStep): Result<void, string> => {
  if (isSessionExpired.value) {
    return { success: false, error: 'Session expired' }
  }
  // ... validation
}
```

---

## Cross-Cutting Concerns

### 1. Inconsistent Use of `any`

**Locations:**
- `types/checkout.ts:108` - `cartItems: any[]`
- `types/checkout.ts:88` - `productSnapshot: Record<string, any>`
- `server/api/checkout/addresses.get.ts:64` - `event: any`
- `server/api/checkout/addresses.post.ts:105` - `event: any`
- `stores/checkout/session.ts:218` - `useCookie<any>`
- `stores/checkout/session.ts:131` - `preferences: any`

**Impact:** Type safety completely bypassed. Runtime errors inevitable.

**Fix:** Define proper types for all data structures.

### 2. Type vs Interface Inconsistency

The codebase mixes `interface` and `type` without clear convention:
- Use `interface` for object shapes: `Address`, `OrderData`, `CheckoutState`
- Use `type` for unions: `CheckoutStep`, `PaymentMethod` (should be union)
- Use `type` for branded types: `SessionId`, `OrderId`

**Recommendation:** Establish convention:
- `interface` for extensible object shapes
- `type` for discriminated unions, branded types, and type aliases
- Never mix both for the same concept

### 3. Null vs Undefined Inconsistency

**Examples:**
- `sessionId: string | null` (explicit null)
- `phone?: string` (undefined via optional)
- `company: string | null` in entity, `company?: string` in UI

**Impact:** Need to check both `!= null` and type guards.

**Fix:** Choose one:
- Use `null` for "explicitly no value" (database nulls)
- Use `undefined` for "not yet set" (optional fields)
- Never use both interchangeably

### 4. Missing Branded Types

**Should be branded:**
- Session IDs (checkout, cart)
- User IDs
- Product IDs
- Order IDs, order numbers
- Email addresses (validated)
- Phone numbers (validated)
- Postal codes (validated)
- Transaction IDs

**Example:**
```typescript
type SessionId = string & { readonly __brand: 'SessionId' }
type ProductId = number & { readonly __brand: 'ProductId' }

// Prevents this bug:
const cartSessionId: SessionId = cart.sessionId
const checkoutSessionId: SessionId = checkout.sessionId
// Can't accidentally mix them!
```

### 5. No Result/Option Types

Many functions throw or return `null` instead of using type-safe error handling:

```typescript
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E }

type Option<T> = Some<T> | None

// Instead of:
function findAddress(id: number): Address | null {
  // ...
}

// Do:
function findAddress(id: AddressId): Option<Address> {
  // Caller must handle both cases
}
```

---

## Architecture Anti-Patterns

### 1. Anemic Domain Model

All types are just data bags with no behavior:

```typescript
// Current (anemic)
interface OrderItem {
  productId: number | string
  quantity: number
  price: number
  total: number
}

// Better (domain model)
class OrderItem {
  private constructor(
    readonly productId: ProductId,
    readonly productSnapshot: ProductSnapshot,
    readonly quantity: Quantity,
    readonly price: Price
  ) {}

  static create(product: Product, quantity: number): Result<OrderItem, string> {
    // Validation
    return new OrderItem(...)
  }

  get total(): Total {
    return (this.price * this.quantity) as Total
  }

  updateQuantity(newQuantity: number): Result<OrderItem, string> {
    // Validation and return new instance (immutable)
  }
}
```

### 2. Primitive Obsession

Everything is `string` or `number`:
- Session IDs are just strings
- Product IDs are `number | string`
- Emails are just strings
- Prices are just numbers (no currency type)

**Fix:** Use branded types and value objects.

### 3. Missing Value Objects

Concepts that should be value objects:
- `Money` (amount + currency, not just `number`)
- `Email` (validated string)
- `PhoneNumber` (validated, formatted)
- `PostalCode` (country-specific validation)
- `Address` (should be a value object, not just interface)

### 4. Feature Envy

Stores reach into each other's state directly:

```typescript
// stores/checkout/shipping.ts
const { shippingInfo, availableShippingMethods, orderData } = storeToRefs(session)
```

**Fix:** Use dependency injection and expose only necessary methods, not state.

---

## Security Issues

### 1. PCI Compliance Violations

**Location:** `types/checkout.ts:44-63`

Storing raw credit card data in `PaymentMethod` interface:
```typescript
creditCard?: {
  number: string        // PCI violation!
  cvv: string          // PCI violation!
  expiryMonth: string
  expiryYear: string
  holderName: string
}
```

**Impact:** Severe security risk. Cannot store card numbers or CVV.

**Fix:** Only store payment tokens from payment provider.

### 2. Non-Cryptographic Session IDs

**Location:** `stores/checkout/session.ts:152`

```typescript
const generateSessionId = (): string => {
  return `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
```

**Impact:** Predictable session IDs, possible session hijacking.

**Fix:** Use `crypto.randomUUID()` or `crypto.getRandomValues()`.

### 3. Sensitive Data in Cookies

**Location:** `stores/checkout/session.ts:220-242`

Payment methods stored in cookies even after sanitization.

**Impact:** Possible XSS attacks reading cookie data.

**Fix:** Use server-side sessions for sensitive checkout data.

---

## Performance Issues

### 1. No Lazy Loading

All checkout types loaded upfront. Large types like `ProductSnapshot: Record<string, any>` could be huge.

**Fix:** Use lazy loading for product snapshots.

### 2. No Memoization

Computed values like totals recalculated on every access.

**Fix:** Use computed properties and memoization.

---

## Priority Recommendations

### High Priority (Security & Correctness)

1. **Remove raw credit card storage** - Use tokens only
2. **Fix session ID generation** - Use crypto APIs
3. **Add branded types for IDs** - Prevent ID confusion bugs
4. **Type productSnapshot properly** - Remove `any`
5. **Enforce total calculation** - Server-side only
6. **Fix Product ID type** - Choose `number` or `string`, not both

### Medium Priority (Type Safety)

7. **Convert PaymentMethod to discriminated union** - Proper type safety
8. **Add factory functions with validation** - Prevent invalid states
9. **Make fields readonly** - Enforce immutability
10. **Fix null/undefined inconsistency** - Choose one pattern
11. **Add Result types** - Type-safe error handling
12. **Remove `any` types** - Define proper interfaces

### Low Priority (Architecture)

13. **Implement state machine for checkout** - Enforce step progression
14. **Add domain model classes** - Move logic into types
15. **Create value objects** - Money, Email, etc.
16. **Improve store encapsulation** - Hide internal state

---

## Summary Scores

| Type | Encapsulation | Expression | Usefulness | Enforcement | Average |
|------|---------------|------------|------------|-------------|---------|
| Address | 7/10 | 8/10 | 9/10 | 6/10 | **7.5/10** |
| CheckoutState | 3/10 | 5/10 | 7/10 | 2/10 | **4.25/10** |
| PaymentMethod | 4/10 | 6/10 | 8/10 | 2/10 | **5.0/10** |
| OrderItem | 2/10 | 3/10 | 7/10 | 1/10 | **3.25/10** |
| CreateOrderRequest | 5/10 | 6/10 | 8/10 | 4/10 | **5.75/10** |
| CheckoutSessionStore | 2/10 | 4/10 | 7/10 | 3/10 | **4.0/10** |

**Overall Type System Health: 4.9/10 (Below Average)**

The checkout type system has good intentions and some well-designed components (Address types), but suffers from weak encapsulation, poor invariant enforcement, and dangerous security practices. Focus on high-priority security fixes first, then gradually improve type safety and architecture.
