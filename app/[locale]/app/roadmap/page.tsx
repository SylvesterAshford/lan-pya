import { Link } from "@/i18n/navigation";
import { RoadmapTree } from "@/components/app/roadmap-tree";
import { getRoadmap } from "@/lib/data/app-data";
import { getCareerTrack, getTrackFork } from "@/lib/domain/career-tracks";
import type { Milestone } from "@/lib/domain/types";
import { getAppCopy, localizeCareerTerm, localizeRoadmapMilestone, localizeTrackOutcome } from "@/lib/i18n/app-copy";

export default async function RoadmapPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ track?: string }> }) {
  const { locale } = await params;
  const c = getAppCopy(locale).roadmap;
  const { track: requestedTrack } = await searchParams;
  const track = getCareerTrack(requestedTrack);
  const milestones = ((await getRoadmap(track.key)) as Milestone[]).map((milestone) => localizeRoadmapMilestone(locale, milestone));
  return (
    <div className="app-page roadmap-page">
      <section className="page-heading roadmap-page-heading">
        <Link className="back-link" href="/app/paths">← {locale === "my" ? "လမ်းပြမြေပုံများအားလုံး" : "All roadmaps"}</Link>
        <div className="roadmap-title-row">
          <div>
            <h1>{localizeCareerTerm(locale, track.key, track.title)}</h1>
            <p>{localizeTrackOutcome(locale, track.key, track.outcome)}</p>
          </div>
          <span>{track.milestones.length} {c.stages}</span>
        </div>
      </section>
      <RoadmapTree locale={locale} milestones={milestones} fork={getTrackFork(track.key, locale)} />
    </div>
  );
}
