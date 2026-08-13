import { beforeEach, describe, expect, it, vi } from "vitest";

const supabase = vi.hoisted(() => ({
  auth: { getUser: vi.fn() },
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => supabase),
}));

import { POST as saveCareerCompass } from "@/app/api/career-compass/route";
import { POST as startMission } from "@/app/api/missions/start/route";
import { POST as switchPath } from "@/app/api/paths/switch/route";

const compassPayload = {
  alias: "Thiri",
  locale: "en",
  weeklyHours: "4–6 hours",
  interests: ["Technology"],
  preferredWork: "make",
  immediateGoal: "portfolio",
  deviceAccess: "laptop",
  connectivity: "reliable",
  priorExperience: ["HTML"],
};

function jsonRequest(body: unknown) {
  return new Request("http://lanpya.test/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "learner-1" } } });
  supabase.rpc.mockResolvedValue({ data: { ok: true }, error: null });
});

describe("personalization API routes", () => {
  it.each([
    ["career compass", saveCareerCompass, {}, "invalid-career-compass"],
    ["mission start", startMission, {}, "invalid-mission"],
    ["path switch", switchPath, {}, "invalid-path"],
  ])("rejects an invalid %s request before authentication", async (_name, handler, body, code) => {
    const response = await handler(jsonRequest(body));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ title: code, retryable: false });
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it.each([
    ["career compass", saveCareerCompass, compassPayload],
    ["mission start", startMission, { missionKey: "responsive-profile-card" }],
    ["path switch", switchPath, { trackKey: "content-creator" }],
  ])("requires authentication for %s", async (_name, handler, body) => {
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const response = await handler(jsonRequest(body));
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ title: "authentication-required" });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("saves a Career Compass draft without confirming a path", async () => {
    const response = await saveCareerCompass(jsonRequest(compassPayload));
    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith("save_career_compass", expect.objectContaining({
      p_confirm: false,
      p_selected_track_key: null,
      p_consent_version: null,
    }));
  });

  it("requires consent and an available selection before confirmation", async () => {
    const response = await saveCareerCompass(jsonRequest({ ...compassPayload, confirm: true }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ title: "path-confirmation-required" });
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it.each([
    [startMission, { missionKey: "responsive-profile-card" }, "start_mission_work", { p_mission_key: "responsive-profile-card" }],
    [switchPath, { trackKey: "content-creator" }, "switch_active_path", { p_track_key: "content-creator" }],
  ])("calls the canonical RPC and returns its data", async (handler, body, rpcName, rpcArgs) => {
    const response = await handler(jsonRequest(body));
    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith(rpcName, rpcArgs);
    expect(await response.json()).toMatchObject({ data: { ok: true } });
  });

  it("keeps the current path when the requested path is unavailable", async () => {
    supabase.rpc.mockResolvedValueOnce({ data: null, error: { message: "path is not available" } });
    const response = await switchPath(jsonRequest({ trackKey: "video-editor" }));
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ title: "path-unavailable", retryable: true });
  });
});
