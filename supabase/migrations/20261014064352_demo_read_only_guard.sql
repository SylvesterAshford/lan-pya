-- Part 2 of 3 of the 2026-10-14 consistency release; see 20261014064328.

-- 5a. --------------------------------------------------------------------
-- The demo account is shared, so it cannot change itself. The guard fires
-- only when the signed-in user is the seeded demo learner: reviewers,
-- migrations and reset_demo_account() (no session) are unaffected.
create or replace function public.is_demo_session() returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and exists(
    select 1 from public.learner_profiles where user_id = auth.uid() and data_origin = 'seeded_demo'
  );
$$;

create or replace function public.guard_demo_writes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_demo_session() then
    raise exception 'demo account is read-only' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['submissions','submission_versions','learner_path_history','learner_mission_work','milestone_progress','career_preferences','proof_shares'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists demo_read_only on public.%I', t);
      execute format('create trigger demo_read_only before insert or update or delete on public.%I for each row execute function public.guard_demo_writes()', t);
    end if;
  end loop;
end $$;
-- Profiles are inserted at sign-in (bootstrap_user, on conflict do nothing),
-- so only edits are blocked there.
drop trigger if exists demo_read_only on public.learner_profiles;
create trigger demo_read_only before update on public.learner_profiles
  for each row execute function public.guard_demo_writes();

revoke all on function public.guard_demo_writes() from public, anon, authenticated;
grant execute on function public.is_demo_session() to authenticated;
