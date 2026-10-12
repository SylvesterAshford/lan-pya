import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

/**
 * Profile name, headline and character, written through
 * `update_learner_profile` like every other write. It used to be called from
 * the browser's Supabase client; it lives here so the browser never contacts
 * Supabase directly.
 */
const schema = z.object({
  alias: z.string().trim().min(1).max(60),
  headline: z.string().trim().max(80),
  avatar: z.string().max(40),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-profile", "Use a name of 1 to 60 characters and a headline of up to 80.");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in before editing your profile.");

  const { data, error } = await supabase.rpc("update_learner_profile", {
    p_alias: parsed.data.alias,
    p_headline: parsed.data.headline,
    p_avatar: parsed.data.avatar,
  });
  if (error) return problem(400, "profile-not-saved", error.message);
  return ok(data);
}
