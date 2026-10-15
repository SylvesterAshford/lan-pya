import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAppCopy } from "@/lib/i18n/app-copy";

const data = vi.hoisted(() => ({ getCommunity: vi.fn(), getPathHistory: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/lib/auth", () => ({ requireUser: async () => ({ id: "learner-1" }) }));
vi.mock("@/lib/data/app-data", () => ({
  getCommunity: data.getCommunity,
  getPathHistory: data.getPathHistory,
  getCommunitySettings: async () => ({ visible: true, blocked: false, telegram: "https://t.me/aye_learns", facebook: "", linkedin: "", note: "" }),
  getProfile: async () => ({ id: "learner-1", alias: "Thura", avatar: "traveller-f", dataOrigin: "live" }),
}));

import CommunityPage from "@/app/[locale]/app/community/page";

const c = getAppCopy("en").community;
const KEYS = ["orientation", "semantic-html", "responsive-css", "javascript", "git-collaboration", "async-web-apis", "typescript-tooling", "component-framework", "application-data", "frontend-quality", "modern-delivery", "hiring-capstone"];
const on = (n: number) => KEYS.map((_, index) => (index + 1 < n ? "complete" : index + 1 === n ? "active" : "upcoming"));
const row = (alias: string, stage: number, extra: Record<string, unknown> = {}) => ({
  handle: `h-${alias}`, alias, statuses: on(stage), verified: 0, completed: 0, points: 0, ...extra,
});

async function renderPage(search: Record<string, string> = {}, locale = "en") {
  render(await CommunityPage({ params: Promise.resolve({ locale }), searchParams: Promise.resolve(search) }));
}

beforeEach(() => {
  vi.clearAllMocks();
  data.getPathHistory.mockResolvedValue([{ state: "active", key: "frontend-developer", title: "Frontend Developer", lastActivatedAt: "", deactivatedAt: null, availability: "operational" }]);
});
afterEach(() => cleanup());

describe("Community page", () => {
  // Eng review D6: an outage is said as an outage.
  it("says the page did not load, never that nobody is here", async () => {
    data.getCommunity.mockResolvedValue({ ok: false });
    await renderPage();
    expect(screen.getByRole("alert")).toHaveTextContent(c.error.title);
    expect(screen.getByRole("link", { name: c.error.retry })).toHaveAttribute("href", "/en/app/community?track=frontend-developer");
    expect(screen.queryByText(c.empty.title)).not.toBeInTheDocument();
  });

  it("asks a learner with no path to pick one", async () => {
    data.getPathHistory.mockResolvedValue([]);
    await renderPage();
    expect(screen.getByText(c.noPathTitle)).toBeInTheDocument();
    expect(data.getCommunity).not.toHaveBeenCalled();
  });

  it("places the viewer in the card and others in sections by the roadmap's stage rule", async () => {
    data.getCommunity.mockResolvedValue({
      ok: true,
      data: {
        viewer: { visible: true, blocked: false, demo: false },
        keys: KEYS,
        rows: [
          { ...row("Thura", 4, { verified: 1 }), isMe: true, isSample: false, note: null, noteMy: null, telegram: null, facebook: null, linkedin: null, avatar: "traveller" },
          { ...row("Hnin Wai", 4, { verified: 2 }), isMe: false, isSample: false, note: null, noteMy: null, telegram: "https://t.me/hnin_wai", facebook: null, linkedin: null, avatar: "traveller" },
          { ...row("Su Myat", 5), isMe: false, isSample: false, note: null, noteMy: null, telegram: null, facebook: null, linkedin: null, avatar: "traveller" },
        ],
      },
    });
    await renderPage();
    expect(screen.getByText("Stage 4 · JavaScript programming")).toBeInTheDocument();
    expect(screen.getByText(`${c.sections.at} · 1`)).toBeInTheDocument();
    expect(screen.getByText(`${c.sections.ahead} · 1`)).toBeInTheDocument();
    // The leaderboard panel is in the page too, hidden; read the open tab.
    expect(within(screen.getByRole("tabpanel")).getByText("Stage 4 · 2 verified")).toBeInTheDocument();
    // On Your stage the viewer is in the card, not a row.
    expect(screen.queryByRole("button", { name: /^TH Thura/ })).not.toBeInTheDocument();
    expect(data.getCommunity).toHaveBeenCalledWith("frontend-developer");
  });

  it("writes Burmese numbers on a Burmese page", async () => {
    data.getCommunity.mockResolvedValue({
      ok: true,
      data: { viewer: { visible: true, blocked: false, demo: false }, keys: KEYS, rows: [
        { ...row("Thura", 4), isMe: true, isSample: false, note: null, noteMy: null, telegram: null, facebook: null, linkedin: null, avatar: "traveller" },
        { ...row("Hnin Wai", 4, { verified: 2 }), isMe: false, isSample: false, note: null, noteMy: null, telegram: null, facebook: null, linkedin: null, avatar: "traveller" },
      ] },
    });
    await renderPage({}, "my");
    expect(within(screen.getByRole("tabpanel")).getByText("အဆင့် ၄ · အတည်ပြုပြီး ၂")).toBeInTheDocument();
  });

  it("opens the leaderboard tab from the address", async () => {
    data.getCommunity.mockResolvedValue({ ok: true, data: { viewer: { visible: true, blocked: false, demo: false }, keys: KEYS, rows: [] } });
    await renderPage({ tab: "leaderboard", track: "content-creator" });
    expect(screen.getByRole("tab", { name: c.tabs.leaderboard })).toHaveAttribute("aria-selected", "true");
    expect(data.getCommunity).toHaveBeenCalledWith("content-creator");
  });
});

describe("Community game layer", () => {
  const person = (alias: string, stage: number, extra: Record<string, unknown> = {}) => ({
    ...row(alias, stage, extra), isMe: false, isSample: false, note: null, noteMy: null, telegram: null, facebook: null, linkedin: null, avatar: "traveller",
  });

  it("draws the trail with the viewer on their stage and who stands where", async () => {
    data.getCommunity.mockResolvedValue({
      ok: true,
      data: { viewer: { visible: true, blocked: false, demo: false }, keys: KEYS, rows: [
        { ...person("Thura", 4), isMe: true },
        person("Hnin Wai", 4),
        person("Su Myat", 5),
        person("Kaung Zaw", 5),
      ] },
    });
    await renderPage();
    const trail = screen.getByRole("img", { name: "3 other learners on Frontend Developer. You are at stage 4 of 12." });
    const stops = trail.querySelectorAll(".stage-trail-stops li");
    expect(stops).toHaveLength(12);
    expect(stops[3]).toHaveClass("here");
    expect(stops[2]).toHaveClass("done");
    expect(stops[3].textContent).toContain("1");
    expect(stops[4].textContent).toContain("2");
  });

  it("names the next target on the leaderboard", async () => {
    data.getCommunity.mockResolvedValue({
      ok: true,
      data: { viewer: { visible: true, blocked: false, demo: false }, keys: KEYS, rows: [
        { ...person("Thura", 4, { points: 200, verified: 2 }), isMe: true },
        person("Su Myat", 5, { points: 400, verified: 4 }),
        person("Hnin Wai", 4, { points: 300, verified: 3 }),
        person("Min Khant", 6, { points: 300, verified: 2 }),
      ] },
    });
    await renderPage({ tab: "leaderboard" });
    expect(screen.getByText("You're #4 · 100 points behind Min Khant. One verified mission is 100 points.")).toBeInTheDocument();
  });
});
