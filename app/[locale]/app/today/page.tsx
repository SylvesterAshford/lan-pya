import { Link } from "@/i18n/navigation";
import { Compass } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { LevelUpMoment } from "@/components/app/level-up-moment";
import { TodaysClimb } from "@/components/home/todays-climb";
import { UpNext } from "@/components/home/up-next";
import { YouCard, type YouPath } from "@/components/home/you-card";
import { buildUpNext } from "@/lib/domain/home-feed";
import { getStageMission, VERIFIED_MISSION_POINTS } from "@/lib/domain/mission-briefs";
import { localizeLevel, resolveProgress } from "@/lib/domain/progress";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { getActivePathDashboard, getOpportunities, getPathHistory, getProfile, getProofItems, getRoadmap } from "@/lib/data/app-data";
import { getAppCopy, localizeCareerTerm, localizeOpportunity, localizeRoadmapMilestone } from "@/lib/i18n/app-copy";
export default async function TodayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const [dashboard, opportunities, profile, proofItems, history] = await Promise.all([
    getActivePathDashboard(),
    getOpportunities(),
    getProfile(user.id),
    getProofItems(),
    getPathHistory(user.id),
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
    completedMissions: dashboard.completedMissions,
    verifiedCount: dashboard.verifiedCount,
    stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
  });

  const localizedOpportunities = opportunities.map((item) => localizeOpportunity(locale, item));
  const upNext = buildUpNext({
    mission: { key: mission.key, title: localizeCareerTerm(locale, mission.key, mission.title), submissionState: mission.submissionState },
    paused: dashboard.pausedWork.map((work) => ({
      missionKey: work.missionKey,
      missionTitle: localizeCareerTerm(locale, work.missionKey, work.missionTitle),
      pathTitle: localizeCareerTerm(locale, work.pathKey, work.pathTitle),
    })),
    opportunities: localizedOpportunities,
  });

  // Skills come from proof that is still standing. An invalidated record is
  // not evidence, so it does not get to add one.
  const standing = proofItems.filter((item) => item.state === "active");
  const skills = [...new Set(standing.flatMap((item) => item.competencies))];

  // Every path the learner has walked, with where they stand on it. The
  // active path uses the roadmap already loaded; a previous path reads its own.
  const youPaths: YouPath[] = await Promise.all(
    [...history].sort((a, b) => (a.state === "active" ? -1 : b.state === "active" ? 1 : 0)).map(async (item) => {
      const stages = item.key === path.key ? roadmap : await getRoadmap(item.key);
      const here = stages.find((stage) => stage.status === "active") ?? stages.find((stage) => stage.status !== "complete");
      return { key: item.key, title: localizeCareerTerm(locale, item.key, item.title), stage: here?.order ?? stages.length, total: stages.length, current: item.state === "active" };
    }),
  );

  // One line of where the learner stands, all of it read from their records.
  const meta = c.home.meta
    .replace("{a}", num(currentStage ? currentStage.order : 0))
    .replace("{b}", num(roadmap.length))
    .replace("{path}", pathTitle)
    .replace("{points}", num(progress.xp))
    .replace("{level}", localizeLevel(locale, progress.level));

  return (
    <div className="app-page home-page">
      <header className="home-greeting">
        <h1>{greeting}</h1>
        <p>{meta}</p>
      </header>

      <TodaysClimb
        locale={locale}
        mascotVariant={mascotVariant}
        pathTitle={pathTitle}
        missionTitle={currentStage ? currentStage.title : null}
        missionBrief={currentStage ? currentStage.proof : null}
        stageIndex={currentStage ? currentStage.order : 0}
        stageTotal={roadmap.length}
        missionHref="/app/missions"
        // Points are promised only for a stage that has a mission to verify.
        pointsAward={currentStage && getStageMission(path.key, currentStage.key) ? VERIFIED_MISSION_POINTS : null}
        stageHref={`/app/roadmap?track=${path.key}`}
        levelRank={progress.level.rank}
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
              completedMissions: dashboard.completedMissions,
              verifiedCount: dashboard.verifiedCount,
              stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
            }).my]
            : [`Passed ${progress.level.minXp} points`, progress.level.gate({
              completedMissions: dashboard.completedMissions,
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

      <div className="home-columns">
        <UpNext items={upNext} locale={locale} labels={c.home.feed} runner={c.runner} />
        <YouCard
          locale={locale}
          alias={alias}
          headline={profile?.headline ?? null}
          mascotVariant={mascotVariant}
          progress={progress}
          paths={youPaths}
          verifiedCount={standing.length}
          skills={skills}
          labels={c.home.you}
        />
      </div>
    </div>
  );
}
