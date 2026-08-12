import { cookies } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, problem } from "@/lib/http";
import { secureToken, sha256 } from "@/lib/crypto";

const schema = z.object({ shareId: z.string().uuid(), token: z.string().length(64) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-share-token", "This proof link is malformed.");
  const admin = createAdminClient();
  const session = secureToken();
  const { data, error } = await admin.rpc("exchange_proof_share", { p_share_id: parsed.data.shareId, p_token_hash: await sha256(parsed.data.token), p_session_hash: await sha256(session) });
  if (error || !data) return problem(410, "share-unavailable", "This proof link is expired, revoked, or invalid.");
  const store = await cookies();
  store.set(`lp_proof_${parsed.data.shareId}`, session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: `/api/proof/share/${parsed.data.shareId}`, maxAge: 15 * 60 });
  return ok({ exchanged: true });
}
