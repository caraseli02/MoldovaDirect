-- Fix Admin Authentication Issue
-- Run these queries in Supabase SQL Editor

-- ==================================================
-- STEP 1: Check if profile exists with admin role
-- ==================================================
SELECT
  id,
  name,
  email,
  role,
  created_at,
  updated_at
FROM profiles
WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5';

-- Expected result: Row with role = 'admin'
-- If no row found OR role is NULL/not 'admin', proceed to STEP 2


-- ==================================================
-- STEP 2A: If profile exists but role is not 'admin'
-- ==================================================
UPDATE profiles
SET
  role = 'admin',
  updated_at = NOW()
WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5';

-- Verify the update
SELECT id, name, email, role FROM profiles
WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5';


-- ==================================================
-- STEP 2B: If profile doesn't exist at all
-- ==================================================
INSERT INTO profiles (
  id,
  name,
  email,
  role,
  created_at,
  updated_at
)
VALUES (
  'e9ea70c2-f577-42b2-8207-241c07b8cac5',
  'Admin User',
  'admin@moldovadirect.com',
  'admin',
  NOW(),
  NOW()
);

-- Verify the insert
SELECT id, name, email, role FROM profiles
WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5';


-- ==================================================
-- STEP 3: Verify password (OPTIONAL)
-- ==================================================
-- If the password 'test1234' doesn't work, you can reset it:
-- Go to Supabase Dashboard > Authentication > Users
-- Find: admin@moldovadirect.com
-- Click "..." menu > "Reset password"
-- Set new password: test1234
-- OR use email password reset flow


-- ==================================================
-- STEP 4: Verify complete admin setup
-- ==================================================
SELECT
  u.id,
  u.email,
  u.confirmed_at,
  u.last_sign_in_at,
  p.name,
  p.role,
  CASE
    WHEN u.confirmed_at IS NOT NULL THEN '✅ Email confirmed'
    ELSE '❌ Email NOT confirmed'
  END as email_status,
  CASE
    WHEN p.role = 'admin' THEN '✅ Admin role set'
    ELSE '❌ Admin role MISSING'
  END as role_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'admin@moldovadirect.com';

-- Expected result:
-- ✅ Email confirmed
-- ✅ Admin role set


-- ==================================================
-- TROUBLESHOOTING: Common Issues
-- ==================================================

-- Issue 1: Email not confirmed
-- Fix:
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'admin@moldovadirect.com'
AND confirmed_at IS NULL;

-- Issue 2: Check if profiles table has correct schema
-- Verify 'role' column exists:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'role';

-- If 'role' column doesn't exist, create it:
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Create index for faster admin role lookups:
CREATE INDEX IF NOT EXISTS idx_profiles_role
ON profiles(role)
WHERE role = 'admin';


-- ==================================================
-- VERIFICATION QUERY - Run this at the end
-- ==================================================
SELECT
  'Authentication Check' as check_type,
  CASE
    WHEN COUNT(*) = 1 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  STRING_AGG(
    CASE
      WHEN u.confirmed_at IS NULL THEN '❌ Email not confirmed'
      WHEN p.id IS NULL THEN '❌ Profile missing'
      WHEN p.role IS NULL THEN '❌ Role is NULL'
      WHEN p.role != 'admin' THEN '❌ Role is not admin (current: ' || p.role || ')'
      ELSE '✅ All checks passed'
    END,
    ', '
  ) as details
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'admin@moldovadirect.com';

-- Expected output:
-- check_type              | status    | details
-- -----------------------|-----------|------------------
-- Authentication Check   | ✅ PASS   | ✅ All checks passed
