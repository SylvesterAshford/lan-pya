-- One story across screens (migration 20261014100000): honest counts, paths
-- that resume, verified missions that stay verified, a demo that cannot change.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','c-learner@test','',now(),'{}','{}',now(),now()),
('40000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','c-demo@test','',now(),'{}','{}',now(),now());
update public.career_tracks set availability = 'operational' where key = 'frontend-developer';

-- A learner placed past stages 1-2 who has one verified mission on stage 3.
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"40000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select public.bootstrap_user();
select public.save_career_compass('Mya','en','4–6 hours',array['Technology'],'make','portfolio','laptop','reliable',array['HTML'],'frontend-developer',true,'t');
reset role;
insert into public.milestone_progress(user_id, milestone_id, status, source)
select '40000000-0000-0000-0000-000000000001', m.id, case when m.position <= 3 then 'complete' else 'upcoming' end, case when m.position = 3 then 'proof' else 'placement' end
from public.roadmap_milestones m join public.career_tracks t on t.id = m.track_id where t.key = 'frontend-developer' and m.position <= 4
on conflict (user_id, milestone_id) do update set status = excluded.status, source = excluded.source;
insert into public.submissions(id, user_id, mission_id, state) values ('40100000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'verified');
insert into public.proof_items(user_id, submission_id, snapshot) values ('40000000-0000-0000-0000-000000000001', '40100000-0000-0000-0000-000000000001', '{"title":"Responsive Profile Card"}');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"40000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select is((public.get_active_path_dashboard() ->> 'completed_milestones')::int, 3, 'three stages are complete');
select is((public.get_active_path_dashboard() ->> 'completed_missions')::int, 1, 'only one of them was a mission: placement is not a mission');
select is((public.get_active_path_dashboard() ->> 'verified_count')::int, 1, 'the verified proof on this path counts');
select throws_ok($$select public.submit_mission('responsive-profile-card','https://github.com/a/b','https://b.vercel.app','','A reflection that is comfortably longer than forty characters.')$$,
  'P0001', 'mission already verified', 'a verified mission cannot be submitted again');

-- Leaving a path and coming back resumes its work.
reset role;
insert into public.learner_mission_work(user_id, mission_id, state) values ('40000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'active')
on conflict (user_id, mission_id) do update set state = 'active';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"40000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select lives_ok($$select public.switch_active_path('content-creator')$$, 'switch away');
select lives_ok($$select public.switch_active_path('frontend-developer')$$, 'and back');
reset role;
select is((select state from public.learner_mission_work where user_id = '40000000-0000-0000-0000-000000000001' and mission_id = '12000000-0000-0000-0000-000000000001'), 'active', 'the Frontend mission is active again, not paused');

-- The demo account reads but cannot write.
insert into public.learner_profiles(user_id, alias, onboarding_complete, data_origin) values ('40000000-0000-0000-0000-000000000002', 'Demo', true, 'seeded_demo');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"40000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select ok(public.is_demo_session(), 'the demo session is recognised');
select lives_ok($$select public.get_active_path_dashboard()$$, 'the demo can read');
select throws_ok($$select public.switch_active_path('content-creator')$$, 'P0001', 'demo account is read-only', 'the demo cannot switch paths');
select throws_ok($$select public.update_learner_profile('Changed', null, 'traveller')$$, 'P0001', 'demo account is read-only', 'the demo cannot edit its profile');
select lives_ok($$select public.bootstrap_user()$$, 'signing in as the demo still works');

-- Anyone else is unaffected.
select set_config('request.jwt.claims','{"sub":"40000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select ok(not public.is_demo_session(), 'a learner is not the demo');
select lives_ok($$select public.update_learner_profile('Mya T', null, 'traveller')$$, 'a learner can edit their profile');

select * from finish();
rollback;
