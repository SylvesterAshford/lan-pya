"use client";

import { useCallback, useSyncExternalStore } from "react";
import { EMBLEM_SHAPES } from "@/components/app/emblem";
import { emblemForStage, type EmblemKey } from "@/lib/domain/progress";
import type { Milestone } from "@/lib/domain/types";

/**
 * Roadmap canvas — roadmap.sh node graph per Design Specification v1.1 §3.3.
 *
 * Dotted central spine, saturated amber stage nodes on it, pale amber milestone
 * nodes branching one level left and right, curved dotted connectors.
 *
 * Two geometries rather than one scaled canvas: scaling the 780px desktop
 * viewBox down to a 360px phone would render 13px node labels at ~6px. The
 * narrow geometry drops the branches and keeps stage nodes on the spine; the
 * branch skills move into the detail dialog. See DESIGN.md "Roadmap canvas".
 */

export type ForkConfig = {
  note: string;
  local: { title: string; subtitle: string };
  global: { title: string; subtitle: string };
};

type Geometry = {
  W: number;
  CX: number;
  SW: number;
  SH: number;
  MW: number;
  MH: number;
  BLOCK: number;
  GAP: number;
  branches: boolean;
};

const WIDE: Geometry = { W: 780, CX: 390, SW: 260, SH: 54, MW: 190, MH: 36, BLOCK: 152, GAP: 56, branches: true };
const NARROW: Geometry = { W: 328, CX: 164, SW: 292, SH: 62, MW: 0, MH: 0, BLOCK: 104, GAP: 0, branches: false };

const PAD_TOP = 16;
const FORK_H = 214;

type NodeState = "done" | "active" | "todo" | "soon";

function stateOf(m: Milestone): NodeState {
  if (m.comingSoon) return "soon";
  if (m.status === "complete") return "done";
  if (m.status === "active") return "active";
  return "todo";
}

const STAGE_FILL: Record<NodeState, string> = {
  done: "var(--node-done-fill)",
  active: "var(--node-stage)",
  todo: "var(--node-stage)",
  soon: "var(--node-soon-fill)",
};
const MILESTONE_FILL: Record<NodeState, string> = {
  done: "var(--node-done-fill)",
  active: "var(--node-milestone)",
  todo: "var(--node-milestone)",
  soon: "var(--node-soon-fill)",
};
const STROKE: Record<NodeState, string> = {
  done: "var(--node-done-border)",
  active: "var(--node-border)",
  todo: "var(--node-border)",
  soon: "var(--node-soon-border)",
};

/** Cubic bezier from the spine edge out to a branch node, roadmap.sh style. */
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

/**
 * Completed *milestone* marker. Milestones are 36px sub-items hanging off a
 * stage, so they keep the plain check: an emblem here would be too large for
 * the node and would double-claim the stage's own achievement.
 */
function CheckBubble({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 9},${y - 9})`} aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="var(--node-done-border)" stroke="var(--surface)" strokeWidth="2" />
      <path d="M5.2 9.2 L7.8 11.8 L12.8 6.4" fill="none" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/**
 * The earned emblem for a completed stage, drawn natively in the canvas SVG.
 *
 * It replaces a plain check bubble at the same anchor point. A check says
 * "done"; the emblem says which stage was cleared, which is the difference
 * between a progress indicator and a map that records a journey.
 *
 * A white disc sits behind it so the mark stays legible over the teal `done`
 * node fill without needing a second colour ramp per node state.
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
  labels: { stage: string; verified: string; inProgress: string; upcoming: string; comingSoon: string };
}) {
  const wide = useWideViewport();
  const g = wide ? WIDE : NARROW;

  const showFork = Boolean(fork) && wide;
  const height = PAD_TOP + milestones.length * g.BLOCK + (showFork ? FORK_H : 40);

  const spineTop = PAD_TOP + g.BLOCK / 2;
  const spineBottom = PAD_TOP + (milestones.length - 1) * g.BLOCK + g.BLOCK / 2;

  const stageX = g.CX - g.SW / 2;
  const leftX = stageX - g.GAP - g.MW;
  const rightX = stageX + g.SW + g.GAP;

  const centerY = (i: number) => PAD_TOP + i * g.BLOCK + g.BLOCK / 2;
  const branchY = (cy: number, count: number, j: number) =>
    count === 2 ? cy + (j === 0 ? -34 : 34) : cy;

  const statusLabel = (s: NodeState) =>
    s === "done" ? labels.verified : s === "active" ? labels.inProgress : s === "soon" ? labels.comingSoon : labels.upcoming;

  // ---- connectors: painted first so nodes sit above them ----
  const connectors: React.ReactNode[] = [];
  connectors.push(
    <path
      key="spine"
      d={`M${g.CX} ${spineTop} L${g.CX} ${spineBottom}`}
      className="rm-spine"
    />,
  );
  if (g.branches) {
    milestones.forEach((m, i) => {
      const cy = centerY(i);
      (m.left ?? []).forEach((_, j) => {
        const y = branchY(cy, (m.left ?? []).length, j);
        connectors.push(<path key={`cl-${m.key}-${j}`} d={branchPath(stageX, cy, leftX + g.MW, y)} className="rm-connector" />);
      });
      (m.right ?? []).forEach((_, j) => {
        const y = branchY(cy, (m.right ?? []).length, j);
        connectors.push(<path key={`cr-${m.key}-${j}`} d={branchPath(stageX + g.SW, cy, rightX, y)} className="rm-connector" />);
      });
    });
  }

  // ---- nodes: DOM order matches reading order (stage, then left, then right) ----
  const nodes: React.ReactNode[] = [];
  milestones.forEach((m, i) => {
    const st = stateOf(m);
    const cy = centerY(i);
    const sy = cy - g.SH / 2;
    const selected = m.key === selectedKey;
    const lines = wrap(m.title, wide ? 28 : 30);

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
        aria-label={`${labels.stage} ${m.order}: ${m.title}. ${statusLabel(st)}`}
        onClick={(e) => st !== "soon" && onSelect(m.key, e.currentTarget)}
        onKeyDown={(e) => {
          if (st === "soon") return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(m.key, e.currentTarget);
          }
        }}
      >
        {st === "active" ? (
          <rect className="rm-ring" x={stageX - 4} y={sy - 4} width={g.SW + 8} height={g.SH + 8} rx={10} aria-hidden="true" />
        ) : null}
        <rect
          className="rm-body"
          x={stageX}
          y={sy}
          width={g.SW}
          height={g.SH}
          rx={6}
          fill={STAGE_FILL[st]}
          stroke={STROKE[st]}
          strokeWidth={2}
          strokeDasharray={st === "soon" ? "5 4" : undefined}
        />
        <text className="rm-stage-num" x={g.CX} y={sy + 17} textAnchor="middle">
          {labels.stage.toUpperCase()} {m.order}
        </text>
        {lines.length === 1 ? (
          <text className="rm-stage-label" x={g.CX} y={sy + 39} textAnchor="middle">{lines[0]}</text>
        ) : (
          <>
            <text className="rm-stage-label" x={g.CX} y={sy + 34} textAnchor="middle">{lines[0]}</text>
            <text className="rm-stage-label" x={g.CX} y={sy + 49} textAnchor="middle">{lines[1]}</text>
          </>
        )}
        {/* A completed stage carries its earned emblem where the plain check
            bubble used to sit, so the map records what was achieved and not
            only that something was. Same anchor point, so node geometry and
            label centring are untouched. */}
        {st === "done" ? (
          <StageEmblem kind={emblemForStage(i, milestones.length)} x={stageX + g.SW - 4} y={sy + 4} />
        ) : null}
      </g>,
    );

    if (!g.branches) return;

    const branch = (items: string[], x: number, side: "left" | "right") =>
      items.forEach((label, j) => {
        const y = branchY(cy, items.length, j) - g.MH / 2;
        nodes.push(
          <g key={`${side}-${m.key}-${j}`} className={`rm-node rm-milestone ${st}`} aria-hidden="true">
            <rect
              className="rm-body"
              x={x}
              y={y}
              width={g.MW}
              height={g.MH}
              rx={6}
              fill={MILESTONE_FILL[st]}
              stroke={STROKE[st]}
              strokeWidth={1.5}
              strokeDasharray={st === "soon" ? "5 4" : undefined}
            />
            <text className="rm-node-label" x={x + g.MW / 2} y={y + g.MH / 2 + 4.5} textAnchor="middle">
              {label}
            </text>
            {st === "done" ? <CheckBubble x={x + g.MW - 3} y={y + 3} /> : null}
          </g>,
        );
      });

    branch(m.left ?? [], leftX, "left");
    branch(m.right ?? [], rightX, "right");
  });

  // ---- the fork ----
  let forkNodes: React.ReactNode = null;
  if (showFork && fork) {
    const fy = PAD_TOP + milestones.length * g.BLOCK - 30;
    const noteY = fy + 22;
    // Deep enough that the split reads as a fork rather than a flat squiggle.
    const tY = fy + 104;
    const TW = 250;
    const TH = 64;
    const lx = g.CX - 24 - TW;
    const rx = g.CX + 24;
    forkNodes = (
      <g className="rm-fork">
        <path d={`M${g.CX} ${fy - 24} L${g.CX} ${fy + 2}`} className="rm-spine" />
        <text className="rm-fork-note" x={g.CX} y={noteY + 5} textAnchor="middle">{fork.note}</text>
        <path d={branchPath(g.CX, noteY + 16, lx + TW / 2, tY)} className="rm-connector local" />
        <path d={branchPath(g.CX, noteY + 16, rx + TW / 2, tY)} className="rm-connector global" />
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
    <svg className="roadmap-svg" viewBox={`0 0 ${g.W} ${height}`} width={g.W} height={height} role="presentation">
      <g aria-hidden="true">{connectors}</g>
      {nodes}
      {forkNodes}
    </svg>
  );
}
