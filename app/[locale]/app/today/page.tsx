import { ArrowRight, BadgeCheck, Compass, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard } from "@/lib/data/app-data";

export default async function TodayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireUser(locale);
  const dashboard = await getActivePathDashboard();
  const path = dashboard.activePath;
  const mission = dashboard.nextMission;
  if (!path || !mission) return <div className="app-page"><section className="empty-path-state panel"><Compass size={24} aria-hidden="true" /><span className="eyebrow">WELCOME</span><h1>Find one direction that fits.</h1><p>Career Compass will suggest an available path and show your first proof-producing mission.</p><Link className="button primary" href="/onboarding">Open Career Compass</Link></section></div>;

  const missionStatus = mission.submissionState?.includes("review") ? "In review" : mission.workState === "active" ? "In progress" : mission.workState === "paused" ? "Paused" : "Ready to start";
  return <div className="app-page today-page">
    <section className="page-heading compact-heading"><span className="eyebrow">TODAY · {path.title}</span><h1>Keep your direction visible.</h1><p>One path, one concrete mission, and proof you can carry forward.</p></section>
    <section className="today-path-summary panel"><div><span className="eyebrow">ACTIVE PATH</span><h2>{path.title}</h2><p>{dashboard.completedMilestones} of {dashboard.totalMilestones} stages complete · {dashboard.progressPercent}%</p></div><div className="today-xp"><Sparkles size={18} aria-hidden="true" /><span><strong>Level {dashboard.level}</strong><small>{dashboard.xp} XP on this path</small></span></div><Link className="text-link" href="/app/paths">View path <ArrowRight size={16} aria-hidden="true" /></Link></section>
    <section className="today-next-mission panel"><div className="today-next-icon"><Compass size={22} aria-hidden="true" /></div><div><span className="eyebrow">NEXT MISSION · {missionStatus}</span><h2>{mission.title}</h2><p>{path.availability === "controlled_pilot" ? "Create one clear outcome for a real audience, then submit your evidence when ready." : "Build a responsive, accessible interface and explain the choices behind it."}</p><div className="quest-tags"><span>+100 XP after verification</span><span>Portfolio evidence</span><span>Human review</span></div></div><Link className="button primary" href="/app/build">Open Build <ArrowRight size={18} aria-hidden="true" /></Link></section>
    <section className="today-loop panel"><div><span className="eyebrow">WHAT HAPPENS NEXT</span><h2>Work becomes trusted proof.</h2></div><ol><li><b>1</b><span><strong>Build</strong><small>Finish one clear deliverable.</small></span></li><li><b>2</b><span><strong>Submit</strong><small>Keep a private snapshot of your work.</small></span></li><li><b>3</b><span><strong>Review</strong><small>Receive evidence-linked feedback.</small></span></li><li><b>4</b><span><strong>Prove</strong><small>Share verified proof only when you choose.</small></span></li></ol><Link className="text-link" href="/app/proof"><BadgeCheck size={17} aria-hidden="true" /> View Portfolio</Link></section>
  </div>;
}
