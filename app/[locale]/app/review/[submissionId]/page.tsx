import { notFound } from "next/navigation";
import { CheckList } from "@/components/missions/check-list";
import { ReviewActionForm } from "@/components/review/review-action-form";
import { StartReviewButton } from "@/components/review/start-review-button";
import { requireUser } from "@/lib/auth";
import { getRoles, type CheckObservation } from "@/lib/data/app-data";
import { getMissionBrief } from "@/lib/domain/mission-briefs";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { getAppCopy } from "@/lib/i18n/app-copy";
import { createClient } from "@/lib/supabase/server";

const WAITING = new Set(["human_review_queued", "automated_inconclusive", "automated_skipped"]);

/**
 * One submission, read before it is claimed. Claiming is the explicit Start
 * review button; opening this page no longer takes the item off the queue.
 */
export default async function ReviewDetailPage({ params }: { params: Promise<{ locale: string; submissionId: string }> }) {
  const { locale, submissionId } = await params; const user = await requireUser(locale); const roles = await getRoles(user.id);
  if (!roles.has("reviewer") && !roles.has("reviewer_lead")) notFound();
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_review_submission", { p_submission_id: submissionId });
  if (!data) notFound();
  const item = data as Record<string, unknown>;
  const copy = getAppCopy(locale);
  const c = copy.review;
  const brief = getMissionBrief(String(item.mission_key), locale);
  if (!brief) notFound();

  const observations = (Array.isArray(item.observations) ? item.observations : []) as CheckObservation[];
  const linkName = (check: string) => (check === "repository" ? brief.repositoryLabel : check === "deployment" ? brief.deploymentLabel : check);
  const version = Number(item.version ?? 1);
  const link = (value: unknown) => <a href={String(value)} target="_blank" rel="noreferrer">{String(value)}</a>;

  return (
    <div className="app-page">
      <section className="page-heading compact-heading">
        <span className="eyebrow">{c.detailEyebrow} · {String(item.rubric_version ?? "")}</span>
        <h1>{brief.title}</h1>
        <p>{c.detailBody}</p>
      </section>
      <div className="review-layout">
        <section className="panel" aria-labelledby="evidence-title">
          <h2 id="evidence-title">{c.evidence} <small className="review-version">{c.version.replace("{n}", locale === "my" ? toMyanmarDigits(version) : String(version))}</small></h2>
          <dl className="detail-list">
            <div><dt>{brief.repositoryLabel}</dt><dd>{link(item.repository_url)}</dd></div>
            <div><dt>{brief.deploymentLabel}</dt><dd>{link(item.deployment_url)}</dd></div>
            {item.screenshot_url ? <div><dt>{c.screenshot}</dt><dd>{link(item.screenshot_url)}</dd></div> : null}
            <div><dt>{copy.mission.reflection}</dt><dd className="review-reflection">{String(item.reflection)}</dd></div>
          </dl>
          {observations.length ? (
            <>
              <span className="runner-checks-title">{c.checks}</span>
              <CheckList observations={observations} labels={copy.runner} linkName={linkName} />
            </>
          ) : null}
        </section>
        <section className="panel" aria-labelledby="decision-title">
          <h2 id="decision-title">{c.decision}</h2>
          {item.claimed_by_me ? (
            <ReviewActionForm submissionId={submissionId} criteria={brief.deliverables} labels={c} />
          ) : item.claimed_by_other ? (
            <p className="submit-help">{c.claimedOther}</p>
          ) : WAITING.has(String(item.state)) ? (
            <>
              <p className="submit-help">{c.startBody}</p>
              <StartReviewButton submissionId={submissionId} labels={c} />
            </>
          ) : (
            <p className="submit-help">{c.decided}</p>
          )}
        </section>
      </div>
    </div>
  );
}
