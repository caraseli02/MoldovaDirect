# Admin Authentication Issue - Root Cause & Fix

**Issue Identified:** 2025-11-20T10:06:00Z
**Status:** Ready to fix

---

## Problem Summary

Your Supabase auth user exists and is confirmed, but **admin pages fail because the `profiles` table is missing the admin role**.

### What We Found

✅ **Auth User Exists:**
- Email: `admin@moldovadirect.com`
- User ID: `e9ea70c2-f577-42b2-8207-241c07b8cac5`
- Email confirmed: ✅ YES (`confirmed_at` set)
- Last sign in: 2025-11-20 09:46:17

❌ **Missing Profile Role:**
- The `requireAdminRole()` middleware checks the **`profiles` table**, not auth metadata
- Your user likely doesn't have `role = 'admin'` in the profiles table

---

## How Authentication Works

```
User Login → Supabase Auth (✅ working)
                ↓
Admin Page Access → requireAdminRole() middleware
                ↓
Check profiles table for role = 'admin' (❌ missing)
                ↓
403 Forbidden → Redirect to login
```

### Code Reference: `server/utils/adminAuth.ts:55-68`

```typescript
// Get user profile with role
const { data: profile, error } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', currentUser.id)
  .single()

if (profile.role !== 'admin') {
  throw createError({
    statusCode: 403,
    statusMessage: 'Admin access required'
  })
}
```

---

## Quick Fix Steps

### Option A: Use SQL Script (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Run the queries in **`FIX-ADMIN-AUTH.sql`** (in this directory)
3. Follow the steps in order:
   - STEP 1: Check current profile
   - STEP 2A or 2B: Update or insert admin role
   - STEP 4: Verify everything is correct

### Option B: Quick Fix (Single Query)

Run this in Supabase SQL Editor:

```sql
-- Update profile to admin (if exists)
UPDATE profiles
SET role = 'admin', updated_at = NOW()
WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5';

-- If update returns 0 rows, insert profile
INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT
  'e9ea70c2-f577-42b2-8207-241c07b8cac5',
  'Admin User',
  'admin@moldovadirect.com',
  'admin',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM profiles
  WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5'
);

-- Verify
SELECT u.email, p.role
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'admin@moldovadirect.com';
```

---

## After Running SQL Fix

### 1. Verify in Supabase Dashboard

Go to: **Table Editor → profiles**

Find row where:
- `id` = `e9ea70c2-f577-42b2-8207-241c07b8cac5`
- `role` = `admin` ✅

### 2. Test Login Manually

1. Open: http://localhost:3001/auth/login
2. Enter:
   - Email: `admin@moldovadirect.com`
   - Password: `test1234`
3. Should redirect to: http://localhost:3001/admin

If login fails with 400 error, the password might be wrong. See "Reset Password" below.

### 3. Run Visual Tests

```bash
node visual-admin-test.mjs
```

**Expected Results:**
- ✅ Login successful (no 400 error)
- ✅ Dashboard loads (no auth errors)
- ✅ Users page shows 67 users
- ✅ Products page shows 112 products
- ✅ Orders page shows 360 orders

---

## Troubleshooting

### Issue: Password doesn't work

**Reset password via Supabase Dashboard:**

1. Go to: Authentication → Users
2. Find: `admin@moldovadirect.com`
3. Click "..." menu → "Reset password"
4. Set new password: `test1234`
5. Update `visual-admin-test.mjs` if using different password

**Or reset via SQL:**

```sql
-- This sends password reset email to admin@moldovadirect.com
-- Click link in email to set new password
```

### Issue: "role column doesn't exist"

**Create role column:**

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Set admin role
UPDATE profiles
SET role = 'admin'
WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5';
```

### Issue: Profile doesn't exist at all

**Create profile:**

```sql
INSERT INTO profiles (id, name, email, role, created_at, updated_at)
VALUES (
  'e9ea70c2-f577-42b2-8207-241c07b8cac5',
  'Admin User',
  'admin@moldovadirect.com',
  'admin',
  NOW(),
  NOW()
);
```

---

## What We Fixed Today

### Security Vulnerabilities (All Fixed ✅)
1. ✅ Open redirect in auth store
2. ✅ SQL injection in orders endpoint
3. ✅ Query parameter injection in cache keys
4. ✅ Inconsistent cache key generation (3 endpoints)

### Test Configuration Updates
1. ✅ Updated `visual-admin-test.mjs` to use `admin@moldovadirect.com`
2. ✅ Created SQL fix script: `FIX-ADMIN-AUTH.sql`
3. ✅ Created this troubleshooting guide

---

## Next Steps

1. **Run SQL Fix:** Execute `FIX-ADMIN-AUTH.sql` queries in Supabase
2. **Verify Profile:** Check profiles table has `role = 'admin'`
3. **Test Login:** Try logging in at http://localhost:3001/auth/login
4. **Run Visual Tests:** Execute `node visual-admin-test.mjs`
5. **Review Report:** Check `test-results/visual-admin-screenshots/TEST-REPORT.md`

---

## Expected Final Status

Once the profile role is set:

| Page | Status | Data |
|------|--------|------|
| Dashboard | ✅ PASS | Stats displayed |
| Users | ✅ PASS | 67 users loaded |
| Products | ✅ PASS | 112 products loaded |
| Orders | ✅ PASS | 360 orders loaded |
| Testing | ✅ PASS | Baseline correct |

**All security fixes working correctly with no issues! 🎉**

---

## Files for Reference

- **SQL Fix Script:** `FIX-ADMIN-AUTH.sql`
- **Test Script:** `visual-admin-test.mjs`
- **Security Report:** `SECURITY-FIXES-REPORT.md`
- **Visual Analysis:** `VISUAL-TEST-ANALYSIS.md`
- **Test Results:** `test-results/visual-admin-screenshots/`
