"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

const FOCUSABLE = ["a[href]", "button:not([disabled])", "input:not([disabled])", "textarea:not([disabled])", "select:not([disabled])", '[tabindex]:not([tabindex="-1"])'].join(",");

/**
 * A narrow dialog on desktop and a bottom sheet below 860px: the step brief's
 * two presentations (DESIGN.md "Detail panel"), reused by the Community card
 * and the pricing inquiry form. It takes the step brief's overlay and sheet
 * rules; `className` only narrows the box.
 *
 * Focus moves into the dialog on open, Tab stays inside, Escape and a click on
 * the veil close it, and focus goes back to whatever opened it.
 */
export function SheetDialog({
  labelledBy,
  eyebrow,
  closeLabel,
  onClose,
  className = "community-dialog",
  children,
}: {
  labelledBy: string;
  className?: string;
  eyebrow: ReactNode;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      // The opener may have left the page (a reported row is removed); then
      // focus stays where the page puts it.
      if (opener?.isConnected) opener.focus();
    };
  }, []);

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
        event.preventDefault();
        return;
      }
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey) {
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

  return (
    <div
      className="roadmap-detail-overlay"
      role="presentation"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className={`roadmap-detail-dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} ref={dialogRef}>
        <div className="roadmap-detail-heading">
          <span className="eyebrow">{eyebrow}</span>
          <button type="button" className="roadmap-detail-close" onClick={onClose} aria-label={closeLabel}>
            <X size={17} aria-hidden="true" />
          </button>
        </div>
        <div className="roadmap-detail-body community-dialog-body">{children}</div>
      </div>
    </div>
  );
}
