import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { secureToken, sha256 } from "@/lib/crypto";

const schema = z.object({ proofId: z.string().uuid(), expiresInDays: z.number().int().min(1).max(30).default(7) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-share-request", "Choose valid proof and an expiry from 1 to 30 days.");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in before sharing proof.");
  const token = secureToken();
  const { data, error } = await supabase.rpc("create_proof_share", { p_proof_id: parsed.data.proofId, p_token_hash: await sha256(token), p_expires_in_days: parsed.data.expiresInDays });
  if (error || !data) return problem(409, "share-not-created", "Only active proof you own can be shared.");
  const origin = new URL(request.url).origin;
  return ok({ shareId: data, url: `${origin}/en/proof/view/${data}#token=${token}`, expiresInDays: parsed.data.expiresInDays }, 201);
}
