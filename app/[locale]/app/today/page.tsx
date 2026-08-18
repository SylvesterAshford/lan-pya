import { Link } from "@/i18n/navigation";
import { Compass } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { LevelUpMoment } from "@/components/app/level-up-moment";
import { ChangelogRail } from "@/components/app/changelog-rail";
import { TodaysClimb } from "@/components/home/todays-climb";
import { MomentumTrack } from "@/components/home/momentum-track";
import { ThisWeek } from "@/components/home/this-week";
import { ProofPanel } from "@/components/home/proof-panel";
import { OpportunitySignal } from "@/components/home/opportunity-signal";
import { getReleases } from "@/lib/domain/changelog";
import { localizeLevel, resolveProgress } from "@/lib/domain/progress";
import { byDeadlineAscending, getDeadlineStatus, toMyanmarDigits } from "@/lib/domain/deadlines";
import { getActivePathDashboard, getOpportunities, getProfile, getProofItems, getRoadmap } from "@/lib/data/app-data";
import { getAppCopy, localizeCareerTerm, localizeOpportunity, localizeRoadmapMilestone } from "@/lib/i18n/app-copy";
export default async function TodayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const [dashboard, opportunities, profile, proofItems] = await Promise.all([
    getActivePathDashboard(),
    getOpportunities(),
    getProfile(user.id),
    getProofItems(),
  ]);
  const c = getAppCopy(locale);
  const path = dashboard.activePath;
  const mission = dashboard.nextMission;
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));

  // The character follows the account. Home is the screen a learner opens most,
  // so a hardcoded figure here would quietly undo the choice they made.
  const alias = profile?.alias ?? "Learner";
  const mascotVariant = profile?.avatar ?? "traveller";

  // Time of day in the reader's timezone, not the server's. Vercel runs UTC;
  // greeting a learner in Yangon "good morning" at 7pm would be a small lie
  // told every evening.
  const yangonHour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Yangon" }).format(new Date()),
  );
  const greetingTemplate =
    yangonHour < 12 ? c.home.greetingMorning : yangonHour < 17 ? c.home.greetingAfternoon : c.home.greetingEvening;
  const greeting = greetingTemplate.replace("{name}", alias);

  if (!path || !mission) {
    return (
      <div className="app-page home-page">
        <section className="empty-path-state panel">
          <Compass size={24} aria-hidden="true" />
          <h1>{c.today.emptyTitle}</h1>
          <p>{c.today.emptyBody}</p>
          <Link className="button primary" href="/onboarding">{c.today.openCompass}</Link>
        </section>
      </div>
    );
  }

  const roadmap = (await getRoadmap(path.key)).map((stage) => localizeRoadmapMilestone(locale, stage));
  const pathTitle = localizeCareerTerm(locale, path.key, path.title);
  const nextStages = roadmap.filter((stage) => stage.status !== "complete");
  // Lead with the stage the learner is actually on. The controlled pilot has a
  // single authored mission attached to stage 1, so naming the mission here made
  // Home claim "Three-piece awareness campaign" while the roadmap and the list
  // below both said "Mobile production". The stage is the shared truth across
  // every surface; the mission is context under it.
  const currentStage = nextStages.find((stage) => stage.status === "active") ?? nextStages[0];

  const progress = resolveProgress(dashboard.xp, {
    completedMissions: dashboard.completedMilestones,
    verifiedCount: dashboard.verifiedCount,
    stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
  });

  const localizedOpportunities = opportunities.map((item) => localizeOpportunity(locale, item));
  // Seven days is the window the panel claims, so the filter has to enforce it
  // rather than trusting the ordering to be close enough.
  const closingThisWeek = localizedOpportunities
    .filter((item) => {
      const { urgency } = getDeadlineStatus(item.deadline);
      return urgency === "today" || urgency === "tomorrow" || urgency === "soon";
    })
    .sort(byDeadlineAscending)
    .map((item) => ({ id: item.id, title: item.title, organization: item.organization, deadline: item.deadline }));

  const paused = dashboard.pausedWork.map((work) => ({
    missionKey: work.missionKey,
    missionTitle: localizeCareerTerm(locale, work.missionKey, work.missionTitle),
    pathTitle: localizeCareerTerm(locale, work.pathKey, work.pathTitle),
  }));

  // Competencies come from proof that is actually still standing. An
  // invalidated record is not evidence, so it does not get to add a chip.
  const competencies = [...new Set(proofItems.filter((item) => item.state === "active").flatMap((item) => item.competencies))];

  // One submission, not yet verified, is one proof in progress. Anything more
  // specific than that is not recorded.
  const inProgressCount = mission.submissionState && mission.submissionState !== "verified" ? 1 : 0;

  return (
    <div className="app-page home-page">
      <header className="home-greeting">
        <h1>{greeting}</h1>
        <p>{c.home.subtitle}</p>
      </header>

      <TodaysClimb
        locale={locale}
        mascotVariant={mascotVariant}
        pathTitle={pathTitle}
        missionTitle={currentStage ? currentStage.title : null}
        missionBrief={currentStage ? currentStage.proof : null}
        stageIndex={currentStage ? currentStage.order : 0}
        stageTotal={roadmap.length}
        missionHref="/app/build"
        pointsAward={100}
        labels={{ ...c.home.climb, subtitle: c.home.subtitle }}
      />

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
          my
            ? [`အမှတ် ${toMyanmarDigits(progress.level.minXp)} ကျော်လွန်ပြီး`, progress.level.gate({
              completedMissions: dashboard.completedMilestones,
              verifiedCount: dashboard.verifiedCount,
              stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
            }).my]
            : [`Passed ${progress.level.minXp} points`, progress.level.gate({
              completedMissions: dashboard.completedMilestones,
              verifiedCount: dashboard.verifiedCount,
              stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
            }).en]
        }
        labels={my ? {
          reached: "{level} အဆင့်သို့ ရောက်ရှိပြီ",
          subtitle: "{path} တွင် အဆင့် {n} / ၅",
          earnedLead: "ဖြည့်ဆည်းပြီးသည်များ",
          dismiss: "ဆက်လုပ်မည်",
          honesty: "အဆင့်များသည် Lan Pya အတွင်းရှိ တိုးတက်မှုကို ဖော်ပြသည်။ အလုပ်ရနိုင်သည်ဟု မဆိုလိုပါ။",
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

      <MomentumTrack
        locale={locale}
        completedMilestones={dashboard.completedMilestones}
        verifiedCount={dashboard.verifiedCount}
        inProgressCount={inProgressCount}
        labels={{
          ...c.home.momentum,
          summary: c.home.momentum.summary
            .replace("{a}", num(dashboard.completedMilestones))
            .replace("{b}", num(inProgressCount)),
        }}
      />

      <div className="home-grid">
        <ThisWeek locale={locale} closing={closingThisWeek} paused={paused} labels={c.home.week} />

        <div className="home-side">
          <ProofPanel
            locale={locale}
            competencies={competencies}
            points={progress.xp}
            levelName={localizeLevel(locale, progress.level)}
            mascotVariant={mascotVariant}
            labels={c.home.proof}
          />
          <OpportunitySignal
            locale={locale}
            item={localizedOpportunities[0] ?? null}
            labels={c.home.signal}
          />
        </div>
      </div>

      <ChangelogRail releases={getReleases()} locale={locale} />

      <aside className="home-note">
        <Compass size={16} aria-hidden="true" />
        <p>{c.home.note}</p>
      </aside>
    </div>
  );
}
