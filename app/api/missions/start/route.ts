import { z } from "zod";
import { ok, problem } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ missionKey: z.string().trim().min(1).max(100) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-mission", "Choose a valid mission.");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in before starting a mission.");
  const { data, error } = await supabase.rpc("start_mission_work", { p_mission_key: parsed.data.missionKey });
  if (error) return problem(409, "mission-unavailable", "That mission is not available on your active path.", true);
  return ok(data);
}
