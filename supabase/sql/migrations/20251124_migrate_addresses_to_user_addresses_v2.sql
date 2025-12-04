-- Migration: Unify Address Tables (Corrected for Actual Schema)
-- Migrates data from old 'addresses' table to existing 'user_addresses' table
-- Works with the ACTUAL schema: first_name, last_name, street (not full_name, address)

-- Step 1: Migrate existing data from 'addresses' to 'user_addresses'
INSERT INTO public.user_addresses (
  user_id,
  type,
  first_name,
  last_name,
  company,
  street,
  city,
  postal_code,
  province,
  country,
  phone,
  is_default,
  created_at,
  updated_at
)
SELECT
  a.user_id,
  'shipping' as type,  -- Default all migrated addresses to shipping
  -- Split full name into first and last (get from user metadata)
  SPLIT_PART(
    COALESCE(
      (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = a.user_id),
      (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = a.user_id),
      (SELECT email FROM auth.users WHERE id = a.user_id)
    ), ' ', 1
  ) as first_name,
  SPLIT_PART(
    COALESCE(
      (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = a.user_id),
      (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = a.user_id),
      ''
    ), ' ', 2
  ) as last_name,
  '' as company,
  a.street,
  a.city,
  a.postal_code,
  a.province,
  a.country,
  -- Get phone from auth.users metadata
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
    AND ua.street = a.street
    AND ua.city = a.city
    AND ua.postal_code = a.postal_code
);

-- Step 2: Ensure only one default address per user per type
UPDATE public.user_addresses ua1
SET is_default = false
WHERE is_default = true
  AND type = 'shipping'
  AND EXISTS (
    SELECT 1 FROM public.user_addresses ua2
    WHERE ua2.user_id = ua1.user_id
      AND ua2.type = ua1.type
      AND ua2.is_default = true
      AND ua2.id < ua1.id  -- Keep the oldest default
  );

-- Step 3: Verification query (run after migration)
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
  SELECT user_id, type
  FROM public.user_addresses
  WHERE is_default = true
  GROUP BY user_id, type
  HAVING COUNT(*) > 1
) subq;
*/
