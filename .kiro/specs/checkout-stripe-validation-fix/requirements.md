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
