"use client";

import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { SubmissionForm } from "@/components/missions/submission-form";
import { loadDraft, saveDraft } from "@/lib/offline/draft-store";
import type { MissionBrief } from "@/lib/domain/mission-briefs";
import type { SubmissionState } from "@/lib/domain/types";

/**
 * Mission runner — five steps with a progress rail.
 *
 * The mission page used to stack a brief, a deliverables list, a pilot note and
 * a submission form on one screen. On a phone that is a wall of text with the
 * form buried at the bottom and no sense of position.
 *
 * The deliverables checklist is the in-mission progress signal. It is
 * deliberately not points: the founder research note records that gamification
 * works on meaningful progress rather than attendance, and that unclear rules
 * are a recurring failure mode. A ticked deliverable is something a learner can
 * defend in an interview. See DESIGN.md "The Mission Runner".
 */

type Step = 1 | 2 | 3 | 4 | 5;

export type RunnerLabels = {
  steps: [string, string, string, string, string];
  stepOf: string;
  back: string;
  next: string;
  toSubmit: string;
  savedLocally: string;
  doneCount: string;
  premise: string;
  deliverables: string;
  localNote: string;
  reviewWaiting: string;
  reviewWaitingBody: string;
  changesRequested: string;
  changesRequestedBody: string;
  verified: string;
  verifiedBody: string;
  notSubmitted: string;
  notSubmittedBody: string;
  viewProof: string;
  weightNote: string;
};

/** Which step the submission state forces, if any. */
function stepFromSubmission(state: SubmissionState | null): Step | null {
  if (!state) return null;
  if (state === "verified") return 5;
  if (state === "changes_requested") return 3;
  if (state === "draft") return null;
  return 4;
}

export function MissionRunner({
  locale,
  userId,
  brief,
  submissionState,
  labels,
}: {
  locale: string;
  userId: string;
  brief: MissionBrief;
  submissionState: SubmissionState | null;
  labels: RunnerLabels;
}) {
  const forced = useMemo(() => stepFromSubmission(submissionState), [submissionState]);
  const [step, setStep] = useState<Step>(forced ?? 1);
  const [checked, setChecked] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // The checklist rides in the existing mission draft, so it is private, stays
  // on the device, and expires with everything else after 30 days.
  useEffect(() => {
    let cancelled = false;
    loadDraft(userId, brief.missionKey)
      .then((draft) => {
        if (!cancelled && draft?.checklist) setChecked(draft.checklist);
      })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [brief.missionKey, userId]);

  const persist = useCallback(async (next: string[]) => {
    const draft = await loadDraft(userId, brief.missionKey);
    await saveDraft(userId, brief.missionKey, {
      repositoryUrl: draft?.repositoryUrl ?? "",
      deploymentUrl: draft?.deploymentUrl ?? "",
      reflection: draft?.reflection ?? "",
      screenshotUrl: draft?.screenshotUrl ?? "",
      checklist: next,
    });
  }, [brief.missionKey, userId]);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      void persist(next);
      return next;
    });
  }

  const total = brief.deliverables.length;
  const done = brief.deliverables.filter((item) => checked.includes(item.id)).length;

  // Steps 4 and 5 are owned by the submission, not the learner: you cannot click
  // your way into "reviewed" or "verified".
  const reachable = (target: Step) => target <= 3 || (forced !== null && target <= forced);

  return (
    <section className="runner" aria-label={brief.title}>
      <ol className="runner-rail">
        {labels.steps.map((label, index) => {
          const value = (index + 1) as Step;
          const state = value < step ? "done" : value === step ? "now" : "todo";
          return (
            <li key={label} className={`runner-step ${state}`}>
              <button
                type="button"
                className="runner-dot"
                aria-current={value === step ? "step" : undefined}
                aria-label={`${labels.stepOf.replace("{a}", String(value)).replace("{b}", "5")}: ${label}`}
                disabled={!reachable(value)}
                onClick={() => reachable(value) && setStep(value)}
              >
                {value < step ? <Check size={13} aria-hidden="true" /> : value}
              </button>
              <span>{label}</span>
            </li>
          );
        })}
      </ol>

      <div className="runner-panel">
        {step === 1 ? (
          <>
            <span className="eyebrow">{labels.stepOf.replace("{a}", "1").replace("{b}", "5")} · {labels.steps[0]}</span>
            <h2>{brief.title}</h2>
            <p className="runner-intro">{brief.intro}</p>
            <p className="runner-premise">{brief.premise}</p>
            <div className="runner-guardrail">
              <strong>{brief.guardrailTitle}</strong>
              <p>{brief.guardrail}</p>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <span className="eyebrow">{labels.stepOf.replace("{a}", "2").replace("{b}", "5")} · {labels.steps[1]}</span>
            <h2>{brief.title}</h2>
            <p className="runner-weight-note">{labels.weightNote}</p>
            <ul className="runner-checklist">
              {brief.deliverables.map((item) => {
                const on = checked.includes(item.id);
                return (
                  <li key={item.id}>
                    <button type="button" className={`runner-check${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggle(item.id)}>
                      <span className="runner-box" aria-hidden="true">{on ? <Check size={13} /> : null}</span>
                      <span className="runner-check-copy">
                        <strong>{item.title}<em>{item.weight}</em></strong>
                        <small>{item.hint}</small>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {brief.localNote ? (
              <div className="mm-note">
                <b><MapPin size={12} aria-hidden="true" /> {labels.localNote}</b>
                {brief.localNote}
              </div>
            ) : null}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <span className="eyebrow">{labels.stepOf.replace("{a}", "3").replace("{b}", "5")} · {labels.steps[2]}</span>
            {submissionState === "changes_requested" ? (
              <div className="runner-state warning">
                <strong>{labels.changesRequested}</strong>
                <p>{labels.changesRequestedBody}</p>
              </div>
            ) : null}
            <SubmissionForm
              locale={locale}
              userId={userId}
              missionKey={brief.missionKey}
              title={brief.title}
              repositoryLabel={brief.repositoryLabel}
              deploymentLabel={brief.deploymentLabel}
              reflectionPlaceholder={brief.reflectionPlaceholder}
            />
          </>
        ) : null}

        {step === 4 ? (
          <>
            <span className="eyebrow">{labels.stepOf.replace("{a}", "4").replace("{b}", "5")} · {labels.steps[3]}</span>
            <div className="runner-state">
              <strong>{labels.reviewWaiting}</strong>
              <p>{labels.reviewWaitingBody}</p>
            </div>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <span className="eyebrow">{labels.stepOf.replace("{a}", "5").replace("{b}", "5")} · {labels.steps[4]}</span>
            <div className="runner-state success">
              <strong>{labels.verified}</strong>
              <p>{labels.verifiedBody}</p>
            </div>
            <Link className="button primary" href="/app/proof">{labels.viewProof}</Link>
          </>
        ) : null}

        <footer className="runner-foot">
          <span className="runner-saved">
            {step === 2 && loaded
              ? `${labels.doneCount.replace("{a}", String(done)).replace("{b}", String(total))} · ${labels.savedLocally}`
              : ""}
          </span>
          <span className="runner-nav">
            {step > 1 ? (
              <button type="button" className="button outline compact" onClick={() => setStep((s) => (s - 1) as Step)}>
                <ArrowLeft size={15} aria-hidden="true" /> {labels.back}
              </button>
            ) : null}
            {step < 3 ? (
              <button type="button" className="button primary compact" onClick={() => setStep((s) => (s + 1) as Step)}>
                {step === 2 ? labels.toSubmit : labels.next} <ArrowRight size={15} aria-hidden="true" />
              </button>
            ) : null}
          </span>
        </footer>
      </div>
    </section>
  );
}
