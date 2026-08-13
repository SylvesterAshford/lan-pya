"use client";

import {
  BadgeCheck,
  BriefcaseBusiness,
  Hammer,
  Home,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Profile } from "@/lib/domain/types";
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
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  path: string;
  en: string;
  my: string;
  icon: LucideIcon;
};

const PRIMARY_NAV: NavItem[] = [
  { path: "today", en: "Home", my: "ပင်မ", icon: Home },
  { path: "paths", en: "Paths", my: "လမ်းကြောင်းများ", icon: Route },
  { path: "build", en: "Build", my: "တည်ဆောက်ရန်", icon: Hammer },
  { path: "opportunities", en: "Opportunities", my: "အခွင့်အလမ်းများ", icon: BriefcaseBusiness },
  { path: "proof", en: "Portfolio", my: "လက်ရာများ", icon: BadgeCheck },
];

export function AppShell({ children, profile, roles, locale }: { children: React.ReactNode; profile: Profile; roles: Set<string>; locale: string }) {
  return (
    <SidebarProvider>
      <AppShellContent profile={profile} roles={roles} locale={locale}>{children}</AppShellContent>
    </SidebarProvider>
  );
}

function AppShellContent({ children, profile, roles, locale }: { children: React.ReactNode; profile: Profile; roles: Set<string>; locale: string }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isActive = (path: string) => {
    if (path === "build" && pathname.includes("/app/missions/")) return true;
    return pathname.endsWith(`/app/${path}`) || pathname.includes(`/app/${path}/`);
  };
  const staffNav: NavItem[] = [
    ...(roles.has("reviewer") || roles.has("reviewer_lead")
      ? [{ path: "review", en: "Review", my: "သုံးသပ်ရန်", icon: SlidersHorizontal }]
      : []),
    ...(roles.has("admin") ? [{ path: "admin", en: "Admin", my: "စီမံခန့်ခွဲမှု", icon: ShieldCheck }] : []),
  ];
  const allNav = [...PRIMARY_NAV, ...staffNav];
  const currentNav = allNav.find((item) => isActive(item.path));
  const standaloneLabel = pathname.includes("/app/profile")
    ? (locale === "my" ? "ပရိုဖိုင်" : "Profile")
    : pathname.includes("/app/privacy")
      ? (locale === "my" ? "ကိုယ်ရေးလုံခြုံမှု" : "Privacy")
      : null;
  const pageLabel = standaloneLabel ?? (currentNav ? (locale === "my" ? currentNav.my : currentNav.en) : "Lan Pya");
  const accountLabel = profile.dataOrigin === "seeded_demo"
    ? (locale === "my" ? "နမူနာအကောင့်" : "Demo account")
    : (locale === "my" ? "သင့်အကောင့်" : "Your account");
  const closeMobile = () => setOpenMobile(false);

  const renderNav = (items: NavItem[]) => items.map((item) => {
    const active = isActive(item.path);
    const label = locale === "my" ? item.my : item.en;
    const Icon = item.icon;
    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton isActive={active}>
          <Link href={`/app/${item.path}`} onClick={closeMobile} aria-current={active ? "page" : undefined} title={label}>
            <Icon aria-hidden="true" />
            <span className="sidebar-menu-label">{label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  });

  return (
    <>
      <Sidebar aria-label="Primary navigation">
        <SidebarHeader>
          <Link className="sidebar-brand" href="/" onClick={closeMobile} title="Lan Pya — From Map to Proof">
            <span className="brand-mark" aria-hidden="true" />
            <span className="sidebar-brand-copy">
              <strong>Lan Pya</strong>
              <small>From Map to Proof</small>
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{locale === "my" ? "အလုပ်နေရာ" : "Workspace"}</SidebarGroupLabel>
            <SidebarMenu>{renderNav(PRIMARY_NAV)}</SidebarMenu>
          </SidebarGroup>
          {staffNav.length ? (
            <SidebarGroup>
              <SidebarGroupLabel>{locale === "my" ? "စီမံခန့်ခွဲရန်" : "Manage"}</SidebarGroupLabel>
              <SidebarMenu>{renderNav(staffNav)}</SidebarMenu>
            </SidebarGroup>
          ) : null}
        </SidebarContent>

        <SidebarFooter>
          <Link className="sidebar-account" href="/app/profile" onClick={closeMobile} title={`${accountLabel}: ${profile.alias}`}>
            <span className="sidebar-account-avatar">{profile.alias.slice(0, 2).toUpperCase()}</span>
            <span className="sidebar-account-copy">
              <strong>{profile.alias}</strong>
              <small><span className="live-dot" />{accountLabel}</small>
            </span>
          </Link>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isActive("profile")}>
                <Link href="/app/profile" onClick={closeMobile} title={locale === "my" ? "ပရိုဖိုင်" : "Profile"}>
                  <UserRound aria-hidden="true" />
                  <span className="sidebar-menu-label">{locale === "my" ? "ပရိုဖိုင်" : "Profile"}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isActive("privacy")}>
                <Link href="/app/privacy" onClick={closeMobile} title={locale === "my" ? "ကိုယ်ရေးလုံခြုံမှု" : "Privacy"}>
                  <ShieldCheck aria-hidden="true" />
                  <span className="sidebar-menu-label">{locale === "my" ? "ကိုယ်ရေးလုံခြုံမှု" : "Privacy"}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="app-topbar">
          <div className="app-topbar-left">
            <SidebarTrigger />
            <div className="app-topbar-context">
              <strong>{pageLabel}</strong>
              <span>{profile.goal}</span>
            </div>
          </div>
          <Link className="app-avatar" href="/app/profile" aria-label="Open profile">
            {profile.alias.slice(0, 2).toUpperCase()}
          </Link>
        </header>
        {children}
      </SidebarInset>
    </>
  );
}
