import { requireUser } from "@/lib/auth";
import { ProofPassport } from "@/components/proof/proof-passport";
import { ResumeBuilder } from "@/components/proof/resume-builder";
import { WorkGrid } from "@/components/proof/work-grid";
import type { CaseStudyItem } from "@/components/proof/case-study-card";
import { getActivePathDashboard, getProfile, getProofItems } from "@/lib/data/app-data";
import { eligibleForResume } from "@/lib/domain/resume-draft";
import { localizeLevel, resolveProgress } from "@/lib/domain/progress";
import { formatAppDate, getAppCopy, localizeCareerTerm } from "@/lib/i18n/app-copy";

/**
 * Evidence Studio.
 *
 * Three things, in the order a learner needs them: what their record says
 * (passport), what is in it (completed work), and what they can make from it
 * (the résumé builder).
 *
 * The counts are all derived here rather than inside the components, so there
 * is one place to check that every figure on this page traces to a record.
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

  // Only proof that is still standing counts. An invalidated record is not
  // evidence, and counting it would inflate every figure on the page.
  const standing = eligibleForResume(proofItems);
  const skills = [...new Set(standing.flatMap((item) => item.competencies))];
  const pathTitle = dashboard.activePath
    ? localizeCareerTerm(locale, dashboard.activePath.key, dashboard.activePath.title)
    : null;

  const progress = resolveProgress(dashboard.xp, {
    completedMissions: dashboard.completedMilestones,
    verifiedCount: dashboard.verifiedCount,
    stagesTouched: dashboard.completedMilestones,
  });

  // The trail describes where the evidence reaches, not where the learner
  // hopes to get. Publish stays false until something is shared, which the
  // product does not record yet — so it never claims otherwise.
  const trail = [
    { key: "research" as const, label: c.studio.passport.research, done: dashboard.completedMilestones >= 1 },
    { key: "design" as const, label: c.studio.passport.design, done: dashboard.completedMilestones >= 2 },
    { key: "build" as const, label: c.studio.passport.build, done: standing.length >= 1 },
    { key: "publish" as const, label: c.studio.passport.publish, done: standing.length >= 3 },
  ];

  const verifiedCards: CaseStudyItem[] = standing.map((item) => ({
    id: item.id,
    eyebrow: pathTitle ?? c.studio.work.verified,
    title: item.title,
    // The product stores competencies and review metadata, never a written
    // summary. Saying so beats inventing a description of someone's project.
    summary: null,
    competencies: item.competencies,
    state: "verified",
    dateLabel: `${c.proof.verified} ${formatAppDate(locale, item.verifiedAt)}`,
    href: "/app/proof",
    isDemo: item.dataOrigin === "seeded_demo",
  }));

  // A submission that exists but is not verified is work in review — shown as
  // itself, never as proof.
  const mission = dashboard.nextMission;
  const inReview: CaseStudyItem[] =
    mission && mission.submissionState && mission.submissionState !== "verified"
      ? [{
        id: `submission-${mission.key}`,
        eyebrow: pathTitle ?? c.studio.work.inReview,
        title: localizeCareerTerm(locale, mission.key, mission.title),
        summary: null,
        competencies: [],
        state: mission.submissionState === "draft" ? "draft" : "in_review",
        dateLabel: c.studio.work.inReview,
        href: "/app/build",
        isDemo: false,
      }]
      : [];

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
        humanVerified={standing.length}
        skillsEvidenced={skills.length}
        trail={trail}
        labels={c.studio.passport}
      />

      <WorkGrid locale={locale} items={[...inReview, ...verifiedCards]} labels={c.studio.work} />

      <ResumeBuilder
        locale={locale}
        alias={profile.alias}
        headline={profile.headline}
        items={standing}
        labels={c.studio.resume}
      />
    </div>
  );
}
