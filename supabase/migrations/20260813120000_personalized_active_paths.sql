-- Personalized paths: one active, eligible career path per learner.
-- Work context is deliberately separate from a submission's review lifecycle.

alter table public.career_tracks
  add column if not exists availability text not null default 'preview'
  check (availability in ('operational', 'controlled_pilot', 'preview'));

update public.career_tracks
set availability = case
  when key = 'frontend-developer' then 'operational'
  when key = 'content-creator' then 'controlled_pilot'
  else 'preview'
end;

create table if not exists public.career_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  interests text[] not null default '{}',
  preferred_work text not null default 'not_sure' check (preferred_work in ('make', 'explain', 'design', 'analyze', 'organize', 'grow', 'not_sure')),
  immediate_goal text not null default 'not_sure' check (immediate_goal in ('explore', 'freelance', 'internship', 'portfolio', 'first_job', 'not_sure')),
  device_access text not null default 'not_sure' check (device_access in ('phone_only', 'phone_and_laptop', 'laptop', 'not_sure')),
  connectivity text not null default 'not_sure' check (connectivity in ('reliable', 'limited', 'not_sure')),
  prior_experience text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.learner_path_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.career_tracks(id),
  state text not null default 'active' check (state in ('active', 'previous')),
  source text not null default 'career_compass' check (source in ('career_compass', 'path_switch', 'migrated')),
  first_selected_at timestamptz not null default now(),
  last_activated_at timestamptz not null default now(),
  deactivated_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, track_id)
);

create unique index if not exists one_active_path_per_learner
  on public.learner_path_history(user_id) where state = 'active';

create table if not exists public.learner_mission_work (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid not null references public.mission_definitions(id) on delete cascade,
  state text not null default 'active' check (state in ('active', 'paused')),
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, mission_id)
);

alter table public.career_preferences enable row level security;
alter table public.learner_path_history enable row level security;
alter table public.learner_mission_work enable row level security;

create policy "preferences own read" on public.career_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy "preferences own write" on public.career_preferences for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "path history own read" on public.learner_path_history for select to authenticated using ((select auth.uid()) = user_id);
create policy "mission work own read" on public.learner_mission_work for select to authenticated using ((select auth.uid()) = user_id);

-- Preserve the current product's users while moving the default from an implicit
-- frontend assumption to an explicit path assignment.
insert into public.learner_path_history(user_id, track_id, state, source)
select profile.user_id, track.id, 'active', 'migrated'
from public.learner_profiles profile
join public.career_tracks track on track.key = 'frontend-developer'
on conflict (user_id, track_id) do nothing;

insert into public.learner_mission_work(user_id, mission_id, state, started_at)
select submission.user_id,
       submission.mission_id,
       case when path.state = 'active' then 'active' else 'paused' end,
       submission.submitted_at
from public.submissions submission
join public.mission_definitions mission on mission.id = submission.mission_id
join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
left join public.learner_path_history path on path.user_id = submission.user_id and path.track_id = milestone.track_id
where submission.state not in ('verified', 'rejected', 'closed')
on conflict (user_id, mission_id) do nothing;

alter table public.career_quest_xp add column if not exists track_id uuid references public.career_tracks(id);

update public.career_quest_xp xp
set track_id = track.id
from public.submissions submission
join public.mission_definitions mission on mission.id = submission.mission_id
join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
join public.career_tracks track on track.id = milestone.track_id
where submission.id = xp.submission_id and xp.track_id is null;

alter table public.career_quest_xp alter column track_id set not null;
create index if not exists career_quest_xp_user_track_idx on public.career_quest_xp(user_id, track_id);

create or replace function public.get_active_path_dashboard()
returns jsonb language sql stable security definer set search_path=public as $$
with active_path as (
  select history.id as history_id, track.id as track_id, track.key, track.title, track.description, track.availability
  from public.learner_path_history history
  join public.career_tracks track on track.id = history.track_id
  where history.user_id = auth.uid() and history.state = 'active'
), progress as (
  select coalesce(round(100.0 * count(*) filter (where status = 'complete') / nullif(count(*), 0)), 0)::int as percent,
         count(*) filter (where status = 'complete')::int as completed,
         count(*)::int as total
  from public.roadmap_milestones milestone
  join active_path path on path.track_id = milestone.track_id
  left join public.milestone_progress milestone_progress on milestone_progress.milestone_id = milestone.id and milestone_progress.user_id = auth.uid()
), xp as (
  select coalesce(sum(xp.amount), 0)::int as total
  from public.career_quest_xp xp
  join active_path path on path.track_id = xp.track_id
  where xp.user_id = auth.uid()
), next_mission as (
  select mission.key, mission.title, mission.brief, work.state as work_state,
         submission.state as submission_state
  from public.mission_definitions mission
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  join active_path path on path.track_id = milestone.track_id
  left join public.learner_mission_work work on work.mission_id = mission.id and work.user_id = auth.uid()
  left join lateral (
    select state from public.submissions
    where user_id = auth.uid() and mission_id = mission.id
    order by updated_at desc limit 1
  ) submission on true
  where mission.active
  order by case work.state when 'active' then 0 when 'paused' then 1 else 2 end, milestone.position, mission.version desc
  limit 1
), paused_work as (
  select coalesce(jsonb_agg(jsonb_build_object('mission_key', mission.key, 'mission_title', mission.title, 'path_key', track.key, 'path_title', track.title) order by work.updated_at desc), '[]'::jsonb) as items
  from public.learner_mission_work work
  join public.mission_definitions mission on mission.id = work.mission_id
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  join public.career_tracks track on track.id = milestone.track_id
  where work.user_id = auth.uid() and work.state = 'paused'
)
select jsonb_build_object(
  'active_path', (select jsonb_build_object('key', key, 'title', title, 'description', description, 'availability', availability) from active_path),
  'progress_percent', (select percent from progress),
  'completed_milestones', (select completed from progress),
  'total_milestones', (select total from progress),
  'verified_count', (select count(*)::int from public.proof_items where user_id = auth.uid() and state = 'active' and data_origin = 'live'),
  'streak_days', 0,
  'xp', (select total from xp),
  'level', greatest(1, floor((select total from xp) / 100.0)::int + 1),
  'xp_to_next', greatest(100 - mod((select total from xp), 100), 0),
  'next_mission', (select jsonb_build_object('key', key, 'title', title, 'brief', brief, 'work_state', coalesce(work_state, 'available'), 'submission_state', submission_state) from next_mission),
  'paused_work', (select items from paused_work)
);
$$;

create or replace function public.switch_active_path(p_track_key text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_track_id uuid;
  v_availability text;
  v_current_track_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;

  select id, availability into v_track_id, v_availability
  from public.career_tracks
  where key = trim(p_track_key) and active
  for update;

  if v_track_id is null then raise exception 'path not found'; end if;
  if v_availability = 'preview' then raise exception 'path is not available yet'; end if;
  if not exists (
    select 1
    from public.mission_definitions mission
    join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
    where milestone.track_id = v_track_id and mission.active
  ) then raise exception 'path has no available mission'; end if;

  perform 1 from public.learner_path_history where user_id = auth.uid() for update;
  select track_id into v_current_track_id
  from public.learner_path_history
  where user_id = auth.uid() and state = 'active';

  if v_current_track_id = v_track_id then return public.get_active_path_dashboard(); end if;

  update public.learner_path_history
  set state = 'previous', deactivated_at = now(), updated_at = now()
  where user_id = auth.uid() and state = 'active';

  update public.learner_mission_work work
  set state = 'paused', paused_at = now(), updated_at = now()
  from public.mission_definitions mission
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  where work.user_id = auth.uid() and work.mission_id = mission.id and milestone.track_id = v_current_track_id and work.state = 'active';

  insert into public.learner_path_history(user_id, track_id, state, source, last_activated_at, deactivated_at)
  values(auth.uid(), v_track_id, 'active', case when v_current_track_id is null then 'career_compass' else 'path_switch' end, now(), null)
  on conflict (user_id, track_id) do update
  set state = 'active', source = excluded.source, last_activated_at = now(), deactivated_at = null, updated_at = now();

  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata)
  values(auth.uid(), 'path.activated', 'career_track', v_track_id::text, jsonb_build_object('track_key', trim(p_track_key)));

  return public.get_active_path_dashboard();
end $$;

create or replace function public.start_mission_work(p_mission_key text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_mission_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select mission.id into v_mission_id
  from public.mission_definitions mission
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  join public.learner_path_history path on path.track_id = milestone.track_id and path.user_id = auth.uid() and path.state = 'active'
  join public.career_tracks track on track.id = milestone.track_id and track.availability in ('operational', 'controlled_pilot')
  where mission.key = trim(p_mission_key) and mission.active
  order by mission.version desc
  limit 1;

  if v_mission_id is null then raise exception 'mission is not on your active path'; end if;

  insert into public.learner_mission_work(user_id, mission_id, state, paused_at)
  values(auth.uid(), v_mission_id, 'active', null)
  on conflict (user_id, mission_id) do update set state = 'active', paused_at = null, updated_at = now();

  insert into public.audit_events(actor_id, action, entity_type, entity_id)
  values(auth.uid(), 'mission.started', 'mission_definition', v_mission_id::text);

  return public.get_active_path_dashboard();
end $$;

create or replace function public.save_career_compass(
  p_alias text,
  p_locale text,
  p_weekly_hours text,
  p_interests text[],
  p_preferred_work text,
  p_immediate_goal text,
  p_device_access text,
  p_connectivity text,
  p_prior_experience text[],
  p_selected_track_key text default null,
  p_confirm boolean default false,
  p_consent_version text default null
)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if char_length(trim(p_alias)) not between 1 and 60 then raise exception 'invalid alias'; end if;
  if p_locale not in ('en', 'my') then raise exception 'invalid locale'; end if;
  if p_weekly_hours not in ('2–3 hours', '4–6 hours', '7+ hours') then raise exception 'invalid weekly hours'; end if;
  if p_preferred_work not in ('make', 'explain', 'design', 'analyze', 'organize', 'grow', 'not_sure') then raise exception 'invalid preferred work'; end if;
  if p_immediate_goal not in ('explore', 'freelance', 'internship', 'portfolio', 'first_job', 'not_sure') then raise exception 'invalid immediate goal'; end if;
  if p_device_access not in ('phone_only', 'phone_and_laptop', 'laptop', 'not_sure') then raise exception 'invalid device access'; end if;
  if p_connectivity not in ('reliable', 'limited', 'not_sure') then raise exception 'invalid connectivity'; end if;
  if coalesce(cardinality(p_interests), 0) > 3 or coalesce(cardinality(p_prior_experience), 0) > 10 then raise exception 'too many selections'; end if;

  insert into public.learner_profiles(user_id, alias, locale, weekly_hours, onboarding_complete)
  values(auth.uid(), trim(p_alias), p_locale, p_weekly_hours, p_confirm)
  on conflict (user_id) do update
  set alias = excluded.alias,
      locale = excluded.locale,
      weekly_hours = excluded.weekly_hours,
      onboarding_complete = case when p_confirm then true else learner_profiles.onboarding_complete end,
      updated_at = now();

  insert into public.career_preferences(user_id, interests, preferred_work, immediate_goal, device_access, connectivity, prior_experience)
  values(auth.uid(), coalesce(p_interests, '{}'), p_preferred_work, p_immediate_goal, p_device_access, p_connectivity, coalesce(p_prior_experience, '{}'))
  on conflict (user_id) do update
  set interests = excluded.interests,
      preferred_work = excluded.preferred_work,
      immediate_goal = excluded.immediate_goal,
      device_access = excluded.device_access,
      connectivity = excluded.connectivity,
      prior_experience = excluded.prior_experience,
      updated_at = now();

  if p_confirm then
    if p_selected_track_key is null then raise exception 'choose a path'; end if;
    if p_consent_version is null then raise exception 'privacy consent is required'; end if;
    perform public.switch_active_path(p_selected_track_key);
    insert into public.memberships(user_id, role) values(auth.uid(), 'learner') on conflict do nothing;
    insert into public.consent_records(user_id, policy_version, granted) values(auth.uid(), p_consent_version, true);
    insert into public.audit_events(actor_id, action, entity_type, entity_id)
    values(auth.uid(), 'career_compass.completed', 'learner_profile', auth.uid()::text);
  end if;

  return public.get_active_path_dashboard();
end $$;

create or replace function public.submit_mission(p_mission_key text,p_repository_url text,p_deployment_url text,p_screenshot_url text,p_reflection text)
returns uuid language plpgsql security definer set search_path=public,pgmq as $$
declare
  v_mission uuid; v_submission uuid; v_hash text; v_job uuid; v_version int; v_attempt int; v_state public.submission_state;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select mission.id into v_mission
  from public.mission_definitions mission
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  join public.learner_path_history path on path.track_id = milestone.track_id and path.user_id = auth.uid() and path.state = 'active'
  join public.career_tracks track on track.id = milestone.track_id and track.availability in ('operational', 'controlled_pilot')
  where mission.key = p_mission_key and mission.active
  order by mission.version desc limit 1;
  if v_mission is null then raise exception 'mission is not on your active path'; end if;

  insert into public.learner_mission_work(user_id, mission_id, state, paused_at)
  values(auth.uid(), v_mission, 'active', null)
  on conflict (user_id, mission_id) do update set state = 'active', paused_at = null, updated_at = now();

  select id,current_version,attempt,state into v_submission,v_version,v_attempt,v_state from public.submissions where user_id=auth.uid() and mission_id=v_mission and state not in ('verified','rejected','closed') order by updated_at desc limit 1 for update;
  if v_submission is not null and v_state <> 'changes_requested' then raise exception 'active submission exists'; end if;
  v_hash := encode(extensions.digest(p_repository_url||'|'||p_deployment_url||'|'||coalesce(p_screenshot_url,'')||'|'||p_reflection,'sha256'),'hex');
  if v_submission is null then
    v_version := 1; v_attempt := 1;
    insert into public.submissions(user_id,mission_id,state,attempt,current_version) values(auth.uid(),v_mission,'submitted',v_attempt,v_version) returning id into v_submission;
  else
    v_version := v_version + 1; v_attempt := v_attempt + 1;
    update public.submissions set state='submitted',attempt=v_attempt,current_version=v_version,updated_at=now() where id=v_submission;
  end if;
  insert into public.submission_versions(submission_id,version,repository_url,deployment_url,screenshot_url,reflection,immutable_payload_hash) values(v_submission,v_version,p_repository_url,p_deployment_url,p_screenshot_url,p_reflection,v_hash);
  insert into public.evaluation_jobs(submission_id,status,attempts,available_at,locked_at,last_error) values(v_submission,'queued',0,now(),null,null)
    on conflict (submission_id) do update set status='queued',attempts=0,available_at=now(),locked_at=null,last_error=null,updated_at=now() returning id into v_job;
  perform pgmq.send('evaluation_jobs',jsonb_build_object('job_id',v_job,'submission_id',v_submission,'version',v_version));
  update public.submissions set state='deterministic_running',updated_at=now() where id=v_submission;
  insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),case when v_attempt=1 then 'submission.created' else 'submission.revised' end,'submission',v_submission::text,jsonb_build_object('mission_key',p_mission_key,'version',v_version));
  return v_submission;
end $$;

create or replace function public.record_review_decision(p_submission_id uuid,p_action text,p_notes text,p_rubric_scores jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_review uuid; v_proof uuid; v_snapshot jsonb; v_owner uuid; v_mission_key text; v_rubric text; v_competencies text[]; v_track_id uuid;
begin
  if not public.has_role(array['reviewer','reviewer_lead']::public.app_role[]) then raise exception 'permission denied'; end if;
  if p_action not in ('verify','request_changes','reject') or char_length(trim(p_notes))<20 then raise exception 'invalid decision'; end if;
  if not exists(select 1 from public.review_assignments assignment join public.submissions submission on submission.id=assignment.submission_id where assignment.submission_id=p_submission_id and assignment.reviewer_id=auth.uid() and assignment.status='claimed' and submission.state='human_review_in_progress' and submission.user_id<>auth.uid()) then raise exception 'submission not claimed'; end if;

  select submission.user_id,mission.key,milestone.track_id,
    case when mission.key='content-creator-awareness' then 'content-creator-awareness-rubric-v1' else 'responsive-profile-card-rubric-v1' end,
    case when mission.key='content-creator-awareness' then array['audience-research','content-strategy','accessible-publishing','ethical-communication'] else array['semantic-html','responsive-css','accessible-structure'] end,
    jsonb_build_object('title',mission.title,'rubric_version',case when mission.key='content-creator-awareness' then 'content-creator-awareness-rubric-v1' else 'responsive-profile-card-rubric-v1' end,'reviewer_tier','Trained human reviewer','competencies',coalesce((select jsonb_agg(competency.label order by competency.label) from public.competencies competency where competency.key=any(case when mission.key='content-creator-awareness' then array['audience-research','content-strategy','accessible-publishing','ethical-communication'] else array['semantic-html','responsive-css','accessible-structure'] end)),'[]'::jsonb),'repository_url',version.repository_url,'deployment_url',version.deployment_url)
  into v_owner,v_mission_key,v_track_id,v_rubric,v_competencies,v_snapshot
  from public.submissions submission
  join public.mission_definitions mission on mission.id=submission.mission_id
  join public.roadmap_milestones milestone on milestone.id=mission.milestone_id
  join public.submission_versions version on version.submission_id=submission.id and version.version=submission.current_version
  where submission.id=p_submission_id for update;

  insert into public.human_reviews(submission_id,reviewer_id,rubric_version,rubric_scores,decision,notes) values(p_submission_id,auth.uid(),v_rubric,p_rubric_scores,p_action,trim(p_notes)) returning id into v_review;
  update public.review_assignments set status='completed',completed_at=now() where submission_id=p_submission_id and reviewer_id=auth.uid() and status='claimed';
  update public.submissions set state=case p_action when 'verify' then 'verified'::public.submission_state when 'request_changes' then 'changes_requested'::public.submission_state else 'rejected'::public.submission_state end,updated_at=now() where id=p_submission_id;
  if p_action='verify' then
    insert into public.proof_items(user_id,submission_id,snapshot) values(v_owner,p_submission_id,v_snapshot) returning id into v_proof;
    insert into public.proof_competencies(proof_id,competency_id) select v_proof,id from public.competencies where key=any(v_competencies);
    insert into public.milestone_progress(user_id,milestone_id,status,source) select v_owner,milestone_id,'complete','proof' from public.mission_definitions where key=v_mission_key and active on conflict(user_id,milestone_id) do update set status='complete',source='proof',updated_at=now();
    insert into public.career_quest_xp(user_id,submission_id,track_id,amount,reason) values(v_owner,p_submission_id,v_track_id,100,'verified_core_mission') on conflict(submission_id) do nothing;
  end if;
  insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'review.'||p_action,'submission',p_submission_id::text,jsonb_build_object('review_id',v_review,'mission_key',v_mission_key));
  return v_review;
end $$;

revoke execute on function public.get_active_path_dashboard() from public, anon;
revoke execute on function public.switch_active_path(text) from public, anon;
revoke execute on function public.start_mission_work(text) from public, anon;
revoke execute on function public.save_career_compass(text,text,text,text[],text,text,text,text,text[],text,boolean,text) from public, anon;
revoke execute on function public.submit_mission(text,text,text,text,text) from public, anon;
revoke execute on function public.record_review_decision(uuid,text,text,jsonb) from public, anon;

grant execute on function public.get_active_path_dashboard() to authenticated;
grant execute on function public.switch_active_path(text) to authenticated;
grant execute on function public.start_mission_work(text) to authenticated;
grant execute on function public.save_career_compass(text,text,text,text[],text,text,text,text,text[],text,boolean,text) to authenticated;
grant execute on function public.submit_mission(text,text,text,text,text) to authenticated;
grant execute on function public.record_review_decision(uuid,text,text,jsonb) to authenticated;
