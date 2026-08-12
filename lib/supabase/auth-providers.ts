import { getPublicEnv, hasSupabaseEnv } from "@/lib/env";

type AuthSettings = {
  external?: {
    google?: boolean;
  };
};

export async function isGoogleProviderEnabled() {
  if (!hasSupabaseEnv()) return false;

  const env = getPublicEnv();

  try {
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      },
      cache: "no-store",
    });

    if (!response.ok) return false;

    const settings = (await response.json()) as AuthSettings;
    return settings.external?.google === true;
  } catch {
    return false;
  }
}
