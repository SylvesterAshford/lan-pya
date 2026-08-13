import { ArrowRight, CheckCircle2, CircleDashed, LockKeyhole } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { StartMissionButton } from "@/components/missions/start-mission-button";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getRoadmap } from "@/lib/data/app-data";
import { getAppCopy, localizeCareerTerm, localizeRoadmapMilestone } from "@/lib/i18n/app-copy";

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

export default async function BuildPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireUser(locale);
  const c = getAppCopy(locale);
  const dashboard = await getActivePathDashboard();
  if (!dashboard.activePath || !dashboard.nextMission) {
    return <div className="app-page build-page"><section className="empty-path-state panel"><CircleDashed size={24} aria-hidden="true" /><span className="eyebrow">{c.today.build}</span><h1>{c.build.emptyTitle}</h1><p>{c.build.emptyBody}</p><Link className="button primary" href="/app/paths">{c.build.choosePath}</Link></section></div>;
  }

  const roadmap = (await getRoadmap(dashboard.activePath.key)).map((stage) => localizeRoadmapMilestone(locale, stage));
  const mission = dashboard.nextMission;
  const state = missionStateCopy(c, mission.workState, mission.submissionState);
  const pathTitle = localizeCareerTerm(locale, dashboard.activePath.key, dashboard.activePath.title);
  const missionTitle = localizeCareerTerm(locale, mission.key, mission.title);
  const href = missionHref[mission.key] ?? "/app/paths";
  const currentIndex = Math.max(0, roadmap.findIndex((item) => item.status === "active" || item.status === "next"));
  const visibleStages = roadmap.slice(currentIndex, currentIndex + 3);

  return <div className="app-page build-page">
    <section className="page-heading compact-heading"><span className="eyebrow">{c.today.build} · {pathTitle}</span><h1>{c.build.title}</h1><p>{c.build.body}</p></section>
    <section className="mission-focus panel">
      <div className="mission-focus-status"><span className={`status-tag ${state.label === c.build.inReview ? "pilot" : state.label === c.build.needsChanges ? "warning" : "success"}`}>{state.label}</span><span>{dashboard.activePath.availability === "controlled_pilot" ? c.paths.pilot : c.build.operational}</span></div>
      <div className="mission-focus-copy"><span className="eyebrow">{c.build.nextQuest} · +100 XP</span><h2>{missionTitle}</h2><p>{state.detail}</p><div className="quest-tags"><span>{c.today.portfolioEvidence}</span><span>{dashboard.activePath.availability === "controlled_pilot" ? c.build.phoneFriendly : c.build.laptop}</span><span>{c.today.humanReview}</span></div></div>
      {mission.workState === "available" || mission.workState === "paused" ? <StartMissionButton locale={locale} missionKey={mission.key} href={href} label={state.action} /> : <Link className="button primary" href={href}>{state.action} <ArrowRight size={18} aria-hidden="true" /></Link>}
    </section>
    <section className="build-path-spine" aria-label={`${dashboard.activePath.title} stages`}>
      <div className="section-heading"><div><span className="eyebrow">{c.build.yourPath}</span><h2>{c.build.after}</h2></div><Link className="text-link" href="/app/paths">{c.build.changePath}</Link></div>
      <ol>{visibleStages.map((stage, index) => <li key={stage.key} className={index === 0 ? "current" : "upcoming"}><span className="spine-node">{index === 0 ? <CheckCircle2 size={17} aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}</span><div><strong>{stage.title}</strong><small>{index === 0 ? `${c.build.currentStage} · ${stage.proof}` : stage.proof}</small></div></li>)}</ol>
    </section>
    {dashboard.pausedWork.length ? <section className="paused-work panel"><span className="eyebrow">{c.build.pausedWork}</span><h2>{c.build.pausedTitle}</h2><div>{dashboard.pausedWork.map((work) => <Link key={work.missionKey} href="/app/paths"><span><strong>{localizeCareerTerm(locale, work.missionKey, work.missionTitle)}</strong><small>{localizeCareerTerm(locale, work.pathKey, work.pathTitle)}</small></span><ArrowRight size={18} aria-hidden="true" /></Link>)}</div></section> : null}
  </div>;
}
