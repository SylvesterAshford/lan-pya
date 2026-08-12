import { Link } from "@/i18n/navigation";
import type { Profile } from "@/lib/domain/types";

const NAV = [
  ["today", "Today", "ဒီနေ့"], ["roadmap", "Roadmap", "လမ်းကြောင်း"],
  ["missions/responsive-profile-card", "Mission", "လက်တွေ့လုပ်ငန်း"], ["proof", "Proof", "သက်သေ"],
  ["opportunities", "Opportunities", "အခွင့်အလမ်း"],
  ["profile", "Profile", "ပရိုဖိုင်"],
] as const;

export function AppShell({ children, profile, roles, locale }: { children: React.ReactNode; profile: Profile; roles: Set<string>; locale: string }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand-lockup" href="/"><span className="brand-mark">လ</span><span><strong>Lan Pya</strong><small>From Map to Proof</small></span></Link>
        <nav className="side-nav" aria-label="Main navigation">
          {NAV.map(([path, label, my], index) => <Link key={path} href={`/app/${path}`}><span className="nav-number">0{index + 1}</span><span>{locale === "my" ? my : label}</span></Link>)}
          {roles.has("reviewer") || roles.has("reviewer_lead") ? <Link href="/app/review"><span className="nav-number">07</span><span>{locale === "my" ? "သုံးသပ်ရန်" : "Review"}</span></Link> : null}
          {roles.has("admin") ? <Link href="/app/admin"><span className="nav-number">08</span><span>{locale === "my" ? "စီမံခန့်ခွဲမှု" : "Admin"}</span></Link> : null}
        </nav>
        <div className="sidebar-foot"><div className="demo-note"><span className="live-dot" /> {profile.dataOrigin === "seeded_demo" ? (locale === "my" ? "နမူနာအကောင့်" : "Demo account") : (locale === "my" ? "သင့်အကောင့်" : "Your account")}<small>{profile.alias} · {profile.goal}</small></div><Link className="text-button" href="/app/privacy">{locale === "my" ? "ကိုယ်ရေးလုံခြုံမှု" : "Privacy"}</Link></div>
      </aside>
      <main className="app-main">
        <header className="topbar"><div><span className="eyebrow">FRONTEND DEVELOPER PATH</span><strong>{profile.alias} · {profile.weeklyHours}/week</strong></div><div className="topbar-actions"><Link className="avatar" href="/app/profile" aria-label="Open profile">{profile.alias.slice(0, 2).toUpperCase()}</Link></div></header>
        {children}
      </main>
    </div>
  );
}
