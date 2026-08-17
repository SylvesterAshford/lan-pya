/**
 * The traveller.
 *
 * Redrawn from the founder's supplied artwork: a student seen from behind,
 * navy hoodie and joggers, teal backpack with a star, amber flashes on the
 * sleeve and the sneakers.
 *
 * Redrawn rather than shipped as the original PNG for three reasons. The
 * source is 1023x1537 at 964KB, which is a quarter of a second of a learner's
 * data allowance for one character. It reports `hasAlpha: no`, so its
 * transparency is a baked-in checkerboard that would render as a grey grid
 * behind the figure. And at the 44px it occupies on the mission trail, a
 * downscaled raster smears while paths stay sharp.
 *
 * This replaces an earlier five-primitive stick figure that had no business
 * shipping. Detail here is load-bearing: the hood bunched at the neck, the
 * strap shadows, the sole overhang and the amber heel tab are what separate a
 * character from a pictogram.
 *
 * The palette is why this artwork suits Lan Pya: navy, teal and amber are
 * already the system. `--m-*` tokens are scoped to illustration, exactly like
 * the emblem palette, so they can never leak into chrome.
 */

/** The figure's paths with no <svg> wrapper, so an existing canvas (the
 *  mission trail) can place the same character inside its own coordinate
 *  space instead of nesting a second SVG document. */
export function MascotPaths() {
  return (
    <>
      {/* ---- legs ---- */}
      <path d="M53 112 h26 l-3 62 h-8 l-2 -42 -2 42 h-8 Z" fill="var(--m-navy)" />
      <path d="M55 164 h9 v10 h-9 Z" fill="var(--m-navy-dark)" />
      <path d="M68 164 h9 v10 h-9 Z" fill="var(--m-navy-dark)" />

      {/* ---- shoes: navy upper, cream sole overhang, amber heel tab ---- */}
      <path d="M55 174 h9 v8 a3 3 0 0 1 -3 3 h-13 a2 2 0 0 1 -1 -4 l8 -3 Z" fill="var(--m-navy)" />
      <path d="M47 182 h17 v4 h-17 a2 2 0 0 1 0 -4 Z" fill="var(--m-cream)" />
      <path d="M56 175 h3 v7 h-3 Z" fill="var(--m-amber)" />
      <path d="M68 174 h9 l8 3 a2 2 0 0 1 -1 4 h-13 a3 3 0 0 1 -3 -3 Z" fill="var(--m-navy)" />
      <path d="M68 182 h17 a2 2 0 0 1 0 4 h-17 Z" fill="var(--m-cream)" />
      <path d="M73 175 h3 v7 h-3 Z" fill="var(--m-amber)" />

      {/* ---- hoodie: torso narrower than before so the arms stay visible ---- */}
      <path d="M46 52 h40 a10 10 0 0 1 10 10 v42 a8 8 0 0 1 -8 8 h-44 a8 8 0 0 1 -8 -8 v-42 a10 10 0 0 1 10 -10 Z" fill="var(--m-navy)" />
      {/* arms hang outside the torso, hands tucked into pockets */}
      <path d="M36 58 a8 8 0 0 0 -6 8 v34 a6 6 0 0 0 6 6 h4 v-48 Z" fill="var(--m-navy)" />
      <path d="M96 58 a8 8 0 0 1 6 8 v34 a6 6 0 0 1 -6 6 h-4 v-48 Z" fill="var(--m-navy)" />
      {/* amber flash down the right sleeve, the artwork's single accent */}
      <path d="M98 62 q4 2 4 6 v32 h-4 Z" fill="var(--m-amber)" />
      <path d="M34 98 h7 v9 h-5 a4 4 0 0 1 -2 -9 Z" fill="var(--m-skin)" />
      <path d="M98 98 h-7 v9 h5 a4 4 0 0 0 2 -9 Z" fill="var(--m-skin)" />
      {/* hood, bunched down at the neck */}
      <path d="M50 48 q16 -9 32 0 q-3 13 -16 13 q-13 0 -16 -13 Z" fill="var(--m-navy-dark)" />

      {/* ---- backpack: narrower than the shoulders so the arms read ---- */}
      <path d="M56 52 q-4 12 -3 26 h6 q-1 -16 3 -26 Z" fill="var(--m-teal-dark)" />
      <path d="M76 52 q4 12 3 26 h-6 q1 -16 -3 -26 Z" fill="var(--m-teal-dark)" />
      <rect x="47" y="60" width="38" height="52" rx="11" fill="var(--m-teal)" />
      <path d="M74 60 h-1 a11 11 0 0 1 11 11 v30 a11 11 0 0 1 -11 11 h1 Z" fill="var(--m-teal-dark)" />
      <rect x="53" y="70" width="26" height="32" rx="7" fill="none" stroke="var(--m-teal-dark)" strokeWidth="1.8" opacity="0.55" />
      <path d="M66 75 l3.4 7 7.6 0.7 -5.6 5.4 1.5 7.6 -6.9 -3.6 -6.9 3.6 1.5 -7.6 -5.6 -5.4 7.6 -0.7 Z" fill="none" stroke="var(--m-teal-dark)" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M61 58 q5 -5 10 0" fill="none" stroke="var(--m-teal-dark)" strokeWidth="2.6" strokeLinecap="round" />

      {/* ---- head ----
          Seen from behind, the cranium is almost entirely hair. Only the neck
          and the near ear catch skin; an earlier pass left the back of the
          head bare, which read as a bald cap. */}
      <path d="M60 34 h12 v16 a6 6 0 0 1 -12 0 Z" fill="var(--m-skin-dark)" />
      <path d="M52 34 q0 -26 14 -26 q14 0 14 26 q0 8 -4 11 h-20 q-4 -3 -4 -11 Z" fill="var(--m-hair)" />
      {/* fringe lifting at the crown, as in the reference */}
      <path d="M63 9 q12 -4 17 9 q-4 -5 -9 -7 q-4 -2 -8 -2 Z" fill="var(--m-hair)" />
      {/* near ear */}
      <path d="M79 30 a4 4 0 0 1 0 8 q-2 -4 0 -8 Z" fill="var(--m-skin)" />
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
