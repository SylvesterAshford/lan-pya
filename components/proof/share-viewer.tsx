"use client";

import { useEffect, useState } from "react";

type Proof = { alias?: string; title?: string; verified_at?: string; rubric_version?: string; reviewer_tier?: string; competencies?: string[]; repository_url?: string; deployment_url?: string; data_origin?: string };

export function ShareViewer({ shareId }: { shareId: string }) {
  const [proof, setProof] = useState<Proof | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
      if (token) {
        const exchange = await fetch("/api/proof/share/exchange", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ shareId, token }) });
        history.replaceState(null, "", window.location.pathname);
        if (!exchange.ok) { const body = await exchange.json().catch(() => null); setError(body?.detail ?? "This proof link is unavailable."); return; }
      }
      const response = await fetch(`/api/proof/share/${shareId}`, { cache: "no-store" });
      const body = await response.json().catch(() => null);
      if (!response.ok) { setError(body?.detail ?? "This proof link is unavailable."); return; }
      setProof(body.data);
    }
    load();
  }, [shareId]);
  if (error) return <section className="public-proof-card error-state"><h1>Proof unavailable</h1><p>{error}</p></section>;
  if (!proof) return <section className="public-proof-card"><h1>Opening trusted proof…</h1><p>The secret in this link is being exchanged for a short-lived private viewing session.</p></section>;
  return <article className="public-proof-card"><div className="public-proof-seal">✓</div><span className="eyebrow">LAN PYA VERIFIED PROJECT</span><h1>{proof.title}</h1><p className="proof-owner">Built by {proof.alias || "a Lan Pya learner"}</p>{proof.data_origin === "seeded_demo" ? <div className="origin-label">Seeded demonstration — not human-verified</div> : null}<dl><div><dt>Verified</dt><dd>{proof.verified_at ? new Date(proof.verified_at).toLocaleDateString() : "—"}</dd></div><div><dt>Rubric</dt><dd>{proof.rubric_version}</dd></div><div><dt>Review tier</dt><dd>{proof.reviewer_tier}</dd></div></dl><div className="competency-list">{proof.competencies?.map((item) => <span key={item}>{item}</span>)}</div><div className="public-proof-actions">{proof.repository_url ? <a className="button outline" href={proof.repository_url} rel="noreferrer" target="_blank">View repository ↗</a> : null}{proof.deployment_url ? <a className="button gold" href={proof.deployment_url} rel="noreferrer" target="_blank">View project ↗</a> : null}</div><footer>Evidence snapshot · no tracking scripts · link can be revoked by its owner</footer></article>;
}
