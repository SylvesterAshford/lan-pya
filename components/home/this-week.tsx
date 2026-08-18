import { ArrowRight, CalendarClock, PauseCircle } from "lucide-react";
import { DeadlineChip } from "@/components/app/deadline-chip";
import { byDeadlineAscending, toMyanmarDigits } from "@/lib/domain/deadlines";
import { Link } from "@/i18n/navigation";

/**
 * "This week" — the next seven days, stated honestly.
 *
 * The founder reference for this slot was a five-day study schedule with a
 * per-day activity and a duration ("Code practice, 45 min"). This product has
 * no study planner: it does not author daily sessions, does not estimate
 * minutes, and does not know when a learner intends to work. Rendering that
 * panel would mean inventing all three, which is the one thing DESIGN.md's
 * voice rule ("Numbers with sources") forbids outright.
 *
 * So the panel shows what the next seven days genuinely contain:
 *
 *   1. Opportunities whose deadline falls inside the window. The countdown is
 *      already the product's daily-return mechanic (Design Spec §2), and a
 *      closing date is a real, dated commitment made by somebody else.
 *   2. Work the learner paused and has not come back to. Also a fact, recorded
 *      on `ActivePathDashboard.pausedWork`.
 *
 * When neither exists the panel says so, rather than filling the space.
 * DESIGN.md: "Pages end honestly."
 *
 * The seven-day window itself is applied by the caller, which owns the clock;
 * this component sorts what it is given soonest-first and renders it.
 */
export function ThisWeek({
  locale,
  closing,
  paused,
  labels,
}: {
  locale: string;
  closing: { id: string; title: string; organization: string; deadline: string }[];
  paused: { missionKey: string; missionTitle: string; pathTitle: string }[];
  labels: {
    title: string;
    body: string;
    closingTitle: string;
    pausedTitle: string;
    empty: string;
    viewAll: string;
    resume: string;
  };
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));

  // Soonest first, matching the Opportunities feed. Sorting a copy keeps the
  // caller's array untouched.
  const closingSoonest = [...closing].sort(byDeadlineAscending);
  const isEmpty = closingSoonest.length === 0 && paused.length === 0;

  return (
    <section className="week" aria-labelledby="week-heading">
      <header className="week-head">
        <h2 id="week-heading" className="week-title">
          {labels.title}
        </h2>
        <p className="week-body">{labels.body}</p>
      </header>

      {isEmpty ? (
        <p className="week-empty">{labels.empty}</p>
      ) : (
        <div className="week-groups">
          {closingSoonest.length > 0 ? (
            <div className="week-group">
              <h3 className="week-group-title">
                <CalendarClock size={14} aria-hidden="true" />
                <span>{labels.closingTitle}</span>
                <span className="week-count">{num(closingSoonest.length)}</span>
              </h3>
              <ul className="week-list">
                {closingSoonest.map((item) => (
                  <li key={item.id} className="week-row">
                    <Link href="/app/opportunities" className="week-row-main">
                      <span className="week-row-title">{item.title}</span>
                      <span className="week-row-meta">{item.organization}</span>
                    </Link>
                    <DeadlineChip locale={locale} deadline={item.deadline} />
                  </li>
                ))}
              </ul>
              <Link href="/app/opportunities" className="week-more">
                <span>{labels.viewAll}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          ) : null}

          {paused.length > 0 ? (
            <div className="week-group">
              <h3 className="week-group-title">
                <PauseCircle size={14} aria-hidden="true" />
                <span>{labels.pausedTitle}</span>
                <span className="week-count">{num(paused.length)}</span>
              </h3>
              <ul className="week-list">
                {paused.map((item) => (
                  <li key={item.missionKey} className="week-row">
                    <Link href="/app/missions" className="week-row-main">
                      <span className="week-row-title">{item.missionTitle}</span>
                      <span className="week-row-meta">{item.pathTitle}</span>
                    </Link>
                    <Link href="/app/missions" className="week-resume">
                      <span>{labels.resume}</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
