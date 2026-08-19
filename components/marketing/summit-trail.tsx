/**
 * The hero illustration: a valley at first light, a massif above it, and the
 * trail you would actually walk switchbacking up to the summit.
 *
 * Drawn rather than rendered. A painted illustration would be richer, but it
 * could not take the product's own navy and amber, could not draw the trail on
 * arrival, and would be the slowest thing on the page for a learner opening
 * this on mobile data. This is a few KB of vector.
 *
 * Three things this drawing has to get right, because the first attempt got
 * all three wrong.
 *
 * Every silhouette runs past the frame. The ranges are drawn from -160 to 920
 * against a 760-wide viewBox, so a peak leaves the picture the way a real one
 * does. Shapes that stopped exactly on the edge read as cut off, because they
 * were.
 *
 * Distance is carried by value, not by outline. Four planes, each lighter and
 * bluer than the one in front of it, with haze pooling where each meets the
 * one behind. That is what makes it landscape instead of a row of triangles.
 *
 * The trail is on the ground. It starts on the valley floor, climbs the near
 * shoulder, then switchbacks across the face of the massif to the flag. A path
 * floating over the terrain looks like a stray stroke, which is what it was.
 */
export function SummitTrail() {
  return (
    <svg
      className="summit"
      viewBox="0 0 760 620"
      role="img"
      aria-label="A trail climbing through three marked stops to a lit summit at first light"
    >
      <defs>
        {/* First light, behind the summit and a little to its right, so the
            massif is rimmed rather than evenly lit. */}
        <radialGradient id="dawn" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#ffe9c2" stopOpacity="0.62" />
          <stop offset="24%" stopColor="var(--amber-500)" stopOpacity="0.30" />
          <stop offset="62%" stopColor="var(--amber-500)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--amber-500)" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="planeFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5f88" />
          <stop offset="100%" stopColor="#36486e" />
        </linearGradient>
        <linearGradient id="planeMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#33456e" />
          <stop offset="100%" stopColor="#243358" />
        </linearGradient>
        <linearGradient id="planeMassif" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b3a62" />
          <stop offset="100%" stopColor="#182241" />
        </linearGradient>
        <linearGradient id="planeNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141d36" />
          <stop offset="62%" stopColor="#0d1526" />
          {/* Ends on the page's own background, so the drawing dissolves into
              the section instead of stopping on a visible edge. */}
          <stop offset="100%" stopColor="#080d18" />
        </linearGradient>

        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7d93bd" stopOpacity="0" />
          <stop offset="100%" stopColor="#7d93bd" stopOpacity="0.16" />
        </linearGradient>

        <linearGradient id="trailInk" x1="0" y1="1" x2="0.6" y2="0">
          <stop offset="0%" stopColor="var(--teal-500)" />
          <stop offset="100%" stopColor="var(--amber-500)" />
        </linearGradient>
      </defs>

      <circle cx="486" cy="150" r="215" fill="url(#dawn)" />

      {[[92, 84, 1.3], [196, 52, 1], [300, 106, 1.1], [648, 74, 1.2], [716, 150, 1], [402, 60, 0.9], [560, 40, 1.1]].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#e6eefb" opacity={0.45} />
      ))}

      {/* ---- plane 1: the distant range, hazed almost into the sky ---- */}
      <path
        d="M-160 352 L-60 286 L20 330 L104 244 L196 314 L286 262 L372 322 L470 236 L556 300 L636 254 L728 316 L812 268 L920 326 L920 620 L-160 620 Z"
        fill="url(#planeFar)"
        opacity="0.72"
      />
      <rect x="-160" y="236" width="1080" height="150" fill="url(#haze)" />

      {/* ---- plane 2: the mid range ---- */}
      <path
        d="M-160 430 L-52 372 L44 424 L150 344 L246 412 L330 360 L418 424 L520 372 L602 420 L700 356 L790 414 L920 368 L920 620 L-160 620 Z"
        fill="url(#planeMid)"
      />
      <rect x="-160" y="344" width="1080" height="130" fill="url(#haze)" />

      {/* ---- plane 3: the massif the trail actually climbs ---- */}
      <path
        d="M-160 520 L-40 468 L70 512 L182 440 L268 486 L352 404 L432 300 L486 156 L544 268 L596 350 L664 306 L742 366 L830 322 L920 372 L920 620 L-160 620 Z"
        fill="url(#planeMassif)"
      />

      {/* Snow following the geometry of the summit rather than sitting on it as
          a triangle: it runs down both ridges and breaks up as it descends. */}
      <g fill="#dfe9f8">
        <path d="M486 156 L516 214 L500 222 L524 268 L486 246 L452 268 L470 220 L456 210 Z" opacity="0.94" />
        <path d="M452 268 L466 292 L444 286 Z" opacity="0.6" />
        <path d="M524 268 L540 296 L512 290 Z" opacity="0.6" />
        <path d="M432 300 L446 318 L424 314 Z" opacity="0.38" />
      </g>
      {/* The lit edge, on the side the dawn comes from. */}
      <path d="M486 156 L544 268 L596 350" fill="none" stroke="#f2c988" strokeWidth="2" opacity="0.5" strokeLinecap="round" />

      {/* ---- plane 4: the near shoulder and the valley floor ---- */}
      <path
        d="M-160 566 L-46 512 L64 558 L186 496 L300 552 L404 508 L470 540 L560 500 L668 548 L780 506 L920 552 L920 620 L-160 620 Z"
        fill="url(#planeNear)"
      />

      {/* ---- the climb ---- */}
      <path
        className="summit-trail-line"
        d="M118 604
           C 168 586, 214 566, 218 536
           C 222 502, 158 492, 176 458
           C 196 422, 286 440, 300 406
           C 314 372, 244 344, 276 310
           C 306 278, 388 306, 414 274
           C 438 244, 430 214, 452 190
           C 464 176, 476 166, 484 160"
        fill="none"
        stroke="url(#trailInk)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* The three stops, bottom to top: cleared, cleared, and the one ahead. */}
      <g className="summit-stop done">
        <circle cx="218" cy="536" r="14" />
        <path d="M211.5 536 l4.5 4.5 l9.5 -10" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="summit-stop done">
        <circle cx="300" cy="406" r="14" />
        <path d="M293.5 406 l4.5 4.5 l9.5 -10" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="summit-stop ahead">
        <circle cx="414" cy="274" r="14" />
        <circle cx="414" cy="274" r="5" />
      </g>

      {/* A flag at the top, because the climb has an end. */}
      <path d="M486 158 L486 108" stroke="#e6eefb" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M486 110 L520 121 L486 132 Z" fill="var(--amber-500)" />
    </svg>
  );
}
