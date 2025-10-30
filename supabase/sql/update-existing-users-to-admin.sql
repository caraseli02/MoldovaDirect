-- Update Existing Users to Admin/Manager Roles
-- Date: 2025-10-30
-- Purpose: Promote existing users to admin or manager roles
-- This is safer to run than creating auth.users directly

-- =============================================
-- OPTION 1: UPDATE SPECIFIC USERS BY EMAIL
-- =============================================

-- Uncomment and replace with actual user emails to promote them to admin
/*
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
*/

-- Uncomment and replace with actual user emails to promote them to manager
/*
UPDATE profiles
SET role = 'manager'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'manager-email@example.com'
);
*/

-- =============================================
-- OPTION 2: UPDATE SPECIFIC USERS BY ID
-- =============================================

-- If you know the user ID, you can update directly
/*
UPDATE profiles
SET role = 'admin'
WHERE id = 'user-uuid-here';
*/

-- =============================================
-- VIEW ALL USERS AND THEIR CURRENT ROLES
-- =============================================

-- Run this to see all users and their current roles
SELECT
  u.id,
  u.email,
  p.name,
  COALESCE(p.role, 'customer') as role,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- =============================================
-- EXAMPLE: PROMOTE FIRST USER TO ADMIN
-- =============================================

-- Uncomment this to promote the first registered user to admin
-- (useful for development)
/*
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1
);
*/

-- =============================================
-- BULK UPDATE: Make all existing users admins
-- =============================================

-- WARNING: Only use this in development!
-- Uncomment to make all users admins (for testing)
/*
UPDATE profiles
SET role = 'admin';
*/

-- =============================================
-- VERIFY ROLE UPDATES
-- =============================================

-- Run this after updating to verify the changes
SELECT
  u.email,
  p.name,
  p.role,
  CASE
    WHEN p.role = 'admin' THEN '✓ Admin Access'
    WHEN p.role = 'manager' THEN '✓ Manager Access'
    ELSE '✗ Customer Only'
  END as access_level
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.role IN ('admin', 'manager')
ORDER BY p.role DESC;
