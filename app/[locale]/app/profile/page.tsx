import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { getProfile, getProofItems, getRoadmap, getTodayDashboard } from "@/lib/data/app-data";
import type { Milestone } from "@/lib/domain/types";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const [profile, proofs, roadmap, dashboard] = await Promise.all([
    getProfile(user.id),
    getProofItems(),
    getRoadmap() as Promise<Milestone[]>,
    getTodayDashboard(),
  ]);

  if (!profile) return null;

  const completed = roadmap.filter((item) => item.status === "complete").length;
  const initials = profile.alias.slice(0, 2).toUpperCase();
  const switchLocale = locale === "my" ? "en" : "my";

  return (
    <div className="app-page">
      <section className="page-heading"><span className="eyebrow">YOUR ACCOUNT</span><h1>Profile</h1><p>Your private account details, learning commitment, roadmap progress, and portfolio evidence in one place.</p></section>
      <div className="profile-layout">
        <section className="public-profile-card">
          <div className="profile-cover"><span>LAN PYA LEARNER</span><b>{profile.dataOrigin === "seeded_demo" ? "DEMO ACCOUNT" : "PRIVATE PROFILE"}</b></div>
          <div className="profile-identity"><span className="profile-avatar">{initials}</span><div><h2>{profile.alias}</h2><p>{profile.goal}</p></div><span className="status-pill neutral">{profile.onboardingComplete ? "Profile complete" : "Setup required"}</span></div>
          <div className="profile-stats"><div><strong>{completed}/{roadmap.length}</strong><span>Roadmap milestones</span></div><div><strong>{Number(dashboard?.verified_count ?? proofs.length)}</strong><span>Proof records</span></div><div><strong>{profile.weeklyHours}</strong><span>Weekly commitment</span></div></div>
          {proofs[0] ? <div className="profile-project"><div className="project-visual"><span>LATEST PROOF</span><div>✓</div></div><div><span className="eyebrow">PORTFOLIO EVIDENCE</span><h2>{proofs[0].title}</h2><p>{proofs[0].competencies.join(" · ")}</p><Link className="text-link" href="/app/proof">Open proof record →</Link></div></div> : null}
        </section>
        <aside className="panel profile-details">
          <span className="eyebrow">PRIVATE DETAILS</span>
          <dl><div><dt>Email</dt><dd>{user.email ?? "Not available"}</dd></div><div><dt>Language</dt><dd className="profile-language-row"><span>{locale === "my" ? "မြန်မာ" : "English"}</span><Link className="button outline compact" href="/app/profile" locale={switchLocale} aria-label={locale === "my" ? "Switch language to English" : "မြန်မာဘာသာသို့ ပြောင်းမည်"}>{locale === "my" ? "English" : "မြန်မာ"}</Link></dd></div><div><dt>Career goal</dt><dd>{profile.goal}</dd></div><div><dt>Account type</dt><dd>{profile.dataOrigin === "seeded_demo" ? "Shared demo account" : "Learner account"}</dd></div></dl>
          <div className="profile-actions"><Link className="button outline full" href="/app/privacy">Privacy settings</Link><form action="/auth/signout" method="post"><button className="button full" type="submit">Sign out</button></form></div>
        </aside>
      </div>
    </div>
  );
}
