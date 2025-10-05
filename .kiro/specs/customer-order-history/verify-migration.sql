-- Verification Script for Order Tracking Migration
-- Run this script to verify that the migration was applied successfully

-- =============================================
-- VERIFY NEW COLUMNS IN ORDERS TABLE
-- =============================================
DO $
BEGIN
  -- Check if tracking_number column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    RAISE NOTICE '✓ Column orders.tracking_number exists';
  ELSE
    RAISE EXCEPTION '✗ Column orders.tracking_number is missing';
  END IF;

  -- Check if carrier column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'carrier'
  ) THEN
    RAISE NOTICE '✓ Column orders.carrier exists';
  ELSE
    RAISE EXCEPTION '✗ Column orders.carrier is missing';
  END IF;

  -- Check if estimated_delivery column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'estimated_delivery'
  ) THEN
    RAISE NOTICE '✓ Column orders.estimated_delivery exists';
  ELSE
    RAISE EXCEPTION '✗ Column orders.estimated_delivery is missing';
  END IF;
END $;

-- =============================================
-- VERIFY ORDER_TRACKING_EVENTS TABLE
-- =============================================
DO $
BEGIN
  -- Check if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'order_tracking_events'
  ) THEN
    RAISE NOTICE '✓ Table order_tracking_events exists';
  ELSE
    RAISE EXCEPTION '✗ Table order_tracking_events is missing';
  END IF;

  -- Check required columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_tracking_events' 
    AND column_name IN ('id', 'order_id', 'status', 'location', 'description', 'timestamp', 'created_at')
    GROUP BY table_name
    HAVING COUNT(*) = 7
  ) THEN
    RAISE NOTICE '✓ All required columns exist in order_tracking_events';
  ELSE
    RAISE EXCEPTION '✗ Some columns are missing in order_tracking_events';
  END IF;
END $;

-- =============================================
-- VERIFY INDEXES
-- =============================================
DO $
BEGIN
  -- Check order_tracking_events indexes
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'order_tracking_events' 
    AND indexname = 'order_tracking_events_order_id_idx'
  ) THEN
    RAISE NOTICE '✓ Index order_tracking_events_order_id_idx exists';
  ELSE
    RAISE WARNING '✗ Index order_tracking_events_order_id_idx is missing';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'order_tracking_events' 
    AND indexname = 'order_tracking_events_timestamp_idx'
  ) THEN
    RAISE NOTICE '✓ Index order_tracking_events_timestamp_idx exists';
  ELSE
    RAISE WARNING '✗ Index order_tracking_events_timestamp_idx is missing';
  END IF;

  -- Check orders table indexes
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'orders' 
    AND indexname = 'orders_tracking_number_idx'
  ) THEN
    RAISE NOTICE '✓ Index orders_tracking_number_idx exists';
  ELSE
    RAISE WARNING '✗ Index orders_tracking_number_idx is missing';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'orders' 
    AND indexname = 'orders_user_status_created_idx'
  ) THEN
    RAISE NOTICE '✓ Index orders_user_status_created_idx exists';
  ELSE
    RAISE WARNING '✗ Index orders_user_status_created_idx is missing';
  END IF;
END $;

-- =============================================
-- VERIFY FUNCTIONS
-- =============================================
DO $
BEGIN
  -- Check get_latest_tracking_event function
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_latest_tracking_event'
  ) THEN
    RAISE NOTICE '✓ Function get_latest_tracking_event exists';
  ELSE
    RAISE WARNING '✗ Function get_latest_tracking_event is missing';
  END IF;

  -- Check add_tracking_event function
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'add_tracking_event'
  ) THEN
    RAISE NOTICE '✓ Function add_tracking_event exists';
  ELSE
    RAISE WARNING '✗ Function add_tracking_event is missing';
  END IF;
END $;

-- =============================================
-- VERIFY RLS POLICIES
-- =============================================
DO $
BEGIN
  -- Check if RLS is enabled on order_tracking_events
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'order_tracking_events' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✓ RLS is enabled on order_tracking_events';
  ELSE
    RAISE WARNING '✗ RLS is not enabled on order_tracking_events';
  END IF;

  -- Check if policies exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_tracking_events'
  ) THEN
    RAISE NOTICE '✓ RLS policies exist on order_tracking_events';
  ELSE
    RAISE WARNING '✗ No RLS policies found on order_tracking_events';
  END IF;
END $;

-- =============================================
-- SUMMARY
-- =============================================
SELECT 
  'Migration Verification Complete' as status,
  'Check the notices above for details' as message;

-- Display table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'order_tracking_events'
ORDER BY ordinal_position;

-- Display indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('orders', 'order_tracking_events')
  AND indexname LIKE '%tracking%'
ORDER BY tablename, indexname;
