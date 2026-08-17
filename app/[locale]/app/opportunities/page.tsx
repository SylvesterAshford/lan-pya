import { OpportunityBoard } from "@/components/opportunities/opportunity-board";
import { getOpportunities } from "@/lib/data/app-data";
import { getAppCopy, localizeOpportunity } from "@/lib/i18n/app-copy";

/**
 * Opportunities.
 *
 * The 3D focus carousel that shipped here earlier read well at three listings
 * and showed one at a time; this page is built for thirty. Replaced with a
 * board after Contra's discover and jobs pages: search, a For you / All
 * toggle, category chips, and computed shelves.
 */
export default async function OpportunitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = getAppCopy(locale);
  const opportunities = (await getOpportunities()).map((item) => ({ source: item, display: localizeOpportunity(locale, item) }));

  return (
    <div className="app-page opportunities-page">
      <section className="page-heading compact-heading">
        <h1>{c.opportunities.title}</h1>
        <p>
          {locale === "my"
            ? "သတ်မှတ်ရက် အနီးဆုံးမှ စတင်ပြသသည်။ တစ်ခုချင်း ဖွင့်ကြည့်ပြီး သင့်သက်သေက ဘာကို ထောက်ခံပြီး ဘာလိုသေးသည်ကို ကြည့်ပါ။"
            : "Closing soonest first. Open any one to see what your evidence supports and what is still missing."}
        </p>
      </section>

      {opportunities.length ? (
        <OpportunityBoard
          items={opportunities}
          locale={locale}
          labels={{ ...c.board, checked: c.opportunities.checked }}
        />
      ) : (
        <section className="panel empty-state">
          <h2>{c.opportunities.emptyTitle}</h2>
          <p>{c.opportunities.emptyBody}</p>
        </section>
      )}
    </div>
  );
}
