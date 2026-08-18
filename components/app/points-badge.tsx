import { toMyanmarDigits } from "@/lib/domain/deadlines";

/**
 * The collectible points badge.
 *
 * The founder supplied this artwork as `public/brand/lan-pya-100-points-badge.svg`,
 * where "100", "POINTS" and "STARTER" are literal `<text>` nodes. Shipping that
 * file through an `<img>` would have told every learner they hold 100 points at
 * Starter, which is exactly the class of unbacked number this product refuses
 * to print (DESIGN.md; the "never a fake match score" rule on the opportunities
 * board). So the drawing is inlined here and the three readable values are
 * props: the badge cannot render a figure the caller did not supply.
 *
 * Two consequences of inlining, both handled below.
 *
 * First, `id` attributes inside an inlined SVG are document-global, not
 * element-scoped. `url(#gold)` in this badge would happily resolve to a
 * gradient defined by the mission map or the climb card if either got there
 * first. Every id here is therefore prefixed `pb-` AND suffixed with the tier
 * — see "Gradient ids" below.
 *
 * Second, the artwork's `font-family="Inter,Arial,sans-serif"` is not this
 * product's typeface and Inter is on the DESIGN.md blacklist. Every text node
 * inherits instead, so the badge speaks in Plus Jakarta Sans and in Padauk
 * under `lang="my"` without shipping a fourth font.
 *
 * ---------------------------------------------------------------------------
 * Tiers
 * ---------------------------------------------------------------------------
 *
 * One collectible in five finishes, not five badges. Silhouette, navy face,
 * teal mountain, sunrise and confetti are identical at every level; what
 * changes is the metal and one countable cue.
 *
 * 1. The metal. Each rank draws its rim from the DESIGN.md emblem palette
 *    (`--em-1` … `--em-5`, the palette that exists precisely for "stage
 *    emblems and level insignia"). Hue alone would be useless: `--em-1`,
 *    `--em-2` and `--em-3` all land within L* 45–49, so a greyscale or
 *    colourblind reader would see three identical rings. The finishes are
 *    therefore built on a *lightness* ladder — the mid stop of the rim
 *    gradient runs roughly L* 38 → 49 → 58 → 67 → 80. In greyscale the badge
 *    goes matte-dark at Explorer to bright at Trailblazer, monotonically.
 *
 * 2. The count. The rim is five discrete slots and exactly `rank` of them are
 *    struck in the metal; the rest sit recessed in near-black. This is the cue
 *    that needs no colour at all, and it is the only cue that survives the
 *    26px `mark` used in the Home points pill: at that size the badge is nine
 *    pixels of radius, so nothing pip-sized is countable, but the *fraction of
 *    the ring that is bright* still reads instantly — one fifth versus five
 *    fifths. It is derived from `rank` and nothing else.
 *
 * It states the learner's current level and stops there. A filled slot means
 * "you are at or past this rank", which is true by construction; there is no
 * slot for anything they have not reached, and no tier borrows an ornament
 * that would imply a proof, a verification or a placement they do not hold.
 *
 * ---------------------------------------------------------------------------
 * Gradient ids
 * ---------------------------------------------------------------------------
 *
 * Now that the rim and the ribbon differ per tier, a shared `#pb-rim` would be
 * an actual rendering bug the moment two badges at different levels appear in
 * one document: the second badge's `<defs>` would be ignored and it would be
 * painted in the first badge's metal. Every id is therefore suffixed with the
 * tier (`pb-rim-3`, `pb-ribbon-3`, …). Two badges at the *same* tier still
 * emit the same ids, which is harmless because their definitions are then
 * byte-identical — the browser resolves to the first, and the first is the
 * same drawing. Suffixing every id rather than only the tier-dependent ones is
 * deliberate: it means a later change that makes, say, the face per-tier
 * cannot reintroduce the bug.
 */

/**
 * Widths available to each text slot, in viewBox units, measured off the
 * artwork: the number panel is ~276 wide at the number's baseline and narrows
 * toward the bottom, and the ribbon body is ~296 wide where the level sits.
 * Each figure is the panel less a margin that keeps the text off the edge.
 */
const NUMBER_MAX = 250;
const LABEL_MAX = 224;
const LEVEL_MAX = 250;

/**
 * Rough advance width of one grapheme as a fraction of the font size. Latin
 * caps in a geometric sans sit near .62; Burmese clusters are wider and carry
 * stacked marks, so they get more room. These only need to be good enough to
 * pick a size step — `textLength` is the guarantee, not the estimate.
 */
const LATIN_ADVANCE = 0.62;
const MYANMAR_ADVANCE = 0.8;

/**
 * Burmese is written in stacked clusters: `"ကျွမ်းကျင်သူ".length` is 12 while
 * the reader sees five shapes. Counting UTF-16 units would shrink every
 * Burmese level name to illegibility, so count grapheme clusters instead.
 */
function graphemeCount(text: string, locale: string): number {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(locale, { granularity: "grapheme" });
    return [...segmenter.segment(text)].length;
  }
  return Array.from(text).length;
}

type Fit = { fontSize: number; letterSpacing: number; textLength?: number };

/**
 * Pick the largest size from `steps` whose estimated width fits `maxWidth`.
 *
 * When even the smallest step is too wide — a level name far longer than any
 * in the current ladder — the last step is used with an explicit `textLength`
 * and `lengthAdjust="spacingAndGlyphs"`, which makes overflow impossible at
 * the cost of some condensation. Preferring the size ladder first means the
 * names that actually ship (Explorer through Trailblazer, စူးစမ်းသူ through
 * ခရီးဖောက်သူ) are drawn at full size and never squeezed.
 */
function fitText(text: string, locale: string, steps: number[], maxWidth: number, tracking: number): Fit {
  const count = graphemeCount(text, locale);
  if (count === 0) return { fontSize: steps[0], letterSpacing: tracking };
  const advance = locale === "my" ? MYANMAR_ADVANCE : LATIN_ADVANCE;
  const width = (size: number) => count * advance * size + Math.max(count - 1, 0) * tracking;

  for (const fontSize of steps) {
    if (width(fontSize) <= maxWidth) return { fontSize, letterSpacing: tracking };
  }
  const smallest = steps[steps.length - 1];
  return { fontSize: smallest, letterSpacing: tracking, textLength: maxWidth };
}

/* ------------------------------------------------------------------ */
/* Tier finishes                                                       */
/* ------------------------------------------------------------------ */

type Finish = {
  /** Rim gradient, light → mid → dark. `mid` carries the greyscale ladder. */
  light: string;
  mid: string;
  dark: string;
  /** Under-fold of the ribbon tails, one step below `dark`. */
  deep: string;
  /** Light ring between rim and face. Keeps the silhouette readable at 26px. */
  bezel: string;
  /** Ribbon body, tuned so `onMetal` clears 4.5:1 against its lightest end. */
  ribbonFrom: string;
  ribbonTo: string;
  /** Level-name ink on the ribbon. Flips light on the two dark finishes. */
  onMetal: string;
};

/**
 * Five finishes, in rank order. Approximate L* of the `mid` stop is noted on
 * each line — that ladder is what a greyscale reader is actually reading, and
 * it must stay monotonic. Anchored on the DESIGN.md emblem palette:
 * `--em-1` #1D7F6E, `--em-2` #2F6EA8, `--em-3` #8A5FBF, `--em-4` #C2603F,
 * `--em-5` #B4922A — darkened or lightened to spread the values apart.
 */
const FINISHES: Finish[] = [
  // 1 Explorer — patinated bronze-green. mid L*≈38, the quietest badge.
  { light: "#4E9384", mid: "#1F6357", dark: "#0C3B33", deep: "#07231E", bezel: "#D7E7E2", ribbonFrom: "#2A7266", ribbonTo: "#0E453C", onMetal: "#F4FBF8" },
  // 2 Starter — steel. mid L*≈49.
  { light: "#7FAAD6", mid: "#3D79AE", dark: "#1B4C79", deep: "#123350", bezel: "#DDE9F5", ribbonFrom: "#35699A", ribbonTo: "#1B4C79", onMetal: "#F2F8FF" },
  // 3 Maker — amethyst. mid L*≈58.
  { light: "#C9B0E8", mid: "#A07AD0", dark: "#6B4A9C", deep: "#46306A", bezel: "#EBE1F8", ribbonFrom: "#DCC9F2", ribbonTo: "#A889D8", onMetal: "#2E1A52" },
  // 4 Practitioner — copper. mid L*≈67.
  { light: "#F7C8A6", mid: "#E08E60", dark: "#A85A32", deep: "#6E3818", bezel: "#FBE7D8", ribbonFrom: "#F7C8A6", ribbonTo: "#DE8C5C", onMetal: "#3A1B0B" },
  // 5 Trailblazer — gold. mid L*≈80, the brightest badge.
  { light: "#FFEDBB", mid: "#F0C14E", dark: "#C08A16", deep: "#8A6110", bezel: "#FFF4CC", ribbonFrom: "#FFE29A", ribbonTo: "#E9B341", onMetal: "#3A2408" },
];

/** Recessed slot: one value for every tier, so "unearned" always reads dark.
 *  Near-black rather than a tint, because it has to stay clearly below the
 *  darkest metal on the ladder — Explorer's #1F6357 — as well as above it. */
const SLOT_EMPTY = "#141C24";

/**
 * The `--em-ink` outline from DESIGN.md. That document is explicit that the
 * outline on an emblem is structural rather than decorative — it is what
 * carries contrast for the pale finishes, whose metal sits near 2.6:1 on a
 * white card. Removing it breaks accessibility, not just the look.
 */
const EM_INK = "#22201C";

const RING_SLOTS = 5;
const RING_OUTER = 222;
/** 26 viewBox units of band. Everything inside the medal was pulled in to buy
 *  it: at 26px the ring is the only thing carrying the level, so it gets the
 *  width, and the number panel's lowest point (r=195) still clears it. */
const RING_INNER = 196;
/** Degrees of dark between slots. Wide enough to notch at 168px, narrow
 *  enough that the bright arc still dominates at 26px. */
const RING_GAP = 6;

/**
 * One donut wedge of the rank ring, as an SVG path. Pure geometry from the
 * slot index — there is no randomness anywhere in this file, and the paths are
 * computed once at module load rather than per render.
 */
function slotPath(index: number): string {
  const cx = 300;
  const cy = 286;
  const step = 360 / RING_SLOTS;
  const from = -90 + index * step + RING_GAP / 2;
  const to = -90 + (index + 1) * step - RING_GAP / 2;
  const at = (radius: number, degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return `${(cx + radius * Math.cos(radians)).toFixed(2)} ${(cy + radius * Math.sin(radians)).toFixed(2)}`;
  };
  // Each wedge sweeps 66°, so the large-arc flag is always 0.
  return `M${at(RING_OUTER, from)} A${RING_OUTER} ${RING_OUTER} 0 0 1 ${at(RING_OUTER, to)} L${at(RING_INNER, to)} A${RING_INNER} ${RING_INNER} 0 0 0 ${at(RING_INNER, from)} Z`;
}

const RING_PATHS = Array.from({ length: RING_SLOTS }, (_, index) => slotPath(index));

export function PointsBadge({
  locale,
  points,
  rank,
  levelName,
  labels,
  size = 168,
  mark = false,
  className,
}: {
  locale: string;
  /** The learner's real points on the active path. Never a placeholder. */
  points: number;
  /**
   * The learner's current level, 1–5, straight from `progress.level.rank`.
   * Required rather than defaulted: a silent fallback would paint a tier the
   * learner may not hold, which is the one thing this badge must never do.
   */
  rank: number;
  /** Already localised by the caller, so this component never picks a name. */
  levelName: string;
  /** The word "Points" in the reader's language. */
  labels: { points: string };
  size?: number;
  /** Emblem only: the medal without the number panel or the level ribbon. At
   *  the ~30px this is drawn at in a rank chip or a proof row, the text is
   *  illegible, and an unreadable number is worse than none. */
  mark?: boolean;
  className?: string;
}) {
  const my = locale === "my";
  const pointsText = my ? toMyanmarDigits(points) : String(points);

  // Clamped, not trusted. A rank outside the ladder would index past the
  // finish table and paint nothing at all.
  const tier = Math.min(RING_SLOTS, Math.max(1, Math.round(rank) || 1));
  const finish = FINISHES[tier - 1];
  const id = (part: string) => `pb-${part}-${tier}`;

  // Burmese is never letter-spaced: tracking pulls stacked clusters apart and
  // breaks the shapes. Nor is it uppercased, which is a no-op that risks
  // locale-specific casing surprises for nothing.
  const labelText = my ? labels.points : labels.points.toUpperCase();
  const levelText = my ? levelName : levelName.toUpperCase();

  const number = fitText(pointsText, locale, [92, 80, 70, 62, 54], NUMBER_MAX, my ? 0 : -5);
  const label = fitText(labelText, locale, [20, 18, 16, 14], LABEL_MAX, my ? 0 : 5);
  const level = fitText(levelText, locale, [25, 22, 20, 18, 16], LEVEL_MAX, my ? 0 : 4);

  return (
    <svg
      className={className ? `pbadge ${className}` : "pbadge"}
      width={size}
      height={size}
      viewBox="0 0 600 600"
      role="img"
      // The whole picture restates these values, so one label carries them and
      // everything below is hidden from assistive tech. Callers that draw the
      // emblem beside their own figure pass no level name; the label drops the
      // slot rather than reading out a stray separator.
      aria-label={
        levelName
          ? my
            ? `${levelName} — ${labels.points} ${pointsText}`
            : `${levelName}, ${pointsText} ${labels.points}`
          : my
            ? `${labels.points} ${pointsText}`
            : `${pointsText} ${labels.points}`
      }
    >
      <defs>
        <linearGradient id={id("navyFace")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#17335D" />
          <stop offset="1" stopColor="#07162F" />
        </linearGradient>
        <linearGradient id={id("tealMountain")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22A699" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
        <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFD55A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        {/* Per-tier metal. This is the id that made the suffix mandatory.
            Two stops, not three, and vertical rather than diagonal: a struck
            slot at the bottom of the ring has to stay obviously brighter than
            an unstruck one, and a `dark` stop rolling round the lower edge was
            dimming the last filled slots into the recessed ones. */}
        <linearGradient id={id("rim")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={finish.light} />
          <stop offset="1" stopColor={finish.mid} />
        </linearGradient>
        <linearGradient id={id("ribbon")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={finish.ribbonFrom} />
          <stop offset="1" stopColor={finish.ribbonTo} />
        </linearGradient>
        <filter id={id("shadow")} x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#0F172A" floodOpacity=".24" />
        </filter>
        <filter id={id("glow")} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* Celebration sparks. Constant at every tier: this is the confetti, not
          the rank, and moving it would make five badges instead of one. */}
      <g fill="none" strokeLinecap="round" aria-hidden="true">
        <path d="M112 119 91 96M489 124l23-24M89 283H57M511 283h32M120 454l-22 23M480 454l23 23" stroke="#0F766E" strokeWidth="10" />
        <path d="M174 73 164 43M426 73l10-30M72 374l-29 12M528 374l29 12" stroke="#F59E0B" strokeWidth="9" />
        <circle cx="73" cy="184" r="9" fill="#F59E0B" stroke="none" />
        <circle cx="527" cy="184" r="9" fill="#0F766E" stroke="none" />
        <circle cx="172" cy="513" r="8" fill="#0F766E" stroke="none" />
        <circle cx="428" cy="513" r="8" fill="#F59E0B" stroke="none" />
      </g>

      {/* Medal */}
      <g filter={`url(#${id("shadow")})`} aria-hidden="true">
        {/* Rank ring. Five slots, `tier` of them struck in the metal, drawn
            clockwise from twelve o'clock. The recessed slots are one flat
            near-black at every tier, so "how much of the ring is bright" is a
            colour-free reading of the level — and the only tier cue that
            survives the 26px mark, where a pip would be a third of a pixel. */}
        <circle cx="300" cy="286" r={RING_OUTER} fill={SLOT_EMPTY} />
        {RING_PATHS.map((d, index) => (
          <path key={d} d={d} fill={index < tier ? `url(#${id("rim")})` : SLOT_EMPTY} />
        ))}
        {/* Structural, per DESIGN.md: the pale finishes do not clear 3:1 on a
            white card without this outline. */}
        <circle cx="300" cy="286" r={RING_OUTER} fill="none" stroke={EM_INK} strokeWidth="4" />
        <circle cx="300" cy="286" r="197" fill={finish.bezel} />
        <circle cx="300" cy="286" r="188" fill={`url(#${id("navyFace")})`} />
        <circle cx="300" cy="286" r="174" fill="none" stroke="#2A4C72" strokeWidth="2" strokeDasharray="4 13" />

        {/* Sunrise and mountain journey */}
        <circle cx="300" cy="176" r="54" fill="#F59E0B" opacity=".2" filter={`url(#${id("glow")})`} />
        <circle cx="300" cy="176" r="42" fill={`url(#${id("gold")})`} />
        <g stroke="#FCD56B" strokeWidth="5" strokeLinecap="round">
          <path d="M300 111V91M253 124l-14-16M347 124l14-16M237 166h-21M363 166h21" />
        </g>
        <path d="m164 281 88-116 45 52 41-78 100 142Z" fill="#0A2949" />
        <path d="m252 165 45 52 16-31 29 34-35-21-10 18-22-25Z" fill="#DDF8F2" opacity=".88" />
        <path d="m338 139 100 142H290Z" fill="#0B5D63" opacity=".78" />
        <path d="M151 292c54-24 104-32 149-14 46 18 89 13 149-12v86H151Z" fill={`url(#${id("tealMountain")})`} />
        <path d="M292 199c-18 35-4 55 23 70 31 17 22 43-8 64-25 17-31 37-18 61" fill="none" stroke="#FFF4CC" strokeWidth="12" strokeLinecap="round" />
        <path d="M292 199c-18 35-4 55 23 70 31 17 22 43-8 64-25 17-31 37-18 61" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 12" />

        {/* Small waypoints */}
        <g>
          <path d="M282 215c0-15 12-27 27-27s27 12 27 27c0 19-27 47-27 47s-27-28-27-47Z" fill="#F59E0B" stroke="#FFF4CC" strokeWidth="5" />
          <circle cx="309" cy="215" r="8" fill="#0F172A" />
          <circle cx="289" cy="382" r="14" fill="#16A34A" stroke="#FFF" strokeWidth="5" />
          <path d="m282 382 5 5 10-12" fill="none" stroke="#FFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Number panel. The two figures below are the only part of this file
            that is not fixed artwork. */}
        {mark ? null : (
          <>
        <path d="M162 326c42 18 88 27 138 27s96-9 138-27v111c-38 29-84 44-138 44s-100-15-138-44Z" fill="#F8FAFC" />
        <path d="M173 339c39 16 81 24 127 24s88-8 127-24" fill="none" stroke="#D8E6E2" strokeWidth="3" />
        <text
          className="pbadge-value"
          x="300"
          y="424"
          textAnchor="middle"
          fill="#0F172A"
          fontFamily="inherit"
          fontSize={number.fontSize}
          fontWeight="900"
          letterSpacing={number.letterSpacing}
          textLength={number.textLength}
          lengthAdjust={number.textLength ? "spacingAndGlyphs" : undefined}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {pointsText}
        </text>
        <text
          className="pbadge-label"
          x="300"
          y="456"
          textAnchor="middle"
          fill="#0F766E"
          fontFamily="inherit"
          fontSize={label.fontSize}
          fontWeight="800"
          letterSpacing={label.letterSpacing}
          textLength={label.textLength}
          lengthAdjust={label.textLength ? "spacingAndGlyphs" : undefined}
        >
          {labelText}
        </text>
          </>
        )}
      </g>

      {/* Level ribbon, struck in the same metal as the rim. */}
      {mark ? null : (
      <g filter={`url(#${id("shadow")})`} aria-hidden="true">
        <path d="M128 457h344l-35 48H163Z" fill={`url(#${id("ribbon")})`} />
        <path d="m128 457-49 21 42 53 42-26Z" fill={finish.dark} />
        <path d="m472 457 49 21-42 53-42-26Z" fill={finish.dark} />
        <path d="m128 457 35 48-42 26 7-46Z" fill={finish.deep} />
        <path d="m472 457-35 48 42 26-7-46Z" fill={finish.deep} />
        <text
          className="pbadge-level"
          x="300"
          y="491"
          textAnchor="middle"
          fill={finish.onMetal}
          fontFamily="inherit"
          fontSize={level.fontSize}
          fontWeight="900"
          letterSpacing={level.letterSpacing}
          textLength={level.textLength}
          lengthAdjust={level.textLength ? "spacingAndGlyphs" : undefined}
        >
          {levelText}
        </text>
      </g>
      )}

      {/* Collectible stars. Always two, flanking — a pair reads as ornament,
          and a second countable thing would compete with the rank ring. They
          take the tier bezel so they stay legible on the navy face, and they
          moved 16 units inboard when the ring took its extra width, so they
          sit wholly on the face instead of straddling the rank slots. */}
      <g fill={finish.bezel} stroke={finish.mid} strokeWidth="4" aria-hidden="true">
        <path d="m143 250 8 16 18 3-13 13 3 18-16-9-16 9 3-18-13-13 18-3Z" />
        <path d="m457 250 8 16 18 3-13 13 3 18-16-9-16 9 3-18-13-13 18-3Z" />
      </g>

      {/* Lan Pya mini mark. Dropped from the emblem-only variant: at 26px it is
          three pixels of mush sitting directly under the rank ring, which is
          the one thing the mark exists to show. */}
      {mark ? null : (
      <g transform="translate(266 520) scale(.85)" aria-hidden="true">
        <rect width="80" height="54" rx="18" fill="#0F172A" stroke="#FFE18B" strokeWidth="3" />
        <path d="M13 11h13v24c0 5 3 7 8 7h27v8H31c-11 0-18-6-18-15Z" fill="#F8FAFC" />
        <path d="M10 31h17c7 0 11-2 15-8l7-10 8 6-8 12c-6 9-12 12-23 12H10Z" fill="#0F766E" />
        <path d="m39 12 27-8-6 25-7-8-8 11-8-6 8-11Z" fill="#F59E0B" />
      </g>
      )}
    </svg>
  );
}
