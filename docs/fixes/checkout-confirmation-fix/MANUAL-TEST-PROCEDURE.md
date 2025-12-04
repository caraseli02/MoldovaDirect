# Manual Test Procedure: Checkout Confirmation Redirect Fix

## Context
This test validates the fix for the checkout confirmation page redirect bug where users were incorrectly redirected to /cart instead of /checkout/confirmation after placing an order.

## Fixes Implemented
1. Added `path: '/'` to CHECKOUT_SESSION_COOKIE_CONFIG (cookie scoping fix)
2. Made `persist()` async with `await nextTick()` (ensures cookie write completes)
3. Added `await` to all `persist()` calls (prevents race conditions)

## Test Environment
- URL: http://localhost:3000
- Browser: Chrome (with DevTools open)
- Locale: Spanish (es)

---

## Test Steps

### 1. Setup
- [ ] Open Chrome browser
- [ ] Navigate to http://localhost:3000
- [ ] Open DevTools (F12 or Cmd+Option+I)
- [ ] Go to Console tab
- [ ] Clear console logs

### 2. Add Product to Cart
- [ ] Navigate to http://localhost:3000/products
- [ ] Click on any product
- [ ] Click "Añadir al carrito" (Add to Cart)
- [ ] Verify product is added (toast notification or cart badge updates)
- [ ] **Screenshot:** Save as `manual-test-01-product-added.png`

### 3. View Cart
- [ ] Navigate to http://localhost:3000/cart
- [ ] Verify product appears in cart
- [ ] **Screenshot:** Save as `manual-test-02-cart-view.png`

### 4. Proceed to Checkout
- [ ] Click "Procesar Pedido" (Proceed to Checkout) button
- [ ] Should navigate to /checkout (shipping step)
- [ ] **Screenshot:** Save as `manual-test-03-checkout-shipping.png`

### 5. Fill Shipping Information
Fill the following information:
- **First Name:** Test
- **Last Name:** User
- **Email:** caraseli02@gmail.com
- **Street:** 123 Test St
- **City:** Madrid
- **Postal Code:** 28001
- **Phone:** 600123456
- **Country:** ES (Spain)

- [ ] Click "Continuar" (Continue)
- [ ] Should navigate to /checkout/payment
- [ ] **Screenshot:** Save as `manual-test-04-shipping-filled.png`

### 6. Select Payment Method
- [ ] Select "Efectivo" (Cash) payment method
- [ ] Click "Continuar" (Continue)
- [ ] Should navigate to /checkout/review
- [ ] **Screenshot:** Save as `manual-test-05-payment-selected.png`

### 7. Review Order
- [ ] Review order details
- [ ] Check "Terms and Conditions" checkbox
- [ ] Check "Privacy Policy" checkbox
- [ ] **Screenshot:** Save as `manual-test-06-review-before-order.png`

### 8. Place Order (CRITICAL STEP)

**Before clicking "Realizar Pedido":**
- [ ] Keep Console tab visible
- [ ] Look for these console log patterns:
  - 🔴 Lines containing "processPayment"
  - 🔵 Lines containing "createOrderRecord"
  - 🟢 Lines containing "completeCheckout"
  - 🟡 Lines containing "PERSIST" and "orderData"
  - ✅ Lines containing "PERSIST COMPLETED"

**Click "Realizar Pedido" (Place Order):**
- [ ] Click the button
- [ ] Watch the URL bar carefully

**After clicking:**
- [ ] Wait 3-5 seconds for redirect
- [ ] **Screenshot:** Save as `manual-test-07-after-place-order.png`
- [ ] **Screenshot Console:** Save as `manual-test-08-console-logs.png`

---

## Expected Results (SUCCESS)

### URL Check
- ✅ Should navigate to: `/checkout/confirmation`
- ❌ Should NOT navigate to: `/cart`

### Page Content
- ✅ Page should display order confirmation message
- ✅ Order number should be visible (format: ORD-XXXXXXXXX-XXXXXX)
- ✅ Page title: "Pedido Confirmado" or "Order Confirmed"

### Console Logs (verify these appear in order)
1. 🔴 `processPayment` logs showing payment processing
2. 🔵 `createOrderRecord returning orderData` with orderId and orderNumber
3. 🟢 `completeCheckout receiving orderData` with orderId and orderNumber
4. 🟡 `PERSIST with orderData` showing orderId and orderNumber
5. ✅ `PERSIST COMPLETED` message
6. 🔍 `RESTORE` logs on confirmation page showing successful restore

---

## Failure Scenarios

### Scenario 1: Redirected to /cart
- **Symptoms:** URL shows `/cart` instead of `/checkout/confirmation`
- **Indicates:** Bug NOT fixed - cookie not persisting orderData correctly
- **Action:** Review persist() implementation and cookie configuration

### Scenario 2: Order number not visible
- **Symptoms:** On confirmation page but order number missing
- **Indicates:** Cookie not restoring orderData on confirmation page
- **Action:** Review restore() implementation in confirmation page

### Scenario 3: Still on review page
- **Symptoms:** URL doesn't change, still on `/checkout/review`
- **Indicates:** Order creation failed or redirect logic broken
- **Action:** Check console for errors, review order creation logic

---

## Console Log Examples

### What to Look For:

```javascript
// Good - order creation succeeded
🔴 processPayment: { method: 'cash', amount: 123.45 }
🔵 createOrderRecord returning orderData: { orderId: 123, orderNumber: 'ORD-...' }
🟢 completeCheckout receiving orderData: { orderId: 123, orderNumber: 'ORD-...' }
🟡 PERSIST with orderData: { orderId: 123, orderNumber: 'ORD-...' }
✅ PERSIST COMPLETED
// After redirect to confirmation page:
🔍 RESTORE orderData from cookie: { orderId: 123, orderNumber: 'ORD-...' }
```

```javascript
// Bad - missing critical data
🟢 completeCheckout receiving orderData: undefined  // ❌ Problem!
🟡 PERSIST with orderData: undefined  // ❌ Problem!
```

---

## Test Result Summary

Fill this after completing the test:

### Test Execution Date/Time:
_____________________

### Final URL after placing order:
_____________________

### Order Number (if visible):
_____________________

### Test Result:
- [ ] ✅ PASSED - Landed on /checkout/confirmation with order number
- [ ] ❌ FAILED - Redirected to /cart (bug not fixed)
- [ ] ⚠️  PARTIAL - On confirmation page but order number missing
- [ ] ⚠️  ERROR - Other issue (describe below)

### Notes:
```
(Add any observations, console errors, or unexpected behavior here)
```

---

## Screenshots Checklist
- [ ] manual-test-01-product-added.png
- [ ] manual-test-02-cart-view.png
- [ ] manual-test-03-checkout-shipping.png
- [ ] manual-test-04-shipping-filled.png
- [ ] manual-test-05-payment-selected.png
- [ ] manual-test-06-review-before-order.png
- [ ] manual-test-07-after-place-order.png
- [ ] manual-test-08-console-logs.png

---

## Additional Verification

### Cookie Inspection (Optional)
1. Open DevTools > Application tab
2. Go to Cookies > http://localhost:3000
3. Look for cookie named: `checkout_session`
4. Check:
   - [ ] Cookie exists
   - [ ] Path is set to `/`
   - [ ] Value contains orderData after placing order

### Network Tab (Optional)
1. Open DevTools > Network tab
2. Filter: Fetch/XHR
3. During order placement, look for:
   - [ ] POST request to create order endpoint
   - [ ] Response includes orderId and orderNumber
   - [ ] Redirect navigation event to /checkout/confirmation

---

## Troubleshooting

### If cart is empty when navigating to /checkout
- This is expected behavior (cart validation)
- Go back to step 2 and add a product first

### If form fields don't match
- The actual field names may vary
- Look at the HTML structure in DevTools
- Adjust field selection accordingly

### If console logs are overwhelming
- Filter console by typing: `PERSIST` or `orderData`
- This will show only the critical logs

---

**Last Updated:** 2025-11-21
**Test Version:** 1.0
**Related Files:**
- `composables/useCheckout.ts` (main checkout logic)
- `pages/checkout/confirmation.vue` (confirmation page)
- `stores/checkout.ts` (checkout store if applicable)
