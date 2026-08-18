import { Cpu, Megaphone, Palette, TrendingUp, Compass, type LucideIcon } from "lucide-react";

/**
 * Arena mark.
 *
 * A small anchor at the head of each path row. Without one the catalog is a
 * flat column of sentences and the eye has nothing to land on when scanning
 * for a group it recognises.
 *
 * Keyed on the arena rather than the path, so every path in a group carries
 * the same mark and the grouping stays legible once rows scroll past their
 * heading. Lucide, ISC licensed, same set as the rest of the app.
 */

const MARKS: Record<string, LucideIcon> = {
  "Technology & Data": Cpu,
  "Stories & Community": Megaphone,
  "Visual Craft": Palette,
  "Business & Growth": TrendingUp,
};

export function ArenaMark({ arena }: { arena: string }) {
  const Mark = MARKS[arena] ?? Compass;
  return <Mark size={18} strokeWidth={1.75} aria-hidden="true" />;
}
