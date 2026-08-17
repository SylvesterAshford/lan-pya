import { ArrowRight, CircleDashed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AiTutor } from "@/components/app/ai-tutor";
import { PathTabs, type PathTab } from "@/components/app/path-tabs";
import { RoadmapTree } from "@/components/app/roadmap-tree";
import { StartMissionButton } from "@/components/missions/start-mission-button";
import { getActivePathDashboard, getRoadmap } from "@/lib/data/app-data";
import { getCareerTrack, getTrackFork } from "@/lib/domain/career-tracks";
import { getTutorScript } from "@/lib/domain/tutor-script";
import type { Milestone } from "@/lib/domain/types";
import { getAppCopy, localizeCareerTerm, localizeRoadmapMilestone, localizeTrackOutcome } from "@/lib/i18n/app-copy";

const missionHref: Record<string, string> = {
  "responsive-profile-card": "/app/missions/responsive-profile-card",
  "content-creator-awareness": "/app/missions/content-creator-awareness",
};

function missionStateCopy(c: ReturnType<typeof getAppCopy>, state: string, submissionState: string | null) {
  if (submissionState === "changes_requested") return { label: c.build.needsChanges, detail: c.build.needsChangesDetail, action: c.build.revise };
  if (submissionState?.includes("review") || submissionState?.includes("deterministic")) return { label: c.build.inReview, detail: c.build.inReviewDetail, action: c.build.viewSubmission };
  if (state === "active") return { label: c.build.inProgress, detail: c.build.inProgressDetail, action: c.build.continueMission };
  if (state === "paused") return { label: c.build.paused, detail: c.build.pausedDetail, action: c.build.resume };
  return { label: c.build.available, detail: c.build.availableDetail, action: c.build.start };
}

export default async function RoadmapPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ track?: string; tab?: string }>;
}) {
  const { locale } = await params;
  const c = getAppCopy(locale);
  const { track: requestedTrack, tab: requestedTab } = await searchParams;
  const track = getCareerTrack(requestedTrack);
  const tab: PathTab = requestedTab === "missions" || requestedTab === "tutor" ? requestedTab : "map";

  const [milestonesRaw, dashboard] = await Promise.all([getRoadmap(track.key), getActivePathDashboard()]);
  const milestones = (milestonesRaw as Milestone[]).map((milestone) => localizeRoadmapMilestone(locale, milestone));

  const trackTitle = localizeCareerTerm(locale, track.key, track.title);
  const isActivePath = dashboard.activePath?.key === track.key;
  const mission = isActivePath ? dashboard.nextMission : null;
  // Only the active path's mission is addressable; the pilot has one authored
  // mission and other tracks have none yet. The count is what the tab shows.
  const missionCount = mission ? 1 : 0;

  return (
    <div className="app-page roadmap-page">
      <section className="page-heading roadmap-page-heading">
        <Link className="back-link" href="/app/paths">← {locale === "my" ? "လမ်းပြမြေပုံများအားလုံး" : "All roadmaps"}</Link>
        <div className="roadmap-title-row">
          <div>
            <h1>{trackTitle}</h1>
            <p>{localizeTrackOutcome(locale, track.key, track.outcome)}</p>
          </div>
        </div>
      </section>

      <PathTabs
        active={tab}
        trackKey={track.key}
        stageCount={milestones.length}
        missionCount={missionCount}
        labels={{ map: c.pathTabs.map, missions: c.pathTabs.missions, tutor: c.pathTabs.tutor }}
      />

      {tab === "map" ? (
        <RoadmapTree locale={locale} milestones={milestones} fork={getTrackFork(track.key, locale)} />
      ) : null}

      {tab === "missions" ? (
        mission ? (
          (() => {
            const state = missionStateCopy(c, mission.workState, mission.submissionState);
            const href = missionHref[mission.key] ?? "/app/paths";
            return (
              <section className="mission-focus panel">
                <div className="mission-focus-status">
                  <span className={`status-tag ${state.label === c.build.inReview ? "pilot" : state.label === c.build.needsChanges ? "warning" : "success"}`}>{state.label}</span>
                  <span>{dashboard.activePath?.availability === "controlled_pilot" ? c.paths.pilot : c.build.operational}</span>
                </div>
                <div className="mission-focus-copy">
                  <span className="eyebrow">{c.build.nextQuest}</span>
                  <h2>{localizeCareerTerm(locale, mission.key, mission.title)}</h2>
                  <p>{state.detail}</p>
                  <div className="quest-tags">
                    <span>{c.today.portfolioEvidence}</span>
                    <span>{c.today.humanReview}</span>
                  </div>
                </div>
                {mission.workState === "available" || mission.workState === "paused"
                  ? <StartMissionButton locale={locale} missionKey={mission.key} href={href} label={state.action} />
                  : <Link className="button primary" href={href}>{state.action} <ArrowRight size={18} aria-hidden="true" /></Link>}
              </section>
            );
          })()
        ) : (
          <section className="panel empty-state">
            <CircleDashed size={22} aria-hidden="true" />
            <h2>{c.pathTabs.missions}</h2>
            <p>{isActivePath ? c.pathTabs.noMissionYet : c.pathTabs.missionsLocked}</p>
            {isActivePath ? <p>{c.pathTabs.noMissionYetBody}</p> : null}
            {!isActivePath ? <Link className="button primary" href="/app/paths">{c.pathTabs.missionsLockedAction}</Link> : null}
          </section>
        )
      ) : null}

      {tab === "tutor" ? (
        <AiTutor
          pathTitle={trackTitle}
          qa={getTutorScript(track.key, locale)}
          labels={{
            title: c.pathTabs.tutorTitle,
            preview: c.pathTabs.tutorPreview,
            greeting: c.pathTabs.tutorGreeting,
            suggestLead: c.pathTabs.tutorSuggestLead,
            placeholder: c.pathTabs.tutorPlaceholder,
            disclaimer: c.pathTabs.tutorDisclaimer,
            scripted: c.pathTabs.tutorScripted,
            newChat: c.pathTabs.tutorNewChat,
            send: c.pathTabs.tutorSend,
          }}
        />
      ) : null}
    </div>
  );
}
