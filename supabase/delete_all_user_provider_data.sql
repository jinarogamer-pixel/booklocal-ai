-- Add user_id to bids, projects, waitlist and set up FKs
alter table if exists bids add column if not exists user_id uuid references users(id) on delete cascade;
alter table if exists projects add column if not exists user_id uuid references users(id) on delete cascade;
alter table if exists waitlist add column if not exists user_id uuid references users(id) on delete cascade;

-- Secure function to delete all user data (except providers)
create or replace function public.delete_user_data(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claims', true)::jsonb ->> 'role' <> 'service_role' then
    raise exception 'forbidden';
  end if;

  delete from consent_log where user_id = target_user_id;
  delete from bids where user_id = target_user_id;
  delete from projects where user_id = target_user_id;
  delete from waitlist where user_id = target_user_id;
  delete from users where id = target_user_id;
end;
$$;

revoke all on function public.delete_user_data(uuid) from public;
grant execute on function public.delete_user_data(uuid) to postgres, service_role;

-- Secure function to delete a provider (and their consent logs)
create or replace function public.delete_provider_data(target_provider_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claims', true)::jsonb ->> 'role' <> 'service_role' then
    raise exception 'forbidden';
  end if;

  delete from consent_log where user_id = target_provider_id;
  delete from providers where uuid = target_provider_id;
end;
$$;

revoke all on function public.delete_provider_data(uuid) from public;
grant execute on function public.delete_provider_data(uuid) to postgres, service_role;
