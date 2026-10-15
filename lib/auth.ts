import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** The signed-in account, as the session token states it. */
export type SessionUser = { id: string; email: string | null; user_metadata: Record<string, unknown> };

/**
 * Who is signed in, worked out once per request.
 *
 * getClaims() checks the token's signature against the project's published
 * key, which supabase-js keeps in memory, so it needs no trip to Supabase Auth.
 * getUser() made that trip for the layout and again for the page on every
 * screen. The database accepts the same token on every query, so this trusts
 * nothing the data layer did not already trust. proxy.ts refreshes an expired
 * token before the page renders.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;
  return {
    id: claims.sub,
    email: typeof claims.email === "string" && claims.email ? claims.email : null,
    user_metadata: claims.user_metadata ?? {},
  };
});

export async function requireUser(locale: string) {
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  return user;
}

export function safeRelativePath(value: string | null, fallback = "/en/app/today") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://lan-pya.local");
    return url.origin === "https://lan-pya.local"
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
