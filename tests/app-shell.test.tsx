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
    ["/en/app/profile", "Me"],
    ["/en/app/proof", "Me"],
    ["/en/app/privacy", "Me"],
  ])("maps %s to the %s destination", (route, label) => {
    pathname = route;
    render(<AppShell profile={DEMO_PROFILE} roles={new Set()} locale="en"><p>Page</p></AppShell>);

    const links = screen.getAllByRole("link", { name: label });
    expect(links).toHaveLength(2);
    expect(links.every((link) => link.getAttribute("aria-current") === "page")).toBe(true);
  });

  it("renders the five learner destinations", () => {
    pathname = "/en/app/today";
    render(<AppShell profile={DEMO_PROFILE} roles={new Set()} locale="en"><p>Page</p></AppShell>);

    // Five destinations, rendered twice each: desktop bar and mobile bottom bar.
    expect(screen.getAllByRole("link", { name: /Home|Roadmaps|Missions|Opportunities|Me/ })).toHaveLength(10);
    expect(screen.queryByRole("link", { name: "Build" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Portfolio" })).not.toBeInTheDocument();
  });

  it("renders only the selected language", () => {
    pathname = "/my/app/paths";
    render(<AppShell profile={{ ...DEMO_PROFILE, locale: "my" }} roles={new Set()} locale="my"><p>Page</p></AppShell>);

    expect(screen.getAllByRole("link", { name: "လမ်းပြမြေပုံများ" })).toHaveLength(2);
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
