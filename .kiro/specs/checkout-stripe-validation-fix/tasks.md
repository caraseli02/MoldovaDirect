# Implementation Plan: Checkout Stripe Validation Fix

## Overview

This plan implements the fix for the checkout pay-by-card validation error. The fix adds a `useStripeElements` flag to distinguish Stripe Elements payments from manual card entry, and updates the validation logic to skip card field validation when using Stripe Elements.

## Tasks

- [x] 1. Update PaymentMethod type definition
  - Add `useStripeElements?: boolean` to creditCard interface in `types/checkout.ts`
  - _Requirements: 2.1_

- [x] 2. Update CardSection component to set useStripeElements flag
  - [x] 2.1 Modify emitUpdate function in `components/checkout/payment/CardSection.vue`
    - Add `useStripeElements: true` to the emitted payment method object
    - _Requirements: 2.1, 2.2_

- [x] 3. Update validation logic for Stripe Elements
  - [x] 3.1 Add validateCardholderNameOnly helper function in `utils/checkout-validation.ts`
    - Validate only holderName field (required, min 2 chars, max 50 chars)
    - Return appropriate error codes and messages
    - _Requirements: 1.3, 3.1_
  - [x] 3.2 Modify validateCreditCard function to detect Stripe Elements
    - Check for `useStripeElements: true` flag
    - Call validateCardholderNameOnly when flag is true
    - Preserve existing validation for legacy (non-Stripe) card entry
    - _Requirements: 1.1, 1.2, 2.2, 2.3_

- [x] 4. Checkpoint - Verify validation logic
  - Ensure all unit tests pass, ask the user if questions arise.

- [x] 5. Write unit tests for validation changes
  - [x] 5.1 Test Stripe Elements validation passes with valid holderName
    - **Property 1: Stripe Elements Validation Skips Card Fields**
    - **Validates: Requirements 1.1, 1.2, 1.4**
  - [x] 5.2 Test Stripe Elements validation fails with invalid holderName
    - **Property 2: Invalid Cardholder Name Fails Validation**
    - **Validates: Requirements 1.3, 3.1**
  - [x] 5.3 Test legacy validation still validates all card fields
    - **Property 3: Legacy Validation Preserves Backward Compatibility**
    - **Validates: Requirements 2.3**

- [x] 6. Run E2E tests to verify fix
  - Run `tests/e2e/stripe-payment-integration.spec.ts`
  - Verify "Successful payment processing with Stripe" test passes
  - _Requirements: 4.1_

- [ ] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The fix is intentionally minimal to reduce regression risk
- Backward compatibility is preserved for any code not using Stripe Elements
