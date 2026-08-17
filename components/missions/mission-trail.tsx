import { EMBLEM_SHAPES } from "@/components/app/emblem";
import { emblemForStage } from "@/lib/domain/progress";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { Milestone } from "@/lib/domain/types";

/**
 * Mission trail.
 *
 * A winding path through soft terrain: completed stops filled, the one you are
 * on lit and carrying the traveller, the rest dashed until they unlock. The
 * founder's reference is a lesson-unit trail; this is its equivalent for a
 * career path.
 *
 * Consistency with the Roadmaps tab is structural, not stylistic. Both views
 * read the SAME `Milestone.status` — complete, active, next, upcoming — so a
 * stop cannot be lit here and dark there. The roadmap is the overview at full
 * density; this is the same journey at walking pace.
 *
 * "Unlocked one after another" is therefore true rather than decorative: a
 * stop is locked because the database says the stage is upcoming, not because
 * a designer wanted three greyed circles.
 *
 * Scenery is deliberately held back. Hill bands and one sun, all flat SVG
 * paths costing a few hundred bytes, nothing behind a label. Design Spec §8:
 * the app's speed is the brand, and these learners pay for their data.
 */

type Stop = {
  key: string;
  order: number;
  title: string;
  proof: string;
  state: "done" | "current" | "next" | "locked";
};

/** Windows the path around the learner so the trail is a walk, not a map of
 *  twelve stages. One behind for context, the current stop, and three ahead. */
function windowStops(milestones: Milestone[]): { stops: Milestone[]; offset: number } {
  const activeIndex = milestones.findIndex((m) => m.status === "active");
  const nextIndex = milestones.findIndex((m) => m.status === "next");
  const anchor = activeIndex >= 0 ? activeIndex : nextIndex >= 0 ? nextIndex : 0;
  const start = Math.max(0, anchor - 1);
  return { stops: milestones.slice(start, start + 5), offset: start };
}

function stateOf(milestone: Milestone): Stop["state"] {
  if (milestone.status === "complete") return "done";
  if (milestone.status === "active") return "current";
  if (milestone.status === "next") return "next";
  return "locked";
}

/**
 * The traveller, after the founder's pitch artwork: a figure with a backpack
 * heading uphill. Flat SVG rather than the raster original, which would smear
 * at this size and cost real bytes on a budget phone.
 */
function Traveller({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 15},${y - 46})`} aria-hidden="true">
      {/* backpack behind the body */}
      <rect x="3" y="13" width="12" height="15" rx="4" fill="var(--teal-700)" />
      {/* body */}
      <path d="M9 13 h12 a5 5 0 0 1 5 5 v11 a4 4 0 0 1 -4 4 h-14 a4 4 0 0 1 -4 -4 v-11 a5 5 0 0 1 5 -5 Z" fill="var(--teal-500)" />
      {/* head */}
      <circle cx="16" cy="7" r="6.5" fill="var(--amber-100)" stroke="var(--teal-900)" strokeWidth="1.5" />
      {/* hat brim, the reference character's silhouette cue */}
      <path d="M7 4 h18" stroke="var(--teal-900)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 4 a6 4 0 0 1 12 0" fill="var(--teal-900)" />
      {/* legs mid-stride */}
      <path d="M12 33 v7" stroke="var(--teal-900)" strokeWidth="3" strokeLinecap="round" />
      <path d="M21 33 l4 6" stroke="var(--teal-900)" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

export function MissionTrail({
  milestones,
  locale,
  labels,
}: {
  milestones: Milestone[];
  locale: string;
  labels: { youAreHere: string; locked: string; done: string; stage: string; caption: string };
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));
  const { stops: windowed, offset } = windowStops(milestones);
  if (!windowed.length) return null;

  const stops: Stop[] = windowed.map((m) => ({
    key: m.key,
    order: m.order,
    title: m.title,
    proof: m.proof,
    state: stateOf(m),
  }));

  const W = 360;
  const STEP = 132;
  // Deep enough that the sun clears the first stop's label, which it ran
  // straight through at 64.
  const TOP = 96;
  const H = TOP + stops.length * STEP;
  // Alternating sides give the path its wind. Labels always take the opposite
  // side, so scenery and text never share space.
  const xAt = (i: number) => (i % 2 === 0 ? 96 : 252);
  const yAt = (i: number) => TOP + i * STEP;

  const pathD = stops.map((_, i) => {
    const x = xAt(i);
    const y = yAt(i);
    if (i === 0) return `M${x} ${y}`;
    const px = xAt(i - 1);
    const py = yAt(i - 1);
    const mid = (py + y) / 2;
    return `C${px} ${mid}, ${x} ${mid}, ${x} ${y}`;
  }).join(" ");

  return (
    <figure className="mission-trail">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={labels.caption}>
        {/* ---- scenery: behind everything, never under a label ---- */}
        <g aria-hidden="true">
          <circle cx={W - 54} cy={44} r="30" fill="var(--amber-100)" />
          {[0.22, 0.52, 0.82].map((t, i) => {
            const y = H * t;
            return (
              <path
                key={t}
                d={`M0 ${y} C ${W * 0.28} ${y - 34}, ${W * 0.62} ${y + 30}, ${W} ${y - 14} L${W} ${H} L0 ${H} Z`}
                fill={i % 2 === 0 ? "var(--teal-050)" : "var(--teal-100)"}
                opacity={0.7}
              />
            );
          })}
        </g>

        {/* ---- the path: chunky dashes read as stepping stones ---- */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--connector)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="1 22"
          aria-hidden="true"
        />

        {/* ---- stops ---- */}
        {stops.map((stop, i) => {
          const x = xAt(i);
          const y = yAt(i);
          const labelLeft = i % 2 !== 0;
          const emblem = EMBLEM_SHAPES[emblemForStage(offset + i, milestones.length)];
          const R = stop.state === "current" ? 34 : 27;

          return (
            <g key={stop.key}>
              {/* halo lifts the lit stop off the terrain */}
              {stop.state === "current" ? (
                <circle cx={x} cy={y} r={R + 8} fill="var(--surface)" opacity="0.85" aria-hidden="true" />
              ) : null}

              <circle
                cx={x}
                cy={y}
                r={R}
                fill={stop.state === "done" ? "var(--teal-500)" : stop.state === "locked" ? "var(--surface-sunk)" : "var(--surface)"}
                stroke={stop.state === "done" ? "var(--teal-700)" : stop.state === "current" ? "var(--node-border)" : "var(--node-soon-border)"}
                strokeWidth={stop.state === "current" ? 3.5 : 2.5}
                strokeDasharray={stop.state === "locked" ? "5 5" : undefined}
                aria-hidden="true"
              />

              {/* Done stops carry the stage emblem, the same mark the roadmap
                  node and the mission row use. */}
              {stop.state === "done" ? (
                <g transform={`translate(${x - 15},${y - 15}) scale(${30 / 64})`} aria-hidden="true">
                  <path d={emblem.shell} fill="#fff" />
                  <g dangerouslySetInnerHTML={{ __html: emblem.glyph.replace(/#fff/g, "var(--teal-700)") }} />
                </g>
              ) : stop.state === "locked" ? (
                <g transform={`translate(${x - 8},${y - 9})`} aria-hidden="true">
                  <rect x="0" y="7" width="16" height="12" rx="2.5" fill="var(--node-soon-border)" />
                  <path d="M3.5 7 V4.5 a4.5 4.5 0 0 1 9 0 V7" fill="none" stroke="var(--node-soon-border)" strokeWidth="2.2" />
                </g>
              ) : (
                <text x={x} y={y + 7} textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--node-border)" aria-hidden="true">
                  {num(stop.order)}
                </text>
              )}

              {stop.state === "current" ? <Traveller x={x} y={y - R} /> : null}

              {/* label opposite the stop */}
              <text
                x={labelLeft ? x - R - 18 : x + R + 18}
                y={y - 3}
                textAnchor={labelLeft ? "end" : "start"}
                fontSize="15"
                fontWeight="700"
                fill={stop.state === "locked" ? "var(--muted-ink)" : "var(--ink)"}
              >
                {stop.title.length > 27 ? `${stop.title.slice(0, 26)}…` : stop.title}
              </text>
              <text
                x={labelLeft ? x - R - 18 : x + R + 18}
                y={y + 16}
                textAnchor={labelLeft ? "end" : "start"}
                fontSize="12.5"
                fontWeight="600"
                fill="var(--muted-ink)"
              >
                {stop.state === "current" ? labels.youAreHere
                  : stop.state === "done" ? labels.done
                  : stop.state === "locked" ? labels.locked
                  : `${labels.stage} ${num(stop.order)}`}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>{labels.caption}</figcaption>
    </figure>
  );
}
