import { formatAppDate } from "@/lib/i18n/app-copy";
import type { ChangeKind, Release } from "@/lib/domain/changelog";

/**
 * "New this week" — the other half of the return mechanic the deadline
 * countdown starts, and the thing that makes "Updated every Friday" in the top
 * navigation a statement rather than a slogan.
 *
 * Entries come straight from CHANGELOG.md, so this cannot claim work that did
 * not ship. Deliberately unstyled beyond a kind tag and a date: it is a record,
 * not an announcement, and Design Spec §2 asks for dated rows, one line each.
 */

/**
 * Changelog entries are written as full paragraphs, which is right for the file
 * and wrong for this rail: rendered whole they turn Home into a wall of text and
 * unbalance the grid. Design Spec §2 asks for dated rows, one line each, so the
 * rail shows the opening sentence and nothing more.
 *
 * Abbreviations are the trap — "v0.9.1.0" and "e.g." both contain a period that
 * is not a sentence end. Only a period followed by whitespace and a capital
 * counts, and a result that would be uselessly short falls back to the full text.
 *
 * The capital may be preceded by an opening quote or bracket. Missing that case
 * shipped a full paragraph to production, because the entry announcing this very
 * rail read: `Home now shows what changed. "New this week" lists ...`
 */
function firstSentence(text: string): string {
  const match = /^(.+?[.!?])\s+["“‘'([]?[A-Z]/.exec(text);
  const candidate = match?.[1];
  if (candidate && candidate.length >= 24) return candidate;
  return text;
}

const KIND_LABEL: Record<ChangeKind, { en: string; my: string; tone: string }> = {
  added: { en: "New", my: "အသစ်", tone: "op" },
  changed: { en: "Changed", my: "ပြောင်းလဲ", tone: "pilot" },
  fixed: { en: "Fixed", my: "ပြင်ဆင်", tone: "prev" },
  known: { en: "Known issue", my: "သိရှိထားသော ပြဿနာ", tone: "warn" },
  other: { en: "Update", my: "အပ်ဒိတ်", tone: "prev" },
};

export function ChangelogRail({
  releases,
  locale,
  limit = 4,
}: {
  releases: Release[];
  locale: string;
  limit?: number;
}) {
  const my = locale === "my";
  const latest = releases[0];
  if (!latest) return null;

  // Known issues are shown, but never at the top: a learner opening Home wants
  // what is new first. Hiding them entirely would be the dishonest option.
  const ordered = [...latest.entries].sort((a, b) => Number(a.kind === "known") - Number(b.kind === "known"));
  const shown = ordered.slice(0, limit);
  const remaining = latest.entries.length - shown.length;

  return (
    <section className="home-section changelog-rail" aria-labelledby="changelog-heading">
      <header>
        <div>
          <h2 id="changelog-heading">{my ? "ဤအပတ် အသစ်များ" : "New this week"}</h2>
        </div>
        <span className="changelog-version">
          {latest.date ? formatAppDate(locale, latest.date) : `v${latest.version}`}
        </span>
      </header>

      <ul className="changelog-list">
        {shown.map((entry) => {
          const label = KIND_LABEL[entry.kind];
          return (
            <li key={entry.text}>
              <span className={`avail ${label.tone}`}>{my ? label.my : label.en}</span>
              <p>{firstSentence(entry.text)}</p>
            </li>
          );
        })}
      </ul>

      {remaining > 0 ? (
        <small className="changelog-more">
          {my ? `နောက်ထပ် ${remaining} ခု` : `and ${remaining} more`}
        </small>
      ) : null}
    </section>
  );
}
