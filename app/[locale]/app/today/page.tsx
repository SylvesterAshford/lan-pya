import { ArrowRight, BriefcaseBusiness, Check, Clock3, Compass, Map } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getOpportunities, getRoadmap } from "@/lib/data/app-data";
import { formatAppDate, getAppCopy, localizeCareerTerm, localizeOpportunity, localizeRoadmapMilestone } from "@/lib/i18n/app-copy";

export default async function TodayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireUser(locale);
  const [dashboard, opportunities] = await Promise.all([getActivePathDashboard(), getOpportunities()]);
  const c = getAppCopy(locale);
  const path = dashboard.activePath;
  const mission = dashboard.nextMission;

  if (!path || !mission) {
    return <div className="app-page home-page"><section className="empty-path-state panel"><Compass size={24} aria-hidden="true" /><h1>{c.today.emptyTitle}</h1><p>{c.today.emptyBody}</p><Link className="button primary" href="/onboarding">{c.today.openCompass}</Link></section></div>;
  }

  const roadmap = (await getRoadmap(path.key)).map((stage) => localizeRoadmapMilestone(locale, stage));
  const pathTitle = localizeCareerTerm(locale, path.key, path.title);
  const missionTitle = localizeCareerTerm(locale, mission.key, mission.title);
  const nextStages = roadmap.filter((stage) => stage.status !== "complete").slice(0, 3);
  const nearbyOpportunities = opportunities.slice(0, 3).map((item) => localizeOpportunity(locale, item));

  return (
    <div className="app-page home-page">
      <section className="home-heading">
        <div>
          <h1>{locale === "my" ? "ပြန်လည်ကြိုဆိုပါတယ်။" : "Welcome back."}</h1>
          <p>{pathTitle} · {locale === "my" ? "ယနေ့ နောက်တစ်ဆင့်ကို ဆက်လုပ်ပါ" : "continue with one useful next step"}</p>
        </div>
        <dl className="home-stats">
          <div><dd>{dashboard.completedMilestones}/{dashboard.totalMilestones}</dd><dt>{locale === "my" ? "ပြီးစီးသောအဆင့်" : "Milestones"}</dt></div>
          <div><dd>{dashboard.progressPercent}%</dd><dt>{locale === "my" ? "တိုးတက်မှု" : "Complete"}</dt></div>
          <div><dd>{dashboard.xp}</dd><dt>XP</dt></div>
        </dl>
      </section>

      <section className="continue-panel">
        <div className="continue-copy">
          <span>{locale === "my" ? "ရပ်ထားသည့်နေရာမှ ဆက်လုပ်မည်" : "Continue where you left off"}</span>
          <h2>{missionTitle}</h2>
          <p>{pathTitle} · {mission.workState === "active" ? c.build.inProgress : c.build.available}</p>
          <div className="continue-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dashboard.progressPercent}><span style={{ width: `${dashboard.progressPercent}%` }} /></div>
          <small>{dashboard.completedMilestones} {locale === "my" ? "အဆင့် ပြီးစီး" : "milestones complete"}</small>
        </div>
        <Link className="button gold" href="/app/build">{locale === "my" ? "ဆက်လုပ်မည်" : "Continue"}<ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <div className="home-grid">
        <section className="home-section path-ahead">
          <header><div><Map size={18} aria-hidden="true" /><h2>{locale === "my" ? "ရှေ့ဆက်ရမည့်လမ်း" : "Your path ahead"}</h2></div><Link href={`/app/roadmap?track=${path.key}`}>{locale === "my" ? "လမ်းပြမြေပုံဖွင့်မည်" : "Open roadmap"}</Link></header>
          <div className="home-list">
            {nextStages.map((stage, index) => <Link className={index === 0 ? "current" : ""} href={`/app/roadmap?track=${path.key}#milestone-${stage.key}`} key={stage.key}><span className="home-step">{stage.status === "active" ? <Check size={14} aria-hidden="true" /> : index + 1}</span><span><strong>{stage.title}</strong><small>{stage.proof}</small></span><ArrowRight size={15} aria-hidden="true" /></Link>)}
          </div>
        </section>

        <section className="home-section deadlines">
          <header><div><BriefcaseBusiness size={18} aria-hidden="true" /><h2>{locale === "my" ? "သင့်အတွက် သတ်မှတ်ရက်များ" : "Deadlines for you"}</h2></div><Link href="/app/opportunities">{locale === "my" ? "အားလုံးကြည့်မည်" : "See all"}</Link></header>
          {nearbyOpportunities.length ? <div className="home-list">{nearbyOpportunities.map((item) => <Link href="/app/opportunities" key={item.id}><span className="deadline-icon"><Clock3 size={15} aria-hidden="true" /></span><span><strong>{item.title}</strong><small>{item.type} · {formatAppDate(locale, item.deadline)}</small></span><ArrowRight size={15} aria-hidden="true" /></Link>)}</div> : <p className="home-empty">{c.opportunities.emptyBody}</p>}
        </section>
      </div>
    </div>
  );
}
