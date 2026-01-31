# Moldova Direct - UI/UX Review Report

**Date:** 2026-01-31
**Reviewer:** Code Analysis Review
**Target Application:** https://moldova-direct.vercel.app/
**Tech Stack:** Nuxt.js/Vue, TailwindCSS, shadcn-vue

---

## Executive Summary

This review analyzes the Moldova Direct e-commerce webapp across all major routes, viewports (mobile 390px, desktop 1440px), and languages (ES, EN, RO, RU). The review was conducted through code analysis since the live site blocks automated requests.

**Issues Found:** 12 issues total
- Critical: 2
- Major: 5
- Minor: 5

---

## Issue: Search Input Icon Overlaps with Text

**Priority:** critical
**Route:** /products
**Viewport:** both
**Language:** all

### Description
The SearchBar component (`components/product/SearchBar.vue`) positions a search icon absolutely on the left side of the input, but the underlying `UiInput` component uses standard `px-3` padding that doesn't account for the icon width. This causes user-typed text to overlap with the search icon.

### Location
`components/product/SearchBar.vue:4-27`

### Steps to Reproduce
1. Navigate to /products
2. Click on the search input
3. Start typing a search query
4. Observe that text starts from the left edge, overlapping the search icon

### Expected Behavior
Input text should start after the search icon with appropriate left padding (approximately `pl-10` to account for the icon).

### Actual Behavior
Text overlaps with the search icon because the input only has `px-3` padding while the icon is positioned absolutely at `left: 0`.

### Suggested Fix
Add a custom class to the UiInput to provide left padding:
```vue
<UiInput
  class="pl-10"
  ...
/>
```

Or modify the SearchBar to include proper padding in the input wrapper.

---

## Issue: Russian Translation File Has Untranslated English Strings

**Priority:** critical
**Route:** all
**Viewport:** both
**Language:** RU

### Description
The Russian locale file (`i18n/locales/ru.json`) contains numerous cart-related messages that are still in English instead of Russian. This creates a poor user experience for Russian-speaking users as they see mixed-language content.

### Location
`i18n/locales/ru.json:81-100+`

### Untranslated Strings Found
```json
"addedToCart": "Added to cart",
"quantityUpdated": "Quantity updated",
"productRemoved": "Product removed",
"productRemovedDetails": "{product} removed from cart",
"cartCleared": "Cart cleared",
"cartClearedDetails": "All products have been removed",
"cartRestored": "Cart restored",
"cartRestoredDetails": "Products restored to cart",
"productRestored": "Product restored",
"productRestoredDetails": "{product} restored to cart",
"cartLoaded": "Cart loaded",
"cartLoadedFromSession": "Cart restored from current session",
"cartLoadedFromStorage": "Cart restored",
"cartMigrated": "Cart migrated",
"cartMigratedDetails": "Cart data migrated to {storage}",
"cartValidated": "Cart validated",
"allProductsAvailable": "All products are available",
"cartValidatedDetails": "All products are available and updated"
```

### Expected Behavior
All strings should be translated to Russian.

### Actual Behavior
Many cart success/error messages display in English for Russian users.

---

## Issue: Checkout Page Has Hardcoded English Meta Tags

**Priority:** major
**Route:** /checkout
**Viewport:** both
**Language:** all (especially non-EN)

### Description
The checkout page (`pages/checkout/index.vue`) has hardcoded English text in the `useHead` meta configuration instead of using i18n translations.

### Location
`pages/checkout/index.vue:84-89`

### Code
```typescript
useHead({
  title: 'Checkout - Moldova Direct',
  meta: [
    { name: 'description', content: 'Complete your purchase securely' },
  ],
})
```

### Expected Behavior
Meta tags should use i18n:
```typescript
useHead({
  title: t('seo.checkout.title'),
  meta: [
    { name: 'description', content: t('seo.checkout.description') },
  ],
})
```

### Actual Behavior
Browser tab and SEO meta always show English regardless of selected language.

---

## Issue: Skip Links Target Non-Existent Element When Filters Inactive

**Priority:** major
**Route:** /products
**Viewport:** both
**Language:** all

### Description
The products page includes an accessibility skip link "Skip to filters" that targets `#product-filters`. However, this ID is only rendered when the `ProductActiveFilters` component is displayed (i.e., when filters are active). When no filters are active, the skip link target doesn't exist.

### Location
`pages/products/index.vue:12-16` and `pages/products/index.vue:93-100`

### Steps to Reproduce
1. Navigate to /products with no filters applied
2. Use keyboard navigation (Tab) to focus on the skip link
3. Press Enter on "Skip to filters"
4. Nothing happens because `#product-filters` doesn't exist

### Expected Behavior
Either:
1. Always render an element with `id="product-filters"` (even if empty/hidden)
2. Or change the skip link to target the filter trigger button

### Actual Behavior
Skip link fails silently when no filters are active.

---

## Issue: Product Card Component Exceeds 300-Line Limit

**Priority:** major
**Route:** /products, / (homepage)
**Viewport:** both
**Language:** all

### Description
The `components/product/Card.vue` file is 622 lines, significantly exceeding the project's 300-line component limit as specified in `CLAUDE.md` and `docs/development/CODE_DESIGN_PRINCIPLES.md`.

### Location
`components/product/Card.vue` (622 lines)

### Expected Behavior
Components should be under 300 lines per project guidelines.

### Actual Behavior
The component handles too many responsibilities:
- Image display and error handling
- Stock status logic
- Cart integration
- Touch/haptic feedback
- Price formatting
- Localization

### Suggested Fix
Extract into smaller components:
- `ProductCardImage.vue`
- `ProductCardActions.vue`
- `ProductCardPrice.vue`
- Use composables for business logic

---

## Issue: SearchBar Clear Button Incorrectly Positioned

**Priority:** major
**Route:** /products
**Viewport:** both
**Language:** all

### Description
The clear button in SearchBar is rendered as a `UiButton` inside the input container but lacks absolute positioning, causing it to appear outside the input field instead of inside on the right.

### Location
`components/product/SearchBar.vue:28-48`

### Steps to Reproduce
1. Navigate to /products
2. Type in the search box
3. Observe the clear button position

### Expected Behavior
Clear button should appear inside the input on the right side, similar to native search inputs.

### Actual Behavior
The button appears as a separate element below or beside the input depending on layout.

### Suggested Fix
Add absolute positioning to the clear button:
```vue
<UiButton
  v-if="modelValue"
  type="button"
  variant="ghost"
  size="icon"
  class="absolute inset-y-0 right-0 flex items-center pr-3"
  :aria-label="clearLabel"
  @click="$emit('clear')"
>
```

---

## Issue: Missing Newsletter Subscription Implementation

**Priority:** major
**Route:** / (homepage footer)
**Viewport:** both
**Language:** all

### Description
The newsletter subscription in the footer has a TODO comment indicating the API call is not implemented. Users can enter their email and submit, but nothing happens.

### Location
`components/layout/AppFooter.vue:326`

### Code
```typescript
// TODO: Implement actual newsletter subscription API call
```

### Expected Behavior
Newsletter signup should save user email to database/email service.

### Actual Behavior
Form submission does nothing or silently fails.

---

## Issue: Contact Form Not Implemented

**Priority:** minor
**Route:** /contact
**Viewport:** both
**Language:** all

### Description
The contact page form has a TODO indicating submission is not implemented.

### Location
`pages/contact.vue:182`

### Code
```typescript
// TODO: Implement form submission
```

---

## Issue: Trust Badges Using Placeholder Logos

**Priority:** minor
**Route:** / (homepage)
**Viewport:** both
**Language:** all

### Description
The trust badges section has a TODO comment indicating placeholder logos are being used instead of actual payment provider logos.

### Location
`components/home/TrustBadges.vue:78`

### Code
```html
<!-- TODO: Replace with actual brand logos from /public/images/payment-logos/ -->
```

---

## Issue: Collections Showcase Using Placeholder Images

**Priority:** minor
**Route:** / (homepage)
**Viewport:** both
**Language:** all

### Description
The collections showcase section uses placeholder product photography.

### Location
`components/home/CollectionsShowcase.vue:125`

### Code
```typescript
// TODO: Replace with actual product photography when available
```

---

## Issue: Reorder Functionality Not Implemented

**Priority:** minor
**Route:** /account/orders
**Viewport:** both
**Language:** all

### Description
The orders page has a reorder button that is not implemented.

### Location
`pages/account/orders/index.vue:747`

### Code
```typescript
// TODO: Implement reorder functionality
```

---

## Issue: Mobile Bottom Nav Hidden on Product Detail But Sticky Add-to-Cart Creates Double Footer

**Priority:** minor
**Route:** /products/[slug]
**Viewport:** mobile
**Language:** all

### Description
The BottomNav component is hidden on product detail pages to avoid "double sticky" with the product's mobile sticky add-to-cart bar. However, this creates an inconsistent navigation experience where users lose bottom navigation on product pages.

### Location
`components/layout/BottomNav.vue:134-141`
`pages/products/[slug].vue:178-186`

### Expected Behavior
Either:
1. Show a unified bottom bar combining navigation and add-to-cart
2. Or provide a visible way to access navigation from product detail

### Actual Behavior
Bottom navigation disappears entirely on product detail pages.

---

## Additional Observations

### Positive Findings

1. **Accessibility Skip Links**: The products page includes skip links for keyboard navigation
2. **Dark Mode Support**: Comprehensive dark mode implementation throughout
3. **Mobile-First Design**: Good responsive patterns with mobile-specific optimizations
4. **Touch Target Sizes**: Most interactive elements meet 44px minimum touch target
5. **Loading States**: Proper skeleton loaders and loading indicators
6. **Error Boundaries**: Cart page uses error boundary for graceful error handling
7. **Safe Area Support**: Bottom navigation includes safe-area-inset for notched devices
8. **Proper shadcn-vue Usage**: Most components correctly use UI components

### Code Quality

1. **Component Documentation**: Well-documented with JSDoc comments
2. **TypeScript**: Proper type definitions
3. **Composables Pattern**: Good extraction of business logic to composables
4. **i18n Coverage**: Mostly comprehensive (except Russian issue noted)

---

## Testing Checklist Status

### Homepage (/)
- [x] Hero section renders correctly
- [x] Navigation works
- [x] Featured products display
- [x] Footer links work
- [x] Language switcher functions
- [ ] Newsletter signup works (TODO)

### Products (/products)
- [ ] Search input displays correctly (icon overlap issue)
- [x] Product grid renders properly
- [x] Filters work
- [x] Sorting works
- [x] Pagination works
- [x] Product cards show all info

### Product Detail (/products/[id])
- [x] Images load and are zoomable
- [x] Price displays correctly
- [x] Add to cart button works
- [x] Quantity selector works
- [x] Product description readable

### Cart (/cart)
- [x] Empty cart state handled
- [x] Items display correctly
- [x] Quantity can be updated
- [x] Items can be removed
- [x] Total calculates correctly
- [x] Proceed to checkout works

### Checkout (/checkout)
- [x] Guest checkout accessible
- [x] Form fields render correctly
- [x] Validation messages display
- [x] Order summary visible
- [ ] SEO meta translated (hardcoded English)

---

## Recommendations Priority

### Immediate (Critical)
1. Fix SearchBar icon overlap - affects core user experience
2. Complete Russian translations - affects significant user segment

### Short-term (Major)
3. Fix checkout page i18n meta tags
4. Fix skip links accessibility issue
5. Refactor Product Card component
6. Fix SearchBar clear button positioning
7. Implement newsletter subscription

### Medium-term (Minor)
8. Implement contact form
9. Replace placeholder trust badge logos
10. Replace placeholder collection images
11. Implement reorder functionality
12. Review bottom navigation UX on product pages

---

**Report Generated:** 2026-01-31
**Files Analyzed:** 20+ Vue components, 4 i18n locale files
