import { ArrowRight, Globe2, Settings2, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MeNav } from "@/components/app/me-nav";
import { ProfileEditor } from "@/components/app/profile-editor";
import { ProfileHero } from "@/components/app/profile-hero";
import { resolveProgress } from "@/lib/domain/progress";
import { CAREER_PATH_CATALOG } from "@/lib/domain/career-recommendations";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getCareerPreferences, getPathHistory, getProfile, getProofItems, getRoadmap } from "@/lib/data/app-data";
import { formatAppDate, getAppCopy, localizeCareerTerm, localizePathDescription, localizePreference } from "@/lib/i18n/app-copy";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const c = getAppCopy(locale);
  const [profile, preferences, dashboard, history, proof] = await Promise.all([getProfile(user.id), getCareerPreferences(user.id), getActivePathDashboard(), getPathHistory(user.id), getProofItems()]);
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

  // Levels are path-scoped, so a learner with no active path has no level.
  const roadmap = dashboard.activePath ? await getRoadmap(dashboard.activePath.key) : [];
  const progress = dashboard.activePath
    ? resolveProgress(dashboard.xp, {
      completedMissions: dashboard.completedMilestones,
      verifiedCount: dashboard.verifiedCount,
      stagesTouched: roadmap.filter((stage) => stage.status === "complete").length,
    })
    : null;
  // "Since" comes from when this path was activated, which is the only start
  // date the product actually records.
  const activeEntry = history.find((path) => path.state === "active");
  const activeSince = activeEntry?.lastActivatedAt
    ? formatAppDate(locale, activeEntry.lastActivatedAt)
    : null;

  return <div className="app-page profile-page">
    <MeNav locale={locale} active="profile" pathCount={CAREER_PATH_CATALOG.length} />
    <section className="page-heading compact-heading"><h1>{c.profile.title}</h1><p>{c.profile.body}</p></section>
    <ProfileHero
      alias={profile.alias}
      headline={profile.headline}
      avatar={profile.avatar}
      editor={
        <ProfileEditor
          alias={profile.alias}
          headline={profile.headline}
          avatar={profile.avatar}
          labels={c.profile.editor}
        />
      }
      pathTitle={dashboard.activePath ? localizeCareerTerm(locale, dashboard.activePath.key, dashboard.activePath.title) : null}
      since={activeSince}
      progress={progress}
      missions={dashboard.completedMilestones}
      proofs={proof.filter((item) => item.state === "active").length}
      isDemo={profile.dataOrigin === "seeded_demo"}
      locale={locale}
      labels={{
        missions: c.profile.missionsStat,
        steps: c.profile.stepsStat,
        proofs: c.profile.proofsStat,
        since: c.profile.since,
        noPath: c.profile.noPath,
        demo: c.profile.demo,
        level: c.today.level,
      }}
    />
    {/* One hierarchy. The hero above carries the only headline on this page;
        everything below it is a labelled section, in one column, at one
        rhythm. Four eyebrow-plus-headline blocks all shouted at the same
        volume, and the layout changed shape twice on the way down. */}
    <div className="profile-sections">
      <section className="profile-section">
        <h2 className="profile-section-label">{c.profile.activePath}</h2>
        {/* Level, points and progress live in the hero tiles. Repeating them
            here was the same three numbers twice on one screen. */}
        <p className="profile-section-lead">
          {dashboard.activePath
            ? localizeCareerTerm(locale, dashboard.activePath.key, dashboard.activePath.title)
            : c.profile.noPath}
        </p>
        <p className="profile-section-body">
          {dashboard.activePath
            ? localizePathDescription(locale, dashboard.activePath.key, dashboard.activePath.description)
            : c.profile.noPathBody}
        </p>
        <Link className="text-link" href="/app/paths">
          {c.profile.changePath} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <section className="profile-section">
        <h2 className="profile-section-label">{c.profile.guides}</h2>
        {hasPreferences ? (
          <dl className="profile-facts">
            <div><dt>{c.profile.interests}</dt><dd>{preferences?.interests.length ? preferences.interests.map((item) => localizePreference(locale, item)).join(" · ") : c.profile.notSure}</dd></div>
            <div><dt>{c.profile.preferredWork}</dt><dd>{preferences?.preferredWork ? localizePreference(locale, preferences.preferredWork) : c.profile.notSure}</dd></div>
            <div><dt>{c.profile.nearGoal}</dt><dd>{preferences?.immediateGoal ? localizePreference(locale, preferences.immediateGoal) : c.profile.notSure}</dd></div>
            <div><dt>{c.profile.device}</dt><dd>{preferences?.deviceAccess ? localizePreference(locale, preferences.deviceAccess) : c.profile.notSure}</dd></div>
            <div><dt>{c.profile.weekly}</dt><dd>{profile.weeklyHours}</dd></div>
          </dl>
        ) : (
          // One line, not a card inside a card. An empty state does not earn
          // half the page width to say it is empty.
          <p className="profile-section-body">{c.profile.compassEmpty}</p>
        )}
        <Link className="text-link" href="/onboarding">
          <Settings2 size={16} aria-hidden="true" /> {hasPreferences ? c.profile.update : c.profile.compassEmptyAction}
        </Link>
      </section>

      {previousPaths.length || dashboard.pausedWork.length ? (
        <section className="profile-section">
          <h2 className="profile-section-label">{c.profile.previous}</h2>
          {previousPaths.length ? (
            <div className="previous-path-list">
              {previousPaths.map((path) => (
                <div key={path.key}>
                  <strong>{localizeCareerTerm(locale, path.key, path.title)}</strong>
                  <small>{c.profile.pausedPath} · {c.profile.lastActive} {path.lastActivatedAt ? formatAppDate(locale, path.lastActivatedAt) : c.profile.recently}</small>
                </div>
              ))}
            </div>
          ) : null}
          {dashboard.pausedWork.length ? (
            <div className="paused-work-list">
              {dashboard.pausedWork.map((work) => (
                <Link key={work.missionKey} href="/app/paths">
                  <span>
                    <strong>{localizeCareerTerm(locale, work.missionKey, work.missionTitle)}</strong>
                    <small>{localizeCareerTerm(locale, work.pathKey, work.pathTitle)}</small>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="profile-section">
        <h2 className="profile-section-label">{c.profile.account}</h2>
        {/* One row per setting: what it is and its value on the left, the
            control that changes it on the right. The old block put the
            heading, the values and the buttons on three different
            alignments. */}
        <div className="settings-list">
          <div className="settings-row">
            <span className="settings-row-main">
              <span className="settings-row-label">{c.profile.email}</span>
              <span className="settings-row-value">{user.email ?? c.profile.unavailable}</span>
            </span>
          </div>
          <div className="settings-row">
            <span className="settings-row-main">
              <span className="settings-row-label">{c.profile.language}</span>
              <span className="settings-row-value">{locale === "my" ? "မြန်မာ" : "English"}</span>
            </span>
            <Link
              className="button outline compact settings-row-control"
              href="/app/profile"
              locale={switchLocale}
              aria-label={locale === "my" ? c.profile.switchToEnglish : c.profile.switchToMyanmar}
            >
              <Globe2 size={15} aria-hidden="true" />{locale === "my" ? "English" : "မြန်မာ"}
            </Link>
          </div>
        </div>
        <div className="profile-actions">
          <Link className="button outline" href="/app/privacy">
            <ShieldCheck size={16} aria-hidden="true" />{c.profile.privacy}
          </Link>
          <form action="/auth/signout" method="post">
            <button className="button ghost" type="submit">{c.profile.signOut}</button>
          </form>
        </div>
      </section>
    </div>
  </div>;
}
