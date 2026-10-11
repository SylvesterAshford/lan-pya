/**
 * The scenery for the landing-page climb, split into planes so each one can be
 * moved as its own composited layer.
 *
 * One SVG per plane, never one SVG for the whole scene. Moving a group inside a
 * single large SVG repaints the entire drawing every frame, which a budget
 * Android phone cannot do at scroll speed. Moving whole elements with
 * `transform` costs the compositor almost nothing.
 *
 * The world (massif, trail, stops) is drawn in a 1000 x 2400 space: the trail
 * starts on the valley floor at the bottom and ends on the summit at the top.
 * The camera in `the-climb.tsx` pans that space; the other planes are drawn in
 * their own frames and slide at their own rates for depth.
 */

export const WORLD_W = 1000;
export const WORLD_H = 2400;

/** The route, bottom to top. Each `C` segment ends on a stop or a turn. */
export const TRAIL_D = [
  "M 540 2360",
  "C 470 2280, 480 2190, 590 2140",
  "C 720 2090, 740 2010, 650 1960",
  "C 520 1890, 470 1760, 560 1680",
  "C 680 1520, 760 1440, 680 1360",
  "C 600 1290, 470 1220, 520 1120",
  "C 570 1020, 740 980, 720 880",
  "C 705 790, 520 760, 540 650",
  "C 555 560, 690 520, 660 430",
  "C 645 380, 600 320, 600 250",
].join(" ");

export type StopKey = "choose" | "build" | "prove" | "summit";

/** Stop positions lie exactly on segment ends of TRAIL_D. */
export const STOPS: { key: StopKey; x: number; y: number; side: "left" | "right" }[] = [
  { key: "choose", x: 650, y: 1960, side: "right" },
  { key: "build", x: 680, y: 1360, side: "left" },
  { key: "prove", x: 720, y: 880, side: "left" },
  { key: "summit", x: 600, y: 250, side: "left" },
];

// One decimal is sub-pixel at every size this is drawn; full float precision
// would roughly quadruple the forest's share of the HTML.
const r1 = (v: number) => Math.round(v * 10) / 10;

/** A pine as one path: three stacked tiers on a short trunk. */
function pine(x0: number, y0: number, h0: number) {
  const x = r1(x0);
  const y = r1(y0);
  const h = r1(h0);
  const w = h * 0.42;
  const t = h / 3;
  return ([
    `M ${x} ${y - h}`,
    `L ${x + w * 0.55} ${y - h + t * 1.1} L ${x + w * 0.3} ${y - h + t * 1.05}`,
    `L ${x + w * 0.8} ${y - h + t * 2.1} L ${x + w * 0.45} ${y - h + t * 2.05}`,
    `L ${x + w} ${y - h * 0.08} L ${x + w * 0.12} ${y - h * 0.08}`,
    `L ${x + w * 0.12} ${y} L ${x - w * 0.12} ${y} L ${x - w * 0.12} ${y - h * 0.08}`,
    `L ${x - w} ${y - h * 0.08} L ${x - w * 0.45} ${y - h + t * 2.05}`,
    `L ${x - w * 0.8} ${y - h + t * 2.1} L ${x - w * 0.3} ${y - h + t * 1.05}`,
    `L ${x - w * 0.55} ${y - h + t * 1.1} Z`,
  ].join(" ")).replace(/-?\d+\.\d{2,}/g, (n) => String(r1(Number(n))));
}

// Deterministic, so server and client render the same forest.
function forest(seed: number, count: number, xMin: number, xMax: number, yMin: number, yMax: number, hMin: number, hMax: number, avoid?: (x: number, y: number) => boolean) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const out: string[] = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 8) {
    const x = xMin + rnd() * (xMax - xMin);
    const y = yMin + rnd() * (yMax - yMin);
    if (avoid?.(x, y)) continue;
    // Trees further up the slope are further away, so smaller.
    const depth = (y - yMin) / (yMax - yMin);
    out.push(pine(x, y, hMin + (hMax - hMin) * depth * (0.7 + rnd() * 0.3)));
  }
  return out.join(" ");
}

// Keep trees off the trail corridor, which lives roughly between x 450 and 790.
const offTrail = (x: number) => x > 440 && x < 790;

// The silhouette, as two flanks from the summit down. Kept narrower than the
// frame so the trailhead view still has night sky on either side of it.
const LEFT_FLANK: [number, number][] = [[600, 246], [578, 252], [570, 330], [540, 430], [505, 540], [470, 640], [420, 770], [380, 860], [340, 960], [300, 1100], [270, 1300], [240, 1600], [220, 1900], [190, 2200], [150, 2400]];
const RIGHT_FLANK: [number, number][] = [[600, 246], [628, 252], [638, 300], [650, 360], [700, 450], [730, 520], [770, 600], [820, 700], [860, 800], [880, 1000], [900, 1300], [915, 1700], [935, 2100], [970, 2400]];

const MASSIF_D = `M ${LEFT_FLANK.map(([x, y]) => `${x} ${y}`).reverse().join(" L ")} L ${RIGHT_FLANK.slice(1).map(([x, y]) => `${x} ${y}`).join(" L ")} Z`;

function flankX(flank: [number, number][], y: number) {
  for (let i = 1; i < flank.length; i++) {
    const [x0, y0] = flank[i - 1];
    const [x1, y1] = flank[i];
    if (y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
  }
  return flank[flank.length - 1][0];
}

// The face the dawn lands on: the right flank, down to a soft line mid-slope.
const LIT_FACE_D =
  "M 628 252 L 638 300 L 650 360 L 700 450 L 730 520 L 770 600 L 820 700 L 860 800 L 880 1000 L 900 1300 L 820 1180 L 700 860 L 640 560 L 610 360 Z";

const SNOW_D =
  "M 578 252 L 600 246 L 628 252 L 638 296 L 624 292 L 646 354 L 624 346 L 604 396 L 588 346 L 566 358 L 574 306 L 562 312 Z";

// Contour lines across the face, each one clipped to the flanks at its height,
// with a gentle sag so they read as terrain rather than ruled lines.
const CONTOURS = [520, 700, 880, 1060, 1240, 1420, 1600, 1780, 1960, 2140].map((y, i) => {
  const l = flankX(LEFT_FLANK, y) + 10;
  const r = flankX(RIGHT_FLANK, y) - 10;
  const sag = 26 + (i % 3) * 10;
  const m = (l + r) / 2 + ((i % 2) ? 40 : -30);
  return `M ${l} ${y} C ${l + (m - l) * 0.5} ${y + sag}, ${m} ${y + sag * 0.4}, ${m} ${y + sag * 0.6} S ${r - (r - m) * 0.4} ${y - sag * 0.2}, ${r} ${y + 6}`;
});

const MASSIF_FOREST = forest(7, 46, 150, 970, 1300, 2380, 26, 66, (x, y) =>
  offTrail(x) || x < flankX(LEFT_FLANK, y) + 24 || x > flankX(RIGHT_FLANK, y) - 24);

export function SkyStars() {
  const stars: [number, number, number][] = [
    [62, 40, 1.4], [140, 120, 1], [212, 64, 1.2], [290, 180, 0.9], [356, 88, 1.3], [430, 30, 1], [488, 150, 1.1],
    [552, 70, 0.9], [618, 200, 1.2], [690, 50, 1.4], [760, 140, 1], [834, 76, 1.2], [902, 190, 0.9], [960, 44, 1.1],
    [96, 260, 0.8], [250, 300, 1], [470, 270, 0.8], [720, 280, 1], [880, 320, 0.8], [36, 360, 1], [600, 340, 0.8],
  ];
  return (
    <svg className="ascent-stars" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      {stars.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
    </svg>
  );
}

export function FarRange() {
  return (
    <svg className="ascent-plane ascent-far" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
      <path className="far-fill" d="M -40 230 L 40 150 L 110 200 L 190 90 L 260 170 L 330 120 L 400 190 L 470 110 L 540 180 L 610 100 L 690 170 L 760 80 L 840 160 L 920 110 L 1040 190 L 1040 1000 L -40 1000 Z" />
      <path className="far-snow" d="M 190 90 L 210 120 L 198 118 L 190 104 L 178 122 L 170 116 Z M 760 80 L 782 112 L 768 110 L 760 96 L 748 114 L 740 108 Z M 470 110 L 488 136 L 470 128 L 456 134 Z" />
      <defs>
        <linearGradient id="hazeFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2b98a" stopOpacity="0" />
          <stop offset="45%" stopColor="#f2b98a" stopOpacity="1" />
          <stop offset="100%" stopColor="#f2b98a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect className="dawn-haze" x="-40" y="40" width="1080" height="520" fill="url(#hazeFar)" />
    </svg>
  );
}

export function MidHills() {
  return (
    <svg className="ascent-plane ascent-mid" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
      <path className="mid-fill" d="M -40 170 C 90 90, 200 110, 300 160 C 390 205, 470 140, 560 120 C 660 100, 760 190, 860 150 C 930 122, 990 130, 1040 150 L 1040 1000 L -40 1000 Z" />
      <path className="mid-forest" d={forest(19, 40, -20, 1020, 150, 330, 18, 34)} />
      <defs>
        <linearGradient id="hazeMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2b98a" stopOpacity="0" />
          <stop offset="40%" stopColor="#f2b98a" stopOpacity="1" />
          <stop offset="100%" stopColor="#f2b98a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect className="dawn-haze" x="-40" y="70" width="1080" height="420" fill="url(#hazeMid)" />
    </svg>
  );
}

export function Massif({ stopLabels }: { stopLabels: Record<StopKey, string> }) {
  return (
    <svg className="ascent-plane ascent-massif" viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} aria-hidden="true">
      <defs>
        <linearGradient id="climbMassif" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e3e68" />
          <stop offset="45%" stopColor="#1a2647" />
          <stop offset="100%" stopColor="#0b1324" />
        </linearGradient>
        <linearGradient id="climbLit" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#f6b86f" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#e9925a" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#e9925a" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={MASSIF_D} fill="url(#climbMassif)" />
      <path className="lit-face" d={LIT_FACE_D} fill="url(#climbLit)" />

      {/* Rock ribs, so the face reads as stone rather than a flat cut-out. */}
      <g className="ribs">
        <path d="M 560 420 C 520 560, 470 700, 430 820" />
        <path d="M 650 420 C 690 560, 760 680, 820 760" />
        <path d="M 470 760 C 430 900, 380 1040, 330 1160" />
        <path d="M 800 820 C 830 940, 860 1060, 880 1180" />
      </g>

      <g className="contours">
        {CONTOURS.map((d) => <path key={d} d={d} />)}
      </g>

      <path className="snow" d={SNOW_D} />
      <path className="ridge-light" d="M 628 252 L 638 300 L 650 360 L 700 450 L 730 520 L 770 600" />

      <path className="massif-forest" d={MASSIF_FOREST} />

      {/* Stops. The flag and ring live with the mountain; the trail itself is
          its own plane so drawing it does not repaint the whole massif. */}
      {STOPS.map((stop) => (
        <g key={stop.key} className={`ascent-stop stop-${stop.key}`} data-stop={stop.key} transform={`translate(${stop.x} ${stop.y})`}>
          <line className="stop-pole" x1="0" y1="-6" x2="0" y2="-62" />
          <path className="stop-flag" d="M 1 -62 L 34 -52 L 1 -42 Z" />
          <circle className="stop-ring" r="13" />
          <path className="stop-check" d="M -6 0 L -1.5 5 L 7 -5" />
          <text className="stop-label" x={stop.side === "left" ? -44 : 52} y="-44" textAnchor={stop.side === "left" ? "end" : "start"}>{stopLabels[stop.key]}</text>
        </g>
      ))}
    </svg>
  );
}

export function Trail() {
  return (
    <svg className="ascent-plane ascent-trail" viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} aria-hidden="true">
      {/* The way ahead, faint, so the climb has a visible destination. */}
      <path className="trail-ahead" d={TRAIL_D} />
      {/* The way walked: drawn as the travellers go, never undrawn by a
          passing glance, because it is the record of the climb. */}
      <path className="trail-walked" d={TRAIL_D} pathLength={1} />
    </svg>
  );
}

export function NearGround() {
  return (
    <svg className="ascent-plane ascent-near" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      <path className="near-fill" d={`${pine(40, 420, 330)} ${pine(140, 470, 250)} ${pine(-20, 520, 280)} ${pine(900, 430, 310)} ${pine(980, 500, 260)} ${pine(820, 520, 200)}`} />
      <path className="near-fill" d="M -40 520 C 120 470, 260 500, 380 540 C 470 520, 520 560, 600 560 C 700 548, 800 500, 1040 520 L 1040 600 L -40 600 Z" />
      <path className="near-rock" d="M 400 560 C 410 520, 450 508, 476 530 C 490 520, 512 530, 516 560 Z M 744 560 C 752 528, 790 520, 806 544 C 816 538, 830 546, 832 560 Z" />
      <path className="near-grass" d="M 430 536 l -6 -26 M 438 534 l 2 -30 M 446 536 l 8 -24 M 770 536 l -8 -22 M 778 534 l 1 -28 M 786 536 l 9 -20" />
    </svg>
  );
}
