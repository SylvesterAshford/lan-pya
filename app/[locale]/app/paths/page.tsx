import { Compass, FolderKanban, LockKeyhole, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PathSwitchButton } from "@/components/paths/path-switch-button";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getCareerPreferences } from "@/lib/data/app-data";
import { CAREER_PATH_CATALOG, getCareerRecommendations } from "@/lib/domain/career-recommendations";
import type { CareerPreferences } from "@/lib/domain/types";
import { getAppCopy, localizeArena, localizeCareerTerm, localizePathDescription, localizeRecommendationReason } from "@/lib/i18n/app-copy";

const EMPTY_PREFERENCES: CareerPreferences = { interests: [], preferredWork: "not_sure", immediateGoal: "not_sure", deviceAccess: "not_sure", connectivity: "not_sure", priorExperience: [] };

export default async function PathsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = getAppCopy(locale);
  const user = await requireUser(locale);
  const [dashboard, preferences] = await Promise.all([getActivePathDashboard(), getCareerPreferences(user.id)]);
  const recommendations = getCareerRecommendations(preferences ?? EMPTY_PREFERENCES);
  const alternatives = recommendations.filter((path) => path.availability !== "preview" && path.key !== dashboard.activePath?.key).slice(0, 2);
  const catalogByArena = CAREER_PATH_CATALOG.reduce<Record<string, typeof CAREER_PATH_CATALOG>>((groups, path) => {
    (groups[path.arena] ??= []).push(path);
    return groups;
  }, {});

  if (!dashboard.activePath) {
    return <div className="app-page paths-page"><section className="empty-path-state panel"><Compass size={24} aria-hidden="true" /><span className="eyebrow">{c.paths.direction}</span><h1>{c.paths.emptyTitle}</h1><p>{c.paths.emptyBody}</p><Link className="button primary" href="/onboarding">{c.paths.findPath}</Link></section></div>;
  }

  return (
    <div className="app-page paths-page">
      <section className="page-heading compact-heading"><span className="eyebrow">{c.paths.direction}</span><h1>{c.paths.title}</h1><p>{c.paths.body}</p></section>
      <section className="active-path-panel panel">
        <div className="active-path-icon"><Compass size={22} aria-hidden="true" /></div>
        <div className="active-path-copy"><span className="eyebrow">{c.paths.activePath}</span><h2>{localizeCareerTerm(locale, dashboard.activePath.key, dashboard.activePath.title)}</h2><p>{localizePathDescription(locale, dashboard.activePath.key, dashboard.activePath.description)}</p><div className="path-inline-meta"><span>{dashboard.progressPercent}% {c.paths.complete}</span><span>{dashboard.xp} {c.paths.xpOnPath}</span><span>{dashboard.activePath.availability === "controlled_pilot" ? c.paths.pilot : c.paths.ready}</span></div></div>
        <Link className="button primary" href="/app/build">{c.paths.continueBuild}</Link>
      </section>
      <section className="path-section alternatives-section">
        <div className="section-heading"><div><span className="eyebrow">{c.paths.alternatives}</span><h2>{c.paths.alternativesTitle}</h2></div><Link className="text-link" href="/app/profile">{c.paths.editCompass} →</Link></div>
        {alternatives.length ? <div className="alternative-list">{alternatives.map((path) => <article className="panel alternative-path" key={path.key}><div className="path-card-top"><span className="path-icon"><Sparkles size={20} aria-hidden="true" /></span><span className="status-tag pilot">{path.availability === "controlled_pilot" ? c.paths.pilot : c.paths.ready}</span></div><h3>{localizeCareerTerm(locale, path.key, path.title)}</h3><p>{localizeRecommendationReason(locale, path.reason)}</p><small>{c.paths.firstMission}: {localizeCareerTerm(locale, path.key === "content-creator" ? "content-creator-awareness" : path.key, path.firstMission)} · {path.timeToFirstProof}</small><PathSwitchButton locale={locale} trackKey={path.key}>{c.paths.choosePath}</PathSwitchButton></article>)}</div> : <article className="panel compact-empty"><p>{c.paths.onlyAvailable}</p></article>}
      </section>
      <details className="career-catalog panel"><summary><span><FolderKanban size={20} aria-hidden="true" /><strong>{c.paths.exploreAll}</strong><small>{c.paths.catalogBody}</small></span><span className="catalog-count">{CAREER_PATH_CATALOG.length} {c.paths.paths}</span></summary><div className="catalog-groups">{Object.entries(catalogByArena).map(([arena, paths]) => <section key={arena} className="catalog-group"><h3>{localizeArena(locale, arena)}</h3><div>{paths.map((path) => <article key={path.key} className="catalog-row"><span className="catalog-row-icon">{path.availability === "preview" ? <LockKeyhole size={17} aria-hidden="true" /> : <Compass size={17} aria-hidden="true" />}</span><div><strong>{localizeCareerTerm(locale, path.key, path.title)}</strong><small>{localizePathDescription(locale, path.key, path.description)}</small></div><span className={`status-tag ${path.availability === "preview" ? "preview" : path.availability === "controlled_pilot" ? "pilot" : "success"}`}>{path.availability === "preview" ? c.paths.preview : path.availability === "controlled_pilot" ? c.paths.pilot : c.paths.available}</span></article>)}</div></section>)}</div></details>
    </div>
  );
}
