"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * The résumé draft, in a dialog.
 *
 * It used to render inline under the builder, which on a phone meant the page
 * grew by roughly a screen and a half the moment you pressed Build. The draft
 * is a thing you read, edit and print in one sitting, not something you want
 * permanently parked in the column you were choosing work from.
 *
 * Same contract as the roadmap step brief, deliberately: focus moves in on
 * open and returns to whatever opened it, Escape and the scrim both close,
 * Tab cycles inside, and the page behind is locked while it is open. Two
 * dialogs in one product behaving differently is worse than either behaviour.
 *
 * Printing still works from in here. `@media print` neutralises the overlay's
 * fixed positioning, so the sheet lays out on the page exactly as it did when
 * it lived in the flow.
 */
export function ResumeDraftDialog({
  title,
  closeLabel,
  onClose,
  children,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Mount-scoped, so a re-render of the parent cannot release and re-apply the
  // scroll lock or steal focus back from wherever the reader has moved it.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
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

      const focusables = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="resume-dialog-overlay"
      // role="presentation" for the same reason the roadmap brief's scrim
      // carries it: the scrim is not a control, it is the backdrop, and every
      // route it offers (Escape, the close button) is available without it.
      role="presentation"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        className="resume-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-dialog-title"
        tabIndex={-1}
      >
        <header className="resume-dialog-head">
          <h2 id="resume-dialog-title">{title}</h2>
          <button type="button" className="resume-dialog-close" onClick={onClose} aria-label={closeLabel}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="resume-dialog-body">{children}</div>
      </div>
    </div>
  );
}
