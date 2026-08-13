import { getProofItems } from "@/lib/data/app-data";
import { ShareProofButton } from "@/components/proof/share-proof-button";
import { StatusPill } from "@/components/app/status-pill";

export default async function ProofPage() {
  const live = await getProofItems();
  const proofs = live.length ? live : [];
  return <div className="app-page"><section className="page-heading"><span className="eyebrow">YOUR PORTABLE EVIDENCE</span><h1>Portfolio</h1><p>Your work, with trust labels. Verified work is private by default; share only the evidence snapshot you choose.</p></section>{proofs.length ? <><section className="portfolio-summary"><span><strong>{proofs.length}</strong> evidence item{proofs.length === 1 ? "" : "s"}</span><small>Shareable after human review</small></section><div className="proof-grid">{proofs.map((proof) => <article className="panel proof-card" key={proof.id}><div className="proof-card-top"><span className="proof-seal">✓</span><div><h2>{proof.title}</h2><p>Verified {new Date(proof.verifiedAt).toLocaleDateString()}</p></div><StatusPill tone={proof.state === "active" ? "success" : "danger"}>{proof.state}</StatusPill></div><dl><div><dt>Rubric</dt><dd>{proof.rubricVersion}</dd></div><div><dt>Review</dt><dd>{proof.reviewerTier}</dd></div></dl><div className="competency-list">{proof.competencies.map((item) => <span key={item}>{item}</span>)}</div><ShareProofButton proofId={proof.id} /></article>)}</div></> : <section className="panel empty-state"><span className="proof-seal muted">○</span><h2>Your portfolio starts with one finished mission.</h2><p>Submit real work, respond to review, and choose what to share after verification.</p></section>}</div>;
}
