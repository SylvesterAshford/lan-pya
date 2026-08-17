"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import { Lock, Check, ChevronRight } from "lucide-react";
import { MascotPaths } from "@/components/app/mascot";
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

const WIDE: Geometry = { W: 900, H: 1180, xs: [0.30, 0.46, 0.34, 0.55, 0.47], top: 150, bottom: 1090, r: 34, rCurrent: 44, mascot: 128, card: 250 };
const NARROW: Geometry = { W: 380, H: 1080, xs: [0.30, 0.52, 0.32, 0.60, 0.46], top: 120, bottom: 1010, r: 25, rCurrent: 32, mascot: 92, card: 150 };

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
          {/* ---- sky and sun behind the peak ---- */}
          <rect width={g.W} height={g.H} fill="var(--map-sky)" />
          <circle cx={g.W * 0.5} cy={g.top - 34} r={g.W * 0.13} fill="var(--map-sun)" />

          {/* ---- far ridges: three bands, each lighter as it recedes ---- */}
          <path d={`M0 ${g.top + 150} L${g.W * 0.18} ${g.top + 40} L${g.W * 0.32} ${g.top + 120} L${g.W * 0.5} ${g.top - 40} L${g.W * 0.68} ${g.top + 110} L${g.W * 0.84} ${g.top + 30} L${g.W} ${g.top + 160} L${g.W} ${g.H} L0 ${g.H} Z`} fill="var(--map-ridge-3)" />
          <path d={`M0 ${g.top + 300} L${g.W * 0.22} ${g.top + 190} L${g.W * 0.44} ${g.top + 290} L${g.W * 0.62} ${g.top + 175} L${g.W * 0.82} ${g.top + 280} L${g.W} ${g.top + 215} L${g.W} ${g.H} L0 ${g.H} Z`} fill="var(--map-ridge-2)" />
          <path d={`M0 ${g.top + 470} Q ${g.W * 0.3} ${g.top + 380}, ${g.W * 0.55} ${g.top + 450} T ${g.W} ${g.top + 400} L${g.W} ${g.H} L0 ${g.H} Z`} fill="var(--map-ridge-1)" />
          {/* ---- snowfield the path climbs out of ---- */}
          <path d={`M0 ${g.top + 660} Q ${g.W * 0.35} ${g.top + 590}, ${g.W * 0.62} ${g.top + 655} T ${g.W} ${g.top + 610} L${g.W} ${g.H} L0 ${g.H} Z`} fill="var(--map-snow)" />

          {/* ---- conifers, thinning with altitude ---- */}
          {[[0.09, 0.46], [0.15, 0.52], [0.87, 0.44], [0.79, 0.50], [0.93, 0.56], [0.06, 0.60]].map(([fx, fy], i) => {
            const x = fx * g.W, y = g.top + fy * (g.bottom - g.top);
            const h = (wide ? 46 : 30) * (0.8 + (i % 3) * 0.2);
            return (
              <path key={`${fx}-${fy}`} d={`M${x} ${y - h} L${x + h * 0.34} ${y} L${x - h * 0.34} ${y} Z`} fill="var(--map-tree)" />
            );
          })}

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
            <g transform={`translate(${xAt(currentIndex) - (wide ? 175 : 118)},${yAt(currentIndex) - g.mascot}) scale(${g.mascot / 200})`}>
              <MascotPaths />
            </g>
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

        {/* ---- the current stop's detail, opposite its card ---- */}
        {currentIndex >= 0 && missionHref ? (
          <div
            className="map-detail"
            style={{
              top: `${((yAt(currentIndex) + g.rCurrent + 26) / g.H) * 100}%`,
              left: `${((xAt(currentIndex) + g.rCurrent + 28) / g.W) * 100}%`,
            }}
          >
            <Link className="button primary compact" href={missionHref}>
              {labels.continueMission}<ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>

      <figcaption>{labels.caption}</figcaption>
    </figure>
  );
}
