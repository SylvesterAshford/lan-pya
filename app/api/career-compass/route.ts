import { z } from "zod";
import { ok, problem } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  alias: z.string().trim().min(1).max(60),
  locale: z.enum(["en", "my"]),
  weeklyHours: z.enum(["2–3 hours", "4–6 hours", "7+ hours"]),
  interests: z.array(z.string().trim().min(1).max(40)).max(3),
  preferredWork: z.enum(["make", "explain", "design", "analyze", "organize", "grow", "not_sure"]),
  immediateGoal: z.enum(["explore", "freelance", "internship", "portfolio", "first_job", "not_sure"]),
  deviceAccess: z.enum(["phone_only", "phone_and_laptop", "laptop", "not_sure"]),
  connectivity: z.enum(["reliable", "limited", "not_sure"]),
  priorExperience: z.array(z.string().trim().min(1).max(40)).max(10),
  selectedTrackKey: z.string().trim().min(1).max(80).nullable().optional(),
  confirm: z.boolean().default(false),
  consent: z.boolean().default(false),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-career-compass", "Check the highlighted Career Compass answers.");
  if (parsed.data.confirm && (!parsed.data.selectedTrackKey || !parsed.data.consent)) {
    return problem(400, "path-confirmation-required", "Choose an available path and accept the privacy notice before continuing.");
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in before saving your Career Compass.");

  const { data, error } = await supabase.rpc("save_career_compass", {
    p_alias: parsed.data.alias,
    p_locale: parsed.data.locale,
    p_weekly_hours: parsed.data.weeklyHours,
    p_interests: parsed.data.interests,
    p_preferred_work: parsed.data.preferredWork,
    p_immediate_goal: parsed.data.immediateGoal,
    p_device_access: parsed.data.deviceAccess,
    p_connectivity: parsed.data.connectivity,
    p_prior_experience: parsed.data.priorExperience,
    p_selected_track_key: parsed.data.selectedTrackKey ?? null,
    p_confirm: parsed.data.confirm,
    p_consent_version: parsed.data.confirm ? "privacy-career-compass-v1" : null,
  });

  if (error) {
    const unavailable = error.message.includes("path is not available") || error.message.includes("no available mission");
    return problem(409, unavailable ? "path-unavailable" : "career-compass-save-failed", unavailable ? "That path is still being prepared. Choose an available path instead." : "Your answers are still on this device. Retry when you are ready.", true);
  }
  return ok(data, parsed.data.confirm ? 201 : 200);
}
