import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PricingView } from "@/components/pricing/pricing-view";
import { getAppCopy } from "@/lib/i18n/app-copy";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));

const labels = getAppCopy("en").pricing;
const base = { locale: "en", labels, signedIn: true, isDemo: false, waitlist: {}, initialTab: "personal" as const };

beforeEach(() => {
  window.history.replaceState(null, "", "/en/pricing");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: { joined: true, recorded: true } }), { status: 200 })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const card = (name: string) => screen.getByRole("heading", { name }).closest("article") as HTMLElement;

describe("PricingView", () => {
  it("shows the three personal plans with the honest notice", () => {
    render(<PricingView {...base} />);
    expect(screen.getByRole("heading", { level: 1, name: labels.titleSignedIn })).toBeInTheDocument();
    expect(screen.getByText(labels.notice)).toBeInTheDocument();
    for (const name of ["Free", "Pro Student", "Career+"]) expect(card(name)).toBeInTheDocument();
    expect(within(card("Free")).getByRole("button", { name: labels.currentPlan })).toBeDisabled();
  });

  it("tags every feature that does not exist yet", () => {
    render(<PricingView {...base} />);
    expect(within(card("Free")).getAllByText(labels.comingSoon)).toHaveLength(1);
    expect(within(card("Pro Student")).getAllByText(labels.comingSoon)).toHaveLength(7);
    expect(within(card("Career+")).getAllByText(labels.comingSoon)).toHaveLength(5);
  });

  it("switches the period, the price and the saving together", () => {
    render(<PricingView {...base} />);
    const pro = card("Pro Student");
    expect(within(pro).getByText("10,000 MMK")).toBeInTheDocument();
    fireEvent.click(within(pro).getByRole("radio", { name: /6 months/ }));
    expect(within(pro).getByText("55,000 MMK")).toBeInTheDocument();
    expect(within(pro).getByText("Save 8%")).toBeInTheDocument();
    expect(within(pro).getByText("9,167 MMK a month")).toBeInTheDocument();
  });

  it("joins the waitlist for the chosen period", async () => {
    render(<PricingView {...base} />);
    const careerPlus = card("Career+");
    fireEvent.click(within(careerPlus).getByRole("radio", { name: /3 months/ }));
    fireEvent.click(within(careerPlus).getByRole("button", { name: labels.join }));
    expect(await within(careerPlus).findByText("On the waitlist for 3 months")).toBeInTheDocument();
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/plans/waitlist");
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({ plan: "career_plus", billing: "three_months" });
  });

  it("remembers a learner already on the list and offers to change period", () => {
    render(<PricingView {...base} waitlist={{ pro: "monthly" }} />);
    const pro = card("Pro Student");
    expect(within(pro).getByText("On the waitlist for Monthly")).toBeInTheDocument();
    fireEvent.click(within(pro).getByRole("radio", { name: /6 months/ }));
    expect(within(pro).getByRole("button", { name: "Change to 6 months" })).toBeInTheDocument();
  });

  it("tells the demo that nothing was saved", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: { joined: true, recorded: false } }), { status: 200 })));
    render(<PricingView {...base} isDemo />);
    fireEvent.click(within(card("Pro Student")).getByRole("button", { name: labels.join }));
    expect(await screen.findByText(labels.demoJoined)).toBeInTheDocument();
  });

  it("shows a failure instead of pretending", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    render(<PricingView {...base} />);
    fireEvent.click(within(card("Pro Student")).getByRole("button", { name: labels.join }));
    expect(await screen.findByRole("alert")).toHaveTextContent(labels.failed);
  });

  it("sends signed-out visitors to sign in", () => {
    render(<PricingView {...base} signedIn={false} />);
    expect(screen.getByRole("heading", { level: 1, name: labels.titlePublic })).toBeInTheDocument();
    expect(within(card("Free")).getByRole("link", { name: labels.startFree })).toHaveAttribute("href", "/login");
    expect(within(card("Pro Student")).getByRole("link", { name: labels.signInToJoin })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: labels.backHome })).toHaveAttribute("href", "/");
  });

  it("switches to Business with the arrow keys and keeps the address in step", () => {
    render(<PricingView {...base} />);
    fireEvent.keyDown(screen.getByRole("tab", { name: labels.tabs.personal }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: labels.tabs.business })).toHaveAttribute("aria-selected", "true");
    expect(window.location.search).toBe("?tab=business");
    expect(screen.getByRole("heading", { name: labels.business.employerTitle })).toBeVisible();
    // Only the old price is struck through, not the words around it.
    const was = screen.getByText("900,000 MMK");
    expect(was.tagName).toBe("S");
    expect(was.parentElement).toHaveTextContent("instead of 900,000 MMK");
    expect(screen.getAllByText("Save 6%").length).toBeGreaterThan(0);
  });

  it("sends a partner inquiry from the Business tab", async () => {
    render(<PricingView {...base} initialTab="business" />);
    fireEvent.click(within(card(labels.business.universityTitle)).getByRole("button", { name: labels.business.contact }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: labels.inquiry.send }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent(labels.inquiry.invalid);
    expect(fetch).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText(labels.inquiry.organization), { target: { value: "Dagon University" } });
    fireEvent.change(within(dialog).getByLabelText(labels.inquiry.contactName), { target: { value: "U Aung" } });
    fireEvent.change(within(dialog).getByLabelText(labels.inquiry.contact), { target: { value: "+95 9 123 456" } });
    fireEvent.click(within(dialog).getByRole("button", { name: labels.inquiry.send }));
    expect(await within(dialog).findByText(labels.inquiry.sentTitle)).toBeInTheDocument();
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/partners/inquiry");
    expect(JSON.parse(String((init as RequestInit).body))).toMatchObject({ kind: "university", organization: "Dagon University", website: "" });
    fireEvent.click(within(dialog).getByRole("button", { name: labels.inquiry.done }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
