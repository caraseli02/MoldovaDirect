-- Quick script to get your user ID
-- Run this first, then copy your user ID to use in supabase/sql/supabase-mock-orders.sql

SELECT 
  id as user_id,
  email,
  created_at,
  'Copy the user_id above and paste it into supabase/sql/supabase-mock-orders.sql' as instruction
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
