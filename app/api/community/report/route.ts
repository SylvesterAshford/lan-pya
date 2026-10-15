import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { demoReadOnly, ok, problem } from "@/lib/http";
import { uuidLike } from "@/lib/validation/ids";

/**
 * Report a Community member. The person is identified by their public
 * community handle, never their account id. The report hides them from the
 * reporter at once and is counted on the Admin page; it is never shown to the
 * person reported.
 */
const schema = z.object({
  handle: uuidLike(),
  reason: z.enum(["spam", "fake", "harassment", "other"]),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-report", "Choose a reason for the report.");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in before reporting.");

  const { data, error } = await supabase.rpc("report_community_member", { p_handle: parsed.data.handle, p_reason: parsed.data.reason });
  const demo = demoReadOnly(error); if (demo) return demo;
  const message = error?.message ?? "";
  if (message.includes("community report not allowed")) {
    return problem(403, "community-report-not-allowed", "Turn on Community in your Profile before reporting.");
  }
  if (message.includes("community member not found")) return problem(404, "community-member-not-found", "This person is no longer listed.");
  if (message.includes("cannot report yourself")) return problem(400, "community-self-report", "You cannot report yourself.");
  if (error) return problem(400, "report-not-sent", "Report not sent. Try again.", true);
  return ok(data);
}
