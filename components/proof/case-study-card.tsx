import { ArrowUpRight, Clock3, FileEdit } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Emblem } from "@/components/app/emblem";

/**
 * A completed mission, presented as a case study.
 *
 * Three states that must never be mistaken for each other. Verified means a
 * human reviewed the work; in review means it has been submitted and nobody
 * has looked yet; draft means it has not even been sent. Only the first is
 * evidence, so only the first carries the rosette, and each state says its own
 * name in words as well as colour.
 *
 * `summary` is null when the mission has no authored summary. It renders as a
 * stated absence rather than a sentence invented about somebody's project.
 */

export type CaseStudyState = "verified" | "in_review" | "draft";

export type CaseStudyItem = {
  id: string;
  /** Already localised, e.g. "Frontend · Mission 03". */
  eyebrow: string;
  title: string;
  summary: string | null;
  competencies: string[];
  state: CaseStudyState;
  /** Already localised and formatted by the caller. */
  dateLabel: string;
  href: string;
  isDemo: boolean;
};

export type CaseStudyLabels = {
  verified: string;
  inReview: string;
  draft: string;
  openCase: string;
  viewSubmission: string;
  openDraft: string;
  demo: string;
  noSummary: string;
};

export function CaseStudyCard({
  item,
  labels,
}: {
  item: CaseStudyItem;
  labels: CaseStudyLabels;
}) {
  const stateLabel =
    item.state === "verified" ? labels.verified : item.state === "in_review" ? labels.inReview : labels.draft;
  const action =
    item.state === "verified" ? labels.openCase : item.state === "in_review" ? labels.viewSubmission : labels.openDraft;

  return (
    <article className={`case-card is-${item.state}`}>
      <header className="case-card-top">
        {/* The rosette belongs to verification alone. An unreviewed submission
            wearing it would be the whole product lying at a glance. */}
        {item.state === "verified" ? (
          <Emblem kind="verified" size={34} className="case-card-seal" />
        ) : (
          <span className="case-card-mark" aria-hidden="true">
            {item.state === "in_review" ? <Clock3 size={17} /> : <FileEdit size={17} />}
          </span>
        )}
        <span className={`case-state ${item.state}`}>{stateLabel}</span>
        {item.isDemo ? <span className="case-demo">{labels.demo}</span> : null}
      </header>

      <span className="case-eyebrow">{item.eyebrow}</span>
      <h3 className="case-title">{item.title}</h3>
      <p className={`case-summary${item.summary ? "" : " is-absent"}`}>{item.summary ?? labels.noSummary}</p>

      {item.competencies.length ? (
        <ul className="case-chips">
          {item.competencies.map((competency) => (
            <li key={competency}>{competency}</li>
          ))}
        </ul>
      ) : null}

      <footer className="case-card-foot">
        <small>{item.dateLabel}</small>
        <Link className="case-action" href={item.href}>
          {action}
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}
