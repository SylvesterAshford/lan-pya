"use client";

import { ArrowUpRight, Building2, ChevronDown, MapPin, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryArt } from "@/components/opportunities/category-art";
import { FeaturedOpportunity, type FeaturedLabels } from "@/components/opportunities/featured-opportunity";
import { DeadlineChip } from "@/components/app/deadline-chip";
import { StatusPill } from "@/components/app/status-pill";
import { getDeadlineStatus, toMyanmarDigits } from "@/lib/domain/deadlines";
import { formatAppDate, localizeReadiness } from "@/lib/i18n/app-copy";
import type { OpportunityCard } from "@/lib/domain/types";

/**
 * Opportunities board, after Contra's discover and jobs pages.
 *
 * Replaces the 3D focus carousel shipped earlier the same day. The carousel
 * showed one listing at a time and read beautifully at three; it breaks at
 * thirty, which is the number this page is actually built for. Contra's answer
 * is a search field, a segmented toggle, a row of category chips, and sectioned
 * shelves — every listing scannable, the whole set filterable.
 *
 * What is NOT taken from Contra: their layout is a wall of portfolio
 * thumbnails, and its visual weight is entirely borrowed from user-uploaded
 * imagery. Lan Pya has none, and Design Spec §8 rules out stock photography.
 * So the structure transfers and the generated category art keeps doing the
 * visual work at a size that suits a list.
 *
 * Rows expand in place rather than linking away, because the evidence readout
 * (what your proof supports, what is missing, what cannot be told) is the
 * reason to look at a listing at all and must not cost a navigation.
 */

type Display = { source: OpportunityCard; display: OpportunityCard };

export type BoardLabels = {
  searchPlaceholder: string;
  forYou: string;
  all: string;
  filters: string;
  everything: string;
  closingSoon: string;
  closingSoonBody: string;
  readyNow: string;
  readyNowBody: string;
  buildToward: string;
  buildTowardBody: string;
  explore: string;
  exploreBody: string;
  viewMore: string;
  showLess: string;
  apply: string;
  supported: string;
  gaps: string;
  unknown: string;
  none: string;
  checked: string;
  noMatches: string;
  noMatchesBody: string;
  clear: string;
  count: string;
  countOne: string;
  featured: FeaturedLabels;
  noteTitle: string;
  noteBody: string;
};

function tone(readiness: string) {
  return readiness === "Ready now" ? "success" as const : readiness === "Build toward" ? "warning" as const : "neutral" as const;
}

/** Shelves are computed, never authored, so a listing cannot be filed wrongly. */
type Shelf = { key: string; title: string; body: string; items: Display[] };

export function OpportunityBoard({
  items,
  locale,
  labels,
}: {
  items: Display[];
  locale: string;
  labels: BoardLabels;
}) {
  const my = locale === "my";
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"for-you" | "all">("for-you");
  const [category, setCategory] = useState<string>("");
  const [openId, setOpenId] = useState<string>("");
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));

  // Categories come from the data, so a new listing type appears as a chip
  // without anyone remembering to add it.
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const entry of items) {
      if (!seen.has(entry.source.type)) seen.set(entry.source.type, entry.display.type);
    }
    return [...seen.entries()];
  }, [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((entry) => {
      if (category && entry.source.type !== category) return false;
      if (!needle) return true;
      return [entry.display.title, entry.display.organization, entry.display.type, entry.display.location]
        .some((value) => value.toLowerCase().includes(needle));
    });
  }, [items, query, category]);

  const shelves = useMemo<Shelf[]>(() => {
    if (scope === "all") {
      return [{ key: "all", title: labels.everything, body: "", items: filtered }];
    }

    const closing: Display[] = [];
    const ready: Display[] = [];
    const build: Display[] = [];
    const explore: Display[] = [];

    for (const entry of filtered) {
      const status = getDeadlineStatus(entry.source.deadline);
      // Urgency outranks readiness: a listing that closes in three days is the
      // one to look at first regardless of how well your evidence matches it.
      if (status.urgency === "today" || status.urgency === "tomorrow" || status.urgency === "soon") closing.push(entry);
      else if (entry.source.readiness === "Ready now") ready.push(entry);
      else if (entry.source.readiness === "Build toward") build.push(entry);
      else explore.push(entry);
    }

    return [
      { key: "closing", title: labels.closingSoon, body: labels.closingSoonBody, items: closing },
      { key: "ready", title: labels.readyNow, body: labels.readyNowBody, items: ready },
      { key: "build", title: labels.buildToward, body: labels.buildTowardBody, items: build },
      { key: "explore", title: labels.explore, body: labels.exploreBody, items: explore },
    ].filter((shelf) => shelf.items.length > 0);
  }, [filtered, scope, labels]);

  const hasFilters = Boolean(query.trim() || category);

  return (
    <div className="opp-board">
      <div className="opp-controls-bar">
        <div className="opp-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
          />
        </div>

        <div className="opp-segmented" role="group" aria-label={labels.filters}>
          <button type="button" className={scope === "for-you" ? "on" : ""} aria-pressed={scope === "for-you"} onClick={() => setScope("for-you")}>
            {labels.forYou}
          </button>
          <button type="button" className={scope === "all" ? "on" : ""} aria-pressed={scope === "all"} onClick={() => setScope("all")}>
            {labels.all}
          </button>
        </div>
      </div>

      {/* Horizontally scrollable on a phone rather than wrapping to four rows. */}
      <div className="opp-chips" role="group" aria-label={labels.filters}>
        <span className="opp-chips-icon" aria-hidden="true"><SlidersHorizontal size={14} /></span>
        <button type="button" className={category === "" ? "on" : ""} aria-pressed={category === ""} onClick={() => setCategory("")}>
          {labels.everything}
        </button>
        {categories.map(([key, label]) => (
          <button key={key} type="button" className={category === key ? "on" : ""} aria-pressed={category === key} onClick={() => setCategory(key)}>
            {label}
          </button>
        ))}
      </div>

      <p className="opp-count" role="status">
        {/* "1 opportunities" is the kind of small wrongness that makes a
            product feel unfinished. Burmese has no plural inflection, so both
            keys carry the same string there. */}
        {(filtered.length === 1 ? labels.countOne : labels.count).replace("{n}", num(filtered.length))}
        {hasFilters ? (
          <button type="button" className="text-link inline" onClick={() => { setQuery(""); setCategory(""); }}>
            {labels.clear}
          </button>
        ) : null}
      </p>

      {/* The concept's two lead cards. Shown only on the unfiltered "For you"
          view: a featured pick inside a filtered result set is just the first
          row with a bigger border. */}
      {scope === "for-you" && !hasFilters && filtered.length > 1 ? (
        <div className="featured-opp-pair">
          {filtered.slice(0, 2).map((entry) => (
            <FeaturedOpportunity key={`featured-${entry.display.id}`} entry={entry} locale={locale} labels={labels.featured} />
          ))}
        </div>
      ) : null}

      {shelves.length ? shelves.map((shelf) => (
        <section className="opp-shelf" key={shelf.key} aria-labelledby={`shelf-${shelf.key}`}>
          <header>
            <div>
              <h2 id={`shelf-${shelf.key}`}>{shelf.title}</h2>
              {shelf.body ? <p>{shelf.body}</p> : null}
            </div>
            <span className="opp-shelf-count">{num(shelf.items.length)}</span>
          </header>

          <ul className="opp-rows">
            {shelf.items.map((entry) => {
              const item = entry.display;
              const open = openId === item.id;
              return (
                <li key={item.id} className={`opp-row${open ? " open" : ""}`}>
                  <button
                    type="button"
                    className="opp-row-head"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? "" : item.id)}
                  >
                    <CategoryArt type={entry.source.type} className="opp-row-art" />
                    <span className="opp-row-copy">
                      <strong>{item.title}</strong>
                      {/* The organisation is the first thing a learner needs in
                          order to judge a listing, so it leads its own line
                          rather than trailing the type. */}
                      <span className="opp-row-org">
                        <Building2 size={13} aria-hidden="true" />
                        {item.organization}
                      </span>
                      <small>
                        {item.type}
                        <span className="opp-row-loc"><MapPin size={11} aria-hidden="true" />{item.location}</span>
                        {/* Verification and source without expanding: the two
                            facts that decide whether a listing is worth
                            trusting should not cost a click. */}
                        <span className={`opp-row-verified ${entry.source.dataOrigin === "seeded_demo" ? "demo" : "live"}`}>
                          <ShieldCheck size={11} aria-hidden="true" />
                          {labels.checked} {formatAppDate(locale, item.lastVerifiedAt)}
                        </span>
                      </small>
                    </span>
                    <span className="opp-row-meta">
                      <StatusPill tone={tone(entry.source.readiness)}>{localizeReadiness(locale, entry.source.readiness)}</StatusPill>
                      <DeadlineChip locale={locale} deadline={item.deadline} showIcon={false} />
                    </span>
                    <ChevronDown className="opp-row-chevron" size={16} aria-hidden="true" />
                  </button>

                  {open ? (
                    <div className="opp-row-detail">
                      <div className="opp-evidence">
                        {([[labels.supported, item.supported], [labels.gaps, item.gaps], [labels.unknown, item.unknown]] as [string, string[]][])
                          .map(([heading, values]) => (
                            <div key={heading}>
                              <strong>{heading}</strong>
                              {values.length ? <ul>{values.map((value) => <li key={value}>{value}</li>)}</ul> : <small>{labels.none}</small>}
                            </div>
                          ))}
                      </div>
                      <footer>
                        <small>
                          {item.dataOrigin === "seeded_demo"
                            ? (my ? "နမူနာအခွင့်အလမ်း" : "Demo opportunity")
                            : (my ? "လက်တွေ့အခွင့်အလမ်း" : "Live opportunity")}
                          {" · "}{labels.checked} {formatAppDate(locale, item.lastVerifiedAt)}
                        </small>
                        <a className="button primary compact" href={item.sourceUrl} target="_blank" rel="noreferrer">
                          {labels.apply}<ArrowUpRight size={15} aria-hidden="true" />
                        </a>
                      </footer>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      )) : (
        <section className="panel empty-state">
          <h2>{labels.noMatches}</h2>
          <p>{labels.noMatchesBody}</p>
          <button type="button" className="button outline" onClick={() => { setQuery(""); setCategory(""); }}>{labels.clear}</button>
        </section>
      )}
      <aside className="opp-note">
        <ShieldCheck size={16} aria-hidden="true" />
        <div>
          <strong>{labels.noteTitle}</strong>
          <p>{labels.noteBody}</p>
        </div>
      </aside>
    </div>
  );
}
