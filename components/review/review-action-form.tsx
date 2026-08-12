"use client";

import { useState } from "react";

export function ReviewActionForm({ submissionId }: { submissionId: string }) {
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function act(action: "verify" | "request_changes" | "reject") {
    setBusy(true); setMessage("");
    const response = await fetch(`/api/review/${submissionId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, notes, rubricScores: { semantic: 3, responsive: 3, accessibility: 3, explanation: 3 } }) });
    const body = await response.json().catch(() => null);
    setMessage(response.ok ? "Decision recorded with an audit event." : body?.detail ?? "Decision was not recorded."); setBusy(false);
  }
  return <div className="review-actions"><label>Evidence-linked reviewer notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} minLength={20} placeholder="Name the observed behavior and the rubric criterion." /></label><div><button disabled={busy || notes.length < 20} className="button primary" onClick={() => act("verify")}>Verify</button><button disabled={busy || notes.length < 20} className="button outline" onClick={() => act("request_changes")}>Request changes</button><button disabled={busy || notes.length < 20} className="button danger" onClick={() => act("reject")}>Reject</button></div>{message ? <p role="status">{message}</p> : null}</div>;
}
