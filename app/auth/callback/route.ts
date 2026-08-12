import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRelativePath } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeRelativePath(url.searchParams.get("next"));

  if (!code) return NextResponse.redirect(new URL("/en/login?error=missing_code", url.origin));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/en/login?error=callback", url.origin));

  await supabase.rpc("bootstrap_user");
  return NextResponse.redirect(new URL(next, url.origin));
}
