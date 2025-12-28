-- Migration: Link guest orders to user account on signup
-- This automatically links orders placed with guest_email to the user's account when they register

-- Function to automatically link guest orders when a user signs up
CREATE OR REPLACE FUNCTION public.link_guest_orders_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  linked_count INTEGER;
BEGIN
  -- Wrap order linking in its own exception block
  -- This ensures signup always succeeds even if order linking fails
  BEGIN
    -- Link any guest orders with matching email to the new user
    UPDATE orders
    SET user_id = NEW.id,
        updated_at = NOW()
    WHERE guest_email = NEW.email
      AND user_id IS NULL;

    -- Get count of linked orders for logging
    GET DIAGNOSTICS linked_count = ROW_COUNT;

    -- Log if orders were linked (optional, for debugging)
    IF linked_count > 0 THEN
      RAISE NOTICE 'Linked % guest orders to user %', linked_count, NEW.email;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't block signup
    RAISE WARNING 'Failed to link guest orders for user %: %', NEW.email, SQLERRM;
  END;

  -- Always return NEW to allow signup to proceed
  RETURN NEW;
END;
$$;

-- Create trigger that fires after a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created_link_orders ON auth.users;

CREATE TRIGGER on_auth_user_created_link_orders
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_guest_orders_on_signup();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.link_guest_orders_on_signup() TO postgres;
GRANT EXECUTE ON FUNCTION public.link_guest_orders_on_signup() TO service_role;
