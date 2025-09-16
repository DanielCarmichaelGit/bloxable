-- Dual Authentication Schema for Sellers and Buyers
-- This allows the same email to be used for both seller and buyer accounts

-- Create user_profiles table to track user types and additional data
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('seller', 'buyer')),
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  company_name TEXT, -- For sellers
  website TEXT, -- For sellers
  phone TEXT,
  address JSONB, -- For sellers (address, city, state, country, postal_code)
  preferences JSONB DEFAULT '{}', -- User preferences
  is_verified BOOLEAN DEFAULT FALSE, -- For sellers
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one profile per type per user
  UNIQUE(user_id, profile_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_type ON user_profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verified ON user_profiles(is_verified) WHERE profile_type = 'seller';
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles (with IF NOT EXISTS)
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own profiles" ON user_profiles;
  DROP POLICY IF EXISTS "Users can insert their own profiles" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update their own profiles" ON user_profiles;
  DROP POLICY IF EXISTS "Users can delete their own profiles" ON user_profiles;
  
  -- Create new policies
  CREATE POLICY "Users can view their own profiles" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own profiles" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own profiles" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Create function to automatically update updated_at timestamp for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user's current active profile type
CREATE OR REPLACE FUNCTION get_user_active_profile_type(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  active_profile_type TEXT;
BEGIN
  SELECT profile_type INTO active_profile_type
  FROM user_profiles
  WHERE user_id = user_uuid AND is_active = TRUE
  ORDER BY updated_at DESC
  LIMIT 1;
  
  RETURN COALESCE(active_profile_type, 'buyer'); -- Default to buyer if no active profile
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to switch user's active profile
CREATE OR REPLACE FUNCTION switch_user_profile(user_uuid UUID, new_profile_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate profile type
  IF new_profile_type NOT IN ('seller', 'buyer') THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has this profile type
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = user_uuid AND profile_type = new_profile_type
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Deactivate all profiles for this user
  UPDATE user_profiles 
  SET is_active = FALSE 
  WHERE user_id = user_uuid;
  
  -- Activate the requested profile
  UPDATE user_profiles 
  SET is_active = TRUE, updated_at = NOW()
  WHERE user_id = user_uuid AND profile_type = new_profile_type;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create a new user profile
CREATE OR REPLACE FUNCTION create_user_profile(
  user_uuid UUID,
  profile_type TEXT,
  full_name TEXT DEFAULT NULL,
  additional_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  new_profile_id UUID;
BEGIN
  -- Validate profile type
  IF profile_type NOT IN ('seller', 'buyer') THEN
    RAISE EXCEPTION 'Invalid profile type: %', profile_type;
  END IF;
  
  -- Check if profile already exists
  IF EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = user_uuid AND profile_type = profile_type
  ) THEN
    RAISE EXCEPTION 'Profile type % already exists for user', profile_type;
  END IF;
  
  -- Insert new profile
  INSERT INTO user_profiles (user_id, profile_type, full_name, preferences)
  VALUES (user_uuid, profile_type, full_name, additional_data)
  RETURNING id INTO new_profile_id;
  
  -- If this is the first profile, make it active
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = user_uuid AND is_active = TRUE
  ) THEN
    UPDATE user_profiles 
    SET is_active = TRUE 
    WHERE id = new_profile_id;
  END IF;
  
  RETURN new_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_active_profile_type(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION switch_user_profile(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, JSONB) TO authenticated;
