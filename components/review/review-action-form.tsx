"use client";

import { useState } from "react";

export function ReviewActionForm({ submissionId, rubricKeys = ["semantic", "responsive", "accessibility", "explanation"], locale = "en" }: { submissionId: string; rubricKeys?: string[]; locale?: string }) {
  const my = locale === "my";
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function act(action: "verify" | "request_changes" | "reject") {
    setBusy(true); setMessage("");
    const rubricScores = Object.fromEntries(rubricKeys.map((key) => [key, 3]));
    const response = await fetch(`/api/review/${submissionId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, notes, rubricScores }) });
    const body = await response.json().catch(() => null);
    setMessage(response.ok ? (my ? "ဆုံးဖြတ်ချက်ကို audit record ဖြင့် သိမ်းဆည်းပြီးပါပြီ။" : "Decision recorded with an audit event.") : body?.detail ?? (my ? "ဆုံးဖြတ်ချက်ကို မသိမ်းဆည်းနိုင်ပါ။" : "Decision was not recorded.")); setBusy(false);
  }
  return <div className="review-actions"><label>{my ? "သက်သေနှင့် ချိတ်ဆက်ထားသော reviewer မှတ်ချက်များ" : "Evidence-linked reviewer notes"}<textarea value={notes} onChange={(event) => setNotes(event.target.value)} minLength={20} placeholder={my ? "တွေ့ရှိထားသော အပြုအမူနှင့် rubric စံနှုန်းကို ဖော်ပြပါ။" : "Name the observed behavior and the rubric criterion."} /></label><div><button disabled={busy || notes.length < 20} className="button primary" onClick={() => act("verify")}>{my ? "အတည်ပြုပါ" : "Verify"}</button><button disabled={busy || notes.length < 20} className="button outline" onClick={() => act("request_changes")}>{my ? "ပြင်ဆင်ရန် တောင်းဆိုပါ" : "Request changes"}</button><button disabled={busy || notes.length < 20} className="button danger" onClick={() => act("reject")}>{my ? "ငြင်းပယ်ပါ" : "Reject"}</button></div>{message ? <p role="status">{message}</p> : null}</div>;
}
