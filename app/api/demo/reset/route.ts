import { ok, problem } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

/**
 * Puts the shared demo account back to its story (reset_demo_account), so a
 * pitch can be rehearsed and then given from the same starting point. The
 * database refuses the call from any other account.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in first.");
  const { data, error } = await supabase.rpc("reset_my_demo");
  if (error) return problem(403, "not-demo", "Only the demo account can be reset.");
  return ok(data);
}
