"use client";

import { RotateCcw, SendHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TutorQA } from "@/lib/domain/tutor-script";

/**
 * AI Tutor — floating mascot launcher plus a modal, per the founder reference
 * (`tutor-open.png`, `tutor-reply.png`).
 *
 * Scripted preview: prepared answers per roadmap, no model behind it. Free text
 * returns the disclaimer rather than improvising, which is the failure a fake
 * tutor invites. Bounded by DESIGN.md "The AI Tutor": it explains a roadmap and
 * never marks work done, reviews work, or influences proof.
 */

type Message = { role: "bot" | "me"; text: string };

export type TutorLabels = {
  title: string; preview: string; greeting: string; suggestLead: string;
  placeholder: string; disclaimer: string; scripted: string; newChat: string;
  send: string; open: string; close: string; nudge: string;
};

/**
 * The mascot: a compass rose on a solid amber tile, echoing the founder
 * reference's tutor avatar. The map is the product's metaphor, so the guide
 * is a compass rather than a generic robot or speech bubble.
 */
function Mascot({ size = 40 }: { size?: number }) {
  return (
    <span className="tutor-mascot" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <path d="M24 8 L30 27 L24 22.5 L18 27 Z" fill="var(--surface)" />
        <path d="M24 40 L18 21 L24 25.5 L30 21 Z" fill="var(--amber-800)" />
        <circle cx="24" cy="24" r="2.6" fill="var(--amber-800)" />
      </svg>
    </span>
  );
}

export function TutorLauncher({ qa, pathTitle, labels }: { qa: TutorQA[]; pathTitle: string; labels: TutorLabels }) {
  const greeting = labels.greeting.replace("{path}", pathTitle);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: greeting }]);
  const [asked, setAsked] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  // Escape closes, and focus moves into the dialog on open so keyboard users
  // are not left behind the overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    // Focus the input so a learner can type straight away, rather than
    // landing on whatever control happens to come first in the header.
    dialogRef.current?.querySelector<HTMLInputElement>(".tutor-input input")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [close, open]);

  const scroll = () => requestAnimationFrame(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }));

  function ask(item: TutorQA) {
    setAsked((prev) => [...prev, item.question]);
    setMessages((prev) => [...prev, { role: "me", text: item.question }, { role: "bot", text: item.answer }]);
    scroll();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMessages((prev) => [...prev, { role: "me", text }, { role: "bot", text: labels.scripted }]);
    scroll();
  }

  function reset() {
    setMessages([{ role: "bot", text: greeting }]);
    setAsked([]);
    setDraft("");
  }

  const remaining = qa.filter((item) => !asked.includes(item.question));

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className="tutor-launcher"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Mascot />
        <span className="tutor-launcher-copy">
          <strong>{labels.title}</strong>
          <small>{labels.nudge}</small>
        </span>
        <span className="tutor-launcher-cta">{labels.open}</span>
      </button>

      {open ? (
        <div className="tutor-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
          <div className="tutor-dialog" role="dialog" aria-modal="true" aria-label={labels.title} ref={dialogRef}>
            <header className="tutor-head">
              <Mascot size={32} />
              <strong>{labels.title}</strong>
              <span className="avail pilot">{labels.preview}</span>
              <button type="button" className="tutor-reset" onClick={reset}>
                <RotateCcw size={14} aria-hidden="true" />{labels.newChat}
              </button>
              <button type="button" className="tutor-close" onClick={close} aria-label={labels.close}>
                <X size={17} aria-hidden="true" />
              </button>
            </header>

            <div className="tutor-log" ref={logRef} role="log" aria-live="polite">
              {messages.map((message, index) => (
                <p key={`${message.role}-${index}`} className={`tutor-msg ${message.role}`}>{message.text}</p>
              ))}
              {remaining.length ? (
                <>
                  <p className="tutor-suggest-lead">{labels.suggestLead}</p>
                  {remaining.map((item) => (
                    <button key={item.question} type="button" className="tutor-suggest" onClick={() => ask(item)}>
                      {item.question}
                    </button>
                  ))}
                </>
              ) : null}
            </div>

            <form className="tutor-foot" onSubmit={submit}>
              <div className="tutor-input">
                <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={labels.placeholder} aria-label={labels.placeholder} />
                <button type="submit" aria-label={labels.send}><SendHorizontal size={16} aria-hidden="true" /></button>
              </div>
              <p className="tutor-disclaimer">{labels.disclaimer}</p>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
