"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/domain/types";

const NAV = [
  ["today", "Home", "ပင်မ"], ["paths", "Paths", "လမ်းကြောင်းများ"],
  ["build", "Build", "တည်ဆောက်ရန်"], ["opportunities", "Opportunities", "အခွင့်အလမ်း"],
  ["proof", "Portfolio", "လက်ရာများ"],
] as const;

const MOBILE_NAV = [
  { path: "today", en: "Home", my: "ပင်မ", icon: "⌂" },
  { path: "paths", en: "Paths", my: "လမ်း", icon: "↗" },
  { path: "build", en: "Build", my: "တည်", icon: "+" },
  { path: "opportunities", en: "Jobs", my: "အလုပ်", icon: "▦" },
  { path: "proof", en: "Portfolio", my: "လက်ရာ", icon: "◈" },
] as const;

export function AppShell({ children, profile, roles, locale }: { children: React.ReactNode; profile: Profile; roles: Set<string>; locale: string }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname.endsWith(`/app/${path}`) || pathname.includes(`/app/${path}/`);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand-lockup" href="/"><span className="brand-mark">လ</span><span><strong>Lan Pya</strong><small>From Map to Proof</small></span></Link>
        <nav className="side-nav" aria-label="Main navigation">
          {NAV.map(([path, label, my], index) => <Link className={isActive(path) ? "active" : undefined} aria-current={isActive(path) ? "page" : undefined} key={path} href={`/app/${path}`}><span className="nav-number">0{index + 1}</span><span>{locale === "my" ? my : label}</span></Link>)}
          {roles.has("reviewer") || roles.has("reviewer_lead") ? <Link className={isActive("review") ? "active" : undefined} href="/app/review"><span className="nav-number">06</span><span>{locale === "my" ? "သုံးသပ်ရန်" : "Review"}</span></Link> : null}
          {roles.has("admin") ? <Link className={isActive("admin") ? "active" : undefined} href="/app/admin"><span className="nav-number">07</span><span>{locale === "my" ? "စီမံခန့်ခွဲမှု" : "Admin"}</span></Link> : null}
        </nav>
        <div className="sidebar-foot"><div className="demo-note"><span className="live-dot" /> {profile.dataOrigin === "seeded_demo" ? (locale === "my" ? "နမူနာအကောင့်" : "Demo account") : (locale === "my" ? "သင့်အကောင့်" : "Your account")}<small>{profile.alias} · {profile.goal}</small></div><div className="sidebar-foot-links"><Link className="text-button" href="/app/profile">{locale === "my" ? "ပရိုဖိုင်" : "Profile"}</Link><Link className="text-button" href="/app/privacy">{locale === "my" ? "ကိုယ်ရေးလုံခြုံမှု" : "Privacy"}</Link></div></div>
      </aside>
      <main className="app-main">
        <header className="topbar"><div><span className="eyebrow">{profile.goal.toUpperCase()} PATH</span><strong>{profile.alias} · {profile.weeklyHours}/week</strong></div><div className="topbar-actions"><Link className="avatar" href="/app/profile" aria-label="Open profile">{profile.alias.slice(0, 2).toUpperCase()}</Link></div></header>
        {children}
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {MOBILE_NAV.map((item) => (
          <Link key={item.path} href={`/app/${item.path}`} className={`mobile-nav-link${isActive(item.path) ? " active" : ""}`} aria-current={isActive(item.path) ? "page" : undefined}>
            <span className="mobile-nav-icon">{item.icon}</span>
            <span>{locale === "my" ? item.my : item.en}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
