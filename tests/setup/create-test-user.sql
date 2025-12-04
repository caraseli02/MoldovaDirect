-- ============================================================================
-- Test User Setup for Express Checkout E2E Tests
-- ============================================================================
-- This script creates a test user with:
-- 1. Account credentials (teste2e@example.com)
-- 2. Saved shipping address
-- 3. Preferred shipping method (for auto-skip)
-- ============================================================================

-- Clean up existing test user if exists
DELETE FROM user_checkout_preferences
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'teste2e@example.com');

DELETE FROM user_addresses
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'teste2e@example.com');

DELETE FROM orders
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'teste2e@example.com');

-- Note: Cannot delete from auth.users directly, use Supabase Dashboard if needed

-- ============================================================================
-- Step 1: Create Test User Account
-- ============================================================================
-- If user doesn't exist, create them
-- Password: N7jKAcu2FHbt7cj (hashed below)
-- ============================================================================

DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Check if user exists
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'teste2e@example.com';

  IF test_user_id IS NULL THEN
    -- Create new user
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    )
    VALUES (
      gen_random_uuid(),
      'teste2e@example.com',
      crypt('N7jKAcu2FHbt7cj', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Test E2E User"}',
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO test_user_id;

    RAISE NOTICE 'Created test user with ID: %', test_user_id;
  ELSE
    RAISE NOTICE 'Test user already exists with ID: %', test_user_id;
  END IF;

  -- ============================================================================
  -- Step 2: Add Saved Shipping Address
  -- ============================================================================

  INSERT INTO user_addresses (
    id,
    user_id,
    first_name,
    last_name,
    street,
    city,
    state,
    postal_code,
    country,
    phone,
    is_default,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    test_user_id,
    'Test',
    'User',
    '123 Express Checkout Street',
    'San Francisco',
    'CA',
    '94102',
    'US',
    '+1-555-0123',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, is_default)
  WHERE is_default = true
  DO UPDATE SET
    first_name = 'Test',
    last_name = 'User',
    street = '123 Express Checkout Street',
    city = 'San Francisco',
    state = 'CA',
    postal_code = '94102',
    country = 'US',
    phone = '+1-555-0123',
    updated_at = NOW();

  RAISE NOTICE 'Created/Updated default address for test user';

  -- ============================================================================
  -- Step 3: Add Preferred Shipping Method (for Auto-Skip)
  -- ============================================================================

  INSERT INTO user_checkout_preferences (
    user_id,
    preferred_shipping_method,
    created_at,
    updated_at
  )
  VALUES (
    test_user_id,
    'standard',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    preferred_shipping_method = 'standard',
    updated_at = NOW();

  RAISE NOTICE 'Created/Updated shipping preferences for test user';

  -- ============================================================================
  -- Step 4: Create a Previous Order (Optional - for realism)
  -- ============================================================================

  INSERT INTO orders (
    id,
    user_id,
    status,
    total_amount,
    shipping_method,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    test_user_id,
    'completed',
    99.99,
    'standard',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Created previous order for test user (if orders table exists)';

END $$;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check user exists
SELECT
  'USER' as type,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'teste2e@example.com';

-- Check address exists
SELECT
  'ADDRESS' as type,
  id,
  user_id,
  first_name,
  last_name,
  street,
  city,
  country,
  is_default
FROM user_addresses
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'teste2e@example.com');

-- Check preferences exist
SELECT
  'PREFERENCES' as type,
  user_id,
  preferred_shipping_method,
  created_at
FROM user_checkout_preferences
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'teste2e@example.com');

-- Check orders exist
SELECT
  'ORDERS' as type,
  COUNT(*) as order_count
FROM orders
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'teste2e@example.com');

-- ============================================================================
-- Success Message
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ TEST USER SETUP COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: teste2e@example.com';
  RAISE NOTICE '🔑 Password: N7jKAcu2FHbt7cj';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Saved Address: 123 Express Checkout Street, San Francisco, CA';
  RAISE NOTICE '✅ Preferred Shipping: standard';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Express Checkout Auto-Skip: ENABLED';
  RAISE NOTICE '⏱️  Countdown Timer: ENABLED';
  RAISE NOTICE '';
  RAISE NOTICE 'Run tests with: pnpm test:checkout-flow:headed';
END $$;
