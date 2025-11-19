# Vercel Preview: Add to Cart Not Working - Debug Guide

## Issue
✅ **Works on localhost**: Add to Cart functions correctly
❌ **Fails on Vercel Preview**: Add to Cart doesn't work

**Latest commit pushed**: `8f25cdc` - "fix: correct Add to Cart on product detail page"

---

## Root Cause Analysis

### Potential Issue: SSR Fallback in useCart

**File**: `composables/useCart.ts:9-78`

When Pinia is not available during server-side rendering, `useCart` returns **no-op functions**:

```typescript
if (!pinia) {
  return {
    addItem: async () => {},  // ❌ Does nothing!
    updateQuantity: async () => {},
    removeItem: async () => {},
    // ... all other functions return empty
  }
}
```

**Why This Might Fail on Vercel**:
1. Vercel uses edge runtime for SSR
2. Pinia might not initialize properly on edge
3. First render uses SSR fallback (empty functions)
4. Client-side hydration should fix it... but might not be happening

---

## Debug Steps for Vercel Preview

### Step 1: Check Browser Console
```javascript
// On Vercel preview site, open DevTools
// Console tab
// Look for errors:
- "Pinia not available"
- "Store not initialized"
- Any cart-related errors
```

### Step 2: Test Pinia Availability
```javascript
// In browser console on Vercel preview:
const { useCartStore } = await import('~/stores/cart')
const { getActivePinia } = await import('pinia')

console.log('Pinia:', getActivePinia())
console.log('Cart store available:', typeof useCartStore === 'function')
```

### Step 3: Check if Client Hydration Works
```javascript
// After page loads, run in console:
const { useCart } = await import('~/composables/useCart')
const cart = useCart()

console.log('Cart loaded:', !!cart)
console.log('Add item function:', cart.addItem.toString())
// Should NOT be "async () => {}"
```

### Step 4: Monitor Network Requests
```
1. Open Network tab
2. Click "Add to Cart"
3. Check if ANY requests are made
4. If no requests → client-side issue
5. If requests fail → server-side issue
```

---

## Possible Causes & Solutions

### Cause 1: Pinia Not Initialized on Edge Runtime ⚡

**Symptom**: `getActivePinia()` returns `undefined`

**Solution**: Force client-side only cart operations

```typescript
// In pages/products/[slug].vue
const addToCart = async () => {
  if (!product.value) return

  // Force client-side execution
  if (process.server) {
    console.warn('Cart operations not available on server')
    return
  }

  try {
    const cartProduct = {
      id: product.value.id,
      slug: product.value.slug,
      name: getLocalizedText(product.value.name),
      price: Number(product.value.price),
      images: product.value.images?.map(img => img.url) || [],
      stock: product.value.stockQuantity
    }

    await addItem(cartProduct, selectedQuantity.value)
  } catch (err) {
    console.error('Add to cart failed', err)
  }
}
```

### Cause 2: Build Cache Issue on Vercel

**Symptom**: Old code is deployed

**Solution**: Force redeploy
```bash
# In Vercel dashboard:
1. Go to Deployments
2. Find the latest deployment
3. Click "Redeploy"
4. Check "Use existing build cache" is UNCHECKED
```

### Cause 3: Environment Variables Missing

**Symptom**: No cart persistence

**Solution**: Check Vercel environment variables
```
Required variables:
- SUPABASE_URL
- SUPABASE_KEY
- (Any other cart-related vars)
```

### Cause 4: localStorage Not Available on First Render

**Symptom**: Cart doesn't persist

**Solution**: Check cart persistence type
```typescript
// In stores/cart/index.ts
// Ensure it handles SSR properly
```

### Cause 5: Edge Runtime Limitations

**Symptom**: Some Node.js features don't work

**Solution**: Check Nuxt config for edge runtime compatibility
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel-edge' // or 'vercel'
  }
})
```

---

## Quick Fix to Test

Add this **client-side guard** to the Add to Cart function:

**File**: `pages/products/[slug].vue:647-665`

```diff
const addToCart = async () => {
  if (!product.value) return

+ // Only run on client side
+ if (process.server) {
+   console.warn('Add to Cart: Server-side render, skipping')
+   return
+ }
+
+ // Ensure Pinia is available
+ if (!getActivePinia()) {
+   console.error('Add to Cart: Pinia not initialized')
+   return
+ }

  try {
    const cartProduct = {
      id: product.value.id,
      slug: product.value.slug,
      name: getLocalizedText(product.value.name),
      price: Number(product.value.price),
      images: product.value.images?.map(img => img.url) || [],
      stock: product.value.stockQuantity
    }

    await addItem(cartProduct, selectedQuantity.value)
  } catch (err) {
    console.error('Add to cart failed', err)
  }
}
```

---

## Verification Checklist

After deployment, verify:

- [ ] Browser console shows no errors
- [ ] Pinia is initialized (`getActivePinia()` returns object)
- [ ] `addItem` function is NOT `async () => {}`
- [ ] Network requests are made when clicking "Add to Cart"
- [ ] Cart icon updates with item count
- [ ] Items appear in `/cart` page
- [ ] localStorage has cart data (check Application tab)

---

## Compare Local vs Vercel

### On Localhost (Works):
```
✅ Pinia initialized immediately
✅ Cart store available on first render
✅ addItem executes properly
✅ localStorage works
```

### On Vercel (Fails):
```
❓ Pinia initialization timing?
❓ SSR fallback being used?
❓ Client hydration working?
❓ Edge runtime compatibility?
```

---

## Advanced Debug: Vercel Logs

**Check Vercel Function Logs**:
```bash
# In Vercel dashboard:
1. Go to Deployments → [Your deployment]
2. Click "Functions"
3. Look for errors in:
   - /api/products/[slug]
   - Any cart-related API calls
```

**Look for**:
- Pinia initialization errors
- Store not found errors
- Timeout errors
- Edge runtime errors

---

## Next Steps

1. **Check browser console** on Vercel preview for errors
2. **Test Pinia availability** using the debug commands above
3. **Try the client-side guard** quick fix
4. **Force redeploy** without cache if needed
5. **Compare behavior** between local and Vercel

**Most Likely Fix**: Add `process.server` guard to ensure cart operations only run on client side.

---

## Report Back

Please share:
1. What errors appear in browser console on Vercel?
2. What does `getActivePinia()` return? (run in console)
3. Does the Network tab show any cart-related requests?
4. Any Vercel deployment errors or warnings?
