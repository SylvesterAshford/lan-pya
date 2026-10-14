-- The roadmap says how each stage was completed, not only that it was.
--
-- Stages a learner skipped by the onboarding skills check ('placement'), stages
-- whose mission passed the link check ('checked') and stages verified by a
-- reviewer ('proof') were all returned as plain 'complete', so the trail map
-- drew three identical checks while the Completed list showed one mission.
-- Additive: one more key in each row; existing readers ignore it.
create or replace function public.get_roadmap(p_track_key text)
returns jsonb language sql stable security definer set search_path=public as $$
select coalesce(jsonb_agg(jsonb_build_object(
  'key',m.key,
  'order',m.position,
  'title',m.title,
  'description',m.description,
  'proof',m.proof_label,
  'status',coalesce(p.status,case when m.position=1 then 'next' else 'upcoming' end),
  'source',p.source
) order by m.position),'[]'::jsonb)
from public.roadmap_milestones m
join public.career_tracks t on t.id=m.track_id
left join public.milestone_progress p on p.milestone_id=m.id and p.user_id=auth.uid()
where t.key=p_track_key and t.active;
$$;
