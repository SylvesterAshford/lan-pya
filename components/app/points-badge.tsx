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
 * first. Every id here is therefore prefixed `pb-`.
 *
 * Second, the artwork's `font-family="Inter,Arial,sans-serif"` is not this
 * product's typeface and Inter is on the DESIGN.md blacklist. Every text node
 * inherits instead, so the badge speaks in Plus Jakarta Sans and in Padauk
 * under `lang="my"` without shipping a fourth font.
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

export function PointsBadge({
  locale,
  points,
  levelName,
  labels,
  size = 168,
  mark = false,
  className,
}: {
  locale: string;
  /** The learner's real points on the active path. Never a placeholder. */
  points: number;
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
      // The whole picture restates these three values, so one label carries
      // them and everything below is hidden from assistive tech.
      aria-label={
        my
          ? `${levelName} — ${labels.points} ${pointsText}`
          : `${levelName}, ${pointsText} ${labels.points}`
      }
    >
      <defs>
        <linearGradient id="pb-navyFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#17335D" />
          <stop offset="1" stopColor="#07162F" />
        </linearGradient>
        <linearGradient id="pb-tealMountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22A699" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
        <linearGradient id="pb-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFD55A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="pb-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE18B" />
          <stop offset=".45" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#B96705" />
        </linearGradient>
        <filter id="pb-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#0F172A" floodOpacity=".24" />
        </filter>
        <filter id="pb-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* Celebration sparks */}
      <g fill="none" strokeLinecap="round" aria-hidden="true">
        <path d="M112 119 91 96M489 124l23-24M89 283H57M511 283h32M120 454l-22 23M480 454l23 23" stroke="#0F766E" strokeWidth="10" />
        <path d="M174 73 164 43M426 73l10-30M72 374l-29 12M528 374l29 12" stroke="#F59E0B" strokeWidth="9" />
        <circle cx="73" cy="184" r="9" fill="#F59E0B" stroke="none" />
        <circle cx="527" cy="184" r="9" fill="#0F766E" stroke="none" />
        <circle cx="172" cy="513" r="8" fill="#0F766E" stroke="none" />
        <circle cx="428" cy="513" r="8" fill="#F59E0B" stroke="none" />
      </g>

      {/* Medal */}
      <g filter="url(#pb-shadow)" aria-hidden="true">
        <circle cx="300" cy="286" r="222" fill="url(#pb-rim)" />
        <circle cx="300" cy="286" r="207" fill="#FFF4CC" />
        <circle cx="300" cy="286" r="194" fill="url(#pb-navyFace)" />
        <circle cx="300" cy="286" r="178" fill="none" stroke="#2A4C72" strokeWidth="2" strokeDasharray="4 13" />

        {/* Sunrise and mountain journey */}
        <circle cx="300" cy="176" r="54" fill="#F59E0B" opacity=".2" filter="url(#pb-glow)" />
        <circle cx="300" cy="176" r="42" fill="url(#pb-gold)" />
        <g stroke="#FCD56B" strokeWidth="5" strokeLinecap="round">
          <path d="M300 111V91M253 124l-14-16M347 124l14-16M237 166h-21M363 166h21" />
        </g>
        <path d="m164 281 88-116 45 52 41-78 100 142Z" fill="#0A2949" />
        <path d="m252 165 45 52 16-31 29 34-35-21-10 18-22-25Z" fill="#DDF8F2" opacity=".88" />
        <path d="m338 139 100 142H290Z" fill="#0B5D63" opacity=".78" />
        <path d="M151 292c54-24 104-32 149-14 46 18 89 13 149-12v86H151Z" fill="url(#pb-tealMountain)" />
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

      {/* Level ribbon */}
      {mark ? null : (
      <g filter="url(#pb-shadow)" aria-hidden="true">
        <path d="M128 457h344l-35 48H163Z" fill="url(#pb-gold)" />
        <path d="m128 457-49 21 42 53 42-26Z" fill="#C97406" />
        <path d="m472 457 49 21-42 53-42-26Z" fill="#C97406" />
        <path d="m128 457 35 48-42 26 7-46Z" fill="#9F5704" />
        <path d="m472 457-35 48 42 26-7-46Z" fill="#9F5704" />
        <text
          className="pbadge-level"
          x="300"
          y="491"
          textAnchor="middle"
          fill="#0F172A"
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

      {/* Collectible stars */}
      <g fill="#FFF4CC" stroke="#F59E0B" strokeWidth="4" aria-hidden="true">
        <path d="m127 250 8 16 18 3-13 13 3 18-16-9-16 9 3-18-13-13 18-3Z" />
        <path d="m473 250 8 16 18 3-13 13 3 18-16-9-16 9 3-18-13-13 18-3Z" />
      </g>

      {/* Lan Pya mini mark */}
      <g transform="translate(266 520) scale(.85)" aria-hidden="true">
        <rect width="80" height="54" rx="18" fill="#0F172A" stroke="#FFE18B" strokeWidth="3" />
        <path d="M13 11h13v24c0 5 3 7 8 7h27v8H31c-11 0-18-6-18-15Z" fill="#F8FAFC" />
        <path d="M10 31h17c7 0 11-2 15-8l7-10 8 6-8 12c-6 9-12 12-23 12H10Z" fill="#0F766E" />
        <path d="m39 12 27-8-6 25-7-8-8 11-8-6 8-11Z" fill="#F59E0B" />
      </g>
    </svg>
  );
}
