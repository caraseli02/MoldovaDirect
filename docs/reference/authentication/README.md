# Moldova Direct - API Documentation


**Last Updated:** November 27, 2025

This document provides an overview of all API endpoints in the Moldova Direct e-commerce platform.

## Overview

- **Base URL:** `/api/`
- **Authentication:** Supabase Auth (JWT tokens)
- **Format:** JSON request/response
- **Total Endpoints:** 100+ API routes

## Authentication

Most endpoints require authentication via Supabase Auth. Include the JWT token in headers:

```http
Authorization: Bearer <your-jwt-token>
```

Admin endpoints additionally require the `admin` role.

## API Categories

### Public Endpoints

These endpoints are accessible without authentication:

#### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products (with filtering) |
| GET | `/api/products/[slug]` | Get product by slug |
| GET | `/api/products/featured` | Get featured products |
| GET | `/api/products/price-range` | Get min/max price range |
| GET | `/api/products/related/[id]` | Get related products |

#### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/[slug]` | Get category by slug |

#### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Search products |

#### Landing Page
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/landing/sections` | Get landing page sections |
| GET | `/api/landing/sections/[id]` | Get specific section |

#### Newsletter
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/newsletter/subscribe` | Subscribe to newsletter |

### Authenticated Endpoints

Require valid user authentication:

#### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cart/validate` | Validate cart items |
| POST | `/api/cart/lock` | Lock cart for checkout |
| POST | `/api/cart/unlock` | Unlock cart |
| GET | `/api/cart/lock-status` | Check cart lock status |
| POST | `/api/cart/clear` | Clear cart |
| POST | `/api/cart/secure` | Secure cart data |

#### Checkout
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/checkout/addresses` | Get user addresses |
| POST | `/api/checkout/addresses` | Add new address |
| GET | `/api/checkout/shipping-methods` | Get shipping options |
| GET | `/api/checkout/payment-methods` | Get payment methods |
| POST | `/api/checkout/save-payment-method` | Save payment method |
| POST | `/api/checkout/create-payment-intent` | Create Stripe payment intent |
| POST | `/api/checkout/confirm-payment` | Confirm payment |
| POST | `/api/checkout/create-order` | Create order |
| POST | `/api/checkout/send-confirmation` | Send confirmation email |

#### Shipping
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shipping/methods` | Calculate shipping methods |

#### Orders (Customer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List user's orders |
| GET | `/api/orders/[id]` | Get order details |
| GET | `/api/orders/[id]/tracking` | Get tracking info |
| POST | `/api/orders/[id]/reorder` | Reorder previous order |
| POST | `/api/orders/[id]/return` | Request return |
| POST | `/api/orders/[id]/support` | Contact support |

#### Payment Methods
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment-methods` | List saved payment methods |
| POST | `/api/payment-methods/create` | Add payment method |
| DELETE | `/api/payment-methods/[id]` | Remove payment method |

#### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recommendations/cart` | Get cart recommendations |

#### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analytics/track` | Track user event |
| POST | `/api/analytics/cart-events` | Track cart events |

#### Account
| Method | Endpoint | Description |
|--------|----------|-------------|
| DELETE | `/api/auth/delete-account` | Delete user account (GDPR) |

### Admin Endpoints

Require `admin` role:

#### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Get overview statistics |
| GET | `/api/admin/dashboard/stats` | Dashboard statistics |
| GET | `/api/admin/dashboard/activity` | Recent activity |

#### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics/overview` | Analytics overview |
| GET | `/api/admin/analytics/products` | Product analytics |
| GET | `/api/admin/analytics/users` | User analytics |
| POST | `/api/admin/analytics/aggregate` | Aggregate analytics data |

#### Products (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/products` | List all products |
| GET | `/api/admin/products/[id]` | Get product |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/[id]` | Update product |
| DELETE | `/api/admin/products/[id]` | Delete product |
| PUT | `/api/admin/products/bulk` | Bulk update |
| DELETE | `/api/admin/products/bulk` | Bulk delete |
| PUT | `/api/admin/products/[id]/inventory` | Update inventory |

#### Orders (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | List all orders |
| GET | `/api/admin/orders/[id]` | Get order details |
| PATCH | `/api/admin/orders/[id]/status` | Update order status |
| POST | `/api/admin/orders/[id]/notes` | Add order note |
| GET | `/api/admin/orders/analytics` | Order analytics |
| POST | `/api/admin/orders/bulk` | Bulk order actions |
| POST | `/api/admin/orders/[id]/fulfillment-tasks` | Add fulfillment task |
| PATCH | `/api/admin/orders/[id]/fulfillment-tasks/[taskId]` | Update task |

#### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/[id]` | Get user details |
| GET | `/api/admin/users/[id]/activity` | Get user activity |
| POST | `/api/admin/users/[id]/actions` | Perform user action |

#### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/inventory/movements` | Get stock movements |
| GET | `/api/admin/inventory/reports` | Get inventory reports |

#### Email Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/email-logs/search` | Search email logs |
| GET | `/api/admin/email-logs/stats` | Email statistics |
| POST | `/api/admin/email-logs/[id]/retry` | Retry email |
| GET | `/api/admin/email-retries/stats` | Retry queue stats |
| POST | `/api/admin/email-retries/process` | Process retry queue |
| GET | `/api/admin/email-templates/get` | Get template |
| POST | `/api/admin/email-templates/save` | Save template |
| POST | `/api/admin/email-templates/preview` | Preview template |
| GET | `/api/admin/email-templates/history` | Template history |
| POST | `/api/admin/email-templates/rollback` | Rollback template |
| POST | `/api/admin/email-templates/synchronize` | Sync templates |

#### Landing Page (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/landing/sections` | Create section |
| PUT | `/api/landing/sections/[id]` | Update section |
| DELETE | `/api/landing/sections/[id]` | Delete section |
| POST | `/api/landing/sections/reorder` | Reorder sections |

#### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/cache/invalidate` | Invalidate cache |
| GET | `/api/admin/audit-logs` | Get audit logs |
| GET | `/api/admin/impersonation-logs` | Impersonation logs |
| POST | `/api/admin/impersonate` | Impersonate user |
| POST | `/api/admin/cleanup` | Cleanup test data |
| POST | `/api/admin/seed` | Seed test data |
| POST | `/api/admin/seed-data` | Seed specific data |
| POST | `/api/admin/seed-users` | Seed test users |
| POST | `/api/admin/seed-orders` | Seed test orders |
| POST | `/api/admin/setup-db` | Setup database |
| POST | `/api/admin/setup-inventory` | Setup inventory |
| GET | `/api/admin/job-status/[id]` | Check job status |
| GET | `/api/admin/debug/products-count` | Debug products |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Stripe webhook handler |

### Tools

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tools/send-test-email` | Send test email |

## Common Query Parameters

### Pagination
```
?page=1&limit=20
```

### Sorting
```
?sort=created_at&order=desc
```

### Filtering (Products)
```
?category=wine&minPrice=10&maxPrice=100&inStock=true
```

### Locale
```
?locale=en
```

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "message": "Validation error description"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limiting

Authentication endpoints have rate limits:
- Login: 5 attempts per 15 minutes
- Register: 3 attempts per hour
- Password Reset: 3 attempts per hour

## Related Documentation

- [Checkout Flow](../architecture/CHECKOUT_FLOW.md)
- [Authentication Architecture](../architecture/AUTHENTICATION_ARCHITECTURE.md)
- [Cart System Architecture](../architecture/CART_SYSTEM_ARCHITECTURE.md)
- [Email System](../../server/utils/emailLogging.README.md)

---

**Note:** This is an overview document. For detailed request/response schemas, refer to the TypeScript types in `types/` directory.
