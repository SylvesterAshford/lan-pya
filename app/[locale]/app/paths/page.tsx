import { ChevronRight, Compass } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PathSwitchButton } from "@/components/paths/path-switch-button";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getCareerPreferences } from "@/lib/data/app-data";
import { getCareerRecommendations } from "@/lib/domain/career-recommendations";
import { CAREER_TRACKS } from "@/lib/domain/career-tracks";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { CareerPreferences } from "@/lib/domain/types";
import { getAppCopy, localizeCareerTerm, localizeRecommendationReason } from "@/lib/i18n/app-copy";

const EMPTY_PREFERENCES: CareerPreferences = { interests: [], preferredWork: "not_sure", immediateGoal: "not_sure", deviceAccess: "not_sure", connectivity: "not_sure", priorExperience: [] };

export default async function PathsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = getAppCopy(locale);
  const user = await requireUser(locale);
  const [dashboard, preferences] = await Promise.all([getActivePathDashboard(), getCareerPreferences(user.id)]);
  const recommendations = getCareerRecommendations(preferences ?? EMPTY_PREFERENCES);
  const hasSkillRoadmap = CAREER_TRACKS.some((track) => track.key === dashboard.activePath?.key);
  const alternatives = recommendations.filter((path) => path.availability !== "preview" && path.key !== dashboard.activePath?.key).slice(0, 2);

  if (!dashboard.activePath) {
    return <div className="app-page paths-page"><section className="empty-path-state panel"><Compass size={24} aria-hidden="true" /><span className="eyebrow">{c.paths.direction}</span><h1>{c.paths.emptyTitle}</h1><p>{c.paths.emptyBody}</p><Link className="button primary" href="/onboarding">{c.paths.findPath}</Link></section></div>;
  }

  const activeKey = dashboard.activePath.key;
  // Burmese runs Myanmar numerals, matching the deadline countdowns.
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));






  return (
    <div className="app-page paths-page">
      <section className="page-heading compact-heading">
        <span className="eyebrow">{c.paths.direction}</span>
        <h1>{c.paths.title}</h1>
        <p>{c.paths.body}</p>
      </section>

      {/* The only element on this screen allowed to read as a card. */}
      <section className="your-path">
        <div className="your-path-copy">
          <span className="eyebrow">{c.paths.yourPath}</span>
          <h2>{localizeCareerTerm(locale, activeKey, dashboard.activePath.title)}</h2>
          <p>
            {c.paths.stepOf.replace("{a}", num(dashboard.completedMilestones + 1)).replace("{b}", num(dashboard.totalMilestones))}
            {dashboard.nextMission ? ` · ${localizeCareerTerm(locale, dashboard.nextMission.key, dashboard.nextMission.title)}` : ""}
          </p>
        </div>
        <div className="your-path-pct" aria-hidden="true">{dashboard.progressPercent}%</div>
        <div className="your-path-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dashboard.progressPercent} aria-label={`${dashboard.progressPercent}% ${c.paths.complete}`}>
          <span style={{ width: `${dashboard.progressPercent}%` }} />
        </div>
        <div className="your-path-actions">
          {hasSkillRoadmap ? <Link className="button outline compact" href={`/app/roadmap?track=${activeKey}`}>{c.paths.viewRoadmap}</Link> : null}
          <Link className="button primary compact" href="/app/missions">{c.paths.continueBuild}</Link>
        </div>
      </section>

      {alternatives.length ? (
        <section className="path-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{c.paths.alternatives}</span>
              {/* Heading matches the count. It previously always promised two. */}
              <h2>{alternatives.length === 1 ? c.paths.alternativesTitleOne : c.paths.alternativesTitle}</h2>
            </div>
            <Link className="text-link" href="/app/profile">{c.paths.editCompass} →</Link>
          </div>
          <div className="alt-list">
            {alternatives.map((path) => (
              <div className="alt-row" key={path.key}>
                <span className="alt-copy">
                  <strong>{localizeCareerTerm(locale, path.key, path.title)}</strong>
                  <small>{localizeRecommendationReason(locale, path.reason)}</small>
                </span>
                <PathSwitchButton locale={locale} trackKey={path.key}>{c.paths.choosePath}</PathSwitchButton>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <Link className="explore-link" href="/app/careers">
        <span>
          <strong>{c.careers.title}</strong>
          <small>{c.careers.body}</small>
        </span>
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}
