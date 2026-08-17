import { ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import { CategoryArt } from "@/components/opportunities/category-art";
import { DeadlineChip } from "@/components/app/deadline-chip";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { formatAppDate, localizeReadiness } from "@/lib/i18n/app-copy";
import type { OpportunityCard } from "@/lib/domain/types";

/**
 * Featured opportunity, after the concept's two lead cards.
 *
 * Driven by a real listing rather than the concept's hard-coded pair. The
 * mockup names a Strategy First internship and a U.S. Embassy challenge that
 * do not exist in the database; rendering them as written would put two
 * opportunities on the page that a learner could not apply to.
 *
 * Every number here is counted from the listing's own evidence arrays. The
 * concept's "3 skills supported / 1 gap to close" is `supported.length` and
 * `gaps.length`, so the card cannot overstate a match: if the evidence is
 * empty the pills say so rather than rounding up to something encouraging.
 *
 * The partner badge appears only when the listing's organisation is one of the
 * named partners in the band above. Everything else is labelled by its type,
 * because "Verified partner" on an unaffiliated listing would be the exact
 * unearned claim the band exists to avoid.
 */

/** Organisations named in the partner band. Kept here so the badge and the
 *  band cannot drift apart: a listing is a partner listing or it is not. */
const PARTNER_ORGS = ["u.s. embassy rangoon", "strategy first international college"];

function isPartner(organization: string) {
  return PARTNER_ORGS.includes(organization.trim().toLowerCase());
}

export type FeaturedLabels = {
  partner: string;
  featured: string;
  challenge: string;
  supported: string;
  gapsToClose: string;
  proofSupports: string;
  stillMissing: string;
  none: string;
  view: string;
  checked: string;
};

export function FeaturedOpportunity({
  entry,
  locale,
  labels,
}: {
  entry: { source: OpportunityCard; display: OpportunityCard };
  locale: string;
  labels: FeaturedLabels;
}) {
  const my = locale === "my";
  const item = entry.display;
  const src = entry.source;
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));
  const partner = isPartner(src.organization);

  return (
    <article className={`featured-opp${partner ? " is-partner" : ""}`}>
      <div className="featured-opp-art" aria-hidden="true">
        <CategoryArt type={src.type} className="featured-opp-art-svg" />
      </div>

      <div className="featured-opp-body">
        <div className="featured-opp-top">
          {/* "Partner challenge" is only earned when the organisation is
              actually a partner. A challenge from anyone else is a featured
              opportunity, which is true, rather than borrowed standing. */}
          <span className="featured-opp-kind">
            {partner && src.type.toLowerCase().includes("challenge") ? labels.challenge : labels.featured}
          </span>
          {partner ? (
            <span className="featured-opp-partner">
              <ShieldCheck size={12} aria-hidden="true" />
              {labels.partner}
            </span>
          ) : null}
        </div>

        <h3>{item.title}</h3>
        <p className="featured-opp-org">
          {item.organization}
          <span className="featured-opp-loc"><MapPin size={12} aria-hidden="true" />{item.location}</span>
        </p>

        <div className="featured-opp-pills">
          <span className="fo-pill supported">
            {labels.supported.replace("{n}", num(item.supported.length))}
          </span>
          {item.gaps.length ? (
            <span className="fo-pill gaps">
              {labels.gapsToClose.replace("{n}", num(item.gaps.length))}
            </span>
          ) : null}
          <span className="fo-pill readiness">{localizeReadiness(locale, src.readiness)}</span>
        </div>

        {/* Both halves are shown, never just the flattering one. A card that
            lists what your proof supports and stays silent about what is
            missing is a match score wearing a disguise. */}
        <dl className="featured-opp-evidence">
          <div>
            <dt>{labels.proofSupports}</dt>
            <dd>{item.supported.length ? item.supported.join(" · ") : labels.none}</dd>
          </div>
          <div>
            <dt>{labels.stillMissing}</dt>
            <dd>{item.gaps.length ? item.gaps.join(" · ") : labels.none}</dd>
          </div>
        </dl>

        <footer className="featured-opp-foot">
          <DeadlineChip locale={locale} deadline={item.deadline} />
          <a className="button primary compact" href={item.sourceUrl} target="_blank" rel="noreferrer">
            {labels.view}<ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <small>{labels.checked} {formatAppDate(locale, item.lastVerifiedAt)}</small>
        </footer>
      </div>
    </article>
  );
}
