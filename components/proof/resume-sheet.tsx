"use client";

import { Check, Code, Globe, Link2, Mail, Send } from "lucide-react";
import { Emblem } from "@/components/app/emblem";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { ResumeBullet } from "@/lib/domain/resume-draft";
import type { getAppCopy } from "@/lib/i18n/app-copy";

export type ResumeLabels = ReturnType<typeof getAppCopy>["studio"]["resume"];
export type ResumeTemplate = "modern" | "classic" | "trail";
export const RESUME_TEMPLATES: ResumeTemplate[] = ["modern", "classic", "trail"];

/** Who the résumé is for. Every field comes from the learner's own records. */
export type ResumeProfile = {
  name: string;
  email: string | null;
  /** Shortened links from the learner's Community settings, or null. */
  telegram: string | null;
  linkedin: string | null;
  facebook: string | null;
  pathTitle: string | null;
  /** "Starter · Level 2", already localised. */
  levelLine: string;
  stagesDone: number;
  stagesTotal: number;
};

export type ResumeEditing = {
  onRole: (value: string) => void;
  onSummary: (value: string) => void;
  onBullet: (id: string, value: string) => void;
};

/**
 * The résumé document, in one of three layouts.
 *
 * Modern puts contact, the career path and the verified skills in a navy
 * sidebar beside the projects. Classic is one plain column that hiring
 * systems read well. Trail lays the projects along the stage trail the learner
 * climbed, the way the roadmap does.
 *
 * The same rules hold in all three (lib/domain/resume-draft.ts): only verified
 * work, every line names its mission and review, nothing is inferred. The
 * profile paragraph is empty until the learner writes it, and an empty one is
 * not printed.
 *
 * `editing` turns the role, the profile and each line into fields (the editor
 * dialog); without it the sheet is a picture of the page (the live preview).
 * Fields print as plain text: each one has a print-only copy beside it.
 */
export function ResumeSheet({
  id,
  template,
  locale,
  labels,
  profile,
  role,
  summary,
  bullets,
  skills,
  editing,
}: {
  id?: string;
  template: ResumeTemplate;
  locale: string;
  labels: ResumeLabels;
  profile: ResumeProfile;
  role: string;
  summary: string;
  bullets: ResumeBullet[];
  skills: string[];
  editing?: ResumeEditing;
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));
  const s = labels.sections;

  const contact = [
    profile.email ? { key: "email", icon: <Mail size={13} aria-hidden="true" />, text: profile.email } : null,
    profile.telegram ? { key: "telegram", icon: <Send size={13} aria-hidden="true" />, text: profile.telegram } : null,
    profile.linkedin ? { key: "linkedin", icon: <Link2 size={13} aria-hidden="true" />, text: profile.linkedin } : null,
    profile.facebook ? { key: "facebook", icon: <Link2 size={13} aria-hidden="true" />, text: profile.facebook } : null,
  ].filter((item): item is { key: string; icon: React.ReactElement; text: string } => Boolean(item));

  const initials = profile.name.trim().split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0] ?? "").join("").toUpperCase() || "?";
  const progress = profile.stagesTotal ? Math.min(1, profile.stagesDone / profile.stagesTotal) : 0;

  const roleField = editing ? (
    <>
      <input className="rs-field rs-role screen-only" value={role} onChange={(event) => editing.onRole(event.target.value)} aria-label={labels.roleLabel} />
      <p className="rs-role print-only">{role}</p>
    </>
  ) : role ? <p className="rs-role">{role}</p> : null;

  const summaryBlock = editing ? (
    <section className={`rs-section${summary.trim() ? "" : " rs-empty-print"}`}>
      <h3 className="rs-heading">{s.profile}</h3>
      <textarea
        className="rs-field rs-summary screen-only"
        value={summary}
        rows={3}
        placeholder={labels.summaryPlaceholder}
        onChange={(event) => editing.onSummary(event.target.value)}
        aria-label={labels.summaryLabel}
      />
      <p className="rs-summary print-only">{summary}</p>
    </section>
  ) : summary.trim() ? (
    <section className="rs-section">
      <h3 className="rs-heading">{s.profile}</h3>
      <p className="rs-summary">{summary}</p>
    </section>
  ) : null;

  const contactList = contact.length ? (
    <ul className="rs-contact">
      {contact.map((item) => <li key={item.key}>{item.icon}<span>{item.text}</span></li>)}
    </ul>
  ) : null;

  const pathBlock = profile.pathTitle ? (
    <section className="rs-section rs-path">
      <h3 className="rs-heading">{s.path}</h3>
      <p className="rs-path-title">{profile.pathTitle}</p>
      <p className="rs-path-level">{profile.levelLine}</p>
      <div className="rs-progress" aria-hidden="true"><span style={{ width: `${Math.round(progress * 100)}%` }} /></div>
      <p className="rs-path-count">{labels.pathProgress.replace("{a}", num(profile.stagesDone)).replace("{b}", num(profile.stagesTotal))}</p>
    </section>
  ) : null;

  const skillsBlock = skills.length ? (
    <section className="rs-section">
      <h3 className="rs-heading">{s.skills}</h3>
      <ul className="rs-skills">
        {skills.map((skill) => <li key={skill}><Check size={12} aria-hidden="true" />{skill}</li>)}
      </ul>
    </section>
  ) : null;

  const seal = (
    <div className="rs-seal">
      <Emblem kind="verified" size={30} />
      <span>
        <strong>{labels.seal}</strong>
        <small>{labels.sealNote}</small>
      </span>
    </div>
  );

  const project = (bullet: ResumeBullet, marker?: React.ReactNode) => (
    <li key={bullet.id} className="rs-project">
      {marker}
      <div className="rs-project-body">
        <div className="rs-project-head">
          <h4>{bullet.sourceTitle}</h4>
          <span className="rs-project-date">{labels.verifiedOn.replace("{date}", bullet.sourceVerifiedLabel)}</span>
        </div>
        {bullet.stageLabel || bullet.pathTitle ? (
          <p className="rs-project-meta">{[bullet.pathTitle, bullet.stageLabel].filter(Boolean).join(" · ")}</p>
        ) : null}
        {editing ? (
          <>
            <textarea
              className="rs-field rs-line screen-only"
              value={bullet.text}
              rows={2}
              onChange={(event) => editing.onBullet(bullet.id, event.target.value)}
              aria-label={bullet.sourceTitle}
            />
            <p className="rs-line print-only">{bullet.text}</p>
          </>
        ) : <p className="rs-line">{bullet.text}</p>}
        {bullet.competencies.length ? (
          <ul className="rs-chips">{bullet.competencies.map((item) => <li key={item}>{item}</li>)}</ul>
        ) : null}
        <p className="rs-project-foot">
          {bullet.liveUrl ? <span><Globe size={12} aria-hidden="true" />{labels.live}: {bullet.liveUrl}</span> : null}
          {bullet.codeUrl ? <span><Code size={12} aria-hidden="true" />{labels.code}: {bullet.codeUrl}</span> : null}
          <span className="rs-review">{labels.reviewedBy.replace("{tier}", bullet.reviewerTier)}</span>
        </p>
      </div>
    </li>
  );

  const projects = (
    <section className="rs-section">
      <h3 className="rs-heading">{s.projects}</h3>
      {bullets.length ? (
        <ol className={`rs-projects${template === "trail" ? " rs-trail" : ""}`}>
          {bullets.map((bullet, index) => project(
            bullet,
            template === "trail" ? (
              <span className="rs-stop" aria-hidden="true">
                {num(bullet.stageNumber ?? index + 1)}
                <Check size={10} />
              </span>
            ) : undefined,
          ))}
        </ol>
      ) : <p className="rs-placeholder">{labels.previewEmpty}</p>}
    </section>
  );

  if (template === "classic") {
    return (
      <article id={id} className="resume-doc rs-classic" lang={locale}>
        <header className="rs-head">
          <h2 className="rs-name">{profile.name}</h2>
          {roleField}
          {contact.length ? <p className="rs-contact-line">{contact.map((item) => item.text).join("  ·  ")}</p> : null}
        </header>
        {summaryBlock}
        {skills.length ? (
          <section className="rs-section">
            <h3 className="rs-heading">{s.skills}</h3>
            <p className="rs-skill-line">{skills.join(" · ")}</p>
          </section>
        ) : null}
        {projects}
        {profile.pathTitle ? (
          <section className="rs-section">
            <h3 className="rs-heading">{s.path}</h3>
            <p className="rs-skill-line">
              {profile.pathTitle} · {profile.levelLine} · {labels.pathProgress.replace("{a}", num(profile.stagesDone)).replace("{b}", num(profile.stagesTotal))}
            </p>
          </section>
        ) : null}
        <footer className="rs-foot">{seal}</footer>
      </article>
    );
  }

  if (template === "trail") {
    return (
      <article id={id} className="resume-doc rs-trail-doc" lang={locale}>
        <header className="rs-band">
          <svg className="rs-band-ridge" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d="M0 60 L70 34 L120 48 L190 18 L250 40 L330 12 L400 38 L470 22 L540 44 L600 26 L600 60 Z" />
          </svg>
          <div className="rs-band-copy">
            <h2 className="rs-name">{profile.name}</h2>
            {roleField}
            {contactList}
          </div>
        </header>
        <div className="rs-body">
          <div className="rs-main">
            {summaryBlock}
            {projects}
          </div>
          <aside className="rs-side">
            {pathBlock}
            {skillsBlock}
            {seal}
          </aside>
        </div>
      </article>
    );
  }

  return (
    <article id={id} className="resume-doc rs-modern" lang={locale}>
      <aside className="rs-side">
        <span className="rs-monogram" aria-hidden="true">{initials}</span>
        {contact.length ? (
          <section className="rs-section">
            <h3 className="rs-heading">{s.contact}</h3>
            {contactList}
          </section>
        ) : null}
        {pathBlock}
        {skillsBlock}
        {seal}
      </aside>
      <div className="rs-main">
        <header className="rs-head">
          <h2 className="rs-name">{profile.name}</h2>
          {roleField}
        </header>
        {summaryBlock}
        {projects}
      </div>
    </article>
  );
}
