import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { postAuthPath } from "@/lib/auth-redirect";

/**
 * Where account-confirmation emails land.
 *
 * The email template links here with Supabase's one-time token hash, and the
 * token is verified server-to-server. The default template links to
 * `*.supabase.co/auth/v1/verify` instead, which learners in Myanmar cannot
 * open without a VPN.
 *
 * Template (Supabase → Auth → Email templates → Confirm signup):
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}
 */
const OTP_TYPES = new Set<EmailOtpType>(["email", "signup", "recovery", "invite", "magiclink", "email_change"]);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = postAuthPath(url.searchParams.get("next"), url.origin, "/en/onboarding");

  if (!tokenHash || !type || !OTP_TYPES.has(type)) {
    return NextResponse.redirect(new URL("/en/login?error=confirm", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return NextResponse.redirect(new URL("/en/login?error=confirm", url.origin));

  await supabase.rpc("bootstrap_user");
  return NextResponse.redirect(new URL(next, url.origin));
}
