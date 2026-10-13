import { Check } from "lucide-react";
import type { PathAvailabilityLabel } from "@/lib/domain/career-recommendations";

type StepState = "done" | "partial" | "todo";

/**
 * How far a path has been built, as three steps: the roadmap is mapped, a
 * mission exists, and the path is open to start.
 *
 * Derived only from the path's availability, so a row can never claim more
 * than the data says. A pilot is "open" with limited places, shown as a half
 * step with its own word, never by colour alone.
 */
export function readinessOf(state: PathAvailabilityLabel): [StepState, StepState, StepState] {
  switch (state) {
    case "operational": return ["done", "done", "done"];
    case "controlled_pilot": return ["done", "done", "partial"];
    case "no_missions_yet": return ["done", "todo", "todo"];
    default: return ["todo", "todo", "todo"];
  }
}

export function ReadinessSteps({
  state,
  labels,
}: {
  state: PathAvailabilityLabel;
  labels: { readiness: string; roadmap: string; missions: string; open: string; pilot: string; done: string; partial: string; notYet: string };
}) {
  const steps = readinessOf(state);
  const names = [labels.roadmap, labels.missions, state === "controlled_pilot" ? labels.pilot : labels.open];
  const spoken = (s: StepState) => (s === "done" ? labels.done : s === "partial" ? labels.partial : labels.notYet);

  return (
    <ol className="readiness" aria-label={labels.readiness}>
      {steps.map((step, index) => (
        <li key={names[index]} className={`readiness-step is-${step}`}>
          <span className="readiness-dot" aria-hidden="true">
            {step === "done" ? <Check size={10} strokeWidth={3.5} /> : null}
          </span>
          <span className="readiness-name">{names[index]}</span>
          <span className="sr-only">: {spoken(step)}</span>
        </li>
      ))}
    </ol>
  );
}
