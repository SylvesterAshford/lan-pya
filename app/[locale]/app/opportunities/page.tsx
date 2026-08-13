import { ArrowUpRight, BriefcaseBusiness, CalendarClock, ChevronDown, MapPin } from "lucide-react";
import { getOpportunities } from "@/lib/data/app-data";
import { StatusPill } from "@/components/app/status-pill";
import { formatAppDate, getAppCopy, localizeOpportunity, localizeReadiness } from "@/lib/i18n/app-copy";

function tone(readiness: string) {
  return readiness === "Ready now" ? "success" as const : readiness === "Build toward" ? "warning" as const : "neutral" as const;
}

export default async function OpportunitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = getAppCopy(locale);
  const opportunities = (await getOpportunities()).map((item) => ({ source: item, display: localizeOpportunity(locale, item) }));

  return (
    <div className="app-page opportunities-page">
      <section className="page-heading compact-heading">
        <h1>{c.opportunities.title}</h1>
        <p>{locale === "my" ? "သတ်မှတ်ရက်အနီးဆုံးမှ စီထားပြီး ကိုက်ညီမှု၏ အကြောင်းရင်းကို အသေးစိတ်ကြည့်နိုင်သည်။" : "Sorted by deadline. Open a listing to see what your evidence supports and what is still missing."}</p>
      </section>

      {opportunities.length ? <div className="opportunity-feed">{opportunities.map(({ source, display: item }) => (
        <details className="opportunity-row" key={item.id}>
          <summary>
            <span className="opportunity-kind"><BriefcaseBusiness size={18} aria-hidden="true" /></span>
            <span className="opportunity-summary-copy">
              <span className="opportunity-meta"><span>{item.type}</span><span><MapPin size={12} aria-hidden="true" />{item.location}</span></span>
              <strong>{item.title}</strong>
              <small>{item.organization}</small>
            </span>
            <span className="opportunity-deadline"><CalendarClock size={14} aria-hidden="true" /><span>{formatAppDate(locale, item.deadline)}</span></span>
            <StatusPill tone={tone(source.readiness)}>{localizeReadiness(locale, source.readiness)}</StatusPill>
            <ChevronDown className="opportunity-chevron" size={18} aria-hidden="true" />
          </summary>
          <div className="opportunity-detail">
            <div className="readiness-grid">
              <div><strong>{c.opportunities.supported}</strong>{item.supported.length ? <ul>{item.supported.map((value) => <li key={value}>{value}</li>)}</ul> : <p>{c.opportunities.noneVerified}</p>}</div>
              <div><strong>{c.opportunities.gaps}</strong>{item.gaps.length ? <ul>{item.gaps.map((value) => <li key={value}>{value}</li>)}</ul> : <p>{c.opportunities.noGaps}</p>}</div>
              <div><strong>{c.opportunities.unknown}</strong>{item.unknown.length ? <ul>{item.unknown.map((value) => <li key={value}>{value}</li>)}</ul> : <p>{c.opportunities.noUnknowns}</p>}</div>
            </div>
            <footer>
              <span>{item.dataOrigin === "seeded_demo" ? (locale === "my" ? "နမူနာအခွင့်အလမ်း" : "Demo opportunity") : (locale === "my" ? "လက်တွေ့အခွင့်အလမ်း" : "Live opportunity")} · {c.opportunities.checked} {formatAppDate(locale, item.lastVerifiedAt)}</span>
              <a className="button outline compact" href={item.sourceUrl} target="_blank" rel="noreferrer">{c.opportunities.open}<ArrowUpRight size={15} aria-hidden="true" /></a>
            </footer>
          </div>
        </details>
      ))}</div> : <section className="panel empty-state"><h2>{c.opportunities.emptyTitle}</h2><p>{c.opportunities.emptyBody}</p></section>}
    </div>
  );
}
