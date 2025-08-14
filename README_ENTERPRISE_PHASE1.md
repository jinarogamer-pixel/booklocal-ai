Enterprise Phase 1 - Runbook

Overview
--------
This runbook covers applying the enterprise database migration, enabling RLS/audit logging, adding Upstash rate limiting, and deploying admin metrics UI.

Pre-reqs
-------
- Staging Supabase project
- SUPABASE_SERVICE_ROLE_KEY for running migrations (server-only)
- UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN
- STRIPE keys, NEXTAUTH_SECRET, Google OAuth creds for SSO

Applying migrations (manual)
---------------------------
1. In Supabase dashboard -> SQL Editor, open `supabase/migrations/2025-08-14_enterprise_schema.sql`.
2. Run the migration in sections: core tables -> audit logs -> RLS -> functions -> triggers -> indexes -> grants.
3. Verify tables exist in Table Editor.

Applying migrations (CLI)
-------------------------
1. Install Supabase CLI and login: `supabase login`
2. Link project: `supabase link --project-ref <project-ref>`
3. Apply migration: `supabase db push`

Rollback & backups
------------------
- Take a pg_dump backup before running migrations.
- To rollback, restore from the dump using `pg_restore` or run the inverse migrations (if available).

Testing checklist
----------------
- Create test users and test RLS policies.
- Verify audit_logs entries for inserts/updates/deletes.
- Test rate limiting by simulating request floods.
- Confirm admin metrics endpoint returns expected numbers.

CI/CD
-----
- Add GitHub Actions with secrets: SUPABASE_SERVICE_ROLE_KEY, UPSTASH_*, STRIPE_*, NEXTAUTH_SECRET.
- Run lint & typecheck on PRs.

Security
--------
- Rotate any keys exposed publicly.
- Ensure service keys are only in server secret stores.

Contact
-------
For help running these steps, provide Supabase staging project ref and service-role key and I can run the migrations for you.
