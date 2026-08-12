create or replace function public.get_today_dashboard()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
select jsonb_build_object(
  'progress_percent', coalesce((
    select round(100.0 * count(*) filter (where status = 'complete') / nullif(count(*), 0))
    from public.milestone_progress
    where user_id = auth.uid()
  ), 0),
  'verified_count', (
    select count(*)
    from public.proof_items
    where user_id = auth.uid() and state = 'active'
  ),
  'streak_days', 0
);
$$;

create or replace function public.get_opportunity_readiness()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with viewer as (
  select coalesce(
    (select data_origin from public.learner_profiles where user_id = auth.uid()),
    'live'::public.data_origin
  ) as data_origin
),
owned as (
  select pc.competency_id
  from public.proof_competencies pc
  join public.proof_items p on p.id = pc.proof_id
  cross join viewer v
  where p.user_id = auth.uid()
    and p.state = 'active'
    and (p.data_origin = 'live' or v.data_origin = 'seeded_demo')
),
calc as (
  select
    o.*,
    count(r.id) filter (where r.requirement_type = 'required') as req,
    count(r.id) filter (where r.requirement_type = 'required' and owned.competency_id is not null) as met,
    coalesce(jsonb_agg(distinct r.label) filter (where r.requirement_type = 'required' and owned.competency_id is not null), '[]') as supported,
    coalesce(jsonb_agg(distinct r.label) filter (where r.requirement_type = 'required' and owned.competency_id is null), '[]') as gaps,
    coalesce(jsonb_agg(distinct r.label) filter (where r.requirement_type = 'unknown'), '[]') as unknown
  from public.opportunities o
  cross join viewer v
  left join public.opportunity_requirements r on r.opportunity_id = o.id
  left join owned on owned.competency_id = r.competency_id
  where o.status = 'published'
    and (o.data_origin = 'live' or v.data_origin = 'seeded_demo')
  group by o.id
)
select coalesce(
  jsonb_agg(
    jsonb_build_object(
      'id', id,
      'title', title,
      'organization', organization,
      'type', type,
      'location', location,
      'deadline', to_char(deadline, 'DD Mon YYYY'),
      'readiness', case
        when jsonb_array_length(unknown) > 0 then 'Cannot determine'
        when req = 0 or met = req then 'Ready now'
        when met > 0 then 'Build toward'
        else 'Explore'
      end,
      'supported', supported,
      'gaps', gaps,
      'unknown', unknown,
      'source_url', source_url,
      'last_verified_at', last_verified_at,
      'data_origin', data_origin
    ) order by deadline nulls last
  ),
  '[]'
)
from calc;
$$;

create or replace function public.request_account_deletion()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  if exists (
    select 1 from public.learner_profiles
    where user_id = auth.uid() and data_origin = 'seeded_demo'
  ) then
    raise exception 'demo account cannot be deleted';
  end if;

  update public.proof_shares set revoked_at = now() where owner_id = auth.uid() and revoked_at is null;
  insert into public.deletion_requests(user_id) values(auth.uid()) returning id into v_id;
  insert into public.audit_events(actor_id, action, entity_type, entity_id) values(auth.uid(), 'account.deletion_requested', 'deletion_request', v_id::text);
  return v_id;
end;
$$;
