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
  const my = locale === "my";
  const rubricKeys = String(item.mission_key) === "content-creator-awareness" ? ["audience_research", "content_quality", "accessibility_safety", "reflection"] : ["semantic", "responsive", "accessibility", "explanation"];
  return <div className="app-page"><section className="page-heading"><span className="eyebrow">{String(item.rubric_version ?? "RUBRIC v1")} · {my ? "တာဝန်ယူထားသော REVIEW" : "CLAIMED REVIEW"}</span><h1>{String(item.mission_title ?? "Responsive Profile Card")}</h1><p>{my ? "Render လုပ်ထားသော လက်ရာ၊ repository သက်သေ၊ သင်ယူသူ၏ reflection နှင့် စနစ်မှ တွေ့ရှိချက်များကို စစ်ဆေးပါ။" : "Review the rendered work, repository evidence, learner reflection, and deterministic observations."}</p></section><div className="review-layout"><section className="panel"><h2>{my ? "တင်သွင်းထားသော သက်သေ" : "Submitted evidence"}</h2><dl className="detail-list"><div><dt>{my ? "အဓိကလက်ရာ" : "Primary work"}</dt><dd><a href={String(item.repository_url)} target="_blank" rel="noreferrer">{String(item.repository_url)}</a></dd></div><div><dt>{my ? "Public preview" : "Public preview"}</dt><dd><a href={String(item.deployment_url)} target="_blank" rel="noreferrer">{String(item.deployment_url)}</a></dd></div><div><dt>{my ? "ပြန်လည်သုံးသပ်ချက်" : "Reflection"}</dt><dd>{String(item.reflection)}</dd></div><div><dt>{my ? "စနစ်စစ်ဆေးမှုရလဒ်" : "Automated result"}</dt><dd>{String(item.automated_summary ?? (my ? "မရရှိသေးပါ သို့မဟုတ် မသေချာပါ" : "Not available or inconclusive"))}</dd></div></dl></section><section className="panel"><h2>{my ? "Reviewer ဆုံးဖြတ်ချက်" : "Reviewer decision"}</h2><p>{my ? "Score နှင့် မှတ်ချက်အားလုံးကို မပြောင်းလဲနိုင်သော review record တွင် သိမ်းဆည်းပါသည်။" : "All scores and notes become part of the immutable review record."}</p><ReviewActionForm locale={locale} submissionId={submissionId} rubricKeys={rubricKeys} /></section></div></div>;
}
