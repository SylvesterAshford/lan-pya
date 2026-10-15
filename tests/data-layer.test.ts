import { beforeEach, describe, expect, it, vi } from "vitest";

const supabase = vi.hoisted(() => ({ getClaims: vi.fn(), calls: [] as Array<[string, ...unknown[]]> }));

vi.mock("next/navigation", () => ({ redirect: (to: string) => { throw new Error(`redirect ${to}`); } }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => {
    // A query builder that records every filter it is given and resolves empty.
    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "in", "limit"]) {
      builder[method] = (...args: unknown[]) => { supabase.calls.push([method, ...args]); return builder; };
    }
    builder.then = (resolve: (value: unknown) => void) => resolve({ data: [], error: null });
    return {
      auth: { getClaims: supabase.getClaims },
      from: (table: string) => { supabase.calls.push(["from", table]); return builder; },
    };
  },
}));

import { getUser, requireUser } from "@/lib/auth";
import { getProofItems } from "@/lib/data/app-data";

beforeEach(() => {
  supabase.calls.length = 0;
  supabase.getClaims.mockReset();
});

describe("who is signed in", () => {
  it("reads the account from the verified token, with no call to Supabase Auth", async () => {
    supabase.getClaims.mockResolvedValue({
      data: { claims: { sub: "learner-1", email: "thura@example.com", user_metadata: { full_name: "Thura" } } }, error: null,
    });
    await expect(getUser()).resolves.toEqual({ id: "learner-1", email: "thura@example.com", user_metadata: { full_name: "Thura" } });
  });

  it("treats a missing or unverifiable token as signed out", async () => {
    supabase.getClaims.mockResolvedValue({ data: null, error: null });
    await expect(getUser()).resolves.toBeNull();
    supabase.getClaims.mockResolvedValue({ data: null, error: new Error("invalid JWT") });
    await expect(requireUser("my")).rejects.toThrow("redirect /my/login");
  });

  it("gives a phone-only account no email rather than an empty one", async () => {
    supabase.getClaims.mockResolvedValue({ data: { claims: { sub: "learner-2", email: "" } }, error: null });
    await expect(getUser()).resolves.toMatchObject({ id: "learner-2", email: null, user_metadata: {} });
  });
});

describe("Portfolio proof", () => {
  // RLS lets reviewers and admins read every learner's proof, so the query
  // itself must name whose proof it wants.
  it("asks only for the learner's own proof", async () => {
    await getProofItems("learner-1");
    expect(supabase.calls).toContainEqual(["from", "proof_items"]);
    expect(supabase.calls).toContainEqual(["eq", "user_id", "learner-1"]);
  });
});
