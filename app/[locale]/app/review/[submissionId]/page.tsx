import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getRoles } from "@/lib/data/app-data";
import { createClient } from "@/lib/supabase/server";
import { ReviewActionForm } from "@/components/review/review-action-form";

export default async function ReviewDetailPage({ params }: { params: Promise<{ locale: string; submissionId: string }> }) {
  const { locale, submissionId } = await params; const user = await requireUser(locale); const roles = await getRoles(user.id);
  if (!roles.has("reviewer") && !roles.has("reviewer_lead")) notFound();
  const supabase = await createClient();
  await supabase.rpc("claim_submission", { p_submission_id: submissionId });
  const { data } = await supabase.rpc("get_review_submission", { p_submission_id: submissionId });
  if (!data) notFound();
  const item = data as Record<string, unknown>;
  return <div className="app-page"><section className="page-heading"><span className="eyebrow">RUBRIC v1 · CLAIMED REVIEW</span><h1>{String(item.mission_title ?? "Responsive Profile Card")}</h1><p>Review the rendered work, repository evidence, learner reflection, and deterministic observations.</p></section><div className="review-layout"><section className="panel"><h2>Submitted evidence</h2><dl className="detail-list"><div><dt>Repository</dt><dd><a href={String(item.repository_url)} target="_blank" rel="noreferrer">{String(item.repository_url)}</a></dd></div><div><dt>Deployment</dt><dd><a href={String(item.deployment_url)} target="_blank" rel="noreferrer">{String(item.deployment_url)}</a></dd></div><div><dt>Reflection</dt><dd>{String(item.reflection)}</dd></div><div><dt>Automated result</dt><dd>{String(item.automated_summary ?? "Not available or inconclusive")}</dd></div></dl></section><section className="panel"><h2>Reviewer decision</h2><p>All scores and notes become part of the immutable review record.</p><ReviewActionForm submissionId={submissionId} /></section></div></div>;
}
