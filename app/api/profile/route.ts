import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const schema = z.object({
  alias: z.string().trim().min(1).max(60), locale: z.enum(["en", "my"]),
  weeklyHours: z.enum(["2–3 hours", "4–6 hours", "7+ hours"]),
  skills: z.array(z.string().max(40)).max(10), knowledgeScore: z.number().int().min(0).max(5),
  microTaskScore: z.number().int().min(0).max(4), consent: z.literal(true),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-profile", "Check the highlighted profile and placement answers.");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in before saving a profile.");
  const { data, error } = await supabase.rpc("save_onboarding", {
    p_alias: parsed.data.alias, p_locale: parsed.data.locale, p_weekly_hours: parsed.data.weeklyHours,
    p_skills: parsed.data.skills, p_knowledge_score: parsed.data.knowledgeScore,
    p_micro_task_score: parsed.data.microTaskScore, p_consent_version: "privacy-alpha-v1",
  });
  if (error) return problem(409, "profile-save-failed", "Your profile was not saved. Nothing was lost; retry this step.", true);
  return ok(data, 201);
}
