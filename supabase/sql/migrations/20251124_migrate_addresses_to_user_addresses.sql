-- Migration: Unify Address Tables
-- Migrates data from old 'addresses' table to new 'user_addresses' table
-- and ensures all address management uses a single unified schema

-- Step 1: Migrate existing data from 'addresses' to 'user_addresses'
-- Handle schema differences:
--   - addresses.street → user_addresses.address
--   - addresses.id (SERIAL) → user_addresses.id (UUID)
--   - addresses has 'type' and 'province', user_addresses does not
--   - user_addresses needs 'full_name' and 'phone' (will use defaults from user profile)

INSERT INTO public.user_addresses (
  id,
  user_id,
  full_name,
  address,
  city,
  postal_code,
  country,
  phone,
  is_default,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid() as id,
  a.user_id,
  -- Get full_name from auth.users metadata, fallback to email prefix
  COALESCE(
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = a.user_id),
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = a.user_id),
    SPLIT_PART((SELECT email FROM auth.users WHERE id = a.user_id), '@', 1)
  ) as full_name,
  -- Map street to address (include province if present)
  CASE
    WHEN a.province IS NOT NULL AND a.province != ''
    THEN a.street || ', ' || a.province
    ELSE a.street
  END as address,
  a.city,
  a.postal_code,
  a.country,
  -- Get phone from auth.users metadata, fallback to empty string
  COALESCE(
    (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = a.user_id),
    ''
  ) as phone,
  a.is_default,
  a.created_at,
  NOW() as updated_at
FROM public.addresses a
WHERE NOT EXISTS (
  -- Avoid duplicates if migration has been run before
  SELECT 1 FROM public.user_addresses ua
  WHERE ua.user_id = a.user_id
    AND ua.address = a.street
    AND ua.city = a.city
);

-- Step 2: Drop old addresses table (only if migration successful)
-- Comment this out for safety - manual verification recommended
-- DROP TABLE IF EXISTS public.addresses CASCADE;

-- Step 3: Add helpful comments
COMMENT ON TABLE public.user_addresses IS 'Unified address storage for both profile and checkout features. Replaces old "addresses" table.';

-- Step 4: Ensure only one default address per user (fix any inconsistencies)
-- This trigger already exists in the user_addresses creation migration,
-- but we'll ensure data consistency after migration

UPDATE public.user_addresses ua1
SET is_default = false
WHERE is_default = true
  AND EXISTS (
    SELECT 1 FROM public.user_addresses ua2
    WHERE ua2.user_id = ua1.user_id
      AND ua2.is_default = true
      AND ua2.id < ua1.id  -- Keep the oldest default
  );

-- Step 5: Create view for backwards compatibility (optional)
-- This allows old code to still work while being migrated
CREATE OR REPLACE VIEW public.addresses_legacy AS
SELECT
  id::INTEGER as id,  -- Cast UUID to INTEGER for compatibility
  user_id,
  'shipping' as type,  -- Default type for all addresses
  SPLIT_PART(address, ',', 1) as street,  -- Extract street from combined address
  city,
  postal_code,
  NULL as province,  -- Province is now included in address field
  country,
  is_default,
  created_at
FROM public.user_addresses;

-- Add comment to view
COMMENT ON VIEW public.addresses_legacy IS 'Legacy compatibility view. DO NOT USE for new code. Migrating to user_addresses table.';

-- Step 6: Migration verification query
-- Run this after migration to verify success:
/*
SELECT
  'Old addresses table' as source,
  COUNT(*) as count
FROM public.addresses
UNION ALL
SELECT
  'New user_addresses table' as source,
  COUNT(*) as count
FROM public.user_addresses
UNION ALL
SELECT
  'Users with multiple defaults (should be 0)' as source,
  COUNT(*) as count
FROM (
  SELECT user_id
  FROM public.user_addresses
  WHERE is_default = true
  GROUP BY user_id
  HAVING COUNT(*) > 1
) subq;
*/
