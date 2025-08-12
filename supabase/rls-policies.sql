-- Example Supabase RLS policies for providers and users
-- Adjust table/column names as needed for your schema

-- Enable RLS on the providers table
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Allow providers to read their own data
CREATE POLICY "Providers can read their own data" ON providers
  FOR SELECT USING (auth.uid() = user_id);

-- Allow providers to update their own data
CREATE POLICY "Providers can update their own data" ON providers
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to read public provider data
CREATE POLICY "Users can read public provider data" ON providers
  FOR SELECT USING (is_public = true);
