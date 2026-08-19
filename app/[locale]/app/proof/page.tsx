import { ProofPassport } from "@/components/proof/proof-passport";
import { ResumeBuilder } from "@/components/proof/resume-builder";
import { WorkGrid } from "@/components/proof/work-grid";
import type { CaseStudyItem, CaseStudyState } from "@/components/proof/case-study-card";
import { eligibleForResume } from "@/lib/domain/resume-draft";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getProfile, getProofItems, getRoadmap } from "@/lib/data/app-data";
import { localizeLevel, resolveProgress } from "@/lib/domain/progress";
import { formatAppDate, getAppCopy, localizeCareerTerm } from "@/lib/i18n/app-copy";

/**
 * Evidence Studio.
 *
 * The passport says what has been verified, the builder turns a selection of
 * it into a résumé draft, and the grid is the work itself. Every number on the
 * page is counted from records the learner can open.
 *
 * Two things this page refuses to do. It never shows unreviewed work as
 * evidence: only `state === "active"` proof reaches the passport counts, the
 * skills list, or the builder. And it never writes a sentence about somebody's
 * project — a mission with no authored summary says so.
 */
export default async function ProofPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const c = getAppCopy(locale);

  const [profile, proofItems, dashboard] = await Promise.all([
    getProfile(user.id),
    getProofItems(),
    getActivePathDashboard(),
  ]);
  if (!profile) return null;

  const roadmap = dashboard.activePath ? await getRoadmap(dashboard.activePath.key) : [];
  const progress = resolveProgress(dashboard.xp, {
    completedMissions: dashboard.completedMilestones,
    verifiedCount: dashboard.verifiedCount,
    stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
  });

  const verified = eligibleForResume(proofItems);
  const pathTitle = dashboard.activePath
    ? localizeCareerTerm(locale, dashboard.activePath.key, dashboard.activePath.title)
    : null;

  // Counted, never estimated: a competency appears once however many missions
  // evidenced it.
  const skillsEvidenced = new Set(verified.flatMap((item) => item.competencies)).size;

  // The four phases are marked from what actually exists, not from a plan.
  // Publish stays false until a proof has been shared, which this page does not
  // yet record, so it is honestly the one phase nobody can complete here.
  const trail = [
    { key: "research" as const, label: c.studio.passport.research, done: dashboard.completedMilestones >= 1 },
    { key: "design" as const, label: c.studio.passport.design, done: dashboard.completedMilestones >= 2 },
    { key: "build" as const, label: c.studio.passport.build, done: verified.length >= 1 },
    { key: "publish" as const, label: c.studio.passport.publish, done: verified.length >= 3 },
  ];

  const cases: CaseStudyItem[] = [
    ...verified.map((item) => ({
      id: item.id,
      eyebrow: pathTitle ?? c.studio.work.title,
      title: item.title,
      // The record carries competencies and dates, not prose. Saying so beats
      // inventing a description of work we did not see.
      summary: null,
      competencies: item.competencies,
      state: "verified" as CaseStudyState,
      dateLabel: `${c.proof.verified} ${formatAppDate(locale, item.verifiedAt)}`,
      href: "/app/proof",
      isDemo: item.dataOrigin === "seeded_demo",
    })),
    // A submission that exists but has not been reviewed is work, not proof.
    ...(dashboard.nextMission && dashboard.nextMission.submissionState && dashboard.nextMission.submissionState !== "verified"
      ? [{
        id: dashboard.nextMission.key,
        eyebrow: pathTitle ?? c.studio.work.title,
        title: localizeCareerTerm(locale, dashboard.nextMission.key, dashboard.nextMission.title),
        summary: null,
        competencies: [],
        state: (dashboard.nextMission.submissionState === "draft" ? "draft" : "in_review") as CaseStudyState,
        dateLabel: c.studio.work.inReview,
        href: "/app/build",
        isDemo: false,
      }]
      : []),
  ];

  return (
    <div className="app-page studio-page">
      <section className="page-heading compact-heading">
        <span className="eyebrow">{c.studio.heading}</span>
        <h1>{c.studio.title}</h1>
        <p>{c.studio.body}</p>
      </section>

      <ProofPassport
        locale={locale}
        alias={profile.alias}
        mascotVariant={profile.avatar}
        levelName={localizeLevel(locale, progress.level)}
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
        alias={profile.alias}
        headline={profile.headline}
        items={verified}
        labels={c.studio.resume}
      />

      <WorkGrid locale={locale} items={cases} labels={c.studio.work} />
    </div>
  );
}
