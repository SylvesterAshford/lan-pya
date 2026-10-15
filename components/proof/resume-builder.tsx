"use client";

import { useMemo, useState } from "react";
import { Check, Columns2, FileText, Printer, Route, Rows3 } from "lucide-react";
import { buildResumeDraft, type ResumeBullet, type ResumeSource } from "@/lib/domain/resume-draft";
import { ResumeDraftDialog } from "@/components/proof/resume-draft-dialog";
import { RESUME_TEMPLATES, ResumeSheet, type ResumeLabels, type ResumeProfile, type ResumeTemplate } from "@/components/proof/resume-sheet";
import { ScaledSheet } from "@/components/proof/scaled-sheet";
import { toMyanmarDigits } from "@/lib/domain/deadlines";

const TEMPLATE_ICONS: Record<ResumeTemplate, typeof Columns2> = { modern: Columns2, classic: Rows3, trail: Route };

/**
 * Proof-to-Resume Builder.
 *
 * Pick verified work on the left and the page on the right redraws as you go,
 * in the layout you choose. "Edit and save as PDF" opens the same page full
 * size, where the role, the profile and every line can be edited before the
 * browser prints it. Three properties are load-bearing:
 *
 * - Only verified proof can be selected. Work in review is not evidence yet.
 * - Every line names the mission and the review it came from, on the page.
 * - Nothing is inferred. See lib/domain/resume-draft.ts for what each clause
 *   traces back to; the profile paragraph starts empty and is the learner's.
 *
 * Export is print-to-PDF, so the file is made on the device and never
 * uploaded. Edits live in this component: closing the editor keeps them.
 */
export function ResumeBuilder({
  locale,
  profile,
  defaultRole,
  items,
  labels,
}: {
  locale: string;
  profile: ResumeProfile;
  defaultRole: string;
  /** Verified proof only, placed on its path — the caller filters. */
  items: ResumeSource[];
  labels: ResumeLabels;
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));

  const [selected, setSelected] = useState<string[]>([]);
  const [template, setTemplate] = useState<ResumeTemplate>("modern");
  const [role, setRole] = useState(defaultRole);
  const [summary, setSummary] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const draft = useMemo(() => buildResumeDraft(locale, items, selected), [locale, items, selected]);
  // A line the learner rewrote keeps their words if they untick and tick it again.
  const bullets: ResumeBullet[] = draft.bullets.map((bullet) => (edits[bullet.id] !== undefined ? { ...bullet, text: edits[bullet.id] } : bullet));

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  }

  const sheet = (editing: boolean) => (
    <ResumeSheet
      id={editing ? "resume-sheet" : undefined}
      template={template}
      locale={locale}
      labels={labels}
      profile={profile}
      role={role}
      summary={summary}
      bullets={bullets}
      skills={draft.skills}
      editing={editing ? {
        onRole: setRole,
        onSummary: setSummary,
        onBullet: (id, text) => setEdits((current) => ({ ...current, [id]: text })),
      } : undefined}
    />
  );

  const templatePicker = (name: string, compact = false) => (
    <div className={`resume-templates${compact ? " compact" : ""}`} role="radiogroup" aria-label={labels.templates.label}>
      {RESUME_TEMPLATES.map((key) => {
        const Icon = TEMPLATE_ICONS[key];
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={template === key}
            name={name}
            className={template === key ? "on" : ""}
            onClick={() => setTemplate(key)}
          >
            <Icon size={18} aria-hidden="true" />
            <span className="resume-template-name">{labels.templates[key]}</span>
            {compact ? null : <small>{labels.templateHints[key]}</small>}
          </button>
        );
      })}
    </div>
  );

  if (!items.length) {
    return (
      <section className="resume-block">
        <h2 className="resume-title"><FileText size={18} aria-hidden="true" />{labels.title}</h2>
        <p className="resume-empty">{labels.empty}</p>
      </section>
    );
  }

  return (
    <section className="resume-block" aria-labelledby="resume-builder-title">
      <header className="resume-head">
        <h2 className="resume-title" id="resume-builder-title"><FileText size={18} aria-hidden="true" />{labels.title}</h2>
        <p className="resume-intro">{labels.intro}</p>
      </header>

      <div className="resume-layout">
        <div className="resume-controls">
          <ul className="resume-picks">
            {items.map((item) => {
              const on = selected.includes(item.id);
              return (
                <li key={item.id}>
                  <label className={on ? "on" : ""}>
                    <input type="checkbox" checked={on} onChange={() => toggle(item.id)} />
                    <span className="resume-pick-box" aria-hidden="true">{on ? <Check size={13} /> : null}</span>
                    <span className="resume-pick-copy">
                      {item.stageLabel ? <span className="mission-tag stage">{item.stageLabel}</span> : null}
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
            {selected.length < items.length ? (
              <button type="button" className="text-link" onClick={() => setSelected(items.map((item) => item.id))}>{labels.selectAll}</button>
            ) : null}
            {selected.length ? (
              <button type="button" className="text-link" onClick={() => setSelected([])}>{labels.clear}</button>
            ) : null}
          </div>

          <div className="resume-template-field">
            <span className="resume-field-label">{labels.templates.label}</span>
            {templatePicker("resume-template")}
          </div>

          <button type="button" className="button primary resume-open" onClick={() => setOpen(true)} disabled={!selected.length}>
            <Printer size={16} aria-hidden="true" />{labels.openEditor}
          </button>
          {!selected.length ? <p className="resume-hint">{labels.noneSelected}</p> : null}
        </div>

        <div className="resume-preview">
          <span className="resume-field-label">{labels.previewLabel}</span>
          <ScaledSheet label={`${labels.previewLabel}: ${labels.templates[template]}`}>{sheet(false)}</ScaledSheet>
        </div>
      </div>

      {open ? (
        <ResumeDraftDialog title={labels.draftHeading} closeLabel={labels.close} onClose={() => setOpen(false)}>
          <div className="resume-editor">
            <div className="resume-editor-bar">
              {templatePicker("resume-template-editor", true)}
              <button type="button" className="button primary compact" onClick={() => window.print()}>
                <Printer size={15} aria-hidden="true" />{labels.print}
              </button>
            </div>
            <p className="resume-edit-hint">{labels.editHint}</p>
            <div className="resume-editor-page">{sheet(true)}</div>
            <div className="resume-export">
              <small>{labels.printNote}</small>
              <small className="resume-docx">{labels.docxNote}</small>
            </div>
          </div>
        </ResumeDraftDialog>
      ) : null}
    </section>
  );
}
