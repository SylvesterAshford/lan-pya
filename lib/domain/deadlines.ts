/**
 * Deadline countdown — Design Specification v1.1 §2 and §3.5.
 *
 * "Deadline is the heartbeat. The opportunities feed sorts by soonest deadline
 * and shows countdowns with escalating urgency colour. This is the app's
 * daily-return mechanic."
 *
 * Thresholds and tones are defined in DESIGN.md under "Deadlines". This is the
 * one place amber escalation is required rather than merely permitted.
 */

export type DeadlineUrgency = "past" | "today" | "tomorrow" | "soon" | "upcoming";

export type DeadlineStatus = {
  urgency: DeadlineUrgency;
  /** Whole calendar days from today. Negative once the deadline has passed. */
  daysRemaining: number;
  /** Amber for anything inside a week, muted once closed, neutral otherwise. */
  tone: "amber" | "muted" | "neutral";
  /** True when the caller should render the absolute date instead of a phrase. */
  showAbsoluteDate: boolean;
};

const MYANMAR_DIGITS = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];

export function toMyanmarDigits(value: number): string {
  return String(value).replace(/\d/g, (d) => MYANMAR_DIGITS[Number(d)]);
}

/**
 * Normalise a deadline to local midnight.
 *
 * Postgres `date` columns arrive as "2026-08-20". `new Date("2026-08-20")`
 * parses that as UTC midnight, which is the previous calendar day in every
 * negative-offset timezone — an off-by-one on the number the learner reads.
 * Date-only strings are therefore parsed as local calendar dates.
 */
export function toLocalMidnight(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (isoDateOnly) {
    return new Date(Number(isoDateOnly[1]), Number(isoDateOnly[2]) - 1, Number(isoDateOnly[3]));
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date(NaN);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/**
 * Today's calendar date in Myanmar time.
 *
 * These pages render on Vercel, which runs in UTC, while the learners and the
 * organisations setting these deadlines are on UTC+06:30. Between 00:00 and
 * 06:30 MMT a UTC "today" is still yesterday, so an unqualified new Date()
 * would tell a learner in Yangon that a deadline is one day further away than
 * it is. Deadlines are anchored to the audience's calendar.
 */
export function getAppToday(reference: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Yangon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(reference);
  return toLocalMidnight(parts);
}

export function getDeadlineStatus(deadline: string | Date, now: Date = getAppToday()): DeadlineStatus {
  const target = toLocalMidnight(deadline);
  if (Number.isNaN(target.getTime())) {
    return { urgency: "upcoming", daysRemaining: Number.NaN, tone: "neutral", showAbsoluteDate: true };
  }
  const today = toLocalMidnight(now);
  // Both operands are local midnight, so this is a whole number of days except
  // across a DST boundary, where rounding keeps it exact.
  const daysRemaining = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (daysRemaining < 0) return { urgency: "past", daysRemaining, tone: "muted", showAbsoluteDate: false };
  if (daysRemaining === 0) return { urgency: "today", daysRemaining, tone: "amber", showAbsoluteDate: false };
  if (daysRemaining === 1) return { urgency: "tomorrow", daysRemaining, tone: "amber", showAbsoluteDate: false };
  if (daysRemaining <= 7) return { urgency: "soon", daysRemaining, tone: "amber", showAbsoluteDate: false };
  return { urgency: "upcoming", daysRemaining, tone: "neutral", showAbsoluteDate: true };
}

/**
 * Countdown phrase for a deadline. Returns null when the caller should render
 * the absolute date instead, which keeps the "≥ 8 days shows a date" rule in
 * one place rather than duplicated at each call site.
 */
export function formatDeadlineCountdown(locale: string, status: DeadlineStatus): string | null {
  const my = locale === "my";
  switch (status.urgency) {
    case "past":
      return my ? "ပိတ်သွားပြီ" : "Closed";
    case "today":
      return my ? "ယနေ့ နောက်ဆုံးရက်" : "Closes today";
    case "tomorrow":
      return my ? "မနက်ဖြန် နောက်ဆုံးရက်" : "Closes tomorrow";
    case "soon":
      return my
        ? `${toMyanmarDigits(status.daysRemaining)} ရက် ကျန်`
        : `Closes in ${status.daysRemaining} days`;
    default:
      return null;
  }
}

/** Ascending by deadline, soonest first. Unparseable dates sort last. */
export function byDeadlineAscending<T extends { deadline: string }>(a: T, b: T): number {
  const left = toLocalMidnight(a.deadline).getTime();
  const right = toLocalMidnight(b.deadline).getTime();
  if (Number.isNaN(left)) return 1;
  if (Number.isNaN(right)) return -1;
  return left - right;
}
