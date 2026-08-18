import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/app/app-shell";
import { DEMO_PROFILE } from "@/lib/domain/demo-data";

let pathname = "/en/app/today";

vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));

afterEach(() => cleanup());

describe("AppShell", () => {
  it.each([
    ["/en/app/today", "Home"],
    ["/en/app/paths", "Roadmaps"],
    ["/en/app/roadmap", "Roadmaps"],
    ["/en/app/build", "Missions"],
    ["/en/app/missions", "Missions"],
    ["/en/app/missions/responsive-profile-card", "Missions"],
    ["/en/app/opportunities", "Opportunities"],
    // Portfolio took this destination from "Me": the account row in the sidebar
    // footer already opens the profile, so the nav item was a second door to
    // the same room while the learner's evidence had none.
    ["/en/app/profile", "Portfolio"],
    ["/en/app/proof", "Portfolio"],
    ["/en/app/privacy", "Portfolio"],
  ])("maps %s to the %s destination", (route, label) => {
    pathname = route;
    render(<AppShell profile={DEMO_PROFILE} roles={new Set()} locale="en"><p>Page</p></AppShell>);

    // One link per destination, not two. The mobile bottom bar was replaced by
    // the navigation drawer, and the drawer reuses the same sidebar markup —
    // so a destination appearing twice would now mean it is in the tab order
    // twice and read out twice, which is the defect the swap removed.
    const links = screen.getAllByRole("link", { name: label });
    expect(links).toHaveLength(1);
    expect(links.every((link) => link.getAttribute("aria-current") === "page")).toBe(true);
  });

  it("renders the five learner destinations", () => {
    pathname = "/en/app/today";
    render(<AppShell profile={DEMO_PROFILE} roles={new Set()} locale="en"><p>Page</p></AppShell>);

    // Five destinations, once each. One navigation, one tab stop apiece.
    expect(screen.getAllByRole("link", { name: /Home|Roadmaps|Missions|Opportunities|Portfolio/ })).toHaveLength(5);
    // Build is reached from a mission, never from the nav. "Me" is gone: the
    // account row in the footer is the way to the profile now.
    expect(screen.queryByRole("link", { name: "Build" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Me" })).not.toBeInTheDocument();
  });

  it("renders only the selected language", () => {
    pathname = "/my/app/paths";
    render(<AppShell profile={{ ...DEMO_PROFILE, locale: "my" }} roles={new Set()} locale="my"><p>Page</p></AppShell>);

    expect(screen.getAllByRole("link", { name: "လမ်းပြမြေပုံများ" })).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "Roadmaps" })).not.toBeInTheDocument();
  });

  it.each([
    ["reviewer_lead", "/en/app/review", "Review"],
    ["admin", "/en/app/admin", "Admin"],
  ])("exposes the %s utility when authorized", (role, route, label) => {
    pathname = route;
    render(<AppShell profile={DEMO_PROFILE} roles={new Set([role])} locale="en"><p>Staff</p></AppShell>);

    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
  });

  it("labels demo and live accounts without adding another navigation item", () => {
    render(<AppShell profile={DEMO_PROFILE} roles={new Set()} locale="en"><p>Demo</p></AppShell>);
    expect(screen.getByRole("link", { name: /Demo account/ })).toBeInTheDocument();
    cleanup();
    render(<AppShell profile={{ ...DEMO_PROFILE, dataOrigin: "live" }} roles={new Set()} locale="en"><p>Live</p></AppShell>);
    expect(screen.getByRole("link", { name: /Your account/ })).toBeInTheDocument();
  });
});
