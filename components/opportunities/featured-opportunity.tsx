import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { CategoryArt } from "@/components/opportunities/category-art";
import { DeadlineChip } from "@/components/app/deadline-chip";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { findPartner } from "@/lib/domain/partners";
import { formatAppDate, localizeReadiness } from "@/lib/i18n/app-copy";
import type { OpportunityCard } from "@/lib/domain/types";

/**
 * Featured opportunity, after the concept's two lead rows.
 *
 * Full width, stacked: mark and identity on the left, evidence in the middle,
 * the decision on the right. Two of these read as a shortlist; the same content
 * in a two-up grid read as a pair of tiles competing with the board below it.
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
  lead = false,
}: {
  entry: { source: OpportunityCard; display: OpportunityCard };
  locale: string;
  labels: FeaturedLabels;
  /** The first row takes the filled action. That is reading order, not a claim
   *  about readiness — the readiness pill is what states that. */
  lead?: boolean;
}) {
  const my = locale === "my";
  const item = entry.display;
  const src = entry.source;
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));
  // The organisation's own mark when it is a partner we can name, and the
  // category illustration otherwise — never a generic tile standing in for a
  // logo the listing has not earned.
  const partner = findPartner(src.organization);
  const ready = src.readiness === "Ready now";

  return (
    <article className={`featured-opp${partner ? " is-partner" : ""}${ready ? " is-ready" : ""}`}>
      <div className="featured-opp-mark">
        {partner ? (
          <span className={`featured-opp-logo ${partner.ground}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local art
                with known intrinsic size; the loader adds nothing. */}
            <img src={partner.src} alt={partner.name} width={partner.width} height={partner.height} decoding="async" />
          </span>
        ) : (
          <CategoryArt type={src.type} className="featured-opp-art" />
        )}
      </div>

      <div className="featured-opp-body">
        {/* "Partner challenge" is only earned when the organisation is actually
            a partner. A challenge from anyone else is a featured opportunity,
            which is true, rather than borrowed standing. */}
        {/* The badge sits on the eyebrow line rather than under the mark. In
            the mark column it had to wrap to two lines and read as a second
            logo tile competing with the real one. */}
        <p className="featured-opp-top">
          <span className="featured-opp-kind">
            {partner && src.type.toLowerCase().includes("challenge") ? labels.challenge : labels.featured}
          </span>
          {partner ? (
            <span className="featured-opp-partner">
              <ShieldCheck size={11} aria-hidden="true" />
              {labels.partner}
            </span>
          ) : null}
        </p>

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
          <dt>{labels.proofSupports}</dt>
          <dd>{item.supported.length ? item.supported.join(" · ") : labels.none}</dd>
          <dt>{labels.stillMissing}</dt>
          <dd>{item.gaps.length ? item.gaps.join(" · ") : labels.none}</dd>
        </dl>
      </div>

      <div className="featured-opp-side">
        <DeadlineChip locale={locale} deadline={item.deadline} />
        <a
          className={`button ${lead ? "primary" : "secondary"} compact`}
          href={item.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {labels.view}<ArrowRight size={15} aria-hidden="true" />
        </a>
        <small>{labels.checked} {formatAppDate(locale, item.lastVerifiedAt)}</small>
      </div>
    </article>
  );
}
