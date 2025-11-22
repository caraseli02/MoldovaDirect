# Validation Package - Moldova Direct Products API

## Quick Start

### 1. Verify API Status First

```bash
curl http://localhost:3000/api/products | head -100
```

**Expected:** JSON response with products array  
**If Error 500:** See troubleshooting section in FINAL_VALIDATION.md

### 2. Capture Validation Screenshots

```bash
/Users/vladislavcaraseli/Documents/MoldovaDirect/checkout-ux-testing/capture-screenshots.sh
```

This interactive script will guide you through:
- Products page screenshot
- Add to cart action
- Cart page view
- Checkout flow initiation

### 3. Review Validation Report

```bash
cat /Users/vladislavcaraseli/Documents/MoldovaDirect/checkout-ux-testing/FINAL_VALIDATION.md
```

## Files Created

### Documentation
- `FINAL_VALIDATION.md` - Complete validation report with checklist
- `README_VALIDATION.md` - This file (quick start guide)

### Scripts
- `capture-screenshots.sh` - Interactive screenshot capture helper

### Directories
- `screenshots/final-validation/` - Screenshot storage location

## Validation Flow

```
1. API Test (curl) → Verify endpoint returns products
                ↓
2. UI Test (browser) → Confirm products display in grid
                ↓
3. Interaction Test → Add to cart, view cart
                ↓
4. Checkout Test → Start checkout flow
                ↓
5. Documentation → Screenshots + report
```

## Expected Screenshots

After validation, you should have:

1. **products-page-SUCCESS.png** - Product grid with items
2. **add-to-cart-SUCCESS.png** - Cart badge showing count
3. **cart-page-SUCCESS.png** - Cart with added items
4. **checkout-shipping-SUCCESS.png** - Shipping form

All saved to: `/Users/vladislavcaraseli/Documents/MoldovaDirect/checkout-ux-testing/screenshots/final-validation/`

## Troubleshooting

### API Returns 500 Error

1. Check database connection
2. Review server logs in terminal
3. Restart dev server:
   ```bash
   # In project directory
   pnpm dev
   ```
4. Re-test API endpoint

### Products Not Displaying

1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify network tab shows successful API call
4. Check if error message displays instead

### Screenshots Won't Save

1. Verify directory exists:
   ```bash
   mkdir -p /Users/vladislavcaraseli/Documents/MoldovaDirect/checkout-ux-testing/screenshots/final-validation
   ```
2. Check permissions on directory
3. Use alternative screenshot method (Cmd+Shift+3)

## Success Criteria

All checkboxes marked in FINAL_VALIDATION.md:
- [ ] API returns products JSON
- [ ] Products page displays grid
- [ ] Add to cart works
- [ ] Cart page shows items
- [ ] Checkout flow starts
- [ ] 4 screenshots captured

## Contact

For issues with validation, check:
- Server terminal for error logs
- Browser console for client errors
- FINAL_VALIDATION.md for detailed troubleshooting
