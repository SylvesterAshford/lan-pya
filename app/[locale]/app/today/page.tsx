import { ArrowRight, BriefcaseBusiness, Clock3, Compass, Map } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { DeadlineChip } from "@/components/app/deadline-chip";
import { LevelMeter } from "@/components/app/level-meter";
import { LevelUpMoment } from "@/components/app/level-up-moment";
import { ChangelogRail } from "@/components/app/changelog-rail";
import { getReleases } from "@/lib/domain/changelog";
import { localizeLevel, resolveProgress } from "@/lib/domain/progress";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { getActivePathDashboard, getOpportunities, getRoadmap } from "@/lib/data/app-data";
import { getAppCopy, localizeCareerTerm, localizeOpportunity, localizeRoadmapMilestone } from "@/lib/i18n/app-copy";

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
  // Lead with the stage the learner is actually on. The controlled pilot has a
  // single authored mission attached to stage 1, so naming the mission here made
  // Home claim "Three-piece awareness campaign" while the roadmap and the list
  // below both said "Mobile production". The stage is the shared truth across
  // every surface; the mission is context under it.
  const currentStage = nextStages.find((stage) => stage.status === "active") ?? nextStages[0];
  const nearbyOpportunities = opportunities.slice(0, 3).map((item) => localizeOpportunity(locale, item));

  // The XP ledger has existed since 2026-08-13 and the dashboard has always
  // returned a summed `xp`; nothing rendered it, and the RPC's own `level` is a
  // flat xp/100 ladder with no evidence gate. The real ladder is resolved here.
  const progress = resolveProgress(dashboard.xp, {
    completedMissions: dashboard.completedMilestones,
    verifiedCount: dashboard.verifiedCount,
    stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
  });

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
        </dl>
      </section>

      {/* First element after the greeting: "where am I" is Home's whole job,
          and a level with its gates answers it better than a bare XP figure
          did. The raw number moved out of the stats row because a count with
          no ladder beside it invites "out of what?" and answers nothing. */}
      <LevelMeter progress={progress} locale={locale} pathTitle={pathTitle} />

      {/* Fires once per promotion, tracked per path in localStorage. A first
          visit only records the baseline, so a learner opening the app on a
          new phone is never congratulated for a level they have had for
          months. */}
      <LevelUpMoment
        pathKey={path.key}
        rank={progress.level.rank}
        hue={progress.level.hue}
        levelName={localizeLevel(locale, progress.level)}
        pathTitle={pathTitle}
        satisfied={
          locale === "my"
            ? [`ခြေလှမ်း ${toMyanmarDigits(progress.level.minXp)} ကျော်လွန်ပြီး`, progress.level.gate({
              completedMissions: dashboard.completedMilestones,
              verifiedCount: dashboard.verifiedCount,
              stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
            }).my]
            : [`Passed ${progress.level.minXp} steps`, progress.level.gate({
              completedMissions: dashboard.completedMilestones,
              verifiedCount: dashboard.verifiedCount,
              stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
            }).en]
        }
        labels={locale === "my" ? {
          reached: "{level} အဆင့်သို့ ရောက်ရှိပြီ",
          subtitle: "{path} တွင် အဆင့် {n} / ၅",
          earnedLead: "ဖြည့်ဆည်းပြီးသည်များ",
          dismiss: "ဆက်လက်လုပ်ဆောင်မည်",
          honesty: "အဆင့်များသည် Lan Pya အတွင်း တိုးတက်မှုကို ဖော်ပြသည်။ အလုပ်အကိုင် ရရှိနိုင်မှုကို မဆိုလိုပါ။",
          close: "ပိတ်မည်",
        } : {
          reached: "You reached {level}",
          subtitle: "Level {n} of 5 on {path}",
          earnedLead: "What you satisfied",
          dismiss: "Continue",
          honesty: "Levels describe progress inside Lan Pya. They do not claim you are employable.",
          close: "Close",
        }}
      />

      <section className="continue-panel">
        <div className="continue-copy">
          <span>{locale === "my" ? "ရပ်ထားသည့်နေရာမှ ဆက်လုပ်မည်" : "Continue where you left off"}</span>
          <h2>{currentStage ? currentStage.title : missionTitle}</h2>
          <p>{pathTitle} · {currentStage ? `${c.roadmap.step} ${currentStage.order}/${roadmap.length}` : missionTitle} · {mission.workState === "active" ? c.build.inProgress : c.build.available}</p>
          <div className="continue-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dashboard.progressPercent}><span style={{ width: `${dashboard.progressPercent}%` }} /></div>
          <small>{dashboard.completedMilestones} {locale === "my" ? "အဆင့် ပြီးစီး" : "milestones complete"}</small>
        </div>
        <Link className="button gold" href="/app/build">{locale === "my" ? "ဆက်လုပ်မည်" : "Continue"}<ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <div className="home-grid">
        <section className="home-section path-ahead">
          <header><div><Map size={18} aria-hidden="true" /><h2>{locale === "my" ? "ရှေ့ဆက်ရမည့်လမ်း" : "Your path ahead"}</h2></div><Link href={`/app/roadmap?track=${path.key}`}>{locale === "my" ? "လမ်းပြမြေပုံဖွင့်မည်" : "Open roadmap"}</Link></header>
          <div className="home-list">
            {/* Every stage in this list is incomplete by construction, so a check mark
                never belongs here. The active stage is marked by the "current" class,
                and each row shows its real position on the roadmap rather than its
                index in this slice of three. */}
            {nextStages.map((stage) => <Link className={stage.status === "active" ? "current" : ""} href={`/app/roadmap?track=${path.key}#milestone-${stage.key}`} key={stage.key}><span className="home-step">{stage.order}</span><span><strong>{stage.title}</strong><small>{stage.proof}</small></span><ArrowRight size={15} aria-hidden="true" /></Link>)}
          </div>
        </section>

        <ChangelogRail releases={getReleases()} locale={locale} />

        <section className="home-section deadlines">
          <header><div><BriefcaseBusiness size={18} aria-hidden="true" /><h2>{locale === "my" ? "သင့်အတွက် သတ်မှတ်ရက်များ" : "Deadlines for you"}</h2></div><Link href="/app/opportunities">{locale === "my" ? "အားလုံးကြည့်မည်" : "See all"}</Link></header>
          {nearbyOpportunities.length ? <div className="home-list">{nearbyOpportunities.map((item) => <Link href="/app/opportunities" key={item.id}><span className="deadline-icon"><Clock3 size={15} aria-hidden="true" /></span><span><strong>{item.title}</strong><small>{item.type}</small><DeadlineChip locale={locale} deadline={item.deadline} showIcon={false} /></span><ArrowRight size={15} aria-hidden="true" /></Link>)}</div> : <p className="home-empty">{c.opportunities.emptyBody}</p>}
        </section>
      </div>
    </div>
  );
}
