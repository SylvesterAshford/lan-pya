/**
 * Verified program partners.
 *
 * One registry, because three places make a claim about the same relationship:
 * the band at the top of the board, the badge on a featured listing, and the
 * mark drawn on that listing. If they read from separate lists, one of them
 * eventually keeps showing a logo for a partnership that has lapsed.
 *
 * The founder confirmed both relationships before this shipped. If one ends,
 * delete its entry here and every surface stops claiming it at once — an
 * out-of-date partner logo is a false claim, not a stale one.
 *
 * The two marks are drawn on opposite grounds: the embassy seal on white, the
 * college wordmark white on navy. `ground` lets each sit on its own tile
 * rather than forcing both onto one, which would mean recolouring somebody's
 * official mark.
 */

export type Partner = {
  name: string;
  src: string;
  ground: "light" | "dark";
  /** Intrinsic size of the prepared asset, so callers can size it without
   *  guessing and squashing the mark. */
  width: number;
  height: number;
};

export const PARTNERS: Partner[] = [
  { name: "U.S. Embassy Rangoon", src: "/art/partner-us-embassy-rangoon.webp", ground: "light", width: 321, height: 120 },
  { name: "Strategy First International College", src: "/art/partner-strategy-first.webp", ground: "dark", width: 430, height: 120 },
];

/** The partner behind an organisation name, or undefined when there is none.
 *  Matching is on the name the listing carries, so a listing is a partner
 *  listing or it is not — there is no per-surface override. */
export function findPartner(organization: string): Partner | undefined {
  const key = organization.trim().toLowerCase();
  return PARTNERS.find((p) => p.name.toLowerCase() === key);
}
