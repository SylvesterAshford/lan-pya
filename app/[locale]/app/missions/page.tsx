import { ArrowRight, CircleDashed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Emblem } from "@/components/app/emblem";
import { MissionMap } from "@/components/missions/mission-map";
import { LevelMeter } from "@/components/app/level-meter";
import { emblemForStage, resolveProgress } from "@/lib/domain/progress";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getProofItems, getRoadmap } from "@/lib/data/app-data";
import { getAppCopy, formatAppDate, localizeCareerTerm, localizeRoadmapMilestone } from "@/lib/i18n/app-copy";
import type { Milestone } from "@/lib/domain/types";

const missionHref: Record<string, string> = {
  "responsive-profile-card": "/app/missions/responsive-profile-card",
  "content-creator-awareness": "/app/missions/content-creator-awareness",
};

function stateLabel(c: ReturnType<typeof getAppCopy>, workState: string, submissionState: string | null) {
  if (submissionState === "changes_requested") return { text: c.build.needsChanges, tone: "pilot" };
  if (submissionState === "verified") return { text: c.runner.verified, tone: "op" };
  if (submissionState?.includes("review") || submissionState?.includes("deterministic")) return { text: c.build.inReview, tone: "pilot" };
  if (workState === "active") return { text: c.build.inProgress, tone: "pilot" };
  if (workState === "paused") return { text: c.build.paused, tone: "prev" };
  return { text: c.build.available, tone: "op" };
}

export default async function MissionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireUser(locale);
  const c = getAppCopy(locale);
  const [dashboard, proof] = await Promise.all([getActivePathDashboard(), getProofItems()]);

  if (!dashboard.activePath) {
    return (
      <div className="app-page missions-page">
        <section className="panel empty-state">
          <CircleDashed size={22} aria-hidden="true" />
          <h2>{c.missions.noPath}</h2>
          <p>{c.missions.noPathBody}</p>
          <Link className="button primary" href="/app/paths">{c.missions.choosePath}</Link>
        </section>
      </div>
    );
  }

  const pathKey = dashboard.activePath.key;
  const roadmap = (await getRoadmap(pathKey) as Milestone[]).map((stage) => localizeRoadmapMilestone(locale, stage));
  // A mission belongs to the stage the learner is standing on. Showing that
  // stage on the mission is what keeps this page and the roadmap telling the
  // same story.
  const currentStage = roadmap.find((stage) => stage.status === "active") ?? roadmap.find((stage) => stage.status === "next");
  const mission = dashboard.nextMission;
  const verified = proof.filter((item) => item.state === "active");

  const progress = resolveProgress(dashboard.xp, {
    completedMissions: dashboard.completedMilestones,
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

      {/* Compact, not the full Home card. Repeating a large panel on every
          screen is how an app becomes a dashboard mosaic. */}
      <LevelMeter progress={progress} locale={locale} variant="compact" />

      {/* The same Milestone.status the roadmap canvas reads, drawn as a climb.
          A stop is locked because the stage is upcoming, not because three
          greyed circles looked good. */}
      <MissionMap
        milestones={roadmap}
        locale={locale}
        pathTitle={localizeCareerTerm(locale, pathKey, dashboard.activePath.title)}
        steps={progress.xp}
        missionHref={mission ? (missionHref[mission.key] ?? "/app/paths") : undefined}
        proofHref="/app/proof"
        labels={{
          stageOf: locale === "my" ? "အဆင့် {a} / {b}" : "Stage {a} of {b}",
          steps: locale === "my" ? "အမှတ်" : "points",
          youAreHere: locale === "my" ? "သင် ဤနေရာတွင်" : "You are here",
          complete: locale === "my" ? "ပြီးစီးပြီး" : "Complete",
          locked: locale === "my" ? "မဖွင့်ရသေးပါ" : "Locked",
          nextMission: locale === "my" ? "နောက်တစ်ခု" : "Next mission",
          continueMission: locale === "my" ? "ဆက်လုပ်မည်" : "Continue mission",
          caption: locale === "my" ? "သင့်လမ်းကြောင်း၏ နောက်တစ်ဆင့်များ" : "The next stops on your path",
        }}
      />

      <section className="mission-section">
        <header className="arena-head">
          <h3>{c.missions.active}</h3>
          <span className="arena-count">· {mission ? 1 : 0}</span>
        </header>

        {mission ? (
          <Link className="mission-row current" href={missionHref[mission.key] ?? "/app/paths"}>
            <Emblem kind={activeEmblem} size={40} className="mission-emblem" />
            <span className="mission-row-copy">
              <span className="mission-tags">
                {currentStage ? <span className="mission-tag stage">{c.missions.stage} {currentStage.order}</span> : null}
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

      <section className="mission-section">
        <header className="arena-head">
          <h3>{c.missions.completed}</h3>
          <span className="arena-count">· {verified.length}</span>
        </header>

        {verified.length ? (
          verified.map((item) => (
            <Link className="mission-row done" href="/app/proof" key={item.id}>
              {/* The rosette, not a check mark: verification is different in
                  kind from "finished", and the shape is what says so. */}
              <Emblem kind="verified" size={40} className="mission-emblem" />
              <span className="mission-row-copy">
                <span className="mission-tags">
                  <span className="mission-tag verified">{c.missions.verifiedOn} {formatAppDate(locale, item.verifiedAt)}</span>
                  {item.dataOrigin === "seeded_demo" ? <span className="mission-tag demo">{c.profile.demo}</span> : null}
                </span>
                <strong>{item.title}</strong>
                <small>{item.competencies.slice(0, 3).join(" · ")}</small>
              </span>
              <span className="mission-view">{c.missions.viewProof}</span>
              <ArrowRight className="path-row-chevron" size={16} aria-hidden="true" />
            </Link>
          ))
        ) : (
          <div className="mission-empty">
            <p>{c.missions.completedNone}</p>
            <small>{c.missions.completedNoneBody}</small>
          </div>
        )}
      </section>
    </div>
  );
}
