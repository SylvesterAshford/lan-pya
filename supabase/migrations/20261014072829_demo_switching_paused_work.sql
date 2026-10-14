-- Part 1 of 2 of the 2026-10-14 demo-switching change; see 20261014072920 for the nightly reset.

-- The demo account can switch paths, and resets itself every night
-- (founder decision, 2026-10-14).
--
-- Switching between career paths is part of every pitch, and it is safe now:
-- switch_active_path pauses the path you leave and resumes the one you return
-- to, so it cannot recreate the contradictions reset_demo_account() removed.
-- Submitting work, editing the profile and the Career Compass stay blocked.
-- Every night at 03:00 Yangon time (20:30 UTC) the demo returns to its story,
-- so each day starts the same whatever the last viewer chose.
--
-- The story also gains history on the newer roadmaps, so the demo shows a
-- person already working through them: Video Editor stage 1 done and on
-- stage 2, Brand & Visual Designer on stage 1. Those tracks have no missions
-- yet, so they are progress on a roadmap, not paths to switch to.

-- Paused work is work to resume. A verified mission is finished, so it is not
-- offered as "Resume" after a path switch.
create or replace function public.get_active_path_dashboard()
returns jsonb language sql stable security definer set search_path=public as $$
with active_path as (
  select history.id as history_id, track.id as track_id, track.key, track.title, track.description, track.availability
  from public.learner_path_history history
  join public.career_tracks track on track.id = history.track_id
  where history.user_id = auth.uid() and history.state = 'active'
), progress as (
  select coalesce(round(100.0 * count(*) filter (where status = 'complete') / nullif(count(*), 0)), 0)::int as percent,
         count(*) filter (where status = 'complete')::int as completed,
         count(*) filter (where status = 'complete' and source in ('checked', 'proof'))::int as missions,
         count(*)::int as total
  from public.roadmap_milestones milestone
  join active_path path on path.track_id = milestone.track_id
  left join public.milestone_progress milestone_progress on milestone_progress.milestone_id = milestone.id and milestone_progress.user_id = auth.uid()
), verified as (
  select count(*)::int as total
  from public.proof_items proof
  join public.submissions submission on submission.id = proof.submission_id
  join public.mission_definitions mission on mission.id = submission.mission_id
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  join active_path path on path.track_id = milestone.track_id
  where proof.user_id = auth.uid() and proof.state = 'active'
), xp as (
  select coalesce(sum(xp.amount), 0)::int as total
  from public.career_quest_xp xp
  join active_path path on path.track_id = xp.track_id
  where xp.user_id = auth.uid()
), next_mission as (
  select mission.key, mission.title, mission.brief, work.state as work_state,
         submission.state as submission_state
  from public.mission_definitions mission
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  join active_path path on path.track_id = milestone.track_id
  left join public.learner_mission_work work on work.mission_id = mission.id and work.user_id = auth.uid()
  left join lateral (
    select state from public.submissions
    where user_id = auth.uid() and mission_id = mission.id
    order by updated_at desc limit 1
  ) submission on true
  where mission.active
  order by case work.state when 'active' then 0 when 'paused' then 1 else 2 end, milestone.position, mission.version desc
  limit 1
), paused_work as (
  select coalesce(jsonb_agg(jsonb_build_object('mission_key', mission.key, 'mission_title', mission.title, 'path_key', track.key, 'path_title', track.title) order by work.updated_at desc), '[]'::jsonb) as items
  from public.learner_mission_work work
  join public.mission_definitions mission on mission.id = work.mission_id
  join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
  join public.career_tracks track on track.id = milestone.track_id
  where work.user_id = auth.uid() and work.state = 'paused'
    and track.id is distinct from (select track_id from active_path)
    and not exists (select 1 from public.submissions done where done.user_id = auth.uid() and done.mission_id = mission.id and done.state = 'verified')
)
select jsonb_build_object(
  'active_path', (select jsonb_build_object('key', key, 'title', title, 'description', description, 'availability', availability) from active_path),
  'progress_percent', (select percent from progress),
  'completed_milestones', (select completed from progress),
  'completed_missions', (select missions from progress),
  'total_milestones', (select total from progress),
  'verified_count', (select total from verified),
  'streak_days', 0,
  'xp', (select total from xp),
  'level', greatest(1, floor((select total from xp) / 100.0)::int + 1),
  'xp_to_next', greatest(100 - mod((select total from xp), 100), 0),
  'next_mission', (select jsonb_build_object('key', key, 'title', title, 'brief', brief, 'work_state', coalesce(work_state, 'available'), 'submission_state', submission_state) from next_mission),
  'paused_work', (select items from paused_work)
);
$$;

drop trigger if exists demo_read_only on public.learner_path_history;
drop trigger if exists demo_read_only on public.learner_mission_work;
