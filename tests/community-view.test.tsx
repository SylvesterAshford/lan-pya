import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommunityView, type CommunityPersonView } from "@/components/app/community-view";
import { getAppCopy } from "@/lib/i18n/app-copy";

const refresh = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
  useRouter: () => ({ push, refresh }),
}));

const labels = getAppCopy("en").community;

function view(alias: string, extra: Partial<CommunityPersonView> = {}): CommunityPersonView {
  return {
    handle: `5a000000-0000-4000-8000-00000000000${alias.length}`, alias, initials: alias.slice(0, 2).toUpperCase(),
    meta: "Stage 4 · 2 verified", eyebrow: "Frontend Developer · Stage 4", verifiedLabel: "2 verified missions",
    note: "Looking for someone to do the JavaScript mission with.", points: "300 points",
    links: [{ kind: "telegram", url: "https://t.me/hnin_wai" }], isMe: false, isSample: false, emblem: "build", ...extra,
  };
}

const hnin = view("Hnin Wai");
const base = {
  locale: "en",
  labels,
  trackKey: "frontend-developer",
  pathTitle: "Frontend Developer",
  paths: [{ key: "frontend-developer", title: "Frontend Developer" }, { key: "content-creator", title: "Content Creator" }],
  activePath: { key: "frontend-developer", title: "Frontend Developer" },
  isActivePath: true,
  viewer: { visible: true, blocked: false, demo: false },
  me: { title: "Stage 4 · JavaScript programming", verifiedLabel: "1 verified mission" },
  sections: [{ key: "at-3", title: labels.sections.at, count: "1", people: [hnin] }],
  board: { podium: null, rows: [{ person: hnin, rank: null }] },
  settings: { visible: true, blocked: false, telegram: "https://t.me/aye_learns", facebook: "", linkedin: "", note: "" },
  initialTab: "stage" as const,
};

beforeEach(() => {
  refresh.mockReset();
  push.mockReset();
  window.history.replaceState(null, "", "/en/app/community");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: { reported: true } }), { status: 200 })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function openCard(name = "Hnin Wai") {
  fireEvent.click(screen.getAllByRole("button", { name: new RegExp(name) })[0]);
  return screen.getByRole("dialog");
}

describe("CommunityView", () => {
  it("switches tabs with the arrow keys and keeps the address in step", () => {
    render(<CommunityView {...base} />);
    const stage = screen.getByRole("tab", { name: labels.tabs.stage });
    expect(stage).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(stage, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: labels.tabs.leaderboard })).toHaveAttribute("aria-selected", "true");
    expect(window.location.search).toBe("?tab=leaderboard");
    expect(screen.getByText(labels.fillsTitle)).toBeVisible();
  });

  // DR5: the viewer is in the card, never in the list.
  it("shows where you are and whether you can be seen", () => {
    render(<CommunityView {...base} />);
    expect(screen.getByText("Stage 4 · JavaScript programming")).toBeInTheDocument();
    expect(screen.getByText(labels.visible, { exact: false })).toBeInTheDocument();
  });

  it("opens a card with the person's links for a listed viewer", () => {
    render(<CommunityView {...base} />);
    const card = openCard();
    const telegram = within(card).getByRole("link", { name: /Message on Telegram/ });
    expect(telegram).toHaveAttribute("href", "https://t.me/hnin_wai");
    expect(telegram).toHaveAttribute("target", "_blank");
    expect(telegram).toHaveAttribute("rel", "noopener noreferrer");
  });

  // DR9: a hidden viewer joins from the card instead of leaving for Profile.
  it("lets a hidden viewer join from a locked card", () => {
    render(<CommunityView {...base} viewer={{ visible: false, blocked: false, demo: false }} settings={{ ...base.settings, visible: false }} />);
    const card = openCard();
    expect(within(card).queryByRole("link", { name: /Telegram/ })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: labels.card.report })).not.toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "Show me to see Hnin Wai's links" }));
    expect(within(card).getByLabelText(labels.settings.telegram)).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: labels.settings.joinSave })).toBeInTheDocument();
  });

  // DR8: a reason, then a confirmation, then the person leaves your list.
  it("reports in two steps and removes the person from your list", async () => {
    render(<CommunityView {...base} />);
    const card = openCard();
    fireEvent.click(within(card).getByRole("button", { name: labels.card.report }));
    fireEvent.click(within(card).getByLabelText(labels.report.reasons.harassment));
    fireEvent.click(within(card).getByRole("button", { name: labels.report.send }));
    expect(await within(card).findByText(labels.report.sentTitle)).toBeInTheDocument();
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({ handle: hnin.handle, reason: "harassment" });
    fireEvent.click(within(card).getByRole("button", { name: labels.report.done }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /Hnin Wai/ })).not.toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
  });

  // DR10: samples are labelled, cannot be reported, and their links go nowhere.
  it("labels sample learners and keeps their links inside Lan Pya", () => {
    const sample = view("Su Myat Noe", { isSample: true });
    render(<CommunityView {...base} viewer={{ visible: true, blocked: false, demo: true }} sections={[{ key: "at-3", title: labels.sections.at, count: "1", people: [sample] }]} />);
    expect(screen.getByText(labels.sampleNotice)).toBeInTheDocument();
    expect(screen.getAllByText(labels.sample).length).toBeGreaterThan(0);
    const card = openCard("Su Myat Noe");
    expect(within(card).queryByRole("link")).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: labels.card.report })).not.toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: /Message on Telegram/ }));
    expect(within(card).getByText(/This is a sample learner/)).toBeInTheDocument();
  });

  // DR7: the launch-day state gives a listed learner something to do.
  it("invites a classmate when nobody else is here", () => {
    render(<CommunityView {...base} sections={[]} />);
    expect(screen.getByText(labels.empty.title)).toBeInTheDocument();
    const invite = screen.getByRole("link", { name: labels.empty.invite });
    expect(invite.getAttribute("href")).toContain("https://t.me/share/url?url=");
    expect(screen.getByRole("button", { name: labels.empty.copy })).toBeInTheDocument();
  });

  it("asks a hidden learner to join before inviting anyone", () => {
    render(<CommunityView {...base} sections={[]} viewer={{ visible: false, blocked: false, demo: false }} />);
    expect(screen.queryByRole("link", { name: labels.empty.invite })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: labels.showMe }).length).toBeGreaterThan(0);
  });

  it("draws the podium in rank order for screen readers", () => {
    const podium = [view("Cy"), view("Bo"), view("Al")].map((person, index) => ({ ...person, handle: `${person.handle}${index}` }));
    render(<CommunityView {...base} initialTab="leaderboard" board={{ podium, rows: [] }} />);
    const list = screen.getByRole("list", { name: labels.podiumLabel });
    expect(within(list).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      expect.stringContaining("Rank 1, Cy"), expect.stringContaining("Rank 2, Bo"), expect.stringContaining("Rank 3, Al"),
    ]);
  });

  it("offers a way back when browsing another path", () => {
    render(<CommunityView {...base} trackKey="content-creator" pathTitle="Content Creator" isActivePath={false} me={null} />);
    expect(screen.getByText("You're looking at Content Creator")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Frontend Developer" })).toHaveAttribute("href", "/app/community?track=frontend-developer");
  });
});
