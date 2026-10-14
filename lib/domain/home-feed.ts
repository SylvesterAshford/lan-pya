import { byDeadlineAscending, getDeadlineStatus } from "@/lib/domain/deadlines";
import { learnerStatus, type LearnerStatusKind } from "@/lib/domain/mission-status";
import type { SubmissionState } from "@/lib/domain/types";

/**
 * Home's "Up next" list, built only from the learner's own records.
 *
 * Home used to stack five panels: a fixed Learn/Build/Prove/Opportunity strip,
 * a week card, a proof card, an opportunity card that showed the first listing
 * even after it closed, and release notes. This keeps the parts that are about
 * this learner, in the order they need attention:
 *
 *   1. their mission, when a submission needs them or is waiting on review
 *   2. work they paused on another path
 *   3. opportunities still open, soonest deadline first
 *
 * At most MAX rows. Nothing here is copy that reads the same for everyone.
 */

export const MAX_UP_NEXT = 4;

export type UpNextItem =
  | { kind: "mission"; key: string; missionKey: string; title: string; status: Exclude<LearnerStatusKind, "none" | "verified"> }
  | { kind: "paused"; key: string; missionKey: string; title: string; pathTitle: string }
  | { kind: "opportunity"; key: string; id: string; title: string; organization: string; deadline: string; matches: number };

export function buildUpNext({
  mission,
  paused,
  opportunities,
  now,
}: {
  mission: { key: string; title: string; submissionState: SubmissionState | null } | null;
  paused: Array<{ missionKey: string; missionTitle: string; pathTitle: string }>;
  opportunities: Array<{ id: string; title: string; organization: string; deadline: string; supported: string[] }>;
  now?: Date;
}): UpNextItem[] {
  const items: UpNextItem[] = [];

  const status = learnerStatus(mission?.submissionState).kind;
  if (mission && status !== "none" && status !== "verified") {
    items.push({ kind: "mission", key: `mission-${mission.key}`, missionKey: mission.key, title: mission.title, status });
  }

  // The current mission is never also "paused work": it has one row, above.
  for (const work of paused.filter((item) => item.missionKey !== mission?.key)) {
    items.push({ kind: "paused", key: `paused-${work.missionKey}`, missionKey: work.missionKey, title: work.missionTitle, pathTitle: work.pathTitle });
  }

  // A closed listing is not something to do next.
  const open = opportunities
    .filter((item) => getDeadlineStatus(item.deadline, now).urgency !== "past")
    .sort(byDeadlineAscending);
  for (const item of open) {
    items.push({ kind: "opportunity", key: `opp-${item.id}`, id: item.id, title: item.title, organization: item.organization, deadline: item.deadline, matches: item.supported.length });
  }

  return items.slice(0, MAX_UP_NEXT);
}
