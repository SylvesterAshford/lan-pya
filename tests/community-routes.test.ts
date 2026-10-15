import { beforeEach, describe, expect, it, vi } from "vitest";

const supabase = vi.hoisted(() => ({
  auth: { getUser: vi.fn() },
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => supabase),
}));

import { POST as saveSettings } from "@/app/api/profile/community/route";
import { POST as report } from "@/app/api/community/report/route";

const HANDLE = "5a000000-0000-0000-0000-000000000102";
const settings = { visible: true, telegram: "@aye_learns", facebook: "", linkedin: "", note: " Evenings " };

function jsonRequest(body: unknown) {
  return new Request("http://lanpya.test/api", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

beforeEach(() => {
  vi.clearAllMocks();
  supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "learner-1" } } });
  supabase.rpc.mockResolvedValue({ data: { visible: true }, error: null });
});

describe("POST /api/profile/community", () => {
  it("rejects a malformed body before authentication", async () => {
    const response = await saveSettings(jsonRequest({ visible: "yes" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ title: "invalid-community-settings" });
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("names the link that is wrong", async () => {
    const response = await saveSettings(jsonRequest({ ...settings, linkedin: "https://linkedin.com/company/acme" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ title: "invalid-community-links", detail: "Check the LinkedIn link." });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("refuses to list someone with no link", async () => {
    const response = await saveSettings(jsonRequest({ ...settings, telegram: "" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ title: "community-needs-link" });
  });

  it("requires a signed-in learner", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const response = await saveSettings(jsonRequest(settings));
    expect(response.status).toBe(401);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("normalises Telegram and trims the note before saving", async () => {
    const response = await saveSettings(jsonRequest(settings));
    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith("update_community_settings", {
      p_visible: true, p_telegram: "https://t.me/aye_learns", p_facebook: "", p_linkedin: "", p_note: "Evenings",
    });
  });

  it.each([
    [{ message: "demo account is read-only" }, 403, "demo-read-only"],
    [{ message: "community listing paused" }, 409, "community-paused"],
    [{ message: "violates check constraint", code: "23514" }, 400, "invalid-community-links"],
    [{ message: "connection reset" }, 400, "community-not-saved"],
  ])("turns the database's %o into %i %s", async (error, status, title) => {
    supabase.rpc.mockResolvedValueOnce({ data: null, error });
    const response = await saveSettings(jsonRequest(settings));
    expect(response.status).toBe(status);
    expect(await response.json()).toMatchObject({ title });
  });
});

describe("POST /api/community/report", () => {
  it("rejects an unknown reason or a non-uuid handle before authentication", async () => {
    for (const body of [{ handle: HANDLE, reason: "rude" }, { handle: "user-1", reason: "spam" }]) {
      const response = await report(jsonRequest(body));
      expect(response.status).toBe(400);
    }
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("requires a signed-in learner", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    expect((await report(jsonRequest({ handle: HANDLE, reason: "spam" }))).status).toBe(401);
  });

  it("reports by public handle", async () => {
    const response = await report(jsonRequest({ handle: HANDLE, reason: "harassment" }));
    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith("report_community_member", { p_handle: HANDLE, p_reason: "harassment" });
  });

  it.each([
    ["demo account is read-only", 403, "demo-read-only"],
    ["community report not allowed", 403, "community-report-not-allowed"],
    ["community member not found", 404, "community-member-not-found"],
    ["cannot report yourself", 400, "community-self-report"],
    ["deadlock detected", 400, "report-not-sent"],
  ])("turns %j into %i %s", async (message, status, title) => {
    supabase.rpc.mockResolvedValueOnce({ data: null, error: { message } });
    const response = await report(jsonRequest({ handle: HANDLE, reason: "spam" }));
    expect(response.status).toBe(status);
    expect(await response.json()).toMatchObject({ title });
  });
});
