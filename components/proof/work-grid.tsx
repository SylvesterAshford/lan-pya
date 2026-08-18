"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { CaseStudyCard, type CaseStudyItem, type CaseStudyLabels, type CaseStudyState } from "@/components/proof/case-study-card";
import { toMyanmarDigits } from "@/lib/domain/deadlines";

/**
 * Completed work, searchable and filterable.
 *
 * Filtering lives here rather than on the server because it is a view of a
 * list the page already holds — a round trip to hide three cards would be a
 * round trip a learner on mobile data pays for.
 *
 * The count always reports what is on screen. A filter that says "12 items"
 * while showing three is the kind of small dishonesty that makes people stop
 * trusting the bigger numbers.
 */

type Filter = "all" | CaseStudyState;

export function WorkGrid({
  locale,
  items,
  labels,
}: {
  locale: string;
  items: CaseStudyItem[];
  labels: CaseStudyLabels & {
    title: string;
    search: string;
    all: string;
    count: string;
    countOne: string;
    empty: string;
    noMatch: string;
    clear: string;
  };
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== "all" && item.state !== filter) return false;
      if (!needle) return true;
      // Competencies are searchable too: "accessibility" is how a learner
      // looks for the thing they proved, not the title they gave it.
      return [item.title, item.eyebrow, ...item.competencies]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [items, query, filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: labels.all },
    { key: "verified", label: labels.verified },
    { key: "in_review", label: labels.inReview },
    { key: "draft", label: labels.draft },
  ];

  // A filter for a state nobody has is a dead control.
  const available = filters.filter((entry) => entry.key === "all" || items.some((item) => item.state === entry.key));
  const isFiltered = Boolean(query.trim()) || filter !== "all";

  if (!items.length) {
    return (
      <section className="work-block">
        <h2 className="work-title">{labels.title}</h2>
        <p className="work-empty">{labels.empty}</p>
      </section>
    );
  }

  return (
    <section className="work-block">
      <header className="work-head">
        <h2 className="work-title">{labels.title}</h2>
        <span className="work-count">
          {(filtered.length === 1 ? labels.countOne : labels.count).replace("{n}", num(filtered.length))}
        </span>
      </header>

      <div className="work-tools">
        <span className="work-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            aria-label={labels.search}
          />
        </span>
        {available.length > 1 ? (
          <div className="work-filters" role="group" aria-label={labels.all}>
            <span className="work-filters-icon" aria-hidden="true"><SlidersHorizontal size={14} /></span>
            {available.map((entry) => (
              <button
                key={entry.key}
                type="button"
                className={filter === entry.key ? "on" : ""}
                aria-pressed={filter === entry.key}
                onClick={() => setFilter(entry.key)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {filtered.length ? (
        <div className="work-grid">
          {filtered.map((item) => (
            <CaseStudyCard key={item.id} item={item} labels={labels} />
          ))}
        </div>
      ) : (
        <p className="work-empty">
          {labels.noMatch}
          {isFiltered ? (
            <button type="button" className="text-link inline" onClick={() => { setQuery(""); setFilter("all"); }}>
              {labels.clear}
            </button>
          ) : null}
        </p>
      )}
    </section>
  );
}
