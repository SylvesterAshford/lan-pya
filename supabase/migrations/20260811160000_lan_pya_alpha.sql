create extension if not exists pgcrypto with schema extensions;
create extension if not exists pgmq;
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

create type public.data_origin as enum ('live', 'seeded_demo');
create type public.app_role as enum ('learner', 'reviewer', 'reviewer_lead', 'admin');
create type public.submission_state as enum (
  'draft', 'submitted', 'deterministic_running', 'automated_feedback_ready',
  'automated_inconclusive', 'automated_skipped', 'human_review_queued',
  'human_review_in_progress', 'changes_requested', 'verified', 'rejected',
  'appeal_requested', 'closed'
);

create table public.learner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  alias text not null check (char_length(alias) between 1 and 60),
  locale text not null default 'en' check (locale in ('en','my')),
  goal text not null default 'Frontend Web Developer',
  weekly_hours text not null default '4–6 hours',
  onboarding_complete boolean not null default false,
  data_origin public.data_origin not null default 'live',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null, status text not null default 'active' check (status in ('active','suspended','revoked')),
  created_at timestamptz not null default now(), unique(user_id, role)
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  policy_version text not null, granted boolean not null, granted_at timestamptz not null default now(),
  ip_hash text, user_agent_hash text
);

create table public.placement_assessments (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  skills jsonb not null default '[]', knowledge_score int not null check (knowledge_score between 0 and 5),
  micro_task_score int not null check (micro_task_score between 0 and 4), algorithm_version text not null,
  result_milestone_key text not null, created_at timestamptz not null default now()
);

create table public.career_tracks (
  id uuid primary key default gen_random_uuid(), key text not null unique, title text not null,
  description text not null, version int not null default 1, active boolean not null default true,
  data_origin public.data_origin not null default 'live', created_at timestamptz not null default now()
);

create table public.roadmap_milestones (
  id uuid primary key default gen_random_uuid(), track_id uuid not null references public.career_tracks(id) on delete cascade,
  key text not null, position int not null check (position > 0), title text not null, description text not null,
  proof_label text not null, content_version int not null default 1, created_at timestamptz not null default now(),
  unique(track_id, key), unique(track_id, position)
);

create table public.milestone_progress (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  milestone_id uuid not null references public.roadmap_milestones(id) on delete cascade,
  status text not null check (status in ('complete','active','next','upcoming')),
  source text not null check (source in ('placement','proof','admin')),
  updated_at timestamptz not null default now(), unique(user_id, milestone_id)
);

create table public.mission_definitions (
  id uuid primary key default gen_random_uuid(), milestone_id uuid not null references public.roadmap_milestones(id),
  key text not null, version int not null, title text not null, brief jsonb not null, rubric jsonb not null,
  active boolean not null default true, created_at timestamptz not null default now(), unique(key, version)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid not null references public.mission_definitions(id), state public.submission_state not null default 'submitted',
  attempt int not null default 1, current_version int not null default 1, data_origin public.data_origin not null default 'live',
  submitted_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create unique index one_active_submission_per_mission on public.submissions(user_id, mission_id)
where state not in ('verified','rejected','closed');

create table public.submission_versions (
  id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.submissions(id) on delete cascade,
  version int not null, repository_url text not null, deployment_url text not null, screenshot_url text,
  reflection text not null, immutable_payload_hash text not null, created_at timestamptz not null default now(),
  unique(submission_id, version)
);

create table public.evaluation_jobs (
  id uuid primary key default gen_random_uuid(), submission_id uuid not null unique references public.submissions(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','processing','completed','failed','dead_letter')),
  attempts int not null default 0, available_at timestamptz not null default now(), locked_at timestamptz,
  last_error text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.automated_evaluations (
  id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.submissions(id) on delete cascade,
  evaluator text not null, evaluator_version text not null, outcome text not null check (outcome in ('pass','feedback','inconclusive','skipped','error')),
  observations jsonb not null default '[]', raw_summary text, created_at timestamptz not null default now(),
  unique(submission_id, evaluator_version)
);

create table public.review_assignments (
  id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.submissions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id), status text not null default 'claimed' check (status in ('claimed','released','completed')),
  claimed_at timestamptz not null default now(), completed_at timestamptz
);
create unique index one_claimed_reviewer_per_submission on public.review_assignments(submission_id) where status='claimed';

create table public.human_reviews (
  id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.submissions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id), rubric_version text not null, rubric_scores jsonb not null,
  decision text not null check (decision in ('verify','request_changes','reject')), notes text not null,
  created_at timestamptz not null default now()
);

create table public.appeals (
  id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.submissions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, reason text not null,
  status text not null default 'open' check (status in ('open','upheld','overturned','closed')),
  decided_by uuid references auth.users(id), decision_notes text, created_at timestamptz not null default now(), decided_at timestamptz
);

create table public.competencies (
  id uuid primary key default gen_random_uuid(), key text not null unique, label text not null, description text not null
);

create table public.proof_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null unique references public.submissions(id), state text not null default 'active' check (state in ('active','invalidated','deleted')),
  snapshot jsonb not null, verified_at timestamptz not null default now(), data_origin public.data_origin not null default 'live'
);

create table public.proof_competencies (
  proof_id uuid not null references public.proof_items(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete cascade,
  primary key(proof_id, competency_id)
);

create table public.proof_shares (
  id uuid primary key default gen_random_uuid(), proof_id uuid not null references public.proof_items(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade, token_hash text not null,
  expires_at timestamptz not null, revoked_at timestamptz, created_at timestamptz not null default now()
);

create table public.proof_share_sessions (
  id uuid primary key default gen_random_uuid(), share_id uuid not null references public.proof_shares(id) on delete cascade,
  session_hash text not null unique, expires_at timestamptz not null, created_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(), title text not null, organization text not null, type text not null,
  location text not null, deadline date, source_url text not null, status text not null default 'draft' check (status in ('draft','published','expired','archived')),
  last_verified_at timestamptz, data_origin public.data_origin not null default 'live', created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.opportunity_requirements (
  id uuid primary key default gen_random_uuid(), opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  competency_id uuid references public.competencies(id), label text not null, requirement_type text not null check (requirement_type in ('required','preferred','unknown'))
);

create table public.reviewer_invites (
  id uuid primary key default gen_random_uuid(), email_hash text not null, role public.app_role not null check (role in ('reviewer','reviewer_lead')),
  token_hash text not null unique, invited_by uuid not null references auth.users(id), expires_at timestamptz not null,
  accepted_at timestamptz, created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key, actor_id uuid references auth.users(id) on delete set null,
  action text not null, entity_type text not null, entity_id text not null, metadata jsonb not null default '{}',
  data_origin public.data_origin not null default 'live', created_at timestamptz not null default now()
);

create table public.deletion_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','processing','completed','rejected')),
  requested_at timestamptz not null default now(), completed_at timestamptz
);

create or replace function public.has_role(p_roles public.app_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.memberships where user_id = auth.uid() and status = 'active' and role = any(p_roles));
$$;

revoke all on function public.has_role(public.app_role[]) from public;
grant execute on function public.has_role(public.app_role[]) to authenticated;

alter table public.learner_profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.consent_records enable row level security;
alter table public.placement_assessments enable row level security;
alter table public.career_tracks enable row level security;
alter table public.roadmap_milestones enable row level security;
alter table public.milestone_progress enable row level security;
alter table public.mission_definitions enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_versions enable row level security;
alter table public.evaluation_jobs enable row level security;
alter table public.automated_evaluations enable row level security;
alter table public.review_assignments enable row level security;
alter table public.human_reviews enable row level security;
alter table public.appeals enable row level security;
alter table public.competencies enable row level security;
alter table public.proof_items enable row level security;
alter table public.proof_competencies enable row level security;
alter table public.proof_shares enable row level security;
alter table public.proof_share_sessions enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_requirements enable row level security;
alter table public.reviewer_invites enable row level security;
alter table public.audit_events enable row level security;
alter table public.deletion_requests enable row level security;

create policy "profiles own select" on public.learner_profiles for select to authenticated using (user_id = auth.uid() or public.has_role(array['reviewer','reviewer_lead','admin']::public.app_role[]));
create policy "memberships own select" on public.memberships for select to authenticated using (user_id = auth.uid() or public.has_role(array['admin']::public.app_role[]));
create policy "consents own select" on public.consent_records for select to authenticated using (user_id = auth.uid());
create policy "placement own select" on public.placement_assessments for select to authenticated using (user_id = auth.uid());
create policy "tracks authenticated read" on public.career_tracks for select to authenticated using (active);
create policy "milestones authenticated read" on public.roadmap_milestones for select to authenticated using (true);
create policy "progress own read" on public.milestone_progress for select to authenticated using (user_id = auth.uid());
create policy "missions authenticated read" on public.mission_definitions for select to authenticated using (active);
create policy "submissions own or reviewer read" on public.submissions for select to authenticated using (user_id = auth.uid() or public.has_role(array['reviewer','reviewer_lead','admin']::public.app_role[]));
create policy "versions own or reviewer read" on public.submission_versions for select to authenticated using (exists(select 1 from public.submissions s where s.id = submission_id and (s.user_id = auth.uid() or public.has_role(array['reviewer','reviewer_lead','admin']::public.app_role[]))));
create policy "automated own or reviewer read" on public.automated_evaluations for select to authenticated using (exists(select 1 from public.submissions s where s.id = submission_id and (s.user_id = auth.uid() or public.has_role(array['reviewer','reviewer_lead','admin']::public.app_role[]))));
create policy "assignments reviewer read" on public.review_assignments for select to authenticated using (reviewer_id = auth.uid() or public.has_role(array['reviewer_lead','admin']::public.app_role[]));
create policy "reviews learner or staff read" on public.human_reviews for select to authenticated using (reviewer_id = auth.uid() or exists(select 1 from public.submissions s where s.id = submission_id and s.user_id = auth.uid()) or public.has_role(array['reviewer_lead','admin']::public.app_role[]));
create policy "appeals own or lead read" on public.appeals for select to authenticated using (user_id = auth.uid() or public.has_role(array['reviewer_lead','admin']::public.app_role[]));
create policy "competencies authenticated read" on public.competencies for select to authenticated using (true);
create policy "proof own read" on public.proof_items for select to authenticated using (user_id = auth.uid() or public.has_role(array['reviewer','reviewer_lead','admin']::public.app_role[]));
create policy "proof competencies own read" on public.proof_competencies for select to authenticated using (exists(select 1 from public.proof_items p where p.id = proof_id and (p.user_id = auth.uid() or public.has_role(array['reviewer','reviewer_lead','admin']::public.app_role[]))));
create policy "shares own read" on public.proof_shares for select to authenticated using (owner_id = auth.uid());
create policy "published opportunities read" on public.opportunities for select to authenticated using (status = 'published');
create policy "published requirements read" on public.opportunity_requirements for select to authenticated using (exists(select 1 from public.opportunities o where o.id = opportunity_id and o.status = 'published'));
create policy "invites admin read" on public.reviewer_invites for select to authenticated using (public.has_role(array['admin']::public.app_role[]));
create policy "audit admin read" on public.audit_events for select to authenticated using (public.has_role(array['admin']::public.app_role[]));
create policy "deletion own read" on public.deletion_requests for select to authenticated using (user_id = auth.uid());

create or replace function public.bootstrap_user() returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  insert into public.learner_profiles(user_id, alias) values(auth.uid(), coalesce(nullif(auth.jwt()->>'user_name',''), nullif(auth.jwt()->>'name',''), 'Learner')) on conflict do nothing;
  insert into public.memberships(user_id, role) values(auth.uid(), 'learner') on conflict do nothing;
  return jsonb_build_object('profile_created', true);
end $$;

create or replace function public.save_onboarding(p_alias text, p_locale text, p_weekly_hours text, p_skills text[], p_knowledge_score int, p_micro_task_score int, p_consent_version text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_start text := case when p_knowledge_score >= 4 and p_micro_task_score >= 3 then 'responsive-css' when p_knowledge_score >= 2 then 'semantic-html' else 'orientation' end;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if char_length(trim(p_alias)) not between 1 and 60 or p_locale not in ('en','my') or p_weekly_hours not in ('2–3 hours','4–6 hours','7+ hours') then raise exception 'invalid profile'; end if;
  insert into public.learner_profiles(user_id,alias,locale,weekly_hours,onboarding_complete) values(auth.uid(),trim(p_alias),p_locale,p_weekly_hours,true)
  on conflict(user_id) do update set alias=excluded.alias,locale=excluded.locale,weekly_hours=excluded.weekly_hours,onboarding_complete=true,updated_at=now();
  insert into public.memberships(user_id,role) values(auth.uid(),'learner') on conflict do nothing;
  insert into public.placement_assessments(user_id,skills,knowledge_score,micro_task_score,algorithm_version,result_milestone_key) values(auth.uid(),to_jsonb(p_skills),p_knowledge_score,p_micro_task_score,'placement-v1',v_start);
  insert into public.consent_records(user_id,policy_version,granted) values(auth.uid(),p_consent_version,true);
  insert into public.milestone_progress(user_id,milestone_id,status,source)
    select auth.uid(),m.id,case when m.key=v_start then 'active' when m.position < (select position from public.roadmap_milestones where track_id=m.track_id and key=v_start) then 'complete' else 'upcoming' end,'placement'
    from public.roadmap_milestones m join public.career_tracks t on t.id=m.track_id where t.key='frontend-developer'
  on conflict(user_id,milestone_id) do update set status=excluded.status,source=excluded.source,updated_at=now();
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(auth.uid(),'onboarding.completed','learner_profile',auth.uid()::text);
  return jsonb_build_object('starting_milestone',v_start);
end $$;

create or replace function public.get_frontend_roadmap() returns jsonb language sql stable security definer set search_path=public as $$
select coalesce(jsonb_agg(jsonb_build_object('key',m.key,'order',m.position,'title',m.title,'description',m.description,'proof',m.proof_label,'status',coalesce(p.status,case when m.position=1 then 'active' else 'upcoming' end)) order by m.position),'[]'::jsonb)
from public.roadmap_milestones m join public.career_tracks t on t.id=m.track_id left join public.milestone_progress p on p.milestone_id=m.id and p.user_id=auth.uid() where t.key='frontend-developer' and t.active;
$$;

create or replace function public.get_today_dashboard() returns jsonb language sql stable security definer set search_path=public as $$
select jsonb_build_object(
  'progress_percent',coalesce((select round(100.0*count(*) filter(where status='complete')/nullif(count(*),0)) from public.milestone_progress where user_id=auth.uid()),0),
  'verified_count',(select count(*) from public.proof_items where user_id=auth.uid() and state='active' and data_origin='live'),
  'streak_days',0);
$$;

create or replace function public.submit_mission(p_mission_key text,p_repository_url text,p_deployment_url text,p_screenshot_url text,p_reflection text)
returns uuid language plpgsql security definer set search_path=public,pgmq as $$
declare v_mission uuid; v_submission uuid; v_hash text; v_job uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select id into v_mission from public.mission_definitions where key=p_mission_key and active order by version desc limit 1;
  if v_mission is null then raise exception 'mission unavailable'; end if;
  if exists(select 1 from public.submissions where user_id=auth.uid() and mission_id=v_mission and state not in ('verified','rejected','closed')) then raise exception 'active submission exists'; end if;
  v_hash := encode(extensions.digest(p_repository_url||'|'||p_deployment_url||'|'||coalesce(p_screenshot_url,'')||'|'||p_reflection,'sha256'),'hex');
  insert into public.submissions(user_id,mission_id,state) values(auth.uid(),v_mission,'submitted') returning id into v_submission;
  insert into public.submission_versions(submission_id,version,repository_url,deployment_url,screenshot_url,reflection,immutable_payload_hash) values(v_submission,1,p_repository_url,p_deployment_url,p_screenshot_url,p_reflection,v_hash);
  insert into public.evaluation_jobs(submission_id) values(v_submission) returning id into v_job;
  perform pgmq.send('evaluation_jobs',jsonb_build_object('job_id',v_job,'submission_id',v_submission));
  update public.submissions set state='deterministic_running',updated_at=now() where id=v_submission;
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(auth.uid(),'submission.created','submission',v_submission::text);
  return v_submission;
end $$;

create or replace function public.recover_evaluation_jobs() returns int language plpgsql security definer set search_path=public,pgmq as $$
declare v_count int:=0; r record;
begin
 for r in select id,submission_id from public.evaluation_jobs where status in ('queued','failed') and available_at<=now() and attempts<5 and (locked_at is null or locked_at<now()-interval '5 minutes') loop
   perform pgmq.send('evaluation_jobs',jsonb_build_object('job_id',r.id,'submission_id',r.submission_id));
   update public.evaluation_jobs set status='queued',locked_at=now(),updated_at=now() where id=r.id; v_count:=v_count+1;
 end loop; return v_count;
end $$;

create or replace function public.dispatch_evaluation_processor() returns bigint language plpgsql security definer set search_path=public,extensions,vault as $$
declare v_url text; v_secret text; v_request bigint;
begin
 select decrypted_secret into v_url from vault.decrypted_secrets where name='project_url' limit 1;
 select decrypted_secret into v_secret from vault.decrypted_secrets where name='cron_secret' limit 1;
 if v_url is null or v_secret is null then return null; end if;
 select net.http_post(url:=v_url||'/functions/v1/process-evaluations',headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||v_secret),body:='{}'::jsonb) into v_request;
 return v_request;
exception when others then return null;
end $$;

create or replace function public.dequeue_evaluation_jobs(p_batch int default 5) returns setof jsonb language sql security definer set search_path=public,pgmq as $$
  select message || jsonb_build_object('_queue_msg_id',msg_id) from pgmq.read('evaluation_jobs',300,greatest(1,least(p_batch,20)));
$$;

create or replace function public.archive_evaluation_message(p_msg_id bigint) returns boolean language sql security definer set search_path=public,pgmq as $$
  select pgmq.archive('evaluation_jobs',p_msg_id);
$$;

create or replace function public.complete_evaluation(p_job_id uuid,p_submission_id uuid,p_outcome text,p_observations jsonb,p_summary text,p_evaluator_version text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if p_outcome not in ('pass','feedback','inconclusive','skipped','error') then raise exception 'invalid outcome'; end if;
 insert into public.automated_evaluations(submission_id,evaluator,evaluator_version,outcome,observations,raw_summary) values(p_submission_id,'deterministic-url-checker',p_evaluator_version,p_outcome,p_observations,p_summary)
 on conflict(submission_id,evaluator_version) do update set outcome=excluded.outcome,observations=excluded.observations,raw_summary=excluded.raw_summary,created_at=now();
 update public.evaluation_jobs set status=case when p_outcome='error' then 'failed' else 'completed' end,attempts=attempts+1,last_error=case when p_outcome='error' then p_summary end,updated_at=now() where id=p_job_id and submission_id=p_submission_id;
 update public.submissions set state=case when p_outcome='inconclusive' then 'automated_inconclusive' when p_outcome='skipped' then 'automated_skipped' else 'human_review_queued' end,updated_at=now() where id=p_submission_id;
end $$;

create or replace function public.get_opportunity_readiness() returns jsonb language sql stable security definer set search_path=public as $$
with owned as (select pc.competency_id from public.proof_competencies pc join public.proof_items p on p.id=pc.proof_id where p.user_id=auth.uid() and p.state='active' and p.data_origin='live'),
calc as (select o.*,count(r.id) filter(where r.requirement_type='required') req,count(r.id) filter(where r.requirement_type='required' and owned.competency_id is not null) met,
coalesce(jsonb_agg(distinct r.label) filter(where r.requirement_type='required' and owned.competency_id is not null),'[]') supported,
coalesce(jsonb_agg(distinct r.label) filter(where r.requirement_type='required' and owned.competency_id is null),'[]') gaps,
coalesce(jsonb_agg(distinct r.label) filter(where r.requirement_type='unknown'),'[]') unknown
from public.opportunities o left join public.opportunity_requirements r on r.opportunity_id=o.id left join owned on owned.competency_id=r.competency_id where o.status='published' group by o.id)
select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'organization',organization,'type',type,'location',location,'deadline',to_char(deadline,'DD Mon YYYY'),'readiness',case when jsonb_array_length(unknown)>0 then 'Cannot determine' when req=0 or met=req then 'Ready now' when met>0 then 'Build toward' else 'Explore' end,'supported',supported,'gaps',gaps,'unknown',unknown,'source_url',source_url,'last_verified_at',last_verified_at,'data_origin',data_origin) order by deadline nulls last),'[]') from calc;
$$;

create or replace function public.get_reviewer_queue() returns jsonb language sql stable security definer set search_path=public as $$
select case when public.has_role(array['reviewer','reviewer_lead','admin']::public.app_role[]) then coalesce(jsonb_agg(jsonb_build_object('submission_id',s.id,'mission_title',m.title,'learner_alias',p.alias,'submitted_at',s.submitted_at) order by s.submitted_at),'[]') else '[]' end
from public.submissions s join public.mission_definitions m on m.id=s.mission_id join public.learner_profiles p on p.user_id=s.user_id where s.state in ('human_review_queued','automated_inconclusive','automated_skipped') and s.user_id<>auth.uid();
$$;

create or replace function public.claim_submission(p_submission_id uuid) returns boolean language plpgsql security definer set search_path=public as $$
begin
 if not public.has_role(array['reviewer','reviewer_lead']::public.app_role[]) then raise exception 'permission denied'; end if;
 if not exists(select 1 from public.submissions where id=p_submission_id and user_id<>auth.uid() and state in ('human_review_queued','automated_inconclusive','automated_skipped') for update) then return false; end if;
 insert into public.review_assignments(submission_id,reviewer_id) values(p_submission_id,auth.uid()) on conflict do nothing;
 update public.submissions set state='human_review_in_progress',updated_at=now() where id=p_submission_id and exists(select 1 from public.review_assignments where submission_id=p_submission_id and reviewer_id=auth.uid() and status='claimed');
 return exists(select 1 from public.review_assignments where submission_id=p_submission_id and reviewer_id=auth.uid() and status='claimed');
end $$;

create or replace function public.get_review_submission(p_submission_id uuid) returns jsonb language sql stable security definer set search_path=public as $$
select case when (public.has_role(array['reviewer_lead','admin']::public.app_role[]) or exists(select 1 from public.review_assignments a where a.submission_id=s.id and a.reviewer_id=auth.uid() and a.status='claimed')) then jsonb_build_object('mission_title',m.title,'repository_url',v.repository_url,'deployment_url',v.deployment_url,'reflection',v.reflection,'automated_summary',(select raw_summary from public.automated_evaluations where submission_id=s.id order by created_at desc limit 1)) end
from public.submissions s join public.mission_definitions m on m.id=s.mission_id join public.submission_versions v on v.submission_id=s.id and v.version=s.current_version where s.id=p_submission_id and s.user_id<>auth.uid();
$$;

create or replace function public.record_review_decision(p_submission_id uuid,p_action text,p_notes text,p_rubric_scores jsonb) returns uuid language plpgsql security definer set search_path=public as $$
declare v_review uuid; v_proof uuid; v_snapshot jsonb; v_owner uuid;
begin
 if not public.has_role(array['reviewer','reviewer_lead']::public.app_role[]) then raise exception 'permission denied'; end if;
 if p_action not in ('verify','request_changes','reject') or char_length(trim(p_notes))<20 then raise exception 'invalid decision'; end if;
 if not exists(select 1 from public.review_assignments a join public.submissions s on s.id=a.submission_id where a.submission_id=p_submission_id and a.reviewer_id=auth.uid() and a.status='claimed' and s.state='human_review_in_progress' and s.user_id<>auth.uid()) then raise exception 'submission not claimed'; end if;
 insert into public.human_reviews(submission_id,reviewer_id,rubric_version,rubric_scores,decision,notes) values(p_submission_id,auth.uid(),'responsive-profile-card-rubric-v1',p_rubric_scores,p_action,trim(p_notes)) returning id into v_review;
 update public.review_assignments set status='completed',completed_at=now() where submission_id=p_submission_id and reviewer_id=auth.uid() and status='claimed';
 select s.user_id,jsonb_build_object('title',m.title,'rubric_version','responsive-profile-card-rubric-v1','reviewer_tier','Trained human reviewer','competencies',jsonb_build_array('Semantic HTML','Responsive CSS','Accessible structure'),'repository_url',v.repository_url,'deployment_url',v.deployment_url) into v_owner,v_snapshot from public.submissions s join public.mission_definitions m on m.id=s.mission_id join public.submission_versions v on v.submission_id=s.id and v.version=s.current_version where s.id=p_submission_id for update;
 update public.submissions set state=case p_action when 'verify' then 'verified'::public.submission_state when 'request_changes' then 'changes_requested'::public.submission_state else 'rejected'::public.submission_state end,updated_at=now() where id=p_submission_id;
 if p_action='verify' then
   insert into public.proof_items(user_id,submission_id,snapshot) values(v_owner,p_submission_id,v_snapshot) returning id into v_proof;
   insert into public.proof_competencies(proof_id,competency_id) select v_proof,id from public.competencies where key in ('semantic-html','responsive-css','accessible-structure');
 end if;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'review.'||p_action,'submission',p_submission_id::text,jsonb_build_object('review_id',v_review));
 return v_review;
end $$;

create or replace function public.create_proof_share(p_proof_id uuid,p_token_hash text,p_expires_in_days int) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if not exists(select 1 from public.proof_items where id=p_proof_id and user_id=auth.uid() and state='active') then raise exception 'proof unavailable'; end if;
 if p_expires_in_days not between 1 and 30 then raise exception 'invalid expiry'; end if;
 insert into public.proof_shares(proof_id,owner_id,token_hash,expires_at) values(p_proof_id,auth.uid(),p_token_hash,now()+make_interval(days=>p_expires_in_days)) returning id into v_id;
 insert into public.audit_events(actor_id,action,entity_type,entity_id) values(auth.uid(),'proof.share_created','proof_share',v_id::text);
 return v_id;
end $$;

create or replace function public.exchange_proof_share(p_share_id uuid,p_token_hash text,p_session_hash text) returns boolean language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from public.proof_shares where id=p_share_id and token_hash=p_token_hash and revoked_at is null and expires_at>now()) then return false; end if;
 insert into public.proof_share_sessions(share_id,session_hash,expires_at) values(p_share_id,p_session_hash,now()+interval '15 minutes'); return true;
end $$;

create or replace function public.revoke_proof_share(p_share_id uuid) returns boolean language plpgsql security definer set search_path=public as $$
declare v_changed boolean;
begin
 update public.proof_shares set revoked_at=now() where id=p_share_id and owner_id=auth.uid() and revoked_at is null returning true into v_changed;
 if coalesce(v_changed,false) then insert into public.audit_events(actor_id,action,entity_type,entity_id) values(auth.uid(),'proof.share_revoked','proof_share',p_share_id::text); end if;
 return coalesce(v_changed,false);
end $$;

create or replace function public.read_shared_proof(p_share_id uuid,p_session_hash text) returns jsonb language sql stable security definer set search_path=public as $$
select p.snapshot || jsonb_build_object('alias',lp.alias,'verified_at',p.verified_at,'data_origin',p.data_origin)
from public.proof_share_sessions ss join public.proof_shares s on s.id=ss.share_id join public.proof_items p on p.id=s.proof_id join public.learner_profiles lp on lp.user_id=p.user_id
where ss.share_id=p_share_id and ss.session_hash=p_session_hash and ss.expires_at>now() and s.revoked_at is null and s.expires_at>now() and p.state='active';
$$;

create or replace function public.request_account_deletion() returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 update public.proof_shares set revoked_at=now() where owner_id=auth.uid() and revoked_at is null;
 insert into public.deletion_requests(user_id) values(auth.uid()) returning id into v_id;
 insert into public.audit_events(actor_id,action,entity_type,entity_id) values(auth.uid(),'account.deletion_requested','deletion_request',v_id::text);
 return v_id;
end $$;

create or replace function public.get_admin_summary() returns jsonb language sql stable security definer set search_path=public as $$
select case when public.has_role(array['admin']::public.app_role[]) then jsonb_build_object(
 'review_backlog',(select count(*) from public.submissions where state in ('human_review_queued','automated_inconclusive','automated_skipped') and data_origin='live'),
 'median_review_hours',coalesce((select round(extract(epoch from percentile_cont(.5) within group(order by now()-submitted_at))/3600) from public.submissions where state in ('human_review_queued','human_review_in_progress') and data_origin='live'),0),
 'verified_live',(select count(*) from public.proof_items where state='active' and data_origin='live')) else '{}'::jsonb end;
$$;

create or replace function public.admin_create_invite(p_email_hash text,p_token_hash text,p_role public.app_role) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if not public.has_role(array['admin']::public.app_role[]) or p_role not in ('reviewer','reviewer_lead') then raise exception 'permission denied'; end if;
 insert into public.reviewer_invites(email_hash,role,token_hash,invited_by,expires_at) values(p_email_hash,p_role,p_token_hash,auth.uid(),now()+interval '7 days') returning id into v_id;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'reviewer.invited','reviewer_invite',v_id::text,jsonb_build_object('role',p_role));
 return v_id;
end $$;

create or replace function public.admin_create_opportunity(p_title text,p_organization text,p_source_url text) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if not public.has_role(array['admin']::public.app_role[]) then raise exception 'permission denied'; end if;
 insert into public.opportunities(title,organization,type,location,source_url,status,data_origin,created_by) values(trim(p_title),trim(p_organization),'Opportunity','Myanmar / Remote',p_source_url,'draft','live',auth.uid()) returning id into v_id;
 insert into public.audit_events(actor_id,action,entity_type,entity_id) values(auth.uid(),'opportunity.draft_created','opportunity',v_id::text);
 return v_id;
end $$;

grant execute on function public.bootstrap_user() to authenticated;
grant execute on function public.save_onboarding(text,text,text,text[],int,int,text) to authenticated;
grant execute on function public.get_frontend_roadmap() to authenticated;
grant execute on function public.get_today_dashboard() to authenticated;
grant execute on function public.submit_mission(text,text,text,text,text) to authenticated;
grant execute on function public.get_opportunity_readiness() to authenticated;
grant execute on function public.get_reviewer_queue() to authenticated;
grant execute on function public.claim_submission(uuid) to authenticated;
grant execute on function public.get_review_submission(uuid) to authenticated;
grant execute on function public.record_review_decision(uuid,text,text,jsonb) to authenticated;
grant execute on function public.create_proof_share(uuid,text,int) to authenticated;
grant execute on function public.revoke_proof_share(uuid) to authenticated;
grant execute on function public.request_account_deletion() to authenticated;
grant execute on function public.get_admin_summary() to authenticated;
grant execute on function public.admin_create_invite(text,text,public.app_role) to authenticated;
grant execute on function public.admin_create_opportunity(text,text,text) to authenticated;
revoke all on function public.exchange_proof_share(uuid,text,text) from public,anon,authenticated;
revoke all on function public.read_shared_proof(uuid,text) from public,anon,authenticated;
grant execute on function public.exchange_proof_share(uuid,text,text) to service_role;
grant execute on function public.read_shared_proof(uuid,text) to service_role;
revoke all on function public.recover_evaluation_jobs() from public,anon,authenticated;
revoke all on function public.dispatch_evaluation_processor() from public,anon,authenticated;
revoke all on function public.dequeue_evaluation_jobs(int) from public,anon,authenticated;
revoke all on function public.archive_evaluation_message(bigint) from public,anon,authenticated;
revoke all on function public.complete_evaluation(uuid,uuid,text,jsonb,text,text) from public,anon,authenticated;
grant execute on function public.recover_evaluation_jobs() to service_role;
grant execute on function public.dispatch_evaluation_processor() to service_role;
grant execute on function public.dequeue_evaluation_jobs(int) to service_role;
grant execute on function public.archive_evaluation_message(bigint) to service_role;
grant execute on function public.complete_evaluation(uuid,uuid,text,jsonb,text,text) to service_role;

do $$ begin perform pgmq.create('evaluation_jobs'); exception when duplicate_object then null; end $$;
select cron.schedule('lan-pya-evaluation-recovery','* * * * *',$$select public.recover_evaluation_jobs(), public.dispatch_evaluation_processor()$$);

create index submissions_user_state_idx on public.submissions(user_id,state,submitted_at desc);
create index submissions_review_queue_idx on public.submissions(state,submitted_at) where state in ('human_review_queued','automated_inconclusive','automated_skipped');
create index proof_items_user_state_idx on public.proof_items(user_id,state,verified_at desc);
create index opportunities_status_deadline_idx on public.opportunities(status,deadline);
create index audit_events_entity_idx on public.audit_events(entity_type,entity_id,created_at desc);
