# Add to Cart Root Cause Analysis

**Investigation Date**: 2025-11-16
**Status**: ROOT CAUSE IDENTIFIED
**Severity**: CRITICAL - Product detail page "Add to Cart" is broken

---

## Executive Summary

The "Add to Cart" button on the **product detail page** (`pages/products/[slug].vue`) is calling the cart store's `addItem()` function with **incorrect parameters**, causing validation failures.

**Impact**:
- ❌ Product detail page: Add to Cart **BROKEN**
- ✅ Landing page (via ProductCard): Add to Cart **WORKS**
- ✅ Products listing page (via ProductCard): Add to Cart **WORKS**

---

## Root Cause

### Expected Function Signature

From `stores/cart/core.ts:236-299` and `stores/cart/types.ts:11-22`:

```typescript
async addItem(product: Product, quantity: number = 1): Promise<void>

interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  stock: number
  category?: string
  weight?: number
  dimensions?: ProductDimensions
  attributes?: Record<string, any>
}
```

### Actual Implementation Differences

#### ✅ CORRECT: ProductCard.vue (lines 291-322)

Used on landing page and products listing page:

```typescript
const addToCart = async () => {
  const cartProduct = {
    id: props.product.id,
    slug: props.product.slug,
    name: getLocalizedText(props.product.name),
    price: Number(props.product.price),
    images: props.product.images?.map(img => img.url) || [],
    stock: props.product.stockQuantity
  }

  await addItem(cartProduct, 1)  // ✅ CORRECT: Full Product object + quantity
}
```

**Why it works**:
- Constructs a complete `Product` object with all required properties
- Passes quantity as second parameter
- Maps ProductImage objects to string URLs for images array
- Maps `stockQuantity` to `stock` property

#### ❌ BROKEN: Product Detail Page (pages/products/[slug].vue:647-657)

```typescript
const addToCart = async () => {
  if (!product.value) return
  try {
    await addItem({
      productId: product.value.id,  // ❌ WRONG: Should be "id" not "productId"
      quantity: selectedQuantity.value  // ❌ WRONG: quantity is second parameter
    })
  } catch (err) {
    console.error('Add to cart failed', err)
  }
}
```

**Why it fails**:

1. **Missing `id` property**: Object has `productId` instead of `id`
2. **Missing required properties**: `slug`, `name`, `price`, `images`, `stock`
3. **Wrong parameter structure**: Quantity is inside the object instead of being the second parameter
4. **Validation will fail**: The `validateProduct` function (stores/cart/core.ts:153-166) checks for:
   - `product.id` ❌ (object has `productId`)
   - `product.name` ❌ (missing)
   - `product.price` ❌ (missing)
   - `product.stock` ❌ (missing)

### Validation Function

From `stores/cart/core.ts:153-166`:

```typescript
function validateProduct(product: Product): void {
  if (!product.id) {
    throw createCartError('validation', 'INVALID_PRODUCT_ID', 'Product ID is required')
  }
  if (!product.name) {
    throw createCartError('validation', 'INVALID_PRODUCT_NAME', 'Product name is required')
  }
  if (typeof product.price !== 'number' || product.price < 0) {
    throw createCartError('validation', 'INVALID_PRODUCT_PRICE', 'Product price must be a positive number')
  }
  if (typeof product.stock !== 'number' || product.stock < 0) {
    throw createCartError('validation', 'INVALID_PRODUCT_STOCK', 'Product stock must be a non-negative number')
  }
}
```

---

## Fix Required

### File: `pages/products/[slug].vue:647-657`

**Before (BROKEN)**:
```typescript
const addToCart = async () => {
  if (!product.value) return
  try {
    await addItem({
      productId: product.value.id,
      quantity: selectedQuantity.value
    })
  } catch (err) {
    console.error('Add to cart failed', err)
  }
}
```

**After (FIXED)**: Follow the ProductCard.vue pattern:
```typescript
const addToCart = async () => {
  if (!product.value) return

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

**Note**: Need to import `getLocalizedText` utility if not already imported.

---

## Testing Plan

After fix:

1. **Product Detail Page**:
   - Navigate to `/products/[any-slug]`
   - Click "Add to Cart" button
   - Verify item appears in cart with correct quantity

2. **Landing Page**:
   - Click "Add to Cart" on featured products
   - Verify items added correctly (should already work)

3. **Products Listing Page**:
   - Navigate to `/products`
   - Click "Add to Cart" on product cards
   - Verify items added correctly (should already work)

4. **Edge Cases**:
   - Test with quantity > 1 on product detail page
   - Test with out-of-stock products
   - Verify error handling and toast notifications

---

## Related Files

- **Cart Store**: `stores/cart/core.ts:236-299` (addItem implementation)
- **Cart Types**: `stores/cart/types.ts:11-22` (Product interface)
- **ProductCard**: `components/product/Card.vue:291-322` (working implementation)
- **Product Detail**: `pages/products/[slug].vue:647-657` (broken implementation)
- **useCart Composable**: `composables/useCart.ts:186-191` (wrapper function)

---

## Technical Details

### Type System
- TypeScript allows the incorrect call because useCart.ts:186 uses `any` type
- Stricter typing would have caught this at compile time
- Recommendation: Replace `any` with proper `Product` type in useCart

### Architecture
- Cart store uses modular design (core, persistence, validation, analytics, etc.)
- Validation happens in core module before adding items
- Validation errors are thrown as CartError objects
- Error handling exists but parameters never reach validation

### SSR Considerations
- useCart composable has SSR fallback (lines 9-78)
- On server, cart operations are no-ops
- Client-side hydration required for cart functionality
