-- Frontend stage 4 (JavaScript programming) gets its mission: the stage's own
-- proof target, an interactive opportunity tracker.
--
-- The demo stands on Frontend stage 4, and every learner who verifies the
-- Responsive Profile Card arrives there too. With no mission on it, "You are
-- here" opened the finished stage-3 mission, where there is nothing left to
-- submit. Now the stage you are on has work to do.
--
-- next_mission also stops offering a mission that is already verified while
-- an unverified one exists on the path: the demo's verified profile card was
-- still its "active" work, so it won the ordering.

-- The Frontend stages come from seed.sql, which runs after the migrations on a
-- fresh local database, so the insert waits for the stage to exist; seed.sql
-- adds the same mission there. Production already had the stage.
insert into public.mission_definitions(id, milestone_id, key, version, title, brief, rubric)
select
  '12000000-0000-0000-0000-000000000002',
  '11000000-0000-0000-0000-000000000004',
  'interactive-opportunity-tracker', 1,
  'Interactive opportunity tracker',
  '{"goal":"Build a small tracker that filters, saves and explains opportunities with plain JavaScript"}',
  '{"interaction":35,"data":25,"errors":20,"explanation":20}'
where exists (select 1 from public.roadmap_milestones where id = '11000000-0000-0000-0000-000000000004')
on conflict (key, version) do update
  set milestone_id = excluded.milestone_id, title = excluded.title, brief = excluded.brief, rubric = excluded.rubric, active = true;

insert into public.competencies(id, key, label, description) values
  ('13000000-0000-0000-0000-000000000006', 'dom-interaction', 'DOM interaction', 'Turns events into clear interface changes without reloading the page.'),
  ('13000000-0000-0000-0000-000000000007', 'client-side-data', 'Client-side data', 'Filters, sorts and keeps data in the browser, and handles empty and broken states.')
on conflict (key) do update set label = excluded.label, description = excluded.description;

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

  v_competencies := case v_mission_key
    when 'content-creator-awareness' then array['audience-research','content-strategy','accessible-publishing','ethical-communication']
    when 'video-editor-vertical-story' then array['edit-workflow','story-editing','sound-and-captions']
    when 'interactive-opportunity-tracker' then array['javascript-foundations','dom-interaction','client-side-data']
    else array['semantic-html','responsive-css','accessible-structure'] end;

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

create or replace function public.get_active_path_dashboard()
 returns jsonb
 language sql
 stable security definer
 set search_path to 'public'
as $function$
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
  -- Unfinished work first: a verified mission is only "next" when nothing
  -- else on the path is left to do.
  order by case when submission.state = 'verified' then 1 else 0 end,
           case work.state when 'active' then 0 when 'paused' then 1 else 2 end,
           milestone.position, mission.version desc
  limit 1
), paused_work as (
  select coalesce(jsonb_agg(jsonb_build_object('mission_key', mission.key, 'mission_title', mission.title, 'path_key', track.key, 'path_title', track.title) order by work.updated_at desc), '[]'::jsonb) as items
  from public.learner_mission_work work
  join public.mission_definitions mission on mission.id = work.mission_id
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  join public.career_tracks track on track.id = milestone.track_id
  where work.user_id = auth.uid() and work.state = 'paused'
    and track.id is distinct from (select track_id from active_path)
    and not exists (select 1 from public.submissions done where done.user_id = auth.uid() and done.mission_id = mission.id and done.state = 'verified')
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
$function$;
