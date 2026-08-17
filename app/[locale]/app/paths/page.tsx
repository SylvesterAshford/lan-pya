import { ChevronRight, Compass } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PathSwitchButton } from "@/components/paths/path-switch-button";
import { PreviewPathsDisclosure } from "@/components/paths/preview-paths-disclosure";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getCareerPreferences } from "@/lib/data/app-data";
import { CAREER_PATH_CATALOG, getAvailabilityLabel, getCareerRecommendations, type CareerPathCatalogItem } from "@/lib/domain/career-recommendations";
import { CAREER_TRACKS } from "@/lib/domain/career-tracks";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { CareerPreferences } from "@/lib/domain/types";
import { getAppCopy, localizeArena, localizeCareerTerm, localizePathDescription, localizeRecommendationReason } from "@/lib/i18n/app-copy";

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

  // Everything except the active path, split by whether a learner can start it.
  // Startable paths group by arena; previews collapse behind one control so the
  // page does not open with everything at once. DESIGN.md "The Roadmap Catalog".
  const others = CAREER_PATH_CATALOG.filter((path) => path.key !== activeKey);
  const startable = others.filter((path) => getAvailabilityLabel(path) !== "preview");
  const previews = others.filter((path) => getAvailabilityLabel(path) === "preview");

  const groupByArena = (items: CareerPathCatalogItem[]) =>
    Object.entries(
      items.reduce<Record<string, CareerPathCatalogItem[]>>((groups, path) => {
        (groups[path.arena] ??= []).push(path);
        return groups;
      }, {}),
    );

  const availabilityLabel = (path: CareerPathCatalogItem) => {
    switch (getAvailabilityLabel(path)) {
      case "operational": return { text: c.paths.available, tone: "op" };
      case "controlled_pilot": return { text: c.paths.pilot, tone: "pilot" };
      case "no_missions_yet": return { text: c.paths.noMissionsYet, tone: "prev" };
      default: return { text: c.paths.preview, tone: "prev" };
    }
  };

  // Stage count first, then the first mission only when one actually exists.
  // Printing "First mission: Mission design in progress" beside a "No missions
  // yet" label says the same thing twice and reads as filler.
  const substance = (path: CareerPathCatalogItem) => {
    const label = getAvailabilityLabel(path);
    // Startable: stage count and the mission you would begin with.
    if (label === "operational" || label === "controlled_pilot") {
      return [`${path.stageCount} ${c.paths.stages}`, `${c.paths.firstMission}: ${path.firstMission}`, path.timeToFirstProof]
        .filter(Boolean).join(" · ");
    }
    // Roadmap built, no mission authored: the stage count is the honest substance.
    if (label === "no_missions_yet") return `${path.stageCount} ${c.paths.stages}`;
    // Not built yet: say what the path is about rather than leaving an empty line.
    return localizePathDescription(locale, path.key, path.description);
  };

  const renderArenas = (items: CareerPathCatalogItem[]) => groupByArena(items).map(([arena, paths]) => (
    <section className="arena-group" key={arena}>
      <header className="arena-head">
        <h3>{localizeArena(locale, arena)}</h3>
        <span className="arena-count">· {paths.length}</span>
      </header>
      {paths.map((path) => {
        const label = availabilityLabel(path);
        return (
          <Link className="path-row" href={`/app/roadmap?track=${path.key}`} key={path.key}>
            <span className="path-row-copy">
              <strong>{localizeCareerTerm(locale, path.key, path.title)}</strong>
              <small>{substance(path)}</small>
            </span>
            <span className={`avail ${label.tone}`}>{label.text}</span>
            <ChevronRight className="path-row-chevron" size={16} aria-hidden="true" />
          </Link>
        );
      })}
    </section>
  ));

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
          <Link className="button primary compact" href={`/app/roadmap?track=${activeKey}&tab=missions`}>{c.paths.continueBuild}</Link>
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

      <section className="path-section catalog">
        <div className="section-heading">
          <div><span className="eyebrow">{c.paths.browsePaths}</span></div>
        </div>
        {renderArenas(startable)}
        {previews.length ? (
          <PreviewPathsDisclosure
            showLabel={c.paths.showPreviews.replace("{n}", locale === "my" ? toMyanmarDigits(previews.length) : String(previews.length))}
            hideLabel={c.paths.hidePreviews}
          >
            {renderArenas(previews)}
          </PreviewPathsDisclosure>
        ) : null}
      </section>
    </div>
  );
}
