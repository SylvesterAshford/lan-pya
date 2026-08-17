-- Backfill XP for verified submissions that never received a ledger row.
--
-- `record_review_decision` awards 100 XP whenever a reviewer verifies a
-- submission, and that path works. Seeded demo submissions, however, were
-- inserted into `submissions` with state='verified' directly by earlier
-- migrations, which bypasses the RPC entirely. Those learners hold verified
-- proof that carries no XP.
--
-- This surfaced the moment the level meter shipped: the demo learner has a
-- verified `responsive-profile-card` on the Frontend Developer path and read
-- as "Explorer, 0 XP", because the only XP row it owned was on a different
-- track (`content-creator`), and path XP never transfers between careers.
--
-- This awards the XP those submissions already earned. It invents no
-- submissions and no proof: every row inserted here is anchored to a
-- submission that is already `verified` and already has a proof item.

insert into public.career_quest_xp (user_id, submission_id, track_id, amount, reason)
select
  submission.user_id,
  submission.id,
  milestone.track_id,
  100,
  'verified_core_mission'
from public.submissions submission
join public.mission_definitions mission on mission.id = submission.mission_id
join public.roadmap_milestones milestone on milestone.id = mission.milestone_id
where submission.state = 'verified'
  -- Only submissions that actually produced proof. A verified state with no
  -- proof item would mean something went wrong upstream, and this migration
  -- must not paper over that by granting XP for it anyway.
  and exists (select 1 from public.proof_items proof where proof.submission_id = submission.id)
on conflict (submission_id) do nothing;
