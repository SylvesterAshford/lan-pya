import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

/**
 * Put a waiting submission in this reviewer's hands. It used to happen as a
 * side effect of opening the review page, so looking at an item claimed it.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Reviewer sign-in is required.");
  const { data, error } = await supabase.rpc("claim_submission", { p_submission_id: submissionId });
  if (error) return problem(error.message.includes("permission") ? 403 : 409, "claim-failed", "This submission could not be claimed.");
  if (!data) return problem(409, "already-claimed", "Another reviewer has this submission, or it is no longer waiting.");
  return ok({ claimed: true });
}
