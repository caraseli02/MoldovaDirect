-- Fix Admin Authentication - CORRECTED SQL
-- Run these queries in Supabase SQL Editor

-- ==================================================
-- STEP 1: Check if profile exists and has admin role
-- ==================================================
SELECT
  id,
  name,
  role,
  created_at,
  updated_at
FROM profiles
WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5';

-- Expected: Row with role = 'admin'
-- If no row OR role is not 'admin', continue to STEP 2


-- ==================================================
-- STEP 2A: If profile EXISTS but role is NOT 'admin'
-- ==================================================
UPDATE profiles
SET
  role = 'admin',
  updated_at = NOW()
WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5';

-- Verify the update worked:
SELECT id, name, role FROM profiles
WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5';


-- ==================================================
-- STEP 2B: If profile DOESN'T EXIST at all
-- ==================================================
INSERT INTO profiles (
  id,
  name,
  role,
  preferred_language,
  created_at,
  updated_at
)
VALUES (
  'e9ea70c2-f577-42b2-8207-241c07b8cac5',
  'Admin User',
  'admin',
  'es',
  NOW(),
  NOW()
);

-- Verify the insert:
SELECT id, name, role FROM profiles
WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5';


-- ==================================================
-- STEP 3: COMBINED - Works whether profile exists or not
-- ==================================================
INSERT INTO profiles (id, name, role, preferred_language, created_at, updated_at)
VALUES (
  'e9ea70c2-f577-42b2-8207-241c07b8cac5',
  'Admin User',
  'admin',
  'es',
  NOW(),
  NOW()
)
ON CONFLICT (id)
DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Verify:
SELECT id, name, role FROM profiles
WHERE id = 'e9ea70c2-f577-42b2-8207-241c07b8cac5';


-- ==================================================
-- STEP 4: Final verification with auth.users
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
    WHEN p.role IS NULL THEN '❌ Profile missing'
    ELSE '❌ Wrong role: ' || p.role
  END as role_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'admin@moldovadirect.com';

-- Expected output:
-- email_status: ✅ Email confirmed
-- role_status: ✅ Admin role set


-- ==================================================
-- VERIFICATION: Final check everything is correct
-- ==================================================
SELECT
  'Admin Setup' as check_name,
  CASE
    WHEN COUNT(*) = 1
      AND MIN(u.confirmed_at) IS NOT NULL
      AND MIN(p.role) = 'admin'
    THEN '✅ COMPLETE - Ready to test'
    ELSE '❌ FAILED - See details'
  END as status,
  STRING_AGG(
    CASE
      WHEN u.confirmed_at IS NULL THEN '❌ Email not confirmed'
      WHEN p.id IS NULL THEN '❌ Profile does not exist'
      WHEN p.role IS NULL THEN '❌ Role is NULL'
      WHEN p.role != 'admin' THEN '❌ Role is "' || p.role || '" (needs to be "admin")'
      ELSE '✅ All checks passed'
    END,
    ', '
  ) as details
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'admin@moldovadirect.com';
