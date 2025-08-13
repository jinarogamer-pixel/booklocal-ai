-- Function: delete all consent logs for a given user (provider or user)
create or replace function public.delete_user_consent_logs(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only service_role may execute this function
  if current_setting('request.jwt.claims', true)::jsonb ->> 'role' <> 'service_role' then
    raise exception 'forbidden';
  end if;

  delete from consent_log where user_id = target_user_id;
end;
$$;

revoke all on function public.delete_user_consent_logs(uuid) from public;
grant execute on function public.delete_user_consent_logs(uuid) to postgres, service_role;
