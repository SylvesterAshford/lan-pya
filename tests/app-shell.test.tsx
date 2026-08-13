import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/app/app-shell";
import { DEMO_PROFILE } from "@/lib/domain/demo-data";

let pathname = "/en/app/today";

vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    <a href={href} {...props} onClick={(event) => { event.preventDefault(); onClick?.(event); }}>{children}</a>,
}));

beforeEach(() => {
  pathname = "/en/app/today";
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({
    matches: false,
    media: "(max-width: 860px)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AppShell", () => {
  it.each([
    ["/en/app/today", "Home"],
    ["/en/app/paths", "Paths"],
    ["/en/app/build", "Build"],
    ["/en/app/opportunities", "Opportunities"],
    ["/en/app/proof", "Portfolio"],
  ])("marks %s as the active primary destination", (route, label) => {
    pathname = route;
    render(<AppShell profile={DEMO_PROFILE} roles={new Set()} locale="en"><p>Page</p></AppShell>);

    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText(label, { selector: ".app-topbar-context strong" })).toBeInTheDocument();
  });

  it("treats mission pages as part of Build", () => {
    pathname = "/en/app/missions/content-creator-awareness";
    render(<AppShell profile={DEMO_PROFILE} roles={new Set()} locale="en"><p>Mission</p></AppShell>);

    expect(screen.getByText("Build", { selector: ".app-topbar-context strong" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Build" })).toHaveAttribute("aria-current", "page");
  });

  it("renders one language at a time and exposes staff navigation by role", () => {
    pathname = "/my/app/review";
    render(<AppShell profile={{ ...DEMO_PROFILE, locale: "my" }} roles={new Set(["reviewer"])} locale="my"><p>Review</p></AppShell>);

    expect(screen.getByRole("link", { name: "သုံးသပ်ရန်" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Review" })).not.toBeInTheDocument();
    expect(screen.getByText("သုံးသပ်ရန်", { selector: ".app-topbar-context strong" })).toBeInTheDocument();
  });

  it.each([
    ["reviewer_lead", "/en/app/review", "Review"],
    ["admin", "/en/app/admin", "Admin"],
  ])("exposes the %s workspace when authorized", (role, route, label) => {
    pathname = route;
    render(<AppShell profile={DEMO_PROFILE} roles={new Set([role])} locale="en"><p>Staff</p></AppShell>);

    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
  });

  it.each([
    ["/en/app/profile", "Profile"],
    ["/en/app/privacy", "Privacy"],
  ])("uses a standalone label on %s", (route, label) => {
    pathname = route;
    render(<AppShell profile={{ ...DEMO_PROFILE, dataOrigin: "live" }} roles={new Set()} locale="en"><p>Settings</p></AppShell>);

    expect(screen.getByText(label, { selector: ".app-topbar-context strong" })).toBeInTheDocument();
    expect(screen.getByText("Your account")).toBeInTheDocument();
  });

  it("closes the mobile drawer after navigation", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({
      matches: true,
      media: "(max-width: 860px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    render(<AppShell profile={DEMO_PROFILE} roles={new Set()} locale="en"><p>Page</p></AppShell>);

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    fireEvent.click(screen.getByRole("link", { name: "Paths" }));

    expect(screen.getByRole("complementary", { hidden: true })).toHaveAttribute("aria-hidden", "true");
  });
});
