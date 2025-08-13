

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  deletion_requested boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.consent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);
-- ...existing migration SQL...
