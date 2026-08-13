import { ArrowRight, Globe2, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getCareerPreferences, getPathHistory, getProfile } from "@/lib/data/app-data";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const [profile, preferences, dashboard, history] = await Promise.all([getProfile(user.id), getCareerPreferences(user.id), getActivePathDashboard(), getPathHistory(user.id)]);
  if (!profile) return null;
  const switchLocale = locale === "my" ? "en" : "my";
  const previousPaths = history.filter((path) => path.state === "previous");

  return <div className="app-page profile-page">
    <section className="page-heading compact-heading"><span className="eyebrow">CAREER PROFILE</span><h1>Your direction, on your terms.</h1><p>Career Compass controls your recommendations. Your proof stays in Portfolio, and your account settings stay compact.</p></section>
    <section className="career-identity panel"><span className="profile-avatar"><UserRound size={26} aria-hidden="true" /></span><div><h2>{profile.alias}</h2><p>{dashboard.activePath?.title ?? "Career Compass in progress"}</p><small>{profile.dataOrigin === "seeded_demo" ? "Demo account" : "Private learner profile"}</small></div><Link className="button outline" href="/onboarding">Edit Career Compass</Link></section>
    <div className="career-profile-grid">
      <section className="panel career-direction"><span className="eyebrow">ACTIVE PATH</span><h2>{dashboard.activePath?.title ?? "No path chosen"}</h2><p>{dashboard.activePath?.description ?? "Complete Career Compass to choose one available path."}</p><div className="path-inline-meta"><span>{dashboard.progressPercent}% progress</span><span>Level {dashboard.level}</span><span>{dashboard.xp} XP</span></div><Link className="text-link" href="/app/paths">Change path <ArrowRight size={16} aria-hidden="true" /></Link></section>
      <section className="panel career-preferences"><span className="eyebrow">WHAT GUIDES THIS</span><h2>Personalization</h2><dl><div><dt>Interests</dt><dd>{preferences?.interests.length ? preferences.interests.join(" · ") : "Not sure yet"}</dd></div><div><dt>Preferred work</dt><dd>{preferences?.preferredWork === "not_sure" || !preferences ? "Not sure yet" : preferences.preferredWork}</dd></div><div><dt>Near-term goal</dt><dd>{preferences?.immediateGoal?.replaceAll("_", " ") ?? "Not sure yet"}</dd></div><div><dt>Device</dt><dd>{preferences?.deviceAccess?.replaceAll("_", " ") ?? "Not sure yet"}</dd></div><div><dt>Weekly rhythm</dt><dd>{profile.weeklyHours}</dd></div></dl><Link className="text-link" href="/onboarding"><Settings2 size={16} aria-hidden="true" /> Update answers</Link></section>
    </div>
    {previousPaths.length || dashboard.pausedWork.length ? <section className="panel previous-paths"><span className="eyebrow">PREVIOUS PATHS & PAUSED WORK</span><h2>Nothing disappears when you change direction.</h2>{previousPaths.length ? <div className="previous-path-list">{previousPaths.map((path) => <div key={path.key}><strong>{path.title}</strong><small>Paused path · last active {path.lastActivatedAt ? new Date(path.lastActivatedAt).toLocaleDateString() : "recently"}</small></div>)}</div> : null}{dashboard.pausedWork.length ? <div className="paused-work-list">{dashboard.pausedWork.map((work) => <Link key={work.missionKey} href="/app/paths"><span><strong>{work.missionTitle}</strong><small>{work.pathTitle}</small></span><ArrowRight size={17} aria-hidden="true" /></Link>)}</div> : null}</section> : null}
    <section className="account-settings panel"><div><span className="eyebrow">ACCOUNT & LANGUAGE</span><h2>Private settings</h2></div><dl><div><dt>Email</dt><dd>{user.email ?? "Not available"}</dd></div><div><dt>Language</dt><dd className="profile-language-row"><span>{locale === "my" ? "မြန်မာ" : "English"}</span><Link className="button outline compact" href="/app/profile" locale={switchLocale} aria-label={locale === "my" ? "Switch language to English" : "မြန်မာဘာသာသို့ ပြောင်းမည်"}><Globe2 size={15} aria-hidden="true" />{locale === "my" ? "English" : "မြန်မာ"}</Link></dd></div></dl><div className="profile-actions"><Link className="button outline" href="/app/privacy"><ShieldCheck size={16} aria-hidden="true" />Privacy settings</Link><form action="/auth/signout" method="post"><button className="button ghost" type="submit">Sign out</button></form></div></section>
  </div>;
}
