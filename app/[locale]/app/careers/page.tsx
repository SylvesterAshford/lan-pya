import { ChevronRight, Compass, Route, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { MeNav } from "@/components/app/me-nav";
import { ArenaMark } from "@/components/paths/arena-mark";
import { PathSwitchButton } from "@/components/paths/path-switch-button";
import { ReadinessSteps } from "@/components/paths/readiness-steps";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getCareerPreferences, getPathHistory } from "@/lib/data/app-data";
import { CAREER_PATH_CATALOG, getAvailabilityLabel, getCareerRecommendations, type CareerPathCatalogItem, type PathAvailabilityLabel } from "@/lib/domain/career-recommendations";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { CareerPreferences } from "@/lib/domain/types";
import { formatAppDate, getAppCopy, localizeCareerTerm, localizePathDescription } from "@/lib/i18n/app-copy";

/** The Compass may never have been answered; recommendations still resolve to
 *  something, so an unanswered Compass reads as no signal rather than no list. */
const EMPTY_PREFERENCES: CareerPreferences = { interests: [], preferredWork: "not_sure", immediateGoal: "not_sure", deviceAccess: "not_sure", connectivity: "not_sure", priorExperience: [] };

/**
 * The full career catalog, sorted by one question: how ready is each path?
 *
 * It used to sort the same seven paths three ways at once (by arena heading,
 * by a status pill, and by hiding previews behind a toggle), and repeated two
 * of them in an "Alternatives" box. Now there are three readiness groups:
 * ready to start, roadmap ready with missions coming, and early stage. Each
 * row carries a Roadmap -> Missions -> Open marker, so how far a path has been
 * built reads at a glance and never by colour alone.
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

  // Compass recommendations are a tag on the rows they match, not a second
  // list: two at most, never the active path, never one that cannot start.
  const recommended = new Set(
    getCareerRecommendations(preferences ?? EMPTY_PREFERENCES)
      .filter((path) => path.availability !== "preview" && path.key !== dashboard.activePath?.key)
      .slice(0, 2)
      .map((path) => path.key),
  );

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

  const byReadiness = (states: PathAvailabilityLabel[]) => CAREER_PATH_CATALOG.filter((path) => states.includes(getAvailabilityLabel(path)));
  // The active path leads its group, then what fits the Compass, then the rest.
  const rank = (path: CareerPathCatalogItem) => (path.key === activeKey ? 0 : recommended.has(path.key) ? 1 : 2);
  const ready = byReadiness(["operational", "controlled_pilot"]).sort((a, b) => rank(a) - rank(b));
  const mapped = byReadiness(["no_missions_yet"]);
  const early = byReadiness(["preview"]);

  const readinessLabels = {
    readiness: c.careers.readiness, roadmap: c.careers.stepRoadmap, missions: c.careers.stepMissions,
    open: c.careers.stepOpen, pilot: c.careers.stepPilot, done: c.careers.stepDone,
    partial: c.careers.stepPartial, notYet: c.careers.stepNotYet,
  };

  // One line of substance per row, phrased for the group it sits in.
  const substance = (path: CareerPathCatalogItem) => {
    const state = getAvailabilityLabel(path);
    const stages = `${num(path.stageCount)} ${c.careers.stages}`;
    if (state === "operational") return `${stages} · ${c.paths.firstMission}: ${path.firstMission}`;
    if (state === "controlled_pilot") return `${stages} · ${c.careers.pilotNote}`;
    if (state === "no_missions_yet") return `${stages} · ${c.careers.missionInDesign}`;
    return `${c.careers.plannedMission}: ${path.firstMission}`;
  };

  const renderRow = (path: CareerPathCatalogItem) => {
    const state = getAvailabilityLabel(path);
    const isActive = path.key === activeKey;
    const canSwitch = (state === "operational" || state === "controlled_pilot") && !isActive;
    const title = localizeCareerTerm(locale, path.key, path.title);
    return (
      <li className={`career-row${isActive ? " is-active" : ""}`} key={path.key}>
        <span className="path-row-mark" aria-hidden="true">
          <ArenaMark arena={path.arena} />
        </span>
        <div className="career-row-copy">
          <span className="path-row-title">
            <strong>{title}</strong>
            {isActive ? <span className="path-row-here">{c.careers.yourPathHere}</span> : null}
            {recommended.has(path.key) ? <span className="career-fit"><Compass size={12} aria-hidden="true" />{c.careers.fitsCompass}</span> : null}
          </span>
          <small>{substance(path)}</small>
          <ReadinessSteps state={state} labels={readinessLabels} />
        </div>
        <div className="career-row-actions">
          {canSwitch ? <PathSwitchButton locale={locale} trackKey={path.key} className="button outline compact">{c.careers.switchTo}</PathSwitchButton> : null}
          <Link className="career-row-roadmap" href={`/app/roadmap?track=${path.key}`} aria-label={`${c.careers.viewRoadmap}: ${title}`}>
            {c.careers.viewRoadmap}<ChevronRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </li>
    );
  };

  const group = (id: string, heading: string, body: string, paths: CareerPathCatalogItem[], footer?: ReactNode) =>
    paths.length ? (
      <section className="career-group" aria-labelledby={id}>
        <header className="career-group-head">
          <h2 id={id}>{heading} <span className="arena-count">· {num(paths.length)}</span></h2>
          <p>{body}</p>
        </header>
        <ul className="career-list">{paths.map(renderRow)}</ul>
        {footer}
      </section>
    ) : null;

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

      {group("careers-ready", c.careers.readyTitle, c.careers.readyBody, ready, (
        <Link className="text-link career-compass-link" href="/onboarding">
          <Compass size={15} aria-hidden="true" /> {c.profile.editCompass}
        </Link>
      ))}
      {group("careers-mapped", c.careers.mappedTitle, c.careers.mappedBody, mapped)}
      {group("careers-early", c.careers.earlyTitle, c.careers.earlyBody, early)}

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
              {/* Same action, same words and size as the switch on the list above. */}
              <PathSwitchButton locale={locale} trackKey={path.key} className="button outline compact">{c.careers.switchTo}</PathSwitchButton>
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

    </div>
  );
}
