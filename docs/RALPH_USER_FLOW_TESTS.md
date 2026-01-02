# User Flow Test Coverage - Ralph Loop Task Plan

> Execute with: `/ralph-loop` using this file as prompt reference
> Output `<promise>PHASE_COMPLETE</promise>` after each phase
> Output `<promise>ALL_COMPLETE</promise>` when all phases done

---

## Instructions for Ralph Loop

1. Read this file at the start of each iteration
2. Find the first unchecked `[ ]` task
3. Follow TDD: Write failing test → Implement → Make test pass
4. Run the test to verify it passes
5. Mark the task as `[x]` in this file
6. Commit the changes
7. Move to next task or output completion promise

**Validation command:** `pnpm test -- --reporter=verbose`

---

## Phase 1: Critical Payment & Order Flows

### 1.1 Order Cancellation Flow
- [x] Write test: User can view cancel button on pending order
- [x] Write test: Cancel confirmation modal appears
- [x] Write test: Order status changes to "cancelled" after confirmation
- [x] Write test: Cancelled order shows in order history with correct status
- [x] Implement order cancellation API endpoint
- [x] Implement cancel UI in order details page
- [x] Run all tests, fix any failures

### 1.2 Order Return/Refund Request Flow
- [x] Write test: User can request return on delivered order
- [x] Write test: Return reason selection is required
- [x] Write test: Return request is created with pending status
- [x] Write test: User sees return request in order details
- [x] Implement return request API endpoint
- [x] Implement return request UI component
- [x] Run all tests, fix any failures

### 1.3 Guest Checkout Complete Flow
- [x] Write test: Guest can add items to cart
- [x] Write test: Guest can proceed to checkout without login
- [x] Write test: Guest must provide email for order tracking
- [x] Write test: Guest receives order confirmation (email field captured)
- [x] Write test: Guest can track order via email link
- [x] Verify existing guest checkout implementation
- [x] Run all tests, fix any failures

**After Phase 1:** Output `<promise>PHASE_1_COMPLETE</promise>`

---

## Phase 2: Account Management Flows

### 2.1 Address Book Management
- [x] Write test: User can view saved addresses
- [x] Write test: User can add new address with validation
- [x] Write test: User can edit existing address
- [x] Write test: User can delete address (with confirmation)
- [x] Write test: User can set default shipping address
- [x] Write test: Default address pre-selected in checkout
- [x] Implement address CRUD in account settings
- [x] Run all tests, fix any failures

### 2.2 Profile Information Update
- [x] Write test: User can update display name
- [x] Write test: User can update phone number
- [x] Write test: Email change requires verification
- [x] Write test: Profile updates persist after refresh
- [x] Implement profile update API and UI
- [x] Run all tests, fix any failures

### 2.3 Password Change (Authenticated)
- [x] Write test: User must enter current password
- [x] Write test: New password must meet requirements
- [x] Write test: Password confirmation must match
- [x] Write test: Success message shown after change
- [x] Write test: User can login with new password
- [x] Implement password change flow
- [x] Run all tests, fix any failures

**After Phase 2:** Output `<promise>PHASE_2_COMPLETE</promise>`

---

## Phase 3: Multi-Language Checkout Flows

### 3.1 English (EN) Checkout
- [x] Write test: Complete checkout flow in English locale
- [x] Write test: All checkout labels display in English
- [x] Write test: Email confirmation mentions English content
- [x] Verify EN translations exist for all checkout strings
- [x] Run test, fix any failures

### 3.2 Romanian (RO) Checkout
- [x] Write test: Complete checkout flow in Romanian locale
- [x] Write test: All checkout labels display in Romanian
- [x] Write test: Currency and date format correct for RO
- [x] Verify RO translations exist for all checkout strings
- [x] Run test, fix any failures

### 3.3 Russian (RU) Checkout
- [x] Write test: Complete checkout flow in Russian locale
- [x] Write test: All checkout labels display in Russian
- [x] Write test: Cyrillic text renders correctly
- [x] Verify RU translations exist for all checkout strings
- [x] Run test, fix any failures

**After Phase 3:** Output `<promise>PHASE_3_COMPLETE</promise>`

---

## Phase 4: Error Handling & Edge Cases

### 4.1 Network Error Handling
- [x] Write test: Checkout shows error on network failure
- [x] Write test: User can retry after network error
- [x] Write test: Cart persists after network error
- [x] Write test: Partial form data preserved on error
- [x] Implement network error handling in checkout
- [x] Run all tests, fix any failures

### 4.2 Inventory Edge Cases
- [x] Write test: Item removed from cart if out of stock
- [x] Write test: User notified when item becomes unavailable
- [x] Write test: Quantity reduced if stock insufficient
- [x] Write test: Checkout blocked if cart has unavailable items
- [x] Implement inventory validation in checkout
- [x] Run all tests, fix any failures

### 4.3 Session & Timeout Handling
- [x] Write test: Cart preserved on session timeout
- [x] Write test: User prompted to re-login if session expires
- [x] Write test: Checkout data preserved after re-login
- [x] Write test: No duplicate orders on timeout retry
- [x] Implement session handling in checkout
- [x] Run all tests, fix any failures

**After Phase 4:** Output `<promise>PHASE_4_COMPLETE</promise>`

---

## Phase 5: Advanced Product Filtering

### 5.1 Category Filtering
- [ ] Write test: Products filter by single category
- [ ] Write test: Products filter by multiple categories
- [ ] Write test: Category filter persists on pagination
- [ ] Write test: Clear filter shows all products
- [ ] Implement category filter UI and logic
- [ ] Run all tests, fix any failures

### 5.2 Price Range Filtering
- [ ] Write test: Products filter by min price
- [ ] Write test: Products filter by max price
- [ ] Write test: Products filter by price range
- [ ] Write test: Price filter updates product count
- [ ] Implement price range filter with debounce
- [ ] Run all tests, fix any failures

### 5.3 Sort Functionality
- [ ] Write test: Products sort by price ascending
- [ ] Write test: Products sort by price descending
- [ ] Write test: Products sort by newest first
- [ ] Write test: Sort persists with other filters
- [ ] Implement sort dropdown and logic
- [ ] Run all tests, fix any failures

**After Phase 5:** Output `<promise>PHASE_5_COMPLETE</promise>`

---

## Phase 6: Mobile Interaction Testing

### 6.1 Mobile Cart Interactions
- [ ] Write test: Touch swipe to remove cart item (mobile)
- [ ] Write test: Quantity stepper works on touch devices
- [ ] Write test: Cart drawer opens/closes on mobile
- [ ] Write test: Cart totals visible without scrolling
- [ ] Run all tests on mobile viewport, fix failures

### 6.2 Mobile Checkout Form
- [ ] Write test: Form fields have appropriate keyboard types
- [ ] Write test: Form validation shows inline on mobile
- [ ] Write test: Checkout steps navigable on 375px width
- [ ] Write test: Payment button always visible (sticky)
- [ ] Run all tests on mobile viewport, fix failures

### 6.3 Mobile Navigation
- [ ] Write test: Hamburger menu opens/closes
- [ ] Write test: Search accessible from mobile header
- [ ] Write test: Back button works correctly in checkout
- [ ] Write test: Language switcher works on mobile
- [ ] Run all tests on mobile viewport, fix failures

**After Phase 6:** Output `<promise>PHASE_6_COMPLETE</promise>`

---

## Phase 7: Email Notification Verification

### 7.1 Order Confirmation Email
- [ ] Write test: Order creates triggers email send
- [ ] Write test: Email contains order number
- [ ] Write test: Email contains order items list
- [ ] Write test: Email contains shipping address
- [ ] Write test: Email contains order total
- [ ] Mock email service and verify payload
- [ ] Run all tests, fix any failures

### 7.2 Email Localization
- [ ] Write test: Email sent in user's preferred locale
- [ ] Write test: Spanish email has correct content
- [ ] Write test: English email has correct content
- [ ] Write test: Romanian email has correct content
- [ ] Write test: Russian email has correct content
- [ ] Run all tests, fix any failures

**After Phase 7:** Output `<promise>PHASE_7_COMPLETE</promise>`

---

## Phase 8: Accessibility Audit

### 8.1 Checkout Accessibility
- [ ] Write test: Checkout form has proper ARIA labels
- [ ] Write test: Form errors announced to screen readers
- [ ] Write test: Tab order is logical through checkout
- [ ] Write test: Focus visible on all interactive elements
- [ ] Write test: Color contrast meets WCAG AA
- [ ] Fix any accessibility violations found
- [ ] Run all tests, fix any failures

### 8.2 Product Page Accessibility
- [ ] Write test: Product images have alt text
- [ ] Write test: Add to cart button is keyboard accessible
- [ ] Write test: Quantity controls labeled correctly
- [ ] Write test: Product details have proper headings
- [ ] Fix any accessibility violations found
- [ ] Run all tests, fix any failures

**After Phase 8:** Output `<promise>PHASE_8_COMPLETE</promise>`

---

## Completion Checklist

After all phases complete, verify:

- [ ] All 100+ tests passing
- [ ] No skipped tests remain
- [ ] Code coverage above 70%
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] All changes committed

**Final output:** `<promise>ALL_COMPLETE</promise>`

---

## Progress Tracking

| Phase | Description | Status | Tests Added |
|-------|-------------|--------|-------------|
| 1 | Payment & Orders | [x] Complete | 24 (Order Cancellation: 9, Order Return: 9, Guest Checkout: 6) |
| 2 | Account Management | [x] Complete | 36 (Address Book: 15, Profile Update: 12, Password Change: 9) |
| 3 | Multi-Language | [x] Complete | 12 (EN: 3, RO: 3, RU: 3, Locale Switch: 2, ES: 1) |
| 4 | Error Handling | [x] Complete | 14 (Network: 3, Cart: 2, Inventory: 3, Session: 3, Form: 3) |
| 5 | Product Filtering | [ ] Pending | 0 |
| 6 | Mobile Testing | [ ] Pending | 0 |
| 7 | Email Verification | [ ] Pending | 0 |
| 8 | Accessibility | [ ] Pending | 0 |

**Total Tasks:** 98 atomic tasks
**Estimated Iterations:** 50-100

---

## Running the Loop

```bash
# Start the Ralph loop with this plan
/ralph-loop "Read RALPH_USER_FLOW_TESTS.md. Find first unchecked [ ] task. Follow TDD: write failing test, implement, make pass, mark [x], commit. Output <promise>PHASE_X_COMPLETE</promise> after each phase. Output <promise>ALL_COMPLETE</promise> when done." --max-iterations 100 --completion-promise "ALL_COMPLETE"
```

Or run phase by phase:

```bash
# Phase 1 only
/ralph-loop "Read RALPH_USER_FLOW_TESTS.md Phase 1. Complete all [ ] tasks using TDD. Mark [x] when done. Output <promise>PHASE_1_COMPLETE</promise> when phase done." --max-iterations 20 --completion-promise "PHASE_1_COMPLETE"
```
