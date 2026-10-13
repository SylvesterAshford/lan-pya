"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Deliverable } from "@/lib/domain/mission-briefs";
import type { getAppCopy } from "@/lib/i18n/app-copy";

type Action = "verify" | "request_changes" | "reject";
const SCALE = [0, 1, 2, 3, 4] as const;

/**
 * The reviewer's decision, scored on the same criteria the learner ticked in
 * step 2 of the mission. Every criterion needs a score before any decision,
 * so the review record never holds a made-up number. It used to send 3 for
 * every criterion whatever the work looked like.
 */
export function ReviewActionForm({
  submissionId,
  criteria,
  labels,
}: {
  submissionId: string;
  criteria: Deliverable[];
  labels: ReturnType<typeof getAppCopy>["review"];
}) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [result, setResult] = useState<"recorded" | "failed" | null>(null);

  const allScored = criteria.every((item) => typeof scores[item.id] === "number");
  const notesOk = notes.trim().length >= 20;

  async function act(action: Action) {
    setAttempted(true);
    if (!allScored || !notesOk) return;
    setBusy(true);
    setResult(null);
    const response = await fetch(`/api/review/${submissionId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, notes: notes.trim(), rubricScores: scores }),
    }).catch(() => null);
    setResult(response?.ok ? "recorded" : "failed");
    setBusy(false);
  }

  if (result === "recorded") {
    return (
      <div className="runner-state success" role="status">
        <strong>{labels.recorded}</strong>
        <Link className="button outline compact" href="/app/review">{labels.backToQueue}</Link>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={(event) => event.preventDefault()} noValidate>
      <p className="submit-help">{labels.rubricHelp}</p>
      <p className="review-legend">{labels.legend}</p>

      {criteria.map((item) => (
        <fieldset key={item.id} className={`review-criterion${attempted && typeof scores[item.id] !== "number" ? " has-error" : ""}`}>
          <legend>
            <strong>{item.title}</strong> <span className="review-weight">{item.weight}</span>
          </legend>
          <p className="submit-hint">{item.hint}</p>
          <div className="review-scale">
            {SCALE.map((value) => (
              <label key={value} className={scores[item.id] === value ? "is-on" : undefined}>
                <input type="radio" name={`score-${item.id}`} value={value} checked={scores[item.id] === value} onChange={() => setScores((current) => ({ ...current, [item.id]: value }))} />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <div className={`submit-field${attempted && !notesOk ? " has-error" : ""}`}>
        <div className="submit-label-row"><label htmlFor="review-notes">{labels.notes}</label></div>
        <p className="submit-hint" id="review-notes-hint">{labels.notesHint}</p>
        <textarea id="review-notes" rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} aria-describedby="review-notes-hint" aria-invalid={attempted && !notesOk ? true : undefined} />
      </div>

      {attempted && (!allScored || !notesOk) ? (
        <p className="submit-error-text" role="alert">{!allScored ? labels.needScores : labels.needNotes}</p>
      ) : null}
      {result === "failed" ? <p className="submit-server-error" role="alert">{labels.failed}</p> : null}

      <div className="review-decisions">
        <button type="button" className="button primary compact" disabled={busy} onClick={() => act("verify")}>{labels.verify}</button>
        <button type="button" className="button outline compact" disabled={busy} onClick={() => act("request_changes")}>{labels.requestChanges}</button>
        <button type="button" className="button danger compact" disabled={busy} onClick={() => act("reject")}>{labels.reject}</button>
      </div>
    </form>
  );
}
