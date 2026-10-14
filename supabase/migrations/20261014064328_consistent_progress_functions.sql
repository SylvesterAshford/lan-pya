-- One story across every screen (founder request, 2026-10-14).
--
-- Each section fixes a place where two parts of the app disagreed:
--   1. The dashboard counted placed stages as finished missions, and counted
--      proofs from every path (live only) as this path's verified work.
--   2. Switching back to a path left its mission marked paused, so Home listed
--      the current mission twice.
--   3. A verified mission could be submitted again, leaving one stage both
--      verified and awaiting review.
--   4. Seeded verified proofs never marked their stage as proven.
--   5. The shared demo account changed whenever anyone used it. It is now
--      read-only for its own session, and reset_demo_account() is the single
--      definition of what it shows (the provisioning script calls it too).
--   6. Video Editor and Brand & Visual Designer get full roadmaps.

-- Part 1 of 3.

-- 1. ---------------------------------------------------------------------
-- completed_missions: this path's stages finished through a mission, whether
-- the link check passed (checked) or a reviewer verified it (proof). Placement
-- is not a mission. verified_count: proofs whose mission is on this path,
-- demo records included, so the level and every screen say the same number.
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
         count(*) filter (where status = 'complete' and source in ('checked', 'proof'))::int as missions,
         count(*)::int as total
  from public.roadmap_milestones milestone
  join active_path path on path.track_id = milestone.track_id
  left join public.milestone_progress milestone_progress on milestone_progress.milestone_id = milestone.id and milestone_progress.user_id = auth.uid()
), verified as (
  select count(*)::int as total
  from public.proof_items proof
  join public.submissions submission on submission.id = proof.submission_id
  join public.mission_definitions mission on mission.id = submission.mission_id
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  join active_path path on path.track_id = milestone.track_id
  where proof.user_id = auth.uid() and proof.state = 'active'
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
    and track.id is distinct from (select track_id from active_path)
)
select jsonb_build_object(
  'active_path', (select jsonb_build_object('key', key, 'title', title, 'description', description, 'availability', availability) from active_path),
  'progress_percent', (select percent from progress),
  'completed_milestones', (select completed from progress),
  'completed_missions', (select missions from progress),
  'total_milestones', (select total from progress),
  'verified_count', (select total from verified),
  'streak_days', 0,
  'xp', (select total from xp),
  'level', greatest(1, floor((select total from xp) / 100.0)::int + 1),
  'xp_to_next', greatest(100 - mod((select total from xp), 100), 0),
  'next_mission', (select jsonb_build_object('key', key, 'title', title, 'brief', brief, 'work_state', coalesce(work_state, 'available'), 'submission_state', submission_state) from next_mission),
  'paused_work', (select items from paused_work)
);
$$;

-- 2. ---------------------------------------------------------------------
-- Returning to a path resumes the work that was paused when you left it.
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

  update public.learner_mission_work work
  set state = 'active', paused_at = null, updated_at = now()
  from public.mission_definitions mission
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  where work.user_id = auth.uid() and work.mission_id = mission.id and milestone.track_id = v_track_id and work.state = 'paused';

  insert into public.learner_path_history(user_id, track_id, state, source, last_activated_at, deactivated_at)
  values(auth.uid(), v_track_id, 'active', case when v_current_track_id is null then 'career_compass' else 'path_switch' end, now(), null)
  on conflict (user_id, track_id) do update
  set state = 'active', source = excluded.source, last_activated_at = now(), deactivated_at = null, updated_at = now();

  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata)
  values(auth.uid(), 'path.activated', 'career_track', v_track_id::text, jsonb_build_object('track_key', trim(p_track_key)));

  return public.get_active_path_dashboard();
end $$;

-- 3. ---------------------------------------------------------------------
-- A verified mission is finished. Submitting it again created a second,
-- competing state for the same stage.
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
  if exists(select 1 from public.submissions where user_id = auth.uid() and mission_id = v_mission and state = 'verified') then
    raise exception 'mission already verified';
  end if;

  insert into public.learner_mission_work(user_id, mission_id, state, paused_at)
  values(auth.uid(), v_mission, 'active', null)
  on conflict (user_id, mission_id) do update set state = 'active', paused_at = null, updated_at = now();

  select id,current_version,attempt,state into v_submission,v_version,v_attempt,v_state from public.submissions where user_id=auth.uid() and mission_id=v_mission and state not in ('verified','rejected','closed') order by updated_at desc limit 1 for update;
  if v_submission is not null and v_state not in ('changes_requested', 'automated_feedback_ready') then raise exception 'active submission exists'; end if;
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

