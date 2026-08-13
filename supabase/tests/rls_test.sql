begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(14);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','learner@example.test','',now(),'{}','{}',now(),now()),
('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','other@example.test','',now(),'{}','{}',now(),now());

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated","name":"Test Learner"}',true);
select lives_ok($$select public.bootstrap_user()$$,'authenticated user can bootstrap');
select is((select count(*)::int from public.learner_profiles),1,'learner sees own profile');
select is((select count(*)::int from public.memberships where role='learner'),1,'learner sees own membership');
select throws_ok($$insert into public.learner_profiles(user_id,alias) values('20000000-0000-0000-0000-000000000002','Other')$$,'42501',null,'learner cannot insert another profile directly');
select ok((select count(*) from public.career_tracks where active)>0,'authenticated learner reads curriculum');
select ok((select count(*) from public.opportunities where status='published')>0,'authenticated learner reads published opportunities');
select is((select count(*)::int from public.audit_events),0,'learner cannot read audit events');
select throws_ok($$select public.admin_create_opportunity('Bad','Actor','https://example.test')$$,null,null,'learner cannot use admin workflow');
select is((public.get_admin_summary()),'{}'::jsonb,'learner receives no admin metrics');
select lives_ok($$select public.save_career_compass('Test Learner','en','4–6 hours',array['Technology'],'make','portfolio','laptop','reliable',array['HTML'],'frontend-developer',true,'test-consent-v1')$$,'learner can save private Career Compass answers');
select is((select count(*)::int from public.career_preferences),1,'learner reads own private preferences');
select is((select count(*)::int from public.learner_path_history where state='active'),1,'Career Compass creates exactly one active path');
select lives_ok($$select public.switch_active_path('content-creator')$$,'learner can switch to the controlled pilot');
select is((select count(*)::int from public.learner_path_history where state='active'),1,'path switch keeps exactly one active path');
select * from finish();
rollback;
