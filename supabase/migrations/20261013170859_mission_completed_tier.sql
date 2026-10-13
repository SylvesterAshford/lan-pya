-- Two honest tiers for mission work (SPEC.md, decisions D1 to D7).
--
-- Before: every submission waited for a human reviewer, and no account held a
-- reviewer role, so real submissions sat in "waiting" indefinitely.
--
-- After:
--   link check pass / inconclusive / error -> Completed: the mission's
--     milestone is marked complete with source 'checked', so the trail map
--     moves on. No proof, no XP, no readiness change.
--   link check feedback (a broken link)     -> automated_feedback_ready: the
--     learner fixes the link and resubmits. It never reaches a reviewer.
--   reviewer verify          -> proof + XP, milestone source becomes 'proof'
--   reviewer request_changes -> the map keeps its place
--   reviewer reject          -> only a 'checked' milestone goes back to active
--
-- Automated checks still never create proof. Only record_review_decision does.

alter table public.milestone_progress drop constraint milestone_progress_source_check;
alter table public.milestone_progress add constraint milestone_progress_source_check
  check (source in ('placement', 'proof', 'admin', 'checked'));

-- Link check result -> submission state, plus the Completed milestone.
create or replace function public.complete_evaluation(p_job_id uuid, p_submission_id uuid, p_outcome text, p_observations jsonb, p_summary text, p_evaluator_version text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_owner uuid; v_milestone uuid; v_state public.submission_state;
begin
  if p_outcome not in ('pass', 'feedback', 'inconclusive', 'skipped', 'error') then
    raise exception 'invalid outcome';
  end if;

  insert into public.automated_evaluations(submission_id, evaluator, evaluator_version, outcome, observations, raw_summary)
  values (p_submission_id, 'deterministic-url-checker', p_evaluator_version, p_outcome, p_observations, p_summary)
  on conflict(submission_id, evaluator_version) do update
    set outcome = excluded.outcome, observations = excluded.observations, raw_summary = excluded.raw_summary, created_at = now();

  update public.evaluation_jobs
    set status = case when p_outcome = 'error' then 'failed' else 'completed' end,
        attempts = attempts + 1,
        last_error = case when p_outcome = 'error' then p_summary end,
        updated_at = now()
  where id = p_job_id and submission_id = p_submission_id;

  -- A broken link goes back to the learner. Anything else is Completed and
  -- waits for a human: "can't tell" and our own errors are not the learner's
  -- fault, and the reviewer still looks at every link.
  v_state := case
    when p_outcome = 'feedback' then 'automated_feedback_ready'
    when p_outcome = 'inconclusive' then 'automated_inconclusive'
    when p_outcome = 'skipped' then 'automated_skipped'
    else 'human_review_queued'
  end;

  -- A result applies only to a submission that is still being checked. A
  -- redelivered queue message must not pull reviewed work back into waiting.
  update public.submissions set state = v_state, updated_at = now()
  where id = p_submission_id and state in ('submitted', 'deterministic_running')
  returning user_id into v_owner;
  if v_owner is null then return; end if;

  if v_owner is not null and v_state <> 'automated_feedback_ready' then
    select mission.milestone_id into v_milestone
    from public.submissions submission
    join public.mission_definitions mission on mission.id = submission.mission_id
    where submission.id = p_submission_id;

    -- Never downgrade: a milestone already complete by placement or proof keeps its source.
    insert into public.milestone_progress(user_id, milestone_id, status, source)
    values (v_owner, v_milestone, 'complete', 'checked')
    on conflict (user_id, milestone_id) do update
      set status = 'complete', source = 'checked', updated_at = now()
      where public.milestone_progress.status <> 'complete';
  end if;

  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata)
  values (null, case when v_state = 'automated_feedback_ready' then 'submission.needs_fix' else 'submission.checked' end,
          'submission', p_submission_id::text, jsonb_build_object('outcome', p_outcome, 'evaluator_version', p_evaluator_version));
end;
$$;

-- Resubmitting is allowed after a change request and after a broken-link result.
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

-- The queue keeps an item the reviewer has claimed, so leaving the page does
-- not make it vanish, and says how long each item has waited.
create or replace function public.get_reviewer_queue()
returns jsonb language sql stable security definer set search_path = public as $$
select case when public.has_role(array['reviewer','reviewer_lead','admin']::public.app_role[]) then coalesce(jsonb_agg(jsonb_build_object(
  'submission_id', s.id,
  'mission_key', m.key,
  'mission_title', m.title,
  'learner_alias', p.alias,
  'submitted_at', s.submitted_at,
  'waiting_since', s.updated_at,
  'state', s.state,
  'claimed_by_me', exists(select 1 from public.review_assignments a where a.submission_id = s.id and a.reviewer_id = auth.uid() and a.status = 'claimed'),
  'check_outcome', (select outcome from public.automated_evaluations e where e.submission_id = s.id order by e.created_at desc limit 1)
) order by s.updated_at), '[]') else '[]' end
from public.submissions s
join public.mission_definitions m on m.id = s.mission_id
join public.learner_profiles p on p.user_id = s.user_id
where s.user_id <> auth.uid()
  and (s.state in ('human_review_queued','automated_inconclusive','automated_skipped')
       or (s.state = 'human_review_in_progress' and exists(select 1 from public.review_assignments a where a.submission_id = s.id and a.reviewer_id = auth.uid() and a.status = 'claimed')));
$$;

-- Any reviewer may read a waiting submission before claiming it (RLS already
-- lets reviewers read submissions and versions). Claiming is now an explicit
-- POST, never a side effect of opening the page.
create or replace function public.get_review_submission(p_submission_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
select case when public.has_role(array['reviewer','reviewer_lead','admin']::public.app_role[]) then jsonb_build_object(
  'mission_key', m.key,
  'mission_title', m.title,
  'rubric_version', case when m.key = 'content-creator-awareness' then 'content-creator-awareness-rubric-v1' else 'responsive-profile-card-rubric-v1' end,
  'state', s.state,
  'claimed_by_me', exists(select 1 from public.review_assignments a where a.submission_id = s.id and a.reviewer_id = auth.uid() and a.status = 'claimed'),
  'claimed_by_other', exists(select 1 from public.review_assignments a where a.submission_id = s.id and a.reviewer_id <> auth.uid() and a.status = 'claimed'),
  'repository_url', v.repository_url,
  'deployment_url', v.deployment_url,
  'screenshot_url', v.screenshot_url,
  'reflection', v.reflection,
  'version', v.version,
  'automated_summary', (select raw_summary from public.automated_evaluations where submission_id = s.id order by created_at desc limit 1),
  'observations', (select observations from public.automated_evaluations where submission_id = s.id order by created_at desc limit 1)
) end
from public.submissions s
join public.mission_definitions m on m.id = s.mission_id
join public.submission_versions v on v.submission_id = s.id and v.version = s.current_version
where s.id = p_submission_id and s.user_id <> auth.uid();
$$;

-- Unchanged except for the reject branch, which returns a 'checked' milestone
-- to active. A change request keeps the learner's place on the map.
create or replace function public.record_review_decision(p_submission_id uuid,p_action text,p_notes text,p_rubric_scores jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_review uuid; v_proof uuid; v_snapshot jsonb; v_owner uuid; v_mission_key text; v_rubric text; v_competencies text[]; v_track_id uuid; v_milestone uuid;
begin
  if not public.has_role(array['reviewer','reviewer_lead']::public.app_role[]) then raise exception 'permission denied'; end if;
  if p_action not in ('verify','request_changes','reject') or char_length(trim(p_notes))<20 then raise exception 'invalid decision'; end if;
  if not exists(select 1 from public.review_assignments assignment join public.submissions submission on submission.id=assignment.submission_id where assignment.submission_id=p_submission_id and assignment.reviewer_id=auth.uid() and assignment.status='claimed' and submission.state='human_review_in_progress' and submission.user_id<>auth.uid()) then raise exception 'submission not claimed'; end if;

  select submission.user_id,mission.key,milestone.track_id,mission.milestone_id,
    case when mission.key='content-creator-awareness' then 'content-creator-awareness-rubric-v1' else 'responsive-profile-card-rubric-v1' end,
    case when mission.key='content-creator-awareness' then array['audience-research','content-strategy','accessible-publishing','ethical-communication'] else array['semantic-html','responsive-css','accessible-structure'] end,
    jsonb_build_object('title',mission.title,'rubric_version',case when mission.key='content-creator-awareness' then 'content-creator-awareness-rubric-v1' else 'responsive-profile-card-rubric-v1' end,'reviewer_tier','Trained human reviewer','competencies',coalesce((select jsonb_agg(competency.label order by competency.label) from public.competencies competency where competency.key=any(case when mission.key='content-creator-awareness' then array['audience-research','content-strategy','accessible-publishing','ethical-communication'] else array['semantic-html','responsive-css','accessible-structure'] end)),'[]'::jsonb),'repository_url',version.repository_url,'deployment_url',version.deployment_url)
  into v_owner,v_mission_key,v_track_id,v_milestone,v_rubric,v_competencies,v_snapshot
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
    insert into public.milestone_progress(user_id,milestone_id,status,source) values(v_owner,v_milestone,'complete','proof') on conflict(user_id,milestone_id) do update set status='complete',source='proof',updated_at=now();
    insert into public.career_quest_xp(user_id,submission_id,track_id,amount,reason) values(v_owner,p_submission_id,v_track_id,100,'verified_core_mission') on conflict(submission_id) do nothing;
  elsif p_action='reject' then
    -- Only the step the link check gave is returned. Placement and proof
    -- milestones are never touched.
    update public.milestone_progress set status='active',source='placement',updated_at=now()
    where user_id=v_owner and milestone_id=v_milestone and source='checked';
  end if;
  insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'review.'||p_action,'submission',p_submission_id::text,jsonb_build_object('review_id',v_review,'mission_key',v_mission_key));
  return v_review;
end $$;

-- Backfill (D7): live submissions already waiting for a human are Completed
-- under the new rule. Idempotent; never downgrades a complete milestone.
insert into public.milestone_progress(user_id, milestone_id, status, source)
select submission.user_id, mission.milestone_id, 'complete', 'checked'
from public.submissions submission
join public.mission_definitions mission on mission.id = submission.mission_id
where submission.data_origin = 'live'
  and submission.state in ('human_review_queued', 'automated_inconclusive', 'human_review_in_progress')
on conflict (user_id, milestone_id) do update
  set status = 'complete', source = 'checked', updated_at = now()
  where public.milestone_progress.status <> 'complete';
