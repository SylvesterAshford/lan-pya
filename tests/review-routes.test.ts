import { beforeEach, describe, expect, it, vi } from "vitest";

const supabase = vi.hoisted(() => ({ auth: { getUser: vi.fn() }, rpc: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => supabase) }));

import { POST as claim } from "@/app/api/review/[submissionId]/claim/route";
import { POST as decide } from "@/app/api/review/[submissionId]/route";

const params = { params: Promise.resolve({ submissionId: "s1" }) };
const post = (body?: unknown) => new Request("http://lanpya.test/api", { method: "POST", headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
const notes = "Semantic markup throughout; focus styles are visible.";

beforeEach(() => {
  vi.clearAllMocks();
  supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "reviewer-1" } } });
});

describe("POST /api/review/[id]/claim", () => {
  it("claims through the RPC", async () => {
    supabase.rpc.mockResolvedValue({ data: true, error: null });
    const response = await claim(post(), params);
    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith("claim_submission", { p_submission_id: "s1" });
  });

  it("says when someone else already has it", async () => {
    supabase.rpc.mockResolvedValue({ data: false, error: null });
    expect((await claim(post(), params)).status).toBe(409);
  });

  it("refuses a learner", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });
    expect((await claim(post(), params)).status).toBe(403);
  });
});

describe("POST /api/review/[id]", () => {
  beforeEach(() => {
    supabase.rpc.mockImplementation(async (name: string) =>
      name === "get_review_submission" ? { data: { mission_key: "responsive-profile-card" }, error: null } : { data: "review-1", error: null });
  });

  it("records a decision scored on the brief's own criteria", async () => {
    const scores = { semantic: 4, responsive: 3, accessible: 3, explanation: 2 };
    const response = await decide(post({ action: "verify", notes, rubricScores: scores }), params);
    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith("record_review_decision", expect.objectContaining({ p_rubric_scores: scores }));
  });

  // The old review page sent "accessibility"; the brief says "accessible".
  it("rejects scores for criteria that are not on this mission's brief", async () => {
    const response = await decide(post({ action: "verify", notes, rubricScores: { semantic: 4, responsive: 3, accessibility: 3, explanation: 2 } }), params);
    expect(response.status).toBe(400);
    expect(supabase.rpc).not.toHaveBeenCalledWith("record_review_decision", expect.anything());
  });

  it("rejects a decision with a criterion missing", async () => {
    const response = await decide(post({ action: "reject", notes, rubricScores: { semantic: 0, responsive: 0, accessible: 0 } }), params);
    expect(response.status).toBe(400);
  });
});
