import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { localizeLevel, type PathProgress } from "@/lib/domain/progress";

/**
 * The Steps ring.
 *
 * Replaces a hexagon holding a digit next to an 8px grey bar. That version
 * failed for a specific reason worth recording: the number and the graphic
 * were unrelated. The hexagon was a container for a numeral, carrying no
 * information the text did not already state, so it read as an icon someone
 * bolted on rather than as the score itself.
 *
 * Duolingo's flame works because the picture and the number are one idea and
 * both change state together. Here the ring IS the score: each dot is a
 * segment of the journey to the next level, filled dots are ground covered.
 * Reading the picture and reading the number give the same answer.
 *
 * The unit is points, not XP. "XP" is borrowed from games and means nothing in
 * a product whose whole metaphor is a map walked by a traveller. Steps belong
 * here, and no competitor uses them. The ladder is unchanged: the thresholds
 * and evidence gates from the founder plan still decide the level.
 *
 * Dots are drawn discretely rather than as a dashed arc because a dashed
 * stroke cannot express partial progress and a dot pattern at the same time.
 */

const DOTS = 36;

export function StepsRing({
  progress,
  locale,
  size = 168,
}: {
  progress: PathProgress;
  locale: string;
  size?: number;
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));
  const filled = Math.round(progress.fraction * DOTS);
  const R = 46;
  const C = 60;

  return (
    <svg
      className="steps-ring"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={
        my
          ? `${localizeLevel(locale, progress.level)} — အမှတ် ${num(progress.xp)}`
          : `${localizeLevel(locale, progress.level)}, ${num(progress.xp)} points`
      }
    >
      {Array.from({ length: DOTS }, (_, i) => {
        // Start at the top and travel clockwise, the way a path is walked.
        const angle = (-90 + i * (360 / DOTS)) * (Math.PI / 180);
        const on = i < filled;
        return (
          <circle
            key={i}
            cx={C + R * Math.cos(angle)}
            cy={C + R * Math.sin(angle)}
            r={on ? 3.4 : 2.4}
            fill={on ? "var(--teal-500)" : "var(--hairline)"}
          />
        );
      })}

      {/* The level mark sits inside the ring, so one glance gives rank and
          distance together rather than making them two separate readings. */}
      <text x={C} y={C - 13} textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="1.2" fill="var(--muted-ink)">
        {localizeLevel(locale, progress.level).toUpperCase()}
      </text>
      <text x={C} y={C + 12} textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)">
        {num(progress.xp)}
      </text>
      <text x={C} y={C + 26} textAnchor="middle" fontSize="10" fontWeight="600" letterSpacing="0.8" fill="var(--muted-ink)">
        {my ? "အမှတ်" : "POINTS"}
      </text>
    </svg>
  );
}
