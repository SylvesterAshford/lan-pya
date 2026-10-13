import { LIT_FACE_D, MASSIF_D, SNOW_D, SNOW_SHADE_D, TRAIL_D } from "@/components/marketing/climb-art";

/**
 * The sign-in panel's picture: the landing page's summit at dawn, held still.
 *
 * The landing page ends with two travellers reaching this summit as the sun
 * comes up. Signing in is "welcome back" to that climb, so the panel shows the
 * same mountain, the same trail already walked, and the same two people at the
 * top. It replaces a route diagram with label chips and feature pills that
 * looked generated rather than drawn.
 *
 * One static SVG in the climb's world coordinates (see climb-art.tsx), cropped
 * to the summit. No script and no motion; the two cut-outs are the only images.
 */
export function SummitStill({ label }: { label: string }) {
  return (
    <svg className="summit-still" viewBox="180 40 840 820" preserveAspectRatio="xMidYMin slice" role="img" aria-label={label}>
      <defs>
        {/* Night overhead, dawn at the horizon: the top edge matches the
            panel's navy so the copy above sits on unbroken ground. */}
        <linearGradient id="stillSky" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="860">
          <stop offset="0%" stopColor="#080d18" />
          <stop offset="14%" stopColor="#0c1630" />
          <stop offset="40%" stopColor="#1a2c55" />
          <stop offset="66%" stopColor="#8c6c7c" />
          <stop offset="86%" stopColor="#e2a676" />
          <stop offset="100%" stopColor="#f4c58e" />
        </linearGradient>
        <radialGradient id="stillSun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff6df" />
          <stop offset="55%" stopColor="#ffd88f" />
          <stop offset="100%" stopColor="#f7b860" />
        </radialGradient>
        <radialGradient id="stillGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffd59a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffd59a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="stillMassif" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e3e68" />
          <stop offset="100%" stopColor="#141f3c" />
        </linearGradient>
        <linearGradient id="stillLit" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#f6b86f" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#e9925a" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#e9925a" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="-200" width="1200" height="1200" fill="url(#stillSky)" />

      <circle cx="640" cy="200" r="150" fill="url(#stillGlow)" />
      <circle cx="640" cy="200" r="78" fill="url(#stillSun)" />

      {/* Two distant ranges below the summit, lighter with distance. */}
      <path d="M 100 700 L 190 610 L 260 660 L 340 560 L 420 640 L 500 590 L 900 600 L 960 540 L 1040 610 L 1120 570 L 1120 1000 L 100 1000 Z" fill="#4a5c86" opacity="0.7" />
      <path d="M 100 790 L 200 720 L 290 770 L 380 700 L 470 760 L 880 740 L 960 690 L 1050 750 L 1120 720 L 1120 1000 L 100 1000 Z" fill="#33456e" />

      <path d={MASSIF_D} fill="url(#stillMassif)" />
      <path d={LIT_FACE_D} fill="url(#stillLit)" />
      <path d={SNOW_D} fill="#dbe6f7" />
      <path d={SNOW_SHADE_D} fill="#a9bad6" opacity="0.55" />
      <path d="M 630 252 L 656 286 L 690 330 L 730 392 L 772 462 L 820 548" fill="none" stroke="#ffd59a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />

      {/* The trail already walked, up to the summit. */}
      <path d={TRAIL_D} fill="none" stroke="var(--teal-500)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

      {/* Summit flag, reached. */}
      <g transform="translate(600 250)">
        <line x1="0" y1="-6" x2="0" y2="-62" stroke="#c9d4e6" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 1 -62 L 34 -52 L 1 -42 Z" fill="var(--teal-500)" />
      </g>

      {/* The two travellers, standing on the plateau. */}
      <image href="/art/traveller.webp" x="563" y="146" width="34" height="104" />
      <image href="/art/traveller-f.webp" x="589" y="146" width="33" height="104" />
    </svg>
  );
}
