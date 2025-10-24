-- User Addresses Table for Checkout
-- This table stores saved addresses for authenticated users

CREATE TABLE IF NOT EXISTS user_addresses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('shipping', 'billing')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  province TEXT,
  country TEXT NOT NULL,
  phone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_type ON user_addresses(type);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, type, is_default);

-- RLS Policies
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own addresses
CREATE POLICY "Users can view own addresses" ON user_addresses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses" ON user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses" ON user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses" ON user_addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_addresses_updated_at();

-- Ensure only one default address per type per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this address as default, unset others
  IF NEW.is_default = TRUE THEN
    UPDATE user_addresses 
    SET is_default = FALSE 
    WHERE user_id = NEW.user_id 
      AND type = NEW.type 
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure single default address
CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();