import { ArrowRight, CircleDashed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Emblem } from "@/components/app/emblem";
import { MissionMap } from "@/components/missions/mission-map";
import { LevelMeter } from "@/components/app/level-meter";
import { emblemForStage, resolveProgress } from "@/lib/domain/progress";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getProfile, getProofItems, getRoadmap } from "@/lib/data/app-data";
import { getAppCopy, formatAppDate, localizeCareerTerm, localizeRoadmapMilestone } from "@/lib/i18n/app-copy";
import { getCareerTrack } from "@/lib/domain/career-tracks";
import { getMissionStage, getStageMission } from "@/lib/domain/mission-briefs";
import { DemoResetButton } from "@/components/missions/demo-reset-button";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { learnerStatus } from "@/lib/domain/mission-status";
import type { Milestone, SubmissionState } from "@/lib/domain/types";

const missionHref: Record<string, string> = {
  "responsive-profile-card": "/app/missions/responsive-profile-card",
  "content-creator-awareness": "/app/missions/content-creator-awareness",
  "video-editor-vertical-story": "/app/missions/video-editor-vertical-story",
  "interactive-opportunity-tracker": "/app/missions/interactive-opportunity-tracker",
};

// The same reading of a submission as the mission runner and Portfolio.
function stateLabel(c: ReturnType<typeof getAppCopy>, workState: string, submissionState: SubmissionState | null) {
  const kind = learnerStatus(submissionState).kind;
  if (kind === "verified") return { text: c.runner.verified, tone: "op" };
  if (kind === "completed") return { text: c.runner.completedTitle, tone: "pilot" };
  if (kind === "checking") return { text: c.runner.checkingTitle, tone: "pilot" };
  if (kind === "fix_links" || kind === "changes" || kind === "rejected") return { text: c.build.needsChanges, tone: "pilot" };
  if (workState === "active") return { text: c.build.inProgress, tone: "pilot" };
  if (workState === "paused") return { text: c.build.paused, tone: "prev" };
  return { text: c.build.available, tone: "op" };
}

export default async function MissionsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ walk?: string }> }) {
  const { locale } = await params;
  const { walk } = await searchParams;
  const user = await requireUser(locale);
  const c = getAppCopy(locale);
  const [dashboard, proof, profile] = await Promise.all([
    getActivePathDashboard(),
    getProofItems(),
    getProfile(user.id),
  ]);

  if (!dashboard.activePath) {
    return (
      <div className="app-page missions-page">
        <section className="panel empty-state">
          <CircleDashed size={22} aria-hidden="true" />
          <h2>{c.missions.noPath}</h2>
          <p>{c.missions.noPathBody}</p>
          <Link className="button primary" href="/app/careers">{c.missions.choosePath}</Link>
        </section>
      </div>
    );
  }

  const pathKey = dashboard.activePath.key;
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));
  const roadmap = (await getRoadmap(pathKey) as Milestone[]).map((stage) => localizeRoadmapMilestone(locale, stage));
  const mission = dashboard.nextMission;
  // Every row names the stage its mission belongs to, so "Responsive Profile
  // Card" can be matched to stop 3 ("CSS and responsive layout") on the map
  // below. The in-progress row used to borrow the learner's current stage,
  // which once the mission was Completed pointed at a different stop.
  const stageOf = (missionKey: string | null | undefined) => {
    const place = getMissionStage(missionKey);
    if (!place) return null;
    const stages = place.pathKey === pathKey ? roadmap : getCareerTrack(place.pathKey).milestones.map((stage) => localizeRoadmapMilestone(locale, stage));
    const stage = stages.find((item) => item.key === place.stageKey);
    return stage ? { stage, pathKey: place.pathKey, onThisPath: place.pathKey === pathKey } : null;
  };
  const currentStage = (mission ? stageOf(mission.key)?.stage : null)
    ?? roadmap.find((stage) => stage.status === "active") ?? roadmap.find((stage) => stage.status === "next");
  const verified = proof.filter((item) => item.state === "active");

  const progress = resolveProgress(dashboard.xp, {
    completedMissions: dashboard.completedMissions,
    verifiedCount: dashboard.verifiedCount,
    stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
  });

  // Which emblem a mission carries comes from the stage it belongs to, so the
  // mark here and the mark on the roadmap node are the same mark.
  const stageIndex = currentStage ? roadmap.findIndex((stage) => stage.key === currentStage.key) : 0;
  const activeEmblem = emblemForStage(Math.max(0, stageIndex), roadmap.length);

  return (
    <div className="app-page missions-page">
      <section className="page-heading compact-heading">
        <span className="eyebrow">{c.missions.heading}</span>
        <h1>{c.missions.title}</h1>
        <p>{c.missions.body}</p>
      </section>

      <section className="mission-section">
        <header className="arena-head">
          <h3>{c.missions.active}</h3>
          <span className="arena-count">· {mission && mission.submissionState !== "verified" ? 1 : 0}</span>
        </header>

        {/* A verified mission is finished, not in progress. When the stage the
            learner stands on has no mission yet, this says so. */}
        {mission && mission.submissionState !== "verified" ? (
          <Link className="mission-row current" href={missionHref[mission.key] ?? "/app/paths"}>
            <Emblem kind={activeEmblem} size={40} className="mission-emblem" />
            <span className="mission-row-copy">
              <span className="mission-tags">
                {currentStage ? <span className="mission-tag stage">{c.missions.stage} {num(currentStage.order)}</span> : null}
                <span className="mission-tag path">{localizeCareerTerm(locale, pathKey, dashboard.activePath.title)}</span>
              </span>
              <strong>{localizeCareerTerm(locale, mission.key, mission.title)}</strong>
              {currentStage ? <small>{currentStage.title} · {currentStage.proof}</small> : null}
            </span>
            {(() => {
              const state = stateLabel(c, mission.workState, mission.submissionState);
              return <span className={`avail ${state.tone}`}>{state.text}</span>;
            })()}
            <ArrowRight className="path-row-chevron" size={16} aria-hidden="true" />
          </Link>
        ) : (
          <div className="mission-empty">
            <p>{c.missions.activeEmpty}</p>
            <small>{c.missions.activeEmptyBody}</small>
            <Link className="text-link" href={`/app/roadmap?track=${pathKey}`}>{c.missions.openRoadmap} →</Link>
          </div>
        )}
      </section>

      <section className="mission-section mission-section-closing">
        <header className="arena-head">
          <h3>{c.missions.completed}</h3>
          <span className="arena-count">· {verified.length}</span>
        </header>

        {verified.length ? (
          verified.map((item) => { const place = stageOf(item.missionKey); return (
            <Link className="mission-row done" href="/app/proof" key={item.id}>
              {/* The rosette, not a check mark: verification is different in
                  kind from "finished", and the shape is what says so. */}
              <Emblem kind="verified" size={40} className="mission-emblem" />
              <span className="mission-row-copy">
                <span className="mission-tags">
                  <span className="mission-tag verified">{c.missions.verifiedOn} {formatAppDate(locale, item.verifiedAt)}</span>
                  {place ? <span className="mission-tag stage">{c.missions.stage} {num(place.stage.order)}</span> : null}
                  {place && !place.onThisPath ? <span className="mission-tag path">{localizeCareerTerm(locale, place.pathKey, getCareerTrack(place.pathKey).title)}</span> : null}
                  {item.dataOrigin === "seeded_demo" ? <span className="mission-tag demo">{c.profile.demo}</span> : null}
                </span>
                <strong>{item.title}</strong>
                <small>{place ? place.stage.title : item.competencies.slice(0, 3).join(" · ")}</small>
              </span>
              <span className="mission-view">{c.missions.viewProof}</span>
              <ArrowRight className="path-row-chevron" size={16} aria-hidden="true" />
            </Link>
          ); })
        ) : (
          <div className="mission-empty">
            <p>{c.missions.completedNone}</p>
            <small>{c.missions.completedNoneBody}</small>
          </div>
        )}
      </section>

      {/* Sits directly above the climb it is counting. The points on this
          strip are what the stops on the map award, so the two belong to each
          other rather than to opposite ends of the page. */}
      <LevelMeter progress={progress} locale={locale} variant="compact" />

      {/* The same Milestone.status the roadmap canvas reads, drawn as a climb.
          A stop is locked because the stage is upcoming, not because three
          greyed circles looked good. */}
      <MissionMap
        milestones={roadmap}
        pathKey={pathKey}
        locale={locale}
        mascotVariant={profile?.avatar}
        pathTitle={localizeCareerTerm(locale, pathKey, dashboard.activePath.title)}
        steps={progress.xp}
        stageLinks={Object.fromEntries(roadmap.flatMap((stage) => {
          const key = getStageMission(pathKey, stage.key);
          return key && missionHref[key] ? [[stage.key, missionHref[key]]] : [];
        }))}
        comingSoonHref={`/app/roadmap?track=${pathKey}`}
        walkFrom={walk}
        labels={{
          stageOf: locale === "my" ? "အဆင့် {a} / {b}" : "Stage {a} of {b}",
          steps: locale === "my" ? "အမှတ်" : "points",
          youAreHere: locale === "my" ? "သင် ဤနေရာတွင်" : "You are here",
          complete: locale === "my" ? "အတည်ပြုပြီး" : "Verified",
          placed: locale === "my" ? "ကျွမ်းကျင်မှုစစ်ဆေးချက်ဖြင့် ကျော်ခဲ့" : "Placed by skills check",
          awaiting: locale === "my" ? "သုံးသပ်ရန် စောင့်နေသည်" : "Awaiting review",
          locked: locale === "my" ? "မဖွင့်ရသေးပါ" : "Locked",
          nextMission: locale === "my" ? "နောက်တစ်ခု" : "Next mission",
          continueMission: locale === "my" ? "ဆက်လုပ်မည်" : "Continue mission",
          comingSoon: locale === "my" ? "လုပ်ငန်း မကြာမီ" : "Mission coming soon",
        }}
      />

      {profile?.dataOrigin === "seeded_demo" ? (
        <DemoResetButton
          label={locale === "my" ? "နမူနာ ဇာတ်လမ်းကို ပြန်စမည်" : "Reset the demo story"}
          busyLabel={locale === "my" ? "ပြန်စနေသည်…" : "Resetting…"}
          doneLabel={locale === "my" ? "နမူနာအကောင့်ကို မူလအတိုင်း ပြန်ထားပြီး" : "The demo is back to its starting story."}
          errorLabel={locale === "my" ? "ပြန်မစနိုင်ပါ။ ထပ်ကြိုးစားပါ။" : "Could not reset. Try again."}
        />
      ) : null}
    </div>
  );
}
