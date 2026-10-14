import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { getAppCopy } from "@/lib/i18n/app-copy";

const SHOWN = 3;

/**
 * Verified work in one line: how many records, the first few skills they
 * prove, and the way to Portfolio. Only active records count; Completed work
 * that is still awaiting review is not proof yet.
 */
export function ProofRow({ verifiedCount, skills, locale, labels }: { verifiedCount: number; skills: string[]; locale: string; labels: ReturnType<typeof getAppCopy>["home"]["proofRow"] }) {
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));
  const more = skills.length - SHOWN;
  return (
    <section className="home-block" aria-labelledby="proof-row-title">
      <h2 id="proof-row-title">{labels.title}</h2>
      <ul className="home-list"><li>
      <Link href="/app/proof" className="home-row">
        <span className="home-row-copy">
          <strong>{verifiedCount ? labels.count.replace("{n}", num(verifiedCount)) : labels.empty}</strong>
          {skills.length ? (
            <small>
              {skills.slice(0, SHOWN).join(" · ")}
              {more > 0 ? ` · ${labels.more.replace("{n}", num(more))}` : ""}
            </small>
          ) : <small>{labels.emptyBody}</small>}
        </span>
        <span className="home-row-action">{labels.portfolio}<ArrowRight size={15} aria-hidden="true" /></span>
      </Link>
      </li></ul>
    </section>
  );
}
