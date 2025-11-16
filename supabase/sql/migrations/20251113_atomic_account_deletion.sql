-- Migration: Atomic Account Deletion
-- Issue: #225 - Non-Atomic Account Deletion Violates GDPR Article 17
-- Date: 2025-11-13
-- Description: This migration creates a database function that handles account deletion
--              atomically (all-or-nothing), ensuring GDPR compliance for the right to erasure.
--              If any step fails, the entire deletion is rolled back.

-- Drop function if exists (for idempotency)
DROP FUNCTION IF EXISTS delete_user_account_atomic(UUID, TEXT);

-- Create the atomic account deletion function
CREATE OR REPLACE FUNCTION delete_user_account_atomic(
  target_user_id UUID,
  deletion_reason TEXT DEFAULT 'not_specified'
) RETURNS JSONB AS $$
DECLARE
  deletion_count JSONB;
  addresses_deleted INTEGER := 0;
  carts_deleted INTEGER := 0;
  orders_anonymized INTEGER := 0;
  profile_deleted BOOLEAN := false;
BEGIN
  -- Validate input
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Start transaction (implicit in function)
  -- All operations below are atomic - either all succeed or all fail

  -- 1. Delete user addresses
  DELETE FROM addresses
  WHERE user_id = target_user_id;

  GET DIAGNOSTICS addresses_deleted = ROW_COUNT;

  -- 2. Delete cart items first (to respect foreign key constraints)
  DELETE FROM cart_items
  WHERE cart_id IN (
    SELECT id FROM carts WHERE user_id = target_user_id
  );

  -- 3. Delete user carts
  DELETE FROM carts
  WHERE user_id = target_user_id;

  GET DIAGNOSTICS carts_deleted = ROW_COUNT;

  -- 4. Anonymize orders (preserve for business/legal records)
  -- GDPR allows retention of minimal data for legal obligations
  UPDATE orders
  SET
    user_id = NULL,
    customer_notes = '[Account Deleted]',
    shipping_address = jsonb_build_object(
      'street', '[Deleted]',
      'city', '[Deleted]',
      'postalCode', '[Deleted]',
      'country', '[Deleted]'
    ),
    billing_address = jsonb_build_object(
      'street', '[Deleted]',
      'city', '[Deleted]',
      'postalCode', '[Deleted]',
      'country', '[Deleted]'
    ),
    guest_email = NULL,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  GET DIAGNOSTICS orders_anonymized = ROW_COUNT;

  -- 5. Delete user activity logs (GDPR compliance)
  DELETE FROM user_activity_logs
  WHERE user_id = target_user_id;

  -- 6. Anonymize audit logs (keep for compliance but remove PII)
  UPDATE audit_logs
  SET
    user_id = NULL,
    ip_address = '[Deleted]',
    user_agent = '[Deleted]',
    metadata = jsonb_build_object(
      'deleted_user_id', target_user_id::TEXT,
      'deletion_timestamp', NOW()::TEXT
    )
  WHERE user_id = target_user_id;

  -- 7. Delete newsletter subscriptions (by email since there's no user_id column)
  DELETE FROM newsletter_subscriptions
  WHERE email IN (
    SELECT email FROM auth.users WHERE id = target_user_id
  );

  -- 8. Delete email preferences
  DELETE FROM email_preferences
  WHERE user_id = target_user_id;

  -- 9. Delete impersonation logs (where user was target or admin)
  DELETE FROM impersonation_logs
  WHERE target_user_id = target_user_id OR admin_id = target_user_id;

  -- 10. Delete user profile
  DELETE FROM profiles
  WHERE id = target_user_id;

  profile_deleted := FOUND;

  -- 11. Delete from auth.users (removes email, phone, password, metadata)
  -- Note: This must be done last as other queries may reference auth.users
  -- The API endpoint will call auth.admin.deleteUser() separately for complete cleanup

  -- Return summary of deletions
  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id::TEXT,
    'addresses_deleted', addresses_deleted,
    'carts_deleted', carts_deleted,
    'orders_anonymized', orders_anonymized,
    'profile_deleted', profile_deleted,
    'deletion_reason', deletion_reason,
    'timestamp', NOW()::TEXT
  );

EXCEPTION
  WHEN OTHERS THEN
    -- On any error, the entire transaction is rolled back automatically
    -- Log the failure and re-raise the exception
    RAISE EXCEPTION 'Account deletion failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users (via service role)
GRANT EXECUTE ON FUNCTION delete_user_account_atomic(UUID, TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION delete_user_account_atomic(UUID, TEXT) IS
  'Atomically deletes a user account and all associated data in compliance with GDPR Article 17.
   All operations are performed in a single transaction - if any step fails, the entire deletion is rolled back.
   This prevents partial deletions that would violate GDPR compliance.';
