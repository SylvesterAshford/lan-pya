-- Career Quest P0: one controlled-pilot non-code path with the same
-- submission -> review -> portfolio lifecycle as the technical mission.

insert into public.career_tracks(id,key,title,description,version,active,data_origin)
values (
  '40000000-0000-0000-0000-000000000001',
  'content-creator',
  'Content Creator & Social Media Storyteller',
  'Explain useful ideas through clear, ethical, platform-native content.',
  1, true, 'live'
)
on conflict (key) do update set title=excluded.title, description=excluded.description, version=excluded.version, active=excluded.active;

insert into public.roadmap_milestones(id,track_id,key,position,title,description,proof_label,content_version)
values (
  '41000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  'content-awareness-campaign', 1,
  'Audience and awareness campaign',
  'Research one local audience, publish three connected pieces, and explain the choices behind the campaign.',
  'Three-piece awareness campaign', 1
)
on conflict (track_id,key) do update set title=excluded.title, description=excluded.description, proof_label=excluded.proof_label, content_version=excluded.content_version;

insert into public.mission_definitions(id,milestone_id,key,version,title,brief,rubric)
values (
  '42000000-0000-0000-0000-000000000001',
  '41000000-0000-0000-0000-000000000001',
  'content-creator-awareness', 1,
  'Three-piece awareness campaign',
  '{"goal":"Create a useful, ethical campaign for one specific audience","pilot":"controlled"}',
  '{"audience_research":25,"content_quality":30,"accessibility_safety":25,"reflection":20}'
)
on conflict (key,version) do update set title=excluded.title, brief=excluded.brief, rubric=excluded.rubric, active=true;

insert into public.competencies(id,key,label,description) values
  ('43000000-0000-0000-0000-000000000001','audience-research','Audience research','Names a specific audience, need, and evidence-backed problem.'),
  ('43000000-0000-0000-0000-000000000002','content-strategy','Content strategy','Connects format, message, channel, and call to action.'),
  ('43000000-0000-0000-0000-000000000003','accessible-publishing','Accessible publishing','Uses captions, text alternatives, readable structure, and safe claims.'),
  ('43000000-0000-0000-0000-000000000004','ethical-communication','Ethical communication','Discloses uncertainty, sources, and material AI assistance.')
on conflict (key) do update set label=excluded.label, description=excluded.description;

create table if not exists public.career_quest_xp (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null unique references public.submissions(id) on delete cascade,
  amount int not null check (amount > 0),
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.career_quest_xp enable row level security;
drop policy if exists "quest xp own read" on public.career_quest_xp;
create policy "quest xp own read" on public.career_quest_xp for select to authenticated using (user_id = auth.uid());

create or replace function public.get_today_dashboard()
returns jsonb language sql stable security definer set search_path=public as $$
with xp as (
  select coalesce(sum(amount),0)::int as total from public.career_quest_xp where user_id=auth.uid()
), level_data as (
  select total, greatest(1, floor(total / 100.0)::int + 1) as level from xp
)
select jsonb_build_object(
  'progress_percent',coalesce((select round(100.0*count(*) filter(where p.status='complete')/nullif(count(m.id),0)) from public.roadmap_milestones m join public.career_tracks t on t.id=m.track_id and t.key='frontend-developer' left join public.milestone_progress p on p.milestone_id=m.id and p.user_id=auth.uid()),0),
  'verified_count',(select count(*) from public.proof_items where user_id=auth.uid() and state='active' and data_origin='live'),
  'streak_days',0,
  'xp',(select total from level_data),
  'level',(select level from level_data),
  'xp_to_next',(select level*100-total from level_data)
);
$$;

create or replace function public.record_review_decision(p_submission_id uuid,p_action text,p_notes text,p_rubric_scores jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_review uuid; v_proof uuid; v_snapshot jsonb; v_owner uuid; v_mission_key text; v_rubric text; v_competencies text[];
begin
  if not public.has_role(array['reviewer','reviewer_lead']::public.app_role[]) then raise exception 'permission denied'; end if;
  if p_action not in ('verify','request_changes','reject') or char_length(trim(p_notes))<20 then raise exception 'invalid decision'; end if;
  if not exists(select 1 from public.review_assignments a join public.submissions s on s.id=a.submission_id where a.submission_id=p_submission_id and a.reviewer_id=auth.uid() and a.status='claimed' and s.state='human_review_in_progress' and s.user_id<>auth.uid()) then raise exception 'submission not claimed'; end if;

  select s.user_id,m.key,
    case when m.key='content-creator-awareness' then 'content-creator-awareness-rubric-v1' else 'responsive-profile-card-rubric-v1' end,
    case when m.key='content-creator-awareness' then array['audience-research','content-strategy','accessible-publishing','ethical-communication'] else array['semantic-html','responsive-css','accessible-structure'] end,
    jsonb_build_object('title',m.title,'rubric_version',case when m.key='content-creator-awareness' then 'content-creator-awareness-rubric-v1' else 'responsive-profile-card-rubric-v1' end,'reviewer_tier','Trained human reviewer','competencies',coalesce((select jsonb_agg(c.label order by c.label) from public.competencies c where c.key=any(case when m.key='content-creator-awareness' then array['audience-research','content-strategy','accessible-publishing','ethical-communication'] else array['semantic-html','responsive-css','accessible-structure'] end)),'[]'::jsonb),'repository_url',v.repository_url,'deployment_url',v.deployment_url)
  into v_owner,v_mission_key,v_rubric,v_competencies,v_snapshot
  from public.submissions s join public.mission_definitions m on m.id=s.mission_id join public.submission_versions v on v.submission_id=s.id and v.version=s.current_version
  where s.id=p_submission_id for update;

  insert into public.human_reviews(submission_id,reviewer_id,rubric_version,rubric_scores,decision,notes) values(p_submission_id,auth.uid(),v_rubric,p_rubric_scores,p_action,trim(p_notes)) returning id into v_review;
  update public.review_assignments set status='completed',completed_at=now() where submission_id=p_submission_id and reviewer_id=auth.uid() and status='claimed';
  update public.submissions set state=case p_action when 'verify' then 'verified'::public.submission_state when 'request_changes' then 'changes_requested'::public.submission_state else 'rejected'::public.submission_state end,updated_at=now() where id=p_submission_id;
  if p_action='verify' then
    insert into public.proof_items(user_id,submission_id,snapshot) values(v_owner,p_submission_id,v_snapshot) returning id into v_proof;
    insert into public.proof_competencies(proof_id,competency_id) select v_proof,id from public.competencies where key=any(v_competencies);
    insert into public.milestone_progress(user_id,milestone_id,status,source) select v_owner,milestone_id,'complete','proof' from public.mission_definitions where key=v_mission_key and active on conflict(user_id,milestone_id) do update set status='complete',source='proof',updated_at=now();
    if v_mission_key='content-creator-awareness' then insert into public.career_quest_xp(user_id,submission_id,amount,reason) values(v_owner,p_submission_id,100,'verified_core_mission') on conflict(submission_id) do nothing; end if;
  end if;
  insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'review.'||p_action,'submission',p_submission_id::text,jsonb_build_object('review_id',v_review,'mission_key',v_mission_key));
  return v_review;
end $$;

grant select on public.career_quest_xp to authenticated;
grant execute on function public.get_today_dashboard() to authenticated;
grant execute on function public.record_review_decision(uuid,text,text,jsonb) to authenticated;

-- Allow a learner to revise the same submission after a reviewer requests changes.
-- The previous version remains immutable and the next review evaluates only the
-- new version.
create or replace function public.submit_mission(p_mission_key text,p_repository_url text,p_deployment_url text,p_screenshot_url text,p_reflection text)
returns uuid language plpgsql security definer set search_path=public,pgmq as $$
declare
  v_mission uuid; v_submission uuid; v_hash text; v_job uuid; v_version int; v_attempt int; v_state public.submission_state;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select id into v_mission from public.mission_definitions where key=p_mission_key and active order by version desc limit 1;
  if v_mission is null then raise exception 'mission unavailable'; end if;
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

grant execute on function public.submit_mission(text,text,text,text,text) to authenticated;

create or replace function public.get_review_submission(p_submission_id uuid)
returns jsonb language sql stable security definer set search_path=public as $$
select case when (public.has_role(array['reviewer_lead','admin']::public.app_role[]) or exists(select 1 from public.review_assignments a where a.submission_id=s.id and a.reviewer_id=auth.uid() and a.status='claimed')) then jsonb_build_object(
  'mission_key',m.key,
  'mission_title',m.title,
  'rubric_version',case when m.key='content-creator-awareness' then 'content-creator-awareness-rubric-v1' else 'responsive-profile-card-rubric-v1' end,
  'repository_url',v.repository_url,
  'deployment_url',v.deployment_url,
  'reflection',v.reflection,
  'automated_summary',(select raw_summary from public.automated_evaluations where submission_id=s.id order by created_at desc limit 1)
) end
from public.submissions s join public.mission_definitions m on m.id=s.mission_id join public.submission_versions v on v.submission_id=s.id and v.version=s.current_version
where s.id=p_submission_id and s.user_id<>auth.uid();
$$;

grant execute on function public.get_review_submission(uuid) to authenticated;
