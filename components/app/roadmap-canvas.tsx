"use client";

import { useCallback, useSyncExternalStore } from "react";
import { EMBLEM_SHAPES } from "@/components/app/emblem";
import { emblemForStage, type EmblemKey } from "@/lib/domain/progress";
import type { Milestone } from "@/lib/domain/types";

/**
 * Roadmap canvas — roadmap.sh node graph per Design Specification v1.1 §3.3.
 *
 * Two things this canvas refuses to do.
 *
 * It never draws a grid. Node width is measured from the title and row height
 * from how many topics the stage actually carries, so a light stage reads
 * light and a heavy one reads heavy. Uniform geometry over non-uniform content
 * is what made the earlier canvas look generated.
 *
 * And it never leaves "where am I" to a single hairline. Progress is carried
 * on the saturation axis — cleared stages are muted teal, the current stage is
 * the only fully saturated thing on the page, and everything ahead drains to
 * parchment. That ordering survives greyscale, which a ring at 55% opacity on
 * an identical fill did not.
 *
 * Two geometries rather than one scaled canvas: scaling the desktop viewBox
 * down to a 360px phone would render 13px labels at ~6px. The narrow geometry
 * keeps the phase bands and the full current-stage treatment but drops the
 * branch topics, which live in the step brief. See DESIGN.md "Roadmap canvas".
 */

export type ForkConfig = {
  note: string;
  local: { title: string; subtitle: string };
  global: { title: string; subtitle: string };
};

const PAD_TOP = 20;
const FORK_H = 214;
/** Vertical space one branch topic occupies. */
const TOPIC = 42;
/** Gap between a stage node's edge and its topic column. */
const ARM = 80;

type NodeState = "done" | "active" | "next" | "todo" | "soon";

function stateOf(m: Milestone): NodeState {
  if (m.comingSoon) return "soon";
  if (m.status === "complete") return "done";
  if (m.status === "active") return "active";
  // "next" used to collapse into "upcoming", which meant the one stage a
  // learner should start had no drawing of its own. It gets its own tint now.
  if (m.status === "next") return "next";
  return "todo";
}

/** Approximate advance width. Deliberately not measured: the server renders
 *  this SVG too, and a layout that depends on a browser measurement would
 *  shift on hydration. */
const stageWidth = (t: string) => Math.max(206, Math.round(t.length * 7.6) + 54);
const topicWidth = (t: string) => Math.max(100, Math.round(t.length * 6.8) + 24);

/** Cubic bezier from the spine edge out to a topic, roadmap.sh style. */
function branchPath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

/** Wrap a label to at most two lines without measuring text. */
function wrap(text: string, max: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((`${cur} ${w}`).trim().length > max && cur) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = `${cur} ${w}`;
    }
  }
  if (cur.trim()) lines.push(cur.trim());
  if (lines.length <= 2) return lines;
  return [lines[0], `${lines.slice(1).join(" ").slice(0, max - 1)}…`];
}

/** Consecutive stages sharing a phase become one band. Stages with no phase
 *  produce no band, so a track that has not been grouped still renders. */
function phaseRuns(milestones: Milestone[]) {
  const runs: { name: string; from: number; to: number }[] = [];
  milestones.forEach((m, i) => {
    const last = runs[runs.length - 1];
    if (m.phase && last && last.name === m.phase && last.to === i - 1) last.to = i;
    else if (m.phase) runs.push({ name: m.phase, from: i, to: i });
  });
  return runs;
}

/**
 * Completed *topic* marker. Topics are 32px sub-items hanging off a stage, so
 * they keep the plain check: an emblem here would be too large for the node
 * and would double-claim the stage's own achievement.
 */
function CheckBubble({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 8},${y - 8})`} aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="var(--node-done-border)" stroke="var(--surface)" strokeWidth="2" />
      <path d="M4.6 8.2 L6.9 10.5 L11.4 5.8" fill="none" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/**
 * The earned emblem for a completed stage, drawn natively in the canvas SVG.
 *
 * A check says "done"; the emblem says which stage was cleared, which is the
 * difference between a progress indicator and a map that records a journey.
 */
function StageEmblem({ kind, x, y }: { kind: EmblemKey; x: number; y: number }) {
  const shape = EMBLEM_SHAPES[kind];
  const D = 30;
  return (
    <g transform={`translate(${x - D / 2},${y - D / 2})`} aria-hidden="true">
      <circle cx={D / 2} cy={D / 2} r={D / 2 + 2} fill="var(--surface)" />
      <g transform={`scale(${D / 64})`}>
        <path d={shape.shell} fill={shape.hue} />
        <path d={shape.shell} fill="none" stroke="var(--em-ink)" strokeWidth="3" strokeLinejoin="round" />
        <g dangerouslySetInnerHTML={{ __html: shape.glyph }} />
      </g>
    </g>
  );
}

/**
 * "You are here", centred above the current stage with a tail pointing at it.
 *
 * Above, because the left and right gutters are occupied by topic columns —
 * the space over the node is the only reliably empty zone in the row. Marked
 * aria-hidden: the stage's own aria-label already states it is in progress,
 * and repeating it would double-speak on every focus.
 */
function HereMarker({ cx, top, label }: { cx: number; top: number; label: string }) {
  const w = Math.max(112, label.length * 7.4 + 30);
  const h = 26;
  const x = cx - w / 2;
  const y = top - h - 11;
  return (
    <g aria-hidden="true" className="rm-here">
      <rect x={x} y={y} width={w} height={h} rx={13} />
      <path d={`M${cx - 7} ${y + h} L${cx} ${y + h + 9} L${cx + 7} ${y + h} Z`} />
      <text x={cx} y={y + 17.5} textAnchor="middle">{label}</text>
    </g>
  );
}

/** SSR-safe viewport match. Server and first client paint agree on the narrow
 *  geometry, which is also the correct default for this product's audience. */
const WIDE_QUERY = "(min-width: 860px)";

function useWideViewport() {
  const subscribe = useCallback((cb: () => void) => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
    const mq = window.matchMedia(WIDE_QUERY);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  }, []);
  return useSyncExternalStore(
    subscribe,
    // matchMedia is absent in jsdom and in a few old mobile browsers. Falling
    // back to the narrow geometry is the safe default for this audience.
    () => (typeof window.matchMedia === "function" ? window.matchMedia(WIDE_QUERY).matches : false),
    () => false,
  );
}

export function RoadmapCanvas({
  milestones,
  selectedKey,
  onSelect,
  fork,
  labels,
}: {
  milestones: Milestone[];
  selectedKey: string;
  /** Receives the node element too, so the caller can return focus to it. */
  onSelect: (key: string, trigger: SVGGElement) => void;
  fork?: ForkConfig;
  labels: {
    stage: string;
    verified: string;
    inProgress: string;
    upcoming: string;
    comingSoon: string;
    youAreHere: string;
    phase: string;
  };
}) {
  const wide = useWideViewport();
  const runs = phaseRuns(milestones);

  // ---- row model: every row is sized by what it actually carries ----
  const SH = wide ? 58 : 62;
  const rows = milestones.map((m) => {
    const dense = wide ? Math.max((m.left ?? []).length, (m.right ?? []).length) : 0;
    return (wide ? 74 + dense * TOPIC + 16 : 104);
  });
  // The first row of a phase needs clearance so the band's label never lands
  // on that row's topic headings.
  runs.forEach((r) => { rows[r.from] += wide ? 52 : 34; });

  const centers: number[] = [];
  let acc = PAD_TOP;
  rows.forEach((h) => { centers.push(acc + h / 2); acc += h; });

  // ---- canvas width follows the widest row, so nothing is ever clipped ----
  const widest = milestones.reduce((max, m) => {
    const sw = wide ? stageWidth(m.title) : 292;
    if (!wide) return Math.max(max, sw);
    const lw = Math.max(0, ...(m.left ?? []).map(topicWidth));
    const rw = Math.max(0, ...(m.right ?? []).map(topicWidth));
    return Math.max(max, sw + 2 * ARM + lw + rw);
  }, 0);
  const W = wide ? Math.max(1000, widest + 72) : 328;
  const CX = W / 2;

  const showFork = Boolean(fork) && wide;
  const height = acc + (showFork ? FORK_H : 40);

  const activeIdx = milestones.findIndex((m) => stateOf(m) === "active");
  // Everything up to the current stage is ground already covered, so the spine
  // is drawn solid there and dotted beyond it. Distance travelled is a fact
  // the map should state, not something to infer from counting green boxes.
  const travelledTo = activeIdx >= 0 ? centers[activeIdx] : centers[0];

  const statusLabel = (s: NodeState) =>
    s === "done" ? labels.verified
      : s === "active" ? labels.inProgress
        : s === "soon" ? labels.comingSoon
          : labels.upcoming;

  // ---- phase bands: painted first, they are ground, not content ----
  const bands = runs.map((r) => {
    const top = centers[r.from] - rows[r.from] / 2 + 4;
    const bottom = centers[r.to] + rows[r.to] / 2 - 4;
    const lit = activeIdx >= 0 && activeIdx >= r.from && activeIdx <= r.to;
    return (
      <g key={`phase-${r.name}-${r.from}`} aria-hidden="true" className={`rm-phase${lit ? " lit" : ""}`}>
        <rect x={wide ? 26 : 8} y={top} width={W - (wide ? 52 : 16)} height={bottom - top} rx={12} />
        <text x={wide ? 46 : 22} y={top + 24}>{r.name.toUpperCase()}</text>
      </g>
    );
  });

  // ---- connectors: painted before nodes so nodes sit above them ----
  const connectors: React.ReactNode[] = [
    <path key="spine-done" className="rm-spine travelled" d={`M${CX} ${centers[0]} L${CX} ${travelledTo}`} />,
    <path key="spine-todo" className="rm-spine ahead" d={`M${CX} ${travelledTo} L${CX} ${centers[centers.length - 1]}`} />,
  ];

  const nodes: React.ReactNode[] = [];
  const rowTints: React.ReactNode[] = [];

  milestones.forEach((m, i) => {
    const st = stateOf(m);
    const cy = centers[i];
    const sw = wide ? stageWidth(m.title) : 292;
    const sx = CX - sw / 2;
    const sy = cy - SH / 2;
    const selected = m.key === selectedKey;
    const lines = wrap(m.title, wide ? 40 : 30);

    // The current row is tinted across the full canvas so the eye lands on the
    // row before it lands on the node.
    if (st === "active") {
      rowTints.push(
        <rect
          key="row-tint"
          className="rm-row-now"
          x={wide ? 26 : 8}
          y={cy - rows[i] / 2 + 8}
          width={W - (wide ? 52 : 16)}
          height={rows[i] - 16}
          rx={12}
          aria-hidden="true"
        />,
      );
    }

    // ---- branch topics (wide only) ----
    const left = wide ? (m.left ?? []) : [];
    const right = wide ? (m.right ?? []) : [];
    // Left topics are right-aligned against the stage, so their heading hangs
    // off the widest one. The right column starts at a fixed offset, so it
    // needs no such measurement.
    const lw = Math.max(0, ...left.map(topicWidth));

    const topicRow = (items: string[], side: "left" | "right") => {
      const spread = (items.length - 1) * TOPIC;
      items.forEach((label, j) => {
        const y = cy - spread / 2 + j * TOPIC;
        const w = topicWidth(label);
        const x = side === "left" ? sx - ARM - w : sx + sw + ARM;
        connectors.push(
          <path
            key={`c-${side}-${m.key}-${j}`}
            className={`rm-connector ${st}`}
            d={side === "left" ? branchPath(sx, cy, x + w, y) : branchPath(sx + sw, cy, x, y)}
          />,
        );
        nodes.push(
          <g key={`${side}-${m.key}-${j}`} className={`rm-node rm-topic ${st}`} aria-hidden="true">
            <rect className="rm-body" x={x} y={y - 16} width={w} height={32} rx={6} />
            <text className="rm-node-label" x={x + w / 2} y={y + 4.5} textAnchor="middle">{label}</text>
            {st === "done" ? <CheckBubble x={x + w - 3} y={y - 13} /> : null}
          </g>,
        );
      });
    };

    // Cluster headings: leftLabel / rightLabel have been authored in
    // career-tracks.ts all along and were never drawn. They are the cheapest
    // hierarchy available — two words that say what a column of topics is for.
    if (wide) {
      const headTop = cy - Math.max((left.length - 1) * TOPIC, (right.length - 1) * TOPIC) / 2 - 30;
      if (m.leftLabel && left.length) {
        nodes.push(
          <text key={`gl-${m.key}`} className={`rm-cluster ${st}`} x={sx - ARM - lw} y={headTop} aria-hidden="true">
            {m.leftLabel.toUpperCase()}
          </text>,
        );
      }
      if (m.rightLabel && right.length) {
        nodes.push(
          <text key={`gr-${m.key}`} className={`rm-cluster ${st}`} x={sx + sw + ARM} y={headTop} aria-hidden="true">
            {m.rightLabel.toUpperCase()}
          </text>,
        );
      }
    }

    // ---- the stage node itself ----
    // DOM order is stage, then left, then right, matching reading order for
    // screen readers. The topics are aria-hidden; the step brief carries them.
    nodes.push(
      <g
        key={`stage-${m.key}`}
        className={`rm-node rm-stage ${st}${selected ? " selected" : ""}`}
        role="button"
        tabIndex={st === "soon" ? -1 : 0}
        data-node-key={m.key}
        // The node opens the step brief in a dialog, so it reports what it
        // opens and whether that thing is open — not a pressed toggle state.
        aria-haspopup="dialog"
        aria-expanded={st === "soon" ? undefined : selected}
        aria-disabled={st === "soon" || undefined}
        aria-label={
          `${m.phase ? `${labels.phase} ${m.phase}. ` : ""}` +
          `${labels.stage} ${m.order}: ${m.title}. ${statusLabel(st)}` +
          `${st === "active" ? `. ${labels.youAreHere}` : ""}`
        }
        onClick={(e) => st !== "soon" && onSelect(m.key, e.currentTarget)}
        onKeyDown={(e) => {
          if (st === "soon") return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(m.key, e.currentTarget);
          }
        }}
      >
        <rect className="rm-body" x={sx} y={sy} width={sw} height={SH} rx={7} />
        <text className="rm-stage-num" x={CX} y={sy + 19} textAnchor="middle">
          {labels.stage.toUpperCase()} {m.order}
        </text>
        {lines.length === 1 ? (
          <text className="rm-stage-label" x={CX} y={sy + 41} textAnchor="middle">{lines[0]}</text>
        ) : (
          <>
            <text className="rm-stage-label" x={CX} y={sy + 36} textAnchor="middle">{lines[0]}</text>
            <text className="rm-stage-label" x={CX} y={sy + 51} textAnchor="middle">{lines[1]}</text>
          </>
        )}
        {st === "done" ? (
          <StageEmblem kind={emblemForStage(i, milestones.length)} x={sx + sw - 4} y={sy + 4} />
        ) : null}
      </g>,
    );

    topicRow(left, "left");
    topicRow(right, "right");

    if (st === "active") nodes.push(<HereMarker key="here" cx={CX} top={sy} label={labels.youAreHere} />);
  });

  // ---- the fork ----
  let forkNodes: React.ReactNode = null;
  if (showFork && fork) {
    const fy = acc - 30;
    const noteY = fy + 22;
    const tY = fy + 104;
    const TW = 250;
    const TH = 64;
    const lx = CX - 24 - TW;
    const rx = CX + 24;
    forkNodes = (
      <g className="rm-fork">
        <path d={`M${CX} ${fy - 24} L${CX} ${fy + 2}`} className="rm-spine ahead" />
        <text className="rm-fork-note" x={CX} y={noteY + 5} textAnchor="middle">{fork.note}</text>
        <path d={branchPath(CX, noteY + 16, lx + TW / 2, tY)} className="rm-connector local" />
        <path d={branchPath(CX, noteY + 16, rx + TW / 2, tY)} className="rm-connector global" />
        <g className="rm-track local" aria-label={`${fork.local.title}. ${fork.local.subtitle}`}>
          <rect x={lx} y={tY} width={TW} height={TH} rx={6} />
          <text className="rm-track-title" x={lx + TW / 2} y={tY + 27} textAnchor="middle">{fork.local.title}</text>
          <text className="rm-track-sub" x={lx + TW / 2} y={tY + 46} textAnchor="middle">{fork.local.subtitle}</text>
        </g>
        <g className="rm-track global" aria-label={`${fork.global.title}. ${fork.global.subtitle}`}>
          <rect x={rx} y={tY} width={TW} height={TH} rx={6} />
          <text className="rm-track-title" x={rx + TW / 2} y={tY + 27} textAnchor="middle">{fork.global.title}</text>
          <text className="rm-track-sub" x={rx + TW / 2} y={tY + 46} textAnchor="middle">{fork.global.subtitle}</text>
        </g>
      </g>
    );
  }

  return (
    <svg className="roadmap-svg" viewBox={`0 0 ${W} ${height}`} width={W} height={height} role="presentation">
      {bands}
      {rowTints}
      <g aria-hidden="true">{connectors}</g>
      {nodes}
      {forkNodes}
    </svg>
  );
}
