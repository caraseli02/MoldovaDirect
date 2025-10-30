# Creating Admin and Manager Users

This guide explains how to create users with admin and manager roles for testing the role-based access control system.

## Prerequisites

Before creating admin users, you must first run the migration:

```bash
# Apply the migration that adds the role field to profiles
psql -h your-supabase-db.supabase.co -U postgres -d postgres -f supabase/sql/add-admin-role-and-inventory-tracking.sql
```

Or run it through the Supabase Dashboard:
1. Go to SQL Editor
2. Copy the contents of `add-admin-role-and-inventory-tracking.sql`
3. Run the script

## Method 1: Using the Node.js Script (Recommended)

This is the easiest and safest method.

### Setup

```bash
# Install dependencies if not already installed
npm install @supabase/supabase-js

# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

You can find these values in your Supabase Dashboard:
- Settings > API > Project URL
- Settings > API > Project API keys > service_role (secret key)

### Run the Script

```bash
node scripts/create-admin-user.mjs
```

This will create three test users:
- **Admin**: admin@moldovadirect.com / Admin123!@#
- **Manager**: manager@moldovadirect.com / Manager123!@#
- **Customer**: customer@moldovadirect.com / Customer123!@#

⚠️ **IMPORTANT**: Change these passwords after first login!

## Method 2: Using Supabase Dashboard (Manual)

### Step 1: Create User Account

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Click **Add User** (or **Invite User**)
4. Enter:
   - Email: `admin@moldovadirect.com`
   - Password: Choose a secure password
   - Confirm email: ✓ (checked)

### Step 2: Assign Admin Role

1. Go to **SQL Editor** in the Supabase Dashboard
2. Run this query (replace the email with your user's email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@moldovadirect.com'
);
```

### Step 3: Verify

Run this query to verify the role was set:

```sql
SELECT
  u.email,
  p.name,
  p.role,
  CASE
    WHEN p.role = 'admin' THEN '✓ Has Admin Access'
    WHEN p.role = 'manager' THEN '✓ Has Manager Access'
    ELSE '✗ Customer Only'
  END as access_level
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@moldovadirect.com';
```

## Method 3: Update Existing Users (SQL)

If you already have users and want to promote them to admin/manager:

```bash
# Run through Supabase SQL Editor
supabase/sql/update-existing-users-to-admin.sql
```

Or use this SQL directly:

```sql
-- Promote specific user to admin by email
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- Promote specific user to manager by ID
UPDATE profiles
SET role = 'manager'
WHERE id = 'user-uuid-here';
```

## Method 4: Direct SQL Insert (Advanced)

⚠️ Only use this if you have database admin access. See `create-admin-users.sql` for the complete script.

```bash
psql -h your-db.supabase.co -U postgres -d postgres -f supabase/sql/create-admin-users.sql
```

## Verifying Admin Access

After creating admin users, test the authentication:

### Test 1: Login
Try logging in with the admin credentials through your app's login form.

### Test 2: Access Admin Endpoints
```bash
# Login to get session token
curl -X POST https://your-project.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@moldovadirect.com","password":"Admin123!@#"}'

# Use the access_token from response to call admin endpoints
curl https://your-app.com/api/admin/orders \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE"
```

### Test 3: Verify Non-Admins Are Blocked
Try accessing admin endpoints with a customer account - should get 403 Forbidden.

## Available Roles

The system supports three roles:

| Role | Access Level | Can Access Admin Endpoints |
|------|--------------|---------------------------|
| `customer` | Standard user access | ❌ No (403 Forbidden) |
| `manager` | Manager-level access | ✅ Yes |
| `admin` | Full admin access | ✅ Yes |

## Security Notes

1. **Change Default Passwords**: The example passwords are for development only
2. **Service Role Key**: Keep your service role key secret - never commit to git
3. **Production Setup**: In production, use strong passwords and 2FA where possible
4. **Regular Audits**: Periodically review who has admin/manager access

## Troubleshooting

### "Profile not found" error
The profile might not have been auto-created. Manually insert it:

```sql
INSERT INTO profiles (id, name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@moldovadirect.com'),
  'Admin User',
  'admin'
);
```

### "Role field doesn't exist" error
You haven't run the migration yet. Run `add-admin-role-and-inventory-tracking.sql` first.

### "Permission denied" error
You need service role key or database admin access. Try the Supabase Dashboard method instead.

## Next Steps

After creating admin users:

1. ✅ Test logging in with admin credentials
2. ✅ Test accessing `/api/admin/orders` endpoints
3. ✅ Verify non-admin users get 403 errors
4. ✅ Change the default passwords
5. ✅ Add more admins as needed using the scripts above
