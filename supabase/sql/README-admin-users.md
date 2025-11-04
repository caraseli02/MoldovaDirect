# Creating Admin and Manager Users

**Last Updated:** 2025-11-04 (Security Fix - Removed Hardcoded Credentials)

This guide explains how to create users with admin and manager roles for testing the role-based access control system.

## 🔒 Security Notice

**CRITICAL:** Never use hardcoded credentials in scripts committed to version control. This guide has been updated to use secure password generation instead of hardcoded credentials.

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

## Method 1: Using the Node.js Script (Recommended) ⭐

This is the **easiest and most secure** method. It automatically generates strong random passwords.

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

**What this script does:**
- ✅ Generates **cryptographically secure random passwords** (20 characters)
- ✅ Creates admin, manager, and customer users with proper roles
- ✅ Shows generated credentials **once** for secure storage
- ✅ No hardcoded credentials in source control

**Output example:**
```
🚀 Creating admin and manager users...
📍 Supabase URL: https://your-project.supabase.co

⚠️  SECURITY NOTICE:
   Using auto-generated secure passwords.
   Save these credentials securely (e.g., in a password manager).

✅ Successfully created admin user:
   Email: admin@moldovadirect.com
   Password: xK9#mP2$vL5@wN8!qR4%

[... more output ...]

🔐 IMPORTANT: Store these credentials in a secure password manager!
   These passwords will not be shown again.
```

### Optional: Use Custom Credentials

If you need specific email addresses or want to provide your own secure passwords:

```bash
# Set custom credentials as environment variables
export ADMIN_EMAIL="youradmin@company.com"
export ADMIN_PASSWORD="$(node scripts/generateSecurePassword.mjs 24)"

export MANAGER_EMAIL="yourmanager@company.com"
export MANAGER_PASSWORD="$(node scripts/generateSecurePassword.mjs 24)"

# Then run the script
node scripts/create-admin-user.mjs
```

⚠️ **IMPORTANT**: Always store generated passwords in a password manager immediately!

## Method 2: Using Supabase Dashboard (Manual)

### Step 1: Generate a Secure Password

**FIRST**, generate a secure random password:

```bash
# Generate a 24-character secure password
node scripts/generateSecurePassword.mjs 24
```

Copy this password and store it in your password manager immediately!

### Step 2: Create User Account

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Click **Add User** (or **Invite User**)
4. Enter:
   - Email: Your desired admin email (e.g., `admin@yourcompany.com`)
   - Password: **Paste the secure password you just generated**
   - Confirm email: ✓ (checked)

### Step 3: Assign Admin Role

1. Go to **SQL Editor** in the Supabase Dashboard
2. Run this query (**replace the email with your user's actual email**):

```sql
-- ⚠️ IMPORTANT: Replace 'your-admin@example.com' with your actual admin user's email
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-admin@example.com'
);
```

### Step 4: Verify

Run this query to verify the role was set (replace with your email):

```sql
-- ⚠️ IMPORTANT: Replace with your actual email
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
WHERE u.email = 'your-admin@example.com';
```

## Method 3: Update Existing Users (SQL)

If you already have users and want to promote them to admin/manager, use this SQL:

```sql
-- Promote specific user to admin by email
-- ⚠️ IMPORTANT: Replace with the actual user's email
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'existing-user@example.com'
);

-- Promote specific user to manager by ID
-- ⚠️ IMPORTANT: Replace with the actual user's UUID
UPDATE profiles
SET role = 'manager'
WHERE id = 'paste-actual-user-uuid-here';
```

**Note:** This method only changes the role - it doesn't create new users or change passwords.

## Method 4: Direct SQL Insert (Advanced) ⚠️ DEPRECATED

**⚠️ This method is DEPRECATED and should NOT be used.**

The SQL script `create-admin-users.sql` previously contained hardcoded credentials. It has been updated to serve as a **reference only**.

**Why deprecated:**
- ❌ Risk of hardcoded credentials in version control
- ❌ Requires direct database access
- ❌ More complex than other methods
- ❌ Easy to make security mistakes

**Use Method 1 (Node.js script) instead** - it's safer and easier.

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

### 🔒 Critical Security Requirements

1. **Never Use Hardcoded Passwords**:
   - ❌ NEVER hardcode credentials in SQL scripts
   - ❌ NEVER use predictable passwords like "Admin123!@#"
   - ✅ ALWAYS use secure randomly generated passwords
   - ✅ ALWAYS use a password manager to store credentials

2. **Service Role Key Protection**:
   - Keep your service role key secret
   - Never commit .env files to git
   - Rotate keys if exposed
   - Use environment variables for all secrets

3. **Production Setup**:
   - Use strong, unique passwords (20+ characters)
   - Enable 2FA/MFA where possible
   - Use different credentials for dev/staging/production
   - Implement password rotation policies

4. **Regular Audits**:
   - Periodically review who has admin/manager access
   - Remove unused admin accounts
   - Monitor authentication logs
   - Check for suspicious activity

### Password Requirements

All passwords created should meet these minimum requirements:
- **Minimum length**: 16 characters (20+ recommended)
- **Complexity**: Mix of uppercase, lowercase, numbers, and symbols
- **Randomness**: Use cryptographic random generation
- **Uniqueness**: Different password for each environment

### What Changed (2025-11-04 Security Fix)

**Before (INSECURE):**
- ❌ Hardcoded passwords in SQL files: `Admin123!@#`
- ❌ Predictable email patterns: `admin@moldovadirect.com`
- ❌ Credentials committed to version control
- ❌ Same passwords used across environments

**After (SECURE):**
- ✅ Auto-generated secure random passwords
- ✅ Environment variable support
- ✅ No credentials in source control
- ✅ Password generator utility included
- ✅ Clear warnings in all SQL files

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
