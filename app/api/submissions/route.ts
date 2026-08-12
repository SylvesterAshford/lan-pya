import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const schema = z.object({
  missionKey: z.literal("responsive-profile-card"),
  repositoryUrl: z.string().url().max(500),
  deploymentUrl: z.string().url().max(500),
  screenshotUrl: z.union([z.literal(""), z.string().url().max(500)]),
  reflection: z.string().trim().min(40).max(1500),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-submission", "Add valid repository and deployment links plus a 40-character reflection.");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in before submitting work.");
  const { data, error } = await supabase.rpc("submit_mission", {
    p_mission_key: parsed.data.missionKey,
    p_repository_url: parsed.data.repositoryUrl,
    p_deployment_url: parsed.data.deploymentUrl,
    p_screenshot_url: parsed.data.screenshotUrl || null,
    p_reflection: parsed.data.reflection,
  });
  if (error) return problem(409, "submission-not-accepted", error.message.includes("active submission") ? "You already have an active review for this mission." : "The submission was not accepted. Your local draft is unchanged.", true);
  const functionUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cronSecret = process.env.CRON_SECRET;
  if (functionUrl && cronSecret) {
    await fetch(`${functionUrl}/functions/v1/process-evaluations`, {
      method: "POST", headers: { authorization: `Bearer ${cronSecret}`, "content-type": "application/json" }, body: "{}",
    }).catch(() => null);
  }
  return ok(data, 202);
}
