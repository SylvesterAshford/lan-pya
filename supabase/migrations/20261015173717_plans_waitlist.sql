-- Plans and pricing (founder, 2026-10-15). Paid plans are not on sale yet:
-- there is no payment provider. The pricing page lets a learner join the
-- waitlist for Pro or Career+ (with the billing period they would choose), and
-- lets an employer, university or company send an inquiry. Both are counted
-- on the Admin page, so the founder can see demand before payments are built.
--
--   learner ── join_plan_waitlist(plan, billing) ──▶ plan_waitlist (one row per plan)
--   anyone  ── submit_partner_inquiry(...)      ──▶ partner_inquiries
--   admin   ── get_admin_summary / get_partner_inquiries

-- ─── Learner waitlist ────────────────────────────────────────────────────────

create table if not exists public.plan_waitlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('pro', 'career_plus')),
  billing text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, plan),
  -- Each plan sells two periods: Pro monthly or six months, Career+ monthly or three.
  constraint plan_waitlist_billing_check check (
    (plan = 'pro' and billing in ('monthly', 'six_months'))
    or (plan = 'career_plus' and billing in ('monthly', 'three_months'))
  )
);
alter table public.plan_waitlist enable row level security;
-- A learner reads their own rows so the page can say "You're on the list".
create policy "plan waitlist own select" on public.plan_waitlist
  for select to authenticated using (user_id = auth.uid());

create or replace function public.join_plan_waitlist(p_plan text, p_billing text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if not ((p_plan = 'pro' and p_billing in ('monthly', 'six_months'))
          or (p_plan = 'career_plus' and p_billing in ('monthly', 'three_months'))) then
    raise exception 'invalid plan' using errcode = '22023';
  end if;
  -- The shared demo shows the flow in a pitch but is not demand: nothing is
  -- stored, so the button is fresh for the next pitch and the counts stay real.
  if public.is_demo_session() then
    return jsonb_build_object('joined', true, 'recorded', false, 'plan', p_plan, 'billing', p_billing);
  end if;
  insert into public.plan_waitlist(user_id, plan, billing) values (auth.uid(), p_plan, p_billing)
  on conflict (user_id, plan) do update set billing = excluded.billing, updated_at = now();
  return jsonb_build_object('joined', true, 'recorded', true, 'plan', p_plan, 'billing', p_billing);
end $$;

-- ─── Partner inquiries ───────────────────────────────────────────────────────

-- Employers, universities and companies have no Lan Pya account, so an
-- inquiry can come from a signed-out visitor. Only the definer function below
-- writes here, with length limits and a ten-minute repeat guard per contact.
create table if not exists public.partner_inquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('employer', 'university', 'corporate')),
  organization text not null check (char_length(organization) between 2 and 120),
  contact_name text not null check (char_length(contact_name) between 2 and 80),
  contact text not null check (char_length(contact) between 5 and 120),
  message text check (message is null or char_length(message) <= 1000),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.partner_inquiries enable row level security;

create or replace function public.submit_partner_inquiry(
  p_kind text, p_organization text, p_contact_name text, p_contact text, p_message text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_contact text := trim(coalesce(p_contact, ''));
begin
  if p_kind is null or p_kind not in ('employer', 'university', 'corporate') then
    raise exception 'invalid inquiry' using errcode = '22023';
  end if;
  -- The same contact sending twice within ten minutes is a double tap or a
  -- flood; the first one is already with the team.
  if exists (select 1 from public.partner_inquiries
             where lower(contact) = lower(v_contact) and created_at > now() - interval '10 minutes') then
    return jsonb_build_object('received', true, 'duplicate', true);
  end if;
  insert into public.partner_inquiries(kind, organization, contact_name, contact, message, user_id)
  values (p_kind, trim(p_organization), trim(p_contact_name), v_contact, nullif(trim(coalesce(p_message, '')), ''), auth.uid());
  return jsonb_build_object('received', true, 'duplicate', false);
end $$;

create or replace function public.get_partner_inquiries() returns jsonb
language sql stable security definer set search_path = public as $$
  select case when public.has_role(array['admin']::public.app_role[]) then coalesce((
    select jsonb_agg(jsonb_build_object(
      'kind', kind, 'organization', organization, 'contact_name', contact_name,
      'contact', contact, 'message', message, 'created_at', created_at) order by created_at desc)
    from (select * from public.partner_inquiries order by created_at desc limit 20) latest), '[]'::jsonb)
  else '[]'::jsonb end;
$$;

-- ─── Admin numbers ───────────────────────────────────────────────────────────

create or replace function public.get_admin_summary() returns jsonb language sql stable security definer set search_path=public as $$
select case when public.has_role(array['admin']::public.app_role[]) then jsonb_build_object(
 'review_backlog',(select count(*) from public.submissions where state in ('human_review_queued','automated_inconclusive','automated_skipped') and data_origin='live'),
 'median_review_hours',coalesce((select round(extract(epoch from percentile_cont(.5) within group(order by now()-submitted_at))/3600) from public.submissions where state in ('human_review_queued','human_review_in_progress') and data_origin='live'),0),
 'verified_live',(select count(*) from public.proof_items where state='active' and data_origin='live'),
 'community_reports',(select count(*) from public.community_reports where created_at > now() - interval '30 days'),
 'waitlist_pro',(select count(*) from public.plan_waitlist where plan='pro'),
 'waitlist_career_plus',(select count(*) from public.plan_waitlist where plan='career_plus'),
 'partner_inquiries',(select count(*) from public.partner_inquiries where created_at > now() - interval '30 days')) else '{}'::jsonb end;
$$;

-- ─── Grants ──────────────────────────────────────────────────────────────────

revoke all on function public.join_plan_waitlist(text, text) from public, anon, authenticated;
revoke all on function public.submit_partner_inquiry(text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.get_partner_inquiries() from public, anon, authenticated;
grant execute on function public.join_plan_waitlist(text, text) to authenticated;
-- Partners have no account: the inquiry is open to signed-out visitors.
grant execute on function public.submit_partner_inquiry(text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_partner_inquiries() to authenticated;
revoke all on table public.plan_waitlist from anon;
revoke insert, update, delete on table public.plan_waitlist from authenticated;
revoke all on table public.partner_inquiries from anon, authenticated;
