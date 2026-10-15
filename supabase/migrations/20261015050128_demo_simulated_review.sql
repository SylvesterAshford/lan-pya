-- A simulated review for the demo account (founder, 2026-10-15).
--
-- A pitch shows the whole loop: submit, the link check completes the stage,
-- then a reviewer verifies it and it becomes proof. Real reviews take days,
-- so for the shared demo only the mission page asks for this review a few
-- seconds after the work is Completed. It does what a reviewer's Verify does
-- (record_review_decision): proof with the mission's competencies, the stage
-- complete by proof, and the mission's points. The proof is labelled as a
-- demo review and is removed by reset_demo_account() with everything else.

-- One list of what each mission proves, shared by the real and the simulated
-- review so the two cannot drift.
create or replace function public.mission_competency_keys(p_mission_key text)
 returns text[]
 language sql
 immutable
as $function$
  select case p_mission_key
    when 'content-creator-awareness' then array['audience-research','content-strategy','accessible-publishing','ethical-communication']
    when 'video-editor-vertical-story' then array['edit-workflow','story-editing','sound-and-captions']
    when 'interactive-opportunity-tracker' then array['javascript-foundations','dom-interaction','client-side-data']
    else array['semantic-html','responsive-css','accessible-structure'] end;
$function$;

create or replace function public.record_review_decision(p_submission_id uuid, p_action text, p_notes text, p_rubric_scores jsonb)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_review uuid; v_proof uuid; v_snapshot jsonb; v_owner uuid; v_mission_key text; v_rubric text; v_competencies text[]; v_track_id uuid; v_milestone uuid;
begin
  if not public.has_role(array['reviewer','reviewer_lead']::public.app_role[]) then raise exception 'permission denied'; end if;
  if p_action not in ('verify','request_changes','reject') or char_length(trim(p_notes))<20 then raise exception 'invalid decision'; end if;
  if not exists(select 1 from public.review_assignments assignment join public.submissions submission on submission.id=assignment.submission_id where assignment.submission_id=p_submission_id and assignment.reviewer_id=auth.uid() and assignment.status='claimed' and submission.state='human_review_in_progress' and submission.user_id<>auth.uid()) then raise exception 'submission not claimed'; end if;

  select submission.user_id, mission.key, milestone.track_id, mission.milestone_id, mission.key || '-rubric-v1'
  into v_owner, v_mission_key, v_track_id, v_milestone, v_rubric
  from public.submissions submission
  join public.mission_definitions mission on mission.id=submission.mission_id
  join public.roadmap_milestones milestone on milestone.id=mission.milestone_id
  where submission.id=p_submission_id for update of submission;

  v_competencies := public.mission_competency_keys(v_mission_key);

  select jsonb_build_object('title',mission.title,'rubric_version',v_rubric,'reviewer_tier','Trained human reviewer',
    'competencies',coalesce((select jsonb_agg(competency.label order by competency.label) from public.competencies competency where competency.key=any(v_competencies)),'[]'::jsonb),
    'repository_url',version.repository_url,'deployment_url',version.deployment_url)
  into v_snapshot
  from public.submissions submission
  join public.mission_definitions mission on mission.id=submission.mission_id
  join public.submission_versions version on version.submission_id=submission.id and version.version=submission.current_version
  where submission.id=p_submission_id;

  insert into public.human_reviews(submission_id,reviewer_id,rubric_version,rubric_scores,decision,notes) values(p_submission_id,auth.uid(),v_rubric,p_rubric_scores,p_action,trim(p_notes)) returning id into v_review;
  update public.review_assignments set status='completed',completed_at=now() where submission_id=p_submission_id and reviewer_id=auth.uid() and status='claimed';
  update public.submissions set state=case p_action when 'verify' then 'verified'::public.submission_state when 'request_changes' then 'changes_requested'::public.submission_state else 'rejected'::public.submission_state end,updated_at=now() where id=p_submission_id;
  if p_action='verify' then
    insert into public.proof_items(user_id,submission_id,snapshot) values(v_owner,p_submission_id,v_snapshot) returning id into v_proof;
    insert into public.proof_competencies(proof_id,competency_id) select v_proof,id from public.competencies where key=any(v_competencies);
    insert into public.milestone_progress(user_id,milestone_id,status,source) values(v_owner,v_milestone,'complete','proof') on conflict(user_id,milestone_id) do update set status='complete',source='proof',updated_at=now();
    insert into public.career_quest_xp(user_id,submission_id,track_id,amount,reason) values(v_owner,p_submission_id,v_track_id,100,'verified_core_mission') on conflict(submission_id) do nothing;
  elsif p_action='reject' then
    update public.milestone_progress set status='active',source='placement',updated_at=now()
    where user_id=v_owner and milestone_id=v_milestone and source='checked';
  end if;
  insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'review.'||p_action,'submission',p_submission_id::text,jsonb_build_object('review_id',v_review,'mission_key',v_mission_key));
  return v_review;
end $function$;

-- The demo's own work, verified as a reviewer would. Refuses any other
-- account, and any submission that has not been Completed by the link check.
create or replace function public.demo_review_my_submission(p_mission_key text)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_submission uuid; v_mission_key text; v_track_id uuid; v_milestone uuid; v_snapshot jsonb; v_proof uuid; v_competencies text[];
begin
  if not public.is_demo_session() then raise exception 'only the demo account has a simulated review'; end if;

  select submission.id, mission.key, milestone.track_id, mission.milestone_id
  into v_submission, v_mission_key, v_track_id, v_milestone
  from public.submissions submission
  join public.mission_definitions mission on mission.id = submission.mission_id
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  where submission.user_id = auth.uid() and mission.key = p_mission_key
    and (submission.state::text like 'automated\_%' or submission.state::text like 'human\_review\_%')
    and submission.state <> 'automated_feedback_ready'
  order by submission.updated_at desc limit 1
  for update of submission;
  if v_submission is null then return jsonb_build_object('reviewed', false); end if;

  v_competencies := public.mission_competency_keys(v_mission_key);
  select jsonb_build_object('title', mission.title, 'rubric_version', mission.key || '-rubric-v1', 'reviewer_tier', 'Simulated demo review',
    'competencies', coalesce((select jsonb_agg(competency.label order by competency.label) from public.competencies competency where competency.key = any(v_competencies)), '[]'::jsonb),
    'repository_url', version.repository_url, 'deployment_url', version.deployment_url)
  into v_snapshot
  from public.submissions submission
  join public.mission_definitions mission on mission.id = submission.mission_id
  join public.submission_versions version on version.submission_id = submission.id and version.version = submission.current_version
  where submission.id = v_submission;

  -- milestone_progress is guarded against the demo session; this is the
  -- review rewriting it, not the visitor.
  perform set_config('lan_pya.demo_reset', 'on', true);

  update public.submissions set state = 'verified', updated_at = now() where id = v_submission;
  insert into public.proof_items(user_id, submission_id, snapshot, data_origin) values (auth.uid(), v_submission, v_snapshot, 'seeded_demo') returning id into v_proof;
  insert into public.proof_competencies(proof_id, competency_id) select v_proof, id from public.competencies where key = any(v_competencies);
  insert into public.milestone_progress(user_id, milestone_id, status, source) values (auth.uid(), v_milestone, 'complete', 'proof')
    on conflict (user_id, milestone_id) do update set status = 'complete', source = 'proof', updated_at = now();
  insert into public.career_quest_xp(user_id, submission_id, track_id, amount, reason) values (auth.uid(), v_submission, v_track_id, 100, 'verified_core_mission')
    on conflict (submission_id) do nothing;
  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), 'review.demo_verify', 'submission', v_submission::text, jsonb_build_object('mission_key', v_mission_key));
  return jsonb_build_object('reviewed', true);
end $function$;

revoke all on function public.demo_review_my_submission(text) from public, anon;
grant execute on function public.demo_review_my_submission(text) to authenticated;
