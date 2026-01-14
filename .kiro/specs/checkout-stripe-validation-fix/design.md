# Design Document: Checkout Stripe Validation Fix

## Overview

This design addresses the validation error that occurs when users attempt to pay with credit cards via Stripe Elements. The current validation logic incorrectly expects card number, expiry, and CVV fields to be populated, but these fields are intentionally empty when using Stripe Elements (handled securely by Stripe's iframe for PCI compliance).

The fix modifies the `validatePaymentMethod` function to detect Stripe Elements usage and skip card field validation, while still validating the cardholder name field.

## Architecture

The fix involves minimal changes to the existing architecture:

```
Checkout Flow
─────────────
CardSection (Stripe) → PaymentForm → HybridCheckout → checkoutStore
       │                                                    │
       │                                                    ▼
       │                                    validatePaymentMethod()
       │                                    (checkout-validation.ts)
       │                                              │
       │                                    ┌─────────┴─────────┐
       │                                    │useStripeElements  │
       │                                    │= true → Skip card │
       │                                    │fields, validate   │
       │                                    │holderName only    │
       │                                    └───────────────────┘
       ▼
Stripe Elements (iframe) - Card data handled securely by Stripe
```

## Components and Interfaces

### Modified Components

#### 1. utils/checkout-validation.ts

Add `useStripeElements` flag detection and skip card field validation when true.

```typescript
function validateCreditCard(creditCard?: PaymentMethod['creditCard']): CheckoutValidationResult {
  const errors: CheckoutValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!creditCard) {
    errors.push({
      field: 'creditCard',
      code: 'REQUIRED',
      message: 'Credit card information is required',
      severity: 'error',
    })
    return { isValid: false, errors, warnings }
  }

  // When using Stripe Elements, only validate cardholder name
  if (creditCard.useStripeElements) {
    return validateCardholderNameOnly(creditCard.holderName)
  }

  // Legacy validation for non-Stripe card entry
  // ... existing validation code ...
}
```

#### 2. components/checkout/payment/CardSection.vue

Set `useStripeElements: true` when emitting payment method updates.

```typescript
const emitUpdate = () => {
  emit('update:modelValue', {
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: creditCardData.value.holderName,
    useStripeElements: true,  // NEW FLAG
  })
}
```

#### 3. types/checkout.ts

Add `useStripeElements` optional field to credit card type.

## Data Models

No database changes required. The `useStripeElements` flag is runtime-only.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Stripe Elements Validation Skips Card Fields

*For any* payment method with `type: 'credit_card'` and `creditCard.useStripeElements: true`, validation SHALL pass if and only if `creditCard.holderName` is a non-empty string with length >= 2 and <= 50, regardless of card field values.

**Validates: Requirements 1.1, 1.2, 1.4, 2.2, 3.2**

### Property 2: Invalid Cardholder Name Fails Validation

*For any* payment method with `type: 'credit_card'` where `creditCard.holderName` is empty, whitespace-only, or has length < 2, validation SHALL return an error with field `holderName`.

**Validates: Requirements 1.3, 3.1**

### Property 3: Legacy Validation Preserves Backward Compatibility

*For any* payment method with `type: 'credit_card'` and `creditCard.useStripeElements` is `false` or `undefined`, validation SHALL check all card fields.

**Validates: Requirements 2.3**

## Error Handling

| Error Code | Field | Message | When |
|------------|-------|---------|------|
| REQUIRED | holderName | Cardholder name is required | holderName is empty |
| TOO_SHORT | holderName | Cardholder name must be at least 2 characters | length < 2 |
| TOO_LONG | holderName | Cardholder name must be less than 50 characters | length > 50 |

## Testing Strategy

### Unit Tests
- Test `validateCreditCard` with `useStripeElements: true` and valid holderName → passes
- Test `validateCreditCard` with `useStripeElements: true` and empty holderName → fails
- Test `validateCreditCard` with `useStripeElements: false` and missing card fields → fails

### E2E Tests
Existing tests in `tests/e2e/stripe-payment-integration.spec.ts` should pass after the fix.
