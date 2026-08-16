-- Content Creator track: bring the database in line with the shipped catalog.
--
-- lib/domain/career-tracks.ts has defined five Content Creator stages since
-- v0.2.0.0, but the database only ever had one. Every surface that reads the
-- catalog (the roadmap canvas) showed five stages while every surface that
-- reads the database (Home, get_active_path_dashboard) showed one. A learner on
-- this path saw "0/1 milestones" on Home and a five-stage map on Roadmaps.
--
-- Every other track already matches: frontend-developer 12, full-stack 14,
-- ai-data-analyst 13. Content Creator was the only gap.
--
-- Stage 1 is also realigned to the catalog wording. It was titled "Audience and
-- awareness campaign" with proof label "Three-piece awareness campaign", which
-- duplicated the mission title rather than naming the stage.

-- Stage 1 — realign to the catalog.
update public.roadmap_milestones
set title = 'Audience and problem research',
    description = 'Choose one specific audience, learn what they need, and turn that evidence into a useful campaign direction.',
    proof_label = 'Audience and campaign brief',
    content_version = 2
where track_id = '40000000-0000-0000-0000-000000000001'
  and key = 'content-awareness-campaign';

-- Stages 2-5 — previously missing entirely.
insert into public.roadmap_milestones(id, track_id, key, position, title, description, proof_label, content_version)
values
  ('41000000-0000-0000-0000-000000000002',
   '40000000-0000-0000-0000-000000000001',
   'content-story-system', 2,
   'Story and scripting',
   'Shape one clear message into connected pieces that fit the audience and channel.',
   'Three-piece story and script set', 1),
  ('41000000-0000-0000-0000-000000000003',
   '40000000-0000-0000-0000-000000000001',
   'content-mobile-production', 3,
   'Mobile production',
   'Produce clear, platform-native content with a dependable phone-first workflow.',
   'Published-ready visual and video drafts', 1),
  ('41000000-0000-0000-0000-000000000004',
   '40000000-0000-0000-0000-000000000001',
   'content-safe-publishing', 4,
   'Accessible and safe publishing',
   'Publish content people can understand and trust without hiding sources, uncertainty, or material AI assistance.',
   'Accessible publishing checklist', 1),
  ('41000000-0000-0000-0000-000000000005',
   '40000000-0000-0000-0000-000000000001',
   'content-case-study', 5,
   'Campaign case study',
   'Package the campaign, audience evidence, decisions, results, and lessons into portfolio-ready proof.',
   'Partner-reviewed campaign case study', 1)
on conflict (track_id, key) do update
  set position = excluded.position,
      title = excluded.title,
      description = excluded.description,
      proof_label = excluded.proof_label,
      content_version = excluded.content_version;

-- Stages 2-5 carry no mission yet: the controlled pilot has one authored
-- mission, attached to stage 1. They render as roadmap stages so the shape of
-- the journey is visible, which is the behaviour Design Spec §3.9 asks for on
-- growing roadmaps. Authoring the remaining missions is tracked in TODOS.md.
