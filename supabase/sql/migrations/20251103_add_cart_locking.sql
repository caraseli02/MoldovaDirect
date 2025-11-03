-- Migration: Add cart locking functionality
-- Purpose: Prevent cart modifications during active checkout sessions
-- Date: 2025-11-03

-- Add locking columns to carts table
ALTER TABLE carts
ADD COLUMN locked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN locked_by_checkout_session_id TEXT;

-- Add index for efficient lock status queries
CREATE INDEX idx_carts_locked_until ON carts(locked_until) WHERE locked_until IS NOT NULL;

-- Add index for checkout session lookups
CREATE INDEX idx_carts_locked_by_session ON carts(locked_by_checkout_session_id) WHERE locked_by_checkout_session_id IS NOT NULL;

-- Function to lock a cart
CREATE OR REPLACE FUNCTION lock_cart(
  p_cart_id INTEGER,
  p_checkout_session_id TEXT,
  p_lock_duration_minutes INTEGER DEFAULT 30
) RETURNS JSONB AS $$
DECLARE
  v_current_time TIMESTAMP WITH TIME ZONE := NOW();
  v_lock_until TIMESTAMP WITH TIME ZONE;
  v_existing_lock TIMESTAMP WITH TIME ZONE;
  v_existing_session TEXT;
BEGIN
  -- Calculate lock expiration time
  v_lock_until := v_current_time + (p_lock_duration_minutes || ' minutes')::INTERVAL;

  -- Check if cart exists and get current lock status
  SELECT locked_until, locked_by_checkout_session_id
  INTO v_existing_lock, v_existing_session
  FROM carts
  WHERE id = p_cart_id;

  -- Cart doesn't exist
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cart not found',
      'code', 'CART_NOT_FOUND'
    );
  END IF;

  -- Cart is already locked by a different session and lock hasn't expired
  IF v_existing_lock IS NOT NULL
     AND v_existing_lock > v_current_time
     AND v_existing_session IS DISTINCT FROM p_checkout_session_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cart is locked by another checkout session',
      'code', 'CART_ALREADY_LOCKED',
      'locked_until', v_existing_lock,
      'locked_by_session', v_existing_session
    );
  END IF;

  -- Lock the cart
  UPDATE carts
  SET
    locked_at = v_current_time,
    locked_until = v_lock_until,
    locked_by_checkout_session_id = p_checkout_session_id,
    updated_at = v_current_time
  WHERE id = p_cart_id;

  RETURN jsonb_build_object(
    'success', true,
    'locked_at', v_current_time,
    'locked_until', v_lock_until,
    'checkout_session_id', p_checkout_session_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unlock a cart
CREATE OR REPLACE FUNCTION unlock_cart(
  p_cart_id INTEGER,
  p_checkout_session_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_existing_session TEXT;
  v_locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current lock status
  SELECT locked_by_checkout_session_id, locked_until
  INTO v_existing_session, v_locked_until
  FROM carts
  WHERE id = p_cart_id;

  -- Cart doesn't exist
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cart not found',
      'code', 'CART_NOT_FOUND'
    );
  END IF;

  -- Cart is not locked
  IF v_existing_session IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Cart was not locked'
    );
  END IF;

  -- If session ID provided, verify it matches (unless lock has expired)
  IF p_checkout_session_id IS NOT NULL
     AND v_locked_until > NOW()
     AND v_existing_session IS DISTINCT FROM p_checkout_session_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot unlock cart locked by different session',
      'code', 'UNAUTHORIZED_UNLOCK',
      'locked_by_session', v_existing_session
    );
  END IF;

  -- Unlock the cart
  UPDATE carts
  SET
    locked_at = NULL,
    locked_until = NULL,
    locked_by_checkout_session_id = NULL,
    updated_at = NOW()
  WHERE id = p_cart_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Cart unlocked successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check cart lock status
CREATE OR REPLACE FUNCTION check_cart_lock_status(
  p_cart_id INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_locked_at TIMESTAMP WITH TIME ZONE;
  v_locked_until TIMESTAMP WITH TIME ZONE;
  v_locked_by_session TEXT;
  v_is_locked BOOLEAN;
BEGIN
  -- Get lock information
  SELECT
    locked_at,
    locked_until,
    locked_by_checkout_session_id
  INTO
    v_locked_at,
    v_locked_until,
    v_locked_by_session
  FROM carts
  WHERE id = p_cart_id;

  -- Cart doesn't exist
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cart not found',
      'code', 'CART_NOT_FOUND'
    );
  END IF;

  -- Determine if cart is effectively locked
  v_is_locked := v_locked_until IS NOT NULL AND v_locked_until > NOW();

  RETURN jsonb_build_object(
    'success', true,
    'is_locked', v_is_locked,
    'locked_at', v_locked_at,
    'locked_until', v_locked_until,
    'locked_by_session', v_locked_by_session,
    'current_time', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired cart locks (can be called by cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_cart_locks()
RETURNS TABLE(unlocked_count INTEGER) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Unlock all carts with expired locks
  UPDATE carts
  SET
    locked_at = NULL,
    locked_until = NULL,
    locked_by_checkout_session_id = NULL,
    updated_at = NOW()
  WHERE
    locked_until IS NOT NULL
    AND locked_until < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON COLUMN carts.locked_at IS 'Timestamp when cart was locked for checkout';
COMMENT ON COLUMN carts.locked_until IS 'Timestamp when lock expires (typically 30 minutes)';
COMMENT ON COLUMN carts.locked_by_checkout_session_id IS 'Checkout session ID that locked the cart';

COMMENT ON FUNCTION lock_cart IS 'Locks a cart for a specific checkout session, preventing modifications';
COMMENT ON FUNCTION unlock_cart IS 'Unlocks a cart, allowing modifications again';
COMMENT ON FUNCTION check_cart_lock_status IS 'Returns the current lock status of a cart';
COMMENT ON FUNCTION cleanup_expired_cart_locks IS 'Removes expired locks from carts (run periodically)';
