-- Create Admin and Manager Test Users
-- Date: 2025-10-30
-- Updated: 2025-11-04 (Security Fix - Removed Hardcoded Credentials)
-- Purpose: Create test users with admin and manager roles for testing the role-based access control

-- =============================================
-- SECURITY WARNING
-- =============================================
-- ⚠️ THIS SCRIPT IS DEPRECATED AND SHOULD NOT BE USED WITH HARDCODED CREDENTIALS
-- ⚠️ This file is kept for reference only to show SQL structure
--
-- RECOMMENDED METHOD: Use the Node.js script with auto-generated passwords
--   node scripts/create-admin-user.mjs
--
-- This ensures:
-- - No hardcoded credentials in version control
-- - Secure random password generation
-- - Proper credential management
-- =============================================

-- =============================================
-- IMPORTANT: CREATING USERS IN SUPABASE
-- =============================================
-- This script is for reference only. You CANNOT directly insert into auth.users
-- from the Supabase SQL editor due to security restrictions.
--
-- RECOMMENDED METHOD: Use the Supabase Dashboard or the Node.js script instead.
-- See README-admin-users.md for detailed instructions.
--
-- If you still want to run this via SQL, you need to use a database admin connection
-- with a tool like psql, not the Supabase SQL editor.
-- =============================================

-- =============================================
-- METHOD: Create users via Supabase Functions
-- =============================================
-- This approach uses Supabase's admin functions which work in the SQL editor

-- ⚠️ DO NOT USE THIS SECTION WITH HARDCODED PASSWORDS
-- Instead use: node scripts/create-admin-user.mjs
--
-- If you must use SQL, you need to:
-- 1. Generate secure passwords using a password manager
-- 2. Hash them using: crypt('YOUR_SECURE_PASSWORD', gen_salt('bf'))
-- 3. Use this structure as a template only

/*
DO $$
DECLARE
  admin_user_id uuid;
  manager_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'your-admin@example.com'; -- ⚠️ Change this email

  IF admin_user_id IS NULL THEN
    -- Create admin user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'your-admin@example.com', -- ⚠️ Change this email
      crypt('YOUR_SECURE_PASSWORD_HERE', gen_salt('bf')), -- ⚠️ Use a secure generated password
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin User"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_user_id;

    RAISE NOTICE 'Created admin user with ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
  END IF;

  -- Check if manager user already exists
  SELECT id INTO manager_user_id
  FROM auth.users
  WHERE email = 'your-manager@example.com'; -- ⚠️ Change this email

  IF manager_user_id IS NULL THEN
    -- Create manager user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'your-manager@example.com', -- ⚠️ Change this email
      crypt('YOUR_SECURE_PASSWORD_HERE', gen_salt('bf')), -- ⚠️ Use a secure generated password
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Manager User"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO manager_user_id;

    RAISE NOTICE 'Created manager user with ID: %', manager_user_id;
  ELSE
    RAISE NOTICE 'Manager user already exists with ID: %', manager_user_id;
  END IF;
END $$;
*/

-- =============================================
-- UPDATE PROFILES WITH ADMIN/MANAGER ROLES
-- =============================================

-- Note: Profiles should be auto-created by the handle_new_user() trigger
-- But we'll ensure they exist and have the correct roles

-- Update admin user profile
-- ⚠️ Replace with your actual admin email
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-admin@example.com'
);

-- Update manager user profile
-- ⚠️ Replace with your actual manager email
UPDATE profiles
SET role = 'manager'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-manager@example.com'
);

-- =============================================
-- VERIFY USERS WERE CREATED
-- =============================================

-- ⚠️ Update email addresses to match your actual users
SELECT
  u.email,
  p.name,
  p.role,
  u.email_confirmed_at,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN ('your-admin@example.com', 'your-manager@example.com')
ORDER BY p.role DESC;

-- =============================================
-- NOTES
-- =============================================

/*
IMPORTANT SECURITY NOTES:
1. NEVER use hardcoded passwords in SQL scripts committed to version control
2. ALWAYS use secure, randomly generated passwords
3. Store credentials securely in a password manager
4. This script is for REFERENCE ONLY - use the Node.js script instead

RECOMMENDED METHOD - Use Node.js Script:
  node scripts/create-admin-user.mjs

  This script:
  - Generates secure random passwords automatically
  - Creates users via Supabase Admin API
  - Assigns roles properly
  - Shows credentials once for secure storage

ALTERNATIVE METHOD - Supabase Dashboard:
1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add User"
3. Enter email and a SECURE randomly generated password
4. After creation, run this SQL to update their role:

   UPDATE profiles
   SET role = 'admin'
   WHERE id = 'USER_ID_HERE';

DO NOT use predictable passwords like "Admin123!@#" or similar patterns.
Use a password generator to create secure credentials.
*/
