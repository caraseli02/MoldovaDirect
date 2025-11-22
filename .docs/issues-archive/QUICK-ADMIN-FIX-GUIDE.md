# Quick Fix Guide for Admin Pages

## TL;DR - What's Broken

**ALL 5 admin pages return 500 errors. Users see error stack traces instead of admin interfaces.**

**Root Cause:** Vite cannot resolve dynamic imports in `useAsyncAdminComponent` composable.

**Good News:** Authentication works, all component files exist, translations are fine.

---

## Fastest Fix (30 minutes)

Replace `useAsyncAdminComponent` with static imports in each admin page.

### 1. Fix Dashboard Page

**File:** `/pages/admin/index.vue`

**Change:**
```vue
<!-- BEFORE -->
<script setup lang="ts">
const AdminDashboardOverview = useAsyncAdminComponent('Dashboard/Overview')
</script>

<template>
  <AdminDashboardOverview />
</template>
```

**To:**
```vue
<!-- AFTER -->
<script setup lang="ts">
import AdminDashboardOverview from '~/components/admin/Dashboard/Overview.vue'
</script>

<template>
  <AdminDashboardOverview />
</template>
```

### 2. Fix Users Page

**File:** `/pages/admin/users/index.vue`

**Change lines 108-109:**
```typescript
// BEFORE
const AdminUsersTable = useAsyncAdminComponent('Users/Table')
const AdminUsersDetailView = useAsyncAdminComponent('Users/DetailView')

// AFTER
import AdminUsersTable from '~/components/admin/Users/Table.vue'
import AdminUsersDetailView from '~/components/admin/Users/DetailView.vue'
```

### 3. Fix Products Page

**File:** `/pages/admin/products/index.vue`

Find `useAsyncAdminComponent` calls and replace with:
```typescript
import AdminProductsFilters from '~/components/admin/Products/Filters.vue'
import AdminProductsTable from '~/components/admin/Products/Table.vue'
```

### 4. Fix Orders Page

**File:** `/pages/admin/orders/index.vue`

Replace `useAsyncAdminComponent` calls and fix `useToastStore`:

```typescript
// Add at top
import { useToast } from '#imports'
import AdminOrdersFilters from '~/components/admin/Orders/Filters.vue'
// ... other component imports

// In composable useAdminOrderRealtime, replace:
const toast = useToast()  // Instead of useToastStore
```

### 5. Fix Analytics Page

**File:** `/pages/admin/analytics.vue`

Replace `useAsyncAdminComponent` with:
```typescript
import AdminDashboardAnalyticsOverview from '~/components/admin/Dashboard/AnalyticsOverview.vue'
```

---

## Test After Fix

1. Restart dev server: `npm run dev`
2. Visit http://localhost:3000/auth/login
3. Login with: admin@moldovadirect.com / Admin123!@#
4. Test each page:
   - http://localhost:3000/admin
   - http://localhost:3000/admin/users
   - http://localhost:3000/admin/products
   - http://localhost:3000/admin/orders
   - http://localhost:3000/admin/analytics

All should load without 500 errors.

---

## Visual Test Screenshots

All screenshots saved to `/test-screenshots/`:
- `correct-admin-dashboard.png` - Dashboard (currently shows 500)
- `correct-admin-users.png` - Users page (currently shows 500)
- `correct-admin-products.png` - Products (currently shows 500)
- `correct-admin-orders.png` - Orders (currently shows 500)
- `correct-admin-analytics.png` - Analytics (currently shows 500)

After fix, re-run visual test to confirm all pages work.

---

## Full Details

See: `/ADMIN-VISUAL-TEST-FINAL-REPORT.md`
