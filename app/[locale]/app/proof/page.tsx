import { Link } from "@/i18n/navigation";
import { ProofPassport } from "@/components/proof/proof-passport";
import { ResumeBuilder } from "@/components/proof/resume-builder";
import { WorkGrid } from "@/components/proof/work-grid";
import type { CaseStudyItem, CaseStudyState } from "@/components/proof/case-study-card";
import type { ResumeProfile } from "@/components/proof/resume-sheet";
import { learnerStatus } from "@/lib/domain/mission-status";
import type { SubmissionState } from "@/lib/domain/types";
import { displayUrl, eligibleForResume, type ResumeSource } from "@/lib/domain/resume-draft";
import { getMissionBrief } from "@/lib/domain/mission-briefs";
import { missionPlace } from "@/lib/domain/mission-place";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getCommunitySettings, getProfile, getProofItems, getRoadmap } from "@/lib/data/app-data";
import { localizeLevel, resolveProgress } from "@/lib/domain/progress";
import { formatAppDate, getAppCopy, localizeCareerTerm, localizeReviewTier } from "@/lib/i18n/app-copy";

/** Missions with their own page; anything else opens the Missions list. */
const MISSION_PAGES = new Set(["responsive-profile-card", "content-creator-awareness", "video-editor-vertical-story", "interactive-opportunity-tracker"]);

/**
 * Evidence Studio.
 *
 * The passport says what has been verified, the builder turns a selection of
 * it into a résumé, and the grid is the work itself. Every number on the page
 * is counted from records the learner can open.
 *
 * Two things this page refuses to do. It never shows unreviewed work as
 * evidence: only `state === "active"` proof reaches the passport counts, the
 * skills list, or the builder. And it never writes a sentence about somebody's
 * project: a card's summary is the mission's own authored brief.
 *
 * Each piece of work is named the way Missions and the roadmap name it, by
 * its path and stage (lib/domain/mission-place), so the same work reads the
 * same on all three screens.
 */
export default async function ProofPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const c = getAppCopy(locale);
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));

  const [profile, proofItems, dashboard, community] = await Promise.all([
    getProfile(user.id),
    getProofItems(user.id),
    getActivePathDashboard(),
    getCommunitySettings(user.id),
  ]);
  if (!profile) return null;

  const roadmap = dashboard.activePath ? await getRoadmap(dashboard.activePath.key) : [];
  const progress = resolveProgress(dashboard.xp, {
    completedMissions: dashboard.completedMissions,
    verifiedCount: dashboard.verifiedCount,
    stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
  });
  const levelName = localizeLevel(locale, progress.level);

  const verified = eligibleForResume(proofItems);
  const pathTitle = dashboard.activePath
    ? localizeCareerTerm(locale, dashboard.activePath.key, dashboard.activePath.title)
    : null;

  // Counted, never estimated: a competency appears once however many missions
  // evidenced it.
  const skillsEvidenced = new Set(verified.flatMap((item) => item.competencies)).size;

  // The four phases are marked from what actually exists, not from a plan.
  const trail = [
    { key: "research" as const, label: c.studio.passport.research, done: dashboard.completedMilestones >= 1 },
    { key: "design" as const, label: c.studio.passport.design, done: dashboard.completedMilestones >= 2 },
    { key: "build" as const, label: c.studio.passport.build, done: verified.length >= 1 },
    { key: "publish" as const, label: c.studio.passport.publish, done: verified.length >= 3 },
  ];

  const submissionLabel = (state: SubmissionState) => {
    const kind = learnerStatus(state).kind;
    if (kind === "completed") return c.runner.completedTitle;
    if (kind === "checking") return c.runner.checkingTitle;
    if (kind === "fix_links" || kind === "changes" || kind === "rejected") return c.build.needsChanges;
    return c.studio.work.inReview;
  };
  const missionHref = (key: string | null | undefined) => (key && MISSION_PAGES.has(key) ? `/app/missions/${key}` : "/app/missions");
  const stageTag = (order: number) => `${c.missions.stage} ${num(order)}`;

  const placed: ResumeSource[] = verified.map((item) => {
    const place = missionPlace(item.missionKey, locale);
    return {
      ...item,
      reviewerTier: localizeReviewTier(locale, item.reviewerTier),
      verifiedLabel: formatAppDate(locale, item.verifiedAt),
      stageLabel: place ? `${stageTag(place.stage.order)} · ${place.stage.title}` : null,
      stageNumber: place?.stage.order ?? null,
      stageTag: place ? stageTag(place.stage.order) : null,
      brief: item.missionKey ? getMissionBrief(item.missionKey, locale)?.intro ?? null : null,
      pathTitle: place?.pathTitle ?? null,
    };
  });

  const next = dashboard.nextMission;
  const nextPlace = next ? missionPlace(next.key, locale) : null;
  const cases: CaseStudyItem[] = [
    ...verified.map((item) => {
      const place = missionPlace(item.missionKey, locale);
      return {
        id: item.id,
        title: item.title,
        stageTitle: place?.stage.title ?? null,
        stageTag: place ? stageTag(place.stage.order) : null,
        pathTitle: place?.pathTitle ?? pathTitle,
        summary: item.missionKey ? getMissionBrief(item.missionKey, locale)?.intro ?? null : null,
        competencies: item.competencies,
        state: "verified" as CaseStudyState,
        dateLabel: `${c.missions.verifiedOn} ${formatAppDate(locale, item.verifiedAt)}`,
        href: missionHref(item.missionKey),
        isDemo: item.dataOrigin === "seeded_demo",
      };
    }),
    // A submission that exists but has not been reviewed is work, not proof.
    ...(next && next.submissionState && next.submissionState !== "verified"
      ? [{
        id: next.key,
        title: localizeCareerTerm(locale, next.key, next.title),
        stageTitle: nextPlace?.stage.title ?? null,
        stageTag: nextPlace ? stageTag(nextPlace.stage.order) : null,
        pathTitle: nextPlace?.pathTitle ?? pathTitle,
        summary: getMissionBrief(next.key, locale)?.intro ?? null,
        competencies: [],
        state: (next.submissionState === "draft" ? "draft" : "in_review") as CaseStudyState,
        // Same words as the mission runner: Completed is not Verified.
        dateLabel: submissionLabel(next.submissionState),
        href: missionHref(next.key),
        isDemo: false,
      }]
      : []),
  ];

  // Everything the résumé shows about the learner comes from their own
  // records: their name, the email they signed in with, the links they chose
  // to share in Community, and where they stand on their path.
  const resumeProfile: ResumeProfile = {
    name: profile.alias,
    email: user.email ?? null,
    telegram: displayUrl(community.telegram),
    linkedin: displayUrl(community.linkedin),
    facebook: displayUrl(community.facebook),
    pathTitle,
    levelLine: c.studio.passport.learnerLine.split("{level}").join(levelName).split("{n}").join(num(progress.level.rank)),
    stagesDone: roadmap.filter((stage) => stage.status === "complete").length,
    stagesTotal: roadmap.length,
  };

  return (
    <div className="app-page studio-page">
      {/* Heading and the two things you can do with this page sit on one line.
          The actions are on the right because they act on the whole record,
          not on any one card below. */}
      <div className="studio-hero">
        <section className="page-heading compact-heading">
          <span className="eyebrow">{c.studio.heading}</span>
          <h1>{c.studio.title}</h1>
          <p>{c.studio.body}</p>
        </section>
        <div className="studio-actions">
          <Link className="button primary" href="/app/missions">{c.studio.actions.add}</Link>
          <Link className="button outline" href="/app/profile">{c.studio.actions.preview}</Link>
        </div>
      </div>

      {/* Three bands, each full width: what the record says, what you can make
          from it, and the work itself. Side by side, the passport and the
          builder were each too narrow and the passport stretched into an empty
          slab of navy beside the longer builder. */}
      <ProofPassport
        locale={locale}
        alias={profile.alias}
        mascotVariant={profile.avatar}
        levelName={levelName}
        levelRank={progress.level.rank}
        availability={profile.headline}
        completedMissions={dashboard.completedMilestones}
        humanVerified={verified.length}
        skillsEvidenced={skillsEvidenced}
        trail={trail}
        labels={c.studio.passport}
      />

      <ResumeBuilder
        locale={locale}
        profile={resumeProfile}
        defaultRole={profile.headline ?? pathTitle ?? ""}
        items={placed}
        labels={c.studio.resume}
      />

      <WorkGrid locale={locale} items={cases} labels={c.studio.work} />
    </div>
  );
}
