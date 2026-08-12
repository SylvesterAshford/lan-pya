import { createClient } from "@/lib/supabase/server";
import { problem } from "@/lib/http";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in before requesting deletion.");
  const { error } = await supabase.rpc("request_account_deletion");
  if (error) return problem(409, "deletion-request-failed", "A deletion request could not be recorded.");
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/en/?deletion=requested", request.url), 303);
}
