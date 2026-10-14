-- The demo account may edit its profile: name, line and character (founder
-- request, 2026-10-14). A pitch shows personalising the profile, and a profile
-- edit touches nothing but the profile row, so it cannot contradict the
-- demo's progress. The nightly reset puts name, line and character back.
-- Submitting work and rewriting the Career Compass stay blocked.

drop trigger if exists demo_read_only on public.learner_profiles;

create or replace function public.reset_demo_account() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid;
  v_fe_track uuid; v_cc_track uuid;
  v_fe_mission uuid := '12000000-0000-0000-0000-000000000001';
  v_cc_mission uuid := '42000000-0000-0000-0000-000000000001';
  v_fe_submission uuid := '16200000-0000-0000-0000-000000000001';
  v_cc_submission uuid := '16600000-0000-0000-0000-000000000001';
  v_fe_proof uuid := '16400000-0000-0000-0000-000000000001';
  v_cc_proof uuid := '16700000-0000-0000-0000-000000000001';
begin
  select user_id into v_user from public.learner_profiles where data_origin = 'seeded_demo' order by user_id limit 1;
  if v_user is null then return jsonb_build_object('reset', false, 'reason', 'no demo profile'); end if;
  select id into v_fe_track from public.career_tracks where key = 'frontend-developer';
  select id into v_cc_track from public.career_tracks where key = 'content-creator';

  update public.learner_profiles set alias = 'Thura', headline = null, avatar = 'traveller-f', locale = 'en', goal = 'Frontend Developer', onboarding_complete = true where user_id = v_user;

  -- Work added through the shared account, and anything hanging off it.
  delete from public.proof_items where user_id = v_user and submission_id not in (v_fe_submission, v_cc_submission);
  delete from public.career_quest_xp where user_id = v_user and submission_id not in (v_fe_submission, v_cc_submission);
  delete from public.submissions where user_id = v_user and id not in (v_fe_submission, v_cc_submission);

  -- The two seeded, verified missions.
  insert into public.submissions(id, user_id, mission_id, state, attempt, current_version, data_origin) values
    (v_fe_submission, v_user, v_fe_mission, 'verified', 1, 1, 'seeded_demo'),
    (v_cc_submission, v_user, v_cc_mission, 'verified', 1, 1, 'seeded_demo')
  on conflict (id) do update set state = 'verified', current_version = 1, data_origin = 'seeded_demo';
  insert into public.submission_versions(submission_id, version, repository_url, deployment_url, screenshot_url, reflection, immutable_payload_hash) values
    (v_fe_submission, 1, 'https://github.com/example/responsive-profile-card', 'https://example.com/responsive-profile-card', null,
     'This prepared demo record shows how responsive layout, semantic HTML, and accessible structure become one inspectable proof item.', 'demo-responsive-profile-card-v1'),
    (v_cc_submission, 1, 'https://example.com/lan-pya-demo/audience-brief', 'https://example.com/lan-pya-demo/campaign', null,
     'A prepared demo record: one named audience, evidence for the problem, and the campaign direction that followed from it.', 'demo-content-awareness-v1')
  on conflict (submission_id, version) do nothing;

  insert into public.proof_items(id, user_id, submission_id, state, snapshot, verified_at, data_origin) values
    (v_fe_proof, v_user, v_fe_submission, 'active', jsonb_build_object(
      'title', 'Responsive Profile Card', 'rubric_version', 'responsive-profile-card-rubric-v1', 'reviewer_tier', 'Prepared demo review',
      'competencies', jsonb_build_array('Semantic HTML', 'Responsive CSS', 'Accessible structure'),
      'repository_url', 'https://github.com/example/responsive-profile-card', 'deployment_url', 'https://example.com/responsive-profile-card'),
     '2026-08-10T10:00:00Z', 'seeded_demo'),
    (v_cc_proof, v_user, v_cc_submission, 'active', jsonb_build_object(
      'title', 'Three-piece awareness campaign', 'rubric_version', 'content-creator-awareness-rubric-v1', 'reviewer_tier', 'Prepared demo review',
      'competencies', jsonb_build_array('Audience research', 'Content strategy', 'Accessible publishing', 'Ethical communication'),
      'repository_url', 'https://example.com/lan-pya-demo/audience-brief', 'deployment_url', 'https://example.com/lan-pya-demo/campaign'),
     '2026-08-12T09:00:00Z', 'seeded_demo')
  on conflict (id) do update set state = 'active', snapshot = excluded.snapshot;

  insert into public.career_quest_xp(user_id, submission_id, track_id, amount, reason) values
    (v_user, v_fe_submission, v_fe_track, 100, 'verified_core_mission'),
    (v_user, v_cc_submission, v_cc_track, 100, 'verified_core_mission')
  on conflict (submission_id) do update set amount = 100, track_id = excluded.track_id;

  -- Paths: Frontend now, Content Creator before.
  delete from public.learner_path_history where user_id = v_user;
  insert into public.learner_path_history(user_id, track_id, state, source, last_activated_at, deactivated_at) values
    (v_user, v_cc_track, 'previous', 'career_compass', '2026-08-12T09:00:00Z', '2026-08-13T09:00:00Z'),
    (v_user, v_fe_track, 'active', 'path_switch', '2026-08-13T09:00:00Z', null);

  delete from public.learner_mission_work where user_id = v_user;
  insert into public.learner_mission_work(user_id, mission_id, state, paused_at) values
    (v_user, v_fe_mission, 'active', null),
    (v_user, v_cc_mission, 'paused', '2026-08-13T09:00:00Z');

  -- Positions on both maps.
  delete from public.milestone_progress where user_id = v_user;
  insert into public.milestone_progress(user_id, milestone_id, status, source)
  select v_user, m.id,
    case when m.position <= 3 then 'complete' when m.position = 4 then 'active' when m.position = 5 then 'next' else 'upcoming' end,
    case when m.position = 3 then 'proof' else 'placement' end
  from public.roadmap_milestones m where m.track_id = v_fe_track;
  insert into public.milestone_progress(user_id, milestone_id, status, source)
  select v_user, m.id,
    case when m.position = 1 then 'complete' when m.position = 2 then 'active' when m.position = 3 then 'next' else 'upcoming' end,
    case when m.position = 1 then 'proof' else 'placement' end
  from public.roadmap_milestones m where m.track_id = v_cc_track;

  -- Roadmap progress on the newer tracks, a learner already working through them.
  insert into public.milestone_progress(user_id, milestone_id, status, source)
  select v_user, m.id,
    case when m.position = 1 then 'complete' when m.position = 2 then 'active' when m.position = 3 then 'next' else 'upcoming' end,
    'placement'
  from public.roadmap_milestones m join public.career_tracks t on t.id = m.track_id where t.key = 'video-editor';
  insert into public.milestone_progress(user_id, milestone_id, status, source)
  select v_user, m.id,
    case when m.position = 1 then 'active' when m.position = 2 then 'next' else 'upcoming' end,
    'placement'
  from public.roadmap_milestones m join public.career_tracks t on t.id = m.track_id where t.key = 'brand-visual-designer';

  return jsonb_build_object('reset', true);
end $$;

revoke all on function public.reset_demo_account() from public, anon, authenticated;
grant execute on function public.reset_demo_account() to service_role;
