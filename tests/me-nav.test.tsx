import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MeNav } from "@/components/app/me-nav";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    <a href={href} {...props}>{children}</a>,
}));

afterEach(() => cleanup());

describe("MeNav", () => {
  it.each([
    ["en", "profile", "Profile", "/app/profile"],
    ["en", "portfolio", "Portfolio", "/app/proof"],
    ["en", "privacy", "Privacy", "/app/privacy"],
    ["my", "profile", "ပရိုဖိုင်", "/app/profile"],
    ["my", "portfolio", "လက်ရာမှတ်တမ်း", "/app/proof"],
    ["my", "privacy", "ကိုယ်ရေးလုံခြုံမှု", "/app/privacy"],
  ] as const)("marks the %s %s destination active", (locale, active, label, href) => {
    render(<MeNav locale={locale} active={active} />);
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
  });

  it("shows only the selected language", () => {
    render(<MeNav locale="my" active="profile" />);
    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "ကျွန်ုပ်၏ အကောင့်" })).toBeInTheDocument();
  });
});
