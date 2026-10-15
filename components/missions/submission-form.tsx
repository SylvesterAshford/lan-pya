"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { clearDraft, loadDraft, saveDraft } from "@/lib/offline/draft-store";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { REFLECTION_MAX, REFLECTION_MIN } from "@/lib/domain/mission-status";
import type { getAppCopy } from "@/lib/i18n/app-copy";

export type MissionFormLabels = ReturnType<typeof getAppCopy>["mission"];

type Fields = { repositoryUrl: string; deploymentUrl: string; screenshotUrl: string; reflection: string };
type FieldName = keyof Fields;
type Errors = Partial<Record<FieldName, string>>;

const EMPTY: Fields = { repositoryUrl: "", deploymentUrl: "", screenshotUrl: "", reflection: "" };
const ORDER: FieldName[] = ["repositoryUrl", "deploymentUrl", "screenshotUrl", "reflection"];

function isLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * The checks the server makes, run first in the browser so a learner sees
 * every problem at once, in their language, next to the field it belongs to.
 * The server still validates; this only spares a round trip.
 */
export function validateSubmission(form: Fields, c: MissionFormLabels): Errors {
  const errors: Errors = {};
  for (const name of ["repositoryUrl", "deploymentUrl"] as const) {
    const value = form[name].trim();
    if (!value) errors[name] = c.errRequired;
    else if (!isLink(value)) errors[name] = c.errUrl;
  }
  if (form.screenshotUrl.trim() && !isLink(form.screenshotUrl.trim())) errors.screenshotUrl = c.errUrl;
  const length = form.reflection.trim().length;
  if (length < REFLECTION_MIN) errors.reflection = c.errReflection.replace("{n}", String(REFLECTION_MIN - length));
  else if (length > REFLECTION_MAX) errors.reflection = c.errReflectionLong.replace("{max}", String(REFLECTION_MAX));
  return errors;
}

/**
 * Step 3 of the mission runner: two links and a reflection.
 *
 * One heading, a hint under each label, and errors written inline rather than
 * the browser's own tooltips. Back and Submit sit in the runner's shared
 * footer so the five steps read as one flow. The draft stays on the device
 * until the server accepts the work; then the page refreshes into step 4.
 */
export function SubmissionForm({
  locale = "en",
  labels,
  userId,
  missionKey,
  repositoryLabel,
  repositoryHint,
  deploymentLabel,
  deploymentHint,
  reflectionPlaceholder,
  criteriaCount,
  initial,
  backLabel,
  onBack,
}: {
  locale?: string;
  /** The form's copy, passed from the server so the dictionary stays there. */
  labels: MissionFormLabels;
  userId: string;
  missionKey: string;
  repositoryLabel: string;
  repositoryHint: string;
  deploymentLabel: string;
  deploymentHint: string;
  reflectionPlaceholder: string;
  criteriaCount: number;
  /** The last version sent, when the learner is fixing it. */
  initial?: Fields | null;
  backLabel: string;
  onBack: () => void;
}) {
  const c = labels;
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));
  const router = useRouter();
  const [form, setForm] = useState<Fields>(initial ?? EMPTY);
  // The runner keeps the step-2 checklist in the same draft; carry it through.
  const [extra, setExtra] = useState<{ checklist?: string[] }>({});
  const [attempted, setAttempted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const refs = useRef<Partial<Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  // A saved draft wins field by field over the last submitted version, so an
  // unfinished fix is never overwritten by the version it is fixing.
  useEffect(() => {
    let cancelled = false;
    loadDraft(userId, missionKey).then((draft) => {
      if (cancelled || !draft) return;
      const { repositoryUrl, deploymentUrl, screenshotUrl, reflection, checklist } = draft;
      setExtra(checklist ? { checklist } : {});
      setForm((current) => ({
        repositoryUrl: repositoryUrl || current.repositoryUrl,
        deploymentUrl: deploymentUrl || current.deploymentUrl,
        screenshotUrl: screenshotUrl || current.screenshotUrl,
        reflection: reflection || current.reflection,
      }));
    });
    return () => { cancelled = true; };
  }, [missionKey, userId]);

  useEffect(() => {
    if (!Object.values(form).some(Boolean)) return;
    const timer = window.setTimeout(() => {
      saveDraft(userId, missionKey, { ...extra, ...form }).then(() => setSaved(true));
    }, 600);
    return () => window.clearTimeout(timer);
  }, [extra, form, missionKey, userId]);

  const errors = attempted ? validateSubmission(form, c) : {};
  const reflectionLength = form.reflection.trim().length;
  const counter = reflectionLength < REFLECTION_MIN
    ? c.reflectionShort.replace("{n}", num(reflectionLength)).replace("{min}", num(REFLECTION_MIN))
    : c.reflectionCount.replace("{n}", num(reflectionLength)).replace("{max}", num(REFLECTION_MAX));

  function update(name: FieldName, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    setServerError("");
    const found = validateSubmission(form, c);
    const first = ORDER.find((name) => found[name]);
    if (first) {
      refs.current[first]?.focus();
      return;
    }
    setBusy(true);
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ missionKey, ...form, reflection: form.reflection.trim() }),
    }).catch(() => null);
    const body = await response?.json().catch(() => null);
    if (!response?.ok) {
      setServerError(body?.detail ?? c.submitError);
      setBusy(false);
      return;
    }
    await clearDraft(userId, missionKey);
    router.refresh();
  }

  const describedBy = (name: FieldName, hint?: boolean) =>
    [hint ? `${name}-hint` : null, errors[name] ? `${name}-error` : null].filter(Boolean).join(" ") || undefined;

  const linkField = (name: "repositoryUrl" | "deploymentUrl" | "screenshotUrl", label: string, hint: string, optional = false) => (
    <div className={`submit-field${errors[name] ? " has-error" : ""}`}>
      <div className="submit-label-row">
        <label htmlFor={`submit-${name}`}>{label}</label>
        {optional ? <span className="submit-optional">{c.optional}</span> : null}
      </div>
      <p className="submit-hint" id={`${name}-hint`}>{hint}</p>
      <input
        ref={(node) => { refs.current[name] = node; }}
        id={`submit-${name}`}
        type="url"
        inputMode="url"
        autoComplete="url"
        value={form[name]}
        onChange={(event) => update(name, event.target.value)}
        placeholder="https://"
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={describedBy(name, true)}
      />
      {errors[name] ? <p className="submit-error-text" id={`${name}-error`}>{errors[name]}</p> : null}
    </div>
  );

  return (
    <form className="submit-form" noValidate onSubmit={submit} aria-labelledby="submit-title">
      <h2 id="submit-title">{c.formTitle}</h2>
      <p className="submit-help">{c.formHelp.replace("{n}", num(criteriaCount))}</p>

      {linkField("repositoryUrl", repositoryLabel, repositoryHint)}
      {linkField("deploymentUrl", deploymentLabel, deploymentHint)}
      {linkField("screenshotUrl", c.screenshot, c.screenshotHint, true)}

      <div className={`submit-field${errors.reflection ? " has-error" : ""}`}>
        <div className="submit-label-row">
          <label htmlFor="submit-reflection">{c.reflection}</label>
          <span className={`submit-counter${reflectionLength >= REFLECTION_MIN ? " is-met" : ""}`} id="reflection-counter">{counter}</span>
        </div>
        <textarea
          ref={(node) => { refs.current.reflection = node; }}
          id="submit-reflection"
          rows={5}
          value={form.reflection}
          onChange={(event) => update("reflection", event.target.value)}
          placeholder={reflectionPlaceholder}
          aria-invalid={errors.reflection ? true : undefined}
          aria-describedby={["reflection-counter", errors.reflection ? "reflection-error" : null].filter(Boolean).join(" ")}
        />
        {errors.reflection ? <p className="submit-error-text" id="reflection-error">{errors.reflection}</p> : null}
      </div>

      <p className="submit-foot-note">{c.footNote}</p>
      {attempted && Object.keys(errors).length ? <p className="sr-only" role="alert">{c.errSummary}</p> : null}
      {serverError ? <p className="submit-server-error" role="alert">{serverError}</p> : null}

      <footer className="runner-foot">
        <span className="runner-saved" aria-live="polite">{saved ? c.draftSaved : ""}</span>
        <span className="runner-nav">
          <button type="button" className="button outline compact" onClick={onBack}>
            <ArrowLeft size={15} aria-hidden="true" /> {backLabel}
          </button>
          <button type="submit" className="button primary compact" disabled={busy}>
            {busy ? c.submitting : c.submitReview} <ArrowRight size={15} aria-hidden="true" />
          </button>
        </span>
      </footer>
    </form>
  );
}
