import { Link } from "@/i18n/navigation";
import { LevelMeter } from "@/components/app/level-meter";
import { RoadmapTree } from "@/components/app/roadmap-tree";
import { resolveProgress } from "@/lib/domain/progress";
import { getActivePathDashboard, getRoadmap } from "@/lib/data/app-data";
import { getCareerTrack, getTrackFork } from "@/lib/domain/career-tracks";
import type { Milestone } from "@/lib/domain/types";
import { getAppCopy, localizeCareerTerm, localizeRoadmapMilestone, localizeTrackOutcome } from "@/lib/i18n/app-copy";

export default async function RoadmapPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ track?: string }>;
}) {
  const { locale } = await params;
  const c = getAppCopy(locale);
  const { track: requestedTrack } = await searchParams;
  const track = getCareerTrack(requestedTrack);

  const [milestonesRaw, dashboard] = await Promise.all([getRoadmap(track.key), getActivePathDashboard()]);
  const milestones = (milestonesRaw as Milestone[]).map((milestone) => localizeRoadmapMilestone(locale, milestone));

  const trackTitle = localizeCareerTerm(locale, track.key, track.title);
  const stageCount = milestones.length;

  // Levels are path-scoped: XP never transfers between careers. So the strip
  // appears only when you are looking at your OWN path. Browsing someone
  // else's roadmap must not imply you have a level on it.
  const isActivePath = dashboard.activePath?.key === track.key;
  const progress = isActivePath
    ? resolveProgress(dashboard.xp, {
      completedMissions: dashboard.completedMilestones,
      verifiedCount: dashboard.verifiedCount,
      stagesTouched: milestones.filter((stage) => stage.status === "complete").length,
    })
    : null;

  return (
    <div className="app-page roadmap-page">
      <section className="page-heading roadmap-page-heading">
        <Link className="back-link" href="/app/paths">← {locale === "my" ? "လမ်းပြမြေပုံများအားလုံး" : "All roadmaps"}</Link>
        <div className="roadmap-title-row">
          <div>
            <h1>{trackTitle}</h1>
            <p>{localizeTrackOutcome(locale, track.key, track.outcome)}</p>
          </div>
          <span>{stageCount} {c.roadmap.stages}</span>
        </div>
      </section>

      {progress ? <LevelMeter progress={progress} locale={locale} variant="compact" /> : null}

      <RoadmapTree locale={locale} milestones={milestones} fork={getTrackFork(track.key, locale)} />
    </div>
  );
}
