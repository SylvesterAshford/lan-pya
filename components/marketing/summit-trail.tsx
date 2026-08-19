/**
 * The hero illustration: a switchback trail climbing out of the dark to a lit
 * summit, with three stops on it where the proof cards pin.
 *
 * Drawn rather than rendered. A painted illustration would be richer, but it
 * could not take the product's own colours, could not draw the trail on
 * arrival, and would be the slowest thing on the page for a learner opening
 * this on a budget phone on mobile data. Every colour here is a token, so the
 * picture is the same navy and amber as the app it is advertising.
 *
 * The ridge silhouettes are the same language as the mission map and the
 * passport, so the landing page is recognisably the same product as the thing
 * behind the sign-in.
 */
export function SummitTrail() {
  return (
    <svg
      className="summit"
      viewBox="0 0 720 620"
      role="img"
      aria-label="A trail climbing through three marked stops to a lit summit"
    >
      <defs>
        <radialGradient id="summitGlow" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="var(--amber-100)" stopOpacity="0.52" />
          <stop offset="42%" stopColor="var(--amber-500)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--amber-500)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="trailInk" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--teal-500)" />
          <stop offset="100%" stopColor="var(--amber-500)" />
        </linearGradient>
        <linearGradient id="ridgeFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#33456b" />
          <stop offset="100%" stopColor="#1e2942" />
        </linearGradient>
        <linearGradient id="ridgeNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d2a48" />
          <stop offset="100%" stopColor="#0a1020" />
        </linearGradient>
        <radialGradient id="terrainFade" cx="0.54" cy="0.44" r="0.74">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="58%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <mask id="terrainMask">
          <rect width="720" height="620" fill="url(#terrainFade)" />
        </mask>
      </defs>

      {/* Dawn behind the summit. The light is always at the top of the climb. */}
      <circle cx="470" cy="132" r="190" fill="url(#summitGlow)" />

      {/* Far range, then the summit itself, then the near shoulder the trail
          climbs out of. Three planes is enough to read as distance. */}
      <g mask="url(#terrainMask)">
        <path d="M0 330 L120 214 L210 300 L286 236 L392 348 L470 300 L556 366 L640 306 L720 372 L720 620 L0 620 Z" fill="url(#ridgeFar)" />
        <path d="M470 108 L556 226 L604 300 L336 300 L410 200 Z" fill="#2a3c62" />
        <path d="M470 108 L500 150 L470 168 L440 150 Z" fill="#e8eef7" opacity="0.9" />
        <path d="M0 420 L96 356 L188 424 L268 372 L368 452 L470 396 L580 462 L668 414 L720 448 L720 620 L0 620 Z" fill="url(#ridgeNear)" />
      </g>

      {/* A few stars, thinning as they near the glow. */}
      {[[80, 78, 1.4], [178, 44, 1], [262, 108, 1.2], [612, 66, 1.1], [676, 148, 1.3], [352, 62, 0.9]].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#dfe8f5" opacity={0.5} />
      ))}

      {/* The climb. Drawn as one stroke so it reads as a single journey rather
          than a set of steps, and so it can draw itself on arrival. */}
      <path
        className="summit-trail-line"
        d="M96 596 C 168 566, 214 540, 196 496 C 176 448, 118 442, 146 396 C 176 348, 268 366, 288 322 C 308 278, 236 252, 268 214 C 300 176, 386 208, 420 176 C 444 152, 456 138, 468 122"
        fill="none"
        stroke="url(#trailInk)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* The three stops, bottom to top: done, done, and the one still ahead. */}
      <g className="summit-stop done">
        <circle cx="196" cy="496" r="15" />
        <path d="M189 496 l5 5 l10 -11" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="summit-stop done">
        <circle cx="288" cy="322" r="15" />
        <path d="M281 322 l5 5 l10 -11" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="summit-stop ahead">
        <circle cx="420" cy="176" r="15" />
        <circle cx="420" cy="176" r="5.5" />
      </g>

      {/* A flag at the top, because the climb has an end. */}
      <path d="M470 122 L470 76" stroke="#dfe8f5" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M470 78 L502 88 L470 100 Z" fill="var(--amber-500)" />
    </svg>
  );
}
