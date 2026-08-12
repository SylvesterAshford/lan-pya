import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getReviewQueue, getRoles } from "@/lib/data/app-data";
import { Link } from "@/i18n/navigation";
import { StatusPill } from "@/components/app/status-pill";

export default async function ReviewQueuePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; const user = await requireUser(locale); const roles = await getRoles(user.id);
  if (!roles.has("reviewer") && !roles.has("reviewer_lead")) notFound();
  const queue = await getReviewQueue();
  return <div className="app-page"><section className="page-heading"><span className="eyebrow">HUMAN REVIEW QUEUE</span><h1>Judge the evidence, not the learner.</h1><p>Claims remain unverified until a trained reviewer applies the versioned rubric. Automated output is supporting context only.</p></section><section className="panel queue-panel"><div className="panel-heading"><h2>Open submissions</h2><StatusPill tone={queue.length ? "warning" : "success"}>{queue.length} waiting</StatusPill></div>{queue.length ? <div className="queue-list">{queue.map((item) => <Link href={`/app/review/${String(item.submission_id)}`} key={String(item.submission_id)}><span><strong>{String(item.mission_title ?? "Responsive Profile Card")}</strong><small>{String(item.learner_alias ?? "Private learner")} · submitted {String(item.submitted_at ?? "recently")}</small></span><span>Review →</span></Link>)}</div> : <div className="empty-state compact"><h3>No submissions are waiting.</h3><p>New items appear after deterministic checks complete or return inconclusive.</p></div>}</section></div>;
}
