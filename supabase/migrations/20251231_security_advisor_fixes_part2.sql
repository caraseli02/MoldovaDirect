-- Migration: Fix Remaining Supabase Security Advisor Issues (Part 2)
-- Date: 2025-12-31
-- Description: Addresses remaining function search_path warnings
-- This migration fixes functions that were not covered in 20251230_security_advisor_fixes.sql
-- NOTE: Each section checks if the table exists before creating/replacing functions

-- =============================================
-- PART 1: NEWSLETTER FUNCTIONS (3 functions)
-- Only if newsletter_subscriptions table exists
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscriptions') THEN
    -- 1.1 Fix update_newsletter_subscriptions_updated_at function
    CREATE OR REPLACE FUNCTION update_newsletter_subscriptions_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql
    SET search_path = '';

    RAISE NOTICE 'Fixed: update_newsletter_subscriptions_updated_at';
  ELSE
    RAISE NOTICE 'Skipped: newsletter_subscriptions table does not exist';
  END IF;
END $$;

-- 1.2 Fix subscribe_to_newsletter function (SECURITY DEFINER)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscriptions') THEN
    CREATE OR REPLACE FUNCTION subscribe_to_newsletter(
      p_email TEXT,
      p_locale TEXT DEFAULT 'es',
      p_source TEXT DEFAULT 'landing_page',
      p_metadata JSONB DEFAULT '{}'
    )
    RETURNS TABLE (
      id UUID,
      email TEXT,
      is_new_subscription BOOLEAN
    ) AS $func$
    DECLARE
      v_subscription public.newsletter_subscriptions%ROWTYPE;
      v_is_new BOOLEAN;
    BEGIN
      SELECT * INTO v_subscription
      FROM public.newsletter_subscriptions
      WHERE public.newsletter_subscriptions.email = LOWER(TRIM(p_email));

      IF FOUND THEN
        IF v_subscription.is_active THEN
          v_is_new := false;
        ELSE
          UPDATE public.newsletter_subscriptions
          SET
            is_active = true,
            unsubscribed_at = NULL,
            subscribed_at = now(),
            locale = p_locale,
            source = p_source,
            metadata = p_metadata,
            updated_at = now()
          WHERE public.newsletter_subscriptions.email = LOWER(TRIM(p_email))
          RETURNING * INTO v_subscription;
          v_is_new := true;
        END IF;
      ELSE
        INSERT INTO public.newsletter_subscriptions (email, locale, source, metadata)
        VALUES (LOWER(TRIM(p_email)), p_locale, p_source, p_metadata)
        RETURNING * INTO v_subscription;
        v_is_new := true;
      END IF;

      RETURN QUERY SELECT v_subscription.id, v_subscription.email, v_is_new;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = '';

    RAISE NOTICE 'Fixed: subscribe_to_newsletter';
  END IF;
END $$;

-- 1.3 Fix unsubscribe_from_newsletter function (SECURITY DEFINER)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscriptions') THEN
    CREATE OR REPLACE FUNCTION unsubscribe_from_newsletter(
      p_email TEXT
    )
    RETURNS BOOLEAN AS $func$
    DECLARE
      v_updated BOOLEAN;
    BEGIN
      UPDATE public.newsletter_subscriptions
      SET
        is_active = false,
        unsubscribed_at = now(),
        updated_at = now()
      WHERE email = LOWER(TRIM(p_email))
        AND is_active = true
      RETURNING true INTO v_updated;

      RETURN COALESCE(v_updated, false);
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = '';

    RAISE NOTICE 'Fixed: unsubscribe_from_newsletter';
  END IF;
END $$;

-- =============================================
-- PART 2: CART LOCKING FUNCTIONS (4 functions)
-- Only if carts table has locking columns
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'carts' AND column_name = 'locked_at') THEN
    -- 2.1 Fix lock_cart function (SECURITY DEFINER)
    CREATE OR REPLACE FUNCTION lock_cart(
      p_cart_id INTEGER,
      p_checkout_session_id TEXT,
      p_lock_duration_minutes INTEGER DEFAULT 30
    ) RETURNS JSONB AS $func$
    DECLARE
      v_current_time TIMESTAMP WITH TIME ZONE := NOW();
      v_lock_until TIMESTAMP WITH TIME ZONE;
      v_existing_lock TIMESTAMP WITH TIME ZONE;
      v_existing_session TEXT;
    BEGIN
      v_lock_until := v_current_time + (p_lock_duration_minutes || ' minutes')::INTERVAL;

      SELECT locked_until, locked_by_checkout_session_id
      INTO v_existing_lock, v_existing_session
      FROM public.carts
      WHERE id = p_cart_id;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cart not found', 'code', 'CART_NOT_FOUND');
      END IF;

      IF v_existing_lock IS NOT NULL AND v_existing_lock > v_current_time AND v_existing_session IS DISTINCT FROM p_checkout_session_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cart is locked by another checkout session', 'code', 'CART_ALREADY_LOCKED', 'locked_until', v_existing_lock, 'locked_by_session', v_existing_session);
      END IF;

      UPDATE public.carts
      SET locked_at = v_current_time, locked_until = v_lock_until, locked_by_checkout_session_id = p_checkout_session_id, updated_at = v_current_time
      WHERE id = p_cart_id;

      RETURN jsonb_build_object('success', true, 'locked_at', v_current_time, 'locked_until', v_lock_until, 'checkout_session_id', p_checkout_session_id);
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = '';

    RAISE NOTICE 'Fixed: lock_cart';
  ELSE
    RAISE NOTICE 'Skipped: carts.locked_at column does not exist';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'carts' AND column_name = 'locked_at') THEN
    -- 2.2 Fix unlock_cart function (SECURITY DEFINER)
    CREATE OR REPLACE FUNCTION unlock_cart(
      p_cart_id INTEGER,
      p_checkout_session_id TEXT DEFAULT NULL
    ) RETURNS JSONB AS $func$
    DECLARE
      v_existing_session TEXT;
      v_locked_until TIMESTAMP WITH TIME ZONE;
    BEGIN
      SELECT locked_by_checkout_session_id, locked_until
      INTO v_existing_session, v_locked_until
      FROM public.carts
      WHERE id = p_cart_id;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cart not found', 'code', 'CART_NOT_FOUND');
      END IF;

      IF v_existing_session IS NULL THEN
        RETURN jsonb_build_object('success', true, 'message', 'Cart was not locked');
      END IF;

      IF p_checkout_session_id IS NOT NULL AND v_locked_until > NOW() AND v_existing_session IS DISTINCT FROM p_checkout_session_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot unlock cart locked by different session', 'code', 'UNAUTHORIZED_UNLOCK', 'locked_by_session', v_existing_session);
      END IF;

      UPDATE public.carts
      SET locked_at = NULL, locked_until = NULL, locked_by_checkout_session_id = NULL, updated_at = NOW()
      WHERE id = p_cart_id;

      RETURN jsonb_build_object('success', true, 'message', 'Cart unlocked successfully');
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = '';

    -- 2.3 Fix check_cart_lock_status function (SECURITY DEFINER)
    CREATE OR REPLACE FUNCTION check_cart_lock_status(
      p_cart_id INTEGER
    ) RETURNS JSONB AS $func2$
    DECLARE
      v_locked_at TIMESTAMP WITH TIME ZONE;
      v_locked_until TIMESTAMP WITH TIME ZONE;
      v_locked_by_session TEXT;
      v_is_locked BOOLEAN;
    BEGIN
      SELECT locked_at, locked_until, locked_by_checkout_session_id
      INTO v_locked_at, v_locked_until, v_locked_by_session
      FROM public.carts
      WHERE id = p_cart_id;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cart not found', 'code', 'CART_NOT_FOUND');
      END IF;

      v_is_locked := v_locked_until IS NOT NULL AND v_locked_until > NOW();

      RETURN jsonb_build_object('success', true, 'is_locked', v_is_locked, 'locked_at', v_locked_at, 'locked_until', v_locked_until, 'locked_by_session', v_locked_by_session, 'current_time', NOW());
    END;
    $func2$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = '';

    -- 2.4 Fix cleanup_expired_cart_locks function (SECURITY DEFINER)
    CREATE OR REPLACE FUNCTION cleanup_expired_cart_locks()
    RETURNS TABLE(unlocked_count INTEGER) AS $func3$
    DECLARE
      v_count INTEGER;
    BEGIN
      UPDATE public.carts
      SET locked_at = NULL, locked_until = NULL, locked_by_checkout_session_id = NULL, updated_at = NOW()
      WHERE locked_until IS NOT NULL AND locked_until < NOW();

      GET DIAGNOSTICS v_count = ROW_COUNT;
      RETURN QUERY SELECT v_count;
    END;
    $func3$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = '';

    RAISE NOTICE 'Fixed: unlock_cart, check_cart_lock_status, cleanup_expired_cart_locks';
  END IF;
END $$;

-- =============================================
-- PART 3: USER ADDRESSES FUNCTIONS (2 functions)
-- Only if user_addresses table exists
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_addresses') THEN
    -- 3.1 Fix update_user_addresses_updated_at function
    CREATE OR REPLACE FUNCTION update_user_addresses_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql
    SET search_path = '';

    -- 3.2 Fix ensure_single_default_address function
    CREATE OR REPLACE FUNCTION ensure_single_default_address()
    RETURNS TRIGGER AS $func2$
    BEGIN
      IF NEW.is_default = TRUE THEN
        UPDATE public.user_addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND type = NEW.type AND id != NEW.id;
      END IF;
      RETURN NEW;
    END;
    $func2$ LANGUAGE plpgsql
    SET search_path = '';

    RAISE NOTICE 'Fixed: update_user_addresses_updated_at, ensure_single_default_address';
  ELSE
    RAISE NOTICE 'Skipped: user_addresses table does not exist';
  END IF;
END $$;

-- =============================================
-- PART 4: EMAIL PREFERENCES FUNCTION (1 function)
-- Only if email_preferences table exists
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_preferences') THEN
    CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql
    SET search_path = '';

    RAISE NOTICE 'Fixed: update_email_preferences_updated_at';
  ELSE
    RAISE NOTICE 'Skipped: email_preferences table does not exist';
  END IF;
END $$;

-- =============================================
-- PART 5: IMPERSONATION FUNCTIONS (2 functions)
-- Only if impersonation_logs table exists
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'impersonation_logs') THEN
    -- 5.1 Fix get_active_impersonation function (SECURITY DEFINER)
    CREATE OR REPLACE FUNCTION get_active_impersonation(p_admin_id UUID)
    RETURNS TABLE (
      log_id BIGINT,
      target_user_id UUID,
      expires_at TIMESTAMPTZ,
      reason TEXT
    ) AS $func$
    BEGIN
      RETURN QUERY
      SELECT id, public.impersonation_logs.target_user_id, public.impersonation_logs.expires_at, public.impersonation_logs.reason
      FROM public.impersonation_logs
      WHERE admin_id = p_admin_id AND ended_at IS NULL AND public.impersonation_logs.expires_at > NOW()
      ORDER BY started_at DESC
      LIMIT 1;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = '';

    -- 5.2 Fix cleanup_expired_impersonations function (SECURITY DEFINER)
    CREATE OR REPLACE FUNCTION cleanup_expired_impersonations()
    RETURNS INTEGER AS $func2$
    DECLARE
      updated_count INTEGER;
    BEGIN
      WITH updated AS (
        UPDATE public.impersonation_logs
        SET ended_at = NOW()
        WHERE ended_at IS NULL AND expires_at <= NOW()
        RETURNING id
      )
      SELECT COUNT(*) INTO updated_count FROM updated;
      RETURN updated_count;
    END;
    $func2$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = '';

    RAISE NOTICE 'Fixed: get_active_impersonation, cleanup_expired_impersonations';
  ELSE
    RAISE NOTICE 'Skipped: impersonation_logs table does not exist';
  END IF;
END $$;

-- =============================================
-- PART 6: LANDING CMS FUNCTIONS (3 functions)
-- Only if landing_sections table exists
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'landing_sections') THEN
    -- 6.1 Fix update_landing_sections_updated_at function
    CREATE OR REPLACE FUNCTION update_landing_sections_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql
    SET search_path = '';

    -- 6.2 Fix get_active_landing_sections function (SECURITY DEFINER)
    CREATE OR REPLACE FUNCTION get_active_landing_sections(p_locale TEXT DEFAULT 'es')
    RETURNS TABLE (
      id UUID,
      section_type TEXT,
      display_order INTEGER,
      translations JSONB,
      config JSONB,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ
    ) AS $func2$
    BEGIN
      RETURN QUERY
      SELECT ls.id, ls.section_type, ls.display_order, ls.translations, ls.config, ls.created_at, ls.updated_at
      FROM public.landing_sections ls
      WHERE ls.is_active = true AND (ls.starts_at IS NULL OR ls.starts_at <= now()) AND (ls.ends_at IS NULL OR ls.ends_at >= now())
      ORDER BY ls.display_order ASC;
    END;
    $func2$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = '';

    -- 6.3 Fix reorder_landing_sections function (SECURITY DEFINER)
    CREATE OR REPLACE FUNCTION reorder_landing_sections(
      p_section_id UUID,
      p_new_order INTEGER
    )
    RETURNS VOID AS $func3$
    DECLARE
      v_old_order INTEGER;
    BEGIN
      SELECT display_order INTO v_old_order FROM public.landing_sections WHERE id = p_section_id;

      IF v_old_order < p_new_order THEN
        UPDATE public.landing_sections SET display_order = display_order - 1
        WHERE display_order > v_old_order AND display_order <= p_new_order AND id != p_section_id;
      ELSE
        UPDATE public.landing_sections SET display_order = display_order + 1
        WHERE display_order >= p_new_order AND display_order < v_old_order AND id != p_section_id;
      END IF;

      UPDATE public.landing_sections SET display_order = p_new_order WHERE id = p_section_id;
    END;
    $func3$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = '';

    RAISE NOTICE 'Fixed: update_landing_sections_updated_at, get_active_landing_sections, reorder_landing_sections';
  ELSE
    RAISE NOTICE 'Skipped: landing_sections table does not exist';
  END IF;
END $$;

-- =============================================
-- PART 7: SUPPORT TICKET FUNCTIONS (2 functions)
-- Only if support_tickets table exists
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_tickets') THEN
    -- 7.1 Fix generate_ticket_number function
    CREATE OR REPLACE FUNCTION generate_ticket_number()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.ticket_number = 'TICKET-' || LPAD(NEW.id::TEXT, 8, '0');
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql
    SET search_path = '';

    -- 7.2 Fix update_support_tickets_updated_at function
    CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
    RETURNS TRIGGER AS $func2$
    BEGIN
      NEW.updated_at = NOW();
      IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        NEW.resolved_at = NOW();
      END IF;
      IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
        NEW.closed_at = NOW();
      END IF;
      RETURN NEW;
    END;
    $func2$ LANGUAGE plpgsql
    SET search_path = '';

    RAISE NOTICE 'Fixed: generate_ticket_number, update_support_tickets_updated_at';
  ELSE
    RAISE NOTICE 'Skipped: support_tickets table does not exist';
  END IF;
END $$;

-- =============================================
-- PART 8: DATA RETENTION FUNCTIONS (5 functions)
-- Only if user_activity_logs table exists
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_activity_logs') THEN
    -- 8.1 Fix cleanup_old_user_activity_logs function
    CREATE OR REPLACE FUNCTION cleanup_old_user_activity_logs()
    RETURNS TABLE (deleted_count INTEGER, retention_days INTEGER, cleanup_timestamp TIMESTAMP) AS $func$
    DECLARE
      v_deleted_count INTEGER;
      v_retention_days INTEGER := 90;
      v_cutoff_date TIMESTAMP;
    BEGIN
      v_cutoff_date := NOW() - INTERVAL '90 days';
      DELETE FROM public.user_activity_logs WHERE created_at < v_cutoff_date;
      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

      INSERT INTO public.audit_logs (user_id, action, resource_type, metadata, created_at)
      VALUES (NULL, 'automated_data_retention_cleanup', 'user_activity_logs',
        jsonb_build_object('deleted_count', v_deleted_count, 'retention_days', v_retention_days, 'cutoff_date', v_cutoff_date::TEXT), NOW());

      RETURN QUERY SELECT v_deleted_count, v_retention_days, NOW();
    END;
    $func$ LANGUAGE plpgsql
    SET search_path = '';

    RAISE NOTICE 'Fixed: cleanup_old_user_activity_logs';
  ELSE
    RAISE NOTICE 'Skipped: user_activity_logs table does not exist';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    -- 8.2 Fix cleanup_old_audit_logs function
    CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
    RETURNS TABLE (deleted_count INTEGER, retention_years INTEGER, cleanup_timestamp TIMESTAMP) AS $func$
    DECLARE
      v_deleted_count INTEGER;
      v_retention_years INTEGER := 7;
      v_cutoff_date TIMESTAMP;
    BEGIN
      v_cutoff_date := NOW() - INTERVAL '7 years';
      DELETE FROM public.audit_logs
      WHERE created_at < v_cutoff_date
        AND action NOT IN ('account_deleted', 'account_deleted_atomic', 'security_breach', 'unauthorized_access', 'privilege_escalation');
      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
      RETURN QUERY SELECT v_deleted_count, v_retention_years, NOW();
    END;
    $func$ LANGUAGE plpgsql
    SET search_path = '';

    RAISE NOTICE 'Fixed: cleanup_old_audit_logs';
  ELSE
    RAISE NOTICE 'Skipped: audit_logs table does not exist';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_logs') THEN
    -- 8.3 Fix cleanup_old_email_logs function
    CREATE OR REPLACE FUNCTION cleanup_old_email_logs()
    RETURNS TABLE (deleted_count INTEGER, retention_years INTEGER, cleanup_timestamp TIMESTAMP) AS $func$
    DECLARE
      v_deleted_count INTEGER;
      v_retention_years INTEGER := 2;
      v_cutoff_date TIMESTAMP;
    BEGIN
      v_cutoff_date := NOW() - INTERVAL '2 years';
      DELETE FROM public.email_logs WHERE created_at < v_cutoff_date;
      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
      RETURN QUERY SELECT v_deleted_count, v_retention_years, NOW();
    END;
    $func$ LANGUAGE plpgsql
    SET search_path = '';

    RAISE NOTICE 'Fixed: cleanup_old_email_logs';
  ELSE
    RAISE NOTICE 'Skipped: email_logs table does not exist';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'auth_events') THEN
    -- 8.4 Fix cleanup_old_auth_events function
    CREATE OR REPLACE FUNCTION cleanup_old_auth_events()
    RETURNS TABLE (deleted_count INTEGER, retention_years INTEGER, cleanup_timestamp TIMESTAMP) AS $func$
    DECLARE
      v_deleted_count INTEGER;
      v_retention_years INTEGER := 1;
      v_cutoff_date TIMESTAMP;
    BEGIN
      v_cutoff_date := NOW() - INTERVAL '1 year';
      DELETE FROM public.auth_events
      WHERE created_at < v_cutoff_date AND event_type NOT IN ('account_deleted', 'account_deleted_atomic');
      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
      RETURN QUERY SELECT v_deleted_count, v_retention_years, NOW();
    END;
    $func$ LANGUAGE plpgsql
    SET search_path = '';

    RAISE NOTICE 'Fixed: cleanup_old_auth_events';
  ELSE
    RAISE NOTICE 'Skipped: auth_events table does not exist';
  END IF;
END $$;

-- 8.5 Fix run_data_retention_cleanup function (always create, it calls other functions)
CREATE OR REPLACE FUNCTION run_data_retention_cleanup()
RETURNS JSONB AS $$
DECLARE
  v_activity_logs_result RECORD;
  v_audit_logs_result RECORD;
  v_email_logs_result RECORD;
  v_auth_events_result RECORD;
  v_results JSONB := '{}'::JSONB;
BEGIN
  -- Only call functions that exist
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_old_user_activity_logs') THEN
    SELECT * INTO v_activity_logs_result FROM cleanup_old_user_activity_logs();
    v_results := v_results || jsonb_build_object('user_activity_logs', jsonb_build_object('deleted', v_activity_logs_result.deleted_count, 'retention_days', v_activity_logs_result.retention_days));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_old_audit_logs') THEN
    SELECT * INTO v_audit_logs_result FROM cleanup_old_audit_logs();
    v_results := v_results || jsonb_build_object('audit_logs', jsonb_build_object('deleted', v_audit_logs_result.deleted_count, 'retention_years', v_audit_logs_result.retention_years));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_old_email_logs') THEN
    SELECT * INTO v_email_logs_result FROM cleanup_old_email_logs();
    v_results := v_results || jsonb_build_object('email_logs', jsonb_build_object('deleted', v_email_logs_result.deleted_count, 'retention_years', v_email_logs_result.retention_years));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_old_auth_events') THEN
    SELECT * INTO v_auth_events_result FROM cleanup_old_auth_events();
    v_results := v_results || jsonb_build_object('auth_events', jsonb_build_object('deleted', v_auth_events_result.deleted_count, 'retention_years', v_auth_events_result.retention_years));
  END IF;

  RETURN jsonb_build_object('success', true, 'timestamp', NOW()::TEXT, 'results', v_results);
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- =============================================
-- PART 9: ATOMIC INVENTORY FUNCTIONS (2 functions)
-- Only if orders table has inventory_updated column
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'inventory_updated') THEN
    -- 9.1 Fix update_inventory_for_order_atomic function
    CREATE OR REPLACE FUNCTION update_inventory_for_order_atomic(
      p_order_id INTEGER,
      p_user_id UUID
    ) RETURNS JSONB AS $func$
    DECLARE
      v_order RECORD;
      v_item RECORD;
      v_current_stock INTEGER;
      v_new_stock INTEGER;
      v_products_updated INTEGER := 0;
    BEGIN
      SELECT inventory_updated, status INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
      END IF;

      IF v_order.inventory_updated THEN
        RETURN jsonb_build_object('success', true, 'message', 'Inventory already updated for this order', 'products_updated', 0, 'skipped', true);
      END IF;

      FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id
      LOOP
        SELECT stock_quantity INTO v_current_stock FROM public.products WHERE id = v_item.product_id FOR UPDATE;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Product % not found', v_item.product_id;
        END IF;

        IF v_current_stock < v_item.quantity THEN
          RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Required: %', v_item.product_id, v_current_stock, v_item.quantity;
        END IF;

        v_new_stock := GREATEST(0, v_current_stock - v_item.quantity);

        UPDATE public.products SET stock_quantity = v_new_stock, updated_at = NOW() WHERE id = v_item.product_id;

        INSERT INTO public.inventory_logs (product_id, quantity_change, quantity_after, reason, reference_id, created_by, created_at)
        VALUES (v_item.product_id, -v_item.quantity, v_new_stock, 'sale', p_order_id, p_user_id, NOW());

        v_products_updated := v_products_updated + 1;
      END LOOP;

      UPDATE public.orders SET inventory_updated = true, updated_at = NOW() WHERE id = p_order_id;

      RETURN jsonb_build_object('success', true, 'message', 'Inventory updated successfully', 'products_updated', v_products_updated, 'order_id', p_order_id);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error updating inventory for order %: %', p_order_id, SQLERRM;
        RAISE;
    END;
    $func$ LANGUAGE plpgsql
    SET search_path = '';

    -- 9.2 Fix rollback_inventory_for_order_atomic function
    CREATE OR REPLACE FUNCTION rollback_inventory_for_order_atomic(
      p_order_id INTEGER,
      p_user_id UUID
    ) RETURNS JSONB AS $func2$
    DECLARE
      v_order RECORD;
      v_item RECORD;
      v_current_stock INTEGER;
      v_new_stock INTEGER;
      v_products_updated INTEGER := 0;
    BEGIN
      SELECT inventory_updated, status INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
      END IF;

      IF NOT v_order.inventory_updated THEN
        RETURN jsonb_build_object('success', true, 'message', 'Inventory was not updated for this order', 'products_updated', 0, 'skipped', true);
      END IF;

      IF v_order.status IN ('shipped', 'delivered') THEN
        RAISE EXCEPTION 'Cannot rollback inventory for % orders', v_order.status;
      END IF;

      FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id
      LOOP
        SELECT stock_quantity INTO v_current_stock FROM public.products WHERE id = v_item.product_id FOR UPDATE;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Product % not found', v_item.product_id;
        END IF;

        v_new_stock := v_current_stock + v_item.quantity;

        UPDATE public.products SET stock_quantity = v_new_stock, updated_at = NOW() WHERE id = v_item.product_id;

        INSERT INTO public.inventory_logs (product_id, quantity_change, quantity_after, reason, reference_id, created_by, created_at)
        VALUES (v_item.product_id, v_item.quantity, v_new_stock, 'sale_reversal', p_order_id, p_user_id, NOW());

        v_products_updated := v_products_updated + 1;
      END LOOP;

      UPDATE public.orders SET inventory_updated = false, updated_at = NOW() WHERE id = p_order_id;

      RETURN jsonb_build_object('success', true, 'message', 'Inventory rolled back successfully', 'products_updated', v_products_updated, 'order_id', p_order_id);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error rolling back inventory for order %: %', p_order_id, SQLERRM;
        RAISE;
    END;
    $func2$ LANGUAGE plpgsql
    SET search_path = '';

    RAISE NOTICE 'Fixed: update_inventory_for_order_atomic, rollback_inventory_for_order_atomic';
  ELSE
    RAISE NOTICE 'Skipped: orders.inventory_updated column does not exist';
  END IF;
END $$;

-- =============================================
-- PART 10: CREATE ORDER WITH INVENTORY (1 function)
-- Only if orders table exists
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    CREATE OR REPLACE FUNCTION create_order_with_inventory(
      order_data JSONB,
      order_items_data JSONB[]
    ) RETURNS JSONB AS $func$
    DECLARE
      new_order_id INTEGER;
      item JSONB;
      product_id INTEGER;
      quantity INTEGER;
      current_stock INTEGER;
      product_snapshot JSONB;
      price_eur DECIMAL(10,2);
      total_eur DECIMAL(10,2);
      result_order JSONB;
    BEGIN
      IF order_data IS NULL OR order_items_data IS NULL OR array_length(order_items_data, 1) = 0 THEN
        RAISE EXCEPTION 'Missing required order data or items';
      END IF;

      INSERT INTO public.orders (
        order_number, user_id, status, payment_method, payment_status, payment_intent_id,
        subtotal_eur, shipping_cost_eur, tax_eur, total_eur,
        shipping_address, billing_address, guest_email, created_at, updated_at
      ) VALUES (
        (order_data->>'order_number')::TEXT,
        NULLIF(order_data->>'user_id', '')::UUID,
        (order_data->>'status')::TEXT,
        (order_data->>'payment_method')::TEXT,
        (order_data->>'payment_status')::TEXT,
        (order_data->>'payment_intent_id')::TEXT,
        (order_data->>'subtotal_eur')::DECIMAL,
        (order_data->>'shipping_cost_eur')::DECIMAL,
        COALESCE((order_data->>'tax_eur')::DECIMAL, 0),
        (order_data->>'total_eur')::DECIMAL,
        (order_data->'shipping_address')::JSONB,
        (order_data->'billing_address')::JSONB,
        NULLIF(order_data->>'guest_email', ''),
        NOW(), NOW()
      ) RETURNING id INTO new_order_id;

      FOREACH item IN ARRAY order_items_data LOOP
        product_id := (item->>'product_id')::INTEGER;
        quantity := (item->>'quantity')::INTEGER;
        product_snapshot := (item->'product_snapshot')::JSONB;
        price_eur := (item->>'price_eur')::DECIMAL;
        total_eur := (item->>'total_eur')::DECIMAL;

        IF quantity <= 0 THEN
          RAISE EXCEPTION 'Invalid quantity % for product %', quantity, product_id;
        END IF;

        BEGIN
          SELECT stock_quantity INTO current_stock
          FROM public.products
          WHERE id = product_id AND is_active = true
          FOR UPDATE NOWAIT;
        EXCEPTION
          WHEN lock_not_available THEN
            RAISE EXCEPTION 'Product % is currently being processed by another order. Please try again.', product_id;
        END;

        IF current_stock IS NULL THEN
          RAISE EXCEPTION 'Product % not found or inactive', product_id;
        END IF;

        IF current_stock < quantity THEN
          RAISE EXCEPTION 'Insufficient stock for product %: requested %, available %', product_id, quantity, current_stock;
        END IF;

        INSERT INTO public.order_items (order_id, product_id, product_snapshot, quantity, price_eur, total_eur)
        VALUES (new_order_id, product_id, product_snapshot, quantity, price_eur, total_eur);

        UPDATE public.products
        SET stock_quantity = stock_quantity - quantity, updated_at = NOW()
        WHERE id = product_id;

        INSERT INTO public.inventory_logs (product_id, quantity_change, quantity_after, reason, reference_id, created_at)
        VALUES (product_id, -quantity, current_stock - quantity, 'sale', new_order_id, NOW());
      END LOOP;

      SELECT jsonb_build_object(
        'success', true,
        'order', jsonb_build_object(
          'id', o.id, 'order_number', o.order_number, 'total', o.total_eur,
          'status', o.status, 'payment_status', o.payment_status, 'created_at', o.created_at
        )
      ) INTO result_order
      FROM public.orders o
      WHERE o.id = new_order_id;

      RETURN result_order;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Order creation failed: %', SQLERRM;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = '';

    -- Re-grant execute permission to service role only
    GRANT EXECUTE ON FUNCTION create_order_with_inventory(JSONB, JSONB[]) TO service_role;

    RAISE NOTICE 'Fixed: create_order_with_inventory';
  ELSE
    RAISE NOTICE 'Skipped: orders table does not exist';
  END IF;
END $$;

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 20251231_security_advisor_fixes_part2 completed';
  RAISE NOTICE 'Functions were conditionally fixed based on table existence';
  RAISE NOTICE '========================================';
END $$;
