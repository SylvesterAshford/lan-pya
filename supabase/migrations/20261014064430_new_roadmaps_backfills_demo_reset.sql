-- Part 3 of 3 of the 2026-10-14 consistency release; see 20261014064328.

-- 6. ---------------------------------------------------------------------
insert into public.career_tracks(id, key, title, description, version, data_origin, availability) values
('50000000-0000-0000-0000-000000000001', 'video-editor', 'Video Editor & Motion Content', 'Turn raw footage into clear, accessible stories for modern platforms.', 1, 'live', 'preview'),
('51000000-0000-0000-0000-000000000001', 'brand-visual-designer', 'Brand & Visual Content Designer', 'Solve communication problems with accessible visual systems, not isolated decoration.', 1, 'live', 'preview')
on conflict (key) do update set title = excluded.title, description = excluded.description;

insert into public.roadmap_milestones(id, track_id, key, position, title, description, proof_label)
select v.id::uuid, t.id, v.key, v.position, v.title, v.description, v.proof_label
from (values
  ('50100000-0000-0000-0000-000000000001', 'video-editor', 'video-editing-workflow', 1, 'Editing workflow', 'Set up footage, formats and a project structure that keep an edit fast and recoverable.', 'Organised edit project'),
  ('50100000-0000-0000-0000-000000000002', 'video-editor', 'video-cuts-pacing', 2, 'Cuts and pacing', 'Shape raw footage into a story with a clear hook, rhythm and continuity.', 'Two-minute story cut'),
  ('50100000-0000-0000-0000-000000000003', 'video-editor', 'video-sound-colour', 3, 'Sound and colour', 'Clean dialogue, set levels, use licensed music, and correct then grade colour so shots match.', 'Mixed and graded sequence'),
  ('50100000-0000-0000-0000-000000000004', 'video-editor', 'video-captions-motion', 4, 'Captions and motion', 'Add accurate captions, readable titles and restrained motion for vertical platforms.', 'Thirty-second vertical story edit'),
  ('50100000-0000-0000-0000-000000000005', 'video-editor', 'video-client-delivery', 5, 'Client-ready delivery', 'Deliver platform versions from a brief, handle feedback rounds, and clear rights.', 'Client-ready edit and case study'),
  ('51100000-0000-0000-0000-000000000001', 'brand-visual-designer', 'visual-problem-framing', 1, 'Visual problem framing', 'Turn a brief into a clear communication problem, audience and set of constraints.', 'Visual brief and moodboard'),
  ('51100000-0000-0000-0000-000000000002', 'brand-visual-designer', 'visual-type-hierarchy', 2, 'Type and hierarchy', 'Choose and set type so the most important message reads first, on any screen.', 'Typographic poster'),
  ('51100000-0000-0000-0000-000000000003', 'brand-visual-designer', 'visual-colour-composition', 3, 'Colour and composition', 'Use accessible colour, balance and cropping to direct attention.', 'Social post series'),
  ('51100000-0000-0000-0000-000000000004', 'brand-visual-designer', 'visual-campaign-systems', 4, 'Campaign systems', 'Build reusable rules and components that hold together across formats.', 'Mini campaign identity kit'),
  ('51100000-0000-0000-0000-000000000005', 'brand-visual-designer', 'visual-case-study', 5, 'Client-ready case study', 'Explain the process and decisions, and hand off files others can use.', 'Client-ready design case study')
) as v(id, track_key, key, position, title, description, proof_label)
join public.career_tracks t on t.key = v.track_key
on conflict (track_id, key) do update set position = excluded.position, title = excluded.title, description = excluded.description, proof_label = excluded.proof_label;

-- Frontend has been operational in production since August, set by hand; no
-- migration said so, which left every local database disagreeing with it.
update public.career_tracks set availability = 'operational' where key = 'frontend-developer';

-- 4 + 2 backfills, every learner. ----------------------------------------
-- A stage holding a verified, standing proof is proven.
insert into public.milestone_progress(user_id, milestone_id, status, source)
select proof.user_id, mission.milestone_id, 'complete', 'proof'
from public.proof_items proof
join public.submissions submission on submission.id = proof.submission_id and submission.state = 'verified'
join public.mission_definitions mission on mission.id = submission.mission_id
where proof.state = 'active'
on conflict (user_id, milestone_id) do update set status = 'complete', source = 'proof', updated_at = now();

-- Work on a learner's active path is not paused.
update public.learner_mission_work work
set state = 'active', paused_at = null, updated_at = now()
from public.mission_definitions mission
join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
join public.learner_path_history history on history.track_id = milestone.track_id and history.state = 'active'
where work.mission_id = mission.id and work.user_id = history.user_id and work.state = 'paused';

-- 5b. --------------------------------------------------------------------
-- The demo story. Frontend Developer is the active path: stages 1-2 placed by
-- the skills check, stage 3 verified (Responsive Profile Card), standing on
-- stage 4. Content Creator is the previous path: stage 1 verified
-- (Three-piece awareness campaign), position at stage 2. Anything anyone
-- added through the shared account is removed.
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

  update public.learner_profiles set alias = 'Thura', locale = 'en', goal = 'Frontend Developer', onboarding_complete = true where user_id = v_user;

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

  return jsonb_build_object('reset', true);
end $$;

revoke all on function public.reset_demo_account() from public, anon, authenticated;
grant execute on function public.reset_demo_account() to service_role;

select public.reset_demo_account();
