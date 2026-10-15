import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { isBillingFor } from "@/lib/domain/plans";

/**
 * Join the waitlist for a paid plan. Nothing is charged: Lan Pya has no
 * payment provider yet, so this records which plan and period a learner would
 * choose, and the Admin page counts it. Joining again changes the period.
 */
const schema = z.object({
  plan: z.enum(["pro", "career_plus"]),
  billing: z.enum(["monthly", "six_months", "three_months"]),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isBillingFor(parsed.data.plan, parsed.data.billing)) {
    return problem(400, "invalid-plan", "Choose Pro monthly or six months, or Career+ monthly or three months.");
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in to join the waitlist.");

  const { data, error } = await supabase.rpc("join_plan_waitlist", { p_plan: parsed.data.plan, p_billing: parsed.data.billing });
  if (error) return problem(400, "waitlist-not-saved", "Not saved. Check your connection and try again.", true);
  return ok(data);
}
