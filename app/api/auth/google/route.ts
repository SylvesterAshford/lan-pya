import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";
import { onboardingPath, postAuthPath } from "@/lib/auth-redirect";

/**
 * Google sign-in, finished on the server.
 *
 * The browser only ever talks to Google (Google Identity Services) and to this
 * site. It posts the ID token Google issued; this route hands it to Supabase
 * server-to-server and sets the session cookie. Supabase's own OAuth redirect
 * is not used, because it sends the browser to `*.supabase.co`, which is not
 * reachable from Myanmar without a VPN.
 *
 * `nonce` is the raw value. Google was given its SHA-256 hex digest, and
 * Supabase checks that the token's nonce claim is the hash of this one, so a
 * captured token cannot be replayed without the matching raw nonce.
 */
const schema = z.object({
  credential: z.string().min(20).max(8192),
  nonce: z.string().min(16).max(128),
  locale: z.enum(["en", "my"]).default("en"),
  next: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-google-credential", "Google sign-in did not return a usable credential.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: parsed.data.credential,
    nonce: parsed.data.nonce,
  });
  if (error) return problem(401, "google-sign-in-failed", "Google sign-in could not be completed.", true);

  await supabase.rpc("bootstrap_user");
  const origin = new URL(request.url).origin;
  return ok({ next: postAuthPath(parsed.data.next, origin, onboardingPath(parsed.data.locale)) });
}
