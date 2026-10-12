import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { onboardingPath } from "@/lib/auth-redirect";

/**
 * Account creation, on the server.
 *
 * `emailRedirectTo` is this site's onboarding page in the reader's language.
 * The confirmation email template links to `/auth/confirm` on this site (see
 * README, "Supabase production setup"), passing this value through as `next`,
 * so confirming an account never sends the browser to `*.supabase.co`.
 */
const schema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(200),
  locale: z.enum(["en", "my"]).default("en"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-account", "Use a valid email and a password of at least 8 characters.");

  const origin = new URL(request.url).origin;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${origin}${onboardingPath(parsed.data.locale)}` },
  });
  if (error) return problem(400, "account-not-created", "Your account could not be created.");

  // With email confirmation off, Supabase signs the new account straight in.
  if (data.session) await supabase.rpc("bootstrap_user");
  return ok({ signedIn: Boolean(data.session) });
}
