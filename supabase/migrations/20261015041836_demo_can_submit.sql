-- The demo account can submit a mission (founder decision, 2026-10-15).
--
-- The submission flow is the part of the product a pitch most needs to show,
-- and the read-only guard stopped it at the last button. The guard now leaves
-- submissions alone; the Career Compass and proof sharing stay blocked.
-- Everything the demo submits is removed by reset_demo_account(), which runs
-- every night and, from this change, whenever the demo itself asks for it.
--
-- Three more things make the flow show well in a few seconds:
--   1. submit_mission starts the link check at once instead of waiting for
--      the once-a-minute cron (true for every learner, not only the demo).
--   2. The demo's Video Editor story starts on stage 1, the stage with the
--      path's mission, so submitting it moves the traveller to stage 2.
--   3. reset_my_demo() lets the demo account put its own story back, so a
--      pitch can be rehearsed and then given.

drop trigger if exists demo_read_only on public.submissions;
drop trigger if exists demo_read_only on public.submission_versions;

create or replace function public.submit_mission(p_mission_key text, p_repository_url text, p_deployment_url text, p_screenshot_url text, p_reflection text)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public', 'pgmq'
as $function$
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
  -- Start the link check now rather than at the next cron tick. pg_net sends
  -- the request after this transaction commits, so the job is visible to the
  -- worker; the cron job stays as the fallback. Never fails the submission.
  perform public.dispatch_evaluation_processor();
  return v_submission;
end $function$;

create or replace function public.reset_demo_account()
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
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

  update public.learner_profiles set alias = 'Thura', headline = null, avatar = 'traveller-f', locale = 'en', goal = 'Frontend Developer', onboarding_complete = true where user_id = v_user;

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

  -- Video Editor: on stage 1, whose mission the demo can submit live, so the
  -- traveller visibly moves to stage 2 when it is checked.
  insert into public.milestone_progress(user_id, milestone_id, status, source)
  select v_user, m.id,
    case when m.position = 1 then 'active' when m.position = 2 then 'next' else 'upcoming' end,
    'placement'
  from public.roadmap_milestones m join public.career_tracks t on t.id = m.track_id where t.key = 'video-editor';
  insert into public.milestone_progress(user_id, milestone_id, status, source)
  select v_user, m.id,
    case when m.position = 1 then 'active' when m.position = 2 then 'next' else 'upcoming' end,
    'placement'
  from public.roadmap_milestones m join public.career_tracks t on t.id = m.track_id where t.key = 'brand-visual-designer';

  return jsonb_build_object('reset', true);
end $function$;

-- The guard steps aside for one transaction while the demo resets itself:
-- reset_demo_account() rewrites milestone_progress, which the guard still
-- protects from the demo session. The flag is transaction-local and only
-- reset_my_demo() sets it; PostgREST gives callers no way to set it.
create or replace function public.guard_demo_writes()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if public.is_demo_session() and coalesce(current_setting('lan_pya.demo_reset', true), '') <> 'on' then
    raise exception 'demo account is read-only' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end $function$;

-- The demo account resets its own story. Nobody else can call it into doing
-- anything: it checks the session is the demo before touching a row.
create or replace function public.reset_my_demo()
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if not public.is_demo_session() then raise exception 'only the demo account can reset itself'; end if;
  perform set_config('lan_pya.demo_reset', 'on', true);
  return public.reset_demo_account();
end $function$;

revoke all on function public.reset_my_demo() from public, anon;
grant execute on function public.reset_my_demo() to authenticated;

-- Put the demo on the new story straight away.
select public.reset_demo_account();
