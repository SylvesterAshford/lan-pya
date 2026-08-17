"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import { Lock, Check, ChevronRight } from "lucide-react";
import { MASCOT_SRC, MASCOT_RATIO } from "@/components/app/mascot";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { Milestone } from "@/lib/domain/types";

/**
 * Mission map — a climb.
 *
 * The founder's reference is a mountain ascent: a path winding from the
 * foreground up to a lit peak, numbered stops sitting on the path, labelled
 * cards to alternating sides, and the character standing beside the stop you
 * are on. Completed stops are filled, the current one is haloed, the ones
 * above are locked.
 *
 * Architecture worth stating: the terrain, the path and the stop badges are
 * SVG, and the labelled cards are HTML positioned over them from the same
 * geometry. Cards carry real links, real buttons and text that has to wrap and
 * translate — all of which SVG does badly. Sharing one geometry function keeps
 * the two layers from drifting.
 *
 * Consistency with the Roadmaps tab is structural: both read the same
 * `Milestone.status`, so a stop cannot be lit here and dark there. A padlock
 * appears because the database says the stage is upcoming.
 *
 * Two departures from the reference, both deliberate. It shows "240 XP" and a
 * "7 day streak"; this product measures steps, and the founder plan rules out
 * coercive daily streaks in favour of a weekly rhythm with a grace week. A
 * streak counter here would contradict the research the plan cites.
 */

type Stop = {
  key: string;
  order: number;
  title: string;
  state: "done" | "current" | "next" | "locked";
  href?: string;
};

type Geometry = {
  W: number; H: number;
  /** Fractions of W, bottom stop first. The climb narrows toward the peak. */
  xs: number[];
  top: number; bottom: number;
  r: number; rCurrent: number;
  mascot: number;
  card: number;
};

const WIDE: Geometry = { W: 923, H: 1704, xs: [0.43, 0.57, 0.41, 0.52, 0.50], top: 300, bottom: 1470, r: 40, rCurrent: 52, mascot: 250, card: 270 };
const NARROW: Geometry = { W: 923, H: 1704, xs: [0.40, 0.58, 0.38, 0.54, 0.50], top: 300, bottom: 1470, r: 40, rCurrent: 52, mascot: 250, card: 300 };

const WIDE_QUERY = "(min-width: 780px)";

function useWide() {
  const subscribe = useCallback((cb: () => void) => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
    const mq = window.matchMedia(WIDE_QUERY);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => (typeof window.matchMedia === "function" ? window.matchMedia(WIDE_QUERY).matches : false),
    () => false,
  );
}

/** Five stops around the learner: one behind for context, then the climb. */
function windowStops(milestones: Milestone[]) {
  const active = milestones.findIndex((m) => m.status === "active");
  const next = milestones.findIndex((m) => m.status === "next");
  const anchor = active >= 0 ? active : next >= 0 ? next : 0;
  const start = Math.max(0, anchor - 1);
  return { windowed: milestones.slice(start, start + 5) };
}

function stateOf(m: Milestone): Stop["state"] {
  if (m.status === "complete") return "done";
  if (m.status === "active") return "current";
  if (m.status === "next") return "next";
  return "locked";
}

export function MissionMap({
  milestones,
  locale,
  pathTitle,
  steps,
  missionHref,
  proofHref,
  labels,
}: {
  milestones: Milestone[];
  locale: string;
  pathTitle: string;
  steps: number;
  missionHref?: string;
  proofHref?: string;
  labels: {
    stageOf: string; steps: string; youAreHere: string; complete: string;
    locked: string; nextMission: string; continueMission: string; caption: string;
  };
}) {
  const my = locale === "my";
  const wide = useWide();
  const g = wide ? WIDE : NARROW;
  const num = (v: number) => (my ? toMyanmarDigits(v) : String(v));

  const { windowed } = windowStops(milestones);
  if (!windowed.length) return null;

  const stops: Stop[] = windowed.map((m) => {
    const state = stateOf(m);
    return {
      key: m.key, order: m.order, title: m.title, state,
      href: state === "current" ? missionHref : state === "done" ? proofHref : undefined,
    };
  });

  // Bottom stop is index 0 and sits lowest: the climb reads upward, so the
  // first stop of the window is drawn last in screen terms.
  const n = stops.length;
  const yAt = (i: number) => g.bottom - (i * (g.bottom - g.top)) / (n - 1 || 1);
  const xAt = (i: number) => g.xs[i % g.xs.length] * g.W;

  const pathD = stops.map((_, i) => {
    const x = xAt(i), y = yAt(i);
    if (i === 0) return `M${x} ${y}`;
    const px = xAt(i - 1), py = yAt(i - 1);
    const mid = (py + y) / 2;
    return `C${px} ${mid}, ${x} ${mid}, ${x} ${y}`;
  }).join(" ");

  const currentIndex = stops.findIndex((s) => s.state === "current");
  const doneCount = milestones.filter((m) => m.status === "complete").length;

  return (
    <figure className="mission-map">
      <header className="mission-map-bar">
        <span className="mission-map-crest" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30">
            <path d="M16 2 L28 8 V18 Q28 26 16 30 Q4 26 4 18 V8 Z" fill="var(--teal-700)" />
            <path d="M16 10 v11 M16 12 q-5 1 -5 5 M16 12 q5 1 5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </span>
        <strong>{pathTitle}</strong>
        <span className="mission-map-pill">
          {labels.stageOf.replace("{a}", num(doneCount + 1)).replace("{b}", num(milestones.length))}
        </span>
        <span className="mission-map-steps">
          <b>{num(steps)}</b> {labels.steps}
        </span>
      </header>

      <div className="mission-map-stage" style={{ aspectRatio: `${g.W} / ${g.H}` }}>
        <svg viewBox={`0 0 ${g.W} ${g.H}`} className="mission-map-scene" aria-hidden="true">
          {/* ---- sky: cool at altitude, warming toward the snowline ---- */}
          <defs>
            <linearGradient id="mapSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--map-sky-high)" />
              <stop offset="0.42" stopColor="var(--map-sky)" />
              <stop offset="1" stopColor="var(--map-sky-low)" />
            </linearGradient>
            <radialGradient id="mapSunGlow">
              <stop offset="0" stopColor="var(--map-sun)" stopOpacity="0.95" />
              <stop offset="0.55" stopColor="var(--map-sun)" stopOpacity="0.45" />
              <stop offset="1" stopColor="var(--map-sun)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={g.W} height={g.H} fill="url(#mapSky)" />

          {/* sun behind the summit, glow first so the peak occludes it */}
          <circle cx={g.W * 0.5} cy={330} r={230} fill="url(#mapSunGlow)" />
          <circle cx={g.W * 0.5} cy={330} r={118} fill="var(--map-sun)" />

          {/* clouds: flat lozenges, no gradients, a few hundred bytes */}
          {[[0.16, 250, 1], [0.82, 292, 0.9], [0.30, 168, 0.7], [0.72, 196, 0.8]].map(([fx, cy, k]) => (
            <g key={`${fx}-${cy}`} fill="var(--map-cloud)" opacity="0.85">
              <ellipse cx={fx * g.W} cy={cy} rx={54 * k} ry={16 * k} />
              <ellipse cx={fx * g.W - 26 * k} cy={cy + 5 * k} rx={34 * k} ry={12 * k} />
              <ellipse cx={fx * g.W + 30 * k} cy={cy + 6 * k} rx={30 * k} ry={11 * k} />
            </g>
          ))}

          {/* ---- the summit: dark near face, lit far face, snow cap ---- */}
          <path d={`M${g.W * 0.5} 196 L${g.W * 0.79} 560 L${g.W * 0.21} 560 Z`} fill="var(--map-peak)" />
          <path d={`M${g.W * 0.5} 196 L${g.W * 0.79} 560 L${g.W * 0.5} 560 Z`} fill="var(--map-peak-lit)" />
          <path d={`M${g.W * 0.5} 196 L${g.W * 0.575} 290 L${g.W * 0.53} 274 L${g.W * 0.487} 320 L${g.W * 0.45} 268 L${g.W * 0.425} 290 Z`} fill="var(--map-snowcap)" />

          {/* flanking peaks, lower and hazier */}
          <path d={`M${g.W * 0.17} 330 L${g.W * 0.44} 620 L0 620 Z`} fill="var(--map-ridge-3)" />
          <path d={`M${g.W * 0.86} 356 L${g.W} 620 L${g.W * 0.58} 620 Z`} fill="var(--map-ridge-3)" />

          {/* ---- mid ridges, each paler as it recedes ---- */}
          <path d={`M0 700 Q ${g.W * 0.2} 560, ${g.W * 0.42} 660 T ${g.W * 0.78} 610 T ${g.W} 690 L${g.W} ${g.H} L0 ${g.H} Z`} fill="var(--map-ridge-2)" />
          <path d={`M0 880 Q ${g.W * 0.26} 745, ${g.W * 0.55} 845 T ${g.W} 800 L${g.W} ${g.H} L0 ${g.H} Z`} fill="var(--map-ridge-1)" />

          {/* ---- conifer belt along the treeline ---- */}
          {Array.from({ length: 26 }, (_, i) => {
            // Deterministic scatter: a seeded pattern rather than Math.random,
            // so server and client render the same trees.
            const t = (i * 37) % 100 / 100;
            const x = 20 + t * (g.W - 40);
            const band = i % 3;
            const y = 690 + band * 66 + ((i * 53) % 40);
            const h = 34 + ((i * 29) % 22) - band * 6;
            return (
              <g key={`tree-${i}`} opacity={0.92 - band * 0.16}>
                <path d={`M${x} ${y - h} L${x + h * 0.3} ${y} L${x - h * 0.3} ${y} Z`} fill="var(--map-tree)" />
                <path d={`M${x} ${y - h * 0.66} L${x + h * 0.24} ${y - h * 0.3} L${x - h * 0.24} ${y - h * 0.3} Z`} fill="var(--map-tree-lit)" />
              </g>
            );
          })}

          {/* ---- snowfield: the foreground the climb starts from ---- */}
          <path d={`M0 1010 Q ${g.W * 0.3} 900, ${g.W * 0.62} 1000 T ${g.W} 950 L${g.W} ${g.H} L0 ${g.H} Z`} fill="var(--map-snow)" />
          {/* contour lines, the reference's drifting snow texture */}
          {[1080, 1180, 1290, 1410, 1530].map((cy, i) => (
            <path
              key={cy}
              d={`M${-40 + i * 18} ${cy} Q ${g.W * 0.3} ${cy - 46}, ${g.W * 0.58} ${cy - 6} T ${g.W + 40} ${cy - 30}`}
              fill="none"
              stroke="var(--map-contour)"
              strokeWidth="2"
              opacity={0.5 - i * 0.06}
            />
          ))}

          {/* ---- foreground rocks and shoots ---- */}
          {[[0.12, 1600, 1], [0.86, 1560, 0.85], [0.30, 1650, 0.7], [0.68, 1620, 0.9]].map(([fx, cy, k]) => (
            <g key={`rock-${fx}`}>
              <ellipse cx={fx * g.W} cy={cy} rx={26 * k} ry={15 * k} fill="var(--map-rock)" />
              <ellipse cx={fx * g.W - 8 * k} cy={cy - 5 * k} rx={16 * k} ry={9 * k} fill="var(--map-rock-lit)" />
            </g>
          ))}
          {[[0.20, 1640], [0.78, 1600], [0.42, 1672], [0.60, 1655], [0.08, 1550]].map(([fx, cy]) => (
            <g key={`shoot-${fx}`} stroke="var(--map-shoot)" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d={`M${fx * g.W} ${cy} q-10 -14 -4 -26`} />
              <path d={`M${fx * g.W} ${cy} q10 -12 5 -22`} />
              <path d={`M${fx * g.W} ${cy} v-16`} />
            </g>
          ))}

          {/* ---- the path: a ribbon with a dashed centre line ---- */}
          <path d={pathD} fill="none" stroke="var(--map-path-edge)" strokeWidth={wide ? 26 : 18} strokeLinecap="round" />
          <path d={pathD} fill="none" stroke="var(--map-path)" strokeWidth={wide ? 19 : 13} strokeLinecap="round" />
          <path d={pathD} fill="none" stroke="var(--map-path-line)" strokeWidth={wide ? 2.5 : 2} strokeLinecap="round" strokeDasharray="7 12" />

          {/* ---- flag beside each stop ---- */}
          {stops.map((stop, i) => {
            const x = xAt(i) + (wide ? 54 : 38);
            const y = yAt(i) - (wide ? 8 : 6);
            const h = wide ? 46 : 32;
            const fill = stop.state === "done" ? "var(--teal-500)"
              : stop.state === "current" ? "var(--amber-500)"
              : "var(--map-flag-muted)";
            return (
              <g key={`flag-${stop.key}`}>
                <path d={`M${x} ${y} v${-h}`} stroke="var(--map-pole)" strokeWidth="2.6" strokeLinecap="round" />
                <path d={`M${x} ${y - h} l18 6 -18 6 Z`} fill={fill} />
              </g>
            );
          })}

          {/* ---- stop badges ---- */}
          {stops.map((stop, i) => {
            const x = xAt(i), y = yAt(i);
            const R = stop.state === "current" ? g.rCurrent : g.r;
            const fill = stop.state === "done" ? "var(--teal-500)"
              : stop.state === "current" ? "var(--teal-900)"
              : "var(--surface)";
            const ink = stop.state === "done" || stop.state === "current" ? "#fff" : "var(--muted-ink)";
            return (
              <g key={`badge-${stop.key}`}>
                {stop.state === "current" ? <circle cx={x} cy={y} r={R + 12} fill="var(--map-halo)" /> : null}
                <circle cx={x} cy={y} r={R + 4} fill="var(--surface)" />
                <circle
                  cx={x} cy={y} r={R} fill={fill}
                  stroke={stop.state === "next" ? "var(--amber-500)" : stop.state === "locked" ? "var(--hairline)" : "none"}
                  strokeWidth="3"
                />
                <text x={x} y={y + R * 0.32} textAnchor="middle" fontSize={R * 0.86} fontWeight="800" fill={ink}>
                  {num(stop.order)}
                </text>
                {stop.state === "done" || stop.state === "current" ? (
                  <g transform={`translate(${x + R * 0.62},${y + R * 0.62})`}>
                    <circle r="10" fill="var(--teal-500)" stroke="var(--surface)" strokeWidth="2.5" />
                    <path d="M-4 0.5 L-1.4 3 L4 -2.6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                ) : null}
              </g>
            );
          })}

          {/* ---- the traveller, standing beside the stop you are on ---- */}
          {currentIndex >= 0 ? (
            <image
              href={MASCOT_SRC}
              x={xAt(currentIndex) - g.rCurrent - g.mascot * MASCOT_RATIO - (wide ? 10 : 6)}
              y={yAt(currentIndex) - g.mascot + g.rCurrent}
              width={g.mascot * MASCOT_RATIO}
              height={g.mascot}
              preserveAspectRatio="xMidYMax meet"
            />
          ) : null}
        </svg>

        {/* ---- cards: HTML over the scene, positioned from the same geometry ---- */}
        {stops.map((stop, i) => {
          const x = xAt(i), y = yAt(i);
          // Place the card on whichever side actually has room, not on
          // alternating indexes. Index parity put three of five cards
          // off-screen at 360px, where they were clipped rather than wrapped.
          const leftSide = x > g.W / 2;
          const style = {
            top: `${(y / g.H) * 100}%`,
            [leftSide ? "right" : "left"]: `${((leftSide ? g.W - x + g.r + 28 : x + g.r + 28) / g.W) * 100}%`,
            maxWidth: `${(g.card / g.W) * 100}%`,
          } as React.CSSProperties;

          const status = stop.state === "current" ? labels.youAreHere
            : stop.state === "done" ? labels.complete
            : stop.state === "next" ? labels.nextMission
            : labels.locked;

          const card = (
            <>
              <span className="map-card-copy">
                <strong>{stop.title}</strong>
                <small className={`map-card-status ${stop.state}`}>{status}</small>
              </span>
              {stop.state === "locked" ? <Lock size={15} aria-hidden="true" className="map-card-lock" />
                : stop.state === "done" ? <Check size={15} aria-hidden="true" className="map-card-check" />
                : stop.state === "current" ? <ChevronRight size={16} aria-hidden="true" className="map-card-go" />
                : null}
            </>
          );

          return stop.href ? (
            <Link key={`card-${stop.key}`} href={stop.href} className={`map-card ${stop.state}`} style={style}>
              {card}
            </Link>
          ) : (
            <div key={`card-${stop.key}`} className={`map-card ${stop.state}`} style={style}>
              {card}
            </div>
          );
        })}

      </div>

      <figcaption>{labels.caption}</figcaption>
    </figure>
  );
}
