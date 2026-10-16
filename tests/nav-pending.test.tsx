import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const link = vi.hoisted(() => ({ pending: false }));

vi.mock("next/navigation", () => ({ usePathname: () => "/en/app/today" }));
vi.mock("next/link", () => ({ useLinkStatus: () => ({ pending: link.pending }) }));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));

import { AppShell } from "@/components/app/app-shell";
import { DEMO_PROFILE } from "@/lib/domain/demo-data";

afterEach(() => {
  cleanup();
  link.pending = false;
});

const shell = () => render(
  <AppShell profile={DEMO_PROFILE} roles={new Set()} locale="en"><div className="app-page">Old page</div></AppShell>,
);

describe("a sidebar tap waiting on the server", () => {
  // A route-level loading.tsx gave this feedback but delayed every full page
  // load by React's reveal batching, so the shell gives it instead.
  it("hides the old page behind the page outline and marks the workspace busy", () => {
    link.pending = true;
    const { container } = shell();
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("data-navigating");
    expect(main).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector(".page-loading")).not.toBeNull();
  });

  it("leaves the page alone when nothing is pending", () => {
    const { container } = shell();
    expect(screen.getByRole("main")).not.toHaveAttribute("data-navigating");
    expect(container.querySelector(".page-loading")).toBeNull();
    expect(screen.getByText("Old page")).toBeInTheDocument();
  });
});
