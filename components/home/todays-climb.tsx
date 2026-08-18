import { ArrowRight } from "lucide-react";
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
        <svg viewBox="0 0 460 320" className="climb-scene-art">
          <defs>
            {/* Ids are prefixed because the mission map defines its own sky on
                pages that may render both. */}
            <linearGradient id="climbSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--map-sky-high)" />
              <stop offset="0.46" stopColor="var(--map-sky)" />
              <stop offset="1" stopColor="var(--map-sky-low)" />
            </linearGradient>
            <radialGradient id="climbSunGlow">
              <stop offset="0" stopColor="var(--map-sun)" stopOpacity="0.9" />
              <stop offset="0.55" stopColor="var(--map-sun)" stopOpacity="0.4" />
              <stop offset="1" stopColor="var(--map-sun)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="460" height="320" fill="url(#climbSky)" />

          {/* Sun behind the summit, glow first so the peak occludes it. */}
          <circle cx="238" cy="74" r="104" fill="url(#climbSunGlow)" />
          <circle cx="238" cy="74" r="42" fill="var(--map-sun)" />

          {/* Flat lozenge clouds, no gradients, a few hundred bytes. */}
          {[
            [78, 96, 1],
            [366, 74, 0.82],
            [140, 52, 0.62],
          ].map(([cx, cy, k]) => (
            <g key={`cloud-${cx}`} fill="var(--map-cloud)" opacity="0.85">
              <ellipse cx={cx} cy={cy} rx={30 * k} ry={9 * k} />
              <ellipse cx={cx - 15 * k} cy={cy + 3 * k} rx={19 * k} ry={7 * k} />
              <ellipse cx={cx + 17 * k} cy={cy + 4 * k} rx={17 * k} ry={6 * k} />
            </g>
          ))}

          {/* Flanking peaks, lower and hazier than the summit. */}
          <path d="M92 122 L206 240 L-14 240 Z" fill="var(--map-ridge-3)" />
          <path d="M392 132 L478 240 L302 240 Z" fill="var(--map-ridge-3)" />

          {/* The summit: dark near face, lit far face, snow cap. */}
          <path d="M232 46 L344 216 L120 216 Z" fill="var(--map-peak)" />
          <path d="M232 46 L344 216 L232 216 Z" fill="var(--map-peak-lit)" />
          <path d="M232 46 L262 92 L248 82 L228 108 L212 80 L198 94 Z" fill="var(--map-snowcap)" />

          {/* Mid ridges, each paler as it recedes. */}
          <path
            d="M0 236 Q 88 200, 168 228 T 322 214 T 460 240 L460 320 L0 320 Z"
            fill="var(--map-ridge-2)"
          />
          <path
            d="M0 266 Q 112 230, 214 258 T 460 244 L460 320 L0 320 Z"
            fill="var(--map-ridge-1)"
          />

          {/* Conifer belt. Seeded scatter, never Math.random: the server and
              the client have to draw the same trees or hydration mismatches. */}
          {Array.from({ length: 16 }, (_, i) => {
            const t = ((i * 37) % 100) / 100;
            const x = 12 + t * 436;
            const band = i % 2;
            const y = 244 + band * 16 + ((i * 23) % 12);
            const h = 20 + ((i * 17) % 10) - band * 4;
            return (
              <g key={`tree-${i}`} opacity={0.92 - band * 0.16}>
                <path
                  d={`M${x} ${y - h} L${x + h * 0.32} ${y} L${x - h * 0.32} ${y} Z`}
                  fill="var(--map-tree)"
                />
                <path
                  d={`M${x} ${y - h * 0.64} L${x + h * 0.24} ${y - h * 0.3} L${x - h * 0.24} ${y - h * 0.3} Z`}
                  fill="var(--map-tree-lit)"
                />
              </g>
            );
          })}

          {/* Snowfield: the foreground the climb starts from. */}
          <path
            d="M0 288 Q 118 260, 240 282 T 460 270 L460 320 L0 320 Z"
            fill="var(--map-snow)"
          />
          {[298, 308].map((cy, i) => (
            <path
              key={`contour-${cy}`}
              d={`M-10 ${cy} Q 130 ${cy - 16}, 250 ${cy - 2} T 470 ${cy - 10}`}
              fill="none"
              stroke="var(--map-contour)"
              strokeWidth="2"
              opacity={0.5 - i * 0.12}
            />
          ))}

          {/* The lit path: a ribbon with a dashed centre line, winding from the
              foreground up to the shoulder of the peak. */}
          {(() => {
            const trail =
              "M64 314 C 108 300, 124 278, 152 264 C 186 248, 194 228, 176 212 C 158 196, 186 178, 210 170 C 236 162, 242 142, 230 118 L233 96";
            return (
              <g>
                <path d={trail} fill="none" stroke="var(--map-path-edge)" strokeWidth="13" strokeLinecap="round" />
                <path d={trail} fill="none" stroke="var(--map-path)" strokeWidth="9" strokeLinecap="round" />
                <path
                  d={trail}
                  fill="none"
                  stroke="var(--map-path-line)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray="5 9"
                />
              </g>
            );
          })()}

          {/* The pin: the stage the learner is on, sitting on the trail. Its
              flag takes chrome amber because this is the one thing on the
              scene that is asking for attention. */}
          <g>
            <path d="M204 206 v-30" stroke="var(--map-pole)" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M204 176 l16 5 -16 5 Z" fill="var(--amber-500)" />
            <circle cx="176" cy="212" r="27" fill="var(--map-halo)" />
            <circle cx="176" cy="212" r="22" fill="var(--surface)" />
            <circle cx="176" cy="212" r="18" fill="var(--teal-900)" />
            <text
              x="176"
              y="219"
              textAnchor="middle"
              fontSize="18"
              fontWeight="800"
              fill="var(--on-solid)"
            >
              {num(stageIndex)}
            </text>
          </g>

          {/* Foreground rocks and shoots. */}
          {[
            [40, 306, 1],
            [300, 314, 0.8],
          ].map(([cx, cy, k]) => (
            <g key={`rock-${cx}`}>
              <ellipse cx={cx} cy={cy} rx={17 * k} ry={9 * k} fill="var(--map-rock)" />
              <ellipse cx={cx - 5 * k} cy={cy - 3 * k} rx={10 * k} ry={5 * k} fill="var(--map-rock-lit)" />
            </g>
          ))}
          {[112, 262].map((x) => (
            <g
              key={`shoot-${x}`}
              stroke="var(--map-shoot)"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            >
              <path d={`M${x} 316 q-7 -9 -3 -17`} />
              <path d={`M${x} 316 q7 -8 3 -15`} />
              <path d={`M${x} 316 v-11`} />
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
