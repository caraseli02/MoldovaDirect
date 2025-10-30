-- Create Admin and Manager Test Users
-- Date: 2025-10-30
-- Purpose: Create test users with admin and manager roles for testing the role-based access control

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

DO $$
DECLARE
  admin_user_id uuid;
  manager_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@moldovadirect.com';

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
      'admin@moldovadirect.com',
      crypt('Admin123!@#', gen_salt('bf')),
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
  WHERE email = 'manager@moldovadirect.com';

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
      'manager@moldovadirect.com',
      crypt('Manager123!@#', gen_salt('bf')),
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

-- =============================================
-- UPDATE PROFILES WITH ADMIN/MANAGER ROLES
-- =============================================

-- Note: Profiles should be auto-created by the handle_new_user() trigger
-- But we'll ensure they exist and have the correct roles

-- Update admin user profile
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@moldovadirect.com'
);

-- Update manager user profile
UPDATE profiles
SET role = 'manager'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'manager@moldovadirect.com'
);

-- =============================================
-- VERIFY USERS WERE CREATED
-- =============================================

SELECT
  u.email,
  p.name,
  p.role,
  u.email_confirmed_at,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN ('admin@moldovadirect.com', 'manager@moldovadirect.com')
ORDER BY p.role DESC;

-- =============================================
-- NOTES
-- =============================================

/*
IMPORTANT SECURITY NOTES:
1. The passwords in this script are EXAMPLES ONLY
2. Change these passwords immediately in production
3. Consider using Supabase's built-in signup flow instead for production users
4. This script is meant for development/testing purposes

TO CREATE USERS VIA SUPABASE DASHBOARD:
1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add User"
3. Enter email and password
4. After creation, run this SQL to update their role:

   UPDATE profiles
   SET role = 'admin'
   WHERE id = 'USER_ID_HERE';

ALTERNATIVE: Create users via Supabase CLI
supabase auth signup --email admin@moldovadirect.com --password Admin123!@#

Then update the profile role as shown above.
*/
