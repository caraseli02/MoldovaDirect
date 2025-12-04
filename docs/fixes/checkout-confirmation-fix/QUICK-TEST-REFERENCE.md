# Quick Test Reference Card
## Checkout Confirmation Redirect Fix

### The Bug
After placing an order, users were redirected to `/cart` instead of `/checkout/confirmation`.

### The Fix
1. Cookie path set to `/` (was missing)
2. `persist()` made async with `await nextTick()`
3. All `persist()` calls now awaited

---

## Fastest Way to Test (30 seconds)

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Guided test
node guided-checkout-test.mjs
```

Follow prompts, then check:
- Final URL should be: `/checkout/confirmation` ✅
- Final URL should NOT be: `/cart` ❌

---

## Manual Test (5 minutes)

1. Add product to cart
2. Go to checkout
3. Fill form: caraseli02@gmail.com, Test User, Madrid
4. Select Cash payment
5. Click "Realizar Pedido"
6. CHECK URL: should be `/checkout/confirmation`

---

## What to Watch in Console

Required logs (in order):
```
💾 PERSIST with orderData: { orderId: X, orderNumber: 'ORD-...' }
✅ PERSIST COMPLETED
📥 RESTORE orderData from cookie: { orderId: X, orderNumber: 'ORD-...' }
```

---

## Files Reference

### To Run Tests
- `guided-checkout-test.mjs` - Interactive guided test (EASIEST)
- `MANUAL-TEST-PROCEDURE.md` - Step-by-step manual guide

### For Understanding
- `TEST-SUMMARY-CHECKOUT-REDIRECT-FIX.md` - What was fixed
- `TESTING-ARTIFACTS-README.md` - Complete documentation

---

## Success Criteria

- [ ] URL = `/checkout/confirmation`
- [ ] Order number visible
- [ ] Console shows PERSIST COMPLETED
- [ ] Console shows RESTORE logs
- [ ] No JavaScript errors

---

## If Test Fails

Check in `composables/useCheckout.ts`:
1. Line ~25: `path: '/'` in cookie config?
2. Line ~100: `persist()` is async?
3. Line ~110: `await nextTick()` in persist()?
4. Line ~550: `await persist()` before navigateTo?

---

## Quick Commands

```bash
# Run guided test
node guided-checkout-test.mjs

# Check if server is running
curl http://localhost:3000

# View test screenshots
open checkout-guided-test/

# View console logs
cat checkout-guided-test/console-logs.json
```

---

**Last Updated**: 2025-11-21
**Time to Test**: 30 seconds (guided) | 5 minutes (manual)
