-- Create user_checkout_preferences table for storing checkout preferences
-- This enables smart pre-population of shipping methods and other preferences

CREATE TABLE IF NOT EXISTS public.user_checkout_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_shipping_method TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.user_checkout_preferences IS 'Stores checkout preferences for faster repeat purchases';
COMMENT ON COLUMN public.user_checkout_preferences.preferred_shipping_method IS 'Last used or preferred shipping method (standard, express, overnight)';

-- Enable Row Level Security
ALTER TABLE public.user_checkout_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_checkout_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
  ON public.user_checkout_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
  ON public.user_checkout_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_checkout_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER checkout_preferences_updated_at
  BEFORE UPDATE ON public.user_checkout_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_checkout_preferences_updated_at();
