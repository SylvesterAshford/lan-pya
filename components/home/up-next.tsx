import { ArrowRight, Briefcase, CircleAlert, Clock3, Pause } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { UpNextItem } from "@/lib/domain/home-feed";
import { formatDeadlineCountdown, getDeadlineStatus, toMyanmarDigits } from "@/lib/domain/deadlines";
import { formatAppDate, type getAppCopy } from "@/lib/i18n/app-copy";

type Labels = ReturnType<typeof getAppCopy>["home"]["feed"];
type RunnerLabels = ReturnType<typeof getAppCopy>["runner"];

const missionHref: Record<string, string> = {
  "responsive-profile-card": "/app/missions/responsive-profile-card",
  "content-creator-awareness": "/app/missions/content-creator-awareness",
  "video-editor-vertical-story": "/app/missions/video-editor-vertical-story",
};

/**
 * One list of what needs the learner, in priority order (see buildUpNext).
 * Each row is a title, one quiet line saying why it is here, and the action.
 */
export function UpNext({ items, locale, labels, runner }: { items: UpNextItem[]; locale: string; labels: Labels; runner: RunnerLabels }) {
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));

  const row = (item: UpNextItem) => {
    if (item.kind === "mission") {
      const needsYou = item.status === "fix_links" || item.status === "changes" || item.status === "rejected";
      const status = item.status === "checking" ? runner.checkingTitle
        : item.status === "completed" ? runner.completedTitle
        : item.status === "fix_links" ? runner.fixTitle
        : item.status === "changes" ? runner.changesRequested
        : runner.rejectedTitle;
      return {
        href: missionHref[item.missionKey] ?? "/app/missions",
        icon: needsYou ? <CircleAlert size={18} aria-hidden="true" /> : <Clock3 size={18} aria-hidden="true" />,
        tone: needsYou ? "attention" : "waiting",
        title: item.title, meta: status, action: needsYou ? labels.open : labels.view,
      };
    }
    if (item.kind === "paused") {
      return {
        href: missionHref[item.missionKey] ?? "/app/missions",
        icon: <Pause size={18} aria-hidden="true" />, tone: "quiet",
        title: item.title, meta: labels.paused.replace("{path}", item.pathTitle), action: labels.resume,
      };
    }
    const status = getDeadlineStatus(item.deadline);
    const when = formatDeadlineCountdown(locale, status) ?? labels.closes.replace("{date}", formatAppDate(locale, item.deadline));
    const match = item.matches ? ` · ${labels.matches.replace("{n}", num(item.matches))}` : "";
    return {
      href: "/app/opportunities",
      icon: <Briefcase size={18} aria-hidden="true" />,
      tone: status.urgency === "today" || status.urgency === "tomorrow" || status.urgency === "soon" ? "attention" : "quiet",
      title: item.title, meta: `${item.organization} · ${when}${match}`, action: labels.view,
    };
  };

  return (
    <section className="home-block" aria-labelledby="up-next-title">
      <h2 id="up-next-title">{labels.title}</h2>
      {items.length ? (
        <ul className="home-list">
          {items.map((item) => {
            const r = row(item);
            return (
              <li key={item.key}>
                <Link href={r.href} className="home-row">
                  <span className={`home-row-icon is-${r.tone}`}>{r.icon}</span>
                  <span className="home-row-copy">
                    <strong>{r.title}</strong>
                    <small>{r.meta}</small>
                  </span>
                  <span className="home-row-action">{r.action}<ArrowRight size={15} aria-hidden="true" /></span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="home-empty">{labels.empty}</p>
      )}
    </section>
  );
}
