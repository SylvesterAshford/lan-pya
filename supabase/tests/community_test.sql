-- Community privacy rules (design doc 2026-10-15, eng review D7). Everything a
-- learner can or cannot see about another learner is decided in SQL, so it is
-- tested here rather than behind a mocked RPC.
--
--   A  viewer on Frontend (starts hidden)      B  listed on Frontend
--   C  listed, then blocked by the founder     D  listed on Content Creator
--   E  hidden on Frontend                       F  listed but not onboarded
--   M  the shared demo (seeded_demo)            Z  admin
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
select ('40000000-0000-0000-0000-00000000000' || n)::uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'c' || n || '@community.test', '', now(), '{}', '{}', now(), now()
from generate_series(1, 8) n;
update public.career_tracks set availability = 'operational' where key = 'frontend-developer';

create function pg_temp.act(p_user text) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
$$;
create function pg_temp.join_path(p_user text, p_name text, p_track text) returns void language plpgsql as $$
begin
  perform pg_temp.act(p_user);
  set local role authenticated;
  perform public.bootstrap_user();
  perform public.save_career_compass(p_name,'en','4–6 hours',array['Technology'],'make','portfolio','laptop','reliable',array['HTML'],p_track,true,'test-consent-v1');
  reset role;
end $$;
-- What a caller sees, read as that caller.
create function pg_temp.community_as(p_user text, p_track text) returns jsonb language plpgsql as $$
declare v jsonb;
begin
  perform pg_temp.act(p_user);
  set local role authenticated;
  v := public.get_community(p_track);
  reset role;
  return v;
end $$;
create function pg_temp.row_for(p_view jsonb, p_alias text) returns jsonb language sql as $$
  select r from jsonb_array_elements(p_view -> 'rows') r where r ->> 'alias' = p_alias limit 1
$$;
-- Handles are read once as postgres: a learner cannot read another learner's
-- profile row, which is the point.
create temp table handles(user_id uuid primary key, handle uuid);
grant select on handles to authenticated;
create function pg_temp.handle(p_user text) returns uuid language sql as $$
  select handle from handles where user_id = p_user::uuid
$$;

select pg_temp.join_path('40000000-0000-0000-0000-000000000001', 'Aye', 'frontend-developer');
select pg_temp.join_path('40000000-0000-0000-0000-000000000002', 'Bo', 'frontend-developer');
select pg_temp.join_path('40000000-0000-0000-0000-000000000003', 'Chit', 'frontend-developer');
select pg_temp.join_path('40000000-0000-0000-0000-000000000004', 'Daw', 'content-creator');
select pg_temp.join_path('40000000-0000-0000-0000-000000000005', 'Ei', 'frontend-developer');
select pg_temp.join_path('40000000-0000-0000-0000-000000000006', 'Fa', 'frontend-developer');
select pg_temp.join_path('40000000-0000-0000-0000-000000000007', 'Demo', 'frontend-developer');
update public.learner_profiles set data_origin = 'seeded_demo' where user_id = '40000000-0000-0000-0000-000000000007';
insert into public.memberships(user_id, role) values ('40000000-0000-0000-0000-000000000008', 'admin');
insert into handles select user_id, community_handle from public.learner_profiles where user_id::text like '40000000-%';

-- ─── Writing your own settings ───────────────────────────────────────────────
select pg_temp.act('40000000-0000-0000-0000-000000000001');
set local role authenticated;
select throws_ok($$select public.update_community_settings(true, '', '', '', '')$$, 'P0001', 'community needs a link', 'cannot be listed without a link');
select throws_ok($$select public.update_community_settings(false, 'https://t.me/ab', '', '', '')$$, '23514', null, 'a Telegram name under 5 characters is refused');
select throws_ok($$select public.update_community_settings(false, 'https://t.me/+invite_link', '', '', '')$$, '23514', null, 'a Telegram group invite is refused');
select throws_ok($$select public.update_community_settings(false, '', 'https://facebook.com/x', '', '')$$, '23514', null, 'a short Facebook path is refused');
select throws_ok($$select public.update_community_settings(false, '', '', 'https://linkedin.com/company/acme', '')$$, '23514', null, 'a LinkedIn company page is refused');
select throws_ok(format($$select public.update_community_settings(false, 'https://t.me/aye_learns', '', '', %L)$$, repeat('n', 121)), '23514', null, 'a note over 120 characters is refused');
select lives_ok($$select public.update_community_settings(false, 'https://t.me/aye_learns', 'https://www.facebook.com/profile.php?id=123456', 'https://www.linkedin.com/in/aye-learns', 'Evenings only')$$, 'valid links save while hidden');
reset role;
select is((select community_visible from public.learner_profiles where user_id = '40000000-0000-0000-0000-000000000001'), false, 'saving links does not list you');

-- B, C, D, F list themselves.
select pg_temp.act('40000000-0000-0000-0000-000000000002');
set local role authenticated;
select lives_ok($$select public.update_community_settings(true, 'https://t.me/bo_builds', '', '', 'JavaScript partner wanted')$$, 'B lists themselves');
reset role;
select pg_temp.act('40000000-0000-0000-0000-000000000003');
set local role authenticated;
select lives_ok($$select public.update_community_settings(true, 'https://t.me/chit_codes', '', '', '')$$, 'C lists themselves');
reset role;
select pg_temp.act('40000000-0000-0000-0000-000000000004');
set local role authenticated;
select lives_ok($$select public.update_community_settings(true, 'https://t.me/daw_creates', '', '', '')$$, 'D lists themselves on another path');
reset role;
select pg_temp.act('40000000-0000-0000-0000-000000000006');
set local role authenticated;
select lives_ok($$select public.update_community_settings(true, 'https://t.me/fa_learner', '', '', '')$$, 'F lists themselves');
reset role;
update public.learner_profiles set onboarding_complete = false where user_id = '40000000-0000-0000-0000-000000000006';

-- The founder blocks C. A blocked learner cannot list themselves again.
update public.learner_profiles set community_blocked = true, community_visible = false where user_id = '40000000-0000-0000-0000-000000000003';
select pg_temp.act('40000000-0000-0000-0000-000000000003');
set local role authenticated;
select throws_ok($$select public.update_community_settings(true, 'https://t.me/chit_codes', '', '', '')$$, 'P0001', 'community listing paused', 'a blocked learner cannot turn the switch back on');
select lives_ok($$select public.update_community_settings(false, 'https://t.me/chit_codes', '', '', '')$$, 'a blocked learner can still edit while hidden');
reset role;
select throws_ok($$update public.learner_profiles set community_visible = true where user_id = '40000000-0000-0000-0000-000000000003'$$, '23514', null, 'blocked and visible cannot coexist, even by SQL');
select throws_ok($$update public.learner_profiles set community_visible = true where user_id = '40000000-0000-0000-0000-000000000005'$$, '23514', null, 'visible without a link cannot exist, even by SQL');

-- ─── Reading a path ──────────────────────────────────────────────────────────
set local role anon;
select throws_ok($$select public.get_community('frontend-developer')$$, '42501', null, 'signed-out visitors cannot read Community');
reset role;

select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Bo') ->> 'alias', 'Bo', 'a hidden viewer sees listed learners on the path');
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Bo') -> 'telegram', 'null'::jsonb, 'a hidden viewer gets no contact links');
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Aye') ->> 'is_me', 'true', 'the viewer gets their own row');
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Chit'), null, 'blocked learners are not listed');
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Ei'), null, 'hidden learners are not listed');
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Fa'), null, 'learners who have not finished onboarding are not listed');
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Daw'), null, 'learners on another path are not listed');
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Demo'), null, 'the shared demo is never shown to real learners');
select is((select count(*)::int from jsonb_array_elements(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer') -> 'rows') r where (r ->> 'is_sample')::boolean), 0, 'real learners never see sample learners');
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'content-creator'), 'Daw') ->> 'alias', 'Daw', 'any path can be browsed');
select ok(not (pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Bo') ? 'user_id'), 'rows never carry an account id');
select is(jsonb_array_length(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer') -> 'keys'), 12, 'the stage keys come back in order');
select is(jsonb_array_length(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Bo') -> 'statuses'), 12, 'each row carries one status per stage');

-- Reciprocity: listing yourself unlocks links.
select pg_temp.act('40000000-0000-0000-0000-000000000001');
set local role authenticated;
select lives_ok($$select public.update_community_settings(true, 'https://t.me/aye_learns', '', '', '')$$, 'A lists themselves');
reset role;
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Bo') ->> 'telegram', 'https://t.me/bo_builds', 'a listed viewer sees contact links');
select is((pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer') -> 'viewer' ->> 'visible'), 'true', 'the viewer block says the caller is listed');

-- ─── Reporting ───────────────────────────────────────────────────────────────
select pg_temp.act('40000000-0000-0000-0000-000000000005');
set local role authenticated;
select throws_ok(format($$select public.report_community_member(%L, 'spam')$$, pg_temp.handle('40000000-0000-0000-0000-000000000002')), 'P0001', 'community report not allowed', 'a learner who is not listed cannot report');
reset role;

select pg_temp.act('40000000-0000-0000-0000-000000000001');
set local role authenticated;
select throws_ok(format($$select public.report_community_member(%L, 'rude')$$, pg_temp.handle('40000000-0000-0000-0000-000000000002')), '22023', 'invalid report reason', 'an unknown reason is refused');
select throws_ok(format($$select public.report_community_member(%L, 'spam')$$, pg_temp.handle('40000000-0000-0000-0000-000000000001')), '22023', 'cannot report yourself', 'you cannot report yourself');
select throws_ok($$select public.report_community_member(gen_random_uuid(), 'spam')$$, 'P0002', 'community member not found', 'an unknown handle is refused');
select throws_ok(format($$select public.report_community_member(%L, 'spam')$$, pg_temp.handle('40000000-0000-0000-0000-000000000003')), 'P0002', 'community member not found', 'a blocked learner cannot be reported again');
select lives_ok(format($$select public.report_community_member(%L, 'harassment')$$, pg_temp.handle('40000000-0000-0000-0000-000000000002')), 'A reports B');
select lives_ok(format($$select public.report_community_member(%L, 'spam')$$, pg_temp.handle('40000000-0000-0000-0000-000000000002')), 'reporting twice is harmless');
select throws_ok($$select count(*) from public.community_reports$$, '42501', null, 'learners cannot read reports');
reset role;
select is((select count(*)::int from public.community_reports where reporter_id = '40000000-0000-0000-0000-000000000001'), 1, 'one report per person per reporter');
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000001', 'frontend-developer'), 'Bo'), null, 'a reported learner disappears for the reporter');
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000002', 'frontend-developer'), 'Aye') ->> 'alias', 'Aye', 'the reported learner is not told and still sees the reporter');
select is((select community_visible from public.learner_profiles where user_id = '40000000-0000-0000-0000-000000000002'), true, 'a report alone never hides anyone for others');

-- ─── The shared demo ─────────────────────────────────────────────────────────
select pg_temp.act('40000000-0000-0000-0000-000000000007');
set local role authenticated;
select throws_ok($$select public.update_community_settings(true, 'https://t.me/demo_learner', '', '', '')$$, 'P0001', 'demo account is read-only', 'the demo cannot change its Community settings');
select throws_ok(format($$select public.report_community_member(%L, 'spam')$$, pg_temp.handle('40000000-0000-0000-0000-000000000002')), 'P0001', 'demo account is read-only', 'the demo cannot report');
reset role;
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000007', 'frontend-developer'), 'Bo'), null, 'the demo never sees real learners');
select is(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000007', 'frontend-developer'), 'Demo') ->> 'is_me', 'true', 'the demo sees its own row');
select ok((select count(*) from jsonb_array_elements(pg_temp.community_as('40000000-0000-0000-0000-000000000007', 'frontend-developer') -> 'rows') r where (r ->> 'is_sample')::boolean) >= 5, 'the demo sees at least five sample learners');
select isnt(pg_temp.row_for(pg_temp.community_as('40000000-0000-0000-0000-000000000007', 'frontend-developer'), 'Hnin Wai') -> 'telegram', 'null'::jsonb, 'the demo sees sample links');
select is((select count(*)::int from (select track_key from public.community_sample_peers group by track_key having count(*) >= 5 and count(*) filter (where points > 0) >= 3) t), 6, 'every path has five samples, three with points');

-- ─── Admin ───────────────────────────────────────────────────────────────────
select pg_temp.act('40000000-0000-0000-0000-000000000008');
set local role authenticated;
select is((public.get_admin_summary() ->> 'community_reports')::int, 1, 'the admin sees the report count');
reset role;
select pg_temp.act('40000000-0000-0000-0000-000000000001');
set local role authenticated;
select is(public.get_admin_summary(), '{}'::jsonb, 'learners get no admin numbers');
reset role;

select * from finish();
rollback;
