import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Mascot } from "@/components/app/mascot";
import { toMyanmarDigits } from "@/lib/domain/deadlines";

/**
 * Proof growing — the Home panel that answers "what have I actually proved".
 *
 * Every competency here is one the learner's verified proof already carries;
 * the panel receives them already localised and renders exactly what it is
 * given. When the list is empty it says so rather than filling the row with
 * aspirational skills, which is the same rule the opportunity evidence
 * readout follows: an empty list is a fact, not a gap to paper over.
 *
 * The points figure and the level name come from `lib/domain/progress.ts`,
 * where the ladder is resolved with both an XP minimum and an evidence gate.
 * Nothing is computed here, so this panel cannot disagree with the meter.
 *
 * The mascot is the account's own choice. Hardcoding a variant would silently
 * undo the picker on the profile the first time a second character ships.
 */
export function ProofPanel({
  locale,
  competencies,
  points,
  levelName,
  mascotVariant,
  labels,
}: {
  locale: string;
  competencies: string[];
  points: number;
  levelName: string;
  mascotVariant: string;
  labels: { title: string; viewProof: string; points: string; body: string; empty: string };
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));
  // Callers may pass either a template ("{n} points") or a bare unit noun.
  // Both are localised strings owned by the caller; neither is assembled here.
  const pointsText = labels.points.includes("{n}")
    ? labels.points.replace("{n}", num(points))
    : `${num(points)} ${labels.points}`;

  return (
    <section className="proofp">
      <header className="proofp-head">
        <h2>
          <ShieldCheck size={18} aria-hidden="true" />
          {labels.title}
        </h2>
        <Link className="proofp-link" href="/app/proof">
          {labels.viewProof}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </header>

      {competencies.length ? (
        <ul className="proofp-chips">
          {competencies.map((competency) => (
            <li key={competency} className="proofp-chip">
              <BadgeCheck size={13} aria-hidden="true" />
              {competency}
            </li>
          ))}
        </ul>
      ) : (
        <p className="proofp-empty">{labels.empty}</p>
      )}

      <div className="proofp-score">
        <Mascot size={44} variant={mascotVariant} />
        <p className="proofp-figures">
          <span className="proofp-points">{pointsText}</span>
          <span className="proofp-level">{levelName}</span>
        </p>
      </div>

      <p className="proofp-body">{labels.body}</p>
    </section>
  );
}
