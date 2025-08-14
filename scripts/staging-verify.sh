#!/usr/bin/env bash
set -euo pipefail

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "SUPABASE_DB_URL is required"; exit 1
fi

echo "Running verification queries against DB..."

# List the most recent audit logs
psql "$SUPABASE_DB_URL" -c "SELECT id, user_email, action, entity_type, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 10;"

# Count bookings
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) FROM bookings;"

# Check RLS: show policies on users
psql "$SUPABASE_DB_URL" -c "SELECT polname, polpermissive FROM pg_policies WHERE tablename = 'users';"

# Basic HTTP checks (requires STAGING_APP_URL to be set)
if [ -n "${STAGING_APP_URL:-}" ]; then
  echo "Calling admin metrics endpoint"
  curl -s -S -H "Cookie: $ADMIN_COOKIE" "$STAGING_APP_URL/api/admin/metrics" | jq || true
  echo "Simulate provider signup to test rate limit (4 requests)"
  for i in 1 2 3 4; do
    curl -s -H "Content-Type: application/json" -d '{"captchaToken":"test","name":"T","email":"t'"$i"'@example.com"}' "$STAGING_APP_URL/api/provider-signup" | jq || true
  done
fi

echo "Verification complete."
