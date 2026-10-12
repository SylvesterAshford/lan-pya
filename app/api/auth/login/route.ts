import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

/**
 * Email and password sign-in, on the server, so the browser never contacts
 * Supabase directly. The session cookie is set on this response.
 */
const schema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-credentials", "Enter a valid email and password.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // One message for every failure: saying which half was wrong tells an
  // attacker which emails have accounts.
  if (error) return problem(401, "invalid-credentials", "Email or password is incorrect.");
  return ok({ signedIn: true });
}
