"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "@/i18n/navigation";
import { EMBLEM_SHAPES } from "@/components/app/emblem";
import { MascotPaths } from "@/components/app/mascot";
import { emblemForStage } from "@/lib/domain/progress";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { Milestone } from "@/lib/domain/types";

/**
 * Mission trail.
 *
 * A winding path through soft terrain: completed stops filled, the one you are
 * on lit and carrying the traveller, the rest dashed until they unlock.
 *
 * Consistency with the Roadmaps tab is structural. Both views read the SAME
 * `Milestone.status`, so a stop cannot be lit here and dark there. "Unlocked
 * one after another" is a data claim, not a visual effect: a padlock appears
 * because the database says the stage is upcoming.
 *
 * TWO GEOMETRIES, after the roadmap canvas. The first version shipped a single
 * phone-width layout, which on a desktop stranded a 456px strip in the middle
 * of the screen. A reference screenshot taken on a phone is not a desktop
 * design, and reproducing it at that width was copying rather than designing.
 *
 * Stops are interactive where there is somewhere to go: the current stage
 * opens its mission, a completed stage opens its proof, and a locked stage is
 * inert rather than a link that explains a refusal after the click.
 */

type Stop = {
  key: string;
  order: number;
  title: string;
  state: "done" | "current" | "next" | "locked";
  href?: string;
};

type Geometry = {
  W: number; left: number; right: number; step: number; top: number;
  radius: number; currentRadius: number; title: number; sub: number;
  mascot: number; gap: number; stroke: number; dash: string;
  /** SVG text does not wrap, so long titles run off the narrow viewBox. */
  maxTitle: number;
};

const WIDE: Geometry = { W: 880, left: 250, right: 630, step: 172, top: 112, radius: 36, currentRadius: 45, title: 20, sub: 15, mascot: 64, gap: 28, stroke: 9, dash: "1 26", maxTitle: 40 };
const NARROW: Geometry = { W: 360, left: 96, right: 252, step: 132, top: 96, radius: 27, currentRadius: 34, title: 15, sub: 12.5, mascot: 46, gap: 18, stroke: 7, dash: "1 22", maxTitle: 22 };

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

/** Windows the path around the learner so the trail is a walk, not a map of
 *  twelve stages. One behind for context, the current stop, and three ahead. */
function windowStops(milestones: Milestone[]) {
  const activeIndex = milestones.findIndex((m) => m.status === "active");
  const nextIndex = milestones.findIndex((m) => m.status === "next");
  const anchor = activeIndex >= 0 ? activeIndex : nextIndex >= 0 ? nextIndex : 0;
  const start = Math.max(0, anchor - 1);
  return { windowed: milestones.slice(start, start + 5), offset: start };
}

function stateOf(milestone: Milestone): Stop["state"] {
  if (milestone.status === "complete") return "done";
  if (milestone.status === "active") return "current";
  if (milestone.status === "next") return "next";
  return "locked";
}

export function MissionTrail({
  milestones,
  locale,
  missionHref,
  proofHref,
  labels,
}: {
  milestones: Milestone[];
  locale: string;
  /** Where the stage you are on leads. Omitted when no mission is authored. */
  missionHref?: string;
  /** Where a completed stage leads. */
  proofHref?: string;
  labels: { youAreHere: string; locked: string; done: string; stage: string; caption: string; open: string };
}) {
  const my = locale === "my";
  const router = useRouter();
  const wide = useWide();
  const g = wide ? WIDE : NARROW;
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));

  const { windowed, offset } = windowStops(milestones);
  if (!windowed.length) return null;

  const stops: Stop[] = windowed.map((m) => {
    const state = stateOf(m);
    return {
      key: m.key,
      order: m.order,
      title: m.title,
      state,
      href: state === "current" ? missionHref : state === "done" ? proofHref : undefined,
    };
  });

  // Reserve a partial step below the last stop, not a whole one: a full step
  // left ~170px of empty terrain hanging under the final node.
  const H = g.top + (stops.length - 1) * g.step + Math.round(g.step * 0.62);
  const xAt = (i: number) => (i % 2 === 0 ? g.left : g.right);
  const yAt = (i: number) => g.top + i * g.step;

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
      <svg viewBox={`0 0 ${g.W} ${H}`} role="img" aria-label={labels.caption}>
        <g aria-hidden="true">
          <circle cx={g.W * 0.86} cy={g.top * 0.44} r={g.W * 0.082} fill="var(--amber-100)" />
          {[0.22, 0.52, 0.82].map((t, i) => {
            const y = H * t;
            return (
              <path
                key={t}
                d={`M0 ${y} C ${g.W * 0.28} ${y - 44}, ${g.W * 0.62} ${y + 38}, ${g.W} ${y - 18} L${g.W} ${H} L0 ${H} Z`}
                fill={i % 2 === 0 ? "var(--teal-050)" : "var(--teal-100)"}
                opacity={0.7}
              />
            );
          })}
        </g>

        <path d={pathD} fill="none" stroke="var(--connector)" strokeWidth={g.stroke} strokeLinecap="round" strokeDasharray={g.dash} aria-hidden="true" />

        {stops.map((stop, i) => {
          const x = xAt(i);
          const y = yAt(i);
          const labelLeft = i % 2 !== 0;
          const emblem = EMBLEM_SHAPES[emblemForStage(offset + i, milestones.length)];
          const R = stop.state === "current" ? g.currentRadius : g.radius;
          const interactive = Boolean(stop.href);
          const sub = stop.state === "current" ? labels.youAreHere
            : stop.state === "done" ? labels.done
            : stop.state === "locked" ? labels.locked
            : `${labels.stage} ${num(stop.order)}`;

          const go = () => { if (stop.href) router.push(stop.href); };

          return (
            <g
              key={stop.key}
              className={`trail-stop ${stop.state}${interactive ? " is-link" : ""}`}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? `${stop.title}. ${sub}. ${labels.open}` : undefined}
              onClick={interactive ? go : undefined}
              onKeyDown={interactive ? (event) => {
                if (event.key === "Enter" || event.key === " ") { event.preventDefault(); go(); }
              } : undefined}
            >
              {/* The label belongs to the stop, so the hit area spans both
                  rather than asking for a tap on a 36px circle. */}
              {interactive ? (
                <rect
                  x={labelLeft ? x - R - 240 : x - R - 8}
                  y={y - R - 12}
                  width={R * 2 + 248}
                  height={R * 2 + 24}
                  fill="transparent"
                />
              ) : null}

              {stop.state === "current" ? (
                <circle cx={x} cy={y} r={R + 9} fill="var(--surface)" opacity="0.85" aria-hidden="true" />
              ) : null}

              <circle
                cx={x}
                cy={y}
                r={R}
                fill={stop.state === "done" ? "var(--teal-500)" : stop.state === "locked" ? "var(--surface-sunk)" : "var(--surface)"}
                stroke={stop.state === "done" ? "var(--teal-700)" : stop.state === "current" ? "var(--node-border)" : "var(--node-soon-border)"}
                strokeWidth={stop.state === "current" ? 4 : 3}
                strokeDasharray={stop.state === "locked" ? "6 6" : undefined}
              />

              {stop.state === "done" ? (
                <g transform={`translate(${x - R * 0.56},${y - R * 0.56}) scale(${(R * 1.12) / 64})`} aria-hidden="true">
                  <path d={emblem.shell} fill="#fff" />
                  <g dangerouslySetInnerHTML={{ __html: emblem.glyph.replace(/#fff/g, "var(--teal-700)") }} />
                </g>
              ) : stop.state === "locked" ? (
                <g transform={`translate(${x - R * 0.3},${y - R * 0.34}) scale(${R / 27})`} aria-hidden="true">
                  <rect x="0" y="7" width="16" height="12" rx="2.5" fill="var(--node-soon-border)" />
                  <path d="M3.5 7 V4.5 a4.5 4.5 0 0 1 9 0 V7" fill="none" stroke="var(--node-soon-border)" strokeWidth="2.2" />
                </g>
              ) : (
                <text x={x} y={y + R * 0.26} textAnchor="middle" fontSize={R * 0.72} fontWeight="800" fill="var(--node-border)" aria-hidden="true">
                  {num(stop.order)}
                </text>
              )}

              {stop.state === "current" ? (
                <g transform={`translate(${x - (132 * (g.mascot / 200)) / 2},${y - R - g.mascot}) scale(${g.mascot / 200})`} aria-hidden="true">
                  <MascotPaths />
                </g>
              ) : null}

              <text
                x={labelLeft ? x - R - g.gap : x + R + g.gap}
                y={y - 3}
                textAnchor={labelLeft ? "end" : "start"}
                fontSize={g.title}
                fontWeight="700"
                fill={stop.state === "locked" ? "var(--muted-ink)" : "var(--ink)"}
              >
                {stop.title.length > g.maxTitle ? `${stop.title.slice(0, g.maxTitle - 1)}\u2026` : stop.title}
              </text>
              <text
                x={labelLeft ? x - R - g.gap : x + R + g.gap}
                y={y + g.title + 3}
                textAnchor={labelLeft ? "end" : "start"}
                fontSize={g.sub}
                fontWeight="600"
                fill="var(--muted-ink)"
              >
                {sub}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>{labels.caption}</figcaption>
    </figure>
  );
}
