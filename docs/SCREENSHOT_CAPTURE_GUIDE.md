# UI/UX Audit Screenshot Capture Guide

This guide documents what screenshots should be captured for each GitHub issue to illustrate the UI/UX problems identified in the audit.

## Prerequisites

**Start Local Dev Server:**
```bash
npm run dev
# Server runs on http://localhost:3000
```

**Test Credentials:**
- **Admin:** admin@moldovadirect.com / Admin123!@#
- **Manager:** manager@moldovadirect.com / Manager123!@#
- **Customer:** customer@moldovadirect.com / Customer123!@#

---

## Issue #176 - Admin Accessibility (P0-Critical)

**Problem:** Missing ARIA labels and keyboard navigation

### Screenshots Needed:

1. **Admin Orders Page - Missing ARIA Labels**
   - URL: `/admin/orders`
   - Login as: Admin
   - Viewport: Desktop (1920x1080)
   - Focus: Highlight table, filters, bulk actions without ARIA labels
   - Annotate: Mark interactive elements missing labels

2. **Admin Products Page - No Keyboard Navigation**
   - URL: `/admin/products`
   - Login as: Admin
   - Viewport: Desktop
   - Action: Try to tab through interface
   - Focus: Show no focus indicators on sortable headers, filters

3. **Admin Modal Without Focus Trap**
   - URL: `/admin/orders` (trigger any modal)
   - Login as: Admin
   - Viewport: Desktop
   - Action: Open bulk edit modal
   - Focus: Show modal without focus management

**File Names:**
- `issue-176-orders-no-aria.png`
- `issue-176-products-no-keyboard-nav.png`
- `issue-176-modal-no-focus-trap.png`

---

## Issue #177 - Mobile Admin Tables (P0-Critical)

**Problem:** Tables use horizontal scroll on mobile

### Screenshots Needed:

1. **Orders Table on Mobile - Horizontal Scroll**
   - URL: `/admin/orders`
   - Login as: Admin
   - Viewport: Mobile (375x812 - iPhone X)
   - Focus: Show entire table requiring horizontal scroll
   - Annotate: Mark columns cut off by viewport

2. **Products Table on Mobile - Poor Touch Targets**
   - URL: `/admin/products`
   - Login as: Admin
   - Viewport: Mobile
   - Focus: Action buttons that are too small for touch
   - Annotate: Mark touch targets < 44px

3. **Desktop vs Mobile Comparison**
   - Side-by-side comparison
   - Show desktop usability vs mobile struggle

**File Names:**
- `issue-177-orders-mobile-horizontal-scroll.png`
- `issue-177-products-mobile-small-buttons.png`
- `issue-177-desktop-vs-mobile-comparison.png`

---

## Issue #178 - Search Autocomplete (P0-Critical)

**Problem:** No search suggestions or autocomplete

### Screenshots Needed:

1. **Product Search - Basic Input Only**
   - URL: `/products`
   - Login as: Customer
   - Viewport: Desktop
   - Action: Type "wine" in search
   - Focus: Show plain input with no dropdown suggestions

2. **Header Search - No Autocomplete**
   - URL: `/` (any page)
   - Login as: Customer
   - Viewport: Desktop
   - Action: Click header search icon
   - Focus: Show search input without suggestions

3. **Competitor Example (Mock)**
   - Show what autocomplete should look like
   - Example: Product suggestions, recent searches

**File Names:**
- `issue-178-search-no-autocomplete-desktop.png`
- `issue-178-header-search-basic.png`
- `issue-178-expected-autocomplete-mock.png`

---

## Issue #179 - Email Template Editor (P1-High)

**Problem:** Manual JSON editing in textarea

### Screenshots Needed:

1. **Email Template JSON Textarea**
   - URL: `/admin/email-templates`
   - Login as: Admin
   - Viewport: Desktop
   - Focus: Show raw JSON textarea editor
   - Annotate: Mark error-prone JSON editing

2. **JSON Syntax Error Example**
   - Same page
   - Action: Introduce JSON syntax error
   - Focus: Show error or broken state

**File Names:**
- `issue-179-json-textarea-editor.png`
- `issue-179-json-syntax-error.png`

---

## Issue #180 - Admin Breadcrumbs (P1-High)

**Problem:** No breadcrumbs on detail pages

### Screenshots Needed:

1. **Order Detail - No Breadcrumbs**
   - URL: `/admin/orders/[first-order-id]`
   - Login as: Admin
   - Viewport: Desktop
   - Focus: Top of page showing no navigation breadcrumbs
   - Annotate: Where breadcrumbs should be

2. **Product Detail - No Breadcrumbs**
   - URL: `/admin/products/[first-product-id]`
   - Login as: Admin
   - Viewport: Desktop
   - Focus: Missing breadcrumb navigation

**File Names:**
- `issue-180-order-detail-no-breadcrumbs.png`
- `issue-180-product-detail-no-breadcrumbs.png`

---

## Issue #181 - Product Comparison (P1-High)

**Problem:** No product comparison feature

### Screenshots Needed:

1. **Product Cards - No Compare Checkbox**
   - URL: `/products`
   - Login as: Customer
   - Viewport: Desktop
   - Focus: Product cards without compare checkboxes
   - Annotate: Where compare checkboxes should be

2. **No Comparison View**
   - URL: `/compare` (should 404)
   - Login as: Customer
   - Focus: Show page not found

**File Names:**
- `issue-181-products-no-compare-checkbox.png`
- `issue-181-compare-page-404.png`

---

## Issue #182 - Quick View Modal (P1-High)

**Problem:** No quick view for products

### Screenshots Needed:

1. **Product Cards - No Quick View Icon**
   - URL: `/products`
   - Login as: Customer
   - Viewport: Desktop
   - Focus: Product cards without eye/quick-view icon
   - Annotate: Where quick view icon should be

2. **Expected Quick View Modal (Mock)**
   - Mockup showing desired quick view modal

**File Names:**
- `issue-182-products-no-quick-view-icon.png`
- `issue-182-expected-quick-view-modal-mock.png`

---

## Issue #183 - Persistent Wishlist (P1-High)

**Problem:** Wishlist toggle exists but no persistent wishlist page

### Screenshots Needed:

1. **Product Page - Wishlist Toggle**
   - URL: `/products/[any-product-slug]`
   - Login as: Customer
   - Viewport: Desktop
   - Focus: Wishlist heart icon
   - Annotate: Toggle present but nowhere to view list

2. **Wishlist Page 404**
   - URL: `/account/wishlist`
   - Login as: Customer
   - Focus: Page not found or doesn't exist

3. **Header - No Wishlist Count**
   - URL: `/` (any page)
   - Login as: Customer
   - Focus: Header navigation
   - Annotate: Missing wishlist icon with count

**File Names:**
- `issue-183-product-wishlist-toggle.png`
- `issue-183-wishlist-page-404.png`
- `issue-183-header-no-wishlist-icon.png`

---

## Issue #184 - Checkout Progress (P1-High)

**Problem:** No progress indicator in checkout

### Screenshots Needed:

1. **Checkout Shipping - No Progress**
   - URL: `/checkout`
   - Login as: Customer (with items in cart)
   - Viewport: Desktop
   - Focus: Top of page showing no stepper
   - Annotate: Where progress indicator should be

2. **Checkout Payment - No Step Indication**
   - URL: `/checkout/payment`
   - Login as: Customer
   - Viewport: Desktop
   - Focus: No indication of current step or total steps

3. **Expected Checkout Stepper (Mock)**
   - Mockup showing stepper: Shipping > Payment > Review > Complete

**File Names:**
- `issue-184-checkout-no-progress-indicator.png`
- `issue-184-payment-no-step-indication.png`
- `issue-184-expected-stepper-mock.png`

---

## Issue #185 - Trust Badges (P1-High)

**Problem:** No security badges on payment page

### Screenshots Needed:

1. **Payment Page - No Trust Badges**
   - URL: `/checkout/payment`
   - Login as: Customer (with items in cart)
   - Viewport: Desktop
   - Focus: Payment form area
   - Annotate: Where security badges should be

2. **Payment Page Mobile - No Trust Signals**
   - Same URL
   - Viewport: Mobile (375x812)
   - Focus: Missing SSL, payment method logos

3. **Expected Trust Badges (Mock)**
   - Mockup with SSL badge, payment logos, "Secure payment powered by Stripe"

**File Names:**
- `issue-185-payment-no-trust-badges-desktop.png`
- `issue-185-payment-no-trust-badges-mobile.png`
- `issue-185-expected-trust-badges-mock.png`

---

## Issue #186 - Column Visibility (P2-Medium)

**Problem:** No column visibility toggle in admin tables

### Screenshots Needed:

1. **Orders Table - No Column Controls**
   - URL: `/admin/orders`
   - Login as: Admin
   - Viewport: Desktop
   - Focus: Table toolbar
   - Annotate: Where column visibility dropdown should be

2. **Expected Column Visibility UI (Mock)**
   - Mockup showing dropdown with checkboxes for each column

**File Names:**
- `issue-186-orders-no-column-toggle.png`
- `issue-186-expected-column-controls-mock.png`

---

## Issue #187 - Pagination (P2-Medium)

**Problem:** Pagination doesn't show total pages

### Screenshots Needed:

1. **Pagination - No Total Pages**
   - URL: `/admin/orders`
   - Login as: Admin
   - Viewport: Desktop
   - Focus: Pagination component
   - Annotate: Shows "Page 1" but not "of X"

2. **Expected Pagination (Mock)**
   - Mockup showing "Page 1 of 25" with jump-to-page input

**File Names:**
- `issue-187-pagination-no-total.png`
- `issue-187-expected-pagination-mock.png`

---

## Issue #188 - Mobile Filter (P2-Medium)

**Problem:** Mobile filter hides products

### Screenshots Needed:

1. **Mobile Filter - Fullscreen Panel**
   - URL: `/products`
   - Login as: Customer
   - Viewport: Mobile (375x812)
   - Action: Open filter panel
   - Focus: Show filter panel completely covering products

2. **Expected Bottom Sheet (Mock)**
   - Mockup showing draggable bottom sheet with products visible above

**File Names:**
- `issue-188-mobile-filter-covers-products.png`
- `issue-188-expected-bottom-sheet-mock.png`

---

## Issue #189 - Delivery Estimates (P2-Medium)

**Problem:** No delivery date estimates

### Screenshots Needed:

1. **Cart - No Delivery Date**
   - URL: `/cart`
   - Login as: Customer (with items in cart)
   - Viewport: Desktop
   - Focus: Cart items
   - Annotate: Where delivery estimate should appear

2. **Checkout - No Delivery Estimates**
   - URL: `/checkout`
   - Login as: Customer
   - Viewport: Desktop
   - Focus: Shipping options without delivery dates

3. **Expected Delivery Estimates (Mock)**
   - Mockup showing "Estimated delivery: Dec 15-17" in cart

**File Names:**
- `issue-189-cart-no-delivery-date.png`
- `issue-189-checkout-no-delivery-estimate.png`
- `issue-189-expected-delivery-mock.png`

---

## Automation Script

The `/scripts/capture-screenshots.js` file contains a Puppeteer script that can automate all screenshot captures.

**To run:**
```bash
npm install --save-dev puppeteer
node scripts/capture-screenshots.js
```

**Output:**
- Screenshots saved to `/docs/screenshots/`
- Organized by: `admin/`, `customer/`, `mobile/`
- Manifest file: `/docs/screenshots/manifest.json`

---

## Screenshot Guidelines

### General Rules:
- **Full page screenshots** for context
- **Annotate** problem areas with red boxes/arrows
- **Consistent viewport sizes:**
  - Desktop: 1920x1080
  - Mobile: 375x812 (iPhone X)
  - Tablet: 768x1024 (iPad)
- **File naming:** `issue-[number]-[description].png`
- **Alt text:** Describe what the screenshot shows

### Annotation Tools:
- macOS: Preview, Skitch
- Windows: Snip & Sketch, Paint 3D
- Web: Figma, Canva
- CLI: ImageMagick

### Example Annotation:
```bash
# Add red rectangle highlighting problem area
convert input.png -fill none -stroke red -strokewidth 3 \
  -draw "rectangle 100,100 300,200" output.png

# Add arrow pointing to issue
convert output.png -fill red -stroke red \
  -draw "line 350,150 450,200" -draw "polygon 450,200 445,195 445,205" \
  final.png
```

---

## Next Steps

1. ✅ Review this guide
2. ⏳ Capture screenshots manually or run automation script
3. ⏳ Annotate screenshots to highlight issues
4. ⏳ Upload to GitHub (drag & drop into issue comments)
5. ⏳ Update issue descriptions with screenshots

---

## Questions?

See `/docs/UI_UX_AUDIT_EXECUTIVE_SUMMARY.md` for full audit details.
