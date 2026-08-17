import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";
import { sha256 } from "@/lib/crypto";
import { createClient } from "@/lib/supabase/server";
import { classifyRpc } from "@/lib/supabase/rpc-outcome";

export async function GET(_request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const session = (await cookies()).get(`lp_proof_${shareId}`)?.value;
  if (!session) return problem(401, "share-exchange-required", "Open the complete proof link to continue.");
  const admin = createAdminClient();
  const result = await admin.rpc("read_shared_proof", { p_share_id: shareId, p_session_hash: await sha256(session) });
  const outcome = classifyRpc(result, "read_shared_proof");
  if (outcome.kind === "unavailable") return problem(503, "proof-service-unavailable", "Proof cannot be loaded right now. Try this link again shortly.", true);
  if (outcome.kind === "empty") return problem(410, "share-unavailable", "This proof link is expired or revoked.");
  return ok(outcome.data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in before revoking a proof link.");
  const { data, error } = await supabase.rpc("revoke_proof_share", { p_share_id: shareId });
  if (error || !data) return problem(404, "share-not-found", "No active proof link was found.");
  return ok({ revoked: true });
}
