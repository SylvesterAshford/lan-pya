import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getReviewQueue, getRoles } from "@/lib/data/app-data";
import { Link } from "@/i18n/navigation";
import { StatusPill } from "@/components/app/status-pill";

export default async function ReviewQueuePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; const user = await requireUser(locale); const roles = await getRoles(user.id);
  if (!roles.has("reviewer") && !roles.has("reviewer_lead")) notFound();
  const queue = await getReviewQueue();
  const my = locale === "my";
  return <div className="app-page"><section className="page-heading"><span className="eyebrow">{my ? "လူသားစစ်ဆေးမှု စာရင်း" : "HUMAN REVIEW QUEUE"}</span><h1>{my ? "သင်ယူသူကို မဟုတ်ဘဲ သက်သေကို စစ်ဆေးပါ။" : "Judge the evidence, not the learner."}</h1><p>{my ? "လေ့ကျင့်ထားသော reviewer က versioned rubric ကို အသုံးပြုစစ်ဆေးမချင်း claim များကို အတည်မပြုပါ။ စနစ်ထွက်ရလဒ်သည် အထောက်အကူပြု context သာဖြစ်သည်။" : "Claims remain unverified until a trained reviewer applies the versioned rubric. Automated output is supporting context only."}</p></section><section className="panel queue-panel"><div className="panel-heading"><h2>{my ? "ဖွင့်ထားသော တင်သွင်းချက်များ" : "Open submissions"}</h2><StatusPill tone={queue.length ? "warning" : "success"}>{queue.length} {my ? "စောင့်ဆိုင်းနေသည်" : "waiting"}</StatusPill></div>{queue.length ? <div className="queue-list">{queue.map((item) => <Link href={`/app/review/${String(item.submission_id)}`} key={String(item.submission_id)}><span><strong>{String(item.mission_title ?? "Responsive Profile Card")}</strong><small>{String(item.learner_alias ?? (my ? "ကိုယ်ပိုင်သင်ယူသူ" : "Private learner"))} · {my ? "တင်သွင်းသည်" : "submitted"} {String(item.submitted_at ?? (my ? "မကြာသေးမီက" : "recently"))}</small></span><span>{my ? "စစ်ဆေးပါ" : "Review"} →</span></Link>)}</div> : <div className="empty-state compact"><h3>{my ? "စောင့်ဆိုင်းနေသော တင်သွင်းချက်မရှိပါ။" : "No submissions are waiting."}</h3><p>{my ? "စနစ်စစ်ဆေးမှု ပြီးမြောက်ချိန် သို့မဟုတ် မသေချာသောရလဒ် ပြန်လာချိန်တွင် item အသစ်များ ပေါ်လာပါမည်။" : "New items appear after deterministic checks complete or return inconclusive."}</p></div>}</section></div>;
}
