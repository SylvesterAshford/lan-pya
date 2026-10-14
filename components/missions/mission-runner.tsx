"use client";

import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CheckList } from "@/components/missions/check-list";
import { SubmissionForm } from "@/components/missions/submission-form";
import { loadDraft, saveDraft } from "@/lib/offline/draft-store";
import type { MissionFeedback } from "@/lib/data/app-data";
import type { MissionBrief } from "@/lib/domain/mission-briefs";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { learnerStatus } from "@/lib/domain/mission-status";
import type { getAppCopy } from "@/lib/i18n/app-copy";

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
 *
 * Where a submission stands comes from learnerStatus() alone, so this page,
 * Today and Portfolio agree. Step 4 is Completed (the link check passed and the
 * trail map moved on); step 5 is Verified (a person applied the rubric).
 */

type Step = 1 | 2 | 3 | 4 | 5;

export type RunnerLabels = ReturnType<typeof getAppCopy>["runner"];

export function MissionRunner({
  locale,
  userId,
  brief,
  feedback,
  slowCheck = false,
  readOnly = false,
  labels,
}: {
  locale: string;
  userId: string;
  brief: MissionBrief;
  feedback: MissionFeedback | null;
  /** The link check has run for longer than it usually takes. */
  slowCheck?: boolean;
  /** The shared demo account. */
  readOnly?: boolean;
  labels: RunnerLabels;
}) {
  const status = learnerStatus(feedback?.state);
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));
  const [step, setStep] = useState<Step>(status.step ?? 1);
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

  // The brief and the checklist are always open. Submit is open unless the
  // work is already in. Review and Proof belong to the submission: you cannot
  // click your way into "completed" or "verified".
  const reachable = (target: Step) => {
    if (target <= 2) return true;
    // Submit is always open: before the work is in it is the form, after it
    // is what was sent. Locking it once submitted made a finished step look
    // skipped on the rail.
    if (target === 3) return true;
    return status.step !== null && status.step >= target;
  };
  const forward = (step + 1) as Step;
  const submitted = status.step === 4 || status.step === 5;
  const eyebrow = (value: Step) => `${labels.stepOf.replace("{a}", num(value)).replace("{b}", num(5))} · ${labels.steps[value - 1]}`;
  const linkName = (check: string) => (check === "repository" ? brief.repositoryLabel : check === "deployment" ? brief.deploymentLabel : check);

  return (
    <section className="runner" aria-label={brief.title}>
      <ol className="runner-rail">
        {labels.steps.map((label, index) => {
          const value = (index + 1) as Step;
          // Done means the mission got there, not that you are looking past
          // it: reopening Submit on verified work keeps Review and Proof done.
          const reached = status.kind === "verified" ? 6 : status.step ?? 0;
          const state = value === step ? "now" : value < step || value < reached ? "done" : "todo";
          return (
            <li key={label} className={`runner-step ${state}`}>
              <button
                type="button"
                className="runner-dot"
                aria-current={value === step ? "step" : undefined}
                aria-label={`${labels.stepOf.replace("{a}", num(value)).replace("{b}", num(5))}: ${label}`}
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
        <span className="eyebrow">{eyebrow(step)}</span>

        {step === 1 ? (
          <>
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
            {status.kind === "fix_links" ? (
              <div className="runner-state warning" role="status">
                <strong>{labels.fixTitle}</strong>
                <p>{labels.fixBody}</p>
                <CheckList observations={(feedback?.check?.observations ?? []).filter((item) => item.status === "fail")} labels={labels} linkName={linkName} />
              </div>
            ) : null}
            {status.kind === "changes" || status.kind === "rejected" ? (
              <div className="runner-state warning" role="status">
                <strong>{status.kind === "changes" ? labels.changesRequested : labels.rejectedTitle}</strong>
                <p>{status.kind === "changes" ? `${labels.changesRequestedBody} ${labels.changesKeep}` : labels.rejectedBody}</p>
                {feedback?.review ? <ReviewerNotes review={feedback.review} brief={brief} labels={labels} num={num} /> : null}
              </div>
            ) : null}
            {submitted && feedback?.version ? (
              <SubmittedSummary
                version={feedback.version}
                brief={brief}
                labels={labels}
                verified={status.kind === "verified"}
                onBack={() => setStep(2)}
                onNext={() => setStep(status.step as Step)}
              />
            ) : (
            <SubmissionForm
              locale={locale}
              userId={userId}
              missionKey={brief.missionKey}
              repositoryLabel={brief.repositoryLabel}
              repositoryHint={brief.repositoryHint}
              deploymentLabel={brief.deploymentLabel}
              deploymentHint={brief.deploymentHint}
              reflectionPlaceholder={brief.reflectionPlaceholder}
              criteriaCount={total}
              initial={status.kind === "none" ? null : feedback?.version}
              backLabel={labels.back}
              onBack={() => setStep(2)}
              readOnly={readOnly}
            />
            )}
          </>
        ) : null}

        {step === 4 && status.kind === "checking" ? (
          <div className="runner-state" role="status">
            <strong>{labels.checkingTitle}</strong>
            <p>{slowCheck ? labels.checkingSlow : labels.checkingBody}</p>
          </div>
        ) : null}

        {step === 4 && status.kind === "completed" ? (
          <>
            <div className="runner-state completed" role="status">
              <strong><Check size={16} aria-hidden="true" /> {labels.completedTitle}</strong>
              <p>{labels.completedBody.replace("{n}", num(total))}</p>
              {feedback?.check?.observations.length ? (
                <>
                  <span className="runner-checks-title">{labels.checksTitle}</span>
                  <CheckList observations={feedback.check.observations} labels={labels} linkName={linkName} />
                </>
              ) : null}
            </div>
            <Link className="button primary compact runner-cta" href="/app/missions">{labels.backToTrail} <ArrowRight size={15} aria-hidden="true" /></Link>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <div className="runner-state success">
              <strong>{labels.verified}</strong>
              <p>{labels.verifiedBody}</p>
            </div>
            <Link className="button primary compact runner-cta" href="/app/proof">{labels.viewProof}</Link>
          </>
        ) : null}

        {/* Steps 1 and 2 share this footer. Step 3 carries its own, with Submit
            beside Back; steps 4 and 5 end on their own call to action. */}
        {step <= 2 ? (
          <footer className="runner-foot">
            <span className="runner-saved">
              {step === 2 && loaded
                ? `${labels.doneCount.replace("{a}", num(done)).replace("{b}", num(total))} · ${labels.savedLocally}`
                : ""}
            </span>
            <span className="runner-nav">
              {step === 2 ? (
                <button type="button" className="button outline compact" onClick={() => setStep(1)}>
                  <ArrowLeft size={15} aria-hidden="true" /> {labels.back}
                </button>
              ) : null}
              {step < 3 ? (
                <button type="button" className="button primary compact" onClick={() => setStep(forward)}>
                  {step === 2 && reachable(3) ? labels.toSubmit : labels.next} <ArrowRight size={15} aria-hidden="true" />
                </button>
              ) : null}
            </span>
          </footer>
        ) : null}
      </div>
    </section>
  );
}

/** The reviewer's words first, then the score for each step-2 criterion. */
function ReviewerNotes({ review, brief, labels, num }: { review: NonNullable<MissionFeedback["review"]>; brief: MissionBrief; labels: RunnerLabels; num: (value: number) => string }) {
  const scored = brief.deliverables.filter((item) => typeof review.scores[item.id] === "number");
  return (
    <div className="runner-review">
      <span className="runner-checks-title">{labels.reviewerNotes}</span>
      <p className="runner-review-notes">{review.notes}</p>
      {scored.length ? (
        <dl className="runner-scores" aria-label={labels.scoresTitle}>
          {scored.map((item) => (
            <div key={item.id}>
              <dt>{item.title}</dt>
              <dd>{labels.scoreOf.replace("{a}", num(review.scores[item.id])).replace("{max}", num(4))}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

/** Step 3 after the work is in: the version reviewers read, not a form. */
function SubmittedSummary({ version, brief, labels, verified, onBack, onNext }: {
  version: NonNullable<MissionFeedback["version"]>;
  brief: MissionBrief;
  labels: RunnerLabels;
  verified: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const link = (url: string) => <a href={url} target="_blank" rel="noreferrer">{url}</a>;
  return (
    <div className="submitted-summary">
      <h2>{labels.submittedTitle}</h2>
      <p className="submit-help">{verified ? labels.submittedVerified : labels.submittedWaiting}</p>
      <dl className="detail-list">
        <div><dt>{brief.repositoryLabel}</dt><dd>{link(version.repositoryUrl)}</dd></div>
        <div><dt>{brief.deploymentLabel}</dt><dd>{link(version.deploymentUrl)}</dd></div>
        {version.screenshotUrl ? <div><dt>{labels.screenshotLabel}</dt><dd>{link(version.screenshotUrl)}</dd></div> : null}
        <div><dt>{labels.reflectionLabel}</dt><dd className="review-reflection">{version.reflection}</dd></div>
      </dl>
      <footer className="runner-foot">
        <span className="runner-saved" />
        <span className="runner-nav">
          <button type="button" className="button outline compact" onClick={onBack}>
            <ArrowLeft size={15} aria-hidden="true" /> {labels.back}
          </button>
          <button type="button" className="button primary compact" onClick={onNext}>
            {labels.next} <ArrowRight size={15} aria-hidden="true" />
          </button>
        </span>
      </footer>
    </div>
  );
}
