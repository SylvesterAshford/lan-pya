import { ArrowRight } from "lucide-react";
import { PointsBadge } from "@/components/app/points-badge";
import { Link } from "@/i18n/navigation";
import { Mascot } from "@/components/app/mascot";
import { toMyanmarDigits } from "@/lib/domain/deadlines";

/**
 * Today's climb — the hero of Home.
 *
 * The product's metaphor is a map, and the mission map already draws the climb
 * at full length. This is the same landscape at a glance: one dark panel that
 * answers "what am I doing today" in one line of copy and one action, with the
 * terrain beside it so Home and Missions read as one journey rather than two
 * unrelated screens.
 *
 * Deliberate restraints:
 *
 * - The scene reuses the `--map-*` palette exactly as `mission-map.tsx` does.
 *   Terrain colours are a bounded palette; they are never borrowed for chrome
 *   and chrome colours are never borrowed for terrain. Sharing one palette is
 *   what keeps the two screens looking like the same place.
 * - The only meta shown is the points award, and it is labelled as what
 *   verification earns rather than as something already banked. There is no
 *   time estimate here because the schema holds no such field; inventing
 *   "35 min focus" would be a claim the product cannot keep.
 * - Every user-visible string arrives as a prop. Numbers render in Myanmar
 *   digits when the locale asks for them, including the number on the pin.
 * - The scene is decoration: it is `aria-hidden`, and everything it depicts is
 *   also stated in the copy beside it. The single interactive element is a
 *   real link.
 *
 * A server component on purpose. There is no state here, and Home's hero is
 * the worst place in the app to spend hydration.
 */

export function TodaysClimb({
  locale,
  mascotVariant,
  pathTitle,
  missionTitle,
  missionBrief,
  stageIndex,
  stageTotal,
  missionHref,
  pointsAward,
  levelRank,
  labels,
}: {
  locale: string;
  /** Rendered by the page as the heading above this card, not here. */
  greeting?: string;
  alias?: string;
  mascotVariant: string;
  pathTitle: string | null;
  missionTitle: string | null;
  missionBrief: string | null;
  stageIndex: number;
  stageTotal: number;
  missionHref: string;
  pointsAward: number;
  /** The learner's current level on this path, 1–5. The emblem beside the
   *  award is the learner's own insignia, the same one the profile shows; it
   *  reports where they stand today and says nothing about what this mission
   *  would promote them to. */
  levelRank: number;
  labels: {
    eyebrow: string;
    continueMission: string;
    stageOf: string;
    points: string;
    noMission: string;
    subtitle: string;
  };
}) {
  const my = locale === "my";
  const num = (v: number) => (my ? toMyanmarDigits(v) : String(v));

  // `greeting` and `alias` stay in the props because the page heading above the
  // card is built from them; the card itself no longer prints a greeting.
  // the case where a caller has a name but no localised salutation for it.

  const hasMission = Boolean(missionTitle);
  const title = missionTitle ?? labels.noMission;
  const showStageLine = Boolean(pathTitle) && stageTotal > 0;
  const stageLine = labels.stageOf
    .replace("{a}", num(stageIndex))
    .replace("{b}", num(stageTotal));

  return (
    <section className="climb">
      <div className="climb-copy">
        <span className="climb-eyebrow">{labels.eyebrow}</span>
        <h2 className="climb-title">{title}</h2>

        {missionBrief ? <p className="climb-brief">{missionBrief}</p> : null}

        {hasMission ? (
          <p className="climb-meta">
            <span className="climb-points">
              {/* The same collectible the profile shows, emblem only: at this
                  size its own numerals would be illegible, so the figure beside
                  it does the counting. */}
              <PointsBadge
                locale={locale}
                points={pointsAward}
                rank={levelRank}
                levelName=""
                labels={{ points: labels.points }}
                size={26}
                mark
              />
              <b>{num(pointsAward)}</b> {labels.points}
            </span>
          </p>
        ) : null}

        {hasMission ? (
          <Link className="climb-cta" href={missionHref}>
            {labels.continueMission}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ) : null}

        {showStageLine ? (
          <p className="climb-foot">
            <span className="climb-foot-path">{pathTitle}</span>
            <span className="climb-foot-dot" aria-hidden="true">
              ·
            </span>
            <span>{stageLine}</span>
          </p>
        ) : null}
      </div>

      {/* Decorative. The climb, the stage number and the path are all stated in
          the copy above, so nothing here is the only carrier of meaning. */}
      <div className="climb-scene" aria-hidden="true">
        {/* Panoramic: the panel is roughly 2:1, so the scene is authored at
            that ratio instead of being a 3:2 picture cropped to fit. */}
        <svg viewBox="0 0 640 320" className="climb-scene-art" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Ids are prefixed because the mission map defines its own sky on
                pages that may render both. */}

            {/* Sunrise, not daylight. The old sky was a flat cold blue, which
                is why the tile read as pasted onto the navy instead of lit by
                the same sun. */}
            <linearGradient id="climbSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2b3f63" />
              <stop offset="0.32" stopColor="#6a7c9d" />
              <stop offset="0.56" stopColor="#c6ae87" />
              <stop offset="0.72" stopColor="#eecb92" />
              <stop offset="1" stopColor="#f8e4c0" />
            </linearGradient>

            <radialGradient id="climbSunGlow">
              <stop offset="0" stopColor="#ffe9b0" stopOpacity="0.95" />
              <stop offset="0.35" stopColor="#ffd681" stopOpacity="0.5" />
              <stop offset="0.7" stopColor="#f6b95f" stopOpacity="0.16" />
              <stop offset="1" stopColor="#f6b95f" stopOpacity="0" />
            </radialGradient>

            {/* Distance is haze, not just a paler fill. */}
            <linearGradient id="climbHaze" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f3d9ad" stopOpacity="0" />
              <stop offset="1" stopColor="#f3d9ad" stopOpacity="0.55" />
            </linearGradient>

            <linearGradient id="climbPeakFace" x1="0" y1="0" x2="1" y2="0.4">
              <stop offset="0" stopColor="#1f2d49" />
              <stop offset="1" stopColor="#2f4463" />
            </linearGradient>
            <linearGradient id="climbSlope" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#31513f" />
              <stop offset="1" stopColor="#1f3449" />
            </linearGradient>

            {/* The trail glows: a blurred halo, a body, and a bright core. */}
            <filter id="climbTrailGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <linearGradient id="climbTrail" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#7fe6da" />
              <stop offset="1" stopColor="#cffcf5" />
            </linearGradient>
          </defs>

          <rect width="640" height="320" fill="url(#climbSky)" />

          {/* Sun low behind the massif. */}
          <circle cx="352" cy="132" r="132" fill="url(#climbSunGlow)" />
          <circle cx="352" cy="130" r="26" fill="#ffe6a8" opacity="0.95" />

          {[
            [130, 84, 66, 5, 0.26],
            [470, 70, 74, 5, 0.22],
            [268, 100, 52, 4, 0.2],
            [576, 108, 46, 4, 0.18],
          ].map(([cx, cy, rx, ry, o]) => (
            <ellipse key={`cloud-${cx}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="#ffeccb" opacity={o} />
          ))}

          {/* ---- ranges, far to near ---- */}
          <path d="M0 182 L66 146 L112 170 L168 134 L222 176 L282 142 L340 178 L402 138 L462 176 L524 144 L586 180 L640 152 L640 206 L0 206 Z" fill="#93a1bb" opacity="0.5" />
          <path d="M0 202 L58 172 L118 196 L180 162 L248 200 L312 168 L382 202 L448 166 L516 198 L580 170 L640 196 L640 220 L0 220 Z" fill="#73849f" opacity="0.66" />

          {/* ---- the massif ---- */}
          <path d="M244 240 L352 104 L462 240 Z" fill="url(#climbPeakFace)" />
          <path d="M352 104 L462 240 L384 240 Z" fill="#42557a" opacity="0.8" />
          <path d="M352 104 L374 138 L362 133 L350 152 L339 130 L331 141 Z" fill="#f2f6fb" />
          <path d="M352 104 L366 126 L358 123 L352 134 Z" fill="#ffffff" opacity="0.9" />
          <path d="M244 240 L292 182 L326 222 L356 192 L396 234 L462 240 Z" fill="url(#climbSlope)" opacity="0.9" />

          {/* Flanking shoulders, hazier. */}
          <path d="M96 240 L184 148 L268 240 Z" fill="#5b6e91" opacity="0.7" />
          <path d="M430 240 L520 158 L616 240 Z" fill="#5b6e91" opacity="0.55" />

          <rect y="100" width="640" height="150" fill="url(#climbHaze)" />

          {/* ---- valley floor ---- */}
          <path d="M0 240 Q 160 218 320 244 T 640 236 L640 320 L0 320 Z" fill="#3d5470" />
          <path d="M0 266 Q 180 244 360 270 T 640 262 L640 320 L0 320 Z" fill="#2a4059" />
          <path d="M0 294 Q 200 274 400 298 T 640 290 L640 320 L0 320 Z" fill="#1d2f48" />

          {/* ---- the glowing trail ---- */}
          <g fill="none" strokeLinecap="round">
            <path d="M168 320 Q 232 288 268 254 Q 300 222 312 190 Q 326 152 352 118" stroke="#7fe6da" strokeWidth="13" opacity="0.5" filter="url(#climbTrailGlow)" />
            <path d="M168 320 Q 232 288 268 254 Q 300 222 312 190 Q 326 152 352 118" stroke="url(#climbTrail)" strokeWidth="5.5" opacity="0.95" />
            <path d="M168 320 Q 232 288 268 254 Q 300 222 312 190 Q 326 152 352 118" stroke="#f2fffd" strokeWidth="1.7" opacity="0.85" />
          </g>

          {/* Marker flag further up the trail. */}
          <g>
            <path d="M318 182 v-22" stroke="#e8eef7" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M318 160 l14 5 -14 5 Z" fill="var(--amber-500)" />
          </g>

          {/* ---- conifers ---- */}
          {[
            [470, 268, 22, 0.95], [496, 278, 28, 1], [448, 274, 18, 0.9],
            [524, 270, 24, 0.95], [552, 282, 30, 1], [582, 272, 21, 0.9],
            [610, 280, 25, 0.95],
            [86, 276, 24, 0.95], [58, 268, 18, 0.85], [116, 282, 27, 1],
            [150, 272, 17, 0.8], [420, 280, 19, 0.9], [200, 286, 15, 0.75],
          ].map(([x, y, h, o]) => (
            <g key={`fir-${x}-${y}`} opacity={o}>
              <path d={`M${x} ${y - h} L${x + h * 0.34} ${y} L${x - h * 0.34} ${y} Z`} fill="#1a3833" />
              <path d={`M${x} ${y - h * 0.62} L${x + h * 0.24} ${y - h * 0.24} L${x - h * 0.24} ${y - h * 0.24} Z`} fill="#2b5246" />
            </g>
          ))}

          {/* ---- signpost on a rock outcrop ---- */}
          <g>
            <ellipse cx="228" cy="300" rx="34" ry="13" fill="#22394f" />
            <ellipse cx="219" cy="295" rx="20" ry="8" fill="#2e4964" />
            <path d="M228 300 v-46" stroke="#4a3a2c" strokeWidth="4.4" strokeLinecap="round" />
            <path d="M228 262 h36 l9 9 -9 9 h-36 Z" fill="#5a4634" />
            <path d="M243 271 l9 -6 v12 Z" fill="#f2f6fb" opacity="0.92" />
          </g>

          {/* ---- stage pin on the trail ---- */}
          <g>
            <circle cx="268" cy="254" r="25" fill="#0b1b2c" opacity="0.3" />
            <circle cx="268" cy="254" r="21" fill="var(--surface)" />
            <circle cx="268" cy="254" r="17" fill="var(--teal-900)" />
            <text
              x="268"
              y="260"
              textAnchor="middle"
              fontSize="17"
              fontWeight="800"
              fill="var(--on-solid)"
            >
              {num(stageIndex)}
            </text>
          </g>

          {/* ---- foreground rocks ---- */}
          {[
            [58, 314, 1.2],
            [402, 316, 0.95],
            [318, 310, 0.7],
            [604, 312, 0.85],
          ].map(([cx, cy, k]) => (
            <g key={`rock-${cx}`}>
              <ellipse cx={cx} cy={cy} rx={19 * k} ry={9 * k} fill="#152740" />
              <ellipse cx={cx - 5 * k} cy={cy - 3 * k} rx={11 * k} ry={5 * k} fill="#23405d" />
            </g>
          ))}
        </svg>

        {/* The learner's own character, not a fixed one. Drawn as HTML over the
            scene rather than an SVG <image> so it keeps its intrinsic size. */}
        <Mascot size={150} variant={mascotVariant} className="climb-mascot" />
      </div>
    </section>
  );
}
