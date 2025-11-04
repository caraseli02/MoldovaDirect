-- Simple Admin User Creation for Supabase SQL Editor
-- Date: 2025-10-30
-- Updated: 2025-11-04 (Security Fix - Removed Hardcoded Credentials)
--
-- SECURITY WARNING:
-- Never use hardcoded credentials in SQL scripts that are committed to version control.
-- This script only handles role assignment after users are created.
--
-- INSTRUCTIONS:
-- 1. First, create users via Supabase Dashboard with SECURE passwords:
--    - Go to Authentication > Users
--    - Click "Add User"
--    - Create users with your desired email addresses
--    - Use strong, randomly generated passwords (e.g., from a password manager)
--
-- 2. RECOMMENDED: Use the secure Node.js script instead:
--    node scripts/create-admin-user.mjs
--    (This script automatically generates secure passwords)
--
-- 3. Then run THIS script to assign roles (update emails as needed)

-- =============================================
-- STEP 1: View all existing users
-- =============================================
-- Run this first to see which users exist
SELECT
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
ORDER BY u.created_at DESC;

-- =============================================
-- STEP 2: Assign admin role to specific user
-- =============================================
-- ⚠️ IMPORTANT: Replace 'your-admin@example.com' with your actual admin user's email
-- Option A: By email (replace with your admin's email)
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-admin@example.com'
);

-- Option B: By user ID (if you know the ID)
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = 'paste-user-uuid-here';

-- =============================================
-- STEP 3: Assign manager role to specific user
-- =============================================
-- ⚠️ IMPORTANT: Replace 'your-manager@example.com' with your actual manager user's email
-- Option A: By email (replace with your manager's email)
UPDATE profiles
SET role = 'manager'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-manager@example.com'
);

-- Option B: By user ID
-- UPDATE profiles
-- SET role = 'manager'
-- WHERE id = 'paste-user-uuid-here';

-- =============================================
-- STEP 4: Verify the roles were assigned
-- =============================================
SELECT
  u.email,
  p.name,
  COALESCE(p.role, 'customer') as role,
  CASE
    WHEN p.role = 'admin' THEN '✓ Has Admin Access'
    WHEN p.role = 'manager' THEN '✓ Has Manager Access'
    ELSE '✗ Customer Only'
  END as access_level,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY p.role DESC NULLS LAST, u.created_at DESC;

-- =============================================
-- QUICK REFERENCE: Update multiple users at once
-- =============================================

-- Make multiple users admins by email
/*
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN (
    'admin1@example.com',
    'admin2@example.com',
    'admin3@example.com'
  )
);
*/

-- Make the first registered user an admin (for testing)
/*
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1
);
*/
