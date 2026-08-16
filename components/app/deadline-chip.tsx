import { CalendarClock } from "lucide-react";
import { formatDeadlineCountdown, getDeadlineStatus } from "@/lib/domain/deadlines";
import { formatAppDate } from "@/lib/i18n/app-copy";

/**
 * Deadline countdown chip. Design Spec §2 calls this the app's daily-return
 * mechanic, and §3.5 specifies the amber tint at seven days or fewer.
 *
 * Amber here means urgency, never "good" — brand doc §2.2 rule 2. This is chrome
 * amber, which is why it never appears on the roadmap canvas.
 */
export function DeadlineChip({
  locale,
  deadline,
  showIcon = true,
}: {
  locale: string;
  deadline: string;
  showIcon?: boolean;
}) {
  const status = getDeadlineStatus(deadline);
  const countdown = formatDeadlineCountdown(locale, status);
  const absolute = formatAppDate(locale, deadline);

  // Beyond a week the absolute date is more useful than "closes in 24 days".
  const text = countdown ?? absolute;

  return (
    <span className={`deadline-chip ${status.tone}`}>
      {showIcon ? <CalendarClock size={13} aria-hidden="true" /> : null}
      {/* The countdown is the scannable part; the exact date stays available to
          screen readers and on hover so nothing is lost by abbreviating it. */}
      <span title={absolute}>{text}</span>
      {countdown ? <span className="sr-only">{`(${absolute})`}</span> : null}
    </span>
  );
}
