import { ArrowRight, BadgeCheck, Compass, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard } from "@/lib/data/app-data";
import { getAppCopy, localizeCareerTerm } from "@/lib/i18n/app-copy";

export default async function TodayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireUser(locale);
  const dashboard = await getActivePathDashboard();
  const c = getAppCopy(locale);
  const path = dashboard.activePath;
  const mission = dashboard.nextMission;
  if (!path || !mission) return <div className="app-page"><section className="empty-path-state panel"><Compass size={24} aria-hidden="true" /><span className="eyebrow">{c.today.welcome}</span><h1>{c.today.emptyTitle}</h1><p>{c.today.emptyBody}</p><Link className="button primary" href="/onboarding">{c.today.openCompass}</Link></section></div>;

  const pathTitle = localizeCareerTerm(locale, path.key, path.title);
  const missionTitle = localizeCareerTerm(locale, mission.key, mission.title);
  const missionStatus = mission.submissionState?.includes("review") ? c.build.inReview : mission.workState === "active" ? c.build.inProgress : mission.workState === "paused" ? c.build.paused : c.build.available;
  return <div className="app-page today-page">
    <section className="page-heading compact-heading"><span className="eyebrow">{c.today.welcome} · {pathTitle}</span><h1>{c.today.title}</h1><p>{c.today.body}</p></section>
    <section className="today-path-summary panel"><div><span className="eyebrow">{c.today.activePath}</span><h2>{pathTitle}</h2><p>{dashboard.completedMilestones}/{dashboard.totalMilestones} {c.roadmap.stages} · {dashboard.progressPercent}%</p></div><div className="today-xp"><Sparkles size={18} aria-hidden="true" /><span><strong>{c.today.level} {dashboard.level}</strong><small>{dashboard.xp} {c.today.xpOnPath}</small></span></div><Link className="text-link" href="/app/paths">{c.today.viewPath} <ArrowRight size={16} aria-hidden="true" /></Link></section>
    <section className="today-next-mission panel"><div className="today-next-icon"><Compass size={22} aria-hidden="true" /></div><div><span className="eyebrow">{c.today.nextMission} · {missionStatus}</span><h2>{missionTitle}</h2><p>{path.availability === "controlled_pilot" ? c.today.contentMission : c.today.frontendMission}</p><div className="quest-tags"><span>{c.today.xpAfterVerification}</span><span>{c.today.portfolioEvidence}</span><span>{c.today.humanReview}</span></div></div><Link className="button primary" href="/app/build">{c.today.openBuild} <ArrowRight size={18} aria-hidden="true" /></Link></section>
    <section className="today-loop panel"><div><span className="eyebrow">{c.today.happensNext}</span><h2>{c.today.proofTitle}</h2></div><ol><li><b>1</b><span><strong>{c.today.build}</strong><small>{c.today.buildDetail}</small></span></li><li><b>2</b><span><strong>{c.today.submit}</strong><small>{c.today.submitDetail}</small></span></li><li><b>3</b><span><strong>{c.today.review}</strong><small>{c.today.reviewDetail}</small></span></li><li><b>4</b><span><strong>{c.today.prove}</strong><small>{c.today.proveDetail}</small></span></li></ol><Link className="text-link" href="/app/proof"><BadgeCheck size={17} aria-hidden="true" /> {c.today.viewPortfolio}</Link></section>
  </div>;
}
