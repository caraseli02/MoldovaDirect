# Authenticated Visual Regression Test Report

**Generated:** 11/21/2025, 8:42:47 AM
**Base URL:** http://localhost:3000
**Authenticated:** Yes (Admin User)

## Summary

| Metric | Count |
|--------|-------|
| Total Tests | 5 |
| Passed | 0 ✅ |
| Warnings | 3 ⚠️ |
| Failed | 2 ❌ |

## Test Results

### ❌ Admin Dashboard

- **URL:** http://localhost:3000/admin
- **Status:** FAILED
- **Component Status:** loaded

#### Issues Found

- HTTP 500: Server Error
- 500 Internal Server Error detected

#### Data Validation

```json
{
  "hasUsers": true,
  "hasProducts": false,
  "hasOrders": true,
  "showsRealData": false
}
```

#### Console Errors (2)

```
Failed to load resource: the server responded with a status of 500 (Server Error)
❌ Cart initialization failed in nextTick: ReferenceError: useCartStore is not defined
    at http://localhost:3000/_nuxt/plugins/cart.client.ts:8:29
```

#### Screenshots

![Admin Dashboard](./admin-dashboard-authenticated.png)

---

### ⚠️ Admin Users Page

- **URL:** http://localhost:3000/admin/users
- **Status:** WARNING
- **Component Status:** loaded

#### Issues Found

- HTTP 500: Server Error
- 500 Internal Server Error detected
- No data loaded (expected 67)

#### Visual Issues

- Table has no data rows

#### Data Validation

```json
{
  "expectedUsers": 67,
  "actualCount": 0,
  "has67Users": true,
  "showsRealData": true,
  "tableRowCount": 0
}
```

#### Console Errors (2)

```
Failed to load resource: the server responded with a status of 500 (Server Error)
❌ Cart initialization failed in nextTick: ReferenceError: useCartStore is not defined
    at http://localhost:3000/_nuxt/plugins/cart.client.ts:8:29
```

#### Screenshots

![Admin Users Page](./admin-users-page-authenticated.png)

---

### ⚠️ Admin Products Page

- **URL:** http://localhost:3000/admin/products
- **Status:** WARNING
- **Component Status:** loaded

#### Issues Found

- HTTP 500: Server Error
- 500 Internal Server Error detected
- No data loaded (expected 112)

#### Visual Issues

- Table has no data rows

#### Data Validation

```json
{
  "expectedProducts": 112,
  "actualCount": 0,
  "has112Products": false,
  "showsRealData": false,
  "tableRowCount": 0
}
```

#### Console Errors (2)

```
Failed to load resource: the server responded with a status of 500 (Server Error)
❌ Cart initialization failed in nextTick: ReferenceError: useCartStore is not defined
    at http://localhost:3000/_nuxt/plugins/cart.client.ts:8:29
```

#### Screenshots

![Admin Products Page](./admin-products-page-authenticated.png)

---

### ⚠️ Admin Orders Page

- **URL:** http://localhost:3000/admin/orders
- **Status:** WARNING
- **Component Status:** loaded

#### Issues Found

- HTTP 500: Server Error
- 500 Internal Server Error detected
- No data loaded (expected 360)

#### Visual Issues

- Table has no data rows

#### Data Validation

```json
{
  "expectedOrders": 360,
  "actualCount": 0,
  "has360Orders": true,
  "showsRealData": true,
  "tableRowCount": 0
}
```

#### Console Errors (2)

```
Failed to load resource: the server responded with a status of 500 (Server Error)
❌ Cart initialization failed in nextTick: ReferenceError: useCartStore is not defined
    at http://localhost:3000/_nuxt/plugins/cart.client.ts:8:29
```

#### Screenshots

![Admin Orders Page](./admin-orders-page-authenticated.png)

---

### ❌ Admin Testing Page

- **URL:** http://localhost:3000/admin/testing
- **Status:** FAILED
- **Component Status:** loaded

#### Issues Found

- 500 Internal Server Error detected

#### Data Validation

```json
{
  "expectedData": {
    "users": 67,
    "products": 112,
    "orders": 360
  },
  "has67Users": true,
  "has112Products": false,
  "has360Orders": true,
  "allDataMatches": false
}
```

#### Console Errors (1)

```
❌ Cart initialization failed in nextTick: ReferenceError: useCartStore is not defined
    at http://localhost:3000/_nuxt/plugins/cart.client.ts:8:29
```

#### Screenshots

![Admin Testing Page](./admin-testing-page-authenticated.png)

---

