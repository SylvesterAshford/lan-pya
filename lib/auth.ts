import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

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
