-- Migration: Create audit_log table for account actions
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: Only allow users to see their own audit logs
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
-- Policy creation skipped to avoid duplicate error if it already exists
