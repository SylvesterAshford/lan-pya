import { z } from "zod";
import { ok, problem } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ missionKey: z.string().trim().min(1).max(80) });

/**
 * The demo account's simulated review (demo_review_my_submission): verifies
 * its Completed work the way a reviewer would, so a pitch shows the whole
 * loop. The database refuses it for every other account.
 */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-mission", "Name a mission.");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in first.");
  const { data, error } = await supabase.rpc("demo_review_my_submission", { p_mission_key: parsed.data.missionKey });
  if (error) return problem(403, "not-demo", "Only the demo account has a simulated review.");
  return ok(data);
}
