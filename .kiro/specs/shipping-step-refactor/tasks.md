# Implementation Plan

- [x] 1. Create composables for logic extraction
  - [x] 1.1 Create useShippingMethods composable
    - Extract shipping method loading logic with debouncing
    - Handle API calls and error states
    - Implement method localization
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 1.2 Create useGuestCheckout composable
    - Extract guest information state management
    - Implement email validation logic
    - Handle guest form visibility
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 1.3 Create useShippingAddress composable
    - Extract address validation logic
    - Implement saved addresses loading
    - Handle address save functionality
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 2. Create new UI components
  - [x] 2.1 Create GuestCheckoutPrompt component
    - Display login/guest options
    - Emit continue-as-guest event
    - _Requirements: 4.1_

  - [x] 2.2 Create GuestInfoForm component
    - Email input with validation
    - Email updates checkbox
    - Emit validation events
    - _Requirements: 4.2_

  - [x] 2.3 Create ShippingInstructions component
    - Textarea for delivery instructions
    - Character limit display
    - _Requirements: 4.3_

  - [x] 2.4 Create CheckoutNavigation component
    - Back to cart button
    - Continue to payment button
    - Loading states
    - _Requirements: 4.4_

- [x] 3. Refactor ShippingStep component
  - [x] 3.1 Replace inline logic with composables
    - Use useShippingMethods for method loading
    - Use useGuestCheckout for guest flow
    - Use useShippingAddress for address management
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 3.2 Replace inline UI with new components
    - Use GuestCheckoutPrompt component
    - Use GuestInfoForm component
    - Use ShippingInstructions component
    - Use CheckoutNavigation component
    - _Requirements: 1.4, 4.1, 4.2, 4.3, 4.4_

  - [x] 3.3 Simplify component script to orchestration only
    - Remove complex logic from component
    - Keep only composition and event handling
    - Ensure script is under 150 lines
    - _Requirements: 1.1, 1.4_

- [x] 4. Test and validate refactored code
  - [x] 4.1 Verify all existing functionality works
    - Test guest checkout flow
    - Test authenticated user flow
    - Test shipping method loading
    - Test address saving
    - _Requirements: All_

  - [x] 4.2 Fix any errors from the refactor
    - Address any TypeScript errors
    - Fix any runtime errors
    - Ensure proper reactivity
    - _Requirements: All_
