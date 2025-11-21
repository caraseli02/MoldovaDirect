# Checkout UX Testing

This directory contains automated testing scripts and documentation for the checkout flow.

## Structure

- `checkout-full-flow.mjs` - Main automated test script for complete checkout flow
- `screenshots/` - Screenshots captured during test runs
- `docs/` - Historical reports and documentation from UX testing
- `scripts/` - Helper shell scripts for testing

## Running the Test

```bash
# Make sure dev server is running on port 3000
pnpm run dev

# In another terminal, run the test
node checkout-ux-testing/checkout-full-flow.mjs
```

## Current Status

### ✅ Working Features
- Guest checkout enabled (no authentication required)
- Complete flow through: Cart → Shipping → Payment → Review
- Order creation successful
- Cart clearing after order placement
- Spanish translations added

### ⚠️ Known Issues
- Confirmation page navigation needs debugging
- Cart security CSRF token issue on clear operation
- Email sending fails in development (Resend limitation - test account can only send to verified addresses)

## Test Results

Screenshots are saved to `screenshots/` directory after each test run:
- `01-cart.png` - Cart page
- `02-shipping-form.png` - Shipping information
- `03-shipping-selected.png` - Shipping method selected
- `04-payment-page.png` - Payment method page
- `05-review-page.png` - Review order page
- `05b-terms-accepted.png` - Terms and conditions accepted
- `06-confirmation-page.png` - Final state
- `99-final-state.png` - Final state
