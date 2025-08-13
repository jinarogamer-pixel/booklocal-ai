-- Migration: Create bookings table with RLS
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  provider_id uuid NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: Only allow users to see and create their own bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_own_bookings ON bookings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY insert_own_bookings ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());
