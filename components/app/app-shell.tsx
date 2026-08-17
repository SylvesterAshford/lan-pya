"use client";

import {
  BriefcaseBusiness,
  Home,
  Map,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Profile } from "@/lib/domain/types";

type NavItem = {
  href: string;
  en: string;
  my: string;
  icon: LucideIcon;
  matches: (pathname: string) => boolean;
};

const LEARNER_NAV: NavItem[] = [
  {
    href: "/app/today",
    en: "Home",
    my: "ပင်မ",
    icon: Home,
    matches: (pathname) => pathname.includes("/app/today"),
  },
  {
    href: "/app/paths",
    en: "Roadmaps",
    my: "လမ်းပြမြေပုံများ",
    icon: Map,
    matches: (pathname) => ["/app/paths", "/app/roadmap"].some((route) => pathname.includes(route)),
  },
  {
    href: "/app/missions",
    en: "Missions",
    my: "လုပ်ငန်းများ",
    icon: Sparkles,
    matches: (pathname) => ["/app/missions", "/app/build"].some((route) => pathname.includes(route)),
  },
  {
    href: "/app/opportunities",
    en: "Opportunities",
    my: "အခွင့်အလမ်းများ",
    icon: BriefcaseBusiness,
    matches: (pathname) => pathname.includes("/app/opportunities"),
  },
  {
    href: "/app/profile",
    en: "Me",
    my: "ကျွန်ုပ်",
    icon: UserRound,
    matches: (pathname) => ["/app/profile", "/app/proof", "/app/privacy"].some((route) => pathname.includes(route)),
  },
];

export function AppShell({ children, profile, roles, locale }: { children: React.ReactNode; profile: Profile; roles: Set<string>; locale: string }) {
  const pathname = usePathname();
  const labelFor = (item: NavItem) => locale === "my" ? item.my : item.en;
  const accountLabel = profile.dataOrigin === "seeded_demo"
    ? (locale === "my" ? "နမူနာအကောင့်" : "Demo account")
    : (locale === "my" ? "သင့်အကောင့်" : "Your account");
  const brandLabel = locale === "my" ? "လမ်းပြ" : "Lan Pya";
  const updateLabel = locale === "my" ? "သောကြာနေ့တိုင်း အပ်ဒိတ်" : "Updated every Friday";
  const staffNav = [
    ...(roles.has("reviewer") || roles.has("reviewer_lead")
      ? [{ href: "/app/review", label: locale === "my" ? "သုံးသပ်ရန်" : "Review", icon: SlidersHorizontal }]
      : []),
    ...(roles.has("admin")
      ? [{ href: "/app/admin", label: locale === "my" ? "စီမံခန့်ခွဲမှု" : "Admin", icon: ShieldCheck }]
      : []),
  ];

  const renderLearnerNav = (placement: "desktop" | "mobile") => LEARNER_NAV.map((item) => {
    const active = item.matches(pathname);
    const Icon = item.icon;
    const label = labelFor(item);
    return (
      <Link
        className={`app-nav-link ${placement}${active ? " active" : ""}`}
        href={item.href}
        aria-current={active ? "page" : undefined}
        key={`${placement}-${item.href}`}
      >
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  });

  return (
    <div className="app-frame">
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="app-brand" href="/app/today" aria-label={brandLabel}>
            <span className="brand-mark" aria-hidden="true" />
            <strong>{brandLabel}</strong>
          </Link>

          <nav className="app-primary-nav" aria-label={locale === "my" ? "အဓိက လမ်းညွှန်" : "Primary navigation"}>
            {renderLearnerNav("desktop")}
          </nav>

          <div className="app-header-tools">
            {staffNav.map(({ href, label, icon: Icon }) => {
              const active = pathname.includes(href);
              return <Link className={`staff-link${active ? " active" : ""}`} href={href} aria-current={active ? "page" : undefined} key={href}><Icon aria-hidden="true" /><span>{label}</span></Link>;
            })}
            <span className="update-chip">{updateLabel}</span>
            <Link className="app-avatar" href="/app/profile" aria-label={`${accountLabel}: ${profile.alias}`} title={`${accountLabel}: ${profile.alias}`}>
              {profile.alias.slice(0, 2).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <main className="app-workspace">{children}</main>

      <nav className="app-bottom-nav" aria-label={locale === "my" ? "အဓိက လမ်းညွှန်" : "Primary navigation"}>
        {renderLearnerNav("mobile")}
      </nav>
    </div>
  );
}
