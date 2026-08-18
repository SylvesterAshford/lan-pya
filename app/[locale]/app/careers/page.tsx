import { ChevronRight, Compass, Route, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MeNav } from "@/components/app/me-nav";
import { ArenaMark } from "@/components/paths/arena-mark";
import { PathSwitchButton } from "@/components/paths/path-switch-button";
import { PreviewPathsDisclosure } from "@/components/paths/preview-paths-disclosure";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getCareerPreferences, getPathHistory } from "@/lib/data/app-data";
import { CAREER_PATH_CATALOG, getAvailabilityLabel, getCareerRecommendations, type CareerPathCatalogItem } from "@/lib/domain/career-recommendations";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { CareerPreferences } from "@/lib/domain/types";
import { formatAppDate, getAppCopy, localizeArena, localizeCareerTerm, localizePathDescription, localizeRecommendationReason } from "@/lib/i18n/app-copy";

/** The Compass may never have been answered; recommendations still resolve to
 *  something, so an unanswered Compass reads as no signal rather than no list. */
const EMPTY_PREFERENCES: CareerPreferences = { interests: [], preferredWork: "not_sure", immediateGoal: "not_sure", deviceAccess: "not_sure", connectivity: "not_sure", priorExperience: [] };

/**
 * The full career catalog.
 *
 * It used to sit under Roadmaps, below the learner's own path and their
 * recommendations. Three sections of browsing on the screen a learner opens to
 * find their next step is noise: Roadmaps answers "where am I", this answers
 * "what else is there". Different questions, different places.
 */
export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const c = getAppCopy(locale);
  const [dashboard, preferences, history] = await Promise.all([
    getActivePathDashboard(),
    getCareerPreferences(user.id),
    getPathHistory(user.id),
  ]);

  const my = locale === "my";
  const digits = (value: number) => (my ? toMyanmarDigits(value) : String(value));

  // Nothing a learner cannot start, never the path already active, two at most
  // so this stays a decision rather than a second catalog.
  const alternatives = getCareerRecommendations(preferences ?? EMPTY_PREFERENCES)
    .filter((path) => path.availability !== "preview" && path.key !== dashboard.activePath?.key)
    .slice(0, 2);

  const previousPaths = history.filter((path) => path.state === "previous");

  // A path with no published stages has no step to be on, and a finished path
  // is on its last step rather than one past the end.
  const stepLine = dashboard.activePath && dashboard.totalMilestones
    ? c.paths.stepOf
      .replace("{a}", digits(Math.min(dashboard.completedMilestones + 1, dashboard.totalMilestones)))
      .replace("{b}", digits(dashboard.totalMilestones))
    : null;
  const activeKey = dashboard.activePath?.key;
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));

  const startable = CAREER_PATH_CATALOG.filter((path) => getAvailabilityLabel(path) !== "preview");
  const previews = CAREER_PATH_CATALOG.filter((path) => getAvailabilityLabel(path) === "preview");

  const groupByArena = (items: CareerPathCatalogItem[]) =>
    Object.entries(
      items.reduce<Record<string, CareerPathCatalogItem[]>>((groups, path) => {
        (groups[path.arena] ??= []).push(path);
        return groups;
      }, {}),
    );

  const label = (path: CareerPathCatalogItem) => {
    switch (getAvailabilityLabel(path)) {
      case "operational": return { text: c.paths.available, tone: "op" };
      case "controlled_pilot": return { text: c.paths.pilot, tone: "pilot" };
      case "no_missions_yet": return { text: c.paths.noMissionsYet, tone: "prev" };
      default: return { text: c.paths.preview, tone: "prev" };
    }
  };

  // One shape on every row: how long the path is, then where it starts when
  // that is known. It used to return stages, or stages plus first mission, or
  // a description, depending on state — so the same line meant three things
  // down one column.
  const substance = (path: CareerPathCatalogItem) => {
    const state = getAvailabilityLabel(path);
    const stages = `${num(path.stageCount)} ${c.careers.stages}`;
    if (state === "operational" || state === "controlled_pilot") {
      return `${stages} · ${c.paths.firstMission}: ${path.firstMission}`;
    }
    return stages;
  };

  const renderArenas = (items: CareerPathCatalogItem[]) => groupByArena(items).map(([arena, paths]) => (
    <section className="arena-group" key={arena}>
      <header className="arena-head">
        <h3>{localizeArena(locale, arena)}</h3>
        <span className="arena-count">· {num(paths.length)}</span>
      </header>
      {paths.map((path) => {
        const state = label(path);
        const isActive = path.key === activeKey;
        return (
          <Link className={`path-row${isActive ? " is-active" : ""}`} href={`/app/roadmap?track=${path.key}`} key={path.key}>
            <span className="path-row-mark" aria-hidden="true">
              <ArenaMark arena={path.arena} />
            </span>
            <span className="path-row-copy">
              <span className="path-row-title">
                <strong>{localizeCareerTerm(locale, path.key, path.title)}</strong>
                {/* Where you are is a fact about you; the pill on the right is a
                    fact about the path. They shared one slot, so an active path
                    stopped reporting whether it could be started at all. */}
                {isActive ? <span className="path-row-here">{c.careers.yourPathHere}</span> : null}
              </span>
              <small>{substance(path)}</small>
            </span>
            <span className={`avail ${state.tone}`}>{state.text}</span>
            <ChevronRight className="path-row-chevron" size={16} aria-hidden="true" />
          </Link>
        );
      })}
    </section>
  ));

  return (
    <div className="app-page me-page">
      <MeNav locale={locale} active="careers" />
      <section className="page-heading compact-heading">
        <span className="eyebrow">{c.careers.heading}</span>
        <h1>{c.careers.title}</h1>
        <p>{c.careers.body}</p>
      </section>

      {/* Your track first. This tab answers "which path am I on and what else
          is there", so the answer to the first half opens it; the catalog
          below answers the second. */}
      {dashboard.activePath ? (
        <section className="track-card" aria-labelledby="track-card-title">
          <span className="track-card-mark" aria-hidden="true">
            <Route size={26} strokeWidth={1.75} />
          </span>

          <div className="track-card-copy">
            <span className="track-card-eyebrow">{c.paths.yourPath}</span>
            <h2 id="track-card-title">{localizeCareerTerm(locale, dashboard.activePath.key, dashboard.activePath.title)}</h2>
            <p>{localizePathDescription(locale, dashboard.activePath.key, dashboard.activePath.description)}</p>

            <div className="track-card-meter">
              <span
                className="track-card-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={dashboard.progressPercent}
                aria-label={`${digits(dashboard.progressPercent)}% ${c.paths.complete}`}
              >
                <span style={{ width: `${dashboard.progressPercent}%` }} />
              </span>
              <strong aria-hidden="true">{digits(dashboard.progressPercent)}%</strong>
            </div>
            {stepLine ? <small className="track-card-step">{stepLine}</small> : null}
          </div>

          <div className="track-card-actions">
            <Link className="button primary compact" href="/app/roadmap">{c.paths.viewRoadmap}</Link>
            <Link className="button outline compact" href="/app/missions">{c.paths.continueBuild}</Link>
          </div>
        </section>
      ) : null}

      {/* Switching path is the other half of "current track", so it sits with
          it rather than three screens away. */}
      {alternatives.length ? (
        <section className="switch-block" aria-labelledby="switch-title">
          <header>
            <span className="switch-icon" aria-hidden="true"><Sparkles size={16} /></span>
            <h2 id="switch-title">{c.paths.alternatives}</h2>
          </header>
          <ul className="switch-list">
            {alternatives.map((path) => (
              <li className="switch-row" key={path.key}>
                <span className="switch-row-mark" aria-hidden="true">
                  <ArenaMark arena={path.arena} />
                </span>
                <span className="switch-row-copy">
                  <strong>{localizeCareerTerm(locale, path.key, path.title)}</strong>
                  <small>{localizeRecommendationReason(locale, path.reason)}</small>
                </span>
                <PathSwitchButton locale={locale} trackKey={path.key}>{c.paths.choosePath}</PathSwitchButton>
              </li>
            ))}
          </ul>
          <Link className="text-link" href="/onboarding">
            <Compass size={15} aria-hidden="true" /> {c.profile.editCompass}
          </Link>
        </section>
      ) : null}

      {renderArenas(startable)}

      {previousPaths.length || dashboard.pausedWork.length ? (
        <section className="arena-group" aria-labelledby="paused-title">
          <header className="arena-head">
            <h3 id="paused-title">{c.profile.previous}</h3>
            <span className="arena-count">· {digits(previousPaths.length + dashboard.pausedWork.length)}</span>
          </header>
          {previousPaths.map((path) => (
            <div className="paused-row" key={path.key}>
              <span className="paused-row-mark" aria-hidden="true"><Route size={17} strokeWidth={1.75} /></span>
              <span className="paused-row-copy">
                <strong>{localizeCareerTerm(locale, path.key, path.title)}</strong>
                <small>{c.profile.pausedPath} · {c.profile.lastActive} {path.lastActivatedAt ? formatAppDate(locale, path.lastActivatedAt) : c.profile.recently}</small>
              </span>
              <PathSwitchButton locale={locale} trackKey={path.key}>{c.paths.choosePath}</PathSwitchButton>
            </div>
          ))}
          {dashboard.pausedWork.map((work) => (
            <Link className="paused-row" key={work.missionKey} href="/app/missions">
              <span className="paused-row-mark" aria-hidden="true"><Sparkles size={17} /></span>
              <span className="paused-row-copy">
                <strong>{localizeCareerTerm(locale, work.missionKey, work.missionTitle)}</strong>
                <small>{localizeCareerTerm(locale, work.pathKey, work.pathTitle)}</small>
              </span>
              <ChevronRight size={16} aria-hidden="true" className="path-row-chevron" />
            </Link>
          ))}
        </section>
      ) : null}

      {previews.length ? (
        <PreviewPathsDisclosure
          showLabel={c.paths.showPreviews.replace("{n}", num(previews.length))}
          hideLabel={c.paths.hidePreviews}
        >
          {renderArenas(previews)}
        </PreviewPathsDisclosure>
      ) : null}
    </div>
  );
}
