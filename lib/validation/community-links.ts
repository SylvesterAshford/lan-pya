/**
 * Community contact links.
 *
 * The database is the guard: learner_profiles carries CHECK constraints with
 * these exact patterns (migration 20261015130000_community.sql), so nothing
 * else can be stored whatever calls it. They are mirrored here only so the form
 * and the route can say which field is wrong, in words, before a round trip.
 * tests/community.test.ts reads the migration and fails if these patterns drift
 * from the database's; supabase/tests/community_test.sql runs bad links
 * against the constraints themselves.
 */

export const TELEGRAM_URL = /^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}$/;
export const FACEBOOK_URL = /^https:\/\/(www\.|m\.)?facebook\.com\/[A-Za-z0-9.]{5,50}\/?$/;
export const FACEBOOK_ID_URL = /^https:\/\/(www\.)?facebook\.com\/profile\.php\?id=[0-9]{5,20}$/;
export const LINKEDIN_URL = /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-]{3,100}\/?$/;
export const NOTE_MAX = 120;

export type CommunityField = "telegram" | "facebook" | "linkedin" | "note";
export type CommunityLinks = { telegram: string; facebook: string; linkedin: string; note: string };
export type CommunityLinkErrors = Partial<Record<CommunityField, true>>;

/**
 * Learners type Telegram usernames in four ways: "@name", "name", "t.me/name"
 * and the full link. All become https://t.me/name. Anything else (a group
 * invite, a phone number) is returned trimmed so validation can refuse it.
 */
export function normalizeTelegram(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const name = trimmed
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/^(t\.me|telegram\.me)\//i, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
  return /^[A-Za-z0-9_]+$/.test(name) ? `https://t.me/${name}` : trimmed;
}

/** Facebook and LinkedIn links without a scheme get https:// in front. */
export function normalizeProfileUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/^http:\/\//i, "https://");
  return `https://${trimmed}`;
}

export function normalizeCommunityLinks(input: CommunityLinks): CommunityLinks {
  return {
    telegram: normalizeTelegram(input.telegram),
    facebook: normalizeProfileUrl(input.facebook),
    linkedin: normalizeProfileUrl(input.linkedin),
    note: input.note.trim(),
  };
}

/** Which fields fail the database's rules. Empty fields are fine. */
export function communityLinkErrors(links: CommunityLinks): CommunityLinkErrors {
  const errors: CommunityLinkErrors = {};
  if (links.telegram && !TELEGRAM_URL.test(links.telegram)) errors.telegram = true;
  if (links.facebook && !FACEBOOK_URL.test(links.facebook) && !FACEBOOK_ID_URL.test(links.facebook)) errors.facebook = true;
  if (links.linkedin && !LINKEDIN_URL.test(links.linkedin)) errors.linkedin = true;
  if (links.note.length > NOTE_MAX) errors.note = true;
  return errors;
}

export function hasAnyLink(links: Pick<CommunityLinks, "telegram" | "facebook" | "linkedin">) {
  return Boolean(links.telegram || links.facebook || links.linkedin);
}
