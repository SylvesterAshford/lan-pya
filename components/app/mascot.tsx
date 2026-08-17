/**
 * The traveller, facing forward.
 *
 * Redrawn from the founder's supplied artwork: a student facing the viewer,
 * navy hoodie with amber drawstrings, teal backpack straps over the shoulders,
 * navy joggers, and amber flashes on the sneakers.
 *
 * Front-facing replaced an earlier back view. On a map the character stands
 * beside the stop you are on, and a figure with its back turned reads as
 * walking away from the thing it is meant to mark.
 *
 * Outlined rather than flat. The reference carries dark contours, and at the
 * ~50px this occupies on the mission map the outline is what holds the
 * silhouette together against terrain — a flat fill of the same navy would
 * dissolve into the path behind it.
 *
 * Drawn as paths rather than shipping the source PNG, which is 1023x1537 at
 * 964KB with `hasAlpha: no` — its "transparency" is a baked checkerboard that
 * would render as a grey grid behind the figure.
 *
 * `--m-*` tokens are scoped to illustration, exactly like the emblem palette,
 * so the character's colours can never leak into chrome.
 */

/** The figure's paths with no <svg> wrapper, so an existing canvas (the
 *  mission map) can place the same character inside its own coordinate space
 *  instead of nesting a second SVG document. */
export function MascotPaths() {
  return (
    <>
      {/* ---- legs ---- */}
      <path d="M50 116 h14 v56 h-14 Z" fill="var(--m-navy)" stroke="var(--m-line)" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M68 116 h14 v56 h-14 Z" fill="var(--m-navy)" stroke="var(--m-line)" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M50 160 h14 v10 h-14 Z" fill="var(--m-navy-dark)" stroke="var(--m-line)" strokeWidth="2" />
      <path d="M68 160 h14 v10 h-14 Z" fill="var(--m-navy-dark)" stroke="var(--m-line)" strokeWidth="2" />

      {/* ---- shoes: navy upper, cream sole, amber lace flash ---- */}
      <path d="M48 170 h16 v8 a4 4 0 0 1 -4 4 h-12 a3 3 0 0 1 -3 -3 v-2 a7 7 0 0 1 3 -7 Z" fill="var(--m-navy)" stroke="var(--m-line)" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M45 178 h19 v4 h-16 a3 3 0 0 1 -3 -4 Z" fill="var(--m-cream)" stroke="var(--m-line)" strokeWidth="1.8" />
      <path d="M52 171 q4 3 8 0" fill="none" stroke="var(--m-amber)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M68 170 h16 a7 7 0 0 1 3 7 v2 a3 3 0 0 1 -3 3 h-12 a4 4 0 0 1 -4 -4 Z" fill="var(--m-navy)" stroke="var(--m-line)" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M68 178 h19 a3 3 0 0 1 -3 4 h-16 Z" fill="var(--m-cream)" stroke="var(--m-line)" strokeWidth="1.8" />
      <path d="M72 171 q4 3 8 0" fill="none" stroke="var(--m-amber)" strokeWidth="2.6" strokeLinecap="round" />

      {/* ---- hoodie ---- */}
      <path d="M46 58 q10 -8 20 -8 q10 0 20 8 a10 10 0 0 1 6 9 v40 a8 8 0 0 1 -8 8 h-36 a8 8 0 0 1 -8 -8 v-40 a10 10 0 0 1 6 -9 Z" fill="var(--m-navy)" stroke="var(--m-line)" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M34 67 a8 8 0 0 0 -5 8 v30 a5 5 0 0 0 5 5 h6 v-43 Z" fill="var(--m-navy)" stroke="var(--m-line)" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M98 67 a8 8 0 0 1 5 8 v30 a5 5 0 0 1 -5 5 h-6 v-43 Z" fill="var(--m-navy)" stroke="var(--m-line)" strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx="34" cy="112" rx="5" ry="6" fill="var(--m-skin)" stroke="var(--m-line)" strokeWidth="2" />
      <ellipse cx="98" cy="112" rx="5" ry="6" fill="var(--m-skin)" stroke="var(--m-line)" strokeWidth="2" />
      {/* hood collar */}
      <path d="M52 52 q14 10 28 0 q-2 12 -14 12 q-12 0 -14 -12 Z" fill="var(--m-navy-dark)" stroke="var(--m-line)" strokeWidth="2" strokeLinejoin="round" />
      {/* ---- backpack straps ----
          Over the hoodie, not behind it. Drawn behind, they were completely
          hidden, which removed the teal that identifies the character. */}
      <path d="M53 57 q-3 22 -2 42 h9 q-1 -28 2 -42 Z" fill="var(--m-teal)" stroke="var(--m-line)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M79 57 q3 22 2 42 h-9 q1 -28 -2 -42 Z" fill="var(--m-teal)" stroke="var(--m-line)" strokeWidth="2" strokeLinejoin="round" />
      {/* strap buckles */}
      <path d="M52 84 h8 v4 h-8 Z" fill="var(--m-teal-dark)" stroke="var(--m-line)" strokeWidth="1.4" />
      <path d="M72 84 h8 v4 h-8 Z" fill="var(--m-teal-dark)" stroke="var(--m-line)" strokeWidth="1.4" />

      {/* drawstrings: the artwork's one amber accent on the torso */}
      <path d="M60 60 v16" stroke="var(--m-amber)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M72 60 v16" stroke="var(--m-amber)" strokeWidth="2.6" strokeLinecap="round" />
      {/* chest mark */}
      <path d="M76 74 l7 3 -7 3 2 -3 Z" fill="var(--m-teal)" stroke="var(--m-line)" strokeWidth="1.2" strokeLinejoin="round" />

      {/* ---- head ---- */}
      <path d="M60 40 h12 v10 h-12 Z" fill="var(--m-skin)" stroke="var(--m-line)" strokeWidth="2" />
      <ellipse cx="66" cy="28" rx="15" ry="17" fill="var(--m-skin)" stroke="var(--m-line)" strokeWidth="2.2" />
      <ellipse cx="51" cy="29" rx="3" ry="4.5" fill="var(--m-skin)" stroke="var(--m-line)" strokeWidth="1.8" />
      <ellipse cx="81" cy="29" rx="3" ry="4.5" fill="var(--m-skin)" stroke="var(--m-line)" strokeWidth="1.8" />
      <path d="M51 26 q-1 -19 15 -19 q16 0 15 19 q-3 -8 -10 -9 q-4 5 -12 3 q-5 -1 -8 6 Z" fill="var(--m-hair)" stroke="var(--m-line)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M66 7 q9 -1 13 8 q-5 -5 -13 -8 Z" fill="var(--m-hair)" />
      {/* Two eyes and a small smile, nothing more: any extra facial detail
          turns to mud below about 60px, and this is drawn at roughly 50. */}
      <ellipse cx="60" cy="29" rx="2.1" ry="2.6" fill="var(--m-line)" />
      <ellipse cx="72" cy="29" rx="2.1" ry="2.6" fill="var(--m-line)" />
      <path d="M62 36 q4 3 8 0" fill="none" stroke="var(--m-line)" strokeWidth="1.9" strokeLinecap="round" />
    </>
  );
}

export function Mascot({
  size = 120,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  const w = Math.round(size * 0.66);
  return (
    <svg
      className={className}
      width={w}
      height={size}
      viewBox="0 0 132 200"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <MascotPaths />
    </svg>
  );
}
