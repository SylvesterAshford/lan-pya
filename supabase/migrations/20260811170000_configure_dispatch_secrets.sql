create or replace function public.configure_evaluation_dispatch(
  p_project_url text,
  p_cron_secret text
) returns void
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'service role required';
  end if;

  delete from vault.secrets where name in ('project_url', 'cron_secret');
  perform vault.create_secret(p_project_url, 'project_url');
  perform vault.create_secret(p_cron_secret, 'cron_secret');
end;
$$;

revoke all on function public.configure_evaluation_dispatch(text, text) from public, anon, authenticated;
grant execute on function public.configure_evaluation_dispatch(text, text) to service_role;
