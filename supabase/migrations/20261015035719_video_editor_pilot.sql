-- Video Editor & Motion Content becomes a controlled pilot, like Content
-- Creator: its five-stage roadmap was already live, but with no mission a
-- learner could only look at it. One authored mission on stage 1 makes the
-- path switchable ("Ready to start" on Careers). Stages 2-5 carry no mission
-- yet, the same shape the Content Creator pilot launched with.

update public.career_tracks
set availability = 'controlled_pilot'
where key = 'video-editor';

insert into public.mission_definitions(id, milestone_id, key, version, title, brief, rubric)
values (
  '52000000-0000-0000-0000-000000000001',
  '50100000-0000-0000-0000-000000000001',
  'video-editor-vertical-story', 1,
  'Thirty-second vertical story edit',
  '{"goal":"Cut raw footage into a clear thirty-second vertical story with clean sound, licensed music and accurate captions","pilot":"controlled"}',
  '{"workflow":20,"story":35,"sound_captions":25,"reflection":20}'
)
on conflict (key, version) do update
  set milestone_id = excluded.milestone_id, title = excluded.title, brief = excluded.brief, rubric = excluded.rubric, active = true;

insert into public.competencies(id, key, label, description) values
  ('53000000-0000-0000-0000-000000000001', 'edit-workflow', 'Editing workflow', 'Organises footage, project files and export settings so an edit is fast and recoverable.'),
  ('53000000-0000-0000-0000-000000000002', 'story-editing', 'Story editing', 'Shapes footage into a story with a clear hook, structure and pacing.'),
  ('53000000-0000-0000-0000-000000000003', 'sound-and-captions', 'Sound and captions', 'Delivers clean dialogue, licensed music and accurate, readable captions.')
on conflict (key) do update set label = excluded.label, description = excluded.description;

-- Rubric and competencies per mission. The rubric version is the mission key
-- plus "-rubric-v1" for every mission, which is what the two earlier missions
-- already used, so only the competency list needs a case.
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
    -- Only the step the link check gave is returned. Placement and proof
    -- milestones are never touched.
    update public.milestone_progress set status='active',source='placement',updated_at=now()
    where user_id=v_owner and milestone_id=v_milestone and source='checked';
  end if;
  insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'review.'||p_action,'submission',p_submission_id::text,jsonb_build_object('review_id',v_review,'mission_key',v_mission_key));
  return v_review;
end $function$;

create or replace function public.get_review_submission(p_submission_id uuid)
 returns jsonb
 language sql
 stable security definer
 set search_path to 'public'
as $function$
select case when public.has_role(array['reviewer','reviewer_lead','admin']::public.app_role[]) then jsonb_build_object(
  'mission_key', m.key,
  'mission_title', m.title,
  'rubric_version', m.key || '-rubric-v1',
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
$function$;
