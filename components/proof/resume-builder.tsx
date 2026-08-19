"use client";

import { useMemo, useState } from "react";
import { Check, FileText, Printer, RotateCcw } from "lucide-react";
import { buildResumeDraft, type ResumeBullet } from "@/lib/domain/resume-draft";
import { ResumeDraftDialog } from "@/components/proof/resume-draft-dialog";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { ProofItem } from "@/lib/domain/types";

/**
 * Proof-to-Resume Builder.
 *
 * Pick verified evidence, get a draft assembled from it, edit every line, then
 * print it. Three properties are load-bearing:
 *
 * - Only verified proof can be selected. Work in review is not evidence yet.
 * - Every bullet shows the mission it came from, on the line, at all times.
 *   The source is not a tooltip or a footnote; it is how the reader checks it.
 * - Nothing is inferred. See lib/domain/resume-draft.ts for what each clause
 *   traces back to.
 *
 * Export is print-to-PDF: the browser's own dialog, so the file never leaves
 * the device and nothing needs uploading to produce it. DOCX is deliberately
 * not here yet — it needs a document library, and the workflow should be worth
 * keeping before we add one.
 */

export function ResumeBuilder({
  locale,
  alias,
  headline,
  items,
  labels,
}: {
  locale: string;
  alias: string;
  headline: string | null;
  /** Verified proof only — the caller filters, this component states why. */
  items: ProofItem[];
  labels: {
    title: string;
    intro: string;
    selected: string;
    selectedOne: string;
    selectAll: string;
    clear: string;
    build: string;
    rebuild: string;
    empty: string;
    draftTitle: string;
    skillsTitle: string;
    sourceLead: string;
    editHint: string;
    print: string;
    printNote: string;
    docxNote: string;
    noneSelected: string;
    draftHeading: string;
    openDraft: string;
    close: string;
  };
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));

  const [selected, setSelected] = useState<string[]>([]);
  const [bullets, setBullets] = useState<ResumeBullet[] | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  // Separate from `bullets` on purpose: closing the dialog must not throw away
  // a draft the learner has been editing. Closing hides it; "Open draft"
  // brings the same edited text back.
  const [open, setOpen] = useState(false);

  const draft = useMemo(() => buildResumeDraft(locale, items, selected), [locale, items, selected]);

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  }

  function build() {
    setBullets(draft.bullets);
    setSkills(draft.skills);
    setOpen(true);
  }

  function editBullet(id: string, text: string) {
    setBullets((current) => (current ? current.map((bullet) => (bullet.id === id ? { ...bullet, text } : bullet)) : current));
  }

  if (!items.length) {
    return (
      <section className="resume-block">
        <h2 className="resume-title"><FileText size={17} aria-hidden="true" />{labels.title}</h2>
        <p className="resume-empty">{labels.empty}</p>
      </section>
    );
  }

  return (
    <section className="resume-block">
      <h2 className="resume-title"><FileText size={17} aria-hidden="true" />{labels.title}</h2>
      <p className="resume-intro">{labels.intro}</p>

      <ul className="resume-picks">
        {items.map((item) => {
          const on = selected.includes(item.id);
          return (
            <li key={item.id}>
              <label className={on ? "on" : ""}>
                <input type="checkbox" checked={on} onChange={() => toggle(item.id)} />
                <span className="resume-pick-box" aria-hidden="true">{on ? <Check size={13} /> : null}</span>
                <span className="resume-pick-copy">
                  <strong>{item.title}</strong>
                  <small>{item.competencies.join(" · ")}</small>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="resume-actions">
        <span className="resume-selected">
          {(selected.length === 1 ? labels.selectedOne : labels.selected).replace("{n}", num(selected.length))}
        </span>
        <button type="button" className="text-link" onClick={() => setSelected(items.map((item) => item.id))}>
          {labels.selectAll}
        </button>
        {selected.length ? (
          <button type="button" className="text-link" onClick={() => setSelected([])}>{labels.clear}</button>
        ) : null}
        <button type="button" className="button primary compact" onClick={build} disabled={!selected.length}>
          {bullets ? <RotateCcw size={15} aria-hidden="true" /> : null}
          {bullets ? labels.rebuild : labels.build}
        </button>
      </div>

      {!selected.length && !bullets ? <p className="resume-hint">{labels.noneSelected}</p> : null}

      {bullets && !open ? (
        <button type="button" className="text-link resume-reopen" onClick={() => setOpen(true)}>
          {labels.openDraft}
        </button>
      ) : null}

      {bullets && open ? (
        <ResumeDraftDialog title={labels.draftHeading} closeLabel={labels.close} onClose={() => setOpen(false)}>
        <div className="resume-draft">
          {/* The printed region. Everything outside it is a control. */}
          <article className="resume-sheet" id="resume-sheet">
            <header>
              <h3>{alias}</h3>
              {headline ? <p>{headline}</p> : null}
            </header>

            {skills.length ? (
              <section>
                <h4>{labels.skillsTitle}</h4>
                <p className="resume-skills">{skills.join(" · ")}</p>
              </section>
            ) : null}

            <section>
              <h4>{labels.draftTitle}</h4>
              <p className="resume-edit-hint">{labels.editHint}</p>
              <ul className="resume-bullets">
                {bullets.map((bullet) => (
                  <li key={bullet.id}>
                    <textarea
                      value={bullet.text}
                      onChange={(event) => editBullet(bullet.id, event.target.value)}
                      rows={2}
                      aria-label={bullet.sourceTitle}
                    />
                    {/* The source stays on the line, in print as well as on
                        screen. A bullet whose evidence you cannot name is the
                        thing this builder exists to avoid. */}
                    <small className="resume-source">{labels.sourceLead} {bullet.sourceTitle}</small>
                  </li>
                ))}
              </ul>
            </section>
          </article>

          <div className="resume-export">
            <button type="button" className="button primary compact" onClick={() => window.print()}>
              <Printer size={15} aria-hidden="true" />{labels.print}
            </button>
            <small>{labels.printNote}</small>
            <small className="resume-docx">{labels.docxNote}</small>
          </div>
        </div>
        </ResumeDraftDialog>
      ) : null}
    </section>
  );
}
