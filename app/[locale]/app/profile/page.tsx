import { ArrowRight, Globe2, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MeNav } from "@/components/app/me-nav";
import { CAREER_PATH_CATALOG } from "@/lib/domain/career-recommendations";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getCareerPreferences, getPathHistory, getProfile } from "@/lib/data/app-data";
import { formatAppDate, getAppCopy, localizeCareerTerm, localizePathDescription, localizePreference } from "@/lib/i18n/app-copy";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const c = getAppCopy(locale);
  const [profile, preferences, dashboard, history] = await Promise.all([getProfile(user.id), getCareerPreferences(user.id), getActivePathDashboard(), getPathHistory(user.id)]);
  // Four rows of "Not sure yet" reads as broken rather than honest. If the
  // Compass has not actually been answered, say that once and offer to fix it.
  const hasPreferences = Boolean(
    preferences && (
      preferences.interests.length > 0 ||
      preferences.preferredWork !== "not_sure" ||
      preferences.immediateGoal !== "not_sure" ||
      preferences.deviceAccess !== "not_sure"
    ),
  );
  if (!profile) return null;
  const switchLocale = locale === "my" ? "en" : "my";
  const previousPaths = history.filter((path) => path.state === "previous");

  return <div className="app-page profile-page">
    <MeNav locale={locale} active="profile" pathCount={CAREER_PATH_CATALOG.length} />
    <section className="page-heading compact-heading"><h1>{c.profile.title}</h1><p>{c.profile.body}</p></section>
    <section className="career-identity panel"><span className="profile-avatar"><UserRound size={26} aria-hidden="true" /></span><div><h2>{profile.alias}</h2><p>{dashboard.activePath ? localizeCareerTerm(locale, dashboard.activePath.key, dashboard.activePath.title) : c.profile.compassProgress}</p><small>{profile.dataOrigin === "seeded_demo" ? c.profile.demo : c.profile.privateProfile}</small></div><Link className="button outline" href="/onboarding">{c.profile.editCompass}</Link></section>
    <div className="career-profile-grid">
      <section className="panel career-direction"><span className="eyebrow">{c.profile.activePath}</span><h2>{dashboard.activePath ? localizeCareerTerm(locale, dashboard.activePath.key, dashboard.activePath.title) : c.profile.noPath}</h2><p>{dashboard.activePath ? localizePathDescription(locale, dashboard.activePath.key, dashboard.activePath.description) : c.profile.noPathBody}</p><div className="path-inline-meta"><span>{dashboard.progressPercent}% {c.profile.progress}</span><span>{c.today.level} {dashboard.level}</span><span>{dashboard.xp} XP</span></div><Link className="text-link" href="/app/paths">{c.profile.changePath} <ArrowRight size={16} aria-hidden="true" /></Link></section>
      <section className="panel career-preferences"><span className="eyebrow">{c.profile.guides}</span><h2>{c.profile.personalization}</h2>{hasPreferences ? <dl><div><dt>{c.profile.interests}</dt><dd>{preferences?.interests.length ? preferences.interests.map((item) => localizePreference(locale, item)).join(" · ") : c.profile.notSure}</dd></div><div><dt>{c.profile.preferredWork}</dt><dd>{preferences?.preferredWork ? localizePreference(locale, preferences.preferredWork) : c.profile.notSure}</dd></div><div><dt>{c.profile.nearGoal}</dt><dd>{preferences?.immediateGoal ? localizePreference(locale, preferences.immediateGoal) : c.profile.notSure}</dd></div><div><dt>{c.profile.device}</dt><dd>{preferences?.deviceAccess ? localizePreference(locale, preferences.deviceAccess) : c.profile.notSure}</dd></div><div><dt>{c.profile.weekly}</dt><dd>{profile.weeklyHours}</dd></div></dl> : <div className="compass-empty"><p>{c.profile.compassEmpty}</p><small>{c.profile.compassEmptyBody}</small></div>}<Link className="text-link" href="/onboarding"><Settings2 size={16} aria-hidden="true" /> {hasPreferences ? c.profile.update : c.profile.compassEmptyAction}</Link></section>
    </div>
    {previousPaths.length || dashboard.pausedWork.length ? <section className="panel previous-paths"><span className="eyebrow">{c.profile.previous}</span><h2>{c.profile.previousTitle}</h2>{previousPaths.length ? <div className="previous-path-list">{previousPaths.map((path) => <div key={path.key}><strong>{localizeCareerTerm(locale, path.key, path.title)}</strong><small>{c.profile.pausedPath} · {c.profile.lastActive} {path.lastActivatedAt ? formatAppDate(locale, path.lastActivatedAt) : c.profile.recently}</small></div>)}</div> : null}{dashboard.pausedWork.length ? <div className="paused-work-list">{dashboard.pausedWork.map((work) => <Link key={work.missionKey} href="/app/paths"><span><strong>{localizeCareerTerm(locale, work.missionKey, work.missionTitle)}</strong><small>{localizeCareerTerm(locale, work.pathKey, work.pathTitle)}</small></span><ArrowRight size={17} aria-hidden="true" /></Link>)}</div> : null}</section> : null}
    <section className="account-settings panel"><div><span className="eyebrow">{c.profile.account}</span><h2>{c.profile.settings}</h2></div><dl><div><dt>{c.profile.email}</dt><dd>{user.email ?? c.profile.unavailable}</dd></div><div><dt>{c.profile.language}</dt><dd className="profile-language-row"><span>{locale === "my" ? "မြန်မာ" : "English"}</span><Link className="button outline compact" href="/app/profile" locale={switchLocale} aria-label={locale === "my" ? c.profile.switchToEnglish : c.profile.switchToMyanmar}><Globe2 size={15} aria-hidden="true" />{locale === "my" ? "English" : "မြန်မာ"}</Link></dd></div></dl><div className="profile-actions"><Link className="button outline" href="/app/privacy"><ShieldCheck size={16} aria-hidden="true" />{c.profile.privacy}</Link><form action="/auth/signout" method="post"><button className="button ghost" type="submit">{c.profile.signOut}</button></form></div></section>
  </div>;
}
