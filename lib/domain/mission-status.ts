import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { SubmissionState } from "@/lib/domain/types";

/**
 * What a learner sees for a submission, in one place.
 *
 * A mission has two honest tiers (SPEC.md section 3): a link check makes it
 * Completed and moves the trail map on, and only a human review makes it
 * Verified with proof and XP. The runner, Today and Portfolio all read this
 * mapping, so the three never disagree about where a submission stands.
 *
 *   none / draft                     -> free to work, steps 1 to 3
 *   submitted, deterministic_running -> 4  checking the links
 *   automated_feedback_ready         -> 3  a link is broken, fix and resubmit
 *   automated_*, human_review_*      -> 4  Completed, waiting for a reviewer
 *   changes_requested                -> 3  reviewer notes, map position kept
 *   rejected                         -> 3  reviewer notes, a new attempt
 *   verified                         -> 5  proof
 */
export type LearnerStatusKind = "none" | "checking" | "fix_links" | "completed" | "changes" | "rejected" | "verified";

export type LearnerStatus = {
  kind: LearnerStatusKind;
  /** The step the submission holds the learner on, or null when they move freely. */
  step: 3 | 4 | 5 | null;
};

export function learnerStatus(state: SubmissionState | null | undefined): LearnerStatus {
  switch (state) {
    case null:
    case undefined:
    case "draft":
    case "closed":
      return { kind: "none", step: null };
    case "submitted":
    case "deterministic_running":
      return { kind: "checking", step: 4 };
    case "automated_feedback_ready":
      return { kind: "fix_links", step: 3 };
    case "changes_requested":
    case "appeal_requested":
      return { kind: "changes", step: 3 };
    case "rejected":
      return { kind: "rejected", step: 3 };
    case "verified":
      return { kind: "verified", step: 5 };
    default:
      // automated_feedback_ready aside, every automated_* and human_review_*
      // state means the links are in and a reviewer has it.
      return { kind: "completed", step: 4 };
  }
}

/** Minutes after which "checking your links" admits it is taking a while. */
export const SLOW_CHECK_MINUTES = 10;

export const REFLECTION_MIN = 40;
export const REFLECTION_MAX = 1500;

/** True when a link check has been running longer than it usually takes. */
export function isSlowCheck(state: SubmissionState | null | undefined, updatedAt: string | undefined, now = Date.now()) {
  if (learnerStatus(state).kind !== "checking" || !updatedAt) return false;
  return now - Date.parse(updatedAt) > SLOW_CHECK_MINUTES * 60_000;
}

/** How long a submission has waited, in the largest whole unit: "40 min", "3 h", "2 d". */
export function formatWaiting(locale: string, iso: string, now = Date.now()) {
  const minutes = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  const my = locale === "my";
  const [n, unit] = minutes < 60
    ? [minutes, my ? "မိနစ်" : "min"]
    : minutes < 60 * 24
      ? [Math.round(minutes / 60), my ? "နာရီ" : "h"]
      : [Math.round(minutes / (60 * 24)), my ? "ရက်" : "d"];
  return `${my ? toMyanmarDigits(n) : n} ${unit}`;
}
