# Moldova Direct - API Reference


## Overview

The API is built with Nuxt Server Routes, located in `server/api/`. All endpoints follow RESTful conventions and use Zod for request validation.

**Base URL**: `/api`

## Authentication

Most endpoints require authentication via Supabase JWT tokens. Admin endpoints require the `admin` role.

### Headers
```
Authorization: Bearer <jwt_token>
```

## Public Endpoints

### Products

#### GET /api/products
List all products with optional filtering.

**Query Parameters:**
- `category` (string) - Filter by category slug
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `sort` (string) - Sort by: `price_asc`, `price_desc`, `name`, `created`
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "slug": "wine-cabernet",
      "name": { "es": "Vino", "en": "Wine" },
      "price": "15.99",
      "stockQuantity": 50,
      "images": [{ "url": "...", "isPrimary": true }],
      "category": { "slug": "wines", "name": { "es": "Vinos" } }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### GET /api/products/[slug]
Get single product by slug.

#### GET /api/products/featured
Get featured products for homepage.

#### GET /api/products/related/[productId]
Get related products.

#### GET /api/products/price-range
Get min/max prices for filter UI.

### Categories

#### GET /api/categories
List all categories.

#### GET /api/categories/[slug]
Get category by slug with products.

### Search

#### GET /api/search
Search products.

**Query Parameters:**
- `q` (string) - Search query
- `limit` (number) - Max results

## Cart Endpoints

#### POST /api/cart/validate
Validate cart items and prices.

**Body:**
```json
{
  "items": [
    { "productId": "1", "quantity": 2 }
  ]
}
```

**Response:**
```json
{
  "valid": true,
  "items": [...],
  "unavailableItems": []
}
```

#### POST /api/cart/lock
Lock cart for checkout (prevents concurrent modifications).

#### POST /api/cart/unlock
Release cart lock.

#### GET /api/cart/lock-status
Check if cart is locked.

#### POST /api/cart/clear
Clear all cart items.

## Order Endpoints (Authenticated)

#### GET /api/orders
Get current user's orders.

**Query Parameters:**
- `status` (string) - Filter by status
- `page` (number) - Page number

#### GET /api/orders/[orderId]
Get order details.

#### POST /api/orders/create
Create new order from cart.

**Body:**
```json
{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "Madrid",
    "postalCode": "28001",
    "country": "ES"
  },
  "shippingMethodId": "standard",
  "paymentIntentId": "pi_..."
}
```

#### POST /api/orders/[orderId]/reorder
Create new order with same items.

#### POST /api/orders/[orderId]/return
Request order return.

#### POST /api/orders/track
Track order by number (guest access).

**Body:**
```json
{
  "orderNumber": "ORD-123456",
  "email": "customer@example.com"
}
```

## Shipping Endpoints

#### GET /api/shipping/methods
Get available shipping methods.

#### POST /api/shipping/calculate
Calculate shipping cost.

**Body:**
```json
{
  "postalCode": "28001",
  "country": "ES",
  "items": [{ "productId": "1", "quantity": 2 }]
}
```

## Checkout/Payment Endpoints

#### POST /api/checkout/create-payment-intent
Create Stripe payment intent.

**Body:**
```json
{
  "cartItems": [...],
  "shippingMethodId": "standard"
}
```

**Response:**
```json
{
  "clientSecret": "pi_..._secret_...",
  "amount": 4599
}
```

#### GET /api/payment-methods
Get saved payment methods (authenticated).

#### POST /api/payment-methods/create
Save new payment method.

#### DELETE /api/payment-methods/[paymentMethodId]
Remove saved payment method.

## Webhook Endpoints

#### POST /api/webhooks/stripe
Handle Stripe webhook events.

Events handled:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

## Admin Endpoints

All admin endpoints require authentication with admin role.

### Dashboard

#### GET /api/admin/dashboard/stats
Get dashboard statistics (orders, revenue, users).

#### GET /api/admin/dashboard/activity
Get recent activity feed.

### Products

#### GET /api/admin/products
List all products (admin view).

#### POST /api/admin/products
Create new product.

#### GET /api/admin/products/[productId]
Get product for editing.

#### PUT /api/admin/products/[productId]
Update product.

#### DELETE /api/admin/products/[productId]
Delete product.

#### PUT /api/admin/products/[productId]/inventory
Update product inventory.

#### PUT /api/admin/products/bulk
Bulk update products.

#### DELETE /api/admin/products/bulk
Bulk delete products.

### Orders

#### GET /api/admin/orders
List all orders with filters.

#### GET /api/admin/orders/[orderId]
Get order details.

#### POST /api/admin/orders/[orderId]/update-status
Update order status.

#### POST /api/admin/orders/[orderId]/send-status-email
Send status update email.

### Users

#### GET /api/admin/users
List all users.

#### GET /api/admin/users/[userId]
Get user details.

#### PUT /api/admin/users/[userId]
Update user.

### Inventory

#### GET /api/admin/inventory/movements
Get inventory movement history.

#### GET /api/admin/inventory/reports
Get inventory reports.

### Email Templates

#### GET /api/admin/email-templates/get
Get email template.

#### POST /api/admin/email-templates/save
Save email template.

#### POST /api/admin/email-templates/preview
Preview email template.

## Analytics Endpoints

#### POST /api/analytics/cart-events
Track cart events (add, remove, view).

#### POST /api/analytics/track
Track general analytics events.

## Utility Endpoints

#### GET /api/security/csrf-token
Get CSRF token for forms.

#### POST /api/newsletter/subscribe
Subscribe to newsletter.

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "statusMessage": "Invalid request",
  "data": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Rate Limited
- `500` - Server Error

## Rate Limiting

API endpoints are rate limited:
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 200 requests/minute
- Admin endpoints: 500 requests/minute

## Request Validation

All requests are validated using Zod schemas:

```typescript
import { z } from 'zod'

const CreateOrderSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().length(2)
  }),
  shippingMethodId: z.string(),
  paymentIntentId: z.string()
})
```
