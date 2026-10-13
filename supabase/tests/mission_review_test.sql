-- The two review tiers (SPEC.md section 3.1): a link check gives Completed,
-- only a human review gives proof and XP, and each reviewer outcome moves the
-- trail map exactly as decided (D3 to D5).
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','learner@review.test','',now(),'{}','{}',now(),now()),
('30000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reviewer@review.test','',now(),'{}','{}',now(),now());
insert into public.memberships(user_id, role) values ('30000000-0000-0000-0000-000000000002', 'reviewer');
-- Production runs Frontend as operational; no migration sets it, so match it here.
update public.career_tracks set availability = 'operational' where key = 'frontend-developer';

-- Helpers read as postgres, so RLS does not hide what is being asserted.
create function pg_temp.active_submission() returns uuid language sql as $$
  select id from public.submissions where user_id = '30000000-0000-0000-0000-000000000001' and state not in ('rejected','verified') limit 1
$$;
create function pg_temp.job(p uuid) returns uuid language sql as $$ select id from public.evaluation_jobs where submission_id = p $$;
create function pg_temp.milestone() returns text language sql as $$
  select coalesce(mp.status || '/' || mp.source, 'none')
  from public.mission_definitions m
  left join public.milestone_progress mp on mp.milestone_id = m.milestone_id and mp.user_id = '30000000-0000-0000-0000-000000000001'
  where m.key = 'responsive-profile-card' and m.active limit 1
$$;
create function pg_temp.state(p uuid) returns text language sql as $$ select state::text from public.submissions where id = p $$;

-- Learner joins the Frontend path and submits.
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated","name":"Review Learner"}',true);
select lives_ok($$select public.bootstrap_user()$$, 'learner bootstraps');
select lives_ok($$select public.save_career_compass('Review Learner','en','4–6 hours',array['Technology'],'make','portfolio','laptop','reliable',array['HTML'],'frontend-developer',true,'test-consent-v1')$$, 'learner joins the Frontend path');
select lives_ok($$select public.submit_mission('responsive-profile-card','https://github.com/a/b','https://b.vercel.app','','A reflection that is comfortably longer than forty characters.')$$, 'learner submits');
select throws_ok($$select public.complete_evaluation(gen_random_uuid(), gen_random_uuid(), 'pass', '[]'::jsonb, 'x', 'test')$$, '42501', null, 'a learner cannot record a link check');
reset role;

-- A broken link goes back to the learner and never reaches a reviewer.
select lives_ok(format($$select public.complete_evaluation(%L, %L, 'feedback', '[]'::jsonb, 'Live site returned 404', 'test')$$, pg_temp.job(pg_temp.active_submission()), pg_temp.active_submission()), 'checker records a broken link');
select is(pg_temp.state(pg_temp.active_submission()), 'automated_feedback_ready', 'broken link: back to the learner');
select isnt(pg_temp.milestone(), 'complete/checked', 'broken link: the map does not move');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select lives_ok($$select public.submit_mission('responsive-profile-card','https://github.com/a/b','https://b2.vercel.app','','A reflection that is comfortably longer than forty characters.')$$, 'learner resubmits after fixing the link');
reset role;

-- A working link makes the mission Completed: the map moves, nothing else.
select lives_ok(format($$select public.complete_evaluation(%L, %L, 'pass', '[]'::jsonb, 'ok', 'test')$$, pg_temp.job(pg_temp.active_submission()), pg_temp.active_submission()), 'checker records a pass');
select is(pg_temp.state(pg_temp.active_submission()), 'human_review_queued', 'pass: waiting for a human');
select is(pg_temp.milestone(), 'complete/checked', 'pass: the milestone is complete, marked as checked');
select is((select count(*)::int from public.proof_items where user_id = '30000000-0000-0000-0000-000000000001'), 0, 'Completed creates no proof');
select is((select count(*)::int from public.career_quest_xp where user_id = '30000000-0000-0000-0000-000000000001'), 0, 'Completed awards no XP');

-- Reviewer asks for changes: the learner keeps their place on the map.
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"30000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select ok((select jsonb_array_length(public.get_reviewer_queue()) >= 1), 'reviewer sees the submission in the queue');
select ok((public.get_review_submission(pg_temp.active_submission()) ->> 'mission_key') = 'responsive-profile-card', 'reviewer can read it before claiming');
select ok(public.claim_submission(pg_temp.active_submission()), 'reviewer claims');
select lives_ok(format($$select public.record_review_decision(%L,'request_changes','Please add visible focus styles to the links.','{"semantic":3,"responsive":3,"accessible":1,"explanation":3}'::jsonb)$$, pg_temp.active_submission()), 'reviewer requests changes');
reset role;
select is(pg_temp.state(pg_temp.active_submission()), 'changes_requested', 'state is changes_requested');
select is(pg_temp.milestone(), 'complete/checked', 'request_changes keeps the map position');

-- Learner resubmits, the check passes, and the reviewer rejects.
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select lives_ok($$select public.submit_mission('responsive-profile-card','https://github.com/a/b','https://b3.vercel.app','','A reflection that is comfortably longer than forty characters.')$$, 'learner resubmits after changes');
reset role;
select lives_ok(format($$select public.complete_evaluation(%L, %L, 'pass', '[]'::jsonb, 'ok', 'test')$$, pg_temp.job(pg_temp.active_submission()), pg_temp.active_submission()), 'second check passes');
create temp table rejected_one as select pg_temp.active_submission() as id;
grant select on rejected_one to authenticated;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"30000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select ok(public.claim_submission((select id from rejected_one)), 'reviewer claims again');
select lives_ok($$select public.record_review_decision((select id from rejected_one),'reject','These links do not contain the profile card at all.','{"semantic":0,"responsive":0,"accessible":0,"explanation":0}'::jsonb)$$, 'reviewer rejects');
reset role;
select is(pg_temp.state((select id from rejected_one)), 'rejected', 'state is rejected');
select is(pg_temp.milestone(), 'active/placement', 'reject returns only the checked milestone to active');

-- A new attempt, a pass, and a verify: proof and XP come only from here.
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select lives_ok($$select public.submit_mission('responsive-profile-card','https://github.com/a/c','https://c.vercel.app','','A new attempt with a reflection longer than forty characters.')$$, 'learner starts a new attempt after rejection');
reset role;
select lives_ok(format($$select public.complete_evaluation(%L, %L, 'inconclusive', '[]'::jsonb, 'cannot tell', 'test')$$, pg_temp.job(pg_temp.active_submission()), pg_temp.active_submission()), 'check is inconclusive');
select is(pg_temp.milestone(), 'complete/checked', 'inconclusive also counts as Completed');
create temp table verified_one as select pg_temp.active_submission() as id;
grant select on verified_one to authenticated;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"30000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select ok(public.claim_submission((select id from verified_one)), 'reviewer claims the inconclusive one');
select lives_ok($$select public.record_review_decision((select id from verified_one),'verify','Semantic, responsive and accessible; reflection names the trade-off.','{"semantic":4,"responsive":3,"accessible":3,"explanation":3}'::jsonb)$$, 'reviewer verifies');
reset role;
select is(pg_temp.milestone(), 'complete/proof', 'verify upgrades the milestone to proof');
select is((select count(*)::int from public.proof_items where user_id = '30000000-0000-0000-0000-000000000001'), 1, 'verify creates exactly one proof');
select is((select coalesce(sum(amount),0)::int from public.career_quest_xp where user_id = '30000000-0000-0000-0000-000000000001'), 100, 'verify awards 100 XP');

-- A late link check never downgrades a proof milestone.
select lives_ok(format($$select public.complete_evaluation(%L, %L, 'pass', '[]'::jsonb, 'ok', 'test')$$, pg_temp.job((select id from verified_one)), (select id from verified_one)), 'a stray check runs on verified work');
select is(pg_temp.milestone(), 'complete/proof', 'a check never overwrites a proof milestone');
select is(pg_temp.state((select id from verified_one)), 'verified', 'a stray check never re-queues verified work');

select * from finish();
rollback;
