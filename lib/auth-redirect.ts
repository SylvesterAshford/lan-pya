/**
 * Where to send someone after an auth step finishes.
 *
 * `next` arrives from query strings and email templates. Supabase's
 * `{{ .RedirectTo }}` is an absolute URL, so an absolute URL on this site is
 * accepted and reduced to its path; anything pointing at another origin, or
 * anything that is not a path at all, falls back. This is the open-redirect
 * guard for every sign-in, sign-up and confirmation route.
 */
export function postAuthPath(next: string | null | undefined, origin: string, fallback: string) {
  if (!next) return fallback;
  try {
    const url = new URL(next, origin);
    if (url.origin !== origin) return fallback;
    if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/** The landing path for a fresh account in the reader's language. */
export function onboardingPath(locale: string | null | undefined) {
  return `/${locale === "my" ? "my" : "en"}/onboarding`;
}
