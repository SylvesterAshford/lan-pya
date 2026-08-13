import { ArrowRight, CheckCircle2, CircleDashed, LockKeyhole } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { StartMissionButton } from "@/components/missions/start-mission-button";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getRoadmap } from "@/lib/data/app-data";

const missionHref: Record<string, string> = {
  "responsive-profile-card": "/app/missions/responsive-profile-card",
  "content-creator-awareness": "/app/missions/content-creator-awareness",
};

function missionStateCopy(state: string, submissionState: string | null) {
  if (submissionState === "changes_requested") return { label: "Needs changes", detail: "Your first version is safe. Use the reviewer feedback to revise it.", action: "Revise mission" };
  if (submissionState?.includes("review") || submissionState?.includes("deterministic")) return { label: "In review", detail: "Your submitted version is being checked. You can leave safely and return here.", action: "View submission" };
  if (state === "active") return { label: "In progress", detail: "Your mission is active. Keep building from the saved brief.", action: "Continue mission" };
  if (state === "paused") return { label: "Paused", detail: "This mission belongs to this path and is ready when you are.", action: "Resume mission" };
  return { label: "Available", detail: "A clear first deliverable with a real proof target.", action: "Start mission" };
}

export default async function BuildPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireUser(locale);
  const dashboard = await getActivePathDashboard();
  if (!dashboard.activePath || !dashboard.nextMission) {
    return <div className="app-page build-page"><section className="empty-path-state panel"><CircleDashed size={24} aria-hidden="true" /><span className="eyebrow">BUILD</span><h1>Your next mission starts with a path.</h1><p>Choose a path that is available now, then Lan Pya will show one brief and one next action.</p><Link className="button primary" href="/app/paths">Choose a path</Link></section></div>;
  }

  const roadmap = await getRoadmap(dashboard.activePath.key);
  const mission = dashboard.nextMission;
  const state = missionStateCopy(mission.workState, mission.submissionState);
  const href = missionHref[mission.key] ?? "/app/paths";
  const currentIndex = Math.max(0, roadmap.findIndex((item) => item.status === "active" || item.status === "next"));
  const visibleStages = roadmap.slice(currentIndex, currentIndex + 3);

  return <div className="app-page build-page">
    <section className="page-heading compact-heading"><span className="eyebrow">BUILD · {dashboard.activePath.title}</span><h1>One mission at a time.</h1><p>Make one real thing, submit it when ready, and let the evidence show what you can do.</p></section>
    <section className="mission-focus panel">
      <div className="mission-focus-status"><span className={`status-tag ${state.label === "In review" ? "pilot" : state.label === "Needs changes" ? "warning" : "success"}`}>{state.label}</span><span>{dashboard.activePath.availability === "controlled_pilot" ? "Controlled pilot" : "Operational path"}</span></div>
      <div className="mission-focus-copy"><span className="eyebrow">NEXT QUEST · +100 XP</span><h2>{mission.title}</h2><p>{state.detail}</p><div className="quest-tags"><span>Portfolio evidence</span><span>{dashboard.activePath.availability === "controlled_pilot" ? "Phone-friendly" : "Laptop recommended"}</span><span>Human review</span></div></div>
      {mission.workState === "available" || mission.workState === "paused" ? <StartMissionButton missionKey={mission.key} href={href} label={state.action} /> : <Link className="button primary" href={href}>{state.action} <ArrowRight size={18} aria-hidden="true" /></Link>}
    </section>
    <section className="build-path-spine" aria-label={`${dashboard.activePath.title} stages`}>
      <div className="section-heading"><div><span className="eyebrow">YOUR PATH</span><h2>What comes after this</h2></div><Link className="text-link" href="/app/paths">Change path</Link></div>
      <ol>{visibleStages.map((stage, index) => <li key={stage.key} className={index === 0 ? "current" : "upcoming"}><span className="spine-node">{index === 0 ? <CheckCircle2 size={17} aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}</span><div><strong>{stage.title}</strong><small>{index === 0 ? `Current stage · ${stage.proof}` : stage.proof}</small></div></li>)}</ol>
    </section>
    {dashboard.pausedWork.length ? <section className="paused-work panel"><span className="eyebrow">PAUSED WORK</span><h2>Still yours when you return.</h2><div>{dashboard.pausedWork.map((work) => <Link key={work.missionKey} href="/app/paths"><span><strong>{work.missionTitle}</strong><small>{work.pathTitle}</small></span><ArrowRight size={18} aria-hidden="true" /></Link>)}</div></section> : null}
  </div>;
}
