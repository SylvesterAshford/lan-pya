"use client";

import { useEffect, useState } from "react";
import { clearDraft, loadDraft, saveDraft } from "@/lib/offline/draft-store";
import { getAppCopy } from "@/lib/i18n/app-copy";
import type { SubmissionField } from "@/lib/domain/mission-briefs";

const EMPTY: Record<string, string> = {};

function getInitialForm(fields: SubmissionField[]) {
  return fields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), { screenshotUrl: "", reflection: "" });
}

export function SubmissionForm({
  locale = "en",
  userId,
  missionKey = "responsive-profile-card",
  title,
  fields = [],
  reflectionPlaceholder = "What trade-off did you make, what broke, and how did you fix it?",
}: {
  locale?: string;
  userId: string;
  missionKey?: string;
  title?: string;
  fields?: SubmissionField[];
  reflectionPlaceholder?: string;
}) {
  const c = getAppCopy(locale).mission;
  const initialForm = getInitialForm(fields);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadDraft(userId, missionKey).then((draft) => draft && setForm({ ...initialForm, ...draft }));
  }, [missionKey, userId, JSON.stringify(initialForm)]);

  useEffect(() => {
    const timer = window.setTimeout(() => saveDraft(userId, missionKey, form).then(() => setStatus(c.draftSaved)), 600);
    return () => window.clearTimeout(timer);
  }, [c.draftSaved, form, missionKey, userId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ missionKey, ...form }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      setStatus(body?.detail ?? c.submitError);
      setBusy(false);
      return;
    }
    await clearDraft(userId, missionKey);
    setStatus(c.submitted);
    setBusy(false);
  }

  return (
    <form className="panel submission-form" onSubmit={submit}>
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{c.submitWork}</span>
          <h2>{title ?? c.projectEvidence}</h2>
        </div>
        <span className="draft-state">{status || c.privateDraft}</span>
      </div>

      {fields.map((field) => (
        <label key={field.key}>
          {field.label}
          {field.hint && <small>{field.hint}</small>}
          {field.type === "url" && (
            <input
              required={field.required}
              type="url"
              value={form[field.key] || ""}
              onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
              placeholder={field.placeholder}
            />
          )}
          {field.type === "drive-link" && (
            <input
              required={field.required}
              type="url"
              value={form[field.key] || ""}
              onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
              placeholder="https://drive.google.com/…"
            />
          )}
          {field.type === "file-upload" && (
            <input
              required={field.required}
              type="file"
              multiple
              onChange={(event) => {
                if (event.target.files) {
                  const files = Array.from(event.target.files).map(f => f.name).join(", ");
                  setForm({ ...form, [field.key]: files });
                }
              }}
            />
          )}
        </label>
      ))}

      <label>
        {c.screenshot} <small>({c.optional})</small>
        <input
          type="url"
          value={form.screenshotUrl || ""}
          onChange={(event) => setForm({ ...form, screenshotUrl: event.target.value })}
          placeholder="https://…"
        />
      </label>

      <label>
        {c.reflection}
        <textarea
          required
          minLength={40}
          maxLength={1500}
          value={form.reflection || ""}
          onChange={(event) => setForm({ ...form, reflection: event.target.value })}
          placeholder={reflectionPlaceholder}
        />
      </label>

      <div className="submission-note">
        <strong>{c.before}</strong>
        <span>{c.beforeBody}</span>
      </div>

      <button className="button gold" disabled={busy}>
        {busy ? c.submitting : c.submitReview}
      </button>
    </form>
  );
}
