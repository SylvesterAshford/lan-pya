import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommunitySettings, type CommunitySettingsValue } from "@/components/app/community-settings";
import { getAppCopy } from "@/lib/i18n/app-copy";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const labels = getAppCopy("en").community.settings;
const empty: CommunitySettingsValue = { visible: false, blocked: false, telegram: "", facebook: "", linkedin: "", note: "" };

beforeEach(() => {
  refresh.mockReset();
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: {} }), { status: 200 })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CommunitySettings", () => {
  it("keeps the switch off until there is a valid link", () => {
    render(<CommunitySettings initial={empty} labels={labels} mode="profile" />);
    const toggle = screen.getByRole("switch", { name: labels.switchLabel });
    expect(toggle).toBeDisabled();
    expect(screen.getByText(labels.needsLink)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(labels.telegram), { target: { value: "@aye_learns" } });
    expect(toggle).toBeEnabled();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("turns the switch off when the last link is removed", () => {
    render(<CommunitySettings initial={{ ...empty, visible: true, telegram: "https://t.me/aye_learns" }} labels={labels} mode="profile" />);
    fireEvent.change(screen.getByLabelText(labels.telegram), { target: { value: "" } });
    expect(screen.getByRole("switch", { name: labels.switchLabel })).toHaveAttribute("aria-checked", "false");
  });

  it("names a wrong field without sending anything", async () => {
    render(<CommunitySettings initial={empty} labels={labels} mode="profile" />);
    fireEvent.change(screen.getByLabelText(labels.telegram), { target: { value: "https://t.me/+group" } });
    fireEvent.click(screen.getByRole("button", { name: labels.save }));
    expect(await screen.findByText(labels.telegramError)).toBeInTheDocument();
    expect(screen.getByLabelText(labels.telegram)).toHaveAttribute("aria-invalid", "true");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("keeps what was typed when saving fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    render(<CommunitySettings initial={empty} labels={labels} mode="profile" />);
    fireEvent.change(screen.getByLabelText(labels.telegram), { target: { value: "@aye_learns" } });
    fireEvent.click(screen.getByRole("button", { name: labels.save }));
    expect(await screen.findByRole("alert")).toHaveTextContent(labels.failed);
    expect(screen.getByLabelText(labels.telegram)).toHaveValue("@aye_learns");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("says a blocked listing is paused and locks the form", () => {
    render(<CommunitySettings initial={{ ...empty, blocked: true, telegram: "https://t.me/aye_learns" }} labels={labels} mode="profile" />);
    expect(screen.getByText(labels.paused)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: labels.switchLabel })).toBeDisabled();
    expect(screen.getByLabelText(labels.telegram)).toBeDisabled();
    expect(screen.getByRole("button", { name: labels.save })).toBeDisabled();
  });

  // DR9: the join sheet's one action lists the learner and saves.
  it("lists the learner from the join sheet and reports back", async () => {
    const onSaved = vi.fn();
    render(<CommunitySettings initial={empty} labels={labels} mode="join" onSaved={onSaved} onCancel={() => {}} />);
    fireEvent.change(screen.getByLabelText(labels.telegram), { target: { value: "t.me/aye_learns" } });
    fireEvent.click(screen.getByRole("button", { name: labels.joinSave }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/profile/community");
    expect(JSON.parse(String((init as RequestInit).body))).toMatchObject({ visible: true, telegram: "https://t.me/aye_learns" });
    expect(refresh).toHaveBeenCalled();
  });
});
