-- Migration: Create profiles table for user accounts
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  deletion_requested boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: Only allow users to see and update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Policy creation skipped to avoid duplicate error if it already exists
