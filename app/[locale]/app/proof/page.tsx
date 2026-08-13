import { getProofItems } from "@/lib/data/app-data";
import { ShareProofButton } from "@/components/proof/share-proof-button";
import { StatusPill } from "@/components/app/status-pill";
import { MeNav } from "@/components/app/me-nav";
import { formatAppDate, getAppCopy } from "@/lib/i18n/app-copy";

export default async function ProofPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = getAppCopy(locale);
  const live = await getProofItems();
  const proofs = live.length ? live : [];
  return <div className="app-page me-page"><MeNav locale={locale} active="portfolio" /><section className="page-heading"><h1>{c.proof.title}</h1><p>{c.proof.body}</p></section>{proofs.length ? <><section className="portfolio-summary"><span><strong>{proofs.length}</strong> {c.proof.evidenceItems}</span><small>{c.proof.shareable}</small></section><div className="proof-grid">{proofs.map((proof) => <article className="panel proof-card" key={proof.id}><div className="proof-card-top"><span className="proof-seal">✓</span><div><h2>{proof.title}</h2><p>{c.proof.verified} {formatAppDate(locale, proof.verifiedAt)}</p></div><StatusPill tone={proof.state === "active" ? "success" : "danger"}>{proof.state}</StatusPill></div><dl><div><dt>{c.proof.rubric}</dt><dd>{proof.rubricVersion}</dd></div><div><dt>{c.proof.review}</dt><dd>{proof.reviewerTier}</dd></div></dl><div className="competency-list">{proof.competencies.map((item) => <span key={item}>{item}</span>)}</div><ShareProofButton locale={locale} proofId={proof.id} /></article>)}</div></> : <section className="panel empty-state"><span className="proof-seal muted">○</span><h2>{c.proof.emptyTitle}</h2><p>{c.proof.emptyBody}</p></section>}</div>;
}
