-- Consent log table for BookLocal
create table if not exists consent_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  scope text not null,
  value boolean not null,
  ua text,
  ip inet,
  created_at timestamptz not null default now()
);

-- RLS: allow insert for all (anon or auth) users
alter table consent_log enable row level security;
create policy "Allow insert for all" on consent_log
  for insert using (true);
