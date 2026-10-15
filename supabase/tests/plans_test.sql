-- Plans and pricing: the learner waitlist and partner inquiries (2026-10-15).
--   L1 learner   L2 another learner   M the shared demo   Z admin
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
select ('50000000-0000-0000-0000-00000000000' || n)::uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'p' || n || '@plans.test', '', now(), '{}', '{}', now(), now()
from generate_series(1, 4) n;

create function pg_temp.act(p_user text) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
$$;

select pg_temp.act('50000000-0000-0000-0000-000000000003');
set local role authenticated;
select lives_ok($$select public.bootstrap_user()$$, 'the demo-to-be bootstraps');
reset role;
update public.learner_profiles set data_origin = 'seeded_demo' where user_id = '50000000-0000-0000-0000-000000000003';
insert into public.memberships(user_id, role) values ('50000000-0000-0000-0000-000000000004', 'admin');

-- ─── Waitlist ────────────────────────────────────────────────────────────────
set local role anon;
select throws_ok($$select public.join_plan_waitlist('pro', 'monthly')$$, '42501', null, 'signed-out visitors cannot join the waitlist');
reset role;

select pg_temp.act('50000000-0000-0000-0000-000000000001');
set local role authenticated;
select throws_ok($$select public.join_plan_waitlist('pro', 'three_months')$$, '22023', 'invalid plan', 'Pro is not sold for three months');
select throws_ok($$select public.join_plan_waitlist('career_plus', 'six_months')$$, '22023', 'invalid plan', 'Career+ is not sold for six months');
select throws_ok($$select public.join_plan_waitlist('enterprise', 'monthly')$$, '22023', 'invalid plan', 'unknown plans are refused');
select is((public.join_plan_waitlist('pro', 'monthly') ->> 'recorded'), 'true', 'a learner joins the Pro waitlist');
select is((public.join_plan_waitlist('pro', 'six_months') ->> 'billing'), 'six_months', 'joining again changes the period');
select lives_ok($$select public.join_plan_waitlist('career_plus', 'three_months')$$, 'a learner can wait for both plans');
select is((select count(*)::int from public.plan_waitlist), 2, 'a learner reads their own waitlist rows');
select is((select billing from public.plan_waitlist where plan = 'pro'), 'six_months', 'one row per plan, holding the latest period');
select throws_ok($$insert into public.plan_waitlist(user_id, plan, billing) values ('50000000-0000-0000-0000-000000000001', 'pro', 'monthly')$$, '42501', null, 'the table cannot be written directly');
reset role;

select pg_temp.act('50000000-0000-0000-0000-000000000002');
set local role authenticated;
select is((select count(*)::int from public.plan_waitlist), 0, 'a learner cannot see anyone else on the waitlist');
reset role;

select pg_temp.act('50000000-0000-0000-0000-000000000003');
set local role authenticated;
select is((public.join_plan_waitlist('pro', 'monthly') ->> 'recorded'), 'false', 'the demo can press the button in a pitch');
reset role;
select is((select count(*)::int from public.plan_waitlist where user_id = '50000000-0000-0000-0000-000000000003'), 0, 'but the demo is never counted as demand');

-- ─── Partner inquiries ───────────────────────────────────────────────────────
set local role anon;
select is((public.submit_partner_inquiry('employer', 'Yangon Tech Co', 'Daw Su', 'hr@yangontech.example', 'Two frontend interns') ->> 'received'), 'true', 'a signed-out employer can send an inquiry');
select is((public.submit_partner_inquiry('employer', 'Yangon Tech Co', 'Daw Su', 'HR@yangontech.example', 'again') ->> 'duplicate'), 'true', 'the same contact within ten minutes is not stored twice');
select throws_ok($$select public.submit_partner_inquiry('investor', 'X Fund', 'Ko Ko', 'ko@fund.example', '')$$, '22023', 'invalid inquiry', 'unknown inquiry kinds are refused');
select throws_ok($$select public.submit_partner_inquiry('university', 'U', 'Ko Ko', 'ko@uni.example', '')$$, '23514', null, 'an organisation name needs at least two characters');
select throws_ok($$select count(*) from public.partner_inquiries$$, '42501', null, 'visitors cannot read inquiries');
reset role;
select is((select count(*)::int from public.partner_inquiries), 1, 'one inquiry stored');

select pg_temp.act('50000000-0000-0000-0000-000000000001');
set local role authenticated;
select is(public.get_partner_inquiries(), '[]'::jsonb, 'learners cannot list inquiries');
select is(public.get_admin_summary(), '{}'::jsonb, 'learners get no admin numbers');
reset role;

select pg_temp.act('50000000-0000-0000-0000-000000000004');
set local role authenticated;
select is(jsonb_array_length(public.get_partner_inquiries()), 1, 'the admin lists inquiries');
select is((public.get_partner_inquiries() -> 0 ->> 'organization'), 'Yangon Tech Co', 'with the organisation');
select is((public.get_admin_summary() ->> 'waitlist_pro')::int, 1, 'the admin sees the Pro waitlist');
select is((public.get_admin_summary() ->> 'waitlist_career_plus')::int, 1, 'and the Career+ waitlist');
select is((public.get_admin_summary() ->> 'partner_inquiries')::int, 1, 'and the inquiries');
reset role;

select * from finish();
rollback;
