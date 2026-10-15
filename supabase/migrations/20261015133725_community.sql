-- Community (founder, 2026-10-15): find learners on your path to learn with.
--
-- Being listed is opt-in and needs at least one contact link. Links reach only
-- learners who are listed themselves. The shared demo never sees real people:
-- it sees its own row and a fixed set of sample learners instead, so a pitch
-- shows a full page without exposing anyone.
--
--   learner_profiles ──(visible ∧ ¬blocked ∧ live ∧ active path)──┐
--                                                                  ├─ get_community(track) ─▶ rows
--   community_sample_peers ──(demo session only)───────────────────┘   (links only if the
--   community_reports ──(hide from the reporter; count for admin)       caller is visible)
--
-- The database decides who may be seen. Stage, sections and ranking are worked
-- out in lib/domain/community.ts from the raw facts returned here, with the
-- same stage rule the roadmap uses (mergeTrackMilestones).

-- ─── Profile columns ─────────────────────────────────────────────────────────

alter table public.learner_profiles
  add column if not exists community_visible boolean not null default false,
  add column if not exists community_blocked boolean not null default false,
  -- A public id for the list and for reports, so the page never carries the
  -- account id. Random per learner; can be replaced without touching the account.
  add column if not exists community_handle uuid not null default gen_random_uuid(),
  add column if not exists telegram_url text,
  add column if not exists facebook_url text,
  add column if not exists linkedin_url text,
  add column if not exists community_note text;

-- The link formats live here, so no write path can store anything else. The
-- route mirrors them (lib/validation/community-links.ts) only to say which
-- field is wrong.
alter table public.learner_profiles
  add constraint learner_profiles_community_handle_key unique (community_handle),
  add constraint learner_profiles_telegram_url_check
    check (telegram_url is null or telegram_url ~ '^https://t\.me/[A-Za-z0-9_]{5,32}$'),
  add constraint learner_profiles_facebook_url_check
    check (facebook_url is null
      or facebook_url ~ '^https://(www\.|m\.)?facebook\.com/[A-Za-z0-9.]{5,50}/?$'
      or facebook_url ~ '^https://(www\.)?facebook\.com/profile\.php\?id=[0-9]{5,20}$'),
  add constraint learner_profiles_linkedin_url_check
    check (linkedin_url is null or linkedin_url ~ '^https://(www\.)?linkedin\.com/in/[A-Za-z0-9-]{3,100}/?$'),
  add constraint learner_profiles_community_note_check
    check (community_note is null or char_length(community_note) <= 120),
  add constraint learner_profiles_community_visible_needs_link
    check (not community_visible or coalesce(telegram_url, facebook_url, linkedin_url) is not null),
  add constraint learner_profiles_community_blocked_hidden
    check (not (community_blocked and community_visible));

-- ─── Reports ─────────────────────────────────────────────────────────────────

-- A report hides the person from the reporter at once and is counted on the
-- Admin page. Blocking is a founder action (community_blocked, by SQL); there
-- is no automatic hide in v1 (TODOS.md "Community moderation v2").
create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('spam', 'fake', 'harassment', 'other')),
  created_at timestamptz not null default now(),
  unique (reporter_id, reported_user_id),
  check (reporter_id <> reported_user_id)
);
alter table public.community_reports enable row level security;
-- No policies: only the definer functions below read or write it.

-- ─── Sample learners for the demo ────────────────────────────────────────────

-- Not profiles and not users: is_demo_session() and reset_demo_account() key on
-- learner_profiles.data_origin, so samples must never live there. Returned by
-- get_community only to the demo session, labelled "Sample" in the page.
create table if not exists public.community_sample_peers (
  handle uuid primary key,
  track_key text not null,
  alias text not null,
  avatar text not null default 'traveller',
  stage_position int not null check (stage_position >= 1),
  finished boolean not null default false,
  verified int not null default 0,
  completed int not null default 0,
  points int not null default 0,
  note text,
  note_my text,
  telegram_url text,
  facebook_url text,
  linkedin_url text
);
alter table public.community_sample_peers enable row level security;

insert into public.community_sample_peers
  (handle, track_key, alias, avatar, stage_position, finished, verified, completed, points, note, note_my, telegram_url, facebook_url, linkedin_url)
values
  -- Frontend: the demo stands on stage 4.
  ('5a000000-0000-0000-0000-000000000101', 'frontend-developer', 'Su Myat Noe', 'traveller-f', 5, false, 4, 0, 400, 'Happy to review your Git history.', 'သင့် Git history ကို ကြည့်ပေးနိုင်ပါတယ်။', 'https://t.me/lanpya_sample_sumyat', null, 'https://www.linkedin.com/in/lanpya-sample-sumyat'),
  ('5a000000-0000-0000-0000-000000000102', 'frontend-developer', 'Hnin Wai', 'traveller-f', 4, false, 3, 0, 300, 'Looking for someone to do the JavaScript mission with.', 'JavaScript လုပ်ငန်းကို အတူလုပ်မယ့်သူ ရှာနေပါတယ်။', 'https://t.me/lanpya_sample_hninwai', 'https://www.facebook.com/lanpya.sample.hninwai', null),
  ('5a000000-0000-0000-0000-000000000103', 'frontend-developer', 'Min Khant', 'traveller', 6, false, 2, 1, 200, null, null, 'https://t.me/lanpya_sample_minkhant', null, null),
  ('5a000000-0000-0000-0000-000000000104', 'frontend-developer', 'Kaung Zaw', 'traveller', 4, false, 1, 2, 100, 'Studying evenings after work. Weekly check-ins?', 'အလုပ်ပြီး ညနေတွေမှာ လေ့လာပါတယ်။ အပတ်စဉ် စကားပြောကြမလား။', 'https://t.me/lanpya_sample_kaungzaw', null, null),
  ('5a000000-0000-0000-0000-000000000105', 'frontend-developer', 'Aung Kaung Myat', 'traveller', 3, false, 1, 0, 100, 'Stuck on media queries, any tips welcome.', 'Media queries မှာ ခက်နေပါတယ်။ အကြံပြုချက်တွေ ကြိုဆိုပါတယ်။', 'https://t.me/lanpya_sample_aungkaung', null, null),
  ('5a000000-0000-0000-0000-000000000106', 'frontend-developer', 'Ei Thandar', 'traveller-f', 2, false, 0, 1, 0, null, null, null, 'https://www.facebook.com/lanpya.sample.eithandar', null),
  -- Content Creator: the demo's previous path, stage 2.
  ('5a000000-0000-0000-0000-000000000201', 'content-creator', 'Thiri Aung', 'traveller-f', 3, false, 2, 0, 200, 'Want feedback on my first campaign brief.', 'ပထမဆုံး campaign brief အတွက် အကြံပြုချက် လိုချင်ပါတယ်။', 'https://t.me/lanpya_sample_thiri', null, null),
  ('5a000000-0000-0000-0000-000000000202', 'content-creator', 'Zin Mar Oo', 'traveller-f', 2, false, 1, 0, 100, null, null, 'https://t.me/lanpya_sample_zinmar', 'https://www.facebook.com/lanpya.sample.zinmar', null),
  ('5a000000-0000-0000-0000-000000000203', 'content-creator', 'Htet Naing', 'traveller', 2, false, 1, 1, 100, 'Posting a short video every week. Join me?', 'အပတ်တိုင်း ဗီဒီယိုတို တစ်ပုဒ်တင်နေပါတယ်။ အတူလုပ်မလား။', 'https://t.me/lanpya_sample_htetnaing', null, null),
  ('5a000000-0000-0000-0000-000000000204', 'content-creator', 'May Thu', 'traveller-f', 4, false, 3, 0, 300, null, null, 'https://t.me/lanpya_sample_maythu', null, 'https://www.linkedin.com/in/lanpya-sample-maythu'),
  ('5a000000-0000-0000-0000-000000000205', 'content-creator', 'Ye Lin', 'traveller', 1, false, 0, 0, 0, null, null, 'https://t.me/lanpya_sample_yelin', null, null),
  -- Video Editor: stage 2.
  ('5a000000-0000-0000-0000-000000000301', 'video-editor', 'Phyo Wai', 'traveller', 2, false, 1, 0, 100, 'Trading edits for honest feedback.', 'တစ်ယောက်ဗီဒီယိုကို တစ်ယောက် ပြန်သုံးသပ်ပေးကြရအောင်။', 'https://t.me/lanpya_sample_phyowai', null, null),
  ('5a000000-0000-0000-0000-000000000302', 'video-editor', 'Nandar Hlaing', 'traveller-f', 3, false, 2, 0, 200, null, null, 'https://t.me/lanpya_sample_nandar', 'https://www.facebook.com/lanpya.sample.nandar', null),
  ('5a000000-0000-0000-0000-000000000303', 'video-editor', 'Kyaw Zin', 'traveller', 2, false, 0, 1, 0, 'Learning colour grading on a phone.', 'ဖုန်းနဲ့ colour grading လေ့လာနေပါတယ်။', 'https://t.me/lanpya_sample_kyawzin', null, null),
  ('5a000000-0000-0000-0000-000000000304', 'video-editor', 'Yamin Aye', 'traveller-f', 4, false, 3, 0, 300, null, null, 'https://t.me/lanpya_sample_yamin', null, null),
  ('5a000000-0000-0000-0000-000000000305', 'video-editor', 'Sai Hla', 'traveller', 1, false, 0, 0, 0, null, null, 'https://t.me/lanpya_sample_saihla', null, null),
  -- Brand & Visual Designer: stage 1.
  ('5a000000-0000-0000-0000-000000000401', 'brand-visual-designer', 'Khin Lay', 'traveller-f', 1, false, 0, 1, 0, 'Looking for a critique partner for posters.', 'Poster ဒီဇိုင်းတွေ အပြန်အလှန် ဝေဖန်ပေးမယ့်သူ ရှာနေပါတယ်။', 'https://t.me/lanpya_sample_khinlay', null, null),
  ('5a000000-0000-0000-0000-000000000402', 'brand-visual-designer', 'Wai Yan', 'traveller', 2, false, 1, 0, 100, null, null, 'https://t.me/lanpya_sample_waiyan', null, null),
  ('5a000000-0000-0000-0000-000000000403', 'brand-visual-designer', 'Shwe Sin', 'traveller-f', 2, false, 2, 0, 200, null, null, 'https://t.me/lanpya_sample_shwesin', 'https://www.facebook.com/lanpya.sample.shwesin', null),
  ('5a000000-0000-0000-0000-000000000404', 'brand-visual-designer', 'Moe Kyaw', 'traveller', 3, false, 3, 0, 300, null, null, 'https://t.me/lanpya_sample_moekyaw', null, null),
  ('5a000000-0000-0000-0000-000000000405', 'brand-visual-designer', 'Hsu Myat', 'traveller-f', 1, false, 0, 0, 0, null, null, 'https://t.me/lanpya_sample_hsumyat', null, null),
  -- AI & Data Analyst: stage 1.
  ('5a000000-0000-0000-0000-000000000501', 'ai-data-analyst', 'Pyae Sone', 'traveller', 1, false, 0, 1, 0, 'Learning SQL in Mandalay. Study group?', 'မန္တလေးမှာ SQL လေ့လာနေပါတယ်။ အတူလေ့လာကြမလား။', 'https://t.me/lanpya_sample_pyaesone', null, null),
  ('5a000000-0000-0000-0000-000000000502', 'ai-data-analyst', 'Thet Htar', 'traveller-f', 2, false, 1, 0, 100, null, null, 'https://t.me/lanpya_sample_thethtar', null, 'https://www.linkedin.com/in/lanpya-sample-thethtar'),
  ('5a000000-0000-0000-0000-000000000503', 'ai-data-analyst', 'Zaw Lin', 'traveller', 3, false, 2, 0, 200, null, null, 'https://t.me/lanpya_sample_zawlin', null, null),
  ('5a000000-0000-0000-0000-000000000504', 'ai-data-analyst', 'Nwe Ni', 'traveller-f', 5, false, 4, 0, 400, null, null, 'https://t.me/lanpya_sample_nweni', null, null),
  ('5a000000-0000-0000-0000-000000000505', 'ai-data-analyst', 'Arkar Min', 'traveller', 1, false, 0, 0, 0, null, null, 'https://t.me/lanpya_sample_arkar', null, null),
  -- Full-Stack Developer: stage 1.
  ('5a000000-0000-0000-0000-000000000601', 'full-stack-developer', 'Naing Lin', 'traveller', 2, false, 1, 0, 100, 'Building my first API, happy to pair.', 'ပထမဆုံး API ကို တည်ဆောက်နေပါတယ်။ အတူလုပ်ချင်ပါတယ်။', 'https://t.me/lanpya_sample_nainglin', null, null),
  ('5a000000-0000-0000-0000-000000000602', 'full-stack-developer', 'Su Su Hlaing', 'traveller-f', 1, false, 0, 1, 0, null, null, 'https://t.me/lanpya_sample_susu', null, null),
  ('5a000000-0000-0000-0000-000000000603', 'full-stack-developer', 'Kaung Myat', 'traveller', 4, false, 3, 0, 300, null, null, 'https://t.me/lanpya_sample_kaungmyat', null, 'https://www.linkedin.com/in/lanpya-sample-kaungmyat'),
  ('5a000000-0000-0000-0000-000000000604', 'full-stack-developer', 'Ei Mon', 'traveller-f', 2, false, 2, 0, 200, null, null, 'https://t.me/lanpya_sample_eimon', null, null),
  ('5a000000-0000-0000-0000-000000000605', 'full-stack-developer', 'Lin Htet', 'traveller', 1, false, 0, 0, 0, null, null, 'https://t.me/lanpya_sample_linhtet', null, null)
on conflict (handle) do update set
  track_key = excluded.track_key, alias = excluded.alias, avatar = excluded.avatar,
  stage_position = excluded.stage_position, finished = excluded.finished, verified = excluded.verified,
  completed = excluded.completed, points = excluded.points, note = excluded.note, note_my = excluded.note_my,
  telegram_url = excluded.telegram_url, facebook_url = excluded.facebook_url, linkedin_url = excluded.linkedin_url;

-- ─── Write: the learner's own settings ───────────────────────────────────────

create or replace function public.update_community_settings(
  p_visible boolean, p_telegram text, p_facebook text, p_linkedin text, p_note text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_blocked boolean;
  v_telegram text := nullif(trim(p_telegram), '');
  v_facebook text := nullif(trim(p_facebook), '');
  v_linkedin text := nullif(trim(p_linkedin), '');
  v_note text := nullif(trim(p_note), '');
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  -- The profile table no longer carries the demo write guard (2026-10-14), so
  -- the shared account is refused here, in the words demoReadOnly() maps.
  if public.is_demo_session() then raise exception 'demo account is read-only' using errcode = 'P0001'; end if;

  select community_blocked into v_blocked from public.learner_profiles where user_id = auth.uid() for update;
  if not found then raise exception 'profile not found' using errcode = 'P0002'; end if;
  if coalesce(p_visible, false) and v_blocked then raise exception 'community listing paused' using errcode = 'P0001'; end if;
  if coalesce(p_visible, false) and coalesce(v_telegram, v_facebook, v_linkedin) is null then
    raise exception 'community needs a link' using errcode = 'P0001';
  end if;

  update public.learner_profiles set
    community_visible = coalesce(p_visible, false),
    telegram_url = v_telegram, facebook_url = v_facebook, linkedin_url = v_linkedin,
    community_note = v_note, updated_at = now()
  where user_id = auth.uid();

  return jsonb_build_object('visible', coalesce(p_visible, false), 'telegram', v_telegram,
    'facebook', v_facebook, 'linkedin', v_linkedin, 'note', v_note);
end $$;

-- ─── Read: who is on a path ──────────────────────────────────────────────────

create or replace function public.get_community(p_track_key text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_track uuid;
  v_demo boolean;
  v_visible boolean;
  v_blocked boolean;
  v_keys jsonb;
  v_rows jsonb;
begin
  if v_uid is null then raise exception 'authentication required' using errcode = '42501'; end if;
  v_demo := public.is_demo_session();
  select community_visible and not community_blocked, community_blocked
    into v_visible, v_blocked from public.learner_profiles where user_id = v_uid;
  -- The demo can see its samples' links: reciprocity treats it as listed.
  v_visible := coalesce(v_visible, false) or v_demo;

  select id into v_track from public.career_tracks where key = p_track_key and active;
  if v_track is null then
    return jsonb_build_object('viewer', jsonb_build_object('visible', v_visible, 'blocked', coalesce(v_blocked, false), 'demo', v_demo),
      'keys', '[]'::jsonb, 'rows', '[]'::jsonb);
  end if;

  select coalesce(jsonb_agg(key order by position), '[]'::jsonb) into v_keys
  from public.roadmap_milestones where track_id = v_track;

  with people as (
    select p.user_id, p.community_handle, p.alias, p.avatar, p.community_note,
           p.telegram_url, p.facebook_url, p.linkedin_url, p.user_id = v_uid as is_me
    from public.learner_profiles p
    join public.learner_path_history h on h.user_id = p.user_id and h.state = 'active' and h.track_id = v_track
    where p.user_id = v_uid
       or (not v_demo
           and p.community_visible and not p.community_blocked and p.onboarding_complete
           and p.data_origin = 'live'
           and not exists (select 1 from public.community_reports r where r.reporter_id = v_uid and r.reported_user_id = p.user_id))
  ), facts as (
    select people.*,
      (select coalesce(jsonb_agg(coalesce(mp.status, case when m.position = 1 then 'next' else 'upcoming' end) order by m.position), '[]'::jsonb)
         from public.roadmap_milestones m
         left join public.milestone_progress mp on mp.milestone_id = m.id and mp.user_id = people.user_id
         where m.track_id = v_track) as statuses,
      (select count(distinct s.mission_id)::int
         from public.submissions s
         join public.mission_definitions md on md.id = s.mission_id
         join public.roadmap_milestones m on m.id = md.milestone_id
         where s.user_id = people.user_id and s.state = 'verified' and m.track_id = v_track) as verified,
      (select count(*)::int
         from public.milestone_progress mp
         join public.roadmap_milestones m on m.id = mp.milestone_id
         where mp.user_id = people.user_id and m.track_id = v_track and mp.source = 'checked' and mp.status = 'complete') as completed,
      (select coalesce(sum(x.amount), 0)::int from public.career_quest_xp x where x.user_id = people.user_id and x.track_id = v_track) as points
    from people
  ), listed as (
    select * from facts order by is_me desc, points desc, verified desc limit 100
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'handle', community_handle, 'alias', alias, 'avatar', avatar, 'statuses', statuses,
      'verified', verified, 'completed', completed, 'points', points, 'note', community_note, 'note_my', null,
      'telegram', case when v_visible then telegram_url end,
      'facebook', case when v_visible then facebook_url end,
      'linkedin', case when v_visible then linkedin_url end,
      'is_me', is_me, 'is_sample', false)), '[]'::jsonb)
  into v_rows from listed;

  if v_demo then
    v_rows := v_rows || coalesce((
      select jsonb_agg(jsonb_build_object(
        'handle', s.handle, 'alias', s.alias, 'avatar', s.avatar,
        'statuses', (select coalesce(jsonb_agg(case
            when s.finished or m.position < s.stage_position then 'complete'
            when m.position = s.stage_position then 'active'
            else 'upcoming' end order by m.position), '[]'::jsonb)
          from public.roadmap_milestones m where m.track_id = v_track),
        'verified', s.verified, 'completed', s.completed, 'points', s.points,
        'note', s.note, 'note_my', s.note_my,
        'telegram', s.telegram_url, 'facebook', s.facebook_url, 'linkedin', s.linkedin_url,
        'is_me', false, 'is_sample', true) order by s.handle)
      from public.community_sample_peers s where s.track_key = p_track_key), '[]'::jsonb);
  end if;

  return jsonb_build_object(
    'viewer', jsonb_build_object('visible', v_visible, 'blocked', coalesce(v_blocked, false), 'demo', v_demo),
    'keys', v_keys, 'rows', v_rows);
end $$;

-- ─── Report ──────────────────────────────────────────────────────────────────

create or replace function public.report_community_member(p_handle uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_target uuid;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if public.is_demo_session() then raise exception 'demo account is read-only' using errcode = 'P0001'; end if;
  if p_reason is null or p_reason not in ('spam', 'fake', 'harassment', 'other') then
    raise exception 'invalid report reason' using errcode = '22023';
  end if;
  -- Only listed, onboarded learners can report, so a throwaway sign-up cannot.
  if not exists (select 1 from public.learner_profiles
                 where user_id = auth.uid() and onboarding_complete and community_visible and not community_blocked) then
    raise exception 'community report not allowed' using errcode = 'P0001';
  end if;
  select user_id into v_target from public.learner_profiles
  where community_handle = p_handle and community_visible and not community_blocked and data_origin = 'live';
  if v_target is null then raise exception 'community member not found' using errcode = 'P0002'; end if;
  if v_target = auth.uid() then raise exception 'cannot report yourself' using errcode = '22023'; end if;

  insert into public.community_reports(reporter_id, reported_user_id, reason)
  values (auth.uid(), v_target, p_reason)
  on conflict (reporter_id, reported_user_id) do nothing;
  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'community.reported', 'learner_profile', p_handle::text, jsonb_build_object('reason', p_reason));
  return jsonb_build_object('reported', true);
end $$;

-- ─── Admin: reports in the last 30 days ──────────────────────────────────────

create or replace function public.get_admin_summary() returns jsonb language sql stable security definer set search_path=public as $$
select case when public.has_role(array['admin']::public.app_role[]) then jsonb_build_object(
 'review_backlog',(select count(*) from public.submissions where state in ('human_review_queued','automated_inconclusive','automated_skipped') and data_origin='live'),
 'median_review_hours',coalesce((select round(extract(epoch from percentile_cont(.5) within group(order by now()-submitted_at))/3600) from public.submissions where state in ('human_review_queued','human_review_in_progress') and data_origin='live'),0),
 'verified_live',(select count(*) from public.proof_items where state='active' and data_origin='live'),
 'community_reports',(select count(*) from public.community_reports where created_at > now() - interval '30 days')) else '{}'::jsonb end;
$$;

-- ─── Grants ──────────────────────────────────────────────────────────────────

-- Functions are executable by PUBLIC by default; revoking only anon would leave
-- them callable. Revoke all, then grant signed-in learners.
revoke all on function public.update_community_settings(boolean, text, text, text, text) from public, anon, authenticated;
revoke all on function public.get_community(text) from public, anon, authenticated;
revoke all on function public.report_community_member(uuid, text) from public, anon, authenticated;
grant execute on function public.update_community_settings(boolean, text, text, text, text) to authenticated;
grant execute on function public.get_community(text) to authenticated;
grant execute on function public.report_community_member(uuid, text) to authenticated;
revoke all on table public.community_reports from anon, authenticated;
revoke all on table public.community_sample_peers from anon, authenticated;
