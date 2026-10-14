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

-- 6. ---------------------------------------------------------------------
insert into public.career_tracks(id, key, title, description, version, data_origin, availability) values
('50000000-0000-0000-0000-000000000001', 'video-editor', 'Video Editor & Motion Content', 'Turn raw footage into clear, accessible stories for modern platforms.', 1, 'live', 'preview'),
('51000000-0000-0000-0000-000000000001', 'brand-visual-designer', 'Brand & Visual Content Designer', 'Solve communication problems with accessible visual systems, not isolated decoration.', 1, 'live', 'preview')
on conflict (key) do update set title = excluded.title, description = excluded.description;

insert into public.roadmap_milestones(id, track_id, key, position, title, description, proof_label)
select v.id::uuid, t.id, v.key, v.position, v.title, v.description, v.proof_label
from (values
  ('50100000-0000-0000-0000-000000000001', 'video-editor', 'video-editing-workflow', 1, 'Editing workflow', 'Set up footage, formats and a project structure that keep an edit fast and recoverable.', 'Organised edit project'),
  ('50100000-0000-0000-0000-000000000002', 'video-editor', 'video-cuts-pacing', 2, 'Cuts and pacing', 'Shape raw footage into a story with a clear hook, rhythm and continuity.', 'Two-minute story cut'),
  ('50100000-0000-0000-0000-000000000003', 'video-editor', 'video-sound-colour', 3, 'Sound and colour', 'Clean dialogue, set levels, use licensed music, and correct then grade colour so shots match.', 'Mixed and graded sequence'),
  ('50100000-0000-0000-0000-000000000004', 'video-editor', 'video-captions-motion', 4, 'Captions and motion', 'Add accurate captions, readable titles and restrained motion for vertical platforms.', 'Thirty-second vertical story edit'),
  ('50100000-0000-0000-0000-000000000005', 'video-editor', 'video-client-delivery', 5, 'Client-ready delivery', 'Deliver platform versions from a brief, handle feedback rounds, and clear rights.', 'Client-ready edit and case study'),
  ('51100000-0000-0000-0000-000000000001', 'brand-visual-designer', 'visual-problem-framing', 1, 'Visual problem framing', 'Turn a brief into a clear communication problem, audience and set of constraints.', 'Visual brief and moodboard'),
  ('51100000-0000-0000-0000-000000000002', 'brand-visual-designer', 'visual-type-hierarchy', 2, 'Type and hierarchy', 'Choose and set type so the most important message reads first, on any screen.', 'Typographic poster'),
  ('51100000-0000-0000-0000-000000000003', 'brand-visual-designer', 'visual-colour-composition', 3, 'Colour and composition', 'Use accessible colour, balance and cropping to direct attention.', 'Social post series'),
  ('51100000-0000-0000-0000-000000000004', 'brand-visual-designer', 'visual-campaign-systems', 4, 'Campaign systems', 'Build reusable rules and components that hold together across formats.', 'Mini campaign identity kit'),
  ('51100000-0000-0000-0000-000000000005', 'brand-visual-designer', 'visual-case-study', 5, 'Client-ready case study', 'Explain the process and decisions, and hand off files others can use.', 'Client-ready design case study')
) as v(id, track_key, key, position, title, description, proof_label)
join public.career_tracks t on t.key = v.track_key
on conflict (track_id, key) do update set position = excluded.position, title = excluded.title, description = excluded.description, proof_label = excluded.proof_label;

-- Frontend has been operational in production since August, set by hand; no
-- migration said so, which left every local database disagreeing with it.
update public.career_tracks set availability = 'operational' where key = 'frontend-developer';

-- 4 + 2 backfills, every learner. ----------------------------------------
-- A stage holding a verified, standing proof is proven.
insert into public.milestone_progress(user_id, milestone_id, status, source)
select proof.user_id, mission.milestone_id, 'complete', 'proof'
from public.proof_items proof
join public.submissions submission on submission.id = proof.submission_id and submission.state = 'verified'
join public.mission_definitions mission on mission.id = submission.mission_id
where proof.state = 'active'
on conflict (user_id, milestone_id) do update set status = 'complete', source = 'proof', updated_at = now();

-- Work on a learner's active path is not paused.
update public.learner_mission_work work
set state = 'active', paused_at = null, updated_at = now()
from public.mission_definitions mission
join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
join public.learner_path_history history on history.track_id = milestone.track_id and history.state = 'active'
where work.mission_id = mission.id and work.user_id = history.user_id and work.state = 'paused';

-- 5b. --------------------------------------------------------------------
-- The demo story. Frontend Developer is the active path: stages 1-2 placed by
-- the skills check, stage 3 verified (Responsive Profile Card), standing on
-- stage 4. Content Creator is the previous path: stage 1 verified
-- (Three-piece awareness campaign), position at stage 2. Anything anyone
-- added through the shared account is removed.
create or replace function public.reset_demo_account() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid;
  v_fe_track uuid; v_cc_track uuid;
  v_fe_mission uuid := '12000000-0000-0000-0000-000000000001';
  v_cc_mission uuid := '42000000-0000-0000-0000-000000000001';
  v_fe_submission uuid := '16200000-0000-0000-0000-000000000001';
  v_cc_submission uuid := '16600000-0000-0000-0000-000000000001';
  v_fe_proof uuid := '16400000-0000-0000-0000-000000000001';
  v_cc_proof uuid := '16700000-0000-0000-0000-000000000001';
begin
  select user_id into v_user from public.learner_profiles where data_origin = 'seeded_demo' order by user_id limit 1;
  if v_user is null then return jsonb_build_object('reset', false, 'reason', 'no demo profile'); end if;
  select id into v_fe_track from public.career_tracks where key = 'frontend-developer';
  select id into v_cc_track from public.career_tracks where key = 'content-creator';

  update public.learner_profiles set alias = 'Thura', locale = 'en', goal = 'Frontend Developer', onboarding_complete = true where user_id = v_user;

  -- Work added through the shared account, and anything hanging off it.
  delete from public.proof_items where user_id = v_user and submission_id not in (v_fe_submission, v_cc_submission);
  delete from public.career_quest_xp where user_id = v_user and submission_id not in (v_fe_submission, v_cc_submission);
  delete from public.submissions where user_id = v_user and id not in (v_fe_submission, v_cc_submission);

  -- The two seeded, verified missions.
  insert into public.submissions(id, user_id, mission_id, state, attempt, current_version, data_origin) values
    (v_fe_submission, v_user, v_fe_mission, 'verified', 1, 1, 'seeded_demo'),
    (v_cc_submission, v_user, v_cc_mission, 'verified', 1, 1, 'seeded_demo')
  on conflict (id) do update set state = 'verified', current_version = 1, data_origin = 'seeded_demo';
  insert into public.submission_versions(submission_id, version, repository_url, deployment_url, screenshot_url, reflection, immutable_payload_hash) values
    (v_fe_submission, 1, 'https://github.com/example/responsive-profile-card', 'https://example.com/responsive-profile-card', null,
     'This prepared demo record shows how responsive layout, semantic HTML, and accessible structure become one inspectable proof item.', 'demo-responsive-profile-card-v1'),
    (v_cc_submission, 1, 'https://example.com/lan-pya-demo/audience-brief', 'https://example.com/lan-pya-demo/campaign', null,
     'A prepared demo record: one named audience, evidence for the problem, and the campaign direction that followed from it.', 'demo-content-awareness-v1')
  on conflict (submission_id, version) do nothing;

  insert into public.proof_items(id, user_id, submission_id, state, snapshot, verified_at, data_origin) values
    (v_fe_proof, v_user, v_fe_submission, 'active', jsonb_build_object(
      'title', 'Responsive Profile Card', 'rubric_version', 'responsive-profile-card-rubric-v1', 'reviewer_tier', 'Prepared demo review',
      'competencies', jsonb_build_array('Semantic HTML', 'Responsive CSS', 'Accessible structure'),
      'repository_url', 'https://github.com/example/responsive-profile-card', 'deployment_url', 'https://example.com/responsive-profile-card'),
     '2026-08-10T10:00:00Z', 'seeded_demo'),
    (v_cc_proof, v_user, v_cc_submission, 'active', jsonb_build_object(
      'title', 'Three-piece awareness campaign', 'rubric_version', 'content-creator-awareness-rubric-v1', 'reviewer_tier', 'Prepared demo review',
      'competencies', jsonb_build_array('Audience research', 'Content strategy', 'Accessible publishing', 'Ethical communication'),
      'repository_url', 'https://example.com/lan-pya-demo/audience-brief', 'deployment_url', 'https://example.com/lan-pya-demo/campaign'),
     '2026-08-12T09:00:00Z', 'seeded_demo')
  on conflict (id) do update set state = 'active', snapshot = excluded.snapshot;

  insert into public.career_quest_xp(user_id, submission_id, track_id, amount, reason) values
    (v_user, v_fe_submission, v_fe_track, 100, 'verified_core_mission'),
    (v_user, v_cc_submission, v_cc_track, 100, 'verified_core_mission')
  on conflict (submission_id) do update set amount = 100, track_id = excluded.track_id;

  -- Paths: Frontend now, Content Creator before.
  delete from public.learner_path_history where user_id = v_user;
  insert into public.learner_path_history(user_id, track_id, state, source, last_activated_at, deactivated_at) values
    (v_user, v_cc_track, 'previous', 'career_compass', '2026-08-12T09:00:00Z', '2026-08-13T09:00:00Z'),
    (v_user, v_fe_track, 'active', 'path_switch', '2026-08-13T09:00:00Z', null);

  delete from public.learner_mission_work where user_id = v_user;
  insert into public.learner_mission_work(user_id, mission_id, state, paused_at) values
    (v_user, v_fe_mission, 'active', null),
    (v_user, v_cc_mission, 'paused', '2026-08-13T09:00:00Z');

  -- Positions on both maps.
  delete from public.milestone_progress where user_id = v_user;
  insert into public.milestone_progress(user_id, milestone_id, status, source)
  select v_user, m.id,
    case when m.position <= 3 then 'complete' when m.position = 4 then 'active' when m.position = 5 then 'next' else 'upcoming' end,
    case when m.position = 3 then 'proof' else 'placement' end
  from public.roadmap_milestones m where m.track_id = v_fe_track;
  insert into public.milestone_progress(user_id, milestone_id, status, source)
  select v_user, m.id,
    case when m.position = 1 then 'complete' when m.position = 2 then 'active' when m.position = 3 then 'next' else 'upcoming' end,
    case when m.position = 1 then 'proof' else 'placement' end
  from public.roadmap_milestones m where m.track_id = v_cc_track;

  return jsonb_build_object('reset', true);
end $$;

revoke all on function public.reset_demo_account() from public, anon, authenticated;
grant execute on function public.reset_demo_account() to service_role;
revoke all on function public.guard_demo_writes() from public, anon, authenticated;
grant execute on function public.is_demo_session() to authenticated;

select public.reset_demo_account();
