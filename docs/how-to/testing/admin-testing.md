# Admin Testing Dashboard


Comprehensive testing tools for the Moldova Direct admin panel, allowing easy simulation of users, data generation, and testing scenarios.

## Overview

The Admin Testing Dashboard (`/admin/testing`) provides a centralized interface for:
- Creating test users with realistic profiles
- Generating test data (products, orders, categories)
- Simulating various store scenarios
- Cleaning up test data
- User impersonation for testing

## Features

### 1. Quick Action Presets

Pre-configured scenarios that generate complete datasets with one click:

#### **Quick Start** (Minimal)
- 5 users
- 10 products
- 5 orders
- Basic setup for quick testing

#### **Development**
- 20 users
- 50 products
- 100 orders
- Ideal for development and feature testing

#### **Demo Store**
- 50 users
- 100 products
- 300 orders
- Realistic data for presentations and demos

#### **Low Stock Alert**
- 15 users
- 30 products (with low inventory)
- 50 orders
- Tests low stock notifications and alerts

#### **Holiday Rush**
- 100 users
- 75 products
- 500 orders (concentrated in last 7 days)
- Simulates high-volume order periods

#### **New Store**
- 10 users
- 100 products
- 5 orders
- New store with inventory but few orders

---

## API Endpoints

### User Seeding

**Endpoint:** `POST /api/admin/seed-users`

Creates test users with configurable options.

**Request Body:**
```json
{
  "count": 10,
  "roles": ["customer", "admin", "manager"],
  "withAddresses": true,
  "withOrders": false
}
```

**Options:**
- `count` (number): Number of users to create (default: 10)
- `roles` (array): Roles to assign - 'customer', 'admin', 'manager'
- `withAddresses` (boolean): Create addresses for users (default: true)
- `withOrders` (boolean): Create order history (default: false)

**Response:**
```json
{
  "success": true,
  "message": "Created 10 test users",
  "users": [
    {
      "id": "uuid",
      "email": "john.doe.1234@example.com",
      "name": "John Doe",
      "role": "customer",
      "phone": "+37312345678",
      "password": "TestPass1234!"
    }
  ],
  "summary": {
    "total": 10,
    "created": 10,
    "failed": 0,
    "withAddresses": true,
    "withOrders": false,
    "roles": ["customer"]
  }
}
```

### Comprehensive Data Generator

**Endpoint:** `POST /api/admin/seed-data`

Generates complete datasets with preset configurations.

**Request Body:**
```json
{
  "preset": "development",
  "users": 20,
  "products": 50,
  "orders": 100,
  "categories": true,
  "clearExisting": false
}
```

**Presets:**
- `empty` - Clear database
- `minimal` - 5 users, 10 products, 5 orders
- `development` - 20 users, 50 products, 100 orders
- `demo` - 50 users, 100 products, 300 orders
- `stress` - 200 users, 500 products, 2000 orders
- `low-stock` - Products with low inventory
- `holiday-rush` - High order volume
- `new-store` - Many products, few orders

**Response:**
```json
{
  "success": true,
  "message": "Successfully seeded development dataset",
  "results": {
    "preset": "development",
    "steps": [
      {
        "step": "Create categories",
        "duration": 234,
        "count": 5
      },
      {
        "step": "Create products",
        "duration": 1456,
        "count": 50
      }
    ]
  },
  "totalDuration": 3456
}
```

### Database Cleanup

**Endpoint:** `POST /api/admin/cleanup`

Remove test data from the database.

**Request Body:**
```json
{
  "action": "clear-test-users",
  "confirm": true,
  "daysOld": 7
}
```

**Actions:**
- `clear-all` - Remove all test data
- `clear-test-users` - Remove users with test/demo/example emails
- `clear-orders` - Remove all orders
- `clear-products` - Remove all products
- `clear-old-carts` - Remove carts older than X days
- `reset-database` - Full database reset (keeps structure)

**Safety:** Requires `confirm: true` to proceed.

**Response:**
```json
{
  "success": true,
  "message": "Successfully completed clear-test-users",
  "results": {
    "action": "clear-test-users",
    "deletedCounts": {
      "testUsers": 15,
      "orders": 42,
      "addresses": 30
    }
  }
}
```

### User Impersonation

**Endpoint:** `POST /api/admin/impersonate`

Allow admins to impersonate users for testing.

**Request Body (Start):**
```json
{
  "action": "start",
  "userId": "user-uuid-here"
}
```

**Request Body (Stop):**
```json
{
  "action": "stop"
}
```

**Security:**
- Only admins can impersonate
- All impersonation actions are logged
- Session management built-in

**Response:**
```json
{
  "success": true,
  "action": "start",
  "impersonating": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "warning": "You are acting as another user. All actions will be performed as them."
}
```

---

## Database Schema Changes

### Role-Based Access Control

A new `role` column has been added to the `profiles` table:

```sql
ALTER TABLE profiles
ADD COLUMN role TEXT DEFAULT 'customer'
CHECK (role IN ('customer', 'admin', 'manager'));
```

**Available Roles:**
- `customer` (default) - Regular customers
- `admin` - Full administrative access
- `manager` - Limited administrative access

**Row Level Security (RLS) Policies:**
- Admins can view and update all profiles
- Admins can view and update all orders
- Customers can only view/update their own data

### Migration

Run the migration to add the role column:

```bash
psql -d your_database < supabase/sql/migrations/add_role_column.sql
```

Or apply directly in Supabase Dashboard SQL Editor.

---

## Usage Examples

### 1. Quick Start for Testing

```bash
# Access the testing dashboard
http://localhost:3000/admin/testing

# Click "Quick Start" button
# Creates 5 users, 10 products, 5 orders instantly
```

### 2. Create Admin User

```javascript
// Via API
const response = await $fetch('/api/admin/seed-users', {
  method: 'POST',
  body: {
    count: 1,
    roles: ['admin'],
    withAddresses: true
  }
})

// Use the returned credentials to log in
console.log(response.users[0].email)
console.log(response.users[0].password)
```

### 3. Generate Demo Data for Presentation

```javascript
await $fetch('/api/admin/seed-data', {
  method: 'POST',
  body: {
    preset: 'demo'
  }
})
```

### 4. Test Low Stock Alerts

```javascript
await $fetch('/api/admin/seed-data', {
  method: 'POST',
  body: {
    preset: 'low-stock'
  }
})

// Navigate to /admin/inventory to see low stock products
```

### 5. Clean Up After Testing

```javascript
await $fetch('/api/admin/cleanup', {
  method: 'POST',
  body: {
    action: 'clear-test-users',
    confirm: true
  }
})
```

### 6. Impersonate a User

```javascript
// Start impersonation
const response = await $fetch('/api/admin/impersonate', {
  method: 'POST',
  body: {
    action: 'start',
    userId: 'target-user-uuid'
  }
})

// Test user-facing features as that user

// Stop impersonation
await $fetch('/api/admin/impersonate', {
  method: 'POST',
  body: {
    action: 'stop'
  }
})
```

---

## Test Data Characteristics

### Generated Users
- Realistic names (mix of international names)
- Valid email formats (marked as test domains)
- Moldovan phone numbers (+373)
- Multiple language preferences (es, en, ro, ru)
- Email pre-verified for immediate use
- Passwords returned in response (for testing only)

### Generated Products
- Authentic Moldovan product types
- Multi-language translations (en, es, ro, ru)
- Realistic pricing (€10-300)
- Varied stock levels
- Proper SKU format
- Categorized correctly

### Generated Orders
- Realistic order amounts
- Various statuses (pending, processing, shipped, delivered, cancelled)
- Payment statuses (paid, pending, failed)
- Moldovan addresses
- Order history spread across time
- 1-4 items per order

---

## Best Practices

### Development
1. Use **Quick Start** or **Development** preset
2. Create a test admin user for yourself
3. Test features with generated data
4. Clean up test users before committing

### Demo/Presentation
1. Use **Demo Store** preset a few hours before
2. Verify data looks realistic
3. Ensure orders span multiple statuses
4. Check analytics dashboard displays correctly

### Testing Scenarios
1. **Low Stock**: Use `low-stock` preset, test inventory alerts
2. **High Volume**: Use `holiday-rush` preset, test performance
3. **New Store**: Use `new-store` preset, test onboarding flow
4. **User Journeys**: Use impersonation to test customer experience

### Cleanup
1. Run `clear-test-users` regularly
2. Use `clear-old-carts` weekly
3. Never run `reset-database` in production
4. Always confirm cleanup actions

---

## Security Considerations

### Production Use
- The testing dashboard should be disabled in production
- Add environment check: `if (process.env.NODE_ENV === 'production') return`
- Impersonation should be logged and auditable
- Test user cleanup should run on schedule

### Access Control
- Testing dashboard requires authentication
- Only admins should access `/admin/testing`
- Cleanup actions require confirmation
- Role enforcement via RLS policies

---

## Troubleshooting

### Users Not Created
- Check Supabase connection
- Verify email doesn't already exist
- Check service role key permissions

### Orders Missing
- Ensure products exist first
- Verify users are created
- Check foreign key constraints

### Cleanup Not Working
- Confirm `confirm: true` in request
- Check RLS policies
- Verify admin role

### Impersonation Fails
- Verify current user is admin
- Check target user exists
- Ensure proper session handling

---

## Future Enhancements

Planned features:
- [ ] Saved test scenarios
- [ ] Bulk user import from CSV
- [ ] Order timeline simulation
- [ ] Customer behavior patterns
- [ ] A/B testing data generation
- [ ] Performance benchmarking
- [ ] Automated cleanup scheduling
- [ ] Audit log viewing

---

## Support

For issues or questions:
- Check the API responses for error details
- Review Supabase logs
- Ensure database migrations are applied
- Verify admin role is assigned correctly

Created: 2025-10-30
Version: 1.0.0
