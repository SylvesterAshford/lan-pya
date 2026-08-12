"use client";

import { useEffect, useState } from "react";
import { clearDraft, loadDraft, saveDraft } from "@/lib/offline/draft-store";

const EMPTY = { repositoryUrl: "", deploymentUrl: "", screenshotUrl: "", reflection: "" };

export function SubmissionForm({ userId }: { userId: string }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { loadDraft(userId, "responsive-profile-card").then((draft) => draft && setForm(draft)); }, [userId]);
  useEffect(() => {
    const timer = window.setTimeout(() => saveDraft(userId, "responsive-profile-card", form).then(() => setStatus("Draft saved on this device")), 600);
    return () => window.clearTimeout(timer);
  }, [form, userId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setStatus("");
    const response = await fetch("/api/submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ missionKey: "responsive-profile-card", ...form }) });
    const body = await response.json().catch(() => null);
    if (!response.ok) { setStatus(body?.detail ?? "Submission failed. Your draft is still safe on this device."); setBusy(false); return; }
    await clearDraft(userId, "responsive-profile-card");
    setStatus("Submitted. Deterministic checks are queued; a human reviewer makes the final decision."); setBusy(false);
  }

  return <form className="panel submission-form" onSubmit={submit}><div className="panel-heading"><div><span className="eyebrow">SUBMIT REAL WORK</span><h2>Project evidence</h2></div><span className="draft-state">{status || "Private draft"}</span></div><label>GitHub repository URL<input required type="url" value={form.repositoryUrl} onChange={(event) => setForm({ ...form, repositoryUrl: event.target.value })} placeholder="https://github.com/you/project" /></label><label>Live deployment URL<input required type="url" value={form.deploymentUrl} onChange={(event) => setForm({ ...form, deploymentUrl: event.target.value })} placeholder="https://your-project.vercel.app" /></label><label>Screenshot URL <small>(optional)</small><input type="url" value={form.screenshotUrl} onChange={(event) => setForm({ ...form, screenshotUrl: event.target.value })} placeholder="https://…" /></label><label>Reflection<textarea required minLength={40} maxLength={1500} value={form.reflection} onChange={(event) => setForm({ ...form, reflection: event.target.value })} placeholder="What trade-off did you make, what broke, and how did you fix it?" /></label><div className="submission-note"><strong>Before you submit</strong><span>Automated checks can suggest issues, but they cannot verify you. Your final result comes from a human reviewer using rubric v1.</span></div><button className="button gold" disabled={busy}>{busy ? "Submitting…" : "Submit for review →"}</button></form>;
}
