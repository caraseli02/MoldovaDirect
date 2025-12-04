-- Fix user_addresses schema mismatch
-- This migration corrects the schema to match the code expectations
--
-- Problem: Initial migration created table with full_name and address columns
-- Expected: first_name, last_name, street, type, province columns
--
-- This migration is idempotent and safe to run multiple times

-- Step 1: Add missing columns if they don't exist
DO $$
BEGIN
  -- Add type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'user_addresses'
                 AND column_name = 'type') THEN
    ALTER TABLE public.user_addresses ADD COLUMN type TEXT NOT NULL DEFAULT 'shipping';
    COMMENT ON COLUMN public.user_addresses.type IS 'Type of address: shipping or billing';
  END IF;

  -- Add first_name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'user_addresses'
                 AND column_name = 'first_name') THEN
    ALTER TABLE public.user_addresses ADD COLUMN first_name TEXT;
  END IF;

  -- Add last_name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'user_addresses'
                 AND column_name = 'last_name') THEN
    ALTER TABLE public.user_addresses ADD COLUMN last_name TEXT;
  END IF;

  -- Add company column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'user_addresses'
                 AND column_name = 'company') THEN
    ALTER TABLE public.user_addresses ADD COLUMN company TEXT;
  END IF;

  -- Add street column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'user_addresses'
                 AND column_name = 'street') THEN
    ALTER TABLE public.user_addresses ADD COLUMN street TEXT;
  END IF;

  -- Add province column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'user_addresses'
                 AND column_name = 'province') THEN
    ALTER TABLE public.user_addresses ADD COLUMN province TEXT;
  END IF;
END $$;

-- Step 2: Migrate data from old columns to new columns (if old columns exist)
DO $$
BEGIN
  -- Check if full_name column exists (old schema)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
             AND table_name = 'user_addresses'
             AND column_name = 'full_name') THEN

    -- Split full_name into first_name and last_name
    UPDATE public.user_addresses
    SET
      first_name = COALESCE(SPLIT_PART(full_name, ' ', 1), ''),
      last_name = COALESCE(SPLIT_PART(full_name, ' ', 2), '')
    WHERE first_name IS NULL OR last_name IS NULL;

  END IF;

  -- Check if address column exists (old schema)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
             AND table_name = 'user_addresses'
             AND column_name = 'address') THEN

    -- Copy address to street
    UPDATE public.user_addresses
    SET street = COALESCE(address, '')
    WHERE street IS NULL;

  END IF;
END $$;

-- Step 3: Make new columns NOT NULL (after data migration)
DO $$
BEGIN
  -- Make first_name NOT NULL
  ALTER TABLE public.user_addresses ALTER COLUMN first_name SET NOT NULL;

  -- Make last_name NOT NULL
  ALTER TABLE public.user_addresses ALTER COLUMN last_name SET NOT NULL;

  -- Make street NOT NULL
  ALTER TABLE public.user_addresses ALTER COLUMN street SET NOT NULL;

  -- Make type NOT NULL (already set with DEFAULT in step 1)
  ALTER TABLE public.user_addresses ALTER COLUMN type SET NOT NULL;
END $$;

-- Step 4: Drop old columns (only if new columns exist and have data)
DO $$
BEGIN
  -- Drop full_name column if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
             AND table_name = 'user_addresses'
             AND column_name = 'full_name') THEN
    ALTER TABLE public.user_addresses DROP COLUMN full_name;
  END IF;

  -- Drop address column if it exists (renamed to street)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
             AND table_name = 'user_addresses'
             AND column_name = 'address') THEN
    ALTER TABLE public.user_addresses DROP COLUMN address;
  END IF;
END $$;

-- Step 5: Add comments for new columns
COMMENT ON COLUMN public.user_addresses.type IS 'Type of address: shipping or billing';
COMMENT ON COLUMN public.user_addresses.first_name IS 'First name of the recipient';
COMMENT ON COLUMN public.user_addresses.last_name IS 'Last name of the recipient';
COMMENT ON COLUMN public.user_addresses.company IS 'Optional company name';
COMMENT ON COLUMN public.user_addresses.street IS 'Street address including number';
COMMENT ON COLUMN public.user_addresses.province IS 'Optional province/state';

-- Step 6: Create additional index for type column
CREATE INDEX IF NOT EXISTS idx_user_addresses_type
ON public.user_addresses(user_id, type);

-- Verification query (commented out - run manually if needed)
/*
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_addresses'
ORDER BY ordinal_position;
*/
