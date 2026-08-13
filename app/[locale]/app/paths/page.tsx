import { Compass, FolderKanban, LockKeyhole, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PathSwitchButton } from "@/components/paths/path-switch-button";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getCareerPreferences } from "@/lib/data/app-data";
import { CAREER_PATH_CATALOG, getCareerRecommendations } from "@/lib/domain/career-recommendations";
import type { CareerPreferences } from "@/lib/domain/types";

const EMPTY_PREFERENCES: CareerPreferences = { interests: [], preferredWork: "not_sure", immediateGoal: "not_sure", deviceAccess: "not_sure", connectivity: "not_sure", priorExperience: [] };

export default async function PathsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const [dashboard, preferences] = await Promise.all([getActivePathDashboard(), getCareerPreferences(user.id)]);
  const recommendations = getCareerRecommendations(preferences ?? EMPTY_PREFERENCES);
  const alternatives = recommendations.filter((path) => path.availability !== "preview" && path.key !== dashboard.activePath?.key).slice(0, 2);
  const catalogByArena = CAREER_PATH_CATALOG.reduce<Record<string, typeof CAREER_PATH_CATALOG>>((groups, path) => {
    (groups[path.arena] ??= []).push(path);
    return groups;
  }, {});

  if (!dashboard.activePath) {
    return <div className="app-page paths-page"><section className="empty-path-state panel"><Compass size={24} aria-hidden="true" /><span className="eyebrow">YOUR DIRECTION</span><h1>Start with a few small choices.</h1><p>Career Compass suggests one path you can actually start, then keeps the full career catalog available when you are curious.</p><Link className="button primary" href="/onboarding">Find my path</Link></section></div>;
  }

  return (
    <div className="app-page paths-page">
      <section className="page-heading compact-heading"><span className="eyebrow">YOUR DIRECTION</span><h1>One active path. A clear next move.</h1><p>Explore without getting lost. Your active path shapes Build; every other career stays a considered alternative or a preview.</p></section>
      <section className="active-path-panel panel">
        <div className="active-path-icon"><Compass size={22} aria-hidden="true" /></div>
        <div className="active-path-copy"><span className="eyebrow">ACTIVE PATH</span><h2>{dashboard.activePath.title}</h2><p>{dashboard.activePath.description}</p><div className="path-inline-meta"><span>{dashboard.progressPercent}% complete</span><span>{dashboard.xp} XP on this path</span><span>{dashboard.activePath.availability === "controlled_pilot" ? "Controlled pilot" : "Ready to build"}</span></div></div>
        <Link className="button primary" href="/app/build">Continue Build</Link>
      </section>
      <section className="path-section alternatives-section">
        <div className="section-heading"><div><span className="eyebrow">ALTERNATIVES FOR YOU</span><h2>Only two options, with a reason.</h2></div><Link className="text-link" href="/app/profile">Edit my Career Compass →</Link></div>
        {alternatives.length ? <div className="alternative-list">{alternatives.map((path) => <article className="panel alternative-path" key={path.key}><div className="path-card-top"><span className="path-icon"><Sparkles size={20} aria-hidden="true" /></span><span className="status-tag pilot">{path.availability === "controlled_pilot" ? "Controlled pilot" : "Ready now"}</span></div><h3>{path.title}</h3><p>{path.reason}</p><small>First mission: {path.firstMission} · {path.timeToFirstProof}</small><PathSwitchButton trackKey={path.key}>Choose this path</PathSwitchButton></article>)}</div> : <article className="panel compact-empty"><p>Your current path is the only operational option right now. You can still explore upcoming careers below.</p></article>}
      </section>
      <details className="career-catalog panel"><summary><span><FolderKanban size={20} aria-hidden="true" /><strong>Explore all digital careers</strong><small>Browse by arena. Preview paths cannot become active until their first real mission opens.</small></span><span className="catalog-count">{CAREER_PATH_CATALOG.length} paths</span></summary><div className="catalog-groups">{Object.entries(catalogByArena).map(([arena, paths]) => <section key={arena} className="catalog-group"><h3>{arena}</h3><div>{paths.map((path) => <article key={path.key} className="catalog-row"><span className="catalog-row-icon">{path.availability === "preview" ? <LockKeyhole size={17} aria-hidden="true" /> : <Compass size={17} aria-hidden="true" />}</span><div><strong>{path.title}</strong><small>{path.description}</small></div><span className={`status-tag ${path.availability === "preview" ? "preview" : path.availability === "controlled_pilot" ? "pilot" : "success"}`}>{path.availability === "preview" ? "Preview" : path.availability === "controlled_pilot" ? "Pilot" : "Available"}</span></article>)}</div></section>)}</div></details>
    </div>
  );
}
