import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { secureToken, sha256 } from "@/lib/crypto";

const schema = z.object({ email: z.string().email(), role: z.enum(["reviewer", "reviewer_lead"]) });

export async function POST(request: Request) {
  const form = await request.formData(); const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return problem(400, "invalid-invite", "Add a valid email and reviewer role.");
  const token = secureToken(); const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_create_invite", { p_email_hash: await sha256(parsed.data.email.trim().toLowerCase()), p_token_hash: await sha256(token), p_role: parsed.data.role });
  if (error) return problem(403, "invite-not-created", "Admin access is required to create reviewer invites.");
  return ok({ inviteId: data, token, expiresInDays: 7 }, 201);
}
