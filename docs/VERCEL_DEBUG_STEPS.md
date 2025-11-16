# Vercel Preview Debug: Add to Cart Not Working

## Current Status
- ✅ Works on localhost (development)
- ❌ Fails on Vercel preview (production)
- ✅ SSR guard added (commit 587aeee)

## Debug Steps to Run on Vercel Preview

### 1. Check Pinia Initialization

Open browser console on Vercel preview and run:

```javascript
// Check if Pinia is available
import { getActivePinia } from 'pinia'
console.log('Pinia:', getActivePinia())
console.log('Is undefined?', getActivePinia() === undefined)
```

**Expected**: Should return a Pinia instance
**If undefined**: Pinia not initializing on Vercel

### 2. Check Cart Store Availability

```javascript
// Try to access cart store
const { useCartStore } = await import('/stores/cart/index.js')
console.log('Cart store function:', useCartStore)

try {
  const cart = useCartStore()
  console.log('Cart instance:', cart)
  console.log('Cart items:', cart.items)
} catch (err) {
  console.error('Failed to create cart store:', err)
}
```

**Expected**: Should create cart store successfully
**If error**: Store initialization failing

### 3. Check useCart Composable

```javascript
// Try to use cart composable
const { useCart } = await import('/composables/useCart.js')
const cart = useCart()

console.log('useCart returned:', cart)
console.log('addItem function:', cart.addItem.toString())
```

**Expected**: `addItem` should be a real function
**If "async () => {}"**: Using SSR fallback (BAD)

### 4. Test Add to Cart Manually

```javascript
// Try to add item manually
const { useCart } = await import('/composables/useCart.js')
const cart = useCart()

const testProduct = {
  id: 'test-123',
  slug: 'test-product',
  name: 'Test Product',
  price: 10.00,
  images: ['test.jpg'],
  stock: 5
}

try {
  await cart.addItem(testProduct, 1)
  console.log('✅ Add to cart succeeded!')
  console.log('Cart items:', cart.items.value)
} catch (err) {
  console.error('❌ Add to cart failed:', err)
}
```

### 5. Check localStorage Access

```javascript
// Check if localStorage is available
console.log('localStorage available:', typeof localStorage !== 'undefined')

// Try to read cart data
const cartData = localStorage.getItem('moldova_direct_cart')
console.log('Cart in localStorage:', cartData)
```

**Expected**: localStorage should be available and working
**If null**: No cart data saved yet (normal for first visit)

### 6. Check for Console Errors

Look for any errors in console:
- Pinia errors
- Store initialization errors
- "process is not defined" errors
- Any cart-related errors

### 7. Network Tab Check

When clicking "Add to Cart":
1. Open Network tab
2. Click "Add to Cart" button
3. Check if ANY network requests are made
4. Look for failed requests

**Expected**: No network requests (cart is client-side only)
**If requests fail**: Different issue

## Common Issues & Solutions

### Issue 1: Pinia Not Initializing
**Symptom**: `getActivePinia()` returns `undefined`

**Fix**: Check `plugins/pinia.client.ts` or Nuxt config

### Issue 2: process.client Not Working
**Symptom**: Code runs on server despite `process.client` check

**Fix**: Use `import.meta.client` instead:
```typescript
if (import.meta.client) {
  // client-side only code
}
```

### Issue 3: Edge Runtime Limitations
**Symptom**: Different behavior between local and Vercel

**Fix**: Force client-side rendering for cart:
```typescript
// In nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  // But disable SSR for cart
  hooks: {
    'pages:extend'(pages) {
      // Add route rules for cart
    }
  }
})
```

### Issue 4: Build/Deploy Issue
**Symptom**: Old code still deployed

**Fix**: Force fresh deployment in Vercel

## What to Report Back

Please run the debug steps above and share:

1. **Pinia status**: What does `getActivePinia()` return?
2. **Console errors**: Any errors in browser console?
3. **addItem function**: Is it a real function or `async () => {}`?
4. **Manual test**: Does manually adding work?
5. **localStorage**: Can you access it?

This will tell us exactly what's failing on Vercel.
