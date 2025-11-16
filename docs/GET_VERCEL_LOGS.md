# How to Get Console Logs from Vercel Preview

## Quick Option: Enable Mobile Debug Alerts

I've added a `showMobileDebug` flag in the code. To enable it:

### Enable Debug Alerts:

**File**: `pages/products/[slug].vue` line ~660

Change this line:
```typescript
const showMobileDebug = false // Set to true to see alerts on mobile
```

To:
```typescript
const showMobileDebug = true // ENABLED
```

Then commit and push. After Vercel deploys, you'll see alerts showing:
- Debug info when clicking Add to Cart
- Success message when it works
- Detailed error if it fails

**Remember to disable it after debugging!**

---

## Remote Debugging Methods

### Android Phone + Chrome Desktop

1. **On Phone**:
   - Connect phone to computer via USB
   - Enable USB Debugging (Settings → Developer Options)
   - Open Chrome browser
   - Navigate to your Vercel preview URL

2. **On Desktop Chrome**:
   - Open Chrome
   - Navigate to `chrome://inspect`
   - Under "Remote devices", find your phone
   - Click "Inspect" next to the Vercel preview tab
   - Console logs will appear in desktop Chrome DevTools!

### iPhone + Safari Desktop

1. **On iPhone**:
   - Settings → Safari → Advanced
   - Enable "Web Inspector"
   - Open Safari
   - Navigate to Vercel preview URL

2. **On Mac**:
   - Open Safari
   - Safari menu → Preferences → Advanced
   - Enable "Show Develop menu"
   - Develop menu → [Your iPhone's Name] → Vercel preview page
   - Console appears in Safari Web Inspector

---

## Alternative: Desktop Browser Testing

**Simplest method**:

1. Get Vercel preview URL from:
   - GitHub PR checks/comments
   - Vercel dashboard
   - Format: `https://your-app-git-branch-name.vercel.app`

2. Open URL in desktop browser (Chrome/Firefox/Edge)

3. Open DevTools (F12)

4. Go to Console tab

5. Click "Add to Cart" button

6. See console output:
   ```
   🛒 Add to Cart clicked { ... }
   🛒 Calling addItem with: { ... }
   ✅ Add to cart succeeded!
   ```

   Or error:
   ```
   ❌ Add to cart failed: [error details]
   ```

---

## What to Look For

### Success Pattern:
```javascript
🛒 Add to Cart clicked {
  productId: "WINE-001",
  quantity: 1,
  isClient: true,
  hasWindow: true,
  addItemType: "function",
  addItemString: "real function"
}
🛒 Calling addItem with: {
  id: "WINE-001",
  slug: "moldovan-wine",
  name: "Moldovan Wine",
  price: 25.99,
  images: [...],
  stock: 10
}
✅ Add to cart succeeded!
```

### Failure Pattern (Pinia not initialized):
```javascript
🛒 Add to Cart clicked {
  productId: "WINE-001",
  quantity: 1,
  isClient: true,
  hasWindow: true,
  addItemType: "function",  // ⚠️ But check the next line...
  addItemString: "async () => {}"  // ❌ This means SSR fallback!
}
❌ ERROR: addItem is not a function (type: function)
```

### Failure Pattern (Function not available):
```javascript
🛒 Add to Cart clicked {
  productId: "WINE-001",
  quantity: 1,
  isClient: true,
  hasWindow: true,
  addItemType: "undefined",  // ❌ Not available!
  addItemString: "undefined"
}
❌ ERROR: addItem is not a function (type: undefined)
```

---

## What to Report

Please share:

1. **Full console output** (screenshot or copy-paste)
2. **What `addItemType` shows** (function or undefined?)
3. **What `addItemString` shows** (real function or async () => {}?)
4. **Any error messages**
5. **Alert messages** if you enabled mobile debug

This will tell us exactly what's failing!

---

## Quick Manual Test in Console

If you can access console, try this:

```javascript
// Test 1: Check Pinia
import { getActivePinia } from 'pinia'
console.log('Pinia:', getActivePinia())

// Test 2: Check cart
const { useCart } = await import('/composables/useCart.js')
const cart = useCart()
console.log('Cart addItem:', cart.addItem.toString())

// Test 3: Try to add item
const testProduct = {
  id: 'test', slug: 'test', name: 'Test',
  price: 10, images: [], stock: 5
}
await cart.addItem(testProduct, 1)
console.log('Cart items:', cart.items.value)
```

Share the output of these commands!
