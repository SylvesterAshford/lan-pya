import { describe, expect, it } from "vitest";
import { formatWaiting, isSlowCheck, learnerStatus } from "@/lib/domain/mission-status";
import type { SubmissionState } from "@/lib/domain/types";

describe("learnerStatus", () => {
  // SPEC.md section 3.2: one table, read by the runner, Portfolio and Missions.
  const table: Array<[SubmissionState | null, string, number | null]> = [
    [null, "none", null],
    ["draft", "none", null],
    ["closed", "none", null],
    ["submitted", "checking", 4],
    ["deterministic_running", "checking", 4],
    ["automated_feedback_ready", "fix_links", 3],
    ["automated_inconclusive", "completed", 4],
    ["automated_skipped", "completed", 4],
    ["human_review_queued", "completed", 4],
    ["human_review_in_progress", "completed", 4],
    ["changes_requested", "changes", 3],
    ["appeal_requested", "changes", 3],
    ["rejected", "rejected", 3],
    ["verified", "verified", 5],
  ];

  it.each(table)("%s reads as %s on step %s", (state, kind, step) => {
    expect(learnerStatus(state)).toEqual({ kind, step });
  });

  // A rejected attempt used to fall through to "With a reviewer" forever.
  it("never leaves a rejected learner waiting on step 4", () => {
    expect(learnerStatus("rejected").step).toBe(3);
  });
});

describe("isSlowCheck", () => {
  const now = Date.parse("2026-10-13T12:00:00Z");
  it("admits a check is slow only after ten minutes of checking", () => {
    expect(isSlowCheck("deterministic_running", "2026-10-13T11:55:00Z", now)).toBe(false);
    expect(isSlowCheck("deterministic_running", "2026-10-13T11:45:00Z", now)).toBe(true);
  });
  it("is never slow once the check is done", () => {
    expect(isSlowCheck("human_review_queued", "2026-10-01T00:00:00Z", now)).toBe(false);
  });
});

describe("formatWaiting", () => {
  const now = Date.parse("2026-10-13T12:00:00Z");
  it("uses the largest whole unit", () => {
    expect(formatWaiting("en", "2026-10-13T11:20:00Z", now)).toBe("40 min");
    expect(formatWaiting("en", "2026-10-13T09:00:00Z", now)).toBe("3 h");
    expect(formatWaiting("en", "2026-10-11T12:00:00Z", now)).toBe("2 d");
  });
  it("writes Burmese digits and units", () => {
    expect(formatWaiting("my", "2026-10-11T12:00:00Z", now)).toBe("၂ ရက်");
  });
});
