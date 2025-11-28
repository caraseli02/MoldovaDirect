# Express Checkout Auto-Routing - Quick Reference

## 📍 Location
**File**: `plugins/checkout-guard.client.ts`  
**Lines**: 84-106

## 🎯 Purpose
Auto-route returning customers with saved shipping data directly to payment step.

## ✅ Triggers When
ALL conditions must be true:
1. `checkoutStore.dataPrefetched === true`
2. `checkoutStore.canProceedToPayment === true`
3. `checkoutStore.preferences?.preferred_shipping_method` exists
4. `to.path === localePath('/checkout')`

## 🚫 Does NOT Trigger When
- Guest users (not authenticated)
- New users (no saved data)
- Users without preferred shipping method
- Direct navigation to `/checkout/payment` or `/checkout/shipping`

## 🔄 Flow
```
/checkout → [Express Check] → /checkout/payment?express=1
```

## 🎨 Frontend Integration
Look for `express=1` query parameter to:
- Show countdown banner
- Display saved shipping summary
- Add "Edit Shipping" link

## 📊 Key Properties
```typescript
checkoutStore.dataPrefetched          // Boolean
checkoutStore.canProceedToPayment     // Boolean
checkoutStore.preferences             // Object | null
```

## 🐛 Debug
Check console for:
```
🚀 Express checkout: Auto-routing to payment step
   - Complete shipping info: ✓
   - Preferred method saved: ✓
   - Landing on base checkout: ✓
```

## 🧪 Test Cases
| Scenario | Expected Result |
|----------|----------------|
| Returning customer + saved data | Auto-route to payment |
| Guest user | Stay on shipping |
| New customer | Stay on shipping |
| Direct to `/checkout/payment` | No redirect |
| Saved address, no method | Stay on shipping |

## 📈 Success Metrics
- Express checkout usage: 30-50%
- Completion rate: +10-20%
- Time to purchase: -30%

## 🔧 Maintenance
- No breaking changes
- No API modifications needed
- Works with existing store
- i18n compatible (all 4 locales)

---
**Date**: 2025-11-27 | **Status**: ✅ Production Ready
