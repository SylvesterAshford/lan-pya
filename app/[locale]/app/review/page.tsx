import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getReviewQueue, getRoles } from "@/lib/data/app-data";
import { Link } from "@/i18n/navigation";
import { StatusPill } from "@/components/app/status-pill";
import { getMissionBrief } from "@/lib/domain/mission-briefs";
import { formatWaiting } from "@/lib/domain/mission-status";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { getAppCopy } from "@/lib/i18n/app-copy";

export default async function ReviewQueuePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; const user = await requireUser(locale); const roles = await getRoles(user.id);
  if (!roles.has("reviewer") && !roles.has("reviewer_lead")) notFound();
  const queue = await getReviewQueue();
  const c = getAppCopy(locale).review;
  const count = locale === "my" ? toMyanmarDigits(queue.length) : String(queue.length);
  const outcome = (value: unknown) => c.outcome[(String(value ?? "none")) as keyof typeof c.outcome] ?? c.outcome.none;

  return (
    <div className="app-page">
      <section className="page-heading compact-heading">
        <span className="eyebrow">{c.eyebrow}</span>
        <h1>{c.title}</h1>
        <p>{c.body}</p>
      </section>
      <section className="panel queue-panel" aria-labelledby="queue-title">
        <div className="panel-heading">
          <h2 id="queue-title">{c.open}</h2>
          <StatusPill tone={queue.length ? "warning" : "success"}>{count}</StatusPill>
        </div>
        {queue.length ? (
          <ul className="queue-list">
            {queue.map((item) => {
              const id = String(item.submission_id);
              const title = getMissionBrief(String(item.mission_key ?? ""), locale)?.title ?? String(item.mission_title ?? "");
              return (
                <li key={id}>
                  <Link href={`/app/review/${id}`}>
                    <span>
                      <strong>{title}</strong>
                      <small>
                        {String(item.learner_alias ?? c.privateLearner)} · {c.waiting.replace("{t}", formatWaiting(locale, String(item.waiting_since ?? item.submitted_at)))} · {outcome(item.check_outcome)}
                      </small>
                    </span>
                    <span className="queue-action">
                      {item.claimed_by_me ? <span className="path-row-here">{c.yours}</span> : null}
                      {c.review} <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-state compact"><h3>{c.none}</h3><p>{c.noneBody}</p></div>
        )}
      </section>
    </div>
  );
}
