import { RoadmapTree } from "@/components/app/roadmap-tree";
import { getActivePathDashboard, getRoadmap } from "@/lib/data/app-data";
import { getCareerTrack, getTrackFork } from "@/lib/domain/career-tracks";
import type { Milestone } from "@/lib/domain/types";
import { localizeCareerTerm, localizeRoadmapMilestone, localizeTrackOutcome } from "@/lib/i18n/app-copy";

export default async function RoadmapPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ track?: string }>;
}) {
  const { locale } = await params;
  const { track: requestedTrack } = await searchParams;

  // No track asked for means "my roadmap". Defaulting to the catalog's first
  // entry showed a learner somebody else's path on the tab named after theirs,
  // which is why the tab needed a card and a click to reach the real thing.
  const dashboard = await getActivePathDashboard();
  const track = getCareerTrack(requestedTrack ?? dashboard.activePath?.key);

  const milestonesRaw = await getRoadmap(track.key);
  const milestones = (milestonesRaw as Milestone[]).map((milestone) => localizeRoadmapMilestone(locale, milestone));

  const trackTitle = localizeCareerTerm(locale, track.key, track.title);

  // No level strip here. The roadmap answers "what is the path and where am
  // I on it", which the canvas header already counts in verified milestones.
  // The level lives on Today and on Me, where XP is the subject.

  return (
    <div className="app-page roadmap-page">
      <section className="page-heading roadmap-page-heading">
        {/* The stage count used to sit out here as a bare "12 stages". The
            canvas header already reports progress as verified-of-total, which
            is the same number said usefully, so this only repeated it. */}
        <div className="roadmap-title-row">
          <div>
            <h1>{trackTitle}</h1>
            <p>{localizeTrackOutcome(locale, track.key, track.outcome)}</p>
          </div>
        </div>
      </section>

      <RoadmapTree locale={locale} milestones={milestones} fork={getTrackFork(track.key, locale)} />
    </div>
  );
}
