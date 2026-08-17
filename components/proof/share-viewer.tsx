"use client";

import { useEffect, useState } from "react";

type Proof = { alias?: string; title?: string; verified_at?: string; rubric_version?: string; reviewer_tier?: string; competencies?: string[]; repository_url?: string; deployment_url?: string; data_origin?: string };

export function ShareViewer({ shareId, locale = "en" }: { shareId: string; locale?: string }) {
  const my = locale === "my";
  const [proof, setProof] = useState<Proof | null>(null);
  const [error, setError] = useState("");
  // A 503 means our service could not answer, not that the learner revoked
  // their evidence. The visitor is told to retry rather than told the proof
  // is gone, because those are very different claims about a person's work.
  const [retryable, setRetryable] = useState(false);
  useEffect(() => {
    async function load() {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
      if (token) {
        const exchange = await fetch("/api/proof/share/exchange", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ shareId, token }) });
        history.replaceState(null, "", window.location.pathname);
        if (!exchange.ok) {
          const body = await exchange.json().catch(() => null);
          setRetryable(exchange.status >= 500);
          setError(body?.detail ?? (my ? "ဤသက်သေလင့်ခ်ကို မရရှိနိုင်ပါ။" : "This proof link is unavailable."));
          return;
        }
      }
      const response = await fetch(`/api/proof/share/${shareId}`, { cache: "no-store" });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setRetryable(response.status >= 500);
        setError(body?.detail ?? (my ? "ဤသက်သေလင့်ခ်ကို မရရှိနိုင်ပါ။" : "This proof link is unavailable."));
        return;
      }
      setProof(body.data);
    }
    load();
  }, [my, shareId]);
  if (error) return (
    <section className="public-proof-card error-state">
      <h1>{retryable
        ? (my ? "ယာယီ ချို့ယွင်းနေပါသည်" : "Temporarily unavailable")
        : (my ? "သက်သေကို မရရှိနိုင်ပါ" : "Proof unavailable")}</h1>
      <p>{error}</p>
      {retryable ? (
        <>
          <p className="retry-note">{my
            ? "ဤလင့်ခ်တွင် ပြဿနာမရှိပါ။ ကျွန်ုပ်တို့ဘက်မှ ယာယီ ချို့ယွင်းမှုဖြစ်သည်။"
            : "Nothing is wrong with this link. The problem is on our side."}</p>
          <button className="button outline" type="button" onClick={() => window.location.reload()}>
            {my ? "ထပ်မံကြိုးစားပါ" : "Try again"}
          </button>
        </>
      ) : null}
    </section>
  );
  if (!proof) return <section className="public-proof-card"><h1>{my ? "ယုံကြည်ရသော သက်သေကို ဖွင့်နေသည်…" : "Opening trusted proof…"}</h1><p>{my ? "ဤလင့်ခ်၏ secret ကို ခဏတာ ကိုယ်ပိုင်ကြည့်ရှုခွင့်အတွက် ပြောင်းလဲနေပါသည်။" : "The secret in this link is being exchanged for a short-lived private viewing session."}</p></section>;
  return <article className="public-proof-card"><div className="public-proof-seal">✓</div><span className="eyebrow">{my ? "LAN PYA အတည်ပြုထားသော ပရောဂျက်" : "LAN PYA VERIFIED PROJECT"}</span><h1>{proof.title}</h1><p className="proof-owner">{my ? "တည်ဆောက်သူ" : "Built by"} {proof.alias || (my ? "Lan Pya သင်ယူသူတစ်ဦး" : "a Lan Pya learner")}</p>{proof.data_origin === "seeded_demo" ? <div className="origin-label">{my ? "Seeded demonstration — လူသားမှ အတည်မပြုရသေးပါ" : "Seeded demonstration — not human-verified"}</div> : null}<dl><div><dt>{my ? "အတည်ပြုပြီး" : "Verified"}</dt><dd>{proof.verified_at ? new Date(proof.verified_at).toLocaleDateString(my ? "my-MM" : "en-US") : "—"}</dd></div><div><dt>Rubric</dt><dd>{proof.rubric_version}</dd></div><div><dt>{my ? "Review အဆင့်" : "Review tier"}</dt><dd>{proof.reviewer_tier}</dd></div></dl><div className="competency-list">{proof.competencies?.map((item) => <span key={item}>{item}</span>)}</div><div className="public-proof-actions">{proof.repository_url ? <a className="button outline" href={proof.repository_url} rel="noreferrer" target="_blank">{my ? "Repository ကြည့်ပါ" : "View repository"} ↗</a> : null}{proof.deployment_url ? <a className="button gold" href={proof.deployment_url} rel="noreferrer" target="_blank">{my ? "ပရောဂျက်ကြည့်ပါ" : "View project"} ↗</a> : null}</div><footer>{my ? "သက်သေအနှစ်ချုပ် · tracking script မပါ · ပိုင်ရှင်က လင့်ခ်ကို ရုပ်သိမ်းနိုင်သည်" : "Evidence snapshot · no tracking scripts · link can be revoked by its owner"}</footer></article>;
}
