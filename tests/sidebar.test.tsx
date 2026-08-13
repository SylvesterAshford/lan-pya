import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

let mobile = false;

beforeEach(() => {
  mobile = false;
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({
    matches: mobile,
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

function renderSidebar() {
  render(
    <SidebarProvider>
      <Sidebar aria-label="Primary navigation">Navigation<SidebarRail /></Sidebar>
      <SidebarTrigger />
    </SidebarProvider>,
  );
}

describe("Sidebar", () => {
  it("collapses from the desktop trigger and supports the Ctrl+B shortcut", () => {
    renderSidebar();

    const provider = document.querySelector(".sidebar-provider")!;
    expect(provider).toHaveAttribute("data-sidebar-state", "expanded");

    fireEvent.click(document.querySelector(".sidebar-trigger")!);
    expect(provider).toHaveAttribute("data-sidebar-state", "collapsed");

    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(provider).toHaveAttribute("data-sidebar-state", "expanded");
  });

  it("opens as a mobile drawer and closes from the scrim", () => {
    mobile = true;
    renderSidebar();

    const navigation = screen.getByRole("complementary", { hidden: true });
    expect(navigation).toHaveAttribute("aria-hidden", "true");
    expect(navigation).toHaveAttribute("inert");

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(navigation).not.toHaveAttribute("aria-hidden");
    expect(navigation).not.toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Close navigation" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(navigation).toHaveAttribute("aria-hidden", "true");
  });
});
