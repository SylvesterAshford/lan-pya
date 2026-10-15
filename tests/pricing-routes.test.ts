import { beforeEach, describe, expect, it, vi } from "vitest";

const supabase = vi.hoisted(() => ({ auth: { getUser: vi.fn() }, rpc: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => supabase) }));

import { POST as joinWaitlist } from "@/app/api/plans/waitlist/route";
import { POST as inquire } from "@/app/api/partners/inquiry/route";

function jsonRequest(body: unknown) {
  return new Request("http://lanpya.test/api", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}
const inquiry = { kind: "employer", organization: "Yangon Tech Co", contactName: "Daw Su", contact: "hr@yangontech.example", message: "Two interns", website: "" };

beforeEach(() => {
  vi.clearAllMocks();
  supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "learner-1" } } });
  supabase.rpc.mockResolvedValue({ data: { joined: true, recorded: true }, error: null });
});

describe("POST /api/plans/waitlist", () => {
  it.each([
    [{ plan: "pro", billing: "three_months" }],
    [{ plan: "career_plus", billing: "six_months" }],
    [{ plan: "enterprise", billing: "monthly" }],
  ])("refuses %o before authentication", async (body) => {
    const response = await joinWaitlist(jsonRequest(body));
    expect(response.status).toBe(400);
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("requires a signed-in learner", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    expect((await joinWaitlist(jsonRequest({ plan: "pro", billing: "monthly" }))).status).toBe(401);
  });

  it("records the plan and period", async () => {
    const response = await joinWaitlist(jsonRequest({ plan: "career_plus", billing: "three_months" }));
    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith("join_plan_waitlist", { p_plan: "career_plus", p_billing: "three_months" });
  });

  it("says when it could not save", async () => {
    supabase.rpc.mockResolvedValueOnce({ data: null, error: { message: "timeout" } });
    const response = await joinWaitlist(jsonRequest({ plan: "pro", billing: "monthly" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ title: "waitlist-not-saved", retryable: true });
  });
});

describe("POST /api/partners/inquiry", () => {
  it("works signed out, because partners have no account", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const response = await inquire(jsonRequest(inquiry));
    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith("submit_partner_inquiry", {
      p_kind: "employer", p_organization: "Yangon Tech Co", p_contact_name: "Daw Su", p_contact: "hr@yangontech.example", p_message: "Two interns",
    });
  });

  it("needs an organisation, a name and a way to reply", async () => {
    const response = await inquire(jsonRequest({ ...inquiry, contact: "hi" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ title: "invalid-inquiry" });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("tells a bot it succeeded without storing anything", async () => {
    const response = await inquire(jsonRequest({ ...inquiry, website: "http://spam.example" }));
    expect(response.status).toBe(200);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("says when it could not send", async () => {
    supabase.rpc.mockResolvedValueOnce({ data: null, error: { message: "check violation" } });
    const response = await inquire(jsonRequest(inquiry));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ title: "inquiry-not-sent" });
  });
});
