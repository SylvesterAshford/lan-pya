"use client";

import { useEffect, useState } from "react";
import { clearDraft, loadDraft, saveDraft } from "@/lib/offline/draft-store";
import { getAppCopy } from "@/lib/i18n/app-copy";

const EMPTY = { repositoryUrl: "", deploymentUrl: "", screenshotUrl: "", reflection: "" };

export function SubmissionForm({ locale = "en", userId, missionKey = "responsive-profile-card", title, repositoryLabel = "GitHub repository URL", deploymentLabel = "Live deployment URL", reflectionPlaceholder = "What trade-off did you make, what broke, and how did you fix it?" }: { locale?: string; userId: string; missionKey?: string; title?: string; repositoryLabel?: string; deploymentLabel?: string; reflectionPlaceholder?: string }) {
  const c = getAppCopy(locale).mission;
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { loadDraft(userId, missionKey).then((draft) => draft && setForm(draft)); }, [missionKey, userId]);
  useEffect(() => {
    const timer = window.setTimeout(() => saveDraft(userId, missionKey, form).then(() => setStatus(c.draftSaved)), 600);
    return () => window.clearTimeout(timer);
  }, [c.draftSaved, form, missionKey, userId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setStatus("");
    const response = await fetch("/api/submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ missionKey, ...form }) });
    const body = await response.json().catch(() => null);
    if (!response.ok) { setStatus(body?.detail ?? c.submitError); setBusy(false); return; }
    await clearDraft(userId, missionKey);
    setStatus(c.submitted); setBusy(false);
  }

  return <form className="panel submission-form" onSubmit={submit}><div className="panel-heading"><div><span className="eyebrow">{c.submitWork}</span><h2>{title ?? c.projectEvidence}</h2></div><span className="draft-state">{status || c.privateDraft}</span></div><label>{repositoryLabel}<input required type="url" value={form.repositoryUrl} onChange={(event) => setForm({ ...form, repositoryUrl: event.target.value })} placeholder="https://…" /></label><label>{deploymentLabel}<input required type="url" value={form.deploymentUrl} onChange={(event) => setForm({ ...form, deploymentUrl: event.target.value })} placeholder="https://…" /></label><label>{c.screenshot} <small>({c.optional})</small><input type="url" value={form.screenshotUrl} onChange={(event) => setForm({ ...form, screenshotUrl: event.target.value })} placeholder="https://…" /></label><label>{c.reflection}<textarea required minLength={40} maxLength={1500} value={form.reflection} onChange={(event) => setForm({ ...form, reflection: event.target.value })} placeholder={reflectionPlaceholder} /></label><div className="submission-note"><strong>{c.before}</strong><span>{c.beforeBody}</span></div><button className="button gold" disabled={busy}>{busy ? c.submitting : c.submitReview}</button></form>;
}
