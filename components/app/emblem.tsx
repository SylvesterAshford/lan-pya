import type { EmblemKey } from "@/lib/domain/progress";

/**
 * Stage emblems.
 *
 * Each emblem is a DIFFERENT SILHOUETTE, not a shared circle with a swapped
 * glyph. Five icons in five coloured circles is the single most recognisable
 * AI-generated layout, and it would also break DESIGN.md colour rule 7 by
 * leaving hue as the only thing distinguishing one emblem from another.
 * Shape carries the identity; colour reinforces it. The marks stay legible in
 * greyscale, at 24px on a roadmap node, and to a colour-blind learner.
 *
 * Every emblem carries a 2.2px `--em-ink` outline. That outline is structural,
 * not decoration: `--em-5` on white is roughly 2.6:1, below the 3:1 WCAG 2.2
 * minimum for graphical objects. The dark boundary is what carries contrast,
 * so the fill is free to be a colour that reads well rather than one chosen to
 * pass a ratio it does not need to pass alone.
 */

export type EmblemShape = { shell: string; glyph: string; hue: string };

/** Exported so the roadmap canvas can draw the same marks natively inside its
 *  own SVG rather than keeping a second copy of the path data in sync. */
export const EMBLEM_SHAPES: Record<EmblemKey, EmblemShape> = {
  // Broad, ground-hugging pentagon: a base you build on.
  foundations: {
    hue: "var(--em-1)",
    shell: "M32 7 L58 26 L48 58 L16 58 L6 26 Z",
    glyph: '<path d="M18 45 h28 M24 45 V33 M32 45 V25 M40 45 V37" stroke="#fff" stroke-width="4.4" stroke-linecap="round" fill="none"/>',
  },
  // Squared block with a cut corner: something assembled.
  build: {
    hue: "var(--em-2)",
    shell: "M7 11 H44 L57 24 V57 H7 Z",
    glyph: '<path d="M19 41 L28 29 L36 37 L45 23" stroke="#fff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  },
  // Diamond on its point: turned to be looked at.
  review: {
    hue: "var(--em-3)",
    shell: "M32 3 L61 32 L32 61 L3 32 Z",
    glyph: '<circle cx="29" cy="29" r="9.5" stroke="#fff" stroke-width="4.2" fill="none"/><path d="M36 36 L45 45" stroke="#fff" stroke-width="4.6" stroke-linecap="round"/>',
  },
  // Tall narrow tower, deliberately far from the wide pentagon: at 24px in
  // greyscale a regular hexagon and a pentagon are the same blob, which the
  // silhouette test caught before this shipped.
  capstone: {
    hue: "var(--em-4)",
    shell: "M32 2 L50 14 V50 L32 62 L14 50 V14 Z",
    glyph: '<path d="M23 45 L32 19 L41 45 Z" stroke="#fff" stroke-width="4" stroke-linejoin="round" fill="none"/><path d="M26 36 h12" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>',
  },
  // Rosette: the only emblem with a broken outline, so verification reads as
  // different in kind from the stages that lead to it.
  verified: {
    hue: "var(--em-5)",
    shell: "M32 2 L40 10 L51 8 L54 19 L63 26 L57 36 L60 47 L49 51 L43 61 L32 57 L21 61 L15 51 L4 47 L7 36 L1 26 L10 19 L13 8 L24 10 Z",
    glyph: '<path d="M22 33 L29 40 L43 24" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  },
};

export function Emblem({
  kind,
  size = 40,
  earned = true,
  className,
}: {
  kind: EmblemKey;
  size?: number;
  earned?: boolean;
  className?: string;
}) {
  const shape = EMBLEM_SHAPES[kind];
  return (
    <svg
      className={`emblem${earned ? "" : " is-locked"}${className ? ` ${className}` : ""}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <path d={shape.shell} fill={shape.hue} />
      <path d={shape.shell} fill="none" stroke="var(--em-ink)" strokeWidth="2.2" strokeLinejoin="round" />
      <g dangerouslySetInnerHTML={{ __html: shape.glyph }} />
    </svg>
  );
}

/**
 * Level insignia — a hexagon carrying the level numeral.
 *
 * Deliberately not one of the five stage shapes. A level and a stage are
 * different claims, so they must not share a silhouette; the numeral removes
 * any remaining ambiguity.
 */
export function LevelInsignia({ rank, hue, size = 56 }: { rank: number; hue: 1 | 2 | 3 | 4 | 5; size?: number }) {
  return (
    <svg className="insignia" width={size} height={size} viewBox="0 0 64 64" role="presentation" aria-hidden="true" focusable="false">
      <path d="M32 4 L56 18 V46 L32 60 L8 46 V18 Z" fill={`var(--em-${hue})`} />
      <path d="M32 4 L56 18 V46 L32 60 L8 46 V18 Z" fill="none" stroke="var(--em-ink)" strokeWidth="2.4" strokeLinejoin="round" />
      <text x="32" y="42" textAnchor="middle" fontSize="24" fontWeight="800" fill="#fff">{rank}</text>
    </svg>
  );
}
