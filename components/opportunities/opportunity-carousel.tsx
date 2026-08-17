"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CategoryArt } from "@/components/opportunities/category-art";
import { DeadlineChip } from "@/components/app/deadline-chip";
import { StatusPill } from "@/components/app/status-pill";
import { formatAppDate, localizeReadiness } from "@/lib/i18n/app-copy";
import type { OpportunityCard } from "@/lib/domain/types";

/**
 * Opportunity focus carousel.
 *
 * The reference (ciko-energy) is a WebGL product showcase: items on a 3D arc,
 * the centre one upright and lit, neighbours tilted away, name and scrub rail
 * below. This reproduces the arc and the focus behaviour with CSS transforms
 * only — no 3D library. Design Spec §8 is explicit that the app's speed is the
 * brand, and learners here are on budget Android phones over mobile data; a
 * WebGL bundle would buy the same picture at a cost they pay.
 *
 * Detail sits ABOVE the arc, so the thing you are deciding about is read first
 * and the carousel is the control, not the content.
 */

type Display = { source: OpportunityCard; display: OpportunityCard };

export type CarouselLabels = {
  prev: string; next: string; of: string; apply: string;
  supported: string; gaps: string; unknown: string; none: string;
  scrollHint: string; checked: string;
};

function tone(readiness: string) {
  return readiness === "Ready now" ? "success" as const : readiness === "Build toward" ? "warning" as const : "neutral" as const;
}

export function OpportunityCarousel({
  items,
  locale,
  labels,
}: {
  items: Display[];
  locale: string;
  labels: CarouselLabels;
}) {
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; index: number } | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const wheelLock = useRef(0);

  const clamp = useCallback((value: number) => Math.max(0, Math.min(items.length - 1, value)), [items.length]);
  const go = useCallback((next: number) => setIndex((current) => {
    const target = clamp(next);
    return target === current ? current : target;
  }), [clamp]);

  // Horizontal wheel / trackpad, throttled so one gesture moves one card.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;
      if (!delta) return;
      event.preventDefault();
      const now = Date.now();
      if (now - wheelLock.current < 260) return;
      wheelLock.current = now;
      go(index + (delta > 0 ? 1 : -1));
    };
    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, [go, index]);

  function onPointerDown(event: React.PointerEvent) {
    dragStart.current = { x: event.clientX, index };
    setDragging(true);
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!dragStart.current) return;
    const travelled = event.clientX - dragStart.current.x;
    const steps = Math.round(travelled / -140);
    go(dragStart.current.index + steps);
  }

  function onPointerUp() {
    dragStart.current = null;
    setDragging(false);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") { event.preventDefault(); go(index + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); go(index - 1); }
    if (event.key === "Home") { event.preventDefault(); go(0); }
    if (event.key === "End") { event.preventDefault(); go(items.length - 1); }
  }

  if (!items.length) return null;
  const active = items[index];
  const item = active.display;
  const position = labels.of.replace("{a}", String(index + 1)).replace("{b}", String(items.length));

  const evidence: [string, string[]][] = [
    [labels.supported, item.supported],
    [labels.gaps, item.gaps],
    [labels.unknown, item.unknown],
  ];

  return (
    <div className="opp-stage">
      {/* Detail first: the decision is read before the control. */}
      <section className="opp-detail" aria-live="polite">
        <div className="opp-detail-meta">
          <span className="opp-kind">{item.type}</span>
          <span className="opp-loc"><MapPin size={12} aria-hidden="true" />{item.location}</span>
          <StatusPill tone={tone(active.source.readiness)}>{localizeReadiness(locale, active.source.readiness)}</StatusPill>
        </div>
        <h2>{item.title}</h2>
        <p className="opp-org">{item.organization}</p>
        <DeadlineChip locale={locale} deadline={item.deadline} />

        <div className="opp-evidence">
          {evidence.map(([heading, values]) => (
            <div key={heading}>
              <strong>{heading}</strong>
              {values.length ? <ul>{values.map((value) => <li key={value}>{value}</li>)}</ul> : <small>{labels.none}</small>}
            </div>
          ))}
        </div>

        <footer className="opp-detail-foot">
          <small>{item.dataOrigin === "seeded_demo" ? (locale === "my" ? "နမူနာအခွင့်အလမ်း" : "Demo opportunity") : (locale === "my" ? "လက်တွေ့အခွင့်အလမ်း" : "Live opportunity")} · {labels.checked} {formatAppDate(locale, item.lastVerifiedAt)}</small>
          <a className="button primary compact" href={item.sourceUrl} target="_blank" rel="noreferrer">
            {labels.apply}<ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </footer>
      </section>

      {/* The arc. */}
      {/* Drag is a pointer affordance on the container; keyboard parity lives on
          the focused card button below, which is the real interactive element.
          eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className={`opp-rail${dragging ? " dragging" : ""}`}
        ref={railRef}
        role="group"
        aria-roledescription="carousel"
        aria-label={position}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="opp-arc">
          {items.map((entry, i) => {
            const offset = i - index;
            const distance = Math.abs(offset);
            const isActive = offset === 0;
            return (
              <button
                key={entry.display.id}
                type="button"
                className={`opp-card${isActive ? " active" : ""}`}
                aria-current={isActive ? "true" : undefined}
                aria-label={`${entry.display.title} — ${entry.display.organization}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => go(i)}
                onKeyDown={onKeyDown}
                style={{
                  // The arc: rotate away, push back, and shrink with distance.
                  transform: `translateX(${offset * 78}%) translateZ(${distance * -130}px) rotateY(${offset * -30}deg) scale(${1 - distance * 0.05})`,
                  opacity: distance > 3 ? 0 : 1 - distance * 0.22,
                  zIndex: items.length - distance,
                  pointerEvents: distance > 3 ? "none" : "auto",
                }}
              >
                <CategoryArt type={entry.source.type} className="opp-card-art" />
                <span className="opp-card-body">
                  <span className="opp-card-kind">{entry.display.type}</span>
                  <strong>{entry.display.title}</strong>
                  <small>{entry.display.organization}</small>
                  <span className="opp-card-foot">
                    <DeadlineChip locale={locale} deadline={entry.display.deadline} showIcon={false} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="opp-controls">
        <button type="button" className="opp-arrow" onClick={() => go(index - 1)} disabled={index === 0} aria-label={labels.prev}>
          <ChevronLeft size={17} aria-hidden="true" />
        </button>

        <div className="opp-scrub" role="presentation">
          {items.map((entry, i) => (
            <span key={entry.display.id} className={i === index ? "on" : ""} />
          ))}
        </div>

        <button type="button" className="opp-arrow" onClick={() => go(index + 1)} disabled={index === items.length - 1} aria-label={labels.next}>
          <ChevronRight size={17} aria-hidden="true" />
        </button>
      </div>

      <p className="opp-hint">{position} · {labels.scrollHint}</p>
    </div>
  );
}
