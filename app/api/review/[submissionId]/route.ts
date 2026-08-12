import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const schema = z.object({ action: z.enum(["verify", "request_changes", "reject"]), notes: z.string().trim().min(20).max(3000), rubricScores: z.record(z.string(), z.number().int().min(0).max(4)) });

export async function POST(request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params; const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-review", "Add evidence-linked notes and valid rubric scores.");
  const supabase = await createClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Reviewer sign-in is required.");
  const { data, error } = await supabase.rpc("record_review_decision", { p_submission_id: submissionId, p_action: parsed.data.action, p_notes: parsed.data.notes, p_rubric_scores: parsed.data.rubricScores });
  if (error) return problem(error.message.includes("permission") ? 403 : 409, "review-not-recorded", "The submission may be unclaimed, already decided, or unavailable to this reviewer.");
  return ok(data);
}
