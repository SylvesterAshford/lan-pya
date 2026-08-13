import { z } from "zod";
import { ok, problem } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ trackKey: z.string().trim().min(1).max(80) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-path", "Choose a valid path.");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in before changing your path.");
  const { data, error } = await supabase.rpc("switch_active_path", { p_track_key: parsed.data.trackKey });
  if (error) {
    const unavailable = error.message.includes("path is not available") || error.message.includes("no available mission");
    return problem(409, unavailable ? "path-unavailable" : "path-switch-failed", unavailable ? "That path is not available to start yet." : "Your path was not changed. Please retry.", true);
  }
  return ok(data);
}
