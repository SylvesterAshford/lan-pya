"use client";

import { BookOpen, RotateCcw, SendHorizontal } from "lucide-react";
import { useRef, useState } from "react";

/**
 * AI Tutor — scripted preview.
 *
 * Built from the founder reference in `Lan Pya Web.dc.html`: amber assistant
 * bubbles, teal learner bubbles, suggested questions, honest footer.
 *
 * There is NO model behind this. Suggested questions map to prepared answers
 * written per roadmap. It is labelled Preview everywhere it appears, and it is
 * bounded by DESIGN.md "The AI Tutor": it explains a roadmap, and never marks a
 * milestone complete, reviews work, or influences proof. PRODUCT.md is explicit
 * that automated feedback never creates verified proof.
 */

export type TutorQA = { question: string; answer: string };

type Message = { role: "bot" | "me"; text: string };

export function AiTutor({
  pathTitle,
  qa,
  labels,
}: {
  pathTitle: string;
  qa: TutorQA[];
  labels: {
    title: string;
    preview: string;
    greeting: string;
    suggestLead: string;
    placeholder: string;
    disclaimer: string;
    scripted: string;
    newChat: string;
    send: string;
  };
}) {
  const greeting = labels.greeting.replace("{path}", pathTitle);
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: greeting }]);
  const [asked, setAsked] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  const remaining = qa.filter((item) => !asked.includes(item.question));

  function ask(item: TutorQA) {
    setAsked((prev) => [...prev, item.question]);
    setMessages((prev) => [...prev, { role: "me", text: item.question }, { role: "bot", text: item.answer }]);
    requestAnimationFrame(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    // Free text has no model behind it. Say so plainly rather than improvising
    // an answer, which is the failure mode this preview exists to avoid.
    setMessages((prev) => [...prev, { role: "me", text }, { role: "bot", text: labels.scripted }]);
    requestAnimationFrame(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }));
  }

  function reset() {
    setMessages([{ role: "bot", text: greeting }]);
    setAsked([]);
    setDraft("");
  }

  return (
    <section className="tutor" aria-label={labels.title}>
      <header className="tutor-head">
        <BookOpen size={18} aria-hidden="true" />
        <strong>{labels.title}</strong>
        <span className="avail pilot">{labels.preview}</span>
        <button type="button" className="tutor-reset" onClick={reset}>
          <RotateCcw size={14} aria-hidden="true" />
          {labels.newChat}
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
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={labels.placeholder}
            aria-label={labels.placeholder}
          />
          <button type="submit" aria-label={labels.send}><SendHorizontal size={16} aria-hidden="true" /></button>
        </div>
        <p className="tutor-disclaimer">{labels.disclaimer}</p>
      </form>
    </section>
  );
}
