"use client";

import {
  BadgeCheck,
  BriefcaseBusiness,
  CircleArrowUp,
  Home,
  Map,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Profile } from "@/lib/domain/types";
import { MobileNavTrigger } from "@/components/app/mobile-nav-trigger";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

/**
 * Learner shell — sidebar on desktop, the same sidebar as a drawer on phones.
 *
 * Returns to the sidebar layout used before 2026-08-13, when it was replaced
 * by a 60px top navigation. The information architecture does NOT revert with
 * it: the old sidebar listed six destinations including a `build` route and a
 * separate `paths` catalog, both of which have since moved for reasons the
 * founder asked for. Missions is its own destination and the catalog lives
 * under Me. Restoring the chrome should not undo those decisions.
 *
 * Below 860px the sidebar opens as a drawer from the top bar's menu button
 * (MobileNavTrigger). There is no separate bottom bar: two navigations would
 * put every destination in the tab order twice and read each one twice to a
 * screen reader.
 */

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
    href: "/app/roadmap",
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

  // Portfolio earned the destination that "Me" had. The account row at the
  // foot of the sidebar already opens the profile, so a nav item pointing at
  // the same place was a second door to one room; the evidence a learner has
  // built had none.
  //
  // It claims only its own route. Inheriting the account pages lit a Portfolio
  // tab over the profile, which read as though the profile lived inside the
  // portfolio. Those pages are reached from the account row at the foot of the
  // sidebar, so they leave the primary nav unhighlighted — which is honest.
  {
    href: "/app/proof",
    en: "Portfolio",
    my: "လက်ရာမှတ်တမ်း",
    icon: BadgeCheck,
    matches: (pathname) => pathname.includes("/app/proof"),
  },
];

/**
 * Community and Opportunities sit apart, under "Connect".
 *
 * The four above are the loop inside Lan Pya: learn, build, prove, keep. These
 * two point out of the app: Community at other learners, reached on Telegram,
 * Facebook or LinkedIn, and Opportunities at real openings somebody else owns.
 * Grouping them with the loop implied they were more places to practise. The
 * heading read "Apply" until Community joined it (design review DR6, 2026-10-15),
 * when "Apply › Community" read as something to apply for.
 */
const CONNECT_NAV: NavItem[] = [
  {
    href: "/app/community",
    en: "Community",
    my: "အသိုင်းအဝိုင်း",
    icon: Users,
    matches: (pathname) => pathname.includes("/app/community"),
  },
  {
    href: "/app/opportunities",
    en: "Opportunities",
    my: "အခွင့်အလမ်းများ",
    icon: BriefcaseBusiness,
    matches: (pathname) => pathname.includes("/app/opportunities"),
  },
];

export function AppShell({ children, profile, roles, locale, reviewCount = 0 }: { children: React.ReactNode; profile: Profile; roles: Set<string>; locale: string; reviewCount?: number }) {
  return (
    <SidebarProvider>
      <AppShellContent profile={profile} roles={roles} locale={locale} reviewCount={reviewCount}>{children}</AppShellContent>
    </SidebarProvider>
  );
}

function AppShellContent({ children, profile, roles, locale, reviewCount }: { children: React.ReactNode; profile: Profile; roles: Set<string>; locale: string; reviewCount: number }) {
  const pathname = usePathname();
  const my = locale === "my";
  const labelFor = (item: NavItem) => (my ? item.my : item.en);
  const accountLabel = profile.dataOrigin === "seeded_demo"
    ? (my ? "နမူနာအကောင့်" : "Demo account")
    : (my ? "သင့်အကောင့်" : "Your account");
  const brandLabel = my ? "လမ်းပြ" : "Lan Pya";
  const navLabel = my ? "အဓိက လမ်းညွှန်" : "Primary navigation";

  const staffNav = [
    ...(roles.has("reviewer") || roles.has("reviewer_lead")
      ? [{ href: "/app/review", label: my ? "သုံးသပ်ရန်" : "Review", icon: SlidersHorizontal, count: reviewCount }]
      : []),
    ...(roles.has("admin")
      ? [{ href: "/app/admin", label: my ? "စီမံခန့်ခွဲမှု" : "Admin", icon: ShieldCheck, count: 0 }]
      : []),
  ];

  return (
    <div className="app-frame">
      <Sidebar>
        <SidebarHeader>
          <Link className="app-brand" href="/app/today" aria-label={brandLabel}>
            <span className="brand-mark" aria-hidden="true" />
            <strong>{brandLabel}</strong>
          </Link>
          <SidebarTrigger />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu aria-label={navLabel}>
              {LEARNER_NAV.map((item) => {
                const active = item.matches(pathname);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={active}>
                      <Link href={item.href} aria-current={active ? "page" : undefined}>
                        <Icon aria-hidden="true" />
                        <span>{labelFor(item)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>{my ? "ချိတ်ဆက်ရန်" : "Connect"}</SidebarGroupLabel>
            <SidebarMenu>
              {CONNECT_NAV.map((item) => {
                const active = item.matches(pathname);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={active}>
                      <Link href={item.href} aria-current={active ? "page" : undefined}>
                        <Icon aria-hidden="true" />
                        <span>{labelFor(item)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {staffNav.length ? (
            <SidebarGroup>
              <SidebarGroupLabel>{my ? "အဖွဲ့" : "Staff"}</SidebarGroupLabel>
              <SidebarMenu>
                {staffNav.map(({ href, label, icon: Icon, count }) => {
                  const active = pathname.includes(href);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton isActive={active}>
                        <Link href={href} aria-current={active ? "page" : undefined}>
                          <Icon aria-hidden="true" />
                          <span>{label}</span>
                          {count ? <><span className="sidebar-count" aria-hidden="true">{count}</span><span className="sr-only">{my ? `, ${count} စောင့်နေသည်` : `, ${count} waiting`}</span></> : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ) : null}
        </SidebarContent>

        <SidebarFooter>
          {/* Plans live on their own full page, the way subscription apps put
              "Upgrade" just above the account. Paid plans are a waitlist. */}
          <Link className="sidebar-upgrade" href="/pricing">
            <CircleArrowUp aria-hidden="true" />
            <span>{my ? "မြှင့်တင်မည်" : "Upgrade"}</span>
          </Link>
          <Link className="sidebar-account" href="/app/profile" title={`${accountLabel}: ${profile.alias}`}>
            <span className="app-avatar" aria-hidden="true">{profile.alias.slice(0, 2).toUpperCase()}</span>
            <span className="sidebar-account-copy">
              <strong>{profile.alias}</strong>
              <small>{accountLabel}</small>
            </span>
          </Link>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="app-workspace">
        {/* The slim bar carries the brand and the trigger that opens the
            drawer, which is now the only navigation on a phone. */}
        <div className="app-mobile-bar">
          <MobileNavTrigger label={navLabel} />
          <Link className="app-brand" href="/app/today" aria-label={brandLabel}>
            <span className="brand-mark" aria-hidden="true" />
            <strong>{brandLabel}</strong>
          </Link>
        </div>
        {children}
      </SidebarInset>

    </div>
  );
}
