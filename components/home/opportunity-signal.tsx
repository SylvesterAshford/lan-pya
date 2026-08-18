import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CategoryArt } from "@/components/opportunities/category-art";
import { DeadlineChip } from "@/components/app/deadline-chip";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { findPartner } from "@/lib/domain/partners";

/**
 * Opportunity signal — one listing on Home, not a feed.
 *
 * Home's job is the next useful step, so this shows the single listing the
 * caller has already chosen and links out to the board for the rest. When
 * there is nothing to show it says so; a Home panel that pads itself with a
 * placeholder listing teaches a learner to stop reading it.
 *
 * The organisation's own mark appears only when that organisation is one of
 * the named partners in `lib/domain/partners.ts`. Everything else gets the
 * category mark, because a logo on an unaffiliated listing tells the reader an
 * organisation is involved that is not — the same rule the featured row keeps.
 *
 * The skills row is `item.supported` and nothing else. No match score, no
 * percentage, no skill the listing does not itself list: this panel reports
 * the listing's own evidence array or states that it is empty.
 */
export function OpportunitySignal({
  locale,
  item,
  labels,
}: {
  locale: string;
  item: {
    id: string;
    title: string;
    organization: string;
    location: string;
    type: string;
    deadline: string;
    supported: string[];
  } | null;
  labels: { title: string; viewAll: string; supportedSkills: string; none: string; empty: string };
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));
  const partner = item ? findPartner(item.organization) : undefined;

  return (
    <section className="oppsig">
      <header className="oppsig-head">
        <h2>{labels.title}</h2>
        <Link className="oppsig-link" href="/app/opportunities">
          {labels.viewAll}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </header>

      {item === null ? (
        <p className="oppsig-empty">{labels.empty}</p>
      ) : (
        <article className="oppsig-item">
          <div className="oppsig-mark">
            {partner ? (
              <span className={`oppsig-logo ${partner.ground}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.src}
                  alt={partner.name}
                  width={partner.width}
                  height={partner.height}
                  decoding="async"
                />
              </span>
            ) : (
              <CategoryArt type={item.type} className="oppsig-art" />
            )}
          </div>

          <div className="oppsig-body">
            <h3 className="oppsig-title">{item.title}</h3>
            <p className="oppsig-org">
              {item.organization}
              <span className="oppsig-loc">
                <MapPin size={12} aria-hidden="true" />
                {item.location}
              </span>
            </p>

            <p className="oppsig-skills-head">
              {labels.supportedSkills}
              {item.supported.length ? (
                <span className="oppsig-count">{num(item.supported.length)}</span>
              ) : null}
            </p>
            {item.supported.length ? (
              <ul className="oppsig-chips">
                {item.supported.map((skill) => (
                  <li key={skill} className="oppsig-chip">
                    {skill}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="oppsig-none">{labels.none}</p>
            )}

            <div className="oppsig-when">
              <DeadlineChip locale={locale} deadline={item.deadline} />
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
