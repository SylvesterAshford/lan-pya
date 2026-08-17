import { OpportunityCarousel } from "@/components/opportunities/opportunity-carousel";
import { getOpportunities } from "@/lib/data/app-data";
import { getAppCopy, localizeOpportunity } from "@/lib/i18n/app-copy";

export default async function OpportunitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = getAppCopy(locale);
  const opportunities = (await getOpportunities()).map((item) => ({ source: item, display: localizeOpportunity(locale, item) }));

  return (
    <div className="app-page opportunities-page">
      <section className="page-heading compact-heading">
        <h1>{c.opportunities.title}</h1>
        <p>{locale === "my" ? "သတ်မှတ်ရက်အနီးဆုံးမှ စီထားသည်။ တစ်ခုချင်း ရွှေ့ကြည့်ပြီး သင့်သက်သေက ဘာကို ထောက်ခံပြီး ဘာလိုသေးသည်ကို ကြည့်ပါ။" : "Sorted by deadline. Move through them to see what your evidence supports and what is still missing."}</p>
      </section>

      {opportunities.length ? (
        <OpportunityCarousel
          items={opportunities}
          locale={locale}
          labels={{
            prev: c.carousel.prev,
            next: c.carousel.next,
            of: c.carousel.of,
            apply: c.carousel.apply,
            supported: c.carousel.supported,
            gaps: c.carousel.gaps,
            unknown: c.carousel.unknown,
            none: c.carousel.none,
            scrollHint: c.carousel.scrollHint,
            checked: c.opportunities.checked,
          }}
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
