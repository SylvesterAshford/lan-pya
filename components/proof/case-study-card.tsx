import { ArrowRight, Clock3, FileEdit } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Emblem } from "@/components/app/emblem";

/**
 * A piece of finished work, in the same vocabulary as the Missions list and
 * the roadmap: the rosette for verified work, then tags for when it was
 * verified, which stage it proves and on which path, the mission title, the
 * stage's name, and a way back to the mission itself.
 *
 * Three states that must never be mistaken for each other. Verified means a
 * human reviewed the work; in review means it was submitted and nobody has
 * looked yet; draft means it has not been sent. Only the first is evidence, so
 * only the first wears the rosette, and each state says its name in words.
 *
 * `summary` is the mission's own authored brief, not a sentence about the
 * learner's project; it is null when the mission has none, and then nothing
 * is shown rather than an apology.
 */

export type CaseStudyState = "verified" | "in_review" | "draft";

export type CaseStudyItem = {
  id: string;
  title: string;
  /** "JavaScript programming": the stage this mission proves. */
  stageTitle: string | null;
  /** "Stage 4", already localised. */
  stageTag: string | null;
  /** The mission's path, already localised. */
  pathTitle: string | null;
  summary: string | null;
  competencies: string[];
  state: CaseStudyState;
  /** "Verified Oct 15, 2026" or the submission's state, already localised. */
  dateLabel: string;
  href: string;
  isDemo: boolean;
};

export type CaseStudyLabels = {
  verified: string;
  inReview: string;
  draft: string;
  viewMission: string;
  viewSubmission: string;
  openDraft: string;
  demo: string;
};

export function CaseStudyCard({ item, labels }: { item: CaseStudyItem; labels: CaseStudyLabels }) {
  const action = item.state === "verified" ? labels.viewMission : item.state === "in_review" ? labels.viewSubmission : labels.openDraft;

  return (
    <article className={`case-card is-${item.state}`}>
      <header className="case-card-top">
        {/* The rosette belongs to verification alone. An unreviewed submission
            wearing it would be the whole product lying at a glance. */}
        {item.state === "verified" ? (
          <Emblem kind="verified" size={40} className="case-card-seal" />
        ) : (
          <span className="case-card-mark" aria-hidden="true">
            {item.state === "in_review" ? <Clock3 size={18} /> : <FileEdit size={18} />}
          </span>
        )}
        <span className="mission-tags">
          <span className={`mission-tag ${item.state === "verified" ? "verified" : "path"}`}>{item.dateLabel}</span>
          {item.stageTag ? <span className="mission-tag stage">{item.stageTag}</span> : null}
          {item.pathTitle ? <span className="mission-tag path">{item.pathTitle}</span> : null}
          {item.isDemo ? <span className="mission-tag demo">{labels.demo}</span> : null}
        </span>
      </header>

      <h3 className="case-title">{item.title}</h3>
      {item.stageTitle ? <p className="case-stage">{item.stageTitle}</p> : null}
      {item.summary ? <p className="case-summary">{item.summary}</p> : null}

      {item.competencies.length ? (
        <ul className="case-chips">
          {item.competencies.map((competency) => <li key={competency}>{competency}</li>)}
        </ul>
      ) : null}

      <footer className="case-card-foot">
        <Link className="case-action" href={item.href}>
          {action}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}
