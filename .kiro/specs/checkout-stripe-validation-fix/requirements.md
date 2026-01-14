# Requirements Document

## Introduction

This document specifies the requirements for fixing the checkout pay-by-card flow validation error. The current implementation incorrectly validates Stripe Elements credit card payments by checking for card number, expiry date, and CVV fields that are intentionally empty when using Stripe's secure iframe-based card input.

## Problem Statement

When a user selects "Credit Card" payment and fills in valid card details via Stripe Elements, the checkout process fails with the error:
- "Failed to place order: Error: Card number is required. Expiry date is required. CVV is required"

This occurs because the `validatePaymentMethod` function in `utils/checkout-validation.ts` expects `creditCard.number`, `creditCard.expiryMonth`, `creditCard.expiryYear`, and `creditCard.cvv` to be populated. However, with Stripe Elements, these fields are handled securely by Stripe's iframe and are intentionally NOT available to the application code for PCI compliance.

## Glossary

- **Stripe_Elements**: Stripe's pre-built UI components that securely collect card details in an iframe
- **Payment_Validation_System**: The checkout validation utility that validates payment method data
- **Card_Section_Component**: The Vue component that renders the Stripe card element and cardholder name field
- **Checkout_Store**: The Pinia store that manages checkout state and payment processing

## Requirements

### Requirement 1: Stripe Elements Payment Validation

**User Story:** As a customer, I want to pay with my credit card using the secure Stripe form, so that my payment information is handled securely and my order is processed successfully.

#### Acceptance Criteria

1. WHEN a user selects credit card payment with Stripe Elements, THE Payment_Validation_System SHALL validate only the cardholder name field (not card number, expiry, or CVV)
2. WHEN Stripe Elements is used for card input, THE Payment_Validation_System SHALL skip validation of card number, expiry date, and CVV fields
3. WHEN the cardholder name is empty or too short, THE Payment_Validation_System SHALL return a validation error
4. WHEN the cardholder name is valid and Stripe Elements is ready, THE Payment_Validation_System SHALL return validation success

### Requirement 2: Payment Method Type Detection

**User Story:** As a developer, I want the validation system to distinguish between Stripe Elements and manual card entry, so that appropriate validation rules are applied.

#### Acceptance Criteria

1. THE Payment_Validation_System SHALL detect when Stripe Elements is being used (indicated by empty card fields with `useStripeElements: true` flag)
2. WHEN `useStripeElements` is true, THE Payment_Validation_System SHALL only validate the cardholder name
3. WHEN `useStripeElements` is false or undefined, THE Payment_Validation_System SHALL validate all card fields (legacy behavior)

### Requirement 3: Error Message Clarity

**User Story:** As a customer, I want clear error messages when payment validation fails, so that I know exactly what needs to be corrected.

#### Acceptance Criteria

1. WHEN cardholder name validation fails, THE Payment_Validation_System SHALL display a user-friendly error message
2. THE Payment_Validation_System SHALL NOT display confusing error messages about card number/expiry/CVV when using Stripe Elements

### Requirement 4: Existing Tests Must Pass

**User Story:** As a developer, I want existing Stripe payment tests to pass after the fix, so that I can be confident the fix doesn't break other functionality.

#### Acceptance Criteria

1. WHEN the fix is applied, THE existing E2E tests for Stripe payment integration SHALL pass
2. WHEN the fix is applied, THE existing unit tests for useStripe composable SHALL pass
3. WHEN the fix is applied, THE existing unit tests for checkout validation SHALL pass (with updates for new behavior)

### Requirement 5: Stripe UI Usability

**User Story:** As a customer, I want the Stripe card input to be easy to interact with, so that I can enter my payment details without frustration.

#### Acceptance Criteria

1. WHEN a user clicks on the Stripe card element, THE iframe SHALL be directly clickable without container interference
2. WHEN Stripe Elements renders, THE styling SHALL be consistent with the application design
3. THE Card_Section_Component SHALL use Stripe's built-in styling options rather than custom CSS that blocks interaction

### Requirement 6: E2E Test Reliability

**User Story:** As a developer, I want E2E tests to be reliable and not flaky, so that I can trust test results.

#### Acceptance Criteria

1. WHEN placing an order in E2E tests, THE test SHALL wait for the confirmation page URL rather than network idle state
2. WHEN filling Stripe card details in E2E tests, THE test SHALL allow sufficient time for Stripe's unified Card Element to auto-advance between fields
3. WHEN running E2E tests, THE test database SHALL have consistent product data seeded before tests run
4. WHEN running E2E tests, THE cart state SHALL be cleared between test runs to prevent data leakage

### Requirement 7: Type Safety

**User Story:** As a developer, I want proper TypeScript types throughout the checkout flow, so that I can catch errors at compile time.

#### Acceptance Criteria

1. THE HybridCheckout component SHALL use proper store imports instead of type casting with `any`
2. THE PaymentMethod type SHALL include all necessary fields for Stripe payment processing (paymentIntentId, transactionId)
3. THE code SHALL not use type assertions (`as any`) to bypass type checking


## Implementation Status

**Status**: ✅ COMPLETED

**Branch**: `feat/stripe-payments-ui`

**Completion Date**: January 14, 2026

### Summary

All requirements have been successfully implemented and tested. The Stripe payment validation error has been fixed, and additional improvements were made to enhance UI usability, test reliability, and type safety.

### Key Deliverables

1. ✅ Stripe Elements validation logic that skips card field validation
2. ✅ Cardholder name-only validation for Stripe payments
3. ✅ Improved Stripe Card Element UI without container interference
4. ✅ Type-safe payment processing in HybridCheckout component
5. ✅ Reliable E2E tests with proper timing and product seeding
6. ✅ Cart state management fixes to prevent test data leakage

### Manual Testing Results

- Payment processing with Stripe Elements: ✅ Working
- Navigation to confirmation page: ✅ Working
- Cardholder name validation: ✅ Working
- Card field validation skipped: ✅ Working

### Files Modified

- `types/checkout.ts` - Added useStripeElements flag and payment intent fields
- `utils/checkout-validation.ts` - Added Stripe Elements detection and cardholder-only validation
- `utils/checkout-validation.test.ts` - Updated tests for new validation behavior
- `components/checkout/payment/CardSection.vue` - Set useStripeElements flag and fixed UI
- `components/checkout/PaymentForm.vue` - Preserve useStripeElements flag
- `components/checkout/HybridCheckout.vue` - Fixed type safety with proper store imports
- `tests/e2e/page-objects/CheckoutPage.ts` - Fixed placeOrder timing
- `tests/e2e/page-objects/StripeCheckoutPage.ts` - Fixed Stripe Card Element timing
- `tests/e2e/stripe-payment-integration.spec.ts` - Added cart clearing and logging
- `tests/global-setup.ts` - Added product seeding
- `tests/helpers/seed-test-products.ts` - NEW - Product seeding helper functions
