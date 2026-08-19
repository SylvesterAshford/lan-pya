"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { StatusPill } from "@/components/app/status-pill";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { Milestone } from "@/lib/domain/types";
import type { getAppCopy } from "@/lib/i18n/app-copy";

/**
 * Roadmap step brief — a modal on desktop, a bottom sheet on phones.
 *
 * It used to be a persistent 320px column beside the canvas. Two things were
 * squeezed into one row: the graph could not breathe and the brief wrapped to
 * two-word columns. The brief is a response to a click, not ambient context,
 * so it is now a dialog and the canvas takes the whole content width.
 *
 * Same component in both presentations; only the CSS differs at the 860px
 * breakpoint the rest of the app uses. Mobile matters here beyond layout: the
 * narrow canvas geometry drops the left/right branch skills entirely
 * (DESIGN.md §3.3 — no pinch-zoom is ever required), so "What you will cover"
 * is the only place those skills exist on a phone. It stays in the sheet.
 *
 * Dialog idiom follows `tutor-launcher.tsx` and `level-up-moment.tsx`:
 * scrim + `role="dialog"` + `aria-modal`, Escape to close, click-outside to
 * close. It adds a Tab trap and a body scroll lock, both of which the sidebar
 * drawer already establishes as this codebase's approach. Focus return is the
 * caller's job, because only the caller knows which node was clicked.
 *
 * Rendered only while open rather than hidden with `inert`: an unmounted
 * dialog cannot be tabbed into, cannot be read by a screen reader, and cannot
 * be reached before the reader has clicked anything.
 */

type RoadmapCopy = ReturnType<typeof getAppCopy>["roadmap"];

type RoadmapDetail = {
  leftLabel: string;
  left: string[];
  rightLabel: string;
  right: string[];
  estimate: string;
};

export function detailFor(c: RoadmapCopy, milestone: Milestone): RoadmapDetail {
  if (milestone.left?.length && milestone.right?.length) {
    return {
      leftLabel: milestone.leftLabel ?? c.learn,
      left: milestone.left,
      rightLabel: milestone.rightLabel ?? c.prove,
      right: milestone.right,
      estimate: milestone.estimate ?? c.selfPaced,
    };
  }
  // Fallback for milestones that only carry title/description/proof (e.g. from DB rows).
  return {
    leftLabel: c.learn,
    left: [milestone.description],
    rightLabel: c.prove,
    right: [milestone.proof],
    estimate: milestone.estimate ?? c.selfPaced,
  };
}

/** Everything a keyboard can land on inside the dialog, in DOM order. */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const TITLE_ID = "roadmap-detail-title";

export function RoadmapDetailDialog({
  locale = "en",
  copy,
  milestone,
  statusLabel,
  totalSteps,
  missionHref,
  onClose,
}: {
  locale?: string;
  copy: RoadmapCopy;
  milestone: Milestone;
  statusLabel: string;
  totalSteps: number;
  missionHref: string;
  onClose: () => void;
}) {
  const c = copy;
  const dialogRef = useRef<HTMLDivElement>(null);

  // Mount-scoped, so a re-render of the parent cannot release and re-apply the
  // scroll lock or steal focus back from wherever the reader has moved it.
  useEffect(() => {
    // Focus lands on the dialog itself, not the close button: assistive tech
    // then announces the name and the brief before the way out of it.
    dialogRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  // Escape closes; Tab cycles inside. Both need the current `onClose`, so this
  // effect is allowed to re-bind — rebinding a listener costs nothing.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) {
        // Nothing to move to, so Tab must not walk out to the page behind.
        event.preventDefault();
        return;
      }
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey) {
        // index === -1 means focus is still on the dialog container.
        if (index <= 0) {
          event.preventDefault();
          items[items.length - 1].focus();
        }
      } else if (index === -1 || index === items.length - 1) {
        event.preventDefault();
        items[0].focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const detail = detailFor(c, milestone);
  const my = locale === "my";
  const order = my ? toMyanmarDigits(milestone.order).padStart(2, "၀") : String(milestone.order).padStart(2, "0");
  const placement = my
    ? `${toMyanmarDigits(milestone.order)}/${toMyanmarDigits(totalSteps)}`
    : `${milestone.order}/${totalSteps}`;

  return (
    <div
      className="roadmap-detail-overlay"
      role="presentation"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        className={`roadmap-detail-dialog ${milestone.status}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="roadmap-detail-heading">
          <span className="eyebrow">
            {c.selected} · {order}
          </span>
          <StatusPill
            tone={milestone.status === "complete" ? "success" : milestone.status === "active" ? "warning" : "neutral"}
          >
            {statusLabel}
          </StatusPill>
          <button type="button" className="roadmap-detail-close" onClick={onClose} aria-label={c.close}>
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="roadmap-detail-body">
          <h2 id={TITLE_ID}>{milestone.title}</h2>
          <p className="roadmap-detail-lede">{milestone.description}</p>

          <dl className="roadmap-detail-meta">
            <div>
              <dt>{c.estimated}</dt>
              <dd>{detail.estimate}</dd>
            </div>
            <div>
              <dt>{c.placement}</dt>
              <dd>
                {c.step} {placement}
              </dd>
            </div>
          </dl>

          {/* The branch skills the narrow canvas geometry omits. On a phone this
              list is the only place they appear, so it is not optional. */}
          <div className="roadmap-detail-section">
            <span className="roadmap-detail-label">{c.whatCover}</span>
            <ul>
              {[...detail.left, ...detail.right].map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>

          <div className="roadmap-proof-target">
            <span>{c.proofTarget}</span>
            <strong>{milestone.proof}</strong>
            <small>{c.completion}</small>
          </div>

          {milestone.status === "active" ? (
            <Link className="button primary full" href={missionHref}>
              {c.continueMission}
            </Link>
          ) : null}
          {milestone.status === "complete" ? (
            <Link className="button outline full" href="/app/proof">
              {c.viewProof}
            </Link>
          ) : null}
          {milestone.status === "next" || milestone.status === "upcoming" ? (
            <p className="roadmap-visible-note">{c.visibleNote}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
